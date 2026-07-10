# Primary kit artifact per tool (23-43)
ARTS_2 = [

dict(num=23, title="Problem Reframe Deck", pages=[
 dict(title="Problem Reframe Deck", sub="Draw five cards before committing serious effort. Answer in writing, one or two lines each. The card you want to skip is the one holding a finding.", type="cards",
 cards=[
  dict(title="The owner", body="Whose problem is this really, and would they describe it this way?"),
  dict(title="The dissolve", body="What would make this problem irrelevant instead of solved?"),
  dict(title="The layer beneath", body="What is the problem behind the problem?"),
  dict(title="The forbidden fix", body="If the obvious fix were forbidden, what would we do instead?"),
  dict(title="The competence trap", body="Are we solving this because it matters, or because we know how?"),
  dict(title="The skeptic", body="What would a skeptic say we are actually optimizing for?"),
 ]),
 dict(title="Reframe Session Log", sub="One row per session. Run every time a new problem surfaces, before effort is committed, solo or with a team.", type="table",
 columns=[{"label":"Date","w":"60px"},"Project","Cards drawn","Flinch flag (the one you wanted to skip)","Restated problem","Proceed date"],
 blank_rows=12),
]),

dict(num=24, title="So-What Translator", type="combo",
sub="Name the specific reader first. Force the completion for every section, no exceptions. Lead with meaning, keep the detail as the appendix.",
blocks=[
 dict(heading="The reader", flex=0.5, type="table", columns=["Title","Current worry"], blank_rows=1),
 dict(heading="Section → \"which means that, for this reader...\"", flex=3, type="table",
  columns=[{"label":"Section or finding","w":"170px"},"...which means that","Decision it changes","Promote / Keep / Cut"],
  blank_rows=8),
 dict(heading="The winner, copy this to the opening line", flex=0.5, type="table", columns=["Winning completion"], blank_rows=1),
]),

dict(num=25, title="Vision Extraction Interview Guide", type="script",
sub="Book it before planning. Ask, then be quiet, the pauses hold the real answers. Read back what you heard, then convert straight to the North Star page.",
items=[
 dict(say="\"What does done look like, a year out?\"", note="Push past deliverables to the changed situation.", capture=True),
 dict(say="\"What made this urgent now?\"", note="The trigger reveals the real priority ordering.", capture=True),
 dict(say="\"Delivered exactly as specified, what could still make you call this a failure?\"", note="This surfaces the unstated intent. Do not rush it.", capture=True),
 dict(say="\"Who else has to believe in this?\"", note="The map of people the vision must survive contact with.", capture=True),
 dict(say="\"What are you explicitly not asking for?\"", note="Their exclusions, in their words, on the record.", capture=True),
 dict(say="\"Here is what I heard...\"", note="Read back in their words. Corrections captured now are nearly free. This becomes Tool 22, the North Star page.", capture=True),
]),

dict(num=26, title="Quarterly Altitude Check", type="table",
sub="Ninety minutes, four questions, on the calendar four times a year. Answer in writing and keep the answers, drift shows up in the quarter-over-quarter comparison.",
columns=[{"label":"Question","w":"230px"},"Q1","Q2","Q3","Q4"],
rows=[
 {"Question":"Is the work still connected to the goal? Trace it explicitly."},
 {"Question":"What changed in the context? Market, org, priorities, people."},
 {"Question":"Which assumptions expired? The plan encoded beliefs, which are no longer true?"},
 {"Question":"What would we not start today? The hardest question, the one that pays for the ritual."},
 {"Question":"At most three changes made this quarter"},
],
note="Date and who attended, each quarter. Inviting one WHY-primary guest is recommended."),

dict(num=27, title="Assumption Audit", type="combo",
sub="Run against the finished plan, a day after planning. Write every belief, however obvious, \"obviously\" is the costume assumptions wear.",
blocks=[
 dict(heading="Every assumption, rated", flex=3, type="table",
  columns=[{"label":"Assumption (what must be true)","w":"220px"},"Inherited?","Confidence (1-5)","Consequence (1-5)","Test or accept","Cheapest test"],
  blank_rows=7),
 dict(heading="Plot the riskiest here", flex=1.2, type="canvas",
  zones=[
   [dict(label="Low confidence · low consequence", size="sm"), dict(label="High confidence · low consequence", size="sm")],
   [dict(label="Low confidence · high consequence, the audit's product", size="sm", exclude=True), dict(label="High confidence · high consequence", size="sm")],
  ]),
]),

dict(num=28, title="Narrative Arc Planner", type="combo",
sub="Write the Shift beat first, every other beat serves it. Ration the Situation. Pour existing content into the beats, most of the work is reordering and cutting.",
blocks=[
 dict(heading="The five beats, in reading order", flex=1.4, type="timeline",
  nodes=[
   dict(label="Situation", fields=["One beat only, rest to appendix"]),
   dict(label="Stakes", fields=["Why standing still costs something"]),
   dict(label="Shift · write first", fields=["The one thing this exists to say"], flag=True),
   dict(label="So-what", fields=["What it means for the room"]),
   dict(label="Ask", fields=["The specific decision requested"]),
  ]),
 dict(heading="Section-to-beat pour map", flex=1, type="table",
  columns=[{"label":"Existing section or content","w":"280px"},"Beat it feeds (or: appendix / cut)"],
  blank_rows=6),
]),

dict(num=29, title="Opening Line Habit Tracker", type="combo",
sub="Pick two forms and drill them for two weeks, on everything, including trivial messages. Write the line last, place it first.",
blocks=[
 dict(heading="The five forms (pick two)", flex=1, type="reference",
  items=[
   dict(title="Direct", body="\"This matters because...\" Works almost everywhere. The default."),
   dict(title="Executive", body="\"The decision this enables is...\" Strongest for senior readers."),
   dict(title="Document", body="\"By the end of this you'll know...\" Best for documents and decks."),
   dict(title="Request", body="\"We're doing this so that...\" Carries the reason with the ask."),
   dict(title="FYI", body="\"Nothing needed from you; this is so that...\" Prevents mis-escalation."),
  ]),
 dict(heading="Two-week drill", flex=1.3, type="table",
  columns=[{"label":"Day","w":"45px"},"Messages sent","Used the line?","Reply tone this drew"],
  blank_rows=10),
]),

dict(num=30, title="Pre-Mortem Session", pages=[
 dict(title="Facilitator Script", sub="Run after planning, before commitment. Enforce the silent writing round, spoken-first sessions converge on the safe answers.", type="script",
 items=[
  dict(say="\"It is twelve months out. This failed completely.\"", note="Said as fact, not hypothesis. Pause. Hand out the silent round sheet now."),
  dict(say="\"Ten minutes. Everyone writes independently, in silence.\"", note="Enforce it. Specifics stay specific: \"the integration fails in week three\" is a finding, \"bad luck\" is not."),
  dict(say="\"Now read your reasons aloud, one at a time. No discussion yet.\"", note="Cluster the reasons as they're read. The clusters are the risk map."),
  dict(say="\"Rank the top three, by likelihood times damage.\"", note=""),
  dict(say="\"One named owner and one concrete counter per top risk, before we leave this room.\"", note="Added to the plan before commitment, not after."),
 ]),
 dict(title="Silent Round · Tear-Off", sub="One per participant. No prompts beyond the declaration, over-structuring this page causes convergence on safe answers.", type="worksheet",
 sections=[dict(label="Reasons it failed", prompt="Ten minutes. Write independently. Be specific.", lines=15)]),
 dict(title="Risk Map & Counters", sub="Built together after the silent round. Kept as the artifact attached to the plan.", type="table",
 columns=[{"label":"Cluster","w":"170px"},"Likelihood (1-5)","Damage (1-5)","Rank","Owner","Counter"],
 blank_rows=8),
]),

dict(num=31, title="Weekly Energy Budget", pages=[
 dict(title="Weekly Energy Grid", sub="Audit last week before planning next, tags on real history are honest.", type="table",
 columns=[{"label":"Day","w":"75px"},"Morning","Afternoon","Evening"],
 rows=[{"Day":d} for d in ["Mon","Tue","Wed","Thu","Fri"]],
 note="Tag every block: orientation used (WHY/WHAT/HOW) and its level against your profile (primary/secondary/tertiary)."),
 dict(title="Tertiary Trend Log", sub="Persistent across weeks. One heavy week is life. A rising trend across weeks is a role drifting from your wiring, take it to the Triage Tree.", type="table",
 columns=[{"label":"Week of","w":"85px"},"Primary hrs","Secondary hrs","Tertiary hrs","Tertiary % of total","Note"],
 blank_rows=10),
]),

dict(num=32, title="Tertiary Triage Tree", type="combo",
sub="Ask the two questions of every recurring drain, attach a named tool to each. Re-triage quarterly, teams change, tools improve, trades open up.",
blocks=[
 dict(heading="The two questions", flex=1, type="flow",
  questions=["Is it structurable?", "Does it energize a colleague?"],
  paths=[
   dict(title="Scaffold it", body="Recurring and structurable. Tool 1, Tool 5: a template built once, runs forever."),
   dict(title="Timebox it", body="Small, unavoidable, unstructurable. Tool 5: a scheduled peak-energy dose contains it."),
   dict(title="Trade it", body="Draining for you, energizing for a colleague. Tool 33: post it to the Trade Board."),
   dict(title="Automate it", body="Repeatable and rule-based. Tool 9: software or an AI prompt takes it entirely."),
  ]),
 dict(heading="Routing log", flex=1, type="table",
  columns=[{"label":"Recurring drain","w":"190px"},"Structurable?","Energizes a colleague?","Path assigned","Re-triage date"],
  blank_rows=6),
]),

dict(num=33, title="Team Trade Board", pages=[
 dict(title="Trade Board Post", sub="Posted, index-card sized, one per person, pinned next to everyone else's so matches are visually scannable.", type="canvas",
 zones=[
  dict(label="The drain I'm posting", size="lg"),
  dict(label="What I'd take in exchange, from my primary", size="md"),
  dict(label="Name & profile", size="sm"),
 ]),
 dict(title="Trade Contract", sub="Signed by the matched pair. The team map predicts the pairing; this makes it official.", type="contract",
 head="Roughly equivalent load, both ways",
 clauses=[
  dict(label="Scope", lines=3),
  dict(label="Standards", lines=3),
  dict(label="Duration", lines=2),
  dict(label="Accountability", prompt="Stays with the original owner unless the role formally changes.", lines=2),
 ],
 sig=["Person A","Person B"]),
 dict(title="Monthly Review Log", sub="Ask each pair, every month: still balanced? Still working?", type="table",
 columns=[{"label":"Month","w":"90px"},"Balanced?","Working?","Continue / adjust / unwind","Initials"],
 blank_rows=10),
]),

dict(num=34, title="Drain Signals Self-Check", type="combo",
sub="Learn your own signature first, then read teammates against their profiles. Name findings as structure, never as character.",
blocks=[
 dict(heading="The five signals", flex=1, type="reference",
  items=[
   dict(title="Avoidance with a pattern", body="One category of task perpetually re-prioritized while everything else moves."),
   dict(title="Quality inversion", body="Errors appearing specifically in detail, follow-through, or framing, whichever matches the tertiary."),
   dict(title="Meeting-type irritability", body="Fine in some rooms, visibly depleted in others, the room type names the drain."),
   dict(title="Disproportionate recovery", body="A small tertiary task costing an afternoon of flatness afterward."),
   dict(title="Language shifts", body="\"I just need to push through,\" said about the same work, repeatedly."),
  ]),
 dict(heading="Observation log", flex=1.3, type="table",
  columns=[{"label":"Date","w":"60px"},"Who","Signal","What happened","Route to"],
  blank_rows=7),
]),

dict(num=35, title="Orientation-Balanced Agenda", pages=[
 dict(title="Agenda Template", sub="Publish the blocks in the invite. Hold the frame to five minutes, protect the precision pass fiercely, close with the card.", type="canvas",
 zones=[
  dict(label="Purpose frame · 5 min · opener", size="sm"),
  dict(label="Decisions and actions · core", size="lg"),
  dict(label="Precision pass · 10 min, protected · opener", size="md"),
  dict(label="The close, one action, one owner, one date, one line of context", size="sm"),
 ],
 tag="Block openers by orientation, published with the invite."),
 dict(title="Facilitator Timing Card", sub="Held by whoever runs the room. Defends the precision pass when time runs short.", type="reference",
 items=[
  dict(title="Purpose frame · 5 min", body="Cue: why this meeting, what decision it serves. Hold the timer, it protects the WHATs."),
  dict(title="Decisions and actions · core", body="The engine. Runs until decisions land."),
  dict(title="Precision pass · 10 min, protected", body="First thing cut when time runs short, and cutting it is how meetings ship broken decisions. Defend it."),
  dict(title="The close", body="Filled in live: one action, one owner, one date, one line of context."),
 ]),
]),

dict(num=36, title="Three-Question Kickoff", pages=[
 dict(title="Kickoff Page", sub="Posted where the project lives, for its duration. Keepers own noticing when an answer stops being true.", type="canvas",
 zones=[
  [dict(label="Why does this matter, and to whom?", size="md"), dict(label="Keeper", size="sm")],
  [dict(label="What does progress look like in two weeks?", size="md"), dict(label="Keeper", size="sm")],
  [dict(label="How will the work actually get done?", size="md"), dict(label="Keeper", size="sm")],
  dict(label="Findings, any question that could not be answered, escalated today", size="sm", exclude=True),
 ]),
 dict(title="Facilitator Script", sub="Ask in order, why first. A blank answer is the project's first risk.", type="script",
 items=[
  dict(say="\"Why does this matter, and to whom?\"", note="Purpose in two sentences, from the sponsor's mouth if possible."),
  dict(say="\"What does progress look like in two weeks?\"", note="The first visible milestone and who is watching for it."),
  dict(say="\"How will the work actually get done?\"", note="People, sequence, dependencies, the first three tasks."),
  dict(say="A blank answer is a finding, not a gap to fill in later.", note="Escalate it in writing, today."),
  dict(say="Who owns noticing when each answer stops being true?", note="Assign a keeper per question before closing."),
 ]),
]),

dict(num=37, title="Team MindPrint™ Map", pages=[
 dict(title="Team Map", sub="Build from real assessments, reveal it facilitated, refresh on every team change. Energy composition, not competence.", type="combo",
 blocks=[
  dict(heading="Roster", flex=1.3, type="table", columns=[{"label":"Name","w":"140px"},"Profile","Role demand"], blank_rows=5),
  dict(heading="Coverage, plot primary energy by column", flex=0.8, type="canvas",
   zones=[[dict(label="WHY", size="md"), dict(label="WHAT", size="md"), dict(label="HOW", size="md")]]),
  dict(heading="Gap, misload, hiring arrow", flex=1, type="canvas",
   zones=[dict(label="The gap, thinnest column, what predictably goes missing", size="sm", exclude=True),
          dict(label="Misload, who is structurally working from tertiary", size="sm"),
          dict(label="The hiring arrow, what the next hire's profile should add", size="sm")]),
 ]),
 dict(title="Map Input Worksheet", sub="Fill this in first, alone, from real assessments. Transfer it to the posted map at the reveal.", type="worksheet",
 sections=[
  dict(label="The roster", prompt="Each member: name, profile, and the orientation their current role mostly demands.", lines=7),
  dict(label="Coverage", prompt="Primary energy per orientation. WHY: / WHAT: / HOW:", lines=3),
  dict(label="The gap", prompt="The orientation with little or no primary coverage, and what predictably goes missing because of it.", lines=3),
  dict(label="Misload", prompt="Who is structurally working from their tertiary, role demand versus wiring.", lines=3),
  dict(label="The hiring arrow", prompt="What the next hire's profile should add, decided before the resume pile decides instead.", lines=2),
 ]),
]),

dict(num=38, title="The Friction Forecast", type="combo",
sub="Map live frictions to the signatures, rename them out loud, install the design fix. Structure resolves what conversation keeps re-fighting.",
blocks=[
 dict(heading="The friction signature catalog", flex=2.2, type="reference",
  items=[
   dict(title="The vision handoff stall", body="WHY hands WHAT-shaped goals to HOW with the mechanism missing. Say: \"this is the vision handoff stall.\" Fix: the Handoff Contract, Tool 42."),
   dict(title="Pace versus depth", body="WHAT reads HOW thoroughness as resistance, HOW reads pace as recklessness. Say: \"this is pace versus depth.\" Fix: agreed thresholds, Tool 11."),
   dict(title="The reopened decision", body="WHY revisits what WHAT considered closed. Say: \"this is the reopened decision.\" Fix: the Decision Deadline log, Tool 13."),
   dict(title="Precision as obstruction", body="The edge-case question lands as negativity at the moment of momentum. Say: \"this is precision as obstruction.\" Fix: the scheduled precision pass, Tool 35."),
  ]),
 dict(heading="Live use", flex=0.7, type="table",
  columns=["Which signature?","Fix installed?","Honest check, orientation friction, or a person issue?"],
  blank_rows=3),
]),

dict(num=39, title="Decision Rights Relay", type="timeline",
sub="Assign stages from the team map, keep authority explicit and separate, and give the commitment stage to WHAT energy on purpose.",
band=[("The decision","what is being decided, one sentence"),("Accountable owner","signs at every stage, stays separate from the stage leads")],
nodes=[
 dict(label="Framing · WHY leads", fields=["Stage lead:","Target date:","Handoff criterion:"]),
 dict(label="Options · WHY + HOW", fields=["Stage lead:","Target date:","Handoff criterion:"]),
 dict(label="Commitment · WHAT leads", fields=["Stage lead:","Target date:","Handoff criterion:"], flag=True),
 dict(label="Execution · HOW leads", fields=["Stage lead:","Target date:","Handoff criterion:"]),
]),

dict(num=40, title="Mixed-Audience Deck Planner", type="combo",
sub="Announce the appendix on slide two, keep the open to two slides, rehearse the ask sentence. Flex the ratios to the room's composition.",
blocks=[
 dict(heading="The room", flex=0.6, type="canvas",
  zones=[dict(label="Who's in it, and the WHY / WHAT / HOW ratio if you have the team map", size="sm")]),
 dict(heading="The deck, in sequence", flex=1.6, type="timeline",
  nodes=[
   dict(label="Open · 2 slides", fields=["Why this matters, what it changes"]),
   dict(label="Middle · WHAT spine", fields=["Sequence, milestones, owners"]),
   dict(label="Ask · 1 slide, 1 sentence", fields=["The specific decision, memorized"], flag=True),
   dict(label="Appendix", fields=["Mechanics, data, edge cases. Announced on slide two."]),
  ]),
]),

dict(num=41, title="Meeting Keeper Cards", pages=[
 dict(title="Meeting Keeper Cards", sub="Cards physically on the table. Assign at the top of the meeting, thank interventions by name, the questions are the system working.", type="tent",
 cards=[
  dict(title="Purpose Keeper", body="Licensed to say: \"We've drifted from the goal.\" \"Which decision does this serve?\" \"Why are we doing this part?\""),
  dict(title="Progress Keeper", body="Licensed to say: \"We're leaving without an owner.\" \"Can we decide this today?\" \"What's the next physical step?\""),
  dict(title="Precision Keeper", body="Licensed to say: \"We haven't tested the edge cases.\" \"What breaks first?\" \"Who maintains this after?\""),
 ]),
 dict(title="Rotation & Quick-Start", sub="Rotate deliberately, occasionally against wiring in low-stakes meetings, to build empathy.", type="combo",
 blocks=[
  dict(heading="Rotation tracker", flex=1.4, type="table",
   columns=[{"label":"Date","w":"70px"},"Purpose keeper","Progress keeper","Precision keeper"], blank_rows=8),
  dict(heading="Quick-start", flex=1, type="reference",
   items=[
    dict(title="The license", body="An intervention that is a role reads as service. The same sentence freelanced reads as obstruction. The card is the license."),
    dict(title="After the meeting", body="Flagged precision items in a room with no HOW wiring get routed to a HOW-primary afterward. Coverage, not replacement."),
   ]),
 ]),
]),

dict(num=42, title="The Handoff Contract", pages=[
 dict(title="The Handoff Contract", sub="Fill it in together, live, at the moment of handoff. The receiver writes line two, the sender cannot know what they habitually omit.", type="contract",
 head="Torn off, both signers keep a copy",
 clauses=[
  dict(label="What I'm handing you", prompt="The work, its state, and its purpose, three sentences from the sender.", lines=5),
  dict(label="What you need that I wouldn't think to include", prompt="The receiver's line, from their wiring: the mechanism, the deadline, the why.", lines=5),
  dict(label="What done means", prompt="Checkable criteria, agreed now, not discovered at delivery.", lines=5),
  dict(label="When we check back", prompt="One midpoint touch, dated, before done is due.", lines=2),
 ],
 sig=["Sender","Receiver"]),
 dict(title="Wiring-Gap Examples by Pairing", sub="Read before the live session. What each sender wiring typically omits, by receiver.", type="table",
 columns=["Sender orientation","Receiver orientation","What typically gets dropped"],
 rows=[
  {"Sender orientation":"WHY","Receiver orientation":"HOW","What typically gets dropped":"The mechanism. Inspiration handed over, called a plan."},
  {"Sender orientation":"HOW","Receiver orientation":"WHY","What typically gets dropped":"The reason. Completeness handed over, called clarity."},
  {"Sender orientation":"WHAT","Receiver orientation":"HOW","What typically gets dropped":"The deadline logic. Urgency handed over, called a brief."},
 ],
 blank_rows=4),
 dict(title="Habit-Month Tracker", sub="One month, every cross-orientation handoff. After a month the questions become reflex and the paper becomes optional.", type="table",
 columns=[{"label":"Date","w":"70px"},"Pairing","Used the contract?"],
 blank_rows=12),
]),

dict(num=43, title="Team Energy Audit", pages=[
 dict(title="Audit Session Sheet", sub="Quarterly, ninety minutes, facilitated, with the team map on the table. Hunts sustained and structural, not occasional and normal.", type="worksheet",
 sections=[
  dict(label="The map", prompt="Each person: rough percentage of the quarter in WHY, WHAT, and HOW work, against their profile.", lines=6),
  dict(label="Flags", prompt="Tertiary share above roughly a quarter of the time, sustained. Marked without judgment.", lines=3),
  dict(label="Causes, named as structure", prompt="Role shape, coverage gap, inherited task, habit. The gap tax: who keeps paying to cover the missing orientation?", lines=4),
  dict(label="Routes", prompt="Trades to the Board, placement to the Planner, role-shape findings upward, in writing, with the map attached.", lines=4),
 ]),
 dict(title="Cross-Quarter Tracker", sub="Persistent. Add each person's row after every session. Three quarters of one rising line is a role redesign waiting to be scheduled.", type="table",
 columns=[{"label":"Quarter","w":"60px"},"Name","WHY %","WHAT %","HOW %","Flagged?","Escalated?"],
 blank_rows=10),
]),
]
