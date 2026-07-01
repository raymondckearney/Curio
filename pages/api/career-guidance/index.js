import fs from 'fs';
import path from 'path';
import { dbInsert } from '../../../lib/supabase';

const VALID_PROFILES = ['WHY-WHAT','WHY-HOW','WHAT-WHY','WHAT-HOW','HOW-WHY','HOW-WHAT'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile, careerLevel, roleOrientation, industry, riskEnvironment, values, compensationPriority, otherAssessments } = req.body || {};

  if (!profile || !VALID_PROFILES.includes(profile)) return res.status(400).json({ error: 'Missing or invalid profile' });
  if (!careerLevel) return res.status(400).json({ error: 'careerLevel is required' });
  if (!roleOrientation) return res.status(400).json({ error: 'roleOrientation is required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  // Read reference files at request time so updates take effect without redeploy
  let systemPromptDoc, sourceOfTruth;
  try {
    systemPromptDoc = fs.readFileSync(path.join(process.cwd(), 'career_guidance_system_prompt.md'), 'utf8');
    sourceOfTruth   = fs.readFileSync(path.join(process.cwd(), 'lib', 'mindprint-source-of-truth.md'), 'utf8');
  } catch (e) {
    return res.status(500).json({ error: 'Could not load system prompt files: ' + e.message });
  }

  const systemPrompt = `${systemPromptDoc}

---

## MINDPRINT™ AI SOURCE OF TRUTH — AUTHORITATIVE, GOVERNS ALL OUTPUT

${sourceOfTruth}

---

ACTIVE PROFILE FOR THIS REQUEST: ${profile}
Apply Section 4 of the Source of Truth for this profile to every generation decision.`;

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
  "alignmentLabel": "STRONG SIGNAL",
  "alignmentPercent": 82,
  "alignmentSentence": "...",
  "energizers": ["...", "...", "..."],
  "watchFors": ["...", "..."],
  "roles": [
    {
      "title": "...",
      "fit": "paragraph1\\n\\nparagraph2\\n\\nparagraph3",
      "energizing": [{ "label": "...", "body": "..." }],
      "challenging": [{ "label": "...", "body": "..." }],
      "strategies": [{ "label": "...", "body": "..." }]
    }
  ],
  "environmentNote": "paragraph1\\n\\nparagraph2",
  "nextSteps": ["...", "...", "...", "..."]
}

Rules:
- alignmentLabel: one of "STRONG SIGNAL", "GOOD SIGNAL", or "CONDITIONAL"
- alignmentPercent: STRONG SIGNAL = 75-95, GOOD SIGNAL = 60-74, CONDITIONAL = 40-59
- alignmentLabel: one of "STRONG SIGNAL", "GOOD SIGNAL", or "CONDITIONAL"
- alignmentPercent: STRONG SIGNAL = 75-95, GOOD SIGNAL = 60-74, CONDITIONAL = 40-59
- Select 3-5 roles based on the inputs
- Each role: 4-5 energizing items, 3-4 challenging items, 4-5 strategies
- fit: 3-4 paragraphs separated by \\n\\n, ~150-200 words total
- environmentNote: 2-3 paragraphs separated by \\n\\n
- All prose must be substantive and specific to this profile and inputs — not generic career advice`;

  let raw;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        system: [
          {
            type: 'text',
            text: `${systemPromptDoc}\n\n---\n\n## MINDPRINT™ AI SOURCE OF TRUTH — AUTHORITATIVE, GOVERNS ALL OUTPUT\n\n${sourceOfTruth}\n\n---`,
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text: `\nACTIVE PROFILE FOR THIS REQUEST: ${profile}\nApply Section 4 of the Source of Truth for this profile to every generation decision.`,
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg;
      try { msg = JSON.parse(errText)?.error?.message || errText; } catch { msg = errText; }
      return res.status(502).json({ error: msg });
    }

    const data = await response.json();
    raw = data.content?.[0]?.text || '';
  } catch (e) {
    return res.status(502).json({ error: 'Anthropic API error: ' + e.message });
  }

  let report;
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('No JSON object found in response');
    report = JSON.parse(m[0]);
    if (!report.roles || !Array.isArray(report.roles) || !report.roles.length) throw new Error('Missing roles array');
  } catch (e) {
    return res.status(500).json({ error: 'Failed to parse report: ' + e.message });
  }

  // Persist to Supabase — only on clean parse
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
    // Non-fatal — still return the report
  }

  return res.status(200).json(report);
}
