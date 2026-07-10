# Primary kit artifact per tool (1-22)
# Each kit uses the physical format best suited to how that tool is actually
# used: filled once or repeatedly, alone or with others, private or posted.
ARTS_1 = [

dict(num=1, title="Decomposition Cascade", type="tree",
sub="Work top to bottom, one level at a time. Everything below must trace back to the goal above it. Transfer the task level into your tracking tool the same day.",
levels=[
 dict(label="Level 2 · Milestones", prompt="Three to five checkpoints that would prove the work is on track.", n=4),
 dict(label="Level 3 · Workstreams", prompt="The threads of work that must run under each milestone above.", n=4),
 dict(label="Level 4 · Tasks", prompt="Next physical actions per workstream above, each with one owner.", n=5),
],
margin="Before you transfer Level 4 to your tracking tool: does it account for reviews, approvals, coordination, and cleanup, not just the visible work?"),

dict(num=2, title="Client Deliverable Pre-Flight", pages=[
 dict(title="Deliverable Pre-Flight Checklist", sub="Run the full list before every send, not just when things feel shaky. This page resets every time.", type="checklist",
 groups=[
  dict(label="Content", items=["Every section complete, no placeholder text or TODO markers","Numbers verified against source, dates and names spelled correctly","Version and file name correct, old drafts removed from the thread"]),
  dict(label="Recipients", items=["Every stakeholder who expects this is on the send","Anyone mentioned by name has been told before they read it","Reply-to and permissions set the way you intend"]),
  dict(label="Logistics", items=["Attachments actually attached and openable","Links tested from a clean session","Deadline, next step, and owner stated inside the deliverable"]),
 ]),
 dict(title="Miss-Capture Log", sub="Anything that almost slipped this time gets a row here today, not filed away in memory. A captured miss is a miss retired.", type="table",
 columns=["Date","Deliverable type","What almost slipped","Added to checklist?"],
 blank_rows=12),
]),

dict(num=3, title="The Last 10% Closing Pass", pages=[
 dict(title="The Five Passes", sub="Kept at the desk, read before every close. Run in order, in one thirty-minute block, before anything ships.", type="reference",
 items=[
  dict(title="Pass 1 · Quality", body="Read or run the whole deliverable end to end, as the recipient will."),
  dict(title="Pass 2 · Edge cases", body="Check the boundaries: first use, odd input, unusual volume. Check the handoff points for gaps."),
  dict(title="Pass 3 · Handoffs", body="Receiver named and notified. They have everything needed to act without asking you."),
  dict(title="Pass 4 · Loose ends", body="Open comments resolved or assigned. Placeholder text, stale links, unsent notifications cleared."),
  dict(title="Pass 5 · Sign-off", body="Checked against the definition of done. Named confirmer has said done."),
 ]),
 dict(title="Closing Pass Log", sub="One row per deliverable. This is the record that makes a skipped pass a decision, not an accident.", type="table",
 columns=[{"label":"Date","w":"60px"},"Deliverable","Passes done (1-5)","Skipped + reason","Sign-off"],
 blank_rows=12),
]),

dict(num=4, title="Detail Debt Log", type="table",
sub="Capture in one line instead of handling in the moment. This page stays out on the desk and fills across the week.",
note="Weekly review: same time each week, thirty minutes. Cross off anything that rolled three weeks with no consequence, on purpose.",
columns=["The detail","Where it lives","Breaks if dropped","Clear-by","Status"],
blank_rows=14),

dict(num=5, title="Detail Sprint Planner", type="table",
sub="Two recurring sprints a week, at peak energy, one category per sprint. Hard stop at the timer, recovery in primary work immediately after.",
note="The method: Batch similar detail together. Place both sprints at peak-energy windows. Box each with a hard timer. Recover in primary-orientation work right after.",
columns=[{"label":"Week of","w":"75px"},"Sprint 1 (day, time, category)","Sprint 2 (day, time, category)","Recovery booked?","Items rolled forward"],
blank_rows=10),

dict(num=6, title="Edge-Case Exposure Matrix", type="table",
sub="Run all eight questions against any plan before it locks, in one sitting. \"Don't know\" is a finding, not a pass.",
columns=[{"label":"Question","w":"210px"},"Answer","Exposure?","Owner","Counter-action","Done by"],
rows=[
 {"Question":"Volume, what happens when it doubles? Halves? Arrives all at once?"},
 {"Question":"Ownership, who owns this after launch, and do they know? The backup?"},
 {"Question":"Pressure, what is the first thing that breaks under time pressure?"},
 {"Question":"Constants, what are we assuming stays constant that might not?"},
 {"Question":"Boundaries, the first day, the last day, the handoff between systems or people?"},
 {"Question":"The absence, if the key person is out two weeks, what stops moving?"},
 {"Question":"The odd input, the strangest thing a user or system could feed this?"},
 {"Question":"The rollback, if this fails after launch, how do we undo it, how long?"},
],
note="Top 3 exposures found today, carried to the plan owner by name:"),

dict(num=7, title="Definition-of-Done Contract", type="contract",
sub="Write it before starting, five minutes at kickoff. Agree it with the receiver. When the criteria are met, ship, and stop.",
head="A working agreement, not a form",
clauses=[
 dict(label="The deliverable", prompt="What is being produced, in one plain sentence.", lines=2),
 dict(label="The criteria", prompt="Three to five checkable facts that must be true. No adjectives: \"reviewed by legal\" is checkable, \"high quality\" is not.", lines=7),
 dict(label="Not included", prompt="What this work explicitly does not cover, agreed up front.", lines=5),
],
sig=["Owner (you)","Confirmer (not you)"]),

dict(num=8, title="Effort Reality-Check", pages=[
 dict(title="Effort Estimate Builder", sub="Never estimate from the shape of the work. Build the number from tasks and history, then present the corrected figure first.", type="combo",
 blocks=[
  dict(heading="Every task, sized (from your Decomposition Cascade)", flex=3, type="table",
   columns=[{"label":"Task","w":"320px"},"Size (small / half-day / full-day)"],
   rows=[{}]*7 + [
    {"Task":"Reviews (invisible work, size it, never zero)"},
    {"Task":"Revisions"},
    {"Task":"Approvals"},
    {"Task":"Coordination"},
    {"Task":"Cleanup"},
   ]),
  dict(heading="The history comparison and the corrected number", flex=1, type="table",
   columns=[{"label":"Field","w":"260px"},"Value"],
   rows=[
    {"Field":"One comparable past project"},
    {"Field":"What it was estimated at"},
    {"Field":"What it actually took"},
    {"Field":"The multiplier this shows"},
    {"Field":"The defensible total for this project"},
   ]),
 ]),
 dict(title="Estimate Actuals Ledger", sub="Persistent across projects. Add one row every time a project closes. The multiplier only sharpens with history.", type="table",
 columns=[{"label":"Project","w":"200px"},"Closed on","Estimated total","Actual total","Ratio"],
 blank_rows=10),
]),

dict(num=9, title="AI Precision Prompt Pack", type="reference",
sub="Use verbatim first, personalize after you know the baseline. Paste generous context. Always edit before forwarding, you are the judge.",
items=[
 dict(quote=True, title="Decompose", body="\"Here is a goal and its context: [paste]. Break it into milestones, workstreams, and next physical actions with suggested owners. Include reviews, approvals, coordination, and cleanup tasks.\""),
 dict(quote=True, title="Checklist", body="\"I am shipping this deliverable: [describe]. Generate a completeness pre-flight checklist covering content, recipients, and logistics. Flag the items most commonly missed.\""),
 dict(quote=True, title="Gap review", body="\"Review this draft or plan: [paste]. List what is missing or underdeveloped, ranked by consequence. Do not summarize what is present.\""),
 dict(quote=True, title="Edge cases", body="\"Here is a plan: [paste]. List the boundary conditions and failure modes to consider: volume, ownership, time pressure, odd inputs, rollback.\""),
 dict(quote=True, title="Definition of done", body="\"For this piece of work: [describe], draft three to five objective, checkable completion criteria and a suggested not-included line.\""),
 dict(title="The editing rule", body="AI output is a strong first pass that will state wrong things confidently. Cut what does not apply, verify what matters, and send nothing raw."),
]),

dict(num=10, title="HOW-Partner Review Request", pages=[
 dict(title="Review Request Memo", sub="Five lines, built to copy straight into an email or a message. Vague requests get vague reviews.", type="worksheet",
 sections=[
  dict(label="What this is", prompt="One sentence on the deliverable and who it is for.", lines=1),
  dict(label="What stage it's at", prompt="Draft, near-final, or shipping tomorrow. This calibrates depth.", lines=1),
  dict(label="What kind of review", prompt="Completeness, edge cases, feasibility, or numbers. Pick one or two.", lines=1),
  dict(label="Where to push", prompt="The area you are least sure of. Aim their energy.", lines=1),
  dict(label="When it's needed", prompt="A real deadline with runway to act on findings.", lines=1),
  dict(label="The reciprocity", prompt="What you will carry back for them: purpose framing, momentum help, a review in your primary.", lines=1),
 ]),
 dict(title="Reviewer Roster & Reciprocity Tracker", sub="Built once, consulted before every future ask. The pairing works because it is tracked, not remembered.", type="table",
 columns=[{"label":"HOW-primary colleague","w":"170px"},"What they like reviewing","Last asked","What you reciprocated with"],
 blank_rows=9),
]),

dict(num=11, title="Good-Enough Threshold", type="contract",
sub="Fill in before starting, agree it with the receiver, post it visibly. Criteria met plus date arrived equals released.",
head="Signed before starting, posted after",
clauses=[
 dict(label="What must be true to ship", prompt="Three to five checkable criteria. The floor, agreed up front.", lines=7),
 dict(label="What \"better\" would add, and cost", prompt="Name the marginal value honestly, then the delay and the work not started that it costs.", lines=5),
 dict(label="Version-two parking lot", prompt="Improvements beyond the threshold, informed by real feedback, go here, not into the ship date.", lines=5),
],
sig=["Named receiver","Ship date"]),

dict(num=12, title="The Closing Card", type="canvas",
sub="Claim the last two minutes of any working conversation. Filled in live, in the room, then sent to everyone present and opened at the start of the next meeting.",
zones=[
 dict(label="One action", size="lg", boxes=1),
 [dict(label="One owner", size="md", boxes=1), dict(label="One date", size="md", boxes=1)],
 dict(label="One line of context, so the card survives outside the room", size="sm", boxes=1),
],
tag="Opened next meeting on: ___"),

dict(num=13, title="Decision Deadline Ritual", pages=[
 dict(title="Decision Contract", sub="Set with a witness, before gathering starts. Signed once, per decision.", type="contract",
 head="Witnessed, not just decided",
 clauses=[
  dict(label="The decision", prompt="One sentence. What exactly is being decided?", lines=2),
  dict(label="The date", prompt="Proportional to the stakes, not to the interestingness of the analysis.", lines=2),
  dict(label="Good enough means", prompt="What information would genuinely change the answer? Only that gets gathered.", lines=5),
  dict(label="Extension (once, out loud)", prompt="If genuinely needed: the new date and the specific information that justifies it.", lines=3),
 ],
 sig=["Decider","Witness"]),
 dict(title="Decision Log", sub="Persistent across decisions. Reviewed quarterly: did the ones that got extended actually improve with time?", type="table",
 columns=[{"label":"Decision","w":"180px"},"Date set","Witness","Decided on date?","Reasoning","Extended?"],
 blank_rows=10),
]),

dict(num=14, title="Version 0.5 Iteration Log", type="table",
sub="Kept and added to across every release. This log is the proof, in your own evidence, that shipping early produces understanding rather than exposure.",
note="0.5 = direction, not polish. 0.8 = refined. Label every draft, the label tells the reader the precision standard to apply.",
columns=[{"label":"Draft / what shipped","w":"170px"},"Date","Label","One question asked","Feedback received","What it taught"],
blank_rows=10),

dict(num=15, title="Milestone Backplan", type="timeline",
sub="Plan in one sitting, backward only, from the fixed end. Each step asks what must be true just before it. Publish the chain where others can see it.",
band=[("End state","the deliverable and its date, fixed and unmoving"),("Posted at","where this is visible to others, not filed privately")],
nodes=[
 dict(label="Milestone -4", fields=["Date:","Demonstrable:","Hit / slipped"]),
 dict(label="Milestone -3", fields=["Date:","Demonstrable:","Hit / slipped"]),
 dict(label="Milestone -2", fields=["Date:","Demonstrable:","Hit / slipped"]),
 dict(label="Milestone -1", fields=["Date:","Demonstrable:","Hit / slipped"], flag=True),
 dict(label="End state", fields=["Date:","Deliverable:"]),
]),

dict(num=16, title="WIP Inventory & Parking Lot", type="board",
sub="Count like an auditor first: every open thread, honestly. Then cap active work at three. A new thread requires a finished one or a formally parked one.",
columns=[
 dict(title="Active", cap="Capped at 3", slots=3, foot="Chosen by receiver value, not interestingness. Whose waiting is most expensive?"),
 dict(title="Parking Lot", slots=5, foot="Each entry needs a one-line written state. A park with no state is a dropped thread with better branding."),
 dict(title="Closed / Retired", slots=3, foot="Monthly review: every parked item gets a slot or gets retired, on purpose."),
]),

dict(num=17, title="Momentum Board · Weekly Sheet", type="board",
sub="Update at a fixed time each week, ten minutes. Write for a reader, not a diary. Act on anything two weeks in Blocked.",
columns=[
 dict(title="Moved", cap="This week", slots=4, foot="Demonstrable is the bar, not effortful."),
 dict(title="Moving now", cap="WIP capped", slots=4, foot="Active threads, each with its next step."),
 dict(title="Blocked", slots=4, foot="Named owner of the unblocking, always. Two weeks here: escalate, trade, or retire."),
]),

dict(num=18, title="Progress Broadcast Template", type="worksheet",
sub="Four lines, five minutes, same time every week, sent as an email or a chat message. Never skip a quiet week, and use Blocked without apology.",
sections=[
 dict(label="Shipped", prompt="What went out the door. \"Nothing this week, deep in X, on track for the 14th\" is a strong update.", lines=1),
 dict(label="Moving", prompt="The active work and its current state, one line each.", lines=2),
 dict(label="Blocked", prompt="What is stuck and what you need. The highest-leverage line you have.", lines=1),
 dict(label="Next", prompt="The one thing that moves first next week.", lines=1),
 dict(label="Send ritual", prompt="Day, time, and channel, fixed. The reliability is most of the message.", lines=1),
]),

dict(num=19, title="The 48-Hour Draft Protocol", type="combo",
sub="Kickoff to shareable rough draft in two days. Structure, not polish. It will not feel ready, that is the design.",
blocks=[
 dict(heading="The rule (read before every kickoff)", flex=1, type="reference",
 items=[dict(title="The protocol", body="Kickoff, two sessions maximum, timeboxed. Skeleton only: headings, structure, the argument in bullets. Wrong-but-complete beats right-but-partial. At hour 48, send it, labeled v0.5, for direction not polish, with one question attached.")]),
 dict(heading="The log (add a row every cycle)", flex=2, type="table",
 columns=[{"label":"Deliverable","w":"140px"},"Kickoff date","Named reader","The one question","Draft sent, labeled v0.5","Direction confirmed or corrected"],
 blank_rows=8),
]),

dict(num=20, title="WHAT-Partner Cadence Agreement", type="combo",
sub="One page, written together. The pairing works because pace-setting energizes the partner.",
blocks=[
 dict(heading="The agreement", flex=3, type="contract",
 clauses=[
  dict(label="The work this covers", lines=1),
  dict(label="Who sets pace", prompt="The partner owns dates, check-in rhythm, and the standing question: what ships this week?", lines=1),
  dict(label="The rhythm", prompt="Fixed check-in, weekly or twice-weekly, fifteen minutes, no agenda beyond movement.", lines=1),
  dict(label="What the partner can call", prompt="Slipping milestones, threads over the WIP cap, thresholds drifting upward.", lines=2),
  dict(label="What stays yours", prompt="Depth, quality, and direction. The partnership divides energy, not authority.", lines=2),
  dict(label="The trade", prompt="What you carry for them in return. The trade is what makes it durable.", lines=1),
 ], sig=["You","Partner"]),
 dict(heading="Monthly review log", flex=1, type="table",
 columns=[{"label":"Month","w":"90px"},"Balanced?","Working?","Continue / adjust / unwind"],
 blank_rows=5),
]),

dict(num=21, title="Five-Question Purpose Brief", type="canvas",
sub="Ten minutes before any planning starts, with the requester in the room if there is one. Posted where the work lives, referred to instead of regenerated.",
zones=[
 [dict(label="Who is this for?", size="md"), dict(label="Why now?", size="md")],
 dict(label="What changes if it succeeds?", size="lg"),
 [dict(label="What does success mean?", size="md"), dict(label="What if we do nothing?", size="md")],
],
tag="Posted at: doc header / slide two / channel pin. Revisit only when scope changes."),

dict(num=22, title="North Star One-Pager", type="canvas",
sub="Extracted from the sponsor with the interview guide, signed, posted everywhere the work lives. Point to it instead of re-answering.",
zones=[
 dict(label="The change we're making", size="lg"),
 [dict(label="Who it serves", size="md"), dict(label="What success means", size="md")],
 dict(label="What we're not doing", size="sm", exclude=True),
],
sig=["Sponsor","Date signed"]),
]
