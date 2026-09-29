import Link from 'next/link';
import { NAV_ITEMS } from '../lib/portalNav';

// One header for every tool page, matching the Tools page: a link back to
// all tools, the tool's name, one line on what it does, and optional
// controls on the right (a history link, a profile switcher) or a note row
// underneath. Margins are explicit because some tool pages reset them.
// Pages whose content column starts at the top of the screen give that
// column the tool-page-col class so the header clears the mobile menu button.
export default function ToolHeader({ toolKey, title, subtitle, aside, children }) {
  const item = NAV_ITEMS.find(i => i.key === toolKey);
  return (
    <header className="tool-header" style={s.wrap}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={s.row}>
        <div style={{ minWidth: 0, flex: '1 1 320px' }}>
          <Link href="/portal/tools" className="tool-header-back" style={s.back}>&larr; All tools</Link>
          <h1 style={s.title}>{title || item?.label}</h1>
          {(subtitle || item?.blurb) && <p style={s.sub}>{subtitle || item.blurb}</p>}
        </div>
        {aside && <div style={s.aside}>{aside}</div>}
      </div>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </header>
  );
}

const CSS = `
  .tool-header-back:hover{color:#065F46 !important;}
  @media print{.tool-header-back{display:none !important;}}
  @media (max-width:768px){.tool-header h1{font-size:2.1rem !important;}.tool-page-col{padding-top:72px !important;}.tool-main{padding:72px 16px 40px !important;}}
`;

const s = {
  wrap: { margin: '0 0 28px', padding: '0 0 22px', borderBottom: '1px solid #E2E8F0', fontFamily: "'DM Sans', sans-serif" },
  row: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' },
  back: { display: 'inline-block', margin: '0 0 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', textDecoration: 'none' },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2.6rem', fontWeight: 700, lineHeight: 1.1, color: '#0F172A', margin: '0 0 6px' },
  sub: { fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, maxWidth: 680, margin: 0 },
  aside: { flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
};
