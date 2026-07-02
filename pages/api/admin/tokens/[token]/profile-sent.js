import { getAdminSession } from '../../../../../lib/adminSession';
import { dbPatch } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'token is required' });

  try {
    await dbPatch('tokens', { token }, { profile_sent_at: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin/tokens/profile-sent]', err);
    return res.status(500).json({ error: err.message });
  }
}
