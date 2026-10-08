// Admin: Team Builder runs (newest first) and the activities that matched
// nothing on the MindPrint™ Activity Taxonomy, grouped by name with counts,
// so the taxonomy can be reviewed for missing entries.
import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [runs, unlisted, accounts, users] = await Promise.all([
      dbQuery('team_builder_runs', { order: 'created_at.desc', limit: '200', select: 'id,created_at,account_id,user_id,mode,weeks,hours,activity_count,profiles,result_summary' }),
      dbQuery('team_builder_unlisted_activities', { order: 'created_at.desc', limit: '2000', select: 'id,created_at,run_id,activity_name,tag_set,evidence' }),
      dbQuery('client_accounts', { select: 'id,name' }).catch(() => []),
      dbQuery('client_users', { select: 'id,email' }).catch(() => []),
    ]);
    const accountName = Object.fromEntries(accounts.map(a => [a.id, a.name]));
    const userEmail = Object.fromEntries(users.map(u => [u.id, u.email]));

    // Group unlisted activities by name (case and spacing ignored).
    const groups = {};
    for (const u of unlisted) {
      const key = u.activity_name.trim().toLowerCase().replace(/\s+/g, ' ');
      const g = groups[key] || (groups[key] = { name: u.activity_name.trim(), count: 0, tags: {}, evidence: [], lastSeen: u.created_at });
      g.count += 1;
      g.tags[u.tag_set] = (g.tags[u.tag_set] || 0) + 1;
      if (u.evidence && g.evidence.length < 3) g.evidence.push(u.evidence);
    }
    const unlistedGroups = Object.values(groups).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return res.status(200).json({
      runs: runs.map(r => ({ ...r, account_name: accountName[r.account_id] || null, user_email: userEmail[r.user_id] || null })),
      unlisted: unlistedGroups,
    });
  } catch (err) {
    console.error('[admin/team-builder]', err);
    return res.status(500).json({ error: err.message });
  }
}
