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

      // Every token held by each email. Someone can hold several (repeat
      // self-serve links, or a profile set by hand in admin on a token that
      // was never marked used), so all of them are checked below.
      const tokensByEmail = {};
      for (const t of tokens) {
        if (t.email) (tokensByEmail[t.email.toLowerCase()] = tokensByEmail[t.email.toLowerCase()] || []).push(t);
      }

      // Assessments on any of those tokens, the same way the dashboard finds
      // a person's own profile (lib/ownProfile.js), so the two never disagree.
      const assignedTokenIds = tokens.filter(t => t.email).map(t => t.token);
      const assessmentMap = {};
      if (assignedTokenIds.length) {
        const assessments = await dbQuery('assessments', {
          token: `in.(${assignedTokenIds.join(',')})`,
          select: 'token,type,submitted_at',
          order: 'submitted_at.desc',
        }).catch(() => []);
        for (const a of assessments) if (!assessmentMap[a.token]) assessmentMap[a.token] = a;
      }

      const enriched = users.map(u => {
        const held = tokensByEmail[u.email.toLowerCase()] || [];
        // A token with a completed assessment wins, then a used one, then
        // the most recently sent.
        const tok = held.find(t => assessmentMap[t.token]) || held.find(t => t.used)
          || [...held].sort((a, b) => String(b.link_sent_at || '').localeCompare(String(a.link_sent_at || '')))[0];
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
