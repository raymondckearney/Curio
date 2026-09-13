import { verifyUnsubscribeToken } from '../../lib/unsubscribe';
import { dbPatch } from '../../lib/supabase';

function page(message) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Curio</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="max-width:440px;padding:40px;text-align:center">
    <p style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#0F172A;margin:0 0 20px">Curio<span style="color:#059669">.</span></p>
    <p style="color:#0F172A;font-size:15px;line-height:1.6;margin:0">${message}</p>
  </div>
</body></html>`;
}

// Public, no-login-required — the whole point of a one-click unsubscribe
// link. Only ever flips the weekly-tip flag; never touches transactional
// emails (renewals, invites, etc.), which don't have an opt-out.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');

  const { u } = req.query;
  const userId = u ? verifyUnsubscribeToken(u) : null;
  if (!userId) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(page("This unsubscribe link isn't valid. If you'd still like to stop receiving these emails, reply and let us know."));
  }

  try {
    await dbPatch('client_users', { id: userId }, { weekly_tip_opt_out: true });
  } catch (err) {
    console.error('[unsubscribe]', err.message);
  }

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(page("You're unsubscribed from the weekly profile tip email. You won't receive any more of these."));
}
