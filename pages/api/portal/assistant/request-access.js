import { getPortalSession } from '../../../../lib/portalSession';
import { loadAssistantContext } from '../../../../lib/assistantCatalog';
import { assistantEnabled } from '../../../../lib/portalNav';
import { createAccessRequest } from '../../../../lib/accessRequests';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const itemId = typeof req.body?.itemId === 'string' ? req.body.itemId : '';
  const query = typeof req.body?.query === 'string' ? req.body.query.trim().slice(0, 500) : '';
  if (!itemId) return res.status(400).json({ error: 'itemId is required' });

  try {
    const ctx = await loadAssistantContext(session);
    if (!assistantEnabled(ctx.licenseTypes, ctx.isTeamAccount)) {
      return res.status(403).json({ error: 'The Curio Assistant is not enabled for this account.' });
    }
    const result = await createAccessRequest(ctx, itemId, { query, source: 'Curio Assistant' });
    if (result.error) return res.status(result.code).json({ error: result.error });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[assistant/request-access]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
