import { Resend } from 'resend';
import { getAdminSession } from '../../../lib/adminSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  const { participant_name, participant_email, profile_type, role, result } = req.body;
  if (!participant_email || !role || !result) {
    return res.status(400).json({ error: 'participant_email, role, and result are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const name = participant_name || 'there';

  try {
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: participant_email,
      bcc: ['raymondckearney@gmail.com'],
      subject: `Your MindPrint™ Role Fit Analysis — ${role}`,
      html: buildFitHtml(name, profile_type, role, result),
    });
  } catch (err) {
    console.error('[send-fit-analysis] resend failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }

  console.log(`[send-fit-analysis] sent to ${participant_email}`);
  return res.status(200).json({ success: true });
}

function buildFitHtml(name, profileType, role, result) {
  const { score, demandSplit, scoreRationale, enjoys, excels, dislikes, struggles, recommendations, partnerTypes } = result;

  const pct = Math.round(score);
  const scoreColor = pct >= 75 ? '#059669' : pct >= 60 ? '#34D399' : pct >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel = pct >= 75 ? 'Strong fit' : pct >= 60 ? 'Good fit' : pct >= 40 ? 'Partial fit' : pct >= 20 ? 'Poor fit' : 'Severe mismatch';

  const esc = v => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const why = demandSplit?.why ?? 0;
  const what = demandSplit?.what ?? 0;
  const how = demandSplit?.how ?? 0;

  function bulletList(items, dotColor) {
    if (!items || !items.length) return '';
    return items.map(item => `
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
        <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0;margin-top:6px;display:inline-block"></span>
        <span style="color:#374151;font-size:0.9rem;line-height:1.6">${esc(item)}</span>
      </div>`).join('');
  }

  const combineNeg = [...(dislikes || []), ...(struggles || [])];

  const recHtml = (recommendations || []).map((rec, i) => `
    <div style="padding:10px 0;${i > 0 ? 'border-top:1px solid #E2E8F0;' : ''}">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#059669;margin-bottom:2px">${esc(rec.category)}</div>
      <div style="font-weight:700;color:#0F172A;margin-bottom:3px;font-size:0.9rem">${esc(rec.action)}</div>
      <div style="font-size:0.85rem;color:#78716C;line-height:1.55">${esc(rec.rationale)}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:580px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:#0F172A;padding:24px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">
        Curio<span style="color:#059669">.</span>
      </span>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">

      <p style="margin:0 0 20px;line-height:1.7;color:#0F172A;font-size:0.95rem">Hi ${esc(name)},</p>

      <!-- Score block -->
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid ${scoreColor};border-radius:8px;padding:20px 24px;margin-bottom:24px">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#78716C;margin-bottom:6px">${esc(profileType || '')} &middot; Role Fit</div>
        <div style="font-size:0.85rem;font-weight:600;color:#374151;margin-bottom:8px">${esc(role)}</div>
        <div style="font-family:'Caveat',cursive;font-size:2.8rem;font-weight:700;color:${scoreColor};line-height:1">${pct}%</div>
        <div style="display:inline-block;margin-top:6px;padding:3px 12px;border-radius:100px;background:${scoreColor}1a;border:1px solid ${scoreColor}4d;color:${scoreColor};font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">${scoreLabel}</div>
        ${scoreRationale ? `<p style="margin:12px 0 0;line-height:1.7;color:#57534E;font-size:0.875rem">${esc(scoreRationale)}</p>` : ''}
      </div>

      <!-- WHY / WHAT / HOW demand bar -->
      <div style="margin-bottom:24px">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#374151;margin-bottom:8px">Role Demand Profile</div>
        <table style="width:100%;border-collapse:collapse;border-radius:6px;overflow:hidden" cellspacing="0" cellpadding="0">
          <tr>
            ${why > 0 ? `<td style="width:${why}%;background:#10B981;padding:8px 0;text-align:center">
              <div style="font-size:0.7rem;font-weight:700;color:#fff;letter-spacing:0.1em">WHY</div>
              <div style="font-size:0.85rem;font-weight:700;color:#fff">${why}%</div>
            </td>` : ''}
            ${what > 0 ? `<td style="width:${what}%;background:#3B82F6;padding:8px 0;text-align:center">
              <div style="font-size:0.7rem;font-weight:700;color:#fff;letter-spacing:0.1em">WHAT</div>
              <div style="font-size:0.85rem;font-weight:700;color:#fff">${what}%</div>
            </td>` : ''}
            ${how > 0 ? `<td style="width:${how}%;background:#D97706;padding:8px 0;text-align:center">
              <div style="font-size:0.7rem;font-weight:700;color:#fff;letter-spacing:0.1em">HOW</div>
              <div style="font-size:0.85rem;font-weight:700;color:#fff">${how}%</div>
            </td>` : ''}
          </tr>
        </table>
      </div>

      <!-- Enjoys -->
      ${enjoys && enjoys.length ? `
      <div style="margin-bottom:20px">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#059669;margin-bottom:8px">Likely enjoys</div>
        ${bulletList(enjoys, '#059669')}
      </div>` : ''}

      <!-- Excels -->
      ${excels && excels.length ? `
      <div style="margin-bottom:20px">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#059669;margin-bottom:8px">Likely excels at</div>
        ${bulletList(excels, '#059669')}
      </div>` : ''}

      <!-- Struggles (combined dislikes + struggles) -->
      ${combineNeg.length ? `
      <div style="margin-bottom:20px">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#78716C;margin-bottom:8px">May struggle with</div>
        ${bulletList(combineNeg, '#A8A29E')}
      </div>` : ''}

      <!-- Recommendations -->
      ${recommendations && recommendations.length ? `
      <div style="margin-bottom:24px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px 20px">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#374151;margin-bottom:8px">Recommendations</div>
        ${recHtml}
      </div>` : ''}

      <!-- Sign off -->
      <p style="margin:24px 0 0;line-height:1.6;color:#64748B;font-size:0.9rem">
        <span style="color:#059669;font-weight:600">Curio</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
