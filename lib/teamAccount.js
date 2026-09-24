// The one rule for "is this a team account" (shows My Team and its tabs,
// lets an owner browse other profiles in the AI & Delegation Guide).
// A self-serve buyer's account has exactly one assessment token, so more
// than one token means a team pool. The team_account license (admin Edit
// Account -> Tier & Licenses) marks an account as a team regardless of
// token count, e.g. an admin-invited owner who hasn't sent tokens yet.
export const TEAM_ACCOUNT_LICENSE = 'team_account';

export function isTeamAccount(tokens, licenses) {
  const now = new Date();
  const flagged = (licenses || []).some(l =>
    l.type === TEAM_ACCOUNT_LICENSE && (!l.expires_at || new Date(l.expires_at) > now));
  return flagged || (tokens || []).length > 1;
}
