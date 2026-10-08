// Team Builder: the four-step flow (the work, review activities, roster,
// result) and the individual plan view. All numbers come from the
// deterministic engine (lib/team-builder/engine.js) and recalculate from
// the current state on every edit. The AI reads the document (step 1) and
// writes the explanation (step 4, debounced, people as labels only).
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { buildTeam } from '../../lib/team-builder/engine';
import { SAMPLE_SOW, SAMPLE_ROSTER } from '../../lib/team-builder/sample';
import { narrativeInput, narrativeRequests, mergeNarrative, runRecord } from '../../lib/team-builder/payload';
import { TB_CSS } from './shared';
import { StepWork, StepActivities, StepRoster } from './Steps';
import { Result, PersonPlan } from './Result';
import { describe } from '../../lib/team-builder/view';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const NARRATIVE_DEBOUNCE_MS = 1500;
const SAVE_FALLBACK_MS = 10000;
const STEP_NAMES = ['The work', 'Review activities', 'Roster', 'Result'];

let seq = 0;
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const ongoingPhase = weeks => ({ key: uid('ph'), name: 'Ongoing', start: 1, end: +weeks || 1, ongoing: true });
const EMPTY = { phases: [], acts: [], weeks: '', hours: '', useRoster: true, roster: [], project: { name: null, client: null } };

function fromExtraction(x) {
  const phases = x.phases.map(p => ({ key: uid('ph'), name: p.name, start: p.start, end: p.end, ongoing: !!p.ongoing }));
  const keyOf = Object.fromEntries(phases.map(p => [p.name, p.key]));
  const ongoing = phases.find(p => p.ongoing);
  const acts = x.activities.map(a => ({
    key: uid('act'), name: a.name, tax: a.taxonomyId, tag: a.tag, phase: keyOf[a.phase] || ongoing.key,
    share: a.sharePct, mode: a.delivery, src: a.source === 'inferred' ? 'Inferred' : 'Stated',
    shiftReason: a.shiftReason || null, aiTag: a.tag, aiShiftReason: a.shiftReason || null, evidence: a.evidence || null,
  }));
  const lastWeek = Math.max(0, ...phases.filter(p => !p.ongoing).map(p => p.end));
  const weeks = x.project.durationWeeks || lastWeek || '';
  if (ongoing && weeks) ongoing.end = +weeks;
  return { phases, acts, weeks, hours: x.project.totalHours || '', project: { name: x.project.name || null, client: x.project.client || null } };
}

function readFileBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(new Error('That file could not be read.'));
    r.readAsDataURL(file);
  });
}

export default function TeamBuilder({ taxonomy, toolLinks, canImport }) {
  const [step, setStep] = useState(1);
  const [started, setStarted] = useState(false);
  const [doc, setDoc] = useState('');
  const [file, setFile] = useState(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState('');
  const [readInfo, setReadInfo] = useState({ notes: null, warnings: [] });
  const [usedSample, setUsedSample] = useState(false);
  const [state, setState] = useState(EMPTY);
  const [plan, setPlan] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [writing, setWriting] = useState(false);
  const [narrativeError, setNarrativeError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(null);
  const top = useRef(null);
  const cache = useRef(new Map());
  const saved = useRef(new Set());
  const currentSig = useRef(null);

  const update = useCallback(fn => setState(s => fn(s)), []);

  const go = n => {
    setStep(n); setPlan(null);
    if (top.current) top.current.scrollIntoView({ block: 'start' });
  };

  const R = useMemo(() => {
    if (!state.acts.length) return null;
    return buildTeam({
      phases: state.phases,
      activities: state.acts,
      weeks: state.weeks,
      hours: state.hours,
      roster: state.roster.map(r => ({ key: r.key, name: r.name.trim() || 'Unnamed', profile: r.profile, avail: r.avail })),
      useRoster: state.useRoster,
    });
  }, [state]);
  const V = useMemo(() => (R ? describe(R, state) : null), [R, state]);

  // ── Step 1 ──
  async function readDocument() {
    setReadError('');
    if (file && file.size > MAX_FILE_BYTES) { setReadError('That file is over 3 MB. Paste the text instead, or upload a smaller file.'); return; }
    setReading(true);
    try {
      const body = file
        ? { file: { name: file.name, mediaType: file.type || '', base64: await readFileBase64(file) } }
        : { text: doc };
      const res = await fetch('/api/team-builder/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || (res.status === 413 ? 'That file is too large to send. Paste the text instead.' : 'The document could not be read. Please try again.'));
      const next = fromExtraction(d);
      setState(s => ({
        ...s, ...next,
        roster: s.roster.length || !usedSample || file ? s.roster : SAMPLE_ROSTER.map(r => ({ key: uid('p'), name: r.name, profile: r.profile, avail: r.avail, skills: '', seniority: '' })),
      }));
      setReadInfo({ notes: d.notes || null, warnings: d.warnings || [] });
      setStarted(true);
      go(2);
    } catch (err) {
      setReadError(err.message);
    } finally {
      setReading(false);
    }
  }

  function startByHand() {
    const first = { key: uid('ph'), name: 'Phase 1', start: 1, end: 4, ongoing: false };
    setState(s => ({ ...s, phases: s.phases.length ? s.phases : [first, ongoingPhase(4)], weeks: s.weeks || 4 }));
    setReadInfo({ notes: null, warnings: [] });
    setStarted(true);
    go(2);
  }

  // ── Step 4: narrative, debounced, in parallel parts ──
  const input = useMemo(() => (R && step === 4 ? narrativeInput(R, state) : null), [R, state, step]);
  const sig = useMemo(() => (input ? JSON.stringify(input) : null), [input]);

  useEffect(() => {
    if (!sig) return undefined;
    currentSig.current = sig;
    setNarrativeError('');
    const hit = cache.current.get(sig);
    if (hit) { setNarrative(hit); setWriting(false); return undefined; }
    setNarrative(null);
    const record = runRecord(R, state);
    const save = () => {
      if (saved.current.has(sig)) return;
      saved.current.add(sig);
      fetch('/api/team-builder/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) }).catch(() => {});
    };
    const fallback = setTimeout(save, SAVE_FALLBACK_MS);
    const timer = setTimeout(() => {
      setWriting(true);
      const parts = [];
      let failed = 0;
      const reqs = narrativeRequests(input);
      Promise.all(reqs.map(body => fetch('/api/team-builder/narrative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(part => {
          parts.push(part);
          if (currentSig.current !== sig) return;
          setNarrative(mergeNarrative(parts, R, state));
          save();
        })
        .catch(() => { failed += 1; })))
        .then(() => {
          if (currentSig.current !== sig) return;
          setWriting(false);
          if (parts.length) cache.current.set(sig, mergeNarrative(parts, R, state));
          if (failed) setNarrativeError(parts.length ? 'Some of the written explanation is unavailable, so the standard wording is shown there.' : 'The written explanation is unavailable right now, so the standard wording is shown.');
        });
    }, NARRATIVE_DEBOUNCE_MS);
    return () => { clearTimeout(timer); clearTimeout(fallback); };
  // R and state are captured with sig; sig changes whenever they matter.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  // ── PDFs ──
  async function pdf(kind, keys) {
    if (!V) return;
    setPdfBusy(kind === 'person' ? keys[0] : kind);
    try {
      const mod = await import('../../lib/team-builder/pdf');
      if (kind === 'brief') await mod.downloadTeamBrief(V, narrative, toolLinks);
      else await mod.downloadPlans(V, narrative, toolLinks, keys);
    } catch (err) {
      console.error(err);
      alert('The PDF could not be built. Please try again.');
    } finally {
      setPdfBusy(null);
    }
  }

  const canStep = n => n === 1 || (started && (n < 4 || state.acts.length > 0));
  const person = plan && R ? R.people.find(p => p.key === plan) : null;

  return (
    <div className="tb" ref={top} style={{ scrollMarginTop: 80 }}>
      <style dangerouslySetInnerHTML={{ __html: TB_CSS }} />
      <ol className="steps">
        {STEP_NAMES.map((t, i) => (
          <li key={t}><button type="button" aria-current={step === i + 1 ? 'step' : undefined} disabled={!canStep(i + 1)} onClick={() => go(i + 1)}>{i + 1}. {t}</button></li>
        ))}
      </ol>
      {step === 1 && (
        <StepWork
          doc={doc} setDoc={setDoc} file={file} setFile={f => { setFile(f); setReadError(''); }}
          onRead={readDocument} onManual={startByHand}
          onSample={() => { setFile(null); setDoc(SAMPLE_SOW); setUsedSample(true); setReadError(''); }}
          reading={reading} error={readError} maxBytes={MAX_FILE_BYTES}
        />
      )}
      {step === 2 && <StepActivities state={state} update={update} taxonomy={taxonomy} uid={uid} onNext={() => go(3)} notes={readInfo.notes} warnings={readInfo.warnings} />}
      {step === 3 && <StepRoster state={state} update={update} uid={uid} onNext={() => go(4)} canImport={canImport} />}
      {step === 4 && V && !person && (
        <Result
          V={V} narrative={narrative} writing={writing} narrativeError={narrativeError} toolLinks={toolLinks}
          onOpen={k => { setPlan(k); if (top.current) top.current.scrollIntoView({ block: 'start' }); }}
          onRoster={() => go(3)} onBrief={() => pdf('brief')} onPlans={() => pdf('plans', R.people.map(p => p.key))} pdfBusy={pdfBusy}
        />
      )}
      {step === 4 && V && person && (
        <PersonPlan
          V={V} p={person} narrative={narrative} toolLinks={toolLinks}
          onBack={() => { setPlan(null); if (top.current) top.current.scrollIntoView({ block: 'start' }); }}
          onDownload={() => pdf('person', [person.key])} pdfBusy={pdfBusy}
        />
      )}
      {step === 4 && !V && <div className="note">Add at least one activity to build the team.</div>}
    </div>
  );
}

