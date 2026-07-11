// Server-only.
//
// SINGLE SOURCE OF TRUTH FOR REGISTER DEFINITIONS. Editing this file changes
// the behavior of ALL language tools. Sync any edit with
// MindPrint_Language_Framework.md and flag to Ray.
//
// Sourced verbatim from MindPrint_Language_Framework.md: register
// definitions (Sections 2-4), the absence principle (Section 1), the
// profile signature table and reading rule (Section 5), the translation
// methodology (Section 6), and detection guardrails (Section 8). Locked
// language rules are pulled from the MindPrint AI Source of Truth via its
// existing import (lib/mindprint-source-of-truth.js), not restated
// independently.
//
// Composed into: the Orientation Translator, the Profile Detector, the
// Purpose Companion's So-What mode, and (when built) the public Mirror.
// No tool may carry its own copy of these definitions.

import sourceOfTruth from './mindprint-source-of-truth';

export const REGISTERS = `## WHY-speak

**The frame.** Communication exists to establish meaning and alignment. The point of a message is shared understanding of what matters.

**Vocabulary markers.** purpose, vision, opportunity, imagine, believe, matters, fundamentally, ultimately, the real question, the bigger picture, at its core, potential, transform, mission, step back, what if, possibility, direction, worth, meaning. Future tense and conditional mood are frequent ("what if we could"). Abstract nouns outnumber concrete ones. Analogies and metaphors appear naturally.

**Structure markers.** Context-first: opens with framing and background before any ask. Builds an argument toward a conclusion rather than leading with it. Long first paragraphs. Comfortable with open endings; a WHY-speak message may close on a question rather than an action. Subject lines are thematic ("Thinking about our Q3 direction") rather than operational.

**Question signatures.** Reframing and premise-testing: "Why are we doing it this way?" "Is this the right problem?" "What are we really trying to achieve?" "Whose problem is this?" These questions often arrive after others consider the matter settled.

**Written tells.** The ask, if any, sits near the end. References to first principles. Zooms out mid-thread. Restates the goal in new words rather than repeating the old ones.

**What frustrates this register in others.** Conclusions without rationale; task lists with no context; "just do it" energy; being told the framing question is a distraction.

## WHAT-speak

**The frame.** Communication exists to create movement. The point of a message is a decision, an action, or a status change.

**Vocabulary markers.** next steps, move, ship, launch, quick, win, traction, let's just, good enough for now, progress, milestone, by Friday, unblock, action items, circle back, done, owner, decide, lock it, momentum as a plain noun. Present tense, active voice, imperative mood. Verbs dominate. Dates and names appear at high density.

**Structure markers.** Conclusion-first: the ask or decision leads; context is compressed ("long story short") or absent. Short paragraphs and fragments. Bullets and numbered actions as native habitat. Ends with a deadline or an assignment. Subject lines are verbs or statuses ("Decision needed: vendor", "Shipped").

**Question signatures.** Forward-motion: "What's next?" "Who owns this?" "What's blocking us?" "Can we decide today?" Rarely asks for rationale; rarely asks about mechanics.

**Written tells.** Names attached to tasks; dates everywhere; TL;DR instincts; the same message would survive being cut in half and its author knows it.

**What frustrates this register in others.** Long context-setting before the point; meetings that end without an owner; precision debates that read as slowdown; reopening decided things.

## HOW-speak

**The frame.** Communication exists to establish accuracy and completeness. The point of a message is that the picture is correct and nothing is missing.

**Vocabulary markers.** specifically, exactly, depends, edge case, exception, to clarify, for completeness, process, sequence, criteria, dependency, one thing to flag, before we commit, documented, verified, it's more complicated than that, assuming, unless, in practice. Qualifiers and conditionals are structural, not decorative. Precise numbers, not round ones.

**Structure markers.** Sequential and layered: numbered steps, nested detail, appendix instincts. Distinguishes cases ("there are three scenarios here"). Caveats woven throughout rather than gathered at the end. Length scales with the complexity of the truth, not the patience of the reader. Subject lines are specific ("Vendor contract §4.2, two issues").

**Question signatures.** Boundary-testing and mechanism: "What happens when X?" "How exactly does this work?" "What are we assuming?" "Who maintains this after launch?" These questions often arrive at the moment a group is about to close.

**Written tells.** Parenthetical clarifications; explicit definitions of terms; flags of what is not yet known; corrections of small inaccuracies in others' messages; the complete answer where a partial one was requested.

**What frustrates this register in others.** Vagueness treated as speed; decisions made on incomplete pictures; being handed a plan they had no input on; round numbers presented as facts.`;

export const ABSENCE_PRINCIPLE = `Core hypothesis: each orientation's signature question leaks into everything its holder writes and says. Communication carries orientation markers at four levels: vocabulary (word choice), structure (how the message is organized), questions (what gets asked, and when), and frame (what the communication treats as its point). People spend the fewest words on what drains them, so the absence of an orientation's markers is as diagnostic as any presence.`;

export const PROFILE_SIGNATURES = `A profile signature is the strong presence of two orientations' markers and the conspicuous absence of the third's. People spend the fewest words on what drains them, which makes the absence pattern the more reliable signal.

| Profile | Present | Conspicuously absent |
|---|---|---|
| WHY-WHAT | vision framing + next steps, owners, dates | edge cases, caveats, qualifiers |
| WHY-HOW | vision framing + mechanism, system detail | dates, owners, urgency, shipping language |
| WHAT-WHY | action and milestones + purpose gestures | task-level detail, completeness checks |
| WHAT-HOW | action and milestones + detail, metrics | purpose framing, audience meaning |
| HOW-WHY | systematic detail + purpose, patterns | deadlines, decision pressure, progress claims |
| HOW-WHAT | systematic detail + process, structure, efficiency | vision language, reframing, the bigger picture |

Reading rule for tooling: score all three orientations independently; the lowest-scoring orientation is the tertiary hypothesis, and it constrains the profile to two candidates; the higher of the remaining two is the primary hypothesis.`;

export const METHOD = `## Translation methodology

Translation is not word substitution; it is re-answering the receiver's signature question. Four steps, in order:

1. **Extract the invariant content.** Facts, numbers, the ask, the deadline. These survive every translation untouched; translation never adds facts.
2. **Reorder to the target structure.** WHAT: conclusion first, context compressed. WHY: context and meaning first, ask at the end. HOW: sequence and cases, complete before concise.
3. **Add what the target orientation needs that the source omitted.** For WHY: the purpose and what it serves. For WHAT: the action, the owner, the date. For HOW: the mechanism, the caveats, the boundary conditions. Additions must be derivable from the source or explicitly marked as proposed.
4. **Shift the register.** Verb density up for WHAT; abstraction and future mood for WHY; qualifiers and precision for HOW. Subject line rewritten to the target's pattern.

**Worked example.** Invariant content: a launch moves two weeks, new date March 14.

*WHY-speak:* "I want to step back on the timeline. The reason this project matters is the client relationship it unlocks, and shipping something that undermines trust would defeat the purpose. Two more weeks lets us deliver something that actually achieves what we set out to do. Worth a conversation about what we're really optimizing for here."

*WHAT-speak:* "Update: pushing launch two weeks, new date March 14. Three things still moving: integration testing (Priya, 3/6), final copy (me, 3/9), client preview (3/11). Nothing else changes. Flag anything that breaks by EOD tomorrow, otherwise we're locked."

*HOW-speak:* "We need to move the launch date, and I want to walk through exactly why. Testing surfaced two dependency issues: (1) the API rate limit fails above 200 concurrent users, and the fix requires the caching layer we deprioritized in January; (2) the export function mishandles records created before the migration. Fixing both requires 8 to 9 working days including regression testing. A two-week buffer covers this with margin for one unknown. Detailed breakdown attached."`;

// Section 8. Shared by any tool that reads a text sample and offers an
// orientation or profile hypothesis (the Detector today, the Mirror when
// built). The hiring/screening refusal is a policy addition beyond the
// current v1.0 draft of MindPrint_Language_Framework.md Section 8, approved
// for this build; fold it into a future revision of that document.
export const DETECTION_GUARDRAILS = `Detection outputs are hypotheses, phrased as "this message reads WHAT-forward", never as "the author is a WHAT-primary".

Known confounds, all of which suppress or distort markers, weigh them honestly and discount a signal the confound explains:
- **Role training.** Any experienced PM writes WHAT-speak on the job regardless of wiring; professions install registers.
- **Audience adaptation.** Skilled communicators code-switch toward the receiver; a message to an executive is not a wiring sample.
- **Genre.** Status updates force WHAT structure; specs force HOW structure. Genre must be controlled before markers are read.
- **Volume.** Single messages are weak evidence; patterns across many messages and genres are the unit of analysis.

If the user indicates the analysis is for evaluating a job candidate, screening applicants, or any employment decision, do not perform the analysis; explain that this is a coaching and communication tool, not validated for selection decisions, and stop. Never characterize third parties mentioned within a text; read only the writer whose samples were submitted.`;

// Translator-specific guardrails: the translation task's own invention limit
// and the register-adopted-fully product note. Locked language rules and
// hypothesis-only phrasing for register reads are pulled from
// LOCKED_LANGUAGE_RULES and DETECTION_GUARDRAILS respectively, not restated
// here.
export const TRANSLATION_GUARDRAILS = `Locked guardrail, non-negotiable: translation never invents facts, only the four-step method's step 3 additions, and any addition not derivable from the source must be marked (proposed) inline. The translated message itself fully adopts the target register, that is the product.`;

// Derived from the MindPrint AI Source of Truth (lib/mindprint-source-of-truth.js),
// Section 2, "Language rules - locked". Kept here as a short composable
// excerpt for tools that don't already inject the full Source of Truth
// preamble; do not restate or fork this independently of that document.
export const LOCKED_LANGUAGE_RULES = `Locked language rules, non-negotiable, from the MindPrint AI Source of Truth: say "cognitive orientation", never "personality", "style", or "type". Say "energizing" and "draining", never "strength" or "weakness". Write profiles as PRIMARY-SECONDARY, hyphenated, full caps, for example WHY-WHAT, never reversed, abbreviated, or un-hyphenated. Never suggest tertiary work can become energizing, only that its cost is reduced. Never use "brain" as a standalone label for an orientation. No em dashes, use commas instead.`;

if (process.env.NODE_ENV !== 'production' && !sourceOfTruth) {
  // Fails loudly in dev if the Source of Truth import ever breaks, since
  // LOCKED_LANGUAGE_RULES is meant to travel alongside it, not replace it.
  throw new Error('lib/language-framework.js: mindprint-source-of-truth import is empty');
}
