import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalSidebar from '../../../components/PortalSidebar';

const TYPES = [
  { id: "WHY-WHAT", label: "WHY – WHAT", tagline: "Purpose-driven, progress-oriented",   primary: "WHY",  secondary: "WHAT" },
  { id: "WHY-HOW",  label: "WHY – HOW",  tagline: "Purpose-driven, precision-oriented",  primary: "WHY",  secondary: "HOW"  },
  { id: "WHAT-WHY", label: "WHAT – WHY", tagline: "Progress-driven, purpose-oriented",   primary: "WHAT", secondary: "WHY"  },
  { id: "WHAT-HOW", label: "WHAT – HOW", tagline: "Progress-driven, precision-oriented", primary: "WHAT", secondary: "HOW"  },
  { id: "HOW-WHY",  label: "HOW – WHY",  tagline: "Precision-driven, purpose-oriented",  primary: "HOW",  secondary: "WHY"  },
  { id: "HOW-WHAT", label: "HOW – WHAT", tagline: "Precision-driven, progress-oriented", primary: "HOW",  secondary: "WHAT" },
];

const TYPE_DETAILS = {
  "WHY-WHAT": { strengths: ["Strategic vision and big-picture thinking","Identifying opportunities and gaps","Setting direction and goals","Pitching and narrative building","Questioning the status quo","High-level roadmap planning"], drains: ["Granular execution and task management","Following detailed processes","Documentation and administrative work","Repetitive or routine tasks","Working in the weeds for extended periods"] },
  "WHY-HOW":  { strengths: ["Systems thinking and framework design","Research synthesis and distilling insights","Diagnosing root causes","Writing thought leadership","Building comprehensive strategies","Connecting vision to execution detail"], drains: ["Fast-paced iteration without analysis","Rushing to launch before it feels right","Pure action without sufficient grounding","Communicating to WHAT-dominant audiences"] },
  "WHAT-WHY": { strengths: ["Building and maintaining momentum","Rallying teams around shared goals","Fast decision-making under ambiguity","Client-facing discovery and pitching","Running high-energy team sessions","Milestone-oriented project leadership"], drains: ["Detailed process design and documentation","Administrative and compliance work","Deep analytical research","Managing granular task execution","Precision-oriented work for extended periods"] },
  "WHAT-HOW": { strengths: ["Detailed project planning and management","Breaking initiatives into actionable steps","Building metrics and dashboards","Managing cross-functional execution","Running agile and iterative processes","Operationalizing workflows and processes"], drains: ["Open-ended visioning without clear milestones","Work lacking defined next steps","Pure strategy without implementation path","Extended ambiguity about direction or goals"] },
  "HOW-WHY":  { strengths: ["Deep analytical work and root cause analysis","Process auditing and redesign","Synthesizing complex data into insights","Testing and validating approaches rigorously","Spotting inefficiencies","Mentoring on methodology and best practices"], drains: ["Launching before full analysis is complete","High-velocity action-oriented environments","Communicating findings to non-technical audiences","Prioritizing when everything feels equally important"] },
  "HOW-WHAT": { strengths: ["Designing operational processes end-to-end","Building organizational structures and operating models","Creating SOPs, playbooks, and documentation","Implementing systems and managing change","Identifying and resolving bottlenecks","Managing multi-workstream complexity"], drains: ["Ambiguous open-ended creative work","Vision-setting without clear parameters","Work requiring frequent pivots without structure","Communication of 'why' to stakeholders"] },
};

function ScoreRing({ score }) {
  const r = 48, circ = 2 * Math.PI * r, pct = Math.round(score), dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#059669" : pct >= 60 ? "#34D399" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const label = pct >= 75 ? "Strong fit" : pct >= 60 ? "Good fit" : pct >= 40 ? "Partial fit" : pct >= 20 ? "Poor fit" : "Severe mismatch";
  const labelBg = pct >= 75 ? "rgba(5,150,105,0.08)" : pct >= 60 ? "rgba(52,211,153,0.08)" : pct >= 40 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
  const labelBorder = pct >= 75 ? "rgba(5,150,105,0.3)" : pct >= 60 ? "rgba(52,211,153,0.3)" : pct >= 40 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";
  return (
    <div className="score-ring-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E7E5E4" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
        <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="700" fill={color} fontFamily="Caveat, cursive">{pct}%</text>
        <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#A8A29E" fontFamily="DM Sans, sans-serif" letterSpacing="0.08em">MATCH</text>
      </svg>
      <span className="score-fit-label" style={{ color, background: labelBg, border: `1px solid ${labelBorder}` }}>{label}</span>
    </div>
  );
}

function BulletList({ items, muted }) {
  return (
    <div className="bullet-list">
      {(items || []).map((item, i) => (
        <div key={i} className="bullet-item">
          <span className={`bullet-dot${muted ? " bullet-dot--muted" : ""}`} />
          <span className="bullet-text">{item}</span>
        </div>
      ))}
    </div>
  );
}

const CACHE_VERSION = 'v1';
function normalizeRole(raw) { return raw.trim().toLowerCase().replace(/\s+/g, ' '); }
function getCacheKey(nr, typeId) { return `curio-fit-cache-${CACHE_VERSION}-${nr}-${typeId}`; }
function getSplitCacheKey(nr) { return `curio-fit-split-${CACHE_VERSION}-${nr}`; }

function FitAnalyzer({ me }) {
  const [selectedType, setSelectedType] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function callAPI(system, userContent, maxTokens, model = "claude-haiku-4-5-20251001") {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0, top_k: 1, system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: userContent }] }),
    });
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || data.error);
      return data.content?.[0]?.text || "";
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n"); buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;
        try { const evt = JSON.parse(payload); if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") text += evt.delta.text; } catch {}
      }
    }
    return text;
  }

  async function analyze() {
    if (!selectedType || !role.trim()) return;
    setLoading(true); setLoadingStep("Analyzing role demands..."); setError(""); setResult(null);
    let sessionId = null;
    fetch('/api/portal/sessions/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'role_analyzer', completed: false, metadata: { role: role.trim(), profileType: selectedType } }),
    }).then(r => r.ok ? r.json() : null).then(d => { if (d?.session_id) sessionId = d.session_id; }).catch(() => {});
    const normalizedRole = normalizeRole(role);
    const fullCacheKey = getCacheKey(normalizedRole, selectedType);
    const splitCacheKey = getSplitCacheKey(normalizedRole);
    try {
      const cached = localStorage.getItem(fullCacheKey);
      if (cached) { setResult(JSON.parse(cached)); setLoading(false); setLoadingStep(""); return; }
    } catch {}

    const type = TYPES.find(t => t.id === selectedType);
    const details = TYPE_DETAILS[selectedType];
    const tertiary = ["WHY","WHAT","HOW"].find(b => b !== type.primary && b !== type.secondary);

    const splitSystem = `You analyze job roles for the MindPrint Framework and estimate their absolute cognitive demand profile.\n\nThe MindPrint Framework defines three cognitive orientations:\n- WHY: The work of choosing direction and defining purpose.\n- WHAT: The work of execution and momentum.\n- HOW: The work of correctness and completeness.\n\nCALIBRATION:\n- CEO / Founder: WHY 40-50%\n- Brand/Creative/Strategy leads: WHY 35-50%\n- Product Manager: WHY 25-35%, WHAT 35-45%, HOW 20-30%\n- Program/Project Manager: WHY 5-15%, WHAT 40-50%, HOW 40-50%\n- Engineer / Analyst / QA: WHY <10%, HOW dominant (55-70%)\n- Sales / Recruiter / Account Manager: WHY <10%, WHAT dominant (55-70%)\n\nReturn ONLY valid JSON: { "why": <integer>, "what": <integer>, "how": <integer> }`;
    const qualSystem = `You are a deterministic analyst for the MindPrint Framework. Given a cognitive profile and a role's demand split, produce a role alignment analysis.\n\nRules: Every item must be specific to this exact role and profile. Ground every item in the demand split percentages. Recommendations must be actionable and role-specific.\n\nReturn ONLY valid JSON:\n{\n  "scoreRationale": "<exactly 2-3 sentences about fit>",\n  "enjoys": ["<role-specific>","<role-specific>","<role-specific>","<role-specific>"],\n  "excels": ["<role-specific>","<role-specific>","<role-specific>","<role-specific>"],\n  "dislikes": ["<role-specific>","<role-specific>","<role-specific>"],\n  "struggles": ["<role-specific>","<role-specific>","<role-specific>"],\n  "recommendations": [\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },\n    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" }\n  ],\n  "partnerTypes": [\n    { "type": "<WHY-WHAT|WHY-HOW|WHAT-WHY|WHAT-HOW|HOW-WHY|HOW-WHAT>", "reason": "<1 sentence>" },\n    { "type": "<one of the above>", "reason": "<1 sentence>" }\n  ]\n}`;

    function parseSplit(raw) {
      const m = raw.match(/\{[\s\S]*?\}/);
      if (!m) return null;
      try { const s = JSON.parse(m[0]); return typeof s.why === "number" && typeof s.what === "number" && typeof s.how === "number" ? s : null; } catch { return null; }
    }

    function parseQual(raw) {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return null;
      try { return JSON.parse(m[0]); } catch { return null; }
    }

    try {
      const rolePrompt = `Role: "${normalizedRole}"`;
      const splitRaws = await Promise.all([callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600), callAPI(splitSystem, rolePrompt, 600)]);
      const splits = splitRaws.map(parseSplit).filter(Boolean);
      if (!splits.length) throw new Error("Could not parse demand split");

      const avg = { why: splits.reduce((s, x) => s + x.why, 0) / splits.length, what: splits.reduce((s, x) => s + x.what, 0) / splits.length, how: splits.reduce((s, x) => s + x.how, 0) / splits.length };
      let demandSplit = { why: Math.round(avg.why), what: Math.round(avg.what), how: Math.round(avg.how) };
      const off = 100 - (demandSplit.why + demandSplit.what + demandSplit.how);
      if (off !== 0) { const largest = Object.entries(demandSplit).sort((a, b) => b[1] - a[1])[0][0]; demandSplit[largest] += off; }
      try { localStorage.setItem(splitCacheKey, JSON.stringify(demandSplit)); } catch {}

      const splitMap = { WHY: demandSplit.why, WHAT: demandSplit.what, HOW: demandSplit.how };
      const dp = splitMap[type.primary] || 0, ds = splitMap[type.secondary] || 0, dt = splitMap[tertiary] || 0;
      const rawScore = dp * 1.25 + ds * 0.9 + dt * (-1.0);
      const linear = Math.max(0, Math.min(1, (rawScore + 100) / 225));
      const score = Math.round(Math.pow(linear, 1.2) * 100);

      setLoadingStep("Analyzing profile alignment...");
      const qualUser = `Profile: ${type.label} (${type.tagline})\nPrimary orientation: ${type.primary} — energizing\nSecondary orientation: ${type.secondary} — comfortable\nTertiary orientation: ${tertiary} — draining\n\nWhat energizes this type: ${details.strengths.join(", ")}\nWhat drains this type: ${details.drains.join(", ")}\n\nRole: "${role.trim()}"\nDemand split: WHY ${demandSplit.why}%, WHAT ${demandSplit.what}%, HOW ${demandSplit.how}%\n\nFor this person: ${dp}% in ${type.primary} (energizing), ${ds}% in ${type.secondary} (neutral), ${dt}% in ${tertiary} (draining)`;

      const SONNET = "claude-sonnet-4-6";
      const qualRaws = await Promise.all([callAPI(qualSystem, qualUser, 2000, SONNET), callAPI(qualSystem, qualUser, 2000, SONNET), callAPI(qualSystem, qualUser, 2000, SONNET)]);
      const candidates = qualRaws.map(parseQual).filter(Boolean);
      if (!candidates.length) throw new Error("No analysis returned");

      function consensusScore(candidate, others) {
        const texts = [...(candidate.enjoys||[]),...(candidate.excels||[]),...(candidate.dislikes||[]),...(candidate.struggles||[]),...(candidate.recommendations||[]).map(r=>r.action||"")];
        let score = 0;
        for (const other of others) {
          const otherText = [...(other.enjoys||[]),...(other.excels||[]),...(other.dislikes||[]),...(other.struggles||[]),...(other.recommendations||[]).map(r=>r.action||"")].join(" ").toLowerCase();
          for (const t of texts) { const words = t.toLowerCase().split(/\s+/).filter(w=>w.length>4); if (words.filter(w=>otherText.includes(w)).length >= Math.max(1, Math.floor(words.length*0.5))) score++; }
        }
        return score;
      }

      const qual = candidates.length === 1 ? candidates[0] : candidates.map((c,i)=>({c,s:consensusScore(c,candidates.filter((_,j)=>j!==i))})).sort((a,b)=>b.s-a.s)[0].c;
      const fullResult = { ...qual, demandSplit, score, role: role.trim(), fitScore: score, summary: qual.scoreRationale || '' };
      setResult(fullResult);
      setSaved(false);
      fetch('/api/portal/sessions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'role_analyzer', completed: true, session_id: sessionId, result: { role: role.trim(), fitScore: score, summary: qual.scoreRationale || '' } }),
      }).catch(() => {});
      try { localStorage.setItem(fullCacheKey, JSON.stringify(fullResult)); } catch {}
      // Save to server
      fetch('/api/portal/fit-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: participantName.trim() || null,
          profile_type: selectedType,
          role: role.trim(),
          score,
          demand_split: demandSplit,
          result_payload: fullResult,
        }),
      }).then(r => r.ok && setSaved(true)).catch(() => {});
    } catch (e) {
      setError("Error: " + (e.message || "Something went wrong."));
    } finally {
      setLoading(false); setLoadingStep("");
    }
  }

  const type = TYPES.find(t => t.id === selectedType);

  return (
    <div className="page">
      <div className="page-label">Role Alignment Analyzer</div>
      <h1 className="page-title">How well does your role<br />fit the way you think?</h1>
      <p className="page-subtitle">Select a MindPrint profile, enter a role, and get a detailed alignment analysis.</p>
      <div className="page-rule" />

      <div className="step-block">
        <div className="step-label">Step One</div>
        <div className="step-title">Enter participant name (optional)</div>
        <input className="role-input" value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="e.g. Alex Smith" />
      </div>

      <div className="step-block">
        <div className="step-label">Step Two</div>
        <div className="step-title">Select the MindPrint profile</div>
        <div className="type-grid">
          {TYPES.map(t => (
            <button key={t.id} className={`type-btn${selectedType === t.id ? " active" : ""}`} onClick={() => setSelectedType(t.id)}>
              <div className="type-btn-combo">{t.label}</div>
              <div className="type-btn-name">{t.tagline}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="step-block">
        <div className="step-label">Step Three</div>
        <div className="step-title">Enter the role to analyze</div>
        <input className="role-input" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => { if (e.key === "Enter") analyze(); }} placeholder="e.g. Senior Product Manager, VP of Sales…" />
      </div>

      <button className="analyze-btn" onClick={analyze} disabled={!selectedType || !role.trim() || loading}>
        {loading ? (loadingStep || "Analyzing alignment...") : "Analyze role alignment"}
      </button>

      {error && <div className="error-box" style={{ marginTop: 24 }}>{error}</div>}

      {result && (
        <div ref={resultRef}>
          <div className="results-rule" />
          <div className="score-header">
            <div className="score-meta">
              <div className="score-type-label">{type?.label} &middot; {type?.tagline}</div>
              {participantName && <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', fontWeight: 700, color: '#1C1917', marginBottom: 8, lineHeight: 1.1 }}>{participantName}</div>}
              <div className="score-role">{role}</div>
              <div className="score-rationale">{result.scoreRationale}</div>
            </div>
            <ScoreRing score={result.score} />
          </div>

          <div className="result-grid-2">
            <div className="result-card result-card--accent"><div className="result-card-label">Likely enjoys</div><BulletList items={result.enjoys} /></div>
            <div className="result-card result-card--accent"><div className="result-card-label">Likely excels at</div><BulletList items={result.excels} /></div>
          </div>
          <div className="result-grid-2">
            <div className="result-card"><div className="result-card-label">Likely dislikes</div><BulletList items={result.dislikes} muted /></div>
            <div className="result-card"><div className="result-card-label">May struggle with</div><BulletList items={result.struggles} muted /></div>
          </div>
          <div className="result-card result-card--full" style={{ marginBottom: 16 }}>
            <div className="result-card-label">Recommendations</div>
            {(result.recommendations || []).map((rec, i) => (
              <div key={i} className="rec-card">
                <div className="rec-category">{rec.category}</div>
                <div className="rec-action">{rec.action}</div>
                <div className="rec-rationale">{rec.rationale}</div>
              </div>
            ))}
          </div>

          {result.partnerTypes?.length > 0 && (
            <div className="result-card result-card--full" style={{ marginBottom: 0 }}>
              <div className="result-card-label">Ideal collaborators for this role</div>
              <div className="partner-grid">
                {result.partnerTypes.map((p, i) => {
                  const pt = TYPES.find(t => t.id === p.type);
                  return (
                    <div key={i} className="partner-card">
                      <div className="partner-combo">{p.type}</div>
                      {pt && <div className="partner-tagline">{pt.tagline}</div>}
                      <div className="partner-reason">{p.reason}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="action-row">
            {saved && <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 500 }}>✓ Saved to your history</span>}
            <button className="reset-btn" style={{ marginTop: 0 }} onClick={() => { setResult(null); setRole(""); setSelectedType(""); setParticipantName(""); setSaved(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              ← Analyze a different role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalFitPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [licensed, setLicensed] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [isIndividual, setIsIndividual] = useState(false);

  useEffect(() => {
    fetch('/api/portal/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setMe(data);
        fetch('/api/portal/dashboard')
          .then(r => r.ok ? r.json() : null)
          .then(dash => {
            const has = (dash?.licenses || []).some(l => l.type === 'role_analyzer' && (!l.expires_at || new Date(l.expires_at) > new Date()));
            setLicensed(has);
            setLicenses(dash?.licenses || []);
            setIsIndividual(!!dash?.myAssessment);
          });
      })
      .catch(() => router.replace('/portal/login'));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  if (!me || licensed === null) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#94A3B8' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Head>
        <title>Role Fit Analyzer — {me.account.name} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{fitCss}</style>
      </Head>
      <PortalSidebar me={me} onLogout={logout} active="fit" licenses={licenses} isIndividual={isIndividual} />
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        {!licensed ? (
          <div style={{ maxWidth: 820, margin: '80px auto', padding: '0 24px' }}>
            <div style={{ background: '#FAFAF9', border: '1px solid #E7E5E4', borderLeft: '3px solid #059669', borderRadius: 8, padding: '40px 48px', maxWidth: 520 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>Role Fit Analyzer not included</div>
              <p style={{ fontSize: '0.95rem', color: '#78716C', lineHeight: 1.75 }}>Your account doesn't have access to the Role Fit Analyzer. Contact your Curio account manager to upgrade.</p>
            </div>
          </div>
        ) : (
          <FitAnalyzer me={me} />
        )}
      </main>
    </div>
  );
}

const fitCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; -webkit-font-smoothing: antialiased; }
  body { background: #fff; color: #1C1917; font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.6; }
  .nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); border-bottom: 1px solid #E7E5E4; padding: 0 clamp(24px,5vw,72px); height: 64px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-family: 'Caveat', cursive; font-size: 1.5rem; font-weight: 700; color: #1C1917; text-decoration: none; }
  .nav-logo span { color: #059669; }
  .nav-back { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #78716C; text-decoration: none; }
  .nav-back:hover { color: #059669; }
  .page { max-width: 820px; margin: 0 auto; padding: 56px clamp(24px,5vw,72px) 100px; }
  .page-label { display: inline-flex; align-items: center; gap: 12px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.17em; text-transform: uppercase; color: #059669; margin-bottom: 20px; }
  .page-label::before { content: ''; display: block; width: 36px; height: 1px; background: #059669; flex-shrink: 0; }
  .page-title { font-family: 'Caveat', cursive; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: #1C1917; line-height: 1.12; margin-bottom: 16px; }
  .page-subtitle { font-size: 1rem; color: #78716C; max-width: 560px; line-height: 1.75; margin-bottom: 48px; }
  .page-rule { width: 100%; height: 1px; background: #E7E5E4; margin-bottom: 48px; }
  .step-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #059669; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .step-label::before { content: ''; display: block; width: 20px; height: 1px; background: #059669; }
  .step-title { font-family: 'Caveat', cursive; font-size: 1.4rem; font-weight: 700; color: #1C1917; margin-bottom: 24px; }
  .step-block { margin-bottom: 48px; }
  .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .type-btn { background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 6px; padding: 16px 14px; cursor: pointer; text-align: left; transition: all 0.18s ease; font-family: 'DM Sans', sans-serif; }
  .type-btn:hover { background: rgba(5,150,105,0.05); border-color: rgba(5,150,105,0.35); }
  .type-btn.active { background: rgba(5,150,105,0.08); border-color: #059669; }
  .type-btn-combo { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; color: #059669; margin-bottom: 4px; }
  .type-btn-name { font-size: 0.85rem; font-style: italic; color: #78716C; line-height: 1.3; }
  .role-input { width: 100%; padding: 16px 20px; background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 6px; color: #1C1917; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; transition: border-color 0.18s; outline: none; }
  .role-input:focus { border-color: #059669; }
  .analyze-btn { width: 100%; padding: 18px 32px; background: #059669; border: none; border-radius: 6px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.18s ease; }
  .analyze-btn:hover:not(:disabled) { background: #047857; }
  .analyze-btn:disabled { background: #E7E5E4; color: #A8A29E; cursor: not-allowed; }
  .error-box { background: rgba(244,63,94,0.05); border: 1px solid rgba(244,63,94,0.2); border-radius: 6px; padding: 16px 20px; color: #be123c; font-size: 0.9rem; }
  .results-rule { width: 100%; height: 1px; background: #E7E5E4; margin: 56px 0 48px; }
  .score-header { display: flex; gap: 40px; align-items: flex-start; margin-bottom: 48px; }
  .score-meta { flex: 1; }
  .score-type-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.17em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
  .score-role { font-family: 'Caveat', cursive; font-size: clamp(1.6rem, 2.5vw, 2.2rem); font-weight: 700; color: #1C1917; margin-bottom: 16px; line-height: 1.2; }
  .score-rationale { font-size: 0.95rem; color: #57534E; line-height: 1.8; }
  .score-ring-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }
  .score-fit-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; }
  .result-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .result-card { background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 6px; padding: 28px; }
  .result-card--accent { border-left: 2px solid #059669; }
  .result-card--full { grid-column: 1 / -1; }
  .result-card-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #059669; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .result-card-label::before { content: ''; display: block; width: 16px; height: 1px; background: #059669; }
  .bullet-list { display: flex; flex-direction: column; gap: 10px; }
  .bullet-item { display: flex; gap: 12px; align-items: flex-start; }
  .bullet-dot { width: 4px; height: 4px; border-radius: 50%; background: #059669; margin-top: 8px; flex-shrink: 0; }
  .bullet-dot--muted { background: #A8A29E; }
  .bullet-text { font-size: 0.9rem; color: #57534E; line-height: 1.7; }
  .rec-card { padding: 20px 0; border-bottom: 1px solid #E7E5E4; }
  .rec-card:last-child { border-bottom: none; padding-bottom: 0; }
  .rec-category { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #059669; margin-bottom: 6px; }
  .rec-action { font-family: 'Caveat', cursive; font-size: 1.15rem; color: #1C1917; margin-bottom: 6px; line-height: 1.4; }
  .rec-rationale { font-size: 0.875rem; color: #78716C; line-height: 1.7; }
  .partner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .partner-card { background: #fff; border: 1px solid #E7E5E4; border-radius: 6px; padding: 18px 20px; }
  .partner-combo { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; color: #059669; margin-bottom: 4px; }
  .partner-tagline { font-style: italic; font-size: 0.9rem; color: #57534E; margin-bottom: 10px; }
  .partner-reason { font-size: 0.85rem; color: #78716C; line-height: 1.65; }
  .reset-btn { width: 100%; padding: 16px 24px; margin-top: 32px; background: transparent; border: 1px solid #E7E5E4; border-radius: 6px; color: #A8A29E; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer; }
  .reset-btn:hover { border-color: #A8A29E; color: #1C1917; }
  .action-row { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
  @media (max-width: 600px) { .type-grid { grid-template-columns: 1fr 1fr; } .result-grid-2 { grid-template-columns: 1fr; } .partner-grid { grid-template-columns: 1fr; } .score-header { flex-direction: column-reverse; align-items: flex-start; gap: 24px; } }
`;
