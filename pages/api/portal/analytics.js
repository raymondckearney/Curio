import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery } from '../../../lib/supabase';

// Owner/manager only: every completed assessment on the account (owner) or
// on the caller's own team (manager) — backs the Analytics tab's charts,
// list generator, and results table. A plain member has no equivalent view
// (the old /portal/results page was retired — see pages/manual.js).
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'owner' && session.role !== 'manager') return res.status(403).json({ error: 'Owners and managers only.' });

  const { accountId, role, teamId } = session;

  try {
    const tokenFilter = { account_id: `eq.${accountId}`, select: 'token,name,email' };
    if (role === 'manager') tokenFilter.team_id = `eq.${teamId}`;
    const tokens = await dbQuery('tokens', tokenFilter);
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    if (!tokenIds.length) return res.status(200).json({ people: [], assessments: [] });

    const rows = await dbQuery('assessments', {
      token: `in.(${tokenIds.join(',')})`,
      order: 'submitted_at.desc',
      select: 'id,token,name,email,type,h_score,w_score,y_score,submitted_at',
    });

    const tokenMap = {};
    tokens.forEach(t => { tokenMap[t.token] = t; });

    const completed = rows.filter(a => a.type);

    // people — trimmed shape for the pie charts and Generate-a-List tool.
    const people = completed.map(a => ({
      name: a.name || tokenMap[a.token]?.name || '',
      email: a.email || tokenMap[a.token]?.email || '',
      profile: a.type.toUpperCase(),
    }));

    // assessments — full shape (scores + date) for the raw results table,
    // same fields /portal/results has always returned to a member.
    const assessments = completed.map(a => ({
      id: a.id,
      name: a.name || tokenMap[a.token]?.name || '',
      email: a.email || tokenMap[a.token]?.email || '',
      profile: a.type.toUpperCase(),
      h_score: a.h_score,
      w_score: a.w_score,
      y_score: a.y_score,
      submitted_at: a.submitted_at,
    }));

    return res.status(200).json({ people, assessments });
  } catch (err) {
    console.error('[portal/analytics]', err);
    return res.status(500).json({ error: err.message });
  }
}
