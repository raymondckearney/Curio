import { dbGet, dbInsert, dbPatch, dbQuery } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/password';
import { createSessionToken, sessionCookie } from '../../../lib/portalSession';
import { syncContactToNotion } from '../../../lib/notionSync';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, stripe_session_id, token: assessmentToken } = req.body || {};
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

  // Link tokens to this account.
  // Primary: match by email on the tokens table (set by webhook from buyer_email)
  // Fallback: match by engagement_id via purchases table (requires purchases table to exist)
  try {
    const emailTokens = await dbQuery('tokens', {
      email: `eq.${normalEmail}`,
      account_id: 'is.null',
    });
    if (emailTokens.length) {
      await Promise.all(
        emailTokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: account.id }))
      );
    } else if (stripe_session_id) {
      // Fallback: try purchases table
      const purchases = await dbGet('purchases', { stripe_session_id }).catch(() => []);
      if (purchases.length) {
        const { engagement_id } = purchases[0];
        const engTokens = await dbQuery('tokens', {
          engagement_id: `eq.${engagement_id}`,
          account_id: 'is.null',
        }).catch(() => []);
        await Promise.all(
          engTokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: account.id }))
        );
      }
    }
  } catch (err) {
    console.error('[auth/signup] token linking failed:', err.message);
  }

  syncContactToNotion({ name: name.trim(), email: normalEmail, source: 'self-signup' });

  // Apply assessment token: set granted tier and consume
  if (assessmentToken) {
    try {
      const tokenRows = await dbGet('tokens', { token: assessmentToken });
      if (tokenRows.length && !tokenRows[0].used) {
        const grantedTier = tokenRows[0].granted_tier || 'basic';
        const usedAt = new Date().toISOString();
        await Promise.all([
          dbPatch('client_accounts', { id: account.id }, { tier: grantedTier }),
          dbPatch('tokens', { token: assessmentToken }, { used: true, used_at: usedAt, account_id: account.id }),
        ]);
      } else if (tokenRows[0]?.used) {
        console.warn('[auth/signup] assessment token already used:', assessmentToken);
      }
    } catch (err) {
      console.error('[auth/signup] token apply failed:', err.message);
    }
  }

  const sessionToken = createSessionToken(user.id, account.id, 'owner');
  res.setHeader('Set-Cookie', sessionCookie(sessionToken));
  return res.status(201).json({ ok: true });
}
