import { getPortalSession } from '../../../../lib/portalSession';
import { dbGet, dbInsert, dbQuery } from '../../../../lib/supabase';
import { loadAssistantContext, buildCatalog } from '../../../../lib/assistantCatalog';
import { assistantEnabled } from '../../../../lib/portalNav';
import { dispatchEmailsForTrigger } from '../../../../lib/emailTemplates';

const REASON_TEXT = {
  license: 'Not included in their account yet',
  team: 'Needs a team account',
  role: 'Only available to account owners and managers',
};
const KIND_TEXT = { tool: 'Portal tool', resource: 'Library resource', field_guide: 'Field guide' };

// Email templates substitute {{vars}} into HTML as-is, so anything a user
// typed must be escaped first.
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

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

    const item = (await buildCatalog(ctx)).find(e => e.id === itemId);
    if (!item) return res.status(400).json({ error: 'Unknown item' });
    if (!item.lock) return res.status(200).json({ status: 'has_access' });
    if (item.lock === 'profile') return res.status(400).json({ error: 'Complete your MindPrint assessment to unlock this.' });

    const existing = await dbQuery('access_requests', {
      user_id: `eq.${ctx.userId}`, item_id: `eq.${item.id}`, status: 'eq.pending', select: 'id',
    });
    if (existing.length) return res.status(200).json({ status: 'already_requested' });

    await dbInsert('access_requests', {
      account_id: ctx.accountId,
      user_id: ctx.userId,
      user_email: ctx.user.email || null,
      user_name: ctx.user.name || null,
      item_id: item.id,
      item_name: item.name,
      item_kind: item.kind,
      lock_reason: item.lock,
      grant_license: item.grant,
      query: query || null,
    });

    const [accountRows, owners] = await Promise.all([
      dbGet('client_accounts', { id: ctx.accountId }),
      dbQuery('client_users', { account_id: `eq.${ctx.accountId}`, role: 'eq.owner', select: 'id,email' }),
    ]);
    const ownerEmails = owners.filter(o => o.id !== ctx.userId && o.email).map(o => o.email).join(',');

    await dispatchEmailsForTrigger('assistant_access_request', {
      requesterName: esc(ctx.user.name || ctx.user.email),
      requesterEmail: esc(ctx.user.email),
      accountName: esc(accountRows[0]?.name || ''),
      itemName: esc(item.name),
      itemKind: esc(KIND_TEXT[item.kind] || item.kind),
      reason: esc(REASON_TEXT[item.lock] || item.lock),
      userQuery: esc(query || '(none)'),
      adminUrl: 'https://choosecurio.com/admin',
      ownerEmails,
    }).catch(e => console.error('[assistant/request-access] email failed:', e.message));

    return res.status(200).json({ status: 'requested' });
  } catch (err) {
    console.error('[assistant/request-access]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
