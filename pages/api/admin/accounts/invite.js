import crypto from 'crypto';
import { Resend } from 'resend';
import { getAdminSession } from '../../../../lib/adminSession';
import { dbGet, dbInsert } from '../../../../lib/supabase';
import { hashPassword } from '../../../../lib/password';
import { syncContactToNotion } from '../../../../lib/notionSync';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, tier = 'basic', licenses = [] } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });

  const normalEmail = email.toLowerCase().trim();

  try {
    const existing = await dbGet('client_users', { email: normalEmail });
    if (existing.length) return res.status(400).json({ error: 'An account with that email already exists.' });

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
      role: 'owner',
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

    // Generate password reset token for initial password set
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days for invite
    await dbInsert('password_reset_tokens', { token, user_id: user.id, expires_at: expiresAt, used: false });

    // Send invite email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const setPasswordUrl = `https://choosecurio.com/portal/reset-password?token=${token}`;
      const licenseList = licenses.length
        ? `<p style="font-size:0.9rem;color:#374151;margin:0 0 8px">Your account includes access to:</p><ul style="margin:0 0 20px;padding-left:20px;font-size:0.9rem;color:#374151;line-height:1.8">${licenses.map(l => `<li>${l.type.replace(/_/g, ' ')}</li>`).join('')}</ul>`
        : '';

      await resend.emails.send({
        from: 'Curio <hello@choosecurio.com>',
        to: normalEmail,
        subject: "You've been invited to Curio",
        html: `<!DOCTYPE html>
<html><head></head>
<body style="font-family:'DM Sans',Helvetica,Arial,sans-serif;background:#F8FAFC;margin:0;padding:0">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:20px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.6rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
    </div>
    <div style="padding:36px 32px">
      <p style="font-size:1rem;color:#0F172A;font-weight:600;margin:0 0 12px">You're invited to Curio</p>
      <p style="font-size:0.9rem;color:#374151;line-height:1.7;margin:0 0 20px">Ray Kearney has set up a Curio account for you. Click below to set your password and access your profile.</p>
      ${licenseList}
      <a href="${setPasswordUrl}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Set Your Password →</a>
      <p style="font-size:0.8rem;color:#94A3B8;margin:24px 0 0;line-height:1.6">This link expires in 7 days. If you have any questions, reply to this email.</p>
    </div>
  </div>
</body></html>`,
      });
    }

    syncContactToNotion({ name: name || normalEmail, email: normalEmail, source: 'admin-invite' }).catch(() => {});

    return res.status(200).json({ success: true, account_id: account.id });
  } catch (err) {
    console.error('[admin/accounts/invite]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
