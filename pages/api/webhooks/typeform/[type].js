/*
 * Supabase SQL — run this in the Supabase SQL editor to create the assessments table:
 *
 * CREATE TABLE IF NOT EXISTS assessments (
 *   id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name          text,
 *   email         text,
 *   type          text,
 *   h_score       integer,
 *   w_score       integer,
 *   y_score       integer,
 *   submitted_at  timestamptz NOT NULL DEFAULT now()
 * );
 *
 * -- Optional: index for querying by type or email
 * CREATE INDEX IF NOT EXISTS assessments_type_idx  ON assessments (type);
 * CREATE INDEX IF NOT EXISTS assessments_email_idx ON assessments (email);
 */

import { dbInsert } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    const body = req.body || {};
    const formResponse = body.form_response || {};

    // Hidden fields come as a plain object: { name: "Ray", email: "ray@..." }
    const hidden = formResponse.hidden || {};

    // Answers array — each item has a field.ref and a value depending on type
    const answers = formResponse.answers || [];

    // Helper to extract a numeric answer by field ref
    function getAnswerNumber(ref) {
      const answer = answers.find(a => a.field && a.field.ref === ref);
      if (!answer) return null;
      // Typeform number answers: { number: 42 }
      if (typeof answer.number === 'number') return answer.number;
      // Typeform text answers that are numeric strings
      if (answer.text !== undefined) return parseInt(answer.text, 10) || null;
      return null;
    }

    const name  = hidden.name  || null;
    const email = hidden.email || null;

    // Scores: first try hidden fields (if set as hidden variables),
    // then fall back to looking for answers with ref matching the score key.
    const h_score = hidden.h_score != null
      ? parseInt(hidden.h_score, 10)
      : getAnswerNumber('h_score');

    const w_score = hidden.w_score != null
      ? parseInt(hidden.w_score, 10)
      : getAnswerNumber('w_score');

    const y_score = hidden.y_score != null
      ? parseInt(hidden.y_score, 10)
      : getAnswerNumber('y_score');

    await dbInsert('assessments', {
      name,
      email,
      type,
      h_score: isNaN(h_score) ? null : h_score,
      w_score: isNaN(w_score) ? null : w_score,
      y_score: isNaN(y_score) ? null : y_score,
      submitted_at: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[typeform webhook]', err);
    // Return 200 so Typeform doesn't retry on DB errors
    return res.status(200).json({ ok: false, error: err.message });
  }
}
