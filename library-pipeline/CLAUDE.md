# Library Pipeline · Instructions for Claude Code

This folder regenerates the MindPrint™ Tertiary Support Library: 43 tool one-pagers, 43 kit artifacts, and the catalog (87 PDFs). It is the single source of truth for library content; never edit the PDFs directly.

## How to make an edit

1. Content lives in Python dicts: `content_ab.py` (Tools 1–20), `content_cde.py` (Tools 21–43), `arts1.py` / `arts2.py` (kit artifacts). Find the tool by `num`, edit the field.
2. Run `pip install -r requirements.txt && python -m playwright install chromium` once, then `python run.py`.
3. `run.py` must end with `OVERFLOW: none`. If a page overflows, shorten the copy you just changed; never change template sizing to make copy fit.
4. Output lands in `dist/` (override with the `LIBRARY_OUT` env var). After regeneration, re-run the Supabase library seed script so `/library` serves the new PDFs.

## What you may edit freely
- Copy fields in the content files: `lead`, `drain`, `does`, `device`, `steps`, `wont`, `kit`, `pairs`, and artifact `sections` / `groups` / `cards`.
- Adding a new tool: copy an existing dict, assign the next `num` and the right `collection`, and add its kit artifact dict to `arts1.py`/`arts2.py`. The catalog rebuilds automatically from the content files (count, titles, and modes update on the next `run.py`). Still flag additions to Ray for content approval before rendering.

## What is LOCKED (do not change without Ray's explicit approval)
- `gen.py`: the template layout, fonts, colors, spacing, and section anatomy (The Drain / What This Tool Does / device panel / How To Use It / What It Won't Do / kit strip). The library's value is 87 pages that match exactly.
- Collection structure and accent colors: A amber #FCD34D (tertiary HOW), B blue #93C5FD (tertiary WHAT), C mint #6EE7B7 (tertiary WHY), D teal #14B8A6 (universal), E emerald #059669 (teams).
- `fonts_embedded.css` (base64 Caveat + DM Sans; Google Fonts CDN is not reliable in headless render environments, keep fonts embedded).

## Language rules (from MindPrint_AI_Source_of_Truth.md, non-negotiable)
- "Energizing" and "draining", never "strength" or "weakness".
- "Cognitive orientation", never "personality", "style", or "type".
- Profiles in PRIMARY-SECONDARY hyphenated caps only: WHY-WHAT, WHY-HOW, WHAT-WHY, WHAT-HOW, HOW-WHY, HOW-WHAT.
- Never the word "brain"; the framework is MindPrint™ with three orientations.
- No em dashes in body copy; use commas. Middots (·) for label separators.
- Never claim a tool makes tertiary work energizing; tools reduce its cost. Every one-pager's "What It Won't Do" section must keep this honest framing.
- After any content change, grep the content files for: brain, strength, weakness, personality, — (em dash). All must return clean before rendering.

## QA gate before delivering anything to Ray
1. `python run.py` → `OVERFLOW: none`.
2. Rasterize the changed pages (`pdftoppm -png -r 80`) and visually confirm: Caveat headline renders (script face, not a fallback), footer band intact, no dead whitespace block.
3. Confirm the language grep above is clean.
