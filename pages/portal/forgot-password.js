import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/portal/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {}
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Reset Password — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>
          <div style={s.eyebrow}>Client Portal</div>
          <h1 style={s.heading}>Reset your password</h1>

          {submitted ? (
            <div style={s.confirm}>
              <div style={s.confirmIcon}>✓</div>
              <p style={s.confirmText}>If that email exists in our system, you'll receive a reset link shortly.</p>
              <Link href="/portal/login" style={s.backLink}>← Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Email address</label>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link href="/portal/login" style={s.backLink}>← Back to sign in</Link>
              </div>
            </form>
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
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '13px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  backLink: { fontSize: '0.85rem', color: '#64748B', textDecoration: 'none', fontWeight: 500 },
  confirm: { textAlign: 'center' },
  confirmIcon: { width: 48, height: 48, borderRadius: '50%', background: '#D1FAE5', color: '#059669', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  confirmText: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, marginBottom: 24 },
};
