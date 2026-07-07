import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from './dashboard';

const TYPE_COLORS = { 'why-what': '#10B981', 'why-how': '#059669', 'what-why': '#3B82F6', 'what-how': '#2563EB', 'how-why': '#D97706', 'how-what': '#B45309' };

export default function PortalTeam() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null); // { ok, text }

  // Remove state
  const [removingId, setRemovingId] = useState(null);

  async function load() {
    const [meRes, dashRes, teamRes] = await Promise.all([
      fetch('/api/portal/me'),
      fetch('/api/portal/dashboard'),
      fetch('/api/portal/team'),
    ]);
    if (!meRes.ok) throw new Error('unauth');
    return {
      me: await meRes.json(),
      dash: dashRes.ok ? await dashRes.json() : null,
      team: teamRes.ok ? await teamRes.json() : null,
    };
  }

  useEffect(() => {
    load()
      .then(({ me, dash, team }) => { setMe(me); setDash(dash); setData(team); })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviteMsg(null); setInviting(true);
    try {
      const res = await fetch('/api/portal/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, memberRole: inviteRole }),
      });
      const d = await res.json();
      if (!res.ok) { setInviteMsg({ ok: false, text: d.error || 'Failed to invite.' }); return; }
      setInviteMsg({ ok: true, text: `Invite sent to ${inviteEmail}.` });
      setInviteEmail(''); setInviteName(''); setInviteRole('member');
      // Refresh
      const teamRes = await fetch('/api/portal/team');
      if (teamRes.ok) setData(await teamRes.json());
    } catch { setInviteMsg({ ok: false, text: 'Network error.' }); }
    finally { setInviting(false); }
  }

  async function handleRemove(userId, userEmail) {
    if (!confirm(`Remove ${userEmail} from the team? They will lose portal access.`)) return;
    setRemovingId(userId);
    try {
      const res = await fetch('/api/portal/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setData(prev => ({ ...prev, members: prev.members.filter(m => m.id !== userId) }));
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to remove user.');
      }
    } catch { alert('Network error.'); }
    finally { setRemovingId(null); }
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const isOwner = me.user.role === 'owner';
  const pool = data?.tokenPool;
  const members = data?.members || [];

  return (
    <>
      <Head>
        <title>My Team — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <PortalNav me={me} onLogout={logout} active="team" licenses={dash?.licenses} isIndividual={!!dash?.myAssessment} />
        <main style={s.main}>
          <h1 style={s.pageTitle}>My Team</h1>

          {/* Token pool summary */}
          {pool && (
            <div style={s.poolRow}>
              {[
                { label: 'Total Tokens', value: pool.total, color: '#0F172A' },
                { label: 'Available', value: pool.available, color: '#1D4ED8' },
                { label: 'Sent', value: pool.sent, color: '#D97706' },
                { label: 'Completed', value: pool.completed, color: '#059669' },
              ].map(({ label, value, color }) => (
                <div key={label} style={s.poolCard}>
                  <span style={{ ...s.poolNum, color }}>{value}</span>
                  <span style={s.poolLabel}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Invite form (owners only) */}
          {isOwner && (
            <div style={{ ...s.panel, marginBottom: 24 }}>
              <h2 style={s.sectionTitle}>Invite a Team Member</h2>
              <p style={s.sectionSub}>They'll receive an email to set up their portal account.</p>
              <form onSubmit={handleInvite} style={s.inviteForm}>
                <div style={s.inviteFields}>
                  <div style={s.field}>
                    <label style={s.label}>Email *</label>
                    <input style={s.input} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@company.com" required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Name <span style={s.optional}>(optional)</span></label>
                    <input style={s.input} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Alex Smith" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Role</label>
                    <select style={s.select} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                      <option value="member">Member</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>
                {inviteMsg && (
                  <p style={{ color: inviteMsg.ok ? '#059669' : '#DC2626', fontSize: '0.875rem', margin: '8px 0' }}>
                    {inviteMsg.ok ? '✓ ' : ''}{inviteMsg.text}
                  </p>
                )}
                <button type="submit" style={{ ...s.btn, opacity: inviting ? 0.7 : 1 }} disabled={inviting}>
                  {inviting ? 'Sending invite…' : 'Send Invite'}
                </button>
              </form>
            </div>
          )}

          {/* Team members table */}
          <div style={s.panel}>
            <h2 style={s.sectionTitle}>Team Members</h2>
            <p style={s.sectionSub}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
            {members.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No team members yet.</p>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Name', 'Email', 'Role', 'Assessment', 'Profile', 'Joined', ...(isOwner ? ['Actions'] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => {
                      const color = TYPE_COLORS[m.assessment_type] || '#64748B';
                      const isSelf = m.id === me.user.id;
                      return (
                        <tr key={m.id} style={i % 2 === 0 ? s.trEven : {}}>
                          <td style={{ ...s.td, fontWeight: 500 }}>{m.name || '—'} {isSelf ? <span style={s.youBadge}>you</span> : null}</td>
                          <td style={{ ...s.td, fontSize: '0.82rem' }}>{m.email}</td>
                          <td style={s.td}><span style={m.role === 'owner' ? s.badgeOwner : s.badgeMember}>{m.role}</span></td>
                          <td style={s.td}>
                            <span style={statusBadge[m.token_status] || s.badgeMember}>
                              {statusLabel[m.token_status] || '—'}
                            </span>
                          </td>
                          <td style={s.td}>
                            {m.assessment_type ? (
                              <span style={{ ...s.profileBadge, background: `${color}15`, color, borderColor: `${color}40` }}>
                                {m.assessment_type.toUpperCase()}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ ...s.td, fontSize: '0.82rem', color: '#64748B' }}>
                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                          </td>
                          {isOwner && (
                            <td style={s.td}>
                              {!isSelf && (
                                <button
                                  style={s.removeBtn}
                                  onClick={() => handleRemove(m.id, m.email)}
                                  disabled={removingId === m.id}
                                >
                                  {removingId === m.id ? 'Removing…' : 'Remove'}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const statusLabel = { completed: 'Completed', invited: 'Invited', assigned: 'Assigned', no_token: 'No Token' };
const statusBadge = {
  completed: { background: '#D1FAE5', color: '#065F46', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  invited:   { background: '#EFF6FF', color: '#1D4ED8', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  assigned:  { background: '#FEF9C3', color: '#92400E', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  no_token:  { background: '#F1F5F9', color: '#94A3B8', padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
};

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { maxWidth: 1000, margin: '0 auto', padding: '36px 24px' },
  pageTitle: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, marginBottom: 20 },
  poolRow: { display: 'flex', gap: 16, marginBottom: 28 },
  poolCard: { flex: 1, background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 4 },
  poolNum: { fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 },
  poolLabel: { fontSize: '0.8rem', color: '#64748B', fontWeight: 500 },
  panel: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 2, marginTop: 0 },
  sectionSub: { fontSize: '0.85rem', color: '#64748B', marginBottom: 18 },
  inviteForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  inviteFields: { display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  optional: { fontWeight: 400, color: '#94A3B8' },
  input: { padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fff' },
  select: { padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", background: '#fff' },
  btn: { alignSelf: 'flex-start', padding: '10px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '9px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  badgeOwner: { background: '#1E3A5F', color: '#fff', padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' },
  badgeMember: { background: '#F1F5F9', color: '#475569', padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' },
  profileBadge: { padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', border: '1px solid transparent', whiteSpace: 'nowrap' },
  youBadge: { background: '#F0FDF4', color: '#059669', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, marginLeft: 4 },
  removeBtn: { padding: '4px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};
