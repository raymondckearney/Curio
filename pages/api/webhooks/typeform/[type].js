/*
 * Supabase SQL — run this in the Supabase SQL editor to create the assessments table:
 *
 * CREATE TABLE IF NOT EXISTS assessments (
 *   id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   token         text,
 *   name          text,
 *   email         text,
 *   type          text,
 *   h_score       integer,
 *   w_score       integer,
 *   y_score       integer,
 *   submitted_at  timestamptz NOT NULL DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS assessments_token_idx ON assessments (token);
 */

import crypto from 'crypto';
import { dbInsert, dbGet, dbPatch } from '../../../../lib/supabase';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(rawBody, signature) {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;
  if (!secret) return true; // skip verification if secret not configured
  if (!signature) return false;

  // Typeform sends: sha256=<base64_hmac>
  const [algo, hash] = signature.split('=');
  if (algo !== 'sha256' || !hash) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  const rawBody = await getRawBody(req);
  const signature = req.headers['typeform-signature'];

  if (process.env.TYPEFORM_WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    console.error('[typeform webhook] signature mismatch', { signature, type });
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const body = JSON.parse(rawBody.toString());
    const formResponse = body.form_response || {};
    const hidden = formResponse.hidden || {};
    const answers = formResponse.answers || [];

    console.log('[typeform webhook] received', { type, hidden, answers: answers.map(a => ({ ref: a.field?.ref, type: a.type, text: a.text, email: a.email })) });

    function getAnswerNumber(ref) {
      const answer = answers.find(a => a.field && a.field.ref === ref);
      if (!answer) return null;
      if (typeof answer.number === 'number') return answer.number;
      if (answer.text !== undefined) return parseInt(answer.text, 10) || null;
      return null;
    }

    // Extract name/email: hidden fields → match by field title in definition → common refs → first text answer
    const definition = formResponse.definition || {};
    const defFields = definition.fields || [];

    function getAnswerText(ref) {
      const answer = answers.find(a => a.field?.ref === ref);
      return answer?.text || null;
    }

    function getAnswerByTitle(keyword) {
      const field = defFields.find(f => f.title?.toLowerCase().includes(keyword));
      if (!field) return null;
      const answer = answers.find(a => a.field?.ref === field.ref || a.field?.id === field.id);
      return answer?.text || answer?.email || null;
    }

    const emailAnswer = answers.find(a => a.type === 'email');
    const firstTextAnswer = answers.find(a => a.type === 'text')?.text || null;

    // Name: always prefer what the user typed in the form over hidden field placeholders like "Individual"
    const nameFromAnswers = getAnswerText('bd818c0c-5c80-47bb-95a2-b4bdc530f7a8')
      || getAnswerByTitle('name')
      || getAnswerText('name') || getAnswerText('full_name') || getAnswerText('first_name')
      || firstTextAnswer || null;
    const emailFromAnswers = emailAnswer?.email
      || getAnswerByTitle('email')
      || getAnswerText('email') || null;

    const name  = nameFromAnswers || hidden.participant_name || hidden.name || null;
    const email = emailFromAnswers || hidden.participant_email || hidden.email || null;
    const token = hidden.participant_token || hidden.token || null;
    const role  = hidden.role  || null;

    const h_score = hidden.h_score != null ? parseInt(hidden.h_score, 10) : getAnswerNumber('h_score');
    const w_score = hidden.w_score != null ? parseInt(hidden.w_score, 10) : getAnswerNumber('w_score');
    const y_score = hidden.y_score != null ? parseInt(hidden.y_score, 10) : getAnswerNumber('y_score');

    await dbInsert('assessments', {
      token,
      name,
      email,
      role,
      type,
      h_score: isNaN(h_score) ? null : h_score,
      w_score: isNaN(w_score) ? null : w_score,
      y_score: isNaN(y_score) ? null : y_score,
      submitted_at: new Date().toISOString(),
    });

    if (token) {
      try {
        const tokenRows = await dbGet('tokens', { token });
        if (tokenRows.length) {
          const tr = tokenRows[0];
          const patch = {};
          // Always write quiz-submitted name/email to created_for_* columns for signup prefill
          if (name) patch.created_for_name = name;
          if (email) patch.created_for_email = email;
          // Backfill base name/email only if not already set
          if (tr.name == null && name) patch.name = name;
          if (tr.email == null && email) patch.email = email;
          if (Object.keys(patch).length) await dbPatch('tokens', { token }, patch);
        }
      } catch (patchErr) {
        console.error('[typeform webhook] token backfill failed:', patchErr);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[typeform webhook]', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
