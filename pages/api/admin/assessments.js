import { getAdminSession } from '../../../lib/adminSession';
import { dbDelete } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });
    try {
      await dbDelete('assessments', { id });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[admin/assessments] DELETE failed:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

    const aRes = await fetch(`${SUPABASE_URL}/rest/v1/assessments?order=submitted_at.desc`, { headers });
    if (!aRes.ok) throw new Error(await aRes.text());
    const assessments = await aRes.json();

    // Fetch token registration data for any assessments that have a token
    const tokens = assessments.map(a => a.token).filter(Boolean);
    let tokenMap = {};
    if (tokens.length) {
      const ids = tokens.join(',');
      const tRes = await fetch(
        `${SUPABASE_URL}/rest/v1/tokens?token=in.(${ids})&select=token,name,email,role,company`,
        { headers }
      );
      if (tRes.ok) {
        const rows = await tRes.json();
        rows.forEach(r => { tokenMap[r.token] = { reg_name: r.name, reg_email: r.email, reg_role: r.role, reg_company: r.company }; });
      }
    }

    const enriched = assessments.map(a => ({
      ...a,
      reg_name:    tokenMap[a.token]?.reg_name    ?? null,
      reg_email:   tokenMap[a.token]?.reg_email   ?? null,
      reg_role:    tokenMap[a.token]?.reg_role    ?? null,
      reg_company: tokenMap[a.token]?.reg_company ?? null,
    }));

    return res.status(200).json({ assessments: enriched });
  } catch (err) {
    console.error('[admin/assessments]', err);
    return res.status(500).json({ error: err.message });
  }
}
