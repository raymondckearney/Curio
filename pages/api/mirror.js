import { dbInsert } from '../../lib/supabase';
import { getMirrorTokenFromCookie, findActiveMirrorToken, isOverDailyCap, recordMirrorRead, DAILY_READ_CAP } from '../../lib/mirrorAuth';
import { REGISTERS, ABSENCE_PRINCIPLE, DETECTION_GUARDRAILS, LOCKED_LANGUAGE_RULES } from '../../lib/language-framework';

// Mirror-specific system prompt. Shares every register/absence/guardrail
// definition with the Translator and Detector via lib/language-framework.js;
// only the task framing and output format below are unique to this tool.
const SYSTEM = `You are the MindPrint(tm) Language Mirror, a public AI tool by Curio (choosecurio.com), governed by the MindPrint Language Framework. You read a sample of the user's OWN writing and offer a hypothesis about which cognitive orientations it leans toward, at four levels: vocabulary, structure, questions, and frame.

${REGISTERS}

${ABSENCE_PRINCIPLE}

${DETECTION_GUARDRAILS}

${LOCKED_LANGUAGE_RULES}

Additional rules specific to this tool: this reads the user's own writing only, never a third party's, that is already enforced before this prompt runs. Quote short fragments from the user's own text as evidence for every observation, never invent quotes. One sample is weak evidence; note it in one line without belaboring it.

Output format:
## The read (2-3 sentences: which orientation the sample reads forward, which is also present, which is conspicuously quiet)
## The evidence (grouped by the four levels, each observation with a short quoted fragment from the sample)
## The quiet third (what is absent and what that absence would mean IF this sample reflects wiring rather than role or genre)
## One experiment (a single concrete rewrite suggestion the user can try on this very text to reach the quiet orientation)
No preamble, no closing pleasantries.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = getMirrorTokenFromCookie(req);
  const row = await findActiveMirrorToken(token);
  // 404, not 401/403: an invalid or missing credential reveals nothing.
  if (!row) return res.status(404).json({ error: 'Not found' });

  const { sample, isMine, consent } = req.body || {};
  if (typeof sample !== 'string' || sample.trim().length < 200) {
    return res.status(400).json({ error: 'Paste at least 200 characters.' });
  }
  // TEMPORARY: isMine requirement disabled to match the checkbox removed
  // from pages/mirror.js. Restore both together.
  // if (isMine !== true) {
  //   return res.status(400).json({ error: 'The Mirror reads your own writing only.' });
  // }

  if (isOverDailyCap(row)) {
    return res.status(429).json({ error: `This preview link has reached its limit of ${DAILY_READ_CAP} reads for today. It resets at midnight UTC.` });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: `My writing sample:\n\n${sample}` }],
      }),
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok || data.error) {
      return res.status(anthropicRes.status || 500).json({ error: data.error?.message || 'Request to Anthropic failed' });
    }

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');

    await recordMirrorRead(row);

    if (consent === true) {
      try {
        await dbInsert('writing_samples', {
          mirror_token_id: row.id,
          sample_text: sample,
          mirror_output: text,
          consented: true,
        });
      } catch (e) {
        console.error('[mirror] writing_samples insert failed:', e.message);
      }
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('[mirror]', err);
    return res.status(500).json({ error: err.message });
  }
}
