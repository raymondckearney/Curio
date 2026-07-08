import { useState, useEffect } from "react";

// ============================================================================
// CURIO · MINDPRINT(tm) PROGRESS COMPANION — prototype
// Flagship AI tool for tertiary WHAT support (WHY-HOW and HOW-WHY profiles)
// Absorbs Library Tools 11 (Good-Enough Threshold), 15 (Milestone Backplan),
// 18 (Progress Broadcast), 12 (Closing Card).
//
// NEXT.JS PORT NOTES — identical architecture to precision_companion.jsx:
// swap llm() for a fetch to /api/companion with { tool:"progress", mode,
// profile, messages }; system prompts server-side composed with
// MindPrint_AI_Source_of_Truth.md; license gate; persist to tool_sessions;
// delete FontLoader.
// ============================================================================

const BRAND = {
  navy: "#0F172A", emerald: "#059669", deep: "#065F46", teal: "#14B8A6",
  accent: "#93C5FD", soft: "rgba(147,197,253,0.16)", accentText: "#1E40AF",
  ink: "#1E293B", rule: "#E2E8F0",
};

const PROFILES = {
  "WHY-WHAT": "HOW", "WHAT-WHY": "HOW",
  "WHY-HOW": "WHAT", "HOW-WHY": "WHAT",
  "WHAT-HOW": "WHY", "HOW-WHAT": "WHY",
};

const SYSTEM_BASE = `You are the MindPrint(tm) Progress Companion, an AI tool by Curio (choosecurio.com). You generate the progress-level thinking, shipping criteria, milestones, visible progress, that drains people whose tertiary orientation is WHAT, so they can review and judge instead of producing it from a drained place.

Language rules, always: refer to cognitive orientations (WHY, WHAT, HOW), never personality, traits, or types. Say "energizing" and "draining", never strengths or weaknesses. Write profiles as PRIMARY-SECONDARY with a hyphen, for example WHY-HOW. Never use em dashes, use commas instead. Never suggest tertiary work can become energizing, these tools reduce its cost. Be practical, tactical, and tight. Format with ## section headers, **bold** lead-ins, and lists. No preamble, no closing pleasantries.`;

const MODES = {
  threshold: {
    tab: "Good-Enough Threshold", verb: "Draft the threshold",
    desc: "Pre-commit the shipping criteria before the pull toward one more improvement arrives.",
    fields: [
      { id: "work", label: "The work", ph: "What is being produced and its current state.", rows: 3 },
      { id: "receiver", label: "The receiver", ph: "Who accepts it, and what they will actually use it for.", rows: 2 },
    ],
    system: `Task: draft a Good-Enough Threshold. Output: ## What must be true to ship (3 to 5 checkable criteria as - [ ] items, the floor, written from the receiver's real use, not the maker's standard), ## What "better" would add (the honest marginal value of another round, one or two lines), ## What "better" would cost (delay, invisibility, work not started), ## Suggested ship trigger (criteria met plus a date logic, propose one), ## Version-two parking lot (2 or 3 improvements that belong after real feedback). Be honest that the receiver's bar is usually lower than the maker's.`,
  },
  backplan: {
    tab: "Milestone Backplan", verb: "Build the backplan",
    desc: "From end state and date, backward, to a visible milestone chain with the first one close.",
    fields: [
      { id: "end", label: "The end state", ph: "The deliverable and its fixed date. e.g. Signed pilot agreement with two design partners by September 30.", rows: 2 },
      { id: "context", label: "What the work involves (optional)", ph: "The system view: components, dependencies, people.", rows: 4 },
    ],
    system: `Task: build a milestone backplan working backward from the end state. Today's date will be provided. Output: ## The chain, milestones listed from the end backward to now, each as: **date range**, the demonstrable checkpoint (something you could show, not explain), one line on what must be true to reach it. Space one checkpoint every 2 to 4 weeks. The first milestone from today must land within 10 days. Then ## Publish it, one line on where the chain should be visible. Keep it deliberately shallow, this is pace architecture, not a task plan.`,
  },
  broadcast: {
    tab: "Progress Broadcast", verb: "Write the broadcast",
    desc: "Raw notes in, the four-line weekly update out. Five minutes, no register management.",
    fields: [
      { id: "notes", label: "Raw notes from the week", ph: "Messy is fine: what you worked on, what happened, what is stuck. Bullet fragments welcome.", rows: 7 },
    ],
    system: `Task: convert the raw weekly notes into a Progress Broadcast. Output exactly four sections: ## Shipped (what demonstrably went out, if nothing shipped say so plainly with the strongest honest framing, e.g. deep in X, on track for date), ## Moving (active work and current state, one line each), ## Blocked (what is stuck and the specific ask, this is the highest-leverage line, never soften it into vagueness), ## Next (the one thing that moves first next week). Plain, factual, zero spin, one line per item. If the notes suggest three or more weeks without shipping, add ## A flag, one line suggesting the Good-Enough Threshold, honestly.`,
  },
  closing: {
    tab: "Closing Card", verb: "Extract the card",
    desc: "Paste meeting notes; get the card: one action, one owner, one date, one line of context.",
    fields: [
      { id: "meeting", label: "Meeting notes or transcript", ph: "Paste whatever you have from the conversation.", rows: 8 },
    ],
    system: `Task: extract the Closing Card from the pasted meeting notes. Output: ## The card, four bold lines: **One action** (the single next physical step, a step, not a theme), **One owner** (a name from the notes, "the team" is not a name; if no name is identifiable, write NEEDS A NAME), **One date** (from the notes, or propose one marked "(proposed)"), **One line of context** (why this step, so the card survives outside the room). If the notes contain several genuine commitments, add ## Also captured, each as a one-line action, owner, date row. If the meeting produced insight but no commitment, say so under ## Honest read and draft the most defensible candidate card.`,
  },
};

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

export default function ProgressCompanion() {
  const [profile, setProfile] = useState("WHY-HOW");
  const [mode, setMode] = useState("threshold");
  const [fields, setFields] = useState({});
  const [convo, setConvo] = useState([]);
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
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const system = `${SYSTEM_BASE}\n\nThe user is a ${profile} profile. Their tertiary orientation is ${tertiary}. Today's date is ${today}. ${m.system}`;

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
      <div style={{ background: BRAND.navy }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: "#fff", lineHeight: 1 }}>
            Curio<span style={{ color: BRAND.teal }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#A7F3D0" }}>MindPrint&trade; AI Companion</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: "#fff" }}>Progress Companion</div>
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

      <div className="px-6 py-3 flex items-center gap-2 flex-wrap" style={{ background: BRAND.soft, borderBottom: `1px solid ${BRAND.accent}` }}>
        <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", background: BRAND.emerald, color: "#fff" }}>Replace</span>
        <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", border: `1px solid ${BRAND.accent}`, color: BRAND.accentText }}>Supports Tertiary WHAT</span>
        <span style={{ fontSize: 12.5 }}>
          {tertiary === "WHAT"
            ? "Progress work drains your wiring. The Companion produces it; you judge it."
            : "Built for tertiary WHAT profiles, but the progress modes work for anyone."}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
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
              <input value={followup} placeholder="Refine it: tighter dates, different receiver, honest version..."
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
            <p style={{ fontSize: 10.5, color: BRAND.accentText, marginTop: 10 }}>
              AI output is a strong first pass, not a finished fact. The threshold and dates are yours to own; the Companion just made them cheap to draft.
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
