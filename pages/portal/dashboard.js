import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PortalDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
    ])
      .then(([meData, dashData]) => { setMe(meData); setData(dashData); })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  return data?.isSelfServe
    ? <SelfServeDashboard me={me} data={data} onLogout={logout} />
    : <EnterpriseDashboard me={me} data={data} onLogout={logout} />;
}

// ── Self-serve view ────────────────────────────────────────────────────────────

const PROFILE_COLORS = {
  'why-what': '#059669', 'why-how': '#0891B2', 'what-why': '#7C3AED',
  'what-how': '#2563EB', 'how-why': '#D97706', 'how-what': '#DC2626',
};

function ProfileBrain({ type }) {
  const color = PROFILE_COLORS[type?.toLowerCase()] || '#64748B';
  const [primary, secondary] = (type || '').split('-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${color}18`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>{primary}</span>
        {secondary && <span style={{ fontSize: '0.65rem', color, fontWeight: 600, opacity: 0.7 }}>+ {secondary}</span>}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max = 100 }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{score}</span>
      </div>
      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#059669', borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function SelfServeDashboard({ me, data, onLogout }) {
  const firstName = me.user.name?.split(' ')[0] || '';
  const assessment = data?.myAssessment;
  const hasAnalyzer = data?.hasFitToken;
  const type = assessment?.type;
  const color = PROFILE_COLORS[type?.toLowerCase()] || '#64748B';

  return (
    <>
      <Head>
        <title>My Profile — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={onLogout} active="dashboard" isSelfServe hasFitToken={hasAnalyzer} />
        <main style={s.selfMain}>

          {assessment ? (
            <>
              <div style={s.selfHero}>
                <p style={s.selfGreeting}>Welcome back{firstName ? `, ${firstName}` : ''}</p>
                <h1 style={s.selfTitle}>Your MindPrint™ Profile</h1>
              </div>

              <div style={s.profileCard}>
                <div style={s.profileLeft}>
                  <ProfileBrain type={type} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, color, marginBottom: 2 }}>
                      {type?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>MindPrint™ Profile</div>
                  </div>
                </div>

                <div style={s.profileDivider} />

                <div style={s.profileRight}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 16 }}>Cognitive Score Breakdown</div>
                  {assessment.h_score != null && <ScoreBar label="HOW (Precision)" score={assessment.h_score} />}
                  {assessment.w_score != null && <ScoreBar label="WHAT (Progress)" score={assessment.w_score} />}
                  {assessment.y_score != null && <ScoreBar label="WHY (Purpose)" score={assessment.y_score} />}
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 8 }}>
                    Completed {assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>

              {hasAnalyzer && (
                <div style={s.analyzerCta}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#065F46', marginBottom: 4 }}>Role Alignment Analyzer</div>
                    <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: 1.6 }}>See how your MindPrint™ profile fits specific roles and what energizes or drains you.</div>
                  </div>
                  <Link href="/portal/tools/fit" style={s.analyzerBtn}>Open Analyzer →</Link>
                </div>
              )}
            </>
          ) : (
            <div style={s.selfHero}>
              <p style={s.selfGreeting}>Welcome{firstName ? `, ${firstName}` : ''}</p>
              <h1 style={s.selfTitle}>Your account is ready.</h1>
              <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
                Your assessment results will appear here once you've completed your MindPrint™ assessment. Check your email for your assessment link.
              </p>
              <p style={{ marginTop: 20, fontSize: '0.875rem', color: '#94A3B8' }}>
                Questions? <a href="mailto:hello@choosecurio.com" style={{ color: '#059669', textDecoration: 'none' }}>hello@choosecurio.com</a>
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── Enterprise view ────────────────────────────────────────────────────────────

function EnterpriseDashboard({ me, data, onLogout }) {
  const licenses = data?.licenses || [];
  const hasRoleFit = licenses.some(l => l.type === 'role_analyzer' && (!l.expires_at || new Date(l.expires_at) > new Date()));
  const hasJD = licenses.some(l => l.type === 'jd_analyzer' && (!l.expires_at || new Date(l.expires_at) > new Date()));
  const tokenLicense = licenses.find(l => l.type === 'assessment_tokens');
  const { total = 0, used = 0, available = 0 } = data?.tokenStats || {};

  return (
    <>
      <Head>
        <title>Dashboard — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={onLogout} active="dashboard" />
        <main style={s.main}>
          <div style={s.welcome}>
            <h1 style={s.welcomeTitle}>Welcome back{me.user.name ? `, ${me.user.name.split(' ')[0]}` : ''}</h1>
            <p style={s.welcomeSub}>{me.account.name}</p>
          </div>

          {tokenLicense && (
            <div style={s.statsRow}>
              <StatCard label="Assessment Tokens" value={total} sub="total purchased" color="#059669" />
              <StatCard label="Completed" value={used} sub="assessments taken" color="#3B82F6" />
              <StatCard label="Available" value={available} sub="tokens remaining" color="#D97706" />
            </div>
          )}

          {(hasRoleFit || hasJD) && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Your Tools</h2>
              <div style={s.toolGrid}>
                {hasRoleFit && (
                  <Link href="/portal/tools/fit" style={s.toolCard}>
                    <div style={s.toolIcon}>◈</div>
                    <div style={s.toolName}>Role Fit Analyzer</div>
                    <div style={s.toolDesc}>Analyze how a cognitive profile aligns with a specific role.</div>
                    <div style={s.toolArrow}>→</div>
                  </Link>
                )}
                {hasJD && (
                  <Link href="/portal/tools/jd" style={s.toolCard}>
                    <div style={s.toolIcon}>◉</div>
                    <div style={s.toolName}>JD Analyzer</div>
                    <div style={s.toolDesc}>Analyze a job description and find the best-fit profiles.</div>
                    <div style={s.toolArrow}>→</div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {data?.recentAssessments?.length > 0 && (
            <div style={s.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>Recent Assessments</h2>
                <Link href="/portal/results" style={s.viewAll}>View all →</Link>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Name', 'Email', 'Profile', 'Date'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.recentAssessments.map((a, i) => (
                      <tr key={a.id || i} style={i % 2 === 0 ? s.trEven : {}}>
                        <td style={s.td}>{a.name || '—'}</td>
                        <td style={s.td}>{a.email || '—'}</td>
                        <td style={s.td}>{a.type ? <span style={s.badge}>{a.type.toUpperCase()}</span> : '—'}</td>
                        <td style={s.td}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!tokenLicense && !hasRoleFit && !hasJD && (
            <div style={s.emptyState}>
              <p>No active licenses yet. Contact your Curio account manager to get started.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderTop: `3px solid ${color}`, borderRadius: 10, padding: '20px 24px', flex: 1 }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, fontFamily: "'Caveat', cursive", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ── Shared nav ────────────────────────────────────────────────────────────────

export function PortalNav({ me, onLogout, active, isSelfServe = false, hasFitToken = false }) {
  const navLinks = isSelfServe
    ? [
        { href: '/portal/dashboard', label: 'My Profile', key: 'dashboard' },
        ...(hasFitToken ? [{ href: '/portal/tools/fit', label: 'Role Analyzer', key: 'fit' }] : []),
        { href: '/portal/analyzer-history', label: 'Analyzer History', key: 'analyzer-history' },
      ]
    : [
        { href: '/portal/dashboard', label: 'Dashboard', key: 'dashboard' },
        { href: '/portal/tokens', label: 'Tokens', key: 'tokens' },
        { href: '/portal/results', label: 'Assessment Results', key: 'results' },
        { href: '/portal/analyzer-history', label: 'Analyzer History', key: 'analyzer-history' },
      ];

  return (
    <div>
      <header style={s.header}>
        <span style={s.logo}>Curio<span style={s.dot}>.</span></span>
        <span style={s.accountName}>{me?.account?.name}</span>
        <span style={s.userName}>{me?.user?.name || me?.user?.email}</span>
        <button style={s.signOut} onClick={onLogout}>Sign out</button>
      </header>
      <nav style={s.tabBar}>
        {navLinks.map(l => (
          <a key={l.key} href={l.href} style={active === l.key ? { ...s.tab, ...s.tabActive } : s.tab}>{l.label}</a>
        ))}
      </nav>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  header: { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.4rem', fontWeight: 700, color: '#0F172A' },
  dot: { color: '#059669' },
  accountName: { fontSize: '0.9rem', fontWeight: 600, color: '#374151', flex: 1 },
  userName: { fontSize: '0.875rem', color: '#64748B' },
  signOut: { background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 14px', fontSize: '0.825rem', cursor: 'pointer', color: '#64748B', fontFamily: "'DM Sans', sans-serif" },
  tabBar: { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 32px', display: 'flex', gap: 0 },
  tab: { padding: '12px 18px', textDecoration: 'none', display: 'inline-block', borderBottom: '2px solid transparent', fontSize: '0.875rem', fontWeight: 500, color: '#64748B', marginBottom: -1 },
  tabActive: { color: '#059669', borderBottom: '2px solid #059669', fontWeight: 600 },

  // Self-serve layout
  selfMain: { maxWidth: 720, margin: '0 auto', padding: '56px 24px', textAlign: 'center' },
  selfHero: { marginBottom: 40 },
  selfGreeting: { fontSize: '0.95rem', color: '#64748B', marginBottom: 8, fontWeight: 500 },
  selfTitle: { fontFamily: "'Caveat', cursive", fontSize: '2.4rem', fontWeight: 700, color: '#0F172A', marginBottom: 0 },
  profileCard: { background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', display: 'flex', gap: 32, alignItems: 'center', marginBottom: 24, textAlign: 'left' },
  profileLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 120 },
  profileDivider: { width: 1, alignSelf: 'stretch', background: '#E2E8F0', flexShrink: 0 },
  profileRight: { flex: 1 },
  analyzerCta: { background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, textAlign: 'left' },
  analyzerBtn: { display: 'inline-block', padding: '11px 22px', background: '#059669', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0 },

  // Enterprise layout
  main: { maxWidth: 1100, margin: '0 auto', padding: '36px 24px' },
  welcome: { marginBottom: 32 },
  welcomeTitle: { fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  welcomeSub: { fontSize: '0.9rem', color: '#64748B' },
  statsRow: { display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' },
  section: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: 24 },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#0F172A' },
  toolGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  toolCard: { display: 'block', padding: '22px 24px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, textDecoration: 'none' },
  toolIcon: { fontSize: '1.25rem', color: '#059669', marginBottom: 10 },
  toolName: { fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 },
  toolDesc: { fontSize: '0.825rem', color: '#57534E', lineHeight: 1.6, marginBottom: 12 },
  toolArrow: { fontSize: '0.875rem', fontWeight: 700, color: '#059669' },
  viewAll: { fontSize: '0.825rem', fontWeight: 600, color: '#059669', textDecoration: 'none' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  badge: { background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
};
