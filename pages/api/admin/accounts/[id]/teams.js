import { getAdminSession } from '../../../../../lib/adminSession';
import { dbInsert, dbDelete, dbPatch, dbQuery } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;

  if (req.method === 'GET') {
    try {
      const [teams, users] = await Promise.all([
        dbQuery('teams', { account_id: `eq.${accountId}`, order: 'created_at.asc' }),
        dbQuery('client_users', { account_id: `eq.${accountId}`, select: 'id,name,email,role,team_id' }),
      ]);
      const enriched = teams.map(t => ({
        ...t,
        members: users.filter(u => u.team_id === t.id),
      }));
      const unassigned = users.filter(u => !u.team_id);
      return res.status(200).json({ teams: enriched, unassigned });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    try {
      const rows = await dbInsert('teams', { account_id: accountId, name: name.trim() });
      return res.status(201).json({ team: rows[0] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    const { teamId, name } = req.body || {};
    if (!teamId) return res.status(400).json({ error: 'teamId required' });
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    try {
      await dbPatch('teams', { id: teamId }, { name: name.trim() });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { teamId } = req.body || {};
    if (!teamId) return res.status(400).json({ error: 'teamId required' });
    try {
      // client_users.team_id and tokens.team_id both reference teams with
      // ON DELETE SET NULL, so members and tokens fall back to unassigned
      // rather than being deleted or orphaned.
      await dbDelete('teams', { id: teamId });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
