import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FIELD_GUIDES } from '../../../../lib/fieldGuideContent';

const PRIMARY_META = {
  WHY: { accent: '#6EE7B7', text: '#065F46', bg: '#F0FDF4' },
  WHAT: { accent: '#93C5FD', text: '#1E40AF', bg: '#EFF6FF' },
  HOW: { accent: '#FCD34D', text: '#92400E', bg: '#FFFBEB' },
};

export default function FieldGuidePage() {
  const router = useRouter();
  const { profile } = router.query;
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
  if (!authed || !profile) return null;

  const guide = FIELD_GUIDES[profile];
  if (!guide) return (
    <div style={s.notFound}>
      <h1>Field guide not found</h1>
      <a href="/portal/library" style={s.backLink}>← Back to Library</a>
    </div>
  );

  const meta = PRIMARY_META[guide.primary] || PRIMARY_META.WHY;

  return (
    <>
      <Head>
        <title>{guide.profile} Communication Field Guide — Curio</title>
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
        <div className="no-print" style={s.topNav}>
          <a href="/portal/library" style={s.backLink}>← Library</a>
          <button onClick={() => window.print()} style={s.printBtn}>Save as PDF</button>
        </div>

        <div className="print-page" style={s.container}>
          {/* Header */}
          <div style={{ ...s.header, background: meta.bg, borderBottom: `3px solid ${meta.accent}` }}>
            <div style={s.headerMeta}>
              <span style={{ ...s.badge, background: meta.accent + '33', color: meta.text }}>
                Communication Field Guide
              </span>
              <span style={{ ...s.badge, background: '#0F172A11', color: '#0F172A' }}>
                Primary {guide.primary}
              </span>
              <span style={{ ...s.badge, background: meta.accent + '22', color: meta.text }}>
                Secondary {guide.secondary} · Tertiary {guide.tertiary}
              </span>
            </div>
            <h1 style={s.title}>{guide.profile}</h1>
            <p style={s.tagline}>How your wiring shows up in writing, how each orientation hears it, and the three adjustments that buy the most understanding.</p>
          </div>

          <div className="guide-card" style={s.body}>
            {/* How You Naturally Write */}
            <Section title="How You Naturally Write" accent={meta.accent} text={meta.text}>
              <p style={s.prose}>{guide.naturallyWrite}</p>
            </Section>

            {/* Your Signature — Present / Absent */}
            <Section title="Your Signature" accent={meta.accent} text={meta.text}>
              <div style={s.twoCol}>
                <div>
                  <div style={{ ...s.colLabel, color: meta.text }}>Present</div>
                  <ul style={s.bulletList}>
                    {guide.present.map((item, i) => (
                      <li key={i} style={s.bulletItem}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ ...s.colLabel, color: '#64748B' }}>Conspicuously Absent</div>
                  <ul style={s.bulletList}>
                    {guide.absent.map((item, i) => (
                      <li key={i} style={s.bulletItem}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* How You Land */}
            <Section title="How You Land" accent={meta.accent} text={meta.text}>
              <div style={s.landingGrid}>
                {Object.entries(guide.landing).map(([orientation, desc]) => (
                  <div key={orientation} style={s.landingCard}>
                    <div style={{ ...s.landingLabel, color: meta.text }}>{orientation} readers</div>
                    <p style={s.landingDesc}>{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* The Blind Spot */}
            <Section title="The Blind Spot" accent={meta.accent} text={meta.text}>
              <p style={s.prose}>{guide.blindSpot}</p>
            </Section>

            {/* Adjustments */}
            <Section title="The Three Adjustments" accent={meta.accent} text={meta.text}>
              <div style={s.adjustList}>
                {guide.adjustments.map((adj, i) => (
                  <div key={i} style={{ ...s.adjustCard, borderLeft: `3px solid ${meta.accent}` }}>
                    <div style={{ ...s.adjustLabel, color: meta.text }}>{adj.label}</div>
                    <p style={s.adjustText}>{adj.text}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div style={s.footer}>
            <span style={s.footerBrand}>Curio · MindPrint™ Communication Field Guide</span>
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
  printBtn: { padding: '7px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  container: { maxWidth: 800, margin: '32px auto', padding: '0 24px 64px', animation: 'fadeIn 0.3s ease' },
  header: { borderRadius: '12px 12px 0 0', padding: '32px 36px 28px' },
  headerMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  badge: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 99 },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.4rem', fontWeight: 700, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.2 },
  tagline: { fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0 },
  body: { background: '#fff', borderRadius: '0 0 12px 12px', border: '1px solid #E2E8F0', borderTop: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '0 0 8px' },
  section: { borderBottom: '1px solid #F1F5F9', padding: '28px 36px' },
  sectionHeader: { paddingLeft: 14, marginBottom: 14 },
  sectionTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 },
  sectionBody: { paddingLeft: 14 },
  prose: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.75, margin: 0 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  colLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 },
  bulletList: { margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  bulletItem: { fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 },
  landingGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  landingCard: { background: '#F8FAFC', borderRadius: 8, padding: '14px 16px' },
  landingLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 },
  landingDesc: { fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, margin: 0 },
  adjustList: { display: 'flex', flexDirection: 'column', gap: 14 },
  adjustCard: { paddingLeft: 14 },
  adjustLabel: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 },
  adjustText: { fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, margin: 0 },
  footer: { display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: 4, borderTop: '1px solid #E2E8F0' },
  footerBrand: { fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 },
  footerContact: { fontSize: '0.75rem', color: '#94A3B8' },
};
