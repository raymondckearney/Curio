const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    // First try exact token match
    const byToken = await fetch(
      `${SUPABASE_URL}/rest/v1/assessments?token=eq.${encodeURIComponent(token)}&order=submitted_at.desc&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const tokenRows = await byToken.json();
    if (tokenRows.length) {
      return res.status(200).json({ found: true, type: tokenRows[0].type, name: tokenRows[0].name });
    }

    // Fallback: most recent assessment in the last 60 seconds
    // (handles case where token hidden field isn't configured in Typeform yet)
    const since = new Date(Date.now() - 60000).toISOString();
    const recent = await fetch(
      `${SUPABASE_URL}/rest/v1/assessments?submitted_at=gte.${encodeURIComponent(since)}&order=submitted_at.desc&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const recentRows = await recent.json();
    if (recentRows.length) {
      return res.status(200).json({ found: true, type: recentRows[0].type, name: recentRows[0].name });
    }

    return res.status(404).json({ found: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
