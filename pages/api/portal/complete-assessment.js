import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbPatch, dbInsert, dbQuery } from '../../../lib/supabase';
import { tertiaryFromProfileSlug, resolveGrantedTools } from '../../../lib/tertiary';

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

    // Sharing an account_id isn't enough on its own: a token from the
    // account's team pool also belongs to this account_id, but it's meant
    // for a specific teammate, not whoever happens to be logged in. Only
    // let this shortcut fire when the token isn't earmarked for someone
    // else — if it's assigned to a different email, that person needs to
    // go through their own /signup instead of silently attaching to
    // whoever is currently logged in.
    const assignedEmail = (tr.created_for_email || tr.email || '').toLowerCase().trim();
    if (assignedEmail) {
      const userRows = await dbGet('client_users', { id: session.userId });
      const myEmail = (userRows[0]?.email || '').toLowerCase().trim();
      if (assignedEmail !== myEmail) {
        return res.status(403).json({ error: 'This token is assigned to a different team member.' });
      }
    } else {
      // No assigned identity at all — this is only unambiguous when it's
      // the account's sole unused assessment token (a genuine personal
      // token). If there's a whole pool of spare, unassigned tokens sitting
      // on this account, we can't tell "my own" apart from "one meant for
      // a teammate I haven't sent yet" — require signup instead of
      // guessing whoever's logged in is the intended recipient.
      const unusedAssessmentTokens = await dbQuery('tokens', {
        account_id: `eq.${session.accountId}`,
        purpose: 'eq.assessment',
        used: 'eq.false',
      }).catch(() => [tr]);
      const isSoleToken = unusedAssessmentTokens.length <= 1
        || (unusedAssessmentTokens.length === 1 && unusedAssessmentTokens[0].token === token);
      if (!isSoleToken) {
        return res.status(403).json({ error: 'This looks like a team token pool — please have the recipient create their own account.' });
      }
    }

    if (tr.used) return res.status(200).json({ ok: true, alreadyUsed: true });

    const grantedTier = tr.granted_tier || 'basic';
    const grantedTools = tr.granted_tools || (grantedTier === 'premium'
      ? ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer']
      : ['assessment_tokens']);
    const usedAt = new Date().toISOString();

    // Resolve the just-completed assessment's tertiary so the
    // companion_match/library_match sentinel types (granted when the token
    // was created, before anyone knew this person's profile) become the
    // concrete license type to actually insert.
    const assessmentRows = await dbGet('assessments', { token }).catch(() => []);
    const assessment = assessmentRows[0];
    const tertiary = assessment?.type ? tertiaryFromProfileSlug(assessment.type.toLowerCase()) : null;
    const resolvedTools = resolveGrantedTools(grantedTools, tertiary);

    await Promise.all([
      dbPatch('client_accounts', { id: session.accountId }, { tier: grantedTier }),
      dbPatch('tokens', { token }, { used: true, used_at: usedAt }),
      ...resolvedTools.map(type => dbInsert('account_licenses', {
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
