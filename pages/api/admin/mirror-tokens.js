import crypto from 'crypto';
import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery, dbInsert } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const rows = await dbQuery('mirror_tokens', { order: 'created_at.desc' });
      return res.status(200).json({ tokens: rows });
    } catch (err) {
      console.error('[admin/mirror-tokens]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { label } = req.body || {};
    if (!label || !label.trim()) return res.status(400).json({ error: 'label is required' });
    try {
      const [row] = await dbInsert('mirror_tokens', {
        token: crypto.randomUUID(),
        label: label.trim(),
        active: true,
      });
      return res.status(200).json({ token: row });
    } catch (err) {
      console.error('[admin/mirror-tokens]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
