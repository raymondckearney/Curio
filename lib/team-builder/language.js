// Output language lint for AI-written text, from the Source of Truth
// Section 2 rules plus Section 10's team-role vocabulary. Returns the list
// of problems found (empty when the string passes). Shared so any tool can
// check generated copy the same way.

const BANNED_WORDS = ['strength', 'strengths', 'weakness', 'weaknesses', 'personality', 'dominant', 'brain', 'brains'];
const BANNED_PHRASES = ['cognitive style', 'blind spot'];
// "lead" for activity ownership. "Engagement lead" is the only allowed use
// for a person.
const LEAD_PATTERNS = [/\bleads the\b/i, /\blead on\b/i, /\bactivity lead\b/i];

export function lintText(text) {
  const s = String(text || '');
  const problems = [];
  if (/—/.test(s)) problems.push('em dash');
  // An en dash used as punctuation (spaced, or between words). One between
  // two numbers, as in a range, is allowed.
  if (/\s–\s|[A-Za-z]–[A-Za-z]/.test(s)) problems.push('en dash');
  for (const w of BANNED_WORDS) if (new RegExp(`\\b${w}\\b`, 'i').test(s)) problems.push(`"${w}"`);
  for (const p of BANNED_PHRASES) if (new RegExp(`\\b${p}\\b`, 'i').test(s)) problems.push(`"${p}"`);
  for (const re of LEAD_PATTERNS) if (re.test(s)) problems.push(`"lead" for ownership (${re.source.replace(/\\b/g, '')})`);
  return problems;
}

export const passes = text => lintText(text).length === 0;

// Walks any JSON value and returns [{ path, text, problems }] for every
// string that fails.
export function lintAll(value, path = '') {
  if (typeof value === 'string') { const p = lintText(value); return p.length ? [{ path, text: value, problems: p }] : []; }
  if (Array.isArray(value)) return value.flatMap((v, i) => lintAll(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => lintAll(v, path ? `${path}.${k}` : k));
  return [];
}
