// Static content for the "AI & Delegation Guide" portal tab
// (pages/portal/tools/ai-delegation-guide.js) — which tertiary (draining)
// tasks to route to AI, delegate to a teammate, or collaborate on, per
// MindPrint(tm) profile. No AI generation, no per-call cost; this is a
// fixed lookup table rendered per profile.
//
// Named "AI & Delegation Guide" (not "Tertiary Support") to avoid colliding
// with the existing Resources tab, which is already branded end-to-end as
// the "MindPrint(tm) Tertiary Support Library" (see
// pages/portal/library/[slug].js and components/CompanionShell.js) — a
// different feature (a PDF library), not this one.
//
// Two `scaffold.slug` values below (tools 07 and 08) were corrected from
// the original auto-generated guess to match the real slugs already
// registered in lib/guideContent.js's TOOL_NUM_TO_SLUG / GUIDES (both carry
// a stray hyphen baked into the real slug: "de-finition", "e-ff-ort").
// Every other slug in this file was checked against that same source and
// already matched.
export const AI_DELEGATION_GUIDE = {
  meta: {
    title: 'The Tertiary Support and AI Utilization Guide',
    version: '1.0',
    categories: {
      AI: { label: 'Utilize AI' },
      DELEGATE: { label: 'Delegate' },
      COLLABORATE: { label: 'Collaborate' },
    },
    orientationColors: {
      WHY: '#6EE7B7',
      WHAT: '#93C5FD',
      HOW: '#FCD34D',
    },
  },
  universalSupports: [
    {
      tool: 'Tool 31',
      name: 'The Energy Budget Planner',
      desc: 'A weekly calendar audit that tags work by orientation and rebuilds the schedule around your energy.',
      slug: 'tool-31-the-energy-budget-planner',
    },
    {
      tool: 'Tool 32',
      name: 'The Tertiary Triage Decision Tree',
      desc: 'A repeatable decision path for any draining task: scaffold it, timebox it, trade it, or automate it.',
      slug: 'tool-32-the-tertiary-triage-decision-tree',
    },
    {
      tool: 'Tool 33',
      name: 'The Team Trade Board',
      desc: 'A team ritual for openly trading work out of tertiaries and into primaries.',
      slug: 'tool-33-the-team-trade-board',
    },
    {
      tool: 'Tool 34',
      name: 'The Drain Signals Field Guide',
      desc: 'A guide to recognizing depletion early, in yourself and in teammates.',
      slug: 'tool-34-the-drain-signals-field-guide',
    },
  ],
  profiles: [
    {
      code: 'WHY-WHAT',
      primary: 'WHY',
      secondary: 'WHAT',
      tertiary: 'HOW',
      tagline: 'Purpose-driven, progress-oriented',
      drainSummary: 'Granular execution and task management, following detailed processes, documentation and administrative work, and sustained attention to many small interdependent details.',
      partnerNote: 'The framework names a strong HOW presence as a non-negotiable partner — someone who can receive a vision and build the execution architecture underneath it.',
      tasks: [
        { task: 'Breaking a vision or roadmap into a detailed execution plan', route: 'AI', why: 'AI can decompose a high-level roadmap into candidate milestones and dependencies. A HOW-primary teammate should still validate it against sequencing gaps this profile won’t see.', scaffold: { number: '01', name: 'Vision-to-Task Decomposition', slug: 'tool-01-vision-to-task-decomposition' } },
        { task: 'Writing SOPs or process documentation', route: 'AI', why: 'Mechanical synthesis. AI produces a strong first draft from existing context.', scaffold: { number: '02', name: 'The Pre-Flight Checklist Library', slug: 'tool-02-the-pre-flight-checklist-library' } },
        { task: 'Building and maintaining a project timeline', route: 'AI', why: 'Structured, repeatable, low-judgment work that AI sustains better than a person who finds it draining.', scaffold: { number: '08', name: 'The Effort Reality-Check', slug: 'tool-08-the-e-ff-ort-reality-check' } },
        { task: 'Quality-checking a deliverable’s details before it ships', route: 'DELEGATE', why: 'Judgment about which details actually matter needs a HOW-primary teammate, not a checklist.', scaffold: { number: '03', name: 'The Last 10% Protocol', slug: 'tool-03-the-last-10-protocol' } },
        { task: 'Tracking dependencies across a multi-workstream initiative', route: 'DELEGATE', why: 'This is the profile’s named blind spot. It needs someone who lives in the connective tissue, not a summary.', scaffold: { number: '04', name: 'The Detail Debt Log', slug: 'tool-04-the-detail-debt-log' } },
        { task: 'Drafting the rationale narrative behind a plan that’s already built', route: 'AI', why: 'Synthesizing existing decisions into purpose language is a drafting task AI handles well.', scaffold: null },
        { task: 'Owning implementation after vision and direction are set', route: 'DELEGATE', why: 'The framework names a strong HOW presence as a non-negotiable partner for this exact handoff.', scaffold: { number: '10', name: 'The HOW-Partner Review Protocol', slug: 'tool-10-the-how-partner-review-protocol' } },
        { task: 'Administrative or compliance paperwork', route: 'AI', why: 'Mechanical and low-judgment. A light human review before submission is enough.', scaffold: { number: '09', name: 'The AI Precision Companion', slug: 'tool-09-the-ai-precision-companion' } },
        { task: 'Reviewing a handoff document for execution gaps before it reaches the team', route: 'COLLABORATE', why: 'The gaps are genuinely invisible to this profile. Needs a HOW-primary peer in the room, not a solo AI pass.', scaffold: { number: '06', name: 'The Edge-Case Question Bank', slug: 'tool-06-the-edge-case-question-bank' } },
        { task: 'Deciding which details are load-bearing versus safe to skip', route: 'COLLABORATE', why: 'A judgment call that depends on system-level knowledge a HOW-primary partner holds.', scaffold: { number: '07', name: 'Definition-of-Done Cards', slug: 'tool-07-de-finition-of-done-cards' } },
      ],
    },
    {
      code: 'WHY-HOW',
      primary: 'WHY',
      secondary: 'HOW',
      tertiary: 'WHAT',
      tagline: 'Purpose-driven, precision-oriented',
      drainSummary: 'Fast-paced iteration without analysis, rushing to launch before it feels right, pure action without sufficient grounding, and communicating to WHAT-primary audiences.',
      partnerNote: 'Needs a strong WHAT partner who creates urgency and forward momentum — who takes the deep thinking and forces it into action before the pursuit of completeness becomes its own obstacle.',
      tasks: [
        { task: 'Setting a hard ship date for a piece of work', route: 'DELEGATE', why: 'Creating real urgency needs a WHAT-primary partner. AI can suggest a date; it can’t create the pressure to hit one.', scaffold: { number: '13', name: 'The Decision Deadline Ritual', slug: 'tool-13-the-decision-deadline-ritual' } },
        { task: 'Declaring work good enough and moving to the next stage', route: 'COLLABORATE', why: 'This is the profile’s named blind spot. Needs a WHAT-primary partner in the room to call the moment.', scaffold: { number: '11', name: 'The Good-Enough Threshold', slug: 'tool-11-the-good-enough-threshold' } },
        { task: 'Compressing a deep analysis into a short summary for a WHAT-primary audience', route: 'AI', why: 'Translation and compression is a strong AI fit.', scaffold: { number: '18', name: 'The Progress Broadcast', slug: 'tool-18-the-progress-broadcast' } },
        { task: 'Running a fast, low-fidelity test to get quick signal', route: 'DELEGATE', why: 'Needs someone energized by speed and rough edges, which this profile is not.', scaffold: { number: '19', name: 'The 48-Hour Draft Rule', slug: 'tool-19-the-48-hour-draft-rule' } },
        { task: 'Structuring research findings into a simple milestone list', route: 'AI', why: 'Mechanical structuring AI handles well from existing material.', scaffold: { number: '15', name: 'Milestone Backplanning', slug: 'tool-15-milestone-backplanning' } },
        { task: 'Facilitating a high-energy kickoff or rallying session', route: 'DELEGATE', why: 'Live human energy in a room. Not something AI or a document can substitute for.', scaffold: { number: '20', name: 'The WHAT-Partner Cadence', slug: 'tool-20-the-what-partner-cadence' } },
        { task: 'Cutting scope to hit a deadline', route: 'COLLABORATE', why: 'Needs a WHAT-primary partner’s judgment on what’s essential versus what this profile would keep refining.', scaffold: { number: '16', name: 'The WIP Limit Practice', slug: 'tool-16-the-wip-limit-practice' } },
        { task: 'Drafting a plain-language one-page brief from a complex body of work', route: 'AI', why: 'A strong first draft from AI, with a human pass for nuance.', scaffold: null },
        { task: 'Chasing task completion and status follow-ups across a team', route: 'AI', why: 'Routine reminders and tracking are AI or tool-suited work.', scaffold: { number: '17', name: 'The Momentum Board', slug: 'tool-17-the-momentum-board' } },
        { task: 'Setting interim “good enough” checkpoints inside a long project', route: 'COLLABORATE', why: 'A WHAT-primary partner helps define what complete enough looks like along the way.', scaffold: { number: '14', name: 'The Version 0.5 Reframe', slug: 'tool-14-the-version-0-5-reframe' } },
      ],
    },
    {
      code: 'WHAT-WHY',
      primary: 'WHAT',
      secondary: 'WHY',
      tertiary: 'HOW',
      tagline: 'Progress-driven, purpose-oriented',
      drainSummary: 'Detailed process design and documentation, administrative and compliance work, deep analytical research, managing granular task execution, and precision-oriented work for extended periods.',
      partnerNote: 'Needs a HOW partner to build execution infrastructure — who takes the momentum and creates the process scaffolding that makes it sustainable.',
      tasks: [
        { task: 'Building the detailed process or SOP behind a fast-moving initiative', route: 'DELEGATE', why: 'The framework names a HOW partner as needed to build sustainable execution infrastructure.', scaffold: { number: '02', name: 'The Pre-Flight Checklist Library', slug: 'tool-02-the-pre-flight-checklist-library' } },
        { task: 'Deep analytical research to validate a direction before committing', route: 'DELEGATE', why: 'A different energy profile entirely. Hand to a HOW-primary analyst.', scaffold: { number: '06', name: 'The Edge-Case Question Bank', slug: 'tool-06-the-edge-case-question-bank' } },
        { task: 'Drafting a first-pass task breakdown from a set of milestones', route: 'AI', why: 'Mechanical decomposition AI handles well.', scaffold: { number: '01', name: 'Vision-to-Task Decomposition', slug: 'tool-01-vision-to-task-decomposition' } },
        { task: 'Compliance or administrative documentation', route: 'AI', why: 'Low-judgment drafting work.', scaffold: { number: '09', name: 'The AI Precision Companion', slug: 'tool-09-the-ai-precision-companion' } },
        { task: 'Maintaining a detailed status tracker over a long project', route: 'AI', why: 'Repetitive and structured, well suited to a tool or AI.', scaffold: { number: '05', name: 'Timeboxed Detail Sprints', slug: 'tool-05-timeboxed-detail-sprints' } },
        { task: 'Root-cause analysis when something breaks mid-execution', route: 'DELEGATE', why: 'Needs HOW-primary depth, not a fast read.', scaffold: null },
        { task: 'Mapping dependencies into a structured project plan', route: 'AI', why: 'AI drafts the plan; a HOW-primary partner should validate the dependencies are real.', scaffold: { number: '04', name: 'The Detail Debt Log', slug: 'tool-04-the-detail-debt-log' } },
        { task: 'Precision editing or proofreading of external-facing materials', route: 'AI', why: 'Mechanical and well suited to AI.', scaffold: { number: '03', name: 'The Last 10% Protocol', slug: 'tool-03-the-last-10-protocol' } },
        { task: 'Building a dashboard to track granular metrics', route: 'AI', why: 'Structured, repeatable build work.', scaffold: null },
        { task: 'Slowing down to fully map a system before acting on it', route: 'COLLABORATE', why: 'The profile’s named blind spot. Needs a HOW-primary partner to hold the ‘do we understand this’ question in real time.', scaffold: { number: '10', name: 'The HOW-Partner Review Protocol', slug: 'tool-10-the-how-partner-review-protocol' } },
      ],
    },
    {
      code: 'WHAT-HOW',
      primary: 'WHAT',
      secondary: 'HOW',
      tertiary: 'WHY',
      tagline: 'Progress-driven, precision-oriented',
      drainSummary: 'Open-ended visioning without clear milestones, work lacking defined next steps, pure strategy without an implementation path, and extended ambiguity about direction or goals.',
      partnerNote: 'This is the most important and often most difficult relationship for this profile to cultivate — the WHY partner’s instinct to question is precisely what this profile finds most frustrating, and precisely what it needs.',
      tasks: [
        { task: 'Articulating the long-term vision or purpose behind an initiative', route: 'DELEGATE', why: 'Needs a WHY-primary partner. Not something to substitute with AI-generated language and present as genuine conviction.', scaffold: { number: '23', name: 'The Problem Reframe Deck', slug: 'tool-23-the-problem-reframe-deck' } },
        { task: 'Drafting a rationale narrative once direction is already set', route: 'AI', why: 'Low-stakes synthesis, since the direction itself isn’t in question.', scaffold: { number: '22', name: 'The North Star One-Pager', slug: 'tool-22-the-north-star-one-pager' } },
        { task: 'Deciding whether to pursue a pivot with no clear next steps yet', route: 'COLLABORATE', why: 'Extended ambiguity is explicitly draining here. Needs a WHY-primary partner to sit in it productively.', scaffold: { number: '30', name: 'The Pre-Mortem Protocol', slug: 'tool-30-the-pre-mortem-protocol' } },
        { task: 'Open-ended visioning sessions with no defined milestones', route: 'DELEGATE', why: 'Hand facilitation to a WHY-primary teammate who is energized by this kind of work.', scaffold: { number: '21', name: 'The Five-Question Purpose Brief', slug: 'tool-21-the-five-question-purpose-brief' } },
        { task: 'Writing the opening rationale section of a strategy document', route: 'AI', why: 'A straightforward drafting task.', scaffold: { number: '29', name: 'The Opening Line Habit', slug: 'tool-29-the-opening-line-habit' } },
        { task: 'Reconsidering direction mid-execution when new information surfaces', route: 'COLLABORATE', why: 'Named as the hardest relationship to cultivate in the framework. Needs a WHY-primary partner, framed around outcomes.', scaffold: { number: '26', name: 'The Quarterly Altitude Check', slug: 'tool-26-the-quarterly-altitude-check' } },
        { task: 'Interpreting research findings that haven’t been scoped into milestones yet', route: 'COLLABORATE', why: 'AI can gather the material; a WHY-primary partner is needed to interpret what it means before there’s a plan to build.', scaffold: { number: '27', name: 'The Assumption Audit', slug: 'tool-27-the-assumption-audit' } },
        { task: 'Translating a vague executive mandate into a concrete plan', route: 'COLLABORATE', why: 'Needs a WHY-primary partner to hold the ambiguity while this profile builds the milestones underneath it.', scaffold: { number: '25', name: 'The Vision Extraction Interview', slug: 'tool-25-the-vision-extraction-interview' } },
        { task: 'Drafting a values or culture statement for the team', route: 'DELEGATE', why: 'Genuine purpose work. Hand to a WHY-primary teammate.', scaffold: { number: '28', name: 'The Narrative Arc Template', slug: 'tool-28-the-narrative-arc-template' } },
        { task: 'Sitting in a strategic offsite focused on direction, with no action items', route: 'DELEGATE', why: 'Hand primary engagement to a WHY-primary teammate. Loop this profile in once milestones start to emerge.', scaffold: { number: '26', name: 'The Quarterly Altitude Check', slug: 'tool-26-the-quarterly-altitude-check' } },
      ],
    },
    {
      code: 'HOW-WHY',
      primary: 'HOW',
      secondary: 'WHY',
      tertiary: 'WHAT',
      tagline: 'Precision-driven, purpose-oriented',
      drainSummary: 'Launching before full analysis is complete, high-velocity action-oriented environments, communicating findings to non-technical audiences, and prioritizing when everything feels equally important.',
      partnerNote: 'Needs a strong WHAT partner who can take the deep work and build a delivery structure around it — who creates the urgency to ship and manages the organizational momentum this profile finds draining.',
      tasks: [
        { task: 'Deciding when analysis is done enough to ship', route: 'COLLABORATE', why: 'The profile’s named blind spot. Needs a WHAT-primary partner to create urgency and call the moment.', scaffold: { number: '11', name: 'The Good-Enough Threshold', slug: 'tool-11-the-good-enough-threshold' } },
        { task: 'Building a delivery timeline and forcing deployment milestones', route: 'DELEGATE', why: 'The framework names this as a non-negotiable WHAT-primary partner role.', scaffold: { number: '15', name: 'Milestone Backplanning', slug: 'tool-15-milestone-backplanning' } },
        { task: 'Translating dense technical findings into a short, accessible summary', route: 'AI', why: 'A strong AI fit for compression. A human should confirm nothing essential was lost.', scaffold: { number: '18', name: 'The Progress Broadcast', slug: 'tool-18-the-progress-broadcast' } },
        { task: 'Prioritizing a long list of competing findings or fixes', route: 'COLLABORATE', why: 'Needs a WHAT-primary partner’s gut sense of what matters most right now.', scaffold: { number: '16', name: 'The WIP Limit Practice', slug: 'tool-16-the-wip-limit-practice' } },
        { task: 'Running project management and maintaining a timeline day to day', route: 'DELEGATE', why: 'Explicitly named as draining. Hand to a WHAT-primary partner or a tool.', scaffold: { number: '20', name: 'The WHAT-Partner Cadence', slug: 'tool-20-the-what-partner-cadence' } },
        { task: 'Writing status updates and coordination summaries', route: 'AI', why: 'Mechanical summary work AI drafts well.', scaffold: { number: '17', name: 'The Momentum Board', slug: 'tool-17-the-momentum-board' } },
        { task: 'Rallying a team to adopt a new process or finding', route: 'DELEGATE', why: 'Live energy and momentum, not AI’s strength.', scaffold: { number: '12', name: 'The Closing Card', slug: 'tool-12-the-closing-card' } },
        { task: 'First-pass synthesis of raw data into a structured report', route: 'AI', why: 'A strong AI fit; a human should review for accuracy and depth.', scaffold: { number: '19', name: 'The 48-Hour Draft Rule', slug: 'tool-19-the-48-hour-draft-rule' } },
        { task: 'Deciding to launch an imperfect but workable version', route: 'COLLABORATE', why: 'Needs a WHAT-primary partner to counterbalance the pull toward further refinement.', scaffold: { number: '14', name: 'The Version 0.5 Reframe', slug: 'tool-14-the-version-0-5-reframe' } },
        { task: 'Keeping a fast-moving team’s action items visible day to day', route: 'AI', why: 'Structured, low-judgment tracking work.', scaffold: { number: '17', name: 'The Momentum Board', slug: 'tool-17-the-momentum-board' } },
      ],
    },
    {
      code: 'HOW-WHAT',
      primary: 'HOW',
      secondary: 'WHAT',
      tertiary: 'WHY',
      tagline: 'Precision-driven, progress-oriented',
      drainSummary: 'Ambiguous open-ended creative work, vision-setting without clear parameters, work requiring frequent pivots without structure, and communicating “why” to stakeholders.',
      partnerNote: 'Needs a WHY partner to keep the destination honest and connect operational excellence to outcomes that actually matter, alongside a WHAT partner to ensure systems get deployed rather than refined indefinitely.',
      tasks: [
        { task: 'Communicating the purpose behind an operational change to stakeholders', route: 'DELEGATE', why: 'Named as genuinely draining, not just uncomfortable. Needs a WHY-primary partner to carry the narrative.', scaffold: { number: '24', name: 'The So-What Translator', slug: 'tool-24-the-so-what-translator' } },
        { task: 'Open-ended creative ideation with no defined parameters', route: 'DELEGATE', why: 'Hand facilitation to a partner who is energized by ambiguity.', scaffold: { number: '21', name: 'The Five-Question Purpose Brief', slug: 'tool-21-the-five-question-purpose-brief' } },
        { task: 'Drafting the operational rationale for a system once it is built', route: 'AI', why: 'A mechanical synthesis task.', scaffold: { number: '22', name: 'The North Star One-Pager', slug: 'tool-22-the-north-star-one-pager' } },
        { task: 'Deciding whether a strategic reframe should override a functioning system', route: 'COLLABORATE', why: 'The profile’s central friction point. Needs a WHY-primary partner in the room, framed concretely around what’s broken.', scaffold: { number: '23', name: 'The Problem Reframe Deck', slug: 'tool-23-the-problem-reframe-deck' } },
        { task: 'Pitching a new initiative’s vision to leadership', route: 'DELEGATE', why: 'Narrative and pitching work sits outside this profile’s energy. Hand to a WHY-primary partner.', scaffold: { number: '28', name: 'The Narrative Arc Template', slug: 'tool-28-the-narrative-arc-template' } },
        { task: 'Adapting to frequent, unstructured pivots in direction', route: 'COLLABORATE', why: 'Needs a partner to translate the pivot into concrete operational terms this profile can act on.', scaffold: { number: '27', name: 'The Assumption Audit', slug: 'tool-27-the-assumption-audit' } },
        { task: 'Drafting a first-pass mission or vision statement for a new initiative', route: 'AI', why: 'AI can draft the language; a WHY-primary partner should confirm it reflects genuine purpose before it’s used.', scaffold: { number: '25', name: 'The Vision Extraction Interview', slug: 'tool-25-the-vision-extraction-interview' } },
        { task: 'Facilitating a values-alignment conversation across teams', route: 'DELEGATE', why: 'Relational, purpose-driven work outside this profile’s energy.', scaffold: { number: '26', name: 'The Quarterly Altitude Check', slug: 'tool-26-the-quarterly-altitude-check' } },
        { task: 'Connecting an operational improvement to organizational purpose in a business case', route: 'AI', why: 'AI can draft the connective narrative; a light human review is worth it before it goes out.', scaffold: { number: '24', name: 'The So-What Translator', slug: 'tool-24-the-so-what-translator' } },
        { task: 'Sitting in extended strategic ambiguity before a decision is operationalized', route: 'COLLABORATE', why: 'Needs a WHY-primary partner to hold the ‘why’ conversation productively while this profile waits for structure to emerge.', scaffold: { number: '30', name: 'The Pre-Mortem Protocol', slug: 'tool-30-the-pre-mortem-protocol' } },
      ],
    },
  ],
};

// TODO: Collection E team tools — future team-tier feature. Deliberately
// out of scope for this phase; it needs a team context this page doesn't
// have yet (see the manager-role scoping work in lib/ownProfile.js and
// pages/api/portal/dashboard.js for what that would build on).
