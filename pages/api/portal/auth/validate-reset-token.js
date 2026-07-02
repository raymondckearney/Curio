import { dbGet } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false, error: 'token is required' });

  try {
    const rows = await dbGet('password_reset_tokens', { token });
    if (!rows.length) return res.status(200).json({ valid: false });

    const row = rows[0];
    if (row.used) return res.status(200).json({ valid: false, reason: 'used' });
    if (new Date(row.expires_at) < new Date()) return res.status(200).json({ valid: false, reason: 'expired' });

    return res.status(200).json({ valid: true });
  } catch (err) {
    console.error('[auth/validate-reset-token]', err.message);
    return res.status(500).json({ valid: false });
  }
}
