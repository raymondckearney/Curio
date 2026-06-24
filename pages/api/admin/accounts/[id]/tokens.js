import { getAdminSession } from '../../../../../lib/adminSession';
import { dbQuery } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;

  try {
    const tokens = await dbQuery('tokens', {
      account_id: `eq.${accountId}`,
      order: 'created_at.desc',
      select: 'token,name,email,role,engagement_id,used,used_at,created_at',
    });
    return res.status(200).json({ tokens });
  } catch (err) {
    console.error('[admin/accounts/tokens]', err);
    return res.status(500).json({ error: err.message });
  }
}
