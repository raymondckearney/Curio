import Link from 'next/link';

const NAV_ITEMS = [
  { key: 'dashboard',        href: '/portal/dashboard',        label: 'My Profile',           alwaysShow: true },
  { key: 'team',             href: '/portal/team',             label: 'My Team',              license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true },
  { key: 'tokens',           href: '/portal/tokens',           label: 'Assessment Tokens',    license: 'assessment_tokens', enterpriseOnly: true, ownerOnly: true },
  { key: 'results',          href: '/portal/results',          label: 'Assessment Results',   license: 'assessment_tokens', enterpriseOnly: true },
  { key: 'fit',              href: '/portal/tools/fit',        label: 'Role Analyzer',        license: 'role_analyzer' },
  { key: 'career',           href: '/portal/tools/career',     label: 'Career Guidance Tool', license: 'career_guidance' },
  { key: 'jd',               href: '/portal/tools/jd',        label: 'JD Analyzer',          license: 'jd_analyzer' },
  { key: 'analyzer-history', href: '/portal/analyzer-history', label: 'Analyzer History',     license: 'role_analyzer' },
  { key: 'precision',        href: '/portal/tools/precision-companion', label: 'Precision Companion', license: 'precision_companion' },
  { key: 'purpose',          href: '/portal/tools/purpose-companion',   label: 'Purpose Companion',   license: 'purpose_companion' },
  { key: 'progress',         href: '/portal/tools/progress-companion',  label: 'Progress Companion',  license: 'progress_companion' },
  { key: 'translator',       href: '/portal/tools/orientation-translator', label: 'Orientation Translator', license: 'orientation_translator' },
  { key: 'library',          href: '/portal/library',          label: 'Resources',            alwaysShow: true },
];

export default function PortalSidebar({ me, onLogout, active, licenses = [], isIndividual = false }) {
  const licenseTypes = new Set(licenses.map(l => l.type));
  const isOwner = me?.user?.role === 'owner';

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.enterpriseOnly && isIndividual) return false;
    if (item.ownerOnly && !isOwner) return false;
    if (item.alwaysShow) return true;
    if (item.licenseAny) return item.licenseAny.some(t => licenseTypes.has(t));
    return licenseTypes.has(item.license);
  });

  return (
    <div style={sb.sidebar}>
      <div style={sb.brand}>
        <span style={sb.wordmark}>Curio<span style={sb.dot}>.</span></span>
        <span style={sb.accountName}>{me?.account?.name}</span>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {visibleItems.map(item => (
          <Link
            key={item.key}
            href={item.href}
            style={active === item.key
              ? { ...sb.navItem, ...sb.navItemActive }
              : sb.navItem}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={sb.footer}>
        <span style={sb.userName}>{me?.user?.name || me?.user?.email}</span>
        <button style={sb.signOut} onClick={onLogout}>Sign out</button>
      </div>
    </div>
  );
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
};
