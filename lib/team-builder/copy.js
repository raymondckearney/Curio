// Team Builder UI copy. Ported verbatim from the approved prototype
// (docs/prototypes/team-builder-prototype.html) except where noted:
//   - Energy labels are plain words (the prototype's "— Neutral" used an em dash).
//   - The unused-person gap no longer suggests the person may not be
//     needed: Source of Truth Section 10 says no tool selects individuals.
//   - "Pace versus depth" (WHY + HOW) is new, written from Source of Truth
//     Section 5, as the owner asked for the eighth pattern.
// Names passed to the template functions are already display names.

export const ENERGY_LABEL = { E: 'Energizing', N: 'Neutral', D: 'Draining' };

export const GOTO = {
  WHY: "framing, the reason behind a decision, and whether the work still answers the client's real question",
  WHAT: 'next steps, deadlines, and getting a stuck decision unblocked',
  HOW: 'detail, accuracy, edge cases, and how the pieces fit together',
};

export const REVIEWFOR = {
  WHY: "whether it answers the right question and ties to the client's goal",
  WHAT: 'whether it is ready to ship and what the next step is',
  HOW: 'gaps, accuracy and edge cases',
};

export const LOADING_MESSAGES = ['Reading the document…', 'Finding the activities…', 'Matching to the MindPrint™ activity list…', 'Almost there…'];

export const GUARDRAIL = 'Team Builder allocates work among people already chosen for a project. It offers insight for a human staffing decision and is never a ranking or selection of individuals. Skills in every activity can be learned. The model describes energy, never ability.';

export const DEFINITIONS = [
  ['Owner', 'Accountable for the activity and does the largest share of the hands-on work, usually half or more. Owner is not a management title. The team has one engagement lead, shown under team structure.'],
  ['Contributor', 'Delivers a defined piece of the activity, agreed with the owner at the start. In a pair the contributor carries about a third of the work. In a small team, two contributors split half.'],
  ['Reviewer', "Checks the work at the draft stage, bringing the orientation the owner finds draining. About a tenth of the effort. A reviewer is added when the activity calls on the owner's tertiary orientation, or when it produces a client deliverable such as a roadmap or readout."],
];

export const STEP2_EXPLAINERS = [
  ['Share of effort', "The percentage of the project's total hours each activity takes. It comes from the document where hours are stated and is estimated otherwise. The hours column shows what each share means in practice."],
  ['Matching', 'Each activity is matched to the closest entry on the MindPrint™ activity list, which sets its demand tag. Anything with no close match is marked Unlisted and keeps the tag set here. Unlisted activities are logged so the list can grow.'],
  ['Delivery', 'How many people the activity needs. Solo is one owner. Pair adds one contributor. Small team adds two. Whole team involves everyone, with one owner running it.'],
];

export function headcountWhy(hc) {
  return hc.basis === 'hours'
    ? `${Math.round(hc.hours).toLocaleString()} hours over ${hc.weeks} weeks, assuming 40-hour weeks with people allocated between 75% and 100%.`
    : 'No hours were found in the document, so the range is estimated from the number of activities. Add hours and weeks for a firmer range.';
}

export const list = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
export const pct = x => Math.round(x * 100) + '%';
export const H = h => Math.round(h).toLocaleString() + ' h';
export const weeksLabel = p => (p.ongoing ? 'across all phases' : p.start === p.end ? 'week ' + p.start : 'weeks ' + p.start + ' to ' + p.end);

// Friction patterns: title, what it looks like, and templated steps (the
// fallback when the AI's tactical steps are unavailable).
export const FRICTION_COPY = {
  handoff: {
    title: 'Handoff gaps',
    what: 'Direction gets handed off with confidence, and the gaps in it surface later, when the person executing hits them.',
    steps: (a, b, act) => [`When ${a} hands off ${act}, spend ten minutes with ${b} on a Handoff Contract: what is decided, what is still open, and who closes each open item by when.`, `Have ${b} review ${a}'s drafts before they reach the client, so execution gaps surface while they are cheap to fix.`, `Write a definition of done with ${b} for each deliverable ${a} owns, before the work starts.`],
  },
  tissue: {
    title: 'Connective tissue',
    what: 'Work moves milestone to milestone, and the detail work between milestones lands on the HOW-primary without being planned.',
    steps: (a, b) => [`Write a definition of done with ${b} for each milestone ${a} owns, before work starts.`, `Keep a shared Detail Debt Log of the detail work each milestone creates, and assign it in the weekly check-in rather than leaving ${b} to absorb it.`, 'Book that detail work into fixed blocks instead of the last days of the phase.'],
  },
  trust: {
    title: 'Direction trust',
    what: 'Once execution is moving, questions about direction read as obstruction, so they get raised late or not at all.',
    steps: (a, b, act) => [`Put a direction check on the calendar at the end of each phase, run by ${b}, so direction questions have a set place instead of landing mid-sprint.`, `${b} raises a concern as a specific risk to the client's stated goal, not as a general reopening of the direction.`, `Before ${a} commits effort to ${act}, spend ten minutes with the Problem Reframe Deck.`],
  },
  system: {
    title: 'System disruption',
    what: 'A change of direction can undo structure that is already working, so it meets resistance unless the case for it is specific.',
    steps: (a, b, act) => [`When ${b} wants to change direction, show ${a} the specific evidence of what is not working before proposing the change.`, 'Agree at kickoff which parts of the plan are fixed and which stay open, and who decides each.', `Bring ${a} into ${act} at the start, not after the direction is set.`],
  },
  deploy: {
    title: 'Deployment pressure',
    what: 'Refinement continues past the point where the work could ship, while the WHAT-primary pushes to deliver.',
    steps: (a, b, act) => [`At kickoff, set a decision date for ${act} and each other deliverable ${a} owns, and write down what complete enough means for each.`, `${b} owns the delivery date and ${a} owns the quality bar. Agree both in writing with the person receiving the work.`, `Share a working draft of ${act} at its halfway point, not at the end.`],
  },
  timing: {
    title: 'Timing',
    what: 'Purpose questions arrive at the moment the team is ready to execute.',
    steps: a => ['Run the kickoff so the why, the what and the how each have a written answer before work starts.', `Give ${a} a standing slot at the start of the weekly check-in for direction questions, so they land there and not at decision points.`, 'Record each decision with its reason. Reopening a decision needs new information, not a new question.'],
  },
  action: {
    title: 'Action versus completeness',
    what: 'One side wants to move, the other wants to understand first, and each reads the other as the obstacle.',
    steps: (a, b, act) => [`For ${act}, agree what ready to move means before the work starts.`, `Protect ${b}'s depth work in fixed blocks so ${a} can see when it will end.`],
  },
  pace: {
    title: 'Pace versus depth',
    what: 'Both want to slow down before committing, for different reasons: one to settle the purpose, the other to understand the mechanism. They agree to pause, then disagree about what the pause is for.',
    steps: (a, b, act) => [`Before ${act} starts, write down which question each pause is for, the purpose that ${a} settles or the mechanism that ${b} settles, and give each its own time box.`, `Review in order: ${a} checks that ${act} answers the right question, then ${b} checks that it works.`],
  },
};

// Plain-language gap text. g is an engine gap; nameOf(key) gives display names.
export function gapText(g, nameOf, actName, tagsFor) {
  switch (g.type) {
    case 'orientation_uncovered':
      return { lead: `No one on the team has ${g.orientation} as their primary orientation,`, body: `yet ${pct(g.share)} of this work demands it. Add a ${tagsFor(g.orientation).join(' or ')}, or expect the ${g.orientation}-heavy work to drain whoever owns it.` };
    case 'no_natural_owner':
      return { lead: `${actName(g.act)} has no natural owner.`, body: `${nameOf(g.person)} owns it, and the work sits in their tertiary orientation, so it will cost them energy. Add someone with ${g.orientation} as their primary, or keep it small and time-boxed with a reviewer.`, tools: g.mitigation.tools };
    case 'over_capacity':
      return { lead: `${nameOf(g.person)} is over capacity.`, body: `The plan gives them about ${H(g.load)}, ${pct(g.load / g.cap)} of their available time. Move a contributor role to someone with room, or raise their availability.` };
    case 'unused_person':
      return { lead: `${nameOf(g.person)} has no work on this plan.`, body: 'Give them a contributor or reviewer role on work that energizes them, or lower their availability for this project.' };
    default:
      return { lead: '', body: '' };
  }
}

// Templated expectation for one assignment (fallback for the AI sentence).
export function expectationText(role, { owner, contribs, reviewerPrimary }) {
  if (role === 'Owner') return `Own the plan and the output. Set the approach, do most of the work${contribs.length ? ', agree with ' + list(contribs) + ' which piece each delivers,' : ''} and bring the result to review.`;
  if (role === 'Contributor') return `Deliver the piece agreed with ${owner}, the owner, and flag anything blocking it early.`;
  return `Review ${owner}'s draft for ${REVIEWFOR[reviewerPrimary]}. Review at the draft stage, not the final one.`;
}

// Profile colors for the pie (prototype PCOL).
export const PROFILE_COLOR = { 'WHY-WHAT': '#6EE7B7', 'WHY-HOW': '#34D399', 'WHAT-WHY': '#93C5FD', 'WHAT-HOW': '#60A5FA', 'HOW-WHY': '#FCD34D', 'HOW-WHAT': '#F59E0B' };
