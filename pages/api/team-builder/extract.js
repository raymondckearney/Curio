// Team Builder, AI call 1: read a work document and return its activities,
// phases, duration and effort, matched to the MindPrint™ Activity Taxonomy.
// System prompt: team_builder_system_prompt.md PART A + the taxonomy + the
// Source of Truth, read at request time. The result is validated here
// before it reaches the browser (lib/team-builder/validate.js).
import { loadDocs } from '../../../lib/team-builder/loadDocs';
import { requireAccess, overDailyCap, logCall, callModel, parseJson, systemBlocks, MODEL_DEADLINE_MS } from '../../../lib/team-builder/server';
import { documentBlocks } from '../../../lib/team-builder/documents';
import { validateExtraction } from '../../../lib/team-builder/validate';

export const config = { maxDuration: 60, api: { bodyParser: { sizeLimit: '4.5mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await requireAccess(req, res);
  if (!auth) return;

  try {
    const { blocks, error } = await documentBlocks(req.body || {});
    if (error) return res.status(400).json({ error });
    if (await overDailyCap(res, auth, 'extract')) return;
    await logCall(auth, 'extract');

    const docs = loadDocs();
    const system = systemBlocks(docs.partA, docs, 'Team Builder PART A: EXTRACTION');
    const deadline = Date.now() + MODEL_DEADLINE_MS;
    const started = Date.now();

    let out = await callModel({ system, content: blocks, maxTokens: 8000, deadline });
    if (out.error) return res.status(out.status).json({ error: out.error });
    let parsed = parseJson(out.text);
    // One retry on unreadable JSON, if there is time left for it.
    if (!parsed && Date.now() - started < 25000) {
      out = await callModel({ system, content: [...blocks, { type: 'text', text: 'Return valid JSON only.' }], maxTokens: 8000, deadline });
      if (out.error) return res.status(out.status).json({ error: out.error });
      parsed = parseJson(out.text);
    }
    if (!parsed) return res.status(502).json({ error: 'The document could not be read into activities. Please try again, or paste just the scope section.' });

    return res.status(200).json(validateExtraction(parsed, docs.taxonomy));
  } catch (err) {
    console.error('[team-builder/extract]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
