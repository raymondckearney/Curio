import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminTokens() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login');
  }, [status, router]);

  if (status === 'loading' || !session) return null;
  return (
    <>
      <Head>
        <title>Token Manager — Curio Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <span style={s.logo}>Curio<span style={s.dot}>.</span></span>
          <span style={s.headerTitle}>Token Manager</span>
          <button style={s.signOut} onClick={() => signOut({ callbackUrl: '/admin/login' })}>Sign out</button>
        </header>
        <main style={s.main}>
          <GeneratePanel />
          <StatusPanel />
        </main>
      </div>
    </>
  );
}

function GeneratePanel() {
  const [purpose, setPurpose] = useState('assessment');
  const [engagementId, setEngagementId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [participantText, setParticipantText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setError('');
    setResults(null);
    const lines = participantText.trim().split('\n').filter(Boolean);
    const participants = lines.map(line => {
      const [name, ...rest] = line.split(',');
      return { name: name.trim(), email: rest.join(',').trim() };
    }).filter(p => p.name && p.email);

    if (!participants.length) return setError('Enter at least one participant as "Name, email"');
    if (!engagementId.trim()) return setError('Engagement ID is required');

    setLoading(true);
    try {
      const res = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${prompt('Admin password:')}`,
        },
        body: JSON.stringify({
          participants,
          purpose,
          engagement_id: engagementId.trim(),
          expires_at: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResults(data.tokens);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = results.map(r => `${r.name}\t${r.email}\t${r.url}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyOne(url) {
    navigator.clipboard.writeText(url);
  }

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Generate Tokens</h2>
      <div style={s.fieldGroup}>
        <label style={s.label}>Purpose</label>
        <select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}>
          <option value="assessment">Assessment</option>
          <option value="role-analyzer">Role Analyzer</option>
        </select>
      </div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Engagement ID</label>
        <input style={s.input} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2026-q1" />
      </div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Expiry Date (optional)</label>
        <input style={s.input} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
      </div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Participants — one per line: <code style={s.code}>Name, email</code></label>
        <textarea
          style={s.textarea}
          value={participantText}
          onChange={e => setParticipantText(e.target.value)}
          placeholder={"Alex Smith, alex@example.com\nJordan Lee, jordan@example.com"}
          rows={6}
        />
      </div>
      {error && <p style={s.error}>{error}</p>}
      <button style={s.btn} onClick={generate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Tokens'}
      </button>

      {results && (
        <div style={{ marginTop: 24 }}>
          <div style={s.resultsHeader}>
            <span style={s.resultsCount}>{results.length} token{results.length !== 1 ? 's' : ''} created</span>
            <button style={s.btnSecondary} onClick={copyAll}>
              {copied ? 'Copied!' : 'Copy all URLs'}
            </button>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'URL', ''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : {}}>
                    <td style={s.td}>{r.name}</td>
                    <td style={s.td}>{r.email}</td>
                    <td style={{ ...s.td, ...s.urlCell }}>{r.url}</td>
                    <td style={s.td}>
                      <button style={s.copyBtn} onClick={() => copyOne(r.url)}>Copy</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusPanel() {
  const [engagementId, setEngagementId] = useState('');
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setError('');
    setTokens(null);
    if (!engagementId.trim()) return setError('Enter an Engagement ID');
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/status?engagement_id=${encodeURIComponent(engagementId.trim())}`, {
        headers: { Authorization: `Bearer ${prompt('Admin password:')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTokens(data.tokens);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const used = tokens?.filter(t => t.used).length ?? 0;

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Engagement Status</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={s.label}>Engagement ID</label>
          <input style={s.input} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2026-q1" onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
        <button style={s.btn} onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
      </div>
      {error && <p style={s.error}>{error}</p>}

      {tokens && (
        <div style={{ marginTop: 24 }}>
          <p style={s.summary}>
            <strong>{used}</strong> of <strong>{tokens.length}</strong> completed
          </p>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Status', 'Used At', 'Result'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((t, i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : {}}>
                    <td style={s.td}>{t.name}</td>
                    <td style={s.td}>{t.email}</td>
                    <td style={s.td}>
                      <span style={t.used ? s.badgeUsed : s.badgePending}>
                        {t.used ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td style={s.td}>{t.used_at ? new Date(t.used_at).toLocaleString() : '—'}</td>
                    <td style={s.td}>
                      {t.result_payload ? (
                        <code style={s.code}>{JSON.stringify(t.result_payload).slice(0, 60)}…</code>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  header: {
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' },
  dot: { color: '#059669' },
  headerTitle: { fontSize: '0.9rem', color: '#64748B', flex: 1 },
  signOut: { background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 14px', fontSize: '0.875rem', cursor: 'pointer', color: '#64748B', fontFamily: "'DM Sans', sans-serif" },
  main: { maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 },
  panel: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  panelTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: 24, marginTop: 0 },
  fieldGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6, color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', background: '#fff', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', resize: 'vertical', boxSizing: 'border-box' },
  btn: { padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  btnSecondary: { padding: '8px 16px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '8px 0 0' },
  code: { fontFamily: 'monospace', fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultsCount: { fontSize: '0.9rem', fontWeight: 500, color: '#059669' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  urlCell: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: { padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  summary: { fontSize: '0.95rem', marginBottom: 12, color: '#374151' },
  badgeUsed: { background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600 },
  badgePending: { background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600 },
};
