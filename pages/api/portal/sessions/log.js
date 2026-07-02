import { getPortalSession } from '../../../../lib/portalSession';
import { dbInsert, dbQuery, dbPatch } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { tool, completed, result, metadata } = req.body || {};
  if (!tool) return res.status(400).json({ error: 'tool is required' });

  try {
    if (!completed) {
      const [row] = await dbInsert('tool_sessions', {
        account_id: session.accountId,
        user_id: session.userId,
        tool,
        metadata: metadata || null,
      });
      return res.status(200).json({ session_id: row.id });
    }

    // Mark most recent open session for this account + tool as complete
    const open = await dbQuery('tool_sessions', {
      account_id: `eq.${session.accountId}`,
      tool: `eq.${tool}`,
      completed_at: 'is.null',
      order: 'started_at.desc',
      limit: '1',
    });

    if (open.length) {
      await dbPatch('tool_sessions', { id: open[0].id }, {
        completed_at: new Date().toISOString(),
        result: result || null,
        metadata: metadata || null,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sessions/log]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
