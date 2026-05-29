import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Nav scroll class
  useEffect(() => {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logoHref = router.pathname === '/' ? '#' : '/';

  return (
    <>
      <nav id="nav">
        <div className="container nav-inner">
          <Link href={logoHref} className="nav-logo">Curio<span className="dot">.</span></Link>
          <ul className="nav-links">
            <li><Link href="/#applications">Applications</Link></li>
            <li><Link href="/framework/" className={isActive('/framework') ? 'active' : ''}>MindPrint™ Framework</Link></li>
            <li><Link href="/types/" className={isActive('/types') ? 'active' : ''}>MindPrint™ Profiles</Link></li>
            <li><Link href="/#cta">Work With Us</Link></li>
          </ul>
          <div className="nav-right">
            <button
              className="hamburger"
              id="hamburger"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav${menuOpen ? ' open' : ''}`} id="mobileNav">
        <button
          className="mobile-close"
          id="mobileClose"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <Link href="/#applications" onClick={() => setMenuOpen(false)}>Applications</Link>
        <Link href="/framework/" onClick={() => setMenuOpen(false)}>MindPrint™ Framework</Link>
        <Link href="/types/" onClick={() => setMenuOpen(false)}>MindPrint™ Profiles</Link>
        <Link href="/#cta" onClick={() => setMenuOpen(false)}>Work With Us</Link>
      </div>
    </>
  );
}
