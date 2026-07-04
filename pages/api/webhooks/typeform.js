/*
 * Single webhook endpoint for all Typeform submissions.
 * Configure ONE webhook in Typeform → Connect → Webhooks pointing to:
 *   https://www.choosecurio.com/api/webhooks/typeform
 *
 * The profile type is calculated server-side from h_score, w_score, y_score.
 * These must be set as Typeform variables (or hidden fields) in your form.
 */

import crypto from 'crypto';
import { dbInsert, dbGet, dbPatch } from '../../../lib/supabase';
import { determineType } from '../../../lib/profiles';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(rawBody, signature, secret) {
  const [algo, hash] = (signature || '').split('=');
  if (algo !== 'sha256' || !hash) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    const a = Buffer.from(hash, 'base64');
    const b = Buffer.from(expected, 'base64');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawBody = await getRawBody(req);
  const signature = req.headers['typeform-signature'];

  // Only verify signature when both the env var AND a signature header are present
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;
  if (secret && signature) {
    if (!verifySignature(rawBody, signature, secret)) {
      console.error('[typeform webhook] signature mismatch');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    const body = JSON.parse(rawBody.toString());
    const formResponse = body.form_response || {};
    const hidden = formResponse.hidden || {};
    const answers = formResponse.answers || [];
    const variables = formResponse.variables || [];

    console.log('[typeform webhook] received', {
      hidden,
      variables: variables.map(v => ({ key: v.key, type: v.type, value: v.number ?? v.text })),
      answers: answers.map(a => ({ ref: a.field?.ref, type: a.type, text: a.text, email: a.email })),
    });

    // Extract scores — check variables first, then hidden fields, then answer refs
    function getVariable(key) {
      const v = variables.find(v => v.key === key);
      if (!v) return null;
      return v.type === 'number' ? v.number : (parseInt(v.text, 10) || null);
    }

    function getAnswerNumber(ref) {
      const answer = answers.find(a => a.field?.ref === ref);
      if (!answer) return null;
      if (typeof answer.number === 'number') return answer.number;
      if (answer.text !== undefined) return parseInt(answer.text, 10) || null;
      return null;
    }

    const h_score = hidden.h_score != null ? parseInt(hidden.h_score, 10)
                  : getVariable('h_score') ?? getAnswerNumber('h_score');
    const w_score = hidden.w_score != null ? parseInt(hidden.w_score, 10)
                  : getVariable('w_score') ?? getAnswerNumber('w_score');
    const y_score = hidden.y_score != null ? parseInt(hidden.y_score, 10)
                  : getVariable('y_score') ?? getAnswerNumber('y_score');

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

    const nameFromAnswers = getAnswerByTitle('name')
      || getAnswerText('name') || getAnswerText('full_name') || getAnswerText('first_name') || getAnswerText('participant_name')
      || firstTextAnswer || null;
    const emailFromAnswers = emailAnswer?.email
      || getAnswerByTitle('email')
      || getAnswerText('email') || getAnswerText('participant_email') || null;

    const name  = hidden.participant_name  || hidden.name  || nameFromAnswers  || null;
    const email = hidden.participant_email || hidden.email || emailFromAnswers || null;
    const token = hidden.participant_token || hidden.token || null;

    // Abort with a clear error if scores are missing — don't silently route to wrong profile
    if (h_score == null || w_score == null || y_score == null) {
      console.error('[typeform webhook] MISSING SCORES — cannot determine type', { h_score, w_score, y_score, variables: variables.map(v => v.key) });
      await dbInsert('assessments', {
        token, name, email,
        type: 'unknown',
        h_score: null, w_score: null, y_score: null,
        submitted_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: false, error: 'missing_scores' });
    }

    // Calculate profile type from scores
    const type = determineType(h_score, w_score, y_score);

    console.log('[typeform webhook] scores', { h_score, w_score, y_score, type, token });

    await dbInsert('assessments', {
      token,
      name,
      email,
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

    return res.status(200).json({ ok: true, type });
  } catch (err) {
    console.error('[typeform webhook] error', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
