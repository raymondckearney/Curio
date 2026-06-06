import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminTokens() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? setAuthed(true) : router.replace('/admin/login'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!authed) return null;
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
          <span style={s.headerTitle}>Admin</span>
          <button style={s.signOut} onClick={() => fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'))}>Sign out</button>
        </header>

        <div style={s.tabBar}>
          <button
            style={activeTab === 'tokens' ? { ...s.tab, ...s.tabActive } : s.tab}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button
            style={activeTab === 'assessments' ? { ...s.tab, ...s.tabActive } : s.tab}
            onClick={() => setActiveTab('assessments')}
          >
            Assessments
          </button>
        </div>

        <main style={s.main}>
          {activeTab === 'tokens' ? (
            <>
              <GeneratePanel />
              <StatusPanel />
            </>
          ) : (
            <AssessmentsPanel />
          )}
        </main>
      </div>
    </>
  );
}

// ─── Shared: Send Link inline panel ──────────────────────────────────────────

function buildDefaultMessage(name, tokenUrl) {
  return `Hi ${name},

I'd like to invite you to take the MindPrint™ Assessment — a short exercise that identifies how you're naturally wired to think through and solve problems.

Your personal link: ${tokenUrl}

This link is unique to you and can only be used once. It will take approximately 10 minutes to complete.

Looking forward to sharing the results with you.

Ray Kearney
Curio`;
}

function SendLinkPanel({ token, participantName, participantEmail, tokenUrl, onClose, onSent }) {
  const [to, setTo] = useState(participantEmail || '');
  const [subject, setSubject] = useState("You're invited to take the MindPrint™ Assessment");
  const [message, setMessage] = useState(buildDefaultMessage(participantName || 'there', tokenUrl));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!to.trim()) return setError('Recipient email is required');
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/email/send-token-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, to: to.trim(), subject, message, participantEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      onSent();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={s.sendPanel}>
      <div style={s.sendPanelGrid}>
        <div style={s.sendField}>
          <label style={s.sendLabel}>To</label>
          <input style={s.sendInput} value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" />
        </div>
        <div style={s.sendField}>
          <label style={s.sendLabel}>Subject</label>
          <input style={s.sendInput} value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div style={{ ...s.sendField, gridColumn: '1 / -1' }}>
          <label style={s.sendLabel}>Message</label>
          <textarea style={s.sendTextarea} rows={8} value={message} onChange={e => setMessage(e.target.value)} />
        </div>
      </div>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.sendActions}>
        <button style={s.btn} onClick={send} disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Generate Panel ───────────────────────────────────────────────────────────

function GeneratePanel() {
  const [purpose, setPurpose] = useState('assessment');
  const [engagementId, setEngagementId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [participantText, setParticipantText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSendLink, setOpenSendLink] = useState(null);
  const [sentLinks, setSentLinks] = useState(new Set());

  async function generate() {
    setError('');
    setResults(null);
    setOpenSendLink(null);
    setSentLinks(new Set());
    const lines = participantText.trim().split('\n').filter(Boolean);
    const participants = lines.map(line => {
      const [name, email, company, role] = line.split(',').map(s => s.trim());
      return { name: name || '', email: email || '', company: company || '', role: role || '' };
    }).filter(p => p.name);

    if (!participants.length) return setError('Enter at least one participant (Name required, email optional)');
    if (!engagementId.trim()) return setError('Engagement ID is required');

    setLoading(true);
    try {
      const res = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Generate Tokens</h2>
      <div style={s.fieldGroup}>
        <label style={s.label}>Purpose</label>
        <select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}>
          <option value="assessment">Assessment</option>
          <option value="fit">Role Analyzer</option>
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
        <label style={s.label}>Participants — one per line: <code style={s.code}>Name, email, Company, Role</code> (email, Company, Role all optional)</label>
        <textarea
          style={s.textarea}
          value={participantText}
          onChange={e => setParticipantText(e.target.value)}
          placeholder={"Alex Smith, alex@example.com, Acme Corp, Engineer\nJordan Lee, jordan@example.com\nSam Taylor"}
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
                  {['Name', 'Email', 'Company', 'Role', 'URL', 'Copy', 'Send Link'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.flatMap((r, i) => {
                  const rows = [
                    <tr key={r.token} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{r.name}</td>
                      <td style={s.td}>{r.email || '—'}</td>
                      <td style={s.td}>{r.company || '—'}</td>
                      <td style={s.td}>{r.role || '—'}</td>
                      <td style={{ ...s.td, ...s.urlCell }}>{r.url}</td>
                      <td style={s.td}>
                        <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(r.url)}>Copy</button>
                      </td>
                      <td style={s.td}>
                        {sentLinks.has(r.token) ? (
                          <span style={s.sentBadge}>Sent ✓</span>
                        ) : (
                          <button
                            style={openSendLink === r.token ? s.sendLinkBtnActive : s.sendLinkBtn}
                            onClick={() => setOpenSendLink(openSendLink === r.token ? null : r.token)}
                          >
                            Send Link
                          </button>
                        )}
                      </td>
                    </tr>,
                  ];
                  if (openSendLink === r.token) {
                    rows.push(
                      <tr key={`${r.token}-panel`}>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                          <SendLinkPanel
                            token={r.token}
                            participantName={r.name}
                            participantEmail={r.email}
                            tokenUrl={r.url}
                            onClose={() => setOpenSendLink(null)}
                            onSent={() => {
                              setSentLinks(prev => new Set([...prev, r.token]));
                              setOpenSendLink(null);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Status Panel ─────────────────────────────────────────────────────────────

function StatusPanel() {
  const [engagementId, setEngagementId] = useState('');
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSendLink, setOpenSendLink] = useState(null);
  const [sentLinks, setSentLinks] = useState(new Set());
  const [sentProfiles, setSentProfiles] = useState(new Set());
  const [sendingProfile, setSendingProfile] = useState(null);

  async function load() {
    setError('');
    setTokens(null);
    setOpenSendLink(null);
    setSentLinks(new Set());
    setSentProfiles(new Set());
    if (!engagementId.trim()) return setError('Enter an Engagement ID');
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/status?engagement_id=${encodeURIComponent(engagementId.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTokens(data.tokens);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendProfile(t) {
    const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
    const profile = profileRaw ? String(profileRaw).toUpperCase() : null;
    if (!profile || !t.email) return;

    setSendingProfile(t.token);
    try {
      const res = await fetch('/api/email/send-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: t.name,
          participant_email: t.email,
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSentProfiles(prev => new Set([...prev, t.token]));
    } catch (e) {
      alert(`Failed to send profile: ${e.message}`);
    } finally {
      setSendingProfile(null);
    }
  }

  const used = tokens?.filter(t => t.used).length ?? 0;

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Engagement Status</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={s.label}>Engagement ID</label>
          <input
            style={s.input}
            value={engagementId}
            onChange={e => setEngagementId(e.target.value)}
            placeholder="e.g. acme-2026-q1"
            onKeyDown={e => e.key === 'Enter' && load()}
          />
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
                  {['Name', 'Email', 'Company', 'Role', 'Status', 'Link', 'Used At', 'Result', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.flatMap((t, i) => {
                  const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
                  const profile = profileRaw ? String(profileRaw).toUpperCase() : null;
                  const canSendProfile = t.used && profile && t.email;
                  const tokenUrl = `https://www.choosecurio.com/go/${t.token}`;

                  const mainRow = (
                    <tr key={t.token} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{t.name}</td>
                      <td style={s.td}>{t.email || '—'}</td>
                      <td style={s.td}>{t.company || '—'}</td>
                      <td style={s.td}>{t.role || '—'}</td>
                      <td style={s.td}>
                        <span style={t.used ? s.badgeUsed : s.badgePending}>
                          {t.used ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td style={s.td}>
                        {(t.link_sent_at || sentLinks.has(t.token)) ? (
                          <span style={s.badgeLinkSent}>Link Sent</span>
                        ) : '—'}
                      </td>
                      <td style={s.td}>{t.used_at ? new Date(t.used_at).toLocaleString() : '—'}</td>
                      <td style={s.td}>
                        {profile ? (
                          <span style={s.badgeType}>{profile}</span>
                        ) : '—'}
                      </td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {sentLinks.has(t.token) ? (
                            <span style={s.sentBadge}>Sent ✓</span>
                          ) : (
                            <button
                              style={openSendLink === t.token ? s.sendLinkBtnActive : s.sendLinkBtn}
                              onClick={() => setOpenSendLink(openSendLink === t.token ? null : t.token)}
                            >
                              Send Link
                            </button>
                          )}
                          {canSendProfile && (
                            sentProfiles.has(t.token) ? (
                              <span style={s.sentBadge}>Profile Sent ✓</span>
                            ) : (
                              <button
                                style={s.sendProfileBtn}
                                onClick={() => sendProfile(t)}
                                disabled={sendingProfile === t.token}
                              >
                                {sendingProfile === t.token ? 'Sending…' : 'Send Profile'}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );

                  if (openSendLink !== t.token) return [mainRow];

                  return [
                    mainRow,
                    <tr key={`${t.token}-panel`}>
                      <td colSpan={9} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                        <SendLinkPanel
                          token={t.token}
                          participantName={t.name}
                          participantEmail={t.email}
                          tokenUrl={tokenUrl}
                          onClose={() => setOpenSendLink(null)}
                          onSent={() => {
                            setSentLinks(prev => new Set([...prev, t.token]));
                            setTokens(prev => prev.map(tok =>
                              tok.token === t.token
                                ? { ...tok, link_sent_at: new Date().toISOString() }
                                : tok
                            ));
                            setOpenSendLink(null);
                          }}
                        />
                      </td>
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Assessments Panel ────────────────────────────────────────────────────────

function AssessmentsPanel() {
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assessments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAssessments(data.assessments);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Assessment Submissions</h2>
      <button style={s.btn} onClick={load} disabled={loading}>
        {loading ? 'Loading…' : 'Load'}
      </button>
      {error && <p style={s.error}>{error}</p>}

      {assessments && (
        <div style={{ marginTop: 24 }}>
          <p style={s.summary}>
            <strong>{assessments.length}</strong> assessment{assessments.length !== 1 ? 's' : ''}
          </p>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Reg. Name', 'Reg. Email', 'Quiz Name', 'Quiz Email', 'Company', 'Role', 'Type', 'H Score', 'W Score', 'Y Score', 'Submitted At'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr key={a.id || i} style={i % 2 === 0 ? s.trEven : {}}>
                    <td style={s.td}>{a.reg_name || '—'}</td>
                    <td style={s.td}>{a.reg_email || '—'}</td>
                    <td style={s.td}>{a.name || '—'}</td>
                    <td style={s.td}>{a.email || '—'}</td>
                    <td style={s.td}>{a.company || '—'}</td>
                    <td style={s.td}>{a.role || '—'}</td>
                    <td style={s.td}>
                      {a.type ? (
                        <span style={s.badgeType}>{a.type.toUpperCase()}</span>
                      ) : '—'}
                    </td>
                    <td style={s.td}>{a.h_score ?? '—'}</td>
                    <td style={s.td}>{a.w_score ?? '—'}</td>
                    <td style={s.td}>{a.y_score ?? '—'}</td>
                    <td style={s.td}>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {assessments.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ ...s.td, color: '#94A3B8', textAlign: 'center', padding: '24px 12px' }}>
                      No assessments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  tabBar: {
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    padding: '0 32px',
    display: 'flex',
    gap: 0,
  },
  tab: {
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#64748B',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: -1,
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: '#059669',
    borderBottom: '2px solid #059669',
    fontWeight: 600,
  },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 },
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
  urlCell: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: { padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  summary: { fontSize: '0.95rem', marginBottom: 12, color: '#374151' },
  badgeUsed: { background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgePending: { background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeLinkSent: { background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeType: { background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' },
  sentBadge: { color: '#059669', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' },
  sendLinkBtn: { padding: '4px 10px', background: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendLinkBtnActive: { padding: '4px 10px', background: '#059669', color: '#fff', border: '1px solid #059669', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendProfileBtn: { padding: '4px 10px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  // Send link panel
  sendPanel: { padding: '20px 24px', background: '#F8FAFC', borderTop: '2px solid #059669' },
  sendPanelGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 12 },
  sendField: {},
  sendLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 },
  sendInput: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E2E8F0', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  sendTextarea: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E2E8F0', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 },
  sendActions: { display: 'flex', gap: 8, marginTop: 4 },
};
