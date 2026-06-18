import { Resend } from 'resend';
import { getAdminSession } from '../../../lib/adminSession';
import fs from 'fs';
import path from 'path';

const PDF_FILES = {
  'WHY-WHAT': 'MindPrint_Profile_WHY_WHAT.pdf',
  'WHY-HOW':  'MindPrint_Profile_WHY_HOW.pdf',
  'WHAT-WHY': 'MindPrint_Profile_WHAT_WHY.pdf',
  'WHAT-HOW': 'MindPrint_Profile_WHAT_HOW.pdf',
  'HOW-WHY':  'MindPrint_Profile_HOW_WHY.pdf',
  'HOW-WHAT': 'MindPrint_Profile_HOW_WHAT.pdf',
};

const PROFILE_DESCRIPTIONS = {
  'WHY-WHAT': 'You come into a situation, quickly visualize an ideal state, and articulate the steps to get there. You\'re great at identifying opportunities just out of reach and plotting a path forward. You question the status quo and move with clarity of purpose.',
  'WHY-HOW':  'You look for patterns, insights, and structure to understand the world. You\'re a systems thinker who sees the complex nuances of the smallest parts while understanding how they make the whole function. You have a vision and can see exactly what needs to come together to achieve it.',
  'WHAT-WHY': 'You value intuition and move forward with purpose. You\'re equally concerned about the journey as the destination, and you\'re a natural motivator who rallies others around action. You recognize achievement in milestones and tangible results, not just daily tasks.',
  'WHAT-HOW': 'You\'re driven by action and iterate to find the best solution. You\'re comfortable diving into the deepest details then quickly returning to the high-level view. You can intuit a direction, lay out a plan, and hold all the moving parts in mind simultaneously.',
  'HOW-WHY':  'You seek to deeply understand the world around you — how things work and why they operate the way they do. You learn by tinkering and leverage that understanding to make meaningful improvements. You\'re constantly imagining better ways to use time, space, and energy.',
  'HOW-WHAT': 'You understand all the details, are comfortable with complexity, and know how to organize work to keep it moving. You place heavy emphasis on how work gets done, and you can visualize a system, predict where it might break down, and address issues before they happen.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  const { participant_name, participant_email, profile } = req.body;
  if (!participant_email || !profile) {
    return res.status(400).json({ error: 'participant_email and profile are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const profileKey = String(profile).toUpperCase();
  const pdfFilename = PDF_FILES[profileKey];
  if (!pdfFilename) {
    return res.status(400).json({ error: `Unknown profile: ${profile}` });
  }

  const description = PROFILE_DESCRIPTIONS[profileKey];
  const name = participant_name || 'there';

  const pdfPath = path.join(process.cwd(), 'public', 'profiles', pdfFilename);
  let pdfBase64;
  try {
    pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
  } catch (e) {
    console.error('[send-profile] PDF not found:', pdfPath);
    return res.status(500).json({ error: `Profile PDF not found: ${pdfFilename}` });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: participant_email,
      bcc: ['raymondckearney@gmail.com'],
      subject: `Your MindPrint™ Profile — ${profileKey}`,
      html: buildProfileHtml(name, profileKey, description),
      attachments: [{ filename: pdfFilename, content: pdfBase64 }],
    });
  } catch (err) {
    console.error('[send-profile] resend failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }

  console.log(`[send-profile] sent ${profileKey} to ${participant_email}`);
  return res.status(200).json({ success: true });
}

function buildProfileHtml(name, profile, description) {
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
      <p style="margin:0 0 16px;line-height:1.7;color:#0F172A">Hi ${name},</p>
      <p style="margin:0 0 24px;line-height:1.7;color:#0F172A">Your MindPrint™ Profile is ready. Here's what it tells us about how you think and work.</p>

      <div style="background:#F0FDF4;border-left:4px solid #059669;padding:20px 24px;margin:0 0 24px;border-radius:0 8px 8px 0">
        <div style="font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#059669;margin-bottom:6px">Your MindPrint™ Profile</div>
        <div style="font-family:'Caveat',cursive;font-size:2.2rem;font-weight:700;color:#059669;letter-spacing:0.04em;line-height:1">${profile}</div>
      </div>

      <p style="margin:0 0 32px;line-height:1.8;color:#374151">${description}</p>

      <p style="margin:0 0 32px;line-height:1.7;color:#0F172A">Your full profile report is attached to this email.</p>

      <p style="margin:0;line-height:1.6;color:#64748B;font-size:0.9rem">
        <span style="color:#059669;font-weight:600">Curio</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
