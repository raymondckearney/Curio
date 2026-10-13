// Server-only. Scheduled token emails: Resend holds a scheduled email and
// sends it itself, so nothing here has to run at the send time. These
// helpers keep the tokens table in step with what Resend did.
import { Resend } from 'resend';
import { dbQuery, dbPatch } from './supabase';
import { setContactLinkSent } from './notion';

// Resend schedules up to 30 days ahead; earlier than a couple of minutes
// out is just "send now".
export const MAX_SCHEDULE_DAYS = 30;
export const MIN_SCHEDULE_MINUTES = 2;

export function resendClient() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

// Returns { at } for a valid future time, { now: true } when the time is
// missing, or { error } when it's out of range.
export function parseSendAt(value) {
  if (!value) return { now: true };
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return { error: 'That send time is not a valid date.' };
  const ms = at.getTime() - Date.now();
  if (ms < MIN_SCHEDULE_MINUTES * 60000) return { error: `Pick a time at least ${MIN_SCHEDULE_MINUTES} minutes from now, or send it now.` };
  if (ms > MAX_SCHEDULE_DAYS * 86400000) return { error: `Emails can be scheduled up to ${MAX_SCHEDULE_DAYS} days ahead.` };
  return { at };
}

// Cancel a token's pending scheduled email, if it has one. Returns true when
// there was nothing to cancel or the cancel worked.
export async function cancelScheduled(token) {
  if (!token?.scheduled_email_id) return true;
  const resend = resendClient();
  if (!resend) throw new Error('RESEND_API_KEY not configured');
  const { error } = await resend.emails.cancel(token.scheduled_email_id);
  // Already sent or already cancelled in Resend: nothing left to cancel.
  if (error && !/not.*(scheduled|found)|already|cannot be canceled|sent/i.test(error.message || '')) throw new Error(error.message || 'Could not cancel the scheduled email.');
  await dbPatch('tokens', { token: token.token }, { link_scheduled_for: null, scheduled_email_id: null });
  return true;
}

// Any scheduled email whose time has passed: mark the link sent (unless
// Resend says it was cancelled or failed) and clear the schedule. Called
// when the admin loads token lists and by the daily cron, so link_sent_at
// and the Notion contact catch up without anything running at send time.
// rows: optional token rows already loaded; they're updated in place.
export async function finalizeDueScheduledLinks(rows) {
  const nowIso = new Date().toISOString();
  const due = rows
    ? rows.filter(t => t.scheduled_email_id && t.link_scheduled_for && t.link_scheduled_for <= nowIso && !t.link_sent_at)
    : await dbQuery('tokens', { scheduled_email_id: 'not.is.null', link_scheduled_for: `lte.${nowIso}`, link_sent_at: 'is.null', select: 'token,email,link_scheduled_for,scheduled_email_id,link_sent_at' }).catch(() => []);
  if (!due.length) return 0;
  const resend = resendClient();
  let done = 0;
  for (const t of due) {
    try {
      let lastEvent = null;
      if (resend) {
        const { data } = await resend.emails.get(t.scheduled_email_id);
        lastEvent = data?.last_event || null;
      }
      // Still queued at Resend a moment after the time: check again later.
      if (lastEvent === 'scheduled' || lastEvent === 'queued') continue;
      const failed = lastEvent === 'canceled' || lastEvent === 'failed' || lastEvent === 'bounced';
      const patch = failed
        ? { link_scheduled_for: null, scheduled_email_id: null }
        : { link_sent_at: t.link_scheduled_for, link_scheduled_for: null, scheduled_email_id: null };
      await dbPatch('tokens', { token: t.token }, patch);
      Object.assign(t, patch);
      if (!failed && t.email) setContactLinkSent({ email: t.email }).catch(err => console.error('[scheduledLinks] notion update failed:', err));
      done += 1;
    } catch (err) {
      console.error('[scheduledLinks] finalize failed for', t.token, err.message);
    }
  }
  return done;
}
