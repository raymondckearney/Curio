// Renders the Weekly Profile Tip email exactly as the cron sends it (the
// saved template if one was edited in admin, else the built-in default),
// filled with a real tip, to shots/tips-email.html for screenshotting.
const fs = require('fs');
const path = require('path');
const { dbQuery } = require('../../../lib/supabase.js');
(async () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../lib/emailTemplates.js'), 'utf8');
  const block = src.slice(src.indexOf("key: 'weekly_tip'"));
  const def = block.slice(block.indexOf('default_html_body: `') + 20, block.indexOf('`', block.indexOf('default_html_body: `') + 20));
  const saved = await dbQuery('email_templates', { key: 'eq.weekly_tip', select: 'html_body' }).catch(() => []);
  const html = (saved[0] && saved[0].html_body) || def;
  const tipsSrc = fs.readFileSync(path.join(__dirname, '../../../lib/weeklyTips.js'), 'utf8');
  const json = tipsSrc.slice(tipsSrc.indexOf('{', tipsSrc.indexOf('WEEKLY_TIPS')), tipsSrc.indexOf('export const TIPS_PER_PROFILE'));
  const tips = JSON.parse(json.trim().replace(/;\s*$/, ''));
  // Three real tips from different profiles, for the sheet's screenshots.
  const picks = [
    ['tips-email.html', 'Maya', 'why-what', 'Purpose-Driven, Progress-Oriented', 0],
    ['tips-email-2.html', 'Priya', 'how-why', 'Precision-Driven, Purpose-Oriented', 2],
    ['tips-email-3.html', 'Jordan', 'what-how', 'Progress-Driven, Precision-Oriented', 4],
  ];
  for (const [file, name, slug, tagline, i] of picks) {
    const tip = tips[slug][i];
    const vars = { name, email: '', profileLabel: slug.toUpperCase(), profileTagline: tagline.replace(/,\s*/g, ' · '), tipNumber: tip.number, tipHeadline: tip.headline, tipBody: tip.body, unsubscribeUrl: '#' };
    fs.writeFileSync(path.join(__dirname, '../shots', file), html.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : '')));
    console.log(file, slug, 'tip', tip.number, '|', tip.headline);
  }
  console.log('template:', saved.length ? 'admin-edited' : 'default');
})();
