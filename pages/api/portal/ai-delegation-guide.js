import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet } from '../../../lib/supabase';
import { resolveMyProfile } from '../../../lib/ownProfile';
import { AI_DELEGATION_GUIDE } from '../../../lib/aiDelegationGuide';

// Server-side access rule (never just hidden client-side): an individual
// contributor — including a solo self-serve "owner" with no one to coach —
// only ever receives their own profile's task table over the wire. Only a
// manager, or an owner of a genuine multi-person team account, receives all
// six profiles for the switcher. No account/team-scoped data is involved
// here at all — the six profile tables are fixed, identical content for
// every user — so the only thing being scoped is which of that content the
// caller is allowed to browse.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, userId, role } = session;

  try {
    const [tokens, userRows] = await Promise.all([
      dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' }),
      dbGet('client_users', { id: userId }),
    ]);
    const user = userRows[0];
    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    const { myAssessment } = await resolveMyProfile(tokenIds, user?.email);

    if (!myAssessment?.type) {
      return res.status(404).json({ error: 'No completed assessment on file.' });
    }

    const myProfileCode = myAssessment.type.toUpperCase();

    // Mirrors /api/portal/dashboard's isTeamAccount: a self-serve solo
    // buyer's account has exactly one token ever issued; a real
    // team/enterprise pool always has more than one.
    const isTeamAccount = tokens.length > 1;
    const canSwitch = role === 'manager' || (role === 'owner' && isTeamAccount);

    const { meta, universalSupports, profiles } = AI_DELEGATION_GUIDE;

    if (!canSwitch) {
      const myProfile = profiles.find(p => p.code === myProfileCode);
      return res.status(200).json({
        meta,
        universalSupports,
        profiles: myProfile ? [myProfile] : [],
        canSwitch: false,
        myProfileCode,
      });
    }

    return res.status(200).json({ meta, universalSupports, profiles, canSwitch: true, myProfileCode });
  } catch (err) {
    console.error('[portal/ai-delegation-guide]', err);
    return res.status(500).json({ error: err.message });
  }
}
