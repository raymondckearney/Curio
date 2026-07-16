import { getPortalSession } from '../../../lib/portalSession';
import { dbGet } from '../../../lib/supabase';
import { createSignedUrl } from '../../../lib/supabaseStorage';
import { getVisibleCollections } from '../../../lib/libraryAccess';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { toolNum, profile: profileParam, kind } = req.query;

  if (profileParam) {
    try {
      const guides = await dbGet('library_items', { item_type: 'field_guide', profile: profileParam });
      const guide = guides[0];
      if (!guide) return res.status(404).json({ error: 'Not found' });

      const { profile, hasFull, hasTeamAccess } = await getVisibleCollections(session.accountId, session.userId);
      if (!(hasFull || hasTeamAccess || profile === guide.profile)) {
        return res.status(403).json({ error: 'Not licensed for this field guide.' });
      }

      const url = await createSignedUrl('library', guide.onepager_path, 60);
      return res.status(200).json({ url });
    } catch (err) {
      console.error('[portal/library-file]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (!toolNum || !['onepager', 'kit'].includes(kind)) {
    return res.status(400).json({ error: 'toolNum and kind are required' });
  }

  try {
    const items = await dbGet('library_items', { tool_num: toolNum });
    const item = items[0];
    if (!item) return res.status(404).json({ error: 'Not found' });

    const { visibleCollections } = await getVisibleCollections(session.accountId, session.userId);
    if (!visibleCollections.includes(item.collection)) {
      return res.status(403).json({ error: 'Not licensed for this collection.' });
    }

    const path = kind === 'kit' ? item.kit_path : item.onepager_path;
    if (!path) return res.status(404).json({ error: 'File not available' });

    const url = await createSignedUrl('library', path, 60);
    return res.status(200).json({ url });
  } catch (err) {
    console.error('[portal/library-file]', err);
    return res.status(500).json({ error: err.message });
  }
}
