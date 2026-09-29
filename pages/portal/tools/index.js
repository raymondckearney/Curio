import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { dbQuery } from '../../../lib/supabase';
import { NAV_ITEMS, TOOL_SECTIONS, navLockReason } from '../../../lib/portalNav';
import { getRecentTools } from '../../../lib/toolRecents';
import PortalSidebar from '../../../components/PortalSidebar';
import ToolCard, { LockedToolCard, TOOL_CARD_CSS } from '../../../components/ToolCard';

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
  .tl-section-sub{font-size:0.86rem;color:#64748B;margin:0 0 14px;}
  .tl-more{margin-top:12px;padding-top:28px;border-top:1px solid #E2E8F0;}
  @media (max-width:768px){.tl-main{padding:72px 16px 40px !important;}}
`;

export default function ToolsPage({ me, licenses, isIndividual, isTeamAccount, tertiary, tier, requestedIds }) {
  const router = useRouter();
  const [recentKeys, setRecentKeys] = useState([]);
  const [requests, setRequests] = useState(() => Object.fromEntries((requestedIds || []).map(id => [id, { requested: true }])));

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
  const tools = NAV_ITEMS.filter(i => i.inTools).map(t => ({ ...t, lock: navLockReason(t, ctx) }));
  const mine = tools.filter(t => !t.lock);
  const locked = tools.filter(t => t.lock);
  const recent = recentKeys.map(k => mine.find(t => t.key === k)).filter(Boolean).slice(0, 4);
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

        {recent.length > 0 && (
          <section className="tl-section">
            <h2 className="tl-section-title">Recently used</h2>
            <p className="tl-section-sub">Pick up where you left off.</p>
            <div className="tc-grid">
              {recent.map(t => <ToolCard key={t.key} tool={t} badge={badgeFor(t)} />)}
            </div>
          </section>
        )}

        {mine.length === 0 && <p style={{ color: '#64748B', marginBottom: 32 }}>No tools are included in your account yet.</p>}

        {TOOL_SECTIONS.map(sec => {
          const items = mine.filter(i => i.section === sec.key);
          if (!items.length) return null;
          return (
            <section key={sec.key} className="tl-section">
              <h2 className="tl-section-title">{sec.label}</h2>
              <p className="tl-section-sub">{sec.sub}</p>
              <div className="tc-grid">
                {items.map(t => <ToolCard key={t.key} tool={t} badge={badgeFor(t)} />)}
              </div>
            </section>
          );
        })}

        {locked.length > 0 && (
          <section className="tl-section tl-more">
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
