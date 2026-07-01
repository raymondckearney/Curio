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

const DISC_OPTIONS = ['', 'D', 'Di', 'DC', 'i', 'iD', 'iS', 'S', 'Si', 'SC', 'C', 'CD', 'CS'];

const STRENGTHSFINDER_34 = [
  'Achiever','Activator','Adaptability','Analytical','Arranger','Belief','Command',
  'Communication','Competition','Connectedness','Consistency','Context','Deliberative',
  'Developer','Discipline','Empathy','Focus','Futuristic','Harmony','Ideation',
  'Includer','Individualization','Input','Intellection','Learner','Maximizer',
  'Positivity','Relator','Responsibility','Restorative','Self-Assurance','Significance',
  'Strategic','Woo',
];

function profileColor(id) { return PRIMARY_COLOR[id?.split('-')[0]] || '#64748B'; }

// Phases mapped to character thresholds of the streaming JSON response
const PHASES = [
  { threshold: 0,     label: 'Analyzing your profile…' },
  { threshold: 800,   label: 'Identifying best-fit roles…' },
  { threshold: 2500,  label: 'Writing your role matches…' },
  { threshold: 5000,  label: 'Building energizers & strategies…' },
  { threshold: 8000,  label: 'Adding final details…' },
  { threshold: 11000, label: 'Almost ready…' },
];
const EXPECTED_CHARS = 14000; // typical output size for progress estimation

function getPhase(chars) {
  let phase = PHASES[0];
  for (const p of PHASES) { if (chars >= p.threshold) phase = p; else break; }
  return phase.label;
}

function StrengthsPicker({ selected, onChange }) {
  function toggle(s) {
    if (selected.includes(s)) onChange(selected.filter(x => x !== s));
    else if (selected.length < 5) onChange([...selected, s]);
  }
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 10 }}>
        Select up to 5 <span style={{ color: selected.length === 5 ? '#D97706' : '#94A3B8' }}>({selected.length}/5 selected)</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {STRENGTHSFINDER_34.map(s => {
          const active = selected.includes(s);
          const disabled = !active && selected.length >= 5;
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              disabled={disabled}
              style={{
                padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? '#2563EB' : '#E2E8F0'}`,
                background: active ? '#EFF6FF' : disabled ? '#F8FAFC' : '#fff',
                color: active ? '#2563EB' : disabled ? '#CBD5E1' : '#374151',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.12s',
              }}
            >{s}</button>
          );
        })}
      </div>
    </div>
  );
}

function RoleCard({ role, idx, color, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 2 }}>Role {idx + 1}</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{role.title}</div>
          </div>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: open ? `${color}15` : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '0.55rem', color: open ? color : '#94A3B8' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #F1F5F9' }}>
          <div style={{ padding: '16px 20px 12px' }}>
            {role.fit.split('\n\n').map((p, i) => (
              <p key={i} style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.75, marginBottom: i < role.fit.split('\n\n').length - 1 ? 10 : 0 }}>{p}</p>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 12px' }}>
            <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#059669', marginBottom: 10 }}>⚡ Energizing</div>
              {role.energizing.map((item, i) => (
                <div key={i} style={{ marginBottom: i < role.energizing.length - 1 ? 9 : 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.5 }}>{item.body}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 10 }}>◆ Challenging</div>
              {role.challenging.map((item, i) => (
                <div key={i} style={{ marginBottom: i < role.challenging.length - 1 ? 9 : 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.5 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px 20px 16px' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 10 }}>Strategies</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
              {role.strategies.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color, fontWeight: 700, fontSize: '0.7rem', flexShrink: 0, marginTop: 2 }}>→</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#374151', marginBottom: 1 }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.45 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SIDEBAR_BG = '#064E3B'; // deep emerald

function SummarySidebar({ profile, profileDef, inputs, energizers, watchFors, color }) {
  const extraTags = [
    inputs.values && { label: 'Values', value: inputs.values },
    inputs.compensationPriority && inputs.compensationPriority !== 'Balanced' && { label: 'Compensation', value: inputs.compensationPriority },
    inputs.discProfile && { label: 'DiSC', value: inputs.discProfile },
  ].filter(Boolean);

  return (
    <div style={{ background: SIDEBAR_BG, borderRadius: 12, padding: '20px 18px', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 2 }}>{profile}</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>{profileDef?.tagline}</div>

      {/* Primary input tags */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: extraTags.length || inputs.sfStrengths?.length ? 10 : 18 }}>
        {[inputs.careerLevel, inputs.roleOrientation, inputs.industry, inputs.riskEnvironment].filter(Boolean).map((v, i) => (
          <span key={i} style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, padding: '2px 7px' }}>{v}</span>
        ))}
      </div>

      {/* Extra inputs: values, compensation, DiSC */}
      {extraTags.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {extraTags.map((t, i) => (
            <div key={i} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 3, display: 'flex', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, marginTop: 1 }}>{t.label}</span>
              <span>{t.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* StrengthsFinder selections */}
      {inputs.sfStrengths?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>StrengthsFinder</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {inputs.sfStrengths.map((s, i) => (
              <span key={i} style={{ fontSize: '0.6rem', fontWeight: 600, color: color, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 3, padding: '2px 7px' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14, paddingTop: (extraTags.length || inputs.sfStrengths?.length) ? 14 : 0, borderTop: (extraTags.length || inputs.sfStrengths?.length) ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
        <div style={{ fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 7 }}>⚡ Energizers</div>
        {energizers.map((e, i) => (
          <div key={i} style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45, marginBottom: 4, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <span style={{ color, flexShrink: 0 }}>·</span>{e}
          </div>
        ))}
      </div>

      <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 7 }}>◆ Watch For</div>
        {watchFors.map((w, i) => (
          <div key={i} style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, marginBottom: 4, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>·</span>{w}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportOutput({ report, profile, inputs, onReset, color }) {
  const { energizers, watchFors, roles, environmentNote, nextSteps } = report;
  const profileDef = PROFILES.find(p => p.id === profile);

  function generatePDF() {
    const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const c = color;
    const roleHtml = roles.map((role, ri) => `
      <div class="role-block">
        <div class="role-num">Role ${ri + 1}</div>
        <div class="role-title">${esc(role.title)}</div>
        <div class="sec-label" style="color:${esc(c)}">Why This Role Fits</div>
        ${role.fit.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}
        <div class="two-col">
          <div class="col-box green">
            <div class="col-hdr" style="color:#059669">⚡ Energizing</div>
            ${role.energizing.map(item => `<div class="mini-item"><span class="mini-label" style="color:#059669">${esc(item.label)}</span> ${esc(item.body)}</div>`).join('')}
          </div>
          <div class="col-box gray">
            <div class="col-hdr" style="color:#64748B">◆ Challenging</div>
            ${role.challenging.map(item => `<div class="mini-item"><span class="mini-label" style="color:#64748B">${esc(item.label)}</span> ${esc(item.body)}</div>`).join('')}
          </div>
        </div>
        <div class="sec-label" style="color:${esc(c)}">Strategies</div>
        <div class="strat-grid">
          ${role.strategies.map(item => `<div class="strat-item"><span class="arrow" style="color:${esc(c)}">→</span><div><span class="mini-label">${esc(item.label)}</span> ${esc(item.body)}</div></div>`).join('')}
        </div>
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
.summary-box{background:#0F172A;border-radius:8px;padding:20px 22px;margin-bottom:20px;border-left:4px solid ${esc(c)};display:grid;grid-template-columns:1fr 1fr;gap:16px}
.profile-code{font-family:'Caveat',cursive;font-size:22pt;font-weight:700;color:${esc(c)};line-height:1}
.profile-tagline{font-size:7.5pt;color:rgba(255,255,255,0.45);margin-top:2px;margin-bottom:10px}
.inputs-row{font-size:6.5pt;color:rgba(255,255,255,0.4);display:flex;gap:8px;flex-wrap:wrap}
.tag{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:3px;padding:2px 7px}
.sum-label{font-size:5.5pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px}
.sum-item{font-size:7.5pt;line-height:1.5;margin-bottom:4px;display:flex;gap:6px}
.role-block{border:1px solid #E2E8F0;border-radius:6px;padding:14px 16px;margin-bottom:10px;page-break-inside:avoid}
.role-num{font-size:5.5pt;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${esc(c)};margin-bottom:2px}
.role-title{font-family:'Caveat',cursive;font-size:14pt;font-weight:700;color:#0F172A;margin-bottom:8px}
.sec-label{font-size:5.5pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:9px 0 5px}
p{font-size:7.5pt;color:#374151;line-height:1.6;margin-bottom:5px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
.col-box{border-radius:4px;padding:8px 10px}
.col-box.green{background:#F0FDF4}.col-box.gray{background:#F8FAFC}
.col-hdr{font-size:5.5pt;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin-bottom:6px}
.mini-item{font-size:7pt;color:#374151;line-height:1.5;margin-bottom:4px}
.mini-label{font-weight:700}
.strat-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px}
.strat-item{font-size:7pt;color:#374151;line-height:1.5;display:flex;gap:5px}
.arrow{font-weight:700;flex-shrink:0}
.env-section{margin-bottom:10px}
.next-step{font-size:7.5pt;color:#374151;line-height:1.6;margin-bottom:4px;display:flex;gap:6px}
.footer{margin-top:12px;padding-top:8px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:6.5pt;color:#94A3B8}
.print-btn{display:block;width:100%;padding:12px;margin-bottom:14px;background:${esc(c)};color:#fff;border:none;border-radius:5px;font-family:'DM Sans',sans-serif;font-size:9pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer}
@media print{@page{margin:12mm 10mm;size:A4 portrait}body{font-size:8pt}.wrap{padding:0;max-width:100%}.print-btn{display:none!important}}
</style></head><body><div class="wrap">
<button class="print-btn" onclick="this.style.display='none';window.print()">Save as PDF</button>
<div class="hdr"><div class="logo">Curio<em>.</em></div><div class="hdr-right"><strong>Career Guidance Report</strong><br>${esc(today)}</div></div>
<div class="summary-box">
  <div>
    <div class="profile-code">${esc(profile)}</div>
    <div class="profile-tagline">${esc(profileDef?.tagline || '')}</div>
    <div class="inputs-row">
      ${[inputs.careerLevel, inputs.roleOrientation, inputs.industry, inputs.riskEnvironment].filter(Boolean).map(v => `<span class="tag">${esc(v)}</span>`).join('')}
    </div>
  </div>
  <div>
    <div class="sum-label" style="color:${esc(c)}">⚡ Energizers</div>
    ${energizers.map(e => `<div class="sum-item"><span style="color:${esc(c)}">·</span><span style="color:rgba(255,255,255,0.7)">${esc(e)}</span></div>`).join('')}
    <div class="sum-label" style="color:rgba(255,255,255,0.35);margin-top:10px">◆ Watch For</div>
    ${watchFors.map(w => `<div class="sum-item"><span style="color:rgba(255,255,255,0.25)">·</span><span style="color:rgba(255,255,255,0.5)">${esc(w)}</span></div>`).join('')}
  </div>
</div>
${roleHtml}
<div class="env-section">
  <div class="sec-label" style="color:${esc(c)};font-size:6pt;margin-bottom:6px">A Note on Environment</div>
  ${environmentNote.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}
</div>
<div>
  <div class="sec-label" style="color:${esc(c)};font-size:6pt;margin-bottom:6px">What To Do Next</div>
  ${nextSteps.map(s => `<div class="next-step"><span style="color:${esc(c)};font-weight:700">→</span>${esc(s)}</div>`).join('')}
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
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(16px,3vw,40px) 80px' }}>
      <div style={{ height: 1, background: '#E2E8F0', margin: '48px 0 40px' }} />

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* Sticky left sidebar */}
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 80 }}>
          <SummarySidebar
            profile={profile}
            profileDef={profileDef}
            inputs={inputs}
            energizers={energizers}
            watchFors={watchFors}
            color={color}
          />
          {/* Download button under sidebar */}
          <button
            onClick={generatePDF}
            style={{ width: '100%', marginTop: 10, padding: '11px 16px', background: 'transparent', border: `1px solid ${color}40`, borderRadius: 8, color, fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1, background: color }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color }}>Role Matches</div>
          </div>

          <div style={{ marginBottom: 28 }}>
            {roles.map((role, i) => (
              <RoleCard key={i} role={role} idx={i} color={color} defaultOpen={i === 0} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'block', width: 14, height: 1, background: color }} />
                A Note on Environment
              </div>
              {environmentNote.split('\n\n').map((p, i) => (
                <p key={i} style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.75, marginBottom: i < environmentNote.split('\n\n').length - 1 ? 10 : 0 }}>{p}</p>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'block', width: 14, height: 1, background: color }} />
                What To Do Next
              </div>
              {nextSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < nextSteps.length - 1 ? 12 : 0 }}>
                  <span style={{ color, fontWeight: 700, fontSize: '0.9rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={generatePDF}
              style={{ flex: 1, padding: '14px 20px', background: color, border: 'none', borderRadius: 8, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
            <button
              onClick={onReset}
              style={{ padding: '14px 20px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', cursor: 'pointer' }}
            >
              ← Start over
            </button>
          </div>
        </div>
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
  const [discProfile, setDiscProfile] = useState('');
  const [sfStrengths, setSfStrengths] = useState([]);
  const [otherAssessments, setOtherAssessments] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState(PHASES[0].label);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const outputRef = useRef(null);

  useEffect(() => {
    if (report && outputRef.current) outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [report]);

  function buildOtherAssessments() {
    const parts = [];
    if (discProfile) parts.push(`DiSC: ${discProfile}`);
    if (sfStrengths.length > 0) parts.push(`StrengthsFinder: ${sfStrengths.join(', ')}`);
    if (otherAssessments.trim()) parts.push(otherAssessments.trim());
    return parts.join(' | ') || undefined;
  }

  async function generate() {
    if (!profile) return;
    setLoading(true); setError(''); setReport(null); setProgress(0); setPhaseLabel(PHASES[0].label);
    try {
      const res = await fetch('/api/career-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile, careerLevel, roleOrientation,
          industry: industry || undefined,
          riskEnvironment: riskEnvironment || undefined,
          values: values || undefined,
          compensationPriority,
          otherAssessments: buildOtherAssessments(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let evt;
          try { evt = JSON.parse(line.slice(6)); } catch { continue; }

          if (evt.type === 'progress') {
            const pct = Math.min((evt.chars / EXPECTED_CHARS) * 100, 95);
            setProgress(pct);
            setPhaseLabel(getPhase(evt.chars));
          } else if (evt.type === 'done') {
            setProgress(100);
            setReport(evt.report);
          } else if (evt.type === 'error') {
            throw new Error(evt.error);
          }
        }
      }
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

  const lbl = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 };

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
          AI Powered Career Guidance Tool
        </div>
        <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 700, color: '#1C1917', lineHeight: 1.12, marginBottom: 16 }}>
          Find a role that energizes YOU!
        </h1>
        <p style={{ fontSize: '1rem', color: '#78716C', maxWidth: 560, lineHeight: 1.75, marginBottom: 52 }}>
          The more detail you provide below, the more customized the output. We'll generate a personalized report with best-fit roles, what will energize and challenge you, and strategies specific to how you think. You can even add your results from any other assessments you've taken to provide a more comprehensive output.
        </p>
        <div style={{ height: 1, background: '#E7E5E4', marginBottom: 48 }} />

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

            {/* Step 2: Career details */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'block', width: 20, height: 1, background: '#059669' }} />Step Two
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', marginBottom: 24 }}>Tell us about yourself and your career preferences</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={lbl}>Career Level</label>
                  <select value={careerLevel} onChange={e => setCareerLevel(e.target.value)} style={sel}>
                    <option>Student / Pre-Career</option>
                    <option>Early Career (0–4 years)</option>
                    <option>Mid Career (5–12 years)</option>
                    <option>Senior / Executive (12+ years)</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Career Track</label>
                  <select value={roleOrientation} onChange={e => setRoleOrientation(e.target.value)} style={sel}>
                    <option>Open to Both</option>
                    <option>Individual Contributor</option>
                    <option>Management</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Industry</label>
                  <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. technology, healthcare, finance" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Organization Type</label>
                  <select value={riskEnvironment} onChange={e => setRiskEnvironment(e.target.value)} style={sel}>
                    <option value="">Not specified</option>
                    <option>High-growth / Startup</option>
                    <option>Established company</option>
                    <option>Large institution / Government</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Compensation Priority</label>
                  <select value={compensationPriority} onChange={e => setCompensationPriority(e.target.value)} style={sel}>
                    <option>Balanced</option>
                    <option>Primary consideration</option>
                    <option>Secondary to mission / fit</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>What Matters Most to You</label>
                  <input value={values} onChange={e => setValues(e.target.value)} placeholder="e.g. autonomy, work-life balance, social impact, creativity, job security" style={inp} />
                </div>
                <div>
                  <label style={lbl}>DiSC Profile</label>
                  <select value={discProfile} onChange={e => setDiscProfile(e.target.value)} style={sel}>
                    {DISC_OPTIONS.map(o => <option key={o} value={o}>{o || 'Not taken / Unknown'}</option>)}
                  </select>
                </div>
              </div>

              {/* StrengthsFinder */}
              <div style={{ marginTop: 16 }}>
                <label style={lbl}>StrengthsFinder Top 5</label>
                <StrengthsPicker selected={sfStrengths} onChange={setSfStrengths} />
              </div>

              {/* Other assessments */}
              <div style={{ marginTop: 16 }}>
                <label style={lbl}>Other Assessments or Context <span style={{ fontWeight: 400, color: '#94A3B8' }}>(MBTI, Enneagram, etc.)</span></label>
                <textarea value={otherAssessments} onChange={e => setOtherAssessments(e.target.value)} placeholder="e.g. MBTI: INTJ, Enneagram: 5w4…" rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>
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

        {loading && (
          <div style={{ padding: '72px 0 120px' }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.7rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{phaseLabel}</div>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: 28 }}>Generating your personalized report…</div>

            {/* Progress track */}
            <div style={{ position: 'relative', height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                width: progress + '%',
                transition: 'width 0.4s ease',
              }} />
            </div>

            {/* Percentage + animated dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%', background: color,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(progress)}%
              </div>
            </div>

            <style>{`
              @keyframes pulse {
                0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1); }
              }
            `}</style>
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
          inputs={{ careerLevel, roleOrientation, industry, riskEnvironment, values, compensationPriority, discProfile, sfStrengths, otherAssessments }}
          onReset={() => { setReport(null); setProfile(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          color={color}
        />
      )}
    </>
  );
}
