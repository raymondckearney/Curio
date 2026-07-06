import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROFILES = ['WHY-WHAT','WHY-HOW','WHAT-WHY','WHAT-HOW','HOW-WHY','HOW-WHAT'];
const CAREER_LEVELS = ['Student','Early Career','Mid Career','Senior or Executive'];
const PRIMARY_COLOR = { WHY: '#059669', WHAT: '#2563EB', HOW: '#D97706' };
const LICENSE_TYPES = ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer'];
const TOOL_LABELS = { assessment_tokens: 'MindPrint™ Assessment', role_analyzer: 'Role Analyzer', career_guidance: 'Career Guidance', jd_analyzer: 'JD Analyzer' };
const ALL_TOOLS = ['assessment_tokens', 'role_analyzer', 'career_guidance', 'jd_analyzer'];

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
  ]},
  { section: 'SETTINGS', items: [
    { id: 'settings',     label: 'Settings' },
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
    return `Hi ${name},\n\nI'd like to invite you to use the Curio Career Guidance Tool — an AI-powered tool that generates a personalized report with best-fit roles, what will energize and challenge you, and strategies specific to how you think.\n\nYour personal link: ${tokenUrl}\n\nLooking forward to sharing the results with you.\n\nRay Kearney\nCurio`;
  }
  return `Hi ${name},\n\nI'd like to invite you to take the MindPrint™ Assessment — a short exercise that identifies how you're naturally wired to think through and solve problems.\n\nYour personal link: ${tokenUrl}\n\nThis link is unique to you and can only be used once. It will take approximately 10 minutes to complete.\n\nLooking forward to sharing the results with you.\n\nRay Kearney\nCurio`;
}

function SendLinkPanel({ token, participantName, participantEmail, tokenUrl, purpose, onClose, onSent }) {
  const isCareer = purpose === 'career';
  const [to, setTo] = useState(participantEmail || '');
  const [subject, setSubject] = useState(isCareer ? "Your Career Guidance Tool Invitation" : "You're invited to take the MindPrint™ Assessment");
  const [message, setMessage] = useState(buildDefaultMessage(participantName || 'there', tokenUrl, purpose));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!to.trim()) return setError('Recipient email is required');
    setSending(true); setError('');
    try {
      const res = await fetch('/api/email/send-token-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, to: to.trim(), subject, message, participantEmail }) });
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

function GeneratePanel({ prefillEngId }) {
  const [batchMode, setBatchMode] = useState('enterprise'); // 'individual' | 'enterprise'
  const [mode, setMode] = useState('named'); // 'named' | 'anonymous' (enterprise only)
  const [purpose, setPurpose] = useState('assessment');
  const [grantedTools, setGrantedTools] = useState(['assessment_tokens']);
  const [engagementId, setEngagementId] = useState(prefillEngId || '');
  const [expiresAt, setExpiresAt] = useState('');
  const [participantText, setParticipantText] = useState('');
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
      const res = await fetch('/api/tokens/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participants, purpose, granted_tools: grantedTools, engagement_id: autoEngId, expires_at: expiresAt || undefined }) });
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
      const res = await fetch('/api/tokens/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participants, purpose, granted_tools: grantedTools, engagement_id: engagementId.trim(), expires_at: expiresAt || undefined }) });
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
          <div style={s.fieldGroup}><label style={s.label}>Purpose</label><select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}><option value="assessment">Assessment</option><option value="fit">Role Analyzer</option><option value="jd">JD Analyzer</option><option value="career">Career Guidance</option></select></div>
          <ToolAccessField grantedTools={grantedTools} setGrantedTools={setGrantedTools} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={s.fieldGroup}><label style={s.label}>Name (optional)</label><input style={s.input} value={indivName} onChange={e => setIndivName(e.target.value)} placeholder="Alex Smith" /></div>
            <div style={s.fieldGroup}><label style={s.label}>Email (optional)</label><input style={s.input} type="email" value={indivEmail} onChange={e => setIndivEmail(e.target.value)} placeholder="alex@example.com" /></div>
          </div>
          <div style={s.fieldGroup}><label style={s.label}>Expiry Date (optional)</label><input style={{ ...s.input, maxWidth: 200 }} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></div>
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
          <div style={s.fieldGroup}><label style={s.label}>Purpose</label><select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}><option value="assessment">Assessment</option><option value="fit">Role Analyzer</option><option value="jd">JD Analyzer</option><option value="career">Career Guidance</option></select></div>
          <ToolAccessField grantedTools={grantedTools} setGrantedTools={setGrantedTools} />
          <div style={s.fieldGroup}><label style={s.label}>Engagement ID</label><input style={s.input} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2026-q1" /></div>
          <div style={s.fieldGroup}><label style={s.label}>Expiry Date (optional)</label><input style={s.input} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></div>
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

    const qualSystem = `You are a deterministic analyst for the MindPrint Framework. Given a cognitive profile and a role's demand split, produce a role alignment analysis.\n\nThe MindPrint Framework defines three cognitive orientations:\n- WHY Brain: Vision-oriented, purpose-driven, big-picture thinker, questions assumptions\n- WHAT Brain: Action-oriented, momentum-driven, milestone-focused, values progress\n- HOW Brain: Detail-oriented, process-focused, precision-driven, systematic\n\nRULES:\n1. Every item must be specific to this exact role and profile combination\n2. Ground every item in the demand split percentages\n3. Recommendations must be actionable and role-specific\n4. partnerTypes must complement the gaps this profile has in this role\n\nReturn ONLY valid JSON:\n{\n  "scoreRationale": "<exactly 2-3 sentences about fit>",\n  "enjoys": ["<role-specific>", "<role-specific>", "<role-specific>", "<role-specific>"],\n  "excels": ["<role-specific>", "<role-specific>", "<role-specific>", "<role-specific>"],\n  "dislikes": ["<role-specific>", "<role-specific>", "<role-specific>"],\n  "struggles": ["<role-specific>", "<role-specific>", "<role-specific>"],\n  "recommendations": [\n    { "category": "<Focus|Delegation|Workflow|Communication|Structure>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" }\n  ],\n  "partnerTypes": [\n    { "type": "<WHY-WHAT|WHY-HOW|WHAT-WHY|WHAT-HOW|HOW-WHY|HOW-WHAT>", "reason": "<1 sentence>" },\n    { "type": "<one of the above>", "reason": "<1 sentence>" }\n  ]\n}\nCounts: enjoys=4, excels=4, dislikes=3, struggles=3, recommendations=4, partnerTypes=2`;

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
        <button style={s.btn} onClick={load} disabled={loading}>{loading ? 'Loading…' : assessments ? 'Refresh' : 'Load'}</button>
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
                          {!profileType && '—'}
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
      const res = await fetch('/api/admin/accounts/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), tier, licenses }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess(`Account created and invite sent to ${email.trim()}`);
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

function AccountsSection() {
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [editId, setEditId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [accSearch, setAccSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

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

  const filtered = (accounts || []).filter(acc => {
    const q = accSearch.toLowerCase();
    if (q) {
      const name = (acc.name || '').toLowerCase();
      const email = ((acc.users || [])[0]?.email || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    if (typeFilter && accountType(acc) !== typeFilter) return false;
    if (tierFilter && (acc.tier || 'basic') !== tierFilter) return false;
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
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input style={{ ...s.input, maxWidth: 220 }} placeholder="Search name or email…" value={accSearch} onChange={e => setAccSearch(e.target.value)} />
            <select style={{ ...s.select, maxWidth: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select style={{ ...s.select, maxWidth: 140 }} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
              <option value="">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
            {(accSearch || typeFilter || tierFilter) && <button style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '4px 8px' }} onClick={() => { setAccSearch(''); setTypeFilter(''); setTierFilter(''); }}>Clear</button>}
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', marginLeft: 'auto' }}>{filtered.length} of {accounts.length}</span>
          </div>
        )}
        {accounts && accounts.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No accounts yet.</p>}
        {accounts && accounts.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>{['Name','Email','Type','Tier','Provider','Status','Last Login','Created','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.flatMap((acc, i) => {
                  const primaryUser = (acc.users || [])[0];
                  const provider = primaryUser?.provider || 'email';
                  const lastLogin = primaryUser?.last_login_at ? new Date(primaryUser.last_login_at).toLocaleDateString() : 'Never';
                  const created = new Date(acc.created_at).toLocaleDateString();
                  const status = acc.status || 'active';
                  const type = accountType(acc);
                  const mainRow = (
                    <tr key={acc.id} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{acc.name}</td>
                      <td style={{ ...s.td, fontSize: '0.82rem' }}>{primaryUser?.email || '—'}</td>
                      <td style={s.td}><span style={accTypeBadge[type]}>{type}</span></td>
                      <td style={s.td}><span style={acc.tier === 'premium' ? s.badgePremium : s.badgeBasic}>{acc.tier || 'basic'}</span></td>
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
                  return [mainRow, <tr key={`${acc.id}-edit`}><td colSpan={9} style={{ padding: 0 }}><EditPanel account={acc} onClose={() => setEditId(null)} onSave={() => { load(); setEditId(null); }} /></td></tr>];
                })}
                {filtered.length === 0 && <tr><td colSpan={9} style={{ ...s.td, color: '#94A3B8', textAlign: 'center', padding: '24px 12px' }}>No accounts match your filter.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
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
          {active === 'settings' && (
            <section style={s.panel}>
              <h2 style={s.panelTitle}>Settings</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No settings configured yet.</p>
            </section>
          )}
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
