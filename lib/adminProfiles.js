// Server-only. Admin tools for a person's MindPrint(tm) profile: see each
// login's own profile on an account, and set one by copying an existing
// assessment or entering it by hand (admin Edit Account -> Users & Roles).
//
// How the portal finds "my profile": an assessment on one of the account's
// tokens whose email matches the login's email exactly (lib/ownProfile.js,
// lib/companionAuth.js, lib/libraryAccess.js), and the team roster matches
// the login's email to the token's email (pages/api/portal/team.js). So
// everything written here uses the login's exact email on both the token
// and the assessment, and every edit targets one specific person, never
// "the account's most recent assessment".

import crypto from 'crypto';
import { dbGet, dbInsert, dbPatch, dbQuery, dbDelete } from './supabase';
import { determineType } from './profiles';
import { TERTIARY_BY_PROFILE, COMPANION_BY_TERTIARY, COLLECTION_BY_TERTIARY } from './tertiary';
import { isTeamAccount } from './teamAccount';

export const PROFILE_SLUGS = ['why-what', 'why-how', 'what-why', 'what-how', 'how-why', 'how-what'];

// assessments.source: null = took the assessment; these two = set by admin.
export const SOURCE_COPIED = 'admin_copied';
export const SOURCE_MANUAL = 'admin_entered';

const norm = e => String(e || '').toLowerCase().trim();
const tertiaryOf = slug => (slug ? TERTIARY_BY_PROFILE[slug.toUpperCase()] || null : null);

async function loadAccount(accountId) {
  const [accounts, users, tokens, licenses] = await Promise.all([
    dbGet('client_accounts', { id: accountId }),
    dbQuery('client_users', { account_id: `eq.${accountId}`, select: 'id,email,name,role,team_id', order: 'created_at.asc' }),
    dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,email,name,used,used_at,team_id,engagement_id' }),
    dbQuery('account_licenses', { account_id: `eq.${accountId}`, select: 'id,type,expires_at' }),
  ]);
  const tokenIds = tokens.map(t => t.token).filter(Boolean);
  const assessments = tokenIds.length
    ? await dbQuery('assessments', { token: `in.(${tokenIds.join(',')})`, order: 'submitted_at.desc', select: '*' })
    : [];
  return { account: accounts[0] || null, users, tokens, licenses, assessments };
}

// The assessment that belongs to this login. Matched by email (newest
// first). The single-assessment fallback the portal uses is only trusted
// here when the account has exactly one login, so an edit can never land on
// a teammate's profile.
function ownAssessment(state, user) {
  const email = norm(user.email);
  const byEmail = state.assessments.find(a => norm(a.email) === email);
  if (byEmail) return byEmail;
  if (state.users.length === 1 && state.assessments.length === 1) return state.assessments[0];
  return null;
}

// Every login on the account with its own profile, for the admin panel.
export async function listUserProfiles(accountId) {
  const state = await loadAccount(accountId);
  if (!state.account) return null;
  return state.users.map(u => {
    const a = ownAssessment(state, u);
    return {
      userId: u.id,
      email: u.email,
      name: u.name,
      profile: a?.type || null,
      submittedAt: a?.submitted_at || null,
      source: a?.source || null,
      scores: a ? { why: a.y_score, what: a.w_score, how: a.h_score } : null,
      // Matched by the fallback rather than the email: still shown in the
      // portal, but the email on the assessment is different.
      emailMismatch: !!a && norm(a.email) !== norm(u.email),
    };
  });
}

// Search every account's assessments by name or email, for "copy from an
// existing assessment". Returns at most 20, newest first.
export async function searchAssessments(q) {
  const term = String(q || '').trim().replace(/[(),*]/g, ' ').trim();
  if (term.length < 2) return [];
  const rows = await dbQuery('assessments', {
    or: `(email.ilike.*${term}*,name.ilike.*${term}*)`,
    order: 'submitted_at.desc',
    limit: '20',
    select: '*',
  });
  const tokenIds = rows.map(r => r.token).filter(Boolean);
  const tokens = tokenIds.length ? await dbQuery('tokens', { token: `in.(${tokenIds.join(',')})`, select: 'token,account_id' }) : [];
  const accountIds = [...new Set(tokens.map(t => t.account_id).filter(Boolean))];
  const accounts = accountIds.length ? await dbQuery('client_accounts', { id: `in.(${accountIds.join(',')})`, select: 'id,name' }) : [];
  const accountOf = Object.fromEntries(tokens.map(t => [t.token, accounts.find(a => a.id === t.account_id) || null]));
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    profile: r.type,
    submittedAt: r.submitted_at,
    source: r.source || null,
    scores: { why: r.y_score, what: r.w_score, how: r.h_score },
    accountId: accountOf[r.token]?.id || null,
    accountName: accountOf[r.token]?.name || null,
  }));
}

// Checks hand-entered scores (all three or none). If they don't tie, they
// must point at the chosen profile, so the analytics never contradict it.
function cleanScores(scores, profile) {
  if (!scores) return { h: null, w: null, y: null };
  const vals = ['why', 'what', 'how'].map(k => scores[k]);
  const given = vals.filter(v => v !== '' && v !== null && v !== undefined);
  if (!given.length) return { h: null, w: null, y: null };
  if (given.length !== 3) return { error: 'Enter all three scores, or leave all three blank.' };
  const [y, w, h] = vals.map(v => Number(v));
  if ([y, w, h].some(v => !Number.isInteger(v) || v < 0 || v > 100)) return { error: 'Scores must be whole numbers from 0 to 100.' };
  const tie = y === w || w === h || y === h;
  if (!tie && determineType(h, w, y) !== profile) {
    return { error: `Those scores make a ${determineType(h, w, y).toUpperCase()} profile, not ${profile.toUpperCase()}.` };
  }
  return { h, w, y };
}

// Writes a row, dropping the source field if the 0013 migration (which adds
// assessments.source) hasn't been run yet, so the feature still works.
async function writeAssessment(kind, filterOrRow, data) {
  try {
    return kind === 'insert' ? await dbInsert('assessments', filterOrRow) : await dbPatch('assessments', filterOrRow, data);
  } catch (e) {
    if (!/source/.test(e.message)) throw e;
    if (kind === 'insert') { const { source, ...rest } = filterOrRow; return dbInsert('assessments', rest); }
    const { source, ...rest } = data; return dbPatch('assessments', filterOrRow, rest);
  }
}

// When one person's profile changes on a single-person account, licenses
// that were picked for their old tertiary (their matching Companion and
// Resources collection) move to the new one. Only licenses that actually
// exist move; nothing new is granted. Team accounts are left alone, since
// their licenses are shared by everyone on the account.
async function swapTertiaryLicenses(state, accountId, oldTertiary, newTertiary) {
  if (!oldTertiary || !newTertiary || oldTertiary === newTertiary) return [];
  if (isTeamAccount(state.tokens, state.licenses)) return [];
  const pairs = [
    [`${COMPANION_BY_TERTIARY[oldTertiary]}_companion`, `${COMPANION_BY_TERTIARY[newTertiary]}_companion`],
    [`library_${COLLECTION_BY_TERTIARY[oldTertiary].toLowerCase()}`, `library_${COLLECTION_BY_TERTIARY[newTertiary].toLowerCase()}`],
  ];
  const moved = [];
  for (const [from, to] of pairs) {
    const old = state.licenses.filter(l => l.type === from);
    if (!old.length) continue;
    for (const l of old) await dbDelete('account_licenses', { id: l.id });
    if (!state.licenses.some(l => l.type === to)) {
      await dbInsert('account_licenses', { account_id: accountId, type: to, quantity: 1, expires_at: old[0].expires_at || null });
    }
    moved.push(`${from.replace(/_/g, ' ')} → ${to.replace(/_/g, ' ')}`);
  }
  return moved;
}

// Sets one login's profile.
//   mode 'copy':   { sourceAssessmentId } copies that assessment's profile,
//                  scores, and date. If the source is on another account it
//                  is left untouched; if it's on this account (the same
//                  person under an old email) it moves to this login.
//   mode 'manual': { profile, scores? } enters a profile by hand.
// Returns { ok, profile, message } or { error, code }.
export async function setUserProfile(accountId, userId, input) {
  const state = await loadAccount(accountId);
  if (!state.account) return { error: 'Account not found.', code: 404 };
  const user = state.users.find(u => u.id === userId);
  if (!user) return { error: 'That login is not on this account.', code: 404 };

  let fields;
  let sameAccountSource = null;
  if (input.mode === 'copy') {
    const src = (await dbGet('assessments', { id: input.sourceAssessmentId || '' }).catch(() => []))[0];
    if (!src) return { error: 'That assessment was not found.', code: 404 };
    if (!PROFILE_SLUGS.includes(src.type)) return { error: "That assessment doesn't have a usable profile.", code: 400 };
    fields = { type: src.type, h_score: src.h_score, w_score: src.w_score, y_score: src.y_score, submitted_at: src.submitted_at, source: SOURCE_COPIED };
    if (state.assessments.some(a => a.id === src.id)) sameAccountSource = src;
  } else if (input.mode === 'manual') {
    const profile = String(input.profile || '').toLowerCase();
    if (!PROFILE_SLUGS.includes(profile)) return { error: 'Choose one of the six profiles.', code: 400 };
    const sc = cleanScores(input.scores, profile);
    if (sc.error) return { error: sc.error, code: 400 };
    fields = { type: profile, h_score: sc.h, w_score: sc.w, y_score: sc.y, submitted_at: new Date().toISOString(), source: SOURCE_MANUAL };
  } else {
    return { error: 'Unknown mode.', code: 400 };
  }

  const current = ownAssessment(state, user);
  const oldTertiary = tertiaryOf(current?.type);
  const steps = [];

  if (sameAccountSource && current && sameAccountSource.id !== current.id) {
    return { error: 'This person already has a profile on this account, and the assessment you picked belongs to someone else on the same account. Pick an assessment from another account, or enter the profile manually.', code: 409 };
  }

  if (sameAccountSource) {
    // Same person, same account, different email: re-point their own
    // assessment (and its token) to this login instead of duplicating it,
    // so team views don't list them twice.
    await writeAssessment('patch', { id: sameAccountSource.id }, { email: user.email, name: user.name || sameAccountSource.name });
    if (sameAccountSource.token) await dbPatch('tokens', { token: sameAccountSource.token }, { email: user.email, used: true });
    steps.push('Moved their assessment on this account to this login');
  } else if (current) {
    await writeAssessment('patch', { id: current.id }, { ...fields, email: user.email });
    if (current.token) await dbPatch('tokens', { token: current.token }, { email: user.email, used: true });
    steps.push(input.mode === 'copy' ? 'Replaced their profile with the copied one' : 'Updated their profile');
  } else {
    // No profile yet: attach to their own unused assessment link if they
    // have one (so the team roster doesn't keep showing "invited"),
    // otherwise create a completed one for them.
    const usedAt = new Date().toISOString();
    const pending = state.tokens.find(t => norm(t.email) === norm(user.email) && !t.used);
    let token = pending?.token;
    if (pending) {
      await dbPatch('tokens', { token }, { email: user.email, used: true, used_at: usedAt });
    } else {
      token = crypto.randomUUID();
      await dbInsert('tokens', {
        token,
        account_id: accountId,
        engagement_id: `admin-profile-${accountId.slice(0, 8)}`,
        purpose: 'assessment',
        name: user.name || '',
        email: user.email,
        granted_tier: state.account.tier || 'basic',
        team_id: user.team_id || null,
        used: true,
        used_at: usedAt,
      });
    }
    await writeAssessment('insert', { token, name: user.name || user.email, email: user.email, ...fields });
    steps.push(input.mode === 'copy' ? 'Copied the profile to this login' : 'Added the profile');
  }

  const moved = await swapTertiaryLicenses(state, accountId, oldTertiary, tertiaryOf(fields?.type || sameAccountSource?.type));
  if (moved.length) steps.push(`Moved licenses: ${moved.join(', ')}`);

  const profile = (sameAccountSource?.type || fields.type).toUpperCase();
  return { ok: true, profile, message: `${user.name || user.email} is now ${profile}. ${steps.join('. ')}.` };
}
