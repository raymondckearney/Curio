// Server-only. Single source of truth for which library_items collections
// an account/user can see, shared by pages/api/portal/library.js (listing)
// and pages/api/portal/library-file.js (downloads), so they can't drift
// apart on what counts as "licensed". Also resolves the caller's own
// profile and team/full access, used for the separate per-profile
// field-guide visibility rule (own guide always visible; all six with
// library_full or team/collection-E access) rather than the A-E
// collection check above, since field guides aren't collection-shaped.

import { dbGet, dbQuery } from './supabase';
import { tertiaryFromProfileSlug, COLLECTION_BY_TERTIARY } from './tertiary';

const ALL_COLLECTIONS = ['A', 'B', 'C', 'D', 'E'];

export async function getVisibleCollections(accountId, userId) {
  const [licenses, accountRows, userRows] = await Promise.all([
    dbGet('account_licenses', { account_id: accountId }),
    dbGet('client_accounts', { id: accountId }),
    dbGet('client_users', { id: userId }),
  ]);

  const now = new Date();
  const types = new Set(licenses.filter(l => !l.expires_at || new Date(l.expires_at) > now).map(l => l.type));
  const hasFull = types.has('library_full');

  const account = accountRows[0];
  const user = userRows[0];
  const tier = account?.tier || 'basic';
  const isOwner = user?.role === 'owner';

  // Resolve the caller's own profile and tertiary collection, if any.
  let tertiaryCollection = null;
  let profile = null;
  if (user?.email) {
    const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' });
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    if (tokenIds.length) {
      const assessments = await dbQuery('assessments', { token: `in.(${tokenIds.join(',')})`, select: 'email,type' });
      const mine = assessments.find(a => a.email === user.email);
      // assessments.type is stored lowercase ("why-what"); library_items.profile
      // and the field guide PDFs use uppercase-hyphenated ("WHY-WHAT").
      profile = mine?.type ? mine.type.toUpperCase() : null;
      const tertiary = mine?.type ? tertiaryFromProfileSlug(mine.type.toLowerCase()) : null;
      tertiaryCollection = tertiary ? COLLECTION_BY_TERTIARY[tertiary] : null;
    }
  }

  // Baseline access, free on every account, no license grant required:
  // Universal, plus the caller's own tertiary collection when resolvable.
  // Owners of enterprise (non-basic tier) accounts also default into Team.
  const defaultCollections = new Set(['D']);
  if (tertiaryCollection) defaultCollections.add(tertiaryCollection);
  if (tier !== 'basic' && isOwner) defaultCollections.add('E');

  // Admin-granted licenses (library_full, or per-collection keys) extend
  // access beyond that baseline.
  const licensedCollections = hasFull
    ? ALL_COLLECTIONS
    : ALL_COLLECTIONS.filter(c => types.has(`library_${c.toLowerCase()}`));

  const visibleCollections = ALL_COLLECTIONS.filter(c => defaultCollections.has(c) || licensedCollections.includes(c));

  // Team access mirrors collection E: an explicit library_e license, or the
  // free owner/non-basic-tier default computed into defaultCollections above.
  const hasTeamAccess = visibleCollections.includes('E');

  return { visibleCollections, tertiaryCollection, profile, hasFull, hasTeamAccess };
}
