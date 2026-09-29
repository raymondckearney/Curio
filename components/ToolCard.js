import Link from 'next/link';
import { toolThumb } from '../lib/portalNav';

// Shared tool card for the Tools page and My Profile's "Your tools".
// Render TOOL_CARD_CSS once on any page that uses it.
export const TOOL_CARD_CSS = `
  .tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px;}
  .tc-card{display:flex;flex-direction:column;background:#ECFDF5;border:2px solid #6EE7B7;border-radius:14px;overflow:hidden;text-decoration:none;color:#0F172A;box-shadow:0 1px 2px rgba(15,23,42,0.04);transition:transform 0.15s ease,box-shadow 0.15s ease,border-color 0.15s ease;}
  a.tc-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(6,95,70,0.16);border-color:#059669;}
  a.tc-card:focus-visible{outline:3px solid #059669;outline-offset:3px;}
  .tc-thumb{position:relative;aspect-ratio:16/10;background:#fff;border-bottom:2px solid #6EE7B7;overflow:hidden;}
  .tc-thumb img{width:100%;height:100%;object-fit:cover;object-position:top left;display:block;}
  .tc-badge{position:absolute;top:8px;left:8px;background:#FCD34D;color:#111827;font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:3px 8px;border-radius:999px;box-shadow:0 2px 6px rgba(15,23,42,0.18);}
  .tc-body{padding:13px 15px 15px;display:flex;flex-direction:column;flex:1;}
  .tc-name{font-weight:700;font-size:0.95rem;margin:0 0 5px;}
  .tc-blurb{font-size:0.8rem;color:#334155;line-height:1.5;margin:0 0 12px;flex:1;}
  .tc-open{font-size:0.8rem;font-weight:700;color:#047857;}
  .tc-locked{background:#F8FAFC;border-color:#E2E8F0;}
  .tc-locked .tc-thumb{border-bottom-color:#E2E8F0;}
  .tc-locked .tc-thumb img{filter:grayscale(0.85);opacity:0.55;}
  .tc-lock-note{font-size:0.74rem;color:#64748B;margin:0 0 10px;}
  .tc-btn{align-self:flex-start;font-family:inherit;font-size:0.78rem;font-weight:700;border-radius:8px;padding:7px 12px;cursor:pointer;text-decoration:none;border:none;}
  .tc-request{background:#FEF3C7;color:#92400E;}
  .tc-request:disabled{opacity:0.6;cursor:default;}
  .tc-go{background:#059669;color:#fff;}
  .tc-done{font-size:0.78rem;font-weight:700;color:#065F46;}
  .tc-err{font-size:0.74rem;color:#B91C1C;margin:6px 0 0;}
  @media (prefers-reduced-motion:reduce){.tc-card{transition:none;}a.tc-card:hover{transform:none;}}
`;

export default function ToolCard({ tool, badge }) {
  return (
    <Link href={tool.href} className="tc-card">
      <div className="tc-thumb">
        <img src={toolThumb(tool)} alt="" loading="lazy" />
        {badge && <span className="tc-badge">{badge}</span>}
      </div>
      <div className="tc-body">
        <p className="tc-name">{tool.label}</p>
        <p className="tc-blurb">{tool.blurb}</p>
        <span className="tc-open">Open →</span>
      </div>
    </Link>
  );
}

// A tool the account doesn't have yet: not a link, with the action that
// would unlock it.
export function LockedToolCard({ tool, lock, state, onRequest }) {
  return (
    <div className="tc-card tc-locked">
      <div className="tc-thumb"><img src={toolThumb(tool)} alt="" loading="lazy" /></div>
      <div className="tc-body">
        <p className="tc-name">{tool.label}</p>
        <p className="tc-blurb">{tool.blurb}</p>
        {lock === 'profile' ? (
          <>
            <p className="tc-lock-note">Unlocks when you complete your MindPrint assessment.</p>
            <Link href="/portal/dashboard" className="tc-btn tc-go">Go to My Profile</Link>
          </>
        ) : state?.requested ? (
          <span className="tc-done">✓ Requested. Curio will follow up.</span>
        ) : (
          <>
            <p className="tc-lock-note">Not included in your account yet.</p>
            <button className="tc-btn tc-request" disabled={state?.sending} onClick={onRequest}>{state?.sending ? 'Sending…' : 'Request access'}</button>
            {state?.error && <p className="tc-err">{state.error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
