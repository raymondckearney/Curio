import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

const SCORE_COLOR = s => s >= 75 ? '#059669' : s >= 60 ? '#34D399' : s >= 40 ? '#F59E0B' : '#EF4444';
const SCORE_LABEL = s => s >= 75 ? 'Strong fit' : s >= 60 ? 'Good fit' : s >= 40 ? 'Partial fit' : s >= 20 ? 'Poor fit' : 'Severe mismatch';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnalyzerHistory() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/fit-results').then(r => r.ok ? r.json() : []),
    ])
      .then(([meData, dashData, fitData]) => { setMe(meData); setDash(dashData); setRuns(fitData); setLoading(false); })
      .catch(() => router.replace('/portal/login'));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (!me) return <div style={s.centered}>Loading…</div>;


  return (
    <>
      <Head>
        <title>Analyzer History — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="analyzer-history" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} />

        <main style={s.main}>
          <div style={s.header}>
            <h1 style={s.title}>Role Analyzer History</h1>
            <p style={s.sub}>All role alignment analyses run on your account.</p>
            <Link href="/portal/tools/fit" style={s.newBtn}>+ New Analysis</Link>
          </div>

          {loading ? (
            <p style={s.empty}>Loading…</p>
          ) : runs.length === 0 ? (
            <div style={s.emptyBox}>
              <p style={s.emptyText}>No analyses yet.</p>
              <Link href="/portal/tools/fit" style={s.newBtn}>Run your first analysis →</Link>
            </div>
          ) : (
            <div style={s.list}>
              {runs.map(run => {
                const isOpen = expanded === run.id;
                const color = SCORE_COLOR(run.score);
                return (
                  <div key={run.id} style={s.card}>
                    <div style={s.cardTop} onClick={() => setExpanded(isOpen ? null : run.id)}>
                      <div style={s.cardLeft}>
                        {run.participant_name && <div style={s.participant}>{run.participant_name}</div>}
                        <div style={s.roleName}>{run.role}</div>
                        <div style={s.profileTag}>{run.profile_type}</div>
                      </div>
                      <div style={s.cardRight}>
                        {run.score != null && (
                          <div style={{ ...s.scoreBadge, background: `${color}18`, color, border: `1px solid ${color}44` }}>
                            {run.score}% · {SCORE_LABEL(run.score)}
                          </div>
                        )}
                        <div style={s.date}>{fmt(run.created_at)}</div>
                        <div style={s.chevron}>{isOpen ? '▲' : '▼'}</div>
                      </div>
                    </div>

                    {isOpen && run.demand_split && (
                      <div style={s.detail}>
                        <div style={s.demandRow}>
                          {['why', 'what', 'how'].map(k => (
                            <div key={k} style={s.demandItem}>
                              <div style={s.demandLabel}>{k.toUpperCase()}</div>
                              <div style={s.demandVal}>{run.demand_split[k]}%</div>
                            </div>
                          ))}
                        </div>
                        <Link href={`/portal/tools/fit`} style={s.rerunLink}>
                          Run a new analysis →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { maxWidth: 860, margin: '0 auto', padding: '48px 24px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' },
  sub: { fontSize: '0.95rem', color: '#64748B', margin: 0 },
  newBtn: { display: 'inline-block', padding: '10px 20px', background: '#059669', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' },
  cardTop: { padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16 },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: 4 },
  participant: { fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' },
  roleName: { fontWeight: 700, fontSize: '1rem', color: '#0F172A' },
  profileTag: { fontSize: '0.8rem', color: '#64748B', fontWeight: 500 },
  cardRight: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  scoreBadge: { fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99 },
  date: { fontSize: '0.8rem', color: '#94A3B8' },
  chevron: { fontSize: '0.7rem', color: '#94A3B8' },
  detail: { borderTop: '1px solid #F1F5F9', padding: '16px 24px', background: '#FAFAFA' },
  demandRow: { display: 'flex', gap: 24, marginBottom: 16 },
  demandItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  demandLabel: { fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em' },
  demandVal: { fontSize: '1rem', fontWeight: 700, color: '#0F172A' },
  rerunLink: { fontSize: '0.85rem', color: '#059669', fontWeight: 600, textDecoration: 'none' },
  empty: { color: '#94A3B8', textAlign: 'center', padding: '48px 0' },
  emptyBox: { textAlign: 'center', padding: '64px 24px' },
  emptyText: { color: '#94A3B8', marginBottom: 16 },
};
