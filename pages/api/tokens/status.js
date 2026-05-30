import { dbGet } from '../../../lib/supabase';
import { getAdminSession } from '../../../lib/adminSession';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { engagement_id } = req.query;
    if (!engagement_id) return res.status(400).json({ error: 'engagement_id is required' });

    const rows = await dbGet('tokens', { engagement_id });
    return res.status(200).json({ tokens: rows });
  } catch (err) {
    console.error('status error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch status' });
  }
}
