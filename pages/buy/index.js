import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

const PRODUCTS = [
  {
    id: 'assessment',
    name: 'MindPrint™ Assessment',
    priceEnv: 'STRIPE_PRICE_ASSESSMENT',
    description: 'Discover how you\'re naturally wired to think through and solve problems. Includes your full MindPrint™ profile report.',
    included: [
      'Assessment access',
      'Personal profile report',
      'PDF profile delivery',
    ],
    featured: false,
  },
  {
    id: 'assessment_analyzer',
    name: 'MindPrint™ Assessment + Analyzer',
    priceEnv: 'STRIPE_PRICE_ASSESSMENT_ANALYZER',
    description: 'Everything in the Assessment, plus access to the Role Analyzer tool to explore how your profile applies to specific roles and contexts.',
    included: [
      'Assessment access',
      'Personal profile report',
      'PDF profile delivery',
      'Role Analyzer tool access',
    ],
    featured: true,
  },
];

export async function getServerSideProps() {
  return {
    props: {
      prices: {
        assessment: process.env.STRIPE_PRICE_ASSESSMENT || null,
        assessment_analyzer: process.env.STRIPE_PRICE_ASSESSMENT_ANALYZER || null,
      },
    },
  };
}

export default function BuyPage({ prices }) {
  const router = useRouter();
  const [selected, setSelected] = useState('assessment_analyzer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) { setError('Please enter your name and email.'); return; }
    if (!prices[selected]) { setError('Product not available. Please contact hello@choosecurio.com'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), priceId: prices[selected], product: selected }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      router.push(data.url);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Get MindPrint™ — Curio</title>
        <meta name="description" content="Discover how you're naturally wired to think and solve problems with a MindPrint™ assessment." />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        {/* Header */}
        <header style={s.header}>
          <a href="/" style={s.wordmark}>Curio<span style={s.dot}>.</span></a>
        </header>

        <main style={s.main}>
          <div style={s.hero}>
            <h1 style={s.heroTitle}>Understand how you think.</h1>
            <p style={s.heroSub}>Choose the option that's right for you.</p>
          </div>

          {/* Product cards */}
          <div style={s.cards}>
            {PRODUCTS.map(product => {
              const isSelected = selected === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => setSelected(product.id)}
                  style={{
                    ...s.card,
                    ...(product.featured ? s.cardFeatured : {}),
                    ...(isSelected ? s.cardSelected : {}),
                    ...(product.featured && isSelected ? s.cardFeaturedSelected : {}),
                  }}
                >
                  {product.featured && (
                    <div style={s.recommendedBadge}>Recommended</div>
                  )}
                  <div style={s.cardRadio}>
                    <div style={{ ...s.radioOuter, ...(isSelected ? s.radioOuterSelected : {}) }}>
                      {isSelected && <div style={s.radioDot} />}
                    </div>
                  </div>
                  <h2 style={s.cardTitle}>{product.name}</h2>
                  <p style={s.cardDesc}>{product.description}</p>
                  <div style={s.divider} />
                  <ul style={s.list}>
                    {product.included.map((item, i) => (
                      <li key={i} style={s.listItem}>
                        <span style={s.check}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Checkout form */}
          <div style={s.formWrap}>
            <form onSubmit={handleSubmit} style={s.form}>
              <h3 style={s.formTitle}>Your details</h3>
              <div style={s.formRow}>
                <div style={s.formField}>
                  <label style={s.label}>Full Name</label>
                  <input
                    style={s.input}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Smith"
                    required
                  />
                </div>
                <div style={s.formField}>
                  <label style={s.label}>Email Address</label>
                  <input
                    style={s.input}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                  />
                </div>
              </div>
              {error && <p style={s.error}>{error}</p>}
              <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Redirecting…' : 'Continue to Payment →'}
              </button>
              <p style={s.secure}>🔒 Secure checkout powered by Stripe</p>
            </form>
          </div>
        </main>

        <footer style={s.footer}>
          <p>Questions? <a href="mailto:hello@choosecurio.com" style={s.footerLink}>hello@choosecurio.com</a></p>
        </footer>
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', display: 'flex', flexDirection: 'column' },
  header: { background: '#0F172A', padding: '18px 40px' },
  wordmark: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, color: '#fff', textDecoration: 'none' },
  dot: { color: '#059669' },
  main: { flex: 1, maxWidth: 960, margin: '0 auto', padding: '48px 24px', width: '100%', boxSizing: 'border-box' },
  hero: { textAlign: 'center', marginBottom: 40 },
  heroTitle: { fontFamily: "'Caveat', cursive", fontSize: '2.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 },
  heroSub: { fontSize: '1.05rem', color: '#64748B' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 },
  card: {
    background: '#fff', borderRadius: 14, padding: 28, cursor: 'pointer',
    border: '2px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    transition: 'border-color 0.15s, box-shadow 0.15s', position: 'relative',
  },
  cardFeatured: { border: '2px solid #059669', background: '#fff' },
  cardSelected: { border: '2px solid #0F172A', boxShadow: '0 4px 20px rgba(15,23,42,0.12)' },
  cardFeaturedSelected: { border: '2px solid #059669', boxShadow: '0 4px 20px rgba(5,150,105,0.2)' },
  recommendedBadge: { position: 'absolute', top: -12, left: 20, background: '#059669', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: 99, letterSpacing: '0.04em' },
  cardRadio: { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { border: '2px solid #059669', background: '#F0FDF4' },
  radioDot: { width: 10, height: 10, borderRadius: '50%', background: '#059669' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 },
  cardDesc: { fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 },
  divider: { borderTop: '1px solid #F1F5F9', marginBottom: 16 },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  listItem: { fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 8 },
  check: { color: '#059669', fontWeight: 700, flexShrink: 0 },
  formWrap: { background: '#fff', borderRadius: 14, padding: 32, border: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  form: {},
  formTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: '#0F172A' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  formField: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fff', boxSizing: 'border-box' },
  error: { color: '#DC2626', fontSize: '0.875rem', marginBottom: 12 },
  btn: { width: '100%', padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif', letterSpacing: '0.01em'" },
  secure: { textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', marginTop: 12 },
  footer: { textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.875rem' },
  footerLink: { color: '#059669', textDecoration: 'none', fontWeight: 500 },
};
