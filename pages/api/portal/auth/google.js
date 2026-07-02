import { dbGet, dbInsert, dbPatch } from '../../../../lib/supabase';
import { createSessionToken, sessionCookie } from '../../../../lib/portalSession';
import { syncContactToNotion } from '../../../../lib/notionSync';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: 'credential is required' });

  let googlePayload;
  try {
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    googlePayload = await r.json();
    if (!r.ok || googlePayload.error) throw new Error(googlePayload.error_description || 'Invalid token');
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && googlePayload.aud !== clientId) throw new Error('Token audience mismatch');
  } catch (err) {
    console.error('[portal/auth/google] token verify failed:', err.message);
    return res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }

  const { email, name, sub: providerId } = googlePayload;
  if (!email) return res.status(400).json({ error: 'No email in Google token' });

  const normalEmail = email.toLowerCase().trim();

  try {
    const existing = await dbGet('client_users', { email: normalEmail });

    if (existing.length) {
      const user = existing[0];
      const provider = user.provider || 'email';
      if (provider !== 'google') {
        return res.status(409).json({ error: 'This email is registered with a password. Please sign in with your password.' });
      }
      await dbPatch('client_users', { id: user.id }, { last_login_at: new Date().toISOString() }).catch(() => {});
      const token = createSessionToken(user.id, user.account_id, user.role);
      res.setHeader('Set-Cookie', sessionCookie(token));
      return res.status(200).json({ success: true });
    }

    // New user — create account + user
    const slug = normalEmail.split('@')[0].replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    const [account] = await dbInsert('client_accounts', {
      name: name || normalEmail,
      slug,
      tier: 'basic',
      notes: 'Google sign-up',
    });

    const [user] = await dbInsert('client_users', {
      account_id: account.id,
      email: normalEmail,
      name: name || '',
      role: 'owner',
      provider: 'google',
      provider_id: providerId,
    });

    syncContactToNotion({ name: name || normalEmail, email: normalEmail, source: 'google-signup' }).catch(() => {});

    const sessionToken = createSessionToken(user.id, account.id, 'owner');
    res.setHeader('Set-Cookie', sessionCookie(sessionToken));
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('[portal/auth/google]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
