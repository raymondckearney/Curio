// Captures the screenshots used on the tool sheets, logged in as a demo
// person from .demo.json (see seed-demo.js). Run against a dev server
// started with the same PORTAL_SECRET used by seed-demo.js:
//   NODE_PATH=<playwright node_modules> node sales/tool-sheets/scripts/capture.js [tool ...]
// Each tool's function saves 1-3 cropped, 2x-resolution PNGs to shots/.
// Tools marked "needs AI" call the Anthropic API through the app, so the
// dev server must also have ANTHROPIC_API_KEY. Their responses are saved to
// .ai-cache/ (not committed) the first time, and replayed on later runs, so
// re-shooting or re-cropping costs nothing. Delete a tool's file there to
// get a fresh result. NO_CACHE=1 skips the cache entirely.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'shots');
const demo = JSON.parse(fs.readFileSync(path.join(ROOT, '.demo.json'), 'utf8'));
const BASE = process.env.BASE || 'http://localhost:3100';
const only = process.argv.slice(2);
const CACHE = path.join(ROOT, '.ai-cache');
// The endpoints that call the Anthropic API.
const AI_ROUTES = /\/api\/(portal\/(companion|tertiary-task-classify|assistant)|meeting-architect\/generate|analyze|career-guidance)(\?|$)/;

// Hide the floating Ask Curio button, its hint bubble, and dev overlays.
async function prep(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' && !el.closest('aside, .portal-sidebar') && el.getBoundingClientRect().width < 520) el.style.visibility = 'hidden';
    }
    document.querySelectorAll('nextjs-portal').forEach(n => n.remove());
  });
  await page.waitForTimeout(300);
}

async function go(page, url, settle = 900) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(settle);
  await prep(page);
}

// Screenshot one element, with some breathing room around it.
// maxH caps the height (CSS px) for long AI results.
async function el(page, locator, file, pad = 0, maxH = Infinity) {
  const loc = typeof locator === 'string' ? page.locator(locator).first() : locator;
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error(`not found for ${file}`);
  const sy = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `${OUT}/${file}.png`, clip: { x: Math.max(0, b.x - pad), y: b.y + sy - pad, width: b.width + pad * 2, height: Math.min(b.height, maxH) + pad * 2 }, fullPage: true });
}

// Records (or replays) every AI response a tool makes, keyed by endpoint and
// order of the call, so each AI result is generated once. Calls made in
// parallel are keyed in the order they were sent.
async function aiCache(page, name) {
  const file = path.join(CACHE, `${name}.json`);
  const saved = !process.env.NO_CACHE && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const fresh = {};
  const seen = {};
  await page.route(AI_ROUTES, async route => {
    const req = route.request();
    if (req.method() !== 'POST') return route.continue();
    const ep = new URL(req.url()).pathname;
    const key = `${ep}#${seen[ep] = (seen[ep] || 0) + 1}`;
    if (saved[key]) { console.log('  replay', key); return route.fulfill(saved[key]); }
    console.log('  AI call', key);
    const res = await route.fetch({ timeout: 300000 });
    const entry = { status: res.status(), contentType: res.headers()['content-type'] || 'application/json', body: await res.text() };
    if (res.ok()) {
      fresh[key] = entry;
      fs.mkdirSync(CACHE, { recursive: true });
      fs.writeFileSync(file, JSON.stringify({ ...saved, ...fresh }, null, 1));
    } else console.log('  AI error', res.status(), entry.body.slice(0, 200));
    return route.fulfill(entry);
  });
  return () => page.unroute(AI_ROUTES);
}

// Switch the logged-in demo person (see .demo.json people).
async function loginAs(page, who) {
  await page.context().addCookies([{ name: 'curio_portal', value: demo.people[who].cookie, url: BASE }]);
}

// Run one AI tool: record/replay its calls, log in as `who`, run `fn`, and
// keep a full-page fallback shot in .ai-cache/ in case a crop selector misses.
async function aiTool(page, name, who, fn) {
  const stop = await aiCache(page, name);
  await loginAs(page, who);
  try { await fn(); }
  finally {
    await page.screenshot({ path: path.join(CACHE, `${name}-full.png`), fullPage: true }).catch(() => {});
    await stop();
    await loginAs(page, process.env.AS || 'maya');
  }
}

// Wait for a button to finish its "working" state (AI calls can take minutes).
async function waitIdle(page, selector, timeout = 300000) {
  await page.waitForFunction(sel => { const b = document.querySelector(sel); return b && !b.disabled; }, selector, { timeout, polling: 500 });
}

// Screenshot a vertical band of the main column, from the top of one
// element to the bottom of another (or a fixed height).
async function band(page, fromLoc, toLocOrHeight, file, pad = 16) {
  const a = await (typeof fromLoc === 'string' ? page.locator(fromLoc).first() : fromLoc).boundingBox();
  let bottom;
  if (typeof toLocOrHeight === 'number') bottom = a.y + toLocOrHeight;
  else { const z = await (typeof toLocOrHeight === 'string' ? page.locator(toLocOrHeight).first() : toLocOrHeight).boundingBox(); bottom = z.y + z.height; }
  const hasMain = await page.locator('main').count();
  const main = hasMain ? await page.locator('main').first().boundingBox() : { x: 0, width: await page.evaluate(() => document.documentElement.clientWidth) };
  const sy = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `${OUT}/${file}.png`, clip: { x: main.x, y: a.y + sy - pad, width: main.width, height: bottom - a.y + pad * 2 }, fullPage: true });
}

const shots = {
  async profile(page) {
    await go(page, '/portal/dashboard', 2500);
    await el(page, '.dash-hero', 'profile-1-hero');
    await band(page, 'text=Where You Add the Most Value', 560, 'profile-2-value').catch(e => console.log('  value:', e.message));
    await band(page, 'text=Who You Are', 520, 'profile-3-body').catch(() => {});
  },
  async fieldguide(page) {
    await go(page, '/portal/library/field-guide/why-what');
    await band(page, 'h1', 560, 'fieldguide-1-top', 24);
    await band(page, 'text=How You Land', 620, 'fieldguide-2-land', 20);
    await band(page, 'text=The Three Adjustments', 560, 'fieldguide-3-adjust', 20);
  },
  async delegation(page) {
    await go(page, '/portal/tools/ai-delegation-guide');
    await el(page, '.tool-header-band', 'delegation-1-header');
    await el(page, 'table', 'delegation-2-table', 12);
  },
  async dynamics(page) {
    await go(page, '/portal/team-dynamics', 1200);
    const tab = async name => { await page.locator('button', { hasText: new RegExp(`^${name}$`) }).first().click(); await page.waitForTimeout(500); };
    await tab('Team Canvas');
    await el(page, page.locator('.wd-card').nth(1), 'dynamics-1-canvas', 8);
    await tab('Friction Spotter');
    const sels = page.locator('select.wd-select');
    await sels.nth(0).selectOption({ label: 'Maya Chen (WHY-WHAT)' });
    await sels.nth(1).selectOption({ label: 'Marcus Webb (HOW-WHAT)' });
    await page.waitForTimeout(500);
    await page.waitForSelector('.wd-friction-result', { timeout: 5000 });
    await band(page, '.wd-friction-result', '.wd-friction-result', 'dynamics-2-friction', 8);
    await tab('Energy Map');
    await el(page, '.wd-card', 'dynamics-3-energy', 8);
    await tab('Problem Match');
    await page.locator('button', { hasText: /^Execution$/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    await band(page, '.wd-card', page.locator('.wd-card').last(), 'dynamics-4-problem', 8);
    await tab('Blind Spot Report');
    await band(page, '.wd-card', page.locator('.wd-card').last(), 'dynamics-5-blindspot', 8);
  },
  async session(page) {
    await go(page, '/portal/tools/session-architect', 1200);
    await page.click('text=Build the session');
    await page.waitForTimeout(1500);
    await prep(page);
    const titles = page.locator('.sa-section-title');
    const n = await titles.count();
    const names = [];
    for (let i = 0; i < n; i++) names.push((await titles.nth(i).innerText()).trim());
    console.log('  session sections:', names.join(' | '));
    // Agenda: from the first result section title to the next one.
    const idx = names.findIndex(t => /agenda/i.test(t));
    if (idx >= 0 && idx + 1 < n) await band(page, `.sa-section-title >> nth=${idx}`, 900, 'session-1-agenda', 8);
    await el(page, page.locator('.sa-as-eyebrow').nth(1).locator('xpath=..'), 'session-2-activity', 6);
    const roles = names.findIndex(t => /watch-fors/i.test(t));
    if (roles >= 0) await band(page, `.sa-section-title >> nth=${roles}`, 640, 'session-3-roles', 8);
  },
  async onboarding(page) {
    await go(page, '/portal/onboarding-resources');
    await page.locator('.or-profile-pill', { hasText: /^HOW.WHAT$/ }).first().click();
    await page.waitForTimeout(400);
    await band(page, '.or-hero', 760, 'onboarding-1-manager', 0);
    await el(page, page.locator('.or-card').filter({ has: page.locator('.or-card-title', { hasText: /^The 90-Day Check-Ins$/ }) }).first(), 'onboarding-2-checkins', 8);
    await page.click('text=New Hire View');
    await page.waitForTimeout(400);
    await band(page, '.or-content-header', 520, 'onboarding-3-newhire', 8);
  },
  async library(page) {
    await go(page, '/portal/library');
    await band(page, 'h1', 900, 'library-1-index', 56);
    await go(page, '/portal/library/tool-01-vision-to-task-decomposition');
    await band(page, 'h1', 820, 'library-2-resource', 40);
  },
  async admin(page) {
    await go(page, '/portal/team', 1200);
    await band(page, 'main h1', 760, 'admin-1-team', 24);
    await go(page, '/portal/tokens', 1200);
    await band(page, 'main h1', 760, 'admin-2-send', 24);
    await go(page, '/portal/analytics', 1500);
    await band(page, 'main h1', 860, 'admin-3-analytics', 24);
  },
  async tips(page) {
    // Run render-tip-email.js first; it writes shots/tips-email.html.
    await page.setViewportSize({ width: 760, height: 1000 });
    for (const [n, f] of [[1, 'tips-email.html'], [2, 'tips-email-2.html'], [3, 'tips-email-3.html']]) {
      await page.goto('file://' + path.join(OUT, f));
      await page.waitForTimeout(800);
      await el(page, 'table', `tips-${n}-email`, 24);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  },
  async forms(page) {
    // Input screens for the AI tools, filled with sample entries (no AI call).
    await go(page, '/portal/tools/meeting-architect', 1200);
    await page.fill('textarea[placeholder^="What do you want this meeting"]', 'Surface blockers early, keep decisions moving, and end with clear owners.');
    await page.fill('textarea[placeholder^="What\'s going wrong"]', 'Runs 20 minutes over, turns into live problem-solving, and the quieter people never get a word in.');
    await band(page, 'text=1. The meeting', 600, 'meeting-2-form', 12);
    await go(page, '/portal/tools/jd', 1000);
    await page.fill('textarea', 'Product Operations Manager. You will own the systems that keep our product teams shipping: release planning, roadmap tooling, and the rituals that connect strategy to delivery. You will partner with product leaders to turn priorities into plans, run quarterly planning, track delivery health across six teams, and continuously improve how we work. You thrive on structure, love a well-run process, and can rally busy people around a deadline.');
    await band(page, '.tool-header', 640, 'jd-2-form', 12);
    await go(page, '/portal/tools/career', 1200);
    await page.fill('input[placeholder^="e.g. technology"]', 'Healthcare technology').catch(() => {});
    await page.fill('input[placeholder^="e.g. autonomy"]', 'Building something meaningful, room to set direction').catch(() => {});
    await band(page, '.tool-header', 760, 'career-2-form', 12);
  },
  async tools(page) {
    await go(page, '/portal/tools', 1200);
    await band(page, 'main h1', 860, 'tools-1-page', 24);
  },
  // ---- AI tools (need ANTHROPIC_API_KEY on the dev server; cached in .ai-cache/) ----
  async classify(page) {
    // Maya is WHY-WHAT, so HOW is her tertiary: a detailed rollout checklist is squarely in it.
    await aiTool(page, 'classify', 'maya', async () => {
      await go(page, '/portal/tools/ai-delegation-guide', 1200);
      await page.fill('textarea[placeholder^="e.g. I need to write detailed release notes"]', 'Build the step-by-step rollout checklist for moving all six product teams onto the new release calendar, with owners and dates for every task.');
      await page.click('button:has-text("Classify Task")');
      await page.waitForFunction(() => !document.body.innerText.includes('Classifying…'), null, { timeout: 180000 });
      await page.waitForTimeout(600);
      await el(page, page.locator('h2', { hasText: 'Classify a task of your own' }).locator('xpath=..'), 'delegation-3-classify', 10);
    });
  },
  async companions(page) {
    // Each companion is shown to the person whose tertiary it supports, so the banner reads as a match.
    const runForm = async (url, tab, fill, file) => {
      await go(page, url, 1200);
      await page.locator('button', { hasText: new RegExp(`^${tab}$`) }).first().click();
      await page.waitForTimeout(300);
      const boxes = page.locator('main textarea');
      for (const [i, v] of fill.entries()) await boxes.nth(i).fill(v);
      await page.locator('main button', { hasText: /^(Generate breakdown|Write the broadcast|Draft the page)$/ }).first().click();
      await page.locator('span', { hasText: 'Your draft to judge' }).first().waitFor({ timeout: 300000 });
      await page.waitForTimeout(800);
      await prep(page);
      await el(page, page.locator('span', { hasText: 'Your draft to judge' }).first().locator('xpath=../..'), file, 8, 900);
    };
    await aiTool(page, 'companion-precision', 'maya', () => runForm('/portal/tools/precision-companion', 'Decompose', [
      'Move all six product teams onto a shared quarterly release calendar by the start of Q1.',
      'Summit Ridge Co., 40-person product org. Teams plan releases independently today, so launches collide and support gets surprised. Marcus Webb owns release operations. Leadership wants one calendar and a single go/no-go review per release.',
    ], 'companions-1-precision'));
    await aiTool(page, 'companion-purpose', 'jordan', async () => {
      await go(page, '/portal/tools/purpose-companion', 1200);
      await page.click('button:has-text("Start the interview")');
      await page.locator('main input[placeholder="Your answer..."]').waitFor({ timeout: 300000 });
      await page.waitForFunction(() => document.querySelectorAll('main div[style*="max-height"] > div').length >= 2, null, { timeout: 300000 });
      await page.fill('main input[placeholder="Your answer..."]', 'We are consolidating our three customer-feedback tools into one. I own the migration, and the team keeps asking why we are doing it now when the old tools still work.');
      await page.click('main button:has-text("Send")');
      await page.waitForFunction(() => { const b = [...document.querySelectorAll('main button')].find(x => /^(Send|\.\.\.)$/.test(x.textContent)); return b && b.textContent === 'Send'; }, null, { timeout: 300000 });
      await page.waitForTimeout(800);
      await prep(page);
      await page.evaluate(() => { const s = document.querySelector('main div[style*="max-height"]'); if (s) { s.style.maxHeight = 'none'; s.style.overflow = 'visible'; } });
      await el(page, page.locator('main div[style*="max-height"]').first().locator('xpath=../..'), 'companions-2-purpose', 8, 900);
    });
    await aiTool(page, 'companion-progress', 'priya', () => runForm('/portal/tools/progress-companion', 'Progress Broadcast', [
      'Mon: finished the vendor comparison for the feedback tool consolidation, 3 options down to 1. Tue: security review booked for the 14th. Wed-Thu: data export from the old survey tool, 2 of 3 done, third blocked on admin access (asked IT twice). Fri: drafted the training outline. Risk: if access is not granted by the 10th the cutover slips a week.',
    ], 'companions-3-progress'));
  },
  async translator(page) {
    // Maya (WHY-WHAT) writes a big-picture note and translates it for Marcus, a HOW-WHAT reader.
    await aiTool(page, 'translator-translate', 'maya', async () => {
      await go(page, '/portal/tools/orientation-translator', 1200);
      await page.fill('textarea[placeholder^="Paste the email, update"]', "Team, I've been thinking a lot about where we're headed next year. Our customers are telling us they want one place to see everything, and I think that's our chance to stop being a set of tools and become the system they run their week on. The release calendar is the first step. It's how we show we can move as one team. I'd love everyone's energy behind this.");
      await page.locator('main button', { hasText: /^HOW-speak$/ }).click();
      await page.fill('input[placeholder^="Channel, relationship, stakes"]', 'Email to the release operations lead, kicking off the calendar project.');
      await page.locator('main button', { hasText: /^Translate$/ }).last().click();
      await page.locator('span', { hasText: "Ready to send, once you've judged it" }).first().waitFor({ timeout: 300000 });
      await page.waitForTimeout(800);
      await prep(page);
      await el(page, page.locator('span', { hasText: "Ready to send, once you've judged it" }).first().locator('xpath=../..'), 'translator-1-result', 8, 900);
    });
    await aiTool(page, 'translator-detect', 'maya', async () => {
      await go(page, '/portal/tools/orientation-translator', 1200);
      await page.locator('main button', { hasText: /^Detect/ }).click();
      await page.waitForTimeout(300);
      await page.fill('textarea[placeholder^="Paste two or three samples"]', [
        'Status, week 32. Cutover checklist: 41 of 48 items closed. Open: SSO config (owner: IT, due Thu), data export batch 3 (blocked, ticket #2210), training slots (2 of 4 booked). Go/no-go stays Monday 9am. If SSO slips past Thursday, I will move cutover to the following Tuesday and notify support by Friday noon.',
        'Quick note on the vendor contract: the renewal terms changed in section 4.2. Billing moves from annual to quarterly, and the notice period goes from 30 to 60 days. I have marked up the three clauses we need legal to review and added the dates to the shared calendar so nothing lapses.',
        'Before the planning session, please fill in the capacity sheet (tab 2, one row per person, hours per sprint). I will consolidate by Wednesday so we walk in with real numbers, not estimates.',
      ].join('\n\n'));
      await page.locator('main button', { hasText: /^Someone I work with$/ }).click();
      await page.fill('input[placeholder^="Genre, role, audience"]', 'Weekly updates and notes from a release operations lead to the product team.');
      await page.locator('main button', { hasText: /^Offer a hypothesis$/ }).click();
      await page.locator('span', { hasText: 'The hypothesis' }).first().waitFor({ timeout: 300000 });
      await page.waitForTimeout(800);
      await prep(page);
      await el(page, page.locator('span', { hasText: 'The hypothesis' }).first().locator('xpath=../..'), 'translator-2-detect', 8, 900);
    });
  },
  async meeting(page) {
    await aiTool(page, 'meeting', 'maya', async () => {
      await go(page, '/portal/tools/meeting-architect', 1500);
      await page.fill('#ma-objectives', 'Surface blockers early, keep decisions moving, and end with clear owners.');
      await page.fill('#ma-challenges', 'Runs 20 minutes over, turns into live problem-solving, and the quieter people never get a word in.');
      await page.click('button:has-text("Design the meeting")');
      await page.locator('h3.sa-section-title', { hasText: /^Your redesigned/ }).waitFor({ timeout: 300000 });
      await page.waitForTimeout(1000);
      await prep(page);
      await band(page, page.locator('h3.sa-section-title', { hasText: /^Your redesigned/ }), 900, 'meeting-1-result', 12);
      await band(page, page.locator('h3.sa-section-title', { hasText: /^Where to lean in/ }), 760, 'meeting-3-leanin', 12);
    });
  },
  async fit(page) {
    // Maya's own profile is prefilled; analyze a role close to her primary.
    await aiTool(page, 'fit', 'maya', async () => {
      await go(page, '/portal/tools/fit', 1500);
      const named = page.locator('input.role-input[placeholder="e.g. Alex Smith"]');
      if (await named.count()) await named.fill('Maya Chen');
      await page.fill('input.role-input[placeholder^="e.g. Senior Product Manager"]', 'Director of Product Strategy');
      await page.click('button.analyze-btn');
      await page.locator('.score-header').waitFor({ timeout: 300000 });
      await page.waitForTimeout(1200);
      await prep(page);
      await band(page, page.locator('.score-header'), page.locator('.score-header'), 'fit-1-result', 16);
      await band(page, page.locator('.result-grid-2').first(), page.locator('.result-card--full').first(), 'fit-2-detail', 12);
    });
  },
  async jd(page) {
    await aiTool(page, 'jd', 'maya', async () => {
      await go(page, '/portal/tools/jd', 1200);
      await page.fill('textarea.jd-input', 'Product Operations Manager. You will own the systems that keep our product teams shipping: release planning, roadmap tooling, and the rituals that connect strategy to delivery. You will partner with product leaders to turn priorities into plans, run quarterly planning, track delivery health across six teams, and continuously improve how we work. You thrive on structure, love a well-run process, and can rally busy people around a deadline.');
      await page.click('button.analyze-btn');
      await page.locator('.results-rule').waitFor({ timeout: 300000 });
      await page.locator('.other-grid').waitFor({ timeout: 300000 }).catch(() => {});
      await page.waitForTimeout(1200);
      await prep(page);
      await band(page, page.locator('.results-rule'), 1000, 'jd-1-result', 8);
    });
  },
  async career(page) {
    await aiTool(page, 'career', 'sam', async () => {
      await go(page, '/portal/tools/career', 1500);
      await page.fill('input[placeholder^="e.g. technology"]', 'Healthcare technology').catch(() => {});
      await page.fill('input[placeholder^="e.g. autonomy"]', 'Building something meaningful, room to set direction').catch(() => {});
      await page.click('button:has-text("Generate Career Guidance Report")');
      // The report streams in; wait until the generate form is gone and the stream has ended.
      await page.waitForResponse(r => /\/api\/career-guidance/.test(r.url()), { timeout: 300000 });
      await page.waitForFunction(() => /Role 1|Why This Role Fits/i.test(document.querySelector('main').innerText), null, { timeout: 300000 }).catch(() => {});
      await page.waitForTimeout(3000);
      await prep(page);
      const out = page.locator('main > div').last();
      await band(page, out, 1000, 'career-1-result', 8);
    });
  },
  async assistant(page) {
    await aiTool(page, 'assistant', 'marcus', async () => {
      await go(page, '/portal/dashboard', 2000);
      // prep() hides fixed elements, including the assistant's container; undo that for it.
      await page.evaluate(() => {
        for (const n of document.querySelectorAll('[style*="visibility"]')) if (n.querySelector('.ca-fab')) n.style.visibility = '';
        document.querySelector('.ca-fab').click();
      });
      // React reuses the (hidden) hint's div as the panel, so unhide it once attached.
      await page.locator('.ca-panel').waitFor({ state: 'attached' });
      await page.evaluate(() => { for (let n = document.querySelector('.ca-panel'); n; n = n.parentElement) n.style.visibility = ''; });
      await page.locator('.ca-panel').waitFor();
      await page.waitForTimeout(500);
      // The panel is position: fixed in the bottom-right corner, so shoot a
      // viewport clip around it with some of the page behind it for context.
      const shoot = async file => {
        const b = await page.locator('.ca-panel').boundingBox();
        const x = Math.max(0, b.x - 620);
        const y = Math.max(0, b.y - 24);
        await page.screenshot({ path: `${OUT}/${file}.png`, clip: { x, y, width: b.x + b.width + 24 - x, height: b.y + b.height + 24 - y } });
      };
      await page.evaluate(() => window.scrollTo(0, 0));
      await shoot('assistant-2-start');
      await page.fill('.ca-input', 'Our weekly status meeting keeps running long and turning into problem-solving. What should I use?');
      await page.click('.ca-send');
      await page.locator('.ca-answer, .ca-card').first().waitFor({ timeout: 300000 });
      await page.waitForTimeout(800);
      await shoot('assistant-1-answer');
    });
  },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
    try { const r = await fetch(route.request().url()); route.fulfill({ status: r.status, headers: Object.fromEntries(r.headers), body: Buffer.from(await r.arrayBuffer()) }); } catch { route.abort(); }
  });
  await ctx.addCookies([{ name: 'curio_portal', value: demo.people[process.env.AS || 'maya'].cookie, url: BASE }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const [name, fn] of Object.entries(shots)) {
    if (only.length && !only.includes(name)) continue;
    try { await fn(page); console.log('ok', name); } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); }
  }
  if (errors.length) console.log('page errors:', [...new Set(errors)].slice(0, 5));
  await browser.close();
})();
