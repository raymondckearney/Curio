// Client-only. Remembers which tools a person opened most recently, on this
// device, for the Tools page's "Recently used" row and My Profile's
// "Your tools". A per-viewer convenience only: it can be empty (private
// windows, cleared storage) and everything still works without it.

const KEY = userId => `curio-recent-tools:${userId || 'anon'}`;
const MAX = 6;

export function recordToolVisit(userId, toolKey) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY(userId)) || '[]').filter(k => k !== toolKey);
    localStorage.setItem(KEY(userId), JSON.stringify([toolKey, ...list].slice(0, MAX)));
  } catch {}
}

export function getRecentTools(userId) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY(userId)) || '[]');
    return Array.isArray(list) ? list.filter(k => typeof k === 'string') : [];
  } catch {
    return [];
  }
}
