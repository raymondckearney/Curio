import { useState, useEffect, useRef } from 'react';
import {
  ORIENTATIONS, RosterRow, parseRoster, rosterTextFromParticipants,
  SA_CSS, PDF_INK, PDF_SLATE, PDF_EMERALD, PDF_DEEP_EMERALD, PDF_ENERGY_RGB,
} from './SessionArchitect';
import { durationsFor, INPUT_MODE_LABELS } from '../lib/meetingArchitect';

const MA_CSS = `
  .ma-textarea{min-height:84px;resize:vertical;line-height:1.5;}
  .ma-field{margin-bottom:14px;}
  .ma-field:last-child{margin-bottom:0;}
  .ma-hint{font-size:0.8rem;color:#64748B;margin:4px 0 0;}
  .ma-chip{display:inline-block;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;padding:3px 8px;border-radius:999px;margin-left:8px;vertical-align:middle;}
  .ma-chip-default{background:#F1F5F9;color:#64748B;}
  .ma-chip-edited{background:#DCFCE7;color:#065F46;}
  .ma-chip-lean{background:#DCFCE7;color:#065F46;margin-left:0;}
  .ma-chip-help{background:#FEF3C7;color:#92400E;margin-left:0;}
  .ma-link{background:none;border:none;padding:0;color:#059669;font-family:inherit;font-size:0.8rem;font-weight:600;cursor:pointer;text-decoration:underline;}
  .ma-note{background:#FFFBEB;border:1px solid #E9D8A6;border-radius:8px;padding:12px 14px;font-size:0.86rem;color:#78350F;margin-bottom:18px;line-height:1.5;}
  .ma-error{background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;font-size:0.86rem;color:#991B1B;margin-top:12px;}
  .ma-energy{display:inline-block;font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:5px;margin-right:8px;}
  .ma-energy-WHY{background:#DCFCE7;color:#065F46;}
  .ma-energy-WHAT{background:#DBEAFE;color:#1E40AF;}
  .ma-energy-HOW{background:#FEF3C7;color:#92400E;}
  .ma-emphasis{font-size:0.84rem;color:#065F46;margin:0;}
  .ma-body{font-size:0.9rem;line-height:1.55;margin:0;}
  .ma-list{margin:0;padding-left:18px;font-size:0.88rem;line-height:1.55;}
  .ma-list li{margin-bottom:5px;}
  .ma-lean-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px 18px;margin-bottom:12px;}
  .ma-lean-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px;}
  .ma-lean-part{font-weight:600;font-size:0.95rem;flex:1;min-width:200px;}
  .ma-lean-extra{font-size:0.86rem;margin:8px 0 0;padding-top:8px;border-top:1px solid #F1F5F9;}
  .ma-lean-extra b{color:#065F46;}
`;

function sizedFor(slug, current) {
  const options = durationsFor(slug);
  return options.includes(current) ? current : options.includes(60) ? 60 : options[0];
}

export default function MeetingArchitect({ templates, profile }) {
  const [typeSlug, setTypeSlug] = useState(templates[0].slug);
  const template = templates.find(t => t.slug === typeSlug);
  const [purpose, setPurpose] = useState(templates[0].defaultPurpose);
  const [objectives, setObjectives] = useState('');
  const [challenges, setChallenges] = useState('');
  const [duration, setDuration] = useState(sizedFor(templates[0].slug, 60));
  const [rosterText, setRosterText] = useState({});
  const [relName, setRelName] = useState('');
  const [relOrientation, setRelOrientation] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [pdfBuilding, setPdfBuilding] = useState(false);
  const outputRef = useRef(null);

  const purposeEdited = purpose.trim() !== template.defaultPurpose.trim();

  // Same roster auto-fill as Session Architect: the caller's own team, only
  // members with a completed profile. Never overwrites names the user
  // already typed before the fetch came back.
  useEffect(() => {
    fetch('/api/portal/team')
      .then(r => r.ok ? r.json() : { members: [] })
      .then(d => {
        const withProfiles = (d.members || [])
          .filter(m => m.assessment_type)
          .map(m => ({ name: m.name || m.email, type: m.assessment_type.toUpperCase() }));
        setRosterText(prev => Object.values(prev).some(v => v.trim()) ? prev : rosterTextFromParticipants(withProfiles));
      })
      .catch(() => {});
  }, []);

  function changeType(slug) {
    const next = templates.find(t => t.slug === slug);
    // Keep the user's own purpose text if they'd edited it; otherwise swap
    // in the new type's default.
    if (!purposeEdited) setPurpose(next.defaultPurpose);
    setDuration(d => sizedFor(slug, d));
    setTypeSlug(slug);
  }

  function buildRequest() {
    const body = { meetingType: typeSlug, purpose, objectives, challenges, totalMinutes: duration };
    if (template.inputMode === 'roster') {
      const parsed = parseRoster(rosterText);
      body.roster = {};
      ORIENTATIONS.forEach(o => { if (parsed[o.id].length) body.roster[o.label] = parsed[o.id]; });
    } else if (template.inputMode === 'relationship') {
      body.relationship = { name: relName.trim(), orientation: relOrientation };
    } else {
      body.audienceContext = audience;
    }
    return body;
  }

  async function handleGenerate() {
    setError('');
    if (!purpose.trim()) return setError('Add a purpose for this meeting.');
    if (!objectives.trim()) return setError('Add what you want this meeting to accomplish.');
    if (!challenges.trim()) return setError("Add what's going wrong right now.");
    if (template.inputMode === 'relationship' && (!relName.trim() || !relOrientation)) {
      return setError("Add your report's name and orientation.");
    }
    setLoading(true);
    try {
      const res = await fetch('/api/meeting-architect/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequest()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setReport(data.report);
      requestAnimationFrame(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!report) return;
    setPdfBuilding(true);
    try {
      const { jsPDF } = await import('jspdf');
      buildPdf(jsPDF, report).save(`curio-meeting-${report.meetingType.slug}.pdf`);
    } finally {
      setPdfBuilding(false);
    }
  }

  return (
    <div className="sa-root">
      <style dangerouslySetInnerHTML={{ __html: SA_CSS + MA_CSS }} />

      <div className="sa-hero">
        <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: '1.8rem' }}>Meeting Architect</p>
        <p>Redesign a recurring meeting around what you need it to do, what&apos;s going wrong today, and how the people in it are wired, with a timed agenda you can run next week.</p>
      </div>

      {!profile && (
        <div className="ma-note">
          We don&apos;t have a completed MindPrint&trade; assessment on file for you, so your plan won&apos;t include the lean-in / get-help map. Everything else works the same.
        </div>
      )}

      <h3 className="sa-section-title">1. The meeting</h3>
      <div className="sa-card">
        <div className="sa-grid2 ma-field">
          <div>
            <label className="sa-label" htmlFor="ma-type">Meeting type</label>
            <select id="ma-type" className="sa-select" value={typeSlug} onChange={e => changeType(e.target.value)}>
              {templates.map(t => <option key={t.slug} value={t.slug}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="sa-label" htmlFor="ma-duration">Total meeting time</label>
            <select id="ma-duration" className="sa-select" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))}>
              {durationsFor(typeSlug).map(d => <option key={d} value={d}>{d} minutes</option>)}
            </select>
          </div>
        </div>
        <div className="ma-field">
          <label className="sa-label" htmlFor="ma-purpose">
            Purpose
            <span className={`ma-chip ${purposeEdited ? 'ma-chip-edited' : 'ma-chip-default'}`}>{purposeEdited ? 'Edited' : 'Default'}</span>
          </label>
          <textarea id="ma-purpose" className="sa-input ma-textarea" value={purpose} onChange={e => setPurpose(e.target.value)} maxLength={1000} />
          {purposeEdited && (
            <p className="ma-hint"><button type="button" className="ma-link" onClick={() => setPurpose(template.defaultPurpose)}>Reset to the default purpose</button></p>
          )}
        </div>
      </div>

      <h3 className="sa-section-title">2. What needs to change</h3>
      <div className="sa-card">
        <div className="ma-field">
          <label className="sa-label" htmlFor="ma-objectives">Objectives</label>
          <textarea id="ma-objectives" className="sa-input ma-textarea" placeholder="What do you want this meeting to accomplish that it isn't today?" value={objectives} onChange={e => setObjectives(e.target.value)} maxLength={2000} />
        </div>
        <div className="ma-field">
          <label className="sa-label" htmlFor="ma-challenges">Current challenges</label>
          <textarea id="ma-challenges" className="sa-input ma-textarea" placeholder="What's going wrong right now?" value={challenges} onChange={e => setChallenges(e.target.value)} maxLength={2000} />
        </div>
      </div>

      <h3 className="sa-section-title">3. Who&apos;s involved</h3>
      {template.inputMode === 'roster' && (
        <>
          <p className="sa-section-sub">Enter attendees under their primary-secondary orientation. Your team is filled in automatically; edit freely.</p>
          <div className="sa-card">
            {ORIENTATIONS.map(o => (
              <RosterRow key={o.id} o={o} value={rosterText[o.id] || ''} onChange={(id, v) => setRosterText(r => ({ ...r, [id]: v }))} />
            ))}
          </div>
        </>
      )}
      {template.inputMode === 'relationship' && (
        <>
          <p className="sa-section-sub">This meeting is with one person. Tell us who.</p>
          <div className="sa-card">
            <div className="sa-grid2">
              <div>
                <label className="sa-label" htmlFor="ma-rel-name">Their name</label>
                <input id="ma-rel-name" type="text" className="sa-input" value={relName} onChange={e => setRelName(e.target.value)} maxLength={80} placeholder="e.g. Maria" />
              </div>
              <div>
                <label className="sa-label" htmlFor="ma-rel-orientation">Their orientation</label>
                <select id="ma-rel-orientation" className="sa-select" value={relOrientation} onChange={e => setRelOrientation(e.target.value)}>
                  <option value="">Choose one</option>
                  {ORIENTATIONS.map(o => <option key={o.id} value={o.label}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </>
      )}
      {template.inputMode === 'none' && (
        <>
          <p className="sa-section-sub">No attendee list for this one: you don&apos;t control who&apos;s in the room, so the plan is built around your objectives, your challenges, and you.</p>
          <div className="sa-card">
            <label className="sa-label" htmlFor="ma-audience">Anything you know about the audience (optional)</label>
            <textarea id="ma-audience" className="sa-input ma-textarea" placeholder="e.g. mostly engineers, mixed tenure, some very new" value={audience} onChange={e => setAudience(e.target.value)} maxLength={1000} />
          </div>
        </>
      )}

      <div className="sa-btn-row">
        <button className="sa-btn sa-btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Designing your meeting…' : 'Design the meeting'}
        </button>
      </div>
      {loading && <p className="ma-hint">This usually takes 20 to 40 seconds.</p>}
      {error && <div className="ma-error">{error}</div>}

      {report && <Output report={report} outputRef={outputRef} onPdf={handleDownloadPDF} pdfBuilding={pdfBuilding} />}
    </div>
  );
}

function Output({ report, outputRef, onPdf, pdfBuilding }) {
  return (
    <div ref={outputRef}>
      <h3 className="sa-section-title" style={{ marginTop: 40 }}>Your redesigned {report.meetingType.label}</h3>
      <p className="sa-section-sub">
        {report.totalMinutes} minutes &middot; {INPUT_MODE_LABELS[report.inputMode]}
        {report.profile ? <> &middot; built for a {report.profile} manager</> : null}
      </p>

      <h3 className="sa-section-title">Purpose</h3>
      <div className="sa-card">
        <span className={`ma-chip ${report.purposeEdited ? 'ma-chip-edited' : 'ma-chip-default'}`} style={{ marginLeft: 0, marginBottom: 8 }}>
          {report.purposeEdited ? 'Your edited purpose' : 'Default purpose'}
        </span>
        <p className="ma-body">{report.purpose}</p>
      </div>

      <h3 className="sa-section-title">Async / live split</h3>
      <div className="sa-grid2">
        <div className="sa-role-card"><p><span className="sa-lbl">Before the meeting (async)</span><br />{report.asyncLive.before}</p></div>
        <div className="sa-role-card"><p><span className="sa-lbl">In the room (live)</span><br />{report.asyncLive.live}</p></div>
      </div>

      <h3 className="sa-section-title">Live structure</h3>
      <p className="sa-section-sub">Put these blocks in the invite so everyone knows when their part is coming.</p>
      <div>
        {report.agenda.map((b, i) => (
          <div className="sa-agenda-block" key={i}>
            <div className="sa-ab-time">{b.start}&ndash;{b.end} min</div>
            <div className={`sa-ab-bar sa-bar-${b.energy}`} />
            <div className="sa-ab-content">
              <h4><span className={`ma-energy ma-energy-${b.energy}`}>{b.energy}</span>{b.title}</h4>
              {b.covers && <p className="sa-purpose">{b.covers}</p>}
              {b.emphasis && <p className="ma-emphasis">{b.emphasis}</p>}
            </div>
          </div>
        ))}
      </div>

      {report.roles && (
        <>
          <h3 className="sa-section-title">Role assignments</h3>
          {report.roles.length ? (
            <div className="sa-grid2">
              {report.roles.map((r, i) => (
                <div className="sa-role-card" key={i}>
                  <h4>{r.person}</h4>
                  <p className="sa-tag">{r.role}</p>
                  {r.why && <p>{r.why}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="sa-empty-note">Add names under Who&apos;s involved to get specific role assignments.</p>
          )}
        </>
      )}

      {report.leanIn && (
        <>
          <h3 className="sa-section-title">Where to lean in, where to get help</h3>
          <p className="sa-section-sub">Mapped against your {report.profile} profile: what&apos;s yours to run, and where your tertiary means it&apos;s worth bringing in support.</p>
          {report.leanIn.map((l, i) => (
            <div className="ma-lean-card" key={i}>
              <div className="ma-lean-head">
                <span className={`ma-energy ma-energy-${l.energy}`}>{l.energy}</span>
                <span className="ma-lean-part">{l.part}</span>
                <span className={`ma-chip ${l.fit === 'lean_in' ? 'ma-chip-lean' : 'ma-chip-help'}`}>{l.fit === 'lean_in' ? 'Yours to run' : 'Get help here'}</span>
              </div>
              <p className="ma-body">{l.note}</p>
              {l.tool && <p className="ma-lean-extra"><b>Tool:</b> {l.tool.name}. {l.tool.description}</p>}
              {l.person && (l.person.name || l.person.suggestion) && (
                <p className="ma-lean-extra"><b>Loop in:</b> {l.person.name ? `${l.person.name}. ` : ''}{l.person.suggestion}</p>
              )}
            </div>
          ))}
        </>
      )}

      <h3 className="sa-section-title">Signs this is working, or failing</h3>
      <div className="sa-grid2">
        <div className="sa-role-card">
          <p><span className="sa-lbl">Working when</span></p>
          <ul className="ma-list">{report.signs.working.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="sa-role-card">
          <p><span className="sa-lbl">Failing when</span></p>
          <ul className="ma-list">{report.signs.failing.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>

      <div className="sa-btn-row" style={{ marginTop: 24 }}>
        <button className="sa-btn sa-btn-primary" onClick={onPdf} disabled={pdfBuilding}>
          {pdfBuilding ? 'Building PDF…' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}

// Same jsPDF conventions as Session Architect's Download PDF: letter, pt
// units, 54pt margins, a closure-based page-break check.
function buildPdf(JsPDF, report) {
  const doc = new JsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxW = pageW - margin * 2;
  let y = margin;

  function pageBreakIfNeeded(h) {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  }
  function heading(text) {
    pageBreakIfNeeded(40);
    y += 10;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...PDF_DEEP_EMERALD);
    doc.text(text, margin, y);
    y += 18;
  }
  function para(text, { size = 10.5, color = PDF_INK, bold = false, italic = false, indent = 0, gap = 6 } = {}) {
    if (!text) return;
    doc.setFont('helvetica', bold ? 'bold' : italic ? 'italic' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW - indent);
    const lh = size * 1.35;
    lines.forEach(line => { pageBreakIfNeeded(lh); doc.text(line, margin + indent, y); y += lh; });
    y += gap;
  }
  function bullets(items) {
    items.forEach(item => para(`•  ${item}`, { indent: 8, gap: 2 }));
    y += 4;
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...PDF_INK);
  doc.text('Curio Meeting Architect', margin, y + 6);
  y += 28;
  para(`${report.meetingType.label}, ${report.totalMinutes} minutes${report.profile ? `, built for a ${report.profile} manager` : ''}`, { size: 12, color: PDF_SLATE, gap: 10 });

  heading(report.purposeEdited ? 'Purpose (your edited version)' : 'Purpose (default)');
  para(report.purpose);

  heading('Async / live split');
  para('Before the meeting (async)', { bold: true, color: PDF_EMERALD, size: 10, gap: 2 });
  para(report.asyncLive.before);
  para('In the room (live)', { bold: true, color: PDF_EMERALD, size: 10, gap: 2 });
  para(report.asyncLive.live);

  heading('Live structure');
  report.agenda.forEach(b => {
    pageBreakIfNeeded(60);
    const top = y;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...PDF_SLATE);
    doc.text(`${b.start}–${b.end} min`, margin, y + 2);
    const textX = 84;
    doc.setFontSize(11.5); doc.setTextColor(...PDF_INK);
    const titleLines = doc.splitTextToSize(`${b.title} (${b.energy})`, maxW - textX);
    doc.text(titleLines, margin + textX, y + 2);
    y += titleLines.length * 15 + 2;
    [[b.covers, PDF_INK, 'normal'], [b.emphasis, PDF_DEEP_EMERALD, 'italic']].forEach(([t, color, style]) => {
      if (!t) return;
      doc.setFont('helvetica', style); doc.setFontSize(10); doc.setTextColor(...color);
      doc.splitTextToSize(t, maxW - textX).forEach(line => { pageBreakIfNeeded(14); doc.text(line, margin + textX, y); y += 13.5; });
    });
    if (y > top) {
      doc.setFillColor(...(PDF_ENERGY_RGB[b.energy] || PDF_ENERGY_RGB.WHY));
      doc.rect(margin + textX - 12, top - 8, 3.5, Math.max(y - top, 16), 'F');
    }
    y += 12;
  });

  if (report.roles && report.roles.length) {
    heading('Role assignments');
    report.roles.forEach(r => {
      para(`${r.person}: ${r.role}`, { bold: true, gap: 2 });
      para(r.why, { color: PDF_SLATE, size: 10 });
    });
  }

  if (report.leanIn) {
    heading(`Where to lean in, where to get help (${report.profile})`);
    report.leanIn.forEach(l => {
      para(`${l.part} (${l.energy}): ${l.fit === 'lean_in' ? 'Yours to run' : 'Get help here'}`, { bold: true, gap: 2 });
      para(l.note, { gap: 2 });
      if (l.tool) para(`Tool: ${l.tool.name}. ${l.tool.description}`, { size: 10, color: PDF_DEEP_EMERALD, gap: 2 });
      if (l.person && (l.person.name || l.person.suggestion)) {
        para(`Loop in: ${l.person.name ? `${l.person.name}. ` : ''}${l.person.suggestion}`, { size: 10, color: PDF_DEEP_EMERALD, gap: 2 });
      }
      y += 8;
    });
  }

  heading('Signs this is working');
  bullets(report.signs.working);
  heading('Signs this is failing');
  bullets(report.signs.failing);

  return doc;
}
