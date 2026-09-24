// Server-only. Everything the Curio Assistant can recommend, plus, for a
// given user, whether they can open it and what would unlock it. Access is
// decided here with the same rules the sidebar (lib/portalNav.js) and the
// Resources page (lib/libraryAccess.js) use, never by the model.

import { NAV_ITEMS, navLockReason } from './portalNav';
import { GUIDES } from './guideContent';
import { FIELD_GUIDES } from './fieldGuideContent';
import { getVisibleCollections } from './libraryAccess';
import { isTeamAccount } from './teamAccount';
import { dbGet, dbQuery } from './supabase';

// Plain-language descriptions of each portal page, drawn from the product
// manual. These drive how well the assistant matches, so keep them
// accurate when a tool changes.
export const TOOL_DESCRIPTIONS = {
  'dashboard': {
    summary: 'Your MindPrint profile: your primary-secondary orientation, what energizes and drains you, and how you collaborate, with a downloadable full profile and a link to your Communication Field Guide. If you have not taken the assessment yet, this is where you start it.',
    helpsWith: 'understanding your own profile, what energizes or drains you, starting your assessment, downloading your profile',
  },
  'ai-delegation-guide': {
    summary: 'A task-routing table for your profile: for each kind of tertiary (draining) task, whether to hand it to AI, delegate it to a teammate, or collaborate on it, with a linked library tool. Premium accounts also get a classifier for any task you describe.',
    helpsWith: 'deciding what to hand off, delegating draining work, using AI for tasks that drain you',
  },
  'team': {
    summary: 'Everyone on your account with their assessment status and MindPrint profile. Owners can also set roles and teams.',
    helpsWith: "seeing who is on the team and their profiles, managing roles and teams",
  },
  'dynamics': {
    summary: "Team analysis built from your real roster: Team Canvas, Problem Match (who should lead or support which kind of work), Friction Spotter (tension patterns between profiles), Energy Map, Collaboration pairings for a task you describe, and a Blind Spot Report.",
    helpsWith: 'team friction or conflict, who should lead what, pairing people for a task, spotting what a team is missing',
  },
  'onboarding-resources': {
    summary: "A Manager Integration Guide and a New Hire Brief for each of the six profiles: what energizes and drains a new hire early on, Day 1 and Week 1 done right, 30/60/90-day check-ins, and common misreadings.",
    helpsWith: "onboarding a new hire, a new hire's first 90 days, integrating someone into the team",
  },
  'tokens': {
    summary: 'Send MindPrint assessment links to one person or a whole batch, with a customizable email.',
    helpsWith: 'inviting people to take the assessment',
  },
  'analytics': {
    summary: "Charts of your team's profiles and primary orientations, a results table, and a list generator to email everyone with a given profile or orientation.",
    helpsWith: "seeing your team's profile mix, finding everyone with a given orientation",
  },
  'session-architect': {
    summary: 'Builds a facilitated session (brainstorm, decision-making, planning or kickoff, retrospective) sequenced through WHY, WHAT, and HOW, with a timed agenda, activity sheets, suggested breakout groups, and printable materials.',
    helpsWith: 'planning a workshop, running a brainstorm or retro, designing a kickoff or decision session',
  },
  'meeting-architect': {
    summary: "A timed redesign of a recurring meeting (weekly status, team meeting, leadership update, 1:1, performance or career conversation, all-hands, client check-in) around your objectives, current challenges, the people involved, and your own profile, including where to lean in and where to get help.",
    helpsWith: 'meetings that run long or go nowhere, better 1:1s, preparing a performance conversation, restructuring a recurring meeting',
  },
  'fit': {
    summary: 'Enter any role title and get an alignment score, what will energize and drain, and collaboration recommendations for a MindPrint profile.',
    helpsWith: 'whether a role or promotion is a good fit, comparing roles',
  },
  'career': {
    summary: 'A career report with best-fit roles, energizers, challenges, and strategies for a profile, with a PDF export.',
    helpsWith: 'career direction, exploring career paths, planning a next move',
  },
  'jd': {
    summary: 'Paste a job description and see what will energize and drain you in that role and how to position yourself for it.',
    helpsWith: 'evaluating a job posting, preparing to apply or interview',
  },
  'precision': {
    summary: 'An AI companion that produces HOW work for you to review: breaking a goal into tasks, pre-flight checklists, gap reviews of a draft, edge cases, and definitions of done. Built for people whose tertiary is HOW.',
    helpsWith: 'detailed planning, checking a draft for gaps, edge cases, finishing work to a clear standard',
  },
  'purpose': {
    summary: 'An AI companion that produces WHY work for you to review: a guided purpose brief, a North Star one-pager, translating content into why it matters for a reader, and opening lines. Built for people whose tertiary is WHY.',
    helpsWith: 'framing why something matters, vision, writing an opening, explaining the point of a project',
  },
  'progress': {
    summary: 'An AI companion that produces WHAT work for you to review: good-enough shipping criteria, milestone backplans, weekly progress updates, and a closing card for meeting actions. Built for people whose tertiary is WHAT.',
    helpsWith: 'getting things shipped, deadlines, status updates, momentum, closing out a meeting with actions',
  },
  'translator': {
    summary: "Rewrite a message for a WHY, WHAT, or HOW reader, or for a specific person's profile, with notes on what changed and why. A beta Detect mode suggests a writer's likely orientation from writing samples (never for hiring decisions).",
    helpsWith: 'writing to someone with a different orientation, adapting a message for an audience, communication friction',
  },
  'library': {
    summary: 'The MindPrint Tertiary Support Library: 43 practical tools and templates organized by the orientation they support, plus Communication Field Guides.',
    helpsWith: 'browsing every resource',
  },
  'insights': {
    summary: "Curio's articles on talent, teams, and what it means to think differently.",
    helpsWith: "reading Curio's articles",
  },
};

const COLLECTION_LABELS = {
  A: 'supports a tertiary HOW',
  B: 'supports a tertiary WHAT',
  C: 'supports a tertiary WHY',
  D: 'universal, any profile',
  E: 'for teams',
};

// The user facts every access decision below needs.
export async function loadAssistantContext(session) {
  const { accountId, userId } = session;
  const [licenses, tokens, userRows, lib] = await Promise.all([
    dbGet('account_licenses', { account_id: accountId }),
    dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' }),
    dbGet('client_users', { id: userId }),
    getVisibleCollections(accountId, userId),
  ]);
  const now = new Date();
  const active = licenses.filter(l => !l.expires_at || new Date(l.expires_at) > now);
  const user = userRows[0] || {};
  return {
    accountId,
    userId,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    licenseTypes: new Set(active.map(l => l.type)),
    isTeamAccount: isTeamAccount(tokens, active),
    role: user.role,
    profile: lib.profile,
    hasProfile: !!lib.profile,
    visibleCollections: lib.visibleCollections,
    allFieldGuides: lib.hasFull || lib.hasTeamAccess,
  };
}

// Sanity articles, cached briefly so every question doesn't refetch them.
// Loaded lazily: the Sanity client throws at import time when its env vars
// are missing, and the assistant should still work without articles.
let articleCache = { at: 0, items: [] };
async function getArticles() {
  if (Date.now() - articleCache.at < 10 * 60 * 1000) return articleCache.items;
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return [];
  try {
    const [{ client }, { postsQuery }] = await Promise.all([
      import('../sanity/lib/client'),
      import('../sanity/lib/queries'),
    ]);
    const posts = await client.fetch(postsQuery);
    articleCache = {
      at: Date.now(),
      items: (posts || []).filter(p => p.slug?.current && p.title).map(p => ({
        slug: p.slug.current,
        title: p.title,
        excerpt: p.excerpt || '',
        category: p.categories?.[0]?.title || '',
      })),
    };
  } catch (e) {
    console.error('[assistant] could not load articles:', e.message);
    articleCache = { at: Date.now(), items: [] };
  }
  return articleCache.items;
}

// Each entry: { id, kind, name, url, summary, helpsWith, lock, grant }
//   lock:  null if the user can open it, else 'license' | 'team' | 'role' | 'profile'
//   grant: the license that would unlock it (for one-click approval), or null
export async function buildCatalog(ctx) {
  const entries = [];

  for (const item of NAV_ITEMS) {
    const d = TOOL_DESCRIPTIONS[item.key];
    if (!d) continue;
    const lock = navLockReason(item, ctx);
    entries.push({
      id: `tool:${item.key}`,
      kind: 'tool',
      name: item.label,
      url: item.href,
      summary: d.summary,
      helpsWith: d.helpsWith,
      lock,
      grant: lock === 'license' ? item.license : lock === 'team' ? 'team_account' : null,
    });
  }

  for (const [slug, g] of Object.entries(GUIDES)) {
    const open = ctx.visibleCollections.includes(g.collection);
    entries.push({
      id: `resource:${slug}`,
      kind: 'resource',
      name: g.title,
      url: `/portal/library/${slug}`,
      summary: `${g.tagline1 || ''} (Resources library, ${COLLECTION_LABELS[g.collection] || 'collection ' + g.collection})`.trim(),
      helpsWith: '',
      lock: open ? null : 'license',
      grant: open ? null : `library_${g.collection.toLowerCase()}`,
    });
  }

  for (const [slug, fg] of Object.entries(FIELD_GUIDES)) {
    const own = ctx.profile && ctx.profile === fg.profile;
    const open = own || ctx.allFieldGuides;
    entries.push({
      id: `field-guide:${slug}`,
      kind: 'field_guide',
      name: `${fg.profile} Communication Field Guide`,
      url: `/portal/library/field-guide/${slug}`,
      summary: `How a ${fg.profile} naturally writes, how that lands with WHY, WHAT, and HOW readers, and the adjustments that help.${own ? ' This is your own profile.' : ''}`,
      helpsWith: 'communicating with or as this profile',
      lock: open ? null : 'license',
      grant: null,
    });
  }

  for (const a of await getArticles()) {
    entries.push({
      id: `article:${a.slug}`,
      kind: 'article',
      name: a.title,
      url: `/portal/insights?article=${encodeURIComponent(a.slug)}`,
      summary: `${a.excerpt}${a.category ? ` (${a.category})` : ''}`.trim(),
      helpsWith: '',
      lock: null,
      grant: null,
    });
  }

  return entries;
}
