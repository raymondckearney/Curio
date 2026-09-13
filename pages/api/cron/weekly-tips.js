import { dbQuery, dbGet, dbPatch, dbInsert } from '../../../lib/supabase';
import { dispatchEmailsForTrigger } from '../../../lib/emailTemplates';
import { resolveMyProfile } from '../../../lib/ownProfile';
import { getSetting } from '../../../lib/appSettings';
import { unsubscribeUrl } from '../../../lib/unsubscribe';
import { WEEKLY_TIPS, TIPS_PER_PROFILE } from '../../../lib/weeklyTips';
import profiles from '../../../lib/profiles';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!process.env.RESEND_API_KEY) return res.status(500).json({ ok: false, error: 'RESEND_API_KEY not set' });

  const enabled = (await getSetting('weekly_tips_enabled', 'false')) === 'true';
  if (!enabled) {
    return res.status(200).json({ ok: true, skipped: 'weekly_tips_enabled is off', sent: 0 });
  }

  let sent = 0;
  let skippedOptOut = 0;
  let skippedNoProfile = 0;
  let skippedComplete = 0;
  let errors = 0;

  try {
    // One account at a time, same loop shape as cron/renewal-reminders.js —
    // this app's established convention for a nightly/weekly batch job over
    // client_accounts, not a single giant cross-account join.
    const accounts = await dbQuery('client_accounts', { select: 'id' }).catch(() => []);

    for (const account of accounts) {
      const [tokens, users] = await Promise.all([
        dbQuery('tokens', { account_id: `eq.${account.id}`, select: 'token' }).catch(() => []),
        dbQuery('client_users', {
          account_id: `eq.${account.id}`,
          select: 'id,name,email,tip_index,weekly_tip_opt_out',
        }).catch(() => []),
      ]);
      if (!users.length) continue;

      const tokenIds = tokens.map(t => t.token).filter(Boolean);

      for (const user of users) {
        if (user.weekly_tip_opt_out) { skippedOptOut++; continue; }
        if ((user.tip_index || 0) >= TIPS_PER_PROFILE) { skippedComplete++; continue; }

        const { myAssessment } = await resolveMyProfile(tokenIds, user.email);
        const profileSlug = myAssessment?.type?.toLowerCase();
        const tips = profileSlug ? WEEKLY_TIPS[profileSlug] : null;
        if (!tips) { skippedNoProfile++; continue; }

        const tipIndex = user.tip_index || 0;
        const tip = tips[tipIndex];
        if (!tip) { skippedComplete++; continue; }

        const profile = profiles[profileSlug];

        try {
          await dispatchEmailsForTrigger('cron_weekly_tip', {
            name: user.name || 'there',
            email: user.email,
            profileLabel: profileSlug.toUpperCase(),
            profileTagline: (profile?.tagline || '').replace(/,\s*/g, ' · '),
            tipNumber: tip.number,
            tipHeadline: tip.headline,
            tipBody: tip.body,
            unsubscribeUrl: unsubscribeUrl(user.id),
          });

          await Promise.all([
            dbPatch('client_users', { id: user.id }, { tip_index: tipIndex + 1 }),
            dbInsert('weekly_tip_sends', { user_id: user.id, profile_slug: profileSlug, tip_number: tip.number }),
          ]);
          sent++;
        } catch (err) {
          console.error('[cron/weekly-tips] send failed for', user.email, err.message);
          errors++;
        }
      }
    }

    return res.status(200).json({ ok: true, sent, skippedOptOut, skippedNoProfile, skippedComplete, errors });
  } catch (err) {
    console.error('[cron/weekly-tips]', err);
    return res.status(500).json({ ok: false, error: err.message, sent });
  }
}
