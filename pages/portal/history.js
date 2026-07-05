import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

export default function PortalHistory() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/sessions/history?tool=role_analyzer').then(r => r.ok ? r.json() : { sessions: [] }),
    ])
      .then(([meData, dash, hist]) => {
        setMe(meData);
        setLicenses(dash?.licenses || []);
        setSessions(hist.sessions || []);
      })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (loading || !me) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' }}>Loading…</div>;

  return (
    <>
      <Head>
        <title>Analyzer History — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="analyzer-history" licenses={licenses} />

        <main style={s.main}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={s.title}>Analyzer History</h1>
            <p style={s.sub}>Your Role Alignment Analyzer sessions, newest first.</p>
          </div>

          {sessions && sessions.length === 0 && (
            <div style={s.empty}>
              <div style={s.emptyIcon}>◈</div>
              <p style={s.emptyText}>Your Role Analyzer history will appear here after your first session.</p>
              <a href="/portal/tools/fit" style={s.emptyLink}>Open Role Analyzer →</a>
            </div>
          )}

          {sessions && sessions.length > 0 && (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Date', 'Role Analyzed', 'Fit Score', 'Summary'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((sess, i) => {
                    const role = sess.result?.role || '—';
                    const score = sess.result?.fitScore ?? sess.result?.score ?? null;
                    const summary = sess.result?.summary || sess.result?.scoreRationale || '—';
                    const date = sess.completed_at
                      ? new Date(sess.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : sess.started_at
                        ? new Date(sess.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—';
                    const scoreColor = score >= 75 ? '#059669' : score >= 60 ? '#34D399' : score >= 40 ? '#F59E0B' : score !== null ? '#EF4444' : '#94A3B8';

                    return (
                      <tr key={sess.id} style={i % 2 === 0 ? s.trEven : {}}>
                        <td style={s.td}>{date}</td>
                        <td style={{ ...s.td, fontWeight: 500, color: '#0F172A' }}>{role}</td>
                        <td style={s.td}>
                          {score !== null ? (
                            <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', fontWeight: 700, color: scoreColor }}>{score}%</span>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>In progress</span>
                          )}
                        </td>
                        <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B', maxWidth: 360, lineHeight: 1.5 }}>
                          {summary !== '—' ? summary.slice(0, 160) + (summary.length > 160 ? '…' : '') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  main: { maxWidth: 900, margin: '0 auto', padding: '40px clamp(20px,4vw,48px) 80px' },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 },
  sub: { fontSize: '0.875rem', color: '#64748B' },
  tableWrap: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', background: '#F8FAFC' },
  td: { padding: '12px 16px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' },
  trEven: { background: '#FAFAFA' },
  empty: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '60px 32px', textAlign: 'center' },
  emptyIcon: { fontSize: '2rem', color: '#CBD5E1', marginBottom: 16 },
  emptyText: { fontSize: '0.95rem', color: '#64748B', lineHeight: 1.7, marginBottom: 20 },
  emptyLink: { display: 'inline-block', padding: '10px 22px', background: '#059669', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' },
};
