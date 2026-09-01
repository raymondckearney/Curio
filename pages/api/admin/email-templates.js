import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery } from '../../../lib/supabase';
import { EMAIL_TEMPLATE_REGISTRY } from '../../../lib/emailTemplates';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rows = await dbQuery('email_templates', { select: 'key,subject,html_body,updated_at' }).catch(() => []);
    const byKey = {};
    for (const r of rows) byKey[r.key] = r;

    const templates = EMAIL_TEMPLATE_REGISTRY.map(t => ({
      ...t,
      customized: !!byKey[t.key],
      subject: byKey[t.key]?.subject || null,
      html_body: byKey[t.key]?.html_body || null,
      updated_at: byKey[t.key]?.updated_at || null,
    }));

    return res.status(200).json({ templates });
  } catch (err) {
    console.error('[admin/email-templates GET]', err);
    return res.status(500).json({ error: err.message });
  }
}
