import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbQuery, dbDelete, dbPatch } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, role, teamId } = session;
  const isManager = role === 'manager';

  // GET — return all team members + their assessment status. An owner sees
  // the whole account; a manager sees only their own team.
  if (req.method === 'GET') {
    try {
      const userFilter = { account_id: `eq.${accountId}`, select: 'id,email,name,role,last_login_at,created_at,team_id', order: 'created_at.asc' };
      const tokenFilter = { account_id: `eq.${accountId}`, select: 'token,email,used,used_at,link_sent_at,name' };
      if (isManager) {
        userFilter.team_id = `eq.${teamId}`;
        tokenFilter.team_id = `eq.${teamId}`;
      }
      const [users, tokens] = await Promise.all([
        dbQuery('client_users', userFilter),
        dbQuery('tokens', tokenFilter),
      ]);

      // Build a map of email → token status
      const tokenByEmail = {};
      for (const t of tokens) {
        if (t.email) tokenByEmail[t.email.toLowerCase()] = t;
      }

      // Fetch assessments for completed tokens
      const usedTokenIds = tokens.filter(t => t.used).map(t => t.token);
      const assessmentMap = {};
      if (usedTokenIds.length) {
        const assessments = await dbQuery('assessments', {
          token: `in.(${usedTokenIds.join(',')})`,
          select: 'token,type,submitted_at',
        }).catch(() => []);
        for (const a of assessments) assessmentMap[a.token] = a;
      }

      const enriched = users.map(u => {
        const tok = tokenByEmail[u.email.toLowerCase()];
        const assessment = tok ? assessmentMap[tok.token] : null;
        return {
          ...u,
          token_status: assessment ? 'completed' : tok ? (tok.link_sent_at ? 'invited' : 'assigned') : 'no_token',
          assessment_type: assessment?.type || null,
          completed_at: assessment?.submitted_at || null,
          invited_at: tok?.link_sent_at || null,
        };
      });

      // Token pool summary
      const total = tokens.length;
      const available = tokens.filter(t => !t.email && !t.used).length;
      const sent = tokens.filter(t => t.email && !t.used).length;
      const completed = tokens.filter(t => t.used).length;

      return res.status(200).json({ members: enriched, tokenPool: { total, available, sent, completed } });
    } catch (err) {
      console.error('[portal/team GET]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Creating a new portal login for an existing account is admin-only now
  // (see pages/api/admin/accounts/[id]/users.js POST) — an owner/manager
  // session has no POST here.

  // PATCH — update a member's role or team assignment (owner only)
  if (req.method === 'PATCH') {
    if (role !== 'owner') return res.status(403).json({ error: 'Only owners can update team members.' });
    const { userId, role: newRole, team_id } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Prevent an owner from locking themselves out by demoting themselves.
    if (userId === session.userId && newRole && newRole !== 'owner') {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    try {
      const users = await dbGet('client_users', { id: userId });
      if (!users.length || users[0].account_id !== accountId) return res.status(404).json({ error: 'User not found.' });

      if (team_id) {
        const teams = await dbGet('teams', { id: team_id });
        if (!teams.length || teams[0].account_id !== accountId) return res.status(404).json({ error: 'Team not found.' });
      }

      const update = {};
      if (newRole) update.role = newRole;
      if ('team_id' in (req.body || {})) update.team_id = team_id || null;
      if (!Object.keys(update).length) return res.status(400).json({ error: 'Nothing to update' });

      await dbPatch('client_users', { id: userId }, update);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove a member (owner only)
  if (req.method === 'DELETE') {
    if (role !== 'owner') return res.status(403).json({ error: 'Only owners can remove team members.' });
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Prevent removing self
    if (userId === session.userId) return res.status(400).json({ error: 'You cannot remove yourself.' });

    try {
      // Verify user belongs to this account
      const users = await dbGet('client_users', { id: userId });
      if (!users.length || users[0].account_id !== accountId) return res.status(404).json({ error: 'User not found.' });

      await dbDelete('client_users', { id: userId });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
