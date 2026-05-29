import Head from 'next/head';

const CSS = `
    /* ── RESET ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
    body { font-family: 'DM Sans', system-ui, sans-serif; color: #111827; background: #F9FAFB; line-height: 1.6; }
    img { display: block; max-width: 100%; }
    a { text-decoration: none; color: inherit; }

    /* ── LAYOUT ── */
    .page { max-width: 1100px; margin: 0 auto; padding: 0 40px 120px; }
    .section { margin-bottom: 100px; }
    .section-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.68rem; font-weight: 800;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: #059669; margin-bottom: 8px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-title::before { content: ''; display: block; width: 24px; height: 2px; background: #059669; border-radius: 2px; }
    .section-heading {
      font-family: 'Caveat', cursive;
      font-size: 2.2rem; font-weight: 800;
      color: #111827; line-height: 1.15;
      margin-bottom: 10px;
    }
    .section-desc { font-size: 0.9375rem; color: #6B7280; line-height: 1.75; max-width: 680px; margin-bottom: 40px; }
    .divider { border: none; border-top: 1px solid #E5E7EB; margin: 100px 0; }

    /* ── PAGE HEADER ── */
    .page-header {
      background: #0F172A;
      padding: 72px 40px 64px;
      margin-bottom: 72px;
      position: relative;
      overflow: hidden;
    }
    .page-header::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 80% 50%, rgba(5,150,105,0.15) 0%, transparent 60%);
      pointer-events: none;
    }
    .page-header-inner { max-width: 1100px; margin: 0 auto; padding: 0; position: relative; }
    .ph-overline {
      font-size: 0.68rem; font-weight: 800;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: #059669; margin-bottom: 20px;
      display: flex; align-items: center; gap: 10px;
    }
    .ph-overline::before { content: ''; display: block; width: 24px; height: 2px; background: #059669; border-radius: 2px; }
    .ph-logo {
      font-family: 'Caveat', cursive;
      font-size: 3.5rem; font-weight: 900;
      color: #fff; letter-spacing: -0.02em;
      line-height: 1; margin-bottom: 16px;
    }
    .ph-logo span { color: #059669; }
    .ph-tagline { font-size: 1.1rem; font-weight: 500; color: rgba(255,255,255,0.55); max-width: 520px; line-height: 1.65; }
    .ph-meta { margin-top: 36px; display: flex; gap: 32px; flex-wrap: wrap; }
    .ph-meta-item { }
    .ph-meta-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 4px; }
    .ph-meta-val { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.65); }

    /* ── TOC ── */
    .toc {
      background: #fff;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      padding: 32px 36px;
      margin-bottom: 80px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 32px;
    }
    .toc-item {
      font-size: 0.875rem; font-weight: 600;
      color: #374151;
      padding: 6px 0;
      border-bottom: 1px solid #F3F4F6;
      transition: color 0.2s;
      display: flex; align-items: center; gap: 8px;
    }
    .toc-item:hover { color: #059669; }
    .toc-item::before { content: attr(data-num); font-size: 0.68rem; font-weight: 800; color: #059669; min-width: 18px; }

    /* ── SWATCH GRIDS ── */
    .swatch-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 32px; }
    .swatch-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .swatch-grid-4 { grid-template-columns: repeat(4, 1fr); }
    .swatch-grid-6 { grid-template-columns: repeat(6, 1fr); }
    .swatch {
      border-radius: 12px;
      overflow: hidden;
      border: 1.5px solid rgba(0,0,0,0.07);
    }
    .swatch-color { height: 80px; }
    .swatch-info { background: #fff; padding: 12px 14px; }
    .swatch-name { font-size: 0.75rem; font-weight: 700; color: #111827; margin-bottom: 3px; }
    .swatch-hex { font-size: 0.72rem; font-weight: 500; color: #6B7280; font-family: 'Courier New', monospace; margin-bottom: 2px; }
    .swatch-token { font-size: 0.65rem; font-weight: 600; color: #9CA3AF; font-family: 'Courier New', monospace; }

    /* Dark swatch variant */
    .swatch-dark .swatch-info { background: #1F2937; }
    .swatch-dark .swatch-name { color: #fff; }
    .swatch-dark .swatch-hex { color: rgba(255,255,255,0.55); }
    .swatch-dark .swatch-token { color: rgba(255,255,255,0.35); }

    /* ── TYPOGRAPHY SPECIMENS ── */
    .type-specimen { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
    .type-specimen-preview { padding: 32px 36px; border-bottom: 1px solid #E5E7EB; }
    .type-specimen-meta { padding: 14px 36px; display: flex; gap: 32px; background: #F9FAFB; }
    .type-meta-item { }
    .type-meta-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 2px; }
    .type-meta-val { font-size: 0.78rem; font-weight: 600; color: #374151; font-family: 'Courier New', monospace; }

    /* ── BUTTON DEMOS ── */
    .btn-demo { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 36px; border-radius: 16px; margin-bottom: 16px; }
    .btn-demo-light { background: #fff; border: 1.5px solid #E5E7EB; }
    .btn-demo-dark  { background: #0F172A; }
    .btn-demo-emerald { background: #065F46; }
    .btn-demo-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #9CA3AF; width: 100%; margin-bottom: 4px; }
    .btn-demo-dark   .btn-demo-label { color: rgba(255,255,255,0.3); }
    .btn-demo-emerald .btn-demo-label { color: rgba(255,255,255,0.4); }

    /* Actual buttons (mirrored from site) */
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px; border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em;
      cursor: default; border: 2px solid transparent;
      white-space: nowrap; transition: all 0.25s;
    }
    .btn-gold    { background: #059669; color: #fff; border-color: #059669; }
    .btn-ghost   { background: transparent; color: #fff; border-color: rgba(255,255,255,0.5); }
    .btn-outline { background: transparent; color: #111827; border-color: #111827; }
    .btn-cta-inv { background: #fff; color: #065F46; border-color: #fff; }
    .btn-sm { padding: 10px 22px; font-size: 0.8rem; }

    /* ── LABEL DEMO ── */
    .label-demo { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; padding: 36px; margin-bottom: 16px; }
    .sg-label {
      display: inline-flex; align-items: center; gap: 12px;
      font-size: 0.72rem; font-weight: 800;
      letter-spacing: 0.17em; text-transform: uppercase;
      color: #059669; margin-bottom: 18px;
    }
    .sg-label::before { content: ''; display: block; width: 28px; height: 2px; background: #059669; border-radius: 2px; flex-shrink: 0; }
    .sg-label-center { display: flex; justify-content: center; }
    .sg-label-center::before { display: none; }
    .sg-label-dark { color: rgba(5,150,105,0.85); }
    .sg-label-dark::before { background: rgba(5,150,105,0.85); }

    /* ── CARD DEMOS ── */
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .card-grid-2 { grid-template-columns: repeat(2, 1fr); }

    .sg-card {
      background: #F9FAFB; border: 1.5px solid #E5E7EB;
      border-radius: 20px; padding: 24px 28px 32px;
    }
    .sg-card-white { background: #fff; }
    .sg-card-hover { border-color: #059669; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .sg-card-title { font-family: 'Caveat', cursive; font-size: 2.2rem; font-weight: 900; color: #111827; line-height: 1; margin-bottom: 8px; }
    .sg-card-sub { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #059669; margin-bottom: 12px; }
    .sg-card-rule { border: none; border-top: 1px solid #E5E7EB; margin: 16px 0; }
    .sg-card-body { font-size: 0.975rem; font-style: italic; color: #374151; line-height: 1.72; }
    .sg-card-quote { font-size: 0.975rem; font-weight: 600; font-style: italic; color: #059669; border-top: 1px solid #E5E7EB; padding-top: 14px; display: block; margin-top: 16px; }

    .sg-stat-card { background: #F0FDF4; border-left: 4px solid #059669; border-radius: 0 20px 20px 0; padding: 24px; }
    .sg-stat-num { font-family: 'Caveat', cursive; font-size: 2.8rem; font-weight: 900; color: #111827; line-height: 1; margin-bottom: 8px; }
    .sg-stat-text { font-size: 0.85rem; font-weight: 500; color: #6B7280; line-height: 1.55; }

    .sg-chal-card { display: flex; align-items: flex-start; gap: 16px; padding: 22px 24px; border: 1.5px solid #E5E7EB; border-radius: 20px; background: #fff; }
    .sg-chal-icon { width: 44px; height: 44px; background: #ECFDF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #059669; font-size: 1.1rem; }
    .sg-chal-title { font-weight: 700; font-size: 0.95rem; color: #111827; margin-bottom: 4px; }
    .sg-chal-body { font-size: 0.875rem; color: #6B7280; line-height: 1.6; }

    /* ── TAGS ── */
    .tags-demo { display: flex; flex-wrap: wrap; gap: 10px; padding: 28px; background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; margin-bottom: 16px; }
    .sg-tag {
      display: inline-block; padding: 6px 16px;
      background: #ECFDF5; border: 1px solid rgba(5,150,105,0.2);
      border-radius: 100px;
      font-size: 0.72rem; font-weight: 700; color: #059669;
    }
    .sg-badge {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 7px 16px; border-radius: 100px;
      font-size: 0.8rem; font-weight: 600;
      border: 1.5px solid;
    }
    .sg-badge-primary  { color: #065F46; border-color: rgba(6,95,70,0.3);   background: rgba(6,95,70,0.05); }
    .sg-badge-secondary { color: #1E40AF; border-color: rgba(30,64,175,0.3); background: rgba(30,64,175,0.05); }
    .sg-badge-tertiary  { color: #92400E; border-color: rgba(146,64,14,0.3); background: rgba(146,64,14,0.05); }

    /* ── ORIENTATION COLORS ── */
    .orient-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .orient-card {
      background: #0F172A; border-radius: 16px;
      padding: 28px; border: 1px solid rgba(255,255,255,0.08);
    }
    .orient-word { font-family: 'Caveat', cursive; font-size: 3rem; font-weight: 900; line-height: 1; margin-bottom: 6px; }
    .orient-name { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 14px; }
    .orient-desc { font-size: 0.875rem; color: rgba(255,255,255,0.5); line-height: 1.65; margin-bottom: 16px; }
    .orient-swatches { display: flex; gap: 8px; }
    .orient-swatch { width: 32px; height: 32px; border-radius: 8px; }
    .orient-color-info { margin-top: 6px; font-size: 0.65rem; color: rgba(255,255,255,0.3); font-family: 'Courier New', monospace; }

    .orient-why  .orient-word, .orient-why  .orient-name { color: #6EE7B7; }
    .orient-what .orient-word, .orient-what .orient-name { color: #93C5FD; }
    .orient-how  .orient-word, .orient-how  .orient-name { color: #FCD34D; }

    /* ── SECTION BG SAMPLES ── */
    .bg-sample-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
    .bg-sample {
      border-radius: 14px; overflow: hidden;
      border: 1.5px solid rgba(0,0,0,0.08);
    }
    .bg-sample-swatch { height: 80px; display: flex; align-items: center; justify-content: center; }
    .bg-sample-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; }
    .bg-sample-info { background: #fff; padding: 12px 16px; }
    .bg-sample-name { font-size: 0.78rem; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .bg-sample-hex { font-size: 0.68rem; color: #6B7280; font-family: 'Courier New', monospace; margin-bottom: 2px; }
    .bg-sample-use { font-size: 0.68rem; color: #9CA3AF; line-height: 1.5; }

    /* ── SPACING ── */
    .spacing-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 32px; }
    .spacing-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .spacing-bar { background: #059669; border-radius: 4px; width: 48px; opacity: 0.7; }
    .spacing-val { font-size: 0.68rem; font-weight: 700; color: #374151; font-family: 'Courier New', monospace; text-align: center; }
    .spacing-name { font-size: 0.62rem; color: #9CA3AF; text-align: center; }

    /* ── RADIUS ── */
    .radius-grid { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; }
    .radius-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .radius-box { width: 80px; height: 80px; background: #059669; opacity: 0.15; border: 2px solid #059669; }
    .radius-label { font-size: 0.72rem; font-weight: 700; color: #374151; text-align: center; }
    .radius-val { font-size: 0.65rem; color: #9CA3AF; font-family: 'Courier New', monospace; }

    /* ── SHADOW ── */
    .shadow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .shadow-item { background: #fff; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; border: 1px solid #F3F4F6; }
    .shadow-box { width: 80px; height: 80px; background: #fff; border-radius: 12px; }
    .shadow-name { font-size: 0.72rem; font-weight: 700; color: #374151; }
    .shadow-val { font-size: 0.65rem; color: #9CA3AF; font-family: 'Courier New', monospace; text-align: center; line-height: 1.5; }

    /* ── PROFILE BARS (types page) ── */
    .profile-bar-demo { background: #0F172A; border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
    .profile-bar {
      padding: 28px 32px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      display: grid; grid-template-columns: 180px 1fr; gap: 32px; align-items: center;
    }
    .pb-num { font-family: 'Caveat', cursive; font-size: 2rem; font-weight: 900; color: rgba(255,255,255,0.1); line-height: 1; }
    .pb-type { font-family: 'Caveat', cursive; font-size: 1.4rem; font-weight: 800; line-height: 1.2; margin-bottom: 2px; }
    .pb-italic { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
    .pb-summary { font-family: 'Caveat', cursive; font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.4; }
    .pb-why      { border-left: 4px solid rgba(52,211,153,0.8);  }
    .pb-why-alt  { border-left: 4px solid rgba(52,211,153,0.45); }
    .pb-what     { border-left: 4px solid rgba(96,165,250,0.8);  }
    .pb-what-alt { border-left: 4px solid rgba(96,165,250,0.45); }
    .pb-how      { border-left: 4px solid rgba(251,191,36,0.8);  }
    .pb-how-alt  { border-left: 4px solid rgba(251,191,36,0.45); }
    .pb-why      .pb-type { color: #6EE7B7; }
    .pb-why-alt  .pb-type { color: rgba(110,231,183,0.75); }
    .pb-what     .pb-type { color: #93C5FD; }
    .pb-what-alt .pb-type { color: rgba(147,197,253,0.75); }
    .pb-how      .pb-type { color: #FCD34D; }
    .pb-how-alt  .pb-type { color: rgba(252,211,77,0.75); }

    /* ── MOTION ── */
    .motion-demo { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; padding: 32px; margin-bottom: 16px; }
    .motion-row { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .motion-label { font-size: 0.72rem; font-weight: 700; color: #6B7280; min-width: 120px; }
    .motion-val { font-size: 0.85rem; font-weight: 500; color: #111827; font-family: 'Courier New', monospace; }

    /* ── CTA SECTION SPECIMEN ── */
    .cta-specimen {
      background: #065F46; border-radius: 20px;
      padding: 64px 48px; text-align: center;
      margin-bottom: 32px;
    }
    .cta-specimen .sg-label { color: rgba(255,255,255,0.6); justify-content: center; }
    .cta-specimen .sg-label::before { display: none; }
    .cta-specimen h2 { font-family: 'Caveat', cursive; font-size: 2.6rem; font-weight: 900; color: #fff; margin-bottom: 16px; line-height: 1.15; }
    .cta-specimen p { color: rgba(255,255,255,0.65); font-size: 1rem; font-weight: 500; max-width: 400px; margin: 0 auto 32px; line-height: 1.7; }
    .cta-specimen-btns { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; }

    /* ── CHEVRON ── */
    .chevron-demo { background: #0F172A; border-radius: 20px; padding: 40px 0; overflow: hidden; margin-bottom: 32px; }
    .chevrons { display: flex; align-items: stretch; }
    .chev {
      flex: 1; position: relative;
      padding: 32px 60px 32px 40px;
      clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 50%, calc(100% - 32px) 100%, 0 100%);
    }
    .chev-1 { background: rgba(255,255,255,0.048); z-index: 3; }
    .chev-2 { background: rgba(255,255,255,0.060); margin-left: -32px; padding-left: 68px; z-index: 2; }
    .chev-3 { background: rgba(255,255,255,0.072); margin-left: -32px; padding-left: 68px; z-index: 1; }
    .chev-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #059669; margin-bottom: 8px; }
    .chev-title { font-family: 'Caveat', cursive; font-size: 1.4rem; font-weight: 800; color: #fff; }

    /* ── FOOTER SPECIMEN ── */
    .footer-specimen { background: #111827; border-radius: 20px; padding: 48px; margin-bottom: 32px; }
    .footer-spec-top { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px; }
    .footer-spec-logo { font-family: 'Caveat', cursive; font-size: 1.6rem; font-weight: 900; color: #fff; margin-bottom: 10px; }
    .footer-spec-logo span { color: #059669; }
    .footer-spec-p { font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.75; }
    .footer-spec-col h5 { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #059669; margin-bottom: 16px; }
    .footer-spec-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-spec-col a { font-size: 0.85rem; color: rgba(255,255,255,0.45); }
    .footer-spec-bottom { display: flex; justify-content: space-between; }
    .footer-spec-bottom p { font-size: 0.75rem; color: rgba(255,255,255,0.25); }

    /* ── UTILITY ── */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .note { font-size: 0.8rem; color: #6B7280; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 14px; margin-top: 12px; line-height: 1.6; }
    .note strong { color: #374151; }
    .spec-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #fff; border-radius: 12px; overflow: hidden; border: 1.5px solid #E5E7EB; }
    .spec-table th { background: #F9FAFB; text-align: left; padding: 12px 16px; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; border-bottom: 1px solid #E5E7EB; }
    .spec-table td { padding: 12px 16px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
    .spec-table tr:last-child td { border-bottom: none; }
    .spec-table td:first-child { font-weight: 600; color: #111827; }
    .spec-table code { font-family: 'Courier New', monospace; font-size: 0.8rem; background: #F3F4F6; padding: 2px 6px; border-radius: 4px; color: #374151; }

    @media print {
      body { background: #fff; }
      .page-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .divider { margin: 60px 0; }
    }
`;

const BODY_HTML = `
<!-- PAGE HEADER -->
<div class="page-header">
  <div class="page-header-inner">
    <div class="ph-overline">Design System</div>
    <div class="ph-logo">Curio<span>.</span></div>
    <p class="ph-tagline">A reference document covering colors, typography, components, spacing, and design patterns used across the Curio website and brand materials.</p>
    <div class="ph-meta">
      <div class="ph-meta-item">
        <div class="ph-meta-label">Version</div>
        <div class="ph-meta-val">1.0 — May 2026</div>
      </div>
      <div class="ph-meta-item">
        <div class="ph-meta-label">Primary Accent</div>
        <div class="ph-meta-val">#059669 Emerald</div>
      </div>
      <div class="ph-meta-item">
        <div class="ph-meta-label">Display Font</div>
        <div class="ph-meta-val">Caveat (Google Fonts)</div>
      </div>
      <div class="ph-meta-item">
        <div class="ph-meta-label">Body Font</div>
        <div class="ph-meta-val">DM Sans (Google Fonts)</div>
      </div>
    </div>
  </div>
</div>

<div class="page">

  <!-- TOC -->
  <nav class="toc">
    <a href="#brand" class="toc-item" data-num="01">Brand Mark</a>
    <a href="#color" class="toc-item" data-num="02">Color Palette</a>
    <a href="#dark-bg" class="toc-item" data-num="03">Dark Backgrounds</a>
    <a href="#orientation-colors" class="toc-item" data-num="04">Orientation Colors</a>
    <a href="#typography" class="toc-item" data-num="05">Typography</a>
    <a href="#labels" class="toc-item" data-num="06">Labels & Eyebrows</a>
    <a href="#buttons" class="toc-item" data-num="07">Buttons</a>
    <a href="#cards" class="toc-item" data-num="08">Cards</a>
    <a href="#tags" class="toc-item" data-num="09">Tags & Badges</a>
    <a href="#spacing" class="toc-item" data-num="10">Spacing & Layout</a>
    <a href="#radius" class="toc-item" data-num="11">Radius & Shadows</a>
    <a href="#patterns" class="toc-item" data-num="12">Section Patterns</a>
    <a href="#profiles" class="toc-item" data-num="13">Profile Bars</a>
    <a href="#motion" class="toc-item" data-num="14">Motion & Animation</a>
    <a href="#voice" class="toc-item" data-num="15">Voice & Copy Rules</a>
  </nav>


  <!-- ══ 01 BRAND ══ -->
  <div class="section" id="brand">
    <div class="section-title">01</div>
    <div class="section-heading">Brand Mark</div>
    <p class="section-desc">The Curio logotype is set in Caveat at weight 900. The period is always rendered in the primary accent color and is considered part of the mark — never omit it.</p>

    <div class="two-col" style="margin-bottom:16px;">
      <div style="background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;padding:48px;display:flex;align-items:center;justify-content:center;">
        <span style="font-family:'Caveat',cursive;font-size:4rem;font-weight:900;color:#111827;letter-spacing:-0.02em;">Curio<span style="color:#059669;">.</span></span>
      </div>
      <div style="background:#0F172A;border-radius:16px;padding:48px;display:flex;align-items:center;justify-content:center;">
        <span style="font-family:'Caveat',cursive;font-size:4rem;font-weight:900;color:#fff;letter-spacing:-0.02em;">Curio<span style="color:#059669;">.</span></span>
      </div>
    </div>

    <table class="spec-table">
      <thead><tr><th>Property</th><th>Value</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Font</td><td><code>Caveat</code></td><td>Weight 900 only</td></tr>
        <tr><td>Letter spacing</td><td><code>-0.02em</code></td><td>Tight tracking</td></tr>
        <tr><td>Color (light bg)</td><td><code>#111827</code></td><td>Ink — near black</td></tr>
        <tr><td>Color (dark bg)</td><td><code>#FFFFFF</code></td><td>Pure white</td></tr>
        <tr><td>Period color</td><td><code>#059669</code></td><td>Always accent, never matches wordmark</td></tr>
        <tr><td>Nav size</td><td><code>1.6rem</code></td><td>Scales up to 2.0rem at display size</td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 02 COLOR PALETTE ══ -->
  <div class="section" id="color">
    <div class="section-title">02</div>
    <div class="section-heading">Color Palette</div>
    <p class="section-desc">The palette is built around a single chromatic accent — emerald green — used on light backgrounds. All other light-background content uses neutral grays. Color appears in full saturation only on interactive elements, labels, and accent rules.</p>

    <div style="margin-bottom:8px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Accent</div>
    <div class="swatch-grid swatch-grid-4" style="margin-bottom:32px;">
      <div class="swatch">
        <div class="swatch-color" style="background:#059669;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Gold (Emerald)</div>
          <div class="swatch-hex">#059669</div>
          <div class="swatch-token">--gold</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#34D399;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Gold Light</div>
          <div class="swatch-hex">#34D399</div>
          <div class="swatch-token">--gold-light</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#ECFDF5;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Gold Pale</div>
          <div class="swatch-hex">#ECFDF5</div>
          <div class="swatch-token">--gold-pale</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#F0FDF4;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Cream</div>
          <div class="swatch-hex">#F0FDF4</div>
          <div class="swatch-token">--cream</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom:8px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Neutrals — Text</div>
    <div class="swatch-grid swatch-grid-4" style="margin-bottom:32px;">
      <div class="swatch">
        <div class="swatch-color" style="background:#111827;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Ink</div>
          <div class="swatch-hex">#111827</div>
          <div class="swatch-token">--ink / --text</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#374151;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Ink Soft</div>
          <div class="swatch-hex">#374151</div>
          <div class="swatch-token">--ink-soft</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#6B7280;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Text Muted</div>
          <div class="swatch-hex">#6B7280</div>
          <div class="swatch-token">--text-muted</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#9CA3AF;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Ink Muted</div>
          <div class="swatch-hex">#9CA3AF</div>
          <div class="swatch-token">--ink-muted</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom:8px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Neutrals — Surfaces & Borders</div>
    <div class="swatch-grid swatch-grid-4">
      <div class="swatch">
        <div class="swatch-color" style="background:#FFFFFF;border-bottom:1px solid #E5E7EB;"></div>
        <div class="swatch-info">
          <div class="swatch-name">White / Paper</div>
          <div class="swatch-hex">#FFFFFF</div>
          <div class="swatch-token">--paper / --white</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#F9FAFB;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Paper Warm</div>
          <div class="swatch-hex">#F9FAFB</div>
          <div class="swatch-token">--paper-warm</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#E5E7EB;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Rule / Border</div>
          <div class="swatch-hex">#E5E7EB</div>
          <div class="swatch-token">--rule / --border</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#F3F4F6;"></div>
        <div class="swatch-info">
          <div class="swatch-name">Subtle Surface</div>
          <div class="swatch-hex">#F3F4F6</div>
          <div class="swatch-token">—</div>
        </div>
      </div>
    </div>
  </div>

  <hr class="divider" />


  <!-- ══ 03 DARK BACKGROUNDS ══ -->
  <div class="section" id="dark-bg">
    <div class="section-title">03</div>
    <div class="section-heading">Dark Backgrounds</div>
    <p class="section-desc">Four distinct dark backgrounds appear in the system, each with a specific role. They are never interchangeable. Light text on dark always pairs with the emerald accent at reduced opacity.</p>

    <div class="bg-sample-grid" style="margin-bottom:24px;">
      <div class="bg-sample">
        <div class="bg-sample-swatch" style="background:#0F172A;">
          <span class="bg-sample-label" style="color:rgba(255,255,255,0.4);font-family:'DM Sans';font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Dark Navy</span>
        </div>
        <div class="bg-sample-info">
          <div class="bg-sample-name">Midnight Navy</div>
          <div class="bg-sample-hex">#0F172A</div>
          <div class="bg-sample-use">Why Curio, Approach, Framework hero, Profiles page</div>
        </div>
      </div>
      <div class="bg-sample">
        <div class="bg-sample-swatch" style="background:#065F46;">
          <span class="bg-sample-label" style="color:rgba(255,255,255,0.5);font-family:'DM Sans';font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Deep Emerald</span>
        </div>
        <div class="bg-sample-info">
          <div class="bg-sample-name">Deep Emerald</div>
          <div class="bg-sample-hex">#065F46</div>
          <div class="bg-sample-use">CTA section only</div>
        </div>
      </div>
      <div class="bg-sample">
        <div class="bg-sample-swatch" style="background:#111827;">
          <span class="bg-sample-label" style="color:rgba(255,255,255,0.3);font-family:'DM Sans';font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Near Black</span>
        </div>
        <div class="bg-sample-info">
          <div class="bg-sample-name">Near Black</div>
          <div class="bg-sample-hex">#111827</div>
          <div class="bg-sample-use">Footer only</div>
        </div>
      </div>
    </div>

    <table class="spec-table">
      <thead><tr><th>Background</th><th>Body text</th><th>Heading text</th><th>Muted text</th><th>Accent</th></tr></thead>
      <tbody>
        <tr><td>#0F172A Navy</td><td><code>#fff</code></td><td><code>#fff</code></td><td><code>rgba(255,255,255,0.62)</code></td><td><code>#059669</code></td></tr>
        <tr><td>#065F46 Emerald</td><td><code>rgba(255,255,255,0.7)</code></td><td><code>#fff</code></td><td><code>rgba(255,255,255,0.65)</code></td><td><code>#fff</code> (inverted)</td></tr>
        <tr><td>#111827 Footer</td><td><code>rgba(255,255,255,0.45)</code></td><td><code>#fff</code></td><td><code>rgba(255,255,255,0.3)</code></td><td><code>#059669</code></td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 04 ORIENTATION COLORS ══ -->
  <div class="section" id="orientation-colors">
    <div class="section-title">04</div>
    <div class="section-heading">Orientation & Energy Colors</div>
    <p class="section-desc">Each cognitive orientation has a dedicated color used exclusively on dark backgrounds. These colors never appear on white or light surfaces. Two sets exist: Orientation colors (WHY/WHAT/HOW on the Profiles page) and Energy colors (Primary/Secondary/Tertiary on the Framework page).</p>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Orientation Colors — dark backgrounds only</div>
    <div class="orient-grid" style="margin-bottom:32px;">
      <div class="orient-card">
        <div class="orient-word orient-why">WHY</div>
        <div class="orient-name orient-why">Purpose-Driven</div>
        <div class="orient-desc">Vision, purpose, strategic direction. The orientation that asks "are we solving the right problem?"</div>
        <div class="orient-swatches">
          <div class="orient-swatch" style="background:#6EE7B7;" title="Strong"></div>
          <div class="orient-swatch" style="background:rgba(110,231,183,0.75);" title="Muted (secondary)"></div>
        </div>
        <div class="orient-color-info">Strong: #6EE7B7 · Muted: 75% opacity</div>
      </div>
      <div class="orient-card">
        <div class="orient-word orient-what">WHAT</div>
        <div class="orient-name orient-what">Progress-Driven</div>
        <div class="orient-desc">Execution, momentum, milestones. The orientation that asks "what are the next steps?"</div>
        <div class="orient-swatches">
          <div class="orient-swatch" style="background:#93C5FD;" title="Strong"></div>
          <div class="orient-swatch" style="background:rgba(147,197,253,0.75);" title="Muted (secondary)"></div>
        </div>
        <div class="orient-color-info">Strong: #93C5FD · Muted: 75% opacity</div>
      </div>
      <div class="orient-card">
        <div class="orient-word orient-how">HOW</div>
        <div class="orient-name orient-how">Precision-Driven</div>
        <div class="orient-desc">Process, detail, correctness. The orientation that asks "have we accounted for everything?"</div>
        <div class="orient-swatches">
          <div class="orient-swatch" style="background:#FCD34D;" title="Strong"></div>
          <div class="orient-swatch" style="background:rgba(252,211,77,0.75);" title="Muted (secondary)"></div>
        </div>
        <div class="orient-color-info">Strong: #FCD34D · Muted: 75% opacity</div>
      </div>
    </div>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Energy Model Colors — light backgrounds, Framework page</div>
    <div class="three-col">
      <div style="background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;padding:24px;">
        <div style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#065F46;margin-bottom:6px;">Primary</div>
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9CA3AF;margin-bottom:12px;">Energizing</div>
        <div style="display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:100px;border:1.5px solid rgba(6,95,70,0.3);background:rgba(6,95,70,0.05);color:#065F46;font-size:0.8rem;font-weight:600;margin-bottom:12px;">⚡ Energizing</div>
        <div style="font-size:0.78rem;color:#6B7280;">Text: <code style="font-family:monospace;background:#F3F4F6;padding:2px 6px;border-radius:4px;">#065F46</code></div>
      </div>
      <div style="background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;padding:24px;">
        <div style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#1E40AF;margin-bottom:6px;">Secondary</div>
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9CA3AF;margin-bottom:12px;">Neutral</div>
        <div style="display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:100px;border:1.5px solid rgba(30,64,175,0.3);background:rgba(30,64,175,0.05);color:#1E40AF;font-size:0.8rem;font-weight:600;margin-bottom:12px;">— Neutral</div>
        <div style="font-size:0.78rem;color:#6B7280;">Text: <code style="font-family:monospace;background:#F3F4F6;padding:2px 6px;border-radius:4px;">#1E40AF</code></div>
      </div>
      <div style="background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;padding:24px;">
        <div style="font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#92400E;margin-bottom:6px;">Tertiary</div>
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9CA3AF;margin-bottom:12px;">Draining</div>
        <div style="display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:100px;border:1.5px solid rgba(146,64,14,0.3);background:rgba(146,64,14,0.05);color:#92400E;font-size:0.8rem;font-weight:600;margin-bottom:12px;">← Draining</div>
        <div style="font-size:0.78rem;color:#6B7280;">Text: <code style="font-family:monospace;background:#F3F4F6;padding:2px 6px;border-radius:4px;">#92400E</code></div>
      </div>
    </div>
  </div>

  <hr class="divider" />


  <!-- ══ 05 TYPOGRAPHY ══ -->
  <div class="section" id="typography">
    <div class="section-title">05</div>
    <div class="section-heading">Typography</div>
    <p class="section-desc">Two fonts, strict roles. Caveat carries personality and scale — it's the display voice. DM Sans carries information — it's the clarity voice. They never trade roles.</p>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <span style="font-family:'Caveat',cursive;font-size:clamp(2.6rem,5.5vw,5rem);font-weight:800;color:#111827;line-height:1.15;">Heading One</span>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">Caveat</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">clamp(2.6rem, 5.5vw, 5rem)</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">800</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Line height</div><div class="type-meta-val">1.15</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Use</div><div class="type-meta-val">Page hero titles</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <span style="font-family:'Caveat',cursive;font-size:clamp(2rem,3.5vw,3.25rem);font-weight:800;color:#111827;line-height:1.15;">Heading Two — Section Title</span>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">Caveat</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">clamp(2rem, 3.5vw, 3.25rem)</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">800–900</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Line height</div><div class="type-meta-val">1.15</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Use</div><div class="type-meta-val">All section headings</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <span style="font-family:'Caveat',cursive;font-size:clamp(1.2rem,2vw,1.55rem);font-weight:800;color:#111827;">Heading Three — Card or Sub-section Title</span>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">Caveat</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">clamp(1.2rem, 2vw, 1.55rem)</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">800</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Use</div><div class="type-meta-val">Card titles, sub-sections</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <span style="font-family:'Caveat',cursive;font-size:clamp(3.4rem,5.5vw,5.5rem);font-weight:900;color:#111827;letter-spacing:-0.02em;line-height:1.1;">Curio</span>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">Caveat</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">clamp(3.4rem, 5.5vw, 5.5rem)</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">900</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Tracking</div><div class="type-meta-val">-0.02em</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Use</div><div class="type-meta-val">Hero display / Logotype</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <p style="font-size:1.15rem;font-weight:600;color:#111827;line-height:1.72;max-width:700px;">Lead body copy — used as the opening statement in a section. It's heavier than supporting text and sets the premise before detail follows. Typically one sentence or short paragraph.</p>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">DM Sans</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">clamp(1.1rem, 1.4vw, 1.22rem)</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">600</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Line height</div><div class="type-meta-val">1.72</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Use</div><div class="type-meta-val">Section lead paragraphs</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <p style="font-size:1.0125rem;font-weight:500;color:#374151;line-height:1.82;max-width:700px;">Supporting body copy — the primary narrative voice. This text carries the substance of the idea. It runs long, breathes wide (1.82 line height), and stays at medium weight to avoid competing with headings. It assumes the reader is engaged and doesn't shy away from nuance.</p>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">DM Sans</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">1.0125rem</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">500</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Line height</div><div class="type-meta-val">1.82</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Color</div><div class="type-meta-val">#374151 (ink-soft)</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;">
        <p style="font-size:0.875rem;font-weight:500;color:#6B7280;line-height:1.75;">Small / metadata text — used for captions, footer links, supporting detail, and secondary labels. Never below 0.78rem in the UI.</p>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">DM Sans</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">0.875rem</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">500</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Color</div><div class="type-meta-val">#6B7280 (text-muted)</div></div>
      </div>
    </div>

    <div class="type-specimen">
      <div class="type-specimen-preview" style="background:#fff;font-style:italic;">
        <p style="font-size:1.05rem;font-style:italic;color:#374151;line-height:1.72;">Italic body copy — used inside lens / orientation cards to give a character-voice feel. Always DM Sans italic, never a separate serif.</p>
      </div>
      <div class="type-specimen-meta">
        <div class="type-meta-item"><div class="type-meta-label">Font</div><div class="type-meta-val">DM Sans italic</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Size</div><div class="type-meta-val">1.05rem</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Weight</div><div class="type-meta-val">400</div></div>
        <div class="type-meta-item"><div class="type-meta-label">Use</div><div class="type-meta-val">Orientation card body text</div></div>
      </div>
    </div>
  </div>

  <hr class="divider" />


  <!-- ══ 06 LABELS ══ -->
  <div class="section" id="labels">
    <div class="section-title">06</div>
    <div class="section-heading">Labels & Eyebrows</div>
    <p class="section-desc">Every content section opens with a label — a small uppercase identifier that tells the reader what category of content follows. The label always precedes the section heading. It comes in two variants: left-aligned (with a rule prefix) and centered (rule hidden).</p>

    <div class="label-demo" style="margin-bottom:16px;">
      <div style="margin-bottom:24px;">
        <div class="sg-label">The MindPrint™ Framework</div>
        <div style="font-size:0.72rem;color:#9CA3AF;margin-top:4px;">Left-aligned with rule prefix — standard use on section headers</div>
      </div>
      <div style="margin-bottom:24px;">
        <div style="display:flex;justify-content:center;margin-bottom:4px;">
          <div class="sg-label" style="display:flex;justify-content:center;">Get Started</div>
        </div>
        <div style="font-size:0.72rem;color:#9CA3AF;text-align:center;">Centered (no rule) — used above CTA sections</div>
      </div>
    </div>

    <div style="background:#0F172A;border-radius:16px;padding:36px;margin-bottom:16px;">
      <div style="margin-bottom:24px;">
        <div class="sg-label sg-label-dark">The Six Profiles</div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.3);margin-top:4px;">Dark background — same structure, slightly desaturated to 85% opacity</div>
      </div>
    </div>

    <table class="spec-table">
      <thead><tr><th>Property</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Font</td><td>DM Sans</td></tr>
        <tr><td>Size</td><td>0.72rem</td></tr>
        <tr><td>Weight</td><td>800</td></tr>
        <tr><td>Letter spacing</td><td>0.17em</td></tr>
        <tr><td>Transform</td><td>uppercase</td></tr>
        <tr><td>Color</td><td>#059669 (light bg) · rgba(5,150,105,0.85) (dark bg)</td></tr>
        <tr><td>Rule</td><td>28px × 2px, same color, 12px gap before text</td></tr>
        <tr><td>Margin below</td><td>18px before heading</td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 07 BUTTONS ══ -->
  <div class="section" id="buttons">
    <div class="section-title">07</div>
    <div class="section-heading">Buttons</div>
    <p class="section-desc">Three button variants in the system. All share the same pill shape and base sizing. Copy is always sentence case — never all-caps. Typical CTAs: "Take MindPrint™ Quiz", "Explore MindPrint™ Framework", "Schedule a conversation".</p>

    <div class="btn-demo btn-demo-light" style="margin-bottom:12px;">
      <span class="btn-demo-label">On white / light backgrounds</span>
      <a class="btn btn-gold">Take MindPrint™ Quiz</a>
      <a class="btn btn-outline">Schedule a conversation</a>
    </div>

    <div class="btn-demo btn-demo-dark" style="margin-bottom:12px;">
      <span class="btn-demo-label">On dark navy (#0F172A)</span>
      <a class="btn btn-gold">Take MindPrint™ Quiz</a>
      <a class="btn btn-ghost">Schedule a conversation</a>
    </div>

    <div class="btn-demo btn-demo-emerald" style="margin-bottom:24px;">
      <span class="btn-demo-label">On emerald CTA section (#065F46)</span>
      <a class="btn btn-cta-inv">Take MindPrint™ Quiz</a>
      <a class="btn btn-ghost">Schedule a conversation</a>
    </div>

    <table class="spec-table">
      <thead><tr><th>Property</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Border radius</td><td>50px (pill)</td></tr>
        <tr><td>Padding</td><td>14px 32px</td></tr>
        <tr><td>Font size</td><td>0.9rem</td></tr>
        <tr><td>Font weight</td><td>700</td></tr>
        <tr><td>Letter spacing</td><td>0.02em</td></tr>
        <tr><td>Border width</td><td>2px solid</td></tr>
        <tr><td>Transition</td><td>all 0.25s cubic-bezier(0.4,0,0.2,1)</td></tr>
        <tr><td>Primary hover</td><td>bg → #047857 · translateY(−2px) · box-shadow 0 8px 28px rgba(5,150,105,0.35)</td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 08 CARDS ══ -->
  <div class="section" id="cards">
    <div class="section-title">08</div>
    <div class="section-heading">Cards</div>
    <p class="section-desc">Four card types in the system, each serving a specific content pattern. All share 20px border radius. Hover states lift and green-border the card.</p>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Orientation / Lens Card (Framework page)</div>
    <div class="card-grid" style="margin-bottom:32px;">
      <div class="sg-card">
        <div class="sg-card-title">HOW</div>
        <div class="sg-card-sub">Precision-Driven</div>
        <hr class="sg-card-rule" />
        <p class="sg-card-body">HOWs are oriented toward detail before execution. They need to know how all the parts fit together before they're comfortable moving.</p>
        <span class="sg-card-quote">"Have we accounted for everything?"</span>
      </div>
      <div class="sg-card sg-card-white sg-card-hover">
        <div class="sg-card-title">WHAT</div>
        <div class="sg-card-sub">Progress-Driven</div>
        <hr class="sg-card-rule" />
        <p class="sg-card-body">WHATs are oriented toward momentum before perfection. Clarity emerges through action, not before it.</p>
        <span class="sg-card-quote">"What are the next steps?"</span>
      </div>
      <div class="sg-card">
        <div class="sg-card-title">WHY</div>
        <div class="sg-card-sub">Purpose-Driven</div>
        <hr class="sg-card-rule" />
        <p class="sg-card-body">WHYs are oriented toward meaning before movement. They cannot comfortably begin work until they understand the purpose.</p>
        <span class="sg-card-quote">"Are we solving the right problem?"</span>
      </div>
    </div>
    <p class="note"><strong>Default state:</strong> background #F9FAFB, border 1.5px #E5E7EB. <strong>Hover state:</strong> background #FFFFFF, border #059669, translateY(−4px), box-shadow 0 4px 24px rgba(0,0,0,0.06).</p>

    <div style="margin-top:32px;margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Stat Card (Challenge section)</div>
    <div class="card-grid-2 two-col" style="margin-bottom:32px;">
      <div class="sg-stat-card">
        <div class="sg-stat-num">73%</div>
        <div class="sg-stat-text">of employees are not engaged or actively disengaged at work</div>
      </div>
      <div class="sg-stat-card">
        <div class="sg-stat-num">2.4×</div>
        <div class="sg-stat-text">higher revenue growth for companies with high team alignment</div>
      </div>
    </div>
    <p class="note"><strong>Stat card:</strong> background #F0FDF4, left-border 4px #059669, border-radius 0 20px 20px 0. No hover state.</p>

    <div style="margin-top:32px;margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Feature / Challenge Card</div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;">
      <div class="sg-chal-card">
        <div class="sg-chal-icon">◆</div>
        <div>
          <div class="sg-chal-title">Misaligned cognitive demands</div>
          <div class="sg-chal-body">Work that constantly requires your tertiary orientation drains energy faster than any other source of friction.</div>
        </div>
      </div>
      <div class="sg-chal-card" style="border-color:#059669;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <div class="sg-chal-icon">◆</div>
        <div>
          <div class="sg-chal-title">Hidden friction in teams</div>
          <div class="sg-chal-body">Two people with different cognitive profiles can interpret the same meeting, document, or decision differently.</div>
        </div>
      </div>
    </div>
    <p class="note">Second card shows hover state: border-color #059669, box-shadow applied.</p>
  </div>

  <hr class="divider" />


  <!-- ══ 09 TAGS & BADGES ══ -->
  <div class="section" id="tags">
    <div class="section-title">09</div>
    <div class="section-heading">Tags & Badges</div>
    <p class="section-desc">Tags are used for content classification. Badges are status indicators tied to the energy model (Primary / Secondary / Tertiary). Both are pill-shaped.</p>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Tags</div>
    <div class="tags-demo" style="margin-bottom:24px;">
      <span class="sg-tag">Leadership</span>
      <span class="sg-tag">Team Design</span>
      <span class="sg-tag">Hiring</span>
      <span class="sg-tag">Innovation</span>
      <span class="sg-tag">Culture</span>
      <span class="sg-tag">Coaching</span>
    </div>
    <p class="note" style="margin-bottom:24px;"><strong>Tag:</strong> background #ECFDF5 · border 1px rgba(5,150,105,0.2) · border-radius 100px · font 0.72rem/700/uppercase · color #059669</p>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Energy Badges (Framework page)</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;padding:28px;background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;">
      <span class="sg-badge sg-badge-primary">⚡ Energizing</span>
      <span class="sg-badge sg-badge-secondary">— Neutral</span>
      <span class="sg-badge sg-badge-tertiary">← Draining</span>
    </div>

    <table class="spec-table" style="margin-top:16px;">
      <thead><tr><th>Badge</th><th>Text color</th><th>Border</th><th>Background</th></tr></thead>
      <tbody>
        <tr><td>Primary (Energizing)</td><td><code>#065F46</code></td><td><code>rgba(6,95,70,0.3)</code></td><td><code>rgba(6,95,70,0.05)</code></td></tr>
        <tr><td>Secondary (Neutral)</td><td><code>#1E40AF</code></td><td><code>rgba(30,64,175,0.3)</code></td><td><code>rgba(30,64,175,0.05)</code></td></tr>
        <tr><td>Tertiary (Draining)</td><td><code>#92400E</code></td><td><code>rgba(146,64,14,0.3)</code></td><td><code>rgba(146,64,14,0.05)</code></td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 10 SPACING ══ -->
  <div class="section" id="spacing">
    <div class="section-title">10</div>
    <div class="section-heading">Spacing & Layout</div>
    <p class="section-desc">Spacing follows a deliberate rhythm. Sections breathe at 110px. Content areas cap at 1260px. Horizontal padding is fluid, not fixed — it scales with the viewport.</p>

    <div class="spacing-row" style="margin-bottom:32px;">
      <div class="spacing-item"><div class="spacing-bar" style="height:8px;"></div><div class="spacing-val">8px</div><div class="spacing-name">xs</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:12px;"></div><div class="spacing-val">12px</div><div class="spacing-name">sm</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:16px;"></div><div class="spacing-val">16px</div><div class="spacing-name">md</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:20px;"></div><div class="spacing-val">20px</div><div class="spacing-name">lg</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:24px;"></div><div class="spacing-val">24px</div><div class="spacing-name">xl</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:32px;"></div><div class="spacing-val">32px</div><div class="spacing-name">2xl</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:40px;"></div><div class="spacing-val">40px</div><div class="spacing-name">3xl</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:48px;"></div><div class="spacing-val">48px</div><div class="spacing-name">4xl</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:56px;"></div><div class="spacing-val">56px</div><div class="spacing-name">5xl</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:72px;"></div><div class="spacing-val">72px</div><div class="spacing-name">6xl</div></div>
      <div class="spacing-item"><div class="spacing-bar" style="height:110px;"></div><div class="spacing-val">110px</div><div class="spacing-name">section</div></div>
    </div>

    <table class="spec-table">
      <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
      <tbody>
        <tr><td><code>--max-w</code></td><td>1260px</td><td>Maximum content container width</td></tr>
        <tr><td><code>--pad-x</code></td><td>clamp(24px, 5vw, 72px)</td><td>Horizontal page padding — fluid</td></tr>
        <tr><td><code>--section-y</code></td><td>110px</td><td>Standard section top and bottom padding</td></tr>
        <tr><td><code>--nav-h</code></td><td>76px</td><td>Fixed nav bar height</td></tr>
        <tr><td>Card gap</td><td>16px</td><td>Gap between cards in a grid</td></tr>
        <tr><td>Section gap (2-col)</td><td>48–80px</td><td>Gap between left/right content columns</td></tr>
        <tr><td>Card padding</td><td>24px 28px 32px</td><td>Internal lens card padding</td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 11 RADIUS & SHADOWS ══ -->
  <div class="section" id="radius">
    <div class="section-title">11</div>
    <div class="section-heading">Radius & Shadows</div>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Border Radius</div>
    <div class="radius-grid" style="margin-bottom:32px;">
      <div class="radius-item">
        <div class="radius-box" style="border-radius:4px;"></div>
        <div class="radius-label">Micro</div>
        <div class="radius-val">4px</div>
      </div>
      <div class="radius-item">
        <div class="radius-box" style="border-radius:8px;"></div>
        <div class="radius-label">Small</div>
        <div class="radius-val">8px</div>
      </div>
      <div class="radius-item">
        <div class="radius-box" style="border-radius:12px;"></div>
        <div class="radius-label">Medium</div>
        <div class="radius-val">12px</div>
      </div>
      <div class="radius-item">
        <div class="radius-box" style="border-radius:20px;"></div>
        <div class="radius-label">Card / Large</div>
        <div class="radius-val">20px — <code>--radius-card</code></div>
      </div>
      <div class="radius-item">
        <div class="radius-box" style="border-radius:50px;"></div>
        <div class="radius-label">Button / Pill</div>
        <div class="radius-val">50px — <code>--radius</code></div>
      </div>
      <div class="radius-item">
        <div class="radius-box" style="border-radius:50%;"></div>
        <div class="radius-label">Circle / Icon</div>
        <div class="radius-val">50%</div>
      </div>
    </div>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Shadows</div>
    <div class="shadow-grid">
      <div class="shadow-item">
        <div class="shadow-box" style="box-shadow:none;border:1px solid #E5E7EB;"></div>
        <div class="shadow-name">None / Flat</div>
        <div class="shadow-val">border only — default card state</div>
      </div>
      <div class="shadow-item">
        <div class="shadow-box" style="box-shadow:0 4px 24px rgba(0,0,0,0.06);"></div>
        <div class="shadow-name">Shadow</div>
        <div class="shadow-val">0 4px 24px rgba(0,0,0,0.06)<br><code>--shadow</code></div>
      </div>
      <div class="shadow-item">
        <div class="shadow-box" style="box-shadow:0 16px 56px rgba(0,0,0,0.10);"></div>
        <div class="shadow-name">Shadow LG</div>
        <div class="shadow-val">0 16px 56px rgba(0,0,0,0.10)<br><code>--shadow-lg</code></div>
      </div>
    </div>
  </div>

  <hr class="divider" />


  <!-- ══ 12 SECTION PATTERNS ══ -->
  <div class="section" id="patterns">
    <div class="section-title">12</div>
    <div class="section-heading">Section Patterns</div>
    <p class="section-desc">The site alternates between light and dark sections to create visual rhythm. The sequence is intentional — dark sections signal a shift in register, from informational to conceptual or from detail to invitation.</p>

    <div style="margin-bottom:24px;">
      <div style="display:flex;flex-direction:column;gap:4px;border-radius:16px;overflow:hidden;border:1.5px solid #E5E7EB;">
        <div style="background:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.875rem;font-weight:600;color:#374151;">Hero</span><span style="font-size:0.75rem;color:#9CA3AF;">#FFFFFF · White</span></div>
        <div style="background:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #F3F4F6;"><span style="font-size:0.875rem;font-weight:600;color:#374151;">Framework — Three Orientations</span><span style="font-size:0.75rem;color:#9CA3AF;">#FFFFFF · White</span></div>
        <div style="background:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #F3F4F6;"><span style="font-size:0.875rem;font-weight:600;color:#374151;">Framework — Energy Model</span><span style="font-size:0.75rem;color:#9CA3AF;">#FFFFFF · White</span></div>
        <div style="background:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #F3F4F6;"><span style="font-size:0.875rem;font-weight:600;color:#374151;">MindPrint™ Intro</span><span style="font-size:0.75rem;color:#9CA3AF;">#FFFFFF · White</span></div>
        <div style="background:#F0FDF4;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #E5E7EB;"><span style="font-size:0.875rem;font-weight:600;color:#374151;">Applications</span><span style="font-size:0.75rem;color:#6B7280;">#F0FDF4 · Light Cream</span></div>
        <div style="background:#0F172A;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.875rem;font-weight:600;color:#fff;">Why Curio</span><span style="font-size:0.75rem;color:rgba(255,255,255,0.4);">#0F172A · Navy</span></div>
        <div style="background:#0F172A;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.06);"><span style="font-size:0.875rem;font-weight:600;color:#fff;">How We Work (Approach)</span><span style="font-size:0.75rem;color:rgba(255,255,255,0.4);">#0F172A · Navy</span></div>
        <div style="background:#065F46;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.875rem;font-weight:600;color:#fff;">CTA</span><span style="font-size:0.75rem;color:rgba(255,255,255,0.5);">#065F46 · Deep Emerald</span></div>
        <div style="background:#111827;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.875rem;font-weight:600;color:#fff;">Footer</span><span style="font-size:0.75rem;color:rgba(255,255,255,0.35);">#111827 · Near Black</span></div>
      </div>
    </div>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">CTA Section Specimen</div>
    <div class="cta-specimen">
      <div class="sg-label">Get Started</div>
      <h2>Discover your profile.</h2>
      <p>Take the assessment and discover your team's cognitive composition — and what to build around it.</p>
      <div class="cta-specimen-btns">
        <a class="btn btn-cta-inv">Take MindPrint™ Quiz</a>
        <a class="btn btn-ghost">Schedule a conversation</a>
      </div>
    </div>

    <div style="margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Approach Chevrons (How We Work)</div>
    <div class="chevron-demo">
      <div class="chevrons">
        <div class="chev chev-1">
          <div class="chev-label">Phase 01</div>
          <div class="chev-title">Discovery</div>
        </div>
        <div class="chev chev-2">
          <div class="chev-label">Phase 02</div>
          <div class="chev-title">Alignment</div>
        </div>
        <div class="chev chev-3">
          <div class="chev-label">Phase 03</div>
          <div class="chev-title">Optimization</div>
        </div>
      </div>
    </div>

    <div style="margin-top:32px;margin-bottom:12px;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;">Footer Specimen</div>
    <div class="footer-specimen">
      <div class="footer-spec-top">
        <div>
          <div class="footer-spec-logo">Curio<span>.</span></div>
          <p class="footer-spec-p">Curio is the consulting practice behind the MindPrint Framework™ — helping leaders and teams unlock existing potential and optimize work for innovation, happiness, and growth.</p>
        </div>
        <div class="footer-spec-col">
          <h5>The Framework</h5>
          <ul>
            <li><a>The Three Orientations</a></li>
            <li><a>The Energy Model</a></li>
            <li><a>The Six Profiles</a></li>
          </ul>
        </div>
        <div class="footer-spec-col">
          <h5>Connect</h5>
          <ul>
            <li><a>Work With Us</a></li>
            <li><a>hello@curio.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-spec-bottom">
        <p>© 2026 Curio. All rights reserved.</p>
        <p>The MindPrint Framework™</p>
      </div>
    </div>
  </div>

  <hr class="divider" />


  <!-- ══ 13 PROFILE BARS ══ -->
  <div class="section" id="profiles">
    <div class="section-title">13</div>
    <div class="section-heading">Profile Bars</div>
    <p class="section-desc">The six MindPrint™ Profiles are displayed on the Profiles page as horizontally-ruled list rows on a dark background. Each is color-coded by primary orientation and uses a left border to signal the type. Primary profiles use full-opacity colors; secondary (supporting) profiles use 45% opacity.</p>

    <div class="profile-bar-demo">
      <div class="profile-bar pb-why">
        <div>
          <div class="pb-num">01</div>
          <div class="pb-type">WHY – WHAT</div>
          <div class="pb-italic">Purpose-driven, progress-oriented</div>
        </div>
        <div class="pb-summary">Sees the vision, builds the momentum to reach it.</div>
      </div>
      <div class="profile-bar pb-why-alt">
        <div>
          <div class="pb-num">02</div>
          <div class="pb-type">WHY – HOW</div>
          <div class="pb-italic">Purpose-driven, precision-oriented</div>
        </div>
        <div class="pb-summary">Needs to understand the why before perfecting the how.</div>
      </div>
      <div class="profile-bar pb-what">
        <div>
          <div class="pb-num">03</div>
          <div class="pb-type">WHAT – WHY</div>
          <div class="pb-italic">Progress-driven, purpose-oriented</div>
        </div>
        <div class="pb-summary">Moves fast, but needs the goal to be worth chasing.</div>
      </div>
      <div class="profile-bar pb-what-alt">
        <div>
          <div class="pb-num">04</div>
          <div class="pb-type">WHAT – HOW</div>
          <div class="pb-italic">Progress-driven, precision-oriented</div>
        </div>
        <div class="pb-summary">Ships fast, ships right. The most execution-reliable profile.</div>
      </div>
      <div class="profile-bar pb-how">
        <div>
          <div class="pb-num">05</div>
          <div class="pb-type">HOW – WHY</div>
          <div class="pb-italic">Precision-driven, purpose-oriented</div>
        </div>
        <div class="pb-summary">Won't start until it's right — and needs to know why it matters.</div>
      </div>
      <div class="profile-bar pb-how-alt" style="border-bottom:none;">
        <div>
          <div class="pb-num">06</div>
          <div class="pb-type">HOW – WHAT</div>
          <div class="pb-italic">Precision-driven, progress-oriented</div>
        </div>
        <div class="pb-summary">Builds systems that actually work and keeps them moving.</div>
      </div>
    </div>

    <table class="spec-table" style="margin-top:16px;">
      <thead><tr><th>Primary</th><th>Border color (strong)</th><th>Type label color (strong)</th><th>Secondary variant</th></tr></thead>
      <tbody>
        <tr><td>WHY</td><td><code>rgba(52,211,153,0.8)</code></td><td><code>#6EE7B7</code></td><td>45% border · 75% label</td></tr>
        <tr><td>WHAT</td><td><code>rgba(96,165,250,0.8)</code></td><td><code>#93C5FD</code></td><td>45% border · 75% label</td></tr>
        <tr><td>HOW</td><td><code>rgba(251,191,36,0.8)</code></td><td><code>#FCD34D</code></td><td>45% border · 75% label</td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />


  <!-- ══ 14 MOTION ══ -->
  <div class="section" id="motion">
    <div class="section-title">14</div>
    <div class="section-heading">Motion & Animation</div>
    <p class="section-desc">Motion is subtle and purposeful. There are two categories: scroll-triggered reveals (content entering the viewport) and interaction micro-animations (hover, focus).</p>

    <div class="motion-demo">
      <div style="font-size:0.78rem;font-weight:700;color:#374151;margin-bottom:20px;letter-spacing:0.05em;text-transform:uppercase;">Scroll Reveal — .reveal</div>
      <div class="motion-row"><div class="motion-label">Initial state</div><div class="motion-val">opacity: 0 · translateY(28px)</div></div>
      <div class="motion-row"><div class="motion-label">Triggered state</div><div class="motion-val">opacity: 1 · translateY(0)</div></div>
      <div class="motion-row"><div class="motion-label">Duration</div><div class="motion-val">0.7s</div></div>
      <div class="motion-row"><div class="motion-label">Easing</div><div class="motion-val">cubic-bezier(0.4, 0, 0.2, 1)</div></div>
      <div class="motion-row" style="margin-bottom:0;"><div class="motion-label">Stagger delays</div><div class="motion-val">.reveal-d1 → 0.1s · .reveal-d2 → 0.2s · .reveal-d3 → 0.3s · .reveal-d4 → 0.4s</div></div>
    </div>

    <div class="motion-demo">
      <div style="font-size:0.78rem;font-weight:700;color:#374151;margin-bottom:20px;letter-spacing:0.05em;text-transform:uppercase;">Interaction Micro-animations</div>
      <div class="motion-row"><div class="motion-label">Cards (hover)</div><div class="motion-val">translateY(−4px) · border-color → #059669 · box-shadow applied · duration 0.3s</div></div>
      <div class="motion-row"><div class="motion-label">Buttons (hover)</div><div class="motion-val">translateY(−2px) · bg darkens · box-shadow applied · duration 0.25s</div></div>
      <div class="motion-row"><div class="motion-label">Nav links</div><div class="motion-val">color → #059669 · duration 0.25s</div></div>
      <div class="motion-row"><div class="motion-label">Approach chevrons</div><div class="motion-val">bg → rgba(5,150,105,0.13) · filter drop-shadow · duration 0.4s</div></div>
      <div class="motion-row" style="margin-bottom:0;"><div class="motion-label">App cards (expand)</div><div class="motion-val">max-height: 0 → 160px · opacity: 0 → 1 · duration 0.35s ease</div></div>
    </div>

    <p class="note"><strong>Easing token:</strong> <code>--ease: cubic-bezier(0.4, 0, 0.2, 1)</code> — the standard Material Design easing curve, used for all transitions. Avoid linear or bounce easings.</p>
  </div>

  <hr class="divider" />


  <!-- ══ 15 VOICE ══ -->
  <div class="section" id="voice">
    <div class="section-title">15</div>
    <div class="section-heading">Voice & Copy Rules</div>
    <p class="section-desc">The copy system is as deliberate as the visual system. These rules keep the brand voice consistent across the site, slides, and any other materials.</p>

    <table class="spec-table" style="margin-bottom:24px;">
      <thead><tr><th>Rule</th><th>Do</th><th>Don't</th></tr></thead>
      <tbody>
        <tr><td>Button case</td><td>Sentence case — "Take MindPrint™ Quiz"</td><td>ALL CAPS — "TAKE THE QUIZ"</td></tr>
        <tr><td>Heading punctuation</td><td>Headings end with no period unless they're a full sentence question</td><td>Headings ending with periods mid-section</td></tr>
        <tr><td>Em dashes</td><td>Commas or full stops — avoid em dashes in body</td><td>Replacing natural sentence breaks with —</td></tr>
        <tr><td>Trademark</td><td>MindPrint™ on first reference in each section</td><td>MindPrint without ™ in primary headings</td></tr>
        <tr><td>Orientation names</td><td>WHY, WHAT, HOW in caps when referencing orientations</td><td>Why, What, How (lowercase)</td></tr>
        <tr><td>Profiles</td><td>"The six MindPrint™ Profiles" or "WHY–WHAT profile"</td><td>"The six types" or "personality types"</td></tr>
        <tr><td>Tone</td><td>Confident, precise, assumes reader intelligence</td><td>Casual, hedged ("might", "could perhaps")</td></tr>
        <tr><td>Body length</td><td>Long-form body paragraphs with proper structure</td><td>Bullet-heavy sections, fragmented copy</td></tr>
      </tbody>
    </table>

    <div style="background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;padding:32px;">
      <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;margin-bottom:20px;">Key Phrases & Terminology</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <div style="font-size:0.75rem;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Use these</div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;">
            <li style="font-size:0.9rem;color:#374151;">MindPrint™ Profile</li>
            <li style="font-size:0.9rem;color:#374151;">MindPrint™ Framework</li>
            <li style="font-size:0.9rem;color:#374151;">Cognitive orientation</li>
            <li style="font-size:0.9rem;color:#374151;">Primary / secondary / tertiary</li>
            <li style="font-size:0.9rem;color:#374151;">Energizing / neutral / draining</li>
            <li style="font-size:0.9rem;color:#374151;">Discover your profile</li>
            <li style="font-size:0.9rem;color:#374151;">Team alignment</li>
          </ul>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Avoid these</div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;">
            <li style="font-size:0.9rem;color:#374151;">Personality type</li>
            <li style="font-size:0.9rem;color:#374151;">Assessment / test</li>
            <li style="font-size:0.9rem;color:#374151;">MBTI / Myers-Briggs comparisons</li>
            <li style="font-size:0.9rem;color:#374151;">Strengths / weaknesses</li>
            <li style="font-size:0.9rem;color:#374151;">"Find your type"</li>
            <li style="font-size:0.9rem;color:#374151;">Cognitive style (prefer "orientation")</li>
            <li style="font-size:0.9rem;color:#374151;">The six types</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

</div>
`;

export default function StyleGuide() {
  return (
    <>
      <Head>
        <title>Curio Design System</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet" />
        <style>{CSS}</style>
      </Head>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
