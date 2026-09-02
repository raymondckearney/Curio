import { dbQuery, dbInsert, dbPatch } from './supabase';
import { Resend } from 'resend';

const EMAIL_HEADER = `<div style="background:#0F172A;padding:24px 32px"><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px">Curio<span style="color:#059669">.</span></span></div>`;
const EMAIL_FOOTER = `<p style="margin:24px 0 0;color:#64748B;font-size:14px">Questions? Reply to this email or contact <a href="mailto:hello@choosecurio.com" style="color:#059669;text-decoration:none">hello@choosecurio.com</a>.</p>`;

function emailWrap(body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  ${EMAIL_HEADER}
  <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    ${body}
  </div>
</div>
</body></html>`;
}

// Trigger keys and their display labels
export const TRIGGER_OPTIONS = [
  { key: 'stripe_purchase',      label: 'Stripe purchase completed' },
  { key: 'renewal_complete',     label: 'Renewal payment completed' },
  { key: 'self_serve_signup',    label: 'Self-serve account signup' },
  { key: 'admin_invite',         label: 'Admin account invitation' },
  { key: 'assessment_complete',  label: 'Assessment completed' },
  { key: 'cron_30_day_expiry',   label: 'Cron — 30 days before expiry' },
  { key: 'cron_expiry_day',      label: 'Cron — expiry day' },
  { key: 'cron_daily',           label: 'Cron — daily (custom condition)' },
  { key: 'manual',               label: 'Manual only' },
];

// Variables available in each trigger's context — used by the admin UI
export const TRIGGER_VARIABLES = {
  stripe_purchase:   ['name', 'buyer_email', 'productLabel', 'amountPaid', 'engagementId', 'grantedTools', 'assessmentUrl', 'time', 'includedNote'],
  renewal_complete:  ['name', 'buyer_email', 'newExpiryDate'],
  self_serve_signup: ['name', 'email', 'loginUrl'],
  admin_invite:      ['name', 'email', 'inviteUrl', 'licenseList'],
  assessment_complete: ['name', 'email', 'profileUrl'],
  cron_30_day_expiry: ['name', 'email', 'expiryDate', 'renewalUrl'],
  cron_expiry_day:   ['name', 'email', 'renewalUrl'],
  cron_daily:        ['name', 'email'],
  manual:            [],
};

export const EMAIL_TEMPLATE_REGISTRY = [
  {
    key: 'buyer_confirmation',
    name: 'Buyer Confirmation',
    description: 'Sent to the buyer immediately after a successful Stripe purchase.',
    recipient: '{{buyer_email}}',
    trigger: 'stripe_purchase',
    trigger_label: 'Stripe purchase completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'buyer_email', 'assessmentUrl', 'includedNote'],
    default_subject: 'Your MindPrint™ access is ready',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;line-height:1.7;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 24px;line-height:1.7;color:#0F172A;font-size:15px">Thank you for your purchase. Your MindPrint™ Assessment link is ready below.</p>
    <p style="font-weight:700;margin:0 0 12px;color:#0F172A;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">MindPrint™ Assessment</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{assessmentUrl}}" style="display:inline-block;padding:13px 28px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif">Start Assessment →</a></td></tr>
    </table>
    {{includedNote}}
    <p style="margin:0 0 14px;line-height:1.7;color:#64748B;font-size:14px">Your assessment link is unique to you and can only be used once. It takes approximately 7-10 minutes to complete.</p>
    <p style="margin:0 0 28px;line-height:1.7;color:#64748B;font-size:14px">Once you've completed the assessment, your full MindPrint™ profile report will be delivered to this email address.</p>
    <p style="margin:0;line-height:1.7;color:#0F172A;font-size:15px">Ray Kearney<br>Curio<br><a href="mailto:hello@choosecurio.com" style="color:#059669;text-decoration:none">hello@choosecurio.com</a></p>`),
  },
  {
    key: 'internal_purchase',
    name: 'Internal Purchase Notification',
    description: 'Internal alert sent to hello@choosecurio.com on every new purchase.',
    recipient: 'hello@choosecurio.com',
    trigger: 'stripe_purchase',
    trigger_label: 'Stripe purchase completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'buyer_email', 'productLabel', 'amountPaid', 'engagementId', 'grantedTools', 'assessmentUrl', 'time'],
    default_subject: 'New Purchase — {{productLabel}} — {{name}}',
    default_html_body: emailWrap(`
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0F172A">New Purchase</p>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px;width:120px">Buyer</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:600">{{name}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Email</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{buyer_email}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Product</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{productLabel}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Amount</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:700">{{amountPaid}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Engagement ID</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{engagementId}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Tools Granted</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{grantedTools}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Time</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{time}}</td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:6px;background:#0F172A"><a href="{{assessmentUrl}}" style="display:inline-block;padding:10px 20px;background:#0F172A;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif">Assessment Link →</a></td></tr>
    </table>
    <div style="border-top:1px solid #E2E8F0;padding-top:20px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-radius:6px;background:#059669"><a href="https://choosecurio.com/admin" style="display:inline-block;padding:10px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif">View in Admin →</a></td></tr>
      </table>
    </div>`),
  },
  {
    key: 'renewal_confirmation',
    name: 'Renewal Confirmation',
    description: 'Sent to the account holder after a successful renewal payment.',
    recipient: '{{buyer_email}}',
    trigger: 'renewal_complete',
    trigger_label: 'Renewal payment completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'buyer_email', 'newExpiryDate'],
    default_subject: 'Your Curio access has been renewed',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access has been renewed. Your new expiry date is <strong>{{newExpiryDate}}</strong>.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="https://choosecurio.com/portal/dashboard" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Go to Dashboard →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
  {
    key: 'new_account',
    name: 'New Account Welcome',
    description: 'Welcome email sent when a self-serve account is created after purchase.',
    recipient: '{{email}}',
    trigger: 'self_serve_signup',
    trigger_label: 'Self-serve account signup',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'email', 'loginUrl'],
    default_subject: 'Welcome to Curio',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;line-height:1.7;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 24px;line-height:1.7;color:#0F172A;font-size:15px">Your Curio account is ready. Log in any time to access your MindPrint™ profile, tools, and resources.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{loginUrl}}" style="display:inline-block;padding:13px 28px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif">Go to Dashboard →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
  {
    key: 'invite_account',
    name: 'Account Invitation',
    description: 'Sent when an admin or owner invites a user to an account.',
    recipient: '{{email}}',
    trigger: 'admin_invite',
    trigger_label: 'Admin account invitation',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'email', 'inviteUrl', 'licenseList'],
    default_subject: "You've been invited to Curio",
    default_html_body: emailWrap(`
    <p style="font-size:1rem;color:#0F172A;font-weight:600;margin:0 0 12px">You're invited to Curio</p>
    <p style="font-size:0.9rem;color:#374151;line-height:1.7;margin:0 0 20px">Ray Kearney has set up a Curio account for you. Click below to set your password and access your profile.</p>
    {{licenseList}}
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{inviteUrl}}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Set Your Password →</a></td></tr>
    </table>
    <p style="font-size:0.8rem;color:#94A3B8;margin:0;line-height:1.6">This link expires in 7 days. If you have any questions, reply to this email.</p>`),
  },
  {
    key: 'assessment_completed',
    name: 'Assessment Completed',
    description: 'Sent to the participant when their assessment results are processed.',
    recipient: '{{email}}',
    trigger: 'assessment_complete',
    trigger_label: 'Assessment completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'email', 'profileUrl'],
    default_subject: 'Your MindPrint™ results are ready',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;line-height:1.7;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 24px;line-height:1.7;color:#0F172A;font-size:15px">Your MindPrint™ assessment is complete. Your full profile and personalized resources are now available in your dashboard.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{profileUrl}}" style="display:inline-block;padding:13px 28px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif">View Your Profile →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
  {
    key: 'renewal_reminder_30',
    name: 'Renewal Reminder — 30 Days',
    description: 'Sent to the primary account user 30 days before their license expires.',
    recipient: '{{email}}',
    trigger: 'cron_30_day_expiry',
    trigger_label: 'Cron — 30 days before expiry',
    schedule: 'Daily cron, 12:00 UTC',
    send_type: 'automated',
    variables: ['name', 'email', 'expiryDate', 'renewalUrl'],
    default_subject: 'Your Curio access expires in 30 days',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access is set to expire on <strong>{{expiryDate}}</strong>. Renew now to keep uninterrupted access to your MindPrint™ tools and resources.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{renewalUrl}}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Renew Access →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
  {
    key: 'renewal_reminder_expired',
    name: 'License Expired Notice',
    description: 'Sent to the primary account user on the day their license expires.',
    recipient: '{{email}}',
    trigger: 'cron_expiry_day',
    trigger_label: 'Cron — expiry day',
    schedule: 'Daily cron, 12:00 UTC',
    send_type: 'automated',
    variables: ['name', 'email', 'renewalUrl'],
    default_subject: 'Your Curio access has expired',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access has expired. Renew to regain access to your MindPrint™ tools and resources.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{renewalUrl}}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Renew Now →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
];

// ── Core helpers ──────────────────────────────────────────────────────────────

// Fetch a single template's subject+body — DB row first, then registry defaults
export async function getEmailTemplate(key) {
  try {
    const rows = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key,subject,html_body,updated_at' });
    if (rows.length && rows[0].html_body) {
      return { subject: rows[0].subject, html_body: rows[0].html_body };
    }
  } catch (_) {}
  const meta = EMAIL_TEMPLATE_REGISTRY.find(t => t.key === key);
  return { subject: meta?.default_subject || null, html_body: meta?.default_html_body || null };
}

// Replace {{variable}} placeholders in a string
export function renderTemplate(html, vars) {
  if (!html) return html;
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`));
}

// Save (upsert) a template's subject+html_body to the DB
export async function saveEmailTemplate(key, subject, html_body) {
  const existing = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key' }).catch(() => []);
  if (existing.length) {
    await dbPatch('email_templates', { key }, { subject, html_body, updated_at: new Date().toISOString() });
  } else {
    await dbInsert('email_templates', { key, subject, html_body, updated_at: new Date().toISOString() });
  }
}

// ── Dispatch engine ────────────────────────────────────────────────────────────
// Fires all templates (built-in + custom) configured for a given trigger.
// `vars` is the context object for {{variable}} substitution, including recipient resolution.
export async function dispatchEmailsForTrigger(triggerKey, vars) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Fetch all DB rows for this trigger in one query
  const dbRows = await dbQuery('email_templates', {
    trigger: `eq.${triggerKey}`,
    select: 'key,recipient,subject,html_body,is_custom',
  }).catch(() => []);

  const dbByKey = {};
  const customRows = [];
  for (const r of dbRows) {
    if (r.is_custom) customRows.push(r);
    else dbByKey[r.key] = r;
  }

  // Built-in templates for this trigger
  const builtInMeta = EMAIL_TEMPLATE_REGISTRY.filter(t => t.trigger === triggerKey);
  for (const meta of builtInMeta) {
    const db = dbByKey[meta.key] || {};
    const recipient = db.recipient || meta.recipient;
    const subject   = db.subject   || meta.default_subject;
    const html_body = db.html_body || meta.default_html_body;
    await _send(resend, triggerKey, recipient, subject, html_body, vars);
  }

  // Custom templates for this trigger
  for (const row of customRows) {
    await _send(resend, triggerKey, row.recipient, row.subject, row.html_body, vars);
  }
}

async function _send(resend, triggerKey, recipientPattern, subject, html_body, vars) {
  if (!recipientPattern || !subject || !html_body) return;
  const resolved = renderTemplate(recipientPattern, vars);
  const recipients = resolved.split(',').map(s => s.trim()).filter(s => s.includes('@'));
  if (!recipients.length) {
    console.warn(`[dispatch:${triggerKey}] no valid recipients from: ${recipientPattern}`);
    return;
  }
  // Compile block-editor format to full HTML
  let finalHtml = html_body;
  if (finalHtml.startsWith('BLOCKS:')) {
    try {
      const blocks = JSON.parse(finalHtml.slice(7));
      finalHtml = emailWrap(_compileBlocksToBodyHtml(blocks));
    } catch (err) {
      console.error(`[dispatch:${triggerKey}] block compile failed:`, err.message);
    }
  }
  await resend.emails.send({
    from: 'Curio <hello@choosecurio.com>',
    to: recipients,
    subject: renderTemplate(subject, vars),
    html: renderTemplate(finalHtml, vars),
  }).catch(err => console.error(`[dispatch:${triggerKey}]`, err.message));
}

function _compileBlocksToBodyHtml(blocks) {
  return (blocks || []).map(b => {
    switch (b.type) {
      case 'paragraph':
        return `<p style="margin:0 0 16px;line-height:1.7;color:#0F172A;font-size:15px">${(b.content || '').replace(/\n/g, '<br>')}</p>`;
      case 'button':
        return `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px"><tr><td style="border-radius:8px;background:${b.color || '#059669'}"><a href="${b.url || '#'}" style="display:inline-block;padding:13px 28px;background:${b.color || '#059669'};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif">${b.text || 'Click Here'}</a></td></tr></table>`;
      case 'callout':
        return `<div style="background:${b.bg || '#F0FDF4'};border:1px solid ${b.border || '#BBF7D0'};border-radius:8px;padding:16px 20px;margin-bottom:24px">${b.title ? `<p style="margin:0 0 6px;font-weight:600;color:${b.textColor || '#065F46'};font-size:0.9rem">${b.title}</p>` : ''}<p style="margin:0;line-height:1.6;color:${b.textColor || '#065F46'};font-size:0.875rem">${b.content || ''}</p></div>`;
      case 'data_table':
        return `<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px">${(b.rows || []).map(r => `<tr><td style="padding:6px 0;color:#64748B;font-size:14px;width:140px">${r.label}</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:600">${r.value}</td></tr>`).join('')}</table>`;
      case 'divider':
        return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0"/>`;
      case 'footer':
        return EMAIL_FOOTER;
      case 'html':
        return b.content || '';
      default:
        return '';
    }
  }).join('\n');
}

// ── Custom email management ────────────────────────────────────────────────────

export async function getCustomEmails() {
  try {
    return await dbQuery('email_templates', {
      is_custom: 'eq.true',
      select: 'key,name,description,recipient,trigger,trigger_label,schedule,send_type,subject,html_body,updated_at',
    });
  } catch (_) { return []; }
}

export async function createCustomEmail({ name, description, recipient, trigger, trigger_label, schedule, send_type, subject, html_body }) {
  const key = `custom_${Date.now()}`;
  await dbInsert('email_templates', {
    key, name,
    description: description || '',
    recipient: recipient || '',
    trigger: trigger || 'manual',
    trigger_label: trigger_label || 'Manual only',
    schedule: schedule || 'Manual',
    send_type: send_type || 'manual',
    subject, html_body,
    is_custom: true,
    updated_at: new Date().toISOString(),
  });
  return key;
}

// Direct send via Resend (used by manual send endpoint)
export async function sendEmail({ to, subject, html_body }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const toArr = Array.isArray(to) ? to : [to];
  await resend.emails.send({
    from: 'Curio <hello@choosecurio.com>',
    to: toArr,
    subject,
    html: html_body,
  });
}
