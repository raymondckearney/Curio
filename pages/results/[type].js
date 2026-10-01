import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import profiles from '../../lib/profiles';
import { downloadProfilePdf } from '../../lib/profilePdf';

// Style guide's "Orientation colors" — used exclusively on dark
// backgrounds (this page's hero band is navy), distinct from the deeper
// on-light-surface variant used for e.g. the portal dashboard's hero
// gradient. See pages/style-guide/index.js's Profiles section.
const PRIMARY_ORIENTATION_COLOR = { WHY: '#6EE7B7', WHAT: '#93C5FD', HOW: '#FCD34D' };
function primaryOrientationColor(slug) {
  const primary = slug.split('-')[0].toUpperCase();
  return PRIMARY_ORIENTATION_COLOR[primary] || '#fff';
}

export default function ResultsPage() {
  const router = useRouter();
  const { type, name: urlName, email: urlEmail, token, from } = router.query;
  // A token param means this page was reached fresh off the quiz, and will
  // very likely redirect to /signup once the lookup below resolves. Default
  // to "checking" so the full profile never flashes before that redirect
  // fires; only stop checking once we know for certain we're staying here
  // (no token, an already-used token, or the lookup failing).
  const [checkingToken, setCheckingToken] = useState(true);
  const [pdfBuilding, setPdfBuilding] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!token || !type) { setCheckingToken(false); return; }
    // Look up token to get tier + participant info, then either apply it to
    // an already-logged-in existing account, or route a brand-new visitor
    // to signup.
    fetch(`/api/tokens/info?token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? r.json() : null)
      .then(async info => {
        if (!info || info.used) { setCheckingToken(false); return; } // already consumed or not found — show the profile

        // This token already belongs to an existing account (e.g. it's the
        // caller's own pending-assessment token, surfaced from their
        // dashboard) rather than a cold token from initial distribution.
        // If they're still logged in from having started there, apply the
        // token to their account and send them straight back to the
        // dashboard instead of through signup (which 400s on a duplicate
        // email for an account that already exists).
        if (info.hasAccount) {
          const me = await fetch('/api/portal/me').then(r => r.ok ? r.json() : null).catch(() => null);
          if (me) {
            const applied = await fetch('/api/portal/complete-assessment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            }).then(r => r.ok).catch(() => false);
            if (applied) { router.replace('/portal/dashboard'); return; }
          }
        }

        // Prefer DB-stored quiz data; fall back to URL params piped from Typeform
        const sigName = info.name || urlName || '';
        const sigEmail = info.email || urlEmail || '';
        const params = new URLSearchParams({ token, tier: info.granted_tier || 'basic' });
        if (sigName) params.set('name', sigName);
        if (sigEmail) params.set('email', sigEmail);
        router.replace(`/signup?${params.toString()}`);
        // Leave checkingToken true — this page unmounts once the redirect completes.
      })
      .catch(() => setCheckingToken(false));
  }, [router.isReady, token, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const profile = type ? profiles[type] : null;

  if (profile && checkingToken) {
    return (
      <>
        <Head>
          <title>Preparing your profile… — Curio</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="checking-page">
          <div className="checking-spinner" />
        </div>
        <style>{`
          .checking-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fff; }
          .checking-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #E7E5E4; border-top-color: #059669; animation: checking-spin 0.8s linear infinite; }
          @keyframes checking-spin { to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Head>
          <title>Profile Not Found — Curio</title>
          <meta name="robots" content="noindex, nofollow" />
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        </Head>
        <nav className="nav">
          <Link href="/" className="nav-logo">Curio<span className="nav-logo-dot">.</span></Link>
          <Link href={from === 'portal' ? '/portal/dashboard' : '/'} className="nav-back">{from === 'portal' ? '← Back to dashboard' : '← Back to site'}</Link>
        </nav>
        <div className="page">
          <div className="not-found-card">
            <div className="not-found-title">Profile not found</div>
            <p className="body-text">The profile type "{type}" doesn't exist. Valid types are: why-what, why-how, what-why, what-how, how-why, how-what.</p>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </>
    );
  }

  const rawName = urlName ? String(urlName) : null;
  const displayName = rawName && rawName.toLowerCase() !== 'individual' ? rawName : null;
  const pageTitle = displayName
    ? `${displayName}'s MindPrint Profile — ${profile.label}`
    : `MindPrint Profile — ${profile.label}`;

  async function generatePDF() {
    setPdfBuilding(true);
    try {
      await downloadProfilePdf(profile, displayName);
    } catch (err) {
      console.error(err);
      alert("Couldn't build the PDF. Please try again.");
    } finally {
      setPdfBuilding(false);
    }
  }

  const displayName_ = rawName && rawName.toLowerCase() !== 'individual' ? rawName : null;

  return (
    <>
      <Head>
        <title>{pageTitle} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </Head>

      <nav className="nav">
        <Link href="/" className="nav-logo">Curio<span className="nav-logo-dot">.</span></Link>
        <Link href={from === 'portal' ? '/portal/dashboard' : '/'} className="nav-back">{from === 'portal' ? '← Back to dashboard' : '← Back to site'}</Link>
      </nav>

      <div className="page">
        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">MindPrint Profile</div>
          {displayName_ && <div className="hero-name">{displayName_}</div>}
          <div className="hero-label" style={{ color: primaryOrientationColor(profile.slug) }}>{profile.label}</div>
          <div className="hero-tagline">{profile.tagline}</div>
          <div className="signal-box">
            <span className="signal-prefix">Signal: </span>"{profile.signal}"
          </div>
        </div>

        <div className="pdf-row">
          <button className="pdf-btn" onClick={generatePDF} disabled={pdfBuilding}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {pdfBuilding ? 'Building PDF…' : 'Save as PDF'}
          </button>
        </div>

        <Section label="Who You Are">
          <div className="card"><p className="body-text">{profile.whoYouAre}</p></div>
        </Section>

        <Section label="Your Superpower">
          <div className="card"><p className="body-text">{profile.superpower}</p></div>
        </Section>

        <Section label="What Energizes You">
          <div className="card"><p className="body-text">{profile.energizes}</p></div>
        </Section>

        <Section label="What Drains You">
          <div className="card"><DiamondList items={profile.drains} /></div>
        </Section>

        <Section label="Your Blind Spot">
          <div className="card"><p className="body-text">{profile.blindSpot}</p></div>
        </Section>

        <Section label="Where Friction Appears">
          <div className="card"><p className="body-text">{profile.friction}</p></div>
        </Section>

        <div className="side-by-side">
          <Section label="What You Need From Your Team">
            <div className="card"><p className="body-text">{profile.needFromTeam}</p></div>
          </Section>
          <Section label="How To Work With You">
            <div className="card"><p className="body-text">{profile.howToWorkWithYou}</p></div>
          </Section>
        </div>

        <Section label="Where You Add the Most Value">
          <div className="card"><TwoColDiamondList items={profile.valueAreas} /></div>
        </Section>

        <Section label="Collaboration">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Partner Profile</th>
                <th>Why It Works</th>
              </tr>
            </thead>
            <tbody>
              {profile.partners.map((p, i) => (
                <tr key={i}>
                  <td className="partner-type-cell">{p.type}</td>
                  <td className="partner-reason-cell">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section label="Areas To Watch">
          <div className="card"><DiamondList items={profile.areasToWatch} /></div>
        </Section>

        <Section label="Roles Where You Excel">
          <div className="card"><TwoColDiamondList items={profile.roles} /></div>
        </Section>

        <div className="footer-block">
          <div className="footer-title">MindPrint™ Framework</div>
          <p className="footer-body">This profile is part of the MindPrint™ Framework, a model for understanding how people and teams are wired to work. Use it to understand your own energy patterns, communicate your needs to teammates, and build partnerships that cover your blind spots.</p>
          <a href="https://www.choosecurio.com" className="footer-link">choosecurio.com</a>
        </div>

        <div className="pdf-row pdf-row--bottom">
          <button className="pdf-btn" onClick={generatePDF} disabled={pdfBuilding}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {pdfBuilding ? 'Building PDF…' : 'Save as PDF'}
          </button>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div className="section">
      <div className="section-label">
        <div className="section-bar" />
        <div className="section-title">{label}</div>
      </div>
      {children}
    </div>
  );
}

function DiamondList({ items }) {
  return (
    <div className="dlist">
      {items.map((item, i) => (
        <div key={i} className="dlist-item">
          <span className="diamond">◆</span>
          <span className="dtext">{item}</span>
        </div>
      ))}
    </div>
  );
}

function TwoColDiamondList({ items }) {
  const half = Math.ceil(items.length / 2);
  return (
    <div className="two-col-list">
      <div>
        {items.slice(0, half).map((item, i) => (
          <div key={i} className="dlist-item">
            <span className="diamond">◆</span>
            <span className="dtext">{item}</span>
          </div>
        ))}
      </div>
      <div>
        {items.slice(half).map((item, i) => (
          <div key={i} className="dlist-item">
            <span className="diamond">◆</span>
            <span className="dtext">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; -webkit-font-smoothing: antialiased; }
  body { background: #fff; color: #1C1917; font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.6; }

  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E7E5E4;
    padding: 0 clamp(24px,5vw,72px);
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-family: 'Caveat', cursive;
    font-size: 1.5rem; font-weight: 700;
    color: #1C1917; text-decoration: none;
  }
  .nav-logo-dot { color: #059669; }
  .nav-back {
    font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: #78716C;
    text-decoration: none; transition: color 0.18s;
  }
  .nav-back:hover { color: #059669; }

  .page {
    max-width: 800px; margin: 0 auto;
    padding: 48px clamp(24px,5vw,60px) 80px;
  }

  .not-found-card {
    background: #F8F9FA; border: 1px solid #E7E5E4;
    border-left: 3px solid #059669;
    border-radius: 8px; padding: 40px 48px; margin-top: 48px;
  }
  .not-found-title {
    font-family: 'Caveat', cursive; font-size: 1.5rem;
    font-weight: 700; color: #1C1917; margin-bottom: 12px;
  }

  /* Hero */
  .hero {
    background: #0F172A; border-radius: 10px;
    padding: 36px 44px 32px; margin-bottom: 32px;
  }
  .hero-eyebrow {
    font-size: 0.625rem; font-weight: 700; letter-spacing: 0.22em;
    text-transform: uppercase; color: #34D399; margin-bottom: 10px;
  }
  .hero-name {
    font-family: 'Caveat', cursive;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700; color: #CBD5E1; line-height: 1.1; margin-bottom: 2px;
  }
  .hero-label {
    font-family: 'Caveat', cursive;
    font-size: clamp(2.4rem, 5vw, 3.5rem);
    font-weight: 700; font-style: italic;
    color: #fff; line-height: 1; margin-bottom: 6px;
  }
  .hero-tagline {
    font-size: 0.875rem; color: #94A3B8;
    margin-bottom: 20px;
  }
  .signal-box {
    background: rgba(52,211,153,0.08);
    border: 1px solid rgba(52,211,153,0.2);
    border-radius: 6px; padding: 14px 18px;
    font-size: 0.9rem; color: #A7F3D0;
    font-style: italic; line-height: 1.6;
  }
  .signal-prefix { font-weight: 700; color: #34D399; font-style: normal; }

  /* PDF button */
  .pdf-row { margin-bottom: 32px; }
  .pdf-row--bottom { margin-top: 16px; margin-bottom: 0; }
  .pdf-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px;
    background: #059669; border: none; border-radius: 6px;
    color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; cursor: pointer;
    transition: background 0.18s;
  }
  .pdf-btn:hover { background: #047857; }

  /* Sections */
  .section { margin-bottom: 24px; }
  .section-label { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
  .section-bar { width: 22px; height: 2px; background: #059669; }
  .section-title {
    font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; color: #059669;
  }

  /* Cards */
  .card {
    background: #F8F9FA; border: 1px solid #E7E5E4;
    border-radius: 6px; padding: 20px 24px;
  }
  .body-text { font-size: 0.9rem; color: #44403C; line-height: 1.8; }

  /* Diamond list */
  .dlist { display: flex; flex-direction: column; gap: 8px; }
  .dlist-item { display: flex; gap: 10px; align-items: flex-start; }
  .diamond { color: #059669; font-size: 0.6rem; margin-top: 5px; flex-shrink: 0; line-height: 1; }
  .dtext { font-size: 0.9rem; color: #44403C; line-height: 1.7; }

  /* Two-col layout */
  .two-col-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .two-col-list .dlist-item { margin-bottom: 8px; }

  /* Side by side */
  .side-by-side {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    margin-bottom: 24px;
  }
  .side-by-side .section { margin-bottom: 0; }

  /* Partner table */
  .partner-table {
    width: 100%; border-collapse: collapse;
    font-size: 0.875rem;
  }
  .partner-table th {
    background: #1C1917; color: #fff;
    padding: 12px 16px; text-align: left;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
  }
  .partner-table td {
    padding: 14px 16px; border-bottom: 1px solid #E7E5E4;
    vertical-align: top; line-height: 1.6;
  }
  .partner-table tr:last-child td { border-bottom: none; }
  .partner-table tr:nth-child(odd) td { background: #F8F9FA; }
  .partner-table tr:nth-child(even) td { background: #fff; }
  .partner-type-cell { font-weight: 700; color: #1C1917; width: 36%; }
  .partner-reason-cell { color: #57534E; }

  /* Footer block */
  .footer-block {
    background: #0F172A; border-radius: 8px;
    padding: 28px 36px; margin-top: 16px;
  }
  .footer-title {
    font-size: 0.95rem; font-weight: 700;
    color: #34D399; margin-bottom: 10px;
  }
  .footer-body {
    font-size: 0.875rem; color: #94A3B8;
    line-height: 1.7; margin-bottom: 12px;
  }
  .footer-link {
    font-size: 0.875rem; font-weight: 600;
    color: #34D399; text-decoration: none;
  }
  .footer-link:hover { text-decoration: underline; }

  @media (max-width: 620px) {
    .side-by-side { grid-template-columns: 1fr; }
    .two-col-list { grid-template-columns: 1fr; }
    .hero { padding: 28px 24px; }
    .hero-label { font-size: 2.2rem; }
  }
`;
