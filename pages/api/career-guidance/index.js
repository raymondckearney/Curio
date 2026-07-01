import fs from 'fs';
import path from 'path';
import { dbInsert } from '../../../lib/supabase';

export const config = { api: { responseLimit: false } };

const VALID_PROFILES = ['WHY-WHAT','WHY-HOW','WHAT-WHY','WHAT-HOW','HOW-WHY','HOW-WHAT'];

function send(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
  if (typeof res.flush === 'function') res.flush();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile, careerLevel, roleOrientation, industry, riskEnvironment, values, compensationPriority, otherAssessments } = req.body || {};

  if (!profile || !VALID_PROFILES.includes(profile)) return res.status(400).json({ error: 'Missing or invalid profile' });
  if (!careerLevel) return res.status(400).json({ error: 'careerLevel is required' });
  if (!roleOrientation) return res.status(400).json({ error: 'roleOrientation is required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  let systemPromptDoc, sourceOfTruth;
  try {
    systemPromptDoc = fs.readFileSync(path.join(process.cwd(), 'career_guidance_system_prompt.md'), 'utf8');
    sourceOfTruth   = fs.readFileSync(path.join(process.cwd(), 'lib', 'mindprint-source-of-truth.md'), 'utf8');
  } catch (e) {
    return res.status(500).json({ error: 'Could not load system prompt files: ' + e.message });
  }

  const userMessage = `Generate a career guidance report for the following inputs:

PROFILE: ${profile}
CAREER LEVEL: ${careerLevel}
ROLE ORIENTATION: ${roleOrientation}
INDUSTRY: ${industry || 'Not specified'}
ENVIRONMENT: ${riskEnvironment || 'Not specified'}
COMPENSATION PRIORITY: ${compensationPriority || 'Balanced'}
VALUES: ${values || 'Not specified'}
OTHER ASSESSMENTS: ${otherAssessments || 'None'}

Return valid JSON only. No markdown, no preamble, no explanation.

{
  "energizers": ["...", "...", "..."],
  "watchFors": ["...", "..."],
  "roles": [
    {
      "title": "...",
      "fit": "paragraph1\\n\\nparagraph2",
      "energizing": [{ "label": "...", "body": "..." }],
      "challenging": [{ "label": "...", "body": "..." }],
      "strategies": [{ "label": "...", "body": "..." }]
    }
  ],
  "environmentNote": "paragraph",
  "nextSteps": ["...", "...", "..."]
}

Rules:
- Select exactly 5-7 roles based on the inputs
- Role titles must be specific, real job titles a person could search and apply for (e.g. "Product Manager", "UX Researcher", "Management Consultant", "Data Analyst") — never vague categories or composite titles like "Team Lead — Strategy or Operations"
- energizers: 4-5 short phrases, max 12 words each — no full sentences
- watchFors: 3-4 short phrases, max 12 words each — no full sentences
- Each role: 3-4 energizing items, 2-3 challenging items, 3-4 strategies
- fit: exactly 2 paragraphs separated by \\n\\n, 80-120 words total
- Each energizing/challenging/strategy body: 1-2 concise sentences, max 30 words
- environmentNote: 1-2 paragraphs, ~70 words
- nextSteps: 3-4 concise action items
- All prose must be specific to this profile and inputs — not generic career advice`;

  // Switch to SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        stream: true,
        system: [
          {
            type: 'text',
            text: `${systemPromptDoc}\n\n---\n\n## MINDPRINT™ AI SOURCE OF TRUTH — AUTHORITATIVE, GOVERNS ALL OUTPUT\n\n${sourceOfTruth}\n\n---`,
            cache_control: { type: 'ephemeral', ttl: '1h' },
          },
          {
            type: 'text',
            text: `\nACTIVE PROFILE FOR THIS REQUEST: ${profile}\nApply Section 4 of the Source of Truth for this profile to every generation decision.`,
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
  } catch (e) {
    send(res, { type: 'error', error: 'Anthropic API error: ' + e.message });
    return res.end();
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    let msg;
    try { msg = JSON.parse(errText)?.error?.message || errText; } catch { msg = errText; }
    send(res, { type: 'error', error: msg });
    return res.end();
  }

  // Read the SSE stream from Anthropic and forward progress + extract text
  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;

        let evt;
        try { evt = JSON.parse(raw); } catch { continue; }

        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          accumulated += evt.delta.text;
          // Send lightweight progress tick (char count only, not full text)
          send(res, { type: 'progress', chars: accumulated.length });
        }
      }
    }
  } catch (e) {
    send(res, { type: 'error', error: 'Stream read error: ' + e.message });
    return res.end();
  }

  // Parse final JSON
  let report;
  try {
    const m = accumulated.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('No JSON object found in response');
    report = JSON.parse(m[0]);
    if (!report.roles || !Array.isArray(report.roles) || !report.roles.length) throw new Error('Missing roles array');
  } catch (e) {
    send(res, { type: 'error', error: 'Failed to parse report: ' + e.message });
    return res.end();
  }

  // Persist to Supabase — non-fatal
  try {
    await dbInsert('career_guidance_reports', {
      profile,
      career_level: careerLevel,
      role_orientation: roleOrientation,
      industry: industry || null,
      risk_environment: riskEnvironment || null,
      values: values || null,
      compensation_priority: compensationPriority || null,
      other_assessments: otherAssessments || null,
      report_data: report,
    });
  } catch (e) {
    console.error('[career-guidance] Supabase insert failed:', e.message);
  }

  send(res, { type: 'done', report });
  res.end();
}
