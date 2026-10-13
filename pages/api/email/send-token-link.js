import { Resend } from 'resend';
import { dbGet, dbPatch } from '../../../lib/supabase';
import { setContactLinkSent } from '../../../lib/notion';
import { getAdminSession } from '../../../lib/adminSession';
import { parseSendAt, cancelScheduled } from '../../../lib/scheduledLinks';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  // sendAt (optional, ISO time): schedule the email instead of sending now.
  // Resend holds it and sends it at that time (lib/scheduledLinks.js).
  const { token, to, subject, message, participantEmail, purpose, sendAt } = req.body;
  if (!token || !to || !subject || !message) {
    return res.status(400).json({ error: 'token, to, subject, and message are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const when = parseSendAt(sendAt);
  if (when.error) return res.status(400).json({ error: when.error });

  // A new send or schedule replaces any email still waiting to go out for
  // this token, so the person never gets two.
  try {
    const [existing] = await dbGet('tokens', { token });
    if (existing?.scheduled_email_id) await cancelScheduled(existing);
  } catch (err) {
    console.error('[send-token-link] cancel previous schedule failed:', err);
    return res.status(500).json({ error: `This token already has a scheduled email that could not be cancelled: ${err.message}` });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  let emailId = null;
  try {
    const { data, error } = await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to,
      bcc: ['raymondckearney@gmail.com'],
      subject,
      text: message,
      html: buildEmailHtml(message, purpose),
      ...(when.at ? { scheduledAt: when.at.toISOString() } : {}),
    });
    if (error) throw new Error(error.message || 'Failed to send email');
    emailId = data?.id || null;
  } catch (err) {
    console.error('[send-token-link] resend failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }

  if (when.at) {
    try {
      await dbPatch('tokens', { token }, { link_scheduled_for: when.at.toISOString(), scheduled_email_id: emailId });
    } catch (err) {
      // The email is scheduled at Resend either way; only the admin view
      // would miss it, so say so rather than fail.
      console.error('[send-token-link] supabase update failed:', err);
      return res.status(200).json({ success: true, scheduled: true, scheduledFor: when.at.toISOString(), warning: 'Scheduled, but the token could not be marked. Run migration 0015 if you have not.' });
    }
    return res.status(200).json({ success: true, scheduled: true, scheduledFor: when.at.toISOString() });
  }

  try {
    await dbPatch('tokens', { token }, { link_sent_at: new Date().toISOString() });
  } catch (err) {
    console.error('[send-token-link] supabase update failed:', err);
  }

  setContactLinkSent({ email: participantEmail }).catch(err =>
    console.error('[send-token-link] notion update failed:', err)
  );

  return res.status(200).json({ success: true });
}

function buildEmailHtml(text, purpose) {
  const buttonLabel = purpose === 'career' ? 'Access Your Career Guidance Tool' : 'Start Your Assessment';
  const bodyHtml = text
    .split(/\n\n+/)
    .map(para => {
      // A paragraph that's just a bare URL renders as a button; a URL mixed
      // into other text stays an inline link, since a button can't sit
      // mid-sentence.
      if (/^https?:\/\/\S+$/.test(para.trim())) {
        const url = para.trim();
        return `<p style="margin:0 0 16px"><a href="${url}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">${buttonLabel} &rarr;</a></p>`;
      }
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
  <style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap');</style>
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
