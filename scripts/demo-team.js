// Adds (or removes) a dummy five-person team to an existing account, for
// showing the platform to a client. Everyone gets a completed MindPrint™
// assessment and sits on one team, and together with the owner the team
// covers all six profiles. Addresses use a reserved .example domain, so no
// email can ever reach a real inbox, and the weekly tip email is switched
// off for them where that column exists.
//
// --colleague <email> adds a fictional copy of a real person (their name,
// job title, profile and scores, but a .example address), so an owner can
// see how the tools treat a colleague they actually work with.
//
// New tokens are created for them (tagged with the engagement id below), so
// the account's unused token pool is left alone.
//
// Run from the repo root (uses SUPABASE_URL / SUPABASE_SERVICE_KEY):
//   node scripts/demo-team.js <owner email> [--colleague <email>] [--team "Team name"] [--company "Name"]
//   node scripts/demo-team.js <owner email> --delete
// Re-running for the same owner replaces the demo team.

const crypto = require('crypto');
const { dbInsert, dbQuery, dbDelete, dbPatch } = require('../lib/supabase.js');

const DOMAIN = 'curio-demo.example';
const ENGAGEMENT = 'demo-team';
const TEAM_SIZE = 5;
const PROFILES = ['why-what', 'why-how', 'what-why', 'what-how', 'how-why', 'how-what'];

// One fictional person per profile: name, job title, [how, what, why] scores out of 23.
const PERSONAS = {
  'why-how': ['Dana Whitfield', 'Research Lead', [8, 4, 11]],
  'what-why': ['Marcus Bell', 'Client Partner', [4, 11, 8]],
  'what-how': ['Sofia Alvarez', 'Delivery Manager', [7, 11, 5]],
  'how-why': ['Kenji Tanaka', 'Senior Analyst', [11, 4, 8]],
  'how-what': ['Grace Okonkwo', 'Operations Manager', [11, 8, 4]],
  'why-what': ['Leah Morrison', 'Practice Lead', [4, 8, 11]],
};

const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const slug = name => name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');

async function removeExisting(accountId) {
  const users = await dbQuery('client_users', { account_id: `eq.${accountId}`, email: `like.*@${DOMAIN}`, select: 'id' });
  const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, engagement_id: `eq.${ENGAGEMENT}`, select: 'token' });
  for (const t of tokens) {
    await dbDelete('assessments', { token: t.token });
    await dbDelete('tokens', { token: t.token });
  }
  const teamIds = new Set();
  for (const u of users) {
    const [row] = await dbQuery('client_users', { id: `eq.${u.id}`, select: 'team_id' });
    if (row?.team_id) teamIds.add(row.team_id);
    await dbDelete('client_users', { id: u.id });
  }
  // Remove the demo team once nobody real is left on it.
  for (const id of teamIds) {
    const stillUsed = await dbQuery('client_users', { team_id: `eq.${id}`, select: 'id' });
    if (!stillUsed.length) await dbDelete('teams', { id });
  }
  return { users: users.length, tokens: tokens.length };
}

async function profileOf(email, tokenIds) {
  // The person's own completed assessment (latest), by email.
  const rows = await dbQuery('assessments', { email: `ilike.${email}`, order: 'submitted_at.desc', select: 'name,type,h_score,w_score,y_score,role,token' });
  const mine = tokenIds ? rows.find(r => tokenIds.includes(r.token)) || rows[0] : rows[0];
  return mine || null;
}

(async () => {
  const ownerEmail = process.argv[2];
  if (!ownerEmail || ownerEmail.startsWith('--')) throw new Error('Pass the account owner\'s email first.');
  const [owner] = await dbQuery('client_users', { email: `ilike.${ownerEmail}`, select: 'id,account_id,name,role' });
  if (!owner) throw new Error(`No portal user with email ${ownerEmail}`);
  const accountId = owner.account_id;

  const removed = await removeExisting(accountId);
  if (process.argv.includes('--delete')) { console.log(`Removed ${removed.users} demo people and ${removed.tokens} demo tokens.`); return; }

  const accountTokens = (await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' })).map(t => t.token);
  const ownerProfile = await profileOf(ownerEmail, accountTokens);
  const covered = new Set(ownerProfile ? [ownerProfile.type.toLowerCase()] : []);

  // Who goes on the team: the real colleague first, then one fictional
  // person for each profile not yet covered, then extras if room is left.
  const people = [];
  const colleagueEmail = arg('--colleague');
  if (colleagueEmail) {
    const c = await profileOf(colleagueEmail);
    if (!c) throw new Error(`No completed assessment for ${colleagueEmail}`);
    people.push({ name: c.name, title: c.role || null, type: c.type.toLowerCase(), scores: [c.h_score, c.w_score, c.y_score], colleague: true });
    covered.add(c.type.toLowerCase());
  }
  for (const p of PROFILES) if (!covered.has(p) && people.length < TEAM_SIZE) { const [name, title, scores] = PERSONAS[p]; people.push({ name, title, type: p, scores }); covered.add(p); }
  for (const p of PROFILES) if (people.length < TEAM_SIZE && !people.some(x => x.name === PERSONAS[p][0])) { const [name, title, scores] = PERSONAS[p]; people.push({ name, title, type: p, scores }); }

  const company = arg('--company') || null;
  const teamName = arg('--team') || 'Client Strategy';
  const team = (await dbInsert('teams', { account_id: accountId, name: teamName }))[0];
  // Addresses carry the account's id so the same fictional person can sit
  // in more than one account.
  const tag = accountId.slice(0, 8);
  for (const [i, p] of people.entries()) {
    const email = `${slug(p.name)}.${tag}@${DOMAIN}`;
    const user = (await dbInsert('client_users', { account_id: accountId, email, name: p.name, role: 'member', team_id: team.id, password_hash: 'demo-account-no-password' }))[0];
    await dbPatch('client_users', { id: user.id }, { weekly_tip_opt_out: true }).catch(() => {});
    const token = crypto.randomUUID();
    const takenAt = new Date(Date.now() - (24 - i * 4) * 86400000).toISOString();
    const [h, w, y] = p.scores;
    await dbInsert('tokens', {
      token, account_id: accountId, name: p.name, email, company, role: p.title, granted_tier: 'premium', granted_tools: ['assessment_tokens'],
      purpose: 'assessment', engagement_id: ENGAGEMENT, team_id: team.id, used: true, used_at: takenAt, link_sent_at: takenAt,
      result_payload: { type: p.type }, created_for_name: p.name, created_for_email: email,
    });
    await dbInsert('assessments', { token, name: p.name, email, company, role: p.title, type: p.type, h_score: h, w_score: w, y_score: y, submitted_at: takenAt });
    console.log(`added ${p.name}${p.colleague ? ' (copy of the real colleague)' : ''}: ${p.title || 'no title'}, ${p.type.toUpperCase()}`);
  }
  const all = new Set([...(ownerProfile ? [ownerProfile.type.toLowerCase()] : []), ...people.map(p => p.type)]);
  console.log(`Team "${teamName}". Owner is ${ownerProfile ? ownerProfile.type.toUpperCase() : 'not assessed'}. Profiles covered: ${all.size} of 6.`);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
