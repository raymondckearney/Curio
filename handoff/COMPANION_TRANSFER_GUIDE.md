# MindPrint™ AI Companions · Prototype-to-Platform Transfer Guide

Three prototypes, one architecture. Each file is a self-contained React client component with a single API adapter function, `llm()`, at the top. The port to choosecurio.com is the same four steps for all three.

## The three prototypes

| File | Companion | Supports | Modes (absorbed Library Tools) |
|---|---|---|---|
| `precision_companion.jsx` | Precision | Tertiary HOW (WHY-WHAT, WHAT-WHY) | Decompose (1), Pre-Flight (2), Gap Review (9), Edge Cases (6/9), Definition of Done (7) |
| `purpose_companion.jsx` | Purpose | Tertiary WHY (WHAT-HOW, HOW-WHAT) | Purpose Brief interview (21), North Star (22), So-What Translator (24), Opening Lines (29) |
| `progress_companion.jsx` | Progress | Tertiary WHAT (WHY-HOW, HOW-WHY) | Good-Enough Threshold (11), Milestone Backplan (15), Progress Broadcast (18), Closing Card (12) |

## Port steps

**1. Drop each component into a route.** Add `"use client"` at the top and place at `app/tools/precision-companion/page.tsx` (and equivalents). Delete the FontLoader `useEffect` in each file; Caveat and DM Sans are already global on the site. Tailwind classes used are core utilities only.

**2. Move the AI call server-side.** Create one route handler, `app/api/companion/route.ts`, and replace the body of `llm()` in each component with:

```ts
const res = await fetch("/api/companion", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tool, mode, profile, messages }),
});
const { text } = await res.json();
return text;
```

The route handler composes the system prompt server-side and calls the Anthropic SDK:

```ts
import Anthropic from "@anthropic-ai/sdk";
// 1. auth: read curio_portal session cookie
// 2. license: verify account_licenses grants this tool for the user
// 3. compose: SOT_PREAMBLE + COMPANION_BASE[tool] + MODE_SYSTEM[tool][mode] + profile line
// 4. call: client.messages.create({ model, system, messages, max_tokens: 2000 })
// 5. persist: insert into tool_sessions (user, tool, mode, tokens, created_at)
```

**3. Move the prompts into governance.** Every `SYSTEM_BASE` and `MODES[*].system` string in the prototypes moves out of the client and into the route handler (or a `lib/companion-prompts.ts` module), prefixed with the relevant sections of `MindPrint_AI_Source_of_Truth.md`. The prototypes embed the critical language rules inline (energizing/draining, orientation not personality, hyphenated notation, no em dashes, never claim tertiary work becomes energizing); on the platform, the Source of Truth v2.1 is the canonical source and the inline rules become redundant safeguards, keep them anyway.

**4. Wire profile from the account, not a dropdown.** The prototypes use a profile selector for demo flexibility. On the platform, read the user's assessment result from their account and pass it server-side; keep the selector only for admin/demo views.

## Production changes beyond the port

- **max_tokens**: prototypes are capped at 1000; raise to 2000+ on the platform (Decompose and Backplan outputs benefit most).
- **Streaming**: the route can stream (`client.messages.stream`) for a better feel on longer outputs; the components' `output` state accepts incremental updates with minimal change.
- **Rate limiting**: per-license daily caps in the route handler, logged to tool_sessions, before this goes on /buy.
- **Persistence**: prototypes hold state in memory only (by design, no browser storage). Platform version saves runs to tool_sessions so users can revisit outputs from My Profile.
- **The Purpose Brief interview** is the one conversational mode: the route must pass the full `messages` array through untouched. Its final output (the completed brief) is worth persisting as a distinct artifact type, it is a document users will return to.

## Shared spine with the Orientation Translator (Task 2)

The So-What Translator mode in the Purpose Companion is a special case of the planned Orientation Translator (translate content *to a reader*, rather than *between orientation speaks*). Build both on one prompt module: extraction of invariant content, reordering to target structure, addition of what the target wiring needs, register shift. One module, two products.

## Demo script (for Stuart or any warm prospect)

1. Open the Companion matching their profile's tertiary.
2. Have them paste a real, current piece of work (a goal, a stalled draft, messy meeting notes).
3. Generate, then use Refine once, the refinement turn is what makes it feel like a colleague rather than a form.
4. Close on the framing: "this is one of three Companions, one per drain, included in the engagement."
