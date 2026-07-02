import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PROFILES = ['WHY-WHAT','WHY-HOW','WHAT-WHY','WHAT-HOW','HOW-WHY','HOW-WHAT'];
const CAREER_LEVELS = ['Student','Early Career','Mid Career','Senior or Executive'];
const PRIMARY_COLOR = { WHY: '#059669', WHAT: '#2563EB', HOW: '#D97706' };

function profileColor(id) { return PRIMARY_COLOR[id?.split('-')[0]] || '#64748B'; }

// ─── Inline report output (read-only, no PDF/reset buttons) ──────────────────

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
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={sLabel(color)}>Why This Role Is a Strong Match</div>
            {role.fit.split('\n\n').map((p, i) => (
              <p key={i} style={{ fontSize: '0.93rem', color: '#374151', lineHeight: 1.8, marginBottom: 14 }}>{p}</p>
            ))}
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

function sLabel(color) {
  return { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
}

const PROFILES_DEF = [
  { id: 'WHY-WHAT', tagline: 'Purpose-Driven, Progress-Oriented' },
  { id: 'WHY-HOW',  tagline: 'Purpose-Driven, Precision-Oriented' },
  { id: 'WHAT-WHY', tagline: 'Progress-Driven, Purpose-Oriented' },
  { id: 'WHAT-HOW', tagline: 'Progress-Driven, Precision-Oriented' },
  { id: 'HOW-WHY',  tagline: 'Precision-Driven, Purpose-Oriented' },
  { id: 'HOW-WHAT', tagline: 'Precision-Driven, Progress-Oriented' },
];

function ReportView({ row, onBack }) {
  const { report_data: report, profile, career_level, role_orientation, industry, risk_environment } = row;
  const color = profileColor(profile);
  const profileDef = PROFILES_DEF.find(p => p.id === profile);
  const { alignmentLabel, alignmentPercent, alignmentSentence, energizers, watchFors, roles, environmentNote, nextSteps } = report;
  const inputs = { careerLevel: career_level, roleOrientation: role_orientation, industry, riskEnvironment: risk_environment };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(24px,5vw,72px) 80px' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', color: '#64748B', marginBottom: 32 }}>
        ← Back to Reports
      </button>

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
          {roles.length} roles identified
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: color }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color }}>Role Deep-Dives</div>
        </div>
        {roles.map((role, i) => (
          <RoleCard key={i} role={role} idx={i} color={color} defaultOpen={i === 0} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '28px 28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16 }}>A Note on Environment</div>
          {environmentNote.split('\n\n').map((p, i) => (
            <p key={i} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, marginBottom: 14 }}>{p}</p>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '28px 28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color, marginBottom: 16 }}>What To Do Next</div>
          {nextSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ color, fontWeight: 700, fontSize: '1rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Send Report Panel ────────────────────────────────────────────────────────

function SendCareerReportPanel({ row, onClose, onSent }) {
  const color = profileColor(row.profile);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(`Your Career Guidance Report — ${row.profile}`);
  const [body, setBody] = useState(
    `Hi there,\n\nYour MindPrint™ Career Guidance Report is ready. Based on your ${row.profile} profile and your background as ${row.career_level} — ${row.role_orientation}, we've identified the roles most likely to energize you and where you'll naturally excel.\n\nPlease find your personalized report below.\n\nCurio`
  );
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  async function send() {
    if (!email) { setErr('Recipient email is required'); return; }
    setSending(true); setErr('');
    try {
      const res = await fetch('/api/email/send-career-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_name: name || undefined, participant_email: email, report_row: row, email_subject: subject, email_body: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      onSent(row.id);
    } catch (e) {
      setErr(e.message);
      setSending(false);
    }
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
            <div>
              <label style={sField}>Recipient Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={sInput} />
            </div>
            <div>
              <label style={sField}>Recipient Email <span style={{ color: '#EF4444' }}>*</span></label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" style={sInput} />
            </div>
          </div>
          <div>
            <label style={sField}>Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} style={sInput} />
          </div>
          <div>
            <label style={sField}>Message Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} style={{ ...sInput, resize: 'vertical', lineHeight: 1.7 }} />
          </div>
        </div>

        {err && <div style={{ marginTop: 12, fontSize: '0.82rem', color: '#EF4444' }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#64748B', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={send} disabled={sending} style={{ padding: '9px 20px', background: color, border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
            {sending ? 'Sending…' : 'Send Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

const sField = { fontSize: '0.72rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
const sInput = { width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' };

// ─── Reports list ─────────────────────────────────────────────────────────────

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

  const filtered = reports.filter(r =>
    (!filterProfile || r.profile === filterProfile) &&
    (!filterLevel || r.career_level === filterLevel)
  );

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <select
          value={filterProfile}
          onChange={e => setFilterProfile(e.target.value)}
          style={s.select}
        >
          <option value="">All Profiles</option>
          {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          style={s.select}
        >
          <option value="">All Levels</option>
          {CAREER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {(filterProfile || filterLevel) && (
          <button onClick={() => { setFilterProfile(''); setFilterLevel(''); }} style={s.clearBtn}>
            Clear filters
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#94A3B8', alignSelf: 'center' }}>
          {filtered.length} {filtered.length === 1 ? 'report' : 'reports'}
        </div>
      </div>

      {loading && <div style={s.empty}>Loading…</div>}
      {error && <div style={{ ...s.empty, color: '#EF4444' }}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div style={s.empty}>No reports found.</div>
      )}

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
                  {sentIds.has(row.id) ? (
                    <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, padding: '8px 4px' }}>✓ Sent</span>
                  ) : (
                    <button onClick={() => setSendPanel(row)} style={{ ...s.viewBtn, background: '#F1F5F9', color: '#374151' }}>
                      Send ✉
                    </button>
                  )}
                  <button onClick={() => onView(row)} style={s.viewBtn}>
                    View →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sendPanel && (
        <SendCareerReportPanel
          row={sendPanel}
          onClose={() => setSendPanel(null)}
          onSent={id => { setSentIds(prev => new Set([...prev, id])); setSendPanel(null); }}
        />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCareerReports() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? setAuthed(true) : router.replace('/admin/login'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!authed) return null;

  return (
    <>
      <Head>
        <title>Career Reports — Curio Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <span style={s.logo}>Curio<span style={s.dot}>.</span></span>
          <span style={s.headerTitle}>Admin</span>
          <button style={s.signOut} onClick={() => fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'))}>Sign out</button>
        </header>

        <div style={s.tabBar}>
          {[
            { label: 'Tokens', href: '/admin/tokens' },
            { label: 'Career Reports', href: '/admin/career-reports' },
            { label: 'Accounts', href: '/admin/accounts' },
          ].map(tab => (
            <button
              key={tab.label}
              style={tab.href === '/admin/career-reports' ? { ...s.tab, ...s.tabActive } : s.tab}
              onClick={() => router.push(tab.href)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main style={s.main}>
          {viewing ? (
            <ReportView row={viewing} onBack={() => setViewing(null)} />
          ) : (
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(24px,5vw,72px) 80px' }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Career Reports</h1>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>All generated career guidance reports, newest first.</p>
              </div>
              <ReportsList onView={setViewing} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" },
  header: { background: '#0F172A', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  dot: { color: '#059669' },
  headerTitle: { fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 4 },
  signOut: { marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tabBar: { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 28px', display: 'flex', gap: 4 },
  tab: { padding: '14px 18px', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#64748B', fontFamily: "'DM Sans', sans-serif", marginBottom: -1 },
  tabActive: { color: '#0F172A', borderBottomColor: '#059669' },
  main: { padding: '40px 0' },
  select: { padding: '8px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', color: '#374151', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  clearBtn: { padding: '8px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', color: '#64748B', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  viewBtn: { padding: '8px 16px', background: '#0F172A', border: 'none', borderRadius: 7, color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  empty: { textAlign: 'center', padding: '60px 0', color: '#94A3B8', fontSize: '0.9rem' },
};
