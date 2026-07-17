import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbPatch, dbInsert } from '../../../lib/supabase';

// Applies an assessment token's tier/license grant to the caller's own,
// already-existing portal account, for the retake-while-logged-in edge
// case: an existing account holder who hadn't completed their assessment
// yet, taking it from their dashboard's "Start Your Assessment" link. This
// mirrors the token-application block in pages/api/auth/signup.js, minus
// the new-account/new-user creation that flow does (the account and user
// already exist here).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token is required' });

  try {
    const tokenRows = await dbGet('tokens', { token });
    if (!tokenRows.length) return res.status(404).json({ error: 'Token not found' });

    const tr = tokenRows[0];
    // Only apply a token to the account it already belongs to — never let a
    // logged-in session claim a token scoped to a different account.
    if (tr.account_id !== session.accountId) {
      return res.status(403).json({ error: 'This token does not belong to your account.' });
    }
    if (tr.used) return res.status(200).json({ ok: true, alreadyUsed: true });

    const grantedTier = tr.granted_tier || 'basic';
    const grantedTools = tr.granted_tools || (grantedTier === 'premium'
      ? ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer']
      : ['assessment_tokens']);
    const usedAt = new Date().toISOString();

    await Promise.all([
      dbPatch('client_accounts', { id: session.accountId }, { tier: grantedTier }),
      dbPatch('tokens', { token }, { used: true, used_at: usedAt }),
      ...grantedTools.map(type => dbInsert('account_licenses', {
        account_id: session.accountId,
        type,
        quantity: 1,
        expires_at: tr.expires_at || null,
      })),
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[portal/complete-assessment]', err);
    return res.status(500).json({ error: err.message });
  }
}
