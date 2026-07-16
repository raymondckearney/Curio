import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalSidebar from '../../components/PortalSidebar';

const SUPPORT_MODES = [
  { word: 'Scaffold', def: 'Structure that carries the thinking.' },
  { word: 'Teach', def: 'A learnable micro-skill.' },
  { word: 'Support', def: 'A ritual that reduces the drain.' },
  { word: 'Replace', def: 'Delegate, automate, or partner it away.' },
];

const COLLECTION_META = {
  A: { label: 'Tertiary HOW Resources', accent: '#FCD34D', text: '#92400E' },
  B: { label: 'Tertiary WHAT Resources', accent: '#93C5FD', text: '#1E40AF' },
  C: { label: 'Tertiary WHY Resources', accent: '#6EE7B7', text: '#065F46' },
  D: { label: 'Universal Resources', accent: '#14B8A6', text: '#0F5C52' },
  E: { label: 'Teams Resources', accent: '#059669', text: '#065F46' },
};

// Field guide accent is by PRIMARY orientation, a different axis from the
// tertiary-collection accents above (same palette values, different meaning).
const PRIMARY_META = {
  WHY: { accent: '#6EE7B7', text: '#065F46' },
  WHAT: { accent: '#93C5FD', text: '#1E40AF' },
  HOW: { accent: '#FCD34D', text: '#92400E' },
};

const FIELD_GUIDE_LEAD = 'How your wiring shows up in writing, how each orientation hears it, and the three adjustments that buy the most understanding.';

export default function LibraryPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [isIndividual, setIsIndividual] = useState(false);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/library').then(r => r.json().then(d => ({ ok: r.ok, d }))),
    ])
      .then(([meData, dashData, libRes]) => {
        setMe(meData);
        setLicenses(dashData?.licenses || []);
        setIsIndividual(!!dashData?.myAssessment);
        if (!libRes.ok) { setError(libRes.d.error || 'The Client Library is not available on your account.'); return; }
        setData(libRes.d);
        setFilter(libRes.d.defaultCollection);
      })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  // "guide"/"template" here map to the onepager/kit PDFs stored under those
  // names in library_items; kept as the API's internal vocabulary since
  // nothing outside this page depends on it.
  async function openFile(toolNum, kind) {
    setDownloading(`${toolNum}-${kind}`);
    try {
      const apiKind = kind === 'template' ? 'kit' : 'onepager';
      const res = await fetch(`/api/portal/library-file?toolNum=${toolNum}&kind=${apiKind}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to open file');
      window.open(d.url, '_blank', 'noopener');
    } catch (e) {
      alert(e.message);
    } finally {
      setDownloading(null);
    }
  }

  async function openGuideFile(profile) {
    setDownloading(`guide-${profile}`);
    try {
      const res = await fetch(`/api/portal/library-file?profile=${profile}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to open file');
      window.open(d.url, '_blank', 'noopener');
    } catch (e) {
      alert(e.message);
    } finally {
      setDownloading(null);
    }
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const items = (data?.items || []).filter(i => !filter || i.collection === filter);
  const visibleCollections = data?.visibleCollections || [];
  const fieldGuides = data?.fieldGuides || [];
  const ownProfile = data?.ownProfile;

  return (
    <>
      <Head>
        <title>Resources — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={s.layout}>
        <PortalSidebar me={me} onLogout={logout} active="library" licenses={licenses} isIndividual={isIndividual} />
        <main style={s.main}>
          <div style={s.hero}>
            <div style={s.pill}>Resources</div>
            <h1 style={s.title}>Your Curated Library of Support Resources</h1>
            <p style={s.sub}>
              Every resource here reduces the cost of work in your tertiary orientation, the work that drains rather than energizes. None of them make tertiary work energizing. All of them make it cheaper. Each resource addresses the tertiary through one of 4 approaches:
            </p>
            <div style={s.modeList}>
              {SUPPORT_MODES.map(m => (
                <div key={m.word} style={s.modeRow}>
                  <span style={s.modePill}>{m.word}</span>
                  <span style={s.modeDef}>{m.def}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.body}>
            {error ? (
              <div style={s.emptyState}><p>{error}</p></div>
            ) : (
              <>
                <div style={s.chipRow}>
                  {visibleCollections.map(c => {
                    const meta = COLLECTION_META[c];
                    const active = filter === c;
                    return (
                      <button key={c} onClick={() => setFilter(c)}
                        style={{
                          ...s.chip,
                          background: active ? meta.accent : '#fff',
                          color: active ? meta.text : '#374151',
                          border: `1px solid ${active ? meta.accent : '#E2E8F0'}`,
                        }}>{meta.label}</button>
                    );
                  })}
                </div>

                {items.length === 0 ? (
                  <div style={s.emptyState}><p>No items in this collection yet.</p></div>
                ) : (
                  <div style={s.grid}>
                    {items.map(item => {
                      const meta = COLLECTION_META[item.collection];
                      return (
                        <div key={item.tool_num} style={{ ...s.card, borderTop: `3px solid ${meta.accent}` }}>
                          <div style={s.cardModeRow}>
                            <span style={{ ...s.modeChip, background: `${meta.accent}22`, color: meta.text }}>{item.support_mode}</span>
                          </div>
                          <div style={s.cardTitle}>{item.title}</div>
                          {item.summary && <p style={s.cardSummary}>{item.summary}</p>}
                          <div style={s.cardActions}>
                            <button style={s.cardBtn} disabled={downloading === `${item.tool_num}-guide`} onClick={() => openFile(item.tool_num, 'guide')}>
                              {downloading === `${item.tool_num}-guide` ? 'Opening…' : 'Download Guide'}
                            </button>
                            <button style={s.cardBtnSecondary} disabled={downloading === `${item.tool_num}-template`} onClick={() => openFile(item.tool_num, 'template')}>
                              {downloading === `${item.tool_num}-template` ? 'Opening…' : 'Download Template'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {fieldGuides.length > 0 && (
                  <div style={s.guideSection}>
                    <h2 style={s.guideSectionTitle}>Communication Field Guides</h2>
                    <p style={s.guideSectionSub}>{FIELD_GUIDE_LEAD}</p>
                    <div style={s.grid}>
                      {fieldGuides.map(g => {
                        const primary = g.profile.split('-')[0];
                        const meta = PRIMARY_META[primary];
                        const mine = g.profile === ownProfile;
                        return (
                          <div key={g.profile} style={{ ...s.card, borderTop: `3px solid ${meta.accent}` }}>
                            <div style={s.cardModeRow}>
                              <span style={{ ...s.modeChip, background: `${meta.accent}22`, color: meta.text }}>{g.profile}</span>
                              {mine && <span style={{ ...s.modeChip, background: '#0F172A11', color: '#0F172A' }}>Your Guide</span>}
                            </div>
                            <div style={s.cardTitle}>{g.title}</div>
                            <div style={s.cardActions}>
                              <button style={s.cardBtn} disabled={downloading === `guide-${g.profile}`} onClick={() => openGuideFile(g.profile)}>
                                {downloading === `guide-${g.profile}` ? 'Opening…' : 'Download Guide'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { marginLeft: 220, flex: 1, minHeight: '100vh' },
  hero: { padding: '52px 40px 32px', background: 'linear-gradient(135deg, rgba(5,150,105,0.05) 0%, rgba(5,150,105,0.02) 100%)', borderBottom: '1px solid #E2E8F022' },
  pill: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', marginBottom: 12 },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.6rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 },
  sub: { fontSize: '0.95rem', color: '#475569', maxWidth: 760, lineHeight: 1.7, marginBottom: 24 },
  modeList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 28px', maxWidth: 920 },
  modeRow: { display: 'flex', alignItems: 'center', gap: 12 },
  modePill: { flexShrink: 0, minWidth: 90, textAlign: 'center', borderRadius: 99, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: 'rgba(5,150,105,0.13)', color: '#065F46' },
  modeDef: { fontSize: '0.875rem', color: '#374151', lineHeight: 1.5, whiteSpace: 'nowrap' },
  body: { padding: '32px 40px 64px' },
  chipRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 },
  chip: { padding: '8px 16px', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardModeRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modeChip: { fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 8, lineHeight: 1.4 },
  cardSummary: { fontSize: '0.825rem', color: '#64748B', lineHeight: 1.6, marginBottom: 16 },
  cardActions: { display: 'flex', gap: 8 },
  cardBtn: { flex: 1, padding: '8px 12px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  cardBtnSecondary: { flex: 1, padding: '8px 12px', background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  emptyState: { background: '#fff', borderRadius: 12, padding: '40px 28px', textAlign: 'center', color: '#64748B', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },

  guideSection: { marginTop: 40 },
  guideSectionTitle: { fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 },
  guideSectionSub: { fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, marginBottom: 20, maxWidth: 640 },
};
