import { dbGet, dbInsert, dbPatch, dbQuery } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/password';
import { createSessionToken, sessionCookie } from '../../../lib/portalSession';
import { syncContactToNotion } from '../../../lib/notionSync';
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

  // Create account
  const slug = normalEmail.split('@')[0].replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
  const [account] = await dbInsert('client_accounts', {
    name: name.trim(),
    slug,
    notes: stripe_session_id ? `Self-serve purchase: ${stripe_session_id}` : 'Self-serve signup',
  });

  // Create user
  const hash = await hashPassword(password);
  const [user] = await dbInsert('client_users', {
    account_id: account.id,
    email: normalEmail,
    name: name.trim(),
    role: 'owner',
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

  // Apply assessment token: set granted tier, write licenses, and consume
  if (assessmentToken) {
    try {
      const tokenRows = await dbGet('tokens', { token: assessmentToken });
      if (tokenRows.length && !tokenRows[0].used) {
        const tr = tokenRows[0];
        const grantedTier = tr.granted_tier || 'basic';
        const grantedTools = tr.granted_tools || (grantedTier === 'premium'
          ? ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer']
          : ['assessment_tokens']);
        const usedAt = new Date().toISOString();
        await Promise.all([
          dbPatch('client_accounts', { id: account.id }, { tier: grantedTier }),
          dbPatch('tokens', { token: assessmentToken }, { used: true, used_at: usedAt, account_id: account.id }),
          ...grantedTools.map(type => dbInsert('account_licenses', {
            account_id: account.id,
            type,
            quantity: 1,
            expires_at: tr.expires_at || null,
          })),
        ]);

        // Send assessment completion notification
        try {
          if (process.env.RESEND_API_KEY) {
            const assessmentRows = await dbGet('assessments', { token: assessmentToken }).catch(() => []);
            const assessment = assessmentRows[0];
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

      } else if (tokenRows[0]?.used) {
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

  const sessionToken = createSessionToken(user.id, account.id, 'owner');
  res.setHeader('Set-Cookie', sessionCookie(sessionToken));
  return res.status(201).json({ ok: true });
}
