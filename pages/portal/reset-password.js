import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [valid, setValid] = useState(null); // null=loading, true, false
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/portal/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => setValid(d.valid))
      .catch(() => setValid(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      router.push('/portal/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Set New Password — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>
          <div style={s.eyebrow}>Client Portal</div>

          {valid === null && (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Verifying your link…</p>
          )}

          {valid === false && (
            <div style={s.errState}>
              <h1 style={s.heading}>Link expired or invalid</h1>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.7, marginBottom: 24 }}>
                This reset link has expired or has already been used. Request a new one below.
              </p>
              <Link href="/portal/forgot-password" style={s.btn}>Request new link</Link>
            </div>
          )}

          {valid === true && (
            <>
              <h1 style={s.heading}>Set new password</h1>
              <form onSubmit={handleSubmit}>
                <div style={s.field}>
                  <label style={s.label}>New password</label>
                  <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Confirm password</label>
                  <input style={s.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter your password" required />
                </div>
                {error && <p style={s.error}>{error}</p>}
                <button style={s.btn} type="submit" disabled={loading}>
                  {loading ? 'Setting password…' : 'Set password & sign in'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', fontFamily: "'DM Sans', sans-serif", padding: '24px 16px' },
  card: { background: '#fff', borderRadius: 16, padding: 'clamp(36px,6vw,52px) clamp(28px,5vw,48px)', maxWidth: 440, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', marginBottom: 24 },
  dot: { color: '#059669' },
  eyebrow: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#059669', marginBottom: 8 },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: 28, lineHeight: 1.25 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box', outline: 'none' },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '0 0 12px' },
  btn: { display: 'block', width: '100%', padding: '13px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' },
  errState: { marginTop: 4 },
};
