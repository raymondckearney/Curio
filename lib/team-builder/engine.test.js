// Run: npm test   (node --test, no extra packages)
// Fixture: the prototype's sample SOW (16 activities, 5 phases, 12 weeks,
// 1,560 hours) and its 5-person roster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTeam, score, TAGS } from './engine.js';
import { parseTaxonomy, isAllowedShift } from './taxonomy.js';
import { lintText } from './language.js';
import { SAMPLE_PHASES, SAMPLE_ROSTER, SAMPLE_PROJECT, sampleActivities } from './sample.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = parseTaxonomy(fs.readFileSync(path.join(here, '..', 'mindprint-activity-taxonomy.md'), 'utf8'));
const activities = sampleActivities(taxonomy);
const base = { phases: SAMPLE_PHASES, activities, ...SAMPLE_PROJECT };
const run = (roster = SAMPLE_ROSTER, useRoster = true) => buildTeam({ ...base, roster, useRoster });
const nameOf = (R, key) => R.people.find(p => p.key === key).name;
const rowFor = (R, actName) => R.rows.find(r => activities.find(a => a.key === r.act).name === actName);

test('taxonomy parses all 63 entries', () => {
  assert.equal(taxonomy.length, 63);
  assert.deepEqual(taxonomy.map(t => t.id), Array.from({ length: 63 }, (_, i) => i + 1));
  assert.ok(taxonomy.every(t => TAGS.includes(t.tag)));
  assert.equal(taxonomy[50].name, 'Executive storyline and presentation');
});

test('headcount is 4 to 5', () => {
  const R = run();
  assert.equal(R.headcount.lo, 4);
  assert.equal(R.headcount.hi, 5);
});

test('ideal seats are HOW-WHY, WHAT-HOW, WHY-WHAT, WHY-HOW', () => {
  const R = run([], false);
  assert.deepEqual([...R.ideal.map(s => s.profile)].sort(), ['HOW-WHY', 'WHAT-HOW', 'WHY-HOW', 'WHY-WHAT']);
});

test('engagement lead is Jordan', () => {
  const R = run();
  assert.equal(nameOf(R, R.engagementLead), 'Jordan');
});

test('executive readout: owner Maya, contributors Jordan and Tomas, reviewer Daniel', () => {
  const R = run();
  const r = rowFor(R, 'Executive readout');
  assert.equal(nameOf(R, r.owner), 'Maya');
  assert.deepEqual(r.contribs.map(k => nameOf(R, k)).sort(), ['Jordan', 'Tomas']);
  assert.equal(nameOf(R, r.reviewer), 'Daniel');
});

test('roadmap and launch plan: owner Priya, contributor Jordan, reviewer Maya', () => {
  const R = run();
  const r = rowFor(R, 'Roadmap and launch plan');
  assert.equal(nameOf(R, r.owner), 'Priya');
  assert.deepEqual(r.contribs.map(k => nameOf(R, k)), ['Jordan']);
  assert.equal(nameOf(R, r.reviewer), 'Maya');
});

test('concept workshop (whole team): owner Maya, everyone else contributes', () => {
  const R = run();
  const r = rowFor(R, 'Concept workshop with client team');
  assert.equal(nameOf(R, r.owner), 'Maya');
  assert.deepEqual(r.contribs.map(k => nameOf(R, k)).sort(), ['Daniel', 'Jordan', 'Priya', 'Tomas']);
});

test('scores for a HOW-WHY activity match taxonomy section 2', () => {
  const expected = { 'HOW-WHY': 83, 'WHY-HOW': 77, 'HOW-WHAT': 63, 'WHAT-HOW': 55, 'WHY-WHAT': 32, 'WHAT-WHY': 29 };
  for (const [profile, s] of Object.entries(expected)) assert.equal(score(profile, 'HOW-WHY'), s, profile);
});

test('no gaps for the full roster; removing Daniel leaves HOW uncovered', () => {
  assert.deepEqual(run().gaps, []);
  const R = run(SAMPLE_ROSTER.filter(p => p.name !== 'Daniel'));
  assert.ok(R.gaps.some(g => g.type === 'orientation_uncovered' && g.orientation === 'HOW'));
});

test('energy buckets add up to each load, and loads add up to total hours', () => {
  const R = run();
  for (const p of R.people) assert.ok(Math.abs(p.E + p.N + p.D - p.load) < 1e-6, p.name);
  const total = R.people.reduce((s, p) => s + p.load, 0);
  assert.ok(Math.abs(total - SAMPLE_PROJECT.hours) < 0.5, `loads ${total}`);
});

test('same input gives the same result', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(run())), JSON.parse(JSON.stringify(run())));
});

test('design mode fills the ideal seats and covers every orientation', () => {
  const R = run([], false);
  assert.equal(R.usingRoster, false);
  assert.equal(R.people.length, 4);
  assert.ok(R.people.every(p => p.name.startsWith('Seat ')));
});

test('friction matches the prototype for the sample roster', () => {
  const R = run();
  assert.deepEqual(R.friction.map(f => `${f.id}:${nameOf(R, f.a)}/${nameOf(R, f.b)}`), ['timing:Maya/Jordan', 'handoff:Maya/Daniel', 'trust:Priya/Maya', 'tissue:Jordan/Daniel']);
  for (const f of R.friction) assert.notEqual(f.a, f.b);
});

test('pace versus depth fills an open slot only', () => {
  const R = run(SAMPLE_ROSTER.filter(p => ['Tomas', 'Daniel'].includes(p.name)));
  assert.deepEqual(R.friction.map(f => f.id), ['pace']);
});

test('tag shifts follow taxonomy section 3', () => {
  assert.equal(isAllowedShift('HOW-WHY', 'WHY-HOW'), true);   // swap
  assert.equal(isAllowedShift('HOW-WHY', 'HOW-WHAT'), true);  // replace support
  assert.equal(isAllowedShift('HOW-WHY', 'WHAT-HOW'), false); // residual into the lead
  assert.equal(isAllowedShift('HOW-WHY', 'WHAT-WHY'), false);
});

test('language lint catches an em dash and "strengths"', () => {
  assert.ok(lintText('Plays to their strengths').length);
  assert.ok(lintText('Owns the plan — and the output').length);
  assert.ok(lintText('Maya leads the readout').length);
  assert.deepEqual(lintText('Jordan is the engagement lead for weeks 1–4.'), []);
});
