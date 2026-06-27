import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, userId } = session;

  try {
    const [licenses, tokens, account, userRows] = await Promise.all([
      dbGet('account_licenses', { account_id: accountId }),
      dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,used,name,email,purpose,used_at' }),
      dbGet('client_accounts', { id: accountId }),
      dbGet('client_users', { id: userId }),
    ]);

    const user = userRows[0];
    const isSelfServe = !licenses.length;
    const hasFitToken = tokens.some(t => t.purpose === 'fit');
    const tokenCount = tokens.length;
    const usedTokens = tokens.filter(t => t.used).length;

    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    let recentAssessments = [];
    let myAssessment = null;

    if (tokenIds.length) {
      const aRes = await dbQuery('assessments', {
        token: `in.(${tokenIds.join(',')})`,
        order: 'submitted_at.desc',
        limit: '5',
        select: 'id,name,email,type,h_score,w_score,y_score,submitted_at,token',
      });
      recentAssessments = aRes;

      // For self-serve: find assessment that matches the user's own email
      if (isSelfServe && user?.email) {
        myAssessment = aRes.find(a => a.email === user.email) || aRes[0] || null;
      }
    }

    return res.status(200).json({
      licenses,
      tokenStats: { total: tokenCount, used: usedTokens, available: tokenCount - usedTokens },
      recentAssessments,
      accountName: account[0]?.name || '',
      isSelfServe,
      hasFitToken,
      myAssessment,
    });
  } catch (err) {
    console.error('[portal/dashboard]', err);
    return res.status(500).json({ error: err.message });
  }
}
