import { useState, useEffect, useRef } from 'react';

// ── Data ─────────────────────────────────────────────────────────────────
// Ported verbatim from the approved reference build (session_architect_
// REFERENCE.html) — copy, orientation data, session templates, and
// facilitation techniques are the literal source of truth. Do not rephrase.

const ORIENTATIONS = [
  {id:"WHYWHAT", label:"WHY-WHAT", tag:"The Visionary Strategist", energy:"WHY", badge:"b-WHYWHAT",
    energizedBy:"Framing the problem, painting the future state, questioning whether this is even the right problem to solve.",
    bestUsedFor:"Opening the session. Kicking off ideation with a sharp prompt. Naming the vision the ideas should serve.",
    watchFor:"May want to skip to solutions before the problem is fully framed, and can lose interest once the group moves into detail."},
  {id:"WHYHOW", label:"WHY-HOW", tag:"The Systems Visionary", energy:"WHY",
    badge:"b-WHYHOW",
    energizedBy:"Finding the pattern across scattered ideas and seeing how the pieces connect into a system.",
    bestUsedFor:"Mid-session synthesis. Clustering ideas into real directions. Naming the insight the room hasn't said out loud yet.",
    watchFor:"Can over-analyze before committing to a direction, and needs a forcing function to move from insight to output."},
  {id:"WHATWHY", label:"WHAT-WHY", tag:"The Purpose-Driven Driver", energy:"WHAT",
    badge:"b-WHATWHY",
    energizedBy:"Momentum, fast rounds, and pushing the group past the first few obvious ideas.",
    bestUsedFor:"Running the diverge phase. Keeping energy up. Timeboxing rounds and rallying the room.",
    watchFor:"Can lose patience in long framing or detail discussions, and may rally the room around an idea before it is pressure-tested."},
  {id:"WHATHOW", label:"WHAT-HOW", tag:"The Iterative Executor", energy:"WHAT",
    badge:"b-WHATHOW",
    energizedBy:"Converting an idea into a concrete next step. Zooming into detail and back out fast.",
    bestUsedFor:"Closing the session. Defining the smallest testable version. Assigning owners and dates.",
    watchFor:"Drains if the session ends without a concrete action, and may push to lock a plan before direction is fully clear."},
  {id:"HOWWHY", label:"HOW-WHY", tag:"The Insightful Optimizer", energy:"HOW",
    badge:"b-HOWWHY",
    energizedBy:"Finding the flaw, the inefficiency, or the better way to do something.",
    bestUsedFor:"The scheduled precision pass. Stress-testing the finalists. Asking what breaks and why.",
    watchFor:"Can keep digging past the point of diminishing returns, and drains if asked to generate raw volume with nothing concrete yet."},
  {id:"HOWWHAT", label:"HOW-WHAT", tag:"The Operational Architect", energy:"HOW",
    badge:"b-HOWWHAT",
    energizedBy:"Mapping how something would actually run: sequencing, dependencies, structure.",
    bestUsedFor:"Turning the winning idea into a workable structure. Identifying what would break it operationally.",
    watchFor:"Can over-engineer given open-ended time, and drains in ambiguous, no-agenda ideation with nothing yet to organize."},
];

function A(name, purpose, materials, steps, tips, signal){
  return {name, purpose, materials, steps, tips, signal};
}

const TEMPLATES = {
  brainstorm: [
    {name:"Frame", energy:"WHY", pct:0.08, purpose:"State the problem and what good looks like.", openers:["WHYWHAT","WHYHOW"],
      activity:A("The How Might We Frame",
        "Turn a vague problem into a single, shared, energizing question everyone in the room is solving for.",
        ["Whiteboard or shared doc","Marker"],
        ["State the problem in one sentence: what's broken or missing, and for whom.",
         "Reframe it out loud as a question: \"How might we...?\"",
         "Ask the room: \"Does this feel like the right problem?\" Take 60 seconds of pushback before moving on.",
         "Write the final How Might We question somewhere everyone can see for the rest of the session.",
         "State what success looks like today: one idea, three directions, or a decision."],
        ["Let a WHY-primary lead this if one's in the room, they'll naturally want to interrogate whether it's the right problem, use that energy on purpose.",
         "Don't let this stretch past its time box. This block orients the room, it doesn't need to be perfect."],
        "Everyone in the room can repeat the How Might We question back in their own words.")},
    {name:"Diverge", energy:"WHAT", pct:0.40, purpose:"Generate volume, fast and loose. No critique yet.", openers:["WHATWHY","WHATHOW"],
      activity:A("Brainwrite 1-2-4-All",
        "Generate a high volume of ideas fast, without groupthink or premature critique shutting quieter voices down.",
        ["Sticky notes or a shared doc","A visible timer"],
        ["Silent (1): everyone writes as many ideas as possible alone, no talking, timed.",
         "Pairs (2): partner up, share ideas, and combine or build on each other's.",
         "Fours (4): merge into groups of four, pick the two or three strongest ideas to bring forward.",
         "All: each group posts its strongest ideas to the shared wall or doc.",
         "Capture only, don't debate yet. Note anything that makes the room say \"oh, that's interesting.\""],
        ["This format protects quieter and detail-oriented thinkers who need to write before they speak.",
         "Ban critique completely in this block, even a raised eyebrow can shut down momentum for a WHAT-primary mid-flow."],
        "More ideas are on the wall than the room could have generated through open discussion alone.")},
    {name:"Cluster & Connect", energy:"MIX", pct:0.17, purpose:"Group ideas into real directions; name the pattern.", openers:["WHYHOW"],
      activity:A("Affinity Mapping & Naming the Pattern",
        "Turn a wall of scattered ideas into two or three real, nameable directions worth pursuing.",
        ["The stickies or list from Diverge","Wall or shared doc space"],
        ["As a group, move similar ideas physically next to each other. Sorting first, talking second.",
         "Once natural clusters emerge, give each one a real name that captures its theme, not \"cluster 1.\"",
         "For each cluster, write one sentence: what's the underlying idea or bet this direction represents?",
         "Identify whether any cluster is clearly the strongest fit for the original How Might We question.",
         "Narrow to two or three clusters worth pressure-testing next."],
        ["Hand this to a WHY-HOW if one's present, this is exactly their energy: finding the system inside the mess.",
         "If no WHY-HOW is in the room, the facilitator should slow down and narrate the clustering logic out loud."],
        "The room can name each surviving direction in a sentence, not just point at a pile of stickies.")},
    {name:"Precision Pass", energy:"HOW", pct:0.20, purpose:"Scheduled, protected: stress-test the finalists.", openers:["HOWWHY","HOWWHAT"],
      activity:A("Break It Before They Do",
        "Stress-test the finalist directions before committing to one, without killing the room's momentum.",
        ["The two or three named directions from Cluster & Connect"],
        ["For each direction, ask: what would have to be true for this to work?",
         "Ask: what's the first thing that breaks, technically, operationally, or with a customer?",
         "Ask: what dependency, resource, or approval are we quietly assuming we have?",
         "Capture each risk next to its direction. Don't solve it yet, just name it clearly.",
         "Decide together: is this a real blocker, or a known risk we can carry forward?"],
        ["This is the block HOW-primaries have been waiting for, and it's their strongest contribution to the whole session.",
         "Protect this time slot fiercely. It's the first thing cut when a session runs long, and cutting it is how sessions ship broken ideas."],
        "Every surviving direction has at least one named risk and an explicit decision about whether it's a blocker.")},
    {name:"Close", energy:"WHAT", pct:0.15, purpose:"One action, one owner, one date, written in the room.", openers:["WHATHOW"],
      activity:A("The Closing Card",
        "Leave the room with one committed next step instead of a wall of unowned ideas.",
        ["One index card or doc entry per direction moving forward"],
        ["Confirm which direction (or directions) the room is moving forward with.",
         "Write down the one action, the owner, and the date.",
         "Read it out loud in the room before anyone leaves.",
         "Note anything explicitly parked, a good idea for later isn't lost, just deferred.",
         "Send the card to the whole group within the hour."],
        ["This is a WHAT-HOW's natural close, hand them the pen.",
         "Don't let the session end without this step. A rough commitment beats a polished idea with no owner."],
        "Everyone in the room can say who's doing what, by when, without checking notes.")},
  ],
  decision: [
    {name:"Frame", energy:"WHY", pct:0.10, purpose:"Name the decision being made and why it matters now.", openers:["WHYWHAT"],
      activity:A("The Decision Statement",
        "Make sure everyone in the room is deciding the same thing, for the same reason.",
        ["Whiteboard or shared doc"],
        ["State the decision as a single sentence: \"We are deciding whether to ______.\"",
         "State why now, what forces this decision today rather than later.",
         "State who owns the final call, even if the room is only advising.",
         "Confirm what \"decided\" looks like: a chosen option, a yes or no, a ranked list?"],
        ["WHY-WHAT primaries are strong here, they'll naturally test whether this is even the right decision to be making right now."],
        "No one asks \"wait, what are we actually deciding?\" later in the session.")},
    {name:"Lay Out Options", energy:"WHAT", pct:0.30, purpose:"Present the real choices, not a fresh brainstorm.", openers:["WHATWHY","WHYWHAT"],
      activity:A("Options on the Table",
        "Get every real option fully visible before evaluating any of them.",
        ["One card or doc section per option"],
        ["Give each option its own card: name, one-line description, who's proposing it.",
         "For each, state the case for it in one or two sentences. No debate yet.",
         "Add any option someone else raises, even late, don't let the list close prematurely.",
         "Confirm as a group: is this the full set of real options, or are we missing one?"],
        ["WHAT-WHY primaries move this fast, use them to keep it moving without letting it collapse into a two-option debate too early."],
        "Three or more real options are on the table, each understandable in a single read.")},
    {name:"Precision Pass", energy:"HOW", pct:0.30, purpose:"Risk and dependency pass on each option.", openers:["HOWWHY","HOWWHAT"],
      activity:A("Pre-Mortem Pass",
        "Imagine each option has already failed, and work backward to find out why.",
        ["The full option list from the previous block"],
        ["For each option, say out loud: \"It's six months from now and this decision was wrong. Why?\"",
         "Capture every reason offered, however uncomfortable, without defending the option.",
         "Rate each reason: likely and serious, unlikely, or already mitigated.",
         "Note which option survives this pass with the fewest serious, likely risks."],
        ["This is HOW-WHY and HOW-WHAT territory, they'll find the failure mode the room's optimism is hiding.",
         "Don't let anyone defend an option during this pass, that's a different conversation for a different block."],
        "Every option has a named list of real risks, not just a vague \"seems fine.\"")},
    {name:"Decide & Close", energy:"WHAT", pct:0.30, purpose:"Make the call, assign the owner, write it down.", openers:["WHATHOW"],
      activity:A("The Decision Card",
        "Convert analysis into an actual, owned decision instead of another round of discussion.",
        ["The pre-mortem findings"],
        ["State the chosen option out loud, and why, referencing the pre-mortem findings directly.",
         "Write down what happens next, who owns it, and by when.",
         "Name one signal that would tell the room this decision needs revisiting.",
         "Confirm the decision owner is genuinely comfortable being accountable for it."],
        ["WHAT-HOW primaries close this well, they want the room to leave with clarity, not more open questions."],
        "The decision, its owner, and the next step are all written down before the room disperses.")},
  ],
  planning: [
    {name:"Purpose Frame", energy:"WHY", pct:0.15, purpose:"Why this project, what it serves.", openers:["WHYWHAT","WHYHOW"],
      activity:A("The Five-Question Purpose Brief",
        "Ground the plan in why it matters before anyone plans a single task.",
        ["Whiteboard or shared doc"],
        ["Why does this project exist, what problem does it solve?",
         "Who is it for, and what changes for them when it's done?",
         "What does success look like, in one sentence?",
         "What's explicitly out of scope?",
         "What happens if we don't do this?"],
        ["A WHY-primary should lead this, it's exactly their energy.",
         "Keep it tight, five questions in the allotted time. This is a frame, not a strategy session."],
        "Everyone can state the project's purpose in their own words afterward.")},
    {name:"Milestones", energy:"WHAT", pct:0.25, purpose:"The big markers of progress.", openers:["WHATWHY"],
      activity:A("Milestone Backplan",
        "Work backward from the finish line to the big markers of progress that get you there.",
        ["Whiteboard or shared doc with a timeline"],
        ["State the end date or finish condition.",
         "Working backward, name the three to five big milestones that have to happen before that finish.",
         "For each milestone, put a rough date on it.",
         "Check: is there a milestone in the next two weeks? If not, add one, momentum needs an early marker."],
        ["WHAT-WHY primaries are energized by this, momentum and clear markers are their native language."],
        "A visible, dated sequence of three to five milestones the whole room agrees on.")},
    {name:"Task Breakdown", energy:"HOW", pct:0.35, purpose:"What has to actually happen, sequencing, dependencies.", openers:["HOWWHAT","HOWWHY"],
      activity:A("Vision to Task Decomposition",
        "Turn each milestone into the concrete tasks that actually get it done.",
        ["The milestone list from the previous block"],
        ["Take one milestone at a time.",
         "List every task required to hit it. Don't worry about order yet, just capture.",
         "Note dependencies: what has to happen before what.",
         "Flag any task with an unclear owner or unclear scope.",
         "Repeat for each milestone."],
        ["This is HOW-primary home turf, give them the pen and the extra time.",
         "Don't let a WHAT-primary rush this, the whole point is surfacing what speed would have missed."],
        "Every milestone has a task list with no orphaned or ownerless items.")},
    {name:"Commitments Close", energy:"WHAT", pct:0.25, purpose:"Owners, dates, first step.", openers:["WHATHOW"],
      activity:A("The Handoff Contract",
        "Make sure every task has a clear owner who has actually agreed to it, not just been assigned it.",
        ["The task list from the previous block"],
        ["For each task, confirm the owner by name, out loud, not just by default.",
         "Confirm the owner has what they need to start, or name what's missing.",
         "Set the first check-in date for the project.",
         "Write and send a one-page summary: milestones, owners, first check-in."],
        ["WHAT-HOW primaries thrive here, they want the plan converted into action before the room disperses."],
        "Every task has a named, confirmed owner, and the next check-in is on the calendar.")},
  ],
  retro: [
    {name:"Frame", energy:"WHY", pct:0.10, purpose:"Purpose of the retro and psychological safety.", openers:["WHYWHAT","WHYHOW"],
      activity:A("Purpose & Safety Frame",
        "Set the retro up to examine the system, not to assign blame to a person.",
        ["Whiteboard or shared doc"],
        ["State the purpose out loud: we're here to make the next cycle better, not to relitigate this one.",
         "Set one ground rule: assume good intent, focus on the system, not the person.",
         "Name the time period or project being reviewed.",
         "Confirm what \"done\" looks like for this retro: a list of actions, not just a conversation."],
        ["A WHY-primary sets this tone well, purpose and safety are their instinct."],
        "The room visibly relaxes, people start naming real problems without hedging.")},
    {name:"What Happened", energy:"WHAT", pct:0.25, purpose:"Facts, data, timeline.", openers:["WHATHOW","WHATWHY"],
      activity:A("Timeline Reconstruction",
        "Build a shared, factual account of what happened before anyone starts interpreting it.",
        ["Whiteboard or shared doc, laid out as a timeline"],
        ["As a group, build a timeline of what actually happened: dates and events only.",
         "No \"why\" and no blame yet, just facts: what happened, and when.",
         "Fill gaps: does anyone remember something missing from the timeline?",
         "Mark the moments where things went well, not only where they went wrong."],
        ["WHAT and HOW primaries anchor this well, they tend to remember the sequence and the detail."],
        "A timeline the whole room agrees is accurate, before any analysis starts.")},
    {name:"Patterns & Root Causes", energy:"MIX", pct:0.30, purpose:"Why did this happen, what's the pattern.", openers:["WHYHOW","HOWWHY"],
      activity:A("Root Cause Pattern Mapping",
        "Find the underlying pattern behind the events, not just the story of this one instance.",
        ["The timeline from the previous block"],
        ["Pick two or three key moments from the timeline, both good and bad.",
         "For each, ask \"why\" repeatedly, three to five times, until you hit a systemic cause, not a person.",
         "Look across the moments: is there a shared root cause?",
         "Name the pattern in one sentence."],
        ["WHY-HOW and HOW-WHY primaries are built for this, give them room to dig.",
         "Don't let the room settle for the first surface-level answer."],
        "The room identifies at least one systemic pattern, not just a list of individual incidents.")},
    {name:"Actions Close", energy:"WHAT", pct:0.35, purpose:"Concrete changes, owners.", openers:["WHATHOW"],
      activity:A("Action Commitment Card",
        "Convert the pattern into a concrete, owned change for next time.",
        ["The root causes from the previous block"],
        ["For each root cause identified, propose one concrete change to prevent it recurring.",
         "Assign an owner and a date for each change.",
         "Pick one change the team explicitly commits to revisiting at the next retro.",
         "Send the list to the whole team within the day."],
        ["WHAT-HOW primaries close this well, they want the retro to produce something that actually changes next cycle."],
        "A short list of owned, dated changes, not a vague \"we'll do better.\"")},
  ],
};

const TECHNIQUES = [
  ["Rotate who opens each block by primary orientation.", "Visibly not always the same person driving changes who feels ownership of the outcome."],
  ["Pre-assign roles transparently.", "Tell the WHY-primary they're framing, tell the HOW-primary their pass is scheduled for minute 30. Knowing their turn is coming stops HOW-primaries from fighting for airtime early or derailing divergence with premature objections."],
  ["Use silent brainwriting before verbal rounds.", "Pure verbal brainstorming favors WHAT-primaries by default. A few minutes of silent writing first gives HOW-heavy and WHY-heavy thinkers room to process before they speak."],
  ["Separate generate from evaluate, physically.", "Different rooms, different colored notes, whatever makes it visible. Mixing them is what makes HOW-primaries drain WHY and WHAT-primaries by critiquing too early, and what makes WHAT-primaries feel like the session never lands."],
  ["Protect the precision pass fiercely.", "It is the first block cut when time runs short, and cutting it is how sessions ship broken decisions."],
  ["Close with a written commitment every time.", "One action, one owner, one date, written in the room. This is what makes WHAT-HOW and WHAT-WHY attendees leave energized instead of drained."],
];


const SESSION_TYPE_LABELS = {
  brainstorm: "Brainstorm / Ideation",
  decision: "Decision-Making",
  planning: "Planning / Kickoff",
  retro: "Retrospective",
};

function orientationLabel(id) {
  return ORIENTATIONS.find(o => o.id === id).label;
}

function findOpener(roster, orientationIds) {
  for (const id of orientationIds) {
    if (roster[id] && roster[id].length) {
      return { name: roster[id][0], id };
    }
  }
  return null;
}

// The saved-team dashboard on this page stores each participant's type as
// "WHY-WHAT" (hyphenated, matching pages/workshop/index.js's TYPES array);
// Session Architect's own ORIENTATIONS array (ported verbatim from the
// reference build) uses "WHYWHAT" (no hyphen). This is the only adapter
// needed to auto-fill the roster from a team that's already been entered,
// instead of asking the user to retype names the page already has.
function rosterTextFromParticipants(participants) {
  const grouped = {};
  ORIENTATIONS.forEach(o => { grouped[o.id] = []; });
  (participants || []).forEach(p => {
    const id = (p.type || '').replace('-', '');
    if (grouped[id]) grouped[id].push(p.name);
  });
  const text = {};
  ORIENTATIONS.forEach(o => { text[o.id] = grouped[o.id].join(', '); });
  return text;
}

function parseRoster(rosterText) {
  const roster = {};
  ORIENTATIONS.forEach(o => {
    const val = (rosterText[o.id] || '').trim();
    roster[o.id] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
  });
  return roster;
}

const SA_CSS = `
  .sa-root{font-family:"DM Sans",-apple-system,sans-serif;color:#1E293B;}
  .sa-hero{background:#0F172A;color:#fff;padding:28px 24px;border-radius:8px;margin-bottom:28px;}
  .sa-hero p{margin:8px 0 0;color:#A7F3D0;font-size:0.92rem;max-width:640px;line-height:1.5;}
  .sa-section-title{font-family:"Caveat",cursive;font-weight:700;font-size:1.7rem;color:#065F46;margin:32px 0 4px;}
  .sa-section-sub{color:#64748B;font-size:0.88rem;margin:0 0 16px;line-height:1.5;}
  .sa-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:14px;}
  .sa-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .sa-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  @media (max-width:700px){.sa-grid2,.sa-grid3{grid-template-columns:1fr;}}
  .sa-label{display:block;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#059669;margin-bottom:6px;}
  .sa-select,.sa-input{width:100%;padding:9px 10px;border:1px solid #E2E8F0;border-radius:8px;font-family:"DM Sans";font-size:0.9rem;background:#fff;color:#1E293B;}
  .sa-roster-row{display:grid;grid-template-columns:150px 1fr;gap:10px;align-items:center;margin-bottom:10px;}
  .sa-roster-row .sa-badge-label{font-size:0.76rem;font-weight:600;padding:5px 8px;border-radius:6px;text-align:center;}
  .sa-b-WHYWHAT,.sa-b-WHYHOW{background:#DCFCE7;color:#065F46;}
  .sa-b-WHATWHY,.sa-b-WHATHOW{background:#DBEAFE;color:#1E40AF;}
  .sa-b-HOWWHY,.sa-b-HOWWHAT{background:#FEF3C7;color:#92400E;}
  .sa-btn{font-family:"DM Sans";font-weight:600;font-size:0.9rem;cursor:pointer;border-radius:8px;padding:11px 20px;border:none;}
  .sa-btn-primary{background:#059669;color:#fff;}
  .sa-btn-primary:hover{background:#065F46;}
  .sa-btn-primary:disabled{opacity:0.55;cursor:not-allowed;}
  .sa-btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;}
  .sa-agenda-block{display:grid;grid-template-columns:70px 4px 1fr;gap:14px;margin-bottom:2px;}
  .sa-ab-time{font-weight:600;font-size:0.83rem;color:#64748B;padding-top:14px;}
  .sa-ab-bar{border-radius:4px;}
  .sa-bar-WHY{background:#6EE7B7;}
  .sa-bar-WHAT{background:#93C5FD;}
  .sa-bar-HOW{background:#FCD34D;}
  .sa-bar-MIX{background:linear-gradient(#6EE7B7,#FCD34D);}
  .sa-ab-content{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;margin-bottom:14px;}
  .sa-ab-content h4{margin:0 0 4px;font-size:1rem;}
  .sa-ab-content .sa-activity-name{font-size:0.83rem;font-weight:600;color:#065F46;margin:0 0 6px;}
  .sa-ab-content .sa-purpose{color:#64748B;font-size:0.86rem;margin:0 0 8px;}
  .sa-ab-content .sa-opener{font-size:0.83rem;font-weight:500;display:block;}
  .sa-opener-set{color:#065F46;}
  .sa-opener-missing{color:#B45309;}
  .sa-role-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px;}
  .sa-role-card h4{margin:0 0 2px;font-size:1rem;}
  .sa-role-card .sa-tag{font-size:0.78rem;color:#64748B;margin:0 0 10px;font-style:italic;}
  .sa-role-card p{margin:0 0 8px;font-size:0.85rem;}
  .sa-role-card .sa-lbl{font-weight:600;color:#059669;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.03em;}
  .sa-tech-list{padding-left:0;list-style:none;margin:0;}
  .sa-tech-list li{padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:0.88rem;}
  .sa-tech-list li:last-child{border-bottom:none;}
  .sa-tech-list b{color:#065F46;}
  .sa-activity-sheet{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:24px 26px;margin-bottom:18px;}
  .sa-as-eyebrow{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#059669;margin:0 0 4px;}
  .sa-as-title{font-size:1.28rem;font-weight:700;margin:0 0 4px;}
  .sa-as-purpose{font-size:0.92rem;color:#64748B;margin:0 0 16px;font-style:italic;}
  .sa-as-metarow{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:16px;padding:10px 14px;background:#F1F5F9;border-radius:8px;}
  .sa-as-meta{font-size:0.8rem;}
  .sa-as-meta b{display:block;font-size:0.68rem;text-transform:uppercase;letter-spacing:0.04em;color:#059669;margin-bottom:2px;}
  .sa-as-h{font-size:0.76rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#065F46;margin:16px 0 8px;border-bottom:2px solid #E2E8F0;padding-bottom:4px;}
  .sa-as-steps{margin:0;padding-left:0;list-style:none;counter-reset:sastepnum;}
  .sa-as-steps li{counter-increment:sastepnum;padding:7px 0 7px 34px;position:relative;font-size:0.9rem;}
  .sa-as-steps li::before{content:counter(sastepnum);position:absolute;left:0;top:6px;background:#059669;color:#fff;width:22px;height:22px;border-radius:50%;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;}
  .sa-as-tips{margin:0;padding-left:18px;font-size:0.86rem;}
  .sa-as-tips li{margin-bottom:5px;}
  .sa-as-signal{margin-top:16px;padding:10px 14px;background:#FFFBEB;border:1px solid #E9D8A6;border-radius:8px;font-size:0.86rem;}
  .sa-as-signal b{color:#065F46;}
  .sa-empty-note{color:#64748B;font-size:0.88rem;}
`;

function RosterRow({ o, value, onChange }) {
  const inputId = `sa-roster-${o.id}`;
  return (
    <div className="sa-roster-row">
      <label htmlFor={inputId} className={`sa-badge-label sa-b-${o.id}`}>{o.label}</label>
      <input
        type="text"
        id={inputId}
        className="sa-input"
        placeholder="e.g. Maria, James"
        value={value}
        onChange={e => onChange(o.id, e.target.value)}
      />
    </div>
  );
}

function ActivitySheet({ block }) {
  const a = block.activity;
  return (
    <div className="sa-activity-sheet">
      <p className="sa-as-eyebrow">Curio Session Architect &middot; Activity Sheet</p>
      <h3 className="sa-as-title">{a.name}</h3>
      <p className="sa-as-purpose">{a.purpose}</p>
      <div className="sa-as-metarow">
        <div className="sa-as-meta"><b>Agenda block</b>{block.name} ({block.start}&ndash;{block.end} min)</div>
        <div className="sa-as-meta"><b>Energy</b>{block.energy === "MIX" ? "WHY + HOW" : block.energy}</div>
        <div className="sa-as-meta"><b>Materials</b>{a.materials.join(", ")}</div>
      </div>
      <p className="sa-as-h">Steps</p>
      <ol className="sa-as-steps">{a.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      <p className="sa-as-h">Facilitator tips</p>
      <ul className="sa-as-tips">{a.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
      <div className="sa-as-signal"><b>You&apos;ll know it worked when:</b> {a.signal}</div>
    </div>
  );
}

export default function SessionArchitect({ participants }) {
  const [rosterText, setRosterText] = useState(() => rosterTextFromParticipants(participants));
  const [sessionType, setSessionType] = useState("brainstorm");
  const [duration, setDuration] = useState(60);
  const [result, setResult] = useState(null);
  const [pdfBuilding, setPdfBuilding] = useState(false);
  const outputRef = useRef(null);

  // Re-seed the roster whenever the active team changes, so switching teams
  // in the sidebar doesn't leave a stale roster from a different team.
  // Free-text edits made afterward are the user's own and aren't clobbered
  // by this effect (it only fires on a real participants-list change).
  useEffect(() => {
    setRosterText(rosterTextFromParticipants(participants));
  }, [participants]);

  function updateRoster(id, value) {
    setRosterText(r => ({ ...r, [id]: value }));
  }

  function handleGenerate() {
    const roster = parseRoster(rosterText);
    const blocksData = TEMPLATES[sessionType];
    let elapsed = 0;
    const blocks = blocksData.map(b => {
      let mins = Math.round((b.pct * duration) / 5) * 5;
      if (mins < 5) mins = 5;
      const start = elapsed;
      elapsed += mins;
      const opener = findOpener(roster, b.openers);
      return { ...b, start, end: elapsed, opener };
    });
    const present = ORIENTATIONS.filter(o => roster[o.id] && roster[o.id].length);

    setResult({
      typeLabel: SESSION_TYPE_LABELS[sessionType],
      typeSlug: sessionType,
      totalMin: duration,
      blocks,
      roster,
      present,
    });

    requestAnimationFrame(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfBuilding(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 54;
      const maxW = pageW - margin * 2;
      let y;

      function pageBreakIfNeeded(nextBlockHeight) {
        if (y + nextBlockHeight > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      }

      // Cover / agenda overview page
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold"); doc.setFontSize(20);
      doc.text("Curio Session Architect", margin, 60);
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`${result.typeLabel} — ${result.totalMin} minutes`, margin, 80);
      doc.setTextColor(15, 23, 42);

      y = 116;
      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.text("Agenda", margin, y);
      y += 22;

      result.blocks.forEach(b => {
        pageBreakIfNeeded(50);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text(`${b.start}–${b.end} min   ${b.name}`, margin, y);
        y += 15;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.setTextColor(5, 150, 105);
        doc.text(`Activity: ${b.activity.name}`, margin + 10, y);
        doc.setTextColor(15, 23, 42);
        y += 14;
        const lines = doc.splitTextToSize(b.purpose, maxW - 10);
        doc.text(lines, margin + 10, y);
        y += lines.length * 12 + 16;
      });

      // One page per activity
      result.blocks.forEach(b => {
        doc.addPage();
        y = margin;
        const a = b.activity;

        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.setTextColor(5, 150, 105);
        doc.text("CURIO SESSION ARCHITECT · ACTIVITY SHEET", margin, y);
        doc.setTextColor(15, 23, 42);
        y += 24;

        doc.setFont("helvetica", "bold"); doc.setFontSize(18);
        doc.text(a.name, margin, y);
        y += 22;

        doc.setFont("helvetica", "italic"); doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        const purposeLines = doc.splitTextToSize(a.purpose, maxW);
        doc.text(purposeLines, margin, y);
        doc.setTextColor(15, 23, 42);
        y += purposeLines.length * 14 + 14;

        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(241, 245, 249);
        const metaLines = doc.splitTextToSize(
          `Agenda block: ${b.name} (${b.start}–${b.end} min)     Energy: ${b.energy === "MIX" ? "WHY + HOW" : b.energy}     Materials: ${a.materials.join(", ")}`,
          maxW - 20
        );
        const metaH = metaLines.length * 13 + 16;
        doc.rect(margin, y - 12, maxW, metaH, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.text(metaLines, margin + 10, y);
        y += metaH + 14;

        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.setTextColor(6, 95, 70);
        doc.text("STEPS", margin, y);
        doc.setTextColor(15, 23, 42);
        y += 18;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
        a.steps.forEach((s, i) => {
          const lines = doc.splitTextToSize(`${i + 1}.  ${s}`, maxW - 10);
          pageBreakIfNeeded(lines.length * 13 + 8);
          doc.text(lines, margin, y);
          y += lines.length * 13 + 7;
        });
        y += 6;

        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.setTextColor(6, 95, 70);
        pageBreakIfNeeded(20);
        doc.text("FACILITATOR TIPS", margin, y);
        doc.setTextColor(15, 23, 42);
        y += 18;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
        a.tips.forEach(t => {
          const lines = doc.splitTextToSize(`•  ${t}`, maxW - 10);
          pageBreakIfNeeded(lines.length * 13 + 8);
          doc.text(lines, margin, y);
          y += lines.length * 13 + 7;
        });
        y += 10;

        const signalLines = doc.splitTextToSize(`YOU'LL KNOW IT WORKED WHEN:  ${a.signal}`, maxW - 24);
        const signalH = signalLines.length * 13 + 20;
        pageBreakIfNeeded(signalH);
        doc.setDrawColor(233, 216, 166);
        doc.setFillColor(255, 251, 235);
        doc.rect(margin, y - 14, maxW, signalH, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(signalLines, margin + 12, y);
      });

      doc.save(`curio-session-${result.typeSlug}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Couldn't build the PDF. Please try again.");
    } finally {
      setPdfBuilding(false);
    }
  }

  return (
    <div className="sa-root">
      <style>{SA_CSS}</style>

      <div className="sa-hero">
        <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: "1.8rem" }}>Session Architect</p>
        <p>Build a facilitated session sequenced through all three orientations on purpose, with a specific, runnable activity for every block.</p>
      </div>

      <h3 className="sa-section-title">1. Room composition</h3>
      <p className="sa-section-sub">Enter attendee names under their primary-secondary orientation. Leave a field blank if no one in that orientation is in the room, the tool will flag where you need to open a block yourself.</p>
      <div className="sa-card">
        {ORIENTATIONS.map(o => (
          <RosterRow key={o.id} o={o} value={rosterText[o.id] || ""} onChange={updateRoster} />
        ))}
      </div>

      <h3 className="sa-section-title">2. Session shape</h3>
      <p className="sa-section-sub">What kind of session, and how much time do you have.</p>
      <div className="sa-card">
        <div className="sa-grid2">
          <div>
            <label className="sa-label" htmlFor="sa-sessionType">Session type</label>
            <select id="sa-sessionType" className="sa-select" value={sessionType} onChange={e => setSessionType(e.target.value)}>
              <option value="brainstorm">Brainstorm / Ideation</option>
              <option value="decision">Decision-Making</option>
              <option value="planning">Planning / Kickoff</option>
              <option value="retro">Retrospective</option>
            </select>
          </div>
          <div>
            <label className="sa-label" htmlFor="sa-duration">Total time</label>
            <select id="sa-duration" className="sa-select" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))}>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={180}>Half day (~3 hours)</option>
            </select>
          </div>
        </div>
        <div className="sa-btn-row">
          <button className="sa-btn sa-btn-primary" onClick={handleGenerate}>Build the session</button>
          <button className="sa-btn sa-btn-primary" onClick={handleDownloadPDF} disabled={!result || pdfBuilding}>
            {pdfBuilding ? "Building PDF…" : "Download PDF"}
          </button>
        </div>
      </div>

      {result && (
        <div ref={outputRef}>
          <h3 className="sa-section-title">3. Your agenda</h3>
          <p className="sa-section-sub">Publish these blocks in the invite. When people know their turn is coming, they stop fighting for airtime early and stop drifting when it isn&apos;t.</p>
          <div>
            {result.blocks.map((b, i) => (
              <div className="sa-agenda-block" key={i}>
                <div className="sa-ab-time">{b.start}&ndash;{b.end} min</div>
                <div className={`sa-ab-bar sa-bar-${b.energy}`} />
                <div className="sa-ab-content">
                  <h4>{b.name}</h4>
                  <p className="sa-activity-name">Activity: {b.activity.name}</p>
                  <p className="sa-purpose">{b.purpose}</p>
                  {b.opener ? (
                    <span className="sa-opener sa-opener-set">Suggested opener: {b.opener.name} ({orientationLabel(b.opener.id)})</span>
                  ) : (
                    <span className="sa-opener sa-opener-missing">No one in this orientation is in the room. Plan to open this block yourself, deliberately.</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 className="sa-section-title">Room watch-fors</h3>
          <p className="sa-section-sub">Quick reference for who&apos;s in the room today, condensed for this session.</p>
          <div className="sa-grid2">
            {result.present.length === 0 ? (
              <p className="sa-empty-note">Add names to the roster above to see watch-fors for the specific people in your room.</p>
            ) : (
              result.present.map(o => (
                <div className="sa-role-card" key={o.id}>
                  <h4>{result.roster[o.id].join(", ")}</h4>
                  <p className="sa-tag">{o.label} &middot; {o.tag}</p>
                  <p><span className="sa-lbl">Give them</span><br />{o.bestUsedFor}</p>
                  <p><span className="sa-lbl">Watch for</span><br />{o.watchFor}</p>
                </div>
              ))
            )}
          </div>

          <h3 className="sa-section-title">4. Activity sheets</h3>
          <p className="sa-section-sub">One page per block, included in the PDF download for whoever&apos;s running each part of the session.</p>
          <div>
            {result.blocks.map((b, i) => <ActivitySheet block={b} key={i} />)}
          </div>
        </div>
      )}

      <h3 className="sa-section-title">Orientation reference</h3>
      <p className="sa-section-sub">What each combination is energized by in a facilitated session, and where they&apos;ll drain if misused. Always visible, useful even before you know who&apos;s in the room.</p>
      <div className="sa-grid3">
        {ORIENTATIONS.map(o => (
          <div className="sa-role-card" key={o.id}>
            <h4>{o.label}</h4>
            <p className="sa-tag">{o.tag}</p>
            <p><span className="sa-lbl">Energized by</span><br />{o.energizedBy}</p>
            <p><span className="sa-lbl">Best used for</span><br />{o.bestUsedFor}</p>
            <p><span className="sa-lbl">Watch for</span><br />{o.watchFor}</p>
          </div>
        ))}
      </div>

      <h3 className="sa-section-title">Facilitation techniques</h3>
      <p className="sa-section-sub">Structural moves that make the agenda actually work in the room.</p>
      <div className="sa-card">
        <ul className="sa-tech-list">
          {TECHNIQUES.map((t, i) => <li key={i}><b>{t[0]}</b> {t[1]}</li>)}
        </ul>
      </div>
    </div>
  );
}
