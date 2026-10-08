// Team Builder steps 1 to 3: the work, review activities, roster. Copy is
// the approved prototype's unless noted.
import { useState, useEffect, useRef } from 'react';
import { TAGS, MODES, orderedPhases } from '../../lib/team-builder/engine';
import { STEP2_EXPLAINERS, LOADING_MESSAGES, H } from '../../lib/team-builder/copy';
import { Select } from './shared';

// ── Step 1: the work ────────────────────────────────────────────────────
export function StepWork({ doc, setDoc, file, setFile, onRead, onManual, onSample, reading, error, maxBytes }) {
  const [msg, setMsg] = useState(0);
  const [over, setOver] = useState(false);
  const input = useRef(null);
  useEffect(() => {
    if (!reading) { setMsg(0); return undefined; }
    const t = setInterval(() => setMsg(m => Math.min(m + 1, LOADING_MESSAGES.length - 1)), 8000);
    return () => clearInterval(t);
  }, [reading]);

  function pick(f) {
    if (!f) return;
    setFile(f);
  }
  const tooBig = file && file.size > maxBytes;

  return (
    <div className="stack">
      <div>
        <h1>Build the team around the work.</h1>
        <p style={{ marginTop: 10 }}>Team Builder reads a statement of work, work plan or project plan, maps the orientation each activity demands, and recommends the team shape, who owns and contributes to each activity, and where the drain will land.</p>
      </div>
      <div className="card stack">
        <label htmlFor="tb-doc">Paste a document
          <textarea id="tb-doc" value={doc} onChange={e => setDoc(e.target.value)} disabled={reading || !!file} placeholder="Paste the scope of work, the phases and any hours or duration it gives." />
        </label>
        <div
          className={`drop${over ? ' over' : ''}`}
          onDragOver={e => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
        >
          <input ref={input} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" style={{ display: 'none' }} onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          {file ? (
            <>
              <span style={{ fontWeight: 600 }}>{file.name}</span>
              <span className="small">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              <button type="button" className="link" onClick={() => setFile(null)} disabled={reading}>Remove the file</button>
            </>
          ) : (
            <>
              <button type="button" className="btn ghost small" onClick={() => input.current?.click()} disabled={reading}>Upload a file</button>
              <span className="small">Or drop one here. PDF, Word (.docx) or text, up to 3 MB.</span>
            </>
          )}
        </div>
        {tooBig && <div className="err">That file is over 3 MB. Paste the text instead, or upload a smaller file.</div>}
        {error && <div className="err">{error}</div>}
        <div className="actions">
          <div className="row" style={{ alignItems: 'center', gap: 14 }}>
            <button type="button" className="link" onClick={onSample} disabled={reading}>Use a sample statement of work</button>
            <button type="button" className="link" onClick={onManual} disabled={reading}>Enter the activities by hand</button>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            {reading && <span className="writing" role="status">{LOADING_MESSAGES[msg]}</span>}
            <button type="button" className="btn" onClick={onRead} disabled={reading || tooBig || (!file && !doc.trim())}>Read the document</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: review activities ───────────────────────────────────────────
function ShiftChip({ reason }) {
  const [open, setOpen] = useState(false);
  const text = reason || 'Changed here from the matched entry’s tag.';
  return (
    <span className="shiftwrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="chip shift" aria-expanded={open} onClick={() => setOpen(o => !o)} onBlur={() => setOpen(false)}>Shifted</button>
      {open && <span className="shiftpop" role="tooltip">{text}</span>}
    </span>
  );
}

const intOr = (v, d) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d);

export function StepActivities({ state, update, taxonomy, uid, onNext, notes, warnings }) {
  const { phases, acts, weeks, hours } = state;
  const taxById = Object.fromEntries(taxonomy.map(t => [t.id, t]));
  const ordered = orderedPhases(phases);
  const shareTotal = acts.reduce((s, a) => s + Math.max(0, +a.share || 0), 0);
  const hoursOf = a => (shareTotal ? Math.max(0, +a.share || 0) / shareTotal * (+hours || 0) : 0);
  const tot = Math.round(shareTotal * 10) / 10;

  const setPhase = (key, patch) => update(s => ({ ...s, phases: s.phases.map(p => (p.key === key ? { ...p, ...patch } : p)) }));
  const setAct = (key, patch) => update(s => ({ ...s, acts: s.acts.map(a => (a.key === key ? { ...a, ...patch } : a)) }));
  const taxOptions = [{ v: 0, l: 'Not on the list' }, ...taxonomy.map(t => ({ v: t.id, l: `${t.id}. ${t.name}` }))];
  const phaseOptions = ordered.map(p => ({ v: p.key, l: p.name || 'Unnamed phase' }));

  function addPhase() {
    const last = Math.max(0, ...phases.filter(p => !p.ongoing).map(p => intOr(p.end, 1)));
    update(s => ({ ...s, phases: [...s.phases, { key: uid('ph'), name: 'New phase', start: last + 1, end: last + 2, ongoing: false }] }));
  }
  function addAct() {
    const t = taxById[14] || taxonomy[0];
    update(s => ({ ...s, acts: [...s.acts, { key: uid('act'), name: 'New activity', tax: t.id, tag: t.tag, phase: orderedPhases(s.phases)[0].key, share: 3, mode: 'Solo', src: 'Added', shiftReason: null }] }));
  }

  return (
    <div className="stack">
      <div>
        <h2>Review the activities</h2>
        <p style={{ marginTop: 8 }}>Here is what Team Builder found in the document. Correct anything that reads wrong before the team is built.</p>
      </div>
      {(notes || warnings?.length > 0) && (
        <div className="note">
          {notes && <div><b>From the document read:</b> {notes}</div>}
          {warnings?.length > 0 && <ul className="plain" style={{ marginTop: notes ? 6 : 0 }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>}
        </div>
      )}
      <div className="grid3">
        {STEP2_EXPLAINERS.map(([title, body]) => (
          <div key={title} className="card def"><b>{title}</b>
            <p className="small">{title === 'Matching' ? <>Each activity is matched to the closest entry on the MindPrint™ activity list, which sets its demand tag. Anything with no close match is marked <span className="chip unl">Unlisted</span> and keeps the tag set here. Unlisted activities are logged so the list can grow.</> : body}</p>
          </div>
        ))}
      </div>

      <div className="card stack">
        <div><h3>Phases</h3><p className="small">Read from the document. Rename, re-time, add or remove phases. Ongoing holds work that runs across every phase, such as project management.</p></div>
        <div className="scroll">
          <table>
            <thead><tr><th>Phase</th><th>Start week</th><th>End week</th><th>Activities</th><th /></tr></thead>
            <tbody>
              {ordered.map(p => {
                const n = acts.filter(a => a.phase === p.key).length;
                return (
                  <tr key={p.key}>
                    <td><input type="text" aria-label="Phase name" value={p.name} onChange={e => setPhase(p.key, { name: e.target.value })} style={{ minWidth: 140 }} /></td>
                    <td>{p.ongoing ? <span className="small">All</span> : <input type="number" min="1" aria-label="Start week" value={p.start} onChange={e => setPhase(p.key, { start: e.target.value })} onBlur={() => setPhase(p.key, { start: Math.max(1, intOr(p.start, 1)) })} />}</td>
                    <td>{p.ongoing ? <span className="small">All</span> : <input type="number" min="1" aria-label="End week" value={p.end} onChange={e => setPhase(p.key, { end: e.target.value })} onBlur={() => setPhase(p.key, { end: Math.max(intOr(p.start, 1), intOr(p.end, 1)) })} />}</td>
                    <td>{n}</td>
                    <td>{!p.ongoing && <button type="button" className="x" aria-label="Remove phase" disabled={n > 0} title={n ? 'Move its activities to another phase first' : 'Remove phase'} onClick={() => update(s => ({ ...s, phases: s.phases.filter(x => x.key !== p.key) }))}>×</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ alignItems: 'center' }}>
          <button type="button" className="btn ghost small" onClick={addPhase}>Add a phase</button>
          <span className="small">A phase can be removed once its activities have moved to another phase.</span>
        </div>
        <div className="row">
          <label htmlFor="tb-weeks">Duration (weeks)<input id="tb-weeks" type="number" min="1" value={weeks} onChange={e => update(s => ({ ...s, weeks: e.target.value }))} style={{ width: 110 }} /></label>
          <label htmlFor="tb-hours">Total effort (hours)<input id="tb-hours" type="number" min="0" value={hours} onChange={e => update(s => ({ ...s, hours: e.target.value }))} style={{ width: 140 }} /></label>
        </div>
      </div>

      <div className="scroll">
        <table>
          <thead><tr><th>Activity</th><th>Matched to</th><th>Demand</th><th>Phase</th><th>Share</th><th>Hours</th><th>Delivery</th><th>Source</th><th /></tr></thead>
          <tbody>
            {acts.map(a => {
              const base = a.tax > 0 ? taxById[a.tax]?.tag : null;
              const shifted = !!base && a.tag !== base;
              return (
                <tr key={a.key}>
                  <td><input type="text" aria-label="Activity name" value={a.name} onChange={e => setAct(a.key, { name: e.target.value })} /></td>
                  <td><Select options={taxOptions} value={a.tax} aria-label="Matched activity" onChange={v => { const id = +v; setAct(a.key, id > 0 ? { tax: id, tag: taxById[id].tag, shiftReason: null } : { tax: 0, shiftReason: null }); }} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Select options={TAGS} value={a.tag} aria-label="Demand tag" onChange={v => setAct(a.key, { tag: v, shiftReason: v === a.aiTag ? a.aiShiftReason || null : null })} />
                    {shifted && <ShiftChip reason={a.shiftReason} />}
                  </td>
                  <td><Select options={phaseOptions} value={a.phase} aria-label="Phase" onChange={v => setAct(a.key, { phase: v })} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}><input type="number" min="0" aria-label="Share of effort, percent" value={a.share} onChange={e => setAct(a.key, { share: e.target.value })} onBlur={() => setAct(a.key, { share: Math.max(0, +a.share || 0) })} /> %</td>
                  <td className="small" style={{ whiteSpace: 'nowrap' }}>{H(hoursOf(a))}</td>
                  <td><Select options={MODES} value={a.mode} aria-label="Delivery" onChange={v => setAct(a.key, { mode: v })} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {a.tax === 0 && <><span className="chip unl">Unlisted</span>{' '}</>}
                    <span className={`chip${a.src === 'Stated' ? '' : ' inf'}`} title={a.evidence ? `From the document: “${a.evidence}”` : undefined}>{a.src}</span>
                  </td>
                  <td><button type="button" className="x" aria-label="Remove activity" onClick={() => update(s => ({ ...s, acts: s.acts.filter(x => x.key !== a.key) }))}>×</button></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>Total</td><td>{tot}%</td><td>{H(+hours || 0)}</td>
              <td colSpan={3} className="small" style={{ fontWeight: 500 }}>{!acts.length || tot === 100 ? '' : `Shares add to ${tot}%, so they are scaled to 100% for the result.`}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!(+hours > 0) && <div className="note">No total hours yet. Add the project’s total effort for real hours, a firmer headcount range and capacity checks.</div>}
      <div className="actions">
        <button type="button" className="btn ghost small" onClick={addAct}>Add an activity</button>
        <button type="button" className="btn" onClick={onNext} disabled={!acts.length}>Continue to roster</button>
      </div>
    </div>
  );
}

// ── Step 3: roster ──────────────────────────────────────────────────────
const SENIORITY = ['', 'Junior', 'Mid', 'Senior', 'Principal'];

export function StepRoster({ state, update, uid, onNext, canImport }) {
  const { roster, useRoster, weeks } = state;
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const setPerson = (key, patch) => update(s => ({ ...s, roster: s.roster.map(r => (r.key === key ? { ...r, ...patch } : r)) }));
  const W = +weeks || 12;

  async function importTeam() {
    setImporting(true); setImportMsg('');
    try {
      const r = await fetch('/api/portal/team');
      const d = r.ok ? await r.json() : { members: [] };
      const withProfiles = (d.members || []).filter(m => m.assessment_type && TAGS.includes(m.assessment_type.toUpperCase()));
      const have = new Set(roster.map(p => p.name.trim().toLowerCase()));
      const add = withProfiles.map(m => ({ name: (m.name || m.email || '').trim(), profile: m.assessment_type.toUpperCase() }))
        .filter(m => m.name && !have.has(m.name.toLowerCase()));
      if (add.length) update(s => ({ ...s, roster: [...s.roster, ...add.map(m => ({ key: uid('p'), name: m.name, profile: m.profile, avail: 100, skills: '', seniority: '' }))] }));
      setImportMsg(add.length ? `Added ${add.length} ${add.length === 1 ? 'person' : 'people'} from your team.` : withProfiles.length ? 'Everyone on your team with a profile is already on the roster.' : 'No one on your team has a completed profile yet.');
    } catch {
      setImportMsg('Your team could not be loaded. Add people by hand.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <h2>Add the roster</h2>
        <p style={{ marginTop: 8 }}>Enter the people being considered and their MindPrint™ Profiles. The roster is optional and is entered fresh for each run. Without one, the result describes the ideal team shape.</p>
      </div>
      <label className="toggle" htmlFor="tb-use"><input type="checkbox" id="tb-use" checked={useRoster} onChange={e => update(s => ({ ...s, useRoster: e.target.checked }))} /> Use this roster for the recommendation</label>
      {!useRoster && <div className="note">Design mode. The result recommends the ideal seats for this work, without a roster.</div>}
      <div className="scroll" style={useRoster ? undefined : { opacity: 0.6 }}>
        <table>
          <thead><tr><th>Name</th><th>Profile</th><th>Availability</th><th>Hours available</th><th>Skills and seniority</th><th /></tr></thead>
          <tbody>
            {roster.map(r => (
              <RosterRow key={r.key} r={r} W={W} setPerson={setPerson} remove={() => update(s => ({ ...s, roster: s.roster.filter(x => x.key !== r.key) }))} />
            ))}
            {!roster.length && <tr><td colSpan={6} className="small">No one yet. Add a person{canImport ? ', or add people from your team' : ''}.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <div className="row" style={{ alignItems: 'center' }}>
          <button type="button" className="btn ghost small" onClick={() => update(s => ({ ...s, roster: [...s.roster, { key: uid('p'), name: '', profile: 'HOW-WHAT', avail: 100, skills: '', seniority: '' }] }))}>Add a person</button>
          {canImport && <button type="button" className="btn ghost small" onClick={importTeam} disabled={importing}>{importing ? 'Loading your team…' : 'Add from my team'}</button>}
          <span className="small">Names are never sent to the AI.</span>
        </div>
        <button type="button" className="btn" onClick={onNext}>Build the team</button>
      </div>
      {importMsg && <div className="small" role="status">{importMsg}</div>}
    </div>
  );
}

function RosterRow({ r, W, setPerson, remove }) {
  const [open, setOpen] = useState(!!(r.skills || r.seniority));
  return (
    <>
      <tr>
        <td><input type="text" aria-label="Name" value={r.name} placeholder="Name" onChange={e => setPerson(r.key, { name: e.target.value })} /></td>
        <td><Select options={TAGS} value={r.profile} aria-label="Profile" onChange={v => setPerson(r.key, { profile: v })} /></td>
        <td><Select options={[100, 75, 50, 25].map(v => ({ v, l: `${v}%` }))} value={r.avail} aria-label="Availability" onChange={v => setPerson(r.key, { avail: +v })} /></td>
        <td className="small">{H(r.avail / 100 * W * 40)}</td>
        <td><button type="button" className="link" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? 'Hide' : (r.skills || r.seniority) ? 'Edit' : 'Add (optional)'}</button></td>
        <td><button type="button" className="x" aria-label="Remove person" onClick={remove}>×</button></td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} style={{ background: 'var(--warm)' }}>
            <div className="row">
              <label style={{ flex: '1 1 260px' }}>Skills
                <input type="text" value={r.skills} placeholder="For example: pricing models, survey design, SQL" onChange={e => setPerson(r.key, { skills: e.target.value })} style={{ minWidth: 0, width: '100%' }} />
              </label>
              <label>Seniority
                <Select options={SENIORITY.map(v => ({ v, l: v || 'Not set' }))} value={r.seniority} onChange={v => setPerson(r.key, { seniority: v })} />
              </label>
            </div>
            <p className="small" style={{ marginTop: 6 }}>Context for the written plans only. Skills and seniority never change who owns what, or what is energizing or draining.</p>
          </td>
        </tr>
      )}
    </>
  );
}
