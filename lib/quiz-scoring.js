// Pure scoring functions for the native MindPrint™ Assessment.
// No React/Next.js dependencies — independently testable.

import { TIE_BREAKERS } from './quiz-data';

// Deterministic string hash → mulberry32 PRNG, so a given seed always
// produces the same shuffle order (stable across re-renders / back nav).
function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function seededShuffle(array, seed) {
  const rand = seededRandom(String(seed));
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// answers: { [questionId]: 'WHY' | 'WHAT' | 'HOW' }
export function calculateScores(answers) {
  const scores = { WHY: 0, WHAT: 0, HOW: 0 };
  for (const orientation of Object.values(answers)) {
    if (scores[orientation] !== undefined) scores[orientation] += 1;
  }
  return scores;
}

// Returns 'WHY_WHAT' | 'WHY_HOW' | 'WHAT_HOW' | null.
// Checked in a fixed order; a three-way tie is mathematically impossible
// with 23 questions, so at most one of these can ever be true.
export function getTieBreaker(scores) {
  if (TIE_BREAKERS.WHY_WHAT.condition(scores)) return 'WHY_WHAT';
  if (TIE_BREAKERS.WHY_HOW.condition(scores)) return 'WHY_HOW';
  if (TIE_BREAKERS.WHAT_HOW.condition(scores)) return 'WHAT_HOW';
  return null;
}
