import { useState, useEffect } from "react";

// ============================================================================
// CURIO · MINDPRINT(tm) LANGUAGE TOOLS — Translator + Profile Detector
// One tool, two modes behind a toggle, ONE shared foundation.
//
// PROPAGATION ARCHITECTURE (the point of this file):
// Everything both modes know about the three registers lives in the single
// FRAMEWORK constant below, sourced from MindPrint_Language_Framework.md.
// Both system prompts compose from it. On the platform this becomes
// lib/language-framework.js, imported by the translator prompt, the detector
// prompt, the Purpose Companion's So-What mode, and the public Mirror.
// Edit the framework once, every tool updates.
//
// NEXT.JS PORT NOTES:
// - This file REPLACES orientation_translator.jsx (it contains the translator
//   plus the new Detect mode). Page: pages/portal/tools/orientation-translator.js
// - Same handler pages/api/portal/companion.js; tool:"translator" and
//   tool:"detector" both gate on the existing orientation_translator license.
// - New table detection_feedback: { id, user_id, text_hash, own_writing bool,
//   hypothesis_primary, hypothesis_alt, actual_profile nullable, sample_text
//   nullable (ONLY when own_writing or permission confirmed), created_at }.
//   This is the validation corpus for Framework §8.
// - Detector is BETA: keep the beta chip and hypothesis framing until the
//   corpus supports measured accuracy claims. No hiring-screening use; the
//   system prompt enforces it and the UI states it.
// ============================================================================

const BRAND = {
  navy: "#0F172A", emerald: "#059669", deep: "#065F46", teal: "#14B8A6",
  accent: "#14B8A6", soft: "rgba(20,184,166,0.12)", accentText: "#0F766E",
  ink: "#1E293B", rule: "#E2E8F0",
};

const PROFILES = ["WHY-WHAT", "WHY-HOW", "WHAT-WHY", "WHAT-HOW", "HOW-WHY", "HOW-WHAT"];
const TARGETS = ["WHY", "WHAT", "HOW", "All three"];

// ---- THE SHARED FOUNDATION (lib/language-framework.js on the platform) -----
const FRAMEWORK = `The three registers (MindPrint Language Framework v1.0):
WHY-speak: the point of a message is shared understanding of what matters. Context-first structure, the ask near the end. Purpose, vision, opportunity, the bigger picture, "what if". Future tense and conditional mood, abstractions, analogies. Questions that reframe: "is this the right problem", "what are we really trying to achieve". Thematic subject lines.
WHAT-speak: the point of a message is a decision, an action, or a status change. Conclusion-first, context compressed. Next steps, ship, owner, unblock, done, "by Friday". Present tense, active voice, verbs dominate, names and dates at high density, bullets native. Questions that move: "what's next", "who owns this", "can we decide today". Verb or status subject lines.
HOW-speak: the point of a message is that the picture is correct and complete. Sequential and layered, cases distinguished, caveats woven through. Specifically, exactly, depends, edge case, assuming, unless, verified. Qualifiers structural, numbers precise. Questions that test boundaries: "what happens when X", "what are we assuming", "who maintains this". Specific subject lines.

The absence principle: people spend the fewest words on what drains them; the orientation whose markers are conspicuously missing is as diagnostic as those present.

Profile signatures (presence of two, conspicuous absence of the third):
WHY-WHAT: vision framing plus next steps/owners/dates; absent: edge cases, caveats, qualifiers.
WHY-HOW: vision framing plus mechanism/system detail; absent: dates, owners, urgency, shipping language.
WHAT-WHY: action/milestones plus purpose gestures; absent: task-level detail, completeness checks.
WHAT-HOW: action/milestones plus detail/metrics; absent: purpose framing, audience meaning.
HOW-WHY: systematic detail plus purpose/patterns; absent: deadlines, decision pressure, progress claims.
HOW-WHAT: systematic detail plus process/structure/efficiency; absent: vision language, reframing.

Reading rule: score all three orientations independently; the LOWEST-scoring orientation is the tertiary hypothesis, constraining the profile to two candidates; the stronger of the remaining two is the primary hypothesis.

Language rules, always: cognitive orientations, never personality or types. Energizing and draining, never strengths or weaknesses. Profiles as PRIMARY-SECONDARY hyphenated caps. Never use em dashes, use commas. Hypothesis language only for any read of text: "reads WHAT-forward", never "the author is a WHAT-primary".`;

const TRANSLATE_SYSTEM = `You are the MindPrint(tm) Orientation Translator, an AI tool by Curio (choosecurio.com), governed by the MindPrint Language Framework.

${FRAMEWORK}

The translation method, always in this order:
1. Extract the invariant content: facts, numbers, the ask, the deadline. These survive untouched. Never invent facts.
2. Reorder to the target structure (WHAT conclusion-first; WHY context-and-meaning-first, ask last; HOW sequence-and-cases, complete before concise).
3. Add what the target orientation needs that the source omitted (WHY: the purpose it serves; WHAT: action, owner, date; HOW: mechanism, caveats, boundaries). Any addition not derivable from the source must be marked (proposed) inline.
4. Shift the register. Rewrite the subject line to the target's pattern if the message has one.

Output format:
If one target: ## Translation (ready to send), then ## What changed and why (3 to 5 one-line moves, plus one line: "Your draft reads X-forward" as a hypothesis).
If all three: ## WHY-speak, ## WHAT-speak, ## HOW-speak, then ## What changed and why (key moves per version).
No preamble, no closing pleasantries. The translated message adopts the target register fully.`;

const DETECT_SYSTEM = `You are the MindPrint(tm) Profile Detector (beta), an AI tool by Curio (choosecurio.com), governed by the MindPrint Language Framework. You read writing samples and offer a HYPOTHESIS about the writer's MindPrint profile.

${FRAMEWORK}

Detection method:
1. Score each orientation's presence independently as strong, moderate, or faint, with short quoted fragments from the sample as evidence at the four levels (vocabulary, structure, questions, frame). Never invent quotes.
2. Name the conspicuous absence: the faintest orientation is the tertiary hypothesis.
3. The tertiary constrains the profile to two candidates; the stronger of the remaining two orientations is the primary hypothesis. Present BOTH candidates: the leading hypothesis and the alternative, and say what additional writing would distinguish them.
4. Weigh confounds honestly: genre (a status update forces WHAT structure), role (professions install registers), audience adaptation, and sample volume (a single message is weak evidence). If a stated genre or role explains a signal, discount that signal and say so.

Hard rules:
- Hypothesis language ONLY, everywhere: "most consistent with", "reads", "suggests". NEVER assign a profile as fact. This is a beta hypothesis engine; its accuracy is not yet measured, and you say so plainly in the confidence section.
- If the user indicates the analysis is for evaluating a job candidate, screening applicants, or any employment decision, do not perform the analysis; explain that the detector is a coaching and communication tool, not validated for selection decisions, and stop.
- Never characterize third parties mentioned within the text; read the writer only.

Output format:
## The read (2-3 sentences: leading profile hypothesis and the alternative)
## Orientation signals (WHY, WHAT, HOW: each with strength and quoted evidence)
## The conspicuous absence (the tertiary hypothesis and what is missing)
## Profile hypothesis (leading candidate, alternative, and what would distinguish them)
## Confidence and confounds (sample volume, genre, role; honest and brief; note the beta status in one line)
No preamble, no closing pleasantries.`;

// -----------------------------------------------------------------------------
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
    else out.push(<p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: "4px 0" }}>{inline(l, i)}</p>);
  });
  return <div>{out}</div>;
}

export default function LanguageTools() {
  const [tool, setTool] = useState("translate"); // "translate" | "detect"

  // translator state
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("WHAT");
  const [useProfile, setUseProfile] = useState(false);
  const [targetProfile, setTargetProfile] = useState("HOW-WHY");
  const [context, setContext] = useState("");

  // detector state
  const [samples, setSamples] = useState("");
  const [dContext, setDContext] = useState("");
  const [ownWriting, setOwnWriting] = useState("mine"); // "mine" | "other"
  const [actualProfile, setActualProfile] = useState("");
  const [fbSent, setFbSent] = useState(false);

  // shared
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

  const switchTool = (t) => { setTool(t); setConvo([]); setOutput(""); setErr(""); setFollowup(""); setFbSent(false); setActualProfile(""); };

  const runTranslate = async () => {
    if (!source.trim()) { setErr("Paste the message to translate first."); return; }
    setBusy(true); setErr(""); setOutput("");
    const effectiveTarget = useProfile ? `${targetProfile.split("-")[0]} (the primary orientation of a ${targetProfile} profile)` : target;
    const body = `Translate this message.\n\nTarget: ${effectiveTarget}\n${context ? `Context: ${context}\n` : ""}\nSource message:\n${source}`;
    const msgs = [{ role: "user", content: body }];
    try {
      const text = await llm(msgs, TRANSLATE_SYSTEM);
      setConvo([...msgs, { role: "assistant", content: text }]); setOutput(text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const runDetect = async () => {
    if (!samples.trim() || samples.trim().length < 200) { setErr("Paste at least a few paragraphs. One short message is weak evidence; two or three samples from the same writer read far better."); return; }
    setBusy(true); setErr(""); setOutput(""); setFbSent(false);
    const body = `Read these writing sample(s) from one writer and offer a profile hypothesis.\n\nWriter: ${ownWriting === "mine" ? "the samples are my own writing" : "the samples are from someone I work with (coaching context)"}\n${dContext ? `Context (genre, role, audience): ${dContext}\n` : ""}\nSamples:\n${samples}`;
    const msgs = [{ role: "user", content: body }];
    try {
      const text = await llm(msgs, DETECT_SYSTEM);
      setConvo([...msgs, { role: "assistant", content: text }]); setOutput(text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const refine = async () => {
    if (!followup.trim()) return;
    setBusy(true); setErr("");
    const msgs = [...convo, { role: "user", content: followup }];
    try {
      const text = await llm(msgs, tool === "translate" ? TRANSLATE_SYSTEM : DETECT_SYSTEM);
      setConvo([...msgs, { role: "assistant", content: text }]); setOutput(text); setFollowup("");
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const sendFeedback = () => {
    // PORT NOTE: POST { text_hash, own_writing, hypothesis (parsed or raw), actual_profile } to detection_feedback.
    // Store sample_text only when own_writing === "mine" (or explicit permission flag added later).
    setFbSent(true);
  };

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
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: "#fff" }}>
              {tool === "translate" ? "Orientation Translator" : "Profile Detector"}
            </div>
          </div>
        </div>
        {/* THE TOGGLE */}
        <div className="flex rounded-full p-1" style={{ background: "#1E293B" }}>
          {[["translate", "Translate"], ["detect", "Detect"]].map(([k, label]) => (
            <button key={k} onClick={() => switchTool(k)}
              className="rounded-full px-4 py-1.5"
              style={{ fontSize: 11, fontWeight: 600, background: tool === k ? BRAND.teal : "transparent", color: tool === k ? BRAND.navy : "#CBD5E1" }}>
              {label}{k === "detect" ? " · beta" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 flex items-center gap-2 flex-wrap" style={{ background: BRAND.soft, borderBottom: `1px solid ${BRAND.accent}` }}>
        {tool === "detect" && <span className="rounded-full px-3 py-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", background: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E" }}>Beta · Hypothesis Engine</span>}
        <span style={{ fontSize: 12.5 }}>
          {tool === "translate"
            ? "Same facts, re-answered for the reader's signature question. People wired differently talk past each other; this closes the gap."
            : "Writing carries a signature: two orientations spent, one quietly skipped. The Detector reads it and offers a hypothesis. Your confirmations are what teach it."}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-xl bg-white p-5" style={{ border: `1px solid ${BRAND.rule}` }}>
          {tool === "translate" ? (
            <div>
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
              <input value={context} placeholder="Channel, relationship, stakes."
                onChange={(e) => setContext(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB" }} />
              <button onClick={runTranslate} disabled={busy}
                className="rounded-lg px-5 py-2.5 font-semibold text-white text-sm mt-4"
                style={{ background: busy ? "#94A3B8" : BRAND.deep }}>
                {busy && !output ? "Translating..." : "Translate"}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, marginBottom: 4 }}>Writing samples (one writer)</div>
              <textarea rows={9} value={samples}
                placeholder={"Paste two or three samples from the same writer, separated by a blank line. Emails, updates, doc sections. More samples and mixed genres read far better than one message."}
                onChange={(e) => setSamples(e.target.value)}
                className="w-full rounded-lg p-3 text-sm outline-none resize-y"
                style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB", lineHeight: 1.5 }} />
              <div className="flex gap-2 mt-3 items-center flex-wrap">
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald }}>Whose writing</span>
                <button onClick={() => setOwnWriting("mine")} className="rounded-full px-4 py-1.5" style={chip(ownWriting === "mine")}>My own</button>
                <button onClick={() => setOwnWriting("other")} className="rounded-full px-4 py-1.5" style={chip(ownWriting === "other")}>Someone I work with</button>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, margin: "12px 0 4px" }}>Context (recommended)</div>
              <input value={dContext} placeholder="Genre, role, audience. e.g. weekly status updates from an engineering manager to leadership."
                onChange={(e) => setDContext(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB" }} />
              <button onClick={runDetect} disabled={busy}
                className="rounded-lg px-5 py-2.5 font-semibold text-white text-sm mt-4"
                style={{ background: busy ? "#94A3B8" : BRAND.deep }}>
                {busy && !output ? "Reading..." : "Offer a hypothesis"}
              </button>
              <p style={{ fontSize: 10.5, color: "#64748B", marginTop: 10 }}>
                A coaching and communication tool. Not for hiring, screening, or evaluation decisions, and it will decline those uses.
              </p>
            </div>
          )}
          {err && <p className="mt-3 text-sm" style={{ color: "#B91C1C" }}>{err}</p>}
        </div>

        {output && (
          <div className="rounded-xl mt-5 p-5" style={{ background: BRAND.soft, border: `1px solid ${BRAND.accent}` }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: BRAND.navy }}>
                {tool === "translate" ? "Ready to send, once you've judged it" : "The hypothesis"}
              </span>
              <button onClick={copy} className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ background: "#fff", border: `1px solid ${BRAND.rule}`, color: BRAND.deep }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <MD text={output} />

            {tool === "detect" && (
              <div className="rounded-lg mt-4 p-4" style={{ background: "#fff", border: `1px solid ${BRAND.rule}` }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 18, color: BRAND.navy }}>Know the writer's actual profile?</div>
                <p style={{ fontSize: 11, color: "#475569", margin: "3px 0 8px" }}>Every confirmation or correction is what turns this beta into a validated tool.</p>
                {fbSent ? (
                  <p style={{ fontSize: 12, fontWeight: 600, color: BRAND.deep }}>Recorded, thank you. This is exactly the data that improves the Detector.</p>
                ) : (
                  <div className="flex gap-2 items-center flex-wrap">
                    <select value={actualProfile} onChange={(e) => setActualProfile(e.target.value)}
                      className="rounded-md px-2 py-1.5 text-sm font-medium outline-none"
                      style={{ border: `1px solid ${BRAND.rule}` }}>
                      <option value="">actual profile...</option>
                      {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={sendFeedback} disabled={!actualProfile}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                      style={{ background: actualProfile ? BRAND.emerald : "#94A3B8" }}>
                      Submit
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <input value={followup} placeholder={tool === "translate" ? "Refine: shorter, warmer, different channel..." : "Push back: here's more context, re-read with this in mind..."}
                onChange={(e) => setFollowup(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !busy && refine()}
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${BRAND.rule}`, background: "#fff" }} />
              <button onClick={refine} disabled={busy}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: busy ? "#94A3B8" : BRAND.emerald }}>
                {busy ? "..." : tool === "translate" ? "Refine" : "Re-read"}
              </button>
            </div>
            <p style={{ fontSize: 10.5, color: BRAND.accentText, marginTop: 10 }}>
              {tool === "translate"
                ? "Anything marked (proposed) was not in your original, confirm it before sending. Register reads are hypotheses, not diagnoses."
                : "A hypothesis from writing, not a diagnosis of a person. Role, audience, and genre shape language as much as wiring; the assessment reads the wiring itself."}
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
