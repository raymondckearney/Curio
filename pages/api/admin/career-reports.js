import { getAdminSession } from '../../../lib/adminSession';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/career_guidance_reports?order=created_at.desc&select=id,created_at,profile,career_level,role_orientation,industry,risk_environment,values,compensation_priority,other_assessments,report_data`,
      { headers }
    );
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
