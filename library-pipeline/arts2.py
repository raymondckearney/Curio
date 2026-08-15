# Primary kit artifact per tool (23-43)
ARTS_2 = [

dict(num=23, type="cards", title="Problem Reframe Deck",
sub="Draw five cards before committing serious effort. Answer in writing, one or two lines each. The card you want to skip is the one holding a finding.",
cards=[
 dict(title="The owner", body="Whose problem is this really, and would they describe it this way?"),
 dict(title="The dissolve", body="What would make this problem irrelevant instead of solved?"),
 dict(title="The layer beneath", body="What is the problem behind the problem?"),
 dict(title="The forbidden fix", body="If the obvious fix were forbidden, what would we do instead?"),
 dict(title="The competence trap", body="Are we solving this because it matters, or because we know how?"),
 dict(title="The skeptic", body="What would a skeptic say we are actually optimizing for?"),
 dict(title="The restatement", body="After the cards: the problem, restated or confirmed, in one sentence. Now execute, aimed."),
]),

dict(num=24, type="worksheet", title="So-What Translator",
sub="Name the specific reader first. Force the completion for every section, no exceptions. Lead with meaning, keep the detail as the appendix.",
sections=[
 dict(label="The reader", prompt="A title and a current worry. \"Which means that\" has no answer without a who.", lines=2),
 dict(label="Section → which means that...", prompt="Every major finding or component, each completed honestly in one line for this reader.", lines=8),
 dict(label="The winner", prompt="Which completion changes a decision the reader actually faces? It becomes the opening line.", lines=2),
 dict(label="The orphans", prompt="Sections with no honest completion. Candidates for the appendix, or the cut.", lines=3),
]),

dict(num=25, type="worksheet", title="Vision Extraction Interview Guide",
sub="Book it before planning. Ask, then be quiet, the pauses hold the real answers. Read back what you heard, then convert straight to the North Star page.",
sections=[
 dict(label="What does done look like, a year out?", prompt="Push past deliverables to the changed situation.", lines=3),
 dict(label="What made this urgent now?", prompt="The trigger reveals the real priority ordering.", lines=3),
 dict(label="Delivered exactly as specified, what could still make you call it a failure?", prompt="This question surfaces the unstated intent. Do not rush it.", lines=3),
 dict(label="Who else has to believe in this?", prompt="The map of people the vision must survive contact with.", lines=3),
 dict(label="What are you explicitly not asking for?", prompt="Their exclusions, in their words, on the record.", lines=3),
 dict(label="Read-back notes", prompt="\"Here is what I heard\", in their words. Corrections captured now are nearly free.", lines=3),
]),

dict(num=26, type="worksheet", title="Quarterly Altitude Check",
sub="Ninety minutes, four questions, on the calendar four times a year. Answer in writing and keep the answers, drift shows up in the quarter-over-quarter comparison.",
sections=[
 dict(label="Is the work still connected to the goal?", prompt="Trace it explicitly. \"It was in January\" is not an answer.", lines=4),
 dict(label="What changed in the context?", prompt="Market, org, priorities, people. Ten minutes of honest listing.", lines=4),
 dict(label="Which assumptions expired?", prompt="The plan encoded beliefs. Which are no longer true?", lines=4),
 dict(label="What would we not start today?", prompt="The hardest question, and the one that pays for the ritual.", lines=4),
 dict(label="At most three changes", prompt="The check is a rudder, not a rebuild. Small corrections, quarterly, compound.", lines=3),
]),

dict(num=27, type="worksheet", title="Assumption Audit",
sub="Run against the finished plan, a day after planning. Write every belief, however obvious, \"obviously\" is the costume assumptions wear.",
sections=[
 dict(label="What must be true for this plan to work?", prompt="List everything, obvious included.", lines=6),
 dict(label="Which beliefs are inherited, not tested?", prompt="From a predecessor, a template, a habit.", lines=3),
 dict(label="Confidence × consequence", prompt="Rate each belief. High-consequence, low-confidence items are the audit's product.", lines=4),
 dict(label="Test or accept, in writing", prompt="Cheapest test for the risky ones, explicit acceptance for the rest. Silent assumptions are the only forbidden kind.", lines=4),
]),

dict(num=28, type="worksheet", title="Narrative Arc Planner",
sub="Write the Shift beat first, every other beat serves it. Ration the Situation. Pour existing content into the beats, most of the work is reordering and cutting.",
sections=[
 dict(label="Shift (write this first)", prompt="The one thing this deliverable exists to say, in one sentence.", lines=2),
 dict(label="Situation", prompt="Where things stand, in terms the audience already accepts. One beat, not five, the rest goes to the appendix.", lines=3),
 dict(label="Stakes", prompt="Why standing still costs something. This beat earns the audience's attention.", lines=3),
 dict(label="So-what", prompt="What the Shift means for the people in the room. Borrow from the Translator.", lines=3),
 dict(label="Ask", prompt="The specific decision or action requested. Stories without asks are entertainment.", lines=2),
 dict(label="Section-to-beat map", prompt="Which existing content pours into which beat, and what gets cut.", lines=4),
]),

dict(num=29, type="cards", title="Opening Line Cards",
sub="Pick two forms and drill them for two weeks, on everything, including trivial messages. Write the line last, place it first.",
cards=[
 dict(title="The direct form", body="\"This matters because...\" Works almost everywhere. The default."),
 dict(title="The executive form", body="\"The decision this enables is...\" Strongest for senior readers, who are deciding whether to keep reading."),
 dict(title="The document form", body="\"By the end of this you'll know...\" Best for documents and presentations."),
 dict(title="The request form", body="\"We're doing this so that...\" Best for instructions and asks, it carries the reason with the work."),
 dict(title="The FYI form", body="\"Nothing needed from you; this is so that...\" Prevents mis-escalation and needless replies."),
 dict(title="The fifteen-second rule", body="After the content exists, the purpose line takes fifteen seconds. Written before, it takes real energy. Write it last, place it first."),
]),

dict(num=30, type="worksheet", title="Pre-Mortem Session Sheet",
sub="Run after planning, before commitment. Enforce the silent writing round, spoken-first sessions converge on the safe answers.",
sections=[
 dict(label="The declaration", prompt="\"It is twelve months out. This failed completely.\" Said as fact, not hypothesis.", lines=1),
 dict(label="Silent round · reasons it failed", prompt="Ten minutes, everyone writes independently. Specifics stay specific, \"the integration fails in week three\" is a strategic finding.", lines=7),
 dict(label="Clusters", prompt="Group the reasons. The clusters are the risk map.", lines=4),
 dict(label="Top three, ranked", prompt="Likelihood times damage.", lines=3),
 dict(label="Counters", prompt="One named owner and one concrete counter per top risk, added to the plan before commitment.", lines=3),
]),

dict(num=31, type="worksheet", title="Weekly Energy Budget",
sub="Audit last week before planning next, tags on real history are honest. Watch the tertiary trend line across weeks.",
sections=[
 dict(label="Tag and mark", prompt="Every significant block from last week: WHY, WHAT, or HOW work, and against your profile, primary, secondary, or tertiary.", lines=7),
 dict(label="The tally", prompt="Hours per level. The tertiary number is usually a surprise.", lines=2),
 dict(label="Placement for next week", prompt="Tertiary blocks moved to peak-energy windows, defended like client meetings, capped in volume.", lines=4),
 dict(label="Recovery", prompt="Primary-orientation work scheduled immediately after every tertiary block.", lines=3),
 dict(label="Trend note", prompt="One heavy week is life. A rising trend is a role drifting from your wiring, take it to the Triage Tree.", lines=2),
]),

dict(num=32, type="worksheet", title="Tertiary Triage Sheet",
sub="List recurring drains, ask the two questions of each, attach a named tool to every item. Re-triage quarterly.",
sections=[
 dict(label="Recurring drains", prompt="From the Energy Budget tally. Recurring is the keyword, one-offs just get done.", lines=6),
 dict(label="The two questions", prompt="Per item: Is it structurable? Is it someone else's primary?", lines=3),
 dict(label="Scaffold it", prompt="Recurring and structurable: which template or checklist, built once, runs it forever?", lines=3),
 dict(label="Timebox it", prompt="Small, unavoidable, unstructurable: which scheduled peak-energy dose contains it?", lines=2),
 dict(label="Trade it", prompt="Draining for you, energizing for whom? Post it to the Trade Board.", lines=2),
 dict(label="Automate it", prompt="Repeatable and rule-based: which software or AI prompt takes it entirely?", lines=2),
]),

dict(num=33, type="worksheet", title="Trade Board Post & Contract",
sub="Post the drain and the offer honestly. Match by profile, contract the swap in writing, review monthly. Leaders post first.",
sections=[
 dict(label="The drain I'm posting", prompt="One recurring task, honestly named, with its real weekly cost.", lines=3),
 dict(label="What I'd take in exchange", prompt="What you would happily absorb, from your primary.", lines=3),
 dict(label="The match", prompt="Who is wired for this? The team map predicts the pairing.", lines=2),
 dict(label="The contract", prompt="Scope, standards, duration, roughly equivalent load both ways. Accountability stays with the original owner unless the role formally changes.", lines=5),
 dict(label="Monthly review", prompt="Balanced? Working? Continue, adjust, or unwind, out loud. Next review date:", lines=2),
]),

dict(num=34, type="checklist", title="Drain Signals Self-Check",
sub="Learn your own signature first, then read teammates against their profiles. Name findings as structure, never as character.",
groups=[
 dict(label="Avoidance with a pattern", items=["One category of task perpetually re-prioritized while everything else moves"]),
 dict(label="Quality inversion", items=["Errors appearing specifically in detail, follow-through, or framing, whichever matches the tertiary"]),
 dict(label="Meeting-type irritability", items=["Fine in some rooms, visibly depleted in others, the room type names the drain"]),
 dict(label="Disproportionate recovery", items=["A small tertiary task costing an afternoon of flatness afterward"]),
 dict(label="Language shifts", items=["\"I just need to push through\", said about the same work, repeatedly"]),
 dict(label="Route the finding", items=["Placement problem → Energy Budget Planner","Volume problem → Triage Decision Tree","Trade candidate → Team Trade Board"]),
]),

dict(num=35, type="worksheet", title="Orientation-Balanced Agenda",
sub="Publish the blocks in the invite. Hold the frame to five minutes, protect the precision pass fiercely, close with the card.",
sections=[
 dict(label="Purpose frame · 5 min", prompt="Why this meeting, what decision it serves. Opener:", lines=2),
 dict(label="Decisions and actions · core", prompt="Options, calls, owners. The items:", lines=6),
 dict(label="Precision pass · 10 min, protected", prompt="Edge cases, dependencies, what breaks. Invited, not interrupting. Opener:", lines=3),
 dict(label="The close · Closing Card", prompt="One action, one owner, one date, one line of context, written in the room.", lines=3),
 dict(label="Block openers by orientation", prompt="Who opens each block, ideally by primary. Keeper roles if assigned:", lines=2),
]),

dict(num=36, type="worksheet", title="Three-Question Kickoff Page",
sub="Ask in order, why first. A missing answer is the project's first risk, found before it cost anything. Assign each answer a keeper.",
sections=[
 dict(label="Why does this matter, and to whom?", prompt="The purpose in two sentences, from the sponsor's mouth if possible.", lines=3),
 dict(label="What does progress look like in two weeks?", prompt="The first visible milestone and who is watching for it.", lines=3),
 dict(label="How will the work actually get done?", prompt="The mechanism: people, sequence, dependencies, the first three tasks.", lines=5),
 dict(label="Findings", prompt="Any question that could not be answered, escalated in writing, today.", lines=2),
 dict(label="Keepers", prompt="One name per question, owning when its answer stops being true.", lines=3),
]),

dict(num=37, type="worksheet", title="Team MindPrint™ Map",
sub="Build from real assessments, reveal it facilitated, refresh on every team change. Energy composition, not competence.",
sections=[
 dict(label="The roster", prompt="Each member: name, profile, and the orientation their current role mostly demands.", lines=7),
 dict(label="Coverage", prompt="Primary energy per orientation. WHY: / WHAT: / HOW:", lines=3),
 dict(label="The gap", prompt="The orientation with little or no primary coverage, and what predictably goes missing because of it.", lines=3),
 dict(label="Misload", prompt="Who is structurally working from their tertiary, role demand versus wiring.", lines=3),
 dict(label="The hiring arrow", prompt="What the next hire's profile should add, decided before the resume pile decides instead.", lines=2),
]),

dict(num=38, type="worksheet", title="Friction Forecast Worksheet",
sub="Map live frictions to the signatures, rename them out loud, install the design fix. Structure resolves what conversation keeps re-fighting.",
sections=[
 dict(label="The friction we're seeing", prompt="Described plainly: who, where in the workflow, what it looks like.", lines=4),
 dict(label="The signature it matches", prompt="Vision handoff stall / pace versus depth / the reopened decision / precision as obstruction, or another.", lines=2),
 dict(label="The rename", prompt="Said in the room: \"this is the ___ friction, not a you-two problem.\"", lines=2),
 dict(label="The design fix", prompt="Handoff Contract, agreed thresholds, decision log, scheduled precision pass, installed where and by when.", lines=4),
 dict(label="The honest fraction", prompt="What part of this, if any, is not structural, and needs to be handled as what it actually is.", lines=3),
]),

dict(num=39, type="worksheet", title="Decision Rights Assignment",
sub="Assign stages from the team map, keep authority explicit and separate, and give the commitment stage to WHAT energy on purpose.",
sections=[
 dict(label="The decision", prompt="What is being decided, and the accountable owner who signs.", lines=2),
 dict(label="Framing · WHY energy leads", prompt="What are we actually deciding, and what does it serve? Stage lead:", lines=3),
 dict(label="Options · WHY + HOW energy", prompt="The real alternatives with their mechanics and consequences. Stage lead:", lines=4),
 dict(label="Commitment · WHAT energy leads", prompt="The call, made cleanly and on schedule. Stage lead and date:", lines=2),
 dict(label="Execution detail · HOW energy leads", prompt="The decision translated into who-does-what-when. Stage lead:", lines=3),
]),

dict(num=40, type="worksheet", title="Mixed-Audience Deck Planner",
sub="Announce the appendix on slide two, keep the open to two slides, rehearse the ask sentence. Flex the ratios to the room's composition.",
sections=[
 dict(label="The room", prompt="Who is in it, and the orientation mix if you have the map. Ratios flex on composition.", lines=2),
 dict(label="The open · two slides", prompt="Why this matters and what it changes.", lines=3),
 dict(label="The middle · the WHAT spine", prompt="What happens, in what sequence, with which milestones and owners.", lines=5),
 dict(label="The ask · one slide, one sentence", prompt="The specific decision requested. Memorized.", lines=2),
 dict(label="The appendix", prompt="Mechanics, data, edge cases, complete and findable. Mentioned on slide two.", lines=4),
]),

dict(num=41, type="cards", title="Meeting Keeper Cards",
sub="Assign at the top of the meeting, cards physically on the table. Thank interventions by name, the questions are the system working.",
cards=[
 dict(title="Purpose Keeper", body="Licensed to say: \"We've drifted from the goal.\" \"Which decision does this serve?\" \"Why are we doing this part?\""),
 dict(title="Progress Keeper", body="Licensed to say: \"We're leaving without an owner.\" \"Can we decide this today?\" \"What's the next physical step?\""),
 dict(title="Precision Keeper", body="Licensed to say: \"We haven't tested the edge cases.\" \"What breaks first?\" \"Who maintains this after?\""),
 dict(title="The license", body="An intervention that is a role reads as service. The same sentence freelanced reads as obstruction. The card is the license."),
 dict(title="Assignment", body="Thirty seconds at the top. Primaries keep what energizes them; occasionally assign against wiring in low-stakes meetings to build empathy."),
 dict(title="After the meeting", body="Flagged precision items in a room with no HOW wiring get routed to a HOW-primary afterward. Coverage, not replacement."),
]),

dict(num=42, type="worksheet", title="The Handoff Contract",
sub="Fill it in together, live, at the moment of handoff. The receiver writes line two, the sender cannot know what they habitually omit.",
sections=[
 dict(label="What I'm handing you", prompt="The work, its state, and its purpose, three sentences from the sender.", lines=4),
 dict(label="What you need that I wouldn't think to include", prompt="The receiver's line, from their wiring: the mechanism, the deadline, the why.", lines=4),
 dict(label="What done means", prompt="Checkable criteria, agreed now, not discovered at delivery.", lines=4),
 dict(label="When we check back", prompt="One midpoint touch, dated, before done is due.", lines=2),
 dict(label="Signed", prompt="Both names. Ten minutes now closes the gap while it is still free.", lines=2),
]),

dict(num=43, type="worksheet", title="Team Energy Audit",
sub="Quarterly, ninety minutes, facilitated, with profiles on the table. The audit hunts sustained and structural, not occasional and normal.",
sections=[
 dict(label="The map", prompt="Each person: rough percentage of the quarter in WHY, WHAT, and HOW work, against their profile.", lines=6),
 dict(label="Flags", prompt="Tertiary share above roughly a quarter of the time, sustained. Marked without judgment.", lines=3),
 dict(label="Causes, named as structure", prompt="Role shape, coverage gap, inherited task, habit. The gap tax: who keeps paying to cover the missing orientation?", lines=4),
 dict(label="Routes", prompt="Trades to the Board, placement to the Planner, role-shape findings upward, in writing, with the map attached.", lines=4),
 dict(label="Trend", prompt="Against last quarter. Three quarters of one rising line is a role redesign waiting to be scheduled.", lines=2),
]),
]
