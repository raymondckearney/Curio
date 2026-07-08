// Server-only. Shared getServerSideProps logic for the Companion pages.

import { getPortalSession } from './portalSession';
import { getAdminSession } from './adminSession';
import { dbGet, dbQuery } from './supabase';
import { tertiaryFromProfileSlug } from './tertiary';

export async function loadCompanionProps(req, licenseKey) {
  const session = getPortalSession(req);
  if (!session) return { redirect: true };

  const { accountId, userId } = session;
  const [licenses, userRows] = await Promise.all([
    dbGet('account_licenses', { account_id: accountId, type: licenseKey }),
    dbGet('client_users', { id: userId }),
  ]);

  const now = new Date();
  const hasLicense = licenses.some(l => !l.expires_at || new Date(l.expires_at) > now);
  const isAdmin = !!getAdminSession(req);
  if (!hasLicense && !isAdmin) return { redirect: false, locked: true };

  const user = userRows[0];
  let profile = null;
  if (user?.email) {
    const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' });
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    if (tokenIds.length) {
      const assessments = await dbQuery('assessments', { token: `in.(${tokenIds.join(',')})`, select: 'email,type' });
      const mine = assessments.find(a => a.email === user.email);
      if (mine?.type) profile = mine.type.toUpperCase();
    }
  }

  const tertiary = profile ? tertiaryFromProfileSlug(profile.toLowerCase()) : null;
  return { redirect: false, locked: false, isAdmin, profile, tertiary, hasProfile: !!profile };
}
