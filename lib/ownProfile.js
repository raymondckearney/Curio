import { dbQuery } from './supabase';
import { tertiaryFromProfileSlug } from './tertiary';

// Resolves the calling user's own completed MindPrint(tm) assessment from a
// set of token ids, matched by email. Always pass every token id the
// account has ever issued here — never a team-scoped subset — since "which
// assessment did I personally take" is a question about the caller's own
// identity, not about how much of the account/team roster they're allowed
// to see. A manager's own assessment may have been taken on a token issued
// before they were ever assigned to a team (team_id null), so scoping this
// lookup to their team would incorrectly hide their own completed profile.
// Shared by /api/portal/dashboard and /api/portal/ai-delegation-guide so
// this matching rule (and its single-assessment fallback) only lives once.
export async function resolveMyProfile(tokenIds, userEmail) {
  if (!tokenIds.length) return { myAssessment: null, tertiary: null };

  const assessments = await dbQuery('assessments', {
    token: `in.(${tokenIds.join(',')})`,
    order: 'submitted_at.desc',
    select: 'id,name,email,type,h_score,w_score,y_score,submitted_at,token',
  });

  let myAssessment = null;
  if (userEmail) {
    // Single-assessment fallback: a genuine solo account whose stored
    // assessment email doesn't exactly match the portal login email. Must
    // never fire when there's more than one assessment on the account, or
    // it would misattribute someone else's profile as the caller's own.
    myAssessment = assessments.find(a => a.email === userEmail) || (assessments.length === 1 ? assessments[0] : null);
  }

  const tertiary = myAssessment?.type ? tertiaryFromProfileSlug(myAssessment.type.toLowerCase()) : null;
  return { myAssessment, tertiary };
}
