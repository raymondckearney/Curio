import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery } from '../../../lib/supabase';
import { getVisibleCollections } from '../../../lib/libraryAccess';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { visibleCollections, tertiaryCollection, profile, hasFull, hasTeamAccess } =
      await getVisibleCollections(session.accountId, session.userId);

    const items = await dbQuery('library_items', {
      collection: `in.(${visibleCollections.join(',')})`,
      order: 'tool_num.asc',
      select: 'tool_num,collection,title,support_mode,summary',
    });

    const defaultCollection = tertiaryCollection && visibleCollections.includes(tertiaryCollection)
      ? tertiaryCollection
      : (visibleCollections.includes('D') ? 'D' : visibleCollections[0]);

    // Field guides are per-profile, not collection-shaped: own guide is
    // always visible with a completed assessment; all six with library_full
    // or team access; unassessed callers with neither see none.
    const allGuides = await dbQuery('library_items', {
      item_type: 'eq.field_guide',
      order: 'profile.asc',
      select: 'profile,title,onepager_path',
    });
    const fieldGuides = (hasFull || hasTeamAccess) ? allGuides : allGuides.filter(g => g.profile === profile);

    return res.status(200).json({ items, visibleCollections, defaultCollection, fieldGuides, ownProfile: profile });
  } catch (err) {
    console.error('[portal/library]', err);
    return res.status(500).json({ error: err.message });
  }
}
