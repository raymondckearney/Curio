import { dbQuery, dbInsert, dbPatch } from './supabase';
import { Resend } from 'resend';

// Supported automated trigger keys — adding a new one requires wiring it into
// the relevant API route or cron job, but no new files are needed.
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
    variables: ['name', 'assessmentUrl', 'isCombo'],
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
    variables: ['name', 'email', 'productLabel', 'amountPaid', 'engagementId', 'grantedTools', 'assessmentUrl'],
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
    variables: ['name', 'inviteUrl', 'accountName'],
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
  },
];

// Fetch a single template's subject+body from DB (returns nulls if not customized)
export async function getEmailTemplate(key) {
  try {
    const rows = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key,subject,html_body,updated_at' });
    if (rows.length) return { subject: rows[0].subject, html_body: rows[0].html_body };
  } catch (_) {}
  return { subject: null, html_body: null };
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
