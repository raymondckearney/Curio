// Client-safe. The portal sidebar's items and the one rule for who can see
// each, shared by components/PortalSidebar.js and the Curio Assistant
// (lib/assistantCatalog.js), so the assistant never disagrees with the
// sidebar about what someone can open.

export const NAV_ITEMS = [
  { key: 'dashboard',        href: '/portal/dashboard',        label: 'My Profile',           alwaysShow: true },
  { key: 'ai-delegation-guide', href: '/portal/tools/ai-delegation-guide', label: 'AI & Delegation Guide', requiresProfile: true },
  { key: 'team',             href: '/portal/team',             label: 'My Team',              license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true },
  { key: 'session-architect', href: '/portal/tools/session-architect', label: 'Session Architect', license: 'session_architect' },
  { key: 'meeting-architect', href: '/portal/tools/meeting-architect', label: 'Meeting Architect', license: 'meeting_architect' },
  { key: 'dynamics',         href: '/portal/team-dynamics',    label: 'Dynamics',             license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'onboarding-resources', href: '/portal/onboarding-resources', label: 'Onboarding Resources', license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'tokens',           href: '/portal/tokens',           label: 'Send Assessment',      license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'analytics',        href: '/portal/analytics',        label: 'Analytics',            license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'fit',              href: '/portal/tools/fit',        label: 'Role Analyzer',        license: 'role_analyzer' },
  { key: 'career',           href: '/portal/tools/career',     label: 'Career Guidance Tool', license: 'career_guidance' },
  { key: 'jd',               href: '/portal/tools/jd',        label: 'Job Description Analyzer', license: 'jd_analyzer' },
  { key: 'precision',        href: '/portal/tools/precision-companion', label: 'Precision Companion', license: 'precision_companion' },
  { key: 'purpose',          href: '/portal/tools/purpose-companion',   label: 'Purpose Companion',   license: 'purpose_companion' },
  { key: 'progress',         href: '/portal/tools/progress-companion',  label: 'Progress Companion',  license: 'progress_companion' },
  { key: 'translator',       href: '/portal/tools/orientation-translator', label: 'Orientation Translator', license: 'orientation_translator' },
  { key: 'library',          href: '/portal/library',          label: 'Resources',            alwaysShow: true },
  { key: 'insights',         href: '/portal/insights',         label: 'Recent Articles',      alwaysShow: true },
];

// Why an item is hidden for this user, or null if they can see it.
// ctx: { licenseTypes: Set, isTeamAccount, role, hasProfile }
//   'team'    - team-only item, account isn't a team account
//   'role'    - owner/manager-only item, user is a plain member
//   'profile' - needs a completed MindPrint assessment
//   'license' - needs a license the account doesn't have
export function navLockReason(item, ctx) {
  if (item.enterpriseOnly && !ctx.isTeamAccount) return 'team';
  if (item.ownerOnly && ctx.role !== 'owner' && ctx.role !== 'manager') return 'role';
  if (item.alwaysShow) return null;
  if (item.requiresProfile) return ctx.hasProfile ? null : 'profile';
  if (item.licenseAny) return item.licenseAny.some(t => ctx.licenseTypes.has(t)) ? null : 'license';
  return ctx.licenseTypes.has(item.license) ? null : 'license';
}

export const ASSISTANT_LICENSE = 'curio_assistant';

// Pilot gate: the assistant needs its own license and, for now, a team
// (enterprise) account.
export function assistantEnabled(licenseTypes, isTeamAccount) {
  return !!isTeamAccount && licenseTypes.has(ASSISTANT_LICENSE);
}
