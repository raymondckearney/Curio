import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const tokens = await dbQuery('tokens', {
      account_id: `eq.${session.accountId}`,
      order: 'created_at.desc',
      select: 'token,name,email,role,company,used,used_at,link_sent_at,engagement_id,created_at',
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.choosecurio.com';
    const enriched = tokens.map(t => ({
      ...t,
      url: `${baseUrl}/go/${t.token}`,
    }));

    return res.status(200).json({ tokens: enriched });
  } catch (err) {
    console.error('[portal/tokens]', err);
    return res.status(500).json({ error: err.message });
  }
}
