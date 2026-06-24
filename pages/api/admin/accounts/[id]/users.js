import { getAdminSession } from '../../../../../lib/adminSession';
import { dbInsert, dbDelete, dbPatch, dbQuery } from '../../../../../lib/supabase';
import { hashPassword } from '../../../../../lib/password';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;

  if (req.method === 'POST') {
    const { email, name, role = 'member', password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    try {
      const hash = await hashPassword(password);
      const rows = await dbInsert('client_users', {
        account_id: accountId,
        email: email.toLowerCase().trim(),
        name: name || null,
        role,
        password_hash: hash,
      });
      const { password_hash, ...safe } = rows[0];
      return res.status(201).json({ user: safe });
    } catch (err) {
      const msg = err.message.includes('unique') ? 'That email already has an account' : err.message;
      return res.status(400).json({ error: msg });
    }
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
      await dbDelete('client_users', { id: userId });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — update role or reset password
  if (req.method === 'PATCH') {
    const { userId, role, password } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const update = {};
    if (role) update.role = role;
    if (password) update.password_hash = await hashPassword(password);
    if (!Object.keys(update).length) return res.status(400).json({ error: 'Nothing to update' });
    try {
      await dbPatch('client_users', { id: userId }, update);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
