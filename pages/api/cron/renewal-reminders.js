import { dbQuery } from '../../../lib/supabase';
import { Resend } from 'resend';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (!resend) return res.status(500).json({ ok: false, error: 'RESEND_API_KEY not set' });

  const now = new Date();
  const in29 = new Date(now.getTime() + 29 * 86400000).toISOString();
  const in31 = new Date(now.getTime() + 31 * 86400000).toISOString();
  const ago24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  let sent30 = 0;
  let sentExpired = 0;

  try {
    // 30-day warning: licenses expiring in next 29–31 days
    const expiringSoon = await dbQuery('account_licenses', {
      expires_at: `gte.${in29}`,
      select: 'account_id,expires_at',
    }).catch(() => []);

    const soonFiltered = expiringSoon.filter(l => new Date(l.expires_at) <= new Date(in31));

    // Dedupe by account_id, pick earliest expiry
    const soonByAccount = {};
    for (const l of soonFiltered) {
      if (!soonByAccount[l.account_id] || new Date(l.expires_at) < new Date(soonByAccount[l.account_id].expires_at)) {
        soonByAccount[l.account_id] = l;
      }
    }

    for (const [accountId, license] of Object.entries(soonByAccount)) {
      const users = await dbQuery('client_users', { account_id: `eq.${accountId}`, select: 'email,name', order: 'created_at.asc' }).catch(() => []);
      const primaryUser = users[0];
      if (!primaryUser?.email) continue;

      const expiryDate = new Date(license.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const renewalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://choosecurio.com'}/portal/dashboard`;

      await resend.emails.send({
        from: 'Curio <hello@choosecurio.com>',
        to: primaryUser.email,
        subject: 'Your Curio access expires in 30 days',
        html: `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#F8FAFC;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#0F172A;padding:24px 32px"><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span></div>
  <div style="padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi ${primaryUser.name || 'there'},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access is set to expire on <strong>${expiryDate}</strong>. Renew now to keep uninterrupted access to your MindPrint™ tools and resources.</p>
    <a href="${renewalUrl}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Renew Access →</a>
    <p style="margin:24px 0 0;color:#64748B;font-size:14px">Questions? Reply to this email or contact <a href="mailto:hello@choosecurio.com" style="color:#059669">hello@choosecurio.com</a>.</p>
  </div>
</div></body></html>`,
      }).catch(err => console.error('[renewal-reminders] 30-day email failed:', err));
      sent30++;
    }

    // Expired today: licenses that expired in the last 24 hours
    const justExpired = await dbQuery('account_licenses', {
      expires_at: `gte.${ago24}`,
      select: 'account_id,expires_at',
    }).catch(() => []);

    const expiredFiltered = justExpired.filter(l => new Date(l.expires_at) <= now);

    const expiredByAccount = {};
    for (const l of expiredFiltered) {
      if (!expiredByAccount[l.account_id]) expiredByAccount[l.account_id] = l;
    }

    for (const [accountId] of Object.entries(expiredByAccount)) {
      const users = await dbQuery('client_users', { account_id: `eq.${accountId}`, select: 'email,name', order: 'created_at.asc' }).catch(() => []);
      const primaryUser = users[0];
      if (!primaryUser?.email) continue;

      const renewalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://choosecurio.com'}/portal/dashboard`;

      await resend.emails.send({
        from: 'Curio <hello@choosecurio.com>',
        to: primaryUser.email,
        subject: 'Your Curio access has expired',
        html: `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#F8FAFC;margin:0;padding:0">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#0F172A;padding:24px 32px"><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span></div>
  <div style="padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Hi ${primaryUser.name || 'there'},</p>
    <p style="margin:0 0 16px;color:#0F172A;font-size:15px">Your Curio access has expired. Renew to regain access to your MindPrint™ tools and resources.</p>
    <a href="${renewalUrl}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Renew Now →</a>
    <p style="margin:24px 0 0;color:#64748B;font-size:14px">Questions? Reply to this email or contact <a href="mailto:hello@choosecurio.com" style="color:#059669">hello@choosecurio.com</a>.</p>
  </div>
</div></body></html>`,
      }).catch(err => console.error('[renewal-reminders] expired email failed:', err));
      sentExpired++;
    }

    return res.status(200).json({ ok: true, sent30, sentExpired });
  } catch (err) {
    console.error('[renewal-reminders]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
