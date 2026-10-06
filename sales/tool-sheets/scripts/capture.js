// Captures the screenshots used on the tool sheets, logged in as a demo
// person from .demo.json (see seed-demo.js). Run against a dev server
// started with the same PORTAL_SECRET used by seed-demo.js:
//   NODE_PATH=<playwright node_modules> node sales/tool-sheets/scripts/capture.js [tool ...]
// Each tool's function saves 1-3 cropped, 2x-resolution PNGs to shots/.
// Tools marked "needs AI" call the Anthropic API through the app, so the
// dev server must also have ANTHROPIC_API_KEY.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'shots');
const demo = JSON.parse(fs.readFileSync(path.join(ROOT, '.demo.json'), 'utf8'));
const BASE = process.env.BASE || 'http://localhost:3100';
const only = process.argv.slice(2);

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
async function el(page, locator, file, pad = 0) {
  const loc = typeof locator === 'string' ? page.locator(locator).first() : locator;
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error(`not found for ${file}`);
  const sy = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `${OUT}/${file}.png`, clip: { x: Math.max(0, b.x - pad), y: b.y + sy - pad, width: b.width + pad * 2, height: b.height + pad * 2 }, fullPage: true });
}

// Screenshot a vertical band of the main column, from the top of one
// element to the bottom of another (or a fixed height).
async function band(page, fromLoc, toLocOrHeight, file, pad = 16) {
  const a = await page.locator(fromLoc).first().boundingBox();
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
