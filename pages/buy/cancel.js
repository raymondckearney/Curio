import Head from 'next/head';

export default function BuyCancel() {
  return (
    <>
      <Head>
        <title>Purchase Cancelled — Curio</title>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <a href="/" style={s.wordmark}>Curio<span style={s.dot}>.</span></a>
        </header>
        <main style={s.main}>
          <div style={s.card}>
            <div style={s.icon}>✕</div>
            <h1 style={s.title}>No problem.</h1>
            <p style={s.sub}>Your card was not charged.</p>
            <a href="/buy" style={s.btn}>Return to purchase page</a>
            <p style={s.note}>Have questions? <a href="mailto:hello@choosecurio.com" style={s.link}>hello@choosecurio.com</a></p>
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
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' },
  icon: { width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, marginBottom: 8, color: '#0F172A' },
  sub: { fontSize: '1rem', color: '#475569', marginBottom: 28 },
  btn: { display: 'inline-block', padding: '12px 28px', background: '#059669', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', marginBottom: 20 },
  note: { fontSize: '0.85rem', color: '#94A3B8' },
  link: { color: '#059669', textDecoration: 'none', fontWeight: 500 },
};
