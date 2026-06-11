import { Resend } from 'resend';
import { dbPatch } from '../../../lib/supabase';
import { setContactLinkSent } from '../../../lib/notion';
import { getAdminSession } from '../../../lib/adminSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  const { token, to, subject, message, participantEmail } = req.body;
  if (!token || !to || !subject || !message) {
    return res.status(400).json({ error: 'token, to, subject, and message are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Ray Kearney <hello@choosecurio.com>',
      to,
      subject,
      text: message,
      html: buildEmailHtml(message),
    });
  } catch (err) {
    console.error('[send-token-link] resend failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }

  await dbPatch('tokens', { token }, { link_sent_at: new Date().toISOString() });

  setContactLinkSent({ email: participantEmail }).catch(err =>
    console.error('[send-token-link] notion update failed:', err)
  );

  return res.status(200).json({ success: true });
}

function buildEmailHtml(text) {
  const bodyHtml = text
    .split(/\n\n+/)
    .map(para => {
      const escaped = para
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const linked = escaped.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" style="color:#059669;font-weight:600">$1</a>'
      );
      return `<p style="margin:0 0 16px;line-height:1.7;color:#0F172A">${linked.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">
        Curio<span style="color:#059669">.</span>
      </span>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
}
