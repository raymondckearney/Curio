import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    const rows = await dbGet('assessments', { token });
    if (!rows.length) return res.status(404).json({ found: false });
    const { type, name } = rows[0];
    return res.status(200).json({ found: true, type, name });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
