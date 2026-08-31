import { dbGet, dbInsert, dbPatch, dbQuery } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/password';
import { createSessionToken, sessionCookie } from '../../../lib/portalSession';
import { syncContactToNotion } from '../../../lib/notionSync';
import { tertiaryFromProfileSlug, resolveGrantedTools } from '../../../lib/tertiary';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, stripe_session_id, token: assessmentToken } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const normalEmail = email.toLowerCase().trim();

  // Check if email already registered
  const existing = await dbGet('client_users', { email: normalEmail });
  if (existing.length) {
    return res.status(400).json({ error: 'An account with that email already exists. Try logging in.' });
  }

  // If this signup is completing a token that already belongs to an
  // existing account (an owner distributed it from their team's token
  // pool — see pages/api/portal/send-token.js), join that account as a
  // member instead of spinning off a brand-new, disconnected one.
  // Otherwise the token/assessment silently vanishes from the owner's
  // team tracking (Sent Tokens, Assessment Results, Analytics) the moment
  // the recipient finishes signing up, since it would get reassigned away
  // from the owner's account_id to a new one nobody on the team can see.
  let tokenRowForSignup = null;
  let tokenWasAlreadyUsed = false;
  let teamAccountId = null;
  if (assessmentToken) {
    const tokenRows = await dbGet('tokens', { token: assessmentToken });
    if (tokenRows.length && !tokenRows[0].used) {
      tokenRowForSignup = tokenRows[0];
      if (tokenRowForSignup.account_id) teamAccountId = tokenRowForSignup.account_id;
    } else if (tokenRows.length && tokenRows[0].used) {
      tokenWasAlreadyUsed = true;
    }
  }

  let account;
  let userRole = 'owner';
  if (teamAccountId) {
    const teamAccounts = await dbGet('client_accounts', { id: teamAccountId });
    if (teamAccounts.length) {
      account = teamAccounts[0];
      userRole = 'member';
    }
  }
  if (!account) {
    // Create account (unchanged self-serve / personal path)
    const slug = normalEmail.split('@')[0].replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    [account] = await dbInsert('client_accounts', {
      name: name.trim(),
      slug,
      notes: stripe_session_id ? `Self-serve purchase: ${stripe_session_id}` : 'Self-serve signup',
    });
  }

  // Create user
  const hash = await hashPassword(password);
  const [user] = await dbInsert('client_users', {
    account_id: account.id,
    email: normalEmail,
    name: name.trim(),
    role: userRole,
    password_hash: hash,
  });

  // Link tokens to this account.
  // Primary: match by email on the tokens table (set by webhook from buyer_email)
  // Fallback: match by engagement_id via purchases table (requires purchases table to exist)
  try {
    const emailTokens = await dbQuery('tokens', {
      email: `eq.${normalEmail}`,
      account_id: 'is.null',
    });
    if (emailTokens.length) {
      await Promise.all(
        emailTokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: account.id }))
      );
    } else if (stripe_session_id) {
      // Fallback: try purchases table
      const purchases = await dbGet('purchases', { stripe_session_id }).catch(() => []);
      if (purchases.length) {
        const { engagement_id } = purchases[0];
        const engTokens = await dbQuery('tokens', {
          engagement_id: `eq.${engagement_id}`,
          account_id: 'is.null',
        }).catch(() => []);
        await Promise.all(
          engTokens.map(t => dbPatch('tokens', { token: t.token }, { account_id: account.id }))
        );
      }
    }
  } catch (err) {
    console.error('[auth/signup] token linking failed:', err.message);
  }

  syncContactToNotion({ name: name.trim(), email: normalEmail, source: 'self-signup' });

  // Apply assessment token: set granted tier, write licenses, and consume.
  // Reuses tokenRowForSignup fetched above rather than re-querying — that
  // same lookup is what decided whether this signup joined an existing
  // team account or created a new one.
  if (assessmentToken) {
    try {
      if (tokenRowForSignup) {
        const tr = tokenRowForSignup;
        const grantedTier = tr.granted_tier || 'basic';
        const grantedTools = tr.granted_tools || (grantedTier === 'premium'
          ? ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer']
          : ['assessment_tokens']);
        const usedAt = new Date().toISOString();

        // Resolve the just-completed assessment's tertiary so the
        // companion_match/library_match sentinel types (granted when the
        // token was created, before anyone knew this person's profile)
        // become the concrete license type to actually insert.
        const assessmentRows = await dbGet('assessments', { token: assessmentToken }).catch(() => []);
        const assessment = assessmentRows[0];
        const tertiary = assessment?.type ? tertiaryFromProfileSlug(assessment.type.toLowerCase()) : null;
        const resolvedTools = resolveGrantedTools(grantedTools, tertiary);

        // Joining an existing team account: don't let one member's token
        // overwrite the account's tier, and don't duplicate license rows
        // the account already has (it's account-wide, shared by everyone
        // on the team, not per-member).
        const writes = [
          dbPatch('tokens', { token: assessmentToken }, { used: true, used_at: usedAt, account_id: account.id }),
        ];
        if (teamAccountId) {
          const existingLicenses = await dbQuery('account_licenses', { account_id: `eq.${account.id}`, select: 'type' }).catch(() => []);
          const existingTypes = new Set(existingLicenses.map(l => l.type));
          const newTools = resolvedTools.filter(type => !existingTypes.has(type));
          writes.push(...newTools.map(type => dbInsert('account_licenses', {
            account_id: account.id,
            type,
            quantity: 1,
            expires_at: tr.expires_at || null,
          })));
        } else {
          writes.push(
            dbPatch('client_accounts', { id: account.id }, { tier: grantedTier }),
            ...resolvedTools.map(type => dbInsert('account_licenses', {
              account_id: account.id,
              type,
              quantity: 1,
              expires_at: tr.expires_at || null,
            })),
          );
        }
        await Promise.all(writes);

        // Send assessment completion notification
        try {
          if (process.env.RESEND_API_KEY) {
            const profileType = assessment?.type || '—';
            const completedAt = new Date(usedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' });
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'Curio <notifications@choosecurio.com>',
              to: 'raymondckearney@gmail.com',
              subject: `MindPrint™ Assessment Completed — ${name.trim()}`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0F172A">
                  <h2 style="margin-bottom:4px">MindPrint™ Assessment Completed</h2>
                  <p style="color:#64748B;margin-top:0">A participant has finished their assessment and created an account.</p>
                  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:0.95rem">
                    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B;width:40%">Participant</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600">${name.trim()}</td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Email</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${normalEmail}</td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">MindPrint™ Profile</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600;text-transform:uppercase;color:#059669">${profileType}</td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Engagement</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${tr.engagement_id || '—'}</td></tr>
                    <tr><td style="padding:10px 0;color:#64748B">Completed</td><td style="padding:10px 0">${completedAt} ET</td></tr>
                  </table>
                  <a href="https://www.choosecurio.com/admin" style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:0.9rem">View in Admin →</a>
                </div>
              `,
            });
          }
        } catch (emailErr) {
          console.error('[auth/signup] assessment notification failed:', emailErr);
        }

      } else if (tokenWasAlreadyUsed) {
        console.warn('[auth/signup] assessment token already used:', assessmentToken);
      }
    } catch (err) {
      console.error('[auth/signup] token apply failed:', err.message);
    }
  }

  // Notify admin of new account signup
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const signedUpAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' });
      await resend.emails.send({
        from: 'Curio <notifications@choosecurio.com>',
        to: 'raymondckearney@gmail.com',
        subject: `New Portal Account — ${name.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0F172A">
            <h2 style="margin-bottom:4px">New Portal Account Created</h2>
            <p style="color:#64748B;margin-top:0">A new user has signed up for the Curio portal.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:0.95rem">
              <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B;width:40%">Name</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600">${name.trim()}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Email</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${normalEmail}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Signed Up</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${signedUpAt} ET</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#64748B">Role</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${userRole === 'member' ? 'Member (joined existing team account)' : 'Owner (new account)'}</td></tr>
              ${assessmentToken ? `<tr><td style="padding:10px 0;color:#64748B">Token Used</td><td style="padding:10px 0;font-family:monospace;font-size:0.85rem">${assessmentToken}</td></tr>` : ''}
            </table>
            <a href="https://www.choosecurio.com/admin" style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:0.9rem">View in Admin →</a>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error('[auth/signup] notification email failed:', err);
  }

  const sessionToken = createSessionToken(user.id, account.id, userRole);
  res.setHeader('Set-Cookie', sessionCookie(sessionToken));
  return res.status(201).json({ ok: true });
}
