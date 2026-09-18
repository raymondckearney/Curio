import { useState } from 'react';
import onboardingResources from '../lib/onboardingResources';

// Same three orientation colors used across the portal (TeamDynamics'
// ORIENT, the style guide's dark-background set, SessionArchitect's PDF
// palette): mint/WHY, sky/WHAT, amber/HOW.
const ORIENT = {
  WHY:  { color: '#065F46', light: '#DCFCE7', mid: '#6EE7B7' },
  WHAT: { color: '#1E40AF', light: '#DBEAFE', mid: '#93C5FD' },
  HOW:  { color: '#92400E', light: '#FEF3C7', mid: '#FCD34D' },
};

const PROFILES = Object.keys(onboardingResources).map(slug => ({
  slug,
  primary: slug.split('-')[0].toUpperCase(),
  ...onboardingResources[slug],
}));

const CSS = `
  .or-root{font-family:'DM Sans',system-ui,sans-serif;color:#0F172A;font-size:14px;line-height:1.6;}
  .or-hero{background:#0F172A;color:#fff;padding:28px 24px;border-radius:8px;margin-bottom:24px;}
  .or-hero p{margin:8px 0 0;color:#A7F3D0;font-size:0.92rem;max-width:640px;line-height:1.5;}
  .or-profile-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
  .or-profile-pill{padding:9px 18px;border-radius:99px;font-size:12.5px;font-weight:700;cursor:pointer;border:1.5px solid #E2E8F0;background:#fff;color:#475569;font-family:'DM Sans',sans-serif;letter-spacing:0.02em;transition:all 0.12s;}
  .or-profile-pill:hover{border-color:#059669;color:#065F46;}
  .or-toggle-row{display:flex;gap:4px;background:#F1F5F9;border-radius:99px;padding:4px;width:fit-content;margin-bottom:24px;}
  .or-toggle-btn{padding:8px 20px;border-radius:99px;font-size:12.5px;font-weight:700;cursor:pointer;border:none;background:none;color:#64748B;font-family:'DM Sans',sans-serif;transition:all 0.12s;}
  .or-toggle-btn.active{background:#0F172A;color:#fff;}
  .or-content-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap;}
  .or-intro{font-style:italic;color:#475569;font-size:14px;max-width:640px;margin:0;}
  .or-btn{padding:10px 22px;font-size:13px;font-weight:700;border:none;border-radius:999px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;letter-spacing:0.01em;white-space:nowrap;}
  .or-btn-primary{background:#059669;color:white;}
  .or-btn-primary:hover{background:#065F46;}
  .or-btn-primary:disabled{background:#E2E8F0;color:#94A3B8;cursor:not-allowed;}
  .or-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:24px 28px;margin-bottom:16px;box-shadow:0 1px 6px rgba(15,23,42,0.05);}
  .or-card-title{font-family:'Caveat',cursive;font-size:1.3rem;font-weight:700;color:#0F172A;margin-bottom:14px;}
  .or-col-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .or-list{margin:0;padding-left:18px;}
  .or-list li{margin-bottom:8px;color:#334155;}
  .or-example{margin-top:14px;padding:10px 14px;background:#F8FAFC;border-radius:8px;font-size:12.5px;font-style:italic;color:#64748B;}
  .or-quote{margin-top:14px;padding:12px 16px;border-left:3px solid #059669;background:#F0FDF4;font-size:13px;font-style:italic;color:#065F46;}
  .or-day-row{display:flex;gap:16px;margin-bottom:14px;align-items:flex-start;}
  .or-day-label{flex-shrink:0;width:64px;font-weight:700;font-size:12px;color:#059669;letter-spacing:0.02em;padding-top:2px;}
  .or-day-text{color:#334155;flex:1;}
  .or-note{display:flex;gap:12px;margin-bottom:16px;}
  .or-note:last-child{margin-bottom:0;}
  .or-note-num{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#0F172A;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px;}
  .or-note-body{flex:1;}
  .or-note-lead{font-weight:700;color:#0F172A;margin-bottom:3px;}
  .or-note-rest{color:#334155;}
  .or-empty{text-align:center;padding:80px 40px;color:#94A3B8;}
  .or-empty-title{font-family:'Caveat',cursive;font-size:1.6rem;font-weight:700;color:#475569;margin-bottom:8px;}
  @media (max-width: 720px){ .or-col-grid{grid-template-columns:1fr;} }
`;

function ProfilePill({ profile, active, onClick }) {
  const c = ORIENT[profile.primary];
  return (
    <button
      className="or-profile-pill"
      onClick={onClick}
      style={active ? { background: c.color, color: '#fff', borderColor: c.color } : {}}
    >
      {profile.label}
    </button>
  );
}

// jsPDF colors, one dark/text pair and one bright/accent pair per
// orientation — same triad used in components/SessionArchitect.js's PDF
// generation (PDF_ENERGY_RGB) and TeamDynamics' ORIENT.
const ORIENT_DEEP_RGB = { WHY: [6, 95, 70], WHAT: [30, 64, 175], HOW: [146, 64, 14] };
const ORIENT_MID_RGB = { WHY: [110, 231, 183], WHAT: [147, 197, 253], HOW: [252, 211, 77] };
const PDF_INK = [15, 23, 42];

function buildOnboardingPdf(JsPDF, profile, view) {
  const deep = ORIENT_DEEP_RGB[profile.primary];
  const mid = ORIENT_MID_RGB[profile.primary];
  const data = view === 'manager' ? profile.manager : profile.newHire;

  const doc = new JsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxW = pageW - margin * 2;
  let y = margin;

  const guideLabel = view === 'manager' ? 'Manager Integration Guide' : 'New Hire Brief';

  function footer() {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Curio.', margin, pageH - 30);
    doc.text(`MindPrint™ ${guideLabel} · ${profile.slug.toUpperCase()}`, pageW - margin, pageH - 30, { align: 'right' });
    doc.setTextColor(...PDF_INK);
  }

  function pageBreak(h) {
    if (y + h > pageH - 60) {
      footer();
      doc.addPage();
      y = margin;
    }
  }

  // followHeight reserves room for whatever comes right after the header
  // (e.g. the first Day 30/60/90 block), so a page break never strands the
  // header alone at the bottom of a page with all its content pushed over.
  function sectionHeader(text, followHeight = 0) {
    pageBreak(30 + followHeight);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.setTextColor(...deep);
    doc.text(text.toUpperCase(), margin, y);
    doc.setTextColor(...PDF_INK);
    y += 18;
  }

  function dayBlockHeight(text) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    return 14 + doc.splitTextToSize(text, maxW).length * 13 + 14;
  }

  function bodyText(text, opts = {}) {
    doc.setFont('helvetica', opts.italic ? 'italic' : 'normal');
    doc.setFontSize(opts.size || 10.5);
    const lines = doc.splitTextToSize(text, maxW - (opts.indent || 0));
    pageBreak(lines.length * 13 + 6);
    doc.text(lines, margin + (opts.indent || 0), y);
    y += lines.length * 13 + (opts.gap ?? 12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
  }

  function bulletList(items) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    items.forEach(it => {
      const lines = doc.splitTextToSize(`•  ${it}`, maxW - 10);
      pageBreak(lines.length * 13 + 4);
      doc.text(lines, margin + 6, y);
      y += lines.length * 13 + 5;
    });
    y += 6;
  }

  // First-item/first-line height for whatever follows a header, so
  // sectionHeader can reserve room for both together (see dayBlock).
  function firstBulletHeight(items) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    return doc.splitTextToSize(`•  ${items[0]}`, maxW - 10).length * 13 + 4;
  }
  function textHeight(text, opts = {}) {
    doc.setFont('helvetica', opts.italic ? 'italic' : 'normal');
    doc.setFontSize(opts.size || 10.5);
    return doc.splitTextToSize(text, maxW - (opts.indent || 0)).length * 13 + 6;
  }

  function dayBlock(label, text) {
    // Reserve the label's own height plus its body's, together, so a
    // page break never strands the "Day N" label alone at the bottom of
    // a page with its explanation pushed to the next one.
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(text, maxW);
    pageBreak(14 + lines.length * 13 + 14);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
    doc.setTextColor(...deep);
    doc.text(label, margin, y);
    doc.setTextColor(...PDF_INK);
    y += 14;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 14;
  }

  function noteHeight(it) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
    const leadLines = doc.splitTextToSize(`1.  ${it.lead}`, maxW);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    const bodyLines = doc.splitTextToSize(it.body, maxW - 16);
    return leadLines.length * 13 + 4 + bodyLines.length * 13 + 16;
  }

  function numberedNotes(items) {
    items.forEach((it, i) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
      const leadLines = doc.splitTextToSize(`${i + 1}.  ${it.lead}`, maxW);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
      const bodyLines = doc.splitTextToSize(it.body, maxW - 16);
      // Reserve the lead sentence and its body together — same reasoning
      // as dayBlock — so a break never strands the numbered lead alone.
      pageBreak(leadLines.length * 13 + 4 + bodyLines.length * 13 + 16);

      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
      doc.text(leadLines, margin, y);
      y += leadLines.length * 13 + 4;

      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
      doc.text(bodyLines, margin + 16, y);
      y += bodyLines.length * 13 + 16;
    });
  }

  // Cover band
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 120, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Curio.', margin, 55);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...mid);
  doc.text(profile.label, pageW - margin, 50, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.setTextColor(226, 232, 240);
  doc.text(profile.tagline, pageW - margin, 68, { align: 'right' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(guideLabel.toUpperCase(), margin, 95);
  doc.setTextColor(...PDF_INK);

  y = 150;

  if (view === 'manager') {
    bodyText(data.intro, { italic: true, gap: 20 });

    sectionHeader('Energizing Early On', firstBulletHeight(data.energizing.items));
    bulletList(data.energizing.items);
    bodyText(`Example: ${data.energizing.example}`, { italic: true, size: 9.5, gap: 18 });

    sectionHeader('Draining If Unmanaged', firstBulletHeight(data.draining.items));
    bulletList(data.draining.items);
    bodyText(`Example: ${data.draining.example}`, { italic: true, size: 9.5, gap: 18 });

    sectionHeader('Day 1, Done Right', firstBulletHeight(data.day1));
    bulletList(data.day1);

    sectionHeader('Week 1, Done Right', firstBulletHeight(data.week1));
    bulletList(data.week1);

    sectionHeader('The 90-Day Check-Ins', dayBlockHeight(data.checkins.day30));
    dayBlock('Day 30', data.checkins.day30);
    dayBlock('Day 60', data.checkins.day60);
    dayBlock('Day 90', data.checkins.day90);

    sectionHeader('Best-Fit Onboarding Partner', textHeight(data.partner));
    bodyText(data.partner, { gap: 18 });

    sectionHeader('Common Misreadings', noteHeight(data.misreadings[0]));
    numberedNotes(data.misreadings);
  } else {
    bodyText(data.intro, { italic: true, gap: 20 });

    sectionHeader('What Will Energize You', textHeight(data.energize.text));
    bodyText(data.energize.text, { gap: 10 });
    bodyText(`Try saying: "${data.energize.tryPhrase}`, { italic: true, size: 9.5, gap: 18 });

    sectionHeader('What Might Drain You', textHeight(data.drain.text));
    bodyText(data.drain.text, { gap: 18 });

    sectionHeader('Your First 90 Days', dayBlockHeight(data.days.day30));
    dayBlock('Day 30', data.days.day30);
    dayBlock('Day 60', data.days.day60);
    dayBlock('Day 90', data.days.day90);

    sectionHeader('Worth Knowing About Yourself', noteHeight(data.worthKnowing[0]));
    numberedNotes(data.worthKnowing);
  }

  footer();
  doc.save(`curio-onboarding-${profile.slug}-${view === 'manager' ? 'manager' : 'new-hire'}.pdf`);
}

export default function OnboardingResources() {
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [view, setView] = useState('manager');
  const [pdfBuilding, setPdfBuilding] = useState(false);

  const profile = selectedSlug ? PROFILES.find(p => p.slug === selectedSlug) : null;
  const data = profile ? (view === 'manager' ? profile.manager : profile.newHire) : null;

  async function handleDownloadPDF() {
    if (!profile) return;
    setPdfBuilding(true);
    try {
      const { jsPDF } = await import('jspdf');
      buildOnboardingPdf(jsPDF, profile, view);
    } catch (err) {
      console.error(err);
      alert("Couldn't build the PDF. Please try again.");
    } finally {
      setPdfBuilding(false);
    }
  }

  return (
    <div className="or-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="or-hero">
        <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: '1.8rem' }}>Onboarding Resources</p>
        <p>Select the MindPrint™ profile of the person you're onboarding to see how to set them up for their first 90 days — from the manager's side or their own.</p>
      </div>

      <div className="or-profile-row">
        {PROFILES.map(p => (
          <ProfilePill key={p.slug} profile={p} active={p.slug === selectedSlug} onClick={() => setSelectedSlug(p.slug)} />
        ))}
      </div>

      {!profile && (
        <div className="or-empty">
          <div className="or-empty-title">Select a profile above</div>
          <div>Pick the MindPrint™ profile of the person you're onboarding to see their guide.</div>
        </div>
      )}

      {profile && (
        <>
          <div className="or-toggle-row">
            <button className={`or-toggle-btn${view === 'manager' ? ' active' : ''}`} onClick={() => setView('manager')}>Manager View</button>
            <button className={`or-toggle-btn${view === 'newHire' ? ' active' : ''}`} onClick={() => setView('newHire')}>New Hire View</button>
          </div>

          <div className="or-content-header">
            <p className="or-intro">{data.intro}</p>
            <button className="or-btn or-btn-primary" onClick={handleDownloadPDF} disabled={pdfBuilding}>
              {pdfBuilding ? 'Building PDF…' : 'Download PDF'}
            </button>
          </div>

          {view === 'manager' ? (
            <>
              <div className="or-col-grid">
                <div className="or-card">
                  <div className="or-card-title">Energizing Early On</div>
                  <ul className="or-list">{data.energizing.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  <div className="or-example">Example: {data.energizing.example}</div>
                </div>
                <div className="or-card">
                  <div className="or-card-title">Draining If Unmanaged</div>
                  <ul className="or-list">{data.draining.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  <div className="or-example">Example: {data.draining.example}</div>
                </div>
              </div>

              <div className="or-col-grid">
                <div className="or-card">
                  <div className="or-card-title">Day 1, Done Right</div>
                  <ul className="or-list">{data.day1.map((it, i) => <li key={i}>{it}</li>)}</ul>
                </div>
                <div className="or-card">
                  <div className="or-card-title">Week 1, Done Right</div>
                  <ul className="or-list">{data.week1.map((it, i) => <li key={i}>{it}</li>)}</ul>
                </div>
              </div>

              <div className="or-card">
                <div className="or-card-title">The 90-Day Check-Ins</div>
                <div className="or-day-row"><div className="or-day-label">Day 30</div><div className="or-day-text">{data.checkins.day30}</div></div>
                <div className="or-day-row"><div className="or-day-label">Day 60</div><div className="or-day-text">{data.checkins.day60}</div></div>
                <div className="or-day-row"><div className="or-day-label">Day 90</div><div className="or-day-text">{data.checkins.day90}</div></div>
              </div>

              <div className="or-card">
                <div className="or-card-title">Best-Fit Onboarding Partner</div>
                <p style={{ margin: 0, color: '#334155' }}>{data.partner}</p>
              </div>

              <div className="or-card">
                <div className="or-card-title">Common Misreadings</div>
                {data.misreadings.map((m, i) => (
                  <div className="or-note" key={i}>
                    <div className="or-note-num">{i + 1}</div>
                    <div className="or-note-body">
                      <div className="or-note-lead">{m.lead}</div>
                      <div className="or-note-rest">{m.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="or-col-grid">
                <div className="or-card">
                  <div className="or-card-title">What Will Energize You</div>
                  <p style={{ margin: 0, color: '#334155' }}>{data.energize.text}</p>
                  <div className="or-quote">Try saying: "{data.energize.tryPhrase}</div>
                </div>
                <div className="or-card">
                  <div className="or-card-title">What Might Drain You</div>
                  <p style={{ margin: 0, color: '#334155' }}>{data.drain.text}</p>
                </div>
              </div>

              <div className="or-card">
                <div className="or-card-title">Your First 90 Days</div>
                <div className="or-day-row"><div className="or-day-label">Day 30</div><div className="or-day-text">{data.days.day30}</div></div>
                <div className="or-day-row"><div className="or-day-label">Day 60</div><div className="or-day-text">{data.days.day60}</div></div>
                <div className="or-day-row"><div className="or-day-label">Day 90</div><div className="or-day-text">{data.days.day90}</div></div>
              </div>

              <div className="or-card">
                <div className="or-card-title">Worth Knowing About Yourself</div>
                {data.worthKnowing.map((m, i) => (
                  <div className="or-note" key={i}>
                    <div className="or-note-num">{i + 1}</div>
                    <div className="or-note-body">
                      <div className="or-note-lead">{m.lead}</div>
                      <div className="or-note-rest">{m.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
