// Team Builder, AI call 2: the human-facing prose that explains the
// engine's finished result. System prompt: team_builder_system_prompt.md
// PART B + the taxonomy + the Source of Truth, read at request time.
//
// To stay inside Vercel Hobby's 60-second limit, the browser asks for the
// narrative in parts that run side by side:
//   part "overview": the summary and the friction steps
//   part "people":   planIntro and expectations for the listed people only
// Every person is a label (P1, Seat A...). The browser keeps the names and
// substitutes them on render, so no name reaches this route or the model.
import { loadDocs } from '../../../lib/team-builder/loadDocs';
import { requireAccess, overDailyCap, logCall, callModel, parseJson, systemBlocks, MODEL_DEADLINE_MS } from '../../../lib/team-builder/server';
import { lintText } from '../../../lib/team-builder/language';

export const config = { maxDuration: 60 };

const LABEL_RE = /^(P\d{1,2}|Seat [A-Z])$/;

// Keep only what PART B needs, with sane sizes, and nothing name-shaped.
function cleanInput(input) {
  const s = (v, n = 160) => (typeof v === 'string' ? v.slice(0, n) : '');
  const label = v => (LABEL_RE.test(v) ? v : null);
  const people = (input.people || []).slice(0, 30).map(p => ({
    label: label(p.label), profile: s(p.profile, 8), roleTitle: s(p.roleTitle, 60), availability: +p.availability || 100,
    capacityHours: Math.round(+p.capacityHours || 0), loadHours: Math.round(+p.loadHours || 0),
    energy: { energizing: Math.round(+p.energy?.E || 0), neutral: Math.round(+p.energy?.N || 0), draining: Math.round(+p.energy?.D || 0) },
    engagementLead: !!p.engagementLead,
    ...(p.skills ? { skills: s(p.skills, 200) } : {}), ...(p.seniority ? { seniority: s(p.seniority, 20) } : {}),
    assignments: (p.assignments || []).slice(0, 80).map(a => ({ activity: s(a.activity), role: s(a.role, 12), energy: s(a.energy, 10), hours: Math.round(+a.hours || 0) })),
  })).filter(p => p.label);
  const activities = (input.activities || []).slice(0, 80).map(a => ({
    name: s(a.name), tag: s(a.tag, 8), phase: s(a.phase, 80), weeks: s(a.weeks, 40), hours: Math.round(+a.hours || 0), delivery: s(a.delivery, 12),
    owner: label(a.owner), contributors: (a.contributors || []).map(label).filter(Boolean), reviewer: label(a.reviewer),
  }));
  const friction = (input.friction || []).slice(0, 4).map(f => ({
    patternId: s(f.patternId, 20), title: s(f.title, 60), what: s(f.what, 400), people: (f.people || []).map(label).filter(Boolean),
    sharedActivities: (f.sharedActivities || []).map(x => s(x)).slice(0, 20), allowedTools: (f.allowedTools || []).map(Number).filter(Number.isInteger),
  }));
  const gaps = (input.gaps || []).slice(0, 30).map(g => ({ type: s(g.type, 30), text: s(g.text, 400) }));
  const project = { weeks: +input.project?.weeks || null, hours: +input.project?.hours || null, mode: input.project?.mode === 'design' ? 'design' : 'roster' };
  const demand = { WHY: +input.demand?.WHY || 0, WHAT: +input.demand?.WHAT || 0, HOW: +input.demand?.HOW || 0 };
  const focus = (input.focus || []).map(label).filter(Boolean);
  return { project, demand, people, activities, gaps, friction, focus };
}

// Drop anything that breaks the language rules; returns the failures found.
function scrub(out, part, data) {
  const failures = [];
  const check = (text, where) => { const p = lintText(text); if (p.length) failures.push({ where, p }); return p.length ? null : text; };
  const result = {};
  if (part === 'overview') {
    result.summary = typeof out.summary === 'string' ? check(out.summary, 'summary') : null;
    const allowed = Object.fromEntries(data.friction.map(f => [f.patternId, new Set(f.allowedTools)]));
    result.friction = (Array.isArray(out.friction) ? out.friction : [])
      .filter(f => allowed[f?.patternId])
      .map(f => ({
        patternId: f.patternId,
        steps: (Array.isArray(f.steps) ? f.steps : []).map((x, i) => (typeof x === 'string' ? check(x, `friction.${f.patternId}.${i}`) : null)).filter(Boolean).slice(0, 3),
        tools: (Array.isArray(f.tools) ? f.tools : []).map(Number).filter(t => allowed[f.patternId].has(t)).slice(0, 3),
      }));
  } else {
    const want = new Set(data.focus);
    result.people = (Array.isArray(out.people) ? out.people : [])
      .filter(p => want.has(p?.label))
      .map(p => ({
        label: p.label,
        planIntro: typeof p.planIntro === 'string' ? check(p.planIntro, `${p.label}.planIntro`) : null,
        items: (Array.isArray(p.items) ? p.items : []).map((it, i) => ({
          activity: typeof it?.activity === 'string' ? it.activity : '',
          role: typeof it?.role === 'string' ? it.role : '',
          expectation: typeof it?.expectation === 'string' ? check(it.expectation, `${p.label}.items.${i}`) : null,
        })),
      }));
  }
  return { result, failures };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await requireAccess(req, res);
  if (!auth) return;

  try {
    const part = req.body?.part === 'people' ? 'people' : 'overview';
    const data = cleanInput(req.body?.input || {});
    if (!data.people.length || !data.activities.length) return res.status(400).json({ error: 'Nothing to explain yet.' });
    if (part === 'people' && !data.focus.length) return res.status(400).json({ error: 'No people to write plans for.' });
    if (await overDailyCap(res, auth, 'narrative')) return;
    await logCall(auth, 'narrative');

    const docs = loadDocs();
    const system = systemBlocks(docs.partB, docs, 'Team Builder PART B: NARRATIVE');
    const task = part === 'overview'
      ? 'Write ONLY "summary" and "friction" for this request. Return "people" as an empty array. Write friction entries for every pattern given, in the same order.'
      : `Write ONLY "people" for these labels, in this order: ${data.focus.join(', ')}. Include every assignment of each listed person, in the order given. Return "summary" as an empty string and "friction" as an empty array.`;
    const content = [{ type: 'text', text: `ENGINE OUTPUT (people are labels; use them exactly):\n${JSON.stringify(data)}\n\n${task}` }];

    const deadline = Date.now() + MODEL_DEADLINE_MS;
    const started = Date.now();
    let out = await callModel({ system, content, maxTokens: part === 'overview' ? 2500 : 3500, deadline });
    if (out.error) return res.status(out.status).json({ error: out.error });
    let parsed = parseJson(out.text);
    if (!parsed && Date.now() - started < 25000) {
      out = await callModel({ system, content: [...content, { type: 'text', text: 'Return valid JSON only.' }], maxTokens: 3500, deadline });
      if (!out.error) parsed = parseJson(out.text);
    }
    if (!parsed) return res.status(502).json({ error: 'The written explanation came back unreadable.' });

    let { result, failures } = scrub(parsed, part, data);
    // Language rules broken: one retry naming the problems, if time allows.
    // Whatever still fails is dropped and the page uses its templated copy.
    if (failures.length && Date.now() - started < 28000) {
      const fix = `Your previous answer broke the language rules here: ${failures.map(f => `${f.where} (${f.p.join(', ')})`).join('; ')}. Rewrite the whole answer following every rule.`;
      const again = await callModel({ system, content: [...content, { type: 'text', text: fix }], maxTokens: 3500, deadline });
      const p2 = again.error ? null : parseJson(again.text);
      if (p2) ({ result, failures } = scrub(p2, part, data));
    }
    return res.status(200).json({ part, ...result, dropped: failures.length });
  } catch (err) {
    console.error('[team-builder/narrative]', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
