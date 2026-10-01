// The downloadable MindPrint™ profile, built as a real PDF file with jsPDF
// (same approach as the Onboarding Resources, Session Architect, and
// Meeting Architect PDFs) so it downloads in one tap on phones too. It
// replaced an HTML print page opened in a new tab, which iPhones often
// refused to open and which needed two more taps to reach a PDF.
//
// Used by the profile page's "Download Full Profile PDF" button and the
// results page's "Save as PDF" buttons. Content mirrors the results page.

// Style guide orientation colors for dark backgrounds (the cover band is
// navy), plus the emerald used for section labels.
const PRIMARY_RGB = { WHY: [110, 231, 183], WHAT: [147, 197, 253], HOW: [252, 211, 77] };
const NAVY = [15, 23, 42];
const INK = [28, 25, 23];
const BODY = [68, 64, 60];
const MUTED = [148, 163, 184];
const EMERALD = [5, 150, 105];
const MINT = [167, 243, 208];

function buildProfilePdf(JsPDF, profile, name) {
  const doc = new JsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxW = pageW - margin * 2;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const primary = PRIMARY_RGB[profile.slug.split('-')[0].toUpperCase()] || [255, 255, 255];
  let y = margin;

  function footer() {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('MindPrint™ Framework · choosecurio.com', margin, pageH - 30);
    doc.text(today, pageW - margin, pageH - 30, { align: 'right' });
  }

  function pageBreak(h) {
    if (y + h > pageH - 60) {
      footer();
      doc.addPage();
      y = margin;
    }
  }

  function lines(text, size, style = 'normal', width = maxW) {
    doc.setFont('helvetica', style); doc.setFontSize(size);
    return doc.splitTextToSize(String(text), width);
  }

  // Reserves room for the label plus the first lines of what follows, so a
  // label is never stranded alone at the bottom of a page.
  function label(text, followHeight) {
    pageBreak(24 + Math.min(followHeight, 60));
    doc.setFillColor(...EMERALD);
    doc.rect(margin, y - 9, 18, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...EMERALD);
    doc.text(text.toUpperCase(), margin, y + 4, { charSpace: 1 });
    y += 20;
  }

  function paragraph(text) {
    const l = lines(text, 10.5);
    l.forEach(line => {
      pageBreak(14);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
      doc.setTextColor(...BODY);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 14;
  }

  function bullets(items) {
    items.forEach(it => {
      const l = lines(it, 10.5, 'normal', maxW - 14);
      pageBreak(l.length * 14);
      doc.setFillColor(...EMERALD);
      doc.circle(margin + 3, y - 3.5, 1.8, 'F');
      doc.setTextColor(...BODY);
      doc.text(l, margin + 14, y);
      y += l.length * 14 + 3;
    });
    y += 11;
  }

  function section(title, text) {
    label(title, lines(text, 10.5).length * 14);
    paragraph(text);
  }

  function listSection(title, items) {
    label(title, lines(items[0], 10.5, 'normal', maxW - 14).length * 14);
    bullets(items);
  }

  // Cover band: sized to its contents (the signal can run two lines).
  const signalLines = lines(`“${profile.signal}”`, 10.5, 'italic', maxW - 28);
  const bandH = 150 + (name ? 32 : 0) + signalLines.length * 14;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, bandH, 'F');
  let by = 46;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('Curio.', margin, by);
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_RGB.WHY);
  doc.text('MINDPRINT™ PROFILE', pageW - margin, by, { align: 'right', charSpace: 1.2 });
  by += 34;
  if (name) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(name, margin, by);
    by += 32;
  }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(26);
  doc.setTextColor(...primary);
  doc.text(profile.label, margin, by);
  by += 20;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(profile.tagline, margin, by);
  by += 22;
  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, by - 12, maxW, signalLines.length * 14 + 12, 3, 3, 'S');
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10.5);
  doc.setTextColor(...MINT);
  doc.text(signalLines, margin + 14, by + 3);

  y = bandH + 40;

  section('Who You Are', profile.whoYouAre);
  section('Your Superpower', profile.superpower);
  section('What Energizes You', profile.energizes);
  listSection('What Drains You', profile.drains);
  section('Your Blind Spot', profile.blindSpot);
  section('Where Friction Appears', profile.friction);
  section('What You Need From Your Team', profile.needFromTeam);
  section('How To Work With You', profile.howToWorkWithYou);
  listSection('Where You Add the Most Value', profile.valueAreas);

  // Collaboration: each partner profile in bold, the reason beneath it.
  const firstPartner = lines(profile.partners[0].reason, 10.5, 'normal', maxW - 14).length * 14 + 16;
  label('Collaboration', firstPartner);
  profile.partners.forEach(p => {
    const reason = lines(p.reason, 10.5, 'normal', maxW - 14);
    pageBreak(16 + reason.length * 14);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(p.type, margin, y);
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BODY);
    doc.text(reason, margin + 14, y);
    y += reason.length * 14 + 9;
  });
  y += 6;

  listSection('Areas To Watch', profile.areasToWatch);
  listSection('Roles Where You Excel', profile.roles);

  // Closing note, same text as the results page.
  const closing = lines('This profile is part of the MindPrint™ Framework, a model for understanding how people and teams are wired to work. Use it to understand your own energy patterns, communicate your needs to teammates, and build partnerships that cover your blind spots.', 9.5, 'normal', maxW - 36);
  const boxH = 44 + closing.length * 13;
  pageBreak(boxH + 10);
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, y, maxW, boxH, 4, 4, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.setTextColor(52, 211, 153);
  doc.text('MindPrint™ Framework', margin + 18, y + 22);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(closing, margin + 18, y + 38);

  footer();
  return doc;
}

function fileSlug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Builds and downloads the PDF. `name` is optional (shown on the cover and
// in the file name).
export async function downloadProfilePdf(profile, name) {
  const { jsPDF } = await import('jspdf');
  const doc = buildProfilePdf(jsPDF, profile, name || null);
  const who = fileSlug(name);
  doc.save(`curio-mindprint-profile-${profile.slug}${who ? `-${who}` : ''}.pdf`);
}
