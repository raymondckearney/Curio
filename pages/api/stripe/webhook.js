import Stripe from 'stripe';
import { Resend } from 'resend';
import { dbInsert, dbPatch, dbGet, dbQuery } from '../../../lib/supabase';
import { getEmailTemplate, renderTemplate } from '../../../lib/emailTemplates';

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
      ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin-bottom:24px"><p style="margin:0 0 6px;font-weight:600;color:#065F46;font-size:0.9rem">AI Tools included with your purchase</p><p style="margin:0;line-height:1.6;color:#047857;font-size:0.875rem">Once you've completed your assessment and created your account, you'll have access to the Role Alignment Analyzer, Job Description Analyzer, Career Guidance, and your profile-matched AI Companion.</p></div>`
      : `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin-bottom:24px"><p style="margin:0 0 6px;font-weight:600;color:#065F46;font-size:0.9rem">Library &amp; Insights included</p><p style="margin:0;line-height:1.6;color:#047857;font-size:0.875rem">Once you've completed your assessment, you'll have access to your tertiary support library and a curated feed of insights in your dashboard.</p></div>`;
    const tpl = await getEmailTemplate('buyer_confirmation');
    const html = renderTemplate(tpl.html_body, { name: name || 'there', assessmentUrl, includedNote });
    resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: email,
      subject: tpl.subject,
      html,
    }).catch(err => console.error('[stripe/webhook] buyer email failed:', err));
  }

  // ── Step 5: Internal notification email ───────────────────────────────────
  if (resend) {
    const productLabel = isCombo ? 'Assessment + AI Tools' : 'Assessment';
    const internalTpl = await getEmailTemplate('internal_purchase');
    const internalHtml = renderTemplate(internalTpl.html_body, {
      name: name || '—', email: email || '—', productLabel,
      amountPaid: `$${amountPaid.toFixed(2)}`, engagementId,
      grantedTools: grantedTools.join(', '), assessmentUrl,
      time: `${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`,
    });
    const internalSubject = renderTemplate(internalTpl.subject, { productLabel, name: name || '—' });
    resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: 'hello@choosecurio.com',
      subject: internalSubject,
      html: internalHtml,
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
      const { getEmailTemplate: getTpl, renderTemplate: render } = await import('../../../lib/emailTemplates');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const newExpiryDate = new Date(newExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const tpl = await getTpl('renewal_confirmation');
      resend.emails.send({
        from: 'Curio <hello@choosecurio.com>',
        to: buyer_email,
        subject: tpl.subject,
        html: render(tpl.html_body, { name: buyer_name || 'there', newExpiryDate }),
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
