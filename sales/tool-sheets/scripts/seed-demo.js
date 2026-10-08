// Seeds (or re-seeds) the fictional demo company used for tool-sheet
// screenshots: "Summit Ridge Co.", eight people covering all six profiles
// plus one pending invite. Everyone is on @summitridge.example (a reserved
// domain, so no real inbox). Safe to re-run: it deletes the previous demo
// account first. Remove it with:  node sales/tool-sheets/scripts/seed-demo.js --delete
//
// Run from the repo root:
//   PORTAL_SECRET=<same secret as the dev server> node sales/tool-sheets/scripts/seed-demo.js > sales/tool-sheets/.demo.json
// The JSON it prints holds the account id and a portal cookie per person.

const crypto = require('crypto');
const { dbInsert, dbQuery, dbDelete } = require('../../../lib/supabase.js');
const { createSessionToken } = require('../../../lib/portalSession.js');

const SLUG = 'demo-summit-ridge';
const DOMAIN = 'summitridge.example';

const PEOPLE = [
  // name, role, profile, [how, what, why] scores (23 questions)
  ['Maya Chen', 'owner', 'why-what', [4, 8, 11]],
  ['Jordan Ellis', 'member', 'what-how', [7, 11, 5]],
  ['Priya Raman', 'member', 'how-why', [11, 4, 8]],
  ['Marcus Webb', 'manager', 'how-what', [11, 8, 4]],
  ['Elena Ruiz', 'member', 'what-why', [4, 11, 8]],
  ['Sam Okafor', 'member', 'why-how', [8, 4, 11]],
  ['Taylor Brooks', 'member', 'what-how', [8, 10, 5]],
  ['Avery Kim', 'member', 'how-why', [10, 5, 8]],
];
const PENDING = ['Chris Patel', 'member'];

const LICENSES = [
  'assessment_tokens', 'team_account', 'role_analyzer', 'career_guidance', 'jd_analyzer',
  'precision_companion', 'purpose_companion', 'progress_companion', 'orientation_translator',
  'session_architect', 'meeting_architect', 'team_builder', 'curio_assistant', 'library_full',
];

const emailOf = name => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${DOMAIN}`;

async function removeExisting() {
  const accounts = await dbQuery('client_accounts', { slug: `eq.${SLUG}`, select: 'id' });
  for (const { id } of accounts) {
    const tokens = await dbQuery('tokens', { account_id: `eq.${id}`, select: 'token' });
    for (const t of tokens) await dbDelete('assessments', { token: t.token });
    for (const table of ['account_licenses', 'tokens', 'assistant_logs', 'access_requests', 'meeting_architect_reports', 'team_builder_runs', 'team_builder_calls', 'client_users', 'teams']) {
      try { await dbDelete(table, { account_id: id }); } catch { /* table may not exist or have no rows */ }
    }
    await dbDelete('client_accounts', { id });
  }
  return accounts.length;
}

(async () => {
  const removed = await removeExisting();
  if (process.argv.includes('--delete')) { console.error(`Removed ${removed} demo account(s).`); return; }

  const acc = (await dbInsert('client_accounts', { name: 'Summit Ridge Co.', slug: SLUG, tier: 'premium' }))[0];
  for (const type of LICENSES) await dbInsert('account_licenses', { account_id: acc.id, type, quantity: type === 'assessment_tokens' ? 25 : 1 });
  const team = (await dbInsert('teams', { account_id: acc.id, name: 'Product' }).catch(() => [null]))[0];

  const out = { accountId: acc.id, people: {} };
  const engagement = `demo-summit-ridge-${Date.now()}`;
  for (const [i, [name, role, type, [h, w, y]]] of PEOPLE.entries()) {
    const email = emailOf(name);
    const teamId = team ? team.id : null;
    const user = (await dbInsert('client_users', { account_id: acc.id, email, name, role, team_id: teamId, password_hash: 'demo-account-no-password' }))[0];
    const token = crypto.randomUUID();
    const takenAt = new Date(Date.now() - (30 - i * 3) * 86400000).toISOString();
    await dbInsert('tokens', { token, account_id: acc.id, name, email, granted_tier: 'premium', purpose: 'assessment', engagement_id: engagement, team_id: teamId, used: true, used_at: takenAt, link_sent_at: takenAt });
    await dbInsert('assessments', { token, name, email, company: 'Summit Ridge Co.', type, h_score: h, w_score: w, y_score: y, submitted_at: takenAt });
    out.people[name.split(' ')[0].toLowerCase()] = { id: user.id, email, role, type, cookie: createSessionToken(user.id, acc.id, role, teamId) };
  }
  // A sent-but-not-completed invite, and a few unused links in the pool.
  const [pName, pRole] = PENDING;
  const pEmail = emailOf(pName);
  await dbInsert('client_users', { account_id: acc.id, email: pEmail, name: pName, role: pRole, password_hash: 'demo-account-no-password' });
  await dbInsert('tokens', { token: crypto.randomUUID(), account_id: acc.id, name: pName, email: pEmail, granted_tier: 'premium', purpose: 'assessment', engagement_id: engagement, used: false, link_sent_at: new Date(Date.now() - 2 * 86400000).toISOString() });
  for (let k = 0; k < 6; k++) await dbInsert('tokens', { token: crypto.randomUUID(), account_id: acc.id, name: '', granted_tier: 'premium', purpose: 'assessment', engagement_id: engagement, used: false });

  console.log(JSON.stringify(out, null, 2));
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
