import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NAV_ITEMS, navLockReason, assistantEnabled } from '../lib/portalNav';
import CurioAssistant from './CurioAssistant';

const TEAM_CHILD_KEYS = NAV_ITEMS.filter(i => i.groupKey === 'team').map(i => i.key);

const MOBILE_CSS = `
  @media (max-width: 768px) {
    .portal-sidebar {
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      z-index: 200 !important;
    }
    .portal-sidebar.sidebar-open {
      transform: translateX(0);
    }
    .portal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 199;
    }
    .portal-backdrop.sidebar-open {
      display: block;
    }
    .portal-hamburger {
      display: flex !important;
    }
    .portal-main {
      margin-left: 0 !important;
    }
  }
  @media (min-width: 769px) {
    .portal-hamburger {
      display: none !important;
    }
    .portal-sidebar {
      transform: none !important;
    }
  }
`;

export default function PortalSidebar({ me, onLogout, active, licenses = [], isIndividual = false, isTeamAccount = false }) {
  const licenseTypes = new Set(licenses.map(l => l.type));
  const [teamOpen, setTeamOpen] = useState(active === 'team' || TEAM_CHILD_KEYS.includes(active));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Inject CSS once on mount
  useEffect(() => {
    if (document.getElementById('portal-sidebar-css')) return;
    const el = document.createElement('style');
    el.id = 'portal-sidebar-css';
    el.textContent = MOBILE_CSS;
    document.head.appendChild(el);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [active]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
    }
    return () => { if (typeof document !== 'undefined') document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navCtx = { licenseTypes, isTeamAccount, role: me?.user?.role, hasProfile: isIndividual };
  const visibleItems = NAV_ITEMS.filter(item => navLockReason(item, navCtx) === null);

  const visibleKeys = new Set(visibleItems.map(i => i.key));
  const teamVisible = visibleKeys.has('team');
  const topLevelItems = visibleItems.filter(item => !(teamVisible && item.groupKey === 'team'));
  const teamChildren = teamVisible ? visibleItems.filter(item => item.groupKey === 'team') : [];

  return (
    <>
      {/* Hamburger button — hidden on desktop via CSS */}
      <button
        className="portal-hamburger"
        onClick={() => setMobileOpen(true)}
        style={sb.hamburger}
        aria-label="Open menu"
      >
        <span style={sb.bar} />
        <span style={sb.bar} />
        <span style={sb.bar} />
      </button>

      {/* Backdrop */}
      <div
        className={`portal-backdrop${mobileOpen ? ' sidebar-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div className={`portal-sidebar${mobileOpen ? ' sidebar-open' : ''}`} style={sb.sidebar}>
        <div style={sb.brand}>
          <span style={sb.wordmark}>Curio<span style={sb.dot}>.</span></span>
          <span style={sb.accountName}>{me?.account?.name}</span>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {topLevelItems.map(item => {
            if (item.key !== 'team' || !teamVisible) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={active === item.key
                    ? { ...sb.navItem, ...sb.navItemActive }
                    : sb.navItem}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <div key={item.key}>
                <div
                  style={{ ...sb.navItem, ...(active === 'team' ? sb.navItemActive : {}), display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setTeamOpen(o => !o)}
                >
                  <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none', flex: 1 }}>{item.label}</Link>
                  <span style={{ fontSize: '0.65rem', opacity: 0.6, transform: teamOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
                </div>
                {teamOpen && teamChildren.map(child => (
                  <Link
                    key={child.key}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    style={active === child.key
                      ? { ...sb.navItem, ...sb.navItemActive, ...sb.navItemChild }
                      : { ...sb.navItem, ...sb.navItemChild }}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
        <div style={sb.footer}>
          <span style={sb.userName}>{me?.user?.name || me?.user?.email}</span>
          <button style={sb.signOut} onClick={onLogout}>Sign out</button>
        </div>
      </div>
      {me?.user && assistantEnabled(licenseTypes, isTeamAccount) && <CurioAssistant userId={me.user.id} />}
    </>
  );
}

// Keep PortalNav export for backward-compat
export function PortalNav(props) {
  return <PortalSidebar {...props} />;
}

const sb = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#0F172A',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  brand: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  wordmark: {
    fontFamily: "'Caveat', cursive",
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#fff',
    display: 'block',
    textDecoration: 'none',
  },
  dot: { color: '#059669' },
  accountName: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 500,
    marginTop: 4,
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  navItem: {
    display: 'block',
    padding: '10px 20px',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.1s, color 0.1s',
    borderRadius: 0,
  },
  navItemActive: {
    background: 'rgba(5,150,105,0.18)',
    color: '#34D399',
    fontWeight: 600,
  },
  navItemChild: {
    paddingLeft: 34,
    fontSize: '0.825rem',
  },
  footer: {
    padding: '16px 20px 24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  userName: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  signOut: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 14px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'left',
  },
  hamburger: {
    display: 'none', // overridden to flex on mobile via CSS
    position: 'fixed',
    top: 14,
    left: 14,
    zIndex: 201,
    flexDirection: 'column',
    gap: 5,
    padding: '10px 11px',
    background: '#0F172A',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  bar: {
    display: 'block',
    width: 20,
    height: 2,
    background: 'rgba(255,255,255,0.75)',
    borderRadius: 2,
  },
};
