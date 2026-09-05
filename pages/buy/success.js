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
    let attempts = 0;
    const maxAttempts = 8;
    const delay = 1500; // ms between retries

    async function poll() {
      try {
        const r = await fetch(`/api/stripe/session?session_id=${session_id}`);
        const data = r.ok ? await r.json() : null;
        setSession(data);
        if (data?.assessmentUrl) {
          // Token ready — show the button immediately
          setLoading(false);
        } else if (attempts < maxAttempts) {
          // Keep spinner up, retry shortly
          attempts++;
          setTimeout(poll, delay);
        } else {
          // All retries exhausted — fall back to inbox message
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
    poll();
  }, [session_id]);

  const name = session?.metadata?.buyer_name || session?.customer_name || '';
  const email = session?.metadata?.buyer_email || session?.customer_email || '';
  const product = session?.metadata?.product;
  const isCombo = product === 'assessment_analyzer';
  const assessmentUrl = session?.assessmentUrl || null;

  return (
    <>
      <Head>
        <title>You're all set — Curio</title>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <a href="/" style={s.wordmark}>Curio<span style={s.dot}>.</span></a>
        </header>
        <main style={s.main}>
          <div style={s.card}>
            <div style={s.icon}>✓</div>
            {loading ? (
              <div style={s.preparing}>
                <div style={s.spinner} />
                <p style={s.preparingText}>Preparing your assessment…</p>
              </div>
            ) : (
              <>
                <h1 style={s.title}>
                  You're all set{name ? `, ${name.split(' ')[0]}` : ''}.
                </h1>
                <p style={s.sub}>
                  {isCombo
                    ? <>Your MindPrint™ Assessment is ready. Complete it now to unlock your Role Analyzer, AI Companion, and personalized dashboard.</>
                    : <>Your MindPrint™ Assessment is ready. Complete it now to access your results and personalized library.</>
                  }
                </p>

                {assessmentUrl ? (
                  <div style={s.accountBox}>
                    <p style={s.accountTitle}>Start your assessment</p>
                    <p style={s.accountDesc}>Takes about 7–10 minutes. You'll create your account and access your results at the end.</p>
                    <a href={assessmentUrl} style={s.accountBtn}>Begin Assessment →</a>
                    <p style={s.accountSkip}>Already have an account? <a href="/portal/login" style={s.link}>Log in</a></p>
                  </div>
                ) : (
                  <div style={s.accountBox}>
                    <p style={s.accountTitle}>Check your inbox</p>
                    <p style={s.accountDesc}>Your assessment link has been sent to <strong>{email}</strong>. Click it to begin — you'll create your account at the end.</p>
                    <p style={s.accountSkip}>Already have an account? <a href="/portal/login" style={s.link}>Log in</a></p>
                  </div>
                )}

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
  preparing: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 0' },
  preparingText: { fontSize: '0.95rem', color: '#64748B', margin: 0 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#059669', animation: 'spin 0.8s linear infinite' },
  link: { color: '#059669', textDecoration: 'none', fontWeight: 500 },
};
