import { getAdminSession } from '../../../../../lib/adminSession';
import { getEmailTemplate, EMAIL_TEMPLATE_REGISTRY } from '../../../../../lib/emailTemplates';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key } = req.query;
  const { to } = req.body || {};
  if (!to) return res.status(400).json({ error: 'to is required' });
  if (!EMAIL_TEMPLATE_REGISTRY.find(t => t.key === key)) {
    return res.status(404).json({ error: 'Unknown template key' });
  }

  const tpl = await getEmailTemplate(key);
  if (!tpl.html_body) return res.status(400).json({ error: 'No custom template saved for this key yet' });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to,
      subject: `[TEST] ${tpl.subject}`,
      html: tpl.html_body,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin/email-templates/test POST]', err);
    return res.status(500).json({ error: err.message });
  }
}
