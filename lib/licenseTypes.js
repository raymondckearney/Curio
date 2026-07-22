// Concrete, grantable tool/license types — what ends up stored on an
// account_licenses row. Shared between the admin panel's manual "+Add
// License" dropdowns (Invite/Edit — used for demo accounts where a specific
// profile is deliberately chosen) and any API route validating a license
// type against this list.
export const DIRECT_LICENSE_TYPES = [
  'assessment_tokens',
  'role_analyzer',
  'career_guidance',
  'jd_analyzer',
  'precision_companion',
  'purpose_companion',
  'progress_companion',
  'orientation_translator',
  'library_full',
  'library_a',
  'library_b',
  'library_c',
  'library_d',
  'library_e',
];

// Everything a token's granted_tools can hold: the concrete types above, plus
// the "companion_match" / "library_match" sentinels — resolved to a concrete
// type (via lib/tertiary.js's resolveGrantedTools) once the participant's
// assessment completes and their tertiary is known. Only meaningful on a
// token (Generate Tokens panel), since that's the one place resolution
// actually happens — never as a literal account_licenses.type.
export const TOKEN_GRANT_TYPES = [...DIRECT_LICENSE_TYPES, 'companion_match', 'library_match'];
