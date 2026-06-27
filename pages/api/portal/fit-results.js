import { getPortalSession } from '../../../lib/portalSession';
import { dbInsert, dbQuery } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const rows = await dbQuery('fit_results', {
        account_id: `eq.${session.accountId}`,
        select: 'id,participant_name,profile_type,role,score,demand_split,created_at',
        order: 'created_at.desc',
        limit: 100,
      });
      return res.status(200).json(rows);
    } catch (err) {
      console.error('[portal/fit-results GET]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { participant_name, profile_type, role, score, demand_split, result_payload } = req.body || {};
    if (!profile_type || !role) return res.status(400).json({ error: 'profile_type and role are required' });

    try {
      const rows = await dbInsert('fit_results', {
        account_id: session.accountId,
        user_id: session.userId,
        participant_name: participant_name || null,
        profile_type,
        role,
        score: score ?? null,
        demand_split: demand_split ?? null,
        result_payload: result_payload ?? null,
        created_at: new Date().toISOString(),
      });
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error('[portal/fit-results POST]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
