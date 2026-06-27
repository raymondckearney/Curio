import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import profiles from '../../lib/profiles';

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

const PRIMARY_COLOR = { why: '#059669', what: '#2563EB', how: '#D97706' };

function profileColor(type) {
  const primary = (type || '').split('-')[0];
  return PRIMARY_COLOR[primary] || '#64748B';
}

function SelfServeDashboard({ me, data, onLogout }) {
  const firstName = me.user.name?.split(' ')[0] || '';
  const assessment = data?.myAssessment;
  const hasAnalyzer = data?.hasFitToken;
  const typeKey = assessment?.type?.toLowerCase();
  const profile = profiles[typeKey];
  const color = profileColor(typeKey);
  const completedDate = assessment?.submitted_at
    ? new Date(assessment.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <>
      <Head>
        <title>My Profile — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={onLogout} active="dashboard" isSelfServe hasFitToken={hasAnalyzer} />

        {assessment && profile ? (
          <main style={s.selfMain}>
            {/* Hero band */}
            <div style={{ ...s.heroBand, background: `linear-gradient(135deg, ${color}0d 0%, ${color}05 100%)`, borderBottom: `1px solid ${color}22` }}>
              <div style={s.heroInner}>
                <div style={s.heroMeta}>
                  <span style={{ ...s.profilePill, background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    MindPrint™ Profile
                  </span>
                  {completedDate && <span style={s.heroDate}>Completed {completedDate}</span>}
                </div>
                <h1 style={{ ...s.heroType, color }}>
                  {profile.label}
                </h1>
                <p style={s.heroTagline}>{profile.tagline}</p>
                <blockquote style={{ ...s.signal, borderLeftColor: color }}>
                  <span style={{ color, fontSize: '1.2rem', lineHeight: 1, marginRight: 6 }}>"</span>
                  {profile.signal.replace(/^"|"$/g, '')}
                  <span style={{ color, fontSize: '1.2rem', lineHeight: 1, marginLeft: 4 }}>"</span>
                </blockquote>
                <div style={{ marginTop: 24 }}>
                  <a
                    href={`/profiles/MindPrint_Profile_${typeKey.toUpperCase().replace(/-/g, '_')}.pdf`}
                    download
                    style={{ ...s.pdfLink, borderColor: `${color}40`, color }}
                  >
                    ↓ Download Full Profile PDF
                  </a>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={s.contentWrap}>

              {/* Who You Are */}
              <div style={s.contentCard}>
                <div style={{ ...s.cardLabel, color }}>Who You Are</div>
                <p style={s.prose}>{profile.whoYouAre}</p>
              </div>

              {/* Two-col: Superpower + Energizes */}
              <div style={s.twoCol}>
                <div style={{ ...s.contentCard, flex: 1 }}>
                  <div style={{ ...s.cardLabel, color }}>Your Superpower</div>
                  <p style={s.prose}>{profile.superpower}</p>
                </div>
                <div style={{ ...s.contentCard, flex: 1 }}>
                  <div style={{ ...s.cardLabel, color }}>What Energizes You</div>
                  <p style={s.prose}>{profile.energizes}</p>
                </div>
              </div>

              {/* Roles */}
              <div style={s.contentCard}>
                <div style={{ ...s.cardLabel, color }}>Roles Where You Thrive</div>
                <div style={s.roleGrid}>
                  {profile.roles.slice(0, 6).map((r, i) => (
                    <div key={i} style={{ ...s.roleChip, borderColor: `${color}30`, background: `${color}08` }}>
                      <span style={{ ...s.roleDot, background: color }} />{r}
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyzer CTA */}
              {hasAnalyzer && (
                <div style={{ ...s.analyzerCta, borderColor: `${color}40`, background: `${color}08` }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6, fontSize: '1rem' }}>See how your profile fits specific roles</div>
                    <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>Use the Role Alignment Analyzer to explore what energizes you, what drains you, and how you collaborate best — for any role you enter.</div>
                  </div>
                  <Link href="/portal/tools/fit" style={{ ...s.analyzerBtn, background: color }}>Open Analyzer →</Link>
                </div>
              )}
            </div>
          </main>
        ) : (
          <main style={s.selfMain}>
            <div style={s.pendingWrap}>
              <div style={s.pendingIcon}>◎</div>
              <h1 style={s.pendingTitle}>Your account is ready.</h1>
              <p style={s.pendingText}>Your MindPrint™ profile will appear here once you've completed your assessment. Check your email for the link.</p>
              <p style={s.pendingContact}>Questions? <a href="mailto:hello@choosecurio.com" style={{ color: '#059669', textDecoration: 'none', fontWeight: 500 }}>hello@choosecurio.com</a></p>
            </div>
          </main>
        )}
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
  selfMain: { minHeight: 'calc(100vh - 100px)' },
  heroBand: { padding: '52px 24px 44px' },
  heroInner: { maxWidth: 760, margin: '0 auto' },
  heroMeta: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  profilePill: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', padding: '4px 12px', borderRadius: 99, textTransform: 'uppercase' },
  heroDate: { fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 },
  heroType: { fontFamily: "'Caveat', cursive", fontSize: '3.4rem', fontWeight: 700, lineHeight: 1, marginBottom: 8 },
  heroTagline: { fontSize: '1.05rem', color: '#475569', fontWeight: 500, marginBottom: 24, letterSpacing: '0.01em' },
  signal: { margin: 0, padding: '14px 20px', borderLeft: '3px solid', background: 'rgba(255,255,255,0.6)', borderRadius: '0 8px 8px 0', fontStyle: 'italic', fontSize: '0.975rem', color: '#374151', lineHeight: 1.7, maxWidth: 600 },
  pdfLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', padding: '8px 16px', border: '1px solid', borderRadius: 8, background: 'rgba(255,255,255,0.7)', transition: 'opacity 0.15s' },
  contentWrap: { maxWidth: 760, margin: '0 auto', padding: '36px 24px 64px' },
  contentCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '28px 32px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 },
  prose: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.8, margin: 0 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  roleGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  roleChip: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', color: '#374151', fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: '1px solid' },
  roleDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  analyzerCta: { border: '1px solid', borderRadius: 14, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 16 },
  analyzerBtn: { display: 'inline-block', padding: '12px 24px', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', flexShrink: 0 },
  pendingWrap: { maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' },
  pendingIcon: { fontSize: '2.5rem', color: '#CBD5E1', marginBottom: 20 },
  pendingTitle: { fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 },
  pendingText: { fontSize: '1rem', color: '#64748B', lineHeight: 1.7, marginBottom: 16 },
  pendingContact: { fontSize: '0.875rem', color: '#94A3B8' },

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
