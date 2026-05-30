import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import profiles from '../../lib/profiles';

export default function ResultsPage() {
  const router = useRouter();
  const { type, name } = router.query;

  const profile = type ? profiles[type] : null;

  if (!profile) {
    return (
      <>
        <Head>
          <title>Profile Not Found — Curio</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <nav style={nav}>
          <Link href="/" style={navLogo}>Curio<span style={{ color: '#059669' }}>.</span></Link>
          <Link href="/" style={navBack}>← Back to site</Link>
        </nav>
        <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#FAFAF9', border: '1px solid #E7E5E4', borderLeft: '3px solid #059669', borderRadius: 8, padding: '40px 48px' }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>Profile not found</div>
            <p style={{ fontSize: '0.95rem', color: '#78716C', lineHeight: 1.75 }}>
              The profile type "{type}" doesn't exist. Valid types are: why-what, why-how, what-why, what-how, how-why, how-what.
            </p>
          </div>
        </div>
      </>
    );
  }

  const displayName = name ? String(name) : null;
  const pageTitle = displayName
    ? `${displayName}'s MindPrint Profile — ${profile.label}`
    : `MindPrint Profile — ${profile.label}`;

  function generatePDF() {
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const bulletRows = (items, dotColor) =>
      items.map(item => `<div class="bullet"><span class="dot" style="background:${dotColor}"></span><span class="btext">${esc(item)}</span></div>`).join('');

    const gridItems = (items) =>
      items.map(item => `<div class="grid-item">${esc(item)}</div>`).join('');

    const partnerCards = (items) =>
      items.map(p => `<div class="partner-card"><div class="partner-type">${esc(p.type)}</div><div class="partner-reason">${esc(p.reason)}</div></div>`).join('');

    const roleItems = (items) =>
      items.map(item => `<div class="role-item">${esc(item)}</div>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(pageTitle)} — Curio</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;color:#1C1917;font-size:8.5pt;line-height:1.5;background:#fff}
.wrap{max-width:720px;margin:0 auto;padding:26px 30px}
.print-btn{display:block;width:100%;padding:14px;margin-bottom:20px;background:#059669;color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:10pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;text-align:center}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #059669;padding-bottom:11px;margin-bottom:18px}
.logo{font-family:'Caveat',cursive;font-size:21pt;font-weight:700;color:#1C1917;line-height:1}
.logo em{color:#059669;font-style:normal}
.hdr-right{text-align:right;font-size:7pt;color:#78716C}
.hdr-right strong{display:block;font-size:8pt;color:#1C1917;margin-bottom:1px}
.hero{background:#0F172A;border-radius:8px;padding:20px 22px;margin-bottom:14px}
.hero-eyebrow{font-size:6.5pt;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#34D399;margin-bottom:6px}
.hero-name{font-family:'Caveat',cursive;font-size:${displayName ? '20pt' : '16pt'};font-weight:700;color:#fff;line-height:1.1;margin-bottom:4px}
.hero-label{font-family:'Caveat',cursive;font-size:14pt;font-weight:700;color:#34D399;margin-bottom:10px}
.hero-tagline{font-size:7.5pt;color:#94A3B8;font-style:italic;margin-bottom:12px}
.signal-box{background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:5px;padding:8px 12px;font-size:7.5pt;color:#A7F3D0;font-style:italic;line-height:1.5}
.signal-prefix{font-weight:700;color:#34D399;font-style:normal}
.section{margin-bottom:12px}
.section-label{font-size:6pt;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#059669;margin-bottom:7px;display:flex;align-items:center;gap:6px}
.section-label::before{content:'';display:block;width:14px;height:1.5px;background:#059669;flex-shrink:0}
.card{background:#FAFAF9;border:1px solid #E7E5E4;border-radius:5px;padding:11px 13px}
.card-accent{border-left:2px solid #059669}
.body-text{font-size:7.5pt;color:#57534E;line-height:1.65}
.bullet{display:flex;gap:6px;align-items:flex-start;margin-bottom:3px}
.dot{width:4px;height:4px;border-radius:50%;margin-top:5px;flex-shrink:0}
.btext{font-size:7.5pt;color:#57534E;line-height:1.45}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}
.grid-item{background:#FAFAF9;border:1px solid #E7E5E4;border-radius:4px;padding:7px 9px;font-size:7pt;color:#57534E;line-height:1.4}
.side-by-side{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.partner-card{background:#fff;border:1px solid #E7E5E4;border-radius:4px;padding:8px 10px;margin-bottom:5px}
.partner-type{font-size:6.5pt;font-weight:700;letter-spacing:0.1em;color:#059669;margin-bottom:2px}
.partner-reason{font-size:7pt;color:#78716C;line-height:1.4}
.roles-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.role-item{background:#FAFAF9;border:1px solid #E7E5E4;border-radius:4px;padding:6px 9px;font-size:7pt;color:#57534E;line-height:1.35}
.footer{margin-top:16px;padding-top:10px;border-top:1px solid #E7E5E4;display:flex;justify-content:space-between;align-items:center;font-size:6.5pt;color:#A8A29E}
.flogo{font-family:'Caveat',cursive;font-size:13pt;font-weight:700;color:#1C1917}
.flogo em{color:#059669;font-style:normal}
@media print{@page{margin:12mm 10mm;size:A4 portrait}body{font-size:8pt}.wrap{padding:0;max-width:100%}.print-btn{display:none!important}}
</style>
</head>
<body>
<div class="wrap">
  <button class="print-btn" onclick="this.style.display='none';window.print();">Save as PDF</button>
  <div class="hdr">
    <div class="logo">Curio<em>.</em></div>
    <div class="hdr-right"><strong>MindPrint Profile</strong>${esc(today)}</div>
  </div>

  <div class="hero">
    <div class="hero-eyebrow">MindPrint Profile</div>
    ${displayName ? `<div class="hero-name">${esc(displayName)}'s Profile</div>` : ''}
    <div class="hero-label">${esc(profile.label)}</div>
    <div class="hero-tagline">${esc(profile.tagline)}</div>
    <div class="signal-box"><span class="signal-prefix">Signal: </span>"${esc(profile.signal)}"</div>
  </div>

  <div class="section">
    <div class="section-label">Who You Are</div>
    <div class="card card-accent"><div class="body-text">${esc(profile.whoYouAre)}</div></div>
  </div>

  <div class="section">
    <div class="section-label">Superpower</div>
    <div class="card"><div class="body-text">${esc(profile.superpower)}</div></div>
  </div>

  <div class="section">
    <div class="section-label">What Energizes You</div>
    <div class="card"><div class="body-text">${esc(profile.energizes)}</div></div>
  </div>

  <div class="two-col">
    <div>
      <div class="section-label">What Drains You</div>
      <div class="card">${bulletRows(profile.drains, '#A8A29E')}</div>
    </div>
    <div>
      <div class="section-label">Blind Spot</div>
      <div class="card"><div class="body-text">${esc(profile.blindSpot)}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Sources of Friction</div>
    <div class="card"><div class="body-text">${esc(profile.friction)}</div></div>
  </div>

  <div class="side-by-side">
    <div>
      <div class="section-label">What You Need From Your Team</div>
      <div class="card card-accent"><div class="body-text">${esc(profile.needFromTeam)}</div></div>
    </div>
    <div>
      <div class="section-label">How To Work With You</div>
      <div class="card card-accent"><div class="body-text">${esc(profile.howToWorkWithYou)}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Where You Add the Most Value</div>
    <div class="grid-3">${gridItems(profile.valueAreas)}</div>
  </div>

  <div class="section">
    <div class="section-label">Ideal Partners</div>
    ${partnerCards(profile.partners)}
  </div>

  <div class="section">
    <div class="section-label">Areas To Watch</div>
    <div class="card">${bulletRows(profile.areasToWatch, '#A8A29E')}</div>
  </div>

  <div class="section">
    <div class="section-label">Roles Where This Profile Thrives</div>
    <div class="roles-grid">${roleItems(profile.roles)}</div>
  </div>

  <div class="footer">
    <div><div class="flogo">Curio<em>.</em></div><div>MindPrint Framework™ &nbsp;&middot;&nbsp; Profile Report</div></div>
    <div style="text-align:right">choosecurio.com &nbsp;&middot;&nbsp; Generated ${esc(today)}</div>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <>
      <Head>
        <title>{pageTitle} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <style>{css}</style>
      </Head>

      <nav className="nav">
        <Link href="/" className="nav-logo">Curio<span className="nav-logo-dot">.</span></Link>
        <Link href="/" className="nav-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to site
        </Link>
      </nav>

      <div className="page">
        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">MindPrint Profile</div>
          {displayName && (
            <div className="hero-person">{displayName}'s Profile</div>
          )}
          <div className="hero-label">{profile.label}</div>
          <div className="hero-tagline">{profile.tagline}</div>
          <div className="signal-box">
            <span className="signal-prefix">Signal: </span>"{profile.signal}"
          </div>
        </div>

        {/* PDF button */}
        <div className="pdf-row">
          <button className="pdf-btn" onClick={generatePDF}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save as PDF
          </button>
        </div>

        {/* Who You Are */}
        <Section label="Who You Are">
          <div className="card card-accent">
            <p className="body-text">{profile.whoYouAre}</p>
          </div>
        </Section>

        {/* Superpower */}
        <Section label="Superpower">
          <div className="card">
            <p className="body-text">{profile.superpower}</p>
          </div>
        </Section>

        {/* Energizes */}
        <Section label="What Energizes You">
          <div className="card">
            <p className="body-text">{profile.energizes}</p>
          </div>
        </Section>

        {/* Drains + Blind Spot side by side */}
        <div className="two-col">
          <Section label="What Drains You">
            <div className="card">
              <BulletList items={profile.drains} muted />
            </div>
          </Section>
          <Section label="Blind Spot">
            <div className="card">
              <p className="body-text">{profile.blindSpot}</p>
            </div>
          </Section>
        </div>

        {/* Friction */}
        <Section label="Sources of Friction">
          <div className="card">
            <p className="body-text">{profile.friction}</p>
          </div>
        </Section>

        {/* Need From Team + How To Work With You */}
        <div className="two-col">
          <Section label="What You Need From Your Team">
            <div className="card card-accent">
              <p className="body-text">{profile.needFromTeam}</p>
            </div>
          </Section>
          <Section label="How To Work With You">
            <div className="card card-accent">
              <p className="body-text">{profile.howToWorkWithYou}</p>
            </div>
          </Section>
        </div>

        {/* Value Areas */}
        <Section label="Where You Add the Most Value">
          <div className="value-grid">
            {profile.valueAreas.map((item, i) => (
              <div key={i} className="value-item">{item}</div>
            ))}
          </div>
        </Section>

        {/* Partners */}
        <Section label="Ideal Partners">
          <div className="partners-list">
            {profile.partners.map((p, i) => (
              <div key={i} className="partner-card">
                <div className="partner-type">{p.type}</div>
                <div className="partner-reason">{p.reason}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Areas To Watch */}
        <Section label="Areas To Watch">
          <div className="card">
            <BulletList items={profile.areasToWatch} muted />
          </div>
        </Section>

        {/* Roles */}
        <Section label="Roles Where This Profile Thrives">
          <div className="roles-grid">
            {profile.roles.map((role, i) => (
              <div key={i} className="role-item">{role}</div>
            ))}
          </div>
        </Section>

        {/* Bottom PDF button */}
        <div className="pdf-row pdf-row--bottom">
          <button className="pdf-btn" onClick={generatePDF}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save as PDF
          </button>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div className="section">
      <div className="section-label">{label}</div>
      {children}
    </div>
  );
}

function BulletList({ items, muted }) {
  return (
    <div className="bullet-list">
      {items.map((item, i) => (
        <div key={i} className="bullet-item">
          <span className={`bullet-dot${muted ? ' bullet-dot--muted' : ''}`} />
          <span className="bullet-text">{item}</span>
        </div>
      ))}
    </div>
  );
}

const nav = {
  position: 'sticky', top: 0, zIndex: 100,
  background: 'rgba(255,255,255,0.96)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid #E7E5E4',
  padding: '0 clamp(24px,5vw,72px)',
  height: 72,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};

const navLogo = {
  fontFamily: "'Caveat', cursive",
  fontSize: '1.6rem', fontWeight: 700,
  color: '#1C1917', textDecoration: 'none',
};

const navBack = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#78716C',
  textDecoration: 'none',
};

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; -webkit-font-smoothing: antialiased; }
  body {
    background: #fff;
    color: #1C1917;
    font-family: 'DM Sans', system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E7E5E4;
    padding: 0 clamp(24px,5vw,72px);
    height: 72px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-family: 'Caveat', cursive;
    font-size: 1.6rem; font-weight: 700;
    color: #1C1917; text-decoration: none; letter-spacing: -0.01em;
  }
  .nav-logo-dot { color: #059669; }
  .nav-back {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #78716C;
    text-decoration: none; transition: color 0.2s;
  }
  .nav-back:hover { color: #059669; }

  .page {
    max-width: 860px; margin: 0 auto;
    padding: 56px clamp(24px,5vw,72px) 100px;
  }

  /* Hero */
  .hero {
    background: #0F172A;
    border-radius: 12px;
    padding: 40px 48px;
    margin-bottom: 40px;
  }
  .hero-eyebrow {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; color: #34D399; margin-bottom: 12px;
  }
  .hero-person {
    font-family: 'Caveat', cursive;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 6px;
  }
  .hero-label {
    font-family: 'Caveat', cursive;
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    font-weight: 700; color: #34D399; margin-bottom: 8px; line-height: 1.2;
  }
  .hero-tagline {
    font-size: 0.95rem; color: #94A3B8;
    font-style: italic; margin-bottom: 24px;
  }
  .signal-box {
    background: rgba(52,211,153,0.1);
    border: 1px solid rgba(52,211,153,0.25);
    border-radius: 8px;
    padding: 14px 18px;
    font-size: 0.95rem; color: #A7F3D0;
    font-style: italic; line-height: 1.6;
  }
  .signal-prefix {
    font-weight: 700; color: #34D399; font-style: normal;
  }

  /* PDF button */
  .pdf-row {
    margin-bottom: 40px;
    display: flex;
  }
  .pdf-row--bottom {
    margin-top: 24px; margin-bottom: 0;
  }
  .pdf-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 28px;
    background: #059669; border: none; border-radius: 8px;
    color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; cursor: pointer;
    transition: background 0.18s ease;
  }
  .pdf-btn:hover { background: #047857; }

  /* Sections */
  .section { margin-bottom: 28px; }
  .section-label {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.17em;
    text-transform: uppercase; color: #059669;
    margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
  }
  .section-label::before {
    content: ''; display: block; width: 20px; height: 1.5px; background: #059669; flex-shrink: 0;
  }

  /* Cards */
  .card {
    background: #FAFAF9; border: 1px solid #E7E5E4;
    border-radius: 8px; padding: 24px 28px;
  }
  .card-accent { border-left: 2px solid #059669; }
  .body-text { font-size: 0.95rem; color: #57534E; line-height: 1.8; }

  /* Two-col layout */
  .two-col {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    margin-bottom: 28px;
  }
  .two-col .section { margin-bottom: 0; }

  /* Bullet list */
  .bullet-list { display: flex; flex-direction: column; gap: 10px; }
  .bullet-item { display: flex; gap: 12px; align-items: flex-start; }
  .bullet-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #059669; margin-top: 8px; flex-shrink: 0;
  }
  .bullet-dot--muted { background: #A8A29E; }
  .bullet-text { font-size: 0.9rem; color: #57534E; line-height: 1.7; }

  /* Value areas grid */
  .value-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  }
  .value-item {
    background: #FAFAF9; border: 1px solid #E7E5E4;
    border-radius: 6px; padding: 14px 16px;
    font-size: 0.875rem; color: #57534E; line-height: 1.5;
  }

  /* Partners */
  .partners-list { display: flex; flex-direction: column; gap: 12px; }
  .partner-card {
    background: #FAFAF9; border: 1px solid #E7E5E4;
    border-left: 2px solid #059669;
    border-radius: 8px; padding: 16px 20px;
  }
  .partner-type {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #059669; margin-bottom: 6px;
  }
  .partner-reason { font-size: 0.9rem; color: #78716C; line-height: 1.65; }

  /* Roles grid */
  .roles-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  .role-item {
    background: #FAFAF9; border: 1px solid #E7E5E4;
    border-radius: 6px; padding: 12px 16px;
    font-size: 0.875rem; color: #57534E; line-height: 1.45;
  }

  @media (max-width: 640px) {
    .two-col { grid-template-columns: 1fr; }
    .value-grid { grid-template-columns: 1fr 1fr; }
    .roles-grid { grid-template-columns: 1fr; }
    .hero { padding: 28px 24px; }
  }
`;
