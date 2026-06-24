import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery, dbInsert } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const accounts = await dbQuery('client_accounts', { order: 'created_at.desc', select: '*' });

      // Enrich with user count and license summary per account
      const enriched = await Promise.all(accounts.map(async acc => {
        const [users, licenses] = await Promise.all([
          dbQuery('client_users', { account_id: `eq.${acc.id}`, select: 'id,email,name,role' }),
          dbQuery('account_licenses', { account_id: `eq.${acc.id}`, select: '*' }),
        ]);
        return { ...acc, users, licenses };
      }));

      return res.status(200).json({ accounts: enriched });
    } catch (err) {
      console.error('[admin/accounts GET]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name, slug, notes } = req.body || {};
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    try {
      const rows = await dbInsert('client_accounts', { name, slug: cleanSlug, notes: notes || null });
      return res.status(201).json({ account: rows[0] });
    } catch (err) {
      console.error('[admin/accounts POST]', err);
      const msg = err.message.includes('unique') ? 'That slug is already taken' : err.message;
      return res.status(400).json({ error: msg });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
