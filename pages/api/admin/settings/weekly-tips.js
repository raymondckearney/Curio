import { getAdminSession } from '../../../../lib/adminSession';
import { getSetting, setSetting } from '../../../../lib/appSettings';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const value = await getSetting('weekly_tips_enabled', 'false');
    return res.status(200).json({ enabled: value === 'true' });
  }

  if (req.method === 'PATCH') {
    const { enabled } = req.body || {};
    try {
      await setSetting('weekly_tips_enabled', enabled ? 'true' : 'false');
      return res.status(200).json({ enabled: !!enabled });
    } catch (err) {
      console.error('[admin/settings/weekly-tips PATCH]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
