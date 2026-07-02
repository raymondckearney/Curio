import crypto from 'crypto';
import { Resend } from 'resend';
import { dbGet, dbInsert } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });

  // Always return 200 — never confirm whether email exists
  const respond = () => res.status(200).json({ success: true });

  try {
    const users = await dbGet('client_users', { email: email.toLowerCase().trim() });
    if (!users.length) return respond();

    const user = users[0];
    if ((user.provider || 'email') !== 'email') return respond(); // Google accounts — no email sent

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await dbInsert('password_reset_tokens', {
      token,
      user_id: user.id,
      expires_at: expiresAt,
      used: false,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl = `https://choosecurio.com/portal/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: user.email,
      subject: 'Reset your Curio password',
      html: `<!DOCTYPE html>
<html><head><style>
  body { font-family: 'DM Sans', Helvetica, Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; }
</style></head>
<body>
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:20px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.6rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
    </div>
    <div style="padding:36px 32px">
      <p style="font-size:1rem;color:#0F172A;font-weight:600;margin:0 0 12px">Reset your password</p>
      <p style="font-size:0.9rem;color:#374151;line-height:1.7;margin:0 0 24px">Click the link below to reset your password. This link expires in 24 hours.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Reset Password →</a>
      <p style="font-size:0.8rem;color:#94A3B8;margin:24px 0 0;line-height:1.6">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</body></html>`,
    });
  } catch (err) {
    console.error('[auth/forgot-password]', err.message);
  }

  return respond();
}
