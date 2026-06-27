import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const router = useRouter();
  const { name: qName = '', email: qEmail = '', session_id = '' } = router.query;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from query params once router is ready
  const displayName = name || qName;
  const displayEmail = email || qEmail;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const finalName = displayName;
    const finalEmail = displayEmail;
    if (!finalName || !finalEmail || !password) { setError('All fields are required.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: finalName, email: finalEmail, password, stripe_session_id: session_id || undefined }),
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
        <title>Create your account — Curio</title>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <a href="/" style={s.wordmark}>Curio<span style={s.dot}>.</span></a>
        </header>
        <main style={s.main}>
          <div style={s.card}>
            <h1 style={s.title}>Create your account</h1>
            <p style={s.sub}>Access your assessment results and Role Analyzer history in one place.</p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  value={displayName}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Smith"
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <input
                  style={s.input}
                  type="email"
                  value={displayEmail}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input
                  style={s.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Confirm Password</label>
                <input
                  style={s.input}
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              {error && <p style={s.error}>{error}</p>}
              <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>

            <p style={s.loginNote}>
              Already have an account? <a href="/portal/login" style={s.link}>Log in</a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  header: { background: '#0F172A', padding: '18px 40px' },
  wordmark: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, color: '#fff', textDecoration: 'none' },
  dot: { color: '#059669' },
  main: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, marginBottom: 8, color: '#0F172A', textAlign: 'center' },
  sub: { fontSize: '0.95rem', color: '#475569', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fff', boxSizing: 'border-box', width: '100%' },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: 0 },
  btn: { width: '100%', padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 4 },
  loginNote: { textAlign: 'center', fontSize: '0.875rem', color: '#64748B', marginTop: 24 },
  link: { color: '#059669', textDecoration: 'none', fontWeight: 500 },
};
