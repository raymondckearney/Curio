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

// A token/account can be granted the sentinel types "companion_match" and
// "library_match" (admin panel: Generate Tokens / Invite / Edit) instead of
// a specific Companion or collection, for a real participant whose profile
// isn't known yet at grant time. Once their assessment resolves a tertiary,
// this turns those sentinels into the concrete license type to actually
// insert. Called from pages/api/auth/signup.js and
// pages/api/portal/complete-assessment.js, the two places a token's
// granted_tools become account_licenses rows.
export function resolveGrantedTools(tools, tertiary) {
  if (!tertiary) return tools.filter(t => t !== 'companion_match' && t !== 'library_match');
  return tools.map(t => {
    if (t === 'companion_match') return `${COMPANION_BY_TERTIARY[tertiary]}_companion`;
    if (t === 'library_match') return `library_${COLLECTION_BY_TERTIARY[tertiary].toLowerCase()}`;
    return t;
  });
}
