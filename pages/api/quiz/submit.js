// POST handler for the native MindPrint™ Assessment (pages/quiz.js).
//
// This intentionally mirrors pages/api/webhooks/typeform.js as closely as
// possible: same `assessments` table, same columns, same token-backfill
// behavior, same lack of Notion/Sheets/email side effects (none of those
// happen in that webhook either — if Ray has Sheets/Notion/email wired up
// today, it's via Typeform's own native connectors, not this codebase).
// The goal is a drop-in replacement for the Typeform iframe, not a new
// pipeline — everything downstream of the assessments-row write (token
// gating, /signup, portal dashboard) is untouched and handles this exactly
// like it already handles a Typeform submission.

import { dbInsert, dbGet, dbPatch } from '../../../lib/supabase';
import { determineType } from '../../../lib/profiles';
import { QUESTIONS } from '../../../lib/quiz-data';

const VALID_ORIENTATIONS = new Set(['WHY', 'WHAT', 'HOW']);
const QUESTION_IDS = QUESTIONS.map(q => q.id);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token, name, email, answers, tiebreakerType, tiebreakerAnswer } = req.body || {};

    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Answers are required.' });

    for (const id of QUESTION_IDS) {
      const orientation = answers[id];
      if (!VALID_ORIENTATIONS.has(orientation)) {
        return res.status(400).json({ error: `Missing or invalid answer for question ${id}.` });
      }
    }

    // Recompute scores server-side from the raw answers — never trust a
    // client-submitted score directly.
    const scores = { WHY: 0, WHAT: 0, HOW: 0 };
    for (const id of QUESTION_IDS) scores[answers[id]] += 1;

    if (tiebreakerAnswer) {
      if (!VALID_ORIENTATIONS.has(tiebreakerAnswer)) {
        return res.status(400).json({ error: 'Invalid tie-breaker answer.' });
      }
      // Only accept a tie-breaker answer if the underlying scores actually
      // tied on the pair it claims to resolve — prevents a manipulated
      // client payload from injecting an extra point anywhere it likes.
      const pairs = { WHY_WHAT: ['WHY', 'WHAT'], WHY_HOW: ['WHY', 'HOW'], WHAT_HOW: ['WHAT', 'HOW'] };
      const pair = pairs[tiebreakerType];
      const validPair = pair && scores[pair[0]] === scores[pair[1]] && pair.includes(tiebreakerAnswer);
      if (!validPair) return res.status(400).json({ error: 'Tie-breaker does not match submitted scores.' });
      scores[tiebreakerAnswer] += 1;
    }

    const h_score = scores.HOW;
    const w_score = scores.WHAT;
    const y_score = scores.WHY;
    const type = determineType(h_score, w_score, y_score);
    const submitted_at = new Date().toISOString();

    await dbInsert('assessments', {
      token: token || null,
      name: name.trim(),
      email: email.trim(),
      type,
      h_score,
      w_score,
      y_score,
      submitted_at,
    });

    if (token) {
      try {
        const tokenRows = await dbGet('tokens', { token });
        if (tokenRows.length) {
          const tr = tokenRows[0];
          const patch = {};
          if (name) patch.created_for_name = name.trim();
          if (email) patch.created_for_email = email.trim();
          if (tr.name == null && name) patch.name = name.trim();
          if (tr.email == null && email) patch.email = email.trim();
          if (Object.keys(patch).length) await dbPatch('tokens', { token }, patch);
        }
      } catch (patchErr) {
        console.error('[quiz/submit] token backfill failed:', patchErr);
      }
    }

    return res.status(200).json({ ok: true, type });
  } catch (err) {
    console.error('[quiz/submit] error', err);
    return res.status(500).json({ error: err.message });
  }
}
