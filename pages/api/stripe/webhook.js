import Stripe from 'stripe';
import { Resend } from 'resend';
import { dbInsert, dbPatch, dbGet, dbQuery } from '../../../lib/supabase';

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;

  if (session.metadata?.purpose === 'renewal') {
    return handleRenewal(session, res);
  }

  const { buyer_name: name, buyer_email: email, product } = session.metadata || {};
  const amountPaid = (session.amount_total || 0) / 100;
  const engagementId = `self-serve-${Date.now()}`;
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const baseUrl = 'https://choosecurio.com';

  // ── Step 1: Determine tier and tools to grant ─────────────────────────────
  const isCombo = product === 'assessment_analyzer';
  const grantedTier = isCombo ? 'premium' : 'basic';
  const grantedTools = isCombo
    ? ['assessment_tokens', 'library_match', 'role_analyzer', 'jd_analyzer', 'career_guidance', 'companion_match']
    : ['assessment_tokens', 'library_match'];

  // ── Step 2: Generate assessment token ────────────────────────────────────
  let tokens = [];
  try {
    const rows = [{
      token: crypto.randomUUID(),
      name: name || '',
      email: email || null,
      purpose: 'assessment',
      granted_tier: grantedTier,
      granted_tools: grantedTools,
      engagement_id: engagementId,
      expires_at: expiresAt,
      used: false,
    }];
    tokens = await dbInsert('tokens', rows);
    const sentAt = new Date().toISOString();
    await Promise.all(tokens.map(t => dbPatch('tokens', { token: t.token }, { link_sent_at: sentAt })));
  } catch (err) {
    console.error('[stripe/webhook] token generation failed:', err);
  }

  const tokenUrls = tokens.map(t => ({ purpose: t.purpose, url: `${baseUrl}/go/${t.token}` }));
  const assessmentUrl = tokenUrls.find(t => t.purpose === 'assessment')?.url;

  // ── Step 3: Store purchase record ─────────────────────────────────────────
  try {
    await dbInsert('purchases', {
      stripe_session_id: session.id,
      buyer_name: name,
      buyer_email: email,
      product,
      amount: amountPaid,
      engagement_id: engagementId,
      token_count: tokens.length,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[stripe/webhook] purchase record failed:', err);
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  // ── Step 4: Buyer confirmation email ─────────────────────────────────────
  if (resend && email) {
    const includedNote = isCombo
      ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0 0 6px;font-weight:600;color:#065F46;font-size:0.9rem">AI Tools included with your purchase</p>
          <p style="margin:0;line-height:1.6;color:#047857;font-size:0.875rem">Once you've completed your assessment and created your account, you'll have access to the Role Alignment Analyzer, JD Analyzer, Career Guidance, and your profile-matched AI Companion.</p>
        </div>`
      : `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0 0 6px;font-weight:600;color:#065F46;font-size:0.9rem">Library &amp; Insights included</p>
          <p style="margin:0;line-height:1.6;color:#047857;font-size:0.875rem">Once you've completed your assessment, you'll have access to your tertiary support library and a curated feed of insights in your dashboard.</p>
        </div>`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#0F172A;padding:24px 32px">
    <span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px">Curio<span style="color:#059669">.</span></span>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px;line-height:1.7;color:#0F172A;font-size:15px">Hi ${name || 'there'},</p>
    <p style="margin:0 0 24px;line-height:1.7;color:#0F172A;font-size:15px">Thank you for your purchase. Your MindPrint™ Assessment link is ready below.</p>
    <p style="font-weight:700;margin:0 0 12px;color:#0F172A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">MindPrint™ Assessment</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr>
        <td style="border-radius:8px;background:#059669">
          <a href="${assessmentUrl}" style="display:inline-block;padding:13px 28px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif">Start Assessment →</a>
        </td>
      </tr>
    </table>
    ${includedNote}
    <p style="margin:0 0 14px;line-height:1.7;color:#64748B;font-size:14px">Your assessment link is unique to you and can only be used once. It takes approximately 10 minutes to complete.</p>
    <p style="margin:0 0 28px;line-height:1.7;color:#64748B;font-size:14px">Once you've completed the assessment, your full MindPrint™ profile report will be delivered to this email address.</p>
    <p style="margin:0;line-height:1.7;color:#0F172A;font-size:15px">Ray Kearney<br>Curio<br><a href="mailto:hello@choosecurio.com" style="color:#059669;text-decoration:none">hello@choosecurio.com</a></p>
  </div>
</div>
</body></html>`;

    resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: email,
      subject: 'Your MindPrint™ access is ready',
      html: emailHtml,
    }).catch(err => console.error('[stripe/webhook] buyer email failed:', err));
  }

  // ── Step 5: Internal notification email ───────────────────────────────────
  if (resend) {
    const productLabel = isCombo ? 'Assessment + AI Tools' : 'Assessment';
    const notifHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#0F172A;padding:24px 32px">
    <span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0F172A">New Purchase</p>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px;width:120px">Buyer</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:600">${name}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Email</td><td style="padding:6px 0;color:#0F172A;font-size:14px">${email}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Product</td><td style="padding:6px 0;color:#0F172A;font-size:14px">${productLabel}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Amount</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:700">$${amountPaid.toFixed(2)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Engagement ID</td><td style="padding:6px 0;color:#0F172A;font-size:14px">${engagementId}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Time</td><td style="padding:6px 0;color:#0F172A;font-size:14px">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td></tr>
    </table>
    <p style="margin:0 0 12px;font-weight:700;color:#0F172A;font-size:14px">Token Generated</p>
    <div style="margin-bottom:12px">
      <p style="margin:0 0 4px;color:#64748B;font-size:13px;text-transform:uppercase;letter-spacing:0.05em">Assessment</p>
      <p style="margin:0 0 8px;color:#475569;font-size:12px">Grants: ${grantedTools.join(', ')}</p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-radius:6px;background:#0F172A">
            <a href="${assessmentUrl}" style="display:inline-block;padding:10px 20px;background:#0F172A;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif">Assessment Link →</a>
          </td>
        </tr>
      </table>
    </div>
    <div style="margin-top:24px;border-top:1px solid #E2E8F0;padding-top:20px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-radius:6px;background:#059669">
            <a href="https://choosecurio.com/admin/tokens" style="display:inline-block;padding:10px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif">View in Admin →</a>
          </td>
        </tr>
      </table>
    </div>
  </div>
</div>
</body></html>`;

    resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: 'hello@choosecurio.com',
      subject: `New Purchase — ${productLabel} — ${name}`,
      html: notifHtml,
    }).catch(err => console.error('[stripe/webhook] notification email failed:', err));
  }

  // ── Step 6: Notion Pipeline entry ─────────────────────────────────────────
  if (process.env.NOTION_API_KEY) {
    createNotionPipelineEntry({ name, email, product, amountPaid, engagementId })
      .catch(err => console.error('[stripe/webhook] notion pipeline failed:', err));
  }

  return res.status(200).json({ received: true });
}

async function handleRenewal(session, res) {
  const { account_id, buyer_name, buyer_email } = session.metadata || {};
  if (!account_id) return res.status(400).json({ error: 'Missing account_id in renewal metadata' });

  try {
    const licenses = await dbGet('account_licenses', { account_id });
    const newExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    await Promise.all(licenses.map(l => {
      const base = l.expires_at ? new Date(l.expires_at) : new Date();
      const extended = new Date(Math.max(base.getTime(), Date.now()) + 365 * 24 * 60 * 60 * 1000).toISOString();
      return dbPatch('account_licenses', { id: l.id }, { expires_at: extended });
    }));

    if (process.env.RESEND_API_KEY && buyer_email) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const newExpiryDate = new Date(newExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      resend.emails.send({
        from: 'Curio <hello@choosecurio.com>',
        to: buyer_email,
        subject: 'Your Curio access has been renewed',
        html: `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#F8FAFC;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#0F172A;padding:24px 32px"><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span></div>
  <div style="padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi ${buyer_name || 'there'},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access has been renewed. Your new expiry date is <strong>${newExpiryDate}</strong>.</p>
    <a href="https://choosecurio.com/portal/dashboard" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Go to Dashboard →</a>
  </div>
</div></body></html>`,
      }).catch(err => console.error('[renewal] confirmation email failed:', err));
    }

    return res.status(200).json({ received: true, renewed: true });
  } catch (err) {
    console.error('[handleRenewal]', err);
    return res.status(500).json({ error: err.message });
  }
}

async function createNotionPipelineEntry({ name, email, product, amountPaid, engagementId }) {
  const PIPELINE_DB = process.env.NOTION_PIPELINE_DB_ID;
  if (!PIPELINE_DB) {
    console.warn('[stripe/webhook] NOTION_PIPELINE_DB_ID not set, skipping pipeline entry');
    return;
  }

  const productLabel = product === 'assessment_analyzer' ? 'Assessment + Analyzer' : 'Assessment';
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: PIPELINE_DB },
      properties: {
        'Name':             { title: [{ text: { content: `Self-Serve Purchase — ${name}` } }] },
        'Primary Contact':  { rich_text: [{ text: { content: name || '' } }] },
        'Stage':            { select: { name: 'Closed Won' } },
        'Entry Point':      { rich_text: [{ text: { content: productLabel } }] },
        'Estimated Value':  { number: amountPaid },
        'Engagement ID':    { rich_text: [{ text: { content: engagementId } }] },
        'Source':           { select: { name: 'Inbound' } },
        'Notes':            { rich_text: [{ text: { content: 'Self-serve purchase via choosecurio.com/buy' } }] },
      },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}
