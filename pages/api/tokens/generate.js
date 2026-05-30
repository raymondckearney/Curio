import { dbInsert } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { participants, purpose, engagement_id, expires_at } = req.body;
  if (!participants?.length || !purpose || !engagement_id) {
    return res.status(400).json({ error: 'participants, purpose, and engagement_id are required' });
  }

  const rows = participants.map(({ name, email }) => ({
    token: crypto.randomUUID(),
    name,
    email,
    purpose,
    engagement_id,
    expires_at: expires_at || null,
    used: false,
  }));

  const inserted = await dbInsert('tokens', rows);

  const results = inserted.map(row => ({
    name: row.name,
    email: row.email,
    token: row.token,
    url: `https://choosecurio.com/${row.purpose}?token=${row.token}`,
  }));

  return res.status(200).json({ tokens: results });
}
