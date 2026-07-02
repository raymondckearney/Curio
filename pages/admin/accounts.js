import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LICENSE_TYPES = ['assessment_tokens', 'role_analyzer', 'jd_analyzer'];

export default function AdminAccountsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? setAuthed(true) : router.replace('/admin/login'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!authed) return null;

  return (
    <>
      <Head>
        <title>Accounts — Curio Admin</title>
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
          {[
            { label: 'Tokens', href: '/admin/tokens' },
            { label: 'Career Reports', href: '/admin/career-reports' },
            { label: 'Accounts', href: '/admin/accounts' },
          ].map(tab => (
            <button
              key={tab.label}
              style={tab.href === '/admin/accounts' ? { ...s.tab, ...s.tabActive } : s.tab}
              onClick={() => router.push(tab.href)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main style={s.main}>
          <AccountsMain />
        </main>
      </div>
    </>
  );
}

function AccountsMain() {
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [editId, setEditId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/accounts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAccounts(data.accounts);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const stats = accounts ? {
    total: accounts.length,
    basic: accounts.filter(a => !a.tier || a.tier === 'basic').length,
    premium: accounts.filter(a => a.tier === 'premium').length,
    activeThisMonth: accounts.filter(a =>
      (a.users || []).some(u => u.last_login_at && new Date(u.last_login_at) > thirtyDaysAgo)
    ).length,
  } : null;

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div style={s.statsRow}>
          <StatCard label="Total Accounts" value={stats.total} color="#059669" />
          <StatCard label="Basic" value={stats.basic} color="#64748B" />
          <StatCard label="Premium" value={stats.premium} color="#D97706" />
          <StatCard label="Active (30d)" value={stats.activeThisMonth} color="#2563EB" />
        </div>
      )}

      {/* Header */}
      <div style={s.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ ...s.panelTitle, marginBottom: 0 }}>Client Accounts</h2>
          <button style={s.btn} onClick={() => { setShowInvite(true); setActionMsg(''); }}>+ Invite New Account</button>
        </div>

        {actionMsg && <div style={s.successMsg}>{actionMsg}</div>}

        {showInvite && (
          <InvitePanel
            onClose={() => setShowInvite(false)}
            onSuccess={msg => { setActionMsg(msg); setShowInvite(false); load(); }}
          />
        )}

        {loading && <p style={s.muted}>Loading…</p>}
        {error && <p style={s.error}>{error}</p>}

        {accounts && accounts.length === 0 && <p style={s.muted}>No accounts yet.</p>}

        {accounts && accounts.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Tier', 'Provider', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.flatMap((acc, i) => {
                  const primaryUser = (acc.users || [])[0];
                  const provider = primaryUser?.provider || 'email';
                  const lastLogin = primaryUser?.last_login_at
                    ? new Date(primaryUser.last_login_at).toLocaleDateString()
                    : 'Never';
                  const created = new Date(acc.created_at).toLocaleDateString();
                  const status = acc.status || 'active';

                  const mainRow = (
                    <tr key={acc.id} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{acc.name}</td>
                      <td style={{ ...s.td, fontSize: '0.82rem' }}>{primaryUser?.email || '—'}</td>
                      <td style={s.td}>
                        <span style={acc.tier === 'premium' ? s.badgePremium : s.badgeBasic}>{acc.tier || 'basic'}</span>
                      </td>
                      <td style={s.td}>
                        <span style={provider === 'google' ? s.badgeGoogle : s.badgeEmail}>{provider}</span>
                      </td>
                      <td style={s.td}>
                        <span style={status === 'active' ? s.badgeActive : s.badgeRevoked}>{status}</span>
                      </td>
                      <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B' }}>{lastLogin}</td>
                      <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B' }}>{created}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button style={s.actionBtn} onClick={() => setEditId(editId === acc.id ? null : acc.id)}>
                            {editId === acc.id ? 'Close' : 'Edit'}
                          </button>
                          {provider === 'email' ? (
                            <ResendInviteButton accountId={acc.id} />
                          ) : (
                            <span style={s.muted}>—</span>
                          )}
                          <RevokeButton account={acc} onDone={() => { load(); setEditId(null); }} />
                        </div>
                      </td>
                    </tr>
                  );

                  if (editId !== acc.id) return [mainRow];

                  return [
                    mainRow,
                    <tr key={`${acc.id}-edit`}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <EditPanel account={acc} onClose={() => setEditId(null)} onSave={() => { load(); setEditId(null); }} />
                      </td>
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderTop: `3px solid ${color}`, borderRadius: 10, padding: '18px 22px', flex: 1 }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ResendInviteButton({ accountId }) {
  const [state, setState] = useState('idle'); // idle | sending | done | error
  async function resend() {
    setState('sending');
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/resend-invite`, { method: 'POST' });
      setState(res.ok ? 'done' : 'error');
    } catch { setState('error'); }
  }
  if (state === 'done') return <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>✓ Sent</span>;
  if (state === 'error') return <span style={{ color: '#EF4444', fontSize: '0.78rem' }}>Failed</span>;
  return (
    <button style={s.actionBtn} onClick={resend} disabled={state === 'sending'}>
      {state === 'sending' ? '…' : 'Resend'}
    </button>
  );
}

function RevokeButton({ account, onDone }) {
  const [loading, setLoading] = useState(false);
  const isRevoked = account.status === 'inactive';

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/admin/accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isRevoked ? 'active' : 'inactive' }),
      });
      onDone();
    } catch {}
    setLoading(false);
  }

  return (
    <button
      style={{ ...s.actionBtn, color: isRevoked ? '#059669' : '#EF4444', borderColor: isRevoked ? '#BBF7D0' : '#FCA5A5' }}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? '…' : isRevoked ? 'Restore' : 'Revoke'}
    </button>
  );
}

function InvitePanel({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('basic');
  const [licenses, setLicenses] = useState([]);
  const [licType, setLicType] = useState('role_analyzer');
  const [licQty, setLicQty] = useState('');
  const [licExpiry, setLicExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addLicense() {
    setLicenses(prev => [...prev, { type: licType, quantity: licQty || null, expires_at: licExpiry || null }]);
    setLicQty(''); setLicExpiry('');
  }

  async function submit() {
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/accounts/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), tier, licenses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess(`Account created and invite sent to ${email.trim()}`);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.editPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invite New Account</span>
        <button style={s.closeBtn} onClick={onClose}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
        <div>
          <label style={s.fieldLabel}>Name</label>
          <input style={s.fieldInput} value={name} onChange={e => setName(e.target.value)} placeholder="Alex Smith" />
        </div>
        <div>
          <label style={s.fieldLabel}>Email *</label>
          <input style={s.fieldInput} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" />
        </div>
        <div>
          <label style={s.fieldLabel}>Tier</label>
          <select style={s.fieldInput} value={tier} onChange={e => setTier(e.target.value)}>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Licenses</p>
        {licenses.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.82rem' }}>
            <span style={s.badgeBasic}>{l.type.replace(/_/g, ' ')}</span>
            {l.quantity && <span>× {l.quantity}</span>}
            {l.expires_at && <span style={{ color: '#94A3B8' }}>exp {l.expires_at}</span>}
            <button style={{ ...s.closeBtn, fontSize: '0.9rem' }} onClick={() => setLicenses(prev => prev.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={s.fieldLabel}>Type</label>
            <select style={s.fieldInput} value={licType} onChange={e => setLicType(e.target.value)}>
              {LICENSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label style={s.fieldLabel}>Qty</label>
            <input style={{ ...s.fieldInput, width: 70 }} type="number" value={licQty} onChange={e => setLicQty(e.target.value)} placeholder="—" />
          </div>
          <div>
            <label style={s.fieldLabel}>Expiry</label>
            <input style={s.fieldInput} type="date" value={licExpiry} onChange={e => setLicExpiry(e.target.value)} />
          </div>
          <button style={s.btnSmall} onClick={addLicense}>+ Add</button>
        </div>
      </div>

      {error && <p style={s.error}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={s.btn} onClick={submit} disabled={loading}>{loading ? 'Sending…' : 'Create & Send Invite'}</button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function EditPanel({ account, onClose, onSave }) {
  const [tier, setTier] = useState(account.tier || 'basic');
  const [licenses, setLicenses] = useState(account.licenses || []);
  const [licType, setLicType] = useState('role_analyzer');
  const [licQty, setLicQty] = useState('');
  const [licExpiry, setLicExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addLicense() {
    setLicenses(prev => [...prev, { type: licType, quantity: licQty || null, expires_at: licExpiry || null }]);
    setLicQty(''); setLicExpiry('');
  }

  async function save() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, licenses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSave();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.editPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Edit — {account.name}</span>
        <button style={s.closeBtn} onClick={onClose}>×</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={s.fieldLabel}>Tier</label>
        <select style={{ ...s.fieldInput, maxWidth: 160 }} value={tier} onChange={e => setTier(e.target.value)}>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Licenses</p>
        {licenses.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.82rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 10px' }}>
            <span style={{ flex: 1, fontWeight: 500 }}>{l.type.replace(/_/g, ' ')}</span>
            {l.quantity && <span style={{ color: '#64748B' }}>× {l.quantity}</span>}
            {l.expires_at && <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>exp {new Date(l.expires_at).toLocaleDateString()}</span>}
            <button style={{ ...s.closeBtn, fontSize: '0.9rem' }} onClick={() => setLicenses(prev => prev.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={s.fieldLabel}>Type</label>
            <select style={s.fieldInput} value={licType} onChange={e => setLicType(e.target.value)}>
              {LICENSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label style={s.fieldLabel}>Qty</label>
            <input style={{ ...s.fieldInput, width: 70 }} type="number" value={licQty} onChange={e => setLicQty(e.target.value)} placeholder="—" />
          </div>
          <div>
            <label style={s.fieldLabel}>Expiry</label>
            <input style={s.fieldInput} type="date" value={licExpiry} onChange={e => setLicExpiry(e.target.value)} />
          </div>
          <button style={s.btnSmall} onClick={addLicense}>+ Add</button>
        </div>
      </div>

      {error && <p style={s.error}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={s.btn} onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  header: { background: '#0F172A', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  dot: { color: '#059669' },
  headerTitle: { fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 4 },
  signOut: { marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tabBar: { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 28px', display: 'flex', gap: 4 },
  tab: { padding: '14px 18px', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#64748B', fontFamily: "'DM Sans', sans-serif", marginBottom: -1 },
  tabActive: { color: '#0F172A', borderBottomColor: '#059669' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  statsRow: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  panel: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  panelTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, marginTop: 0 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', fontSize: '0.8rem' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  muted: { color: '#94A3B8', fontSize: '0.875rem' },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '8px 0 0' },
  successMsg: { background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: '0.875rem', color: '#166534', marginBottom: 16 },
  btn: { padding: '9px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  btnSmall: { padding: '7px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', alignSelf: 'flex-end' },
  btnSecondary: { padding: '9px 18px', background: '#F1F5F9', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  actionBtn: { padding: '4px 10px', background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 },
  editPanel: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderTop: '3px solid #059669', padding: '20px 24px', marginBottom: 0 },
  fieldLabel: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' },
  fieldInput: { width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box', background: '#fff' },
  badgeBasic: { background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgePremium: { background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeEmail: { background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeGoogle: { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeActive: { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
  badgeRevoked: { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 },
};
