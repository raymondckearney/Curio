import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

export default function PortalTokens() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/tokens').then(r => r.ok ? r.json() : null),
    ])
      .then(([meData, tokData]) => { setMe(meData); setTokens(tokData?.tokens || []); })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  function copy(url, token) {
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const total = tokens?.length || 0;
  const used = tokens?.filter(t => t.used).length || 0;

  return (
    <>
      <Head>
        <title>Tokens — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="tokens" />
        <main style={s.main}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h1 style={s.pageTitle}>Assessment Tokens</h1>
              <p style={s.pageSub}>{used} of {total} used</p>
            </div>
          </div>

          {tokens?.length > 0 ? (
            <div style={s.panel}>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Name', 'Email', 'Role', 'Status', 'Link', 'Completed', 'Copy'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {tokens.map((t, i) => (
                      <tr key={t.token} style={i % 2 === 0 ? s.trEven : {}}>
                        <td style={s.td}>{t.name || '—'}</td>
                        <td style={s.td}>{t.email || '—'}</td>
                        <td style={s.td}>{t.role || '—'}</td>
                        <td style={s.td}>
                          <span style={t.used ? s.badgeUsed : s.badgePending}>
                            {t.used ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ ...s.td, ...s.urlCell }}>{t.url}</td>
                        <td style={s.td}>{t.used_at ? new Date(t.used_at).toLocaleDateString() : '—'}</td>
                        <td style={s.td}>
                          <button style={s.copyBtn} onClick={() => copy(t.url, t.token)}>
                            {copied === t.token ? 'Copied!' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={s.emptyState}>No tokens assigned to this account yet. Contact your Curio account manager.</div>
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
  panel: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  urlCell: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badgeUsed: { background: '#D1FAE5', color: '#065F46', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgePending: { background: '#FEF3C7', color: '#92400E', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  copyBtn: { padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
};
