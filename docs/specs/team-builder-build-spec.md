# MindPrint™ Team Builder: Claude Code Build Spec

---

## STEP 0: CONFLICT CHECK BEFORE ANY CODE

Do this first and report back before writing code.

1. Run `git status`. If the working tree is not clean, stop and report.
2. Read, in full: `CLAUDE.md`, `MindPrint_AI_Source_of_Truth.md`, and the four files delivered with this spec (listed under REFERENCE FILES).
3. Find and note the existing conventions for each of the following. Where this spec and the repo disagree, **the repo wins** unless the disagreement changes the architecture, in which case stop and report.
   - Router and language (expected: Next.js Pages Router, plain JavaScript)
   - Anthropic calls (expected: raw `fetch` to the Messages API, model `claude-sonnet-4-6`, no SDK)
   - Supabase client and environment variables (expected: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)
   - Portal tool structure and auth under `/portal/tools/` (for example, the AI & Delegation Guide)
   - The existing PDF generation utility (expected: Playwright/Chromium HTML to PDF)
   - Rate limiting on API routes
   - Admin page auth pattern
   - **Where the MindPrint™ Tertiary Support Library tools (Tools 01 to 43) live on the site, and how to link to one by tool number**
   - Design tokens and fonts (Caveat + DM Sans, emerald accent, navy panels, energy badge colors)
4. Report a short list: conventions found, any conflicts, and your plan for each. Then proceed.

---

## WHAT YOU ARE BUILDING

A new portal tool, **Team Builder**, at `/portal/tools/team-builder`.

A user uploads or pastes a work document (statement of work, work plan, project plan). Team Builder:

1. extracts the activities and phases;
2. maps each activity to the MindPrint™ Activity Taxonomy;
3. lets the user correct the extraction;
4. optionally takes a roster of people with MindPrint™ Profiles;
5. returns the recommended team shape, who owns, contributes to and reviews each activity, each person's drain budget, coverage gaps, a friction forecast, and an individual plan for every person.

The user is self-serve. The tool is positioned as insight for a human staffing decision, never as selection.

**The prototype `team-builder-prototype.html` is the reference implementation.** It is the approved UX, copy and engine logic. Match its flow, sections, copy and visual treatment, and port its engine functions. Where this spec adds something the prototype lacks (upload, AI calls, exports, persistence), this spec governs.

---

## REFERENCE FILES

Place these at the project root alongside `MindPrint_AI_Source_of_Truth.md`:

| File | Purpose |
|---|---|
| `MindPrint_Activity_Taxonomy.md` | The 63 activities, demand tags, default split, role bands, context shift rule. Governs all activity tagging. |
| `team_builder_system_prompt.md` | System prompt spec for the two AI calls (extraction and narrative), including JSON schemas. |
| `team-builder-prototype.html` | Reference implementation of UX, copy and engine. Keep it in `/docs/prototypes/`, do not serve it. |

`MindPrint_AI_Source_of_Truth.md`, `MindPrint_Activity_Taxonomy.md` and `team_builder_system_prompt.md` are read at **request time**, not build time, and injected **verbatim** into the system prompt of every AI call. They may change without a redeploy.

---

## FILE STRUCTURE

Mirror the existing portal tool structure. Expected shape (adjust names to repo conventions):

```
/pages/portal/tools/team-builder.js            page, four-step flow + result
/components/team-builder/                      StepWork, StepActivities, StepRoster, Result, PersonPlan, ToolCard, Pie, DemandMap
/lib/team-builder/taxonomy.js                  parsed taxonomy (63 entries: id, name, tag, group)
/lib/team-builder/engine.js                    deterministic engine, ported from the prototype
/lib/team-builder/engine.test.js               unit tests (see ACCEPTANCE)
/lib/team-builder/language.js                  output language lint
/pages/api/team-builder/extract.js             AI call 1
/pages/api/team-builder/narrative.js           AI call 2
/pages/api/team-builder/pdf.js                 exports, using the existing PDF utility
/pages/admin/team-builder.js                   admin view
```

Parse `taxonomy.js` from `MindPrint_Activity_Taxonomy.md` section 4 at request time, or generate it from that file with a build-free script. The taxonomy file is the single source; never hand-maintain a second copy of the list.

---

## THE FLOW

Four steps with a pill stepper, as in the prototype. Every step can be revisited, and the result recalculates from the current state.

### Step 1: The work
- Paste text, or upload PDF, DOCX or TXT. Max 4 MB (Vercel body limit). Show a clear error over that size.
- "Read the document" calls `/api/team-builder/extract` and shows a loading state with rotating messages every 8 seconds: "Reading the document…", "Finding the activities…", "Matching to the MindPrint™ activity list…", "Almost there…".

### Step 2: Review activities
Match the prototype exactly, including the three explainer cards (Share of effort, Matching, Delivery).

**Phases table.** Name, start week, end week, activity count, remove.
- One phase is the special **Ongoing** phase, for work across all phases. It has no weeks and can be renamed but not removed.
- A phase can only be removed when no activities use it.
- Add phase appends after the last week.
- Duration (weeks) and total effort (hours) fields sit below. Prefill them from extraction; both are editable.

**Activities table**, one row per activity:

| Column | Behavior |
|---|---|
| Name | Editable text. |
| Matched to | Select with "Not on the list" plus the 63 taxonomy entries. Changing it resets the demand tag to that entry's tag. |
| Demand | Select of the six tags. When it differs from the matched entry's tag, show a "Shifted" chip; hovering or tapping it shows the AI's shift reason. "Not on the list" rows keep whatever tag is set. |
| Phase | Select. |
| Share | Percent input. |
| Hours | Read-only: share ÷ total of all shares × total hours. |
| Delivery | Solo / Pair / Small team / Whole team. |
| Source | Chips: Stated, Inferred, Added, plus Unlisted when not on the list. |
| Remove | Removes the row. |

- A footer row shows the share and hours totals.
- When shares do not total 100, say "Shares add to X%, so they are scaled to 100% for the result."
- Add activity is available.

### Step 3: Roster (optional)
- Toggle: "Use this roster for the recommendation." Off means Design mode, which recommends the ideal seats.
- Rows: name, profile (six profiles), availability (100 / 75 / 50 / 25%), hours available (read-only: availability × weeks × 40), remove.
- Optional per person, collapsed by default:
  - **Skills:** free-text tags.
  - **Seniority:** Junior / Mid / Senior / Principal.
- In v1, skills and seniority are display-only context passed to the narrative call. They do not change the engine.
- **Rosters are entered fresh each run.** No saved rosters, no autocomplete from past runs.
- Show: "Names are never sent to the AI."

### Step 4: Result
Sections in this order, matching the prototype:

1. **Summary**
   - Headline: "The recommended allocation" with a roster, or "The recommended team" without one.
   - The AI summary paragraph.
   - Two cards: Headcount range with its assumption line, and Team structure (engagement lead plus the owner of each phase).
2. **The shape of the work** (navy panel). A pie chart of share of effort by the profile each activity calls for. The legend shows profile, %, and seats in the ideal team, or "Covered by a contributor."
3. **Energy demand map** (navy panel).
   - Rows in this order: "All work combined," then each phase with its weeks, then Ongoing ("Runs across all phases").
   - Bars show percentages only, hiding the label below 8%. The legend carries the WHY / WHAT / HOW labels.
   - Note under the map: "Ongoing work, such as project management, runs alongside every phase. It has its own row so each phase shows only its own work."
4. **Who carries what**
   - The definitions panel (Owner, Contributor, Reviewer), then one card per person or seat.
   - Each card shows: profile, role title, hours and % of available time, an energy bar (energizing / neutral / draining), and lists for Owns, Contributes to, Reviews and Draining work. Draining work is always shown, reading "None…" when empty.
   - A drain budget flag with a mitigation and tool links appears when draining work exceeds 20% of the person's hours.
   - "Open individual plan" button.
5. **Owner and contributor matrix**
   - Rows are grouped by phase with weeks. Columns: Activity (with tag), Delivery, Hours, then one column per person.
   - Cells show an Owner, Contributor or Reviewer badge, colored by what the role costs that person (Energizing / Neutral / Draining).
6. **Gaps to close.** Plain-language flags, as in the prototype. Never show scores or thresholds to the user. Shows a success state when there are no gaps. With a roster, it also shows the ideal shape for comparison.
7. **Friction forecast.** Up to four cards. Each card has:
   - the pattern title and the two people involved;
   - what the pattern looks like;
   - "Where it shows up": shared activities from this plan;
   - "What to do": AI-written tactical steps, falling back to the prototype's templated steps;
   - tool links.
8. **Actions:**
   - "Change the roster."
   - "Download team brief (PDF)."
   - "Download individual plans (PDF)," as one PDF with one section per person, plus a per-person download from each plan.
9. **Footer guardrail**, verbatim from the prototype.

### Individual plan view
Rendered in-page, with "Back to the full result." Content matches the prototype:

- **Header:** profile, role title and engagement lead chip, plus a line with hours, % of capacity, counts by role and the energy split.
- **The work, phase by phase:** a card per phase. Each item shows:
  - the activity and role badge;
  - delivery and hours;
  - what is expected: the AI expectation sentence, falling back to the templated sentence;
  - who they work with, and in what role.
- **Who to go to for what:** one card per collaborator, with the go-to line by that person's primary orientation and their shared work.
- **Watch for:** draining items with the mitigation and tool links, or the success state when there are none.

---

## API 1: `/api/team-builder/extract` (POST)

**Input:**

```json
{ "text": "string or null", "file": { "name": "string", "mediaType": "string", "base64": "string" } }
```

Either `text` or `file` is required.

**Document handling:**
- **PDF:** send to the Messages API as a `document` content block (base64, `application/pdf`).
- **DOCX:** extract text server-side with `mammoth`, or the repo's existing equivalent.
- **TXT:** read as text.

**System prompt:**

```
[team_builder_system_prompt.md, PART A, verbatim]
---
## MINDPRINT™ ACTIVITY TAXONOMY (AUTHORITATIVE FOR TAGGING)
[MindPrint_Activity_Taxonomy.md, verbatim]
---
## MINDPRINT™ AI SOURCE OF TRUTH (AUTHORITATIVE, GOVERNS ALL OUTPUT)
[MindPrint_AI_Source_of_Truth.md, verbatim]
```

**Call:** raw `fetch`, `claude-sonnet-4-6`, `max_tokens` 8000. The model returns JSON only, in the schema in PART A.

**Server-side validation (required, before returning):**
1. Parse the JSON in a try/catch. If parsing fails, retry once with "Return valid JSON only." If it fails again, return 502.
2. For every activity:
   - The `taxonomyId` must be 0 to 63.
   - When `taxonomyId > 0` and `tag` differs from that entry's tag, the shift must obey taxonomy section 3. Allowed: swap lead and support, or replace the support orientation. Not allowed: replace the lead orientation with the residual one. Reset an invalid shift to the entry's tag and clear `shiftReason`.
   - When `taxonomyId === 0`, `tag` must be one of the six.
3. `sharePct` must be at least 0. Do not force the total to 100; the UI scales it.
4. `delivery` must be one of the four modes; default to `Solo` when unrecognized.
5. Phases:
   - Ensure exactly one `ongoing: true` phase named "Ongoing", creating it if missing.
   - Every activity's phase must exist; assign unknown phases to "Ongoing".
   - Clamp start and end weeks to at least 1, with end at or after start.
6. Return the validated JSON plus a `warnings` array.

**Errors:** 400 for missing input or a file over 4 MB; 502 for Anthropic errors; 500 for anything unexpected. Never expose the key or raw model output. Apply the repo's rate limiting.

---

## THE ENGINE: `lib/team-builder/engine.js` (deterministic, no AI)

Port the engine from the prototype's `<script>` and make it pure: no DOM, no global state. All numbers come from code, so the same input always gives the same result.

**Signature:**

```js
buildTeam({ phases, activities, weeks, hours, roster, useRoster }) →
  { headcount, ideal, people, rows, usingRoster, engagementLead, phaseOwners, demand, byProfile, gaps, friction }
```

Return gap and friction **data**, not HTML. The UI renders it.

### Constants (export them)
```js
SPLIT = { lead: 0.6, support: 0.3, residual: 0.1 }
CAPACITY_HOURS_PER_WEEK = 40
LOAD_PENALTY = 35
DRAIN_BUDGET = 0.20
CONTRIBUTOR_MIN_SCORE = 40
COVERAGE_DEMAND_MIN = 0.20
DELIVERABLE_IDS = [7, 29, 50, 51, 52, 53, 63]
DIRECTION_IDS = [1,2,3,4,5,6,7,8,28,29,30,31,32,33,50,51,53,54,55,56,57]
```

### Rules (these must match the prototype exactly)

1. **Score.** Use the Source of Truth Section 6 formula, unchanged, on the activity's demand split: `dp`, `ds` and `dt` are the activity's demand in the person's primary, secondary and tertiary orientations.
2. **Energy of a role** = the activity's lead orientation compared with the person's profile:
   - primary → Energizing;
   - secondary → Neutral;
   - tertiary → Draining.
3. **Activity hours** = share ÷ sum of shares × total hours.
4. **Capacity** = availability × weeks × 40. Design-mode seats are 100%.
5. **Headcount.** With hours and weeks:
   - `lo = ceil(hours / (weeks × 40))`;
   - `hi = ceil(hours / (weeks × 40 × 0.75))`;
   - if `hi ≤ lo`, then `hi = lo + 1`.

   Without hours: `lo = max(2, round(activities ÷ 4))` and `hi = lo + 1`, with the "no hours" assumption line.
6. **Ideal seats** (Design mode, and the comparison line). Use `n = clamp(lo, 2, 8)` seats. Apportion them across the six profiles by share of effort per activity tag, using the largest-remainder method. Seats are labelled Seat A, B, C…
7. **Assignment.** Process activities in descending hours. For each activity:
   - Rank everyone by `score − LOAD_PENALTY × (load ÷ capacity)`. The top-ranked person is the **Owner**.
   - **Contributors**, by delivery mode:
     - Solo: none.
     - Pair: the next 1 person scoring at least 40.
     - Small team: the next 2 people scoring at least 40.
     - Whole team: everyone else.
   - **Reviewer.** Add one when either:
     - the activity's tag includes the owner's tertiary orientation; or
     - the activity is in `DELIVERABLE_IDS`.

     Skip it when a contributor already has that orientation as their primary. The reviewer is the best-ranked person, outside the owner and contributors, whose primary is the owner's tertiary orientation. There may be none.
   - **Splits:**
     - No contributors: owner 100%.
     - One contributor: owner 65%, contributor 35%.
     - Small team with two contributors: owner 50%, the rest split evenly.
     - Whole team: owner 30%, 70% split evenly.
     - With a reviewer, multiply every share by 0.9; the reviewer takes 10%.
   - Add the hours to each person's load, and to their E, N or D bucket by the energy of that role.
8. **Engagement lead** = the person with the most owned hours on activities in `DIRECTION_IDS`.
9. **Phase owners** = for each non-Ongoing phase with activities, the person with the most owned hours in it.
10. **Gaps** (return typed objects):
    - `orientation_uncovered`: an orientation with at least 20% of total demand and no primary on the team.
    - `no_natural_owner`: an activity whose owner's role is Draining. Include the mitigation for the activity's lead orientation.
    - `over_capacity`: load greater than capacity.
    - `unused_person`: roster mode only, a person with no load.
11. **Drain flag** on a person: D hours ÷ load > 0.20.
12. **Friction.** Use the seven patterns in the prototype's `FR` array: handoff, tissue, trust, system, deploy, timing, action.
    - For each pattern, find the pair of people (one matching side A, one side B) who share the most activities.
    - Sort by shared count and keep the top 4.
    - Return the pattern id, the two people, the shared activities and the tool ids.
    - The templated steps live in the UI as the fallback.
13. **Mitigations** by tertiary orientation, with tool ids:
    - HOW: 10, 5, 9
    - WHAT: 20, 13
    - WHY: 21, 26

    Copy is verbatim from the prototype's `MIT`.

Role titles, go-to lines, review-for lines and the friction copy are UI constants. Port them verbatim from the prototype.

---

## API 2: `/api/team-builder/narrative` (POST)

Called automatically once the engine has run, and again whenever the result recalculates. Debounce by 1.5 seconds on edits. Render the engine result immediately using the templated fallback copy, then swap in the narrative when it arrives. Never block the result on this call.

**Input:**
- The engine output, with every person **replaced by a label** (`P1`, `P2`… in roster order, or `Seat A`…), plus their profile, role title, availability, optional skills and seniority.
- Activity names, tags, phases, hours and delivery.
- Gaps, and friction patterns with their shared activities and allowed tool ids.
- **No names leave the browser in this call.** The client keeps the label-to-name map and substitutes names on render.

**System prompt:**

```
[team_builder_system_prompt.md, PART B, verbatim]
---
[MindPrint_Activity_Taxonomy.md, verbatim]
---
[MindPrint_AI_Source_of_Truth.md, verbatim]
```

**Call:** `max_tokens` 8000. Returns JSON only, in the PART B schema: `summary`, `people[].planIntro`, `people[].items[].expectation`, and `friction[].steps` plus `friction[].tools`.

**Validation:**
- Parse with one retry.
- Drop any `friction[].tools` id not in the allowed list for that pattern.
- Run `language.js` on every string. If any string fails, retry the call once. If it fails again, drop the failing strings so the UI falls back to the templated copy for them.

### `language.js`
A lint that fails a string when it contains:
- an em dash (—) or en dash used as punctuation;
- any of these, as whole words, case-insensitive: `strength`, `strengths`, `weakness`, `weaknesses`, `personality`, `dominant`, `brain`, `brains`, `cognitive style`, `blind spot`;
- `lead` used for activity ownership. Allow "engagement lead"; flag "leads the", "lead on", "activity lead".

Export it for reuse by other tools.

---

## TOOL LIBRARY LINKS

Every tool chip (drain flags, gap flags, friction cards, plan watch-fors) links to that tool in the MindPrint™ Tertiary Support Library, by tool number, using the location you found in Step 0. Open it in the same tab, or follow the portal's existing pattern.

If a tool has no page, render the chip as a button that opens the tool card from the prototype (number, collection, name, description) without a dead link, and list those tools in your final report.

Tool numbers used: 4, 5, 7, 9, 10, 11, 13, 20, 21, 23, 26, 36, 39, 42.

---

## EXPORTS (PDF)

Use the existing HTML to PDF utility. Two exports:
1. **Team brief:**
   - every result section in order;
   - the pie and demand map rendered as SVG, not screenshots;
   - the matrix may span pages, with repeated headers;
   - tool references printed as names and numbers, plus links when the PDF supports them.
2. **Individual plans:** one PDF with a section per person, each starting on a new page. Also offer a single-person export from each plan view.

**Both exports:**
- Letter size.
- Curio fonts embedded the way the existing utility does it. Google Fonts CDN is blocked in the renderer; fonts come from `raw.githubusercontent.com` or embedded base64, per existing practice.
- The footer guardrail on every page.
- Generated from the current client state, sent to `/api/team-builder/pdf` with names. This route does not call the AI.

Verify by rendering the sample SOW and rasterizing with `pdftoppm`. The PDF is the source of truth for font fallback, not a browser screenshot.

---

## PERSISTENCE (SUPABASE)

Rosters are not saved. Save two things only.

```sql
create table team_builder_runs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  mode          text not null,               -- 'roster' or 'design'
  weeks         int,
  hours         int,
  activity_count int,
  profiles      text[],                      -- profiles only, no names
  result_summary jsonb not null              -- engine output with labels, never names
);

create table team_builder_unlisted_activities (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  run_id        uuid references team_builder_runs(id),
  activity_name text not null,
  tag_set       text not null,
  evidence      text
);
```

- Write a run once per completed result: the first narrative success, or 10 seconds after the first engine run if the narrative fails.
- Write unlisted activities with it.
- Never write names, skills or document text.

**Admin view** at `/admin/team-builder`, using the existing admin auth pattern:
- runs, newest first: date, mode, weeks, hours, activity count, profiles;
- an **Unlisted activities** tab, grouped by name with counts, so Ray can review whether the taxonomy needs new entries.

---

## SOURCE OF TRUTH UPDATE (apply in this build)

Edit `MindPrint_AI_Source_of_Truth.md` in the repo:

1. **Section 7, Tool Registry:** add this row:

| Team Builder | Work document (SOW, work plan, project plan) + optional roster (name, profile, availability, skills, seniority) | Team shape, owner / contributor / reviewer assignments, drain budget, coverage gaps, friction forecast, individual plans | Sections 2, 3, 4 (all profiles present), 5, 6, 10 |

2. **Add a new Section 10** after Section 9:

```markdown
## SECTION 10: ACTIVITY TAXONOMY AND TEAM ROLE LANGUAGE

`MindPrint_Activity_Taxonomy.md` is the governing list for tagging work activities in every tool. Tags use profile notation (LEAD-SUPPORT). Each tag converts to a 60 / 30 / 10 demand split that feeds the Section 6 formula unchanged, so activity-level scores never contradict the Role Alignment Analyzer. Tools may shift a tag by one step only under the taxonomy's context shift rule, and must show the reason.

When a tool assigns people to activities, it uses this vocabulary and no other:

| Term | Meaning |
|---|---|
| Owner | Accountable for the activity and does the largest share of the hands-on work. Not a management title. |
| Contributor | Delivers a defined piece of the activity, agreed with the owner. |
| Reviewer | Checks the work at the draft stage, bringing the orientation the owner finds draining. |
| Engagement lead | The single team-level lead for a project. The only use of "lead" for a person. |

Assignments are allocations among people already chosen. No tool ranks, filters or selects individuals.
```

3. **Document Control:** set the version to `2.2, Section 10 added (Activity Taxonomy and team role language); Team Builder registered`.

Show the SoT diff in your final report.

---

## ACCEPTANCE CRITERIA

**Engine unit tests** (`engine.test.js`). Use the prototype's sample data as the fixture: its 16 activities, 5 phases, 12 weeks, 1,560 hours, and the 5-person roster (Maya WHY-WHAT 50%, Daniel HOW-WHY 100%, Priya WHAT-HOW 100%, Tomas WHY-HOW 100%, Jordan WHAT-WHY 75%). Assert:
- [ ] Headcount is 4 to 5.
- [ ] The ideal seats are HOW-WHY, WHAT-HOW, WHY-WHAT, WHY-HOW.
- [ ] The engagement lead is Jordan.
- [ ] Executive readout: owner Maya, contributors Jordan and Tomas, reviewer Daniel.
- [ ] Roadmap and launch plan: owner Priya, contributor Jordan, reviewer Maya.
- [ ] Concept workshop (Whole team): owner Maya, with all four others as contributors.
- [ ] The scores for a HOW-WHY activity match taxonomy section 2: HOW-WHY 83, WHY-HOW 77, HOW-WHAT 63, WHAT-HOW 55, WHY-WHAT 32, WHAT-WHY 29.
- [ ] No gaps for the full roster. Removing Daniel produces an `orientation_uncovered` gap for HOW.
- [ ] Every person's E + N + D hours equals their load. The sum of all loads equals the total hours (within rounding).

**End to end**
- [ ] Pasting the prototype's sample SOW extracts about 15 to 17 activities across Discover, Define, Design, Deliver and Ongoing, with rewards partner outreach (or equivalent) marked Unlisted.
- [ ] Uploading a PDF and a DOCX both work. A file over 4 MB returns a clear error.
- [ ] An invalid tag shift returned by the model is reset by server validation.
- [ ] All step 2 edits (phase add, rename, re-time, guarded remove; match change; tag shift chip; share scaling; delivery) recalculate the result.
- [ ] The Design mode toggle works.
- [ ] No names appear in any request payload to `/api/team-builder/narrative`. Verify in the network tab.
- [ ] Narrative failure still renders a complete result with the templated copy.
- [ ] `language.js` catches an em dash and the word "strengths" in a test string.
- [ ] Tool chips link to real library pages, or open the tool card where none exists.
- [ ] Both PDFs render with Curio fonts (checked via `pdftoppm`), with the footer on every page.
- [ ] Runs and unlisted activities are written to Supabase with no names. The admin view lists both.
- [ ] Rate limiting is applied, and no API key reaches the client.
- [ ] Works on mobile and desktop. Wide tables scroll inside their containers, never the page.

---

## FINISH

1. Run the tests and paste the results.
2. Run `git diff --stat`, plus the full diff for `MindPrint_AI_Source_of_Truth.md`.
3. Report:
   - the conventions you followed where they differed from this spec;
   - any library tools without pages;
   - anything you could not verify.
