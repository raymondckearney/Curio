import { getAdminSession } from '../../../../lib/adminSession';
import { getEmailTemplate, saveEmailTemplate, EMAIL_TEMPLATE_REGISTRY } from '../../../../lib/emailTemplates';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { key } = req.query;
  if (!EMAIL_TEMPLATE_REGISTRY.find(t => t.key === key)) {
    return res.status(404).json({ error: 'Unknown template key' });
  }

  if (req.method === 'GET') {
    const tpl = await getEmailTemplate(key);
    return res.status(200).json({ key, ...tpl });
  }

  if (req.method === 'PATCH') {
    const { subject, html_body } = req.body || {};
    if (!subject || !html_body) return res.status(400).json({ error: 'subject and html_body are required' });
    try {
      await saveEmailTemplate(key, subject, html_body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[admin/email-templates PATCH]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
