import { getAdminSession } from '../../../../../lib/adminSession';
import { dbInsert } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;
  const { quantity, engagement_id } = req.body || {};

  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1 || qty > 500) return res.status(400).json({ error: 'quantity must be between 1 and 500' });

  const engId = engagement_id?.trim() || `pool-${accountId.slice(0, 8)}-${Date.now()}`;

  try {
    const rows = Array.from({ length: qty }, () => ({
      token: crypto.randomUUID(),
      account_id: accountId,
      engagement_id: engId,
      purpose: 'assessment',
      used: false,
    }));

    const inserted = await dbInsert('tokens', rows);
    return res.status(201).json({ created: inserted.length, engagement_id: engId });
  } catch (err) {
    console.error('[admin/accounts/generate-tokens]', err);
    return res.status(500).json({ error: err.message });
  }
}
