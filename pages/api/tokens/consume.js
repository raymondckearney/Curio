import { Resend } from 'resend';
import { dbGet, dbPatch } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, result_payload } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'token is required' });

  const rows = await dbGet('tokens', { token });
  if (!rows.length) return res.status(200).json({ success: false, status: 'not_found' });

  const row = rows[0];
  if (row.used) return res.status(200).json({ success: false, status: 'already_used' });

  const usedAt = new Date().toISOString();
  await dbPatch('tokens', { token }, {
    used: true,
    used_at: usedAt,
    result_payload: result_payload ?? null,
  });

  // Non-blocking notification email
  sendNotification({ row, result_payload, usedAt }).catch(err =>
    console.error('[consume] email notification failed:', err)
  );

  return res.status(200).json({ success: true });
}

async function sendNotification({ row, result_payload, usedAt }) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const name = row.name || 'Unknown';
  const profileType = result_payload?.type || result_payload || '—';
  const completedAt = new Date(usedAt).toLocaleString('en-US', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York',
  });

  await resend.emails.send({
    from: 'Curio <notifications@choosecurio.com>',
    to: 'raymondckearney@gmail.com',
    subject: `MindPrint™ Assessment Completed — ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0F172A">
        <h2 style="margin-bottom:4px">MindPrint™ Assessment Completed</h2>
        <p style="color:#64748B;margin-top:0">A participant has finished their assessment.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:0.95rem">
          <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B;width:40%">Participant</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600">${name}</td></tr>
          ${row.email ? `<tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Email</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${row.email}</td></tr>` : ''}
          <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Engagement</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${row.engagement_id || '—'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">MindPrint™ Profile</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600;text-transform:uppercase;color:#059669">${profileType}</td></tr>
          <tr><td style="padding:10px 0;color:#64748B">Completed</td><td style="padding:10px 0">${completedAt} ET</td></tr>
        </table>
        <a href="https://www.choosecurio.com/admin/tokens" style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:0.9rem">View Engagement Status →</a>
      </div>
    `,
  });
}
