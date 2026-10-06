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

Done (real screenshots): MindPrint™ Profile, Communication Field Guide,
AI & Delegation Guide (table), Weekly Profile Tips, Team Dynamics, Session
Architect, Onboarding Resources, Tertiary Support Library, Team
Administration, and the input forms for Meeting Architect, Job
Description Analyzer, and Career Guidance Tool.

Still to capture. These show a striped "to come" placeholder:

| Sheet | Missing shot (file name in content.js) | Needs |
|---|---|---|
| AI & Delegation Guide | delegation-3-classify (task classifier result) | ANTHROPIC_API_KEY |
| AI Companions | companions-1-precision, -2-purpose, -3-progress | ANTHROPIC_API_KEY |
| Orientation Translator | translator-1-result, translator-2-detect | ANTHROPIC_API_KEY |
| Meeting Architect | meeting-1-result, meeting-3-leanin | ANTHROPIC_API_KEY |
| Role Alignment Analyzer | fit-1-result, fit-2-detail | ANTHROPIC_API_KEY |
| Job Description Analyzer | jd-1-result | ANTHROPIC_API_KEY |
| Career Guidance Tool | career-1-result | ANTHROPIC_API_KEY |
| Curio Assistant | assistant-1-answer, assistant-2-start | ANTHROPIC_API_KEY, curio_assistant license (seeded) |
| Insights | insights-1-index, insights-2-article | Real Sanity project ID and dataset (NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET) |

To add them: start the dev server with `ANTHROPIC_API_KEY` set, add a
capture function per tool to `scripts/capture.js` (same `go`, `el`, and
`band` helpers; run each tool with realistic demo inputs for Summit Ridge
Co.), save under the file names above, run `optimize.py`, set a `crop` in
`content.js` if a small shot needs zooming, and rebuild. Each AI call
costs real API usage, so capture each result once.

Product wording to fix (seen while capturing, not part of the sheets):
Team Dynamics' Blind Spot Report says "Dominant Orientation", which the
source of truth's language rules prohibit (use "primary").
