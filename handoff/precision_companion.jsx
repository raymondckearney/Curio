import { useState, useEffect } from "react";

// ============================================================================
// CURIO · MINDPRINT(tm) PRECISION COMPANION — prototype
// Flagship AI tool for tertiary HOW support (WHY-WHAT and WHAT-WHY profiles)
// Absorbs Library Tools 1 (Decompose), 2 (Checklist), 9 (Gap Review + Edge
// Cases), 7 (Definition of Done).
//
// NEXT.JS PORT NOTES
// 1. This file is a self-contained client component ("use client"). Drop into
//    app/tools/precision-companion/page.tsx.
// 2. Replace the body of llm() with: fetch("/api/companion", { method:"POST",
//    body: JSON.stringify({ tool:"precision", mode, profile, messages }) })
//    and move SYSTEM_BASE + MODES[*].system server-side into the route handler,
//    where they should be composed with MindPrint_AI_Source_of_Truth.md.
// 3. Gate the route with the existing license check (account_licenses) and
//    persist runs to tool_sessions. Raise max_tokens server-side (2000+ for
//    decompose). Fonts: already loaded globally on choosecurio.com; delete
//    the FontLoader effect.
// ============================================================================

const BRAND = {
  navy: "#0F172A", emerald: "#059669", deep: "#065F46", teal: "#14B8A6",
  accent: "#FCD34D", soft: "rgba(252,211,77,0.16)", accentText: "#92400E",
  ink: "#1E293B", rule: "#E2E8F0", slate: "#F1F5F9",
};

const PROFILES = {
  "WHY-WHAT": "HOW", "WHAT-WHY": "HOW",
  "WHY-HOW": "WHAT", "HOW-WHY": "WHAT",
  "WHAT-HOW": "WHY", "HOW-WHAT": "WHY",
};

const SYSTEM_BASE = `You are the MindPrint(tm) Precision Companion, an AI tool by Curio (choosecurio.com). You generate the detail-level thinking that drains people whose tertiary orientation is HOW, so they can review and judge instead of producing from a blank page.

Language rules, always: refer to cognitive orientations (WHY, WHAT, HOW), never personality, traits, or types. Say "energizing" and "draining", never strengths or weaknesses. Write profiles as PRIMARY-SECONDARY with a hyphen, for example WHY-WHAT. Never use em dashes, use commas instead. Never suggest tertiary work can become energizing, these tools reduce its cost. Be practical, tactical, and tight. Format with ## section headers, **bold** lead-ins, and lists. No preamble, no closing pleasantries, start directly with the output.`;

const MODES = {
  decompose: {
    tab: "Decompose", verb: "Generate breakdown",
    desc: "Turn a goal into milestones, workstreams, and next physical actions, with the invisible work included.",
    fields: [
      { id: "goal", label: "The goal", ph: "The outcome in one or two sentences. e.g. Launch the client portal to our first 10 enterprise accounts by end of Q3.", rows: 3 },
      { id: "context", label: "Context (optional)", ph: "Team, constraints, deadlines, what exists already.", rows: 3 },
    ],
    system: `Task: decompose the user's goal into a complete execution breakdown. Output exactly these sections: ## Milestones (3 to 5 demonstrable checkpoints, each with a relative timeframe), ## Workstreams (the threads of work under each milestone), ## Tasks (next physical actions per workstream, each starting with a verb and a suggested owner role in parentheses). Always include the invisible work: reviews, approvals, coordination, cleanup, communication. End with ## Check before you commit, three pointed completeness questions specific to this goal.`,
  },
  checklist: {
    tab: "Pre-Flight", verb: "Generate checklist",
    desc: "A completeness checklist for a deliverable, so nothing depends on remembering details.",
    fields: [
      { id: "deliverable", label: "The deliverable", ph: "What is shipping, to whom, and how. e.g. Quarterly business review deck emailed to the client exec team Thursday.", rows: 3 },
    ],
    system: `Task: produce a pre-flight completeness checklist for the described deliverable. Group items under ## headers (always include Content, Recipients, Logistics, plus one or two groups specific to this deliverable type). Every item as a checkbox line: - [ ] item. Mark the three most commonly missed items by bolding them. Close with ## Capture, one line reminding the user to add any near-miss to their permanent checklist.`,
  },
  gaps: {
    tab: "Gap Review", verb: "Find the gaps",
    desc: "Paste a draft or plan and get what is missing, ranked by consequence.",
    fields: [
      { id: "draft", label: "Your draft or plan", ph: "Paste the full text.", rows: 10 },
    ],
    system: `Task: review the pasted draft or plan and list ONLY what is missing or underdeveloped. Do not summarize or praise what is present. Output ## Gaps, ranked by consequence, each item as: **what is missing**, why it matters in one sentence, the fix in one line. Then ## Quick wins, anything fixable in under five minutes. Be specific to the pasted text, never generic.`,
  },
  edges: {
    tab: "Edge Cases", verb: "Test the boundaries",
    desc: "The boundary conditions and failure modes a HOW-primary would raise.",
    fields: [
      { id: "plan", label: "The plan", ph: "Paste or describe the plan, system, or process.", rows: 8 },
    ],
    system: `Task: generate the edge cases and failure modes for the described plan. Cover, where relevant: volume (doubling, halving, all at once), ownership after launch, behavior under time pressure, odd or malformed inputs, boundaries (first day, last day, handoffs), key-person absence, and rollback. Output ## Edge cases, each as: **What happens when [specific condition]?** followed by the likely failure in one sentence and a one-line mitigation. Rank by likelihood times damage. End with ## The three to fix first.`,
  },
  dod: {
    tab: "Definition of Done", verb: "Draft the definition",
    desc: "Checkable completion criteria, a confirmer, and the not-included line.",
    fields: [
      { id: "work", label: "The work", ph: "What is being produced and for whom.", rows: 3 },
      { id: "receiver", label: "The receiver (optional)", ph: "Who accepts it.", rows: 1 },
    ],
    system: `Task: draft a definition of done. Output: ## The deliverable (one plain sentence), ## The criteria (3 to 5 checkable facts as - [ ] items, no adjectives, each objectively verifiable), ## The confirmer (who should say done, with a note that it must not be the maker), ## Not included (2 to 4 explicit exclusions worth agreeing up front). Keep every criterion checkable, "reviewed by legal" is checkable, "high quality" is not.`,
  },
};

// --- API adapter (swap this one function for the Next.js route) -------------
async function llm(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Request failed");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

// --- tiny markdown renderer --------------------------------------------------
function inline(t, keyBase) {
  return t.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith("**") && seg.endsWith("**")
      ? <b key={keyBase + "-" + i} style={{ color: BRAND.deep, fontWeight: 600 }}>{seg.slice(2, -2)}</b>
      : <span key={keyBase + "-" + i}>{seg}</span>
  );
}
function MD({ text }) {
  const out = [];
  text.split("\n").forEach((line, i) => {
    const l = line.trim();
    if (!l) return;
    if (l.startsWith("## ")) out.push(
      <div key={i} className="flex items-center gap-2 mt-4 mb-2 first:mt-0">
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: BRAND.emerald }}>{l.slice(3)}</span>
        <span className="flex-1 h-px" style={{ background: BRAND.rule }} />
      </div>);
    else if (l.startsWith("- [ ]")) out.push(
      <div key={i} className="flex gap-2 items-start py-1">
        <span className="mt-0.5 inline-block w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0" style={{ borderColor: BRAND.emerald }} />
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.slice(5).trim(), i)}</span>
      </div>);
    else if (/^[-•]\s/.test(l)) out.push(
      <div key={i} className="flex gap-2 items-start py-0.5">
        <span style={{ color: BRAND.accentText, fontWeight: 700 }}>·</span>
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.replace(/^[-•]\s/, ""), i)}</span>
      </div>);
    else if (/^\d+\.\s/.test(l)) out.push(
      <div key={i} className="flex gap-2 items-baseline py-0.5">
        <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 17, color: BRAND.accentText, minWidth: 16 }}>{l.match(/^\d+/)[0]}</span>
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.replace(/^\d+\.\s/, ""), i)}</span>
      </div>);
    else out.push(<p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: "4px 0" }}>{inline(l, i)}</p>);
  });
  return <div>{out}</div>;
}

// --- component ----------------------------------------------------------------
export default function PrecisionCompanion() {
  const [profile, setProfile] = useState("WHY-WHAT");
  const [mode, setMode] = useState("decompose");
  const [fields, setFields] = useState({});
  const [convo, setConvo] = useState([]);   // per-run message history
  const [output, setOutput] = useState("");
  const [followup, setFollowup] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);

  const m = MODES[mode];
  const tertiary = PROFILES[profile];
  const system = `${SYSTEM_BASE}\n\nThe user is a ${profile} profile. Their tertiary orientation is ${tertiary}. ${m.system}`;

  const switchMode = (k) => { setMode(k); setFields({}); setConvo([]); setOutput(""); setErr(""); setFollowup(""); };

  const run = async () => {
    const body = m.fields.map((f) => fields[f.id] ? `${f.label}: ${fields[f.id]}` : null).filter(Boolean).join("\n\n");
    if (!body.trim()) { setErr("Fill in the fields above first."); return; }
    setBusy(true); setErr(""); setOutput("");
    const msgs = [{ role: "user", content: body }];
    try {
      const text = await llm(msgs, system);
      setConvo([...msgs, { role: "assistant", content: text }]);
      setOutput(text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const refine = async () => {
    if (!followup.trim()) return;
    setBusy(true); setErr("");
    const msgs = [...convo, { role: "user", content: followup }];
    try {
      const text = await llm(msgs, system);
      setConvo([...msgs, { role: "assistant", content: text }]);
      setOutput(text); setFollowup("");
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif", color: BRAND.ink }}>
      {/* Header */}
      <div style={{ background: BRAND.navy }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: "#fff", lineHeight: 1 }}>
            Curio<span style={{ color: BRAND.teal }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#A7F3D0" }}>MindPrint&trade; AI Companion</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: "#fff" }}>Precision Companion</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#94A3B8" }}>My profile</span>
          <select value={profile} onChange={(e) => setProfile(e.target.value)}
            className="rounded-md px-2 py-1.5 text-sm font-medium outline-none"
            style={{ background: "#1E293B", color: "#fff", border: "1px solid #334155" }}>
            {Object.keys(PROFILES).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Intro strip */}
      <div className="px-6 py-3 flex items-center gap-2 flex-wrap" style={{ background: BRAND.soft, borderBottom: `1px solid ${BRAND.accent}` }}>
        <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", background: BRAND.emerald, color: "#fff" }}>Replace</span>
        <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", border: `1px solid ${BRAND.accent}`, color: BRAND.accentText }}>Supports Tertiary HOW</span>
        <span style={{ fontSize: 12.5 }}>
          {tertiary === "HOW"
            ? "Detail work drains your wiring. The Companion produces it; you judge it."
            : "Built for tertiary HOW profiles, but the precision modes work for anyone."}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Mode tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} onClick={() => switchMode(k)}
              className="rounded-full px-4 py-1.5 transition-colors"
              style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                background: mode === k ? BRAND.navy : "#fff",
                color: mode === k ? "#fff" : BRAND.ink,
                border: `1px solid ${mode === k ? BRAND.navy : BRAND.rule}`,
              }}>{v.tab}</button>
          ))}
        </div>

        {/* Input card */}
        <div className="rounded-xl bg-white p-5" style={{ border: `1px solid ${BRAND.rule}` }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 26, color: BRAND.navy }}>{m.tab}</div>
          <p style={{ fontSize: 12.5, color: "#475569", marginTop: 2, marginBottom: 14 }}>{m.desc}</p>
          {m.fields.map((f) => (
            <div key={f.id} className="mb-3">
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, marginBottom: 4 }}>{f.label}</div>
              <textarea rows={f.rows} value={fields[f.id] || ""} placeholder={f.ph}
                onChange={(e) => setFields({ ...fields, [f.id]: e.target.value })}
                className="w-full rounded-lg p-3 text-sm outline-none resize-y"
                style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB", lineHeight: 1.5 }} />
            </div>
          ))}
          <button onClick={run} disabled={busy}
            className="rounded-lg px-5 py-2.5 font-semibold text-white text-sm"
            style={{ background: busy ? "#94A3B8" : BRAND.deep }}>
            {busy && !output ? "Working..." : m.verb}
          </button>
          {err && <p className="mt-3 text-sm" style={{ color: "#B91C1C" }}>{err}</p>}
        </div>

        {/* Output panel */}
        {output && (
          <div className="rounded-xl mt-5 p-5" style={{ background: BRAND.soft, border: `1px solid ${BRAND.accent}` }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: BRAND.navy }}>Your draft to judge</span>
              <button onClick={copy} className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ background: "#fff", border: `1px solid ${BRAND.rule}`, color: BRAND.deep }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <MD text={output} />
            <div className="flex gap-2 mt-4">
              <input value={followup} placeholder="Refine it: add, remove, push deeper..."
                onChange={(e) => setFollowup(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !busy && refine()}
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${BRAND.rule}`, background: "#fff" }} />
              <button onClick={refine} disabled={busy}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: busy ? "#94A3B8" : BRAND.emerald }}>
                {busy ? "..." : "Refine"}
              </button>
            </div>
            <p style={{ fontSize: 10.5, color: "#92400E", marginTop: 10 }}>
              AI output is a strong first pass, not a finished fact. Edit before it ships; for high-stakes work, add a HOW-primary review.
            </p>
          </div>
        )}
      </div>

      <div className="text-center py-4" style={{ fontSize: 10, color: "#94A3B8" }}>
        MindPrint&trade; Tertiary Support Library · choosecurio.com
      </div>
    </div>
  );
}
