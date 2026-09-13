import { dbGet, dbPatch, dbInsert } from './supabase';

// Tiny generic key/value store (see supabase/migrations/0010_weekly_tips.sql)
// backing admin-togglable flags like the weekly-tips on/off switch. Reads
// fail safe: a missing table/row or a network error returns `fallback`
// rather than throwing, so a feature this gates stays off by default
// instead of erroring the whole cron run if the migration hasn't been
// applied yet.
export async function getSetting(key, fallback = null) {
  try {
    const rows = await dbGet('app_settings', { key });
    return rows[0]?.value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

export async function setSetting(key, value) {
  const existing = await dbGet('app_settings', { key }).catch(() => []);
  const now = new Date().toISOString();
  if (existing.length) {
    await dbPatch('app_settings', { key }, { value, updated_at: now });
  } else {
    await dbInsert('app_settings', { key, value, updated_at: now });
  }
}
