import { useState, useEffect, useRef } from "react";

// ============================================================================
// CURIO · MINDPRINT(tm) PURPOSE COMPANION — prototype
// Flagship AI tool for tertiary WHY support (WHAT-HOW and HOW-WHAT profiles)
// Absorbs Library Tools 21 (Purpose Brief, as a guided interview), 22 (North
// Star), 24 (So-What Translator), 29 (Opening Lines).
//
// NEXT.JS PORT NOTES — identical architecture to precision_companion.jsx:
// swap llm() for a fetch to /api/companion with { tool:"purpose", mode,
// profile, messages }; move system prompts server-side composed with
// MindPrint_AI_Source_of_Truth.md; gate with account_licenses; persist to
// tool_sessions; delete the FontLoader effect. The Brief mode is
// conversational, so the route must pass the full messages array through.
// NOTE: the So-What Translator mode shares its translation spine with the
// planned Orientation Translator (Task 2); build them on one prompt module.
// ============================================================================

const BRAND = {
  navy: "#0F172A", emerald: "#059669", deep: "#065F46", teal: "#14B8A6",
  accent: "#6EE7B7", soft: "rgba(110,231,183,0.16)", accentText: "#065F46",
  ink: "#1E293B", rule: "#E2E8F0",
};

const PROFILES = {
  "WHY-WHAT": "HOW", "WHAT-WHY": "HOW",
  "WHY-HOW": "WHAT", "HOW-WHY": "WHAT",
  "WHAT-HOW": "WHY", "HOW-WHAT": "WHY",
};

const SYSTEM_BASE = `You are the MindPrint(tm) Purpose Companion, an AI tool by Curio (choosecurio.com). You generate the purpose-level thinking, framing, meaning, audience significance, that drains people whose tertiary orientation is WHY, so they can review and judge instead of producing it from a drained place.

Language rules, always: refer to cognitive orientations (WHY, WHAT, HOW), never personality, traits, or types. Say "energizing" and "draining", never strengths or weaknesses. Write profiles as PRIMARY-SECONDARY with a hyphen, for example WHAT-HOW. Never use em dashes, use commas instead. Never suggest tertiary work can become energizing, these tools reduce its cost. Be practical, tactical, and tight. Format with ## section headers, **bold** lead-ins, and lists. No preamble, no closing pleasantries.`;

const MODES = {
  brief: {
    tab: "Purpose Brief", chat: true,
    desc: "A guided ten-minute interview. The Companion asks the five questions one at a time, then writes your brief.",
    system: `Task: conduct the Five-Question Purpose Brief as an interview. Ask exactly these five questions, ONE AT A TIME, in this order: 1. Who is this for? (the actual person or group, not the org chart) 2. What changes if it succeeds? (the after-state in one sentence) 3. Why now? (what makes this the right moment, what it competes with) 4. What does success mean? (how everyone will know, without debate) 5. What happens if we do nothing? (the honest cost).
Rules: one question per message, with a single short line of guidance. Briefly acknowledge each answer (one clause), then ask the next. If an answer is vague, ask one sharpening follow-up, then move on. After the fifth answer, output the completed brief: ## Purpose Brief with the five questions as **bold** lines each followed by the refined answer in one or two plain sentences, then ## Where to post it, one line. Then stop.`,
  },
  northstar: {
    tab: "North Star", chat: false, verb: "Draft the page",
    desc: "Paste sponsor notes or interview raw material; get the one-page North Star.",
    fields: [
      { id: "notes", label: "Raw material", ph: "Paste sponsor notes, a vision extraction interview, kickoff notes, or an email thread that contains the intent.", rows: 9 },
    ],
    system: `Task: draft a North Star one-pager from the pasted raw material. Output: ## The change we're making (before and after, two sentences), ## Who it serves (named plainly), ## What success means (the observable result that ends debate), ## What we're not doing (the explicit exclusions, infer carefully and mark inferred ones with "(inferred, confirm)"), ## The one-line answer (the elevator sentence, worth memorizing). Use the source's own words where they are strong. If the material lacks a real purpose, say so plainly under ## A gap to escalate rather than inventing one.`,
  },
  sowhat: {
    tab: "So-What Translator", chat: false, verb: "Translate it",
    desc: "Convert detailed content into audience meaning: which means that, for this reader...",
    fields: [
      { id: "reader", label: "The reader", ph: "Title and current worry. e.g. COO, worried about integration costs ahead of the board meeting.", rows: 2 },
      { id: "content", label: "The content", ph: "Paste the sections, findings, or draft.", rows: 8 },
    ],
    system: `Task: run the So-What translation on the pasted content for the named reader. Output: ## The translations, each major section or finding as: **section name**, then "which means that " completed honestly for this reader in one line. Then ## The winner, the one completion that changes a decision this reader actually faces, and a suggested opening line built from it. Then ## The orphans, sections with no honest completion for this reader, candidates for the appendix. Never invent facts not present in the content.`,
  },
  openers: {
    tab: "Opening Lines", chat: false, verb: "Write the line",
    desc: "Paste any email or doc; get the one purpose sentence that should open it.",
    fields: [
      { id: "message", label: "Your message", ph: "Paste the email, update, or document opening.", rows: 7 },
    ],
    system: `Task: write the purpose line that should open the pasted message. Output ## Three options, each on the pattern of one of these forms: "This matters because...", "The decision this enables is...", "By the end of this you'll know...", "We're doing this so that...", "Nothing needed from you; this is so that...". Choose the three forms that best fit this message and complete each specifically from its content, one sentence each. Then ## Recommended, name which option and why in one line. If the message's own purpose is genuinely unclear, say what is missing in one line instead of guessing.`,
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

export default function PurposeCompanion() {
  const [profile, setProfile] = useState("WHAT-HOW");
  const [mode, setMode] = useState("brief");
  const [fields, setFields] = useState({});
  const [convo, setConvo] = useState([]);
  const [output, setOutput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);
  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [convo]);

  const m = MODES[mode];
  const tertiary = PROFILES[profile];
  const system = `${SYSTEM_BASE}\n\nThe user is a ${profile} profile. Their tertiary orientation is ${tertiary}. ${m.system}`;

  const switchMode = (k) => { setMode(k); setFields({}); setConvo([]); setOutput(""); setErr(""); setChatInput(""); };

  const send = async (userText, priorConvo) => {
    setBusy(true); setErr("");
    const msgs = [...priorConvo, { role: "user", content: userText }];
    setConvo(msgs);
    try {
      const text = await llm(msgs, system);
      setConvo([...msgs, { role: "assistant", content: text }]);
      if (!m.chat) setOutput(text);
      return text;
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    finally { setBusy(false); }
  };

  const startInterview = () => send("Begin the interview with question one.", []);
  const answer = () => { if (chatInput.trim() && !busy) { send(chatInput, convo); setChatInput(""); } };
  const run = () => {
    const body = m.fields.map((f) => fields[f.id] ? `${f.label}: ${fields[f.id]}` : null).filter(Boolean).join("\n\n");
    if (!body.trim()) { setErr("Fill in the fields above first."); return; }
    setOutput(""); send(body, []);
  };
  const refine = () => { if (chatInput.trim() && !busy) { send(chatInput, convo).then(() => {}); setChatInput(""); } };
  const copy = () => {
    const finalText = m.chat ? (convo.filter((c) => c.role === "assistant").slice(-1)[0] || {}).content || "" : output;
    navigator.clipboard.writeText(finalText); setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const visibleChat = convo.filter((c, i) => !(m.chat && i === 0)); // hide the kickoff instruction

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif", color: BRAND.ink }}>
      <div style={{ background: BRAND.navy }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: "#fff", lineHeight: 1 }}>
            Curio<span style={{ color: BRAND.teal }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#A7F3D0" }}>MindPrint&trade; AI Companion</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: "#fff" }}>Purpose Companion</div>
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
        <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", border: `1px solid ${BRAND.accent}`, color: BRAND.accentText }}>Supports Tertiary WHY</span>
        <span style={{ fontSize: 12.5 }}>
          {tertiary === "WHY"
            ? "Purpose framing drains your wiring. The Companion produces it; you judge it."
            : "Built for tertiary WHY profiles, but the framing modes work for anyone."}
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

        {/* Interview (chat) mode */}
        {m.chat ? (
          <div className="rounded-xl bg-white p-5" style={{ border: `1px solid ${BRAND.rule}` }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 26, color: BRAND.navy }}>{m.tab}</div>
            <p style={{ fontSize: 12.5, color: "#475569", marginTop: 2, marginBottom: 14 }}>{m.desc}</p>
            {convo.length === 0 ? (
              <button onClick={startInterview} disabled={busy}
                className="rounded-lg px-5 py-2.5 font-semibold text-white text-sm"
                style={{ background: busy ? "#94A3B8" : BRAND.deep }}>
                {busy ? "Working..." : "Start the interview"}
              </button>
            ) : (
              <div>
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {visibleChat.map((c, i) =>
                    c.role === "assistant" ? (
                      <div key={i} className="rounded-lg p-3" style={{ background: BRAND.soft, border: `1px solid ${BRAND.accent}` }}>
                        <MD text={c.content} />
                      </div>
                    ) : (
                      <div key={i} className="self-end rounded-lg px-3 py-2 max-w-md" style={{ background: BRAND.navy, color: "#fff", fontSize: 13 }}>
                        {c.content}
                      </div>
                    )
                  )}
                  <div ref={bottomRef} />
                </div>
                <div className="flex gap-2 mt-4">
                  <input value={chatInput} placeholder="Your answer..."
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && answer()}
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB" }} />
                  <button onClick={answer} disabled={busy}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: busy ? "#94A3B8" : BRAND.emerald }}>
                    {busy ? "..." : "Send"}
                  </button>
                  <button onClick={copy} className="rounded-lg px-3 py-2 text-xs font-semibold"
                    style={{ background: "#fff", border: `1px solid ${BRAND.rule}`, color: BRAND.deep }}>
                    {copied ? "Copied" : "Copy last"}
                  </button>
                </div>
              </div>
            )}
            {err && <p className="mt-3 text-sm" style={{ color: "#B91C1C" }}>{err}</p>}
          </div>
        ) : (
          <div>
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
                  <input value={chatInput} placeholder="Refine it: sharper, shorter, different reader..."
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && refine()}
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: `1px solid ${BRAND.rule}`, background: "#fff" }} />
                  <button onClick={refine} disabled={busy}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: busy ? "#94A3B8" : BRAND.emerald }}>
                    {busy ? "..." : "Refine"}
                  </button>
                </div>
                <p style={{ fontSize: 10.5, color: BRAND.accentText, marginTop: 10 }}>
                  AI output is a strong first pass, not a finished fact. For high-stakes framing, add a WHY-primary review.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-4" style={{ fontSize: 10, color: "#94A3B8" }}>
        MindPrint&trade; Tertiary Support Library · choosecurio.com
      </div>
    </div>
  );
}
