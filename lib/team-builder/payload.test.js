// Run: npm test. What leaves the browser: no names to the AI, no names saved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTeam } from './engine.js';
import { parseTaxonomy } from './taxonomy.js';
import { narrativeInput, narrativeRequests, mergeNarrative, runRecord, MAX_ASSIGNMENTS_PER_CALL, MAX_PEOPLE_PER_CALL } from './payload.js';
import { SAMPLE_PHASES, SAMPLE_ROSTER, SAMPLE_PROJECT, sampleActivities } from './sample.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = parseTaxonomy(fs.readFileSync(path.join(here, '..', 'mindprint-activity-taxonomy.md'), 'utf8'));
const roster = SAMPLE_ROSTER.map(p => ({ ...p, skills: 'pricing models', seniority: 'Senior' }));
const state = { phases: SAMPLE_PHASES, acts: sampleActivities(taxonomy), roster, weeks: SAMPLE_PROJECT.weeks, hours: SAMPLE_PROJECT.hours, useRoster: true };
const R = buildTeam({ phases: state.phases, activities: state.acts, weeks: state.weeks, hours: state.hours, roster, useRoster: true });
const names = SAMPLE_ROSTER.map(p => p.name);

test('the narrative payload carries labels, never names', () => {
  const input = narrativeInput(R, state);
  const text = JSON.stringify(narrativeRequests(input));
  for (const n of names) assert.ok(!text.includes(n), `${n} leaked`);
  assert.deepEqual(input.people.map(p => p.label), ['P1', 'P2', 'P3', 'P4', 'P5']);
  assert.equal(input.people[0].skills, 'pricing models');
  const reqs = narrativeRequests(input);
  assert.equal(reqs[0].part, 'overview');
  const focus = reqs.slice(1).map(r => r.input.focus);
  assert.deepEqual(focus.flat(), ['P1', 'P2', 'P3', 'P4', 'P5']);
  const count = Object.fromEntries(input.people.map(p => [p.label, p.assignments.length]));
  for (const f of focus) {
    assert.ok(f.length <= MAX_PEOPLE_PER_CALL);
    if (f.length > 1) assert.ok(f.reduce((t, l) => t + count[l], 0) <= MAX_ASSIGNMENTS_PER_CALL);
  }
});

test('the saved run carries labels, never names, skills or seniority', () => {
  const text = JSON.stringify(runRecord(R, state));
  for (const n of [...names, 'pricing models', 'Senior']) assert.ok(!text.includes(n), `${n} saved`);
});

test('labels in the AI text come back as names', () => {
  const merged = mergeNarrative([
    { part: 'overview', summary: 'P5 is the engagement lead and P2 reviews.', friction: [{ patternId: 'timing', steps: ['P1 runs the kickoff.'], tools: [36] }] },
    { part: 'people', people: [{ label: 'P1', planIntro: 'P1 owns the vision.', items: [{ activity: 'Executive readout', role: 'Owner', expectation: 'P1 builds the storyline with P4.' }] }] },
  ], R, state);
  assert.equal(merged.summary, 'Jordan is the engagement lead and Daniel reviews.');
  assert.deepEqual(merged.friction.timing.steps, ['Maya runs the kickoff.']);
  const maya = merged.people['p-maya'];
  assert.equal(maya.planIntro, 'Maya owns the vision.');
  assert.equal(Object.values(maya.items)[0], 'Maya builds the storyline with Tomas.');
});
