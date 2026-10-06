# MindPrint™ tool sheets

One-page sales sheets, one per tool or resource (17 total, the three AI
Companions share one). Every sheet has the same sections: who it serves,
the problem, what it does for you, how it works, what you get, a "good to
know" note, and what it pairs well with, plus 1 to 3 screenshots.

- `content.js` holds all copy and screenshot choices. Edit text here.
  Copy follows `lib/mindprint-source-of-truth.md` section 2.
- `sheet.css` and `build.js` are the template and renderer.
- `shots/` holds the 2x screenshots (PNG) and `shots/web/` the resized
  JPEGs the sheets embed. `dims.json` records image sizes for cropping.
- `out/` (not committed) gets one PDF and HTML per sheet, the combined
  `MindPrint_Tool_Sheets.pdf`, and `qa/` rasters for review.
- `overview.pdf` is the owner's 3-page capabilities overview (uploaded, not
  generated here). It goes in front of the combined PDF. Replace the file to update it.

## Rebuild

From the repo root:

```bash
NODE_PATH=/opt/node22/lib/node_modules node sales/tool-sheets/build.js        # all sheets
NODE_PATH=/opt/node22/lib/node_modules node sales/tool-sheets/build.js insights   # one sheet
```

The combined PDF needs `pymupdf` (`pip install pymupdf`).
The build fails loudly if any sheet overflows its page or a screenshot is
too wide. Check `out/qa/*.png` before sending anything out.

## Taking screenshots

The screenshots use a fictional demo company, Summit Ridge Co., with
eight people across all six profiles (`@summitridge.example` addresses).

```bash
PORTAL_SECRET=local-test-only-secret-1234 node sales/tool-sheets/scripts/seed-demo.js > sales/tool-sheets/.demo.json
PORTAL_SECRET=local-test-only-secret-1234 ADMIN_SECRET=local-admin-test-secret-5678 \
  NEXT_PUBLIC_SANITY_PROJECT_ID=dummy123 NEXT_PUBLIC_SANITY_DATASET=production npx next dev -p 3100
node sales/tool-sheets/scripts/render-tip-email.js         # the weekly tip emails
NODE_PATH=/opt/node22/lib/node_modules node sales/tool-sheets/scripts/capture.js [tool ...]
python3 sales/tool-sheets/scripts/optimize.py               # PNG -> web JPEGs + sizes
node sales/tool-sheets/scripts/seed-demo.js --delete        # remove the demo company when done
```

## Status

All 17 sheets have real screenshots. The two Insights shots
(`insights-1-index`, `insights-2-article`) were taken from the public site
and uploaded by hand, since cloud sessions can't reach Sanity; content.js
crops off the site nav so they match the portal's embedded view.

To re-shoot Insights automatically instead, start the dev server with
`NEXT_PUBLIC_SANITY_PROJECT_ID=s1mmyqgb` (the project in `sanity.cli.js`) and
the real dataset instead of `dummy123`, then run `capture.js insights` and
`optimize.py`. The article shot opens "Strategic Harmony" if it exists, else
the newest article. This needs network access to sanity.io (a local run).

`optimize.py` converts embedded color profiles (Mac screenshots are Display
P3) to sRGB, so hand-taken screenshots keep their colors.

## AI screenshots and the response cache

The AI tools (`classify`, `companions`, `translator`, `meeting`, `fit`,
`jd`, `career`, `assistant` in `scripts/capture.js`) need the dev server
started with `ANTHROPIC_API_KEY` as well. Each one logs in as a demo person
(the companions use the person whose tertiary they support), fills the tool
with realistic Summit Ridge inputs, and waits for the result.

Every AI response is saved to `.ai-cache/<tool>.json` (not committed) the
first time and replayed after that, so re-shooting or fixing a crop costs no
API usage. Delete a tool's cache file to get a fresh result, or set
`NO_CACHE=1`. Each run also leaves a full-page `<tool>-full.png` there, in
case a crop selector misses.

Product wording to fix (seen while capturing, not part of the sheets):

- Team Dynamics' Blind Spot Report says "Dominant Orientation", which the
  source of truth's language rules prohibit (use "primary").
- Orientation Translator's Detect output and the Job Description Analyzer
  both used "dominant" in their AI text ("The dominant signal", "the
  dominant 57% HOW demand"). Their prompts may need the same rule.
- The Insights article "The Innovation Bottleneck: How HOW-Dominant Cultures
  Quietly Kill New Ideas" uses "Dominant" in its title, and it is currently the
  first card on the index and visible in insights-1-index (kept for now; fix in Sanity).
- The Companions and Translator render a markdown `---` rule as literal
  text (`components/CompanionMarkdown.js` doesn't handle horizontal rules).
