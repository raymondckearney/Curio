// Admin: cancel a token email that is scheduled but not yet sent.
import { dbGet } from '../../../lib/supabase';
import { getAdminSession } from '../../../lib/adminSession';
import { cancelScheduled } from '../../../lib/scheduledLinks';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token is required' });
  try {
    const [row] = await dbGet('tokens', { token });
    if (!row) return res.status(404).json({ error: 'Token not found' });
    if (!row.scheduled_email_id) return res.status(400).json({ error: 'This token has no scheduled email.' });
    if (row.link_scheduled_for && new Date(row.link_scheduled_for) <= new Date()) return res.status(400).json({ error: 'That email has already gone out.' });
    await cancelScheduled(row);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[cancel-scheduled-link]', err);
    return res.status(500).json({ error: err.message || 'Could not cancel the scheduled email.' });
  }
}
