// Client-safe Meeting Architect helpers. The meeting templates themselves
// (purpose, blocks, pct weights, lean-in parts) live only in
// /meeting_architect_templates.md and are parsed server-side by
// lib/meetingTemplates.js, so Ray edits one file to change them.

export const DEFAULT_DURATIONS = [30, 60, 90];
const DURATIONS_BY_TYPE = { 'weekly-status-meeting': [15, 30, 60, 90] };

export function durationsFor(slug) {
  return DURATIONS_BY_TYPE[slug] || DEFAULT_DURATIONS;
}

export const INPUT_MODE_LABELS = {
  roster: 'Roster',
  relationship: 'Single Relationship',
  none: 'No Roster',
};

export function slugifyMeetingType(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Same rule as Session Architect's handleGenerate (pct x total, rounded to
// the nearest 5, minimum 5), plus one correction Session Architect doesn't
// need for its own templates: with these weights, rounding each block
// independently can leave the total 5 minutes over or under what the user
// picked (e.g. a 30-minute Team Meeting sums to 35), so the leftover is
// absorbed by the longest block.
export function computeAgenda(blocks, totalMinutes) {
  const mins = blocks.map(b => Math.max(5, Math.round((b.pct * totalMinutes) / 5) * 5));
  const diff = totalMinutes - mins.reduce((a, m) => a + m, 0);
  if (diff !== 0) {
    const longest = mins.indexOf(Math.max(...mins));
    mins[longest] = Math.max(5, mins[longest] + diff);
  }
  let elapsed = 0;
  return blocks.map((b, i) => {
    const start = elapsed;
    elapsed += mins[i];
    return { name: b.name, energy: b.energy, start, end: elapsed };
  });
}

// "WHY-WHAT" -> { primary: 'WHY', secondary: 'WHAT', tertiary: 'HOW' }
export function profileEnergies(profile) {
  if (!profile) return null;
  const [primary, secondary] = profile.toUpperCase().split('-');
  const tertiary = ['WHY', 'WHAT', 'HOW'].find(e => e !== primary && e !== secondary);
  if (!primary || !secondary || !tertiary) return null;
  return { primary, secondary, tertiary };
}
