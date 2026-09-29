// Server-only. One access-request flow shared by the Curio Assistant and the
// Tools page's "More from Curio" cards: re-checks the item really is locked
// for this user, skips duplicates, saves it for Admin -> Assistant, and emails
// Curio (approver) and the account owner(s) (FYI).

import { dbGet, dbInsert, dbQuery } from './supabase';
import { buildCatalog } from './assistantCatalog';
import { dispatchEmailsForTrigger } from './emailTemplates';

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

// Returns { status: 'requested' | 'already_requested' | 'has_access' } or
// { error, code } for a request that can't be made.
export async function createAccessRequest(ctx, itemId, { query = '', source }) {
  const item = (await buildCatalog(ctx)).find(e => e.id === itemId);
  if (!item) return { error: 'Unknown item', code: 400 };
  if (!item.lock) return { status: 'has_access' };
  if (item.lock === 'profile') return { error: 'Complete your MindPrint assessment to unlock this.', code: 400 };

  const existing = await dbQuery('access_requests', {
    user_id: `eq.${ctx.userId}`, item_id: `eq.${item.id}`, status: 'eq.pending', select: 'id',
  });
  if (existing.length) return { status: 'already_requested' };

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
    query: query || `(requested from the ${source})`,
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
    source: esc(source),
    adminUrl: 'https://choosecurio.com/admin',
    ownerEmails,
  }).catch(e => console.error('[access-request] email failed:', e.message));

  return { status: 'requested' };
}
