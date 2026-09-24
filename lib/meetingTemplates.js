// Server-only. Reads /meeting_architect_templates.md at request time (so a
// weight or wording change needs no code change) and parses each numbered
// meeting type into structured data. The same file is also injected
// verbatim into the generation prompt. Throws loudly on anything it can't
// parse rather than silently dropping a meeting type.

import fs from 'fs';
import path from 'path';
import { slugifyMeetingType } from './meetingArchitect';

const INPUT_MODES = { 'Roster': 'roster', 'Single Relationship': 'relationship', 'No Roster': 'none' };
const ENERGY = '(WHY|WHAT|HOW)';

export function readTemplatesDoc() {
  return fs.readFileSync(path.join(process.cwd(), 'meeting_architect_templates.md'), 'utf8');
}

function field(section, name) {
  const m = section.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`));
  return m ? m[1].trim() : '';
}

function afterHeading(section, heading) {
  const idx = section.indexOf(heading);
  if (idx === -1) return '';
  const rest = section.slice(idx + heading.length);
  const next = rest.search(/\n\*\*[^*]+:\*\*/);
  return next === -1 ? rest : rest.slice(0, next);
}

export function parseTemplates(doc) {
  const sections = doc.split(/\n(?=## \d+\. )/).filter(s => /^## \d+\. /.test(s));
  if (!sections.length) throw new Error('meeting_architect_templates.md: no numbered meeting types found');

  return sections.map(section => {
    const label = section.match(/^## \d+\. (.+)/)[1].trim();
    const where = `meeting_architect_templates.md, "${label}"`;

    const inputMode = INPUT_MODES[field(section, 'Input mode')];
    if (!inputMode) throw new Error(`${where}: unrecognized Input mode`);

    const defaultPurpose = field(section, 'Default purpose');
    if (!defaultPurpose) throw new Error(`${where}: missing Default purpose`);

    const blocks = [];
    const rowRe = new RegExp(`^\\|\\s*(.+?)\\s*\\|\\s*${ENERGY}\\s*\\|\\s*([\\d.]+)\\s*\\|\\s*$`, 'gm');
    for (const m of afterHeading(section, '**Live structure:**').matchAll(rowRe)) {
      blocks.push({ name: m[1], energy: m[2], pct: parseFloat(m[3]) });
    }
    if (!blocks.length) throw new Error(`${where}: no Live structure blocks`);
    const pctSum = blocks.reduce((a, b) => a + b.pct, 0);
    if (Math.abs(pctSum - 1) > 0.001) throw new Error(`${where}: block pct weights sum to ${pctSum.toFixed(3)}, not 1.0`);

    const parts = [];
    const partRe = new RegExp(`^- (.+?)\\s+[—-]\\s+${ENERGY}\\s*$`, 'gm');
    for (const m of afterHeading(section, '**Structural parts for lean-in / get-help mapping:**').matchAll(partRe)) {
      parts.push({ text: m[1], energy: m[2] });
    }
    if (!parts.length) throw new Error(`${where}: no lean-in / get-help structural parts`);

    return { label, slug: slugifyMeetingType(label), inputMode, defaultPurpose, blocks, parts };
  });
}
