import { dbGet, dbPatch } from '../../../lib/supabase';
import { verifyPassword } from '../../../lib/password';
import { createSessionToken, sessionCookie } from '../../../lib/portalSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const users = await dbGet('client_users', { email: email.toLowerCase().trim() });
    if (!users.length) return res.status(401).json({ error: 'Invalid email or password' });

    const user = users[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    await dbPatch('client_users', { id: user.id }, { last_login_at: new Date().toISOString() }).catch(() => {});

    const token = createSessionToken(user.id, user.account_id, user.role);
    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[portal/login]', err);
    return res.status(500).json({ error: err.message });
  }
}
