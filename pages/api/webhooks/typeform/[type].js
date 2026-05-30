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
import { dbInsert } from '../../../../lib/supabase';

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

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const body = JSON.parse(rawBody.toString());
    const formResponse = body.form_response || {};
    const hidden = formResponse.hidden || {};
    const answers = formResponse.answers || [];

    function getAnswerNumber(ref) {
      const answer = answers.find(a => a.field && a.field.ref === ref);
      if (!answer) return null;
      if (typeof answer.number === 'number') return answer.number;
      if (answer.text !== undefined) return parseInt(answer.text, 10) || null;
      return null;
    }

    const name  = hidden.name  || null;
    const email = hidden.email || null;
    const token = hidden.token || null;

    const h_score = hidden.h_score != null ? parseInt(hidden.h_score, 10) : getAnswerNumber('h_score');
    const w_score = hidden.w_score != null ? parseInt(hidden.w_score, 10) : getAnswerNumber('w_score');
    const y_score = hidden.y_score != null ? parseInt(hidden.y_score, 10) : getAnswerNumber('y_score');

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

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[typeform webhook]', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
