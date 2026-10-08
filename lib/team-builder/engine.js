// Team Builder engine. Deterministic, no AI, no DOM, no imports, so the
// same input always gives the same result and it runs in the browser, on
// the server, and under `node --test`. Ported from the approved prototype
// (docs/prototypes/team-builder-prototype.html); the rules are listed in
// docs/specs/team-builder-build-spec.md ("THE ENGINE").
//
// Input shapes (keys are any stable ids):
//   phase:    { key, name, start, end, ongoing }
//   activity: { key, name, tax, tag, phase (a phase key), share, mode, src, shiftReason? }
//   person:   { key, name, profile, avail }        (avail = 100 | 75 | 50 | 25)
// Every person returned carries `key`; rows and items refer to people and
// activities by key so the result is plain, serializable data.

export const TAGS = ['WHY-WHAT', 'WHY-HOW', 'WHAT-WHY', 'WHAT-HOW', 'HOW-WHY', 'HOW-WHAT'];
export const ORIENTATIONS = ['WHY', 'WHAT', 'HOW'];
export const MODES = ['Solo', 'Pair', 'Small team', 'Whole team'];

export const SPLIT = { lead: 0.6, support: 0.3, residual: 0.1 };
export const CAPACITY_HOURS_PER_WEEK = 40;
export const LOAD_PENALTY = 35;
export const DRAIN_BUDGET = 0.20;
export const CONTRIBUTOR_MIN_SCORE = 40;
export const COVERAGE_DEMAND_MIN = 0.20;
export const DELIVERABLE_IDS = [7, 29, 50, 51, 52, 53, 63];
export const DIRECTION_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 28, 29, 30, 31, 32, 33, 50, 51, 53, 54, 55, 56, 57];

// Role titles by profile. "Lead" is reserved for the engagement lead
// (Source of Truth Section 10), so no title uses it.
export const ROLE = {
  'WHY-WHAT': 'Strategy and engagement',
  'WHY-HOW': 'Research and systems',
  'WHAT-WHY': 'Client and momentum',
  'WHAT-HOW': 'Delivery and execution',
  'HOW-WHY': 'Analysis and quality',
  'HOW-WHAT': 'Operations and process',
};

// Mitigations by the orientation a piece of draining work sits in, with
// Tertiary Support Library tool numbers. Copy verbatim from the prototype.
export const MIT = {
  HOW: { text: 'Ask a HOW-primary teammate to review it, batch the detail work into fixed blocks, and use AI support for first drafts of checklists and documentation.', tools: [10, 5, 9] },
  WHAT: { text: 'Pair with a WHAT-primary who sets the cadence, and fix decision dates before the work starts.', tools: [20, 13] },
  WHY: { text: 'Have a WHY-primary write a short purpose brief before the work starts, and put a direction check at the end of the phase.', tools: [21, 26] },
};

const parts = tag => String(tag).split('-');
export const primaryOf = profile => parts(profile)[0];
export const secondaryOf = profile => parts(profile)[1];
export const tertiaryOf = profile => ORIENTATIONS.find(o => !parts(profile).includes(o));

// The 60 / 30 / 10 demand split a tag converts to (taxonomy section 2).
export function split(tag) {
  const [l, s] = parts(tag);
  const r = {};
  for (const o of ORIENTATIONS) r[o] = o === l ? SPLIT.lead : o === s ? SPLIT.support : SPLIT.residual;
  return r;
}

// Source of Truth Section 6 formula, unchanged, on the activity's split.
export function score(profile, tag) {
  const d = split(tag);
  const [p, s] = parts(profile);
  const t = tertiaryOf(profile);
  const raw = d[p] * 1.25 + d[s] * 0.9 - d[t];
  return Math.round(Math.pow(Math.max(0, Math.min(1, (raw + 1) / 2.25)), 1.2) * 100);
}

// What a role on an activity costs a person: the activity's lead
// orientation against their profile. E = energizing, N = neutral, D = draining.
export function energy(profile, tag) {
  const l = parts(tag)[0];
  const [p, s] = parts(profile);
  return l === p ? 'E' : l === s ? 'N' : 'D';
}

const num = v => (Number.isFinite(+v) ? +v : 0);
const shareTotal = acts => acts.reduce((s, a) => s + Math.max(0, num(a.share)), 0);

// Phases in display order: dated phases by start week, Ongoing last.
export function orderedPhases(phases) {
  return [...phases].sort((a, b) => (!!a.ongoing - !!b.ongoing) || (num(a.start) - num(b.start)));
}

// Demand by orientation across a set of activities, weighted by share.
export function demand(acts) {
  const d = { WHY: 0, WHAT: 0, HOW: 0 };
  let tot = 0;
  for (const a of acts) {
    const s = split(a.tag);
    const w = Math.max(0, num(a.share));
    for (const o of ORIENTATIONS) d[o] += s[o] * w;
    tot += w;
  }
  for (const o of ORIENTATIONS) d[o] = tot ? d[o] / tot : 0;
  return d;
}

// Share of total effort by the profile (tag) each activity calls for.
export function byProfile(acts) {
  const r = {};
  let t = 0;
  for (const a of acts) { r[a.tag] = (r[a.tag] || 0) + Math.max(0, num(a.share)); t += Math.max(0, num(a.share)); }
  for (const x of TAGS) r[x] = t ? (r[x] || 0) / t : 0;
  return r;
}

export function headcount({ weeks, hours, activityCount }) {
  const w = num(weeks), h = num(hours);
  if (w > 0 && h > 0) {
    const lo = Math.max(1, Math.ceil(h / (w * CAPACITY_HOURS_PER_WEEK)));
    let hi = Math.ceil(h / (w * CAPACITY_HOURS_PER_WEEK * 0.75));
    if (hi <= lo) hi = lo + 1;
    return { lo, hi, basis: 'hours', hours: h, weeks: w };
  }
  const lo = Math.max(2, Math.round(activityCount / 4));
  return { lo, hi: lo + 1, basis: 'activities' };
}

// Ideal seats: n seats apportioned across the six profiles by share of
// effort, largest-remainder method. Labelled Seat A, Seat B, ...
export function idealSeats(acts, n) {
  const bp = byProfile(acts);
  const q = TAGS.map(t => ({ t, q: bp[t] * n }));
  const out = [];
  for (const x of q) { x.f = Math.floor(x.q); x.r = x.q - x.f; for (let i = 0; i < x.f; i++) out.push(x.t); }
  q.sort((a, b) => b.r - a.r);
  let i = 0;
  while (out.length < n && i < q.length) { if (q[i].q > 0) out.push(q[i].t); i++; }
  return out.map((profile, j) => ({ key: `seat-${j}`, name: `Seat ${String.fromCharCode(65 + j)}`, profile, avail: 100, seat: true }));
}

// Friction patterns from Source of Truth Section 5. Side A and side B are
// tests on a profile. tools are Tertiary Support Library numbers. The
// UI holds each pattern's copy and templated steps (lib/team-builder/copy.js).
export const FRICTION = [
  { id: 'handoff', a: p => p === 'WHY-WHAT', b: p => primaryOf(p) === 'HOW', tools: [42, 10, 7] },
  { id: 'tissue', a: p => p === 'WHAT-WHY', b: p => primaryOf(p) === 'HOW', tools: [7, 4, 5] },
  { id: 'trust', a: p => p === 'WHAT-HOW', b: p => primaryOf(p) === 'WHY', tools: [26, 23] },
  { id: 'system', a: p => p === 'HOW-WHAT', b: p => primaryOf(p) === 'WHY', tools: [39, 23] },
  { id: 'deploy', a: p => p === 'HOW-WHY', b: p => primaryOf(p) === 'WHAT', tools: [13, 11] },
  { id: 'timing', a: p => primaryOf(p) === 'WHY', b: p => primaryOf(p) === 'WHAT', tools: [36, 13] },
  { id: 'action', a: p => primaryOf(p) === 'WHAT', b: p => primaryOf(p) === 'HOW', tools: [11, 5] },
  // Added in the build (owner request): the eighth Section 5 pattern.
  { id: 'pace', a: p => primaryOf(p) === 'WHY', b: p => primaryOf(p) === 'HOW', tools: [23, 39] },
];

export function buildTeam({ phases, activities, weeks, hours, roster, useRoster }) {
  const acts = activities || [];
  const tot = shareTotal(acts);
  const totalHours = num(hours);
  const hoursOf = a => (tot ? Math.max(0, num(a.share)) / tot * totalHours : 0);
  const hc = headcount({ weeks, hours, activityCount: acts.length });
  const ideal = idealSeats(acts, Math.min(8, Math.max(2, hc.lo)));
  const usingRoster = !!useRoster && (roster || []).length > 0;
  const W = num(weeks) || 12;

  const people = (usingRoster ? roster : ideal).map(p => ({
    key: p.key, name: p.name, profile: p.profile, avail: num(p.avail) || 100, seat: !!p.seat,
    role: ROLE[p.profile],
    cap: (num(p.avail) || 100) / 100 * W * CAPACITY_HOURS_PER_WEEK,
    load: 0, E: 0, N: 0, D: 0, items: [],
  }));
  const byKey = Object.fromEntries(people.map(p => [p.key, p]));
  const val = (p, a) => score(p.profile, a.tag) - LOAD_PENALTY * (p.load / p.cap);
  const rows = [];

  // Highest-hours activities are assigned first, so the biggest pieces of
  // work go to the best-matched people before load starts to count.
  const queue = acts.map((a, idx) => ({ a, idx, h: hoursOf(a) })).sort((x, y) => (y.h - x.h) || (x.idx - y.idx));
  for (const { a, h } of queue) {
    const order = [...people].sort((x, y) => val(y, a) - val(x, a));
    const owner = order[0];
    if (!owner) break;
    let contribs = [];
    if (a.mode === 'Whole team') contribs = order.slice(1);
    else {
      const n = a.mode === 'Pair' ? 1 : a.mode === 'Small team' ? 2 : 0;
      contribs = order.slice(1).filter(p => score(p.profile, a.tag) >= CONTRIBUTOR_MIN_SCORE).slice(0, n);
    }
    let rev = null;
    const t = tertiaryOf(owner.profile);
    if ((parts(a.tag).includes(t) || DELIVERABLE_IDS.includes(num(a.tax))) && !contribs.some(p => primaryOf(p.profile) === t)) {
      const c = people.filter(p => p !== owner && !contribs.includes(p) && primaryOf(p.profile) === t).sort((x, y) => val(y, a) - val(x, a));
      rev = c[0] || null;
    }
    let so = 1, sc = 0;
    if (contribs.length) {
      if (a.mode === 'Whole team') { so = 0.3; sc = 0.7 / contribs.length; }
      else if (contribs.length === 1) { so = 0.65; sc = 0.35; }
      else { so = 0.5; sc = 0.5 / contribs.length; }
    }
    const f = rev ? 0.9 : 1;
    const put = (p, share, role) => {
      const hh = h * share;
      const e = energy(p.profile, a.tag);
      p.load += hh; p[e] += hh;
      p.items.push({ act: a.key, role, hours: hh, energy: e });
    };
    put(owner, so * f, 'Owner');
    contribs.forEach(p => put(p, sc * f, 'Contributor'));
    if (rev) put(rev, 0.1, 'Reviewer');
    rows.push({ act: a.key, hours: h, owner: owner.key, contribs: contribs.map(p => p.key), reviewer: rev ? rev.key : null });
  }

  // Display order: by phase, then the order the activities were listed.
  const phaseOrder = orderedPhases(phases || []).map(p => p.key);
  const actIndex = Object.fromEntries(acts.map((a, i) => [a.key, i]));
  const actByKey = Object.fromEntries(acts.map(a => [a.key, a]));
  const ordKey = k => [phaseOrder.indexOf(actByKey[k].phase), actIndex[k]];
  const cmp = (x, y) => { const [a1, b1] = ordKey(x), [a2, b2] = ordKey(y); return (a1 - a2) || (b1 - b2); };
  rows.sort((x, y) => cmp(x.act, y.act));
  people.forEach(p => p.items.sort((x, y) => cmp(x.act, y.act)));

  const ownedIn = (p, test) => p.items.filter(i => i.role === 'Owner' && test(actByKey[i.act])).reduce((s, i) => s + i.hours, 0);
  const engagementLead = people.length ? [...people].sort((x, y) => ownedIn(y, a => DIRECTION_IDS.includes(num(a.tax))) - ownedIn(x, a => DIRECTION_IDS.includes(num(a.tax))))[0].key : null;
  const phaseOwners = orderedPhases(phases || [])
    .filter(ph => !ph.ongoing && acts.some(a => a.phase === ph.key))
    .map(ph => ({ phase: ph.key, person: [...people].sort((x, y) => ownedIn(y, a => a.phase === ph.key) - ownedIn(x, a => a.phase === ph.key))[0].key }));

  const result = {
    headcount: hc, ideal, people, rows, usingRoster, engagementLead, phaseOwners,
    demand: demand(acts), byProfile: byProfile(acts), totalHours,
  };
  result.gaps = findGaps(result, acts, byKey, actByKey);
  result.friction = findFriction(result, actByKey);
  return result;
}

// Typed gap findings. The UI turns these into plain-language flags and
// never shows the thresholds.
function findGaps(R, acts, byKey, actByKey) {
  const out = [];
  const d = R.demand;
  for (const o of ORIENTATIONS) {
    if (d[o] >= COVERAGE_DEMAND_MIN && !R.people.some(p => primaryOf(p.profile) === o)) {
      out.push({ type: 'orientation_uncovered', orientation: o, share: d[o], profiles: TAGS.filter(t => primaryOf(t) === o) });
    }
  }
  for (const r of R.rows) {
    const a = actByKey[r.act];
    if (energy(byKey[r.owner].profile, a.tag) === 'D') {
      const lead = primaryOf(a.tag);
      out.push({ type: 'no_natural_owner', act: r.act, person: r.owner, orientation: lead, mitigation: MIT[lead] });
    }
  }
  for (const p of R.people) if (p.load > p.cap) out.push({ type: 'over_capacity', person: p.key, load: p.load, cap: p.cap });
  if (R.usingRoster) for (const p of R.people) if (!p.load) out.push({ type: 'unused_person', person: p.key });
  return out;
}

// For each pattern, the pair (one on each side) sharing the most
// activities; top four by shared count.
function findFriction(R, actByKey) {
  const out = [];
  for (const f of FRICTION) {
    const A = R.people.filter(p => f.a(p.profile));
    const B = R.people.filter(p => f.b(p.profile));
    if (!A.length || !B.length) continue;
    let best = null;
    for (const a of A) for (const b of B) {
      if (a === b) continue;
      const shared = R.rows.filter(r => { const on = [r.owner, ...r.contribs, r.reviewer]; return on.includes(a.key) && on.includes(b.key); });
      if (!best || shared.length > best.shared.length) best = { a, b, shared };
    }
    if (!best) continue;
    // The activity the templated steps name: one side A owns, preferring a
    // shared one.
    const own = best.shared.find(r => r.owner === best.a.key) || R.rows.find(r => r.owner === best.a.key) || best.shared[0];
    out.push({ id: f.id, a: best.a.key, b: best.b.key, shared: best.shared.map(r => r.act), focusAct: own ? own.act : null, tools: f.tools });
  }
  // WHY + HOW (pace versus depth) is low friction overall (Source of Truth
  // Section 5), so it only fills a slot the other patterns leave open.
  const ranked = out.filter(f => f.id !== 'pace').sort((x, y) => y.shared.length - x.shared.length);
  const pace = out.find(f => f.id === 'pace');
  if (pace && ranked.length < 4) ranked.push(pace);
  return ranked.slice(0, 4);
}

// Per-person summary helpers used by the UI and the PDFs.
export const drainShare = p => (p.load ? p.D / p.load : 0);
export const overDrainBudget = p => drainShare(p) > DRAIN_BUDGET;
