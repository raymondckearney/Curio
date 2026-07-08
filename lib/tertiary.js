// Shared, client-safe mapping between a MindPrint(tm) profile and its tertiary
// (draining) orientation. No prompt content lives here - safe to import from
// client pages.

export const TERTIARY_BY_PROFILE = {
  'WHY-WHAT': 'HOW', 'WHAT-WHY': 'HOW',
  'WHY-HOW': 'WHAT', 'HOW-WHY': 'WHAT',
  'WHAT-HOW': 'WHY', 'HOW-WHAT': 'WHY',
};

export const COMPANION_BY_TERTIARY = { HOW: 'precision', WHY: 'purpose', WHAT: 'progress' };
export const COLLECTION_BY_TERTIARY = { HOW: 'A', WHAT: 'B', WHY: 'C' };

// profileSlug is the lowercase-hyphenated form used elsewhere in the app,
// e.g. "why-what". Returns "HOW" | "WHAT" | "WHY" | null.
export function tertiaryFromProfileSlug(profileSlug) {
  if (!profileSlug) return null;
  const upper = profileSlug.toUpperCase();
  return TERTIARY_BY_PROFILE[upper] || null;
}
