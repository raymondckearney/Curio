import { Resend } from 'resend';
import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet, dbPatch } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'Email not configured' });

  try {
    const [userRows, tokens] = await Promise.all([
      dbGet('client_users', { id: session.userId }),
      dbQuery('tokens', { account_id: `eq.${session.accountId}`, select: 'token,used,email,purpose' }),
    ]);
    const user = userRows[0];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const myToken = tokens.find(t => t.purpose === 'assessment' && !t.used && (t.email === user.email || !t.email));
    if (!myToken) return res.status(404).json({ error: "We couldn't find an assessment waiting on your account. Contact hello@choosecurio.com." });

    if (!myToken.email) {
      await dbPatch('tokens', { token: myToken.token }, { email: user.email });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.choosecurio.com';
    const url = `${baseUrl}/go/${myToken.token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Curio <hello@choosecurio.com>',
      to: user.email,
      subject: 'Your MindPrint™ Assessment Link',
      html: `<!DOCTYPE html>
<html>
<head><style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap');</style></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
      <p style="margin:0 0 16px;line-height:1.7;color:#0F172A">Here's your MindPrint™ assessment link, requested from your Curio account.</p>
      <a href="${url}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Start Your Assessment →</a>
      <p style="margin:20px 0 0;font-size:0.8rem;color:#94A3B8">This link is single-use and tied to your account.</p>
    </div>
  </div>
</body>
</html>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[portal/resend-assessment]', err);
    return res.status(500).json({ error: err.message });
  }
}
