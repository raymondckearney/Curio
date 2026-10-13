-- Scheduled token emails (admin "Schedule" on Send Link). Resend holds the
-- email and sends it at link_scheduled_for; scheduled_email_id is Resend's id
-- for it, used to cancel or check it. Once the time passes, link_sent_at is
-- set (lib/scheduledLinks.js) and scheduled_email_id is cleared.
alter table tokens add column if not exists link_scheduled_for timestamptz;
alter table tokens add column if not exists scheduled_email_id text;
