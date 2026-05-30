import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { engagement_id } = req.query;
  if (!engagement_id) return res.status(400).json({ error: 'engagement_id is required' });

  const rows = await dbGet('tokens', { engagement_id });

  return res.status(200).json({ tokens: rows });
}
