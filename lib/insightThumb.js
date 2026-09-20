// Fallback thumbnail treatment for Insights cards that don't have a Sanity
// mainImage set yet — a branded gradient plus the same brain-fingerprint
// mark already used as the dashboard hero's watermark and the Session
// Architect deck's block dividers, so a card with no photo still looks
// designed rather than blank. Purely a rotation for visual variety across
// the grid (no claim that a given post is thematically "WHY" vs "HOW").
//
// Cycled by position in the list, not hashed from the title — a title
// hash can (and did, in testing) collide across most of a small
// collection, which reads as a bug ("why do 3 of these 4 cards look
// identical?") rather than as variety. Position order is itself already
// stable (postsQuery sorts by publishedAt desc), so a given post keeps
// its look across renders regardless.
const THUMB_THEMES = [
  { from: '#0F172A', to: '#065F46', mark: '/images/brainprint-deck-why.png' },
  { from: '#0F172A', to: '#1E3A8A', mark: '/images/brainprint-deck-what.png' },
  { from: '#0F172A', to: '#92400E', mark: '/images/brainprint-deck-how.png' },
  { from: '#1E293B', to: '#334155', mark: '/images/brainprint-deck-why.png' },
];

export function insightThumbTheme(index) {
  return THUMB_THEMES[index % THUMB_THEMES.length];
}
