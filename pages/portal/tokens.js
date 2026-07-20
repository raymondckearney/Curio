import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

const DEFAULT_MESSAGE = `Hi [Name],

You've been invited to complete a MindPrint™ assessment. This short assessment identifies how you're naturally wired to think through and solve problems — results typically take about 20 minutes.

Click the link below to get started:

[URL]

Let me know if you have any questions!`;

export default function PortalTokens() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  // Send UI state
  const [sendTab, setSendTab] = useState('single'); // 'single' | 'batch'
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [batchText, setBatchText] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // { sent, error }

  const loadTokens = useCallback(() => {
    return fetch('/api/portal/tokens').then(r => r.ok ? r.json() : null);
  }, []);

  const [dash, setDash] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      loadTokens(),
    ])
      .then(([meData, dashData, tokData]) => { setMe(meData); setDash(dashData); setTokens(tokData?.tokens || []); })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router, loadTokens]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  function copy(url, token) {
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  // Parse batch text into recipient list
  function parseBatch() {
    return batchText.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 2) return { name: parts[0], email: parts[1] };
      return { name: '', email: parts[0] };
    }).filter(r => r.email.includes('@'));
  }

  async function handleSend() {
    setSendResult(null);
    setSending(true);
    const recipients = sendTab === 'single'
      ? [{ name: singleName.trim(), email: singleEmail.trim() }]
      : parseBatch();

    if (!recipients.length || !recipients[0].email) {
      setSendResult({ error: 'Enter at least one valid email.' });
      setSending(false);
      return;
    }

    try {
      const res = await fetch('/api/portal/send-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, message }),
      });
      const data = await res.json();
      if (!res.ok) { setSendResult({ error: data.error || 'Failed to send.' }); return; }
      setSendResult({ sent: data.sent });
      setSingleName(''); setSingleEmail(''); setBatchText('');
      setShowPreview(false);
      // Refresh token list
      loadTokens().then(d => setTokens(d?.tokens || []));
    } catch {
      setSendResult({ error: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const available = tokens?.filter(t => !t.email && !t.used) || [];
  const sent = tokens?.filter(t => t.email && !t.used) || [];
  const completed = tokens?.filter(t => t.used) || [];

  // Preview: show message with first recipient substituted
  const previewRecipients = sendTab === 'single'
    ? [{ name: singleName || 'Recipient', email: singleEmail || 'recipient@example.com' }]
    : parseBatch().slice(0, 1).map(r => ({ ...r, name: r.name || 'Recipient' }));
  const previewMsg = message
    .replace(/\[Name\]/gi, previewRecipients[0]?.name || 'Recipient')
    .replace(/\[URL\]/gi, 'https://www.choosecurio.com/go/[token]');

  return (
    <>
      <Head>
        <title>Tokens — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="tokens" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} />
        <main style={s.main}>
        <div style={s.container}>
          <h1 style={s.pageTitle}>Assessment Tokens</h1>

          {/* Stats row */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <span style={s.statNum}>{available.length}</span>
              <span style={s.statLabel}>Available</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statNum}>{sent.length}</span>
              <span style={s.statLabel}>Sent</span>
            </div>
            <div style={{ ...s.statCard, ...s.statCardGreen }}>
              <span style={s.statNum}>{completed.length}</span>
              <span style={s.statLabel}>Completed</span>
            </div>
          </div>

          {tokens?.length === 0 && (
            <div style={s.emptyState}>No tokens assigned to this account yet. Contact your Curio account manager.</div>
          )}

          {/* Send tokens panel */}
          {available.length > 0 && (
            <div style={{ ...s.panel, marginBottom: 24 }}>
              <h2 style={s.sectionTitle}>Send Assessment Links</h2>
              <p style={s.sectionSub}>{available.length} token{available.length !== 1 ? 's' : ''} available to send</p>

              {/* Single / Batch tabs */}
              <div style={s.miniTabBar}>
                {['single', 'batch'].map(t => (
                  <button key={t} onClick={() => { setSendTab(t); setSendResult(null); }}
                    style={{ ...s.miniTab, ...(sendTab === t ? s.miniTabActive : {}) }}>
                    {t === 'single' ? 'Single Recipient' : 'Batch (multiple)'}
                  </button>
                ))}
              </div>

              {sendTab === 'single' && (
                <div style={s.sendForm}>
                  <div style={s.sendRow}>
                    <div style={s.sendField}>
                      <label style={s.label}>Name <span style={s.optional}>(optional)</span></label>
                      <input style={s.input} value={singleName} onChange={e => setSingleName(e.target.value)} placeholder="Alex Smith" />
                    </div>
                    <div style={s.sendField}>
                      <label style={s.label}>Email *</label>
                      <input style={s.input} value={singleEmail} onChange={e => setSingleEmail(e.target.value)} placeholder="alex@company.com" type="email" />
                    </div>
                  </div>
                </div>
              )}

              {sendTab === 'batch' && (
                <div style={s.sendForm}>
                  <label style={s.label}>Recipients — one per line: <code style={s.code}>Name, email</code> or just email</label>
                  <textarea style={s.textarea} rows={5} value={batchText} onChange={e => setBatchText(e.target.value)}
                    placeholder={"Alex Smith, alex@company.com\nJordan Lee, jordan@company.com\nsam@company.com"} />
                  {batchText && (
                    <p style={s.batchCount}>
                      {parseBatch().length} valid recipient{parseBatch().length !== 1 ? 's' : ''} parsed
                      {parseBatch().length > available.length && <span style={{ color: '#DC2626' }}> — exceeds {available.length} available tokens</span>}
                    </p>
                  )}
                </div>
              )}

              {/* Message editor */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={s.label}>Email Message <span style={s.optional}>(use [Name] and [URL] as placeholders)</span></label>
                  <button style={s.previewToggle} onClick={() => setShowPreview(p => !p)}>
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {showPreview ? (
                  <div style={s.preview}>
                    {previewMsg.split('\n').map((line, i) => (
                      <span key={i}>{line || ' '}<br /></span>
                    ))}
                  </div>
                ) : (
                  <textarea style={s.textarea} rows={8} value={message} onChange={e => setMessage(e.target.value)} />
                )}
              </div>

              {sendResult?.error && <p style={s.error}>{sendResult.error}</p>}
              {sendResult?.sent && <p style={s.success}>✓ Sent {sendResult.sent} assessment link{sendResult.sent !== 1 ? 's' : ''} successfully.</p>}

              <button style={{ ...s.btn, marginTop: 16, opacity: sending ? 0.6 : 1 }} onClick={handleSend} disabled={sending}>
                {sending ? 'Sending…' : sendTab === 'single' ? 'Send Assessment Link' : `Send to ${parseBatch().length || '…'} Recipients`}
              </button>
            </div>
          )}

          {/* Sent / Completed tokens table */}
          {(sent.length > 0 || completed.length > 0) && (
            <div style={s.panel}>
              <h2 style={s.sectionTitle}>Sent Tokens</h2>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Name', 'Email', 'Status', 'Sent', 'Completed', 'Copy Link'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {[...sent, ...completed].map((t, i) => (
                      <tr key={t.token} style={i % 2 === 0 ? s.trEven : {}}>
                        <td style={s.td}>{t.name || '—'}</td>
                        <td style={s.td}>{t.email || '—'}</td>
                        <td style={s.td}>
                          <span style={t.used ? s.badgeUsed : s.badgeSent}>
                            {t.used ? 'Completed' : 'Sent'}
                          </span>
                        </td>
                        <td style={s.td}>{t.link_sent_at ? new Date(t.link_sent_at).toLocaleDateString() : '—'}</td>
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
  container: { maxWidth: 900, margin: '0 auto' },
  pageTitle: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, marginBottom: 20 },
  statsRow: { display: 'flex', gap: 16, marginBottom: 28 },
  statCard: { flex: 1, background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 4 },
  statCardGreen: { borderColor: '#D1FAE5' },
  statNum: { fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 },
  statLabel: { fontSize: '0.8rem', color: '#64748B', fontWeight: 500 },
  panel: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 2 },
  sectionSub: { fontSize: '0.85rem', color: '#64748B', marginBottom: 18 },
  miniTabBar: { display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: 20 },
  miniTab: { padding: '8px 18px', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 500, color: '#64748B', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, fontFamily: "'DM Sans', sans-serif" },
  miniTabActive: { color: '#059669', borderBottomColor: '#059669', fontWeight: 600 },
  sendForm: { marginBottom: 8 },
  sendRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  sendField: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  optional: { fontWeight: 400, color: '#94A3B8' },
  code: { fontFamily: 'monospace', background: '#F1F5F9', padding: '1px 5px', borderRadius: 3, fontSize: '0.8rem' },
  input: { padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fff' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#fff' },
  batchCount: { fontSize: '0.8rem', color: '#64748B', marginTop: 6 },
  previewToggle: { padding: '4px 12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#374151' },
  preview: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 7, padding: '14px 16px', fontSize: '0.875rem', lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap', minHeight: 160 },
  btn: { padding: '10px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  error: { color: '#DC2626', fontSize: '0.85rem', marginTop: 10 },
  success: { color: '#059669', fontSize: '0.85rem', marginTop: 10, fontWeight: 500 },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  badgeUsed: { background: '#D1FAE5', color: '#065F46', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeSent: { background: '#EFF6FF', color: '#1D4ED8', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  copyBtn: { padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};
