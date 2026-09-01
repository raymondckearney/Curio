import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery, dbInsert } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const [accounts, allPurchases] = await Promise.all([
        dbQuery('client_accounts', { order: 'created_at.desc', select: '*' }),
        dbQuery('purchases', { select: 'buyer_email,product,amount,created_at', order: 'created_at.desc' }).catch(() => []),
      ]);

      // Index purchases by buyer_email for O(1) join
      const purchasesByEmail = {};
      for (const p of allPurchases) {
        if (!p.buyer_email) continue;
        (purchasesByEmail[p.buyer_email] = purchasesByEmail[p.buyer_email] || []).push(p);
      }

      const enriched = await Promise.all(accounts.map(async acc => {
        const [users, licenses, tokens] = await Promise.all([
          dbQuery('client_users', { account_id: `eq.${acc.id}`, select: 'id,email,name,role,last_login_at,provider', order: 'created_at.asc' }),
          dbQuery('account_licenses', { account_id: `eq.${acc.id}`, select: '*' }),
          dbQuery('tokens', { account_id: `eq.${acc.id}`, select: 'token,engagement_id', order: 'created_at.asc' }),
        ]);
        const primaryEmail = (users[0] || {}).email;
        const purchases = primaryEmail ? (purchasesByEmail[primaryEmail] || []) : [];
        const engagementIds = [...new Set(tokens.map(t => t.engagement_id).filter(Boolean))];

        // Fetch the most recent assessment linked to this account's tokens
        let assessmentProfile = null;
        const tokenIds = tokens.map(t => t.token).filter(Boolean);
        if (tokenIds.length) {
          const assessments = await dbQuery('assessments', {
            token: `in.(${tokenIds.join(',')})`,
            order: 'submitted_at.desc',
            limit: '1',
            select: 'type',
          }).catch(() => []);
          if (assessments.length && assessments[0].type) {
            assessmentProfile = assessments[0].type.toUpperCase().replace(/_/g, '-');
          }
        }

        return { ...acc, users, licenses, purchases, engagementIds, assessmentProfile };
      }));

      return res.status(200).json({ accounts: enriched });
    } catch (err) {
      console.error('[admin/accounts GET]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name, slug, notes } = req.body || {};
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    try {
      const rows = await dbInsert('client_accounts', { name, slug: cleanSlug, notes: notes || null });
      return res.status(201).json({ account: rows[0] });
    } catch (err) {
      console.error('[admin/accounts POST]', err);
      const msg = err.message.includes('unique') ? 'That slug is already taken' : err.message;
      return res.status(400).json({ error: msg });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
