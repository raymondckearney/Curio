import { Resend } from 'resend';
import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbPatch } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { recipients, message } = req.body || {};
  if (!recipients?.length) return res.status(400).json({ error: 'recipients required' });
  if (!message?.trim()) return res.status(400).json({ error: 'message required' });

  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'Email not configured' });

  try {
    // Fetch available tokens (no email assigned, not used)
    const available = await dbQuery('tokens', {
      account_id: `eq.${session.accountId}`,
      email: 'is.null',
      used: 'eq.false',
      order: 'created_at.asc',
      select: 'token,engagement_id',
    });

    if (available.length < recipients.length) {
      return res.status(400).json({
        error: `Not enough available tokens. Need ${recipients.length}, have ${available.length}.`,
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.choosecurio.com';
    const results = [];

    for (let i = 0; i < recipients.length; i++) {
      const { name, email } = recipients[i];
      if (!email?.trim()) continue;

      const tok = available[i];
      const url = `${baseUrl}/go/${tok.token}`;

      // Personalise message: replace [Name] placeholder and append URL
      const personalised = message
        .replace(/\[Name\]/gi, name?.trim() || 'there')
        .replace(/\[URL\]/gi, url);

      const body = personalised.includes(url) ? personalised : `${personalised}\n\n${url}`;

      // Assign token to recipient
      await dbPatch('tokens', { token: tok.token }, {
        name: name?.trim() || null,
        email: email.trim().toLowerCase(),
        link_sent_at: new Date().toISOString(),
      });

      // Send email
      await resend.emails.send({
        from: 'Curio <hello@choosecurio.com>',
        to: email.trim().toLowerCase(),
        bcc: ['raymondckearney@gmail.com'],
        subject: 'Your MindPrint™ Assessment Link',
        text: body,
        html: buildEmailHtml(body),
      });

      results.push({ email, token: tok.token, url });
    }

    return res.status(200).json({ sent: results.length, results });
  } catch (err) {
    console.error('[portal/send-token]', err);
    return res.status(500).json({ error: err.message });
  }
}

function buildEmailHtml(text) {
  const bodyHtml = text
    .split(/\n\n+/)
    .map(para => {
      const escaped = para.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const linked = escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#059669;font-weight:600">$1</a>');
      return `<p style="margin:0 0 16px;line-height:1.7;color:#0F172A">${linked.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head><style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap');</style></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
}
