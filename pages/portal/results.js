import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

export default function PortalResults() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/results').then(r => r.ok ? r.json() : null),
    ])
      .then(([meData, dashData, resData]) => { setMe(meData); setDash(dashData); setAssessments(resData?.assessments || []); })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const filtered = (assessments || []).filter(a => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (a.name || '').toLowerCase().includes(q)
      || (a.email || '').toLowerCase().includes(q)
      || (a.reg_name || '').toLowerCase().includes(q)
      || (a.reg_email || '').toLowerCase().includes(q)
      || (a.type || '').toLowerCase().includes(q);
  });

  const typeColors = { 'why-what': '#10B981', 'why-how': '#059669', 'what-why': '#3B82F6', 'what-how': '#2563EB', 'how-why': '#D97706', 'how-what': '#B45309' };

  return (
    <>
      <Head>
        <title>Results — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="results" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} />
        <main style={s.main}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h1 style={s.pageTitle}>Assessment Results</h1>
              <p style={s.pageSub}>{assessments?.length || 0} result{assessments?.length !== 1 ? 's' : ''}{me.account.restrict_results && me.user.role === 'member' ? ' (showing your results only)' : ''}</p>
            </div>
            <input
              style={s.search}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by name, email, profile…"
            />
          </div>

          {filtered.length > 0 ? (
            <div style={s.panel}>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Name', 'Email', 'Profile', 'H Score', 'W Score', 'Y Score', 'Date'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => {
                      const type = (a.type || '').toLowerCase();
                      const color = typeColors[type] || '#64748B';
                      return (
                        <tr key={a.id || i} style={i % 2 === 0 ? s.trEven : {}}>
                          <td style={s.td}>{a.name || a.reg_name || '—'}</td>
                          <td style={s.td}>{a.email || a.reg_email || '—'}</td>
                          <td style={s.td}>
                            {a.type ? (
                              <span style={{ ...s.typeBadge, background: `${color}15`, color, borderColor: `${color}40` }}>
                                {a.type.toUpperCase()}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={s.td}>{a.h_score ?? '—'}</td>
                          <td style={s.td}>{a.w_score ?? '—'}</td>
                          <td style={s.td}>{a.y_score ?? '—'}</td>
                          <td style={s.td}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={s.emptyState}>
              {filter ? 'No results match your filter.' : 'No assessment results yet.'}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '36px 24px' },
  pageTitle: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 },
  pageSub: { fontSize: '0.9rem', color: '#64748B' },
  search: { padding: '9px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', width: 240, outline: 'none' },
  panel: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  typeBadge: { padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', border: '1px solid transparent', whiteSpace: 'nowrap' },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
};
