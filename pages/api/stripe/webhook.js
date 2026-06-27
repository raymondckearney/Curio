import Stripe from 'stripe';
import { Resend } from 'resend';
import { dbInsert, dbPatch } from '../../../lib/supabase';

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
  const { buyer_name: name, buyer_email: email, product } = session.metadata || {};
  const amountPaid = (session.amount_total || 0) / 100;
  const engagementId = `self-serve-${Date.now()}`;
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const baseUrl = 'https://choosecurio.com';

  // ── Step 1: Determine tokens to generate ──────────────────────────────────
  const tokenDefs =
    product === 'assessment_analyzer'
      ? [{ purpose: 'assessment' }, { purpose: 'fit' }]
      : [{ purpose: 'assessment' }];

  // ── Step 2: Generate tokens ───────────────────────────────────────────────
  let tokens = [];
  try {
    const rows = tokenDefs.map(({ purpose }) => ({
      token: crypto.randomUUID(),
      name: name || '',
      email: email || null,
      purpose,
      engagement_id: engagementId,
      expires_at: expiresAt,
      used: false,
    }));
    tokens = await dbInsert('tokens', rows);
    // Mark as link sent immediately since we're emailing them
    const sentAt = new Date().toISOString();
    await Promise.all(tokens.map(t => dbPatch('tokens', { token: t.token }, { link_sent_at: sentAt })));
  } catch (err) {
    console.error('[stripe/webhook] token generation failed:', err);
  }

  const tokenUrls = tokens.map(t => ({ purpose: t.purpose, url: `${baseUrl}/go/${t.token}` }));
  const assessmentUrl = tokenUrls.find(t => t.purpose === 'assessment')?.url;
  const analyzerUrl = tokenUrls.find(t => t.purpose === 'fit')?.url;

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
    const isCombo = product === 'assessment_analyzer';
    const tokenSection = isCombo
      ? `
        <p style="font-weight:600;margin:0 0 8px">MindPrint™ Assessment</p>
        <a href="${assessmentUrl}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px">Start Assessment →</a>
        <p style="font-weight:600;margin:0 0 8px">Role Analyzer Access</p>
        <a href="${analyzerUrl}" style="display:inline-block;padding:12px 24px;background:#0F172A;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px">Open Role Analyzer →</a>
      `
      : `
        <p style="font-weight:600;margin:0 0 8px">MindPrint™ Assessment</p>
        <a href="${assessmentUrl}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px">Start Assessment →</a>
      `;

    resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: email,
      subject: 'Your MindPrint™ access is ready',
      html: `<!DOCTYPE html><html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#0F172A;padding:24px 32px">
    <span style="font-family:Georgia,serif;font-size:1.8rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px;line-height:1.7;color:#0F172A">Hi ${name || 'there'},</p>
    <p style="margin:0 0 24px;line-height:1.7;color:#0F172A">Thank you for your purchase. Your personal assessment link is ready below.</p>
    ${tokenSection}
    <p style="margin:0 0 16px;line-height:1.7;color:#64748B;font-size:0.9rem">Each link is unique to you and can only be used once. The assessment takes approximately 10 minutes to complete.</p>
    <p style="margin:0 0 16px;line-height:1.7;color:#64748B;font-size:0.9rem">Once you've completed the assessment, your full MindPrint™ profile report will be delivered to this email address.</p>
    <p style="margin:0;line-height:1.7;color:#0F172A">Ray Kearney<br>Curio<br><a href="mailto:hello@choosecurio.com" style="color:#059669">hello@choosecurio.com</a></p>
  </div>
</div>
</body></html>`,
    }).catch(err => console.error('[stripe/webhook] buyer email failed:', err));
  }

  // ── Step 5: Internal notification email ───────────────────────────────────
  if (resend) {
    const productLabel = product === 'assessment_analyzer' ? 'Assessment + Analyzer' : 'Assessment';
    const urlList = tokenUrls.map(t => `${t.purpose}: ${t.url}`).join('\n');
    resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: 'hello@choosecurio.com',
      subject: `New Purchase — ${productLabel} — ${name}`,
      text: `A new purchase has been completed.\n\nBuyer: ${name}\nEmail: ${email}\nProduct: ${productLabel}\nAmount: $${amountPaid.toFixed(2)}\nEngagement ID: ${engagementId}\nTokens generated:\n${urlList}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n\nView in admin: https://choosecurio.com/admin/tokens`,
    }).catch(err => console.error('[stripe/webhook] notification email failed:', err));
  }

  // ── Step 6: Notion Pipeline entry ─────────────────────────────────────────
  if (process.env.NOTION_API_KEY) {
    createNotionPipelineEntry({ name, email, product, amountPaid, engagementId })
      .catch(err => console.error('[stripe/webhook] notion pipeline failed:', err));
  }

  return res.status(200).json({ received: true });
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
