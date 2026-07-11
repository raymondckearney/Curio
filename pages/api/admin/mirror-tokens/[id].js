import { getAdminSession } from '../../../../lib/adminSession';
import { dbPatch } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const { active } = req.body || {};
  if (typeof active !== 'boolean') return res.status(400).json({ error: 'active must be a boolean' });

  try {
    const [row] = await dbPatch('mirror_tokens', { id }, { active });
    return res.status(200).json({ token: row });
  } catch (err) {
    console.error('[admin/mirror-tokens/id]', err);
    return res.status(500).json({ error: err.message });
  }
}
