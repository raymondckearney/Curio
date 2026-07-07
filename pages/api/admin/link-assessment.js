import { getAdminSession } from '../../../lib/adminSession';
import { dbGet, dbPatch, dbQuery, dbInsert } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { token, email } = req.body || {};
  if (!token || !email) return res.status(400).json({ error: 'token and email are required' });

  const normalEmail = email.toLowerCase().trim();

  try {
    // Find the token
    const tokenRows = await dbGet('tokens', { token });
    if (!tokenRows.length) return res.status(404).json({ error: `Token not found: ${token}` });
    const tok = tokenRows[0];

    // Find the portal user by email
    const users = await dbGet('client_users', { email: normalEmail });
    if (!users.length) return res.status(404).json({ error: `No portal account found for email: ${normalEmail}` });
    const user = users[0];
    const accountId = user.account_id;

    // Check for an assessment on this token
    const assessments = await dbGet('assessments', { token });
    if (!assessments.length) return res.status(404).json({ error: `No completed assessment found for this token. The participant may not have finished the quiz yet.` });
    const assessment = assessments[0];

    const steps = [];

    // Link token to account and mark used if not already
    await dbPatch('tokens', { token }, {
      account_id: accountId,
      used: true,
      used_at: tok.used_at || new Date().toISOString(),
    });
    steps.push(`Linked token to account`);

    // Apply tier and licenses from the token if account has no licenses yet
    const existingLicenses = await dbQuery('account_licenses', { account_id: `eq.${accountId}` });
    if (!existingLicenses.length) {
      const grantedTier = tok.granted_tier || 'basic';
      const grantedTools = tok.granted_tools || (grantedTier === 'premium'
        ? ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer']
        : ['assessment_tokens']);
      await dbPatch('client_accounts', { id: accountId }, { tier: grantedTier });
      await Promise.all(grantedTools.map(type => dbInsert('account_licenses', {
        account_id: accountId,
        type,
        quantity: 1,
        expires_at: tok.expires_at || null,
      })));
      steps.push(`Granted ${grantedTier} tier and licenses: ${grantedTools.join(', ')}`);
    } else {
      steps.push(`Account already has licenses — skipped license grant`);
    }

    const profileType = (assessment.type || '—').toUpperCase().replace(/_/g, '-');
    return res.status(200).json({
      message: `Assessment linked. Profile: ${profileType}. ${steps.join('. ')}.`,
    });
  } catch (err) {
    console.error('[admin/link-assessment]', err);
    return res.status(500).json({ error: err.message });
  }
}
