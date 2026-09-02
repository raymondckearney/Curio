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

export const TRIGGER_OPTIONS = [
  { key: 'stripe_purchase',      label: 'Stripe purchase completed' },
  { key: 'assessment_complete',  label: 'Assessment completed' },
  { key: 'account_created',      label: 'Account created / signup' },
  { key: 'renewal_complete',     label: 'Renewal payment completed' },
  { key: 'cron_30_day_expiry',   label: 'Cron — 30 days before expiry' },
  { key: 'cron_expiry_day',      label: 'Cron — expiry day' },
  { key: 'cron_daily',           label: 'Cron — daily (custom condition)' },
  { key: 'manual',               label: 'Manual only' },
];

export const EMAIL_TEMPLATE_REGISTRY = [
  {
    key: 'buyer_confirmation',
    name: 'Buyer Confirmation',
    description: 'Sent to the buyer immediately after a successful Stripe purchase.',
    recipient: 'Buyer (email from Stripe session)',
    trigger: 'stripe_purchase',
    trigger_label: 'Stripe purchase completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'assessmentUrl', 'includedNote'],
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
    recipient: 'hello@choosecurio.com (internal)',
    trigger: 'stripe_purchase',
    trigger_label: 'Stripe purchase completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'email', 'productLabel', 'amountPaid', 'engagementId', 'grantedTools', 'assessmentUrl', 'time'],
    default_subject: 'New Purchase — {{productLabel}} — {{name}}',
    default_html_body: emailWrap(`
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0F172A">New Purchase</p>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px;width:120px">Buyer</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:600">{{name}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Email</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{email}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Product</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{productLabel}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Amount</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:700">${{amountPaid}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Engagement ID</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{engagementId}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Tools Granted</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{grantedTools}}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B;font-size:14px">Time</td><td style="padding:6px 0;color:#0F172A;font-size:14px">{{time}}</td></tr>
    </table>
    <p style="margin:0 0 12px;font-weight:700;color:#0F172A;font-size:14px">Assessment Link</p>
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
    key: 'assessment_completed',
    name: 'Assessment Completed',
    description: 'Sent to the participant when their assessment results are processed.',
    recipient: 'Participant (email on assessment)',
    trigger: 'assessment_complete',
    trigger_label: 'Assessment completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'profileUrl'],
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
    key: 'new_account',
    name: 'New Account Welcome',
    description: 'Welcome email sent when a self-serve account is created after purchase.',
    recipient: 'New account holder',
    trigger: 'account_created',
    trigger_label: 'Account created / signup',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'loginUrl'],
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
    recipient: 'Invited user',
    trigger: 'account_created',
    trigger_label: 'Account created / signup',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'inviteUrl', 'licenseList'],
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
    key: 'renewal_reminder_30',
    name: 'Renewal Reminder — 30 Days',
    description: 'Sent to the primary account user 30 days before their license expires.',
    recipient: 'Primary account user',
    trigger: 'cron_30_day_expiry',
    trigger_label: 'Cron — 30 days before expiry',
    schedule: 'Daily cron, 12:00 UTC',
    send_type: 'automated',
    variables: ['name', 'expiryDate', 'renewalUrl'],
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
    recipient: 'Primary account user',
    trigger: 'cron_expiry_day',
    trigger_label: 'Cron — expiry day',
    schedule: 'Daily cron, 12:00 UTC',
    send_type: 'automated',
    variables: ['name', 'renewalUrl'],
    default_subject: 'Your Curio access has expired',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access has expired. Renew to regain access to your MindPrint™ tools and resources.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="{{renewalUrl}}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Renew Now →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
  {
    key: 'renewal_confirmation',
    name: 'Renewal Confirmation',
    description: 'Sent to the account holder after a successful renewal payment.',
    recipient: 'Account holder (from Stripe session)',
    trigger: 'renewal_complete',
    trigger_label: 'Renewal payment completed',
    schedule: 'Immediate',
    send_type: 'automated',
    variables: ['name', 'newExpiryDate'],
    default_subject: 'Your Curio access has been renewed',
    default_html_body: emailWrap(`
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi {{name}},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access has been renewed. Your new expiry date is <strong>{{newExpiryDate}}</strong>.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr><td style="border-radius:8px;background:#059669"><a href="https://choosecurio.com/portal/dashboard" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Go to Dashboard →</a></td></tr>
    </table>
    ${EMAIL_FOOTER}`),
  },
];

// Fetch a single template — DB row first, then registry defaults
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

// Replace {{variable}} placeholders in an HTML body
export function renderTemplate(html, vars) {
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

// Fetch all custom (user-created) email definitions from DB
export async function getCustomEmails() {
  try {
    return await dbQuery('email_templates', {
      is_custom: 'eq.true',
      select: 'key,name,description,recipient,trigger,trigger_label,schedule,send_type,subject,html_body,updated_at',
    });
  } catch (_) { return []; }
}

// Create a new custom email definition
export async function createCustomEmail({ name, description, recipient, trigger, trigger_label, schedule, send_type, subject, html_body }) {
  const key = `custom_${Date.now()}`;
  await dbInsert('email_templates', {
    key,
    name,
    description: description || '',
    recipient: recipient || '',
    trigger: trigger || 'manual',
    trigger_label: trigger_label || 'Manual only',
    schedule: schedule || 'Manual',
    send_type: send_type || 'manual',
    subject,
    html_body,
    is_custom: true,
    updated_at: new Date().toISOString(),
  });
  return key;
}

// Send an email directly via Resend
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
