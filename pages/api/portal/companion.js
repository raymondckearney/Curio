import { getPortalSession } from '../../../lib/portalSession';
import { getAdminSession } from '../../../lib/adminSession';
import { dbGet, dbQuery, dbInsert } from '../../../lib/supabase';
import { buildSystemPrompt, isValidMode } from '../../../lib/companion-prompts';
import { tertiaryFromProfileSlug, TERTIARY_BY_PROFILE } from '../../../lib/tertiary';

const LICENSE_KEY_BY_TOOL = {
  precision: 'precision_companion',
  purpose: 'purpose_companion',
  progress: 'progress_companion',
  translator: 'orientation_translator',
};

const DAILY_CALL_CAP = 50;

async function resolveAccountProfile(accountId, userEmail) {
  const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' });
  const tokenIds = tokens.map(t => t.token).filter(Boolean);
  if (!tokenIds.length) return null;
  const assessments = await dbQuery('assessments', {
    token: `in.(${tokenIds.join(',')})`,
    order: 'submitted_at.desc',
    select: 'email,type,submitted_at',
  });
  const mine = assessments.find(a => a.email === userEmail) || null;
  return mine?.type ? mine.type.toUpperCase() : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { tool, mode, messages, profileOverride } = req.body || {};

  if (!LICENSE_KEY_BY_TOOL[tool]) return res.status(400).json({ error: 'Unknown tool' });
  if (!isValidMode(tool, mode)) return res.status(400).json({ error: 'Unknown mode' });
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'messages is required' });
  if (!messages.every(m => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))) {
    return res.status(400).json({ error: 'Malformed messages' });
  }

  const { accountId, userId } = session;

  try {
    const [licenses, userRows] = await Promise.all([
      dbGet('account_licenses', { account_id: accountId, type: LICENSE_KEY_BY_TOOL[tool] }),
      dbGet('client_users', { id: userId }),
    ]);

    const now = new Date();
    const hasLicense = licenses.some(l => !l.expires_at || new Date(l.expires_at) > now);
    const isAdmin = !!getAdminSession(req);
    if (!hasLicense && !isAdmin) return res.status(403).json({ error: 'This Companion is not licensed on your account.' });

    const user = userRows[0];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let profile = await resolveAccountProfile(accountId, user.email);
    if (isAdmin && profileOverride && TERTIARY_BY_PROFILE[profileOverride]) profile = profileOverride;

    // The Translator is universal: it doesn't require the caller to have a
    // completed assessment on file. The three Companions still do, since
    // their output is personalized to the caller's own profile.
    if (tool !== 'translator' && !profile) {
      return res.status(400).json({ error: 'Complete your MindPrint™ assessment to use the Companions.' });
    }

    const tertiary = profile ? tertiaryFromProfileSlug(profile.toLowerCase()) : null;

    // Per-user daily cap, counted against calendar-day UTC boundaries.
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    const todaysSessions = await dbQuery('tool_sessions', {
      user_id: `eq.${userId}`,
      created_at: `gte.${startOfDay}`,
      select: 'id',
    });
    if (todaysSessions.length >= DAILY_CALL_CAP) {
      return res.status(429).json({ error: `You've reached today's limit of ${DAILY_CALL_CAP} Companion calls. It resets at midnight UTC.` });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

    const system = buildSystemPrompt({ tool, mode, profile, tertiary });

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok || data.error) {
      return res.status(anthropicRes.status || 500).json({ error: data.error?.message || 'Request to Anthropic failed' });
    }

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');

    try {
      await dbInsert('tool_sessions', {
        account_id: accountId,
        user_id: userId,
        tool,
        mode,
        profile,
        tokens_input: data.usage?.input_tokens || null,
        tokens_output: data.usage?.output_tokens || null,
      });
    } catch (e) {
      console.error('[companion] tool_sessions insert failed:', e.message);
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('[companion]', err);
    return res.status(500).json({ error: err.message });
  }
}
