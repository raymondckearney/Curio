import { getAdminSession } from '../../../../../lib/adminSession';
import { dbQuery } from '../../../../../lib/supabase';
import { finalizeDueScheduledLinks } from '../../../../../lib/scheduledLinks';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;

  try {
    const tokens = await dbQuery('tokens', {
      account_id: `eq.${accountId}`,
      order: 'created_at.desc',
      select: 'token,name,email,role,engagement_id,used,used_at,link_sent_at,created_at,purpose,expires_at,team_id',
    });
    // The schedule columns come from migration 0015; read them separately so
    // this list still loads before that migration is run.
    const scheduled = await dbQuery('tokens', { account_id: `eq.${accountId}`, scheduled_email_id: 'not.is.null', select: 'token,link_scheduled_for,scheduled_email_id' }).catch(() => []);
    const byToken = Object.fromEntries(scheduled.map(t => [t.token, t]));
    for (const t of tokens) if (byToken[t.token]) Object.assign(t, byToken[t.token]);
    await finalizeDueScheduledLinks(tokens).catch(err => console.error('[admin/accounts/tokens] finalize:', err));

    const summary = {
      total: tokens.length,
      available: tokens.filter(t => !t.email && !t.used).length,
      sent: tokens.filter(t => t.email && !t.used).length,
      completed: tokens.filter(t => t.used).length,
    };

    return res.status(200).json({ tokens, summary });
  } catch (err) {
    console.error('[admin/accounts/tokens]', err);
    return res.status(500).json({ error: err.message });
  }
}
