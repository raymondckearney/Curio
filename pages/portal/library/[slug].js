import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GUIDES } from '../../../lib/guideContent';

const COLLECTION_META = {
  A: { label: 'Collection A · Tertiary HOW', accent: '#FCD34D', text: '#92400E', bg: '#FFFBEB' },
  B: { label: 'Collection B · Tertiary WHAT', accent: '#93C5FD', text: '#1E40AF', bg: '#EFF6FF' },
  C: { label: 'Collection C · Tertiary WHY', accent: '#6EE7B7', text: '#065F46', bg: '#F0FDF4' },
  D: { label: 'Collection D · Universal', accent: '#14B8A6', text: '#0F5C52', bg: '#F0FDFA' },
  E: { label: 'Collection E · Teams', accent: '#059669', text: '#065F46', bg: '#F0FDF4' },
};

export default function GuidePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/me')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => setAuthed(true))
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!authed || !slug) return null;

  const guide = GUIDES[slug];
  if (!guide) return (
    <div style={s.notFound}>
      <h1>Guide not found</h1>
      <a href="/portal/library" style={s.backLink}>← Back to Library</a>
    </div>
  );

  const meta = COLLECTION_META[guide.collection];

  return (
    <>
      <Head>
        <title>{guide.title} — Curio Library</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: #fff !important; }
            .print-page { max-width: none !important; padding: 0 !important; }
            .guide-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        `}</style>
      </Head>
      <div style={s.page}>
        {/* Top nav */}
        <div className="no-print" style={s.topNav}>
          <a href="/portal/library" style={s.backLink}>← Library</a>
          <div style={s.navActions}>
            <button onClick={() => window.print()} style={s.printBtn}>Save as PDF</button>
          </div>
        </div>

        <div className="print-page" style={s.container}>
          {/* Header */}
          <div style={{ ...s.header, background: meta.bg, borderBottom: `3px solid ${meta.accent}` }}>
            <div style={s.headerMeta}>
              <span style={{ ...s.collectionBadge, background: meta.accent + '33', color: meta.text }}>
                {meta.label}
              </span>
              <span style={{ ...s.collectionBadge, background: '#0F172A11', color: '#0F172A' }}>
                Tool {guide.num}
              </span>
              <span style={{ ...s.collectionBadge, background: meta.accent + '22', color: meta.text }}>
                {guide.supportLine}
              </span>
            </div>
            <h1 style={s.title}>{guide.title}</h1>
            <p style={s.tagline1}>{guide.tagline1}</p>
            {guide.tagline2 && (
              <p style={{ ...s.tagline2, borderLeft: `3px solid ${meta.accent}` }}>
                {guide.tagline2}
              </p>
            )}
          </div>

          <div className="guide-card" style={s.body}>
            {/* The Drain */}
            <Section title="The Drain" accent={meta.accent} text={meta.text}>
              <p style={s.prose}>{guide.drain}</p>
            </Section>

            {/* What This Tool Does */}
            <Section title="What This Tool Does" accent={meta.accent} text={meta.text}>
              <p style={s.prose}>{guide.whatDesc}</p>
              {guide.sublistTitle && <p style={s.sublistTitle}>{guide.sublistTitle}</p>}
              {guide.whatItems.length > 0 && (
                <ol style={s.numList}>
                  {guide.whatItems.map((item, i) => (
                    <li key={i} style={s.numItem}>
                      <strong>{item.label}</strong>
                      {item.detail && <span style={s.itemDetail}> {item.detail}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {/* How To Use It */}
            <Section title="How To Use It" accent={meta.accent} text={meta.text}>
              <ol style={s.numList}>
                {guide.howItems.map((item, i) => (
                  <li key={i} style={s.numItem}>
                    <strong>{item.label}</strong>
                    {item.detail && <span style={s.itemDetail}> {item.detail}</span>}
                  </li>
                ))}
              </ol>
            </Section>

            {/* What It Won't Do */}
            <Section title="What It Won't Do" accent={meta.accent} text={meta.text}>
              <p style={s.prose}>{guide.wont}</p>
            </Section>

            {/* In The Kit */}
            <div style={s.kitSection}>
              <div style={s.twoCol}>
                <div>
                  <h3 style={{ ...s.sectionLabel, color: meta.text }}>In the Kit</h3>
                  <ul style={s.kitList}>
                    {guide.kitItems.map((item, i) => (
                      <li key={i} style={s.kitItem}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 style={{ ...s.sectionLabel, color: meta.text }}>Pairs Well With</h3>
                  <ul style={s.kitList}>
                    {guide.pairItems.map((item, i) => (
                      <li key={i} style={s.kitItem}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={s.footer}>
            <span style={s.footerBrand}>Curio · MindPrint™ Tertiary Support Library</span>
            <span style={s.footerContact}>hello@choosecurio.com</span>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, accent, text, children }) {
  return (
    <div style={s.section}>
      <div style={{ ...s.sectionHeader, borderLeft: `3px solid ${accent}` }}>
        <h2 style={{ ...s.sectionTitle, color: text }}>{title}</h2>
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8' },
  notFound: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 },
  topNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px', background: '#0F172A', position: 'sticky', top: 0, zIndex: 100 },
  backLink: { color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 },
  navActions: { display: 'flex', gap: 10 },
  printBtn: { padding: '7px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  container: { maxWidth: 800, margin: '32px auto', padding: '0 24px 64px', animation: 'fadeIn 0.3s ease' },
  header: { borderRadius: '12px 12px 0 0', padding: '32px 36px 28px', marginBottom: 0 },
  headerMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  collectionBadge: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 99 },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.4rem', fontWeight: 700, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.2 },
  tagline1: { fontSize: '1rem', color: '#374151', lineHeight: 1.6, margin: '0 0 10px' },
  tagline2: { fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: '8px 0 0', paddingLeft: 14, fontStyle: 'italic' },
  body: { background: '#fff', borderRadius: '0 0 12px 12px', border: '1px solid #E2E8F0', borderTop: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '0 0 8px' },
  section: { borderBottom: '1px solid #F1F5F9', padding: '28px 36px' },
  sectionHeader: { paddingLeft: 14, marginBottom: 14 },
  sectionTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 },
  sectionLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, marginTop: 0 },
  sectionBody: { paddingLeft: 14 },
  prose: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.75, margin: 0 },
  sublistTitle: { fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 20, marginBottom: 10 },
  numList: { margin: '12px 0 0', padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  numItem: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.7 },
  itemDetail: { color: '#64748B' },
  kitSection: { padding: '28px 36px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 },
  kitList: { margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 },
  kitItem: { fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 },
  footer: { display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: 4, borderTop: '1px solid #E2E8F0' },
  footerBrand: { fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 },
  footerContact: { fontSize: '0.75rem', color: '#94A3B8' },
};
