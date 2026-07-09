import { useState, useEffect } from "react";

// ============================================================================
// CURIO · MINDPRINT(tm) ORIENTATION TRANSLATOR — prototype
// Built on MindPrint_Language_Framework.md v1.0 (governing document for all
// register definitions and the translation method). Universal tool, all six
// profiles. Teal accent (Collection D, universal).
//
// NEXT.JS PORT NOTES — same architecture as the three Companions, ported to
// the repo's actual conventions: page at pages/portal/tools/orientation-
// translator.js, served by the same pages/api/portal/companion.js handler
// with { tool:"translator", ... }. Raw fetch convention, no SDK. System
// prompt server-side, composed from MindPrint_Language_Framework.md +
// MindPrint_AI_Source_of_Truth.md. License key: orientation_translator.
// The So-What Translator mode in the Purpose Companion shares this prompt
// module: one lib/translation-prompts.js, two products.
// ============================================================================

const BRAND = {
  navy: "#0F172A", emerald: "#059669", deep: "#065F46", teal: "#14B8A6",
  accent: "#14B8A6", soft: "rgba(20,184,166,0.12)", accentText: "#0F766E",
  ink: "#1E293B", rule: "#E2E8F0",
};

const PROFILES = ["WHY-WHAT", "WHY-HOW", "WHAT-WHY", "WHAT-HOW", "HOW-WHY", "HOW-WHAT"];
const TARGETS = ["WHY", "WHAT", "HOW", "All three"];

const SYSTEM = `You are the MindPrint(tm) Orientation Translator, an AI tool by Curio (choosecurio.com), governed by the MindPrint Language Framework. You translate a message from one cognitive orientation's register to another's, so people wired differently can hear each other.

The three registers:
WHY-speak: the point of a message is shared understanding of what matters. Context-first structure, the ask near the end. Purpose, vision, opportunity, the bigger picture, what if. Future tense and conditional mood, abstractions, analogies. Questions that reframe: is this the right problem, what are we really trying to achieve.
WHAT-speak: the point of a message is a decision, an action, or a status change. Conclusion-first, context compressed. Next steps, ship, owner, unblock, done, by Friday. Present tense, active voice, verbs dominate, names and dates at high density, bullets native. Questions that move: what's next, who owns this, can we decide today.
HOW-speak: the point of a message is that the picture is correct and complete. Sequential and layered, cases distinguished, caveats woven through. Specifically, exactly, depends, edge case, assuming, unless, verified. Qualifiers structural, numbers precise. Questions that test boundaries: what happens when X, what are we assuming, who maintains this.

The translation method, always in this order:
1. Extract the invariant content: facts, numbers, the ask, the deadline. These survive untouched. Never invent facts.
2. Reorder to the target structure (WHAT conclusion-first; WHY context-and-meaning-first, ask last; HOW sequence-and-cases, complete before concise).
3. Add what the target orientation needs that the source omitted (WHY: the purpose it serves; WHAT: action, owner, date; HOW: mechanism, caveats, boundaries). Any addition not derivable from the source must be marked (proposed) inline.
4. Shift the register: verb density for WHAT, abstraction and future mood for WHY, qualifiers and precision for HOW. Rewrite the subject line to the target's pattern if the message has one.

Language rules, always: cognitive orientations, never personality or types. Energizing and draining, never strengths or weaknesses. Profiles as PRIMARY-SECONDARY hyphenated caps. Never use em dashes, use commas. When characterizing the source text, use hypothesis language only: "reads WHY-forward", never "the author is a WHY-primary".

Output format:
If one target: ## Translation (the full translated message, ready to send), then ## What changed and why (3 to 5 one-line moves you made, each naming the framework step, plus one line: "Your draft reads X-forward" as a hypothesis). 
If all three targets: ## WHY-speak, ## WHAT-speak, ## HOW-speak (each a complete, ready-to-send version), then ## What changed and why (the key moves per version, one line each).
No preamble, no closing pleasantries. The translated message adopts the target register fully, that is the product.`;

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

export default function OrientationTranslator() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("WHAT");
  const [useProfile, setUseProfile] = useState(false);
  const [targetProfile, setTargetProfile] = useState("HOW-WHY");
  const [context, setContext] = useState("");
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

  const effectiveTarget = useProfile
    ? `${targetProfile.split("-")[0]} (the primary orientation of a ${targetProfile} profile)`
    : target;

  const run = async () => {
    if (!source.trim()) { setErr("Paste the message to translate first."); return; }
    setBusy(true); setErr(""); setOutput("");
    const body = `Translate this message.\n\nTarget: ${effectiveTarget}\n${context ? `Context: ${context}\n` : ""}\nSource message:\n${source}`;
    const msgs = [{ role: "user", content: body }];
    try {
      const text = await llm(msgs, SYSTEM);
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
      const text = await llm(msgs, SYSTEM);
      setConvo([...msgs, { role: "assistant", content: text }]);
      setOutput(text); setFollowup("");
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const chip = (active) => ({
    fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
    background: active ? BRAND.navy : "#fff",
    color: active ? "#fff" : BRAND.ink,
    border: `1px solid ${active ? BRAND.navy : BRAND.rule}`,
  });

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif", color: BRAND.ink }}>
      <div style={{ background: BRAND.navy }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: "#fff", lineHeight: 1 }}>
            Curio<span style={{ color: BRAND.teal }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#A7F3D0" }}>MindPrint&trade; Language Tools</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: "#fff" }}>Orientation Translator</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 flex items-center gap-2 flex-wrap" style={{ background: BRAND.soft, borderBottom: `1px solid ${BRAND.accent}` }}>
        <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", border: `1px solid ${BRAND.accent}`, color: BRAND.accentText }}>Universal · All Six Profiles</span>
        <span style={{ fontSize: 12.5 }}>Same facts, re-answered for the reader's signature question. People wired differently talk past each other; this closes the gap.</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-xl bg-white p-5" style={{ border: `1px solid ${BRAND.rule}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, marginBottom: 4 }}>Your message</div>
          <textarea rows={8} value={source} placeholder="Paste the email, update, or doc you're about to send."
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-lg p-3 text-sm outline-none resize-y"
            style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB", lineHeight: 1.5 }} />

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, margin: "12px 0 6px" }}>Translate for</div>
          <div className="flex gap-2 flex-wrap items-center">
            {TARGETS.map((t) => (
              <button key={t} onClick={() => { setTarget(t); setUseProfile(false); }}
                className="rounded-full px-4 py-1.5" style={chip(!useProfile && target === t)}>
                {t === "All three" ? t : `${t}-speak`}
              </button>
            ))}
            <span style={{ fontSize: 11, color: "#64748B" }}>or a person's profile:</span>
            <select value={useProfile ? targetProfile : ""}
              onChange={(e) => { if (e.target.value) { setTargetProfile(e.target.value); setUseProfile(true); } }}
              className="rounded-md px-2 py-1.5 text-sm font-medium outline-none"
              style={{ border: `1px solid ${useProfile ? BRAND.navy : BRAND.rule}`, background: useProfile ? BRAND.navy : "#fff", color: useProfile ? "#fff" : BRAND.ink }}>
              <option value="">choose...</option>
              {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, margin: "12px 0 4px" }}>Context (optional)</div>
          <input value={context} placeholder="Channel, relationship, stakes. e.g. Slack to my manager, deadline is at risk."
            onChange={(e) => setContext(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB" }} />

          <button onClick={run} disabled={busy}
            className="rounded-lg px-5 py-2.5 font-semibold text-white text-sm mt-4"
            style={{ background: busy ? "#94A3B8" : BRAND.deep }}>
            {busy && !output ? "Translating..." : "Translate"}
          </button>
          {err && <p className="mt-3 text-sm" style={{ color: "#B91C1C" }}>{err}</p>}
        </div>

        {output && (
          <div className="rounded-xl mt-5 p-5" style={{ background: BRAND.soft, border: `1px solid ${BRAND.accent}` }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: BRAND.navy }}>Ready to send, once you've judged it</span>
              <button onClick={copy} className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ background: "#fff", border: `1px solid ${BRAND.rule}`, color: BRAND.deep }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <MD text={output} />
            <div className="flex gap-2 mt-4">
              <input value={followup} placeholder="Refine: shorter, warmer, different channel, push the caveats down..."
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
              Anything marked (proposed) was added to serve the target register and was not in your original, confirm it before sending. Register reads are hypotheses, not diagnoses.
            </p>
          </div>
        )}
      </div>

      <div className="text-center py-4" style={{ fontSize: 10, color: "#94A3B8" }}>
        MindPrint&trade; Language Framework v1.0 · choosecurio.com
      </div>
    </div>
  );
}
