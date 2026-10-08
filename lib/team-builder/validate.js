// Server-side validation of the extraction (spec "API 1 ... Server-side
// validation"). Pure, so it is unit tested with the engine.
import { TAGS, MODES } from './engine.js';
import { isAllowedShift } from './taxonomy.js';

const clampWeek = v => (Number.isFinite(+v) && +v >= 1 ? Math.round(+v) : 1);
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function validateExtraction(raw, taxonomy) {
  const warnings = [];
  const tax = Object.fromEntries(taxonomy.map(t => [t.id, t]));
  const project = raw && typeof raw.project === 'object' && raw.project ? raw.project : {};
  const weeks = Number.isFinite(+project.durationWeeks) && +project.durationWeeks > 0 ? Math.round(+project.durationWeeks) : null;
  const hours = Number.isFinite(+project.totalHours) && +project.totalHours > 0 ? Math.round(+project.totalHours) : null;

  // Phases: names unique, exactly one Ongoing, weeks clamped.
  const phases = [];
  const seen = new Set();
  for (const p of Array.isArray(raw?.phases) ? raw.phases : []) {
    const name = str(p?.name, 80);
    if (!name || seen.has(name.toLowerCase())) continue;
    const ongoing = !!p.ongoing || name.toLowerCase() === 'ongoing';
    if (ongoing && phases.some(x => x.ongoing)) continue;
    seen.add(name.toLowerCase());
    let start = clampWeek(p.startWeek), end = clampWeek(p.endWeek);
    if (end < start) end = start;
    phases.push({ name: ongoing ? 'Ongoing' : name, start, end, ongoing });
  }
  if (!phases.some(p => p.ongoing)) {
    phases.push({ name: 'Ongoing', start: 1, end: weeks || 1, ongoing: true });
  }
  const phaseNames = new Set(phases.map(p => p.name));

  const activities = [];
  for (const a of Array.isArray(raw?.activities) ? raw.activities : []) {
    const name = str(a?.name, 120);
    if (!name) continue;
    let taxonomyId = Number.isInteger(+a.taxonomyId) && +a.taxonomyId >= 0 && +a.taxonomyId <= 63 ? +a.taxonomyId : 0;
    if (taxonomyId > 0 && !tax[taxonomyId]) taxonomyId = 0;
    let tag = TAGS.includes(a.tag) ? a.tag : null;
    let shiftReason = str(a.shiftReason, 300) || null;
    if (taxonomyId > 0) {
      const base = tax[taxonomyId].tag;
      if (!tag || !isAllowedShift(base, tag)) {
        if (tag && tag !== base) warnings.push(`"${name}": the suggested ${tag} tag isn't an allowed shift from ${base}, so it was reset.`);
        tag = base; shiftReason = null;
      }
      if (tag === base) shiftReason = null;
    } else if (!tag) {
      tag = 'WHAT-HOW';
      warnings.push(`"${name}" had no valid demand tag, so it was set to WHAT-HOW for you to check.`);
    }
    let phase = str(a.phase, 80);
    if (!phaseNames.has(phase)) {
      const ci = [...phaseNames].find(n => n.toLowerCase() === phase.toLowerCase());
      phase = ci || 'Ongoing';
    }
    const sharePct = Number.isFinite(+a.sharePct) && +a.sharePct >= 0 ? Math.round(+a.sharePct * 10) / 10 : 0;
    const delivery = MODES.includes(a.delivery) ? a.delivery : 'Solo';
    const source = a.source === 'inferred' ? 'inferred' : 'stated';
    const evidence = source === 'stated' ? (str(a.evidence, 240) || null) : null;
    activities.push({ name, taxonomyId, tag, shifted: taxonomyId > 0 && tag !== tax[taxonomyId].tag, shiftReason, phase, sharePct, delivery, source, evidence });
  }
  if (!activities.length) warnings.push('No activities were found. Add them by hand, or try pasting just the scope section.');

  return {
    project: {
      name: str(project.name, 120) || null,
      client: str(project.client, 120) || null,
      durationWeeks: weeks,
      totalHours: hours,
      hoursSource: ['stated', 'estimated', 'none'].includes(project.hoursSource) ? project.hoursSource : (hours ? 'estimated' : 'none'),
    },
    phases,
    activities,
    notes: str(raw?.notes, 600) || null,
    warnings,
  };
}
