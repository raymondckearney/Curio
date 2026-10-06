// Builds the tool sheets from content.js + shots/:
//   out/<slug>.pdf            one Letter page per tool
//   out/<slug>.html           its self-contained HTML (fonts and images embedded)
//   out/MindPrint_Tool_Sheets.pdf   every sheet in order
//   out/qa/<slug>.png         raster of each page for visual review
// Prepends overview.pdf to the combined file if it exists in this folder.
//   NODE_PATH=<playwright node_modules> node sales/tool-sheets/build.js [slug ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const SHOTS = path.join(ROOT, 'shots');
const OUT = path.join(ROOT, 'out');
const sheets = require('./content.js');
const only = process.argv.slice(2);

const FONTS_CSS = fs.readFileSync(path.join(ROOT, 'assets', 'fonts_embedded.css'), 'utf8');
// White, 10%-opacity copy of public/images/brain-fingerprint-watermark.webp,
// pre-made so the PDF stores it once instead of re-rendering a filter per page.
const MARK = fs.readFileSync(path.join(ROOT, 'assets', 'mark-white.png')).toString('base64');

// Same group colors as the portal's tool page banners.
const TONES = {
  profile:   { bg: '#0F172A', bg2: '#1E293B', accent: '#6EE7B7', sub: '#CBD5E1', label: 'Work with your profile' },
  teams:     { bg: '#065F46', bg2: '#064E3B', accent: '#A7F3D0', sub: '#D1FAE5', label: 'Teams, sessions, and meetings' },
  career:    { bg: '#1E3A5F', bg2: '#172E4D', accent: '#93C5FD', sub: '#DBEAFE', label: 'Roles and careers' },
  resources: { bg: '#134E4A', bg2: '#0F3D3A', accent: '#99F6E4', sub: '#CCFBF1', label: 'Resources and platform' },
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Screenshots are embedded as JPEG (resized once by optimize.py) to keep
// each PDF small. Each one is fitted to its frame's width, never cropped at
// the sides. An optional crop [x, y, w] (fractions of the image) zooms into
// a region: x and y are the top-left corner, w the width to show. The frame
// is never taller than the image, so there is no empty band. A missing
// screenshot renders as a labeled placeholder.
const DIMS = fs.existsSync(path.join(SHOTS, 'web', 'dims.json')) ? JSON.parse(fs.readFileSync(path.join(SHOTS, 'web', 'dims.json'), 'utf8')) : {};
const FRAME = { big: { w: 728, h: 270 }, small: { w: 356, h: 142 } };

function frame(shot, kind) {
  const { w: W, h: H } = FRAME[kind];
  const jpg = path.join(SHOTS, 'web', `${shot.file}.jpg`);
  let inner, height = H;
  if (!fs.existsSync(jpg) || !DIMS[shot.file]) {
    inner = `<div class="ph"><span>${shot.ai ? 'AI result screenshot' : shot.sanity ? 'Insights screenshot' : 'Screenshot'} to come</span><b>${esc(shot.file)}</b></div>`;
  } else {
    const [iw, ih] = DIMS[shot.file];
    const [cx, cy, cw] = shot.crop || [0, 0, 1];
    const scale = W / (iw * cw);
    const visible = ih * scale - cy * ih * scale;
    height = Math.round(Math.min(shot.h || H, visible));
    inner = `<img src="data:image/jpeg;base64,${fs.readFileSync(jpg).toString('base64')}" style="width:${(iw * scale).toFixed(1)}px;margin-left:${(-cx * iw * scale).toFixed(1)}px;margin-top:${(-cy * ih * scale).toFixed(1)}px" alt="">`;
  }
  return `<figure class="frame ${kind}"><div class="bar"><i></i><i></i><i></i></div><div class="win" style="height:${height}px">${inner}</div>${shot.caption ? `<figcaption>${esc(shot.caption)}</figcaption>` : ''}</figure>`;
}

function sheetHtml(t, i, total) {
  const tone = TONES[t.group];
  const [hero, ...rest] = t.shots;
  return `
<section class="page" style="--bg:${tone.bg};--bg2:${tone.bg2};--accent:${tone.accent};--sub:${tone.sub}">
  <header class="hdr">
    <img class="mark" src="data:image/png;base64,${MARK}" alt="">
    <div class="hdr-top"><div class="wordmark">Curio<span>.</span></div><div class="grp">${esc(tone.label)}</div></div>
    <h1>${esc(t.name)}</h1>
    <p class="promise">${esc(t.promise)}</p>
  </header>
  <div class="hero">${frame(hero, 'big')}</div>
  <main class="cols">
    <div class="col-l">
      <div class="lbl">The problem</div>
      <p class="problem">${esc(t.problem)}</p>
      <div class="lbl">What it does for you</div>
      <div class="benefits">${t.benefits.map(([h, p]) => `<div class="ben"><h4>${esc(h)}</h4><p>${esc(p)}</p></div>`).join('')}</div>
    </div>
    <div class="col-r">
      <div class="lbl">Who it serves</div>
      <div class="chips">${t.serves.map(s => `<span>${esc(s)}</span>`).join('')}</div>
      ${t.how ? `<div class="lbl">How it works</div><ol class="how">${t.how.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      ${t.outputs ? `<div class="lbl">What you get</div><ul class="out">${t.outputs.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
    </div>
  </main>
  ${rest.length ? `<div class="shots n${rest.length}">${rest.map(s => frame(s, 'small')).join('')}</div>` : ''}
  <div class="extra"><div class="know"><b>${esc(t.extra[0])}</b> ${esc(t.extra[1])}</div><div class="pairs"><span class="lbl">Pairs well with</span>${t.pairs.map(p => `<span class="pair">${esc(p)}</span>`).join('')}</div></div>
  <footer class="foot"><span class="fw">Curio<span>.</span></span><span>MindPrint™ · hello@choosecurio.com · choosecurio.com</span><span>${i + 1} / ${total}</span></footer>
</section>`;
}

const CSS = fs.readFileSync(path.join(ROOT, 'sheet.css'), 'utf8');
const doc = body => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>MindPrint™ Tool Sheets · Curio</title><style>${FONTS_CSS}\n${CSS}</style></head><body>${body}</body></html>`;

(async () => {
  fs.mkdirSync(path.join(OUT, 'qa'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
  await page.route('**/*', r => r.request().url().startsWith('http') ? r.abort() : r.continue());
  const list = sheets.filter(t => !only.length || only.includes(t.slug));
  const problems = [];
  const pdfs = [];
  for (const t of list) {
    const idx = sheets.indexOf(t);
    const html = doc(sheetHtml(t, idx, sheets.length));
    const htmlPath = path.join(OUT, `${t.slug}.html`);
    fs.writeFileSync(htmlPath, html);
    await page.goto('file://' + htmlPath);
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const p = document.querySelector('.page');
      const kids = [...p.children];
      // Natural height of every block (nothing may shrink), so any overflow shows.
      const used = kids.reduce((s, c) => s + c.getBoundingClientRect().height + parseFloat(getComputedStyle(c).marginTop) + parseFloat(getComputedStyle(c).marginBottom), 0) - (parseFloat(getComputedStyle(p.querySelector('.extra')).marginTop) || 0);
      const wide = [...p.querySelectorAll('figure')].some(f => f.getBoundingClientRect().right > p.getBoundingClientRect().right - 40);
      const clipped = [...p.querySelectorAll('.cols, .benefits, .out, .how, .know, .pairs')].filter(e => e.scrollHeight > e.clientHeight + 1).map(e => e.className);
      return { used: Math.round(used), height: p.clientHeight, clipped: wide ? [...clipped, 'figure too wide'] : clipped, fonts: document.fonts.check("700 20px Caveat") && document.fonts.check("400 12px 'DM Sans'") };
    });
    if (r.used > r.height || r.clipped.length || !r.fonts) problems.push({ slug: t.slug, ...r });
    const pdf = path.join(OUT, `${t.slug}.pdf`);
    await page.pdf({ path: pdf, width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    pdfs.push(pdf);
    await page.screenshot({ path: path.join(OUT, 'qa', `${t.slug}.png`) });
    console.log(`${r.used > r.height ? 'OVER ' : 'ok   '} ${t.slug.padEnd(28)} ${r.used}/${r.height}px${t.shots.some(s => !fs.existsSync(path.join(SHOTS, 'web', `${s.file}.jpg`))) ? '  (has placeholders)' : ''}`);
  }
  if (!only.length) {
    // Combined file: all sheets rendered as one document so the fonts are
    // embedded once, then the overview (if present) is placed in front.
    const allPath = path.join(OUT, 'MindPrint_Tool_Sheets.html');
    fs.writeFileSync(allPath, doc(sheets.map((t, i) => sheetHtml(t, i, sheets.length)).join('\n')));
    await page.goto('file://' + allPath);
    await page.waitForTimeout(800);
    const sheetsPdf = path.join(OUT, '.sheets-only.pdf');
    await page.pdf({ path: sheetsPdf, width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    const parts = [];
    const overview = path.join(ROOT, 'overview.pdf');
    if (fs.existsSync(overview)) parts.push(overview);
    parts.push(sheetsPdf);
    execFileSync('python3', ['-c', `import sys,pymupdf\nout=pymupdf.open()\nfor f in sys.argv[2:]:\n    out.insert_pdf(pymupdf.open(f))\nout.save(sys.argv[1],garbage=3,deflate=True)`, path.join(OUT, 'MindPrint_Tool_Sheets.pdf'), ...parts]);
    fs.unlinkSync(sheetsPdf);
    console.log('combined:', path.join(OUT, 'MindPrint_Tool_Sheets.pdf'), fs.existsSync(overview) ? '(with overview)' : '(no overview.pdf yet)');
  }
  await browser.close();
  if (problems.length) { console.log('PROBLEMS', JSON.stringify(problems, null, 1)); process.exitCode = 1; }
})();
