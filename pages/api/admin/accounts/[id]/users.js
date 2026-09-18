import crypto from 'crypto';
import { getAdminSession } from '../../../../../lib/adminSession';
import { dbGet, dbInsert, dbDelete, dbPatch, dbQuery } from '../../../../../lib/supabase';
import { hashPassword } from '../../../../../lib/password';
import { dispatchEmailsForTrigger } from '../../../../../lib/emailTemplates';

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;

  // POST — add a new portal login to this existing account and email them a
  // "set up your account" link (the same admin_invite template used to
  // stand up a brand-new account in accounts/invite.js). This replaced the
  // owner-facing "Invite a Team Member" form on /portal/team — creating a
  // new login (with no assessment required) is an admin-only action now.
  if (req.method === 'POST') {
    const { email, name, role = 'member', team_id } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    const normalEmail = email.toLowerCase().trim();

    try {
      const existing = await dbGet('client_users', { email: normalEmail });
      if (existing.length) return res.status(409).json({ error: 'A user with that email already exists.' });

      const tempHash = await hashPassword(crypto.randomUUID());
      const [newUser] = await dbInsert('client_users', {
        account_id: accountId,
        email: normalEmail,
        name: name?.trim() || null,
        role,
        team_id: team_id || null,
        password_hash: tempHash,
      });

      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await dbInsert('password_reset_tokens', {
        token: resetToken,
        user_id: newUser.id,
        expires_at: expiresAt,
        used: false,
      });

      const accounts = await dbGet('client_accounts', { id: accountId });
      const accountName = accounts[0]?.name || 'your team';
      const setupUrl = `https://choosecurio.com/portal/reset-password?token=${resetToken}`;
      await dispatchEmailsForTrigger('admin_invite', {
        name: name?.trim() || '',
        email: normalEmail,
        inviteUrl: setupUrl,
        licenseList: `<p style="font-size:0.9rem;color:#374151;margin:0 0 20px">You've been added to <strong>${accountName}</strong>.</p>`,
      });

      const { password_hash, ...safe } = newUser;
      return res.status(201).json({ user: safe });
    } catch (err) {
      const msg = err.message.includes('unique') ? 'That email already has an account' : err.message;
      return res.status(400).json({ error: msg });
    }
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
      await dbDelete('client_users', { id: userId });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — update role, team assignment, or reset password
  if (req.method === 'PATCH') {
    const { userId, role, password, team_id } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const update = {};
    if (role) update.role = role;
    // team_id is explicitly nullable (moving someone back to unassigned), so
    // check for the key's presence rather than truthiness.
    if ('team_id' in (req.body || {})) update.team_id = team_id || null;
    if (password) update.password_hash = await hashPassword(password);
    if (!Object.keys(update).length) return res.status(400).json({ error: 'Nothing to update' });
    try {
      await dbPatch('client_users', { id: userId }, update);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
