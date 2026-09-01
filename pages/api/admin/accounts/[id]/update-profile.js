import { getAdminSession } from '../../../../../lib/adminSession';
import { dbQuery, dbInsert, dbPatch } from '../../../../../lib/supabase';
import { TERTIARY_BY_PROFILE, COMPANION_BY_TERTIARY, COLLECTION_BY_TERTIARY } from '../../../../../lib/tertiary';

const PROFILES = ['WHY-WHAT', 'WHY-HOW', 'WHAT-WHY', 'WHAT-HOW', 'HOW-WHY', 'HOW-WHAT'];

function tertiaryFromProfile(profile) {
  return TERTIARY_BY_PROFILE[profile.toUpperCase()] || null;
}

export default async function handler(req, res) {
  if (!getAdminSession(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id: accountId } = req.query;
  const { newProfile } = req.body || {};
  if (!newProfile || !PROFILES.includes(newProfile.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid profile' });
  }

  const normalizedNew = newProfile.toUpperCase();

  try {
    // Find tokens and most recent assessment for this account
    const tokens = await dbQuery('tokens', { account_id: `eq.${accountId}`, select: 'token' });
    const tokenIds = tokens.map(t => t.token).filter(Boolean);

    if (!tokenIds.length) return res.status(404).json({ error: 'No tokens found for this account' });

    const assessments = await dbQuery('assessments', {
      token: `in.(${tokenIds.join(',')})`,
      order: 'submitted_at.desc',
      limit: '1',
      select: 'id,type',
    });

    const assessment = assessments[0];
    const oldProfile = assessment?.type ? assessment.type.toUpperCase().replace(/_/g, '-') : null;
    const oldTertiary = oldProfile ? tertiaryFromProfile(oldProfile) : null;
    const newTertiary = tertiaryFromProfile(normalizedNew);
    const tertiaryChanged = oldTertiary !== newTertiary;

    // Update assessment type
    if (assessment) {
      const dbType = normalizedNew.replace(/-/g, '_').toLowerCase();
      await dbPatch('assessments', { id: assessment.id }, { type: dbType });
    }

    // If tertiary changed, swap companion and library licenses
    if (tertiaryChanged && newTertiary) {
      // Delete old licenses if we had a known old tertiary
      if (oldTertiary) {
        const oldCompanion = `${COMPANION_BY_TERTIARY[oldTertiary]}_companion`;
        const oldLibrary = `library_${COLLECTION_BY_TERTIARY[oldTertiary].toLowerCase()}`;
        const existingLicenses = await dbQuery('account_licenses', {
          account_id: `eq.${accountId}`,
          select: 'id,type',
        });
        for (const l of existingLicenses) {
          if (l.type === oldCompanion || l.type === oldLibrary) {
            await dbQuery('account_licenses', { id: `eq.${l.id}` }, 'DELETE').catch(() => {});
          }
        }
      }

      // Insert new licenses
      const newCompanion = `${COMPANION_BY_TERTIARY[newTertiary]}_companion`;
      const newLibrary = `library_${COLLECTION_BY_TERTIARY[newTertiary].toLowerCase()}`;
      await dbInsert('account_licenses', [
        { account_id: accountId, type: newCompanion },
        { account_id: accountId, type: newLibrary },
      ]);
    }

    return res.status(200).json({ ok: true, oldProfile, newProfile: normalizedNew, oldTertiary, newTertiary, tertiaryChanged });
  } catch (err) {
    console.error('[admin/update-profile]', err);
    return res.status(500).json({ error: err.message });
  }
}
