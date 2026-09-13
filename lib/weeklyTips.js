// The 120 weekly profile tips (6 profiles x 20 tips each), sourced from
// Ray's MindPrint_Daily_Tips.xlsx. Keyed by the same lowercase-hyphenated
// profile slug used everywhere else (lib/profiles.js, assessments.type) —
// not the uppercase form used in lib/tertiary.js's VALID_PROFILES. Each
// profile's tagline/label for display comes from lib/profiles.js, not
// duplicated here, so there's one source of truth for that text.
//
// Content is static code, not a DB table, matching how other static
// per-profile content already lives in this codebase (lib/aiDelegationGuide.js,
// lib/guideContent.js). Updating tip copy means editing this file and
// deploying — the card's visual design, by contrast, is fully editable
// without a deploy from Admin -> Emails (the 'weekly_tip' template's stored
// HTML), which is where day-to-day design iteration should happen.
export const WEEKLY_TIPS = {
  "why-what": [
    {
      "number": 1,
      "headline": "Hand Off the Map, Not Just the Compass",
      "body": "You see the path so clearly you assume others do too. They don't. Before any handoff, spend ten minutes writing down what you're assuming. That list is the missing half of the map, and it's the difference between a clean handoff and a stalled project."
    },
    {
      "number": 2,
      "headline": "Your Boredom Is a Signal, Not a Flaw",
      "body": "When a project stops energizing you, the direction is usually set and the work has shifted into maintenance. That's not failure. That's your cue to hand off and find the next gap worth closing. Forcing yourself through the details serves no one."
    },
    {
      "number": 3,
      "headline": "Protect One Vision Block a Week",
      "body": "Direction-setting is your highest-value work, and it's the first thing meetings eat. Block two hours weekly for pure thinking about where things should go. Defend it like a client meeting, because it produces more value than most of them."
    },
    {
      "number": 4,
      "headline": "Don't Own the Checklist",
      "body": "You can track details. It just costs you more than it costs others. Partner with someone who is energized by process and hand them the checklist openly, not apologetically. You bring the destination, they make the trip reliable. Name the deal out loud."
    },
    {
      "number": 5,
      "headline": "Volunteer for the Gap",
      "body": "You're most alive between 'something needs to change' and 'here's what we'll do about it.' Ask for that phase explicitly: diagnostics, turnarounds, new initiatives, reframes. Then hand the wheel to an executor before the work turns to upkeep."
    },
    {
      "number": 6,
      "headline": "Invite Ten Questions After Every Handoff",
      "body": "After you hand off work, ask the receiver for ten questions about anything unclear. What's obvious to you is invisible to them. The questions surface your unstated assumptions while fixing them is still cheap."
    },
    {
      "number": 7,
      "headline": "Ration Your Reframes",
      "body": "Questioning direction energizes you. Your team can experience the third reframe in a month as whiplash. Before reopening a decided question, ask yourself: has something material changed, or am I just restless? Spend reframes like money."
    },
    {
      "number": 8,
      "headline": "Anchor Every Vision to One Next Step",
      "body": "Big ideas without a first step read as weather: interesting, then gone. Pair every direction you set with one concrete action and one owner. Your ideas start shipping the moment they stop being purely ideas."
    },
    {
      "number": 9,
      "headline": "Find Your Finisher",
      "body": "Your natural partner is someone who builds execution infrastructure: the process, the tracking, the follow-through that drains you. If no one on your team plays that role, that's your most important hire or alliance. Momentum without scaffolding collapses."
    },
    {
      "number": 10,
      "headline": "Contain Detail Work in Sprints",
      "body": "Some draining work can't be delegated. Contain it instead: a timer, a defined finish line, a reward after. Detail work costs you less in short, bounded bursts than spread across a week where it colors everything."
    },
    {
      "number": 11,
      "headline": "Name the Real Question Early",
      "body": "Your gift in meetings is spotting when the room is answering the wrong question. Use it in the first ten minutes, not the last five. Early, it redirects the whole conversation. Late, it just restarts it and burns goodwill."
    },
    {
      "number": 12,
      "headline": "Leave the Deck at Slide Ten",
      "body": "You build the argument; refinement drains you. Get the story and structure down, then hand polishing to someone energized by precision. The version you'd force out alone is worse than the one you finish together, and it costs you twice as much."
    },
    {
      "number": 13,
      "headline": "Audit Your Week in Two Columns",
      "body": "Once a month, sort your calendar: hours setting direction versus hours maintaining what's already decided. When maintenance wins consistently, your role has drifted away from your wiring. Renegotiate before the drain starts looking like burnout."
    },
    {
      "number": 14,
      "headline": "Say the Purpose Out Loud, Every Time",
      "body": "You see the goal so vividly you forget others can't. Teams follow you faster when you narrate the destination at every step: this is where we're going, this is why it matters. What feels repetitive to you is clarity to them."
    },
    {
      "number": 15,
      "headline": "Your Impatience With Process Is Data",
      "body": "Restlessness in process-heavy work isn't a character flaw to fix. It's structural information about how you're wired. Stop spending energy on guilt and spend it on scaffolding: partners, systems, and boundaries that cover what drains you."
    },
    {
      "number": 16,
      "headline": "Ask Two Questions Before Saying Yes",
      "body": "Before accepting any role or project: How much of this is setting direction? How much is maintaining detail? If the second number dominates, the opportunity will cost more energy than it returns, no matter how good it looks on paper."
    },
    {
      "number": 17,
      "headline": "When a Detail Person Raises a Flag, Stop Once",
      "body": "Precision-oriented colleagues see failure points you literally cannot. When one flags a risk, give it a full hearing before pushing forward. It feels like friction. It's usually free insurance from someone reading a map you don't have."
    },
    {
      "number": 18,
      "headline": "Turn Restlessness Into a Roadmap",
      "body": "When you feel the itch that something needs to change, don't just voice it. Sketch it: current state, better state, three moves between them. One page. Your instinct becomes ten times more powerful the moment it has a shape others can react to."
    },
    {
      "number": 19,
      "headline": "Don't Apologize for Thinking Big",
      "body": "Someone will call your vision unrealistic. Sometimes they're right about the timeline and wrong about the destination. Take the input on sequencing, keep the ambition. Organizations have plenty of people to shrink ideas. They're short on people who have them."
    },
    {
      "number": 20,
      "headline": "Close the Loops You Open",
      "body": "You open initiatives faster than most people can finish them. Keep a simple list of what you've launched and check in at milestones, not daily. The follow-through doesn't need to come from you, but the accountability for it does."
    }
  ],
  "why-how": [
    {
      "number": 1,
      "headline": "Define 'Complete Enough' Before You Start",
      "body": "Your instinct is to understand fully before concluding. Honor it, but bound it: before any analysis, write one sentence defining what this specific decision actually needs. You'll know when to stop, and stopping will feel like finishing instead of quitting."
    },
    {
      "number": 2,
      "headline": "Lead With the Conclusion",
      "body": "You've done more thinking than your audience can absorb. Don't make them climb the whole ladder with you. State the answer first, then offer depth on request. Your thinking loses nothing, and it finally lands with the people who need to act on it."
    },
    {
      "number": 3,
      "headline": "Deadlines Are Scaffolding, Not Insults",
      "body": "Left alone, you'll refine until the value stops growing and keep going. An external ship date isn't a judgment of your standards. It's the structure that gets your best work into the world. Ask for one when nobody gives you one."
    },
    {
      "number": 4,
      "headline": "Borrow Momentum From a Progress Partner",
      "body": "Your natural complement is someone who creates urgency and forces deployment. Their push isn't pressure to do worse work. It's the mechanism that turns your deep work into shipped work. Find that person and stop resenting the nudge."
    },
    {
      "number": 5,
      "headline": "Practice the One-Sentence Version",
      "body": "For every framework you build, write the single sentence a busy executive would repeat to someone else. Dense thinking that can't travel doesn't influence anything. Compression isn't dumbing down. It's the last mile of the work."
    },
    {
      "number": 6,
      "headline": "Timebox the Rabbit Hole",
      "body": "Some threads deserve six hours. Most deserve forty-five minutes. Before you dive, decide which this is and set the timer. You can always go back. What you can't recover is a week spent perfecting an answer to a question nobody asked."
    },
    {
      "number": 7,
      "headline": "Protect Deep Work Like Revenue",
      "body": "Your output quality tracks directly with unbroken thinking time. Batch your meetings, silence the pings, and treat a two-hour deep block as a commitment with the same weight as a client call. Fragmented time produces fragmented thinking."
    },
    {
      "number": 8,
      "headline": "Ask What the Decision Needs, Not What the Topic Deserves",
      "body": "Every topic can absorb infinite analysis. Decisions can't wait for it. Before going deep, ask: what would change my recommendation? Chase only that. Everything else is intellectually satisfying and practically free of consequence."
    },
    {
      "number": 9,
      "headline": "Name the Specific Risk, Not the General Discomfort",
      "body": "When a team rushes and you resist, 'we're moving too fast' sounds like temperament. 'If we skip X, Y breaks in month three' sounds like foresight. You always have the specific version. Say that one, and watch how differently it lands."
    },
    {
      "number": 10,
      "headline": "Publish Your Frameworks",
      "body": "The mental models you build to understand problems are assets, not scaffolding. Write them down and share them. It multiplies your influence, builds your reputation, and lets your thinking work rooms you'll never be in."
    },
    {
      "number": 11,
      "headline": "Would More Information Change the Answer?",
      "body": "When you feel the pull to keep researching, ask this one question honestly. If nothing you could learn would move the conclusion, the analysis is done, whatever it feels like. Close the tab and write the recommendation."
    },
    {
      "number": 12,
      "headline": "Choose Problems Worthy of Your Depth",
      "body": "Your thinking is a scarce resource being spent somewhere right now. Shallow work drains you twice: once doing it, once knowing what you could have done instead. Fight for the genuinely hard problems. That's where your wiring pays for itself."
    },
    {
      "number": 13,
      "headline": "One Insight Per Meeting",
      "body": "You see twelve things worth saying. The room can carry one. Pick the insight that changes the decision, land it clearly, and hold the rest for a follow-up note. Being heard on one point beats being admired for volume on twelve."
    },
    {
      "number": 14,
      "headline": "Plan Recovery After Sprint Weeks",
      "body": "High-velocity, iteration-heavy stretches drain you even when they go well. Don't schedule another one right behind it. Book deep, focused work as recovery. For you, depth isn't more effort. It's how the battery recharges."
    },
    {
      "number": 15,
      "headline": "Hand Over the Map, Keep Moving",
      "body": "Once you've mapped a system, your value shifts to the next unmapped one. Transfer the map to operators, teach it, then move on. Staying to run what you've already figured out wastes the wiring that figured it out."
    },
    {
      "number": 16,
      "headline": "Don't Compete With Energy. Complement It",
      "body": "The fast-moving rally-the-troops colleague isn't doing your job badly. They're doing a different job. Let them create motion while you make sure the motion is pointed somewhere sound. The pairing outperforms either of you alone."
    },
    {
      "number": 17,
      "headline": "Your Questions Are a Product",
      "body": "In strategy discussions, the precisely right question is worth more than a fast answer. That's your contribution. Ask it without apologizing for slowing things down. A room that's sprinting at the wrong target needs you, not another sprinter."
    },
    {
      "number": 18,
      "headline": "Negotiate Thinking Time Up Front",
      "body": "When handed a problem, resist answering on the spot. Say when you'll have a real answer and what they'll get. 'Thursday, with a recommendation and the two main risks' protects your process and reads as rigor instead of hesitation."
    },
    {
      "number": 19,
      "headline": "Write the Executive Version First",
      "body": "Draft the three-bullet summary before the full document. It forces you to find the spine of your argument, and it guarantees the most important part exists even if nobody reads page two. Depth is your gift. Make it optional for your reader."
    },
    {
      "number": 20,
      "headline": "Density Is a Translation Problem, Not a Character Flaw",
      "body": "People missing your point doesn't mean the thinking is wrong. It means the packaging assumes context they don't have. Build the bridge deliberately: start where they are, not where you ended up. The idea deserves the translation work."
    }
  ],
  "what-why": [
    {
      "number": 1,
      "headline": "Aim the Momentum Before You Rally",
      "body": "Your conviction moves rooms. That's exactly why it deserves a checkpoint: before rallying anyone, confirm the destination is worth reaching. Ten minutes pressure-testing the goal protects the thing that makes you effective, which is people trusting your direction."
    },
    {
      "number": 2,
      "headline": "Hire Your Connective Tissue",
      "body": "The space between milestones doesn't register for you. It's real, and someone is living in it. Find the partner who builds process scaffolding behind your momentum, name the arrangement openly, and credit them loudly. That pairing is your force multiplier."
    },
    {
      "number": 3,
      "headline": "Contain the Paperwork in 25 Minutes",
      "body": "Documentation drains you, and avoiding it costs more later. Don't spread it across a guilty week. Set a timer, batch it, finish inside the window. Draining work hurts less with a hard finish line, and you're wired to race finish lines."
    },
    {
      "number": 4,
      "headline": "Give Your Gut a Three-Question Test",
      "body": "Your intuition is genuinely good. Make it better: before big moves, ask what would have to be true for this to work, what breaks first, and who has seen this fail. If your gut survives three questions, go. You've lost minutes and gained conviction."
    },
    {
      "number": 5,
      "headline": "Celebrate Milestones Louder Than You Think You Should",
      "body": "You organize by milestones instinctively. Most of your team can't see them the way you do. Mark progress visibly and often. It converts your private sense of momentum into shared fuel, and shared fuel is what keeps teams moving."
    },
    {
      "number": 6,
      "headline": "The Flag-Raiser Sees a Bridge Out",
      "body": "When a precision-oriented colleague stops your momentum with a concern, it feels like a toll booth. Usually they're seeing a bridge out that you can't. Give the flag one genuine hearing before driving on. It's the cheapest insurance you'll ever get."
    },
    {
      "number": 7,
      "headline": "Motion Isn't Always Progress",
      "body": "You'd rather move than wait, which usually serves you. Once a week, ask the harder question: is this motion toward the goal, or just motion? Trial and error works when the errors teach you something. Check that yours are."
    },
    {
      "number": 8,
      "headline": "Your Impatience Is as Contagious as Your Energy",
      "body": "Teams catch what you broadcast. When you're driving, they drive. When you're visibly frustrated with process, they learn to skip it, including the parts that were protecting you. Broadcast the energy deliberately. Vent the impatience privately."
    },
    {
      "number": 9,
      "headline": "Ask 'Who Owns the Details?' Out Loud",
      "body": "In every kickoff, momentum has an obvious owner: you. The connective work between milestones usually has none. Name that owner in the meeting, publicly. Unowned detail work becomes silent resentment, and resentment is a momentum killer you can't see."
    },
    {
      "number": 10,
      "headline": "Give Draining Work a Finish Line",
      "body": "You're wired to race toward finish lines, so build them into work that has none. 'Done by 3pm' turns administrative sludge into something your wiring can actually engage with. No finish line, no fuel. So draw one."
    },
    {
      "number": 11,
      "headline": "Schedule Rallying When You're Full",
      "body": "Pitches, kickoffs, and rally moments are your highest-value work. Don't spend them at the end of a draining day. Put them where your energy peaks. Your conviction is the product, and the product has a freshness date."
    },
    {
      "number": 12,
      "headline": "Run One Diagnostic Before Launch",
      "body": "You can start without perfect information, and mostly you should. Buy one insurance policy first: a single session asking what problem this solves and how we'll know it worked. It sharpens the rally cry and saves you relaunching later."
    },
    {
      "number": 13,
      "headline": "Loose Plans Need Tight Goals",
      "body": "Your willingness to navigate by trial and error is a feature, not sloppiness. It only works when the destination is sharp. Keep plans loose and goals crisp: specific, measurable, visible to everyone. Ambiguity in the goal turns iteration into wandering."
    },
    {
      "number": 14,
      "headline": "Delegate the Maintenance, Keep the Mission",
      "body": "Once something works, running it steadily is no longer your job. Hand the maintenance to someone energized by operating systems, and take the mission somewhere new. You're a builder of momentum, not a custodian of it."
    },
    {
      "number": 15,
      "headline": "Keep a Two-Line Learning Log",
      "body": "Trial and error only compounds if the errors are captured. After each iteration, two lines: what we tried, what we learned. Thirty seconds. Without it you're paying full price for lessons you already bought."
    },
    {
      "number": 16,
      "headline": "When Stuck, Shrink the Milestone",
      "body": "Your fuel is visible progress, so stalls hit you harder than most. The fix is almost mechanical: cut the next milestone in half, then in half again, until something is reachable this week. Motion restores your energy. Engineer some."
    },
    {
      "number": 17,
      "headline": "Spend 15 Friday Minutes in the Rearview",
      "body": "Speed leaves things behind. Every Friday, ask: what did we skip this week, and does any of it matter? Usually the answer is no and you've lost 15 minutes. Occasionally it's yes, and you've caught it while it's still cheap."
    },
    {
      "number": 18,
      "headline": "Reframe Slowdowns as Momentum Insurance",
      "body": "When someone asks you to slow down, translate it: they're not stopping the train, they're making sure it stays on the rails. 'Sustainable momentum' is a goal your wiring can chase. 'Stopping to review' never will be. Choose the first frame."
    },
    {
      "number": 19,
      "headline": "Ask How Much of the Role Is Maintenance",
      "body": "Before any new role or project, get honest numbers: how much drives toward goals versus keeps existing systems running? You thrive in motion toward a destination. A role that's mostly upkeep will drain you regardless of title or pay."
    },
    {
      "number": 20,
      "headline": "Say the Goal Every Single Time",
      "body": "You feel the destination constantly. Your team doesn't. State the goal at every meeting, every rally, every check-in, past the point where it feels redundant to you. The repetition you find boring is the clarity they're running on."
    }
  ],
  "what-how": [
    {
      "number": 1,
      "headline": "End Every Meeting With Who, What, When",
      "body": "You already can't leave a conversation without a next step. Make it a service to everyone: close each meeting by naming the owner, the action, and the date out loud. Thirty seconds. It's the single highest-leverage habit your wiring gives you for free."
    },
    {
      "number": 2,
      "headline": "A Reframe Is a Destination Check, Not an Attack",
      "body": "When someone reopens 'why are we doing this,' it lands like a hand on the wheel of your moving car. Usually they're checking the destination, not grabbing the wheel. Hear it once, fully. If the destination holds, you've lost minutes. If it doesn't, they saved you months."
    },
    {
      "number": 3,
      "headline": "Schedule the Purpose Conversation",
      "body": "Direction questions will find you eventually. Better on your calendar than ambushing your execution. Book a monthly session for the big 'are we pointed right' discussion. Containing it protects your momentum the rest of the month."
    },
    {
      "number": 4,
      "headline": "Say 'Plans Are Drafts' Out Loud",
      "body": "You revise plans in motion without a second thought. Your team may read each change as chaos unless you frame it. Tell them the plan is a living draft and course-corrections are the method, not the crisis. Same behavior, completely different trust."
    },
    {
      "number": 5,
      "headline": "Confirm the Outcome Still Matters Before Optimizing",
      "body": "You can make any process faster and cleaner. First ask whether the output still matters. Optimizing the wrong machine is the most expensive mistake your wiring can make, precisely because you'll do it so well."
    },
    {
      "number": 6,
      "headline": "Ask the WHY for One Sentence, Not a Seminar",
      "body": "You don't need the philosophy discussion that drains you. You need the one-line purpose that keeps your execution aligned. Ask purpose-driven colleagues for exactly that: 'Give me the one sentence.' They get heard. You get back to work. Everyone wins."
    },
    {
      "number": 7,
      "headline": "Share the Metrics That Drive You",
      "body": "You track the numbers instinctively. Most teams are starving for exactly that visibility. Put your working metrics somewhere public and update them on rhythm. What keeps a pulse for you becomes motivation and clarity for everyone else."
    },
    {
      "number": 8,
      "headline": "Zoom Out Once a Month, On Purpose",
      "body": "The wide-angle purpose view drains you, so treat it like insurance: cheap, scheduled, brief. One monthly hour asking 'is this still the right hill' protects everything you're building the other 160 hours. Pay the premium."
    },
    {
      "number": 9,
      "headline": "Guard the Iteration Loop",
      "body": "Your engine is act, measure, adjust. Meetings, approvals, and stakeholder churn can stretch that loop until it stops teaching you anything. Fight for short cycles. A fast feedback loop is worth more to you than a bigger budget."
    },
    {
      "number": 10,
      "headline": "Put a Next Step in Every Email",
      "body": "Apply your meeting instinct to writing. End every substantive email with the action, the owner, and the date. You'll be amazed how much of the ambiguity that irritates you was ambiguity you could have removed in one sentence."
    },
    {
      "number": 11,
      "headline": "Price the Ambiguity, Then Force the Decision",
      "body": "When direction is unclear, don't stew. Name the cost out loud: 'Every week without a decision on X costs us Y.' You're wired to move, and pricing the delay is the fastest legitimate way to make everyone else feel the clock you feel."
    },
    {
      "number": 12,
      "headline": "Bring the Next-Step Lens to Vision Meetings",
      "body": "Your restlessness in blue-sky sessions is structural, not a bad attitude. So contribute the thing the room lacks: 'What would we do first?' Grounding one soaring idea in a first step is often the most valuable sentence spoken all meeting."
    },
    {
      "number": 13,
      "headline": "Keep a Parking Lot for Big Questions",
      "body": "Mid-execution, someone raises a fundamental question. Don't debate it live and don't dismiss it. Park it visibly, with a date when it gets its hour. The question gets respect, the momentum survives, and you decide the timing instead of the interruption."
    },
    {
      "number": 14,
      "headline": "Course-Correct Small and Often",
      "body": "Your instinct for continuous small adjustments beats the big dramatic pivot almost every time. Trust it. Ten one-degree corrections cost less than one ninety-degree crisis, and your wiring is built for exactly that cadence."
    },
    {
      "number": 15,
      "headline": "Hold the Pulse, Delegate the Poetry",
      "body": "Keeping a hand on every moving part energizes you. Writing the inspirational narrative doesn't. Let a purpose-driven partner own the story while you own the machine. The work needs both, and it doesn't need them from the same person."
    },
    {
      "number": 16,
      "headline": "Ask for Decisions, Not Discussions",
      "body": "When you bring an issue upward, frame it as a decision: two options, your recommendation, the deadline. Open-ended discussion drains you and rarely serves the issue. Decision framing gets you back in motion faster and reads as leadership."
    },
    {
      "number": 17,
      "headline": "Finishing Is Your Edge. Advertise It",
      "body": "Plenty of people start things. You finish them, and finished-well at that. When roles and projects are handed out, make sure the deciders know completion is your signature. It's rarer than vision and at least as valuable."
    },
    {
      "number": 18,
      "headline": "When Purpose Shifts, Rebuild Fast Instead of Defending",
      "body": "If the destination genuinely changes, your advantage isn't defending the old plan. It's that nobody rebuilds a plan faster than you. Grieve for ten minutes, then do the thing you're best at: new plan, new milestones, moving by Friday."
    },
    {
      "number": 19,
      "headline": "Match Your Zoom to the Moment",
      "body": "You shift between deep detail and high altitude faster than almost anyone. Use it deliberately: sprint level for execution blocks, scan level for weekly reviews. Naming which mode you're in helps slower-shifting colleagues stay with you."
    },
    {
      "number": 20,
      "headline": "Good Enough, Shipped, Then Better",
      "body": "Your instinct to launch a working version and refine in motion is a strategy, not a compromise. Defend it, with one condition: schedule the refinement pass explicitly. 'Ship then improve' only keeps its integrity if the improving actually happens."
    }
  ],
  "how-why": [
    {
      "number": 1,
      "headline": "Treat Your Own Work Like a Hypothesis",
      "body": "You see every existing system as a hypothesis to test. Extend that courage to your own output: release it, observe it, refine it live. The version you'd perfect privately for another month teaches you less than the version in the world teaches you this week."
    },
    {
      "number": 2,
      "headline": "Negotiate the Coordination Away",
      "body": "Project management, status meetings, rallying people: this work drains you and rarely needs you. Trade it explicitly. 'I'll own the hard technical problem end to end; someone else runs the coordination.' Most managers take that deal gladly. Ask."
    },
    {
      "number": 3,
      "headline": "Set a Refinement Budget Before You Start",
      "body": "Decide up front: three revision passes, then it ships. Without a budget, your pursuit of better quietly becomes the obstacle to done. The budget isn't a compromise on quality. It's what forces quality out the door where it can matter."
    },
    {
      "number": 4,
      "headline": "The Tinkering Is the Work. The Fence Is Yours to Build",
      "body": "Never let anyone frame your deep exploration as a detour. It's the method that produces your unusual solutions. But build the fence yourself: a scope, a timebox, a deliverable. A fenced deep-dive is rigor. An unfenced one is a reputation for disappearing."
    },
    {
      "number": 5,
      "headline": "Start Where Your Audience Is, Not Where You Ended Up",
      "body": "By the time you present, you've forgotten what it was like not to know. Your listener has a tenth of your context. Open with the problem in their terms and the answer in one line. The depth stays available. It just stops being the front door."
    },
    {
      "number": 6,
      "headline": "Status Updates in Three Bullets",
      "body": "Long-form updates drain you and go unread. Standardize: what's done, what's next, what's blocking. Three bullets, two minutes, weekly. It buys you the uninterrupted depth you actually want, because nobody chases someone who communicates predictably."
    },
    {
      "number": 7,
      "headline": "Batch the Interruptions",
      "body": "Every context switch out of deep work costs you far more than the minutes it takes. Collect coordination into one daily window and protect the rest. One two-hour unbroken block beats four fragmented half-hours, and it isn't close."
    },
    {
      "number": 8,
      "headline": "Find Your Shipper",
      "body": "Your natural partner creates urgency and forces deployment. Without one, your best work risks staying internal indefinitely, and the world only pays for what ships. If nobody plays that role in your orbit, recruiting one is your highest-return move."
    },
    {
      "number": 9,
      "headline": "Volunteer for the Abandoned Problems",
      "body": "The problems everyone else gave up on are your category. You find paths that weren't visible and make the impossible merely difficult. Seek those assignments out loud. They energize you, and they're where your reputation compounds fastest."
    },
    {
      "number": 10,
      "headline": "Treat Constraints as Fuel",
      "body": "Tight budgets, legacy systems, impossible requirements: what defeats others sharpens you. When a project feels stale, add a constraint. 'How would we do this with half the resources' reliably reactivates the wiring that makes you inventive."
    },
    {
      "number": 11,
      "headline": "Ask for the Deadline, Then Own It Visibly",
      "body": "External milestones are the scaffolding your deployment gap needs. When nobody sets one, set it yourself and announce it. A public date does for you what motivation lectures never will: it converts refinement into release."
    },
    {
      "number": 12,
      "headline": "Leave a Trail While You Tinker",
      "body": "Your explorations produce insight worth keeping, and undocumented insight dies with the moment. Keep rough notes as you go: what you tried, what surprised you. Your future self, and the colleague who inherits the system, will treat it as treasure."
    },
    {
      "number": 13,
      "headline": "Improve One Variable at a Time",
      "body": "You can see five improvements at once. Shipping them together makes causes unreadable and delays everything. Sequence them. One change, measure, next. Slower per change, dramatically faster to compounding results you can actually defend."
    },
    {
      "number": 14,
      "headline": "Choose Depth Roles, Not Velocity Roles",
      "body": "Environments that reward speed and volume over quality will drain you regardless of pay or prestige. Before saying yes, ask what gets celebrated there. If the answer is 'shipping fast,' keep looking. Your wiring compounds where depth is the currency."
    },
    {
      "number": 15,
      "headline": "Bring a Prototype, Not a Proposal",
      "body": "Ten slides arguing something could work will always lose to a rough version that already does. Building it is how you think anyway. Show the working sketch, narrate what you learned, and watch approval conversations shrink from weeks to minutes."
    },
    {
      "number": 16,
      "headline": "Ask Your Question Early",
      "body": "Your 'how does this actually work' catches what everyone else misses, but it only helps before decisions harden. Ask in the first third of the meeting, not the parking lot. Early, it's foresight. Late, it's friction."
    },
    {
      "number": 17,
      "headline": "Propose Async Before Attending",
      "body": "Half the meetings pulling you from deep work need your input, not your presence. Offer written answers by end of day instead. Most organizers accept, you keep your focus block, and your responses are better in writing anyway."
    },
    {
      "number": 18,
      "headline": "Teach the Method, Not Just the Answer",
      "body": "Mentoring others on how you think energizes you and multiplies you. Solving it for them does neither. When colleagues bring problems, walk the method: how to decompose it, what to test first. You build capability instead of a queue."
    },
    {
      "number": 19,
      "headline": "Better Now Beats Perfect Later",
      "body": "The system doesn't need to be finished to start helping. Release the improvement that's ready, keep refining behind it. Version numbers exist so quality and shipping can stop being enemies. Let them do their job."
    },
    {
      "number": 20,
      "headline": "Recharge With a Hard Problem",
      "body": "After coordination-heavy weeks, your recovery isn't rest from work. It's return to depth. Book a day with one genuinely difficult problem and no meetings. For your wiring, that's not more load. That's the recharge."
    }
  ],
  "how-what": [
    {
      "number": 1,
      "headline": "Predict the Break Out Loud, With a Date",
      "body": "You see where processes will fail before they fail. Don't just quietly fix it. Say it: 'This handoff breaks when volume doubles, likely by Q3.' Documented foresight builds the reputation your invisible prevention work never will."
    },
    {
      "number": 2,
      "headline": "Ask for Parameters, Not Purpose",
      "body": "Ambiguous assignments drain you. You don't need the philosophical why to start. You need constraints: budget, deadline, quality bar, boundaries. Ask for those explicitly. Given parameters, you can build anything. Given vibes, nobody can."
    },
    {
      "number": 3,
      "headline": "Your Systems Need a Sponsor",
      "body": "The structures you build are only as safe as leadership's understanding of them. Ally with a vision-oriented partner who can defend your architecture upward in the language executives respond to. You build it. They translate it. Both jobs matter."
    },
    {
      "number": 4,
      "headline": "When Direction Pivots, Demand the Specifics",
      "body": "A pivot can feel like demolition of what you built. Don't resist change in the abstract or accept it in the abstract. Ask precisely: what's not working, and what must the new version do differently? Specifics turn a demolition into a renovation."
    },
    {
      "number": 5,
      "headline": "Report the Fires That Never Started",
      "body": "Operational excellence is invisible by design: things simply work. Fix that in your reporting. Track and share what didn't happen: outages avoided, errors caught, deadlines that held. Prevention has a scoreboard only if you build one."
    },
    {
      "number": 6,
      "headline": "Write the Playbook, Own the Leverage",
      "body": "Every process living only in your head makes you a bottleneck and buries your best thinking. Write the SOP. Documentation isn't overhead for you. It's how your systems scale beyond your hours, and it's proof of the machine you built."
    },
    {
      "number": 7,
      "headline": "Hunt Bottlenecks Like Treasure",
      "body": "Finding and clearing the constraint that's choking a whole system is your wiring at its best. Make it a rhythm: each month, name the one bottleneck whose removal unlocks the most, and go after it deliberately. That's your highest-leverage hour."
    },
    {
      "number": 8,
      "headline": "Show the Math on Structure First",
      "body": "Your setup phase reads as slowness to progress-hungry colleagues. Give them the arithmetic: two weeks of structure now saves eight weeks of rework later. When people see the exchange rate, your deliberateness converts from friction to foresight."
    },
    {
      "number": 9,
      "headline": "Defend the Outcome, Not the System",
      "body": "When someone challenges your process, arguing for the process sounds like protecting turf. Argue for what it delivers: reliability, error rates, speed. If a different design truly hits those outcomes better, adopting it makes your case stronger, not weaker."
    },
    {
      "number": 10,
      "headline": "Get In at the Design Stage",
      "body": "Retrofitting operations onto a finished vision drains you and produces worse systems. Push to join when things are still forming. One sentence works: 'Bring me in while it's still sketchable, and I'll make sure it can actually run.'"
    },
    {
      "number": 11,
      "headline": "Take the One-Sentence Purpose and Go",
      "body": "Extended purpose discussions drain you, but a purpose-blind system is a real risk. The efficient trade: ask for the mission in one sentence, pin it where you work, and check your design against it monthly. Alignment without the seminar."
    },
    {
      "number": 12,
      "headline": "Simplify at the Border",
      "body": "You hold complexity comfortably that would swamp most people. Never make your audience hold it too. One-page views, three-step summaries, clean dashboards. Inside the machine, keep the intricacy. At the border where others meet it, ruthless simplicity."
    },
    {
      "number": 13,
      "headline": "Timebox the Fog",
      "body": "Open-ended exploratory phases drain you, and some are unavoidable. Contain them: agree that ambiguity ends by a set date, after which structure begins. Knowing the fog has a boundary makes it survivable, and often shortens it for everyone."
    },
    {
      "number": 14,
      "headline": "Pair With an Energy Source",
      "body": "Your natural complement drives momentum and rallies people while you build what makes the momentum sustainable. Neither role works without the other. Find that partner, split the labor explicitly, and stop trying to supply both currents yourself."
    },
    {
      "number": 15,
      "headline": "Audit Your Own Machine Quarterly",
      "body": "The processes you built for last year's reality quietly ossify. Turn your improvement lens inward each quarter: what would I redesign today if none of this existed? You'd catch this instantly in someone else's system. Grant yours the same scrutiny."
    },
    {
      "number": 16,
      "headline": "Count to Ten When Leadership Reframes",
      "body": "A strategic question about your system's goal isn't an attack on the system. Your architecture instinct hears demolition; usually it's navigation. Breathe, then respond with what you know best: what the current structure does well and what a change would cost."
    },
    {
      "number": 17,
      "headline": "Playbooks Outlive Heroics",
      "body": "Organizations celebrate the person who saves the day. You're the person who designs the day so it doesn't need saving. That's the more valuable act, and the less visible one. Build the playbook anyway, and make sure your name is on it."
    },
    {
      "number": 18,
      "headline": "Name Your Capacity Honestly",
      "body": "You keep overloaded systems running through sheer structural skill, so nobody sees the strain until something gives. Report capacity like you'd report any system metric: current load, safe maximum, what breaks first. Machines get maintenance windows. So should you."
    },
    {
      "number": 19,
      "headline": "Choose Seats Where Structure Is the Job",
      "body": "Operations, program leadership, infrastructure, implementation: roles where building the machine is the mandate. Pure vision seats, ambiguity-heavy exploratory roles, will drain you regardless of prestige. Pick the seat that pays your wiring, not just your title."
    },
    {
      "number": 20,
      "headline": "Ship the Scaffolding in Pieces",
      "body": "You can see the complete architecture, and waiting to reveal the finished cathedral delays value and invites doubt. Release it in stages: each piece working, each visibly useful. Incremental delivery builds trust in the very structure you're still completing."
    }
  ]
};

export const TIPS_PER_PROFILE = 20;
