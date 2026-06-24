import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(401).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, userId, role } = session;

  try {
    const [accountRows, userRows, tokens] = await Promise.all([
      dbGet('client_accounts', { id: accountId }),
      dbGet('client_users', { id: userId }),
      dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,name,email,role' }),
    ]);

    const account = accountRows[0];
    const user = userRows[0];
    const tokenIds = tokens.map(t => t.token).filter(Boolean);

    if (!tokenIds.length) return res.status(200).json({ assessments: [] });

    const assessments = await dbQuery('assessments', {
      token: `in.(${tokenIds.join(',')})`,
      order: 'submitted_at.desc',
      select: '*',
    });

    // Build token map for enrichment
    const tokenMap = {};
    tokens.forEach(t => { tokenMap[t.token] = t; });

    const enriched = assessments.map(a => ({
      ...a,
      reg_name:  tokenMap[a.token]?.name  || null,
      reg_email: tokenMap[a.token]?.email || null,
      reg_role:  tokenMap[a.token]?.role  || null,
    }));

    // If account restricts results and user is a member, only show their own
    const restricted = account?.restrict_results && role === 'member';
    const filtered = restricted
      ? enriched.filter(a => a.email === user?.email || a.reg_email === user?.email)
      : enriched;

    return res.status(200).json({ assessments: filtered });
  } catch (err) {
    console.error('[portal/results]', err);
    return res.status(500).json({ error: err.message });
  }
}
