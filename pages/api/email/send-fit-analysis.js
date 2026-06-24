import { Resend } from 'resend';
import { getAdminSession } from '../../../lib/adminSession';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  const { participant_name, participant_email, profile_type, role, result, email_subject, email_body } = req.body;
  if (!participant_email || !role || !result) {
    return res.status(400).json({ error: 'participant_email, role, and result are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const name = participant_name || 'there';
  const subject = email_subject || `Your MindPrint™ Role Fit Analysis — ${role}`;
  const bodyText = email_body || buildDefaultBody(name, role, result);

  let pdfAttachment;
  try {
    const pdfBuffer = await generatePDF(name, profile_type, role, result);
    pdfAttachment = {
      filename: `role-fit-analysis-${role.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}.pdf`,
      content: pdfBuffer,
    };
  } catch (err) {
    console.error('[send-fit-analysis] PDF generation failed:', err);
  }

  try {
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: participant_email,
      bcc: ['raymondckearney@gmail.com'],
      subject,
      html: buildEmailHtml(bodyText),
      attachments: pdfAttachment ? [pdfAttachment] : [],
    });
  } catch (err) {
    console.error('[send-fit-analysis] resend failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }

  console.log(`[send-fit-analysis] sent to ${participant_email}`);
  return res.status(200).json({ success: true });
}

function buildDefaultBody(name, role, result) {
  const pct = Math.round(result.score || 0);
  const label = pct >= 75 ? 'Strong Fit' : pct >= 60 ? 'Good Fit' : pct >= 40 ? 'Partial Fit' : pct >= 20 ? 'Poor Fit' : 'Severe Mismatch';
  return `Hi ${name},

Attached is your MindPrint™ Role Fit Analysis for the ${role} position.

The Role Fit Analysis evaluates how well your natural cognitive profile (the way you're wired to think, prioritize, and approach problems) aligns with the demands of a specific role. Rather than assessing your skills or experience, it identifies whether the type of thinking the role requires will energize or drain you. It also provides strategies for how to address aspects of the role that are not naturally aligned to your profile.

Attached you'll find:
• Your fit score for the ${role} role (${pct}% — ${label})
• What aspects of the role you're likely to enjoy and excel at
• Areas where you may face more friction or drain
• Specific recommendations for setting yourself up for success

If you have any questions about your results, please don't hesitate to reach out.

Curio`;
}

function buildEmailHtml(bodyText) {
  const esc = v => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = bodyText.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br>';
    if (trimmed.startsWith('•')) {
      return `<div style="display:flex;gap:8px;align-items:flex-start;margin:4px 0"><span style="color:#059669;font-weight:700;flex-shrink:0">•</span><span>${esc(trimmed.slice(1).trim())}</span></div>`;
    }
    return `<p style="margin:0 0 4px">${esc(trimmed)}</p>`;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:22px 30px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">
        Curio<span style="color:#059669">.</span>
      </span>
    </div>
    <div style="background:#fff;padding:30px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px;font-size:0.9rem;color:#374151;line-height:1.75">
      ${lines.join('\n      ')}
    </div>
  </div>
</body>
</html>`;
}

async function generatePDF(name, profileType, role, result) {
  const PDFDocument = (await import('pdfkit')).default;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { score, demandSplit, scoreRationale, enjoys, excels, dislikes, struggles, recommendations } = result;
    const pct = Math.round(score || 0);
    const scoreLabel = pct >= 75 ? 'Strong Fit' : pct >= 60 ? 'Good Fit' : pct >= 40 ? 'Partial Fit' : pct >= 20 ? 'Poor Fit' : 'Severe Mismatch';
    const scoreHex = pct >= 75 ? '#059669' : pct >= 60 ? '#10B981' : pct >= 40 ? '#D97706' : '#EF4444';
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const typeTaglines = {
      'WHY-WHAT': 'Purpose-driven, progress-oriented',
      'WHY-HOW':  'Purpose-driven, precision-oriented',
      'WHAT-WHY': 'Progress-driven, purpose-oriented',
      'WHAT-HOW': 'Progress-driven, precision-oriented',
      'HOW-WHY':  'Precision-driven, purpose-oriented',
      'HOW-WHAT': 'Precision-driven, progress-oriented',
    };
    const tagline = typeTaglines[profileType] || '';
    const pageW = doc.page.width - 90;

    // ── Header ───────────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0F172A').text('Curio.', 45, 45);
    doc.font('Helvetica').fontSize(8).fillColor('#78716C')
      .text('Role Alignment Analysis', 45, 48, { align: 'right', width: pageW });
    doc.font('Helvetica').fontSize(7.5).fillColor('#A8A29E')
      .text(today, 45, 58, { align: 'right', width: pageW });
    const ruleY = 76;
    doc.moveTo(45, ruleY).lineTo(45 + pageW, ruleY).strokeColor('#059669').lineWidth(2).stroke();
    doc.y = ruleY + 14;

    // ── Participant name ──────────────────────────────────────────────────────
    if (name && name !== 'there') {
      doc.font('Helvetica-Bold').fontSize(17).fillColor('#0F172A').text(name, 45);
      doc.moveDown(0.25);
    }

    // ── Profile type + role ───────────────────────────────────────────────────
    const profileLine = [profileType, tagline].filter(Boolean).join(' · ');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#059669')
      .text(profileLine.toUpperCase(), 45, doc.y, { characterSpacing: 0.4 });
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#0F172A').text(role, 45);
    doc.moveDown(0.4);

    // ── Score ─────────────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(34).fillColor(scoreHex).text(`${pct}%`, 45, doc.y, { continued: true });
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#374151').text(`  ${scoreLabel}`, { continued: false });
    doc.moveDown(0.15);
    if (scoreRationale) {
      doc.font('Helvetica').fontSize(9).fillColor('#57534E')
        .text(scoreRationale, 45, doc.y, { lineGap: 1.5, width: pageW });
    }
    doc.moveDown(0.6);

    // ── Demand split bar ──────────────────────────────────────────────────────
    if (demandSplit) {
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#374151')
        .text('ROLE DEMAND PROFILE', 45, doc.y, { characterSpacing: 0.5 });
      doc.moveDown(0.2);
      const barY = doc.y;
      const barH = 18;
      const segments = [
        { pct: demandSplit.why  || 0, label: 'WHY',  color: '#10B981' },
        { pct: demandSplit.what || 0, label: 'WHAT', color: '#3B82F6' },
        { pct: demandSplit.how  || 0, label: 'HOW',  color: '#D97706' },
      ];
      let x = 45;
      for (const seg of segments) {
        if (seg.pct <= 0) continue;
        const w = pageW * (seg.pct / 100);
        doc.rect(x, barY, w, barH).fill(seg.color);
        if (w > 28) {
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#fff')
            .text(`${seg.label} ${seg.pct}%`, x + 4, barY + 5, { width: w - 8, lineBreak: false });
        }
        x += w;
      }
      doc.y = barY + barH + 10;
    }

    // ── Bullet section helper ─────────────────────────────────────────────────
    function section(title, items, dotColor) {
      if (!items || !items.length) return;
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(7).fillColor(dotColor)
        .text(title, 45, doc.y, { characterSpacing: 0.5 });
      doc.moveDown(0.2);
      for (const item of items) {
        const ty = doc.y;
        doc.circle(51, ty + 3.5, 2).fill(dotColor);
        doc.font('Helvetica').fontSize(8.5).fillColor('#374151')
          .text(item, 60, ty, { width: pageW - 15, lineGap: 1 });
        doc.moveDown(0.05);
      }
    }

    section('LIKELY ENJOYS', enjoys, '#059669');
    section('LIKELY EXCELS AT', excels, '#059669');
    section('MAY STRUGGLE WITH', [...(dislikes || []), ...(struggles || [])], '#A8A29E');

    // ── Recommendations ───────────────────────────────────────────────────────
    if (recommendations && recommendations.length) {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#374151')
        .text('RECOMMENDATIONS', 45, doc.y, { characterSpacing: 0.5 });
      doc.moveDown(0.25);
      for (const rec of recommendations) {
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#059669')
          .text((rec.category || '').toUpperCase(), 45, doc.y, { characterSpacing: 0.4 });
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#0F172A')
          .text(rec.action || '', 45, doc.y, { width: pageW });
        if (rec.rationale) {
          doc.font('Helvetica').fontSize(8).fillColor('#78716C')
            .text(rec.rationale, 45, doc.y, { width: pageW, lineGap: 1 });
        }
        doc.moveDown(0.35);
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 40;
    doc.moveTo(45, footerY - 7).lineTo(45 + pageW, footerY - 7)
      .strokeColor('#E2E8F0').lineWidth(0.5).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A')
      .text('Curio.', 45, footerY, { continued: true });
    doc.font('Helvetica').fontSize(7).fillColor('#A8A29E')
      .text(`  MindPrint Framework™ · choosecurio.com · Generated ${today}`, { lineBreak: false });

    doc.end();
  });
}
