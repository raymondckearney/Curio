import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';
import { TERTIARY_BY_PROFILE } from '../../lib/tertiary';

const PROFILES = ['WHY-WHAT', 'WHY-HOW', 'WHAT-WHY', 'WHAT-HOW', 'HOW-WHY', 'HOW-WHAT'];
// Colorblind-safe 6-slot categorical order (validated), assigned in fixed order.
const PROFILE_COLORS = {
  'WHY-WHAT': '#2a78d6',
  'WHY-HOW': '#008300',
  'WHAT-WHY': '#e87ba4',
  'WHAT-HOW': '#eda100',
  'HOW-WHY': '#1baf7a',
  'HOW-WHAT': '#eb6834',
};
const ORIENTATIONS = ['WHY', 'WHAT', 'HOW'];
// Reuses the app's existing WHY/WHAT/HOW brand colors (same mapping used on
// the dashboard and library pages), validated as CVD-safe together.
const ORIENTATION_COLORS = { WHY: '#059669', WHAT: '#2563EB', HOW: '#D97706' };

function PieChart({ data, colors, size = 160 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const stops = total > 0 ? data.map(d => {
    const start = (cumulative / total) * 100;
    cumulative += d.value;
    const end = (cumulative / total) * 100;
    return `${colors[d.label]} ${start}% ${end}%`;
  }).join(', ') : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <div
        role="img"
        aria-label={data.map(d => `${d.label}: ${d.value}`).join(', ')}
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          background: stops ? `conic-gradient(${stops})` : '#E2E8F0',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: colors[d.label], flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: '#0F172A' }}>{d.label}</span>
            <span style={{ color: '#94A3B8' }}>{d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortalAnalytics() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [people, setPeople] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterKind, setFilterKind] = useState('profile'); // 'profile' | 'primary' | 'tertiary'
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/analytics').then(r => r.json().then(d => ({ ok: r.ok, d }))),
    ])
      .then(([meData, dashData, anaRes]) => {
        setMe(meData);
        setDash(dashData);
        if (!anaRes.ok) { setError(anaRes.d.error || 'Analytics is not available on your account.'); return; }
        setPeople(anaRes.d.people);
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

  const roster = people || [];
  const profileCounts = PROFILES.map(p => ({ label: p, value: roster.filter(person => person.profile === p).length }));
  const orientationCounts = ORIENTATIONS.map(o => ({ label: o, value: roster.filter(person => person.profile.split('-')[0] === o).length }));

  const filterOptions = filterKind === 'profile' ? PROFILES : ORIENTATIONS;

  const filteredPeople = filterValue ? roster.filter(person => {
    if (filterKind === 'profile') return person.profile === filterValue;
    if (filterKind === 'primary') return person.profile.split('-')[0] === filterValue;
    if (filterKind === 'tertiary') return TERTIARY_BY_PROFILE[person.profile] === filterValue;
    return true;
  }) : [];

  function emailGroup() {
    const emails = filteredPeople.map(p => p.email).filter(Boolean);
    if (!emails.length) return;
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails.join(','))}`;
  }

  return (
    <>
      <Head>
        <title>Analytics — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="analytics" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} isTeamAccount={dash?.tier === 'enterprise'} />
        <main style={s.main}>
        <div style={s.container}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={s.pageTitle}>Analytics</h1>
            <p style={s.pageSub}>{roster.length} completed assessment{roster.length !== 1 ? 's' : ''} across your engagement.</p>
          </div>

          {error ? (
            <div style={s.emptyState}>{error}</div>
          ) : roster.length === 0 ? (
            <div style={s.emptyState}>No completed assessments yet.</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div style={s.panel}>
                  <div style={s.panelLabel}>Profiles</div>
                  <PieChart data={profileCounts} colors={PROFILE_COLORS} />
                </div>
                <div style={s.panel}>
                  <div style={s.panelLabel}>Primary Orientations</div>
                  <PieChart data={orientationCounts} colors={ORIENTATION_COLORS} />
                </div>
              </div>

              <div style={s.panel}>
                <div style={s.panelLabel}>Generate a List</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'flex-end' }}>
                  <div>
                    <label style={s.fieldLabel}>Filter by</label>
                    <select style={s.select} value={filterKind} onChange={e => { setFilterKind(e.target.value); setFilterValue(''); }}>
                      <option value="profile">Profile</option>
                      <option value="primary">Primary Orientation</option>
                      <option value="tertiary">Tertiary Orientation</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Value</label>
                    <select style={s.select} value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                      <option value="">Choose…</option>
                      {filterOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  {filterValue && filteredPeople.length > 0 && (
                    <button style={s.emailBtn} onClick={emailGroup}>Email Group ({filteredPeople.length}) →</button>
                  )}
                </div>

                {!filterValue ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Choose a filter and value above to generate a list.</p>
                ) : filteredPeople.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No one matches that filter.</p>
                ) : (
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead><tr>{['Name', 'Email', 'Profile'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {filteredPeople.map((p, i) => (
                          <tr key={i} style={i % 2 === 0 ? s.trEven : {}}>
                            <td style={s.td}>{p.name || '—'}</td>
                            <td style={s.td}>{p.email || '—'}</td>
                            <td style={s.td}>
                              <span style={{ ...s.typeBadge, background: `${PROFILE_COLORS[p.profile]}18`, color: PROFILE_COLORS[p.profile], borderColor: `${PROFILE_COLORS[p.profile]}44` }}>{p.profile}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { marginLeft: 220, padding: '36px 24px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  pageTitle: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 },
  pageSub: { fontSize: '0.9rem', color: '#64748B' },
  panel: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: 20 },
  panelLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 },
  select: { padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', minWidth: 160, outline: 'none', background: '#fff' },
  emailBtn: { padding: '9px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  typeBadge: { padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', border: '1px solid transparent', whiteSpace: 'nowrap' },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
};
