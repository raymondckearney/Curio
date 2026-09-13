import { getAdminSession } from '../../../../../lib/adminSession';
import { dbInsert } from '../../../../../lib/supabase';
import { TOKEN_GRANT_TYPES } from '../../../../../lib/licenseTypes';

// The 4 tools a "premium" tier grants by default (independent of the full
// set of grantable tool types below — premium doesn't mean "every tool").
// Mirrors pages/api/tokens/generate.js so both token-creation paths agree
// on what "basic" vs "premium" means.
const PREMIUM_TOOLS = ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer'];
// A grant counts as premium the moment it includes any ONE of these — not
// all three — since assessment_tokens alone is just baseline assessment
// access, not a premium tool.
const ADDITIONAL_PREMIUM_TOOLS = PREMIUM_TOOLS.filter(t => t !== 'assessment_tokens');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id: accountId } = req.query;
  const { quantity, engagement_id, granted_tier, granted_tools, team_id } = req.body || {};

  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1 || qty > 500) return res.status(400).json({ error: 'quantity must be between 1 and 500' });

  const engId = engagement_id?.trim() || `pool-${accountId.slice(0, 8)}-${Date.now()}`;

  // Resolve tools: explicit list wins; otherwise derive from tier
  let tools;
  if (Array.isArray(granted_tools) && granted_tools.length) {
    tools = granted_tools.filter(t => TOKEN_GRANT_TYPES.includes(t));
  } else if (granted_tier === 'premium') {
    tools = [...PREMIUM_TOOLS];
  } else {
    tools = ['assessment_tokens'];
  }

  // Derive tier from tools for backwards compat
  const tier = tools.some(t => ADDITIONAL_PREMIUM_TOOLS.includes(t)) ? 'premium' : 'basic';

  try {
    const rows = Array.from({ length: qty }, () => ({
      token: crypto.randomUUID(),
      account_id: accountId,
      engagement_id: engId,
      purpose: 'assessment',
      name: '',
      granted_tier: tier,
      granted_tools: tools,
      team_id: team_id || null,
      used: false,
    }));

    const inserted = await dbInsert('tokens', rows);
    return res.status(201).json({ created: inserted.length, engagement_id: engId, granted_tier: tier, granted_tools: tools, team_id: team_id || null });
  } catch (err) {
    console.error('[admin/accounts/generate-tokens]', err);
    return res.status(500).json({ error: err.message });
  }
}
