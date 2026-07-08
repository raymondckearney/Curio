import { getAdminSession } from '../../../../../lib/adminSession';
import { dbInsert, dbDelete, dbPatch } from '../../../../../lib/supabase';

const VALID_TYPES = [
  'assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer',
  'precision_companion', 'purpose_companion', 'progress_companion',
  'library_full', 'library_a', 'library_b', 'library_c', 'library_d', 'library_e',
];

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;

  if (req.method === 'POST') {
    const { type, quantity, expires_at } = req.body || {};
    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }
    try {
      const rows = await dbInsert('account_licenses', {
        account_id: accountId,
        type,
        quantity: quantity ? parseInt(quantity, 10) : null,
        expires_at: expires_at || null,
      });
      return res.status(201).json({ license: rows[0] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { licenseId } = req.body || {};
    if (!licenseId) return res.status(400).json({ error: 'licenseId required' });
    try {
      await dbDelete('account_licenses', { id: licenseId });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
