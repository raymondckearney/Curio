import crypto from 'crypto';
import { Resend } from 'resend';
import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbInsert, dbQuery, dbDelete } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/password';

export default async function handler(req, res) {
  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, role } = session;

  // GET — return all team members + their assessment status
  if (req.method === 'GET') {
    try {
      const [users, tokens] = await Promise.all([
        dbQuery('client_users', { account_id: `eq.${accountId}`, select: 'id,email,name,role,last_login_at,created_at', order: 'created_at.asc' }),
        dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,email,used,used_at,link_sent_at,name' }),
      ]);

      // Build a map of email → token status
      const tokenByEmail = {};
      for (const t of tokens) {
        if (t.email) tokenByEmail[t.email.toLowerCase()] = t;
      }

      // Fetch assessments for completed tokens
      const usedTokenIds = tokens.filter(t => t.used).map(t => t.token);
      const assessmentMap = {};
      if (usedTokenIds.length) {
        const assessments = await dbQuery('assessments', {
          token: `in.(${usedTokenIds.join(',')})`,
          select: 'token,type,submitted_at',
        }).catch(() => []);
        for (const a of assessments) assessmentMap[a.token] = a;
      }

      const enriched = users.map(u => {
        const tok = tokenByEmail[u.email.toLowerCase()];
        const assessment = tok ? assessmentMap[tok.token] : null;
        return {
          ...u,
          token_status: assessment ? 'completed' : tok ? (tok.link_sent_at ? 'invited' : 'assigned') : 'no_token',
          assessment_type: assessment?.type || null,
          completed_at: assessment?.submitted_at || null,
          invited_at: tok?.link_sent_at || null,
        };
      });

      // Token pool summary
      const total = tokens.length;
      const available = tokens.filter(t => !t.email && !t.used).length;
      const sent = tokens.filter(t => t.email && !t.used).length;
      const completed = tokens.filter(t => t.used).length;

      return res.status(200).json({ members: enriched, tokenPool: { total, available, sent, completed } });
    } catch (err) {
      console.error('[portal/team GET]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — invite a new member (owner only)
  if (req.method === 'POST') {
    if (role !== 'owner') return res.status(403).json({ error: 'Only owners can invite team members.' });

    const { email, name, memberRole = 'member' } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    const normalEmail = email.toLowerCase().trim();

    try {
      // Check not already a user
      const existing = await dbGet('client_users', { email: normalEmail });
      if (existing.length) return res.status(409).json({ error: 'A user with that email already exists.' });

      // Create user with a placeholder password (they'll set it via the invite link)
      const tempHash = await hashPassword(crypto.randomUUID());
      const [newUser] = await dbInsert('client_users', {
        account_id: accountId,
        email: normalEmail,
        name: name?.trim() || null,
        role: memberRole,
        password_hash: tempHash,
      });

      // Generate a password reset token for the "set up your account" link
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await dbInsert('password_reset_tokens', {
        token: resetToken,
        user_id: newUser.id,
        expires_at: expiresAt,
        used: false,
      });

      // Get account name
      const accounts = await dbGet('client_accounts', { id: accountId });
      const accountName = accounts[0]?.name || 'your team';

      // Send invite email
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const setupUrl = `https://choosecurio.com/portal/reset-password?token=${resetToken}`;
        const greeting = name?.trim() ? `Hi ${name.trim()},` : 'Hi there,';
        await resend.emails.send({
          from: 'Curio <hello@choosecurio.com>',
          to: normalEmail,
          subject: `You've been added to ${accountName} on Curio`,
          html: `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#fff">Curio<span style="color:#059669">.</span></span>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">
      <p style="font-size:1rem;font-weight:600;color:#0F172A;margin:0 0 12px">${greeting}</p>
      <p style="font-size:0.9rem;color:#374151;line-height:1.7;margin:0 0 24px">
        You've been added to <strong>${accountName}</strong> on Curio. Click the button below to set your password and access your account.
      </p>
      <a href="${setupUrl}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Set Up Your Account →</a>
      <p style="font-size:0.8rem;color:#94A3B8;margin:24px 0 0;line-height:1.6">This link expires in 7 days. If you have any questions, reply to this email.</p>
    </div>
  </div>
</body></html>`,
        });
      }

      const { password_hash, ...safeUser } = newUser;
      return res.status(201).json({ user: safeUser });
    } catch (err) {
      console.error('[portal/team POST]', err);
      const msg = err.message.includes('unique') ? 'A user with that email already exists.' : err.message;
      return res.status(400).json({ error: msg });
    }
  }

  // DELETE — remove a member (owner only)
  if (req.method === 'DELETE') {
    if (role !== 'owner') return res.status(403).json({ error: 'Only owners can remove team members.' });
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Prevent removing self
    if (userId === session.userId) return res.status(400).json({ error: 'You cannot remove yourself.' });

    try {
      // Verify user belongs to this account
      const users = await dbGet('client_users', { id: userId });
      if (!users.length || users[0].account_id !== accountId) return res.status(404).json({ error: 'User not found.' });

      await dbDelete('client_users', { id: userId });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
