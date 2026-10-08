// Saves one completed Team Builder result (once per result, from the
// browser): the shape of the work and the engine output with people as
// labels, plus any unlisted activities. Never names, skills or document
// text: anything name-shaped is rejected rather than stored.
import { requireAccess } from '../../../lib/team-builder/server';
import { dbInsert } from '../../../lib/supabase';
import { TAGS } from '../../../lib/team-builder/engine';

const LABEL_RE = /^(P\d{1,2}|Seat [A-Z])$/;

// Every "person" field in the summary must be a label.
function labelsOnly(v) {
  if (Array.isArray(v)) return v.every(labelsOnly);
  if (v && typeof v === 'object') {
    return Object.entries(v).every(([k, x]) => (['person', 'owner', 'reviewer', 'a', 'b', 'label', 'engagementLead'].includes(k) && x != null && typeof x === 'string' ? LABEL_RE.test(x) : true) && labelsOnly(x));
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await requireAccess(req, res);
  if (!auth) return;
  const b = req.body || {};
  const summary = b.resultSummary;
  if (!summary || typeof summary !== 'object' || JSON.stringify(summary).length > 200000) return res.status(400).json({ error: 'Invalid result.' });
  if (!labelsOnly(summary)) return res.status(400).json({ error: 'The saved result must use labels, not names.' });
  try {
    const [run] = await dbInsert('team_builder_runs', {
      account_id: auth.me.account.id,
      user_id: auth.me.user.id,
      mode: b.mode === 'design' ? 'design' : 'roster',
      weeks: Number.isFinite(+b.weeks) ? Math.round(+b.weeks) : null,
      hours: Number.isFinite(+b.hours) ? Math.round(+b.hours) : null,
      activity_count: Number.isFinite(+b.activityCount) ? Math.round(+b.activityCount) : null,
      profiles: (Array.isArray(b.profiles) ? b.profiles : []).filter(p => TAGS.includes(p)),
      result_summary: summary,
    });
    const unlisted = (Array.isArray(b.unlisted) ? b.unlisted : []).slice(0, 60)
      .filter(u => typeof u?.activityName === 'string' && u.activityName.trim() && TAGS.includes(u.tag))
      .map(u => ({ run_id: run.id, activity_name: u.activityName.trim().slice(0, 160), tag_set: u.tag, evidence: typeof u.evidence === 'string' ? u.evidence.slice(0, 240) : null }));
    if (unlisted.length) await dbInsert('team_builder_unlisted_activities', unlisted);
    return res.status(200).json({ ok: true, id: run.id });
  } catch (err) {
    console.error('[team-builder/runs]', err);
    return res.status(500).json({ error: 'Could not save the run.' });
  }
}
