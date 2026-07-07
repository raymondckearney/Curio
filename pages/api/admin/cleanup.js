import { dbGet, dbDelete } from '../../../lib/supabase';
import { getAdminSession } from '../../../lib/adminSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });

  const log = [];

  try {
    // 1. Find the token row to get account_id
    const tokenRows = await dbGet('tokens', { token });
    if (!tokenRows.length) return res.status(404).json({ error: 'Token not found' });
    const tokenRow = tokenRows[0];
    const accountId = tokenRow.account_id;

    // 2. Delete assessment
    const assessments = await dbDelete('assessments', { token }).catch(() => []);
    if (assessments.length) log.push(`Deleted ${assessments.length} assessment row(s)`);

    // 3. Delete the token
    await dbDelete('tokens', { token });
    log.push('Deleted token');

    // 4. If an account was created, delete licenses, users, and account
    if (accountId) {
      const licenses = await dbDelete('account_licenses', { account_id: accountId }).catch(() => []);
      if (licenses.length) log.push(`Deleted ${licenses.length} license(s)`);

      const users = await dbDelete('client_users', { account_id: accountId }).catch(() => []);
      if (users.length) log.push(`Deleted ${users.length} portal user(s)`);

      await dbDelete('client_accounts', { id: accountId });
      log.push('Deleted portal account');
    }

    return res.status(200).json({ ok: true, log });
  } catch (err) {
    console.error('[admin/cleanup]', err);
    return res.status(500).json({ error: err.message || 'Cleanup failed' });
  }
}
