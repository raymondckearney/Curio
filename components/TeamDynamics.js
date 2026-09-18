import { useState } from 'react';

// ── Data ─────────────────────────────────────────────────────────────────
// Ported from the standalone /workshop dashboard (now retired) — the
// module logic (problem-match roles, friction pairs, energy profiles,
// blind-spot rules) is this tool's own facilitation-specific content, kept
// verbatim. What changed in the move: participants are no longer typed in
// by hand, they're the account's real team roster (see
// pages/portal/team-dynamics.js), so there's no team/participant CRUD here
// any more — this component is a read-only analysis view.

const TYPES = [
  { id: "WHY-WHAT", primary: "WHY", secondary: "WHAT", label: "WHY – WHAT", desc: "Purpose-driven, progress-oriented" },
  { id: "WHY-HOW",  primary: "WHY", secondary: "HOW",  label: "WHY – HOW",  desc: "Purpose-driven, precision-oriented" },
  { id: "WHAT-WHY", primary: "WHAT", secondary: "WHY", label: "WHAT – WHY", desc: "Progress-driven, purpose-oriented" },
  { id: "WHAT-HOW", primary: "WHAT", secondary: "HOW", label: "WHAT – HOW", desc: "Progress-driven, precision-oriented" },
  { id: "HOW-WHY",  primary: "HOW",  secondary: "WHY", label: "HOW – WHY",  desc: "Precision-driven, purpose-oriented" },
  { id: "HOW-WHAT", primary: "HOW",  secondary: "WHAT", label: "HOW – WHAT", desc: "Precision-driven, progress-oriented" },
];

// Same three orientation colors used site-wide (style guide's .orient-why/
// what/how, and components/SessionArchitect.js's badges): mint,
// sky blue, amber. `mid` is the bright accent tone (dots, bars); `color`/
// `light` are the badge text/background pair.
const ORIENT = {
  WHY:  { color: "#065F46", light: "#DCFCE7", mid: "#6EE7B7", label: "WHY",  sub: "Purpose-Driven"   },
  WHAT: { color: "#1E40AF", light: "#DBEAFE", mid: "#93C5FD", label: "WHAT", sub: "Progress-Driven"  },
  HOW:  { color: "#92400E", light: "#FEF3C7", mid: "#FCD34D", label: "HOW",  sub: "Precision-Driven" },
};

const PROBLEM_TYPES = {
  exploratory: { label: "Exploratory", sub: "We don't know what we don't know", lead: ["WHY-HOW","WHY-WHAT"], support: ["HOW-WHY"], caution: ["WHAT-HOW","WHAT-WHY"], avoid: ["HOW-WHAT"] },
  design:      { label: "Design",      sub: "We know what we need, not how to build it", lead: ["WHY-HOW","HOW-WHY"], support: ["WHY-WHAT","WHAT-HOW"], caution: ["WHAT-WHY"], avoid: ["HOW-WHAT"] },
  execution:   { label: "Execution",   sub: "We know what to build. Get it done.", lead: ["WHAT-HOW","HOW-WHAT"], support: ["WHAT-WHY"], caution: ["WHY-HOW"], avoid: ["WHY-WHAT"] },
  optimization:{ label: "Optimization",sub: "Something is working. Make it better.", lead: ["HOW-WHY","HOW-WHAT"], support: ["WHAT-HOW"], caution: ["WHY-WHAT"], avoid: ["WHAT-WHY"] },
};

const FRICTION_MAP = {
  "WHY-WHAT|WHY-WHAT": { pattern: "Mirror loop — validating each other's vision without stress-testing it", tension: "Can reinforce each other's blind spots around execution detail", suggestions: ["Actively assign one person to play devil's advocate on execution feasibility","Bring in a HOW voice before finalizing direction","Set explicit milestones before diverging into new vision territory"] },
  "WHY-WHAT|WHY-HOW":  { pattern: "Vision alignment with pace friction", tension: "WHY-WHAT wants direction quickly; WHY-HOW needs to fully map the system first", suggestions: ["Agree upfront on a 'complete enough' threshold before moving to action","WHY-WHAT leads direction-setting; WHY-HOW leads system design","Schedule dedicated deep-dive time so WHY-HOW doesn't feel rushed"] },
  "WHY-WHAT|WHAT-WHY": { pattern: "Strong alignment on goals, friction on sequence", tension: "WHY-WHAT wants to anchor purpose first; WHAT-WHY wants to start moving immediately", suggestions: ["Lead with a 5-minute purpose frame before jumping to planning","Trust the WHY-WHAT to set direction; trust the WHAT-WHY to drive execution","Agree that 'why' conversations have a time limit before action begins"] },
  "WHY-WHAT|WHAT-HOW": { pattern: "Complementary strengths, handoff risk", tension: "WHY-WHAT may not brief with enough detail; WHAT-HOW needs a clear execution path", suggestions: ["Build explicit handoff moments with written summaries","WHAT-HOW should ask clarifying questions before acting, not after","WHY-WHAT should stay available during execution for direction checks"] },
  "WHY-WHAT|HOW-WHY":  { pattern: "Deep thinking meets direction-setting", tension: "WHY-WHAT may move to direction before HOW-WHY has finished mapping the system", suggestions: ["Give HOW-WHY protected time for analysis before finalizing direction","Use HOW-WHY's findings to pressure-test WHY-WHAT's vision","Establish a shared cadence — analysis feeds vision, vision feeds analysis"] },
  "WHY-WHAT|HOW-WHAT": { pattern: "Vision vs. operational reality", tension: "WHY-WHAT sets direction without operational constraints; HOW-WHAT builds systems that may not serve the vision", suggestions: ["Involve HOW-WHAT early in vision-setting to flag operational boundaries","WHY-WHAT must clearly communicate 'why' behind systems they request","Build in regular vision-to-operations translation checkpoints"] },
  "WHY-HOW|WHY-HOW":   { pattern: "Intellectual depth partnership — deployment risk", tension: "Both will keep refining without shipping; no natural forcing function for action", suggestions: ["Externally impose a deadline or bring in a WHAT partner","Alternate who plays the 'ship it' role each sprint","Set a hard 'complete enough' standard at the start of each project"] },
  "WHY-HOW|WHAT-WHY":  { pattern: "Thinking vs. moving — classic tension", tension: "WHY-HOW needs more understanding before acting; WHAT-WHY is already moving", suggestions: ["Agree that 'ready to move' requires a brief from WHY-HOW first","WHAT-WHY communicates momentum as enabling, not threatening, deep work","Build in structured synthesis moments between analysis and action phases"] },
  "WHY-HOW|WHAT-HOW":  { pattern: "Depth meets execution — productive if sequenced well", tension: "WHY-HOW is still refining the plan when WHAT-HOW is ready to build", suggestions: ["Define phases explicitly: WHY-HOW owns design, WHAT-HOW owns execution","WHAT-HOW checks in with WHY-HOW before major decisions during execution","WHY-HOW communicates 'design complete' as a clear handoff signal"] },
  "WHY-HOW|HOW-WHY":   { pattern: "Deepest intellectual partnership — action deficit", tension: "Both orientations prefer depth over deployment; work can be extraordinary but never ship", suggestions: ["Assign a dedicated WHAT partner to create urgency","Set explicit deployment milestones at the start — both must commit","Celebrate shipping, not just quality — reframe what success looks like"] },
  "WHY-HOW|HOW-WHAT":  { pattern: "System design vs. operational build", tension: "WHY-HOW designs elegant systems; HOW-WHAT starts building before the design is complete", suggestions: ["Establish a 'design freeze' point before HOW-WHAT begins operationalizing","WHY-HOW documents the system architecture clearly before handoff","HOW-WHAT flags when operational constraints conflict with the design"] },
  "WHAT-WHY|WHAT-WHY": { pattern: "Momentum amplification — direction drift risk", tension: "Both drive hard toward goals; neither naturally checks whether the goal is still right", suggestions: ["Schedule regular 'is this still the right goal?' check-ins","Bring in a WHY voice periodically to interrogate direction","Celebrate milestone completion but require a direction check before the next sprint"] },
  "WHAT-WHY|WHAT-HOW": { pattern: "Strong execution alignment", tension: "WHAT-WHY drives pace; WHAT-HOW needs operational clarity before moving", suggestions: ["WHAT-WHY shares destination and rough path; WHAT-HOW owns the detailed plan","WHAT-HOW communicates blockers early rather than silently absorbing them","Regular syncs to ensure pace doesn't outrun operational capacity"] },
  "WHAT-WHY|HOW-WHY":  { pattern: "Speed vs. depth — high creative tension", tension: "WHAT-WHY is three steps ahead; HOW-WHY hasn't finished understanding step one", suggestions: ["Agree that analysis has a defined time box; HOW-WHY must flag when it needs more","WHAT-WHY leads milestones; HOW-WHY leads quality gates before each milestone","Name the tension explicitly — it's productive, not personal"] },
  "WHAT-WHY|HOW-WHAT": { pattern: "Momentum meets operations — powerful if aligned", tension: "WHAT-WHY drives pace; HOW-WHAT needs the system to be solid before scaling", suggestions: ["Treat HOW-WHAT's operational concerns as enabling, not blocking","WHAT-WHY must give HOW-WHAT sufficient time to build infrastructure before scaling","Joint planning sessions to sequence momentum and operational build in parallel"] },
  "WHAT-HOW|WHAT-HOW": { pattern: "Execution excellence — purpose blind spot", tension: "Both execute brilliantly; neither naturally asks whether the destination is right", suggestions: ["Build in a mandatory 'why are we doing this?' question at project kickoff","Rotate who plays the strategic challenger role on each project","Bring in a WHY voice for direction checks at major milestones"] },
  "WHAT-HOW|HOW-WHY":  { pattern: "Execution meets analysis — quality partnership", tension: "WHAT-HOW moves faster than HOW-WHY is comfortable with", suggestions: ["HOW-WHY sets quality gates; WHAT-HOW owns execution between gates","WHAT-HOW communicates 'I need your analysis by X' clearly and in advance","Both types agree on what 'good enough to proceed' looks like"] },
  "WHAT-HOW|HOW-WHAT": { pattern: "Operational peers — potential overlap", tension: "Both own execution; may duplicate effort or collide on ownership", suggestions: ["Define clear operational domains before the project starts","WHAT-HOW owns forward momentum; HOW-WHAT owns systems and infrastructure","Regular syncs to surface overlap early"] },
  "HOW-WHY|HOW-WHY":   { pattern: "Deep analytical partnership — deployment challenge", tension: "Both will keep improving past the point of diminishing returns", suggestions: ["Set a hard external deadline and treat it as non-negotiable","Alternate who plays the 'good enough to ship' advocate each cycle","Bring in a WHAT partner to create the forcing function for deployment"] },
  "HOW-WHY|HOW-WHAT":  { pattern: "Depth meets operational build", tension: "HOW-WHY keeps refining; HOW-WHAT wants to start building the system", suggestions: ["HOW-WHY owns design until a defined 'architecture complete' milestone","HOW-WHAT's operational feedback improves the design — create a feedback loop","Agree that building can start on stable components while others are still being refined"] },
  "HOW-WHAT|HOW-WHAT": { pattern: "Operational excellence — vision deficit", tension: "Both build excellent systems; neither naturally questions whether the systems serve the right goal", suggestions: ["Require a written purpose statement before any system design begins","Bring in a WHY voice to validate that operational work serves strategic goals","Celebrate when the system serves the mission, not just when it runs smoothly"] },
};

function getFrictionKey(t1, t2) {
  const pairs = [t1+"|"+t2, t2+"|"+t1];
  for (const p of pairs) if (FRICTION_MAP[p]) return p;
  return null;
}

const ENERGY_PROFILES = {
  "WHY-WHAT": { energizes: ["Defining vision and direction","Challenging assumptions and asking why","Identifying opportunities and gaps","Strategic framing and narrative"], drains: ["Granular task tracking","Detailed documentation","Repetitive process work","Working in the weeds for extended periods"] },
  "WHY-HOW":  { energizes: ["Mapping complex systems","Deep research and synthesis","Framework and model design","Connecting vision to operational detail"], drains: ["Rapid iteration without analysis","Shipping before it feels right","Communicating to fast-moving audiences","Pure action without sufficient grounding"] },
  "WHAT-WHY": { energizes: ["Building momentum and driving milestones","Rallying teams around a goal","Fast decision-making under ambiguity","Client-facing discovery and pitching"], drains: ["Detailed process design","Administrative and compliance work","Precision-oriented work for extended periods","Deep analytical research"] },
  "WHAT-HOW": { energizes: ["Detailed project planning and execution","Breaking initiatives into steps","Building metrics and dashboards","Running agile processes"], drains: ["Open-ended visioning without clear milestones","Extended ambiguity about direction","Pure strategy without implementation path","Work lacking defined next steps"] },
  "HOW-WHY":  { energizes: ["Root cause analysis and deep analytical work","Process auditing and redesign","Synthesizing complex data into insights","Testing hypotheses rigorously"], drains: ["Launching before full analysis","High-velocity environments","Communicating findings to non-technical audiences","Prioritizing when everything feels equally important"] },
  "HOW-WHAT": { energizes: ["Designing operational processes","Building structures and operating models","Creating SOPs and playbooks","Managing multi-workstream complexity"], drains: ["Ambiguous open-ended creative work","Vision-setting without clear parameters","Frequent pivots without structure","Communicating the 'why' behind systems"] },
};

const CSS = `
  .td-root{font-family:'DM Sans',system-ui,sans-serif;color:#0F172A;font-size:14px;line-height:1.6;}
  .td-root :root{--font-serif:'Caveat',cursive;}
  .td-hero{background:#0F172A;color:#fff;padding:28px 24px;border-radius:8px;margin-bottom:24px;}
  .td-hero p{margin:8px 0 0;color:#A7F3D0;font-size:0.92rem;max-width:640px;line-height:1.5;}
  .td-team-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
  .td-team-tab{padding:8px 18px;border-radius:99px;font-size:12.5px;font-weight:600;cursor:pointer;border:1.5px solid #E2E8F0;background:#fff;color:#475569;font-family:'DM Sans',sans-serif;transition:all 0.12s;}
  .td-team-tab:hover{border-color:#059669;color:#065F46;}
  .td-team-tab.active{background:#059669;color:#fff;border-color:#059669;}
  .wd-modules{display:flex;gap:4px;margin-bottom:28px;border-bottom:1px solid #E2E8F0;flex-wrap:wrap;}
  .wd-module-tab{font-size:12.5px;color:#94A3B8;padding:9px 16px;cursor:pointer;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.12s;font-family:'DM Sans',sans-serif;font-weight:600;white-space:nowrap;letter-spacing:0.01em;border-radius:8px 8px 0 0;}
  .wd-module-tab:hover{color:#065F46;background:#DCFCE7;}
  .wd-module-tab.active{color:#065F46;border-bottom-color:#059669;}
  .wd-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:24px 28px;margin-bottom:16px;box-shadow:0 1px 6px rgba(15,23,42,0.05);}
  .wd-card-title{font-family:'Caveat',cursive;font-size:1.3rem;font-weight:700;color:#0F172A;margin-bottom:4px;}
  .wd-card-sub{font-size:12px;color:#94A3B8;margin-bottom:20px;letter-spacing:0.02em;}
  .wd-participant-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-top:12px;}
  .wd-participant-card{background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;padding:16px;position:relative;transition:border-color 0.12s;}
  .wd-participant-card:hover{border-color:#059669;}
  .wd-p-name{font-size:14px;font-weight:600;color:#0F172A;margin-bottom:6px;}
  .wd-select{width:100%;padding:10px 14px;font-size:14px;border:1px solid #E2E8F0;border-radius:8px;background:#fff;color:#0F172A;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;}
  .wd-select:focus{border-color:#059669;}
  .wd-input{width:100%;padding:10px 14px;font-size:14px;border:1px solid #E2E8F0;border-radius:8px;background:#fff;color:#0F172A;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.12s;}
  .wd-input:focus{border-color:#059669;}
  .wd-btn{padding:10px 22px;font-size:13px;font-weight:700;border:none;border-radius:999px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;letter-spacing:0.01em;}
  .wd-btn-primary{background:#059669;color:white;}
  .wd-btn-primary:hover{background:#065F46;}
  .wd-btn-primary:disabled{background:#E2E8F0;color:#94A3B8;cursor:not-allowed;}
  .wd-dist-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
  .wd-dist-label{width:48px;font-size:11px;font-weight:700;letter-spacing:0.06em;}
  .wd-dist-bar-bg{flex:1;height:6px;background:#F1F5F9;border-radius:3px;overflow:hidden;}
  .wd-dist-bar-fill{height:100%;border-radius:3px;transition:width 0.5s ease;}
  .wd-dist-count{width:28px;font-size:12px;color:#94A3B8;text-align:right;}
  .wd-match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:12px;}
  .wd-match-card{border-radius:12px;padding:14px;border:1px solid transparent;}
  .wd-match-card.lead{background:#DCFCE7;border-color:#6EE7B7;}
  .wd-match-card.support{background:#DBEAFE;border-color:#93C5FD;}
  .wd-match-card.caution{background:#FEF3C7;border-color:#FCD34D;}
  .wd-match-card.avoid{background:#FEE2E2;border-color:#FCA5A5;}
  .wd-match-role{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;}
  .wd-match-role.lead{color:#065F46;}
  .wd-match-role.support{color:#1E40AF;}
  .wd-match-role.caution{color:#92400E;}
  .wd-match-role.avoid{color:#991B1B;}
  .wd-friction-select-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
  .wd-friction-result{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px;}
  .wd-friction-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:4px;}
  .wd-friction-pattern{font-family:'Caveat',cursive;font-size:1.3rem;font-weight:700;color:#0F172A;margin-bottom:16px;line-height:1.35;}
  .wd-friction-item{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;}
  .wd-friction-dot{width:5px;height:5px;border-radius:50%;background:#059669;margin-top:7px;flex-shrink:0;}
  .wd-energy-table{width:100%;border-collapse:collapse;}
  .wd-energy-table th{text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;padding:0 12px 12px 0;border-bottom:1px solid #E2E8F0;font-weight:700;}
  .wd-energy-table td{padding:14px 12px 14px 0;border-bottom:1px solid #F1F5F9;vertical-align:top;font-size:13px;}
  .wd-energy-table tr:last-child td{border-bottom:none;}
  .wd-pill{display:inline-block;font-size:11px;padding:3px 10px;border-radius:99px;margin:2px;font-weight:600;}
  .wd-bs-title{font-family:'Caveat',cursive;font-size:1.2rem;font-weight:700;margin-bottom:8px;color:#0F172A;}
  .wd-bs-text{font-size:13px;color:#475569;line-height:1.7;}
  .wd-collab-result{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px;margin-top:16px;}
  .wd-collab-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:8px;}
  .wd-collab-pair{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:14px 16px;margin-bottom:10px;}
  .wd-collab-pair-names{font-size:14px;font-weight:600;color:#0F172A;margin-bottom:4px;}
  .wd-collab-pair-reason{font-size:13px;color:#475569;line-height:1.6;}
  .wd-empty{text-align:center;padding:80px 40px;color:#94A3B8;}
  .wd-empty-title{font-family:'Caveat',cursive;font-size:1.6rem;font-weight:700;color:#475569;margin-bottom:8px;}
  .wd-empty-sub{font-size:13px;line-height:1.6;}
  .wd-divider{border:none;border-top:1px solid #E2E8F0;margin:24px 0;}
  .wd-problem-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;}
  .wd-problem-tab{padding:8px 18px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #E2E8F0;background:none;color:#475569;font-family:'DM Sans',sans-serif;transition:all 0.12s;}
  .wd-problem-tab:hover{border-color:#059669;color:#065F46;}
  .wd-problem-tab.active{background:#059669;color:white;border-color:#059669;}
  .wd-legend{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;}
  .wd-legend-item{display:flex;align-items:center;gap:6px;font-size:11px;color:#475569;}
  .wd-legend-dot{width:8px;height:8px;border-radius:2px;}
`;

function typeOrientColors(type) {
  const t = TYPES.find(x => x.id === type);
  if (!t) return { bg: "#f0ede8", color: "#5a5a54", border: "#e0ddd8" };
  return { bg: ORIENT[t.primary].light, color: ORIENT[t.primary].color, border: ORIENT[t.primary].mid };
}
function TypeBadge({ type }) {
  const c = typeOrientColors(type);
  const t = TYPES.find(x => x.id === type);
  return <span style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:99,fontSize:11,fontWeight:700,letterSpacing:"0.04em",padding:"2px 9px",display:"inline-block",fontFamily:"'DM Sans',sans-serif"}}>{t?.label||type}</span>;
}
function tertiary(typeId) {
  const t = TYPES.find(x => x.id === typeId);
  if (!t) return "—";
  return ["WHY","WHAT","HOW"].find(b => b !== t.primary && b !== t.secondary);
}

async function readStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") text += evt.delta.text;
      } catch {}
    }
  }
  return text;
}

function ModuleCanvas({ participants }) {
  if (!participants.length) return <div className="wd-empty"><div className="wd-empty-title">No completed profiles yet</div><div className="wd-empty-sub">Once team members complete their MindPrint™ assessment, they'll show up here.</div></div>;
  const counts = { WHY: 0, WHAT: 0, HOW: 0 };
  participants.forEach(p => { const t = TYPES.find(x => x.id === p.type); if (t) counts[t.primary]++; });
  const total = participants.length;
  const missing = ["WHY","WHAT","HOW"].filter(b => counts[b] === 0);
  return (
    <div>
      <div className="wd-card">
        <div className="wd-card-title">Type Distribution</div>
        <div className="wd-card-sub">Primary orientation across the team</div>
        {["WHY","WHAT","HOW"].map(b => (
          <div className="wd-dist-row" key={b}>
            <div className="wd-dist-label" style={{color:ORIENT[b].color,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.06em"}}>{b}</div>
            <div className="wd-dist-bar-bg"><div className="wd-dist-bar-fill" style={{width:total?`${(counts[b]/total)*100}%`:"0%",background:ORIENT[b].color,opacity:0.7}}/></div>
            <div className="wd-dist-count">{counts[b]}</div>
          </div>
        ))}
        {missing.length > 0 && <div style={{marginTop:16,padding:"10px 14px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:8,fontSize:12,color:"#92400E"}}>⚠ No primary <strong>{missing.join(" or ")}</strong> orientation on this team. This is a structural coverage gap.</div>}
      </div>
      <div className="wd-card">
        <div className="wd-card-title">Team Members</div>
        <div className="wd-card-sub">{participants.length} participant{participants.length !== 1 ? "s" : ""}</div>
        <div className="wd-participant-grid">
          {participants.map(p => (
            <div key={p.id} className="wd-participant-card">
              <div className="wd-p-name">{p.name}</div>
              {p.role && <div style={{fontSize:11,color:"#94A3B8",marginBottom:8}}>{p.role}</div>}
              <TypeBadge type={p.type} />
              <div style={{marginTop:8,fontSize:11,color:"#94A3B8"}}>Tertiary: <strong style={{color:ORIENT[tertiary(p.type)]?.color}}>{tertiary(p.type)}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleProblemMatch({ participants }) {
  const [problemType, setProblemType] = useState("exploratory");
  if (!participants.length) return <div className="wd-empty"><div className="wd-empty-title">No completed profiles yet</div><div className="wd-empty-sub">Once team members complete their MindPrint™ assessment, they'll show up here.</div></div>;
  const pt = PROBLEM_TYPES[problemType];
  const roleFor = p => { if (pt.lead.includes(p.type)) return "lead"; if (pt.support.includes(p.type)) return "support"; if (pt.caution.includes(p.type)) return "caution"; return "avoid"; };
  const roleLabel = { lead: "Lead", support: "Support", caution: "Use with Caution", avoid: "Hold Back" };
  return (
    <div>
      <div className="wd-card">
        <div className="wd-card-title">Problem Type</div>
        <div className="wd-card-sub">Select the type of work the team is currently doing</div>
        <div className="wd-problem-tabs">
          {Object.entries(PROBLEM_TYPES).map(([k,v]) => <button key={k} className={`wd-problem-tab${problemType===k?" active":""}`} onClick={() => setProblemType(k)}>{v.label}</button>)}
        </div>
        <div style={{fontSize:13,color:"#475569",fontStyle:"italic"}}>"{pt.sub}"</div>
      </div>
      <div className="wd-card">
        <div className="wd-card-title">Team Composition for {pt.label} Work</div>
        <div className="wd-card-sub">How each team member should be positioned for this problem type</div>
        <div className="wd-legend">
          {[["lead","#065F46","#DCFCE7","#6EE7B7"],["support","#1E40AF","#DBEAFE","#93C5FD"],["caution","#92400E","#FEF3C7","#FCD34D"],["avoid","#991B1B","#FEE2E2","#FCA5A5"]].map(([r,c,bg,bd]) => (
            <div className="wd-legend-item" key={r}><div className="wd-legend-dot" style={{background:bg,border:`1px solid ${bd}`}}/><span style={{color:c,fontWeight:600,textTransform:"capitalize"}}>{roleLabel[r]}</span></div>
          ))}
        </div>
        <div className="wd-match-grid">
          {participants.map(p => {
            const role = roleFor(p);
            return <div key={p.id} className={`wd-match-card ${role}`}><div className={`wd-match-role ${role}`}>{roleLabel[role]}</div><div style={{fontSize:13,fontWeight:600,color:"#0F172A",marginBottom:4}}>{p.name}</div><TypeBadge type={p.type}/></div>;
          })}
        </div>
      </div>
    </div>
  );
}

function ModuleFriction({ participants }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  if (participants.length < 2) return <div className="wd-empty"><div className="wd-empty-title">Need at least 2 completed profiles</div><div className="wd-empty-sub">Once more team members complete their MindPrint™ assessment, the Friction Spotter will be available.</div></div>;
  const person1 = participants.find(p => p.id === p1);
  const person2 = participants.find(p => p.id === p2);
  const frictionKey = person1 && person2 ? getFrictionKey(person1.type, person2.type) : null;
  const friction = frictionKey ? FRICTION_MAP[frictionKey] : null;
  return (
    <div>
      <div className="wd-card">
        <div className="wd-card-title">Select Two Team Members</div>
        <div className="wd-card-sub">Choose any pair to surface their likely friction pattern</div>
        <div className="wd-friction-select-row">
          <div><label style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"#065F46",marginBottom:6,display:"block"}}>Person 1</label><select className="wd-select" value={p1} onChange={e => setP1(e.target.value)}><option value="">Select participant...</option>{participants.filter(p => p.id !== p2).map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}</select></div>
          <div><label style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"#065F46",marginBottom:6,display:"block"}}>Person 2</label><select className="wd-select" value={p2} onChange={e => setP2(e.target.value)}><option value="">Select participant...</option>{participants.filter(p => p.id !== p1).map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}</select></div>
        </div>
      </div>
      {friction && person1 && person2 && (
        <div className="wd-friction-result">
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}><TypeBadge type={person1.type}/><span style={{color:"#94A3B8",fontSize:14}}>×</span><TypeBadge type={person2.type}/></div>
          <div className="wd-friction-label">Friction Pattern</div>
          <div className="wd-friction-pattern">{friction.pattern}</div>
          <div className="wd-friction-label">Why It Happens</div>
          <div style={{fontSize:13,color:"#475569",lineHeight:1.7,marginBottom:20}}>{friction.tension}</div>
          <div className="wd-friction-label">How to Work Through It</div>
          {friction.suggestions.map((s,i) => <div className="wd-friction-item" key={i}><div className="wd-friction-dot"/><div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>{s}</div></div>)}
        </div>
      )}
    </div>
  );
}

function ModuleEnergyMap({ participants }) {
  if (!participants.length) return <div className="wd-empty"><div className="wd-empty-title">No completed profiles yet</div><div className="wd-empty-sub">Once team members complete their MindPrint™ assessment, they'll show up here.</div></div>;
  return (
    <div className="wd-card" style={{overflowX:"auto"}}>
      <div className="wd-card-title">Team Energy Map</div>
      <div className="wd-card-sub">What energizes, neutralizes, and drains each person</div>
      <table className="wd-energy-table" style={{minWidth:600}}>
        <thead><tr><th style={{width:160}}>Name</th><th style={{width:120}}>Type</th><th>Energizes (+)</th><th>Neutral (±)</th><th>Drains (−)</th></tr></thead>
        <tbody>
          {participants.map(p => {
            const t = TYPES.find(x => x.id === p.type);
            const ter = t ? ["WHY","WHAT","HOW"].find(b => b !== t.primary && b !== t.secondary) : null;
            const profile = ENERGY_PROFILES[p.type];
            return (
              <tr key={p.id}>
                <td><div style={{fontWeight:600,fontSize:13}}>{p.name}</div>{p.role && <div style={{fontSize:11,color:"#94A3B8"}}>{p.role}</div>}</td>
                <td><TypeBadge type={p.type}/></td>
                <td>{profile?.energizes.slice(0,2).map((e,i) => <span key={i} className="wd-pill" style={{background:t?ORIENT[t.primary].light:"#eee",color:t?ORIENT[t.primary].color:"#666"}}>{e}</span>)}</td>
                <td>{t && <span className="wd-pill" style={{background:ORIENT[t.secondary].light,color:ORIENT[t.secondary].color}}>{t.secondary} work</span>}</td>
                <td>{ter && profile?.drains.slice(0,2).map((d,i) => <span key={i} className="wd-pill" style={{background:ORIENT[ter]?.light||"#eee",color:ORIENT[ter]?.color||"#666"}}>{d}</span>)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ModuleCollaboration({ participants }) {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  if (!participants.length) return <div className="wd-empty"><div className="wd-empty-title">No completed profiles yet</div><div className="wd-empty-sub">Once team members complete their MindPrint™ assessment, they'll show up here.</div></div>;

  async function analyze() {
    if (!task.trim()) return;
    setLoading(true); setError(""); setResult(null);
    const teamDesc = participants.map(p => `${p.name} (${p.type}${p.role?", "+p.role:""})`).join(", ");
    const systemPrompt = `You are an expert in the MindPrint™ Framework. Given a team and a task, recommend collaboration pairings. Return ONLY valid JSON: {"pairings":[{"person1":"<name>","person2":"<name>","reason":"<1-2 sentences>","role":"<what each brings>"}],"leadType":"<name>","leadReason":"<why>","watchOut":"<one key dynamic>"}`;
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 800, system: systemPrompt, messages: [{ role: "user", content: `Team: ${teamDesc}\nTask: "${task.trim()}"` }] }),
      });
      const ct = response.headers.get("content-type") || "";
      let raw;
      if (ct.includes("application/json")) {
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || data.error);
        raw = data.content?.[0]?.text || "";
      } else {
        raw = await readStream(response);
      }
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="wd-card">
        <div className="wd-card-title">Describe the Task or Initiative</div>
        <div className="wd-card-sub">Be specific — the AI will recommend pairings based on the actual work involved</div>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <textarea className="wd-input" value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Redesign the onboarding process, Build the Q3 product roadmap..." rows={3} style={{resize:"vertical"}}/>
          <button className="wd-btn wd-btn-primary" disabled={!task.trim()||loading} onClick={analyze} style={{flexShrink:0,whiteSpace:"nowrap"}}>{loading?"Analyzing...":"Recommend →"}</button>
        </div>
        {error && <div style={{marginTop:10,fontSize:13,color:"#92400E",background:"#FEF3C7",padding:"8px 12px",borderRadius:8}}>{error}</div>}
      </div>
      {result && (
        <div className="wd-collab-result">
          {result.leadType && <div style={{marginBottom:20,padding:"14px 16px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,borderLeft:"3px solid #065F46"}}><div className="wd-collab-label">Recommended Lead</div><div style={{fontFamily:"'Caveat',cursive",fontSize:16,fontWeight:500,color:"#0F172A",marginBottom:4}}>{result.leadType}</div><div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>{result.leadReason}</div></div>}
          <div className="wd-collab-label">Recommended Pairings</div>
          {result.pairings?.map((pair,i) => <div key={i} className="wd-collab-pair"><div className="wd-collab-pair-names">{pair.person1} + {pair.person2}</div>{pair.role && <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>{pair.role}</div>}<div className="wd-collab-pair-reason">{pair.reason}</div></div>)}
          {result.watchOut && <div style={{marginTop:16,padding:"12px 14px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:8,fontSize:12,color:"#92400E"}}><strong>Watch:</strong> {result.watchOut}</div>}
        </div>
      )}
    </div>
  );
}

function ModuleBlindSpots({ participants }) {
  if (!participants.length) return <div className="wd-empty"><div className="wd-empty-title">No completed profiles yet</div><div className="wd-empty-sub">Once team members complete their MindPrint™ assessment, the blind spot report will be available.</div></div>;
  const primaryCounts = { WHY:0, WHAT:0, HOW:0 };
  const tertiaryCounts = { WHY:0, WHAT:0, HOW:0 };
  participants.forEach(p => {
    const type = TYPES.find(x => x.id === p.type);
    if (!type) return;
    primaryCounts[type.primary]++;
    const ter = ["WHY","WHAT","HOW"].find(b => b !== type.primary && b !== type.secondary);
    tertiaryCounts[ter]++;
  });
  const missingPrimaries = Object.entries(primaryCounts).filter(([,v]) => v===0).map(([k]) => k);
  const heavyTertiary = Object.entries(tertiaryCounts).sort((a,b) => b[1]-a[1]);
  const dominant = Object.entries(primaryCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
  const BLINDSPOTS = {
    WHY: { gap:"No one is consistently asking whether the team is solving the right problem.", risk:"The team may execute brilliantly in the wrong direction.", fix:"Introduce a structured 'are we solving the right problem?' check at the start of each major initiative." },
    WHAT:{ gap:"No one is naturally driving momentum or moving the team from analysis to action.", risk:"Decisions will drag, projects will stall at transitions.", fix:"Assign an explicit 'momentum owner' on each project responsible for calling decisions and driving next steps." },
    HOW: { gap:"No one is naturally tracking execution detail or ensuring nothing falls through the cracks.", risk:"Plans will have structural gaps that don't surface until execution fails.", fix:"Build a structured HOW layer into every project: a detailed plan, a dependency map, a quality checklist." },
  };
  return (
    <div>
      <div className="wd-card">
        <div className="wd-card-title">Team Blind Spot Report</div>
        <div className="wd-card-sub">Structural vulnerabilities based on type composition</div>
        {missingPrimaries.length===0 && <div style={{padding:"12px 14px",background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:8,fontSize:13,color:"#065F46",marginBottom:20}}>✓ All three orientations are represented on this team.</div>}
        {missingPrimaries.map(b => (
          <div key={b} style={{padding:20,background:ORIENT[b].light,border:`1px solid ${ORIENT[b].mid}`,borderRadius:12,borderLeft:`3px solid ${ORIENT[b].color}`,marginBottom:16}}>
            <div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:ORIENT[b].color,fontWeight:700,marginBottom:4}}>Missing Primary: {b}</div>
            <div className="wd-bs-title">{BLINDSPOTS[b].gap}</div>
            <div className="wd-bs-text" style={{marginBottom:12}}>{BLINDSPOTS[b].risk}</div>
            <div style={{fontSize:11,fontWeight:600,color:ORIENT[b].color,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Recommendation</div>
            <div className="wd-bs-text">{BLINDSPOTS[b].fix}</div>
          </div>
        ))}
        <hr className="wd-divider"/>
        <div className="wd-bs-title" style={{marginBottom:8}}>Tertiary Clustering</div>
        <div className="wd-bs-text" style={{marginBottom:16}}>When multiple people share a tertiary orientation, the team has a collective blind spot in that area.</div>
        {heavyTertiary.filter(([,v]) => v>0).map(([orientation,count]) => (
          <div className="wd-dist-row" key={orientation}>
            <div className="wd-dist-label" style={{color:ORIENT[orientation].color,fontSize:11,fontWeight:700,letterSpacing:"0.06em",fontFamily:"'DM Sans',sans-serif"}}>{orientation}</div>
            <div className="wd-dist-bar-bg"><div className="wd-dist-bar-fill" style={{width:`${(count/participants.length)*100}%`,background:ORIENT[orientation].color,opacity:0.5}}/></div>
            <div className="wd-dist-count">{count}</div>
          </div>
        ))}
        {dominant && (<><hr className="wd-divider"/><div className="wd-bs-title" style={{marginBottom:8}}>Dominant Orientation: {dominant}</div><div className="wd-bs-text">{{WHY:"This team is heavy on purpose and vision. Watch for over-indexing on 'why' at the expense of momentum and execution detail.",WHAT:"This team is heavy on action and momentum. Watch for moving faster than the vision can keep up with.",HOW:"This team is heavy on precision and process. Watch for analysis paralysis and difficulty shipping."}[dominant]}</div></>)}
      </div>
    </div>
  );
}

const MODULES = [
  { id:"canvas",    label:"Team Canvas" },
  { id:"problem",   label:"Problem Match" },
  { id:"friction",  label:"Friction Spotter" },
  { id:"energy",    label:"Energy Map" },
  { id:"collab",    label:"Collaboration" },
  { id:"blindspot", label:"Blind Spot Report" },
];

// teamOptions: [{ id, label, count }] — omitted (or length <= 1) hides the
// team-switcher row entirely, since a manager (or an owner with a single
// team) has nothing to toggle between.
export default function TeamDynamics({ participants, teamOptions, activeTeamId, onTeamChange }) {
  const [activeModule, setActiveModule] = useState("canvas");

  return (
    <div className="td-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="td-hero">
        <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: "1.8rem" }}>Dynamics</p>
        <p>See how your team's MindPrint™ profiles fit together — coverage gaps, friction patterns, energy fit, and who to pair on what.</p>
      </div>

      {teamOptions && teamOptions.length > 1 && (
        <div className="td-team-tabs">
          {teamOptions.map(t => (
            <button key={t.id} className={`td-team-tab${activeTeamId===t.id?" active":""}`} onClick={() => onTeamChange(t.id)}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      )}

      <div className="wd-modules">
        {MODULES.map(m => <button key={m.id} className={`wd-module-tab${activeModule===m.id?" active":""}`} onClick={() => setActiveModule(m.id)}>{m.label}</button>)}
      </div>
      {activeModule==="canvas"    && <ModuleCanvas participants={participants}/>}
      {activeModule==="problem"   && <ModuleProblemMatch participants={participants}/>}
      {activeModule==="friction"  && <ModuleFriction participants={participants}/>}
      {activeModule==="energy"    && <ModuleEnergyMap participants={participants}/>}
      {activeModule==="collab"    && <ModuleCollaboration participants={participants}/>}
      {activeModule==="blindspot" && <ModuleBlindSpots participants={participants}/>}
    </div>
  );
}
