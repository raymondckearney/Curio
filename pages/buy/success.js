import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function BuySuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) return;
    fetch(`/api/stripe/session?session_id=${session_id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setSession(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session_id]);

  const name = session?.customer_name || session?.metadata?.buyer_name || '';
  const email = session?.customer_email || session?.metadata?.buyer_email || '';
  const product = session?.metadata?.product;
  const isCombo = product === 'assessment_analyzer';

  const signupUrl = `/signup?${new URLSearchParams({ name, email, session_id: session_id || '' })}`;

  return (
    <>
      <Head>
        <title>You're all set — Curio</title>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <a href="/" style={s.wordmark}>Curio<span style={s.dot}>.</span></a>
        </header>
        <main style={s.main}>
          <div style={s.card}>
            <div style={s.icon}>✓</div>
            {loading ? (
              <p style={s.sub}>Loading your order…</p>
            ) : (
              <>
                <h1 style={s.title}>
                  You're all set{name ? `, ${name.split(' ')[0]}` : ''}.
                </h1>
                {isCombo ? (
                  <p style={s.sub}>Your Assessment and Role Analyzer links have both been sent to <strong>{email}</strong>. Check your inbox — they should arrive within a minute.</p>
                ) : (
                  <p style={s.sub}>Your assessment link has been sent to <strong>{email}</strong>. Check your inbox — it should arrive within a minute.</p>
                )}

                <div style={s.accountBox}>
                  <p style={s.accountTitle}>Save your results</p>
                  <p style={s.accountDesc}>Create a free account to access your assessment results and Role Analyzer history anytime.</p>
                  <a href={signupUrl} style={s.accountBtn}>Create your account →</a>
                  <p style={s.accountSkip}>Already have one? <a href="/portal/login" style={s.link}>Log in</a></p>
                </div>

                <p style={s.note}>Don't see your email? Check your spam folder or contact <a href="mailto:hello@choosecurio.com" style={s.link}>hello@choosecurio.com</a></p>
              </>
            )}
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
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 520, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' },
  icon: { width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', color: '#059669', fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, marginBottom: 16, color: '#0F172A' },
  sub: { fontSize: '1rem', color: '#475569', lineHeight: 1.7, marginBottom: 24 },
  accountBox: { background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '24px', marginBottom: 24 },
  accountTitle: { fontWeight: 700, color: '#065F46', fontSize: '1rem', margin: '0 0 6px' },
  accountDesc: { fontSize: '0.875rem', color: '#047857', lineHeight: 1.6, margin: '0 0 16px' },
  accountBtn: { display: 'inline-block', padding: '11px 24px', background: '#059669', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem' },
  accountSkip: { fontSize: '0.8rem', color: '#6EE7B7', marginTop: 12, marginBottom: 0 },
  note: { fontSize: '0.85rem', color: '#94A3B8' },
  link: { color: '#059669', textDecoration: 'none', fontWeight: 500 },
};
