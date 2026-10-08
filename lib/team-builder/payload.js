// Builds what leaves the browser. Pure, so the "no names" rule is unit
// tested. Every person becomes a label (P1, P2... in roster order, or
// Seat A...); the label-to-name map never leaves the page.
import { TAGS, primaryOf, orderedPhases } from './engine.js';
import { FRICTION_COPY, gapText, weeksLabel } from './copy.js';

export function labelsFor(R) {
  return Object.fromEntries(R.people.map((p, i) => [p.key, R.usingRoster ? `P${i + 1}` : p.name]));
}

function lookups(R, state) {
  const actByKey = Object.fromEntries(state.acts.map(a => [a.key, a]));
  const phaseByKey = Object.fromEntries(state.phases.map(p => [p.key, p]));
  const ongoing = orderedPhases(state.phases).find(p => p.ongoing);
  const phaseOf = k => phaseByKey[actByKey[k]?.phase] || ongoing;
  return { actByKey, phaseOf };
}

// The engine output for PART B, people as labels only.
export function narrativeInput(R, state) {
  const L = labelsFor(R);
  const { actByKey, phaseOf } = lookups(R, state);
  const roster = Object.fromEntries((state.roster || []).map(r => [r.key, r]));
  const actName = k => actByKey[k]?.name || 'Activity';
  const ENERGY = { E: 'energizing', N: 'neutral', D: 'draining' };
  const people = R.people.map(p => {
    const extra = R.usingRoster ? roster[p.key] || {} : {};
    return {
      label: L[p.key], profile: p.profile, roleTitle: p.role, availability: p.avail,
      capacityHours: Math.round(p.cap), loadHours: Math.round(p.load),
      energy: { E: Math.round(p.E), N: Math.round(p.N), D: Math.round(p.D) },
      engagementLead: R.engagementLead === p.key,
      ...(extra.skills?.trim() ? { skills: extra.skills.trim() } : {}),
      ...(extra.seniority ? { seniority: extra.seniority } : {}),
      assignments: p.items.map(i => ({ activity: actName(i.act), role: i.role, energy: ENERGY[i.energy], hours: Math.round(i.hours) })),
    };
  });
  const activities = R.rows.map(r => {
    const a = actByKey[r.act], ph = phaseOf(r.act);
    return { name: a.name, tag: a.tag, phase: ph.name, weeks: weeksLabel(ph), hours: Math.round(r.hours), delivery: a.mode, owner: L[r.owner], contributors: r.contribs.map(k => L[k]), reviewer: r.reviewer ? L[r.reviewer] : null };
  });
  const nameAsLabel = k => L[k];
  const gaps = R.gaps.map(g => { const t = gapText(g, nameAsLabel, actName, o => TAGS.filter(x => primaryOf(x) === o)); return { type: g.type, text: `${t.lead} ${t.body}` }; });
  const friction = R.friction.map(f => ({
    patternId: f.id, title: FRICTION_COPY[f.id].title, what: FRICTION_COPY[f.id].what, people: [L[f.a], L[f.b]],
    sharedActivities: f.shared.map(actName), allowedTools: f.tools,
  }));
  return {
    project: { weeks: +state.weeks || null, hours: +state.hours || null, mode: R.usingRoster ? 'roster' : 'design' },
    demand: { WHY: round2(R.demand.WHY), WHAT: round2(R.demand.WHAT), HOW: round2(R.demand.HOW) },
    people, activities, gaps, friction,
  };
}
const round2 = x => Math.round(x * 100) / 100;

// People are grouped into "people" calls by how many assignments they
// have, so no single call runs long: Vercel Hobby stops a function at 60
// seconds, and a person with many assignments takes most of that alone.
export const MAX_ASSIGNMENTS_PER_CALL = 8;
export const MAX_PEOPLE_PER_CALL = 3;
export function narrativeRequests(input) {
  const out = [{ part: 'overview', input }];
  let batch = [], load = 0;
  const flush = () => { if (batch.length) out.push({ part: 'people', input: { ...input, focus: batch } }); batch = []; load = 0; };
  for (const p of input.people) {
    const n = Math.max(1, p.assignments.length);
    if (batch.length && (load + n > MAX_ASSIGNMENTS_PER_CALL || batch.length >= MAX_PEOPLE_PER_CALL)) flush();
    batch.push(p.label); load += n;
  }
  flush();
  return out;
}

// Merge the parts into { summary, friction: {id: {steps, tools}},
// people: {personKey: {planIntro, items: {"actKey|role": text}}} }, with
// labels swapped back to names.
export function mergeNarrative(parts, R, state) {
  const L = labelsFor(R);
  const keyOfLabel = Object.fromEntries(Object.entries(L).map(([k, l]) => [l, k]));
  const names = Object.fromEntries(R.people.map(p => [p.key, p.name || 'Unnamed']));
  const sub = t => (typeof t === 'string' ? t.replace(/\b(P\d{1,2}|Seat [A-Z])\b/g, m => (keyOfLabel[m] ? names[keyOfLabel[m]] : m)) : t);
  const actKeyByName = {};
  for (const a of state.acts) if (!(a.name in actKeyByName)) actKeyByName[a.name] = a.key;
  const out = { summary: null, friction: {}, people: {} };
  for (const part of parts) {
    if (!part) continue;
    if (part.summary) out.summary = sub(part.summary);
    for (const f of part.friction || []) out.friction[f.patternId] = { steps: (f.steps || []).map(sub), tools: f.tools || [] };
    for (const p of part.people || []) {
      const key = keyOfLabel[p.label];
      if (!key) continue;
      const items = {};
      for (const it of p.items || []) {
        const ak = actKeyByName[it.activity];
        if (ak && it.expectation) items[`${ak}|${it.role}`] = sub(it.expectation);
      }
      out.people[key] = { planIntro: sub(p.planIntro) || null, items };
    }
  }
  return out;
}

// What is saved for a completed result: the shape of the work and the
// engine result with labels. No names, skills or document text.
export function runRecord(R, state) {
  const L = labelsFor(R);
  const { actByKey, phaseOf } = lookups(R, state);
  return {
    mode: R.usingRoster ? 'roster' : 'design',
    weeks: +state.weeks || null,
    hours: +state.hours || null,
    activityCount: state.acts.length,
    profiles: R.people.map(p => p.profile),
    resultSummary: {
      headcount: { lo: R.headcount.lo, hi: R.headcount.hi, basis: R.headcount.basis },
      ideal: R.ideal.map(s => s.profile),
      demand: R.demand,
      byProfile: R.byProfile,
      engagementLead: L[R.engagementLead] || null,
      people: R.people.map(p => ({ label: L[p.key], profile: p.profile, avail: p.avail, cap: Math.round(p.cap), load: Math.round(p.load), E: Math.round(p.E), N: Math.round(p.N), D: Math.round(p.D) })),
      rows: R.rows.map(r => ({ activity: actByKey[r.act].name, taxonomyId: actByKey[r.act].tax, tag: actByKey[r.act].tag, phase: phaseOf(r.act).name, mode: actByKey[r.act].mode, hours: Math.round(r.hours), owner: L[r.owner], contribs: r.contribs.map(k => L[k]), reviewer: r.reviewer ? L[r.reviewer] : null })),
      gaps: R.gaps.map(g => ({ type: g.type, ...(g.orientation ? { orientation: g.orientation } : {}), ...(g.person ? { person: L[g.person] } : {}), ...(g.act ? { activity: actByKey[g.act].name } : {}) })),
      friction: R.friction.map(f => ({ id: f.id, a: L[f.a], b: L[f.b], shared: f.shared.length })),
    },
    unlisted: state.acts.filter(a => +a.tax === 0).map(a => ({ activityName: a.name, tag: a.tag, evidence: a.evidence || null })),
  };
}
