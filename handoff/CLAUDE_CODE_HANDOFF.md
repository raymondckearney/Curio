# Claude Code Handoff · MindPrint™ AI Companions + Client Library

## What to hand over

Run Claude Code from the choosecurio.com repo root and give it these files plus the prompt at the bottom of this document:

1. `precision_companion.jsx`, `purpose_companion.jsx`, `progress_companion.jsx` (the working prototypes, source of truth for UI and prompt content)
2. `COMPANION_TRANSFER_GUIDE.md` (the port architecture)
3. `MindPrint_AI_Source_of_Truth.md` v2.1 (already at repo root with a CLAUDE.md entry)
4. `curio_library/` (the 87 PDFs, for the Library section) and this handoff doc

## Where things live on the site (recommendation)

**Companions** are licensed products and follow the existing access model exactly (locked tools are never shown):

- Routes: `/tools/precision-companion`, `/tools/purpose-companion`, `/tools/progress-companion`, portal-gated (curio_portal session)
- License keys in `account_licenses`: `precision_companion`, `purpose_companion`, `progress_companion`. Each manifests as a tool button on My Profile, same pattern as existing tools
- Default recommendation on My Profile: surface the Companion matching the user's tertiary first (their profile is on the account), with the other two available if licensed
- One API route serves all three: `app/api/companion/route.ts`

**The Library** is content, not computation, so it lives beside the tools, not among them:

- Route: `/library`, portal-gated. Default view filters to the collection matching the user's tertiary (Collection A for WHY-WHAT and WHAT-WHY, B for WHY-HOW and HOW-WHY, C for WHAT-HOW and HOW-WHAT), with D always visible and E visible on team licenses
- Storage: Supabase storage bucket `library`; table `library_items` (tool_num, collection, title, support_mode, onepager_path, kit_path)
- License keys: `library_full`, or per-collection `library_a` … `library_e`. Individual assessment buyers could get their tertiary collection bundled; teams get E
- Public teaser: the Library Catalog PDF and three sample one-pagers on the marketing site (suggest `/tools` marketing page covering Companions + Library), CTA to `/buy`
- Admin: grant/revoke library and companion licenses from the existing `/admin/accounts` section

## The prompt to paste into Claude Code

---

Build the MindPrint™ AI Companions and the client Library on this Next.js site. Reference files are in this directory: three prototype components (`precision_companion.jsx`, `purpose_companion.jsx`, `progress_companion.jsx`), `COMPANION_TRANSFER_GUIDE.md`, and `MindPrint_AI_Source_of_Truth.md` (governing document, never contradict it).

**Companions.**
1. Create `/tools/precision-companion`, `/tools/purpose-companion`, `/tools/progress-companion` as client pages from the prototypes. Preserve the UI exactly (brand: navy #0F172A, emerald #059669, Caveat display, DM Sans body, already global). Delete each prototype's FontLoader effect and profile dropdown; read the user's profile from their account (assessment result) server-side and pass it as a prop; keep a profile override only when the session user is an admin.
2. Create `app/api/companion/route.ts`. It must: verify the curio_portal session; check `account_licenses` for the tool key; compose the system prompt server-side as SOT preamble + companion base + mode system + user profile line (move every SYSTEM_BASE and MODES[*].system string out of the client into `lib/companion-prompts.ts`); call the Anthropic SDK (`ANTHROPIC_API_KEY` env, model per our current default, max_tokens 2000, pass the messages array through untouched, the Purpose Brief mode is conversational); insert a row into `tool_sessions` per call; return `{ text }`. Add a per-user daily cap of 50 calls with a clear over-limit message.
3. Replace each component's `llm()` body with the `/api/companion` fetch per the transfer guide. Never expose prompts or the API key client-side.
4. Add the three license keys and surface tool buttons on My Profile per the existing pattern, tertiary-matching Companion listed first. Locked tools are not shown.

**Library.**
5. Create a `library` storage bucket and `library_items` table (tool_num int, collection text, title text, support_mode text, onepager_path text, kit_path text). Write a seed script that uploads `curio_library/` and populates the table from the filenames.
6. Build `/library` (portal-gated): header per brand, collection filter chips (accent colors: A amber #FCD34D, B blue #93C5FD, C mint #6EE7B7, D teal #14B8A6, E emerald #059669), default filter to the user's tertiary collection, D always shown, E shown with a team license. Each item: title, support mode chip, view/download for the one-pager and kit PDF. Gate by `library_full` or `library_a`…`library_e` license keys. No locked-content teasers inside the portal.
7. Admin: extend `/admin/accounts` to grant/revoke the new companion and library license keys.

**Constraints.** Follow `MindPrint_AI_Source_of_Truth.md` for all copy: cognitive orientations not personality, energizing/draining not strengths/weaknesses, PRIMARY-SECONDARY hyphenated profile notation, no em dashes in body copy. Do not modify the assessment, token, or purchase flows. Ship behind the existing auth; do not add the Companions to `/buy` yet.

**Acceptance.** A licensed user sees only their licensed Companions and Library collections on My Profile and /library; an unlicensed user sees neither; each Companion mode returns governed output end to end; the Purpose Brief interview completes all five questions and produces the brief; tool_sessions rows are written; prompts are not visible in any client bundle.

---

## After it ships

Manual QA against the Source of Truth with one run per mode (15 runs), then license yourself and one test account before granting any client. Stripe products for the Companions and Library bundles are a separate later task, do not fold them into this build.
