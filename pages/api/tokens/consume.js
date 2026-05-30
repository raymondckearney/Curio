import { dbGet, dbPatch } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, result_payload } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'token is required' });

  const rows = await dbGet('tokens', { token });
  if (!rows.length) return res.status(200).json({ success: false, status: 'not_found' });

  const row = rows[0];
  if (row.used) return res.status(200).json({ success: false, status: 'already_used' });

  await dbPatch('tokens', { token }, {
    used: true,
    used_at: new Date().toISOString(),
    result_payload: result_payload ?? null,
  });

  return res.status(200).json({ success: true });
}
