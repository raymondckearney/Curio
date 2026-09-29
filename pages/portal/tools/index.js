import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { NAV_ITEMS, TOOL_SECTIONS, navLockReason, toolThumb } from '../../../lib/portalNav';
import PortalSidebar from '../../../components/PortalSidebar';

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, null);
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  return {
    props: {
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
      isTeamAccount: result.isTeamAccount,
      tertiary: result.tertiary,
    },
  };
}

const CSS = `
  .tl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}
  .tl-card{display:flex;flex-direction:column;background:#fff;border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;text-decoration:none;color:#0F172A;transition:transform 0.15s ease,box-shadow 0.15s ease,border-color 0.15s ease;}
  .tl-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(15,23,42,0.12);border-color:#CBD5E1;}
  .tl-card:focus-visible{outline:3px solid #059669;outline-offset:2px;}
  .tl-thumb{position:relative;aspect-ratio:16/10;background:#F1F5F9;border-bottom:1px solid #E2E8F0;overflow:hidden;}
  .tl-thumb img{width:100%;height:100%;object-fit:cover;object-position:top left;display:block;}
  .tl-badge{position:absolute;top:10px;left:10px;background:#FCD34D;color:#111827;font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:3px 9px;border-radius:999px;}
  .tl-body{padding:16px 18px 18px;display:flex;flex-direction:column;flex:1;}
  .tl-name{font-weight:700;font-size:1.02rem;margin:0 0 6px;}
  .tl-blurb{font-size:0.86rem;color:#475569;line-height:1.5;margin:0 0 14px;flex:1;}
  .tl-open{font-size:0.84rem;font-weight:700;color:#059669;}
  .tl-section{margin-bottom:40px;}
  .tl-section-title{font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#0F172A;margin:0 0 2px;}
  .tl-section-sub{font-size:0.88rem;color:#64748B;margin:0 0 16px;}
  @media (prefers-reduced-motion:reduce){.tl-card{transition:none;}.tl-card:hover{transform:none;}}
  @media (max-width:768px){.tl-main{padding:72px 16px 40px !important;}}
`;

export default function ToolsPage({ me, licenses, isIndividual, isTeamAccount, tertiary }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  // Same visibility rule the sidebar used when these were sidebar items.
  const ctx = { licenseTypes: new Set((licenses || []).map(l => l.type)), isTeamAccount, role: me?.user?.role, hasProfile: isIndividual };
  const mine = NAV_ITEMS.filter(i => i.inTools && navLockReason(i, ctx) === null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      <Head>
        <title>Tools | Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <PortalSidebar me={me} onLogout={logout} active="tools" licenses={licenses} isIndividual={isIndividual} isTeamAccount={isTeamAccount} />
      <main className="portal-main tl-main" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: '52px 48px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', marginBottom: 10 }}>Tools</div>
          <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2.6rem', fontWeight: 700, margin: '0 0 6px' }}>Your Curio tools</h1>
          <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: 680, lineHeight: 1.6, margin: 0 }}>Everything included in your account, in one place. Pick a tool to open it.</p>
        </div>

        {mine.length === 0 ? (
          <p style={{ color: '#64748B' }}>No tools are included in your account yet.</p>
        ) : TOOL_SECTIONS.map(sec => {
          const items = mine.filter(i => i.section === sec.key);
          if (!items.length) return null;
          return (
            <section key={sec.key} className="tl-section">
              <h2 className="tl-section-title">{sec.label}</h2>
              <p className="tl-section-sub">{sec.sub}</p>
              <div className="tl-grid">
                {items.map(t => (
                  <Link key={t.key} href={t.href} className="tl-card">
                    <div className="tl-thumb">
                      <img src={toolThumb(t)} alt="" loading="lazy" />
                      {t.tertiary && t.tertiary === tertiary && <span className="tl-badge">Built for your tertiary</span>}
                    </div>
                    <div className="tl-body">
                      <p className="tl-name">{t.label}</p>
                      <p className="tl-blurb">{t.blurb}</p>
                      <span className="tl-open">Open →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
