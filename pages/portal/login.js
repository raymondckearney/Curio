import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  async function handleGoogle(response) {
    setGLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.status === 409) { setError('This email is registered with a password. Please sign in below.'); return; }
      if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
      router.push('/portal/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setGLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogle,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('g-signin-btn'),
      { theme: 'outline', size: 'large', width: 360 }
    );
  });

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

          <div id="g-signin-btn" style={{ marginBottom: 8 }} />
          {gLoading && <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 8 }}>Signing in with Google…</p>}

          <div style={s.divider}><span style={s.dividerText}>or</span></div>

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
              <a href="/portal/forgot-password" style={s.forgotLink}>Forgot your password?</a>
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
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: 20, lineHeight: 1.25 },
  divider: { display: 'flex', alignItems: 'center', margin: '16px 0', gap: 10 },
  dividerText: { fontSize: '0.8rem', color: '#94A3B8', background: '#fff', padding: '0 8px', flexShrink: 0, margin: '0 auto', border: '1px solid #E2E8F0', borderRadius: 4, lineHeight: '1.6' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box', outline: 'none' },
  forgotLink: { display: 'block', marginTop: 6, fontSize: '0.8rem', color: '#64748B', textDecoration: 'none' },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '0 0 12px' },
  btn: { width: '100%', padding: '13px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 4 },
  footer: { textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', marginTop: 24 },
};
