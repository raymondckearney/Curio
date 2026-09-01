import { getAdminSession } from '../../../../lib/adminSession';
import { getEmailTemplate, saveEmailTemplate, EMAIL_TEMPLATE_REGISTRY, TRIGGER_OPTIONS } from '../../../../lib/emailTemplates';
import { dbQuery, dbPatch } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { key } = req.query;
  const isBuiltIn = !!EMAIL_TEMPLATE_REGISTRY.find(t => t.key === key);

  // Allow custom keys too — verify it exists in DB
  if (!isBuiltIn) {
    const rows = await dbQuery('email_templates', { key: `eq.${key}`, select: 'key' }).catch(() => []);
    if (!rows.length) return res.status(404).json({ error: 'Unknown template key' });
  }

  if (req.method === 'GET') {
    const tpl = await getEmailTemplate(key);
    const meta = EMAIL_TEMPLATE_REGISTRY.find(t => t.key === key) || {};
    return res.status(200).json({ key, ...meta, ...tpl });
  }

  if (req.method === 'PATCH') {
    const { subject, html_body, name, description, recipient, trigger, schedule, send_type } = req.body || {};
    if (!subject || !html_body) return res.status(400).json({ error: 'subject and html_body are required' });
    try {
      await saveEmailTemplate(key, subject, html_body);
      // For custom emails, also update metadata fields
      if (!isBuiltIn) {
        const triggerOption = TRIGGER_OPTIONS.find(t => t.key === trigger);
        const patch = {};
        if (name !== undefined) patch.name = name;
        if (description !== undefined) patch.description = description;
        if (recipient !== undefined) patch.recipient = recipient;
        if (trigger !== undefined) { patch.trigger = trigger; patch.trigger_label = triggerOption?.label || trigger; }
        if (schedule !== undefined) patch.schedule = schedule;
        if (send_type !== undefined) patch.send_type = send_type;
        if (Object.keys(patch).length) {
          await dbPatch('email_templates', { key }, patch);
        }
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[admin/email-templates PATCH]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
