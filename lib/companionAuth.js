// Server-only. Shared getServerSideProps logic for the Companion pages.

import { getPortalSession } from './portalSession';
import { getAdminSession } from './adminSession';
import { dbGet, dbQuery } from './supabase';
import { tertiaryFromProfileSlug } from './tertiary';

export async function loadCompanionProps(req, licenseKey) {
  const session = getPortalSession(req);
  if (!session) return { redirect: true };

  const { accountId, userId } = session;
  const [allLicenses, userRows, accountRows] = await Promise.all([
    dbGet('account_licenses', { account_id: accountId }),
    dbGet('client_users', { id: userId }),
    dbGet('client_accounts', { id: accountId }),
  ]);

  const now = new Date();
  const activeLicenses = allLicenses.filter(l => !l.expires_at || new Date(l.expires_at) > now);
  const hasLicense = activeLicenses.some(l => l.type === licenseKey);
  const isAdmin = !!getAdminSession(req);
  if (!hasLicense && !isAdmin) return { redirect: false, locked: true };

  const user = userRows[0];
  const account = accountRows[0];
  let profile = null;
  let isIndividual = false;
  if (user?.email) {
    const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' });
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    if (tokenIds.length) {
      const assessments = await dbQuery('assessments', { token: `in.(${tokenIds.join(',')})`, select: 'email,type' });
      const mine = assessments.find(a => a.email === user.email) || null;
      if (mine?.type) profile = mine.type.toUpperCase();
      // Matches dashboard.js's definition, for consistent sidebar filtering
      // (enterprise-only nav items) as the user moves between pages.
      isIndividual = !!(mine || assessments[0] || null);
    }
  }

  const tertiary = profile ? tertiaryFromProfileSlug(profile.toLowerCase()) : null;
  const me = user
    ? { user: { id: user.id, email: user.email, name: user.name, role: user.role }, account: { id: accountId, name: account?.name || '' } }
    : null;

  return {
    redirect: false, locked: false, isAdmin, profile, tertiary, hasProfile: !!profile,
    me, licenses: activeLicenses, isIndividual,
  };
}
