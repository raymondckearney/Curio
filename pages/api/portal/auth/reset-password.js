import { dbGet, dbPatch } from '../../../../lib/supabase';
import { hashPassword } from '../../../../lib/password';
import { createSessionToken, sessionCookie } from '../../../../lib/portalSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'token and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  try {
    const rows = await dbGet('password_reset_tokens', { token });
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired reset link.' });

    const row = rows[0];
    if (row.used) return res.status(400).json({ error: 'This reset link has already been used.' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'This reset link has expired.' });

    const users = await dbGet('client_users', { id: row.user_id });
    if (!users.length) return res.status(400).json({ error: 'User not found.' });
    const user = users[0];

    const hash = await hashPassword(password);
    await dbPatch('client_users', { id: user.id }, { password_hash: hash });
    await dbPatch('password_reset_tokens', { token }, { used: true });

    const sessionToken = createSessionToken(user.id, user.account_id, user.role);
    res.setHeader('Set-Cookie', sessionCookie(sessionToken));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[auth/reset-password]', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
