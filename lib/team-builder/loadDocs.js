// Server-only. Reads Team Builder's governing documents at request time, so
// edits to them take effect without a redeploy:
//   team_builder_system_prompt.md        (PART A extraction, PART B narrative)
//   lib/mindprint-activity-taxonomy.md   (Source of Truth Section 10)
//   lib/mindprint-source-of-truth.md
import fs from 'fs';
import path from 'path';
import { parseTaxonomy } from './taxonomy';

// Each path is written out in full (not built from a variable) so Vercel's
// file tracing sees these files and bundles them with the functions that
// read them. A path held in a variable is invisible to the tracer, and the
// file is then missing in production.
const readPrompt = () => fs.readFileSync(path.join(process.cwd(), 'team_builder_system_prompt.md'), 'utf8');
const readTaxonomy = () => fs.readFileSync(path.join(process.cwd(), 'lib/mindprint-activity-taxonomy.md'), 'utf8');
const readSot = () => fs.readFileSync(path.join(process.cwd(), 'lib/mindprint-source-of-truth.md'), 'utf8');

export function loadDocs() {
  const prompt = readPrompt();
  const partA = prompt.slice(prompt.indexOf('# PART A'), prompt.indexOf('# PART B')).trim();
  const partB = prompt.slice(prompt.indexOf('# PART B')).trim();
  const taxonomyMd = readTaxonomy();
  const sot = readSot();
  return { partA, partB, taxonomyMd, sot, taxonomy: parseTaxonomy(taxonomyMd) };
}

export function loadTaxonomy() {
  return parseTaxonomy(readTaxonomy());
}
