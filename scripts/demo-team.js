// Adds (or removes) a dummy five-person team to an existing account, for
// showing the platform to a client. Everyone gets a completed MindPrint™
// assessment, together covering the five profiles other than the owner's
// WHY-WHAT, and sits on one team. Addresses use a reserved .example domain,
// so no email can ever reach a real inbox, and the weekly tip email is
// switched off for them where that column exists.
//
// New tokens are created for them (tagged with the engagement id below), so
// the account's unused token pool is left alone.
//
// Run from the repo root (uses SUPABASE_URL / SUPABASE_SERVICE_KEY):
//   node scripts/demo-team.js raymondckearney@gmail.com           # add (re-running replaces)
//   node scripts/demo-team.js raymondckearney@gmail.com --delete  # remove

const crypto = require('crypto');
const { dbInsert, dbQuery, dbDelete, dbPatch } = require('../lib/supabase.js');

const DOMAIN = 'curio-demo.example';
const ENGAGEMENT = 'demo-team';
const TEAM_NAME = 'Client Strategy';
const COMPANY = 'Curio Demo';

// name, job title, profile, [how, what, why] scores out of 23
const PEOPLE = [
  ['Dana Whitfield', 'Research Lead', 'why-how', [8, 4, 11]],
  ['Marcus Bell', 'Client Partner', 'what-why', [4, 11, 8]],
  ['Sofia Alvarez', 'Delivery Manager', 'what-how', [7, 11, 5]],
  ['Kenji Tanaka', 'Senior Analyst', 'how-why', [11, 4, 8]],
  ['Grace Okonkwo', 'Operations Manager', 'how-what', [11, 8, 4]],
];

const emailOf = name => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${DOMAIN}`;

async function removeExisting(accountId) {
  const users = await dbQuery('client_users', { account_id: `eq.${accountId}`, email: `like.*@${DOMAIN}`, select: 'id' });
  const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, engagement_id: `eq.${ENGAGEMENT}`, select: 'token' });
  for (const t of tokens) {
    await dbDelete('assessments', { token: t.token });
    await dbDelete('tokens', { token: t.token });
  }
  for (const u of users) await dbDelete('client_users', { id: u.id });
  const teams = await dbQuery('teams', { account_id: `eq.${accountId}`, name: `eq.${TEAM_NAME}`, select: 'id' }).catch(() => []);
  for (const t of teams) {
    const stillUsed = await dbQuery('client_users', { team_id: `eq.${t.id}`, select: 'id' });
    if (!stillUsed.length) await dbDelete('teams', { id: t.id });
  }
  return { users: users.length, tokens: tokens.length };
}

(async () => {
  const ownerEmail = process.argv[2];
  if (!ownerEmail || ownerEmail.startsWith('--')) throw new Error('Pass the account owner\'s email first.');
  const [owner] = await dbQuery('client_users', { email: `ilike.${ownerEmail}`, select: 'id,account_id,name' });
  if (!owner) throw new Error(`No portal user with email ${ownerEmail}`);
  const accountId = owner.account_id;

  const removed = await removeExisting(accountId);
  if (process.argv.includes('--delete')) { console.log(`Removed ${removed.users} demo people and ${removed.tokens} demo tokens.`); return; }

  const team = (await dbInsert('teams', { account_id: accountId, name: TEAM_NAME }))[0];
  for (const [i, [name, title, type, [h, w, y]]] of PEOPLE.entries()) {
    const email = emailOf(name);
    const user = (await dbInsert('client_users', { account_id: accountId, email, name, role: 'member', team_id: team.id, password_hash: 'demo-account-no-password' }))[0];
    await dbPatch('client_users', { id: user.id }, { weekly_tip_opt_out: true }).catch(() => {});
    const token = crypto.randomUUID();
    const takenAt = new Date(Date.now() - (24 - i * 4) * 86400000).toISOString();
    await dbInsert('tokens', {
      token, account_id: accountId, name, email, company: COMPANY, role: title, granted_tier: 'premium', granted_tools: ['assessment_tokens'],
      purpose: 'assessment', engagement_id: ENGAGEMENT, team_id: team.id, used: true, used_at: takenAt, link_sent_at: takenAt,
      result_payload: { type }, created_for_name: name, created_for_email: email,
    });
    await dbInsert('assessments', { token, name, email, company: COMPANY, role: title, type, h_score: h, w_score: w, y_score: y, submitted_at: takenAt });
    console.log(`added ${name} (${title}, ${type.toUpperCase()})`);
  }
  console.log(`Team "${TEAM_NAME}" in account ${accountId}.`);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
