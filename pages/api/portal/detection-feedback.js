import crypto from 'crypto';
import { getPortalSession } from '../../../lib/portalSession';
import { dbGet, dbInsert } from '../../../lib/supabase';
import { TERTIARY_BY_PROFILE } from '../../../lib/tertiary';

// Writes to detection_feedback, the validation corpus for the Profile
// Detector (MindPrint_Language_Framework.md Section 8). Storage rule,
// enforced here rather than trusted from the client: sample_text is stored
// only when own_writing is true. For third-party writing, only the hash,
// context, hypothesis, and label are kept, never the text.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { samples, ownWriting, context, hypothesisRaw, actualProfile } = req.body || {};

  if (typeof samples !== 'string' || !samples.trim()) return res.status(400).json({ error: 'samples is required' });
  if (typeof ownWriting !== 'boolean') return res.status(400).json({ error: 'ownWriting must be a boolean' });
  if (typeof hypothesisRaw !== 'string' || !hypothesisRaw.trim()) return res.status(400).json({ error: 'hypothesisRaw is required' });
  if (!actualProfile || !TERTIARY_BY_PROFILE[actualProfile]) return res.status(400).json({ error: 'A valid actual profile is required' });

  const { accountId, userId } = session;

  try {
    const licenses = await dbGet('account_licenses', { account_id: accountId, type: 'orientation_translator' });
    const now = new Date();
    const hasLicense = licenses.some(l => !l.expires_at || new Date(l.expires_at) > now);
    if (!hasLicense) return res.status(403).json({ error: 'The Language Tools are not licensed on your account.' });

    const textHash = crypto.createHash('sha256').update(samples).digest('hex');

    await dbInsert('detection_feedback', {
      user_id: userId,
      text_hash: textHash,
      own_writing: ownWriting,
      context: context || null,
      hypothesis_raw: hypothesisRaw,
      actual_profile: actualProfile,
      sample_text: ownWriting ? samples : null,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[detection-feedback]', err);
    return res.status(500).json({ error: err.message });
  }
}
