// Team Builder: shared look and small pieces used by every step. The CSS is
// the approved prototype's (docs/prototypes/team-builder-prototype.html),
// scoped under .tb so it never touches the rest of the portal.
import Link from 'next/link';
import { TAGS } from '../../lib/team-builder/engine';
import { PROFILE_COLOR, pct } from '../../lib/team-builder/copy';

export const TB_CSS = `
.tb{--emerald:#059669;--emerald-hover:#047857;--pale:#ECFDF5;--cream:#F0FDF4;--ink:#111827;--ink-soft:#374151;--muted:#6B7280;--paper:#FFFFFF;--warm:#F9FAFB;--subtle:#F3F4F6;--rule:#E5E7EB;--navy:#0F172A;--on-navy:#E2E8F0;--navy-muted:#94A3B8;--why:#6EE7B7;--what:#93C5FD;--how:#FCD34D;--e-fg:#065F46;--e-bg:#ECFDF5;--n-fg:#1E40AF;--n-bg:#EFF6FF;--d-fg:#92400E;--d-bg:#FFFBEB;--display:'Caveat','Segoe Script',cursive;--body:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;--ease:cubic-bezier(0.4,0,0.2,1);color:var(--ink);font-family:var(--body);font-weight:500;font-size:15px;line-height:1.55;max-width:1100px;min-width:0}
.tb *{box-sizing:border-box}
.tb h1,.tb h2,.tb h3{font-family:var(--display);font-weight:700;line-height:1.1;margin:0;text-wrap:balance;color:var(--ink)}
.tb h1{font-size:46px}.tb h2{font-size:34px}.tb h3{font-size:26px}
.tb p{margin:0;max-width:70ch;color:var(--ink-soft)}
.tb .eyebrow{font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--emerald);display:flex;align-items:center;gap:10px}
.tb .eyebrow::before{content:"";width:28px;height:2px;background:var(--emerald);flex:none}
.tb .note{background:var(--cream);border-left:4px solid var(--emerald);border-radius:0 12px 12px 0;padding:12px 16px;font-size:13.5px;color:var(--ink-soft)}
.tb .note.warn{background:var(--d-bg);border-left-color:#F59E0B;color:var(--d-fg)}
.tb .steps{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 28px;padding:0;list-style:none}
.tb .steps button{font:inherit;font-size:13px;font-weight:600;border:2px solid var(--rule);background:var(--paper);color:var(--muted);border-radius:50px;padding:8px 16px;cursor:pointer;transition:all .25s var(--ease)}
.tb .steps button[aria-current="step"]{border-color:var(--emerald);background:var(--emerald);color:#fff}
.tb .steps button:hover:not([aria-current]):not(:disabled){border-color:var(--emerald);color:var(--emerald)}
.tb .steps button:disabled{opacity:.45;cursor:not-allowed}
.tb .stack{display:flex;flex-direction:column;gap:20px}
.tb .sec{display:flex;flex-direction:column;gap:14px}
.tb .card{background:var(--warm);border:1.5px solid var(--rule);border-radius:20px;padding:24px;min-width:0}
.tb .row{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}
.tb label{font-size:12px;font-weight:600;color:var(--muted);display:flex;flex-direction:column;gap:6px}
.tb input,.tb select,.tb textarea{font:inherit;font-size:14px;color:var(--ink);background:var(--paper);border:1.5px solid var(--rule);border-radius:8px;padding:8px 10px;min-width:0}
.tb textarea{width:100%;min-height:300px;line-height:1.5;resize:vertical}
.tb input:focus,.tb select:focus,.tb textarea:focus,.tb button:focus-visible,.tb a:focus-visible{outline:2px solid var(--emerald);outline-offset:2px}
.tb .btn{font:inherit;font-weight:600;font-size:14px;border-radius:50px;border:2px solid var(--emerald);background:var(--emerald);color:#fff;padding:10px 22px;cursor:pointer;transition:all .25s var(--ease);text-decoration:none;display:inline-block}
.tb .btn:hover:not(:disabled){background:var(--emerald-hover);border-color:var(--emerald-hover);transform:translateY(-2px);box-shadow:0 4px 24px rgba(5,150,105,.2)}
.tb .btn:disabled{opacity:.55;cursor:wait}
.tb .btn.ghost{background:transparent;color:var(--emerald)}.tb .btn.ghost:hover:not(:disabled){background:var(--pale)}
.tb .btn.small{padding:6px 14px;font-size:13px}
.tb .link{font:inherit;font-size:13px;font-weight:600;color:var(--emerald);background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-align:left}
.tb .link:hover{color:var(--emerald-hover)}
.tb .actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:space-between;align-items:center}
.tb .scroll{overflow-x:auto;border:1.5px solid var(--rule);border-radius:12px;background:var(--paper);max-width:100%}
.tb table{border-collapse:collapse;width:100%;font-size:13.5px}
.tb th{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 12px;border-bottom:1.5px solid var(--rule);white-space:nowrap;background:var(--warm);vertical-align:bottom}
.tb td{padding:8px 12px;border-bottom:1px solid var(--rule);vertical-align:middle;font-variant-numeric:tabular-nums}
.tb tbody tr:last-child td{border-bottom:0}
.tb tfoot td{background:var(--warm);font-weight:600;white-space:nowrap;border-top:1.5px solid var(--rule);border-bottom:0}
.tb td input[type=text]{width:100%;min-width:240px}.tb td input[type=number]{width:64px}
.tb td select{max-width:220px}
.tb .phrow td{background:var(--warm);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--emerald)}
.tb .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:4px 8px;border-radius:8px}.tb .x:hover:not(:disabled){color:var(--d-fg);background:var(--d-bg)}
.tb .x:disabled{opacity:.35;cursor:not-allowed}
.tb .chip{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:100px;padding:3px 10px;background:var(--pale);color:var(--emerald);white-space:nowrap;border:0;font-family:inherit;line-height:1.5}
.tb .chip.inf{background:var(--subtle);color:var(--muted)}.tb .chip.shift{background:var(--n-bg);color:var(--n-fg);cursor:pointer}.tb .chip.unl{background:var(--d-bg);color:var(--d-fg)}
.tb .shiftwrap{position:relative;display:inline-block;margin-left:6px}
.tb .shiftpop{position:absolute;z-index:5;top:calc(100% + 6px);left:0;width:260px;background:var(--paper);border:1.5px solid var(--rule);border-radius:12px;padding:10px 12px;font-size:12.5px;color:var(--ink-soft);white-space:normal;box-shadow:0 8px 28px rgba(15,23,42,.12);font-weight:500}
.tb .badge{display:inline-block;font-size:12px;font-weight:600;border-radius:100px;padding:3px 10px;border:1px solid;white-space:nowrap}
.tb .E{color:var(--e-fg);background:var(--e-bg);border-color:#A7F3D0}.tb .N{color:var(--n-fg);background:var(--n-bg);border-color:#BFDBFE}.tb .D{color:var(--d-fg);background:var(--d-bg);border-color:#FDE68A}
.tb .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.tb .grid3{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.tb .big{font-family:var(--display);font-weight:700;font-size:44px;line-height:1;color:var(--ink)}
.tb .small{font-size:13px;color:var(--muted)}
.tb .def{border-top:3px solid var(--emerald);padding-top:10px}.tb .def b{display:block;font-size:15px;margin-bottom:4px}
.tb .navy{background:var(--navy);border-radius:20px;padding:24px;color:var(--on-navy);min-width:0}
.tb .navy h3{color:#fff}.tb .navy .small{color:var(--navy-muted)}
.tb .shape{display:grid;grid-template-columns:200px 1fr;gap:28px;align-items:center;margin-top:16px}
.tb .pie{width:200px;height:200px;max-width:100%}
.tb .plegend{display:grid;gap:8px;font-size:13.5px}
.tb .plegend div{display:grid;grid-template-columns:14px 92px 48px 1fr;gap:10px;align-items:center}
.tb .plegend i{width:12px;height:12px;border-radius:3px;display:block}
.tb .plegend b{color:#fff;font-weight:700}.tb .plegend span{color:var(--navy-muted)}
.tb .bar{display:flex;height:28px;border-radius:8px;overflow:hidden}
.tb .bar span{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--navy);white-space:nowrap;overflow:hidden}
.tb .bw{background:var(--why)}.tb .bt{background:var(--what)}.tb .bh{background:var(--how)}
.tb .maprow{display:grid;grid-template-columns:170px 1fr;gap:14px;align-items:center;margin-top:12px}
.tb .maprow b{font-weight:600;font-size:13.5px;color:#fff;display:block}.tb .maprow small{font-size:12px;color:var(--navy-muted)}
.tb .legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;margin-top:16px}
.tb .legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}
.tb .prof{font-family:var(--display);font-weight:700;font-size:28px;line-height:1}
.tb .ebar{display:flex;height:10px;border-radius:50px;overflow:hidden;background:var(--subtle);margin:10px 0 6px}
.tb .ebar .e{background:#10B981}.tb .ebar .n{background:#60A5FA}.tb .ebar .d{background:#F59E0B}
.tb .rl{margin-top:12px;font-size:13.5px}.tb .rl b{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:2px}
.tb .rl div{color:var(--ink-soft)}
.tb ul.plain{margin:6px 0 0;padding-left:18px;color:var(--ink-soft);font-size:13.5px}.tb ul.plain li{margin-bottom:5px}
.tb .flag{background:var(--d-bg);border:1px solid #FDE68A;color:var(--d-fg);border-radius:12px;padding:10px 12px;font-size:13.5px}
.tb .ok{background:var(--e-bg);border:1px solid #A7F3D0;color:var(--e-fg);border-radius:12px;padding:10px 12px;font-size:13.5px}
.tb .err{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:12px;padding:10px 12px;font-size:13.5px}
.tb .toggle{flex-direction:row;align-items:center;gap:8px;font-size:14px;color:var(--ink)}
.tb .tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.tb .tool{font:inherit;font-size:12.5px;font-weight:600;color:var(--emerald);background:var(--pale);border:1.5px solid #A7F3D0;border-radius:50px;padding:5px 12px;cursor:pointer;transition:all .25s var(--ease);text-decoration:none;display:inline-block}
.tb .tool:hover{background:var(--paper);border-color:var(--emerald);transform:translateY(-2px)}
.tb .item{display:grid;grid-template-columns:1fr auto;gap:6px 16px;padding:14px 0;border-top:1px solid var(--rule)}
.tb .item:first-of-type{border-top:0}
.tb .item .nm{font-weight:600;color:var(--ink)}.tb .item .meta{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end}
.tb .item p{grid-column:1/-1;font-size:13.5px}
.tb .foot{font-size:12.5px;color:var(--muted);border-top:1.5px solid var(--rule);padding-top:16px;margin-top:8px}
.tb .drop{border:2px dashed var(--rule);border-radius:14px;padding:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:var(--paper)}
.tb .drop.over{border-color:var(--emerald);background:var(--pale)}
.tb .writing{font-size:12.5px;color:var(--muted);display:inline-flex;align-items:center;gap:8px}
.tb .writing::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--emerald);animation:tbpulse 1.2s ease-in-out infinite}
.tb .spinner{width:18px;height:18px;border-radius:50%;border:2.5px solid #A7F3D0;border-top-color:var(--emerald);animation:tbspin .9s linear infinite;flex:none}
.tb .details{grid-column:1/-1}
@keyframes tbpulse{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes tbspin{to{transform:rotate(360deg)}}
@media (max-width:640px){.tb h1{font-size:38px}.tb h2{font-size:30px}.tb .maprow{grid-template-columns:1fr;gap:4px}.tb .card,.tb .navy{padding:18px}.tb .shape{grid-template-columns:1fr;justify-items:center}.tb .plegend{justify-self:stretch}.tb .plegend div{grid-template-columns:14px 84px 40px 1fr}.tb .item{grid-template-columns:1fr}.tb .item .meta{justify-content:flex-start}.tb .shiftpop{left:auto;right:0}}
@media (prefers-reduced-motion:reduce){.tb *{transition:none!important;animation:none!important}}
`;

export function Select({ options, value, onChange, ...rest }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} {...rest}>
      {options.map(o => {
        const v = typeof o === 'object' ? o.v : o;
        const l = typeof o === 'object' ? o.l : o;
        return <option key={String(v)} value={v}>{l}</option>;
      })}
    </select>
  );
}

// Tool chips link to the tool's page in the MindPrint™ Tertiary Support
// Library. toolLinks comes from the server: { [num]: { name, slug } }.
export function ToolChips({ ids, toolLinks }) {
  const list = (ids || []).filter(i => toolLinks[i]);
  if (!list.length) return null;
  return (
    <div className="tools">
      {list.map(i => (
        <Link key={i} href={`/portal/library/${toolLinks[i].slug}`} className="tool" title={`Tool ${i}: ${toolLinks[i].name}`}>
          {toolLinks[i].name}
        </Link>
      ))}
    </div>
  );
}

export function Pie({ byProfile }) {
  let a0 = -Math.PI / 2;
  const cx = 100, cy = 100, r = 92;
  const slices = [];
  for (const t of TAGS.filter(x => byProfile[x] > 0)) {
    const v = byProfile[t];
    if (v >= 0.999) { slices.push(<circle key={t} cx={cx} cy={cy} r={r} fill={PROFILE_COLOR[t]} />); continue; }
    const a1 = a0 + v * 2 * Math.PI;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    slices.push(<path key={t} d={`M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${v > 0.5 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={PROFILE_COLOR[t]} stroke="#0F172A" strokeWidth="2" />);
    a0 = a1;
  }
  return <svg className="pie" viewBox="0 0 200 200" role="img" aria-label="Share of work by profile">{slices}</svg>;
}

export function DemandBar({ d }) {
  return (
    <div className="bar">
      {[['WHY', 'bw'], ['WHAT', 'bt'], ['HOW', 'bh']].map(([o, c]) => (
        <span key={o} className={c} style={{ width: `${d[o] * 100}%` }}>{d[o] >= 0.08 ? pct(d[o]) : ''}</span>
      ))}
    </div>
  );
}
