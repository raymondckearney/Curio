// pages/api/cron/keepalive.js
//
// Daily keepalive ping to prevent Supabase free-tier auto-pausing.
// Invoked by Vercel Cron (see vercel.json). Runs a trivial read against
// the tokens table via PostgREST, which registers as database activity.
//
// Env vars required (already set for the main app):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (or swap for the anon key if RLS allows a read)
//   CRON_SECRET                 (new — any random string; Vercel sends it automatically)

export default async function handler(req, res) {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  // This blocks random public hits to the endpoint.
  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ ok: false, error: 'Missing Supabase env vars' });
  }

  try {
    // Cheapest possible query: HEAD request, one row, count only.
    const response = await fetch(
      `${supabaseUrl}/rest/v1/tokens?select=id&limit=1`,
      {
        method: 'HEAD',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'count=exact',
        },
      }
    );

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: `Supabase responded ${response.status}`,
      });
    }

    return res.status(200).json({
      ok: true,
      pingedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
