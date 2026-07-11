import { getAdminSession } from '../../../lib/adminSession';
import { dbQuery } from '../../../lib/supabase';

const PROFILE_RE = /\b(WHY|WHAT|HOW)-(WHY|WHAT|HOW)\b/;

// Heuristic: the detector's output format always states the leading profile
// hypothesis before the alternative (see MODE_SYSTEM.detector.detect in
// lib/companion-prompts.js, "## The read" is the first section), so the
// first valid, non-degenerate profile pattern in the raw text is read as
// the leading hypothesis.
function extractLeadingProfile(text) {
  if (!text) return null;
  const m = String(text).match(PROFILE_RE);
  if (!m) return null;
  const [, a, b] = m;
  return a === b ? null : `${a}-${b}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rows = await dbQuery('detection_feedback', {
      order: 'created_at.desc',
      select: 'id,created_at,own_writing,context,hypothesis_raw,actual_profile,sample_text',
    });

    const enriched = rows.map(r => ({ ...r, leading_hypothesis: extractLeadingProfile(r.hypothesis_raw) }));
    const labeled = enriched.filter(r => r.actual_profile);
    const agreeing = labeled.filter(r => r.leading_hypothesis && r.leading_hypothesis === r.actual_profile);
    const agreementRate = labeled.length ? agreeing.length / labeled.length : null;

    return res.status(200).json({
      rows: enriched,
      total: enriched.length,
      labeledCount: labeled.length,
      agreementRate,
    });
  } catch (err) {
    console.error('[admin/detection-feedback]', err);
    return res.status(500).json({ error: err.message });
  }
}
