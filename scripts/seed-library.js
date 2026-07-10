#!/usr/bin/env node
// Seeds the "library" Supabase storage bucket and the library_items table
// from curio_library/ and scripts/library-catalog.json.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment, and the
// tables/bucket created by supabase/migrations/0001_companions_library.sql.
//
// Usage: node scripts/seed-library.js
//
// Catalog metadata (tool_num, collection, support_mode, title, summary) is
// generated from library-pipeline/content_ab.py and content_cde.py (the
// pipeline's own source of truth for that content - summary is each tool's
// "lead" field with HTML tags stripped). If those files gain a new tool, add
// its { num, collection, mode, title, summary } entry to
// library-catalog.json before re-running this script.

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const LIBRARY_DIR = path.join(ROOT, 'curio_library');
const CATALOG = require('./library-catalog.json');

function headers(extra = {}) {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...extra };
}

async function uploadObject(objectPath, buffer) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/library/${objectPath}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/pdf', 'x-upsert': 'true' }),
    body: buffer,
  });
  if (!res.ok) throw new Error(`upload ${objectPath} failed: ${await res.text()}`);
}

async function upsertItem(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/library_items?on_conflict=tool_num`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`upsert tool_num=${row.tool_num} failed: ${await res.text()}`);
}

function findFiles(collection, num) {
  const dir = path.join(LIBRARY_DIR, `Collection_${collection}`);
  const prefix = `Tool_${String(num).padStart(2, '0')}_`;
  const matches = fs.readdirSync(dir).filter(f => f.startsWith(prefix));
  const kit = matches.find(f => f.includes('_Kit_'));
  const onepager = matches.find(f => !f.includes('_Kit_'));
  if (!kit || !onepager) throw new Error(`Tool ${num}: expected one kit + one one-pager in ${dir}, found ${matches.join(', ') || 'nothing'}`);
  return { kit: path.join(dir, kit), onepager: path.join(dir, onepager) };
}

async function main() {
  console.log(`Seeding ${CATALOG.length} library items...`);
  for (const tool of CATALOG) {
    const { kit, onepager } = findFiles(tool.collection, tool.num);
    const kitPath = `${tool.collection}/tool-${String(tool.num).padStart(2, '0')}-kit.pdf`;
    const onepagerPath = `${tool.collection}/tool-${String(tool.num).padStart(2, '0')}-onepager.pdf`;

    await uploadObject(kitPath, fs.readFileSync(kit));
    await uploadObject(onepagerPath, fs.readFileSync(onepager));
    await upsertItem({
      tool_num: tool.num,
      collection: tool.collection,
      title: tool.title,
      support_mode: tool.mode,
      summary: tool.summary,
      onepager_path: onepagerPath,
      kit_path: kitPath,
    });
    console.log(`  Tool ${tool.num} (${tool.collection}) - ${tool.title}`);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
