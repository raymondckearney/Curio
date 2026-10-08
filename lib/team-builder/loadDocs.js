// Server-only. Reads Team Builder's governing documents at request time, so
// edits to them take effect without a redeploy:
//   team_builder_system_prompt.md        (PART A extraction, PART B narrative)
//   lib/mindprint-activity-taxonomy.md   (Source of Truth Section 10)
//   lib/mindprint-source-of-truth.md
import fs from 'fs';
import path from 'path';
import { parseTaxonomy } from './taxonomy';

const read = rel => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

export function loadDocs() {
  const prompt = read('team_builder_system_prompt.md');
  const partA = prompt.slice(prompt.indexOf('# PART A'), prompt.indexOf('# PART B')).trim();
  const partB = prompt.slice(prompt.indexOf('# PART B')).trim();
  const taxonomyMd = read('lib/mindprint-activity-taxonomy.md');
  const sot = read('lib/mindprint-source-of-truth.md');
  return { partA, partB, taxonomyMd, sot, taxonomy: parseTaxonomy(taxonomyMd) };
}

export function loadTaxonomy() {
  return parseTaxonomy(read('lib/mindprint-activity-taxonomy.md'));
}
