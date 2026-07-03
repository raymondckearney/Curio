import { getAdminSession } from '../../../../lib/adminSession';
import { dbGet, dbPatch, dbDelete, dbQuery, dbInsert } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [accounts, users, licenses] = await Promise.all([
        dbGet('client_accounts', { id }),
        dbQuery('client_users', { account_id: `eq.${id}`, select: 'id,email,name,role,last_login_at,created_at', order: 'created_at.asc' }),
        dbQuery('account_licenses', { account_id: `eq.${id}`, select: '*', order: 'created_at.asc' }),
      ]);
      if (!accounts.length) return res.status(404).json({ error: 'Account not found' });
      return res.status(200).json({ account: accounts[0], users, licenses });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    const { name, notes, restrict_results, tier, status, licenses } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (notes !== undefined) update.notes = notes;
    if (restrict_results !== undefined) update.restrict_results = restrict_results;
    if (tier !== undefined) update.tier = tier;
    if (status !== undefined) update.status = status;
    try {
      await dbPatch('client_accounts', { id }, update);
      if (licenses !== undefined) {
        // Replace licenses: delete existing, re-insert
        const existing = await dbQuery('account_licenses', { account_id: `eq.${id}`, select: 'id' });
        await Promise.all(existing.map(l => dbDelete('account_licenses', { id: l.id })));
        if (licenses.length) {
          await Promise.all(licenses.map(l => dbInsert('account_licenses', {
            account_id: id,
            type: l.type,
            quantity: l.quantity ?? 1,
            expires_at: l.expires_at || null,
          })));
        }
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[admin/accounts/[id]] PATCH error:', err.message);
      return res.status(500).json({ error: 'Update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Collect user emails before deletion for token privacy cleanup
      const users = await dbQuery('client_users', { account_id: `eq.${id}`, select: 'id,email' });
      const emails = users.map(u => u.email).filter(Boolean);

      // Null out created_for_email on tokens linked to this account's users
      await Promise.all(emails.map(email =>
        dbPatch('tokens', { created_for_email: email }, { created_for_email: null }).catch(() => {})
      ));

      // Delete related rows, then the account itself
      await dbDelete('tool_sessions', { account_id: id }).catch(() => {});
      await Promise.all(users.map(u => dbDelete('client_users', { id: u.id })));
      await dbDelete('account_licenses', { account_id: id }).catch(() => {});
      await dbDelete('client_accounts', { id });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[admin/accounts/[id]] DELETE error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
