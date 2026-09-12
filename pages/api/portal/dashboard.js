import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet } from '../../../lib/supabase';
import { tertiaryFromProfileSlug } from '../../../lib/tertiary';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, userId, role, teamId } = session;

  try {
    const [licenses, allTokens, account, userRows] = await Promise.all([
      dbGet('account_licenses', { account_id: accountId }),
      dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,used,name,email,purpose,used_at,team_id' }),
      dbGet('client_accounts', { id: accountId }),
      dbGet('client_users', { id: userId }),
    ]);

    const user = userRows[0];
    const tier = account[0]?.tier || 'basic';
    const now = new Date();
    const activeLicenses = licenses.filter(l => !l.expires_at || new Date(l.expires_at) > now);
    const licenseTypes = new Set(activeLicenses.map(l => l.type));

    // Compute expiry state
    const expiryDates = activeLicenses.filter(l => l.expires_at).map(l => new Date(l.expires_at));
    const licenseExpiresAt = expiryDates.length ? new Date(Math.min(...expiryDates)).toISOString() : null;
    const daysLeft = licenseExpiresAt ? Math.ceil((new Date(licenseExpiresAt) - now) / 86400000) : null;
    const isExpiringSoon = daysLeft !== null && daysLeft <= 30;
    const isExpired = licenses.length > 0 && activeLicenses.length === 0;

    const hasAssessment = licenseTypes.has('assessment_tokens');
    const hasRoleAnalyzer = licenseTypes.has('role_analyzer');
    const hasCareerGuidance = licenseTypes.has('career_guidance');
    const hasJdAnalyzer = licenseTypes.has('jd_analyzer');
    const hasOrientationTranslator = licenseTypes.has('orientation_translator');
    // Resources are on by default for every account (own tertiary + universal,
    // plus Team for enterprise owners - see pages/api/portal/library.js),
    // not gated behind a license row.
    const hasLibrary = true;

    // isTeamAccount reflects the whole account's shape (does it look like an
    // enterprise pool at all), not a single manager's own team size — a
    // small or brand-new team must not lose access to the team-only nav
    // just because its own token count happens to be 1. A self-serve
    // buyer's account is provisioned with exactly one assessment token
    // (their own); a team/enterprise pool always has more than one. `tier`
    // ('basic' | 'premium') never holds an 'enterprise' value, so it can't
    // be used for this.
    const isTeamAccount = allTokens.length > 1;

    // A manager's own stats, recent-assessments, and "my pending token"
    // lookup below are scoped to their own team only, never the rest of
    // the enterprise account.
    const tokens = role === 'manager' ? allTokens.filter(t => t.team_id === teamId) : allTokens;

    const tokenCount = tokens.length;
    const usedTokens = tokens.filter(t => t.used).length;

    const tokenIds = tokens.map(t => t.token).filter(Boolean);
    let recentAssessments = [];
    let myAssessment = null;

    if (tokenIds.length) {
      const aRes = await dbQuery('assessments', {
        token: `in.(${tokenIds.join(',')})`,
        order: 'submitted_at.desc',
        limit: '5',
        select: 'id,name,email,type,h_score,w_score,y_score,submitted_at,token',
      });
      recentAssessments = aRes;

      if (user?.email) {
        // The aRes[0] fallback exists for a genuine single-person account
        // whose stored assessment email doesn't exactly match their portal
        // login email. It must never fire when the account has more than
        // one assessment (an enterprise owner managing a team who hasn't
        // taken the assessment themselves), or it misattributes a team
        // member's profile as the owner's own, both on their dashboard and
        // via isIndividual, which then hides the enterprise-only nav items.
        myAssessment = aRes.find(a => a.email === user.email) || (aRes.length === 1 ? aRes[0] : null);
      }
    }

    const tertiary = myAssessment?.type ? tertiaryFromProfileSlug(myAssessment.type.toLowerCase()) : null;

    // Premium accounts get their own tertiary-matching Companion free, same
    // baseline pattern as Resources' free tertiary collection above; an
    // explicit license still grants a non-matching Companion on top (used
    // for sales demos via the admin panel's profile-match preset).
    const hasPrecisionCompanion = licenseTypes.has('precision_companion') || (tier !== 'basic' && tertiary === 'HOW');
    const hasPurposeCompanion = licenseTypes.has('purpose_companion') || (tier !== 'basic' && tertiary === 'WHY');
    const hasProgressCompanion = licenseTypes.has('progress_companion') || (tier !== 'basic' && tertiary === 'WHAT');

    // If this user hasn't completed their own assessment yet, surface their
    // unused assessment token so the portal can link straight to /go/<token>
    // instead of only saying "check your email".
    let assessmentPath = null;
    if (!myAssessment) {
      const myToken = tokens.find(t => t.purpose === 'assessment' && !t.used && (t.email === user?.email || !t.email));
      if (myToken) assessmentPath = `/go/${myToken.token}`;
    }

    return res.status(200).json({
      licenses: activeLicenses,
      tokenStats: { total: tokenCount, used: usedTokens, available: tokenCount - usedTokens },
      recentAssessments,
      accountName: account[0]?.name || '',
      hasAssessment,
      hasRoleAnalyzer,
      hasCareerGuidance,
      hasJdAnalyzer,
      hasPrecisionCompanion,
      hasPurposeCompanion,
      hasProgressCompanion,
      hasOrientationTranslator,
      hasLibrary,
      tertiary,
      myAssessment,
      assessmentPath,
      licenseExpiresAt,
      isExpiringSoon,
      isExpired,
      tier,
      isTeamAccount,
    });
  } catch (err) {
    console.error('[portal/dashboard]', err);
    return res.status(500).json({ error: err.message });
  }
}
