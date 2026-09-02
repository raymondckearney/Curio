import crypto from 'crypto';
import { Resend } from 'resend';
import { getAdminSession } from '../../../../../lib/adminSession';
import { dbGet, dbInsert } from '../../../../../lib/supabase';
import { getEmailTemplate, renderTemplate } from '../../../../../lib/emailTemplates';

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

    const tpl = await getEmailTemplate('invite_account');
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: user.email,
      subject: tpl.subject,
      html: renderTemplate(tpl.html_body, { name: user.name || '', inviteUrl: setPasswordUrl, licenseList: '' }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[admin/accounts/resend-invite]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
