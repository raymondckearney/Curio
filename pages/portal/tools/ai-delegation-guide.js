import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalSidebar from '../../../components/PortalSidebar';

const ORIENTATION_COLORS = { WHY: '#6EE7B7', WHAT: '#93C5FD', HOW: '#FCD34D' };
const ROUTE_BADGE = {
  AI: { label: 'Utilize AI', background: '#D1FAE5', color: '#065F46' },
  DELEGATE: { label: 'Delegate', background: '#1E3A5F', color: '#fff' },
  COLLABORATE: { label: 'Collaborate', background: '#FEF3C7', color: '#92400E' },
};

export default function AiDelegationGuide() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [guide, setGuide] = useState(null);
  const [noAssessment, setNoAssessment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState('');
  const [universalOpen, setUniversalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState(null);
  const [classifyError, setClassifyError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/ai-delegation-guide').then(r => r.json().then(d => ({ ok: r.ok, d }))),
    ])
      .then(([meData, dashData, guideRes]) => {
        setMe(meData);
        setDash(dashData);
        if (!guideRes.ok) { setNoAssessment(true); return; }
        setGuide(guideRes.d);
        setSelectedCode(guideRes.d.myProfileCode);
      })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  async function classifyTask(e) {
    e.preventDefault();
    if (!taskInput.trim() || classifying) return;
    setClassifying(true);
    setClassifyError('');
    setClassifyResult(null);
    try {
      const res = await fetch('/api/portal/tertiary-task-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskDescription: taskInput.trim(), profileCode: selectedCode }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to classify task.');
      setClassifyResult(d);
    } catch (err) {
      setClassifyError(err.message);
    } finally {
      setClassifying(false);
    }
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const isIndividual = !!dash?.myAssessment;
  const profile = guide?.profiles.find(p => p.code === selectedCode) || guide?.profiles[0];
  const orientationColor = profile ? ORIENTATION_COLORS[profile.primary] : '#6EE7B7';
  // Server-side re-checks this on every classify call — this only controls
  // whether the module renders at all, matching the "absent entirely for
  // basic, not just disabled" requirement.
  const isPremium = !!dash?.tier && dash.tier !== 'basic';

  return (
    <>
      <Head>
        <title>AI & Delegation Guide — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalSidebar me={me} onLogout={logout} active="ai-delegation-guide" licenses={dash?.licenses} isIndividual={isIndividual} isTeamAccount={!!dash?.isTeamAccount} />
        <main className="portal-main" style={s.main}>
          {noAssessment || !profile ? (
            <div style={s.container}>
              <div style={s.emptyState}>Complete your MindPrint™ assessment to see your AI & Delegation Guide.</div>
            </div>
          ) : (
            <>
              <div style={{ ...s.headerBand }}>
                <div style={s.headerInner}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <span style={s.eyebrow}>MINDPRINT™ PROFILE</span>
                      <h1 style={{ ...s.profileCode, color: orientationColor }}>{profile.code}</h1>
                      <p style={s.tagline}>{profile.tagline}</p>
                    </div>
                    {guide.canSwitch && (
                      <div>
                        <label style={s.switcherLabel}>Viewing profile</label>
                        <select style={s.switcherSelect} value={selectedCode} onChange={e => setSelectedCode(e.target.value)}>
                          {guide.profiles.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={s.container}>
                <div style={s.contextRow}>
                  <div style={s.contextCard}>
                    <h2 style={s.contextTitle}>Tertiary drain, in practice</h2>
                    <p style={s.contextBody}>{profile.drainSummary}</p>
                  </div>
                  <div style={s.contextCard}>
                    <h2 style={s.contextTitle}>Partner need</h2>
                    <p style={s.contextBody}>{profile.partnerNote}</p>
                  </div>
                </div>

                <div style={s.panel}>
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>{['Task type', 'Best routed to', 'Why', 'Scaffold / support'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {profile.tasks.map((t, i) => {
                          const badge = ROUTE_BADGE[t.route];
                          return (
                            <tr key={i} style={i % 2 === 0 ? s.trEven : {}}>
                              <td style={{ ...s.td, fontWeight: 500 }}>{t.task}</td>
                              <td style={s.td}><span style={{ ...s.badge, background: badge.background, color: badge.color }}>{badge.label}</span></td>
                              <td style={{ ...s.td, color: '#64748B', fontSize: '0.85rem' }}>{t.why}</td>
                              <td style={s.td}>
                                {t.scaffold ? (
                                  <Link href={`/portal/library/${t.scaffold.slug}`} style={s.scaffoldBtn}>
                                    Tool {t.scaffold.number} — {t.scaffold.name}
                                  </Link>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {isPremium && (
                  <div style={{ ...s.panel, ...s.classifyPanel, marginTop: 20 }}>
                    <h2 style={s.contextTitle}>Classify a task of your own</h2>
                    <p style={{ ...s.contextBody, marginBottom: 16 }}>Describe a specific task you're facing. We'll tell you whether it's tertiary work for {profile.code}, and if so, how to route it.</p>
                    <form onSubmit={classifyTask}>
                      <textarea
                        value={taskInput}
                        onChange={e => setTaskInput(e.target.value)}
                        placeholder="e.g. I need to write detailed release notes summarizing our last three sprints"
                        maxLength={1000}
                        rows={3}
                        style={s.classifyInput}
                      />
                      <button type="submit" style={{ ...s.classifyBtn, opacity: classifying || !taskInput.trim() ? 0.6 : 1 }} disabled={classifying || !taskInput.trim()}>
                        {classifying ? 'Classifying…' : 'Classify Task'}
                      </button>
                    </form>
                    {classifyError && <p style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: 12 }}>{classifyError}</p>}
                    {classifyResult && (
                      <div style={s.classifyResult}>
                        {!classifyResult.appliesToTertiary ? (
                          <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>This doesn't look like {profile.code}'s tertiary zone. {classifyResult.rationale}</p>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                              <span style={{ ...s.badge, background: ROUTE_BADGE[classifyResult.route]?.background, color: ROUTE_BADGE[classifyResult.route]?.color }}>
                                {ROUTE_BADGE[classifyResult.route]?.label || classifyResult.route}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#374151', marginBottom: 10 }}>{classifyResult.rationale}</p>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>
                              {classifyResult.scaffold ? (
                                <Link href={`/portal/library/${classifyResult.scaffold.slug}`} style={s.scaffoldBtn}>
                                  Tool {classifyResult.scaffold.number} — {classifyResult.scaffold.name}
                                </Link>
                              ) : '—'}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ ...s.panel, marginTop: 20 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setUniversalOpen(o => !o)}
                  >
                    <h2 style={{ ...s.contextTitle, marginBottom: 0 }}>Universal Supports</h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', transform: universalOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
                  </div>
                  {universalOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                      {guide.universalSupports.map(u => (
                        <div key={u.tool} style={s.universalRow}>
                          <div>
                            <Link href={`/portal/library/${u.slug}`} style={s.scaffoldBtn}>{u.tool} — {u.name}</Link>
                            <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#64748B' }}>{u.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TODO: Collection E team tools — future team-tier feature. */}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { marginLeft: 220 },
  container: { maxWidth: 1000, margin: '0 auto', padding: '32px 24px' },
  emptyState: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '40px 24px', textAlign: 'center', color: '#64748B', fontSize: '0.95rem' },
  headerBand: { background: '#0F172A', padding: '44px 24px' },
  headerInner: { maxWidth: 1000, margin: '0 auto' },
  eyebrow: { display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: '#6EE7B7', marginBottom: 10 },
  profileCode: { fontFamily: "'Caveat', cursive", fontSize: '3rem', fontWeight: 700, lineHeight: 1, margin: '0 0 8px' },
  tagline: { fontSize: '1rem', color: '#CBD5E1', fontWeight: 500, margin: 0 },
  switcherLabel: { display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' },
  switcherSelect: { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" },
  contextRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  contextCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 20px' },
  contextTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: 8, marginTop: 0 },
  contextBody: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 },
  panel: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '12px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' },
  trEven: { background: '#FAFAFA' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' },
  scaffoldBtn: {
    display: 'inline-block',
    color: '#059669',
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    fontWeight: 600,
    fontSize: '0.8rem',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    whiteSpace: 'nowrap',
  },
  universalRow: { padding: '10px 0', borderBottom: '1px solid #F1F5F9' },
  classifyPanel: { background: '#ECFDF5', border: '1px solid #6EE7B7', boxShadow: '0 1px 8px rgba(5,150,105,0.12)' },
  classifyInput: { width: '100%', padding: '12px 14px', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', marginBottom: 12, color: '#0F172A', background: '#fff' },
  classifyBtn: { padding: '10px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  classifyResult: { marginTop: 18, padding: '16px 18px', background: '#fff', border: '1px solid #A7F3D0', borderRadius: 10 },
};
