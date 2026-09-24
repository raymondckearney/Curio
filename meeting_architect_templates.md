# meeting_architect_templates.md
### Reference content for Meeting Architect — load this in full at request time, same pattern as the MindPrint AI Source of Truth

This document is the baseline for all seven meeting types. The system
prompt injects it verbatim. The model's job is to bend these baselines
around the user's stated objectives and challenges, not invent new
structures from scratch, and not invent tools that aren't listed here.

Each block below carries a `pct` weight, its share of total meeting time.
These are Ray's working numbers, adjust only with his sign-off, they
determine how the agenda actually feels to run. Weights within a meeting
type always sum to 1.0.

---

## 1. Weekly Status Meeting

**Input mode:** Roster
**Default purpose:** Fast sync on where things stand and what's blocked. Not a place to solve problems live.

**Async before:** Each owner posts a 3-line status (done / next / blocked) before the meeting. This is where detail-oriented thinkers do their best thinking, structured space, no live pressure.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Blockers only, skip anything not stuck | WHAT | 0.40 |
| Name what's actually unblocking each one | HOW | 0.35 |
| Close: who owns unblocking what | WHAT | 0.25 |

**Role notes:** A WHAT-primary should run this and keep it moving. HOW-primaries do their best detail work in the async post, so point that depth there and keep live time on blockers. WHY-primaries often don't need to be in the room at all unless a blocker touches strategy.

**Structural parts for lean-in / get-help mapping:**
- Keep it moving, don't let it become a task readout — WHAT
- Get precise on what's actually blocking, not just that something is — HOW

**Working when:**
- Consistently ends early
- Most of the room could skip it and not miss anything they needed live
- Blockers get owners, not just sympathy

**Failing when:**
- Consistently runs long every week
- Same two people talk while everyone else reads email
- A blocker gets raised three weeks running with no owner

---

## 2. Team Meeting

**Input mode:** Roster
**Default purpose:** Actual discussion and problem-solving space, the thing a status meeting shouldn't be used for.

**Async before:** Anyone can submit a discussion topic in advance, so the room isn't guessing.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Brief context opener: why this matters this week | WHY | 0.10 |
| Timeboxed discussion per topic | WHAT | 0.65 |
| Close with named actions | HOW | 0.25 |

**Role notes:** Use silent brainwriting for open topics so every orientation gets its ideas in, not just whoever speaks up fastest. Give HOW-primaries a specific topic slot where their depth has room to land, rather than competing for open floor time.

**Structural parts for lean-in / get-help mapping:**
- Frame why the discussion matters before diving in — WHY
- Facilitate so quieter voices actually get in — WHAT
- Push each topic to a real, specific action — HOW

**Working when:**
- The agenda has real topics most weeks, not left empty
- More than two people are talking
- Actions from last week visibly got done

**Failing when:**
- The agenda is always empty, so it defaults back to status
- Same person raises every topic
- No topic is ever timeboxed, so the meeting creeps

---

## 3. Leadership / Stakeholder Update

**Input mode:** Roster
**Default purpose:** Give leadership what they need to trust the work and unblock what's stuck. Not a play-by-play.

**Async before:** A one-page pre-read (situation, progress, risk, ask) sent 24 hours ahead, so live time is discussion, not delivery.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Headline / so-what | WHY | 0.15 |
| The one or two things that actually need a decision or unblock | WHY | 0.55 |
| Deeper detail, only if pulled in, not presented by default | HOW | 0.15 |
| Close: confirm what was decided and who owns it | WHAT | 0.15 |

**Role notes:** This follows The Mixed-Audience Deck Structure from the Tertiary Support Library. A HOW-primary presenter's thoroughness belongs in the pre-read, where leadership can take it in at their own pace, which frees live time for the decision. If no one pulls in detail, those minutes end the meeting early.

**Structural parts for lean-in / get-help mapping:**
- Lead with why this matters to them, not what was built — WHY
- Keep the pace brisk, leave the full walkthrough to the pre-read — WHAT
- Hold real detail in reserve, precise if pulled in — HOW

**Working when:**
- Leadership leaves having made the decision they were needed for
- The pre-read gets read before the meeting
- Questions are about the ask, not the detail

**Failing when:**
- The meeting runs long because detail creeps back in
- Leadership leaves without making the decision they were needed for
- Feels like a defense of the work rather than an update on it

---

## 4. 1:1

**Input mode:** Single Relationship
**Default purpose:** The one recurring meeting that should genuinely flex per person, same manager, different natural agenda depending on who's across the table.

**Async before:** Status lives in an async post beforehand, so live time opens with something other than status.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Open with what matters to them, not a task list | WHY | 0.20 |
| The one thing that matters most this week | WHAT | 0.40 |
| Go as deep as they need, not as deep as you default to | HOW | 0.40 |

**Role notes, by report's orientation:**
- WHY-primary report: open with purpose or context, they'll disengage from a pure task checklist.
- WHAT-primary report: open with wins and momentum, keep the pace brisk, they'll get impatient in a slow reflective conversation.
- HOW-primary report: let them go deep on one thing rather than skim five, a rushed high-level pass leaves them unsatisfied.

The manager's own orientation is their default 1:1 style, and it's probably not every report's preferred one. A WHAT-primary manager can give a HOW-primary report the unhurried time they need by setting aside one topic to go deep on. A HOW-primary manager can put their preparation into one or two sharp questions rather than a full agenda, since a WHAT-primary report mostly wants to talk through what's live right now.

**Structural parts for lean-in / get-help mapping:**
- Open in the style that energizes this specific report — WHY
- Match their pace, brisk or unhurried — WHAT
- Go deep where they need depth, don't rush it — HOW

**Working when:**
- The report leaves with a commitment, not just a conversation
- It rarely gets cancelled, even when the calendar is tight
- The manager can recall last week's conversation without checking notes

**Failing when:**
- 1:1s are the first thing cancelled when the calendar gets busy
- Reports say the same thing every week
- The manager can't recall last week's conversation

---

## 5. Performance / Career Conversation

**Input mode:** Single Relationship
**Default purpose:** Structurally different from a weekly 1:1, higher stakes and lower frequency, needs its own shape rather than just a longer 1:1.

**Async before:** No async substitute, this needs to be live, but prep notes from both sides beforehand help.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Open with the person's own view first, ask before telling | WHY | 0.25 |
| Observations tied to specific evidence, not vibes | HOW | 0.30 |
| Forward-looking growth conversation, framed to their orientation | WHY | 0.25 |
| Close with two or three concrete commitments, both directions | WHAT | 0.20 |

**Role notes:** A WHY-primary report wants purpose-connected growth. A HOW-primary report wants depth and mastery. A WHAT-primary report wants the next milestone. This conversation should surprise no one, a sign the weekly 1:1s along the way weren't surfacing signal if it does.

**Structural parts for lean-in / get-help mapping:**
- Open with genuine curiosity about their own view — WHY
- Ground every point in specific, checkable evidence — HOW
- Land on concrete next commitments, not just intentions — WHAT

**Working when:**
- Nothing in the conversation is a surprise
- It's referenced again before the next one
- Both sides leave with something specific to do

**Failing when:**
- The conversation surprises anyone in the room
- Feels one-directional
- Happens once a year and is never referenced again until the next one

---

## 6. All-Hands / Town Hall

**Input mode:** No Roster
**Default purpose:** One-to-many broadcast plus open floor, every orientation in the room with no shared context to lean on.

**Async before:** Questions submittable in advance. Detail and data live in a follow-up doc, not read aloud live.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Why now, brief context | WHY | 0.15 |
| What this means for you, concretely (most all-hands skip this and shouldn't) | WHAT | 0.45 |
| Detail held in reserve, live Q&A | HOW | 0.40 |

**Role notes:** Live-only Q&A favors people willing to speak up unprepared, always pair it with the ability to submit questions in advance.

**Structural parts for lean-in / get-help mapping:**
- Land the why-now without losing the room in vision — WHY
- Get to what changes Monday morning, don't stall there — WHAT
- Handle detailed live questions precisely, not defensively — HOW

**Working when:**
- Live questions come from more than the usual two people
- Feedback afterward is specific, not just "that was long"
- Attendance holds steady over time

**Failing when:**
- The room loses the thread before it gets to what changes for them
- Live Q&A goes silent, no one had time to form a question
- Attendance quietly drops, or feedback keeps coming back as "I don't know what this means for my day-to-day"

---

## 7. Client / Stakeholder Check-in

**Input mode:** No Roster
**Default purpose:** Distinct from an internal leadership update because relationship and trust carry more weight than status, and the presenter doesn't control the other side's team composition.

**Async before:** None required, but a brief progress note beforehand helps set expectations.

**Live structure:**
| Block | Energy | pct |
|---|---|---|
| Brief relationship check-in | WHY | 0.15 |
| Progress against the plan, in milestones, not tasks | WHAT | 0.45 |
| What needs a decision or input from the client, named explicitly | HOW | 0.40 |

**Role notes:** The block most check-ins bury is the explicit ask, don't let it get lost inside the progress update. Once you've worked with a client contact a few times, adapt live to whether they want the headline or the detail, rather than formally scoring them.

**Structural parts for lean-in / get-help mapping:**
- Open with genuine relationship attention, not just status — WHY
- Frame progress at the milestone level, not the task level — WHAT
- Name what needs their input precisely, don't bury it — HOW

**Working when:**
- The client engages with substance, not just "are we on track"
- Nothing about scope surprises either side later
- Renewal conversations feel easy

**Failing when:**
- The client only ever asks "are we on track" and never engages with substance
- Scope creep sneaks in live with no one flagging it
- Feels transactional, the client just nods

---

## Tool suggestions for the lean-in / get-help map

Default mapping from a tertiary-energy gap to a real tool in the Tertiary
Support Library. Use these unless a more specific tool in the library is a
clearly better fit for the exact block, never invent a tool name that
isn't in the library.

| Gap energy | Suggested tool |
|---|---|
| WHY (framing, purpose, the "why now") | The Opening Line Habit |
| WHAT (pace, momentum, keeping it moving) | The Momentum Board |
| HOW (depth, precision, evidence) | The Edge-Case Question Bank |

For the person-suggestion half of the lean-in map (Roster and Single
Relationship modes only): match the gap energy to whoever in the roster is
primary in that energy, per the same orientation logic used everywhere
else in this project (WHY-WHAT and WHY-HOW are WHY-primary, WHAT-WHY and
WHAT-HOW are WHAT-primary, HOW-WHY and HOW-WHAT are HOW-primary).
