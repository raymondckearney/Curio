import { dbInsert } from '../../../lib/supabase';
import { getAdminSession } from '../../../lib/adminSession';
import { createSendLinksTask } from '../../../lib/notion';
import { TOKEN_GRANT_TYPES } from '../../../lib/licenseTypes';

// The 4 tools a "premium" tier grants by default (independent of the full
// set of grantable tool types below — premium doesn't mean "every tool").
const PREMIUM_TOOLS = ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = req.headers.authorization;
  const hasBearer = bearer && bearer === `Bearer ${process.env.ADMIN_SECRET}`;
  const hasCookie = !!getAdminSession(req);
  if (!hasBearer && !hasCookie) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { participants, purpose, granted_tier, granted_tools, engagement_id, expires_at } = req.body;
    if (!participants?.length || !purpose || !engagement_id) {
      return res.status(400).json({ error: 'participants, purpose, and engagement_id are required' });
    }

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
    const tier = PREMIUM_TOOLS.every(t => tools.includes(t)) ? 'premium' : 'basic';

    const rows = participants.map(({ name, email, company, role }) => ({
      token: crypto.randomUUID(),
      name,
      email: email || null,
      company: company || null,
      role: role || null,
      purpose,
      granted_tier: tier,
      granted_tools: tools,
      engagement_id,
      expires_at: expires_at || null,
      used: false,
    }));

    const inserted = await dbInsert('tokens', rows);

    const results = inserted.map(row => ({
      name: row.name,
      email: row.email,
      company: row.company,
      role: row.role,
      token: row.token,
      url: `https://www.choosecurio.com/go/${row.token}`,
    }));

    createSendLinksTask({ engagementId: engagement_id.trim(), participantCount: rows.length }).catch(err =>
      console.error('[generate] notion follow-up failed:', err)
    );

    return res.status(200).json({ tokens: results });
  } catch (err) {
    console.error('generate error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate tokens' });
  }
}
