import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { dbQuery } from '../../../lib/supabase';
import { NAV_ITEMS, TOOL_SECTIONS, navLockReason, assistantEnabled } from '../../../lib/portalNav';
import { getRecentTools } from '../../../lib/toolRecents';
import PortalSidebar from '../../../components/PortalSidebar';
import ToolCard, { LockedToolCard, TOOL_CARD_CSS } from '../../../components/ToolCard';
import { OPEN_ASSISTANT_EVENT } from '../../../components/CurioAssistant';
import { TOOL_TONES } from '../../../components/ToolHeader';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, null);
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  const pending = result.me?.user?.id
    ? await dbQuery('access_requests', { user_id: `eq.${result.me.user.id}`, status: 'eq.pending', select: 'item_id' }).catch(() => [])
    : [];
  return {
    props: {
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
      isTeamAccount: result.isTeamAccount,
      tertiary: result.tertiary,
      tier: result.tier,
      requestedIds: pending.map(p => p.item_id),
    },
  };
}

const CSS = `
  .tl-section{margin-bottom:36px;}
  .tl-section-title{font-family:'Caveat',cursive;font-size:1.7rem;font-weight:700;color:#0F172A;margin:0 0 2px;}
  .tl-dot{display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:10px;vertical-align:middle;position:relative;top:-2px;}
  .tl-section-sub{font-size:0.86rem;color:#64748B;margin:0 0 14px;}
  .tl-section{scroll-margin-top:24px;}
  @media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth;}}
  .tl-more{margin-top:12px;padding-top:28px;border-top:1px solid #E2E8F0;}
  .tl-bar{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:14px;}
  .tl-search{position:relative;flex:1;min-width:240px;max-width:440px;}
  .tl-search input{width:100%;box-sizing:border-box;padding:11px 14px 11px 38px;border:1px solid #CBD5E1;border-radius:10px;font-family:inherit;font-size:0.92rem;color:#0F172A;background:#fff;}
  .tl-search input:focus{outline:none;border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,0.12);}
  .tl-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#94A3B8;}
  .tl-ask{display:flex;align-items:center;gap:10px;font-size:0.86rem;color:#475569;}
  .tl-ask button{font-family:inherit;font-size:0.84rem;font-weight:700;background:#FCD34D;color:#111827;border:none;border-radius:999px;padding:8px 14px;cursor:pointer;}
  .tl-ask button:hover{background:#FBBF24;}
  .tl-jump{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px;}
  .tl-jump a{font-size:0.8rem;font-weight:600;color:#334155;background:#fff;border:1px solid #E2E8F0;border-radius:999px;padding:6px 13px;text-decoration:none;}
  .tl-jump a:hover{border-color:#059669;color:#065F46;}
  .tl-empty{background:#fff;border:1px dashed #CBD5E1;border-radius:12px;padding:22px;color:#475569;font-size:0.9rem;margin-bottom:30px;}
  .tl-empty button{font-family:inherit;font-weight:700;color:#047857;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;}
  @media (max-width:768px){.tl-main{padding:72px 16px 40px !important;}}
`;

export default function ToolsPage({ me, licenses, isIndividual, isTeamAccount, tertiary, tier, requestedIds }) {
  const router = useRouter();
  const [recentKeys, setRecentKeys] = useState([]);
  const [requests, setRequests] = useState(() => Object.fromEntries((requestedIds || []).map(id => [id, { requested: true }])));
  const [query, setQuery] = useState('');

  useEffect(() => { setRecentKeys(getRecentTools(me?.user?.id)); }, [me?.user?.id]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  async function requestAccess(tool) {
    const id = `tool:${tool.key}`;
    setRequests(r => ({ ...r, [id]: { sending: true } }));
    try {
      const res = await fetch('/api/portal/request-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: id }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Could not send the request.');
      setRequests(r => ({ ...r, [id]: { requested: true } }));
    } catch (e) {
      setRequests(r => ({ ...r, [id]: { error: e.message } }));
    }
  }

  // Same visibility rule the sidebar used when these were sidebar items.
  const ctx = { licenseTypes: new Set((licenses || []).map(l => l.type)), isTeamAccount, role: me?.user?.role, hasProfile: isIndividual, tier, tertiary };
  const q = query.trim().toLowerCase();
  const matches = t => !q || `${t.label} ${t.blurb}`.toLowerCase().includes(q);
  const tools = NAV_ITEMS.filter(i => i.inTools).map(t => ({ ...t, lock: navLockReason(t, ctx) }));
  const mine = tools.filter(t => !t.lock && matches(t));
  const locked = tools.filter(t => t.lock && matches(t));
  const recent = q ? [] : recentKeys.map(k => mine.find(t => t.key === k)).filter(Boolean).slice(0, 4);
  const sections = TOOL_SECTIONS.map(sec => ({ ...sec, items: mine.filter(i => i.section === sec.key) })).filter(sec => sec.items.length);
  const jumps = [
    ...(recent.length ? [{ id: 'recent', label: 'Recently used' }] : []),
    ...sections.map(sec => ({ id: sec.key, label: sec.label })),
    ...(locked.length ? [{ id: 'more', label: 'More from Curio' }] : []),
  ];
  const canAsk = assistantEnabled(ctx.licenseTypes, isTeamAccount);
  const openAssistant = () => window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
  const badgeFor = t => (t.tertiary && t.tertiary === tertiary ? 'Built for your tertiary' : null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      <Head>
        <title>Tools | Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: TOOL_CARD_CSS + CSS }} />
      <PortalSidebar me={me} onLogout={logout} active="tools" licenses={licenses} isIndividual={isIndividual} isTeamAccount={isTeamAccount} />
      <main className="portal-main tl-main" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: '48px 48px 60px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', marginBottom: 10 }}>Tools</div>
          <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2.6rem', fontWeight: 700, margin: '0 0 6px' }}>Your Curio tools</h1>
          <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: 680, lineHeight: 1.6, margin: 0 }}>Everything included in your account, in one place. Pick a tool to open it.</p>
        </div>

        <div className="tl-bar">
          <label className="tl-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a tool" aria-label="Find a tool" />
          </label>
          {canAsk && (
            <div className="tl-ask">
              <span>Not sure where to start?</span>
              <button type="button" onClick={openAssistant}>Ask Curio</button>
            </div>
          )}
        </div>

        {!q && jumps.length > 1 && (
          <nav className="tl-jump" aria-label="Jump to a section">
            {jumps.map(j => <a key={j.id} href={`#tl-${j.id}`}>{j.label}</a>)}
          </nav>
        )}

        {q && !mine.length && !locked.length && (
          <div className="tl-empty">
            No tools match &ldquo;{query.trim()}&rdquo;. <button type="button" onClick={() => setQuery('')}>Clear the search</button>
            {canAsk && <> or <button type="button" onClick={openAssistant}>ask Curio</button> what you&apos;re working on.</>}
          </div>
        )}

        {recent.length > 0 && (
          <section className="tl-section" id="tl-recent">
            <h2 className="tl-section-title">Recently used</h2>
            <p className="tl-section-sub">Pick up where you left off.</p>
            <div className="tc-grid">
              {recent.map(t => <ToolCard key={t.key} tool={t} badge={badgeFor(t)} />)}
            </div>
          </section>
        )}

        {!q && mine.length === 0 && <p style={{ color: '#64748B', marginBottom: 32 }}>No tools are included in your account yet.</p>}

        {sections.map(sec => (
          <section key={sec.key} className="tl-section" id={`tl-${sec.key}`}>
            <h2 className="tl-section-title"><span className="tl-dot" style={{ background: TOOL_TONES[sec.key]?.bg }} aria-hidden="true" />{sec.label}</h2>
            <p className="tl-section-sub">{sec.sub}</p>
            <div className="tc-grid">
              {sec.items.map(t => <ToolCard key={t.key} tool={t} badge={badgeFor(t)} />)}
            </div>
          </section>
        ))}

        {locked.length > 0 && (
          <section className="tl-section tl-more" id="tl-more">
            <h2 className="tl-section-title">More from Curio</h2>
            <p className="tl-section-sub">Tools that aren&apos;t in your account yet. Request one and Curio will follow up.</p>
            <div className="tc-grid">
              {locked.map(t => (
                <LockedToolCard key={t.key} tool={t} lock={t.lock} state={requests[`tool:${t.key}`]} onRequest={() => requestAccess(t)} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
