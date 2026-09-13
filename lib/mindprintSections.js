// Extracts specific, named slices out of lib/mindprint-source-of-truth.md so a
// generation call can inject only the sections it actually needs (e.g. one
// profile's Section 4 truth table, not all six) rather than the whole
// document. Pure string parsing — callers are responsible for reading the
// file at request time (see pages/api/career-guidance/index.js for the
// established fs.readFileSync pattern this mirrors).

export function extractSection(doc, sectionNumber) {
  const re = new RegExp(`## SECTION ${sectionNumber}:[\\s\\S]*?(?=\\n## SECTION ${sectionNumber + 1}:|$)`);
  const m = doc.match(re);
  return m ? m[0].trim() : '';
}

// section4Text is the full output of extractSection(doc, 4). profileCode is
// e.g. "WHY-WHAT". Returns just that profile's subsection.
export function extractProfileFromSection4(section4Text, profileCode) {
  const re = new RegExp(`### ${profileCode}\\b[\\s\\S]*?(?=\\n### [A-Z]+-[A-Z]+\\b|$)`);
  const m = section4Text.match(re);
  return m ? m[0].trim() : '';
}

export function extractSection8Layer1(doc) {
  const re = /### Layer 1: Non-Negotiable System Prompt Requirements[\s\S]*?(?=\n### Layer 2)/;
  const m = doc.match(re);
  return m ? m[0].trim() : '';
}
