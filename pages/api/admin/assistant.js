import { getAdminSession } from '../../../lib/adminSession';
import { dbGet, dbInsert, dbPatch, dbQuery } from '../../../lib/supabase';
import { DIRECT_LICENSE_TYPES } from '../../../lib/licenseTypes';

// Admin -> Assistant: Curio Assistant access requests and recent searches.
export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const [requests, searches] = await Promise.all([
        dbQuery('access_requests', { order: 'created_at.desc', limit: '200', select: '*' }),
        dbQuery('assistant_logs', { order: 'created_at.desc', limit: '200', select: 'id,created_at,account_id,user_id,query,answer,recommended_ids' }),
      ]);
      const accountIds = [...new Set([...requests, ...searches].map(r => r.account_id).filter(Boolean))];
      const userIds = [...new Set(searches.map(r => r.user_id).filter(Boolean))];
      const [accounts, users] = await Promise.all([
        accountIds.length ? dbQuery('client_accounts', { id: `in.(${accountIds.join(',')})`, select: 'id,name' }) : [],
        userIds.length ? dbQuery('client_users', { id: `in.(${userIds.join(',')})`, select: 'id,name,email' }) : [],
      ]);
      const accName = Object.fromEntries(accounts.map(a => [a.id, a.name]));
      const userById = Object.fromEntries(users.map(u => [u.id, u]));
      return res.status(200).json({
        requests: requests.map(r => ({ ...r, account_name: accName[r.account_id] || '' })),
        searches: searches.map(s => ({ ...s, account_name: accName[s.account_id] || '', user_name: userById[s.user_id]?.name || userById[s.user_id]?.email || '' })),
      });
    }

    if (req.method === 'POST') {
      const { requestId, action } = req.body || {};
      if (!requestId || !['grant', 'dismiss'].includes(action)) {
        return res.status(400).json({ error: 'requestId and action ("grant" or "dismiss") are required' });
      }
      const [request] = await dbGet('access_requests', { id: requestId });
      if (!request) return res.status(404).json({ error: 'Request not found' });
      if (request.status !== 'pending') return res.status(409).json({ error: `Already ${request.status}` });

      if (action === 'grant') {
        const type = request.grant_license;
        if (!type || !DIRECT_LICENSE_TYPES.includes(type)) {
          return res.status(400).json({ error: 'This one needs a manual change in Accounts → Edit Account (for example a role change).' });
        }
        const now = new Date();
        const existing = await dbGet('account_licenses', { account_id: request.account_id, type });
        if (!existing.some(l => !l.expires_at || new Date(l.expires_at) > now)) {
          await dbInsert('account_licenses', { account_id: request.account_id, type, quantity: 1, expires_at: null });
        }
      }

      await dbPatch('access_requests', { id: requestId }, {
        status: action === 'grant' ? 'granted' : 'dismissed',
        resolved_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin/assistant]', err);
    return res.status(500).json({ error: err.message });
  }
}
