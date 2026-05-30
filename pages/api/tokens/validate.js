import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ status: 'no_token' });

  const rows = await dbGet('tokens', { token });
  if (!rows.length) return res.status(200).json({ status: 'not_found' });

  const row = rows[0];

  if (row.used) return res.status(200).json({ status: 'used', name: row.name, purpose: row.purpose });

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return res.status(200).json({ status: 'expired', name: row.name, purpose: row.purpose });
  }

  return res.status(200).json({
    status: 'valid',
    name: row.name,
    email: row.email,
    purpose: row.purpose,
  });
}
