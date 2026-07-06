import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'token is required' });

  const rows = await dbGet('tokens', { token });
  if (!rows.length) return res.status(404).json({ error: 'Token not found' });

  const row = rows[0];
  return res.status(200).json({
    granted_tier: row.granted_tier || 'basic',
    granted_tools: row.granted_tools || ['assessment_tokens'],
    name: [row.created_for_name, row.name].find(n => n && n.toLowerCase() !== 'individual') || '',
    email: row.created_for_email || row.email || '',
    used: row.used || false,
  });
}
