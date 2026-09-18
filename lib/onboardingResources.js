// Onboarding Resources content — verbatim from the source PDFs (Manager
// Integration Guide + New Hire Brief, one pair per MindPrint™ profile).
// Keys match the slug format used elsewhere (lib/profiles.js): why-what,
// why-how, what-why, what-how, how-why, how-what.
//
// Each profile has two views:
//   manager  — for the manager bringing this profile onto the team
//   newHire  — for the new hire themselves, second person
//
// misreadings / worthKnowing items are {lead, body} pairs: `lead` is the
// short diagnostic sentence the source PDF sets apart before the
// elaboration, `body` is the rest of the paragraph.

const onboardingResources = {
  'why-what': {
    label: 'WHY–WHAT',
    tagline: 'Purpose-driven, progress-oriented',
    manager: {
      intro: "A 90-day guide for the manager bringing a WHY-WHAT hire onto the team.",
      energizing: {
        items: [
          "A real problem worth solving, framed clearly enough that they can see why it matters",
          "Room to question the brief itself before being asked to execute it",
          "Early exposure to the bigger picture: strategy, market context, where this fits",
          "Visible momentum once they're bought in, they move fast once the purpose clicks",
        ],
        example: "sharing the “why” behind a project before the task list, even if it takes an extra 15 minutes.",
      },
      draining: {
        items: [
          "Being handed a fully scoped task list with no context for why it matters",
          "Long stretches of detailed execution or documentation with no room to question direction",
          "Repetitive or routine work with no variation or forward movement",
          "Being expected to follow a plan they had no input into",
        ],
        example: "a detailed 90-day execution plan handed to them on day one, with no chance to weigh in on the direction first.",
      },
      day1: [
        "Skip the detailed task list as the centerpiece of day one",
        "Walk them through the strategic context: why this role exists, why now, what's at stake",
        "Give them room to ask questions about the direction, even ones that sound like pushback",
        "Introduce them to whoever owns execution details, since that's where they'll lean on a partner",
        "Point them toward the bigger picture documents (strategy decks, roadmaps) before process docs",
      ],
      week1: [
        "A real strategic question or opportunity to weigh in on, not just onboarding tasks",
        "Time with leadership or whoever set the current direction, to understand the reasoning firsthand",
        "An early conversation about who on the team handles execution detail, so they know who to partner with",
        "Permission to ask “why are we doing it this way” without it reading as resistance",
        "One meeting focused purely on direction, not logistics",
      ],
      checkins: {
        day30: "Ask what's clicked for them purpose-wise and what still feels unclear. Watch for early signs they're being pulled into execution detail without a partner to hand it to. Confirm they've had at least one real opportunity to influence direction, not just receive it.",
        day60: "Watch for friction with detail-oriented teammates who feel like they're cleaning up after handoffs. Name the pattern early: they aren't being careless, execution detail is genuinely a blind spot, not a lack of care. The fix is a partner, not a lecture about thoroughness.",
        day90: "They've reframed at least one assumption the team had stopped questioning. They have a working partnership with someone execution-oriented who catches what they miss. They're influencing direction, not just receiving assignments.",
      },
      partner: "A HOW-WHAT or HOW-WHY partner who can build the execution scaffolding underneath their direction, or a WHAT-HOW partner for fast iteration once direction is set. Avoid pairing them primarily with another purpose-driven person, since neither will naturally catch the execution gaps.",
      misreadings: [
        { lead: "Read as careless about details, actually has a genuine blind spot there.", body: "A WHY-WHAT who hands off a plan with real gaps in it isn't being careless, they often don't see the gaps at all. That's a structural blind spot, not negligence, and it means a strong execution partner isn't optional, it's the thing that makes their direction actually work." },
        { lead: "Read as resistant or reckless, actually questioning too early for their teammates' comfort.", body: "When a WHY-WHAT pulls the team back to re-examine purpose right when others are ready to execute, it can look like obstruction. It isn't. They're protecting against solving the wrong problem well, and that instinct is usually right more often than it's inconvenient." },
      ],
    },
    newHire: {
      intro: "A guide to your own first 90 days on this team.",
      energize: {
        text: "You do your best work once you understand why something matters, not just what to do. Ask for the context before the task list, and don't be shy about questioning the brief itself if something about it doesn't add up. Once the purpose clicks for you, you'll move fast, that's when you're at your best.",
        tryPhrase: "Can you help me understand the why behind this before I dive in?” That's not you being difficult, that's how you do good work.",
      },
      drain: {
        text: "A long stretch of detailed execution or process work with no room to question direction will wear on you fast, even if you're capable of doing it. If you notice you're deep in task lists with no sense of the bigger picture, say something.",
      },
      days: {
        day30: "Look for at least one moment where you've genuinely influenced direction, not just received it. If you're mostly executing a plan you had no say in, raise that with your manager.",
        day60: "You may notice friction with a teammate who's more detail-oriented, especially if something you handed off had gaps in it. That's not a character flaw, execution detail is a real blind spot for you. Find a partner who's energized by exactly the kind of detail work that drains you.",
        day90: "You should be influencing direction somewhere, not just executing someone else's. Find one person on the team who's strong on execution detail, someone who can catch what you miss and turn your direction into a real plan. That partnership will save you both a lot of friction.",
      },
      worthKnowing: [
        { lead: "Missing details doesn't mean you don't care.", body: "If a handoff you made turns out to have real gaps in it, that's not carelessness, it's a genuine blind spot. The fix is a strong partner who catches what you miss, not trying to become someone who lives in the details." },
        { lead: "Questioning the plan isn't the same as resisting it.", body: "If you find yourself pulling the team back to re-examine purpose right when everyone's ready to move, that can look like obstruction from the outside. It usually isn't, you're protecting against solving the wrong problem, and that instinct is worth trusting." },
      ],
    },
  },

  'why-how': {
    label: 'WHY–HOW',
    tagline: 'Purpose-driven, precision-oriented',
    manager: {
      intro: "A 90-day guide for the manager bringing a WHY-HOW hire onto the team.",
      energizing: {
        items: [
          "A genuinely complex problem to sink their teeth into, not a simplified version of it",
          "Time to understand both the purpose and the mechanics before being asked to act",
          "Access to primary sources and real depth, not summarized overviews",
          "Room to build a complete, well-reasoned point of view before committing to a direction",
        ],
        example: "giving them the full research and context on a decision before asking for their take, rather than a two-line summary.",
      },
      draining: {
        items: [
          "Being pushed to move fast on something they haven't had time to think through",
          "Pressure to ship before it feels complete, especially without a clear reason why",
          "Being asked to communicate to a broad, non-technical audience with no support",
          "A steady stream of status updates and coordination overhead",
        ],
        example: "a “let's just get something out the door” deadline with no room to explain the reasoning behind the recommendation.",
      },
      day1: [
        "Skip the fast-paced team tour, give them something substantial to read and think about instead",
        "Share the full context and reasoning behind current strategy, not just the conclusions",
        "Let them know it's genuinely fine to take time before forming an opinion",
        "Introduce them to whoever will need their thinking translated into simpler terms for broader audiences",
        "Give them a real, complex problem to start exploring, even if the timeline is generous",
      ],
      week1: [
        "Real access to primary information: data, research, prior analysis, not just summaries",
        "Protected time to think before being expected to present conclusions",
        "An early conversation about what “complete enough” looks like for this team's pace",
        "Someone to partner with who can create urgency once their thinking is ready",
        "One structured opportunity to share early thinking without it being treated as final",
      ],
      checkins: {
        day30: "Ask what they've come to understand so far and what's still unresolved for them. Confirm they've had real time to think, not just a compressed sprint to a conclusion. Watch for early signs they're being rushed past the depth they need.",
        day60: "Watch for friction around pace, particularly with more progress-oriented teammates who are ready to move. Name the pattern early: they aren't stalling, their output quality is tied directly to the thinking time they're given. Help identify what “complete enough” looks like for this specific decision rather than asking them to just move faster.",
        day90: "They've produced at least one piece of thinking that reframed how the team understands a problem. They have a partner who takes their depth and turns it into forward motion. Their communication is starting to reach people outside their own function, ideally with help translating it.",
      },
      partner: "A WHAT-WHY or WHAT-HOW partner who can take their thinking and turn it into momentum, or a HOW-WHAT partner to operationalize the detailed plans that come out of their analysis. Avoid pairing them only with other precision-driven people, since neither will naturally supply urgency.",
      misreadings: [
        { lead: "Read as slow, actually building something more durable.", body: "A WHY-HOW who takes longer to reach a conclusion isn't stalling, their output quality is directly tied to the thinking conditions they're given. Rushing them doesn't produce a faster version of the same answer, it produces a worse one." },
        { lead: "Read as overly dense or hard to follow, actually thinking at a level of completeness others aren't used to.", body: "Their communication can feel like a lot, that's not a character flaw, it's a translation gap. The fix is a bridge to simpler language, not asking them to think less thoroughly." },
      ],
    },
    newHire: {
      intro: "A guide to your own first 90 days on this team.",
      energize: {
        text: "You do your best thinking when you're given real time and a genuinely complex problem, not a simplified version handed to you with a tight deadline. Ask for primary sources and real depth rather than summaries. You'll know you're in the right zone when you're building a complete picture before committing to a direction.",
        tryPhrase: "I want to get this right, can I have a bit more time to think it through before I commit to an answer?” That's not you being slow, that's how your best work gets made.",
      },
      drain: {
        text: "Being pushed to move fast before you've had time to think it through will cost you more than it saves, even if you technically can do it. If you notice you're being rushed past the depth you need, say so.",
      },
      days: {
        day30: "Make sure you're getting real time to think, not just a compressed sprint to a conclusion. If you feel rushed past the depth you need, raise it early rather than pushing through and delivering something you're not confident in.",
        day60: "You may feel friction with more progress-oriented teammates who are ready to move faster than you are. That's not a sign you're doing something wrong, your value comes from the depth, not the speed. Work with your manager to define what “complete enough” looks like for specific decisions.",
        day90: "You should have produced at least one piece of thinking that changed how the team sees a problem. Find a partner who's energized by momentum and can take your thinking and turn it into forward motion, since that's not naturally where your energy goes.",
      },
      worthKnowing: [
        { lead: "Taking longer doesn't mean you're behind.", body: "If you need more time than others to reach a conclusion, that's not a weakness, your output quality is tied directly to the conditions you're given to think. Protecting that time is worth doing, even when it feels like you're asking for something inconvenient." },
        { lead: "Being hard to follow isn't the same as being wrong.", body: "If people tell you your thinking is dense or hard to follow, that's a translation gap, not a flaw in the thinking itself. Finding someone who can help bridge that gap will serve you better than trying to simplify everything yourself." },
      ],
    },
  },

  'what-why': {
    label: 'WHAT–WHY',
    tagline: 'Progress-driven, purpose-oriented',
    manager: {
      intro: "A 90-day guide for the manager bringing a WHAT-WHY hire onto the team.",
      energizing: {
        items: [
          "A clear, compelling goal to rally around from day one",
          "Momentum, visible progress toward something that matters",
          "Client-facing or team-facing moments where they can mobilize others",
          "Fast decisions, even under some ambiguity, rather than prolonged deliberation",
        ],
        example: "giving them a real goal to move toward in week one, even an ambitious one, rather than a slow ramp-up period.",
      },
      draining: {
        items: [
          "Being handed detailed process design or documentation work with no clear finish line",
          "Administrative or compliance-heavy tasks with no visible forward motion",
          "Deep analytical research with no action attached",
          "Long planning phases before anything moves",
        ],
        example: "a multi-week planning phase before any visible progress, with the goal itself feeling distant or abstract.",
      },
      day1: [
        "Skip an extended process orientation, give them a real goal to start moving toward",
        "Connect the role clearly to a compelling destination, not just a list of responsibilities",
        "Introduce them to whoever owns process and structure, since that's where they'll need a partner",
        "Let them meet people they'll be rallying or mobilizing early on",
        "Set one clear, achievable early goal they can hit fast",
      ],
      week1: [
        "A real goal or milestone to move toward, with visible stakes",
        "Chances to rally others, even informally, around something that matters",
        "Light structure, not heavy process, so momentum doesn't stall out",
        "An early conversation about who handles the detailed planning behind their goals",
        "Fast decisions where possible, rather than waiting on extended analysis",
      ],
      checkins: {
        day30: "Ask what's felt like real progress so far and where they've felt stuck in process. Confirm they've hit at least one visible milestone. Watch for early signs they're being weighed down by administrative or process ownership that isn't actually theirs to carry.",
        day60: "Watch for friction with more detail-oriented teammates who feel like they're cleaning up connective work the WHAT-WHY didn't register as important. Name the pattern early: they aren't careless, the space between milestones just isn't where their energy naturally goes. The fix is a strong process partner, not a lecture about thoroughness.",
        day90: "They've mobilized people around at least one goal that felt bigger than a single task. They have a partner who builds the execution infrastructure underneath their momentum. Check-ins with them feel like forward motion, not process review.",
      },
      partner: "A WHY-HOW or WHY-WHAT partner who can pressure-test direction periodically, or a HOW-WHAT partner to manage the detailed execution underneath their momentum. Avoid making their primary partnership another progress-driven person, since neither will naturally build the structure they need.",
      misreadings: [
        { lead: "Read as careless about the details, actually just not where their energy goes.", body: "A WHAT-WHY who doesn't register the small connective work between milestones as important isn't being careless, that work genuinely isn't where their attention naturally lands. A strong process partner closes that gap far better than asking them to slow down and care more." },
        { lead: "Read as reckless for moving with incomplete information, actually navigating well on intuition.", body: "Their comfort moving forward without a fully mapped plan can look risky to more detail-oriented teammates. It usually isn't, it's a real feature of how they operate, and it's often what gets things moving when a fully mapped plan would have taken too long to produce." },
      ],
    },
    newHire: {
      intro: "A guide to your own first 90 days on this team.",
      energize: {
        text: "You do your best work when you have a clear, compelling goal to move toward, not a slow ramp-up with no visible finish line. Ask for a real target you can chase from week one. You'll know you're in the right role when you can feel yourself building momentum toward something that matters.",
        tryPhrase: "Is there a version of this I can start moving on now, even if we refine it as we go?” That's not impatience, that's how you're built.",
      },
      drain: {
        text: "Long planning phases, heavy documentation, or process work with no clear finish line will wear on you fast, even if you're capable of doing it. If you feel stuck in the weeds with nothing to show for it, say so.",
      },
      days: {
        day30: "Look for at least one real milestone you've hit. If you're mostly stuck in planning or process with nothing visible to show for it, raise that with your manager.",
        day60: "You may notice friction with a more detail-oriented teammate who feels like they're cleaning up work you moved past. That's not you being careless, the space between milestones just isn't where your energy naturally goes. Find a partner who's energized by exactly that kind of detail work.",
        day90: "You should be able to point to at least one goal you helped mobilize people around. Find one person on the team who's strong on process and structure, someone who can build the infrastructure underneath your momentum so it holds.",
      },
      worthKnowing: [
        { lead: "Not noticing the small stuff doesn't mean you don't care.", body: "If a teammate is cleaning up detail work you moved past without registering it, that's not carelessness, that space just isn't where your energy naturally goes. A strong process partner solves this far better than trying to become someone who lives in the details." },
        { lead: "Moving without a full plan doesn't mean you're being reckless.", body: "Your comfort moving forward on incomplete information can look risky from the outside. It's actually a real strength, trust your intuitive sense of direction, and let a detail-oriented partner fill in the rest." },
      ],
    },
  },

  'what-how': {
    label: 'WHAT–HOW',
    tagline: 'Progress-driven, precision-oriented',
    manager: {
      intro: "A 90-day guide for the manager bringing a WHAT-HOW hire onto the team.",
      energizing: {
        items: [
          "A real initiative to break into actionable steps and start moving on immediately",
          "Metrics and dashboards they can use to track progress, genuinely energizing, not just a management tool",
          "Cross-functional execution work where they can hold both the big picture and the details",
          "Fast, iterative cycles rather than one long planning phase",
        ],
        example: "handing them a messy, half-finished initiative and letting them build the plan and start executing in the same week.",
      },
      draining: {
        items: [
          "Open-ended visioning work with no clear milestones attached",
          "Work with no defined next step, sitting in ambiguity about direction",
          "Pure strategy conversations with no implementation path",
          "Extended uncertainty about goals with no timeline to resolve it",
        ],
        example: "a strategy offsite that produces a new direction but no concrete next steps, leaving them with nothing to actually execute.",
      },
      day1: [
        "Skip the abstract vision-setting as the centerpiece of day one",
        "Give them a real initiative with defined next steps they can start acting on",
        "Set up their access to whatever metrics or dashboards will track their work",
        "Introduce them to whoever sets overall direction, since that's the partnership they'll need periodically",
        "Let them see the full arc of a project, from plan through execution, early on",
      ],
      week1: [
        "A concrete plan they can start executing immediately, not just observing",
        "Clear metrics attached to their work from the start",
        "Cross-functional access so they can manage execution across teams, not just their own",
        "An early, scheduled check-in on direction, so they know it's not open-ended",
        "Room to course-correct in real time rather than sticking rigidly to an initial plan",
      ],
      checkins: {
        day30: "Ask what's moving and what metrics they're tracking. Confirm they have a real plan they own, not just tasks assigned to them. Watch for early signs they're stuck in ambiguity about direction with no resolution in sight.",
        day60: "Watch for friction with more purpose-driven teammates who keep raising questions about direction after momentum is already established. Name the pattern early: they aren't closed-minded, they're protecting hard-won momentum, and that instinct is usually right. Frame any needed course-correction in terms of better outcomes, not abstract purpose.",
        day90: "They own a full initiative from plan through execution. They're using metrics that genuinely energize rather than just measure them. They have a structured, periodic check-in with someone purpose-driven, rather than ongoing direction oversight.",
      },
      partner: "A WHY-WHAT or WHY-HOW partner for periodic direction checks, or a HOW-WHY partner for depth and quality control on the details underneath their execution. Avoid too much unstructured purpose conversation early on, structured check-ins work better than open-ended ones.",
      misreadings: [
        { lead: "Read as closed-minded once momentum is set, actually protecting hard-won progress.", body: "A WHAT-HOW who resists reopening a direction question once execution is underway isn't being stubborn, they're protecting momentum that took real effort to build. The fix is framing any needed change in terms of concrete outcomes, not asking them to revisit purpose in the abstract." },
        { lead: "Read as impatient with purpose conversations, actually just oriented toward action.", body: "Their eagerness to move past strategic discussion into execution can read as dismissiveness. It isn't, purpose conversations genuinely aren't where their energy comes from, and that's a structural feature, not a lack of depth." },
      ],
    },
    newHire: {
      intro: "A guide to your own first 90 days on this team.",
      energize: {
        text: "You do your best work when you have a real plan you can start executing immediately, ideally with metrics you can track along the way. Ask for something concrete to move on rather than an open-ended strategy conversation. You'll know you're in the right zone when you're holding both the big picture and the details at the same time.",
        tryPhrase: "Can we agree on a plan and get moving? We can adjust as we go.” That's not impatience, that's how you get things done.",
      },
      drain: {
        text: "Open-ended visioning with no clear next step will drain you fast, even if the conversation itself is interesting. If you find yourself in extended ambiguity about direction with no timeline to resolve it, say so.",
      },
      days: {
        day30: "Confirm you have a real plan you own, with metrics attached, not just a list of assigned tasks. If you're stuck in ambiguity about direction, raise it and ask for a decision.",
        day60: "You may find friction with a more purpose-driven teammate who wants to revisit direction after you've already built momentum. That's not them being difficult, and it's not you being closed-minded either, it's a real tension worth naming directly. Ask them to frame any needed change in terms of outcomes, not abstract purpose.",
        day90: "You should own a full initiative from plan through execution, with metrics you're actually using. Set up a structured, periodic check-in with someone purpose-driven rather than open-ended direction conversations, that will serve you both better.",
      },
      worthKnowing: [
        { lead: "Resisting a direction change isn't the same as being stubborn.", body: "If you push back on revisiting a plan once you've built momentum, that's not closed-mindedness, you're protecting real progress. Ask for the case to be made in terms of outcomes, and you'll usually find you're more open than people expect." },
        { lead: "Wanting to skip the purpose conversation doesn't mean you lack depth.", body: "If strategic discussion feels like a detour from getting things done, that's a structural feature of how you're built, not a shortcoming. Let a purpose-driven partner hold that piece so you can stay focused on execution." },
      ],
    },
  },

  'how-why': {
    label: 'HOW–WHY',
    tagline: 'Precision-driven, purpose-oriented',
    manager: {
      intro: "A 90-day guide for the manager bringing a HOW-WHY hire onto the team.",
      energizing: {
        items: [
          "A genuinely hard problem with real autonomy over how to approach it",
          "Time and space to test and validate their thinking rigorously before committing",
          "Access to complex data or systems they can dig into and synthesize",
          "Recognition for spotting inefficiencies or improvements nobody else noticed",
        ],
        example: "giving them a known-broken process and real latitude to figure out why, rather than a prescribed fix to implement.",
      },
      draining: {
        items: [
          "Pressure to launch or deploy before their analysis feels complete",
          "A high-velocity, fast-moving environment with constant context-switching",
          "Being asked to present findings to a non-technical audience with no support",
          "Being forced to prioritize when everything feels equally unresolved",
        ],
        example: "being told to ship a recommendation by end of week when the analysis genuinely isn't done yet, with no room to explain why more time is needed.",
      },
      day1: [
        "Skip the fast-paced team tour, give them a real, complex problem to start digging into",
        "Grant real autonomy over their approach rather than a prescribed process to follow",
        "Set expectations that deployment milestones exist, but the path to them stays flexible",
        "Introduce them to whoever will help translate their findings for broader audiences",
        "Protect their calendar from unnecessary meetings in the first week",
      ],
      week1: [
        "A genuinely hard problem, not a simplified version of one",
        "Access to the real data or systems behind the problem, not summaries",
        "One clear deployment milestone they've agreed to, with the path left open",
        "Minimal process overhead so their time stays protected for deep work",
        "An early conversation about who will help translate their findings for non-technical audiences",
      ],
      checkins: {
        day30: "Ask what they've found so far and what's still being tested. Confirm they have real autonomy over their approach, not a prescribed process. Watch for early signs they're being pulled into fast-paced coordination work that doesn't fit their energy.",
        day60: "Watch for friction around shipping, particularly with more progress-oriented teammates pushing to deploy. Name the pattern early: they aren't stalling or perfectionist for its own sake, they're protecting quality until it's genuinely validated. Help set a concrete deployment milestone they can commit to without compromising the work.",
        day90: "They've solved or meaningfully improved something the team had assumed was fixed. They have a partner who builds delivery structure around their depth and creates urgency to actually ship. Their findings are starting to reach people outside their own function.",
      },
      partner: "A WHAT-WHY or WHAT-HOW partner who can build delivery structure around their depth and create the urgency to ship, or a WHY-WHAT partner to connect their findings to a compelling narrative for leadership. Avoid leaving them without a partner who can create forward motion, the best work risks staying internal indefinitely.",
      misreadings: [
        { lead: "Read as a perfectionist who won't ship, actually protecting quality until it's real.", body: "A HOW-WHY who keeps refining past the point others think is “done” isn't stalling, they're protecting against releasing something that hasn't actually been validated. The fix is a committed deployment milestone, not pressure to move faster than the work is ready for." },
        { lead: "Read as slow to communicate, actually thinking at a level of density others aren't used to.", body: "Their explanations can feel dense or hard to follow for less technical audiences. That's a translation gap, not a communication failure, and it's solved with a bridge, not by asking them to simplify their thinking." },
      ],
    },
    newHire: {
      intro: "A guide to your own first 90 days on this team.",
      energize: {
        text: "You do your best work with a genuinely hard problem and real autonomy over how you approach it. Ask for access to the real data or systems, not a summarized version. You'll know you're in the right zone when you're testing and validating your own thinking before committing to an answer.",
        tryPhrase: "I want to get this right before it goes out, can we agree on a milestone that gives me real room to validate it?” That's not you stalling, that's how your best work gets made.",
      },
      drain: {
        text: "Being pushed to ship before your analysis actually feels complete will cost you, even if you technically can hit the deadline. If you notice you're being pulled into a fast-moving environment with constant context-switching, say so.",
      },
      days: {
        day30: "Make sure you have real autonomy over your approach, not a prescribed process to follow. If you're being pulled into fast-paced coordination work that doesn't fit how you work best, name it early.",
        day60: "You may feel pressure from more progress-oriented teammates who want to ship before you feel ready. That's not you being a perfectionist, you're protecting quality until it's genuinely validated. Work with your manager to set a concrete deployment milestone you can actually commit to.",
        day90: "You should have meaningfully improved or solved something the team had assumed was fixed. Find a partner who's energized by momentum and can build the delivery structure that gets your work out into the world, since shipping isn't naturally where your energy goes.",
      },
      worthKnowing: [
        { lead: "Wanting more time doesn't make you a perfectionist.", body: "If you keep refining past the point others think is “done,” that's not stalling, you're protecting against releasing something that isn't actually validated yet. A committed deployment milestone will serve you better than open-ended pressure to move faster." },
        { lead: "Being hard to follow doesn't mean you're communicating poorly.", body: "If your explanations feel dense to less technical audiences, that's a translation gap, not a flaw in your thinking. Find a partner who can help bridge that gap rather than trying to simplify everything yourself." },
      ],
    },
  },

  'how-what': {
    label: 'HOW–WHAT',
    tagline: 'Precision-driven, progress-oriented',
    manager: {
      intro: "A 90-day guide for the manager bringing a HOW-WHAT hire onto the team.",
      energizing: {
        items: [
          "A real operational problem to sink into early, not a slow ramp of shadowing",
          "Access to real systems, real documentation, and the actual mess of how things currently work",
          "Ownership of something concrete they can build or fix, even something small, early",
          "Being asked to bring structure to something that currently lacks it",
        ],
        example: "handing them a messy handoff process to map and tighten in week one, rather than a week of shadowing meetings.",
      },
      draining: {
        items: [
          "A vague first few weeks framed around “getting to know the culture” with no operational substance",
          "Repeated exposure to unresolved strategy or purpose conversations before there's an operational problem attached",
          "Being asked to explain why a process matters before being allowed to just fix it",
          "Days full of context-building and relationship meetings with no task to point to",
        ],
        example: "a two-week “meet the company” tour with no assignment attached will read as stalling, not welcome.",
      },
      day1: [
        "Skip the company-vision deck as the centerpiece of the day",
        "Give them a real system or process to look at, even just to observe",
        "Set up the tools, documentation, and access they need to see how work actually gets done, not just hear about it",
        "Introduce them to whoever manages systems access that same day, so nothing blocks momentum in week one",
        "Point them to one specific artifact, a process doc, an architecture diagram, a runbook, they can dig into on their own",
      ],
      week1: [
        "A concrete first assignment, ideally one with a visible gap or inefficiency attached",
        "Access to whoever holds the institutional knowledge of how things currently run",
        "Clear scope boundaries, what's theirs to fix versus not yet, so early energy isn't spent guessing at permission",
        "A short list of the team's known inefficiencies or open technical debt, so they have somewhere to point their attention",
        "One scheduled 1:1 specifically to walk through how decisions get made and documented on this team",
      ],
      checkins: {
        day30: "Ask what's working operationally and what they've noticed that could be tightened. Ask what's felt most draining so far, and watch for too many vision or culture conversations relative to operational traction. Confirm they have a real piece of ownership by this point, not just observation.",
        day60: "Watch for friction with anyone purpose-oriented on the team who's asking them to revisit direction. Name the pattern early: they aren't resistant to change, they're protecting something they built that works. The conversation lands better framed as “here's specifically what isn't working” rather than “help us rethink this.” Confirm they haven't been pulled into pure coordination or status overhead at the expense of building.",
        day90: "They own a defined piece of operational territory. They've identified and are addressing at least one process gap without being asked to. They have an established partner relationship, someone purpose-oriented or progress-oriented, who keeps their work connected to outcomes and makes sure what they build actually gets deployed rather than endlessly refined.",
      },
      partner: "A WHY-WHAT or WHY-HOW partner for directional clarity, or a WHAT-WHY partner to translate their systems work into forward momentum. Avoid making their primary onboarding relationship another precision-oriented person, since neither supplies the outward-facing partner they need early on.",
      misreadings: [
        { lead: "Read as inflexible, actually protecting what works.", body: "A HOW-WHAT who pushes back on an early reorg or process change can get read as not a culture fit. That's a misread. They aren't resistant to change generally, they're protecting a functioning system, and they respond to being shown specifically and concretely what isn't working rather than being told abstractly that change is needed. Naming this pattern early, even in the interview debrief, keeps it from later reading as an attitude problem." },
        { lead: "Read as disengaged, actually outside their energizing orientation.", body: "A HOW-WHAT who goes quiet in early vision-setting or culture-focused meetings can get read as low energy or uninterested. That's also a misread. Purpose conversations sit outside what energizes them, not their level of investment, and the same person will show up fully present the moment the conversation turns operational. Don't judge their overall engagement by their pattern in one type of meeting." },
      ],
    },
    newHire: {
      intro: "A guide to your own first 90 days on this team.",
      energize: {
        text: "You do your best work when you have a real problem to sink into, not a slow orientation ramp. Ask for access to actual systems and documentation early, even messy ones, rather than a polished overview. If you're handed something small you can actually fix or build in your first weeks, take it, that's exactly the kind of early win that will make the rest of your ramp-up feel real instead of theoretical.",
        tryPhrase: "Is there something I can actually start working on?” That's not impatience, that's how you're built.",
      },
      drain: {
        text: "A few weeks of “getting to know the culture” with no task attached will start to feel like stalling, even if everyone means well. If you notice you're sitting in a lot of vision or values conversations with nothing operational to point to yet, say so.",
      },
      days: {
        day30: "Look for a real piece of ownership, something concrete, even if it's small. If you're still mostly observing by now, raise it with your manager rather than waiting for it to resolve on its own. You'll know it's going well if you've already noticed something that could be tightened.",
        day60: "You may find yourself in friction with someone more purpose- or vision-driven who wants to revisit a direction you thought was settled. That's not a sign something's wrong, it's just a different orientation meeting yours. You'll get further by asking what specifically isn't working than by asking them to justify the whole conversation. If you catch yourself pulled into a lot of status meetings and coordination instead of building, that's worth naming too.",
        day90: "By now you should have a defined piece of territory that's actually yours, and ideally you've already found and started fixing something nobody asked you to fix. Find one person on the team who's more outward-facing or progress-oriented, someone who can help translate what you're building into momentum and make sure it actually ships rather than getting endlessly refined. That partnership will make the next six months a lot easier.",
      },
      worthKnowing: [
        { lead: "Pushing back doesn't make you inflexible.", body: "If you push back on an early process change or reorg, some people may read that as not being on board. You're not, you're protecting something that works. You'll land the conversation better by pointing to something specific and concrete than by being asked to accept change in the abstract." },
        { lead: "Going quiet doesn't mean you're checked out.", body: "If you go quiet in a meeting that's mostly about vision or culture, that's not disengagement, it's just not where your energy lives. You'll show up fully the moment the conversation turns operational, and that's worth trusting about yourself." },
      ],
    },
  },
};

export default onboardingResources;
