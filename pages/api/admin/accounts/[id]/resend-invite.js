import crypto from 'crypto';
import { Resend } from 'resend';
import { getAdminSession } from '../../../../../lib/adminSession';
import { dbGet, dbInsert } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id: accountId } = req.query;

  try {
    const users = await dbGet('client_users', { account_id: accountId });
    if (!users.length) return res.status(404).json({ error: 'No users on this account' });

    const user = users[0];
    if ((user.provider || 'email') !== 'email') {
      return res.status(400).json({ error: 'Cannot send invite to a Google account' });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await dbInsert('password_reset_tokens', { token, user_id: user.id, expires_at: expiresAt, used: false });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const setPasswordUrl = `https://choosecurio.com/portal/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: user.email,
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
      <p style="font-size:0.9rem;color:#374151;line-height:1.7;margin:0 0 24px">Ray Kearney has set up a Curio account for you. Click below to set your password and access your profile.</p>
      <a href="${setPasswordUrl}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Set Your Password →</a>
      <p style="font-size:0.8rem;color:#94A3B8;margin:24px 0 0;line-height:1.6">This link expires in 7 days.</p>
    </div>
  </div>
</body></html>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[admin/accounts/resend-invite]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
