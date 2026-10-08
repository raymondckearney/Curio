// Turns an engine result into what the page and the PDFs show: display
// names, activity and phase lookups, and the copy that has both a
// templated and an AI-written version (the AI version wins when present).
import { TAGS, ORIENTATIONS, primaryOf, orderedPhases } from './engine.js';
import { FRICTION_COPY, gapText, expectationText, list, pct } from './copy.js';

// Everything the result and the PDFs need to describe one engine result.
export function describe(R, state) {
  const actByKey = Object.fromEntries(state.acts.map(a => [a.key, a]));
  const phaseByKey = Object.fromEntries(state.phases.map(p => [p.key, p]));
  const personByKey = Object.fromEntries(R.people.map(p => [p.key, p]));
  const rowByAct = Object.fromEntries(R.rows.map(r => [r.act, r]));
  const nameOf = k => personByKey[k]?.name || 'Unnamed';
  const actName = k => actByKey[k]?.name || 'Activity';
  const phaseOf = k => phaseByKey[actByKey[k]?.phase] || orderedPhases(state.phases).find(p => p.ongoing);
  const roleOf = (r, k) => (r.owner === k ? 'Owner' : r.reviewer === k ? 'Reviewer' : r.contribs.includes(k) ? 'Contributor' : '');
  const d = R.demand;
  const top = [...ORIENTATIONS].sort((a, b) => d[b] - d[a]);
  const phasesWithWork = orderedPhases(state.phases).filter(p => state.acts.some(a => a.phase === p.key));
  return { R, state, actByKey, phaseByKey, personByKey, rowByAct, nameOf, actName, phaseOf, roleOf, top, phasesWithWork };
}

export function templatedSummary(V) {
  const { R, top } = V, d = R.demand;
  return `This work is ${top[0]}-heavy: ${pct(d[top[0]])} of its demand sits in the ${top[0]} orientation, ${pct(d[top[1]])} in ${top[1]} and ${pct(d[top[2]])} in ${top[2]}. ${R.usingRoster ? `The plan below spreads it across ${R.people.length} people.` : `The ideal team has ${R.ideal.length} seats.`}`;
}

export function frictionView(V, f, narrative) {
  const copy = FRICTION_COPY[f.id];
  const a = V.nameOf(f.a), b = V.nameOf(f.b);
  const act = f.focusAct ? V.actName(f.focusAct).toLowerCase() : 'shared work';
  const ai = narrative?.friction?.[f.id];
  return {
    ...f, title: copy.title, what: copy.what, aName: a, bName: b,
    aProfile: V.personByKey[f.a].profile, bProfile: V.personByKey[f.b].profile,
    steps: ai?.steps?.length ? ai.steps : copy.steps(a, b, act),
    tools: ai?.tools?.length ? ai.tools : f.tools,
    where: f.shared.length ? list(f.shared.slice(0, 3).map(k => `${V.actName(k)} (${V.phaseOf(k).name})`)) : 'They share no activity directly, so it will show at phase handoffs and in check-ins.',
  };
}

export function gapView(V, g) {
  return gapText(g, V.nameOf, V.actName, o => TAGS.filter(t => primaryOf(t) === o));
}

export function expectationFor(V, person, item, narrative) {
  const ai = narrative?.people?.[person.key]?.items?.[`${item.act}|${item.role}`];
  if (ai) return ai;
  const r = V.rowByAct[item.act];
  return expectationText(item.role, { owner: V.nameOf(r.owner), contribs: r.contribs.map(V.nameOf), reviewerPrimary: primaryOf(person.profile) });
}

export function collaborators(V, p) {
  const coll = {};
  for (const i of p.items) {
    const r = V.rowByAct[i.act];
    for (const k of [r.owner, ...r.contribs, r.reviewer].filter(x => x && x !== p.key)) {
      (coll[k] = coll[k] || { key: k, acts: [] }).acts.push(V.actName(i.act));
    }
  }
  return Object.values(coll).map(c => ({ ...c, acts: [...new Set(c.acts)] }));
}

