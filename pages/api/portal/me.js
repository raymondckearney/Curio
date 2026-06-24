import { getPortalSession } from '../../../lib/portalSession';
import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [users, accounts] = await Promise.all([
      dbGet('client_users', { id: session.userId }),
      dbGet('client_accounts', { id: session.accountId }),
    ]);
    if (!users.length || !accounts.length) return res.status(401).json({ error: 'User not found' });

    const user = users[0];
    const account = accounts[0];

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      account: { id: account.id, name: account.name, slug: account.slug, restrict_results: account.restrict_results },
    });
  } catch (err) {
    console.error('[portal/me]', err);
    return res.status(500).json({ error: err.message });
  }
}
