import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import profiles from '../../lib/profiles';
import { dbGet, dbQuery, dbPatch } from '../../lib/supabase';

export async function getServerSideProps({ query }) {
  const { token } = query;
  if (!token) return { props: {} };

  try {
    const rows = await dbGet('tokens', { token });
    if (!rows.length || rows[0].used) return { props: {} };

    // Fetch latest assessment to capture what the participant submitted
    const assessments = await dbQuery('assessments', {
      token: `eq.${token}`,
      order: 'submitted_at.desc',
      limit: '1',
    });
    const assessment = assessments[0] || null;

    const patch = {};
    if (assessment?.name)  patch.created_for_name  = assessment.name;
    if (assessment?.email) patch.created_for_email = assessment.email;
    if (Object.keys(patch).length) {
      await dbPatch('tokens', { token }, patch);
    }

    return {
      redirect: {
        destination: `/signup?token=${encodeURIComponent(token)}`,
        permanent: false,
      },
    };
  } catch (err) {
    console.error('[results getServerSideProps]', err);
    return { props: {} };
  }
}

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
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        </Head>
        <nav className="nav">
          <Link href="/" className="nav-logo">Curio<span className="nav-logo-dot">.</span></Link>
          <Link href="/" className="nav-back">← Back to site</Link>
        </nav>
        <div className="page">
          <div className="not-found-card">
            <div className="not-found-title">Profile not found</div>
            <p className="body-text">The profile type "{type}" doesn't exist. Valid types are: why-what, why-how, what-why, what-how, how-why, how-what.</p>
          </div>
        </div>
        <style>{css}</style>
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

    const diamondList = (items) =>
      items.map(item => `<div class="dlist-item"><span class="diamond">◆</span><span class="dtext">${esc(item)}</span></div>`).join('');

    const twoColDiamondList = (items) => {
      const half = Math.ceil(items.length / 2);
      const left = items.slice(0, half);
      const right = items.slice(half);
      return `<div class="two-col-list">
        <div>${diamondList(left)}</div>
        <div>${diamondList(right)}</div>
      </div>`;
    };

    const partnerRows = (items) =>
      items.map(p => `<tr><td class="partner-type-cell">${esc(p.type)}</td><td class="partner-reason-cell">${esc(p.reason)}</td></tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(pageTitle)}</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;color:#1C1917;font-size:9pt;line-height:1.55;background:#fff}
.wrap{max-width:720px;margin:0 auto;padding:20px 28px}
.print-btn{display:block;width:100%;padding:12px;margin-bottom:18px;background:#059669;color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:9pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;text-align:center}

/* Hero */
.hero{background:#0F172A;border-radius:6px;padding:22px 26px 20px;margin-bottom:20px}
.eyebrow{font-size:6pt;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#34D399;margin-bottom:8px}
.hero-name{font-family:'Caveat',cursive;font-size:22pt;font-weight:700;color:#fff;line-height:1.1;margin-bottom:3px}
.hero-label{font-family:'Caveat',cursive;font-size:30pt;font-weight:700;color:#fff;line-height:1;margin-bottom:4px;font-style:italic}
.hero-tagline{font-size:8pt;color:#94A3B8;margin-bottom:14px}
.signal-box{background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:4px;padding:8px 12px;font-size:8pt;color:#A7F3D0;font-style:italic;line-height:1.55}
.signal-prefix{font-weight:700;color:#34D399;font-style:normal}

/* Section label */
.section{margin-bottom:16px}
.section-label{display:flex;flex-direction:column;gap:4px;margin-bottom:9px}
.section-bar{width:24px;height:2px;background:#059669}
.section-title{font-size:6.5pt;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#059669}

/* Cards */
.card{background:#F8F9FA;border:1px solid #E7E5E4;border-radius:4px;padding:12px 14px}
.body-text{font-size:8.5pt;color:#44403C;line-height:1.7}

/* Diamond list */
.dlist-item{display:flex;gap:8px;align-items:flex-start;margin-bottom:5px}
.diamond{color:#059669;font-size:7pt;margin-top:3px;flex-shrink:0;line-height:1}
.dtext{font-size:8.5pt;color:#44403C;line-height:1.6}

/* Two-col diamond list */
.two-col-list{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}

/* Side by side sections */
.side-by-side{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.side-by-side .section{margin-bottom:0}

/* Partner table */
.partner-table{width:100%;border-collapse:collapse;font-size:8pt}
.partner-table th{background:#1C1917;color:#fff;padding:8px 12px;text-align:left;font-weight:600;font-size:7.5pt}
.partner-table td{padding:9px 12px;border-bottom:1px solid #E7E5E4;vertical-align:top;color:#44403C;line-height:1.55}
.partner-type-cell{font-weight:700;color:#1C1917;width:38%}
.partner-reason-cell{color:#57534E}
.partner-table tr:last-child td{border-bottom:none}
.partner-table tr:nth-child(even) td{background:#FAFAF9}

/* Footer block */
.footer-block{background:#0F172A;border-radius:6px;padding:18px 22px;margin-top:20px}
.footer-title{font-size:9pt;font-weight:700;color:#34D399;margin-bottom:7px}
.footer-body{font-size:8pt;color:#94A3B8;line-height:1.65;margin-bottom:9px}
.footer-link{font-size:8pt;font-weight:600;color:#34D399}

.page-footer{margin-top:14px;display:flex;justify-content:space-between;font-size:6.5pt;color:#A8A29E}

@media print{
  @page{margin:12mm 10mm;size:A4 portrait}
  body{font-size:8.5pt}
  .wrap{padding:0;max-width:100%}
  .print-btn{display:none!important}
}
</style>
</head>
<body>
<div class="wrap">
  <button class="print-btn" onclick="this.style.display='none';window.print();">Save as PDF</button>

  <div class="hero">
    <div class="eyebrow">MindPrint Profile</div>
    ${displayName ? `<div class="hero-name">${esc(displayName)}</div>` : ''}
    <div class="hero-label">${esc(profile.label)}</div>
    <div class="hero-tagline">${esc(profile.tagline)}</div>
    <div class="signal-box"><span class="signal-prefix">Signal: </span>"${esc(profile.signal)}"</div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Who You Are</div></div>
    <div class="card"><div class="body-text">${esc(profile.whoYouAre)}</div></div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Your Superpower</div></div>
    <div class="card"><div class="body-text">${esc(profile.superpower)}</div></div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">What Energizes You</div></div>
    <div class="card"><div class="body-text">${esc(profile.energizes)}</div></div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">What Drains You</div></div>
    <div class="card">${diamondList(profile.drains)}</div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Your Blind Spot</div></div>
    <div class="card"><div class="body-text">${esc(profile.blindSpot)}</div></div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Where Friction Appears</div></div>
    <div class="card"><div class="body-text">${esc(profile.friction)}</div></div>
  </div>

  <div class="side-by-side">
    <div class="section">
      <div class="section-label"><div class="section-bar"></div><div class="section-title">What You Need From Your Team</div></div>
      <div class="card"><div class="body-text">${esc(profile.needFromTeam)}</div></div>
    </div>
    <div class="section">
      <div class="section-label"><div class="section-bar"></div><div class="section-title">How To Work With You</div></div>
      <div class="card"><div class="body-text">${esc(profile.howToWorkWithYou)}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Where You Add the Most Value</div></div>
    <div class="card">${twoColDiamondList(profile.valueAreas)}</div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Collaboration</div></div>
    <table class="partner-table">
      <thead><tr><th>Partner Profile</th><th>Why It Works</th></tr></thead>
      <tbody>${partnerRows(profile.partners)}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Areas To Watch</div></div>
    <div class="card">${diamondList(profile.areasToWatch)}</div>
  </div>

  <div class="section">
    <div class="section-label"><div class="section-bar"></div><div class="section-title">Roles Where You Excel</div></div>
    <div class="card">${twoColDiamondList(profile.roles)}</div>
  </div>

  <div class="footer-block">
    <div class="footer-title">MindPrint™ Framework</div>
    <div class="footer-body">This profile is part of the MindPrint™ Framework, a model for understanding how people and teams are wired to work. Use it to understand your own energy patterns, communicate your needs to teammates, and build partnerships that cover your blind spots.</div>
    <div class="footer-link">choosecurio.com</div>
  </div>

  <div class="page-footer">
    <div>MindPrint™ Framework · choosecurio.com</div>
    <div>${esc(today)}</div>
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

  const displayName_ = name ? String(name) : null;

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
        <Link href="/" className="nav-back">← Back to site</Link>
      </nav>

      <div className="page">
        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">MindPrint Profile</div>
          {displayName_ && <div className="hero-name">{displayName_}</div>}
          <div className="hero-label">{profile.label}</div>
          <div className="hero-tagline">{profile.tagline}</div>
          <div className="signal-box">
            <span className="signal-prefix">Signal: </span>"{profile.signal}"
          </div>
        </div>

        <div className="pdf-row">
          <button className="pdf-btn" onClick={generatePDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save as PDF
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
          <button className="pdf-btn" onClick={generatePDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
