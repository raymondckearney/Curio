import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery } from '../../../lib/supabase';
import { EMAIL_TEMPLATE_REGISTRY, getCustomEmails, createCustomEmail, TRIGGER_OPTIONS } from '../../../lib/emailTemplates';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const [dbRows, customEmails] = await Promise.all([
        dbQuery('email_templates', { select: 'key,subject,html_body,updated_at', is_custom: 'not.eq.true' }).catch(() => []),
        getCustomEmails(),
      ]);
      const byKey = {};
      for (const r of dbRows) byKey[r.key] = r;

      const builtIn = EMAIL_TEMPLATE_REGISTRY.map(t => ({
        ...t,
        is_custom: false,
        customized: !!byKey[t.key]?.html_body,
        subject: byKey[t.key]?.subject || t.default_subject || null,
        html_body: byKey[t.key]?.html_body || t.default_html_body || null,
        updated_at: byKey[t.key]?.updated_at || null,
      }));

      const custom = customEmails.map(t => ({ ...t, is_custom: true, customized: true }));

      return res.status(200).json({ templates: [...builtIn, ...custom], triggerOptions: TRIGGER_OPTIONS });
    } catch (err) {
      console.error('[admin/email-templates GET]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name, description, recipient, trigger, schedule, send_type, subject, html_body } = req.body || {};
    if (!name || !subject || !html_body) return res.status(400).json({ error: 'name, subject, and html_body are required' });
    const triggerOption = TRIGGER_OPTIONS.find(t => t.key === trigger);
    try {
      const key = await createCustomEmail({
        name, description, recipient,
        trigger: trigger || 'manual',
        trigger_label: triggerOption?.label || 'Manual only',
        schedule: schedule || 'Manual',
        send_type: send_type || 'manual',
        subject, html_body,
      });
      return res.status(201).json({ ok: true, key });
    } catch (err) {
      console.error('[admin/email-templates POST]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
