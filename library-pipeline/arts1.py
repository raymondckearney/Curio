# Primary kit artifact per tool (1-22)
ARTS_1 = [

dict(num=1, type="worksheet", title="Decomposition Worksheet",
sub="Work top to bottom, one level at a time. Everything below must trace back to the goal. Transfer the task level into your tracking tool the same day.",
sections=[
 dict(label="Level 1 · The Goal", prompt="The outcome in one sentence.", lines=2),
 dict(label="Level 2 · Milestones", prompt="Three to five checkpoints that would prove the work is on track.", lines=5),
 dict(label="Level 3 · Workstreams", prompt="The threads of work that must run under each milestone.", lines=5),
 dict(label="Level 4 · Tasks", prompt="Next physical actions per workstream, each with one owner. Include reviews, approvals, coordination, and cleanup.", lines=8),
]),

dict(num=2, type="checklist", title="Client Deliverable Pre-Flight",
sub="Run the full list before every send, not just when things feel shaky. Add every new miss within a day, a captured miss is a miss retired.",
groups=[
 dict(label="Content", items=["Every section complete, no placeholder text or TODO markers","Numbers verified against source, dates and names spelled correctly","Version and file name correct, old drafts removed from the thread"]),
 dict(label="Recipients", items=["Every stakeholder who expects this is on the send","Anyone mentioned by name has been told before they read it","Reply-to and permissions set the way you intend"]),
 dict(label="Logistics", items=["Attachments actually attached and openable","Links tested from a clean session","Deadline, next step, and owner stated inside the deliverable"]),
 dict(label="Capture", items=["Anything that almost slipped this time is now added to this list"]),
]),

dict(num=3, type="checklist", title="The Last 10% Closing Pass",
sub="Run in order, in one thirty-minute block, before anything ships. A skipped pass is a decision, log it.",
groups=[
 dict(label="Pass 1 · Quality", items=["Read or run the whole deliverable end to end, as the recipient will"]),
 dict(label="Pass 2 · Edge cases", items=["Checked the boundaries: first use, odd input, unusual volume","Checked the handoff points for gaps"]),
 dict(label="Pass 3 · Handoffs", items=["Receiver named and notified","Receiver has everything needed to act without asking you"]),
 dict(label="Pass 4 · Loose ends", items=["Open comments resolved or assigned","Placeholder text, stale links, unsent notifications cleared"]),
 dict(label="Pass 5 · Sign-off", items=["Checked against the definition of done","Named confirmer has said done"]),
]),

dict(num=4, type="worksheet", title="Detail Debt Log",
sub="Capture in one line instead of handling in the moment. Clear the list weekly, in one batch, at a high-energy time you chose.",
sections=[
 dict(label="The detail", prompt="Specific enough that future-you knows exactly what it means.", lines=4),
 dict(label="Where it lives", prompt="The doc, thread, or system it belongs to.", lines=3),
 dict(label="What breaks if dropped", prompt="Honest stakes. Some details can genuinely be let go.", lines=3),
 dict(label="Clear-by date", prompt="When it stops being deferrable.", lines=3),
 dict(label="Weekly review", prompt="Same time each week, thirty minutes. Cross off anything that rolled three weeks with no consequence, on purpose.", lines=4),
]),

dict(num=5, type="worksheet", title="Detail Sprint Planner",
sub="Two recurring sprints a week, at peak energy, one category per sprint, hard stop at the timer, recovery in primary work immediately after.",
sections=[
 dict(label="This week's detail inventory", prompt="Pull from the Detail Debt Log. Group similar items together.", lines=6),
 dict(label="Sprint 1", prompt="Day, time, and single category. Twenty-five to forty minutes.", lines=3),
 dict(label="Sprint 2", prompt="Day, time, and single category.", lines=3),
 dict(label="Recovery blocks", prompt="The primary-orientation work scheduled immediately after each sprint.", lines=3),
 dict(label="Rolled to next week", prompt="Unfinished items roll forward. If the roll list grows weekly, take it to the Triage Tree.", lines=4),
]),

dict(num=6, type="cards", title="Edge-Case Question Cards",
sub="Run five cards against any plan before it is locked. Answer in writing, one line each. \"Don't know\" is a finding.",
cards=[
 dict(title="Volume", body="What happens when the volume doubles? When it halves? When it arrives all at once?"),
 dict(title="Ownership", body="Who owns this after launch, and do they know? Who is the backup?"),
 dict(title="Pressure", body="What is the first thing that breaks under time pressure?"),
 dict(title="Constants", body="What are we assuming stays constant that might not?"),
 dict(title="Boundaries", body="What happens at the edges, the first day, the last day, the handoff between systems or people?"),
 dict(title="The absence", body="If the key person is out for two weeks, what stops moving?"),
 dict(title="The odd input", body="What is the strangest thing a user, client, or system could feed this, and what happens when they do?"),
 dict(title="The rollback", body="If this fails after launch, how do we undo it, and how long does that take?"),
]),

dict(num=7, type="worksheet", title="Definition-of-Done Card",
sub="Write the card before starting, five minutes at kickoff. Agree it with the receiver. When the criteria are met, ship, and stop.",
sections=[
 dict(label="The deliverable", prompt="What is being produced, in one plain sentence.", lines=2),
 dict(label="The criteria", prompt="Three to five checkable facts that must be true. No adjectives, \"reviewed by legal\" is checkable, \"high quality\" is not.", lines=6),
 dict(label="The confirmer", prompt="The named person who says done. Not you.", lines=2),
 dict(label="Not included", prompt="What this work explicitly does not cover, agreed up front.", lines=4),
 dict(label="Agreed by / date", prompt="Both names. The card is a contract.", lines=2),
]),

dict(num=8, type="worksheet", title="Effort Reality-Check",
sub="Never estimate from the shape of the work. Build the number from tasks and history, then present the corrected figure first.",
sections=[
 dict(label="Every task, listed", prompt="From the decomposition worksheet. Estimates on unlisted work are fiction.", lines=7),
 dict(label="The invisible work", prompt="Reviews, revisions, approvals, coordination, cleanup. It is never zero, size each.", lines=4),
 dict(label="The history comparison", prompt="One comparable past project. What was estimated, what did it actually take?", lines=3),
 dict(label="The multiplier and the number", prompt="Apply the ratio history shows. Write the defensible total, and the named unknowns if the work is genuinely novel.", lines=3),
]),

dict(num=9, type="cards", title="AI Precision Prompt Pack",
sub="Use verbatim first, personalize after you know the baseline. Paste generous context. Always edit before forwarding, you are the judge.",
cards=[
 dict(title="Decompose", body="\"Here is a goal and its context: [paste]. Break it into milestones, workstreams, and next physical actions with suggested owners. Include reviews, approvals, coordination, and cleanup tasks.\""),
 dict(title="Checklist", body="\"I am shipping this deliverable: [describe]. Generate a completeness pre-flight checklist covering content, recipients, and logistics. Flag the items most commonly missed.\""),
 dict(title="Gap review", body="\"Review this draft/plan: [paste]. List what is missing or underdeveloped, ranked by consequence. Do not summarize what is present.\""),
 dict(title="Edge cases", body="\"Here is a plan: [paste]. List the boundary conditions and failure modes to consider: volume, ownership, time pressure, odd inputs, rollback.\""),
 dict(title="Definition of done", body="\"For this piece of work: [describe], draft three to five objective, checkable completion criteria and a suggested not-included line.\""),
 dict(title="The editing rule", body="AI output is a strong first pass that will state wrong things confidently. Cut what does not apply, verify what matters, and send nothing raw."),
]),

dict(num=10, type="worksheet", title="HOW-Partner Review Request",
sub="Five lines. Vague requests get vague reviews. Build the review into the timeline, and reciprocate from your primary.",
sections=[
 dict(label="What this is", prompt="One sentence on the deliverable and who it is for.", lines=2),
 dict(label="What stage it's at", prompt="Draft, near-final, or shipping tomorrow. This calibrates depth.", lines=2),
 dict(label="What kind of review", prompt="Completeness, edge cases, feasibility, or numbers. Pick one or two.", lines=2),
 dict(label="Where to push", prompt="The area you are least sure of. Aim their energy.", lines=3),
 dict(label="When it's needed", prompt="A real deadline with runway to act on findings.", lines=2),
 dict(label="The reciprocity", prompt="What you will carry back for them, purpose framing, momentum help, a review in your primary.", lines=3),
]),

dict(num=11, type="worksheet", title="Good-Enough Threshold",
sub="Fill in before starting, agree it with the receiver, post it visibly. Criteria met plus date arrived equals released.",
sections=[
 dict(label="What must be true to ship", prompt="Three to five checkable criteria. The floor, agreed up front.", lines=5),
 dict(label="What \"better\" would add", prompt="Name the marginal value of another week, honestly.", lines=3),
 dict(label="What \"better\" would cost", prompt="The delay, the invisibility, the work not started.", lines=3),
 dict(label="Who accepts it", prompt="The named receiver whose yes means shipped.", lines=2),
 dict(label="The ship date", prompt="A real date. Overriding it later is a scope change, made out loud.", lines=2),
 dict(label="Version-two parking lot", prompt="Improvements beyond the threshold go here, informed by real feedback.", lines=4),
]),

dict(num=12, type="cards", title="The Closing Card",
sub="Claim the last two minutes of any working conversation. Write it in the room, send it to everyone present, open the next meeting with it.",
cards=[
 dict(title="One action", body="The single next physical step. Not a theme, a step."),
 dict(title="One owner", body="A name. \"The team\" is not a name."),
 dict(title="One date", body="When it will be done, said out loud in the room."),
 dict(title="One line of context", body="Why this step, so the card survives outside the room."),
 dict(title="The ritual", body="Announce at the start: \"we'll close with the card.\" Fill it in live. A card filled in later is a card filled in never."),
 dict(title="The loop", body="Card review is the first agenda item of the next meeting. Closed loops are what build the momentum habit."),
]),

dict(num=13, type="worksheet", title="Decision Deadline Sheet",
sub="Set the date with a witness. Gather only what would change the answer. On the date, decide with what is in hand, in writing.",
sections=[
 dict(label="The decision", prompt="One sentence. What exactly is being decided?", lines=2),
 dict(label="The date", prompt="Proportional to the stakes, not to the interestingness of the analysis. Who else knows this date?", lines=2),
 dict(label="Good enough means", prompt="What information would genuinely change the answer? Only that gets gathered.", lines=4),
 dict(label="The decision, made", prompt="Written on the date, with reasons, using whatever is in hand.", lines=4),
 dict(label="Extension (once, out loud)", prompt="If genuinely needed: the new date and the specific information that justifies it.", lines=2),
 dict(label="Log", prompt="Decision and reasoning, recorded. Reviewed quarterly: did the delayed ones improve with time?", lines=3),
]),

dict(num=14, type="cards", title="Version 0.5 Reframe Cards",
sub="Keep these where you work. The reframe routes shipping through what already energizes you: understanding.",
cards=[
 dict(title="The instrument", body="A draft is an instrument for collecting data you cannot get any other way."),
 dict(title="The economics", body="Feedback on a rough version is cheaper than polish on the wrong version."),
 dict(title="The visibility rule", body="Shipped and imperfect beats complete and invisible. Invisible work teaches nothing."),
 dict(title="Contact with reality", body="The system improves through contact with reality, not through further contemplation of it."),
 dict(title="The label", body="Calling it v0.5 tells every reader the precision standard it should be held to. The label is armor."),
 dict(title="The question", body="Attach one specific question to every early release. A draft with a hypothesis is an experiment, not an exposure."),
]),

dict(num=15, type="worksheet", title="Milestone Backplan",
sub="Plan in one sitting, backward only, from the fixed end. Each step asks: what must be true just before this? Publish the chain.",
sections=[
 dict(label="The end state", prompt="The deliverable and its date, one line.", lines=2),
 dict(label="Working backward", prompt="What must be true immediately before the end? And before that? One milestone per line, dated, demonstrable, something you could show, not explain.", lines=8),
 dict(label="Spacing check", prompt="One visible checkpoint every two to four weeks. First milestone within ten days.", lines=2),
 dict(label="Published where", prompt="The milestones are for others as much as for you.", lines=2),
 dict(label="Re-plan notes", prompt="Between checkpoints, execute. The plan changes at the checkpoints, on purpose.", lines=3),
]),

dict(num=16, type="worksheet", title="WIP Inventory & Parking Lot",
sub="Count like an auditor. Cap at three. A new thread requires a finished one or a formally parked one.",
sections=[
 dict(label="Every open thread, honestly", prompt="The number is usually a surprise. Splitting projects into sub-threads to dodge the cap is a known failure mode.", lines=7),
 dict(label="The three", prompt="Chosen by receiver value, not interestingness. Whose waiting is most expensive?", lines=3),
 dict(label="The parking lot", prompt="Everything else, each with a one-line written state so it can be resumed or retired. A park with no state is a dropped thread with better branding.", lines=6),
 dict(label="Monthly review", prompt="Each parked item either gets a slot or gets retired on purpose. Date of next review:", lines=2),
]),

dict(num=17, type="worksheet", title="Momentum Board · Weekly Sheet",
sub="Update at a fixed time each week, ten minutes. Write for a reader, not a diary. Act on anything two weeks in Blocked.",
sections=[
 dict(label="Moved this week", prompt="What demonstrably advanced. Demonstrable is the bar, not effortful.", lines=5),
 dict(label="Moving now", prompt="Active threads, capped by your WIP limit, each with its next step.", lines=5),
 dict(label="Blocked", prompt="What is stuck, on what, and who owns the unblocking. Named, always.", lines=4),
 dict(label="Two-week alarm", prompt="Anything blocked two weeks: escalate, trade, or retire, this week.", lines=3),
]),

dict(num=18, type="worksheet", title="Progress Broadcast Template",
sub="Four lines, five minutes, same time every week. Never skip a quiet week, and use Blocked without apology.",
sections=[
 dict(label="Shipped", prompt="What went out the door. \"Nothing this week, deep in X, on track for the 14th\" is a strong update.", lines=3),
 dict(label="Moving", prompt="The active work and its current state, one line each.", lines=4),
 dict(label="Blocked", prompt="What is stuck and what you need. The highest-leverage line you have.", lines=3),
 dict(label="Next", prompt="The one thing that moves first next week.", lines=2),
 dict(label="Send ritual", prompt="Day, time, and channel, fixed. The reliability is most of the message.", lines=2),
]),

dict(num=19, type="checklist", title="The 48-Hour Draft Protocol",
sub="From kickoff to shareable rough draft in two days. Structure, not polish. It will not feel ready, that is the design.",
groups=[
 dict(label="Hour 0 · Setup", items=["Named reader chosen, for judgment, not a distribution list","One question written: what must this draft test? Usually \"is this the right shape?\""]),
 dict(label="Hours 0-48 · The draft", items=["Two sessions maximum, timeboxed","Skeleton only: headings, structure, the argument in bullets","Wrong-but-complete beats right-but-partial"]),
 dict(label="Hour 48 · The send", items=["Labeled v0.5, for direction not polish","The one question attached","Sent before it feels ready"]),
 dict(label="After", items=["Direction confirmed or corrected, logged","Correction banked in the log, the log is why this rule holds","Deep build proceeds on a checked foundation"]),
]),

dict(num=20, type="worksheet", title="WHAT-Partner Cadence Agreement",
sub="One page, written together. The pairing works because pace-setting energizes the partner. Review monthly.",
sections=[
 dict(label="The work", prompt="The project or period this agreement covers.", lines=2),
 dict(label="Who sets pace", prompt="The partner owns dates, check-in rhythm, and the standing question: what ships this week?", lines=2),
 dict(label="The rhythm", prompt="Fixed check-in, weekly or twice-weekly, fifteen minutes, no agenda beyond movement.", lines=2),
 dict(label="What the partner can call", prompt="Slipping milestones, threads over the WIP cap, thresholds drifting upward.", lines=3),
 dict(label="What stays yours", prompt="Depth, quality, and direction. The partnership divides energy, not authority.", lines=3),
 dict(label="The trade", prompt="What you carry for them in return, usually depth review or purpose framing. The trade is what makes it durable.", lines=3),
 dict(label="Monthly review date", prompt="Ten minutes: balanced, working, continuing?", lines=1),
]),

dict(num=21, type="worksheet", title="Five-Question Purpose Brief",
sub="Ten minutes before any planning starts, with the requester in the room if there is one. Post it where the work lives, refer instead of regenerating.",
sections=[
 dict(label="Who is this for?", prompt="Name the actual person or group, not the org chart.", lines=3),
 dict(label="What changes if it succeeds?", prompt="Describe the after-state in one sentence.", lines=3),
 dict(label="Why now?", prompt="What makes this the right moment, and what is it competing with?", lines=3),
 dict(label="What does success mean?", prompt="How everyone will know, without debate, that it worked.", lines=3),
 dict(label="What happens if we do nothing?", prompt="The honest cost of not doing this work.", lines=3),
 dict(label="Posted at", prompt="Doc header, slide two, channel pin. Revisit only when scope changes.", lines=2),
]),

dict(num=22, type="worksheet", title="North Star One-Pager",
sub="Extract it from the sponsor with the interview guide, get it signed, post it everywhere the work lives. Point instead of re-answering.",
sections=[
 dict(label="The change we're making", prompt="The before and after, two sentences.", lines=3),
 dict(label="Who it serves", prompt="The people whose situation improves, named plainly.", lines=2),
 dict(label="What success means", prompt="The observable result that ends the debate.", lines=3),
 dict(label="What we're not doing", prompt="The explicit exclusions. This line prevents more drift than any other.", lines=3),
 dict(label="The one-line answer", prompt="The sentence you give a stakeholder in an elevator. Memorize this one.", lines=2),
 dict(label="Sponsor sign-off", prompt="Name and date. Now it is authority, not just orientation.", lines=2),
]),
]
