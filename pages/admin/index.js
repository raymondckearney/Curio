import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DIRECT_LICENSE_TYPES, TOKEN_GRANT_TYPES } from '../../lib/licenseTypes';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROFILES = ['WHY-WHAT','WHY-HOW','WHAT-WHY','WHAT-HOW','HOW-WHY','HOW-WHAT'];
const CAREER_LEVELS = ['Student','Early Career','Mid Career','Senior or Executive'];
const PRIMARY_COLOR = { WHY: '#059669', WHAT: '#2563EB', HOW: '#D97706' };
// Manual "+ Add License" dropdowns (Invite/Edit — demo accounts where a
// specific profile is deliberately chosen) only offer concrete types, never
// the companion_match/library_match sentinels (those only resolve when a
// token's assessment completes — an account_licenses row has no such step).
const LICENSE_TYPES = DIRECT_LICENSE_TYPES;
const TOOL_LABELS = {
  assessment_tokens: 'MindPrint™ Assessment', role_analyzer: 'Role Analyzer', career_guidance: 'Career Guidance', jd_analyzer: 'Job Description Analyzer',
  precision_companion: 'Precision Companion', purpose_companion: 'Purpose Companion', progress_companion: 'Progress Companion',
  companion_match: 'Companion — matches their profile',
  orientation_translator: 'Orientation Translator',
  library_full: 'Client Library (Full)', library_a: 'Client Library — Collection A', library_b: 'Client Library — Collection B',
  library_c: 'Client Library — Collection C', library_d: 'Client Library — Collection D', library_e: 'Client Library — Collection E',
  library_match: 'Client Library — matches their profile',
};
// Generate Tokens panel's checkbox list (ToolAccessField) — the one place
// companion_match/library_match are valid, since a token's granted_tools
// get resolved once the participant's assessment completes.
const ALL_TOOLS = TOKEN_GRANT_TYPES;

function profileColor(id) { return PRIMARY_COLOR[id?.split('-')[0]] || '#64748B'; }

const FIT_TYPES = [
  { id: "WHY-WHAT", label: "WHY – WHAT", tagline: "Purpose-driven, progress-oriented",   primary: "WHY",  secondary: "WHAT" },
  { id: "WHY-HOW",  label: "WHY – HOW",  tagline: "Purpose-driven, precision-oriented",  primary: "WHY",  secondary: "HOW"  },
  { id: "WHAT-WHY", label: "WHAT – WHY", tagline: "Progress-driven, purpose-oriented",   primary: "WHAT", secondary: "WHY"  },
  { id: "WHAT-HOW", label: "WHAT – HOW", tagline: "Progress-driven, precision-oriented", primary: "WHAT", secondary: "HOW"  },
  { id: "HOW-WHY",  label: "HOW – WHY",  tagline: "Precision-driven, purpose-oriented",  primary: "HOW",  secondary: "WHY"  },
  { id: "HOW-WHAT", label: "HOW – WHAT", tagline: "Precision-driven, progress-oriented", primary: "HOW",  secondary: "WHAT" },
];

const FIT_TYPE_DETAILS = {
  "WHY-WHAT": { strengths: ["Strategic vision and big-picture thinking","Identifying opportunities and gaps","Setting direction and goals","Pitching and narrative building","Questioning the status quo","High-level roadmap planning"], drains: ["Granular execution and task management","Following detailed processes","Documentation and administrative work","Repetitive or routine tasks","Working in the weeds for extended periods"] },
  "WHY-HOW":  { strengths: ["Systems thinking and framework design","Research synthesis and distilling insights","Diagnosing root causes","Writing thought leadership","Building comprehensive strategies","Connecting vision to execution detail"], drains: ["Fast-paced iteration without analysis","Rushing to launch before it feels right","Pure action without sufficient grounding","Communicating to WHAT-dominant audiences"] },
  "WHAT-WHY": { strengths: ["Building and maintaining momentum","Rallying teams around shared goals","Fast decision-making under ambiguity","Client-facing discovery and pitching","Running high-energy team sessions","Milestone-oriented project leadership"], drains: ["Detailed process design and documentation","Administrative and compliance work","Deep analytical research","Managing granular task execution","Precision-oriented work for extended periods"] },
  "WHAT-HOW": { strengths: ["Detailed project planning and management","Breaking initiatives into actionable steps","Building metrics and dashboards","Managing cross-functional execution","Running agile and iterative processes","Operationalizing workflows and processes"], drains: ["Open-ended visioning without clear milestones","Work lacking defined next steps","Pure strategy without implementation path","Extended ambiguity about direction or goals"] },
  "HOW-WHY":  { strengths: ["Deep analytical work and root cause analysis","Process auditing and redesign","Synthesizing complex data into insights","Testing and validating approaches rigorously","Spotting inefficiencies","Mentoring on methodology and best practices"], drains: ["Launching before full analysis is complete","High-velocity action-oriented environments","Communicating findings to non-technical audiences","Prioritizing when everything feels equally important"] },
  "HOW-WHAT": { strengths: ["Designing operational processes end-to-end","Building organizational structures and operating models","Creating SOPs, playbooks, and documentation","Implementing systems and managing change","Identifying and resolving bottlenecks","Managing multi-workstream complexity"], drains: ["Ambiguous open-ended creative work","Vision-setting without clear parameters","Work requiring frequent pivots without structure","Communication of 'why' to stakeholders"] },
};

const PROFILES_DEF = [
  { id: 'WHY-WHAT', tagline: 'Purpose-Driven, Progress-Oriented' },
  { id: 'WHY-HOW',  tagline: 'Purpose-Driven, Precision-Oriented' },
  { id: 'WHAT-WHY', tagline: 'Progress-Driven, Purpose-Oriented' },
  { id: 'WHAT-HOW', tagline: 'Progress-Driven, Precision-Oriented' },
  { id: 'HOW-WHY',  tagline: 'Precision-Driven, Purpose-Oriented' },
  { id: 'HOW-WHAT', tagline: 'Precision-Driven, Progress-Oriented' },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { section: 'ENGAGE', items: [
    { id: 'tokens',       label: 'Tokens' },
    { id: 'assessments',  label: 'Assessments' },
    { id: 'engagements',  label: 'Engagements' },
    { id: 'career',       label: 'Career Reports' },
  ]},
  { section: 'MANAGE', items: [
    { id: 'accounts',     label: 'Accounts' },
    { id: 'emails',       label: 'Emails' },
  ]},
  { section: 'LANGUAGE TOOLS', items: [
    { id: 'detection-feedback', label: 'Detection Feedback' },
    { id: 'mirror-tokens',      label: 'Mirror Tokens' },
  ]},
  { section: 'SETTINGS', items: [
    { id: 'settings',     label: 'Settings' },
    { id: 'cleanup',      label: 'Cleanup' },
    { id: 'link',         label: 'Link Assessment' },
  ]},
];

function Sidebar({ active, onNav, onSignOut }) {
  return (
    <div style={sb.sidebar}>
      <div style={sb.brand}>
        <span style={sb.wordmark}>Curio<span style={sb.dot}>.</span></span>
        <span style={sb.adminLabel}>Admin</span>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={sb.navSection}>
            <div style={sb.sectionLabel}>{section}</div>
            {items.map(item => (
              <button
                key={item.id}
                style={active === item.id ? { ...sb.navItem, ...sb.navItemActive } : sb.navItem}
                onClick={() => onNav(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <button style={sb.signOut} onClick={onSignOut}>Sign out</button>
    </div>
  );
}

const sb = {
  sidebar: { width: 220, minWidth: 220, background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 },
  brand: { padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  wordmark: { fontFamily: "'Caveat', cursive", fontSize: '1.6rem', fontWeight: 700, color: '#fff', display: 'block' },
  dot: { color: '#059669' },
  adminLabel: { fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2, display: 'block' },
  navSection: { padding: '16px 0 4px' },
  sectionLabel: { fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0 20px', marginBottom: 4 },
  navItem: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", borderRadius: 0, transition: 'background 0.1s, color 0.1s' },
  navItemActive: { background: 'rgba(5,150,105,0.18)', color: '#34D399', fontWeight: 600 },
  signOut: { margin: '16px 12px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' },
};

// ─── Send Link Panel ──────────────────────────────────────────────────────────

function buildDefaultMessage(name, tokenUrl, purpose) {
  if (purpose === 'career') {
    return `Hi ${name},\n\nI'd like to invite you to use the Curio Career Guidance Tool — an AI-powered tool that generates a personalized report with best-fit roles, what will energize and challenge you, and strategies specific to how you think.\n\nYour personal link:\n\n${tokenUrl}\n\nLooking forward to sharing the results with you.\n\nRay Kearney\nCurio`;
  }
  return `Hi ${name},\n\nI'd like to invite you to take the MindPrint™ Assessment — a short exercise that identifies how you're naturally wired to think through and solve problems. It will take approximately 7-10 minutes to complete.\n\nYour personal link:\n\n${tokenUrl}\n\nThis link is unique to you and can only be used once.\n\nLooking forward to sharing the results with you.\n\nRay Kearney\nCurio`;
}

function SendLinkPanel({ token, participantName, participantEmail, tokenUrl, purpose, onClose, onSent }) {
  const isCareer = purpose === 'career';
  const [to, setTo] = useState(participantEmail || '');
  const [subject, setSubject] = useState(isCareer ? "Your Career Guidance Tool Invitation" : "You're invited to take the MindPrint™ Assessment");
  const safeName = (participantName && participantName.toLowerCase() !== 'individual') ? participantName : 'there';
  const [message, setMessage] = useState(buildDefaultMessage(safeName, tokenUrl, purpose));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!to.trim()) return setError('Recipient email is required');
    setSending(true); setError('');
    try {
      const res = await fetch('/api/email/send-token-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, to: to.trim(), subject, message, participantEmail, purpose }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      onSent();
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  }

  return (
    <div style={s.sendPanel}>
      <div style={s.sendPanelGrid}>
        <div style={s.sendField}><label style={s.sendLabel}>To</label><input style={s.sendInput} value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" /></div>
        <div style={s.sendField}><label style={s.sendLabel}>Subject</label><input style={s.sendInput} value={subject} onChange={e => setSubject(e.target.value)} /></div>
        <div style={{ ...s.sendField, gridColumn: '1 / -1' }}><label style={s.sendLabel}>Message</label><textarea style={s.sendTextarea} rows={8} value={message} onChange={e => setMessage(e.target.value)} /></div>
      </div>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.sendActions}>
        <button style={s.btn} onClick={send} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Tool Access Field ────────────────────────────────────────────────────────

function ToolAccessField({ grantedTools, setGrantedTools }) {
  function applyPreset(preset) {
    if (preset === 'basic') setGrantedTools(['assessment_tokens']);
    else if (preset === 'premium') setGrantedTools([...ALL_TOOLS]);
    else setGrantedTools([]);
  }
  function toggle(tool) {
    setGrantedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  }
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>Tool Access</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[{ id: 'basic', label: 'Basic' }, { id: 'premium', label: 'Premium' }, { id: 'custom', label: 'Custom' }].map(p => (
          <button key={p.id} onClick={() => applyPreset(p.id)} style={{ padding: '4px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: '#F8FAFC', color: '#374151' }}>{p.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ALL_TOOLS.map(tool => (
          <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={grantedTools.includes(tool)} onChange={() => toggle(tool)} style={{ accentColor: '#059669', width: 16, height: 16 }} />
            {TOOL_LABELS[tool]}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Generate Panel ───────────────────────────────────────────────────────────

function DurationField({ durationMode, setDurationMode, customExpiresAt, setCustomExpiresAt }) {
  const pillStyle = (active) => ({ padding: '6px 14px', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: active ? 600 : 500, cursor: 'pointer', background: active ? '#0F172A' : '#F1F5F9', color: active ? '#fff' : '#64748B', transition: 'all 0.15s' });
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>Access Duration</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {[{ id: '1mo', label: '1 Month' }, { id: '1yr', label: '1 Year' }, { id: '2yr', label: '2 Years' }, { id: 'custom', label: 'Custom' }].map(opt => (
          <button key={opt.id} type="button" style={pillStyle(durationMode === opt.id)} onClick={() => setDurationMode(opt.id)}>{opt.label}</button>
        ))}
        {durationMode === 'custom' && (
          <input type="date" style={{ ...s.input, maxWidth: 180, margin: 0 }} value={customExpiresAt} onChange={e => setCustomExpiresAt(e.target.value)} />
        )}
      </div>
    </div>
  );
}

function GeneratePanel({ prefillEngId }) {
  const [batchMode, setBatchMode] = useState('enterprise'); // 'individual' | 'enterprise'
  const [mode, setMode] = useState('named'); // 'named' | 'anonymous' (enterprise only)
  const [purpose, setPurpose] = useState('assessment');
  const [grantedTools, setGrantedTools] = useState(['assessment_tokens']);
  const [engagementId, setEngagementId] = useState(prefillEngId || '');
  const [durationMode, setDurationMode] = useState('1yr');
  const [customExpiresAt, setCustomExpiresAt] = useState('');
  const [participantText, setParticipantText] = useState('');

  function resolvedExpiresAt() {
    if (durationMode === '1mo') return new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    if (durationMode === '1yr') return new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    if (durationMode === '2yr') return new Date(Date.now() + 730 * 86400000).toISOString().slice(0, 10);
    return customExpiresAt || undefined;
  }
  const [anonCount, setAnonCount] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSendLink, setOpenSendLink] = useState(null);
  const [sentLinks, setSentLinks] = useState(new Set());

  // Individual mode state
  const [indivName, setIndivName] = useState('');
  const [indivEmail, setIndivEmail] = useState('');
  const [indivResult, setIndivResult] = useState(null);
  const [indivSentLink, setIndivSentLink] = useState(false);

  useEffect(() => {
    if (prefillEngId) { setEngagementId(prefillEngId); setBatchMode('enterprise'); }
  }, [prefillEngId]);

  async function generateIndividual() {
    setError(''); setIndivResult(null); setIndivSentLink(false);
    setLoading(true);
    try {
      const autoEngId = `individual-${Date.now()}`;
      const participants = [{ name: indivName.trim() || '', email: indivEmail.trim() || '' }];
      const res = await fetch('/api/tokens/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participants, purpose, granted_tools: grantedTools, engagement_id: autoEngId, expires_at: resolvedExpiresAt() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setIndivResult(data.tokens[0]);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function generate() {
    setError(''); setResults(null); setOpenSendLink(null); setSentLinks(new Set());
    if (!engagementId.trim()) return setError('Engagement ID is required');

    let participants;
    if (mode === 'anonymous') {
      const n = parseInt(anonCount, 10);
      if (!n || n < 1) return setError('Enter a number of tokens greater than 0');
      participants = Array.from({ length: n }, (_, i) => ({ name: `Anonymous ${i + 1}` }));
    } else {
      const lines = participantText.trim().split('\n').filter(Boolean);
      participants = lines.map(line => {
        const [name, email, company, role] = line.split(',').map(s => s.trim());
        return { name: name || '', email: email || '', company: company || '', role: role || '' };
      }).filter(p => p.name);
      if (!participants.length) return setError('Enter at least one participant (Name required, email optional)');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tokens/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participants, purpose, granted_tools: grantedTools, engagement_id: engagementId.trim(), expires_at: resolvedExpiresAt() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResults(data.tokens);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function copyAll() {
    navigator.clipboard.writeText(results.map(r => `${r.name}\t${r.email}\t${r.url}`).join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const toggleStyle = (active) => ({ padding: '6px 14px', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: active ? 600 : 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: active ? '#fff' : 'transparent', color: active ? '#0F172A' : '#64748B', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' });

  return (
    <section style={s.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>Generate Tokens</h2>
        <div style={{ display: 'flex', gap: 0, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
          {[{ id: 'individual', label: 'Individual Access' }, { id: 'enterprise', label: 'Enterprise Batch' }].map(opt => (
            <button key={opt.id} onClick={() => { setBatchMode(opt.id); setResults(null); setIndivResult(null); setError(''); }} style={toggleStyle(batchMode === opt.id)}>{opt.label}</button>
          ))}
        </div>
      </div>

      {batchMode === 'individual' ? (
        <>
          <div style={s.fieldGroup}><label style={s.label}>Purpose</label><select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}><option value="assessment">Assessment</option><option value="fit">Role Analyzer</option><option value="jd">Job Description Analyzer</option><option value="career">Career Guidance</option></select></div>
          <ToolAccessField grantedTools={grantedTools} setGrantedTools={setGrantedTools} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={s.fieldGroup}><label style={s.label}>Name (optional)</label><input style={s.input} value={indivName} onChange={e => setIndivName(e.target.value)} placeholder="Alex Smith" /></div>
            <div style={s.fieldGroup}><label style={s.label}>Email (optional)</label><input style={s.input} type="email" value={indivEmail} onChange={e => setIndivEmail(e.target.value)} placeholder="alex@example.com" /></div>
          </div>
          <DurationField durationMode={durationMode} setDurationMode={setDurationMode} customExpiresAt={customExpiresAt} setCustomExpiresAt={setCustomExpiresAt} />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} onClick={generateIndividual} disabled={loading}>{loading ? 'Generating…' : 'Generate Link'}</button>
          {indivResult && (
            <div style={{ marginTop: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Link Ready</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ ...s.code, flex: 1, fontSize: '0.82rem', wordBreak: 'break-all' }}>{indivResult.url}</code>
                <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(indivResult.url)}>Copy</button>
              </div>
              <div style={{ marginTop: 12 }}>
                {indivSentLink ? <span style={s.sentBadge}>Link Sent ✓</span> : (
                  <SendLinkPanel token={indivResult.token} participantName={indivResult.name} participantEmail={indivResult.email} tokenUrl={indivResult.url} purpose={purpose} onClose={() => {}} onSent={() => setIndivSentLink(true)} />
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 0, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
              {[{ id: 'named', label: 'Named Participants' }, { id: 'anonymous', label: 'Anonymous Batch' }].map(opt => (
                <button key={opt.id} onClick={() => { setMode(opt.id); setResults(null); setError(''); }} style={toggleStyle(mode === opt.id)}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div style={s.fieldGroup}><label style={s.label}>Purpose</label><select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}><option value="assessment">Assessment</option><option value="fit">Role Analyzer</option><option value="jd">Job Description Analyzer</option><option value="career">Career Guidance</option></select></div>
          <ToolAccessField grantedTools={grantedTools} setGrantedTools={setGrantedTools} />
          <div style={s.fieldGroup}><label style={s.label}>Engagement ID</label><input style={s.input} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2026-q1" /></div>
          <DurationField durationMode={durationMode} setDurationMode={setDurationMode} customExpiresAt={customExpiresAt} setCustomExpiresAt={setCustomExpiresAt} />
          {mode === 'named' ? (
            <div style={s.fieldGroup}>
              <label style={s.label}>Participants — one per line: <code style={s.code}>Name, email, Company, Role</code></label>
              <textarea style={s.textarea} value={participantText} onChange={e => setParticipantText(e.target.value)} placeholder={"Alex Smith, alex@example.com, Acme Corp, Engineer\nJordan Lee, jordan@example.com\nSam Taylor"} rows={6} />
            </div>
          ) : (
            <div style={s.fieldGroup}>
              <label style={s.label}>Number of tokens</label>
              <input style={{ ...s.input, maxWidth: 160 }} type="number" min="1" max="500" value={anonCount} onChange={e => setAnonCount(e.target.value)} placeholder="e.g. 50" />
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 6 }}>Tokens will be labeled Anonymous 1, Anonymous 2, … in the status panel.</p>
            </div>
          )}
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate Tokens'}</button>

          {results && (
            <div style={{ marginTop: 24 }}>
              <div style={s.resultsHeader}>
                <span style={s.resultsCount}>{results.length} token{results.length !== 1 ? 's' : ''} created</span>
                <button style={s.btnSecondary} onClick={copyAll}>{copied ? 'Copied!' : 'Copy all URLs'}</button>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr>{['Name','Email','Company','Role','URL','Copy','Send Link'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {results.flatMap((r, i) => {
                      const rows = [
                        <tr key={r.token} style={i % 2 === 0 ? s.trEven : {}}>
                          <td style={s.td}>{r.name}</td>
                          <td style={s.td}>{r.email || '—'}</td>
                          <td style={s.td}>{r.company || '—'}</td>
                          <td style={s.td}>{r.role || '—'}</td>
                          <td style={{ ...s.td, ...s.urlCell }}>{r.url}</td>
                          <td style={s.td}><button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(r.url)}>Copy</button></td>
                          <td style={s.td}>
                            {sentLinks.has(r.token) ? <span style={s.sentBadge}>Sent ✓</span> : (
                              <button style={openSendLink === r.token ? s.sendLinkBtnActive : s.sendLinkBtn} onClick={() => setOpenSendLink(openSendLink === r.token ? null : r.token)}>Send Link</button>
                            )}
                          </td>
                        </tr>,
                      ];
                      if (openSendLink === r.token) {
                        rows.push(
                          <tr key={`${r.token}-panel`}><td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                            <SendLinkPanel token={r.token} participantName={r.name} participantEmail={r.email} tokenUrl={r.url} purpose={purpose} onClose={() => setOpenSendLink(null)} onSent={() => { setSentLinks(prev => new Set([...prev, r.token])); setOpenSendLink(null); }} />
                          </td></tr>
                        );
                      }
                      return rows;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Status Panel ─────────────────────────────────────────────────────────────

function StatusPanel({ preloadEngId }) {
  const [engagementId, setEngagementId] = useState(preloadEngId || '');
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSendLink, setOpenSendLink] = useState(null);
  const [sentLinks, setSentLinks] = useState(new Set());
  const [sendingProfile, setSendingProfile] = useState(null);

  useEffect(() => {
    if (preloadEngId) load(preloadEngId);
  }, [preloadEngId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load(eid) {
    const id = eid || engagementId;
    setError(''); setTokens(null); setOpenSendLink(null); setSentLinks(new Set());
    if (!id.trim()) return setError('Enter an Engagement ID');
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/status?engagement_id=${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTokens(data.tokens);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function sendProfile(t) {
    const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
    const profile = profileRaw ? String(profileRaw).toUpperCase() : null;
    if (!profile || !t.email) return;
    setSendingProfile(t.token);
    try {
      const res = await fetch('/api/email/send-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_name: t.name, participant_email: t.email, profile }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      // Mark profile_sent_at persistently
      await fetch(`/api/admin/tokens/${t.token}/profile-sent`, { method: 'POST' });
      setTokens(prev => prev.map(tok => tok.token === t.token ? { ...tok, profile_sent_at: new Date().toISOString() } : tok));
    } catch (e) { alert(`Failed to send profile: ${e.message}`); }
    finally { setSendingProfile(null); }
  }

  const used = tokens?.filter(t => t.used).length ?? 0;

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Engagement Status</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={s.label}>Engagement ID</label>
          <input style={s.input} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2026-q1" onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
        <button style={s.btn} onClick={() => load()} disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
      </div>
      {error && <p style={s.error}>{error}</p>}

      {tokens && (
        <div style={{ marginTop: 24 }}>
          <p style={s.summary}><strong>{used}</strong> of <strong>{tokens.length}</strong> completed</p>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>{['Name','Email','Company','Role','Status','Link','Used At','Result','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {tokens.flatMap((t, i) => {
                  const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
                  const profile = profileRaw ? String(profileRaw).toUpperCase() : null;
                  const canSendProfile = t.used && profile && t.email;
                  const tokenUrl = `https://www.choosecurio.com/go/${t.token}`;
                  const profileAlreadySent = !!t.profile_sent_at;

                  const mainRow = (
                    <tr key={t.token} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{t.name}</td>
                      <td style={s.td}>{t.email || '—'}</td>
                      <td style={s.td}>{t.company || '—'}</td>
                      <td style={s.td}>{t.role || '—'}</td>
                      <td style={s.td}><span style={t.used ? s.badgeUsed : s.badgePending}>{t.used ? 'Completed' : 'Pending'}</span></td>
                      <td style={s.td}>{(t.link_sent_at || sentLinks.has(t.token)) ? <span style={s.badgeLinkSent}>Link Sent</span> : '—'}</td>
                      <td style={s.td}>{t.used_at ? new Date(t.used_at).toLocaleString() : '—'}</td>
                      <td style={s.td}>{profile ? <span style={s.badgeType}>{profile}</span> : '—'}</td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {sentLinks.has(t.token) ? <span style={s.sentBadge}>Sent ✓</span> : (
                            <button style={openSendLink === t.token ? s.sendLinkBtnActive : s.sendLinkBtn} onClick={() => setOpenSendLink(openSendLink === t.token ? null : t.token)}>Send Link</button>
                          )}
                          {canSendProfile && (
                            profileAlreadySent ? (
                              <span style={s.sentBadge}>Profile Sent ✓</span>
                            ) : (
                              <button style={s.sendProfileBtn} onClick={() => sendProfile(t)} disabled={sendingProfile === t.token}>
                                {sendingProfile === t.token ? 'Sending…' : 'Send Profile'}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );

                  if (openSendLink !== t.token) return [mainRow];
                  return [
                    mainRow,
                    <tr key={`${t.token}-panel`}><td colSpan={9} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                      <SendLinkPanel token={t.token} participantName={t.name} participantEmail={t.email} tokenUrl={tokenUrl} onClose={() => setOpenSendLink(null)} onSent={() => { setSentLinks(prev => new Set([...prev, t.token])); setTokens(prev => prev.map(tok => tok.token === t.token ? { ...tok, link_sent_at: new Date().toISOString() } : tok)); setOpenSendLink(null); }} />
                    </td></tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Fit Analysis Panel ───────────────────────────────────────────────────────

function FitAnalysisPanel({ assessment, onClose }) {
  const profileType = (assessment.type || '').toUpperCase().replace(/_/g, '-');
  const [role, setRole] = useState(assessment.role || assessment.reg_role || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailTo, setEmailTo] = useState(assessment.email || assessment.reg_email || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const type = FIT_TYPES.find(t => t.id === profileType);
  const details = FIT_TYPE_DETAILS[profileType];
  const tertiary = type ? ['WHY','WHAT','HOW'].find(b => b !== type.primary && b !== type.secondary) : null;

  useEffect(() => { if (type && role.trim()) analyze(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!result) return;
    const n = assessment.name || assessment.reg_name || 'there';
    const pct = Math.round(result.score);
    const label = pct>=75?'Strong Fit':pct>=60?'Good Fit':pct>=40?'Partial Fit':pct>=20?'Poor Fit':'Severe Mismatch';
    const r = role.trim();
    setEmailSubject(`Your MindPrint™ Role Fit Analysis — ${r}`);
    setEmailBody(`Hi ${n},\n\nAttached is your MindPrint™ Role Fit Analysis for the ${r} position.\n\nThe Role Fit Analysis evaluates how well your natural cognitive profile — the way you're wired to think, prioritize, and approach problems — aligns with the demands of a specific role. Rather than assessing your skills or experience, it identifies whether the type of thinking the role requires will energize or drain you.\n\nAttached you'll find:\n• Your fit score for the ${r} role (${pct}% — ${label})\n• What aspects of the role you're likely to enjoy and excel at\n• Areas where you may face more friction or drain\n• Specific recommendations for setting yourself up for success\n\nIf you have any questions about your results, please don't hesitate to reach out.\n\nCurio`);
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  async function callAPI(system, userContent, maxTokens, model = 'claude-haiku-4-5-20251001') {
    const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0, top_k: 1, system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: userContent }] }) });
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || data.error);
      return data.content?.[0]?.text || '';
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n'); buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;
        try { const evt = JSON.parse(payload); if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') text += evt.delta.text; } catch {}
      }
    }
    return text;
  }

  async function analyze() {
    if (!role.trim() || !type) return;
    setLoading(true); setLoadingStep('Analyzing role demands…'); setError(''); setResult(null);

    const splitSystem = `You analyze job roles for the MindPrint Framework and estimate their absolute cognitive demand profile.\n\nThe MindPrint Framework defines three cognitive orientations:\n- WHY: The work of choosing direction and defining purpose. WHY asks "what should we pursue and why does it matter?"\n- WHAT: The work of execution and momentum. WHAT asks "how do we move this forward?" It drives progress, manages relationships, coordinates people.\n- HOW: The work of correctness and completeness. HOW asks "is this right and does it hold up?" It covers process design, precision, analysis, documentation, systems, quality.\n\nCALIBRATION:\n- CEO / Founder: WHY 40-50%\n- Brand/Creative/Strategy leads: WHY 35-50%\n- Product Manager: WHY 25-35%, WHAT 35-45%, HOW 20-30%\n- UX Designer: WHY 20-30%, HOW 45-55%, WHAT 15-25%\n- Marketing Manager: WHY 20-30%, WHAT 45-55%, HOW 15-25%\n- Program/Project Manager: WHY 5-15%, WHAT 40-50%, HOW 40-50%\n- Engineer / Analyst / QA: WHY <10%, HOW dominant (55-70%)\n- Sales / Recruiter / Account Manager: WHY <10%, WHAT dominant (55-70%)\n\nEstimate what percentage of this role's core work demands each orientation. Must sum to exactly 100.\nReturn ONLY valid JSON: { "why": <integer>, "what": <integer>, "how": <integer> }`;

    const qualSystem = `You are a deterministic analyst for the MindPrint Framework. Given a cognitive profile and a role's demand split, produce a role alignment analysis.\n\nThe MindPrint Framework defines three cognitive orientations:\n- WHY: Vision-oriented, purpose-driven, big-picture thinker, questions assumptions\n- WHAT: Action-oriented, momentum-driven, milestone-focused, values progress\n- HOW: Detail-oriented, process-focused, precision-driven, systematic\n\nRULES:\n1. Every item must be specific to this exact role and profile combination\n2. Ground every item in the demand split percentages\n3. Recommendations must be actionable and role-specific\n4. partnerTypes must complement the gaps this profile has in this role\n\nReturn ONLY valid JSON:\n{\n  "scoreRationale": "<exactly 2-3 sentences about fit>",\n  "enjoys": ["<role-specific>", "<role-specific>", "<role-specific>", "<role-specific>"],\n  "excels": ["<role-specific>", "<role-specific>", "<role-specific>", "<role-specific>"],\n  "dislikes": ["<role-specific>", "<role-specific>", "<role-specific>"],\n  "struggles": ["<role-specific>", "<role-specific>", "<role-specific>"],\n  "recommendations": [\n    { "category": "<Focus|Delegation|Workflow|Communication|Structure>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" }\n  ],\n  "partnerTypes": [\n    { "type": "<WHY-WHAT|WHY-HOW|WHAT-WHY|WHAT-HOW|HOW-WHY|HOW-WHAT>", "reason": "<1 sentence>" },\n    { "type": "<one of the above>", "reason": "<1 sentence>" }\n  ]\n}\nCounts: enjoys=4, excels=4, dislikes=3, struggles=3, recommendations=4, partnerTypes=2`;

    function parseSplit(raw) { const m = raw.match(/\{[\s\S]*?\}/); if (!m) return null; try { const s = JSON.parse(m[0]); return typeof s.why === 'number' && typeof s.what === 'number' && typeof s.how === 'number' ? s : null; } catch { return null; } }
    function parseQual(raw) { const m = raw.match(/\{[\s\S]*\}/); if (!m) return null; try { return JSON.parse(m[0]); } catch { return null; } }

    try {
      const rolePrompt = `Role: "${role.trim()}"`;
      const splitRaws = await Promise.all([callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600)]);
      const splits = splitRaws.map(parseSplit).filter(Boolean);
      if (!splits.length) throw new Error('Could not parse demand split');
      const avg = { why: splits.reduce((s, x) => s + x.why, 0) / splits.length, what: splits.reduce((s, x) => s + x.what, 0) / splits.length, how: splits.reduce((s, x) => s + x.how, 0) / splits.length };
      let demandSplit = { why: Math.round(avg.why), what: Math.round(avg.what), how: Math.round(avg.how) };
      const off = 100 - (demandSplit.why + demandSplit.what + demandSplit.how);
      if (off !== 0) { const largest = Object.entries(demandSplit).sort((a, b) => b[1] - a[1])[0][0]; demandSplit[largest] += off; }
      const splitMap = { WHY: demandSplit.why, WHAT: demandSplit.what, HOW: demandSplit.how };
      const dp = splitMap[type.primary] || 0, ds = splitMap[type.secondary] || 0, dt = splitMap[tertiary] || 0;
      const rawScore = dp * 1.25 + ds * 0.8 + dt * (-1.5);
      const linear = Math.max(0, Math.min(1, (rawScore + 150) / 275));
      const score = Math.round(Math.pow(linear, 1.5) * 100);
      setLoadingStep('Building profile analysis…');
      const qualUser = `Profile: ${type.label} (${type.tagline})\nPrimary orientation: ${type.primary} — energizing\nSecondary orientation: ${type.secondary} — comfortable\nTertiary orientation: ${tertiary} — draining\n\nWhat energizes this type: ${details.strengths.join(', ')}\nWhat drains this type: ${details.drains.join(', ')}\n\nRole: "${role.trim()}"\nDemand split: WHY ${demandSplit.why}%, WHAT ${demandSplit.what}%, HOW ${demandSplit.how}%\n\nFor this person: ${dp}% in ${type.primary} (energizing), ${ds}% in ${type.secondary} (neutral), ${dt}% in ${tertiary} (draining)`;
      const SONNET = 'claude-sonnet-4-6';
      const qualRaws = await Promise.all([callAPI(qualSystem, qualUser, 2000, SONNET), callAPI(qualSystem, qualUser, 2000, SONNET), callAPI(qualSystem, qualUser, 2000, SONNET)]);
      const candidates = qualRaws.map(parseQual).filter(Boolean);
      if (!candidates.length) throw new Error('No analysis returned');
      function consensusScore(candidate, others) {
        const texts = [...(candidate.enjoys||[]),...(candidate.excels||[]),...(candidate.dislikes||[]),...(candidate.struggles||[]),...(candidate.recommendations||[]).map(r=>r.action||'')];
        let score = 0;
        for (const other of others) { const otherText = [...(other.enjoys||[]),...(other.excels||[]),...(other.dislikes||[]),...(other.struggles||[]),...(other.recommendations||[]).map(r=>r.action||'')].join(' ').toLowerCase(); for (const t of texts) { const words = t.toLowerCase().split(/\s+/).filter(w=>w.length>4); if (words.filter(w=>otherText.includes(w)).length >= Math.max(1, Math.floor(words.length*0.5))) score++; } }
        return score;
      }
      const qual = candidates.length === 1 ? candidates[0] : candidates.map((c,i)=>({c,s:consensusScore(c,candidates.filter((_,j)=>j!==i))})).sort((a,b)=>b.s-a.s)[0].c;
      setResult({ ...qual, demandSplit, score });
    } catch (e) { setError('Error: ' + (e.message || 'Something went wrong')); }
    finally { setLoading(false); setLoadingStep(''); }
  }

  async function sendEmail() {
    if (!emailTo.trim()) return setError('Email address is required');
    const name = assessment.name || assessment.reg_name;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/email/send-fit-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_name: name, participant_email: emailTo.trim(), profile_type: profileType, role: role.trim(), result, email_subject: emailSubject, email_body: emailBody }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSent(true);
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  }

  function downloadPDF() {
    const esc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const pct = Math.round(result.score);
    const color = pct>=75?'#059669':pct>=60?'#34D399':pct>=40?'#F59E0B':'#EF4444';
    const label = pct>=75?'Strong fit':pct>=60?'Good fit':pct>=40?'Partial fit':pct>=20?'Poor fit':'Severe mismatch';
    const labelBg = pct>=75?'rgba(5,150,105,0.08)':pct>=60?'rgba(52,211,153,0.08)':pct>=40?'rgba(245,158,11,0.08)':'rgba(239,68,68,0.08)';
    const labelBorder = pct>=75?'rgba(5,150,105,0.3)':pct>=60?'rgba(52,211,153,0.3)':pct>=40?'rgba(245,158,11,0.3)':'rgba(239,68,68,0.3)';
    const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const r=36,circ=2*Math.PI*r,dash=(pct/100)*circ;
    const participantName = assessment.name || assessment.reg_name || '';
    const bullets = (items,dotColor) => items.map(i=>`<div class="bullet"><span class="dot" style="background:${dotColor}"></span><span class="btext">${esc(i)}</span></div>`).join('');
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Role Alignment${participantName?' — '+esc(participantName):''} — ${esc(role)} — Curio</title><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;color:#1C1917;font-size:8.5pt;line-height:1.5;background:#fff}.wrap{max-width:700px;margin:0 auto;padding:26px 30px}.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #059669;padding-bottom:11px;margin-bottom:16px}.logo{font-family:'Caveat',cursive;font-size:21pt;font-weight:700}.logo em{color:#059669;font-style:normal}.hdr-right{text-align:right;font-size:7pt;color:#78716C}.hdr-right strong{display:block;font-size:8pt;color:#1C1917;margin-bottom:1px}.pname{font-family:'Caveat',cursive;font-size:26pt;font-weight:700;margin-bottom:10px}.score-row{display:flex;align-items:center;gap:18px;padding:13px 15px;background:#FAFAF9;border:1px solid #E7E5E4;border-radius:6px;margin-bottom:9px}.sinfo{flex:1}.tlabel{font-size:6.5pt;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#059669;margin-bottom:3px}.rname{font-family:'Caveat',cursive;font-size:17pt;font-weight:700;line-height:1.1;margin-bottom:6px}.rationale{font-size:7.5pt;color:#57534E;line-height:1.6}.sring{flex-shrink:0;text-align:center}.fit-lbl{font-size:6pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 8px;border-radius:100px;display:inline-block;margin-top:4px}.g2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px}.card{background:#FAFAF9;border:1px solid #E7E5E4;border-radius:5px;padding:11px 13px}.ca{border-left:2px solid #059669}.clabel{font-size:6pt;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#059669;margin-bottom:7px}.bullet{display:flex;gap:6px;align-items:flex-start;margin-bottom:3px}.dot{width:4px;height:4px;border-radius:50%;margin-top:5px;flex-shrink:0}.btext{font-size:7.5pt;color:#57534E;line-height:1.45}.rec{padding:6px 0;border-bottom:1px solid #E7E5E4}.rec:last-child{border-bottom:none;padding-bottom:0}.rcat{font-size:6pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#059669;margin-bottom:1px}.raction{font-family:'Caveat',cursive;font-size:10.5pt;line-height:1.2;margin-bottom:1px}.rrat{font-size:7pt;color:#78716C;line-height:1.45}.footer{margin-top:13px;padding-top:9px;border-top:1px solid #E7E5E4;display:flex;justify-content:space-between;font-size:6.5pt;color:#A8A29E}.flogo{font-family:'Caveat',cursive;font-size:13pt;font-weight:700}.flogo em{color:#059669;font-style:normal}.print-btn{display:block;width:100%;padding:14px;margin-bottom:16px;background:#059669;color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:10pt;font-weight:700;cursor:pointer}@media print{@page{margin:12mm 10mm;size:A4 portrait}.wrap{padding:0;max-width:100%}.print-btn{display:none!important}}</style></head><body><div class="wrap"><button class="print-btn" onclick="this.style.display='none';window.print()">Save as PDF</button><div class="hdr"><div class="logo">Curio<em>.</em></div><div class="hdr-right"><strong>Role Alignment Analysis</strong>${esc(today)}</div></div>${participantName?`<div class="pname">${esc(participantName)}</div>`:''}<div class="score-row"><div class="sinfo"><div class="tlabel">${esc(type.label)} &middot; ${esc(type.tagline)}</div><div class="rname">${esc(role)}</div><div class="rationale">${esc(result.scoreRationale||'')}</div></div><div class="sring"><svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r="${r}" fill="none" stroke="#E7E5E4" stroke-width="6"/><circle cx="43" cy="43" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 43 43)"/><text x="43" y="38" text-anchor="middle" font-size="19" font-weight="700" fill="${color}" font-family="Caveat,cursive">${pct}%</text><text x="43" y="52" text-anchor="middle" font-size="7" fill="#A8A29E" font-family="DM Sans,sans-serif" letter-spacing="1">MATCH</text></svg><div class="fit-lbl" style="color:${color};background:${labelBg};border:1px solid ${labelBorder}">${esc(label)}</div></div></div><div class="g2"><div class="card ca"><div class="clabel">Likely enjoys</div>${bullets(result.enjoys||[],'#059669')}</div><div class="card ca"><div class="clabel">Likely excels at</div>${bullets(result.excels||[],'#059669')}</div></div><div class="g2"><div class="card"><div class="clabel">Likely dislikes</div>${bullets(result.dislikes||[],'#A8A29E')}</div><div class="card"><div class="clabel">May struggle with</div>${bullets(result.struggles||[],'#A8A29E')}</div></div><div class="card" style="margin-bottom:7px"><div class="clabel">Recommendations</div>${(result.recommendations||[]).map(rec=>`<div class="rec"><div class="rcat">${esc(rec.category)}</div><div class="raction">${esc(rec.action)}</div><div class="rrat">${esc(rec.rationale)}</div></div>`).join('')}</div><div class="footer"><div><div class="flogo">Curio<em>.</em></div><div>MindPrint Framework™ &middot; Role Alignment Analysis</div></div><div>choosecurio.com &middot; Generated ${esc(today)}</div></div></div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const pct = result ? Math.round(result.score) : 0;
  const scoreColor = pct>=75?'#059669':pct>=60?'#34D399':pct>=40?'#F59E0B':'#EF4444';
  const scoreLabel = pct>=75?'Strong Fit':pct>=60?'Good Fit':pct>=40?'Partial Fit':pct>=20?'Poor Fit':'Severe Mismatch';

  return (
    <div style={s.sendPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Run Role Fit — {profileType}</div>
        <button style={s.btnSecondary} onClick={onClose}>Close</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={s.sendLabel}>Role</label>
          <input style={s.sendInput} value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && analyze()} placeholder="e.g. Senior Product Manager, VP of Sales…" />
        </div>
        <button style={s.btnSecondary} onClick={analyze} disabled={loading || !role.trim()}>{loading ? (loadingStep || 'Analyzing…') : result ? 'Re-analyze' : 'Analyze'}</button>
      </div>
      {loading && <div style={{ padding: '12px 0', fontSize: '0.875rem', color: '#64748B' }}>{loadingStep || 'Analyzing…'}</div>}
      {error && <p style={s.error}>{error}</p>}
      {result && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: `3px solid ${scoreColor}`, borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', fontWeight: 700, color: scoreColor }}>{pct}%</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{scoreLabel}</span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>· {type?.label}</span>
          </div>
          <div style={s.sendPanelGrid}>
            <div style={s.sendField}><label style={s.sendLabel}>To</label><input style={s.sendInput} value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="recipient@example.com" /></div>
            <div style={s.sendField}><label style={s.sendLabel}>Subject</label><input style={s.sendInput} value={emailSubject} onChange={e => setEmailSubject(e.target.value)} /></div>
            <div style={{ ...s.sendField, gridColumn: '1 / -1' }}>
              <label style={s.sendLabel}>Message <span style={{ fontWeight: 400, color: '#94A3B8' }}>(PDF analysis will be attached)</span></label>
              <textarea style={{ ...s.sendTextarea, lineHeight: 1.7 }} rows={11} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
            </div>
          </div>
          <div style={s.sendActions}>
            {sent ? <span style={s.sentBadge}>Email Sent ✓</span> : (
              <button style={s.btn} onClick={sendEmail} disabled={sending || !emailTo.trim()}>{sending ? 'Sending…' : 'Send Email + PDF'}</button>
            )}
            <button style={s.btnSecondary} onClick={downloadPDF}>Download PDF</button>
            <button style={s.btnSecondary} onClick={onClose}>Close</button>
          </div>
          {!emailTo.trim() && <p style={{ ...s.error, marginTop: 6 }}>No email address on record for this participant.</p>}
        </div>
      )}
    </div>
  );
}

// ─── Assessments Panel ────────────────────────────────────────────────────────

function profileBadgeStyle(type) {
  const t = (type || '').toUpperCase();
  const base = { padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em', whiteSpace: 'nowrap' };
  if (t.startsWith('WHY'))  return { ...base, background: '#6EE7B7', color: '#0F172A' };
  if (t.startsWith('WHAT')) return { ...base, background: '#93C5FD', color: '#0F172A' };
  if (t.startsWith('HOW'))  return { ...base, background: '#FCD34D', color: '#0F172A' };
  return { ...base, background: '#EFF6FF', color: '#1D4ED8' };
}

function AssessmentsPanel() {
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openFitPanel, setOpenFitPanel] = useState(null);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [sentProfiles, setSentProfiles] = useState(new Set());
  const [sendingProfile, setSendingProfile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/assessments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAssessments(data.assessments);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function deleteAssessment(a) {
    const label = a.name || a.reg_name || a.email || a.reg_email || 'this assessment';
    if (!window.confirm(`Delete ${label}? This permanently removes the assessment row and can't be undone.`)) return;
    setDeletingId(a.id);
    try {
      const res = await fetch('/api/admin/assessments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setAssessments(prev => prev.filter(x => x.id !== a.id));
    } catch (e) { alert(`Failed to delete: ${e.message}`); }
    finally { setDeletingId(null); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendProfile(a) {
    const key = a.id;
    const name = a.name || a.reg_name || '';
    const email = a.email || a.reg_email || '';
    const profile = (a.type || '').toUpperCase().replace(/_/g, '-');
    if (!email || !profile) return;
    setSendingProfile(key);
    try {
      const res = await fetch('/api/email/send-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_name: name, participant_email: email, profile }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setSentProfiles(prev => new Set([...prev, key]));
    } catch (e) { alert(`Failed to send profile: ${e.message}`); }
    finally { setSendingProfile(null); }
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const filtered = (assessments || []).filter(a => {
    const q = search.toLowerCase();
    if (q) {
      const name = (a.name || a.reg_name || '').toLowerCase();
      const email = (a.email || a.reg_email || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    if (profileFilter) {
      const type = (a.type || '').toUpperCase().replace(/_/g, '-');
      if (type !== profileFilter) return false;
    }
    return true;
  });

  const stats = assessments ? {
    total: assessments.length,
    thisMonth: assessments.filter(a => a.submitted_at && new Date(a.submitted_at) > thirtyDaysAgo).length,
    profilesSent: sentProfiles.size,
    mostCommon: (() => {
      const counts = {};
      assessments.forEach(a => { if (a.type) counts[a.type.toUpperCase().replace(/_/g,'-')] = (counts[a.type.toUpperCase().replace(/_/g,'-')] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    })(),
  } : null;

  return (
    <section style={s.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>Assessment Submissions</h2>
        <button style={s.btn} onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <p style={s.error}>{error}</p>}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total Assessments" value={stats.total} color="#059669" />
          <StatCard label="This Month" value={stats.thisMonth} color="#2563EB" />
          <StatCard label="Most Common Profile" value={<span style={profileBadgeStyle(stats.mostCommon)}>{stats.mostCommon}</span>} color="#D97706" />
          <StatCard label="Profiles Sent" value={stats.profilesSent} color="#7C3AED" />
        </div>
      )}
      {assessments && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input style={{ ...s.input, maxWidth: 240 }} placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ ...s.select, maxWidth: 180 }} value={profileFilter} onChange={e => setProfileFilter(e.target.value)}>
              <option value="">All Profiles</option>
              {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {(search || profileFilter) && <button style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '4px 8px' }} onClick={() => { setSearch(''); setProfileFilter(''); }}>Clear</button>}
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', marginLeft: 'auto' }}>{filtered.length} of {assessments.length}</span>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>{['Name','Email','Company','Role','Profile','H Score','W Score','Y Score','Submitted At','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.flatMap((a, i) => {
                  const key = a.id || i;
                  const displayName = a.name || a.reg_name || '—';
                  const displayEmail = a.email || a.reg_email || '—';
                  const hasEmail = !!(a.email || a.reg_email);
                  const profileType = a.type ? (a.type.toUpperCase().replace(/_/g, '-')) : null;
                  const alreadySent = sentProfiles.has(key);
                  const mainRow = (
                    <tr key={key} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{displayName}</td>
                      <td style={s.td}>{displayEmail}</td>
                      <td style={s.td}>{a.company || '—'}</td>
                      <td style={s.td}>{a.role || '—'}</td>
                      <td style={s.td}>{profileType ? <span style={profileBadgeStyle(profileType)}>{profileType}</span> : '—'}</td>
                      <td style={s.td}>{a.h_score ?? '—'}</td>
                      <td style={s.td}>{a.w_score ?? '—'}</td>
                      <td style={s.td}>{a.y_score ?? '—'}</td>
                      <td style={s.td}>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {profileType && (
                            alreadySent ? <span style={s.sentBadge}>Profile Sent ✓</span> : (
                              <button
                                style={{ ...s.btn, padding: '4px 10px', fontSize: '0.78rem', opacity: hasEmail ? 1 : 0.4 }}
                                onClick={() => hasEmail && sendProfile(a)}
                                disabled={sendingProfile === key || !hasEmail}
                                title={!hasEmail ? 'No email on record' : ''}
                              >
                                {sendingProfile === key ? 'Sending…' : 'Send Profile'}
                              </button>
                            )
                          )}
                          {profileType && <button style={openFitPanel === key ? s.sendLinkBtnActive : s.sendLinkBtn} onClick={() => setOpenFitPanel(openFitPanel === key ? null : key)}>Run Role Fit</button>}
                          <button
                            style={{ ...s.btn, padding: '4px 10px', fontSize: '0.78rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', opacity: deletingId === a.id ? 0.6 : 1 }}
                            onClick={() => deleteAssessment(a)}
                            disabled={deletingId === a.id}
                          >
                            {deletingId === a.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  if (openFitPanel !== key) return [mainRow];
                  return [mainRow, <tr key={`${key}-fit`}><td colSpan={10} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}><FitAnalysisPanel assessment={a} onClose={() => setOpenFitPanel(null)} /></td></tr>];
                })}
                {filtered.length === 0 && <tr><td colSpan={10} style={{ ...s.td, color: '#94A3B8', textAlign: 'center', padding: '24px 12px' }}>{assessments.length === 0 ? 'No assessments yet.' : 'No results match your filter.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Engagements Panel ────────────────────────────────────────────────────────

function CohortPanel({ engagementId, onGenerateMore }) {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sentProfiles, setSentProfiles] = useState(new Set());
  const [sendingProfile, setSendingProfile] = useState(null);

  useEffect(() => {
    fetch(`/api/tokens/status?engagement_id=${encodeURIComponent(engagementId)}`)
      .then(r => r.json())
      .then(d => { setTokens(d.tokens || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [engagementId]);

  async function sendProfile(t) {
    const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
    const profile = profileRaw ? String(profileRaw).toUpperCase().replace(/_/g, '-') : null;
    if (!profile || !t.email) return;
    setSendingProfile(t.token);
    try {
      const res = await fetch('/api/email/send-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_name: t.name, participant_email: t.email, profile }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await fetch(`/api/admin/tokens/${t.token}/profile-sent`, { method: 'POST' }).catch(() => {});
      setSentProfiles(prev => new Set([...prev, t.token]));
    } catch (e) { alert(`Failed: ${e.message}`); }
    finally { setSendingProfile(null); }
  }

  return (
    <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '2px solid #059669' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cohort — {engagementId}</span>
        <button style={s.btnSmall} onClick={() => onGenerateMore(engagementId)}>+ Generate More</button>
      </div>
      {loading && <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Loading…</p>}
      {tokens && (
        <table style={{ ...s.table, fontSize: '0.82rem' }}>
          <thead><tr>{['Name','Email','Status','Profile','Completed At',''].map(h => <th key={h} style={{ ...s.th, fontSize: '0.75rem' }}>{h}</th>)}</tr></thead>
          <tbody>
            {tokens.map((t, i) => {
              const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
              const profile = profileRaw ? String(profileRaw).toUpperCase().replace(/_/g, '-') : null;
              const canSend = t.used && profile && t.email;
              const alreadySent = sentProfiles.has(t.token) || !!t.profile_sent_at;
              return (
                <tr key={t.token} style={i % 2 === 0 ? s.trEven : {}}>
                  <td style={s.td}>{t.name}</td>
                  <td style={s.td}>{t.email || '—'}</td>
                  <td style={s.td}><span style={t.used ? s.badgeUsed : s.badgePending}>{t.used ? 'Completed' : 'Pending'}</span></td>
                  <td style={s.td}>{profile ? <span style={profileBadgeStyle(profile)}>{profile}</span> : '—'}</td>
                  <td style={{ ...s.td, color: '#64748B', fontSize: '0.78rem' }}>{t.used_at ? new Date(t.used_at).toLocaleString() : '—'}</td>
                  <td style={s.td}>
                    {canSend && (alreadySent ? <span style={s.sentBadge}>Sent ✓</span> : (
                      <button style={{ ...s.btn, padding: '3px 10px', fontSize: '0.75rem' }} onClick={() => sendProfile(t)} disabled={sendingProfile === t.token}>
                        {sendingProfile === t.token ? '…' : 'Send Profile'}
                      </button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EngagementsPanel({ onGenerateMore }) {
  const [engagements, setEngagements] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [engFilter, setEngFilter] = useState('client');

  useEffect(() => {
    fetch('/api/admin/engagements')
      .then(r => r.json())
      .then(data => { setEngagements(data.engagements || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = (engagements || []).filter(eng => {
    const isSelfServe = eng.engagement_id?.startsWith('self-serve-');
    if (engFilter === 'client') return !isSelfServe;
    if (engFilter === 'self-serve') return isSelfServe;
    return true;
  });

  return (
    <section style={s.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>Engagements</h2>
        <div style={{ display: 'flex', gap: 0, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
          {[{ id: 'client', label: 'Client' }, { id: 'self-serve', label: 'Self-Serve' }, { id: 'all', label: 'All' }].map(opt => (
            <button key={opt.id} onClick={() => setEngFilter(opt.id)} style={{ padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: engFilter === opt.id ? 600 : 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: engFilter === opt.id ? '#fff' : 'transparent', color: engFilter === opt.id ? '#0F172A' : '#64748B', boxShadow: engFilter === opt.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</p>}
      {error && <p style={s.error}>{error}</p>}
      {engagements && filtered.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No engagements found.</p>}
      {engagements && filtered.length > 0 && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>{['Engagement ID','Total','Completed','Progress','Profiles Sent','First Created',''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.flatMap((eng, i) => {
                const pct = eng.total_count > 0 ? Math.round((eng.completed_count / eng.total_count) * 100) : 0;
                const isExpanded = expandedId === eng.engagement_id;
                const rows = [
                  <tr key={eng.engagement_id} style={i % 2 === 0 ? s.trEven : {}}>
                    <td style={s.td}><code style={s.code}>{eng.engagement_id}</code></td>
                    <td style={s.td}>{eng.total_count}</td>
                    <td style={s.td}>{eng.completed_count}</td>
                    <td style={{ ...s.td, minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: '#E2E8F0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#059669', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', flexShrink: 0 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={s.td}>{eng.profile_sent_count}</td>
                    <td style={{ ...s.td, color: '#64748B', fontSize: '0.82rem' }}>{new Date(eng.first_created_at).toLocaleDateString()}</td>
                    <td style={s.td}><button style={isExpanded ? s.sendLinkBtnActive : s.sendLinkBtn} onClick={() => setExpandedId(isExpanded ? null : eng.engagement_id)}>{isExpanded ? 'Close' : 'View →'}</button></td>
                  </tr>,
                ];
                if (isExpanded) {
                  rows.push(
                    <tr key={`${eng.engagement_id}-cohort`}><td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                      <CohortPanel engagementId={eng.engagement_id} onGenerateMore={onGenerateMore} />
                    </td></tr>
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Career Report components ─────────────────────────────────────────────────

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

function sLabel(color) {
  return { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
}

function RoleCard({ role, idx, color, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
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
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={sLabel(color)}>Why This Role Is a Strong Match</div>
            {role.fit.split('\n\n').map((p, i) => <p key={i} style={{ fontSize: '0.93rem', color: '#374151', lineHeight: 1.8, marginBottom: 14 }}>{p}</p>)}
          </div>
          <div style={{ borderTop: '1px solid #F8FAFC', background: '#FAFBFC', padding: '24px 28px' }}>
            <div style={sLabel('#059669')}>What You Will Find Energizing and Excel At</div>
            <LabeledList items={role.energizing} accent="#059669" />
          </div>
          <div style={{ borderTop: '1px solid #F8FAFC', padding: '24px 28px' }}>
            <div style={sLabel('#94A3B8')}>What Will Still Be Challenging</div>
            <LabeledList items={role.challenging} accent="#94A3B8" />
          </div>
          <div style={{ borderTop: '1px solid #F8FAFC', background: '#FAFBFC', padding: '24px 28px' }}>
            <div style={sLabel(color)}>Strategies to Bring Into This Role</div>
            <LabeledList items={role.strategies} accent={color} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReportView({ row, onBack }) {
  const { report_data: report, profile, career_level, role_orientation, industry, risk_environment } = row;
  const color = profileColor(profile);
  const profileDef = PROFILES_DEF.find(p => p.id === profile);
  const { alignmentLabel, alignmentPercent, alignmentSentence, energizers, watchFors, roles, environmentNote, nextSteps } = report;
  const inputs = { careerLevel: career_level, roleOrientation: role_orientation, industry, riskEnvironment: risk_environment };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(24px,5vw,72px) 80px' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', color: '#64748B', marginBottom: 32 }}>← Back to Reports</button>
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
            {energizers.map((e, i) => <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}><span style={{ color, fontSize: '0.75rem', marginTop: 2, flexShrink: 0 }}>⚡</span><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{e}</span></div>)}
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>◆ Watch For</div>
            {watchFors.map((w, i) => <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 2, flexShrink: 0 }}>◆</span><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{w}</span></div>)}
          </div>
        </div>
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{roles.length} roles identified</div>
      </div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: color }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color }}>Role Deep-Dives</div>
        </div>
        {roles.map((role, i) => <RoleCard key={i} role={role} idx={i} color={color} defaultOpen={i === 0} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '28px 28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16 }}>A Note on Environment</div>
          {environmentNote.split('\n\n').map((p, i) => <p key={i} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, marginBottom: 14 }}>{p}</p>)}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '28px 28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16 }}>What To Do Next</div>
          {nextSteps.map((step, i) => <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}><span style={{ color, fontWeight: 700, fontSize: '1rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>→</span><span style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>{step}</span></div>)}
        </div>
      </div>
    </div>
  );
}

const sField = { fontSize: '0.72rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
const sInput = { width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' };

function SendCareerReportPanel({ row, onClose, onSent }) {
  const color = profileColor(row.profile);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(`Your Career Guidance Report — ${row.profile}`);
  const [body, setBody] = useState(`Hi there,\n\nYour MindPrint™ Career Guidance Report is ready. Based on your ${row.profile} profile and your background as ${row.career_level} — ${row.role_orientation}, we've identified the roles most likely to energize you and where you'll naturally excel.\n\nPlease find your personalized report below.\n\nCurio`);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  async function send() {
    if (!email) { setErr('Recipient email is required'); return; }
    setSending(true); setErr('');
    try {
      const res = await fetch('/api/email/send-career-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_name: name || undefined, participant_email: email, report_row: row, email_subject: subject, email_body: body }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      onSent(row.id);
    } catch (e) { setErr(e.message); setSending(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '36px 40px', maxWidth: 540, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginBottom: 4 }}>Send Career Report</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>{row.profile} · {row.career_level}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#94A3B8', padding: 4 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={sField}>Recipient Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={sInput} /></div>
            <div><label style={sField}>Recipient Email <span style={{ color: '#EF4444' }}>*</span></label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" style={sInput} /></div>
          </div>
          <div><label style={sField}>Subject</label><input value={subject} onChange={e => setSubject(e.target.value)} style={sInput} /></div>
          <div><label style={sField}>Message Body</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={6} style={{ ...sInput, resize: 'vertical', lineHeight: 1.7 }} /></div>
        </div>
        {err && <div style={{ marginTop: 12, fontSize: '0.82rem', color: '#EF4444' }}>{err}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#64748B', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={send} disabled={sending} style={{ padding: '9px 20px', background: color, border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>{sending ? 'Sending…' : 'Send Report'}</button>
        </div>
      </div>
    </div>
  );
}

function ReportsList({ onView }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterProfile, setFilterProfile] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [sendPanel, setSendPanel] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());

  useEffect(() => {
    fetch('/api/admin/career-reports')
      .then(r => r.ok ? r.json() : r.json().then(d => { throw new Error(d.error || 'Failed to load'); }))
      .then(d => { setReports(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = reports.filter(r => (!filterProfile || r.profile === filterProfile) && (!filterLevel || r.career_level === filterLevel));

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)} style={s.select}><option value="">All Profiles</option>{PROFILES.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={s.select}><option value="">All Levels</option>{CAREER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
        {(filterProfile || filterLevel) && <button onClick={() => { setFilterProfile(''); setFilterLevel(''); }} style={{ padding: '8px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', color: '#64748B', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Clear filters</button>}
        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#94A3B8', alignSelf: 'center' }}>{filtered.length} {filtered.length === 1 ? 'report' : 'reports'}</div>
      </div>
      {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>Loading…</div>}
      {error && <div style={{ textAlign: 'center', padding: '60px 0', color: '#EF4444' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>No reports found.</div>}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(row => {
            const color = profileColor(row.profile);
            const date = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={row.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 4, height: 40, borderRadius: 2, background: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.2rem', fontWeight: 700, color }}>{row.profile}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', background: '#F1F5F9', borderRadius: 4, padding: '2px 8px' }}>{row.career_level}</span>
                    {row.industry && <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.industry}</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4 }}>{row.role_orientation} · {date}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {sentIds.has(row.id) ? <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, padding: '8px 4px' }}>✓ Sent</span> : (
                    <button onClick={() => setSendPanel(row)} style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: 7, color: '#374151', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Send ✉</button>
                  )}
                  <button onClick={() => onView(row)} style={{ padding: '8px 16px', background: '#0F172A', border: 'none', borderRadius: 7, color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>View →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {sendPanel && <SendCareerReportPanel row={sendPanel} onClose={() => setSendPanel(null)} onSent={id => { setSentIds(prev => new Set([...prev, id])); setSendPanel(null); }} />}
    </div>
  );
}

function CareerReportsSection() {
  const [viewing, setViewing] = useState(null);
  return viewing ? (
    <ReportView row={viewing} onBack={() => setViewing(null)} />
  ) : (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 0 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Career Reports</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>All generated career guidance reports, newest first.</p>
      </div>
      <ReportsList onView={setViewing} />
    </div>
  );
}

// ─── Accounts Section ─────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderTop: `3px solid ${color}`, borderRadius: 10, padding: '18px 22px', flex: 1 }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ResendInviteButton({ accountId }) {
  const [state, setState] = useState('idle');
  async function resend() {
    setState('sending');
    try { const res = await fetch(`/api/admin/accounts/${accountId}/resend-invite`, { method: 'POST' }); setState(res.ok ? 'done' : 'error'); }
    catch { setState('error'); }
  }
  if (state === 'done') return <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>✓ Sent</span>;
  if (state === 'error') return <span style={{ color: '#EF4444', fontSize: '0.78rem' }}>Failed</span>;
  return <button style={s.actionBtn} onClick={resend} disabled={state === 'sending'}>{state === 'sending' ? '…' : 'Resend'}</button>;
}

function RevokeButton({ account, onDone }) {
  const [loading, setLoading] = useState(false);
  const isRevoked = account.status === 'inactive';
  async function toggle() {
    setLoading(true);
    try { await fetch(`/api/admin/accounts/${account.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: isRevoked ? 'active' : 'inactive' }) }); onDone(); }
    catch {} finally { setLoading(false); }
  }
  return <button style={{ ...s.actionBtn, color: isRevoked ? '#059669' : '#EF4444', borderColor: isRevoked ? '#BBF7D0' : '#FCA5A5' }} onClick={toggle} disabled={loading}>{loading ? '…' : isRevoked ? 'Restore' : 'Revoke'}</button>;
}

function DeleteButton({ account, onDone }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function confirm() {
    setLoading(true); setErr('');
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || `Error ${res.status}`); return; }
      setOpen(false);
      onDone();
    } catch (e) {
      setErr(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.78rem', fontWeight: 500, padding: '4px 6px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline', textDecorationStyle: 'dotted' }}
        onClick={() => { setOpen(true); setErr(''); }}
        title="Delete account"
      >
        Delete
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Delete account?</h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
              This will permanently delete <strong>{account.name || 'this account'}</strong>&apos;s account and all associated data. This cannot be undone.
            </p>
            {err && <p style={{ fontSize: '0.82rem', color: '#DC2626', marginBottom: 12, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '8px 12px' }}>{err}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ padding: '9px 18px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#374151' }} onClick={() => setOpen(false)} disabled={loading}>Cancel</button>
              <button style={{ padding: '9px 18px', background: '#EF4444', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#fff', opacity: loading ? 0.7 : 1 }} onClick={confirm} disabled={loading}>{loading ? 'Deleting…' : 'Yes, delete permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InvitePanel({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('basic');
  const [role, setRole] = useState('owner');
  const [engagementId, setEngagementId] = useState('');
  const [licenses, setLicenses] = useState([]);
  const [licType, setLicType] = useState('role_analyzer');
  const [licQty, setLicQty] = useState('');
  const [licExpiry, setLicExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addLicense() { setLicenses(prev => [...prev, { type: licType, quantity: licQty || null, expires_at: licExpiry || null }]); setLicQty(''); setLicExpiry(''); }

  async function submit() {
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/accounts/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), tier, role, engagement_id: engagementId.trim() || undefined, licenses }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const linked = data.tokens_linked > 0 ? ` ${data.tokens_linked} token(s) linked from engagement.` : '';
      onSuccess(data.resent ? `Invite resent to ${email.trim()} (account already existed, not yet logged in).` : `Account created and invite sent to ${email.trim()}.${linked}`);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.editPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invite New Account</span>
        <button style={s.closeBtn} onClick={onClose}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
        <div><label style={s.fieldLabel}>Name</label><input style={s.fieldInput} value={name} onChange={e => setName(e.target.value)} placeholder="Alex Smith" /></div>
        <div><label style={s.fieldLabel}>Email *</label><input style={s.fieldInput} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" /></div>
        <div><label style={s.fieldLabel}>Tier</label><select style={s.fieldInput} value={tier} onChange={e => setTier(e.target.value)}><option value="basic">Basic</option><option value="premium">Premium</option></select></div>
        <div><label style={s.fieldLabel}>Role</label><select style={s.fieldInput} value={role} onChange={e => setRole(e.target.value)}><option value="owner">Owner</option><option value="member">Member</option></select></div>
        <div style={{ gridColumn: '1 / -1' }}><label style={s.fieldLabel}>Link to Engagement (optional)</label><input style={s.fieldInput} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2024-q1" /></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Licenses</p>
        {licenses.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.82rem' }}>
            <span style={s.badgeBasic}>{l.type.replace(/_/g, ' ')}</span>
            {l.quantity && <span>× {l.quantity}</span>}
            {l.expires_at && <span style={{ color: '#94A3B8' }}>exp {l.expires_at}</span>}
            <button style={{ ...s.closeBtn, fontSize: '0.9rem' }} onClick={() => setLicenses(prev => prev.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
          <div style={{ flex: 1 }}><label style={s.fieldLabel}>Type</label><select style={s.fieldInput} value={licType} onChange={e => setLicType(e.target.value)}>{LICENSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
          <div><label style={s.fieldLabel}>Qty</label><input style={{ ...s.fieldInput, width: 70 }} type="number" value={licQty} onChange={e => setLicQty(e.target.value)} placeholder="—" /></div>
          <div><label style={s.fieldLabel}>Expiry</label><input style={s.fieldInput} type="date" value={licExpiry} onChange={e => setLicExpiry(e.target.value)} /></div>
          <button style={s.btnSmall} onClick={addLicense}>+ Add</button>
        </div>
      </div>
      {error && <p style={s.error}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={s.btn} onClick={submit} disabled={loading}>{loading ? 'Sending…' : 'Create & Send Invite'}</button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function EditPanel({ account, onClose, onSave }) {
  const [tier, setTier] = useState(account.tier || 'basic');
  const [licenses, setLicenses] = useState(account.licenses || []);
  const [licType, setLicType] = useState('role_analyzer');
  const [licQty, setLicQty] = useState('');
  const [licExpiry, setLicExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [tokenExpanded, setTokenExpanded] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [addQty, setAddQty] = useState('');
  const [addEngId, setAddEngId] = useState('');
  const [addGrantedTools, setAddGrantedTools] = useState(['assessment_tokens']);
  const [addingTokens, setAddingTokens] = useState(false);
  const [addTokenMsg, setAddTokenMsg] = useState(null);
  const [users, setUsers] = useState(account.users || []);
  const [roleChanging, setRoleChanging] = useState(null);
  const [profileChanging, setProfileChanging] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(account.assessmentProfile || '');

  async function updateProfile() {
    if (!selectedProfile) return;
    setProfileChanging(true); setProfileMsg('');
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newProfile: selectedProfile }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setProfileMsg(`Updated to ${d.newProfile}${d.tertiaryChanged ? ' (licenses swapped)' : ''}`);
    } catch (e) { setProfileMsg(`Error: ${e.message}`); }
    finally { setProfileChanging(false); }
  }

  async function loadTokens() {
    setTokenLoading(true); setTokenExpanded(true);
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}/tokens`);
      const d = await res.json();
      if (res.ok) setTokenData(d);
    } catch {} finally { setTokenLoading(false); }
  }

  async function handleAddTokens() {
    const qty = parseInt(addQty, 10);
    if (!qty || qty < 1) { setAddTokenMsg({ ok: false, text: 'Enter a valid quantity.' }); return; }
    setAddingTokens(true); setAddTokenMsg(null);
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}/generate-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty, engagement_id: addEngId.trim() || undefined, granted_tools: addGrantedTools }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setAddTokenMsg({ ok: true, text: `✓ Added ${d.created} ${d.granted_tier} token${d.created !== 1 ? 's' : ''} (engagement: ${d.engagement_id})` });
      setAddQty(''); setAddEngId('');
      // Refresh token list
      const r2 = await fetch(`/api/admin/accounts/${account.id}/tokens`);
      if (r2.ok) setTokenData(await r2.json());
    } catch (e) { setAddTokenMsg({ ok: false, text: e.message }); }
    finally { setAddingTokens(false); }
  }

  async function toggleRole(user) {
    const newRole = user.role === 'owner' ? 'member' : 'owner';
    setRoleChanging(user.id);
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch {}
    finally { setRoleChanging(null); }
  }

  function addLicense() { setLicenses(prev => [...prev, { type: licType, quantity: licQty || null, expires_at: licExpiry || null }]); setLicQty(''); setLicExpiry(''); }

  async function save() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier, licenses }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSave();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const purchases = account.purchases || [];

  return (
    <div style={s.editPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Edit — {account.name}</span>
        <button style={s.closeBtn} onClick={onClose}>×</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={s.fieldLabel}>Tier</label>
        <select style={{ ...s.fieldInput, maxWidth: 160 }} value={tier} onChange={e => setTier(e.target.value)}><option value="basic">Basic</option><option value="premium">Premium</option></select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Licenses</p>
        {licenses.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.82rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 10px' }}>
            <span style={{ flex: 1, fontWeight: 500 }}>{l.type.replace(/_/g, ' ')}</span>
            {l.quantity && <span style={{ color: '#64748B' }}>× {l.quantity}</span>}
            {l.expires_at && <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>exp {new Date(l.expires_at).toLocaleDateString()}</span>}
            <button style={{ ...s.closeBtn, fontSize: '0.9rem' }} onClick={() => setLicenses(prev => prev.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
          <div style={{ flex: 1 }}><label style={s.fieldLabel}>Type</label><select style={s.fieldInput} value={licType} onChange={e => setLicType(e.target.value)}>{LICENSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
          <div><label style={s.fieldLabel}>Qty</label><input style={{ ...s.fieldInput, width: 70 }} type="number" value={licQty} onChange={e => setLicQty(e.target.value)} placeholder="—" /></div>
          <div><label style={s.fieldLabel}>Expiry</label><input style={s.fieldInput} type="date" value={licExpiry} onChange={e => setLicExpiry(e.target.value)} /></div>
          <button style={s.btnSmall} onClick={addLicense}>+ Add</button>
        </div>
      </div>
      {purchases.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Purchase History</p>
          {purchases.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '6px 10px', marginBottom: 6 }}>
              <span style={{ flex: 1, fontWeight: 500 }}>{p.product || '—'}</span>
              {p.amount != null && <span style={{ color: '#059669', fontWeight: 600 }}>${(p.amount / 100).toFixed(2)}</span>}
              <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      )}
      {/* Users / Roles */}
      {users.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Users & Roles</p>
          {users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.82rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 10px' }}>
              <span style={{ flex: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || u.email}</span>
              <span style={{ color: '#64748B', fontSize: '0.78rem', flexShrink: 0 }}>{u.email}</span>
              <span style={u.role === 'owner' ? { background: '#1E3A5F', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 } : { background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>
                {u.role || 'member'}
              </span>
              <button
                style={{ padding: '3px 10px', background: 'none', border: '1px solid #E2E8F0', borderRadius: 5, fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#374151', flexShrink: 0, opacity: roleChanging === u.id ? 0.5 : 1 }}
                onClick={() => toggleRole(u)}
                disabled={roleChanging === u.id}
              >
                {roleChanging === u.id ? '…' : u.role === 'owner' ? 'Make Member' : 'Make Owner'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MindPrint™ Profile */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>MindPrint™ Profile</p>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px' }}>
          {account.assessmentProfile ? (
            <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#0F172A' }}>Current: <strong>{account.assessmentProfile}</strong></p>
          ) : (
            <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#94A3B8' }}>No profile on record.</p>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select style={{ ...s.select, maxWidth: 200, margin: 0 }} value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}>
              <option value="">— Select profile —</option>
              {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button style={{ ...s.btn, padding: '8px 14px' }} onClick={updateProfile} disabled={profileChanging || !selectedProfile}>
              {profileChanging ? 'Updating…' : 'Update Profile'}
            </button>
            {profileMsg && <span style={{ fontSize: '0.82rem', color: profileMsg.startsWith('Error') ? '#DC2626' : '#059669' }}>{profileMsg}</span>}
          </div>
        </div>
      </div>

      {/* Token Pool */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Token Pool</p>
          <button style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '2px 8px' }} onClick={tokenExpanded ? () => setTokenExpanded(false) : loadTokens}>
            {tokenLoading ? 'Loading…' : tokenExpanded ? 'Hide ▲' : 'Show ▼'}
          </button>
        </div>
        {tokenExpanded && (
          <>
            {/* Add tokens form */}
            <div style={{ marginBottom: 12, padding: '10px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: 3 }}>Quantity *</label>
                  <input style={{ ...s.fieldInput, width: 80 }} type="number" min="1" max="500" value={addQty} onChange={e => setAddQty(e.target.value)} placeholder="e.g. 25" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: 3 }}>Engagement / Label <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optional)</span></label>
                  <input style={s.fieldInput} value={addEngId} onChange={e => setAddEngId(e.target.value)} placeholder="e.g. acme-q3-2025 (auto-generated if blank)" />
                </div>
              </div>
              <ToolAccessField grantedTools={addGrantedTools} setGrantedTools={setAddGrantedTools} />
              <button style={{ ...s.btnSmall, background: '#059669', color: '#fff', border: 'none', opacity: addingTokens ? 0.7 : 1, marginTop: 10 }} onClick={handleAddTokens} disabled={addingTokens}>
                {addingTokens ? 'Adding…' : '+ Add Tokens'}
              </button>
            </div>
            {addTokenMsg && <p style={{ fontSize: '0.8rem', color: addTokenMsg.ok ? '#059669' : '#DC2626', margin: '0 0 10px' }}>{addTokenMsg.text}</p>}
          </>
        )}
        {tokenExpanded && tokenData && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Total', value: tokenData.summary.total, color: '#0F172A' },
                { label: 'Available', value: tokenData.summary.available, color: '#1D4ED8' },
                { label: 'Sent', value: tokenData.summary.sent, color: '#D97706' },
                { label: 'Completed', value: tokenData.summary.completed, color: '#059669' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
            {tokenData.tokens.length > 0 && (
              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC' }}>
                    <tr>{['Name', 'Email', 'Engagement', 'Status', 'Sent', 'Completed'].map(h => <th key={h} style={{ textAlign: 'left', padding: '7px 10px', borderBottom: '1px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {tokenData.tokens.map((t, i) => (
                      <tr key={t.token} style={i % 2 === 0 ? { background: '#FAFAFA' } : {}}>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #F1F5F9' }}>{t.name || '—'}</td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{t.email || '—'}</td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{t.engagement_id || '—'}</td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #F1F5F9' }}>
                          <span style={t.used ? { color: '#059669', fontWeight: 600 } : t.email ? { color: '#1D4ED8', fontWeight: 600 } : { color: '#94A3B8' }}>
                            {t.used ? 'Completed' : t.email ? 'Sent' : 'Available'}
                          </span>
                        </td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{t.link_sent_at ? new Date(t.link_sent_at).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{t.used_at ? new Date(t.used_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {error && <p style={s.error}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={s.btn} onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function accountType(acc) {
  if ((acc.users || []).length > 1) return 'enterprise';
  if ((acc.purchases || []).length > 0) return 'paid';
  return 'free';
}

const accTypeBadge = {
  free: { background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  paid: { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  enterprise: { background: '#1E3A5F', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
};

function FilterTH({ label, kind, value, onChange, options, width }) {
  return (
    <th style={{ ...s.th, minWidth: width || 110, verticalAlign: 'top' }}>
      <div style={{ marginBottom: 5 }}>{label}</div>
      {kind === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', fontSize: '0.75rem', padding: '3px 4px', border: '1px solid #E2E8F0', borderRadius: 4, fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: '#374151', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}
        >
          <option value="">All</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Filter…"
          style={{ width: '100%', fontSize: '0.75rem', padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: 4, fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: '#374151', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
        />
      )}
    </th>
  );
}

function AccountsSection() {
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [editId, setEditId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [engagementFilter, setEngagementFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/accounts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAccounts(data.accounts);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const stats = accounts ? {
    total: accounts.length,
    free: accounts.filter(a => accountType(a) === 'free').length,
    paid: accounts.filter(a => accountType(a) === 'paid').length,
    enterprise: accounts.filter(a => accountType(a) === 'enterprise').length,
  } : null;

  const anyFilterActive = engagementFilter || nameFilter || emailFilter || typeFilter || tierFilter || userTypeFilter || providerFilter || statusFilter;
  function clearFilters() {
    setEngagementFilter(''); setNameFilter(''); setEmailFilter('');
    setTypeFilter(''); setTierFilter(''); setUserTypeFilter(''); setProviderFilter(''); setStatusFilter('');
  }

  const filtered = (accounts || []).filter(acc => {
    const primaryUser = (acc.users || [])[0];
    if (engagementFilter) {
      const q = engagementFilter.toLowerCase();
      if (!(acc.engagementIds || []).some(e => e.toLowerCase().includes(q))) return false;
    }
    if (nameFilter && !(acc.name || '').toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (emailFilter && !(primaryUser?.email || '').toLowerCase().includes(emailFilter.toLowerCase())) return false;
    if (typeFilter && accountType(acc) !== typeFilter) return false;
    if (tierFilter && (acc.tier || 'basic') !== tierFilter) return false;
    if (userTypeFilter && (primaryUser?.role || 'owner') !== userTypeFilter) return false;
    if (providerFilter && (primaryUser?.provider || 'email') !== providerFilter) return false;
    if (statusFilter && (acc.status || 'active') !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total Accounts" value={stats.total} color="#059669" />
          <StatCard label="Free" value={stats.free} color="#64748B" />
          <StatCard label="Paid" value={stats.paid} color="#059669" />
          <StatCard label="Enterprise" value={stats.enterprise} color="#1E3A5F" />
        </div>
      )}
      <div style={s.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>Client Accounts</h2>
          <button style={s.btn} onClick={() => { setShowInvite(true); setActionMsg(''); }}>+ Invite New Account</button>
        </div>
        {actionMsg && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: '0.875rem', color: '#166534', marginBottom: 16 }}>{actionMsg}</div>}
        {showInvite && <InvitePanel onClose={() => setShowInvite(false)} onSuccess={msg => { setActionMsg(msg); setShowInvite(false); load(); }} />}
        {loading && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</p>}
        {error && <p style={s.error}>{error}</p>}
        {accounts && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 10, gap: 10 }}>
            {anyFilterActive && <button style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '4px 8px' }} onClick={clearFilters}>Clear filters</button>}
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{filtered.length} of {accounts.length}</span>
          </div>
        )}
        {accounts && accounts.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No accounts yet.</p>}
        {accounts && accounts.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <FilterTH label="Engagement" kind="text" value={engagementFilter} onChange={setEngagementFilter} width={130} />
                  <FilterTH label="Name" kind="text" value={nameFilter} onChange={setNameFilter} width={130} />
                  <FilterTH label="Email" kind="text" value={emailFilter} onChange={setEmailFilter} width={160} />
                  <FilterTH label="Type" kind="select" value={typeFilter} onChange={setTypeFilter} options={[{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid' }, { value: 'enterprise', label: 'Enterprise' }]} width={100} />
                  <FilterTH label="Tier" kind="select" value={tierFilter} onChange={setTierFilter} options={[{ value: 'basic', label: 'Basic' }, { value: 'premium', label: 'Premium' }]} width={100} />
                  <FilterTH label="User Type" kind="select" value={userTypeFilter} onChange={setUserTypeFilter} options={[{ value: 'owner', label: 'Owner' }, { value: 'member', label: 'Member' }]} width={100} />
                  <FilterTH label="Provider" kind="select" value={providerFilter} onChange={setProviderFilter} options={[{ value: 'email', label: 'Email' }, { value: 'google', label: 'Google' }]} width={100} />
                  <FilterTH label="Status" kind="select" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} width={100} />
                  <th style={s.th}>Last Login</th>
                  <th style={s.th}>Created</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.flatMap((acc, i) => {
                  const primaryUser = (acc.users || [])[0];
                  const provider = primaryUser?.provider || 'email';
                  const userType = primaryUser?.role || 'owner';
                  const lastLogin = primaryUser?.last_login_at ? new Date(primaryUser.last_login_at).toLocaleDateString() : 'Never';
                  const created = new Date(acc.created_at).toLocaleDateString();
                  const status = acc.status || 'active';
                  const type = accountType(acc);
                  const engagementLabel = (acc.engagementIds || []).join(', ') || '—';
                  const mainRow = (
                    <tr key={acc.id} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B' }}>{engagementLabel}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{acc.name}</td>
                      <td style={{ ...s.td, fontSize: '0.82rem' }}>{primaryUser?.email || '—'}</td>
                      <td style={s.td}><span style={accTypeBadge[type]}>{type}</span></td>
                      <td style={s.td}><span style={acc.tier === 'premium' ? s.badgePremium : s.badgeBasic}>{acc.tier || 'basic'}</span></td>
                      <td style={s.td}><span style={userType === 'owner' ? s.badgePremium : s.badgeBasic}>{userType}</span></td>
                      <td style={s.td}><span style={provider === 'google' ? s.badgeGoogle : s.badgeEmail}>{provider}</span></td>
                      <td style={s.td}><span style={status === 'active' ? s.badgeActive : s.badgeRevoked}>{status}</span></td>
                      <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B' }}>{lastLogin}</td>
                      <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B' }}>{created}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button style={s.actionBtn} onClick={() => setEditId(editId === acc.id ? null : acc.id)}>{editId === acc.id ? 'Close' : 'Edit'}</button>
                          {provider === 'email' ? <ResendInviteButton accountId={acc.id} /> : <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>—</span>}
                          <RevokeButton account={acc} onDone={() => { load(); setEditId(null); }} />
                          <DeleteButton account={acc} onDone={() => { setAccounts(prev => prev.filter(a => a.id !== acc.id)); setEditId(null); setActionMsg('Account deleted.'); }} />
                        </div>
                      </td>
                    </tr>
                  );
                  if (editId !== acc.id) return [mainRow];
                  return [mainRow, <tr key={`${acc.id}-edit`}><td colSpan={11} style={{ padding: 0 }}><EditPanel account={acc} onClose={() => setEditId(null)} onSave={() => { load(); setEditId(null); }} /></td></tr>];
                })}
                {filtered.length === 0 && <tr><td colSpan={11} style={{ ...s.td, color: '#94A3B8', textAlign: 'center', padding: '24px 12px' }}>No accounts match your filter.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cleanup Panel ────────────────────────────────────────────────────────────

function CleanupPanel() {
  const [mode, setMode] = useState('tokens'); // 'tokens' | 'engagement' | 'email'
  const [tokenInput, setTokenInput] = useState('');
  const [engagementId, setEngagementId] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function extractToken(raw) {
    const match = raw.match(/\/go\/([a-f0-9-]{36})/);
    return match ? match[1] : raw.trim();
  }

  async function handleCleanup() {
    setError(''); setResult(null);
    let body;
    if (mode === 'engagement') {
      if (!engagementId.trim()) return setError('Engagement ID is required');
      if (!confirm(`This will permanently delete ALL tokens and associated data for engagement "${engagementId.trim()}". Continue?`)) return;
      body = { engagement_id: engagementId.trim() };
    } else if (mode === 'email') {
      if (!emailInput.trim()) return setError('Email is required');
      if (!confirm(`This will permanently delete the portal account and user for "${emailInput.trim()}". Continue?`)) return;
      body = { email: emailInput.trim() };
    } else {
      const lines = tokenInput.split('\n').map(l => extractToken(l)).filter(Boolean);
      if (!lines.length) return setError('At least one token or URL is required');
      if (!confirm(`This will permanently delete ${lines.length} token(s) and all associated data. Continue?`)) return;
      body = { tokens: lines };
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cleanup failed');
      setResult(data.log);
      setTokenInput(''); setEngagementId('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const toggleStyle = active => ({
    padding: '6px 16px', border: 'none', borderRadius: 6, fontSize: '0.825rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    background: active ? '#0F172A' : 'transparent', color: active ? '#fff' : '#64748B',
  });

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Test Data Cleanup</h2>
      <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 20, marginTop: 0 }}>
        Permanently deletes tokens and all associated data — assessment responses, portal accounts, and licenses.
      </p>

      <div style={{ display: 'flex', gap: 0, background: '#F1F5F9', borderRadius: 8, padding: 3, marginBottom: 24, width: 'fit-content' }}>
        <button style={toggleStyle(mode === 'tokens')} onClick={() => { setMode('tokens'); setError(''); setResult(null); }}>By Token</button>
        <button style={toggleStyle(mode === 'engagement')} onClick={() => { setMode('engagement'); setError(''); setResult(null); }}>By Engagement ID</button>
        <button style={toggleStyle(mode === 'email')} onClick={() => { setMode('email'); setError(''); setResult(null); }}>By Email</button>
      </div>

      <div style={{ maxWidth: 520 }}>
        {mode === 'tokens' ? (
          <>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Tokens or URLs <span style={{ fontWeight: 400, color: '#94A3B8' }}>(one per line)</span>
            </label>
            <textarea
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
              rows={5}
              value={tokenInput}
              onChange={e => { setTokenInput(e.target.value); setError(''); setResult(null); }}
              placeholder={'Paste token UUIDs or full URLs, one per line:\nhttps://www.choosecurio.com/go/abc-123…\na3f7c2d1-88be-4e91-b012-7f3d9a1c05e4'}
            />
          </>
        ) : mode === 'engagement' ? (
          <>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Engagement ID
            </label>
            <input
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' }}
              value={engagementId}
              onChange={e => { setEngagementId(e.target.value); setError(''); setResult(null); }}
              placeholder="e.g. acme-q3-2024"
            />
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '6px 0 0' }}>Deletes every token under this engagement and all linked data.</p>
          </>
        ) : mode === 'email' ? (
          <>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email address
            </label>
            <input
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' }}
              type="email"
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setError(''); setResult(null); }}
              placeholder="user@example.com"
            />
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '6px 0 0' }}>Deletes the portal user and account (if no other users remain) for this email. Useful for cleaning up failed or duplicate invites.</p>
          </>
        ) : null}

        {error && <p style={{ color: '#DC2626', fontSize: '0.875rem', margin: '12px 0 0' }}>{error}</p>}

        {result && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
            <p style={{ fontWeight: 600, color: '#059669', margin: '0 0 6px', fontSize: '0.875rem' }}>✓ Cleanup complete</p>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.8rem', color: '#374151', lineHeight: 1.8 }}>
              {result.map((line, i) => <li key={i} style={{ fontFamily: line.startsWith('  ') ? 'monospace' : 'inherit' }}>{line}</li>)}
            </ul>
          </div>
        )}

        <button
          style={{ marginTop: 14, padding: '10px 20px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.7 : 1 }}
          onClick={handleCleanup}
          disabled={loading}
        >
          {loading ? 'Deleting…' : 'Delete Test Data'}
        </button>
      </div>
    </section>
  );
}

// ─── Link Assessment Panel ────────────────────────────────────────────────────

function LinkAssessmentPanel() {
  const [tokenInput, setTokenInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }

  function extractToken(raw) {
    const match = raw.match(/\/go\/([a-f0-9-]{36})/);
    return match ? match[1] : raw.trim();
  }

  async function handleLink() {
    setResult(null);
    const token = extractToken(tokenInput);
    const email = emailInput.trim().toLowerCase();
    if (!token || !email) return setResult({ ok: false, message: 'Both token and email are required.' });
    setLoading(true);
    try {
      const res = await fetch('/api/admin/link-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, message: data.message || data.error || 'Unknown error' });
      if (res.ok) { setTokenInput(''); setEmailInput(''); }
    } catch { setResult({ ok: false, message: 'Network error.' }); }
    finally { setLoading(false); }
  }

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Link Assessment to Account</h2>
      <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24, marginTop: 0 }}>
        Manually links a completed assessment token to an existing portal account. Use this when someone took the assessment before their account existed, or signed up without the token URL.
      </p>

      <div style={{ maxWidth: 520 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Assessment Token or URL
          </label>
          <input
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' }}
            value={tokenInput}
            onChange={e => { setTokenInput(e.target.value); setResult(null); }}
            placeholder="UUID or https://choosecurio.com/go/…"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Portal Account Email
          </label>
          <input
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' }}
            type="email"
            value={emailInput}
            onChange={e => { setEmailInput(e.target.value); setResult(null); }}
            placeholder="user@example.com"
          />
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '6px 0 0' }}>The email of the existing portal account to link the assessment to.</p>
        </div>

        {result && (
          <div style={{ background: result.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${result.ok ? '#BBF7D0' : '#FECACA'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: result.ok ? '#059669' : '#DC2626', fontWeight: 600 }}>
              {result.ok ? '✓ ' : '✗ '}{result.message}
            </p>
          </div>
        )}

        <button
          style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLink}
          disabled={loading}
        >
          {loading ? 'Linking…' : 'Link Assessment'}
        </button>
      </div>
    </section>
  );
}

// ─── Detection Feedback Panel ─────────────────────────────────────────────────
// The validation corpus for the Profile Detector (beta). The agreement rate
// here (leading hypothesis vs. labeled actual profile) is the number that
// eventually graduates the tool out of beta, not intuition.

function DetectionFeedbackPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/detection-feedback');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Detection Feedback</h2>
      <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: -16, marginBottom: 20 }}>
        Every row is a Profile Detector run someone labeled with the writer's actual profile. The agreement rate below (leading hypothesis vs. actual, where labeled) is what eventually graduates the tool out of beta.
      </p>

      {loading && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</p>}
      {error && <p style={s.error}>{error}</p>}

      {data && (
        <>
          <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 18px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Total runs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{data.total}</div>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 18px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Labeled</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{data.labeledCount}</div>
            </div>
            <div style={{ background: data.agreementRate == null ? '#F8FAFC' : '#F0FDF4', border: `1px solid ${data.agreementRate == null ? '#E2E8F0' : '#BBF7D0'}`, borderRadius: 8, padding: '12px 18px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Agreement rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: data.agreementRate == null ? '#0F172A' : '#059669' }}>
                {data.agreementRate == null ? 'Not enough labels yet' : `${Math.round(data.agreementRate * 100)}%`}
              </div>
            </div>
          </div>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>{['Date', 'Writer', 'Context', 'Leading hypothesis', 'Actual profile', 'Agrees?', 'Sample'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {data.rows.map((r, i) => {
                  const agrees = r.actual_profile ? r.leading_hypothesis === r.actual_profile : null;
                  return (
                    <tr key={r.id} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{new Date(r.created_at).toLocaleString()}</td>
                      <td style={s.td}>{r.own_writing ? 'Own writing' : "Colleague's"}</td>
                      <td style={s.td}>{r.context || '—'}</td>
                      <td style={s.td}>{r.leading_hypothesis ? <span style={profileBadgeStyle(r.leading_hypothesis)}>{r.leading_hypothesis}</span> : '—'}</td>
                      <td style={s.td}>{r.actual_profile ? <span style={profileBadgeStyle(r.actual_profile)}>{r.actual_profile}</span> : '—'}</td>
                      <td style={s.td}>{agrees == null ? '—' : agrees ? <span style={s.badgeUsed}>Agrees</span> : <span style={s.badgeRevoked}>Disagrees</span>}</td>
                      <td style={{ ...s.td, ...s.urlCell }}>{r.sample_text || (r.own_writing ? '—' : 'not stored')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

// ─── Mirror Tokens Panel ──────────────────────────────────────────────────────
// Create, label, and deactivate access to the hidden /mirror preview.
// mirror_tokens is a separate table from the assessment `tokens` table and
// has nothing to do with that flow.

function MirrorTokensPanel() {
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null);
  const [copied, setCopied] = useState(null);

  async function load() {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/mirror-tokens');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTokens(data.tokens);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function create() {
    if (!label.trim()) return setError('Label is required, e.g. "Kari pilot"');
    setError(''); setCreating(true); setJustCreated(null);
    try {
      const res = await fetch('/api/admin/mirror-tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: label.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setJustCreated(data.token);
      setLabel('');
      load();
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  }

  async function setActive(id, active) {
    setError('');
    try {
      const res = await fetch(`/api/admin/mirror-tokens/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTokens(prev => prev.map(t => t.id === id ? { ...t, active } : t));
    } catch (e) { setError(e.message); }
  }

  function mirrorUrl(token) { return `https://www.choosecurio.com/mirror?key=${token}`; }
  function copyUrl(token) {
    navigator.clipboard.writeText(mirrorUrl(token));
    setCopied(token); setTimeout(() => setCopied(null), 1500);
  }

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Mirror Tokens</h2>
      <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: -16, marginBottom: 20 }}>
        Issue one labeled link per tester (e.g. "Kari pilot"). Deactivating a token kills access on its next request, no matter how many times the link was shared.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={s.label}>Label</label>
          <input style={s.input} value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Kari pilot" onKeyDown={e => e.key === 'Enter' && !creating && create()} />
        </div>
        <button style={s.btn} onClick={create} disabled={creating}>{creating ? 'Creating…' : 'Create Token'}</button>
      </div>
      {error && <p style={s.error}>{error}</p>}

      {justCreated && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Link ready for "{justCreated.label}"</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ ...s.code, flex: 1, fontSize: '0.82rem', wordBreak: 'break-all' }}>{mirrorUrl(justCreated.token)}</code>
            <button style={s.copyBtn} onClick={() => copyUrl(justCreated.token)}>{copied === justCreated.token ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
      )}

      {loading && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading…</p>}

      {tokens && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>{['Label', 'Status', 'Created', 'Last used', 'Uses (total)', 'Today', 'Link', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {tokens.map((t, i) => (
                <tr key={t.id} style={i % 2 === 0 ? s.trEven : {}}>
                  <td style={s.td}>{t.label}</td>
                  <td style={s.td}>{t.active ? <span style={s.badgeUsed}>Active</span> : <span style={s.badgeRevoked}>Deactivated</span>}</td>
                  <td style={s.td}>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td style={s.td}>{t.last_used_at ? new Date(t.last_used_at).toLocaleString() : '—'}</td>
                  <td style={s.td}>{t.use_count}</td>
                  <td style={s.td}>{t.daily_count_date === new Date().toISOString().slice(0, 10) ? t.daily_count : 0}</td>
                  <td style={s.td}><button style={s.copyBtn} onClick={() => copyUrl(t.token)}>{copied === t.token ? 'Copied' : 'Copy link'}</button></td>
                  <td style={s.td}>
                    {t.active
                      ? <button style={s.sendProfileBtn} onClick={() => setActive(t.id, false)}>Deactivate</button>
                      : <button style={s.sendLinkBtn} onClick={() => setActive(t.id, true)}>Reactivate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Emails Panel ─────────────────────────────────────────────────────────────

const TRIGGER_OPTIONS_CLIENT = [
  { key: 'stripe_purchase',     label: 'Stripe purchase completed' },
  { key: 'assessment_complete', label: 'Assessment completed' },
  { key: 'account_created',     label: 'Account created / signup' },
  { key: 'renewal_complete',    label: 'Renewal payment completed' },
  { key: 'cron_30_day_expiry',  label: 'Cron — 30 days before expiry' },
  { key: 'cron_expiry_day',     label: 'Cron — expiry day' },
  { key: 'cron_daily',          label: 'Cron — daily (custom condition)' },
  { key: 'manual',              label: 'Manual only' },
];

function statusBadge(t) {
  if (t.is_custom) return { label: 'Custom', bg: '#EFF6FF', color: '#1D4ED8' };
  if (t.customized) return { label: 'Customized', bg: '#D1FAE5', color: '#065F46' };
  return { label: 'Default', bg: '#F1F5F9', color: '#64748B' };
}

// ── Email block editor helpers ────────────────────────────────────────────────

const BLOCKS_PREFIX = 'BLOCKS:';

function serializeBlocks(blocks) { return BLOCKS_PREFIX + JSON.stringify(blocks); }

function tryParseBlocks(value) {
  if (value && value.startsWith(BLOCKS_PREFIX)) {
    try { return JSON.parse(value.slice(BLOCKS_PREFIX.length)); } catch {}
  }
  return null;
}

const EMAIL_FOOTER_HTML = `<p style="margin:24px 0 0;color:#64748B;font-size:14px">Questions? Reply to this email or contact <a href="mailto:hello@choosecurio.com" style="color:#059669;text-decoration:none">hello@choosecurio.com</a>.</p>`;

function compileBlocksToBodyHtml(blocks) {
  return (blocks || []).map(b => {
    switch (b.type) {
      case 'paragraph':
        return `<p style="margin:0 0 16px;line-height:1.7;color:#0F172A;font-size:15px">${(b.content || '').replace(/\n/g, '<br>')}</p>`;
      case 'button':
        return `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px"><tr><td style="border-radius:8px;background:${b.color || '#059669'}"><a href="${b.url || '#'}" style="display:inline-block;padding:13px 28px;background:${b.color || '#059669'};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif">${b.text || 'Click Here'}</a></td></tr></table>`;
      case 'callout':
        return `<div style="background:${b.bg || '#F0FDF4'};border:1px solid ${b.border || '#BBF7D0'};border-radius:8px;padding:16px 20px;margin-bottom:24px">${b.title ? `<p style="margin:0 0 6px;font-weight:600;color:${b.textColor || '#065F46'};font-size:0.9rem">${b.title}</p>` : ''}<p style="margin:0;line-height:1.6;color:${b.textColor || '#065F46'};font-size:0.875rem">${b.content || ''}</p></div>`;
      case 'data_table':
        return `<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px">${(b.rows || []).map(r => `<tr><td style="padding:6px 0;color:#64748B;font-size:14px;width:140px">${r.label}</td><td style="padding:6px 0;color:#0F172A;font-size:14px;font-weight:600">${r.value}</td></tr>`).join('')}</table>`;
      case 'divider':
        return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0"/>`;
      case 'footer':
        return EMAIL_FOOTER_HTML;
      case 'html':
        return b.content || '';
      default:
        return '';
    }
  }).join('\n');
}

function wrapEmailHtml(bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#F8FAFC;font-family:Helvetica,Arial,sans-serif"><div style="max-width:560px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)"><div style="background:#0F172A;padding:24px 32px"><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px">Curio<span style="color:#059669">.</span></span></div><div style="background:#fff;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px">${bodyHtml}</div></div></body></html>`;
}

function getPreviewHtml(htmlBody) {
  const blocks = tryParseBlocks(htmlBody);
  if (blocks) return wrapEmailHtml(compileBlocksToBodyHtml(blocks));
  return htmlBody || '';
}

function defaultBlockData(type) {
  if (type === 'paragraph') return { type, content: 'Enter your text here.' };
  if (type === 'button') return { type, text: 'Click Here →', url: '', color: '#059669' };
  if (type === 'callout') return { type, title: '', content: 'Enter callout text here.', bg: '#F0FDF4', border: '#BBF7D0', textColor: '#065F46' };
  if (type === 'data_table') return { type, rows: [{ label: 'Label', value: '{{variable}}' }] };
  if (type === 'divider') return { type };
  if (type === 'footer') return { type };
  if (type === 'html') return { type, content: '' };
  return { type };
}

const BLOCK_TYPE_META = [
  { type: 'paragraph',  label: 'Paragraph',    icon: '¶' },
  { type: 'button',     label: 'Button',        icon: '⬭' },
  { type: 'callout',    label: 'Callout Box',   icon: '▣' },
  { type: 'data_table', label: 'Data Table',    icon: '⊞' },
  { type: 'divider',    label: 'Divider',       icon: '—' },
  { type: 'footer',     label: 'Footer',        icon: '≡' },
  { type: 'html',       label: 'Custom HTML',   icon: '</>' },
];

function BlockFields({ block, onChange, availableVars }) {
  const iStyle = { width: '100%', border: '1px solid #E2E8F0', borderRadius: 6, padding: '7px 10px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' };
  const lStyle = { fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: 4 };
  const varHint = availableVars && availableVars.length > 0 ? (
    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.5 }}>
      Available: {availableVars.map(v => `{{${v}}}`).join('  ')}
    </p>
  ) : null;

  switch (block.type) {
    case 'paragraph':
      return (
        <div>
          <textarea value={block.content || ''} onChange={e => onChange({ ...block, content: e.target.value })}
            style={{ ...iStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Paragraph text. Use {{variable}} for dynamic content." />
          {varHint}
        </div>
      );

    case 'button':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={lStyle}>Button text</label>
            <input value={block.text || ''} onChange={e => onChange({ ...block, text: e.target.value })} style={iStyle} placeholder="Click Here →" />
          </div>
          <div>
            <label style={lStyle}>URL or {'{{variable}}'}</label>
            <input value={block.url || ''} onChange={e => onChange({ ...block, url: e.target.value })} style={iStyle} placeholder="https://... or {{loginUrl}}" />
          </div>
          <div>
            <label style={lStyle}>Color</label>
            <input type="color" value={block.color || '#059669'} onChange={e => onChange({ ...block, color: e.target.value })}
              style={{ width: 40, height: 36, border: '1px solid #E2E8F0', borderRadius: 6, padding: 2, cursor: 'pointer' }} />
          </div>
        </div>
      );

    case 'callout':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={lStyle}>Title (optional)</label>
            <input value={block.title || ''} onChange={e => onChange({ ...block, title: e.target.value })} style={iStyle} placeholder="Bold heading inside the callout box" />
          </div>
          <div>
            <label style={lStyle}>Body text</label>
            <textarea value={block.content || ''} onChange={e => onChange({ ...block, content: e.target.value })}
              style={{ ...iStyle, minHeight: 64, resize: 'vertical' }} placeholder="Callout body text" />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ ...lStyle, marginBottom: 0 }}>Background</label>
              <input type="color" value={block.bg || '#F0FDF4'} onChange={e => onChange({ ...block, bg: e.target.value })} style={{ width: 32, height: 28, border: '1px solid #E2E8F0', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ ...lStyle, marginBottom: 0 }}>Border</label>
              <input type="color" value={block.border || '#BBF7D0'} onChange={e => onChange({ ...block, border: e.target.value })} style={{ width: 32, height: 28, border: '1px solid #E2E8F0', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ ...lStyle, marginBottom: 0 }}>Text</label>
              <input type="color" value={block.textColor || '#065F46'} onChange={e => onChange({ ...block, textColor: e.target.value })} style={{ width: 32, height: 28, border: '1px solid #E2E8F0', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
            </div>
          </div>
          {varHint}
        </div>
      );

    case 'data_table':
      return (
        <div>
          {(block.rows || []).map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <input value={row.label} onChange={e => { const rows = [...block.rows]; rows[i] = { ...rows[i], label: e.target.value }; onChange({ ...block, rows }); }} style={iStyle} placeholder="Label (e.g. Name)" />
              <input value={row.value} onChange={e => { const rows = [...block.rows]; rows[i] = { ...rows[i], value: e.target.value }; onChange({ ...block, rows }); }} style={iStyle} placeholder="Value or {{variable}}" />
              <button onClick={() => onChange({ ...block, rows: block.rows.filter((_, j) => j !== i) })}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#64748B', fontSize: '0.85rem' }}>×</button>
            </div>
          ))}
          <button onClick={() => onChange({ ...block, rows: [...(block.rows || []), { label: '', value: '' }] })}
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', color: '#475569', marginTop: 4 }}>
            + Add Row
          </button>
          {varHint}
        </div>
      );

    case 'divider':
      return <div style={{ height: 1, background: '#E2E8F0', borderRadius: 1, margin: '4px 0' }} />;

    case 'footer':
      return <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>Questions? Reply to this email or contact hello@choosecurio.com.</p>;

    case 'html':
      return (
        <div>
          <textarea value={block.content || ''} onChange={e => onChange({ ...block, content: e.target.value })}
            style={{ ...iStyle, minHeight: 100, fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
            placeholder="Raw HTML — for advanced layouts not covered by other block types" />
          {varHint}
        </div>
      );

    default:
      return <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Unknown block type: {block.type}</div>;
  }
}

function BlockEditor({ value, onChange, availableVars, editorKey }) {
  const isBlocks = tryParseBlocks(value) !== null;
  const [mode, setMode] = useState(isBlocks ? 'visual' : 'html');
  const [blocks, setBlocks] = useState(() => tryParseBlocks(value) || [{ type: 'html', content: value || '' }]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  function updateBlocks(newBlocks) {
    setBlocks(newBlocks);
    onChange(serializeBlocks(newBlocks));
  }

  function switchToHtml() {
    const compiled = wrapEmailHtml(compileBlocksToBodyHtml(blocks));
    onChange(compiled);
    setMode('html');
  }

  function switchToVisual() {
    const parsed = tryParseBlocks(value);
    if (parsed) {
      setBlocks(parsed);
    } else {
      const newBlocks = [{ type: 'html', content: value || '' }];
      setBlocks(newBlocks);
      onChange(serializeBlocks(newBlocks));
    }
    setMode('visual');
  }

  const btnSm = { padding: '5px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: '#F8FAFC', color: '#475569' };
  const moveBtn = { ...btnSm, padding: '3px 8px', fontSize: '0.8rem' };

  if (mode === 'html') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>HTML Body</label>
          <button style={btnSm} onClick={switchToVisual}>← Visual Editor</button>
        </div>
        <textarea value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', minHeight: 340, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box' }} />
        {availableVars && availableVars.length > 0 && (
          <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94A3B8' }}>Available variables: {availableVars.map(v => `{{${v}}}`).join('  ')}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Content</label>
        <button style={btnSm} onClick={switchToHtml}>Edit HTML</button>
      </div>

      {blocks.length === 0 && (
        <div style={{ border: '2px dashed #E2E8F0', borderRadius: 8, padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem', marginBottom: 12 }}>
          No blocks yet — add one below
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{ background: '#F8FAFC', padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {BLOCK_TYPE_META.find(bt => bt.type === block.type)?.icon} {BLOCK_TYPE_META.find(bt => bt.type === block.type)?.label || block.type}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button disabled={i === 0} onClick={() => { const n = [...blocks]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; updateBlocks(n); }} style={{ ...moveBtn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
              <button disabled={i === blocks.length - 1} onClick={() => { const n = [...blocks]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; updateBlocks(n); }} style={{ ...moveBtn, opacity: i === blocks.length - 1 ? 0.3 : 1 }}>↓</button>
              <button onClick={() => updateBlocks(blocks.filter((_, j) => j !== i))} style={{ ...moveBtn, color: '#DC2626', borderColor: '#FEE2E2' }}>✕</button>
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <BlockFields block={block} onChange={newBlock => { const n = [...blocks]; n[i] = newBlock; updateBlocks(n); }} availableVars={availableVars} />
          </div>
        </div>
      ))}

      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowAddMenu(v => !v)}
          style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 8, padding: '8px 18px', fontSize: '0.85rem', cursor: 'pointer', color: '#475569', fontFamily: "'DM Sans', sans-serif", width: '100%' }}>
          + Add Block
        </button>
        {showAddMenu && (
          <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 200, padding: 8, marginBottom: 4 }}
            onClick={() => setShowAddMenu(false)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {BLOCK_TYPE_META.map(bt => (
                <button key={bt.type} onClick={() => updateBlocks([...blocks, defaultBlockData(bt.type)])}
                  style={{ textAlign: 'left', padding: '8px 12px', background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', fontSize: '0.83rem', color: '#0F172A', fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ marginRight: 6 }}>{bt.icon}</span>{bt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.85rem' }}>
      <span style={{ color: '#94A3B8', minWidth: 90 }}>{label}</span>
      <span style={{ color: '#0F172A', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EmailsPanel() {
  const [templates, setTemplates] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'edit' | 'new' | 'send'
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendMsg, setSendMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [previewTpl, setPreviewTpl] = useState(null); // template to show in preview modal
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [triggerVars, setTriggerVars] = useState({});

  // New email form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newSendType, setNewSendType] = useState('manual');
  const [newTrigger, setNewTrigger] = useState('manual');
  const [newSchedule, setNewSchedule] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSaving, setNewSaving] = useState(false);
  const [newMsg, setNewMsg] = useState('');

  function reload() {
    fetch('/api/admin/email-templates').then(r => r.json()).then(d => {
      setTemplates(d.templates || []);
      if (d.triggerVariables) setTriggerVars(d.triggerVariables);
    });
  }
  useEffect(reload, []);

  async function openEdit(t) {
    setLoadingEdit(true);
    setSaveMsg(''); setTestMsg(''); setTestTo('');
    try {
      const res = await fetch(`/api/admin/email-templates/${t.key}`);
      const d = await res.json();
      setEditing({ ...t, ...d, subject: d.subject || '', html_body: d.html_body || '' });
    } catch (_) {
      setEditing({ ...t, subject: t.subject || '', html_body: t.html_body || '' });
    }
    setLoadingEdit(false);
    setView('edit');
  }
  function openSend(t) {
    setEditing(t); setSendTo(''); setSendMsg('');
    setView('send');
  }
  function back() { setView('list'); setEditing(null); setSaveMsg(''); setTestMsg(''); setSendMsg(''); }

  async function saveTemplate() {
    setSaving(true); setSaveMsg('');
    try {
      const body = {
        subject: editing.subject, html_body: editing.html_body,
        name: editing.name, description: editing.description,
        recipient: editing.recipient, trigger: editing.trigger,
        schedule: editing.schedule, send_type: editing.send_type,
      };
      const res = await fetch(`/api/admin/email-templates/${editing.key}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSaveMsg('Saved ✓');
      reload();
    } catch (e) { setSaveMsg(`Error: ${e.message}`); }
    finally { setSaving(false); }
  }

  async function sendTest() {
    if (!testTo) return;
    setTestMsg('Sending…');
    try {
      const res = await fetch(`/api/admin/email-templates/${editing.key}/test`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: testTo }),
      });
      const d = await res.json();
      setTestMsg(res.ok ? 'Sent ✓' : `Error: ${d.error}`);
    } catch (e) { setTestMsg(`Error: ${e.message}`); }
  }

  async function manualSend() {
    if (!sendTo) return;
    setSending(true); setSendMsg('');
    try {
      const res = await fetch(`/api/admin/email-templates/${editing.key}/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendTo.split(',').map(s => s.trim()).filter(Boolean) }),
      });
      const d = await res.json();
      setSendMsg(res.ok ? `Sent to ${d.sent_to.join(', ')} ✓` : `Error: ${d.error}`);
    } catch (e) { setSendMsg(`Error: ${e.message}`); }
    finally { setSending(false); }
  }

  async function createEmail() {
    if (!newName || !newSubject || !newBody) { setNewMsg('Name, subject, and body are required.'); return; }
    setNewSaving(true); setNewMsg('');
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName, description: newDesc, recipient: newRecipient,
          send_type: newSendType, trigger: newTrigger,
          schedule: newSchedule || (newSendType === 'manual' ? 'Manual' : ''),
          subject: newSubject, html_body: newBody,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setNewMsg('Created ✓');
      reload();
      setTimeout(() => { setView('list'); setNewName(''); setNewDesc(''); setNewRecipient(''); setNewSendType('manual'); setNewTrigger('manual'); setNewSchedule(''); setNewSubject(''); setNewBody(''); setNewMsg(''); }, 800);
    } catch (e) { setNewMsg(`Error: ${e.message}`); }
    finally { setNewSaving(false); }
  }

  const pillStyle = active => ({ padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: active ? 600 : 500, cursor: 'pointer', background: active ? '#0F172A' : '#F1F5F9', color: active ? '#fff' : '#64748B' });

  // ── Edit view ──────────────────────────────────────────────────────────────
  if (view === 'edit' && editing) return (
    <section style={s.panel}>
      {previewTpl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewTpl(null)}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90vw', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{previewTpl.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>Subject: {previewTpl.subject || '(no subject)'}</div>
              </div>
              <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B', lineHeight: 1 }} onClick={() => setPreviewTpl(null)}>✕</button>
            </div>
            <iframe srcDoc={getPreviewHtml(previewTpl.html_body) || '<p style="padding:24px;color:#94A3B8;font-family:sans-serif">No HTML body saved yet.</p>'} style={{ flex: 1, border: 'none', minHeight: 480 }} title="Email preview" sandbox="allow-same-origin" />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} onClick={back}>← Back</button>
        <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>{editing.name}</h2>
        {(() => { const b = statusBadge(editing); return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: b.bg, color: b.color }}>{b.label}</span>; })()}
      </div>

      {/* Editable metadata for all templates */}
      {(() => {
        const vars = triggerVars[editing.trigger] || [];
        const varHint = vars.length ? <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Available: {vars.map(v => `{{${v}}}`).join(', ')}</p> : null;
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={s.fieldGroup}><label style={s.label}>Name</label><input style={s.input} value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Recipient</label>
                <input style={s.input} value={editing.recipient || ''} onChange={e => setEditing(p => ({ ...p, recipient: e.target.value }))} placeholder="email address or {{variable}}" />
                {varHint}
              </div>
            </div>
          </>
        );
      })()}
      <div style={s.fieldGroup}><label style={s.label}>Description</label><input style={s.input} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Send type</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['manual','automated'].map(v => <button key={v} type="button" style={pillStyle(editing.send_type === v)} onClick={() => setEditing(p => ({ ...p, send_type: v }))}>{v === 'manual' ? 'Manual' : 'Automated'}</button>)}
          </div>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Trigger</label>
          <select style={s.select} value={editing.trigger || 'manual'} onChange={e => setEditing(p => ({ ...p, trigger: e.target.value, trigger_label: TRIGGER_OPTIONS_CLIENT.find(t => t.key === e.target.value)?.label || e.target.value }))}>
            {TRIGGER_OPTIONS_CLIENT.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div style={s.fieldGroup}><label style={s.label}>Schedule / timing</label><input style={s.input} value={editing.schedule || ''} onChange={e => setEditing(p => ({ ...p, schedule: e.target.value }))} placeholder="e.g. Immediate" /></div>
      </div>

      <div style={s.fieldGroup}><label style={s.label}>Subject</label><input style={s.input} value={editing.subject} onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))} /></div>
      <div style={s.fieldGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span />
          <button type="button" style={{ padding: '4px 12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} onClick={() => setPreviewTpl({ ...editing })}>Preview</button>
        </div>
        <BlockEditor
          key={editing.key}
          value={editing.html_body || ''}
          onChange={v => setEditing(p => ({ ...p, html_body: v }))}
          availableVars={triggerVars[editing.trigger] || []}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
        <button style={s.btn} onClick={saveTemplate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        {saveMsg && <span style={{ fontSize: '0.85rem', color: saveMsg.startsWith('Error') ? '#DC2626' : '#059669' }}>{saveMsg}</span>}
      </div>

      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ ...s.label, marginBottom: 8 }}>Send Test Email <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>(uses saved body, adds [TEST] prefix)</span></p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input style={{ ...s.input, maxWidth: 260, margin: 0 }} type="email" placeholder="test@example.com" value={testTo} onChange={e => setTestTo(e.target.value)} />
            <button style={{ ...s.btn, padding: '8px 16px' }} onClick={sendTest}>Send Test</button>
            {testMsg && <span style={{ fontSize: '0.85rem', color: testMsg.startsWith('Error') ? '#DC2626' : '#059669' }}>{testMsg}</span>}
          </div>
        </div>
        {editing.send_type === 'manual' && (
          <div>
            <p style={{ ...s.label, marginBottom: 8 }}>Send Now <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>(comma-separated addresses)</span></p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input style={{ ...s.input, maxWidth: 360, margin: 0 }} type="text" placeholder="alice@co.com, bob@co.com" value={sendTo} onChange={e => setSendTo(e.target.value)} />
              <button style={{ ...s.btn, padding: '8px 16px', background: '#1D4ED8' }} onClick={manualSend} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
              {sendMsg && <span style={{ fontSize: '0.85rem', color: sendMsg.startsWith('Error') ? '#DC2626' : '#059669' }}>{sendMsg}</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // ── Send view (from list) ──────────────────────────────────────────────────
  if (view === 'send' && editing) return (
    <section style={s.panel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} onClick={back}>← Back</button>
        <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>Send — {editing.name}</h2>
      </div>
      <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: 20 }}>Enter recipient email addresses (comma-separated) and click Send. The saved template body will be used.</p>
      <div style={s.fieldGroup}><label style={s.label}>To (comma-separated)</label><input style={s.input} type="text" placeholder="alice@co.com, bob@co.com" value={sendTo} onChange={e => setSendTo(e.target.value)} /></div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{ ...s.btn, background: '#1D4ED8' }} onClick={manualSend} disabled={sending}>{sending ? 'Sending…' : 'Send Email'}</button>
        {sendMsg && <span style={{ fontSize: '0.85rem', color: sendMsg.startsWith('Error') ? '#DC2626' : '#059669' }}>{sendMsg}</span>}
      </div>
    </section>
  );

  // ── New email view ─────────────────────────────────────────────────────────
  if (view === 'new') return (
    <section style={s.panel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} onClick={() => setView('list')}>← Back</button>
        <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>New Email</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={s.fieldGroup}><label style={s.label}>Name *</label><input style={s.input} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Welcome Back Email" /></div>
        <div style={s.fieldGroup}><label style={s.label}>Recipient</label><input style={s.input} value={newRecipient} onChange={e => setNewRecipient(e.target.value)} placeholder="e.g. Account owner" /></div>
      </div>
      <div style={s.fieldGroup}><label style={s.label}>Description</label><input style={s.input} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What this email does and when it's used" /></div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Send type</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['manual','automated'].map(v => <button key={v} type="button" style={pillStyle(newSendType === v)} onClick={() => { setNewSendType(v); if (v === 'manual') setNewTrigger('manual'); }}>{v === 'manual' ? 'Manual' : 'Automated'}</button>)}
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>{newSendType === 'manual' ? 'You send this email yourself from the admin UI.' : 'Fires automatically when a trigger event occurs. Note: new event triggers beyond the list below require a one-time code addition.'}</p>
      </div>
      {newSendType === 'automated' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Trigger</label>
            <select style={s.select} value={newTrigger} onChange={e => setNewTrigger(e.target.value)}>
              {TRIGGER_OPTIONS_CLIENT.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
          <div style={s.fieldGroup}><label style={s.label}>Schedule / timing</label><input style={s.input} value={newSchedule} onChange={e => setNewSchedule(e.target.value)} placeholder="e.g. Immediate, Daily 12:00 UTC" /></div>
        </div>
      )}
      <div style={s.fieldGroup}><label style={s.label}>Subject *</label><input style={s.input} value={newSubject} onChange={e => setNewSubject(e.target.value)} /></div>
      <div style={s.fieldGroup}>
        <BlockEditor
          key={'new-' + newTrigger}
          value={newBody}
          onChange={v => setNewBody(v)}
          availableVars={triggerVars[newTrigger] || []}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={s.btn} onClick={createEmail} disabled={newSaving}>{newSaving ? 'Creating…' : 'Create Email'}</button>
        {newMsg && <span style={{ fontSize: '0.85rem', color: newMsg.startsWith('Error') ? '#DC2626' : '#059669' }}>{newMsg}</span>}
      </div>
    </section>
  );

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <section style={s.panel}>
      {previewTpl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewTpl(null)}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90vw', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{previewTpl.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>Subject: {previewTpl.subject || '(no subject)'}</div>
              </div>
              <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B', lineHeight: 1 }} onClick={() => setPreviewTpl(null)}>✕</button>
            </div>
            <iframe srcDoc={getPreviewHtml(previewTpl.html_body) || '<p style="padding:24px;color:#94A3B8;font-family:sans-serif">No HTML body saved yet.</p>'} style={{ flex: 1, border: 'none', minHeight: 480 }} title="Email preview" sandbox="allow-same-origin" />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ ...s.panelTitle, marginBottom: 4 }}>Emails</h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>All transactional emails. Edit content, view recipients and triggers, or send manual emails without leaving the admin.</p>
        </div>
        <button style={s.btn} onClick={() => setView('new')}>+ New Email</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Email', 'Recipient', 'Trigger', 'Schedule', 'Status', ''].map(h => (
                <th key={h} style={{ ...s.th, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templates.map(t => {
              const badge = statusBadge(t);
              return (
                <tr key={t.key} style={s.tr}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{t.name}</div>
                    {t.description && <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>{t.description}</div>}
                  </td>
                  <td style={{ ...s.td, fontSize: '0.82rem', color: '#475569', maxWidth: 160 }}>{t.recipient || '—'}</td>
                  <td style={{ ...s.td, fontSize: '0.82rem', color: '#475569', maxWidth: 180 }}>{t.trigger_label || '—'}</td>
                  <td style={{ ...s.td, fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap' }}>{t.schedule || '—'}</td>
                  <td style={s.td}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, background: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={s.sendLinkBtn} onClick={() => openEdit(t)} disabled={loadingEdit}>{loadingEdit ? '…' : 'Edit'}</button>
                      <button style={{ padding: '4px 10px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }} onClick={async () => { const res = await fetch(`/api/admin/email-templates/${t.key}`); const d = await res.json(); setPreviewTpl({ ...t, ...d }); }}>Preview</button>
                      {t.send_type === 'manual' && (t.subject || t.html_body) && (
                        <button style={{ ...s.sendProfileBtn, background: '#EFF6FF', color: '#1D4ED8' }} onClick={() => openSend(t)}>Send</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [active, setActive] = useState('tokens');
  const [engPrefill, setEngPrefill] = useState('');

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? setAuthed(true) : router.replace('/admin/login'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  function signOut() {
    fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'));
  }

  function handleGenerateMore(engId) {
    setEngPrefill(engId);
    setActive('tokens');
  }

  if (!authed) return null;

  return (
    <>
      <Head>
        <title>Admin — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
        <Sidebar active={active} onNav={setActive} onSignOut={signOut} />
        <main style={{ marginLeft: 220, flex: 1, background: '#F8FAFC', minHeight: '100vh', padding: '36px 32px' }}>
          {active === 'tokens' && (
            <>
              <GeneratePanel prefillEngId={engPrefill} />
              <div style={{ marginTop: 32 }}><StatusPanel /></div>
            </>
          )}
          {active === 'assessments' && <AssessmentsPanel />}
          {active === 'engagements' && <EngagementsPanel onGenerateMore={handleGenerateMore} />}
          {active === 'career' && <CareerReportsSection />}
          {active === 'accounts' && <AccountsSection />}
          {active === 'emails' && <EmailsPanel />}
          {active === 'detection-feedback' && <DetectionFeedbackPanel />}
          {active === 'mirror-tokens' && <MirrorTokensPanel />}
          {active === 'settings' && (
            <section style={s.panel}>
              <h2 style={s.panelTitle}>Settings</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No settings configured yet.</p>
            </section>
          )}
          {active === 'cleanup' && <CleanupPanel />}
          {active === 'link' && <LinkAssessmentPanel />}
        </main>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  panel: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  panelTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: 24, marginTop: 0 },
  fieldGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6, color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', background: '#fff', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', resize: 'vertical', boxSizing: 'border-box' },
  btn: { padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  btnSmall: { padding: '7px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', alignSelf: 'flex-end' },
  btnSecondary: { padding: '8px 16px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '8px 0 0' },
  code: { fontFamily: 'monospace', fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultsCount: { fontSize: '0.9rem', fontWeight: 500, color: '#059669' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  urlCell: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: { padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  summary: { fontSize: '0.95rem', marginBottom: 12, color: '#374151' },
  badgeUsed: { background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgePending: { background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeLinkSent: { background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeType: { background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' },
  badgePremium: { background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeBasic: { background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeEmail: { background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeGoogle: { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeActive: { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeRevoked: { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  sentBadge: { color: '#059669', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' },
  sendLinkBtn: { padding: '4px 10px', background: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendLinkBtnActive: { padding: '4px 10px', background: '#059669', color: '#fff', border: '1px solid #059669', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendProfileBtn: { padding: '4px 10px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendPanel: { padding: '20px 24px', background: '#F8FAFC', borderTop: '2px solid #059669' },
  sendPanelGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 12 },
  sendField: {},
  sendLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 },
  sendInput: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E2E8F0', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  sendTextarea: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E2E8F0', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 },
  sendActions: { display: 'flex', gap: 8, marginTop: 4 },
  actionBtn: { padding: '4px 10px', background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 },
  editPanel: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderTop: '3px solid #059669', padding: '20px 24px', marginBottom: 0 },
  fieldLabel: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' },
  fieldInput: { width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box', background: '#fff' },
};
