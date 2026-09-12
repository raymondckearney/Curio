import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbInsert, dbDelete, dbPatch, dbQuery } from '../../../lib/supabase';

// Owner-only, self-serve team management for an enterprise account. Unlike
// the admin equivalent (pages/api/admin/accounts/[id]/teams.js), every
// mutation here must verify the team actually belongs to the caller's own
// account — an admin session is trusted for any account, a portal session
// is not, so skipping that check would let an owner rename or delete a
// team on someone else's account just by guessing its id.
export default async function handler(req, res) {
  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'owner') return res.status(403).json({ error: 'Only account owners can manage teams.' });

  const { accountId } = session;

  if (req.method === 'GET') {
    try {
      const [teams, users] = await Promise.all([
        dbQuery('teams', { account_id: `eq.${accountId}`, order: 'created_at.asc' }),
        dbQuery('client_users', { account_id: `eq.${accountId}`, select: 'id,name,email,role,team_id' }),
      ]);
      const enriched = teams.map(t => ({ ...t, members: users.filter(u => u.team_id === t.id) }));
      return res.status(200).json({ teams: enriched });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    try {
      const rows = await dbInsert('teams', { account_id: accountId, name: name.trim() });
      return res.status(201).json({ team: { ...rows[0], members: [] } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    const { teamId, name } = req.body || {};
    if (!teamId) return res.status(400).json({ error: 'teamId required' });
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    try {
      const rows = await dbGet('teams', { id: teamId });
      if (!rows.length || rows[0].account_id !== accountId) return res.status(404).json({ error: 'Team not found.' });
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
      const rows = await dbGet('teams', { id: teamId });
      if (!rows.length || rows[0].account_id !== accountId) return res.status(404).json({ error: 'Team not found.' });
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
