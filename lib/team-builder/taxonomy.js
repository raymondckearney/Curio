// Parses the MindPrint™ Activity Taxonomy (lib/mindprint-activity-taxonomy.md,
// section 4) into [{ id, name, tag, group }]. The markdown file is the single
// source: nothing else holds a copy of the list. Pure string parsing; read
// the file at request time on the server (see loadTaxonomy.js).

const TAG_RE = /^(WHY|WHAT|HOW)-(WHY|WHAT|HOW)$/;

export function parseTaxonomy(md) {
  const start = md.indexOf('## 4.');
  const end = md.indexOf('\n## 5.', start);
  const body = md.slice(start, end === -1 ? undefined : end);
  const out = [];
  let group = '';
  for (const line of body.split('\n')) {
    const g = line.match(/^###\s+Group\s+\d+:\s*(.+)$/);
    if (g) { group = g[1].trim(); continue; }
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([A-Z-]+)\s*\|/);
    if (m && TAG_RE.test(m[3])) out.push({ id: +m[1], name: m[2], tag: m[3], group });
  }
  return out.sort((a, b) => a.id - b.id);
}

// Taxonomy section 3: a shift may swap the lead and support orientations,
// or replace the support orientation. It may never put the residual
// orientation in the lead.
export function isAllowedShift(baseTag, newTag) {
  if (!TAG_RE.test(newTag)) return false;
  if (newTag === baseTag) return true;
  const [bl, bs] = baseTag.split('-');
  const [nl, ns] = newTag.split('-');
  if (nl === bs && ns === bl) return true; // swap
  if (nl === bl && ns !== bs) return true; // replace the support
  return false;
}
