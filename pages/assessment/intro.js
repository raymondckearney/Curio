import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AssessmentIntro() {
  const router = useRouter();
  const { token, name, email, role } = router.query;

  const rawName = name ? String(name) : null;
  const displayName = (rawName && rawName.trim() && !/^anonymous\b/i.test(rawName.trim())) ? rawName : null;

  const assessmentUrl = token
    ? `/assessment?token=${encodeURIComponent(token)}${name ? `&name=${encodeURIComponent(name)}` : ''}${email ? `&email=${encodeURIComponent(email)}` : ''}${role ? `&role=${encodeURIComponent(role)}` : ''}`
    : '/assessment';

  return (
    <>
      <Head>
        <title>Your MindPrint™ Profile — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <div style={s.page}>
        <div style={s.card}>

          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>

          <div style={s.eyebrow}>MindPrint™ Assessment</div>

          <h1 style={s.heading}>
            {displayName
              ? <>{displayName}, you've been invited to discover your MindPrint™ Profile.</>
              : <>You've been invited to discover your MindPrint™ Profile.</>}
          </h1>

          <p style={s.intro}>
            This assessment is designed to identify your natural orientation for solving problems and what type of thinking energizes you.
          </p>

          <div style={s.divider} />

          <div style={s.metaRow}>
            <div style={s.metaItem}>
              <span style={s.metaIcon}>⏱</span>
              <span style={s.metaText}>7–10 minutes</span>
            </div>
            <div style={s.metaItem}>
              <span style={s.metaIcon}>✦</span>
              <span style={s.metaText}>23 questions</span>
            </div>
            <div style={s.metaItem}>
              <span style={s.metaIcon}>◆</span>
              <span style={s.metaText}>No right answers</span>
            </div>
          </div>

          <div style={s.tip}>
            <strong>Tip:</strong> Go with your first instinct. There are no right or wrong answers — only what's true for you.
          </div>

          <Link href={assessmentUrl} style={s.btn}>
            Begin Assessment →
          </Link>

          <p style={s.footer}>Powered by Curio · choosecurio.com</p>
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F172A',
    fontFamily: "'DM Sans', sans-serif",
    padding: '24px 16px',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 'clamp(36px, 6vw, 56px) clamp(28px, 5vw, 52px)',
    maxWidth: 520,
    width: '100%',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
  },
  logo: {
    fontFamily: "'Caveat', cursive",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1C1917',
    marginBottom: 24,
    display: 'block',
  },
  dot: { color: '#059669' },
  eyebrow: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#059669',
    marginBottom: 10,
  },
  heading: {
    fontFamily: "'Caveat', cursive",
    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
    fontWeight: 700,
    color: '#0F172A',
    lineHeight: 1.15,
    marginBottom: 16,
  },
  intro: {
    fontSize: '0.95rem',
    color: '#57534E',
    lineHeight: 1.8,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    background: '#E7E5E4',
    marginBottom: 20,
  },
  metaRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: '0.75rem',
    color: '#059669',
  },
  metaText: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#78716C',
  },
  tip: {
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: '0.875rem',
    color: '#166534',
    lineHeight: 1.65,
    marginBottom: 28,
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '16px 24px',
    background: '#059669',
    color: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '0.04em',
    transition: 'background 0.18s',
    marginBottom: 20,
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#A8A29E',
  },
};
