// Client-safe. The portal sidebar's items and the one rule for who can see
// each, shared by components/PortalSidebar.js and the Curio Assistant
// (lib/assistantCatalog.js), so the assistant never disagrees with the
// sidebar about what someone can open.

// Sidebar items are the ones without `inTools`. Tools (`inTools: true`)
// live on the Tools page (/portal/tools) as thumbnail cards instead, grouped
// by `section`, plus a "More from Curio" section for tools they don't have.
export const NAV_ITEMS = [
  { key: 'dashboard',        href: '/portal/dashboard',        label: 'My Profile',           alwaysShow: true },
  { key: 'tools',            href: '/portal/tools',            label: 'Tools',                alwaysShow: true },
  { key: 'team',             href: '/portal/team',             label: 'My Team',              license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true },
  { key: 'dynamics',         href: '/portal/team-dynamics',    label: 'Dynamics',             license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'onboarding-resources', href: '/portal/onboarding-resources', label: 'Onboarding Resources', license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'tokens',           href: '/portal/tokens',           label: 'Send Assessment',      license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'analytics',        href: '/portal/analytics',        label: 'Analytics',            license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true, groupKey: 'team' },
  { key: 'library',          href: '/portal/library',          label: 'Resources',            alwaysShow: true },
  { key: 'insights',         href: '/portal/insights',         label: 'Recent Articles',      alwaysShow: true },

  { key: 'ai-delegation-guide', href: '/portal/tools/ai-delegation-guide', label: 'AI & Delegation Guide', requiresProfile: true, inTools: true, section: 'profile',
    blurb: 'For each kind of task that drains you, whether to hand it to AI, delegate it, or collaborate, and the resource to use.' },
  { key: 'precision',        href: '/portal/tools/precision-companion', label: 'Precision Companion', license: 'precision_companion', inTools: true, section: 'profile', tertiary: 'HOW',
    blurb: 'AI help with HOW work: break a goal into tasks, pre-flight checklists, gap reviews, and edge cases.' },
  { key: 'purpose',          href: '/portal/tools/purpose-companion',   label: 'Purpose Companion',   license: 'purpose_companion', inTools: true, section: 'profile', tertiary: 'WHY',
    blurb: 'AI help with WHY work: purpose briefs, North Star one-pagers, and opening lines that land.' },
  { key: 'progress',         href: '/portal/tools/progress-companion',  label: 'Progress Companion',  license: 'progress_companion', inTools: true, section: 'profile', tertiary: 'WHAT',
    blurb: 'AI help with WHAT work: good-enough shipping criteria, milestone backplans, and weekly updates.' },
  { key: 'translator',       href: '/portal/tools/orientation-translator', label: 'Orientation Translator', license: 'orientation_translator', inTools: true, section: 'profile',
    blurb: "Rewrite a message for a WHY, WHAT, or HOW reader, or for a specific person's profile." },
  { key: 'session-architect', href: '/portal/tools/session-architect', label: 'Session Architect', license: 'session_architect', inTools: true, section: 'teams',
    blurb: 'Build a workshop, brainstorm, retro, or kickoff sequenced through WHY, WHAT, and HOW, with printable materials.' },
  { key: 'meeting-architect', href: '/portal/tools/meeting-architect', label: 'Meeting Architect', license: 'meeting_architect', inTools: true, section: 'teams',
    blurb: 'Redesign a recurring meeting around your goals, current challenges, and the people in it.' },
  { key: 'team-builder', href: '/portal/tools/team-builder', label: 'Team Builder', license: 'team_builder', inTools: true, section: 'teams',
    blurb: 'Upload a statement of work or project plan and see the team shape, who owns each activity, and where the drain will land.' },
  { key: 'fit',              href: '/portal/tools/fit',        label: 'Role Analyzer',        license: 'role_analyzer', inTools: true, section: 'career',
    blurb: 'Enter any role title and see how well it fits a MindPrint profile, and why.' },
  { key: 'career',           href: '/portal/tools/career',     label: 'Career Guidance Tool', license: 'career_guidance', inTools: true, section: 'career',
    blurb: 'A career report with best-fit roles, energizers, challenges, and strategies.' },
  { key: 'jd',               href: '/portal/tools/jd',        label: 'Job Description Analyzer', license: 'jd_analyzer', inTools: true, section: 'career',
    blurb: 'Paste a job description and see what would energize and drain you in that role.' },
];

export const TOOL_SECTIONS = [
  { key: 'profile', label: 'Work with your profile', sub: 'Support for the work that drains you, and for communicating across orientations.' },
  { key: 'teams',   label: 'Teams, sessions and meetings', sub: 'Shape project teams, sessions and recurring meetings around how the people in them are wired.' },
  { key: 'career',  label: 'Roles and career', sub: 'See how roles and job descriptions fit a profile.' },
];

export function toolThumb(item) {
  return `/images/tools/${item.key}.webp`;
}

// Why an item is hidden for this user, or null if they can see it.
// ctx: { licenseTypes: Set, isTeamAccount, role, hasProfile, tier?, tertiary? }
//   'team'    - team-only item, account isn't a team account
//   'role'    - owner/manager-only item, user is a plain member
//   'profile' - needs a completed MindPrint assessment
//   'license' - needs a license the account doesn't have
export function navLockReason(item, ctx) {
  if (item.enterpriseOnly && !ctx.isTeamAccount) return 'team';
  if (item.ownerOnly && ctx.role !== 'owner' && ctx.role !== 'manager') return 'role';
  if (item.alwaysShow) return null;
  if (item.requiresProfile) return ctx.hasProfile ? null : 'profile';
  // Premium accounts get the Companion matching their own tertiary free.
  if (item.tertiary && ctx.tier && ctx.tier !== 'basic' && ctx.tertiary === item.tertiary) return null;
  if (item.licenseAny) return item.licenseAny.some(t => ctx.licenseTypes.has(t)) ? null : 'license';
  return ctx.licenseTypes.has(item.license) ? null : 'license';
}

export const ASSISTANT_LICENSE = 'curio_assistant';

// Pilot gate: the assistant needs its own license and, for now, a team
// (enterprise) account.
export function assistantEnabled(licenseTypes, isTeamAccount) {
  return !!isTeamAccount && licenseTypes.has(ASSISTANT_LICENSE);
}
