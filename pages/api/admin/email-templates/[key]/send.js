import { getAdminSession } from '../../../../../lib/adminSession';
import { getEmailTemplate, sendEmail, EMAIL_TEMPLATE_REGISTRY } from '../../../../../lib/emailTemplates';
import { dbQuery } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key } = req.query;
  const { to } = req.body || {}; // string or array of email addresses
  if (!to || (Array.isArray(to) && !to.length)) return res.status(400).json({ error: 'to is required' });

  const isBuiltIn = !!EMAIL_TEMPLATE_REGISTRY.find(t => t.key === key);
  if (!isBuiltIn) {
    const rows = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key' }).catch(() => []);
    if (!rows.length) return res.status(404).json({ error: 'Unknown template key' });
  }

  const tpl = await getEmailTemplate(key);
  if (!tpl.html_body) return res.status(400).json({ error: 'No template body saved for this key' });

  try {
    const recipients = Array.isArray(to) ? to : to.split(',').map(s => s.trim()).filter(Boolean);
    await sendEmail({ to: recipients, subject: tpl.subject, html_body: tpl.html_body });
    return res.status(200).json({ ok: true, sent_to: recipients });
  } catch (err) {
    console.error('[admin/email-templates/send POST]', err);
    return res.status(500).json({ error: err.message });
  }
}
