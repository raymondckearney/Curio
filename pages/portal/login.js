import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Email and password required');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/portal/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Client Portal — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>
          <div style={s.eyebrow}>Client Portal</div>
          <h1 style={s.heading}>Sign in to your account</h1>
          <form onSubmit={login}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={s.footer}>Don't have credentials? Contact your Curio account manager.</p>
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
  btn: { width: '100%', padding: '13px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 4 },
  footer: { textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', marginTop: 24 },
};
