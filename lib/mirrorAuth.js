// Server-only. Shared auth/rate-limit logic for the hidden Language Mirror
// (pages/mirror.js and pages/api/mirror.js). Deliberately separate from
// lib/portalSession.js and lib/adminSession.js: a mirror_tokens row is its
// own bearer credential (like the ?key= it travels in), not a signed claim,
// so no HMAC signing is needed here.

import { dbGet, dbPatch } from './supabase';

const COOKIE_NAME = 'curio_mirror';
const DAILY_READ_CAP = 20;

export function getMirrorTokenFromCookie(req) {
  const raw = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    raw.split(';').filter(Boolean).map(c => {
      const i = c.indexOf('=');
      return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
  return cookies[COOKIE_NAME] || null;
}

export function mirrorCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 30}`;
}

// Returns the active mirror_tokens row for a raw token value, or null.
export async function findActiveMirrorToken(token) {
  if (!token) return null;
  const rows = await dbGet('mirror_tokens', { token, active: true });
  return rows[0] || null;
}

// Checks the per-token daily cap (resets when daily_count_date is not
// today, UTC) without writing anything. Used by the page's
// getServerSideProps just to decide what to render; the actual increment
// happens in recordMirrorRead, called once a read completes.
export function dailyCountToday(row) {
  const today = new Date().toISOString().slice(0, 10);
  return row.daily_count_date === today ? row.daily_count : 0;
}

export function isOverDailyCap(row) {
  return dailyCountToday(row) >= DAILY_READ_CAP;
}

export { DAILY_READ_CAP };

// Increments use_count (lifetime) and the daily_count/daily_count_date pair
// (resetting daily_count to 1 if the stored date isn't today), and stamps
// last_used_at. Called once per completed read.
export async function recordMirrorRead(row) {
  const today = new Date().toISOString().slice(0, 10);
  const sameDay = row.daily_count_date === today;
  await dbPatch('mirror_tokens', { id: row.id }, {
    use_count: (row.use_count || 0) + 1,
    daily_count: sameDay ? (row.daily_count || 0) + 1 : 1,
    daily_count_date: today,
    last_used_at: new Date().toISOString(),
  });
}
