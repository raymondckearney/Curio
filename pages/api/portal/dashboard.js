import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId } = session;

  try {
    const [licenses, tokens, account] = await Promise.all([
      dbGet('account_licenses', { account_id: accountId }),
      dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,used,name,email,role,used_at' }),
      dbGet('client_accounts', { id: accountId }),
    ]);

    const tokenCount = tokens.length;
    const usedTokens = tokens.filter(t => t.used).length;

    // Recent assessments (last 5) via token lookup
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    let recentAssessments = [];
    if (tokenIds.length) {
      const aRes = await dbQuery('assessments', {
        token: `in.(${tokenIds.join(',')})`,
        order: 'submitted_at.desc',
        limit: '5',
        select: 'id,name,email,type,submitted_at,token',
      });
      recentAssessments = aRes;
    }

    return res.status(200).json({
      licenses,
      tokenStats: { total: tokenCount, used: usedTokens, available: tokenCount - usedTokens },
      recentAssessments,
      accountName: account[0]?.name || '',
    });
  } catch (err) {
    console.error('[portal/dashboard]', err);
    return res.status(500).json({ error: err.message });
  }
}
