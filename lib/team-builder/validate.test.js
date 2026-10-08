// Run: npm test. Server-side checks on what comes back from the AI document
// read (validate.js) and on uploaded files (documents.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { parseTaxonomy, isAllowedShift } from './taxonomy.js';
import { validateExtraction } from './validate.js';
import { documentBlocks, MAX_FILE_BYTES } from './documents.js';
import { TAGS } from './engine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = parseTaxonomy(fs.readFileSync(path.join(here, '..', 'mindprint-activity-taxonomy.md'), 'utf8'));
const entry = taxonomy[50];
const parts = t => t.split('-');
const swapped = parts(entry.tag).reverse().join('-');
const residual = TAGS.find(t => parts(t)[0] === TAGS.map(parts).flat().find(o => !parts(entry.tag).includes(o)));

const raw = (activity, extra = {}) => ({
  project: { name: 'Test', durationWeeks: 10, totalHours: 800, hoursSource: 'stated' },
  phases: [{ name: 'Discover', startWeek: 1, endWeek: 3 }, { name: 'Ongoing', startWeek: 1, endWeek: 10, ongoing: true }],
  activities: [{ name: 'Readout', taxonomyId: entry.id, phase: 'Discover', sharePct: 10, delivery: 'Pair', source: 'stated', evidence: 'a quote', ...activity }],
  ...extra,
});

test('an allowed shift is kept with its reason', () => {
  assert.ok(isAllowedShift(entry.tag, swapped));
  const out = validateExtraction(raw({ tag: swapped, shiftReason: 'Client-facing' }), taxonomy);
  assert.equal(out.activities[0].tag, swapped);
  assert.equal(out.activities[0].shifted, true);
  assert.equal(out.activities[0].shiftReason, 'Client-facing');
  assert.equal(out.warnings.length, 0);
});

test('an invalid shift (residual into the lead) is reset, with a warning', () => {
  assert.ok(!isAllowedShift(entry.tag, residual));
  const out = validateExtraction(raw({ tag: residual, shiftReason: 'Because' }), taxonomy);
  assert.equal(out.activities[0].tag, entry.tag);
  assert.equal(out.activities[0].shifted, false);
  assert.equal(out.activities[0].shiftReason, null);
  assert.equal(out.warnings.length, 1);
});

test('exactly one Ongoing phase, unknown phases go to Ongoing, delivery defaults to Solo', () => {
  const out = validateExtraction(raw({ phase: 'Nowhere', delivery: 'Crowd' }, { phases: [{ name: 'Discover', startWeek: 3, endWeek: 1 }, { name: 'Ongoing', ongoing: true }, { name: 'ongoing' }] }), taxonomy);
  assert.equal(out.phases.filter(p => p.ongoing).length, 1);
  assert.equal(out.phases[0].end, 3);
  assert.equal(out.activities[0].phase, 'Ongoing');
  assert.equal(out.activities[0].delivery, 'Solo');
});

test('an Ongoing phase is added when missing', () => {
  const out = validateExtraction(raw({}, { phases: [{ name: 'Discover', startWeek: 1, endWeek: 3 }] }), taxonomy);
  assert.deepEqual(out.phases.map(p => p.name), ['Discover', 'Ongoing']);
});

test('inferred activities carry no evidence quote', () => {
  const out = validateExtraction(raw({ source: 'inferred' }), taxonomy);
  assert.equal(out.activities[0].evidence, null);
});

test('a file over 3 MB is refused with a clear message', async () => {
  const big = Buffer.alloc(MAX_FILE_BYTES + 10, 65).toString('base64');
  const out = await documentBlocks({ file: { name: 'big.pdf', mediaType: 'application/pdf', base64: big } });
  assert.match(out.error, /over 3 MB/);
});

test('PDF becomes a document block, TXT and DOCX become text', async () => {
  const pdf = await documentBlocks({ file: { name: 'a.pdf', mediaType: 'application/pdf', base64: Buffer.from('%PDF-1.4').toString('base64') } });
  assert.equal(pdf.blocks[0].type, 'document');
  const txt = await documentBlocks({ file: { name: 'a.txt', mediaType: 'text/plain', base64: Buffer.from('Scope: research').toString('base64') } });
  assert.match(txt.blocks[0].text, /Scope: research/);
  const zip = new JSZip();
  zip.file('word/document.xml', '<w:document><w:body><w:p><w:r><w:t>Phase 1 &amp; 2</w:t></w:r></w:p><w:p><w:r><w:t>Workshops</w:t></w:r></w:p></w:body></w:document>');
  const docx = await zip.generateAsync({ type: 'nodebuffer' });
  const d = await documentBlocks({ file: { name: 'a.docx', mediaType: '', base64: docx.toString('base64') } });
  assert.match(d.blocks[0].text, /Phase 1 & 2\nWorkshops/);
  const bad = await documentBlocks({ file: { name: 'a.png', mediaType: 'image/png', base64: 'AAAA' } });
  assert.match(bad.error, /PDF, Word/);
});

test('the reviewer note loses dashes and ends on a full sentence', () => {
  const long = 'First sentence is here — with a dash. ' + 'More detail follows in this sentence. '.repeat(30);
  const out = validateExtraction(raw({}, { notes: long }), taxonomy);
  assert.ok(!/[—–]/.test(out.notes));
  assert.ok(out.notes.length <= 700);
  assert.ok(out.notes.endsWith('.'));
});
