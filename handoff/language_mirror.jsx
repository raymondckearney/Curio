import { useState, useEffect } from "react";

// ============================================================================
// CURIO · MINDPRINT(tm) LANGUAGE MIRROR — prototype
// Public marketing-site tool built on MindPrint_Language_Framework.md v1.0.
// Paste your own writing, get a hypothesis read of your orientation signature,
// then an invitation to take the assessment. With consent, sample + eventual
// assessment result become the labeled validation corpus (Framework §8).
//
// NEXT.JS PORT NOTES — this one is PUBLIC, unlike the Companions:
// - Page at pages/mirror.js (marketing site, no portal gate). CTA links to /buy.
// - API at pages/api/mirror.js: no license check; rate limit by IP (10/day)
//   since it is unauthenticated; same raw fetch convention, max_tokens 1000.
// - Consent checkbox: when checked, store {sample_hash, text, created_at} in a
//   new writing_samples table; if the visitor later buys and completes the
//   assessment, join on email to label the sample. Store NOTHING without the
//   explicit checkbox. This is the validation corpus, treat it as such.
// - System prompt server-side, composed from MindPrint_Language_Framework.md.
// ============================================================================

const BRAND = {
  navy: "#0F172A", emerald: "#059669", deep: "#065F46", teal: "#14B8A6",
  accent: "#14B8A6", soft: "rgba(20,184,166,0.12)", accentText: "#0F766E",
  ink: "#1E293B", rule: "#E2E8F0",
};

const SYSTEM = `You are the MindPrint(tm) Language Mirror, a public AI tool by Curio (choosecurio.com), governed by the MindPrint Language Framework. You read a sample of the user's OWN writing and offer a hypothesis about which cognitive orientations (WHY, WHAT, HOW) it leans toward, at four levels: vocabulary, structure, questions, and frame.

The registers, in brief:
WHY-speak: meaning-first. Purpose, vision, the bigger picture, what if. Context before the ask, future and conditional mood, abstractions, reframing questions.
WHAT-speak: motion-first. Next steps, ship, owner, done, dates. Conclusion-first, verbs dominate, bullets, forward-motion questions.
HOW-speak: accuracy-first. Specifically, depends, edge case, assuming. Sequence and cases, qualifiers as structure, precise numbers, boundary-testing questions.

The absence principle: people spend the fewest words on what drains them. The orientation whose markers are conspicuously missing is as informative as the ones present.

Hard rules:
- Hypothesis language ONLY: "this writing reads WHAT-forward", "the sample leans", "suggests". NEVER "you are a WHAT-primary", never assign a profile as fact. Writing is shaped by role, audience, and genre as much as wiring; say so once, briefly.
- Quote short fragments from the user's own text as evidence for every observation. Never invent quotes.
- One sample is weak evidence; note it in one line without belaboring it.
- Never analyze or characterize third parties mentioned in the text. Read the writer only.
- Language rules: cognitive orientations, never personality or types. Energizing and draining, never strengths or weaknesses. No em dashes, use commas.

Output format:
## The read (2-3 sentences: which orientation the sample reads forward, which is also present, which is conspicuously quiet)
## The evidence (grouped by the four levels, each observation with a short quoted fragment from the sample)
## The quiet third (what is absent and what that absence would mean IF this sample reflects wiring rather than role or genre)
## One experiment (a single concrete rewrite suggestion the user can try on this very text to reach the quiet orientation)
No preamble, no closing pleasantries.`;

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

export default function LanguageMirror() {
  const [sample, setSample] = useState("");
  const [isMine, setIsMine] = useState(false);
  const [consent, setConsent] = useState(false);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);

  const run = async () => {
    if (!sample.trim() || sample.trim().length < 200) { setErr("Paste at least a solid paragraph or two, around 200 characters minimum, so the read has something to work with."); return; }
    if (!isMine) { setErr("The Mirror reads your own writing only. Please confirm the sample is yours."); return; }
    setBusy(true); setErr(""); setOutput("");
    try {
      const text = await llm([{ role: "user", content: `My writing sample:\n\n${sample}` }], SYSTEM);
      setOutput(text);
      // PORT NOTE: if (consent) POST the sample to /api/mirror with store:true
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif", color: BRAND.ink }}>
      <div style={{ background: BRAND.navy }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: "#fff", lineHeight: 1 }}>
            Curio<span style={{ color: BRAND.teal }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#A7F3D0" }}>MindPrint&trade; Language Tools</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: "#fff" }}>The Language Mirror</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3" style={{ background: BRAND.soft, borderBottom: `1px solid ${BRAND.accent}` }}>
        <span style={{ fontSize: 12.5 }}>Your writing carries a signature: the orientations you spend words on, and the one you quietly skip. Paste a sample of your own writing and see what it suggests. A read of your words is a hypothesis; the MindPrint&trade; assessment is the answer.</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-xl bg-white p-5" style={{ border: `1px solid ${BRAND.rule}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.emerald, marginBottom: 4 }}>A sample of your writing</div>
          <textarea rows={9} value={sample}
            placeholder="Paste something you wrote: an email, a project update, a proposal section. The more natural the better, a few paragraphs is plenty."
            onChange={(e) => setSample(e.target.value)}
            className="w-full rounded-lg p-3 text-sm outline-none resize-y"
            style={{ border: `1px solid ${BRAND.rule}`, background: "#FCFCFB", lineHeight: 1.5 }} />

          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={isMine} onChange={(e) => setIsMine(e.target.checked)} className="mt-1" />
            <span style={{ fontSize: 12 }}>This is my own writing.</span>
          </label>
          <label className="flex items-start gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span style={{ fontSize: 12, color: "#475569" }}>Optional: Curio may keep this sample to improve how MindPrint&trade; reads language. Anonymous unless I later create an account.</span>
          </label>

          <button onClick={run} disabled={busy}
            className="rounded-lg px-5 py-2.5 font-semibold text-white text-sm mt-4"
            style={{ background: busy ? "#94A3B8" : BRAND.deep }}>
            {busy ? "Reading..." : "Read my writing"}
          </button>
          {err && <p className="mt-3 text-sm" style={{ color: "#B91C1C" }}>{err}</p>}
        </div>

        {output && (
          <div className="rounded-xl mt-5 p-5" style={{ background: BRAND.soft, border: `1px solid ${BRAND.accent}` }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: BRAND.navy }}>What your words suggest</span>
            <MD text={output} />
            <div className="rounded-lg mt-5 p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: BRAND.navy }}>
              <div>
                <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 20, color: "#fff" }}>Curious if the read matches your wiring?</div>
                <div style={{ fontSize: 11.5, color: "#CBD5E1" }}>Writing is shaped by role and audience. The MindPrint&trade; assessment reads the wiring itself.</div>
              </div>
              <a href="https://choosecurio.com/buy"
                className="rounded-lg px-5 py-2.5 font-semibold text-sm"
                style={{ background: BRAND.teal, color: BRAND.navy, textDecoration: "none" }}>
                Take the assessment
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-4" style={{ fontSize: 10, color: "#94A3B8" }}>
        MindPrint&trade; Language Framework v1.0 · A read of writing is a hypothesis, not a diagnosis · choosecurio.com
      </div>
    </div>
  );
}
