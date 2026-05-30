import { getAdminSession } from '../../../lib/adminSession';
import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch all rows (no filter) ordered by submitted_at desc
    // Supabase REST: add order param manually since dbGet doesn't support order
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    const res2 = await fetch(
      `${SUPABASE_URL}/rest/v1/assessments?order=submitted_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res2.ok) {
      throw new Error(await res2.text());
    }

    const assessments = await res2.json();
    return res.status(200).json({ assessments });
  } catch (err) {
    console.error('[admin/assessments]', err);
    return res.status(500).json({ error: err.message });
  }
}
