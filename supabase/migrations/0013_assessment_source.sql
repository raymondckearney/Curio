-- Where an assessment row came from. NULL means the person took the
-- MindPrint(tm) assessment. Rows set by an admin from Edit Account ->
-- Users & Roles are marked 'admin_copied' (copied from an existing
-- assessment) or 'admin_entered' (profile entered by hand, no assessment
-- taken). See lib/adminProfiles.js.
alter table assessments add column if not exists source text;
