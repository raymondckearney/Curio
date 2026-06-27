import { dbGet, dbInsert, dbPatch, dbQuery } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/password';
import { createSessionToken, sessionCookie } from '../../../lib/portalSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, stripe_session_id } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const normalEmail = email.toLowerCase().trim();

  // Check if email already registered
  const existing = await dbGet('client_users', { email: normalEmail });
  if (existing.length) {
    return res.status(400).json({ error: 'An account with that email already exists. Try logging in.' });
  }

  // Create account
  const slug = normalEmail.split('@')[0].replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
  const [account] = await dbInsert('client_accounts', {
    name: name.trim(),
    slug,
    notes: stripe_session_id ? `Self-serve purchase: ${stripe_session_id}` : 'Self-serve signup',
  });

  // Create user
  const hash = await hashPassword(password);
  const [user] = await dbInsert('client_users', {
    account_id: account.id,
    email: normalEmail,
    name: name.trim(),
    role: 'owner',
    password_hash: hash,
  });

  // Link purchase tokens to this account via engagement_id
  if (stripe_session_id) {
    try {
      const purchases = await dbGet('purchases', { stripe_session_id });
      if (purchases.length) {
        const { engagement_id } = purchases[0];
        await dbQuery('tokens', {
          engagement_id: `eq.${engagement_id}`,
          account_id: 'is.null',
        }).then(async tokens => {
          if (tokens.length) {
            await Promise.all(
              tokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: account.id }))
            );
          }
        });
      }
    } catch (err) {
      // Non-fatal — tokens can be linked manually by admin
      console.error('[auth/signup] token linking failed:', err.message);
    }
  }

  const sessionToken = createSessionToken(user.id, account.id, 'owner');
  res.setHeader('Set-Cookie', sessionCookie(sessionToken));
  return res.status(201).json({ ok: true });
}
