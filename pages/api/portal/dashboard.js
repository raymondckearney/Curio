import { getPortalSession } from '../../../lib/portalSession';
import { dbQuery, dbGet } from '../../../lib/supabase';
import { tertiaryFromProfileSlug } from '../../../lib/tertiary';

const LIBRARY_LICENSES = ['library_full', 'library_a', 'library_b', 'library_c', 'library_d', 'library_e'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId, userId } = session;

  try {
    const [licenses, tokens, account, userRows] = await Promise.all([
      dbGet('account_licenses', { account_id: accountId }),
      dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token,used,name,email,purpose,used_at' }),
      dbGet('client_accounts', { id: accountId }),
      dbGet('client_users', { id: userId }),
    ]);

    const user = userRows[0];
    const now = new Date();
    const activeLicenses = licenses.filter(l => !l.expires_at || new Date(l.expires_at) > now);
    const licenseTypes = new Set(activeLicenses.map(l => l.type));

    const hasAssessment = licenseTypes.has('assessment_tokens');
    const hasRoleAnalyzer = licenseTypes.has('role_analyzer');
    const hasCareerGuidance = licenseTypes.has('career_guidance');
    const hasJdAnalyzer = licenseTypes.has('jd_analyzer');
    const hasPrecisionCompanion = licenseTypes.has('precision_companion');
    const hasPurposeCompanion = licenseTypes.has('purpose_companion');
    const hasProgressCompanion = licenseTypes.has('progress_companion');
    const hasLibrary = LIBRARY_LICENSES.some(t => licenseTypes.has(t));

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
        myAssessment = aRes.find(a => a.email === user.email) || aRes[0] || null;
      }
    }

    const tertiary = myAssessment?.type ? tertiaryFromProfileSlug(myAssessment.type.toLowerCase()) : null;

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
      hasLibrary,
      tertiary,
      myAssessment,
    });
  } catch (err) {
    console.error('[portal/dashboard]', err);
    return res.status(500).json({ error: err.message });
  }
}
