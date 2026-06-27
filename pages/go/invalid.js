import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function InvalidLink() {
  const { query } = useRouter();
  const alreadyUsed = query.reason === 'used';

  return (
    <>
      <Head>
        <title>Invalid Link — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          <Link href="/" style={s.logo}>Curio<span style={s.dot}>.</span></Link>
          {alreadyUsed ? (
            <>
              <h1 style={s.title}>This link has already been used.</h1>
              <p style={s.body}>Each assessment link is single-use. If you believe this is an error, contact <a href="mailto:hello@choosecurio.com" style={s.link}>hello@choosecurio.com</a>.</p>
            </>
          ) : (
            <>
              <h1 style={s.title}>This link is invalid.</h1>
              <p style={s.body}>The link you followed doesn't exist or has already been removed. Please contact your Curio coordinator for assistance.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", padding: 24 },
  card: { background: '#fff', borderRadius: 12, padding: '48px 40px', maxWidth: 440, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', borderLeft: '3px solid #059669' },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.6rem', fontWeight: 700, color: '#1C1917', textDecoration: 'none', display: 'block', marginBottom: 24 },
  dot: { color: '#059669' },
  title: { fontSize: '1.25rem', fontWeight: 600, color: '#1C1917', marginBottom: 12 },
  body: { fontSize: '0.95rem', color: '#78716C', lineHeight: 1.75 },
};
