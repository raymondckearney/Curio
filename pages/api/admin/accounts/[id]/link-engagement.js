import { getAdminSession } from '../../../../../lib/adminSession';
import { dbQuery, dbPatch } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;
  const { engagement_id } = req.body || {};
  if (!engagement_id) return res.status(400).json({ error: 'engagement_id required' });

  try {
    const tokens = await dbQuery('tokens', { engagement_id: `eq.${engagement_id}`, select: 'token' });
    if (!tokens.length) return res.status(404).json({ error: 'No tokens found for that engagement ID' });

    // Link each token to this account
    await Promise.all(tokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: accountId })));

    return res.status(200).json({ linked: tokens.length });
  } catch (err) {
    console.error('[admin/accounts/link-engagement]', err);
    return res.status(500).json({ error: err.message });
  }
}
