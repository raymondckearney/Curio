import { Resend } from 'resend';
import { getAdminSession } from '../../../lib/adminSession';

const PRIMARY_COLOR = { WHY: '#059669', WHAT: '#2563EB', HOW: '#D97706' };
function profileColor(id) { return PRIMARY_COLOR[id?.split('-')[0]] || '#64748B'; }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  const { participant_name, participant_email, report_row, email_subject, email_body } = req.body;
  if (!participant_email || !report_row) {
    return res.status(400).json({ error: 'participant_email and report_row are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const name = participant_name || 'there';
  const { profile, career_level, role_orientation, report_data } = report_row;
  const color = profileColor(profile);
  const subject = email_subject || `Your Career Guidance Report — ${profile}`;
  const body = email_body || buildDefaultBody(name, profile, career_level, role_orientation);

  try {
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: participant_email,
      bcc: ['raymondckearney@gmail.com'],
      subject,
      html: buildEmailHtml(name, profile, color, career_level, role_orientation, report_data, body),
    });
  } catch (err) {
    console.error('[send-career-report] resend failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }

  console.log(`[send-career-report] sent ${profile} report to ${participant_email}`);
  return res.status(200).json({ success: true });
}

function buildDefaultBody(name, profile, careerLevel, roleOrientation) {
  return `Hi ${name},

Your MindPrint™ Career Guidance Report is ready. Based on your ${profile} profile and your background as ${careerLevel} — ${roleOrientation}, we've identified the roles most likely to energize you and where you'll naturally excel.

Please find your personalized report below.

Curio`;
}

function buildEmailHtml(name, profile, color, careerLevel, roleOrientation, report, bodyText) {
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const { energizers = [], watchFors = [], roles = [], environmentNote, nextSteps = [] } = report || {};

  const bodyParagraphs = bodyText.split('\n\n').map(p => `<p style="margin:0 0 14px;line-height:1.75;color:#374151">${esc(p)}</p>`).join('');

  const roleRows = roles.slice(0, 7).map((role, i) => `
    <div style="border:1px solid #E2E8F0;border-radius:8px;padding:16px 20px;margin-bottom:10px">
      <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${esc(color)};margin-bottom:3px">Role ${i + 1}${role.fitScore ? ` · ${role.fitScore}% ${esc(role.fitLabel || '')}` : ''}</div>
      <div style="font-family:'Caveat',cursive;font-size:1.2rem;font-weight:700;color:#0F172A;margin-bottom:8px">${esc(role.title)}</div>
      ${role.fit ? role.fit.split('\n\n').map(p => `<p style="font-size:0.875rem;color:#374151;line-height:1.7;margin:0 0 8px">${esc(p)}</p>`).join('') : ''}
    </div>`).join('');

  const energizerItems = energizers.map(e => `<li style="margin-bottom:6px;color:#374151;line-height:1.6">${esc(e)}</li>`).join('');
  const watchForItems = watchFors.map(w => `<li style="margin-bottom:6px;color:#64748B;line-height:1.6">${esc(w)}</li>`).join('');
  const nextStepItems = nextSteps.map(s => `<li style="margin-bottom:8px;color:#374151;line-height:1.6">${esc(s)}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
    </div>

    <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none">
      ${bodyParagraphs}

      <div style="background:#0F172A;border-left:4px solid ${esc(color)};border-radius:8px;padding:20px 24px;margin:24px 0">
        <div style="font-family:'Caveat',cursive;font-size:2rem;font-weight:700;color:${esc(color)};line-height:1;margin-bottom:4px">${esc(profile)}</div>
        <div style="font-size:0.8rem;color:rgba(255,255,255,0.5)">${esc(careerLevel)} · ${esc(roleOrientation)}</div>
        ${energizerItems ? `
        <div style="margin-top:16px">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${esc(color)};margin-bottom:8px">⚡ What Will Energize You</div>
          <ul style="margin:0;padding-left:16px">${energizerItems}</ul>
        </div>` : ''}
        ${watchForItems ? `
        <div style="margin-top:12px">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:8px">◆ Watch For</div>
          <ul style="margin:0;padding-left:16px">${watchForItems}</ul>
        </div>` : ''}
      </div>

      ${roleRows ? `
      <div style="margin-top:24px">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${esc(color)};margin-bottom:12px">Your Best-Fit Roles</div>
        ${roleRows}
      </div>` : ''}

      ${nextStepItems ? `
      <div style="margin-top:24px;padding:16px 20px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${esc(color)};margin-bottom:10px">What To Do Next</div>
        <ul style="margin:0;padding-left:16px">${nextStepItems}</ul>
      </div>` : ''}

      <p style="margin:28px 0 0;font-size:0.85rem;color:#64748B;line-height:1.6">
        <span style="color:#059669;font-weight:600">Curio</span> · MindPrint™ Career Guidance
      </p>
    </div>
  </div>
</body>
</html>`;
}
