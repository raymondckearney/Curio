import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery } from '../../../lib/supabase';

// Owner-only: every completed assessment on the account, for the Analytics
// tab's charts and list generator. Unlike /api/portal/results, this never
// applies the restrict_results member filter, since only owners can reach it.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'owner') return res.status(403).json({ error: 'Owners only.' });

  const { accountId } = session;

  try {
    const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,name,email' });
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    if (!tokenIds.length) return res.status(200).json({ people: [] });

    const assessments = await dbQuery('assessments', {
      token: `in.(${tokenIds.join(',')})`,
      select: 'token,name,email,type,submitted_at',
    });

    const tokenMap = {};
    tokens.forEach(t => { tokenMap[t.token] = t; });

    const people = assessments
      .filter(a => a.type)
      .map(a => ({
        name: a.name || tokenMap[a.token]?.name || '',
        email: a.email || tokenMap[a.token]?.email || '',
        profile: a.type.toUpperCase(),
      }));

    return res.status(200).json({ people });
  } catch (err) {
    console.error('[portal/analytics]', err);
    return res.status(500).json({ error: err.message });
  }
}
