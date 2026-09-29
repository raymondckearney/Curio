import { getPortalSession } from '../../../lib/portalSession';
import { loadAssistantContext } from '../../../lib/assistantCatalog';
import { createAccessRequest } from '../../../lib/accessRequests';

// Tools page "More from Curio": Request access for a tool the account doesn't
// have. Open to any logged-in user (unlike the assistant's own endpoint).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const itemId = typeof req.body?.itemId === 'string' ? req.body.itemId : '';
  if (!itemId.startsWith('tool:')) return res.status(400).json({ error: 'itemId must be a tool' });

  try {
    const ctx = await loadAssistantContext(session);
    const result = await createAccessRequest(ctx, itemId, { source: 'Tools page' });
    if (result.error) return res.status(result.code).json({ error: result.error });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[portal/request-access]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
