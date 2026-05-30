import Head from 'next/head';
import { useTokenGate } from '../../hooks/useTokenGate';

export default function TokenTest() {
  const { status, participant, consume } = useTokenGate('test');

  async function handleComplete() {
    const result = await consume({ completed_at: new Date().toISOString(), demo: true });
    alert(result.success ? 'Token consumed!' : `Failed: ${result.status}`);
  }

  return (
    <>
      <Head>
        <title>Token Gate Test — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>
          <div style={s.label}>Token Gate Demo</div>
          <Content status={status} participant={participant} onComplete={handleComplete} />
        </div>
      </div>
    </>
  );
}

function Content({ status, participant, onComplete }) {
  if (status === 'loading') {
    return (
      <div style={s.state}>
        <div style={s.spinner} />
        <p style={s.stateText}>Validating your link…</p>
      </div>
    );
  }

  if (status === 'valid') {
    return (
      <div style={s.state}>
        <div style={s.iconGreen}>✓</div>
        <h2 style={s.welcome}>Welcome, {participant?.name}!</h2>
        <p style={s.stateText}>Your link is valid. Click below to mark it as complete.</p>
        <button style={s.btn} onClick={onComplete}>Complete Activity</button>
      </div>
    );
  }

  const states = {
    used: { icon: '⊘', color: '#64748B', title: 'Already completed', body: 'This link has already been used.' },
    expired: { icon: '⏱', color: '#D97706', title: 'Link expired', body: 'This link has passed its expiry date.' },
    not_found: { icon: '✕', color: '#DC2626', title: 'Link not found', body: 'This link is invalid or does not exist.' },
    no_token: { icon: '⚠', color: '#D97706', title: 'No token', body: 'No token was found in the URL. Add ?token=... to test.' },
  };

  const { icon, color, title, body } = states[status] || states.not_found;

  return (
    <div style={s.state}>
      <div style={{ ...s.iconBad, color }}>{icon}</div>
      <h2 style={{ ...s.welcome, color }}>{title}</h2>
      <p style={s.stateText}>{body}</p>
      <p style={s.statusChip}>status: <code>{status}</code></p>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  dot: { color: '#059669' },
  label: { fontSize: '0.85rem', color: '#64748B', marginBottom: 32, fontWeight: 500 },
  state: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  spinner: { width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  iconGreen: { fontSize: '2.5rem', color: '#059669', lineHeight: 1 },
  iconBad: { fontSize: '2.5rem', lineHeight: 1 },
  welcome: { fontSize: '1.3rem', fontWeight: 600, color: '#0F172A', margin: 0 },
  stateText: { fontSize: '0.95rem', color: '#64748B', margin: 0, lineHeight: 1.6 },
  btn: { marginTop: 8, padding: '12px 28px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  statusChip: { fontSize: '0.8rem', color: '#94A3B8', marginTop: 8 },
};
