import { dbGet, dbDelete, dbQuery } from '../../../lib/supabase';
import { getAdminSession } from '../../../lib/adminSession';

async function deleteByEmail(email, log) {
  const normalEmail = email.toLowerCase().trim();
  const users = await dbGet('client_users', { email: normalEmail });
  if (!users.length) { log.push(`No user found for email: ${normalEmail}`); return; }

  for (const user of users) {
    const accountId = user.account_id;
    await dbDelete('password_reset_tokens', { user_id: user.id }).catch(() => []);
    await dbDelete('client_users', { id: user.id }).catch(() => []);
    log.push(`  Deleted user ${normalEmail}`);

    if (accountId) {
      const remaining = await dbGet('client_users', { account_id: accountId });
      if (!remaining.length) {
        await dbDelete('account_licenses', { account_id: accountId }).catch(() => []);
        await dbDelete('tokens', { account_id: accountId }).catch(() => []);
        await dbDelete('client_accounts', { id: accountId }).catch(() => []);
        log.push(`  Deleted orphaned account (no remaining users)`);
      }
    }
  }
}

async function deleteToken(token, log) {
  const tokenRows = await dbGet('tokens', { token });
  if (!tokenRows.length) { log.push(`Token not found: ${token}`); return; }
  const accountId = tokenRows[0].account_id;

  const assessments = await dbDelete('assessments', { token }).catch(() => []);
  if (assessments.length) log.push(`  Deleted ${assessments.length} assessment row(s)`);

  await dbDelete('tokens', { token });
  log.push(`  Deleted token ${token}`);

  if (accountId) {
    const licenses = await dbDelete('account_licenses', { account_id: accountId }).catch(() => []);
    if (licenses.length) log.push(`  Deleted ${licenses.length} license(s)`);

    const users = await dbDelete('client_users', { account_id: accountId }).catch(() => []);
    if (users.length) log.push(`  Deleted ${users.length} portal user(s)`);

    await dbDelete('client_accounts', { id: accountId });
    log.push(`  Deleted portal account`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { tokens, engagement_id, email } = req.body;
  const log = [];

  try {
    if (email) {
      log.push(`Cleaning up by email: ${email}`);
      await deleteByEmail(email, log);
    } else if (engagement_id) {
      // Delete all tokens for an engagement
      const engTokens = await dbQuery('tokens', { engagement_id: `eq.${engagement_id}` });
      if (!engTokens.length) return res.status(404).json({ error: `No tokens found for engagement "${engagement_id}"` });
      log.push(`Found ${engTokens.length} token(s) for engagement "${engagement_id}"`);
      for (const t of engTokens) {
        log.push(`Token: ${t.token}`);
        await deleteToken(t.token, log);
      }
    } else if (tokens?.length) {
      for (const token of tokens) {
        log.push(`Token: ${token}`);
        await deleteToken(token, log);
      }
    } else {
      return res.status(400).json({ error: 'tokens array, engagement_id, or email is required' });
    }

    return res.status(200).json({ ok: true, log });
  } catch (err) {
    console.error('[admin/cleanup]', err);
    return res.status(500).json({ error: err.message || 'Cleanup failed' });
  }
}
