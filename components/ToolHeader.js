import Link from 'next/link';
import { NAV_ITEMS, TOOL_SECTIONS } from '../lib/portalNav';

// One header for every tool page: a colored banner with a link back to all
// tools, the tool's group, its name, one line on what it does, and optional
// controls on the right (a history link, a profile switcher). Each Tools
// page group has its own banner color, drawn from the style guide's dark
// backgrounds, so tools in the same group read as a family. Notes passed
// as children sit on the page just under the banner. Margins are explicit
// because some tool pages reset them.
//
// Pages whose content column starts at the top of the screen give that
// column the tool-page-col class so the header clears the mobile menu
// button; pages that pad <main> themselves use tool-main.
export const TOOL_TONES = {
  profile: { bg: '#0F172A', bg2: '#1E293B', accent: '#6EE7B7', sub: '#CBD5E1' },
  teams:   { bg: '#065F46', bg2: '#064E3B', accent: '#A7F3D0', sub: '#D1FAE5' },
  career:  { bg: '#1E3A5F', bg2: '#172E4D', accent: '#93C5FD', sub: '#DBEAFE' },
};

export function toolTone(toolKey) {
  const item = NAV_ITEMS.find(i => i.key === toolKey);
  return TOOL_TONES[item?.section] || TOOL_TONES.profile;
}

export default function ToolHeader({ toolKey, title, subtitle, aside, children }) {
  const item = NAV_ITEMS.find(i => i.key === toolKey);
  const tone = toolTone(toolKey);
  const group = TOOL_SECTIONS.find(sec => sec.key === item?.section);
  return (
    <header className="tool-header" style={s.outer}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tool-header-band" style={{ ...s.band, background: `linear-gradient(135deg, ${tone.bg} 0%, ${tone.bg2} 100%)` }}>
        <img src="/images/brain-fingerprint-watermark.webp" alt="" aria-hidden="true" className="tool-header-mark" style={s.mark} />
        <div style={s.row}>
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <div style={{ ...s.crumbs, color: tone.accent }}>
              <Link href="/portal/tools" className="tool-header-back" style={{ color: tone.accent, textDecoration: 'none' }}>&larr; All tools</Link>
              {group && <span style={{ opacity: 0.75 }}> &middot; {group.label}</span>}
            </div>
            <h1 style={s.title}>{title || item?.label}</h1>
            {(subtitle || item?.blurb) && <p style={{ ...s.sub, color: tone.sub }}>{subtitle || item.blurb}</p>}
          </div>
          {aside && <div style={s.aside}>{aside}</div>}
        </div>
      </div>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </header>
  );
}

// Shared look for controls placed in the banner's aside.
export const bannerControl = {
  label: { display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" },
  link: { fontSize: '0.84rem', fontWeight: 600, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 14px' },
};

const CSS = `
  .tool-header-back:hover{text-decoration:underline !important;}
  .tool-header select option{color:#0F172A;}
  @media print{.tool-header-back{display:none !important;}}
  @media (max-width:768px){
    .tool-header h1{font-size:2.1rem !important;}
    .tool-header-band{padding:24px 20px !important;}
    .tool-header-mark{width:340px !important;right:-120px !important;}
    .tool-page-col{padding-top:72px !important;}
    .tool-main{padding:72px 16px 40px !important;}
  }
`;

const s = {
  outer: { margin: '0 0 28px', fontFamily: "'DM Sans', sans-serif" },
  band: { position: 'relative', overflow: 'hidden', borderRadius: 14, padding: '30px 32px', color: '#fff' },
  mark: { position: 'absolute', top: '50%', right: -140, transform: 'translateY(-50%)', width: 460, maxWidth: 'none', opacity: 0.09, filter: 'invert(1)', pointerEvents: 'none' },
  row: { position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' },
  crumbs: { margin: '0 0 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.6rem', fontWeight: 700, lineHeight: 1.1, color: '#fff', margin: '0 0 6px' },
  sub: { fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 680, margin: 0 },
  aside: { flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
};
