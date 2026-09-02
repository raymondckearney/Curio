import crypto from 'crypto';
import { getAdminSession } from '../../../../lib/adminSession';
import { dbGet, dbInsert, dbPatch } from '../../../../lib/supabase';
import { hashPassword } from '../../../../lib/password';
import { syncContactToNotion } from '../../../../lib/notionSync';
import { dispatchEmailsForTrigger } from '../../../../lib/emailTemplates';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, tier = 'basic', role = 'owner', engagement_id, licenses = [] } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });

  const normalEmail = email.toLowerCase().trim();

  try {
    const existing = await dbGet('client_users', { email: normalEmail });
    if (existing.length) {
      const existingUser = existing[0];
      // If they've never logged in, treat as a pending invite — just resend the setup link
      if (!existingUser.last_login_at) {
        const resetToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await dbInsert('password_reset_tokens', { token: resetToken, user_id: existingUser.id, expires_at: expiresAt, used: false });

        if (process.env.RESEND_API_KEY) {
          const setupUrl = `https://choosecurio.com/portal/reset-password?token=${resetToken}`;
          await dispatchEmailsForTrigger('admin_invite', { name: existingUser.name || '', email: normalEmail, inviteUrl: setupUrl, licenseList: '' });
        }
        return res.status(200).json({ success: true, resent: true });
      }
      return res.status(400).json({ error: 'An account with that email already exists and has already logged in.' });
    }

    const slug = normalEmail.split('@')[0].replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    const [account] = await dbInsert('client_accounts', {
      name: name || normalEmail,
      slug,
      tier,
      notes: 'Admin invite',
    });

    const tempHash = await hashPassword(crypto.randomUUID());
    const [user] = await dbInsert('client_users', {
      account_id: account.id,
      email: normalEmail,
      name: name || '',
      role: role === 'member' ? 'member' : 'owner',
      provider: 'email',
      password_hash: tempHash,
    });

    if (licenses.length) {
      await Promise.all(licenses.map(l => dbInsert('account_licenses', {
        account_id: account.id,
        type: l.type,
        quantity: l.quantity ? parseInt(l.quantity, 10) : null,
        expires_at: l.expires_at || null,
      })));
    }

    // Link tokens from engagement to this account if engagement_id provided
    let tokensLinked = 0;
    if (engagement_id) {
      try {
        const engTokens = await dbGet('tokens', { engagement_id, email: normalEmail });
        if (engTokens.length) {
          await Promise.all(engTokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: account.id })));
          tokensLinked = engTokens.length;
        }
      } catch (err) {
        console.error('[admin/accounts/invite] engagement link failed:', err);
      }
    }

    // Generate password reset token for initial password set
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days for invite
    await dbInsert('password_reset_tokens', { token, user_id: user.id, expires_at: expiresAt, used: false });

    // Send invite email
    if (process.env.RESEND_API_KEY) {
      const setPasswordUrl = `https://choosecurio.com/portal/reset-password?token=${token}`;
      const licenseList = licenses.length
        ? `<p style="font-size:0.9rem;color:#374151;margin:0 0 8px">Your account includes access to:</p><ul style="margin:0 0 20px;padding-left:20px;font-size:0.9rem;color:#374151;line-height:1.8">${licenses.map(l => `<li>${l.type.replace(/_/g, ' ')}</li>`).join('')}</ul>`
        : '';
      await dispatchEmailsForTrigger('admin_invite', { name: name || '', email: normalEmail, inviteUrl: setPasswordUrl, licenseList });
    }

    syncContactToNotion({ name: name || normalEmail, email: normalEmail, source: 'admin-invite' }).catch(() => {});

    return res.status(200).json({ success: true, account_id: account.id, tokens_linked: tokensLinked });
  } catch (err) {
    console.error('[admin/accounts/invite]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
