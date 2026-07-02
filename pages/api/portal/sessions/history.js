import { getPortalSession } from '../../../../lib/portalSession';
import { dbQuery } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { tool } = req.query;
  const filters = {
    account_id: `eq.${session.accountId}`,
    order: 'started_at.desc',
    limit: '50',
    select: 'id,tool,started_at,completed_at,result',
  };
  if (tool) filters.tool = `eq.${tool}`;

  try {
    const rows = await dbQuery('tool_sessions', filters);
    return res.status(200).json({ sessions: rows });
  } catch (err) {
    console.error('[sessions/history]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
