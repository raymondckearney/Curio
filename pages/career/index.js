import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const PROFILES = [
  { id: 'WHY-WHAT', label: 'WHY – WHAT', tagline: 'Purpose-Driven, Progress-Oriented', primary: 'WHY' },
  { id: 'WHY-HOW',  label: 'WHY – HOW',  tagline: 'Purpose-Driven, Precision-Oriented', primary: 'WHY' },
  { id: 'WHAT-WHY', label: 'WHAT – WHY', tagline: 'Progress-Driven, Purpose-Oriented', primary: 'WHAT' },
  { id: 'WHAT-HOW', label: 'WHAT – HOW', tagline: 'Progress-Driven, Precision-Oriented', primary: 'WHAT' },
  { id: 'HOW-WHY',  label: 'HOW – WHY',  tagline: 'Precision-Driven, Purpose-Oriented', primary: 'HOW' },
  { id: 'HOW-WHAT', label: 'HOW – WHAT', tagline: 'Precision-Driven, Progress-Oriented', primary: 'HOW' },
];

const PRIMARY_COLOR = { WHY: '#059669', WHAT: '#2563EB', HOW: '#D97706' };
const PRIMARY_LIGHT = { WHY: '#D1FAE5', WHAT: '#DBEAFE', HOW: '#FEF3C7' };
const PRIMARY_MID   = { WHY: '#6EE7B7', WHAT: '#93C5FD', HOW: '#FCD34D' };

function profileColor(id) { return PRIMARY_COLOR[id?.split('-')[0]] || '#64748B'; }
function profileLight(id) { return PRIMARY_LIGHT[id?.split('-')[0]] || '#F8FAFC'; }

const LOADING_MSGS = [
  'Analyzing your profile…',
  'Selecting best-fit roles…',
  'Writing your career guidance…',
  'Building role deep-dives…',
  'Almost there…',
];

function AlignBar({ pct, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ height: '100%', width: width + '%', background: color, borderRadius: 99, transition: 'width 1s ease' }} />
    </div>
  );
}

function LabeledList({ items, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '14px 0', borderBottom: i < items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 5 }}>{item.label}</div>
          <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75 }}>{item.body}</div>
        </div>
      ))}
    </div>
  );
}

function RoleCard({ role, idx, color, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 4, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginBottom: 3 }}>Role {idx + 1}</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{role.title}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94A3B8', flexShrink: 0 }}>{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #F1F5F9' }}>
          {/* Why this role */}
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={sectionLabel(color)}>Why This Role Is a Strong Match</div>
            {role.fit.split('\n\n').map((p, i) => (
              <p key={i} style={{ fontSize: '0.93rem', color: '#374151', lineHeight: 1.8, marginBottom: 14, margin: i === role.fit.split('\n\n').length - 1 ? 0 : undefined }}>{p}</p>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #F8FAFC', background: '#FAFBFC', padding: '24px 28px' }}>
            <div style={sectionLabel('#059669')}>What You Will Find Energizing and Excel At</div>
            <LabeledList items={role.energizing} accent="#059669" />
          </div>

          <div style={{ borderTop: '1px solid #F8FAFC', padding: '24px 28px' }}>
            <div style={sectionLabel('#94A3B8')}>What Will Still Be Challenging</div>
            <LabeledList items={role.challenging} accent="#94A3B8" />
          </div>

          <div style={{ borderTop: '1px solid #F8FAFC', background: '#FAFBFC', padding: '24px 28px' }}>
            <div style={sectionLabel(color)}>Strategies to Bring Into This Role</div>
            <LabeledList items={role.strategies} accent={color} />
          </div>
        </div>
      )}
    </div>
  );
}

function sectionLabel(color) {
  return { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
}

function ReportOutput({ report, profile, inputs, onReset, color }) {
  const { alignmentLabel, alignmentPercent, alignmentSentence, energizers, watchFors, roles, environmentNote, nextSteps } = report;
  const profileDef = PROFILES.find(p => p.id === profile);

  function generatePDF() {
    const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const c = color;
    const roleHtml = roles.map((role, ri) => `
      <div class="role-block">
        <div class="role-num">Role ${ri + 1}</div>
        <div class="role-title">${esc(role.title)}</div>
        <div class="sec-label" style="color:${esc(c)}">Why This Role Is a Strong Match</div>
        ${role.fit.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}
        <div class="sec-label" style="color:#059669">What You Will Find Energizing and Excel At</div>
        ${role.energizing.map(item => `<div class="labeled-item"><div class="item-label" style="color:#059669">${esc(item.label)}</div><div class="item-body">${esc(item.body)}</div></div>`).join('')}
        <div class="sec-label" style="color:#94A3B8">What Will Still Be Challenging</div>
        ${role.challenging.map(item => `<div class="labeled-item"><div class="item-label" style="color:#94A3B8">${esc(item.label)}</div><div class="item-body">${esc(item.body)}</div></div>`).join('')}
        <div class="sec-label" style="color:${esc(c)}">Strategies to Bring Into This Role</div>
        ${role.strategies.map(item => `<div class="labeled-item"><div class="item-label" style="color:${esc(c)}">${esc(item.label)}</div><div class="item-body">${esc(item.body)}</div></div>`).join('')}
      </div>`).join('');

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Career Guidance — ${esc(profile)} — Curio</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;color:#1C1917;font-size:8.5pt;line-height:1.5;background:#fff}
.wrap{max-width:720px;margin:0 auto;padding:28px 32px}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid ${esc(c)};padding-bottom:12px;margin-bottom:20px}
.logo{font-family:'Caveat',cursive;font-size:22pt;font-weight:700;color:#0F172A}.logo em{color:${esc(c)};font-style:normal}
.hdr-right{text-align:right;font-size:7pt;color:#64748B}
.summary-box{background:#0F172A;border-radius:8px;padding:22px 24px;margin-bottom:20px;border-left:4px solid ${esc(c)}}
.profile-code{font-family:'Caveat',cursive;font-size:24pt;font-weight:700;color:${esc(c)};line-height:1}
.profile-tagline{font-size:8pt;color:rgba(255,255,255,0.65);margin-top:2px;margin-bottom:14px}
.inputs-row{font-size:7pt;color:rgba(255,255,255,0.5);margin-bottom:14px;display:flex;gap:16px;flex-wrap:wrap}
.align-label{display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:4px;padding:3px 10px;font-size:6.5pt;font-weight:700;letter-spacing:0.12em;color:${esc(c)};margin-bottom:6px}
.align-pct{font-family:'Caveat',cursive;font-size:26pt;font-weight:700;color:${esc(c)};line-height:1}
.align-sent{font-size:8pt;color:rgba(255,255,255,0.75);line-height:1.6;margin-top:6px;margin-bottom:14px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mini-label{font-size:6pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:5px}
.mini-item{font-size:7.5pt;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:3px;display:flex;gap:6px}
.role-block{border:1px solid #E2E8F0;border-radius:6px;padding:16px 18px;margin-bottom:12px;page-break-inside:avoid}
.role-num{font-size:6pt;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${esc(c)};margin-bottom:2px}
.role-title{font-family:'Caveat',cursive;font-size:15pt;font-weight:700;color:#0F172A;margin-bottom:10px}
.sec-label{font-size:6pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:10px 0 6px}
p{font-size:7.5pt;color:#374151;line-height:1.6;margin-bottom:6px}
.labeled-item{padding:5px 0;border-bottom:1px solid #F1F5F9}
.item-label{font-size:6pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2px}
.item-body{font-size:7.5pt;color:#374151;line-height:1.5}
.env-section{margin-bottom:12px}
.next-step{font-size:7.5pt;color:#374151;line-height:1.6;margin-bottom:5px;display:flex;gap:6px}
.arrow{color:${esc(c)};font-weight:700}
.footer{margin-top:14px;padding-top:10px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:6.5pt;color:#94A3B8}
.print-btn{display:block;width:100%;padding:14px;margin-bottom:16px;background:${esc(c)};color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:9pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer}
@media print{@page{margin:12mm 10mm;size:A4 portrait}body{font-size:8pt}.wrap{padding:0;max-width:100%}.print-btn{display:none!important}}
</style></head><body><div class="wrap">
<button class="print-btn" onclick="this.style.display='none';window.print()">Save as PDF</button>
<div class="hdr"><div class="logo">Curio<em>.</em></div><div class="hdr-right"><strong>Career Guidance Report</strong><br>${esc(today)}</div></div>
<div class="summary-box">
  <div class="profile-code">${esc(profile)}</div>
  <div class="profile-tagline">${esc(profileDef?.tagline || '')}</div>
  <div class="inputs-row">
    <span>${esc(inputs.careerLevel)}</span>
    <span>${esc(inputs.roleOrientation)}</span>
    ${inputs.industry ? `<span>${esc(inputs.industry)}</span>` : ''}
    ${inputs.riskEnvironment ? `<span>${esc(inputs.riskEnvironment)}</span>` : ''}
  </div>
  <div class="align-label">${esc(alignmentLabel)}</div>
  <div class="align-pct">${esc(alignmentPercent)}%</div>
  <div class="align-sent">${esc(alignmentSentence)}</div>
  <div class="two-col">
    <div>
      <div class="mini-label" style="color:${esc(c)}">⚡ Energizers</div>
      ${energizers.map(e => `<div class="mini-item"><span style="color:${esc(c)}">⚡</span>${esc(e)}</div>`).join('')}
    </div>
    <div>
      <div class="mini-label" style="color:rgba(255,255,255,0.5)">◆ Watch for</div>
      ${watchFors.map(w => `<div class="mini-item"><span style="color:rgba(255,255,255,0.4)">◆</span>${esc(w)}</div>`).join('')}
    </div>
  </div>
</div>
${roleHtml}
<div class="env-section">
  <div class="sec-label" style="color:${esc(c)};font-size:7pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px">A Note on Environment</div>
  ${environmentNote.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}
</div>
<div>
  <div class="sec-label" style="color:${esc(c)};font-size:7pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px">What To Do Next</div>
  ${nextSteps.map(s => `<div class="next-step"><span class="arrow">→</span>${esc(s)}</div>`).join('')}
</div>
<div class="footer"><div>Curio · MindPrint Career Guidance</div><div>choosecurio.com · ${esc(today)}</div></div>
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(24px,5vw,72px) 100px' }}>
      {/* Rule */}
      <div style={{ height: 1, background: '#E2E8F0', margin: '56px 0 48px' }} />

      {/* Block 1: Summary */}
      <div style={{ background: '#0F172A', borderRadius: 14, padding: '36px 40px', marginBottom: 40, borderLeft: `5px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `${color}08`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.8rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{profile}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>{profileDef?.tagline}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[inputs.careerLevel, inputs.roleOrientation, inputs.industry, inputs.riskEnvironment].filter(Boolean).map((v, i) => (
                <span key={i} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 10px' }}>{v}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color, marginBottom: 4 }}>{alignmentLabel}</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '3.5rem', fontWeight: 700, color, lineHeight: 1 }}>{alignmentPercent}%</div>
          </div>
        </div>
        <AlignBar pct={alignmentPercent} color={color} />
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginTop: 16, marginBottom: 28 }}>{alignmentSentence}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginBottom: 12 }}>⚡ What Will Energize You</div>
            {energizers.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color, fontSize: '0.75rem', marginTop: 2, flexShrink: 0 }}>⚡</span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{e}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>◆ Watch For</div>
            {watchFors.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 2, flexShrink: 0 }}>◆</span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
          {roles.length} roles identified for your profile and inputs
        </div>
      </div>

      {/* Block 2: Role Deep-Dives */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: color }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color }}>Role Deep-Dives</div>
        </div>
        {roles.map((role, i) => (
          <RoleCard key={i} role={role} idx={i} color={color} defaultOpen={i === 0} />
        ))}
      </div>

      {/* Block 3: Closing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '28px 28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'block', width: 16, height: 1, background: color }} />
            A Note on Environment
          </div>
          {environmentNote.split('\n\n').map((p, i) => (
            <p key={i} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, marginBottom: i < environmentNote.split('\n\n').length - 1 ? 14 : 0 }}>{p}</p>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '28px 28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'block', width: 16, height: 1, background: color }} />
            What To Do Next
          </div>
          {nextSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < nextSteps.length - 1 ? 16 : 0 }}>
              <span style={{ color, fontWeight: 700, fontSize: '1rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={generatePDF}
          style={{ flex: 1, padding: '16px 24px', background: color, border: 'none', borderRadius: 8, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF Report
        </button>
        <button
          onClick={onReset}
          style={{ padding: '16px 24px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}
        >
          ← Start over
        </button>
      </div>
    </div>
  );
}

export default function CareerPage() {
  const [profile, setProfile] = useState('');
  const [careerLevel, setCareerLevel] = useState('Early Career (0–4 years)');
  const [roleOrientation, setRoleOrientation] = useState('Open to Both');
  const [industry, setIndustry] = useState('');
  const [riskEnvironment, setRiskEnvironment] = useState('');
  const [values, setValues] = useState('');
  const [compensationPriority, setCompensationPriority] = useState('Balanced');
  const [otherAssessments, setOtherAssessments] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const outputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (report && outputRef.current) outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [report]);

  useEffect(() => {
    if (!loading) { clearInterval(timerRef.current); return; }
    let i = 0;
    timerRef.current = setInterval(() => { i = (i + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[i]); }, 12000);
    return () => clearInterval(timerRef.current);
  }, [loading]);

  async function generate() {
    if (!profile) return;
    setLoading(true); setError(''); setReport(null); setLoadingMsg(LOADING_MSGS[0]);
    try {
      const res = await fetch('/api/career-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, careerLevel, roleOrientation, industry: industry || undefined, riskEnvironment: riskEnvironment || undefined, values: values || undefined, compensationPriority, otherAssessments: otherAssessments || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setReport(data);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const color = profileColor(profile);

  const sel = {
    width: '100%', padding: '13px 16px', background: '#FAFAF9', border: '1px solid #E7E5E4', borderRadius: 6,
    color: '#1C1917', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', outline: 'none', cursor: 'pointer', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
  };

  const inp = {
    width: '100%', padding: '13px 16px', background: '#FAFAF9', border: '1px solid #E7E5E4', borderRadius: 6,
    color: '#1C1917', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', outline: 'none',
  };

  return (
    <>
      <Head>
        <title>Career Guidance — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E7E5E4', padding: '0 clamp(24px,5vw,72px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#1C1917', textDecoration: 'none' }}>
          Curio<span style={{ color: '#059669' }}>.</span>
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78716C', textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to site
        </Link>
      </nav>

      <div ref={outputRef} style={{ maxWidth: 820, margin: '0 auto', padding: '64px clamp(24px,5vw,72px) 0' }}>
        {/* Page header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: '#059669', marginBottom: 20 }}>
          <span style={{ display: 'block', width: 36, height: 1, background: '#059669' }} />
          Career Guidance
        </div>
        <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 700, color: '#1C1917', lineHeight: 1.12, marginBottom: 16 }}>
          Where does your way of<br />thinking take your career?
        </h1>
        <p style={{ fontSize: '1rem', color: '#78716C', maxWidth: 560, lineHeight: 1.75, marginBottom: 52 }}>
          Select your MindPrint profile and tell us where you are in your career. We'll generate a personalized report with best-fit roles, what will energize and challenge you, and strategies specific to how you think.
        </p>
        <div style={{ height: 1, background: '#E7E5E4', marginBottom: 48 }} />

        {/* Form */}
        {!loading && !report && (
          <>
            {/* Step 1: Profile */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'block', width: 20, height: 1, background: '#059669' }} />Step One
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', marginBottom: 24 }}>Select your MindPrint profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {PROFILES.map(p => {
                  const c = PRIMARY_COLOR[p.primary];
                  const isSelected = profile === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setProfile(p.id)}
                      style={{ background: isSelected ? `${c}0f` : '#FAFAF9', border: `1px solid ${isSelected ? c : '#E7E5E4'}`, borderRadius: 8, padding: '16px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: isSelected ? c : '#94A3B8', marginBottom: 5 }}>{p.label}</div>
                      <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: isSelected ? '#374151' : '#A8A29E', lineHeight: 1.35 }}>{p.tagline}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Career level + orientation */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'block', width: 20, height: 1, background: '#059669' }} />Step Two
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', marginBottom: 24 }}>Where are you in your career?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Career Level</label>
                  <select value={careerLevel} onChange={e => setCareerLevel(e.target.value)} style={sel}>
                    <option>Student / Pre-Career</option>
                    <option>Early Career (0–4 years)</option>
                    <option>Mid Career (5–12 years)</option>
                    <option>Senior / Executive (12+ years)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Role Orientation</label>
                  <select value={roleOrientation} onChange={e => setRoleOrientation(e.target.value)} style={sel}>
                    <option>Open to Both</option>
                    <option>Individual Contributor</option>
                    <option>Management</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Optional inputs */}
            <div style={{ marginBottom: 48 }}>
              <button
                onClick={() => setShowOptional(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'block', width: 20, height: 1, background: '#CBD5E1' }} />Optional Details (add for a more specific report)
                </div>
                <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{showOptional ? '▲' : '▼'}</span>
              </button>

              {showOptional && (
                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Industry</label>
                    <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. technology, healthcare, finance" style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Work Environment</label>
                    <select value={riskEnvironment} onChange={e => setRiskEnvironment(e.target.value)} style={sel}>
                      <option value="">Not specified</option>
                      <option>High-growth / Startup</option>
                      <option>Established company</option>
                      <option>Large institution / Government</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Compensation Priority</label>
                    <select value={compensationPriority} onChange={e => setCompensationPriority(e.target.value)} style={sel}>
                      <option>Balanced</option>
                      <option>Primary consideration</option>
                      <option>Secondary to mission / fit</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Values &amp; Work Orientation</label>
                    <input value={values} onChange={e => setValues(e.target.value)} placeholder="e.g. mission-driven, autonomy, impact" style={inp} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Other Assessments <span style={{ fontWeight: 400, color: '#94A3B8' }}>(DiSC, StrengthsFinder, MBTI)</span></label>
                    <textarea value={otherAssessments} onChange={e => setOtherAssessments(e.target.value)} placeholder="e.g. DiSC: D, StrengthsFinder: Strategic, Futuristic, Learner…" rows={3} style={{ ...inp, resize: 'vertical' }} />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={generate}
              disabled={!profile}
              style={{ width: '100%', padding: '18px 32px', background: profile ? color : '#E7E5E4', border: 'none', borderRadius: 8, color: profile ? '#fff' : '#A8A29E', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: profile ? 'pointer' : 'not-allowed', transition: 'background 0.18s', marginBottom: 100 }}
            >
              Generate Career Guidance Report
            </button>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 24px 120px' }}>
            <div style={{ display: 'inline-block', width: 44, height: 44, border: `3px solid ${profileColor(profile)}20`, borderTop: `3px solid ${profileColor(profile)}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite', marginBottom: 24 }} />
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{loadingMsg}</div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>This takes about 30 seconds</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '16px 20px', color: '#be123c', fontSize: '0.9rem', marginBottom: 32 }}>
            {error}
          </div>
        )}
      </div>

      {report && (
        <ReportOutput
          report={report}
          profile={profile}
          inputs={{ careerLevel, roleOrientation, industry, riskEnvironment }}
          onReset={() => { setReport(null); setProfile(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          color={color}
        />
      )}
    </>
  );
}
