// Client-only. Team Builder's two PDF exports, built in the browser with
// jsPDF (the repo's PDF approach) from the current page state, names
// included, with no AI call:
//   downloadTeamBrief: every result section in order.
//   downloadPlans:     one section per person, each on a new page (also
//                      used for the single-person export).
// Letter size. Curio fonts (Caveat, DM Sans) are embedded from /fonts, and
// the guardrail is printed in the footer of every page. Charts are drawn
// as vector shapes, not screenshots.
import { TAGS, MIT, primaryOf, tertiaryOf, demand, overDrainBudget, drainShare } from './engine.js';
import { ENERGY_LABEL, GOTO, GUARDRAIL, DEFINITIONS, PROFILE_COLOR, headcountWhy, list, pct, H, weeksLabel } from './copy.js';
import { templatedSummary, frictionView, gapView, expectationFor, collaborators } from './view.js';

const FONT_FILES = [
  ['Caveat-Bold.ttf', 'Caveat', 'bold'],
  ['DMSans-Regular.ttf', 'DMSans', 'normal'],
  ['DMSans-SemiBold.ttf', 'DMSans', 'bold'],
];

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const C = {
  ink: rgb('#111827'), soft: rgb('#374151'), muted: rgb('#6B7280'), rule: rgb('#E5E7EB'), warm: rgb('#F9FAFB'),
  emerald: rgb('#059669'), pale: rgb('#ECFDF5'), navy: rgb('#0F172A'), onNavy: rgb('#E2E8F0'), navyMuted: rgb('#94A3B8'), mint: rgb('#6EE7B7'),
  why: rgb('#6EE7B7'), what: rgb('#93C5FD'), how: rgb('#FCD34D'),
  E: { fg: rgb('#065F46'), bg: rgb('#ECFDF5'), bar: rgb('#10B981') },
  N: { fg: rgb('#1E40AF'), bg: rgb('#EFF6FF'), bar: rgb('#60A5FA') },
  D: { fg: rgb('#92400E'), bg: rgb('#FFFBEB'), bar: rgb('#F59E0B') },
};

let fontCache = null;
async function loadFonts() {
  if (fontCache) return fontCache;
  fontCache = await Promise.all(FONT_FILES.map(async ([file, family, style]) => {
    const res = await fetch(`/fonts/${file}`);
    if (!res.ok) throw new Error(`Font ${file} could not be loaded.`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { file, family, style, b64: btoa(bin) };
  }));
  return fontCache;
}

// A small flowing-layout writer over one jsPDF document.
class Writer {
  constructor(doc, origin) {
    this.doc = doc;
    this.origin = origin;
    this.W = doc.internal.pageSize.getWidth();
    this.Hh = doc.internal.pageSize.getHeight();
    this.M = 54;
    this.maxW = this.W - this.M * 2;
    this.top = 54;
    this.bottom = this.Hh - 72;
    this.y = this.top;
  }
  font(family, style, size, color) {
    this.doc.setFont(family, style);
    this.doc.setFontSize(size);
    if (color) this.doc.setTextColor(...color);
  }
  newPage() { this.doc.addPage('letter', 'portrait'); this.y = this.top; }
  ensure(h) { if (this.y + h > this.bottom) this.newPage(); }
  gap(h) { this.y += h; }
  lines(str, { family = 'DMSans', style = 'normal', size = 10, w = this.maxW } = {}) {
    this.font(family, style, size);
    return this.doc.splitTextToSize(String(str), w);
  }
  // Wrapped text that breaks across pages line by line.
  text(str, { family = 'DMSans', style = 'normal', size = 10, color = C.soft, x = this.M, w = this.maxW, lh = 1.4, after = 0 } = {}) {
    const ls = this.lines(str, { family, style, size, w });
    this.font(family, style, size, color);
    const step = size * lh;
    for (const l of ls) {
      this.ensure(step);
      this.doc.text(l, x, this.y + size * 0.8);
      this.y += step;
    }
    this.y += after;
  }
  heading(str, size = 24, { color = C.ink, keep = 60 } = {}) {
    this.ensure(size * 1.2 + keep);
    this.font('Caveat', 'bold', size, color);
    const ls = this.doc.splitTextToSize(str, this.maxW);
    ls.forEach(l => { this.doc.text(l, this.M, this.y + size * 0.8); this.y += size * 1.05; });
    this.y += 4;
  }
  eyebrow(str, { color = C.emerald, x = this.M } = {}) {
    this.ensure(40);
    this.doc.setDrawColor(...color); this.doc.setLineWidth(1.5);
    this.doc.line(x, this.y + 4.5, x + 18, this.y + 4.5);
    this.font('DMSans', 'bold', 7.5, color);
    this.doc.text(str.toUpperCase(), x + 24, this.y + 7, { charSpace: 1.2 });
    this.y += 16;
  }
  label(str, x = this.M) {
    this.font('DMSans', 'bold', 7, C.muted);
    this.doc.text(str.toUpperCase(), x, this.y + 6, { charSpace: 0.8 });
    this.y += 11;
  }
  // Tool references: name and number, linked to the library page.
  tools(ids, toolLinks, { x = this.M } = {}) {
    for (const id of ids || []) {
      const t = toolLinks[id];
      if (!t) continue;
      this.ensure(14);
      this.font('DMSans', 'bold', 9, C.emerald);
      const s = `Tool ${id} · ${t.name}`;
      this.doc.textWithLink(s, x, this.y + 8, { url: `${this.origin}/portal/library/${t.slug}` });
      this.y += 13;
    }
  }
  badge(str, x, y, energy, size = 7.5) {
    const c = C[energy] || C.N;
    this.font('DMSans', 'bold', size, c.fg);
    const w = this.doc.getTextWidth(str) + 10;
    this.doc.setFillColor(...c.bg); this.doc.setDrawColor(...c.bar); this.doc.setLineWidth(0.5);
    this.doc.roundedRect(x, y, w, size + 6, (size + 6) / 2, (size + 6) / 2, 'FD');
    this.doc.text(str, x + 5, y + size + 1.6);
    return w;
  }
  energyBar(p, x, y, w, h = 6) {
    const t = p.load || 1;
    let cx = x;
    this.doc.setFillColor(...rgb('#F3F4F6'));
    this.doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
    for (const k of ['E', 'N', 'D']) {
      const ww = (p[k] / t) * w;
      if (ww > 0.2) { this.doc.setFillColor(...C[k].bar); this.doc.rect(cx, y, ww, h, 'F'); }
      cx += ww;
    }
  }
}

function pie(doc, cx, cy, r, byProfile) {
  let a0 = -Math.PI / 2;
  for (const t of TAGS.filter(x => byProfile[x] > 0)) {
    const v = byProfile[t];
    doc.setFillColor(...rgb(PROFILE_COLOR[t]));
    doc.setDrawColor(...C.navy); doc.setLineWidth(1.2);
    if (v >= 0.999) { doc.circle(cx, cy, r, 'FD'); continue; }
    const a1 = a0 + v * 2 * Math.PI;
    const pts = [[cx, cy]];
    const steps = Math.max(2, Math.ceil((a1 - a0) / (Math.PI / 90)));
    for (let i = 0; i <= steps; i++) { const a = a0 + (a1 - a0) * (i / steps); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    const deltas = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.lines(deltas, cx, cy, [1, 1], 'FD', true);
    a0 = a1;
  }
}

function demandBar(w, x, y, width, d, h = 14) {
  let cx = x;
  for (const [o, col] of [['WHY', C.why], ['WHAT', C.what], ['HOW', C.how]]) {
    const ww = d[o] * width;
    if (ww <= 0) continue;
    w.doc.setFillColor(...col); w.doc.rect(cx, y, ww, h, 'F');
    if (d[o] >= 0.08) { w.font('DMSans', 'bold', 7.5, C.navy); w.doc.text(pct(d[o]), cx + ww / 2, y + h / 2 + 2.7, { align: 'center' }); }
    cx += ww;
  }
}

// Navy panel sized to its content: measure, then draw.
function navyPanel(w, height, draw) {
  w.ensure(height);
  const y0 = w.y;
  w.doc.setFillColor(...C.navy);
  w.doc.roundedRect(w.M, y0, w.maxW, height, 12, 12, 'F');
  draw(y0);
  w.y = y0 + height + 16;
}

function footers(doc, W, Hh) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.rule); doc.setLineWidth(0.6);
    doc.line(54, Hh - 58, W - 54, Hh - 58);
    doc.setFont('DMSans', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.muted);
    const ls = doc.splitTextToSize(GUARDRAIL, W - 108 - 60);
    doc.text(ls, 54, Hh - 47);
    doc.text(`${i} of ${n}`, W - 54, Hh - 47, { align: 'right' });
  }
}

async function newDoc() {
  const [{ jsPDF }, fonts] = await Promise.all([import('jspdf'), loadFonts()]);
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
  for (const f of fonts) { doc.addFileToVFS(f.file, f.b64); doc.addFont(f.file, f.family, f.style); }
  doc.setFont('DMSans', 'normal');
  return new Writer(doc, typeof window !== 'undefined' ? window.location.origin : '');
}

function cover(w, eyebrow, title, sub, meta) {
  const h = sub ? 150 : 128;
  w.doc.setFillColor(...C.navy);
  w.doc.rect(0, 0, w.W, h, 'F');
  w.font('DMSans', 'bold', 7.5, C.mint);
  w.doc.text(eyebrow.toUpperCase(), w.M, 44, { charSpace: 1.4 });
  w.font('Caveat', 'bold', 34, [255, 255, 255]);
  w.doc.text(title, w.M, 80);
  if (sub) { w.font('DMSans', 'bold', 11, rgb('#A7F3D0')); w.doc.text(w.doc.splitTextToSize(sub, w.maxW)[0], w.M, 104); }
  w.font('DMSans', 'normal', 8.5, C.navyMuted);
  w.doc.text(meta, w.M, h - 22);
  w.y = h + 28;
}

function metaLine(V) {
  const s = V.state;
  const bits = [];
  if (+s.weeks) bits.push(`${s.weeks} weeks`);
  if (+s.hours) bits.push(H(+s.hours).replace(' h', ' hours'));
  bits.push(`${s.acts.length} activities`);
  bits.push(`Prepared ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  return bits.join(' · ');
}
const projectLine = V => [V.state.project?.name, V.state.project?.client].filter(Boolean).join(' · ');
const fileSlug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// ── Team brief ──────────────────────────────────────────────────────────
export async function downloadTeamBrief(V, narrative, toolLinks) {
  const w = await newDoc();
  const { R } = V;
  cover(w, 'MindPrint™ Team Builder · Team brief', R.usingRoster ? 'The recommended allocation' : 'The recommended team', projectLine(V), metaLine(V));

  // Summary
  w.eyebrow('Summary');
  w.text(narrative?.summary || templatedSummary(V), { size: 11, color: C.soft, after: 12 });
  const half = (w.maxW - 14) / 2;
  const hcLines = w.lines(headcountWhy(R.headcount), { size: 8.5, w: half - 24 });
  const lead = V.personByKey[R.engagementLead];
  const leadText = lead ? `Engagement lead: ${V.nameOf(lead.key)} (${lead.profile}). Owns the most direction-setting, planning and client-facing work, and is the client’s main contact.` : '';
  const leadLines = w.lines(leadText, { size: 9, w: half - 24 });
  const phaseLines = R.phaseOwners.flatMap(x => w.lines(`${V.phaseByKey[x.phase].name} (${weeksLabel(V.phaseByKey[x.phase])}): ${V.nameOf(x.person)} owns the most work`, { size: 9, w: half - 34 }));
  const boxH = Math.max(28 + 40 + hcLines.length * 11.5, 28 + leadLines.length * 12.6 + 6 + phaseLines.length * 12.6) + 10;
  w.ensure(boxH);
  const by = w.y;
  for (const x of [w.M, w.M + half + 14]) { w.doc.setFillColor(...C.warm); w.doc.setDrawColor(...C.rule); w.doc.setLineWidth(1); w.doc.roundedRect(x, by, half, boxH, 12, 12, 'FD'); }
  w.font('DMSans', 'normal', 8.5, C.muted); w.doc.text('Headcount range', w.M + 12, by + 18);
  w.font('Caveat', 'bold', 32, C.ink); w.doc.text(`${R.headcount.lo} to ${R.headcount.hi} people`, w.M + 12, by + 52);
  w.font('DMSans', 'normal', 8.5, C.muted); w.doc.text(hcLines, w.M + 12, by + 70, { lineHeightFactor: 1.35 });
  const x2 = w.M + half + 26;
  w.font('DMSans', 'normal', 8.5, C.muted); w.doc.text('Team structure', x2, by + 18);
  w.font('DMSans', 'normal', 9, C.soft); w.doc.text(leadLines, x2, by + 34, { lineHeightFactor: 1.4 });
  let py = by + 34 + leadLines.length * 12.6 + 6;
  for (const x of R.phaseOwners) {
    const ls = w.lines(`${V.phaseByKey[x.phase].name} (${weeksLabel(V.phaseByKey[x.phase])}): ${V.nameOf(x.person)} owns the most work`, { size: 9, w: half - 34 });
    w.font('DMSans', 'normal', 9, C.soft); w.doc.circle(x2 + 2, py - 3, 1.3, 'F');
    w.doc.text(ls, x2 + 10, py, { lineHeightFactor: 1.4 });
    py += ls.length * 12.6;
  }
  w.y = by + boxH + 20;

  // The shape of the work
  const legend = TAGS.filter(t => R.byProfile[t] > 0).sort((a, b) => R.byProfile[b] - R.byProfile[a]);
  const seatCount = t => R.ideal.filter(s => s.profile === t).length;
  navyPanel(w, Math.max(190, 70 + legend.length * 18), y0 => {
    w.font('Caveat', 'bold', 22, [255, 255, 255]); w.doc.text('The shape of the work', w.M + 18, y0 + 30);
    w.font('DMSans', 'normal', 8.5, C.navyMuted); w.doc.text('Share of total effort by the profile each activity calls for. The ideal team puts seats where the effort sits.', w.M + 18, y0 + 46);
    pie(w.doc, w.M + 88, y0 + 120, 56, R.byProfile);
    let ly = y0 + 76;
    for (const t of legend) {
      w.doc.setFillColor(...rgb(PROFILE_COLOR[t])); w.doc.roundedRect(w.M + 180, ly - 7, 8, 8, 2, 2, 'F');
      w.font('DMSans', 'bold', 9.5, [255, 255, 255]); w.doc.text(t, w.M + 196, ly); w.doc.text(pct(R.byProfile[t]), w.M + 266, ly);
      w.font('DMSans', 'normal', 9, C.navyMuted); w.doc.text(seatCount(t) ? `${seatCount(t)} seat${seatCount(t) > 1 ? 's' : ''} in the ideal team` : 'Covered by a contributor', w.M + 300, ly);
      ly += 18;
    }
  });

  // Energy demand map
  const mapRows = [{ name: 'All work combined', sub: 'Every activity', d: R.demand }, ...V.phasesWithWork.map(p => ({ name: p.name, sub: p.ongoing ? 'Runs across all phases' : weeksLabel(p), d: demand(V.state.acts.filter(a => a.phase === p.key)) }))];
  navyPanel(w, 64 + mapRows.length * 28 + 54, y0 => {
    w.font('Caveat', 'bold', 22, [255, 255, 255]); w.doc.text('Energy demand map', w.M + 18, y0 + 30);
    w.font('DMSans', 'normal', 8.5, C.navyMuted); w.doc.text('How the WHY, WHAT and HOW demand shifts across the project.', w.M + 18, y0 + 46);
    let ry = y0 + 66;
    for (const r of mapRows) {
      w.font('DMSans', 'bold', 9, [255, 255, 255]); w.doc.text(r.name, w.M + 18, ry + 6);
      w.font('DMSans', 'normal', 7.5, C.navyMuted); w.doc.text(r.sub, w.M + 18, ry + 16);
      demandBar(w, w.M + 140, ry, w.maxW - 158, r.d, 16);
      ry += 28;
    }
    let lx = w.M + 18;
    for (const [o, l, col] of [['WHY', 'Purpose', C.why], ['WHAT', 'Progress', C.what], ['HOW', 'Precision', C.how]]) {
      w.doc.setFillColor(...col); w.doc.circle(lx + 3, ry + 5, 3, 'F');
      w.font('DMSans', 'normal', 8.5, C.onNavy); w.doc.text(`${o} · ${l}`, lx + 10, ry + 8);
      lx += 90;
    }
    w.font('DMSans', 'normal', 7.5, C.navyMuted);
    w.doc.text(w.doc.splitTextToSize('Ongoing work, such as project management, runs alongside every phase. It has its own row so each phase shows only its own work.', w.maxW - 36), w.M + 18, ry + 26);
  });

  // Who carries what
  w.ensure(260);
  w.eyebrow('Roles');
  w.heading('Who carries what', 26);
  w.text('Every activity has one owner. Depending on how it is delivered, it may also have contributors and a reviewer.', { after: 8 });
  for (const [t, b] of DEFINITIONS) {
    w.ensure(30);
    w.text(t, { style: 'bold', size: 9.5, color: C.ink });
    w.text(b, { size: 8.5, color: C.muted, after: 6 });
  }
  w.gap(6);
  for (const p of R.people) personBlock(w, V, p, toolLinks);

  // Matrix
  w.newPage();
  w.eyebrow('Owner and contributor matrix');
  w.heading('Every activity, every person', 26);
  matrix(w, V);

  // Gaps
  w.gap(18);
  w.eyebrow('Coverage');
  w.heading('Gaps to close', 26);
  if (R.gaps.length) {
    for (const g of R.gaps) {
      const t = gapView(V, g);
      flagBox(w, t.lead, t.body, 'D', t.tools, toolLinks);
    }
  } else flagBox(w, null, 'Every orientation the work needs has a primary on the team, every activity has an owner who is energized or neutral doing it, and no one is over capacity.', 'E');
  if (R.usingRoster) w.text(`For comparison, the ideal shape for this work is ${R.ideal.map(s => s.profile).join(', ')}.`, { size: 8.5, color: C.muted, after: 6 });

  // Friction
  w.gap(14);
  w.eyebrow('Friction forecast');
  w.heading('Where the work will strain, and what to do', 26);
  const fr = R.friction.map(f => frictionView(V, f, narrative));
  if (!fr.length) flagBox(w, null, 'None of the recurring friction patterns applies to this mix of profiles.', 'E');
  for (const f of fr) {
    w.ensure(120);
    w.heading(f.title, 20, { keep: 50 });
    w.text(`${f.aName} (${f.aProfile}) and ${f.bName} (${f.bProfile})`, { size: 8.5, color: C.muted, after: 4 });
    w.text(f.what, { size: 9.5, after: 6 });
    w.label('Where it shows up');
    w.text(f.where, { size: 9, after: 6 });
    w.label('What to do');
    for (const s of f.steps) bullet(w, s);
    w.gap(2);
    w.tools(f.tools, toolLinks);
    w.gap(14);
  }

  footers(w.doc, w.W, w.Hh);
  w.doc.save(`team-brief${fileSlug(V.state.project?.name) ? '-' + fileSlug(V.state.project.name) : ''}.pdf`);
}

function bullet(w, s, { size = 9, x = w.M } = {}) {
  const ls = w.lines(s, { size, w: w.maxW - (x - w.M) - 12 });
  w.font('DMSans', 'normal', size, C.soft);
  ls.forEach((l, i) => {
    w.ensure(size * 1.4);
    if (i === 0) { w.doc.setFillColor(...C.soft); w.doc.circle(x + 2.5, w.y + size * 0.5, 1.3, 'F'); }
    w.doc.text(l, x + 12, w.y + size * 0.8);
    w.y += size * 1.4;
  });
  w.y += 2;
}

function flagBox(w, lead, body, energy, tools, toolLinks) {
  const c = C[energy];
  const inner = w.maxW - 24;
  const leadLines = lead ? w.lines(lead, { style: 'bold', size: 9.5, w: inner }) : [];
  const bodyLines = w.lines(body, { size: 9.5, w: inner });
  const toolCount = (tools || []).filter(t => toolLinks?.[t]).length;
  const h = 16 + (leadLines.length + bodyLines.length) * 13.3 + (toolCount ? 6 + toolCount * 13 : 0);
  w.ensure(h + 8);
  const y0 = w.y;
  w.doc.setFillColor(...c.bg); w.doc.setDrawColor(...c.bar); w.doc.setLineWidth(0.6);
  w.doc.roundedRect(w.M, y0, w.maxW, h, 8, 8, 'FD');
  let y = y0 + 10;
  w.font('DMSans', 'bold', 9.5, c.fg); leadLines.forEach(l => { w.doc.text(l, w.M + 12, y + 7.6); y += 13.3; });
  w.font('DMSans', 'normal', 9.5, c.fg); bodyLines.forEach(l => { w.doc.text(l, w.M + 12, y + 7.6); y += 13.3; });
  w.y = y + 4;
  if (toolCount) w.tools(tools, toolLinks, { x: w.M + 12 });
  w.y = y0 + h + 8;
}

function personBlock(w, V, p, toolLinks) {
  const t = p.load || 1;
  const by = role => p.items.filter(i => i.role === role).map(i => V.actName(i.act));
  const di = p.items.filter(i => i.energy === 'D');
  w.ensure(150);
  w.doc.setDrawColor(...C.rule); w.doc.setLineWidth(1); w.doc.line(w.M, w.y, w.M + w.maxW, w.y);
  w.gap(10);
  w.text(`${V.nameOf(p.key)}${V.R.engagementLead === p.key ? ' · Engagement lead' : ''}`, { size: 8.5, color: C.muted });
  w.font('Caveat', 'bold', 22, C.ink); w.doc.text(p.profile, w.M, w.y + 18);
  const pw = w.doc.getTextWidth(p.profile);
  w.font('DMSans', 'bold', 10, C.ink); w.doc.text(p.role, w.M + pw + 10, w.y + 16);
  w.y += 26;
  w.text(`About ${H(p.load)}, ${pct(p.load / p.cap)} of available time`, { size: 8.5, color: C.muted });
  w.energyBar(p, w.M, w.y + 2, 200); w.y += 12;
  w.text(`Energizing ${pct(p.E / t)} · Neutral ${pct(p.N / t)} · Draining ${pct(p.D / t)}`, { size: 8.5, color: C.muted, after: 4 });
  for (const [label, items] of [['Owns', by('Owner')], ['Contributes to', by('Contributor')], ['Reviews', by('Reviewer')]]) {
    if (!items.length) continue;
    w.ensure(28); w.label(label); w.text(list(items), { size: 9, after: 4 });
  }
  w.ensure(28); w.label('Draining work');
  w.text(di.length ? list(di.map(i => `${V.actName(i.act)} (${i.role.toLowerCase()})`)) : 'None. Nothing assigned sits in their tertiary orientation.', { size: 9, after: 6 });
  if (overDrainBudget(p)) {
    const tt = tertiaryOf(p.profile);
    flagBox(w, 'Over the drain budget.', `${pct(drainShare(p))} of this workload is draining, against a 20% limit. ${MIT[tt].text}`, 'D', MIT[tt].tools, toolLinks);
  }
  w.gap(10);
}

function matrix(w, V) {
  const { R } = V;
  const P = R.people;
  const doc = w.doc;
  const actW = 170, delW = 54, hrsW = 40;
  const colW = (w.maxW - actW - delW - hrsW) / Math.max(1, P.length);
  const short = colW < 52;
  const ROLE_SHORT = { Owner: 'O', Contributor: 'C', Reviewer: 'R' };
  const header = () => {
    const hh = 30;
    doc.setFillColor(...C.warm); doc.rect(w.M, w.y, w.maxW, hh, 'F');
    w.font('DMSans', 'bold', 6.8, C.muted);
    doc.text('ACTIVITY', w.M + 6, w.y + 18, { charSpace: 0.5 });
    doc.text('DELIVERY', w.M + actW + 4, w.y + 18, { charSpace: 0.5 });
    doc.text('HOURS', w.M + actW + delW + 4, w.y + 18, { charSpace: 0.5 });
    P.forEach((p, i) => {
      const x = w.M + actW + delW + hrsW + i * colW + 3;
      w.font('DMSans', 'bold', 7, C.ink); doc.text(doc.splitTextToSize(V.nameOf(p.key), colW - 6)[0], x, w.y + 12);
      w.font('DMSans', 'normal', 6.5, C.muted); doc.text(p.profile, x, w.y + 22);
    });
    doc.setDrawColor(...C.rule); doc.setLineWidth(1); doc.line(w.M, w.y + hh, w.M + w.maxW, w.y + hh);
    w.y += hh;
  };
  w.ensure(60);
  // Legend
  let lx = w.M;
  for (const k of ['E', 'N', 'D']) { lx += w.badge(ENERGY_LABEL[k], lx, w.y, k, 7.5) + 6; }
  w.font('DMSans', 'normal', 8, C.muted);
  doc.text(`Color shows what the role costs that person.${short ? ' O = Owner, C = Contributor, R = Reviewer.' : ''}`, lx + 4, w.y + 9.5);
  w.y += 22;
  header();
  let lastPhase = null;
  for (const r of R.rows) {
    const a = V.actByKey[r.act];
    const nameLines = w.lines(a.name, { size: 8.5, w: actW - 10 });
    const rowH = Math.max(24, nameLines.length * 10.5 + 14);
    const needPhase = a.phase !== lastPhase;
    if (w.y + rowH + (needPhase ? 18 : 0) > w.bottom) { w.newPage(); header(); lastPhase = null; }
    if (a.phase !== lastPhase) {
      const ph = V.phaseOf(r.act);
      doc.setFillColor(...C.warm); doc.rect(w.M, w.y, w.maxW, 18, 'F');
      w.font('DMSans', 'bold', 7, C.emerald); doc.text(`${ph.name} · ${weeksLabel(ph)}`.toUpperCase(), w.M + 6, w.y + 12, { charSpace: 0.8 });
      w.y += 18; lastPhase = a.phase;
    }
    w.font('DMSans', 'normal', 8.5, C.ink); doc.text(nameLines, w.M + 6, w.y + 10, { lineHeightFactor: 1.25 });
    w.font('DMSans', 'normal', 7, C.muted); doc.text(a.tag, w.M + 6, w.y + 10 + nameLines.length * 10.6);
    w.font('DMSans', 'normal', 8, C.soft); doc.text(a.mode, w.M + actW + 4, w.y + 12);
    w.font('DMSans', 'normal', 8, C.muted); doc.text(H(r.hours), w.M + actW + delW + 4, w.y + 12);
    P.forEach((p, i) => {
      const role = V.roleOf(r, p.key);
      if (!role) return;
      const item = p.items.find(x => x.act === r.act && x.role === role);
      w.badge(short ? ROLE_SHORT[role] : role, w.M + actW + delW + hrsW + i * colW + 3, w.y + 4, item?.energy || 'N', short ? 7.5 : 6.8);
    });
    w.y += rowH;
    doc.setDrawColor(...C.rule); doc.setLineWidth(0.5); doc.line(w.M, w.y, w.M + w.maxW, w.y);
  }
}

// ── Individual plans ────────────────────────────────────────────────────
export async function downloadPlans(V, narrative, toolLinks, keys) {
  const w = await newDoc();
  const people = keys.map(k => V.personByKey[k]).filter(Boolean);
  people.forEach((p, i) => {
    if (i > 0) w.newPage();
    planSection(w, V, p, narrative, toolLinks);
  });
  footers(w.doc, w.W, w.Hh);
  const single = people.length === 1 ? fileSlug(V.nameOf(people[0].key)) : '';
  w.doc.save(single ? `plan-${single}.pdf` : 'individual-plans.pdf');
}

function planSection(w, V, p, narrative, toolLinks) {
  const t = p.load || 1;
  const name = V.nameOf(p.key);
  const count = role => p.items.filter(i => i.role === role).length;
  const isLead = V.R.engagementLead === p.key;
  cover(w, `MindPrint™ Team Builder · Individual plan${projectLine(V) ? ' · ' + projectLine(V) : ''}`, name, `${p.profile} · ${p.role}${isLead ? ' · Engagement lead' : ''}`, metaLine(V));
  w.text(`About ${H(p.load)} over ${V.state.weeks || 12} weeks, ${pct(p.load / p.cap)} of available time. Owns ${count('Owner')} activities, contributes to ${count('Contributor')} and reviews ${count('Reviewer')}. Energizing ${pct(p.E / t)}, neutral ${pct(p.N / t)}, draining ${pct(p.D / t)}.`, { size: 10, after: 6 });
  w.energyBar(p, w.M, w.y, 240, 7); w.y += 16;
  const intro = narrative?.people?.[p.key]?.planIntro;
  if (intro) w.text(intro, { size: 10.5, color: C.ink, after: 8 });

  w.gap(6);
  w.heading('The work, phase by phase', 24);
  const phases = V.phasesWithWork.filter(x => p.items.some(i => V.actByKey[i.act]?.phase === x.key));
  for (const ph of phases) {
    w.ensure(70);
    w.eyebrow(`${ph.name} · ${weeksLabel(ph)}`);
    for (const i of p.items.filter(x => V.actByKey[x.act]?.phase === ph.key)) {
      const r = V.rowByAct[i.act];
      const a = V.actByKey[i.act];
      const others = [r.owner, ...r.contribs, r.reviewer].filter(k => k && k !== p.key);
      w.ensure(64);
      const y0 = w.y;
      w.font('DMSans', 'bold', 10, C.ink);
      const nameLines = w.doc.splitTextToSize(a.name, w.maxW - 170);
      w.doc.text(nameLines, w.M, y0 + 9, { lineHeightFactor: 1.3 });
      const bw = w.badge(i.role, w.M + w.maxW - 160, y0, i.energy, 7.5);
      w.font('DMSans', 'normal', 8, C.muted); w.doc.text(`${a.mode} · ${H(i.hours)}`, w.M + w.maxW - 160 + bw + 6, y0 + 9);
      w.y = y0 + Math.max(16, nameLines.length * 13) + 2;
      w.text(expectationFor(V, p, i, narrative), { size: 9.5, after: 2 });
      w.text(`${others.length ? `Works with ${list(others.map(k => `${V.nameOf(k)} (${V.roleOf(r, k).toLowerCase()})`))}.` : 'Solo work.'} ${ENERGY_LABEL[i.energy]} for ${name}.`, { size: 8.5, color: C.muted, after: 10 });
    }
    w.gap(4);
  }

  w.gap(6);
  w.heading('Who to go to for what', 24);
  const coll = collaborators(V, p);
  if (!coll.length) w.text('No shared activities on this plan.', { after: 6 });
  for (const c of coll) {
    const x = V.personByKey[c.key];
    w.ensure(56);
    w.text(`${V.nameOf(c.key)} · ${x.profile}`, { style: 'bold', size: 10, color: C.ink });
    w.text(`Go to ${V.nameOf(c.key)} for ${GOTO[primaryOf(x.profile)]}.`, { size: 9.5 });
    w.text(`Shared work: ${list(c.acts)}`, { size: 8.5, color: C.muted, after: 8 });
  }

  w.gap(6);
  w.heading('Watch for', 24);
  const di = p.items.filter(i => i.energy === 'D');
  const tt = tertiaryOf(p.profile);
  if (di.length) flagBox(w, list(di.map(i => V.actName(i.act))), `${di.length > 1 ? 'Sit' : 'Sits'} in ${tt}, ${name}’s tertiary orientation, and will cost energy. ${MIT[tt].text}`, 'D', MIT[tt].tools, toolLinks);
  else flagBox(w, null, `Nothing on this plan sits in ${tt}, ${name}’s tertiary orientation.`, 'E');
}
