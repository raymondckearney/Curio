import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const tokens = await dbQuery('tokens', {
      select: 'engagement_id,used,profile_sent_at,created_at',
      order: 'created_at.desc',
    });

    // Group by engagement_id, skip tokens with no engagement_id
    const map = {};
    for (const t of tokens) {
      if (!t.engagement_id) continue;
      if (!map[t.engagement_id]) {
        map[t.engagement_id] = { engagement_id: t.engagement_id, total_count: 0, completed_count: 0, profile_sent_count: 0, first_created_at: t.created_at };
      }
      map[t.engagement_id].total_count++;
      if (t.used) map[t.engagement_id].completed_count++;
      if (t.profile_sent_at) map[t.engagement_id].profile_sent_count++;
      // track earliest created_at
      if (t.created_at < map[t.engagement_id].first_created_at) {
        map[t.engagement_id].first_created_at = t.created_at;
      }
    }

    const engagements = Object.values(map).sort((a, b) =>
      new Date(b.first_created_at) - new Date(a.first_created_at)
    );

    return res.status(200).json({ engagements });
  } catch (err) {
    console.error('[admin/engagements]', err);
    return res.status(500).json({ error: err.message });
  }
}
