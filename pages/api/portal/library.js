import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbQuery } from '../../../lib/supabase';
import { tertiaryFromProfileSlug, COLLECTION_BY_TERTIARY } from '../../../lib/tertiary';

const LIBRARY_KEYS = ['library_full', 'library_a', 'library_b', 'library_c', 'library_d', 'library_e'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, userId } = session;

  try {
    const licenses = await dbGet('account_licenses', { account_id: accountId });
    const now = new Date();
    const types = new Set(licenses.filter(l => !l.expires_at || new Date(l.expires_at) > now).map(l => l.type));
    const hasFull = types.has('library_full');

    if (!hasFull && !LIBRARY_KEYS.some(k => types.has(k))) {
      return res.status(403).json({ error: 'The Client Library is not licensed on your account.' });
    }

    const visibleCollections = hasFull
      ? ['A', 'B', 'C', 'D', 'E']
      : ['D', ...['A', 'B', 'C', 'E'].filter(c => types.has(`library_${c.toLowerCase()}`))];

    const items = await dbQuery('library_items', {
      collection: `in.(${visibleCollections.join(',')})`,
      order: 'tool_num.asc',
      select: 'tool_num,collection,title,support_mode,summary',
    });

    const userRows = await dbGet('client_users', { id: userId });
    const user = userRows[0];
    let defaultCollection = visibleCollections.includes('D') ? 'D' : visibleCollections[0];

    if (user?.email) {
      const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' });
      const tokenIds = tokens.map(t => t.token).filter(Boolean);
      if (tokenIds.length) {
        const assessments = await dbQuery('assessments', { token: `in.(${tokenIds.join(',')})`, select: 'email,type' });
        const mine = assessments.find(a => a.email === user.email);
        const tertiary = mine?.type ? tertiaryFromProfileSlug(mine.type.toLowerCase()) : null;
        const tertiaryCollection = tertiary ? COLLECTION_BY_TERTIARY[tertiary] : null;
        if (tertiaryCollection && visibleCollections.includes(tertiaryCollection)) defaultCollection = tertiaryCollection;
      }
    }

    return res.status(200).json({ items, visibleCollections, defaultCollection });
  } catch (err) {
    console.error('[portal/library]', err);
    return res.status(500).json({ error: err.message });
  }
}
