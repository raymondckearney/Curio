import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import profiles from '../../lib/profiles';
import PortalSidebar from '../../components/PortalSidebar';

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

  const licenses = data?.licenses || [];
  const assessment = data?.myAssessment;
  const isIndividual = !!assessment;
  const hasRoleAnalyzer = data?.hasRoleAnalyzer;
  const hasAssessment = data?.hasAssessment;
  const { total = 0, used = 0, available = 0 } = data?.tokenStats || {};
  const typeKey = assessment?.type?.toLowerCase();
  const profile = profiles[typeKey];
  const color = profileColor(typeKey);
  const completedDate = assessment?.submitted_at
    ? new Date(assessment.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <>
      <Head>
        <title>Dashboard — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.layout}>
        <PortalSidebar me={me} onLogout={logout} active="dashboard" licenses={licenses} isIndividual={isIndividual} />
        <main style={s.main}>

          {/* My Profile section */}
          {assessment && profile ? (
            <>
              <div style={{ ...s.heroBand, background: `linear-gradient(135deg, ${color}0d 0%, ${color}05 100%)`, borderBottom: `1px solid ${color}22` }}>
                <div style={s.heroInner}>
                  <div style={s.heroMeta}>
                    <span style={{ ...s.profilePill, background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      MindPrint™ Profile
                    </span>
                    {completedDate && <span style={s.heroDate}>Completed {completedDate}</span>}
                  </div>
                  <h1 style={{ ...s.heroType, color }}>{profile.label}</h1>
                  <p style={s.heroTagline}>{profile.tagline}</p>
                  <blockquote style={{ ...s.signal, borderLeftColor: color }}>
                    <span style={{ color, fontSize: '1.2rem', lineHeight: 1, marginRight: 6 }}>"</span>
                    {profile.signal.replace(/^"|"$/g, '')}
                    <span style={{ color, fontSize: '1.2rem', lineHeight: 1, marginLeft: 4 }}>"</span>
                  </blockquote>
                </div>
              </div>

              <div style={s.contentWrap}>
                <div style={s.contentCard}>
                  <div style={{ ...s.cardLabel, color }}>Who You Are</div>
                  <p style={s.prose}>{profile.whoYouAre}</p>
                </div>
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
                {profile.drains?.length > 0 && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color: '#64748B' }}>What Drains You</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {profile.drains.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0, marginTop: 7 }} />
                          <span style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.65 }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {profile.blindSpot && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color: '#64748B' }}>Your Blind Spot</div>
                    <p style={s.prose}>{profile.blindSpot}</p>
                  </div>
                )}
                {profile.friction && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color: '#64748B' }}>Common Sources of Friction</div>
                    <p style={s.prose}>{profile.friction}</p>
                  </div>
                )}
                {profile.howToWorkWithYou && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color }}>How to Work With You</div>
                    <p style={s.prose}>{profile.howToWorkWithYou}</p>
                  </div>
                )}
                {profile.valueAreas?.length > 0 && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color }}>Where You Add the Most Value</div>
                    <div style={s.roleGrid}>
                      {profile.valueAreas.map((v, i) => (
                        <div key={i} style={{ ...s.roleChip, borderColor: `${color}30`, background: `${color}08` }}>
                          <span style={{ ...s.roleDot, background: color }} />{v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={s.contentCard}>
                  <div style={{ ...s.cardLabel, color }}>Roles Where You Thrive</div>
                  <div style={s.roleGrid}>
                    {profile.roles.map((r, i) => (
                      <div key={i} style={{ ...s.roleChip, borderColor: `${color}30`, background: `${color}08` }}>
                        <span style={{ ...s.roleDot, background: color }} />{r}
                      </div>
                    ))}
                  </div>
                </div>
                {profile.areasToWatch?.length > 0 && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color: '#64748B' }}>Watch For</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {profile.areasToWatch.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.85rem', color: '#94A3B8', flexShrink: 0, marginTop: 2 }}>◆</span>
                          <span style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.65 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {profile.partners?.length > 0 && (
                  <div style={s.contentCard}>
                    <div style={{ ...s.cardLabel, color }}>Best Collaborators</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {profile.partners.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${color}15`, color, border: `1px solid ${color}30`, whiteSpace: 'nowrap', flexShrink: 0 }}>{p.type}</span>
                          <span style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>{p.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasRoleAnalyzer && (
                  <div style={{ ...s.analyzerCta, borderColor: `${color}40`, background: `${color}08` }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6, fontSize: '1rem' }}>See how your profile fits specific roles</div>
                      <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>Use the Role Alignment Analyzer to explore what energizes you, what drains you, and how you collaborate best — for any role you enter.</div>
                    </div>
                    <Link href="/portal/tools/fit" style={{ ...s.analyzerBtn, background: color }}>Open Analyzer →</Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={s.contentWrap}>
              {hasAssessment ? (
                <div style={s.pendingWrap}>
                  <div style={s.pendingIcon}>◎</div>
                  <h1 style={s.pendingTitle}>Your account is ready.</h1>
                  <p style={s.pendingText}>Your MindPrint™ profile will appear here once you've completed your assessment. Check your email for the link.</p>
                  <p style={s.pendingContact}>Questions? <a href="mailto:hello@choosecurio.com" style={{ color: '#059669', textDecoration: 'none', fontWeight: 500 }}>hello@choosecurio.com</a></p>
                </div>
              ) : (
                <>
                  {/* Enterprise dashboard — token stats + recent assessments */}
                  <h1 style={s.welcomeTitle}>Welcome back{me.user.name ? `, ${me.user.name.split(' ')[0]}` : ''}</h1>

                  {hasAssessment !== false && (
                    <div style={s.statsRow}>
                      <StatCard label="Assessment Tokens" value={total} sub="total purchased" color="#059669" />
                      <StatCard label="Completed" value={used} sub="assessments taken" color="#3B82F6" />
                      <StatCard label="Available" value={available} sub="tokens remaining" color="#D97706" />
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

                  {!licenses.length && (
                    <div style={s.emptyState}>
                      <p>No active licenses yet. Contact your Curio account manager to get started.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// Keep PortalNav export for backward-compat during transition — sidebar pages import it
export function PortalNav({ me, onLogout, active, licenses = [], isIndividual = false }) {
  return <PortalSidebar me={me} onLogout={onLogout} active={active} licenses={licenses} isIndividual={isIndividual} />;
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

const PRIMARY_COLOR = { why: '#059669', what: '#2563EB', how: '#D97706' };
function profileColor(type) {
  const primary = (type || '').split('-')[0];
  return PRIMARY_COLOR[primary] || '#64748B';
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { marginLeft: 220, flex: 1, minHeight: '100vh' },

  heroBand: { padding: '52px 40px 44px' },
  heroInner: { maxWidth: 760 },
  heroMeta: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  profilePill: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', padding: '4px 12px', borderRadius: 99, textTransform: 'uppercase' },
  heroDate: { fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 },
  heroType: { fontFamily: "'Caveat', cursive", fontSize: '3.4rem', fontWeight: 700, lineHeight: 1, marginBottom: 8 },
  heroTagline: { fontSize: '1.05rem', color: '#475569', fontWeight: 500, marginBottom: 24, letterSpacing: '0.01em' },
  signal: { margin: 0, padding: '14px 20px', borderLeft: '3px solid', background: 'rgba(255,255,255,0.6)', borderRadius: '0 8px 8px 0', fontStyle: 'italic', fontSize: '0.975rem', color: '#374151', lineHeight: 1.7, maxWidth: 600 },
  pdfLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', padding: '8px 16px', border: '1px solid', borderRadius: 8, background: 'rgba(255,255,255,0.7)' },

  contentWrap: { maxWidth: 760, padding: '36px 40px 64px' },
  contentCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '28px 32px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 },
  prose: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.8, margin: 0 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  roleGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  roleChip: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', color: '#374151', fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: '1px solid' },
  roleDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  analyzerCta: { border: '1px solid', borderRadius: 14, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 16 },
  analyzerBtn: { display: 'inline-block', padding: '12px 24px', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', flexShrink: 0 },

  pendingWrap: { maxWidth: 480, padding: '80px 0', textAlign: 'center' },
  pendingIcon: { fontSize: '2.5rem', color: '#CBD5E1', marginBottom: 20 },
  pendingTitle: { fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 },
  pendingText: { fontSize: '1rem', color: '#64748B', lineHeight: 1.7, marginBottom: 16 },
  pendingContact: { fontSize: '0.875rem', color: '#94A3B8' },

  welcomeTitle: { fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 24 },
  statsRow: { display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
  section: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: 24 },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#0F172A' },
  viewAll: { fontSize: '0.825rem', fontWeight: 600, color: '#059669', textDecoration: 'none' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  badge: { background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
};
