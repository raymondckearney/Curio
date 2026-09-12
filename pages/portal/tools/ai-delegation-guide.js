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

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const isIndividual = !!dash?.myAssessment;
  const profile = guide?.profiles.find(p => p.code === selectedCode) || guide?.profiles[0];
  const orientationColor = profile ? ORIENTATION_COLORS[profile.primary] : '#6EE7B7';

  return (
    <>
      <Head>
        <title>AI & Delegation Guide — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalSidebar me={me} onLogout={logout} active="ai-delegation-guide" licenses={dash?.licenses} isIndividual={isIndividual} isTeamAccount={!!dash?.isTeamAccount} />
        <main style={s.main}>
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
                                  <Link href={`/portal/library/${t.scaffold.slug}`} style={s.scaffoldLink}>
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
                            <Link href={`/portal/library/${u.slug}`} style={s.scaffoldLink}>{u.tool} — {u.name}</Link>
                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>{u.desc}</p>
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
  scaffoldLink: { color: '#059669', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' },
  universalRow: { padding: '10px 0', borderBottom: '1px solid #F1F5F9' },
};
