import { dbQuery, dbInsert, dbPatch } from './supabase';

export const EMAIL_TEMPLATE_REGISTRY = [
  { key: 'buyer_confirmation', name: 'Buyer Confirmation', description: 'Sent to buyer after Stripe purchase', variables: ['name', 'assessmentUrl', 'isCombo'] },
  { key: 'internal_purchase', name: 'Internal Purchase Notification', description: 'Internal alert on new purchase', variables: ['name', 'email', 'productLabel', 'amountPaid', 'engagementId', 'grantedTools', 'assessmentUrl'] },
  { key: 'assessment_completed', name: 'Assessment Completed', description: 'Sent to participant after assessment is submitted', variables: ['name', 'profileUrl'] },
  { key: 'new_account', name: 'New Account Created', description: 'Welcome email for self-serve account creation', variables: ['name', 'loginUrl'] },
  { key: 'invite_account', name: 'Account Invitation', description: 'Invitation email when admin adds a user to an account', variables: ['name', 'inviteUrl', 'accountName'] },
  { key: 'renewal_reminder_30', name: 'Renewal Reminder (30 days)', description: 'Sent 30 days before license expiry', variables: ['name', 'expiryDate', 'renewalUrl'] },
  { key: 'renewal_reminder_expired', name: 'License Expired Notice', description: 'Sent on the day the license expires', variables: ['name', 'renewalUrl'] },
  { key: 'renewal_confirmation', name: 'Renewal Confirmation', description: 'Sent after successful renewal payment', variables: ['name', 'newExpiryDate'] },
];

export async function getEmailTemplate(key) {
  try {
    const rows = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key,subject,html_body,updated_at' });
    if (rows.length) return { subject: rows[0].subject, html_body: rows[0].html_body };
  } catch (_) {}
  return { subject: null, html_body: null };
}

export function renderTemplate(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`));
}

export async function saveEmailTemplate(key, subject, html_body) {
  const existing = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key' }).catch(() => []);
  if (existing.length) {
    await dbPatch('email_templates', { key }, { subject, html_body, updated_at: new Date().toISOString() });
  } else {
    await dbInsert('email_templates', { key, subject, html_body, updated_at: new Date().toISOString() });
  }
}
