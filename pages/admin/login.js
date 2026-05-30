import Head from 'next/head';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) return { redirect: { destination: '/admin/tokens', permanent: false } };
  return { props: {} };
}

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) {
      router.push('/admin/tokens');
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <>
      <Head>
        <title>Admin — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>Curio<span style={styles.dot}>.</span></div>
          <h1 style={styles.title}>Admin</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8FAFC',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo: {
    fontFamily: "'Caveat', cursive",
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 8,
  },
  dot: { color: '#059669' },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#64748B',
    marginBottom: 32,
    marginTop: 0,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginTop: 8 },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #E2E8F0',
    fontSize: '1rem',
    fontFamily: "'DM Sans', sans-serif",
    color: '#0F172A',
    outline: 'none',
  },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '4px 0 0' },
  button: {
    marginTop: 16,
    padding: '12px',
    background: '#059669',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
};
