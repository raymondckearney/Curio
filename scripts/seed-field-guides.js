#!/usr/bin/env node
// Seeds the "library" Supabase storage bucket and the library_items table
// with the six Communication Field Guide PDFs from curio_library/Field_Guides/.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment, and
// supabase/migrations/0005_field_guides.sql applied first.
//
// Usage: node scripts/seed-field-guides.js

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const GUIDES_DIR = path.join(ROOT, 'curio_library', 'Field_Guides');

const PROFILES = ['WHY-WHAT', 'WHY-HOW', 'WHAT-WHY', 'WHAT-HOW', 'HOW-WHY', 'HOW-WHAT'];

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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/library_items?on_conflict=item_type,profile`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`upsert profile=${row.profile} failed: ${await res.text()}`);
}

async function main() {
  console.log(`Seeding ${PROFILES.length} field guides...`);
  for (const profile of PROFILES) {
    const fileName = `Field_Guide_${profile.replace('-', '_')}.pdf`;
    const localPath = path.join(GUIDES_DIR, fileName);
    const objectPath = `field-guides/${fileName}`;

    await uploadObject(objectPath, fs.readFileSync(localPath));
    await upsertItem({
      item_type: 'field_guide',
      profile,
      title: 'Communication Field Guide',
      onepager_path: objectPath,
      kit_path: null,
    });
    console.log(`  ${profile} - ${fileName}`);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
