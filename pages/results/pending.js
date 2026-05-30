import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ResultsPending() {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading | timeout

  useEffect(() => {
    if (!router.isReady) return;

    const { token, name } = router.query;
    if (!token) {
      setStatus('timeout');
      return;
    }

    let attempts = 0;
    const maxAttempts = 20; // 10 seconds total

    const poll = async () => {
      try {
        const res = await fetch(`/api/assessments/lookup?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.type) {
            const dest = `/results/${data.type}${name ? `?name=${encodeURIComponent(name)}` : ''}`;
            window.location.href = dest;
            return;
          }
        }
      } catch {}

      attempts++;
      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }
      setTimeout(poll, 500);
    };

    // Small initial delay to give the webhook time to fire
    setTimeout(poll, 800);
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Loading your results… — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>
          {status === 'loading' ? (
            <>
              <div style={s.spinner} />
              <h1 style={s.title}>Preparing your profile…</h1>
              <p style={s.body}>This only takes a moment.</p>
            </>
          ) : (
            <>
              <h1 style={s.title}>Taking longer than expected.</h1>
              <p style={s.body}>Your results are still being processed. Please contact your Curio coordinator if this persists.</p>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", padding: 24,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: '48px 40px',
    maxWidth: 420, width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    borderLeft: '3px solid #059669',
    textAlign: 'center',
  },
  logo: {
    fontFamily: "'Caveat', cursive", fontSize: '1.6rem', fontWeight: 700,
    color: '#1C1917', marginBottom: 28, display: 'block',
  },
  dot: { color: '#059669' },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #E7E5E4', borderTopColor: '#059669',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 24px',
  },
  title: { fontSize: '1.1rem', fontWeight: 600, color: '#1C1917', marginBottom: 10 },
  body: { fontSize: '0.9rem', color: '#78716C', lineHeight: 1.7 },
};
