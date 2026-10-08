// Server-only helpers shared by the Team Builder API routes: access, daily
// caps, and the Anthropic call (raw fetch, the project convention).
import { loadCompanionProps } from '../companionAuth';
import { dbInsert, dbQuery } from '../supabase';

export const LICENSE = 'team_builder';
export const MODEL = 'claude-sonnet-4-6';
// Per user, per UTC day. Every document read and every narrative call is
// logged in team_builder_calls (kind, user, account; no content).
export const DAILY_CAP = { extract: 20, narrative: 200 };

// Vercel Hobby functions stop at 60 seconds; give up on the model a little
// before that so the user gets a clear message instead of a timeout page.
export const MODEL_DEADLINE_MS = 54000;

export async function requireAccess(req, res) {
  const auth = await loadCompanionProps(req, LICENSE);
  if (auth.redirect || !auth.me) { res.status(401).json({ error: 'Please sign in again.' }); return null; }
  if (auth.locked) { res.status(403).json({ error: 'Team Builder is not included in your account.' }); return null; }
  return auth;
}

// Returns true (and sends a 429) when the user is over today's cap.
export async function overDailyCap(res, auth, kind) {
  if (auth.isAdmin) return false;
  const since = new Date(); since.setUTCHours(0, 0, 0, 0);
  const rows = await dbQuery('team_builder_calls', {
    user_id: `eq.${auth.me.user.id}`, kind: `eq.${kind}`, created_at: `gte.${since.toISOString()}`, select: 'id',
  }).catch(() => []);
  if (rows.length >= DAILY_CAP[kind]) {
    res.status(429).json({ error: kind === 'extract'
      ? `You've reached today's limit of ${DAILY_CAP.extract} document reads. It resets at midnight UTC.`
      : 'You\'ve reached today\'s limit for written explanations. The result still works, and the limit resets at midnight UTC.' });
    return true;
  }
  return false;
}

export function logCall(auth, kind) {
  return dbInsert('team_builder_calls', { kind, user_id: auth.me.user.id, account_id: auth.me.account.id }).catch(e => console.error('[team-builder] log call', e.message));
}

// One Messages API call. system: array of text blocks (the big governing
// documents first, cached). Returns { text } or { error, status, timeout }.
export async function callModel({ system, content, maxTokens = 8000, deadline }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: 'ANTHROPIC_API_KEY not configured', status: 500 };
  const controller = new AbortController();
  const ms = Math.max(1000, (deadline || Date.now() + MODEL_DEADLINE_MS) - Date.now());
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('[team-builder] Anthropic error', r.status, t.slice(0, 300));
      return { error: 'The AI service returned an error. Please try again.', status: 502 };
    }
    const data = await r.json();
    return { text: (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n'), stop: data.stop_reason };
  } catch (e) {
    if (e.name === 'AbortError') return { error: 'This took longer than the time allowed. Try a shorter document, or paste just the scope section.', status: 504, timeout: true };
    console.error('[team-builder] Anthropic fetch failed', e.message);
    return { error: 'The AI service could not be reached. Please try again.', status: 502 };
  } finally {
    clearTimeout(timer);
  }
}

// First JSON object in the model's text, or null.
export function parseJson(text) {
  try {
    const m = String(text || '').match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch { return null; }
}

// The governing documents as cached system blocks, in the spec's order.
export function systemBlocks(part, docs, partLabel) {
  return [{
    type: 'text',
    text: `${part}\n\n---\n\n## MINDPRINT™ ACTIVITY TAXONOMY (AUTHORITATIVE FOR TAGGING)\n\n${docs.taxonomyMd}\n\n---\n\n## MINDPRINT™ AI SOURCE OF TRUTH (AUTHORITATIVE, GOVERNS ALL OUTPUT)\n\n${docs.sot}`,
    cache_control: { type: 'ephemeral', ttl: '1h' },
  }, { type: 'text', text: `You are running ${partLabel}. Return valid JSON only.` }];
}
