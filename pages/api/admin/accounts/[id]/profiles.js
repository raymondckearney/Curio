import { getAdminSession } from '../../../../../lib/adminSession';
import { listUserProfiles, searchAssessments, setUserProfile } from '../../../../../lib/adminProfiles';

// GET               -> { users: [...each login with its own profile] }
// GET ?search=text  -> { results: [...assessments on any account matching a name or email] }
// POST { userId, mode: 'copy', sourceAssessmentId }
// POST { userId, mode: 'manual', profile, scores?: { why, what, how } }
export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id: accountId } = req.query;

  try {
    if (req.method === 'GET') {
      if (typeof req.query.search === 'string') {
        return res.status(200).json({ results: await searchAssessments(req.query.search) });
      }
      const users = await listUserProfiles(accountId);
      if (!users) return res.status(404).json({ error: 'Account not found.' });
      return res.status(200).json({ users });
    }

    if (req.method === 'POST') {
      const { userId, mode, sourceAssessmentId, profile, scores } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'userId is required.' });
      const result = await setUserProfile(accountId, userId, { mode, sourceAssessmentId, profile, scores });
      if (result.error) return res.status(result.code || 400).json({ error: result.error });
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin/accounts/profiles]', err);
    return res.status(500).json({ error: err.message });
  }
}
