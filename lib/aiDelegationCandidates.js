// Builds the 14-tool candidate list (a profile's matched Collection A/B/C —
// ten tools — plus Collection D's four universal tools) for the tertiary
// task classifier. Sourced from lib/guideContent.js's GUIDES object, the
// canonical collection roster already used by the Resources library page —
// not from lib/aiDelegationGuide.js, which only holds the curated scaffold
// citations for the phase 2 static table's 60 example tasks (a partial,
// task-specific subset, not a complete per-collection roster).
import { GUIDES } from './guideContent';
import { COLLECTION_BY_TERTIARY, tertiaryFromProfileSlug } from './tertiary';

export function buildCandidateTools(profileCode) {
  const tertiary = tertiaryFromProfileSlug(profileCode.toLowerCase());
  const collection = tertiary ? COLLECTION_BY_TERTIARY[tertiary] : null;
  if (!collection) return [];

  return Object.entries(GUIDES)
    .filter(([, g]) => g.collection === collection || g.collection === 'D')
    .map(([slug, g]) => ({
      number: String(g.num).padStart(2, '0'),
      name: g.title,
      slug,
      description: g.tagline1 || '',
    }))
    .sort((a, b) => Number(a.number) - Number(b.number));
}
