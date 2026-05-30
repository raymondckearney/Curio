/*
 * Single webhook endpoint for all Typeform submissions.
 * Configure ONE webhook in Typeform → Connect → Webhooks pointing to:
 *   https://www.choosecurio.com/api/webhooks/typeform
 *
 * The profile type is calculated server-side from h_score, w_score, y_score.
 * These must be set as Typeform variables (or hidden fields) in your form.
 */

import crypto from 'crypto';
import { dbInsert } from '../../../lib/supabase';
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
      answerCount: answers.length,
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

    const name  = hidden.name  || null;
    const email = hidden.email || null;
    const token = hidden.token || null;

    // Calculate profile type from scores
    const type = determineType(h_score || 0, w_score || 0, y_score || 0);

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

    return res.status(200).json({ ok: true, type });
  } catch (err) {
    console.error('[typeform webhook] error', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
