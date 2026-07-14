# MindPrint(tm) Communication Field Guides · content + locked template
# Derived from MindPrint_Language_Framework.md v1.0 Sections 2-5.
# Editable: guide dict fields. LOCKED: template layout/sizes (see CLAUDE.md).
from gen import FONTS

ACCENTS = {"WHY":("#6EE7B7","rgba(110,231,183,0.16)","#065F46"),
           "WHAT":("#93C5FD","rgba(147,197,253,0.18)","#1E40AF"),
           "HOW":("#FCD34D","rgba(252,211,77,0.18)","#92400E")}

LEAD = "How your wiring shows up in writing and speech, how each orientation hears it, and the three adjustments that buy the most understanding."

GUIDES = [

dict(profile="WHY-WHAT", primary="WHY", secondary="WHAT", tertiary="HOW",
write="Your messages open with meaning and end in motion. You set context, name the opportunity, and land on next steps, purpose and progress in one arc. The ask usually arrives with its reason attached. What thins out is the mechanics: caveats, precise numbers, boundary conditions, the maintenance questions. You spend words where your energy lives, and your reader can feel both the presence and the absence.",
present=["Purpose and vision language: \u201cthe opportunity\u201d, \u201cwhat if\u201d, \u201cthe bigger picture\u201d","Future mood and possibility; analogies come naturally","Next steps, owners, and momentum verbs close the message","Subject lines that open thematic and end operational"],
absent=["Qualifiers and conditionals: \u201cassuming\u201d, \u201cunless\u201d, \u201cdepends\u201d","Edge cases, failure modes, and maintenance questions","Precise numbers; yours tend to arrive round","The boundary question: \u201cwhat happens when X?\u201d"],
land=[("WHY readers","Hear a native speaker. Your framing energizes them, and alignment comes cheap."),
("WHAT readers","Mostly with you, but they will skim your context hunting for the ask. They wish it came sooner."),
("HOW readers","Hear inspiration without verification. The missing mechanism reads as unexamined risk, and your certainty can land as naivety about the details.")],
blind="The absence is louder than you think. To a HOW reader, a plan with no caveats does not read as strong, it reads as untested. The trust you lose is not about the idea, it is about whether the idea has met reality. One paragraph of named unknowns buys more credibility with precision wiring than any amount of vision.",
adjust=[("For HOW readers","Add the mechanics block. Close with a short section: how it works, what depends on what, and what is not yet verified. Naming the unknowns is the move, it signals the picture has been examined."),
("For WHAT readers","Promote the ask. Your conclusion lives at the end; move it to line one and compress the context to one sentence. They will read the vision after they know what you want."),
("Everywhere","Trade round numbers for real ones. \u201cAbout fifty\u201d reads as unexamined to half your audience. Use the real figure, or say \u201cestimate, will confirm by Friday\u201d. Precision in small places licenses your big claims.")]),

dict(profile="WHY-HOW", primary="WHY", secondary="HOW", tertiary="WHAT",
write="Your messages build understanding: context, pattern, mechanism, meaning. You explain how the pieces connect and why the whole matters, often in the same breath, and length scales with the richness of the picture. What thins out is motion: dates, owners, the ask itself. A reader can finish your message genuinely wiser and still not know what happens next, or when.",
present=["Vision and pattern language: \u201cthe system\u201d, \u201chow it connects\u201d, \u201cwhat this really means\u201d","Mechanism woven into meaning: because-chains and dependencies","Careful terms, definitions, and honest distinctions","Both question signatures: the reframe and the boundary test"],
absent=["Dates, deadlines, and any sense of clock","Named owners and a stated ask","Shipping language: \u201cdone\u201d, \u201clocked\u201d, \u201cnext step\u201d","The status-update register altogether"],
land=[("WHY readers","Hear a native speaker. Your connections energize them; long is fine, they were going to think about it anyway."),
("WHAT readers","Finish reading and ask, \u201cso what do you need from me?\u201d The missing ask reads as indecision, and depth reads as delay."),
("HOW readers","Trust your mechanism talk and engage the detail. They may still want the sequence: what happens first.")],
blind="Insight without an ask is a gift the reader does not know what to do with. To a WHAT reader, a message with no owner, no date, and no next step does not read as thoughtful, it reads as unfinished, however complete the thinking. The single sentence you resist writing, \u201cI need X from you by Friday\u201d, is the one that makes the rest of the message land.",
adjust=[("For WHAT readers","Lead with the ask. One line up top: what you need, from whom, by when, marked \u201cproposed\u201d if you are unsure. The understanding follows for those who read on."),
("For HOW readers","Sequence the mechanism. Your connections are rich; give them an order. \u201cFirst, then, unless\u201d turns a web into a path someone can execute."),
("Everywhere","Cap the context. One paragraph of framing, then the substance. If the picture needs more, append it, do not make the reader earn the point.")]),

dict(profile="WHAT-WHY", primary="WHAT", secondary="WHY", tertiary="HOW",
write="You write to move things, and you carry the reason with you. Short messages, active verbs, an ask near the top, and a line of purpose that rallies. Milestones over tasks, direction over destination. What thins out is the floor under the plan: task-level detail, precise numbers, the checks that prove the picture is complete. You trust the gut that has usually been right, and it shows on the page.",
present=["Conclusion-first structure; the ask arrives early","Momentum vocabulary: \u201cwin\u201d, \u201ctraction\u201d, \u201clet\u2019s\u201d, \u201cby Friday\u201d","A purpose line that rallies: \u201cthis gets us to X\u201d","Names and dates at high density"],
absent=["Task-level detail and sequence","Qualifiers, caveats, and exceptions","Precise figures; yours round up","The completeness check: \u201cwhat are we missing?\u201d"],
land=[("WHAT readers","Hear a native speaker. Your pace energizes them; decisions come easy in your thread."),
("WHY readers","With you on direction, and grateful for the purpose line. They may push on whether it is the right hill before running up it."),
("HOW readers","Hear speed without a floor. Round numbers and missing steps read as recklessness, and their questions arrive exactly when you want to be moving.")],
blind="The questions that frustrate you most are the ones protecting you. When a HOW reader asks \u201cwhat happens when\u201d, they are not slowing the work, they are testing whether the plan survives contact. A rally with no floor loses precisely the people who would have caught the failure. Give them one block of detail and they will give you speed.",
adjust=[("For HOW readers","Attach the floor. Three lines: the first concrete steps, the real number, the known risks. It reads as respect, and it converts your skeptics into checkers."),
("For WHY readers","Pause on the frame once. One line, \u201cthe problem this solves is X\u201d, costs a sentence and prevents the mid-project reopen."),
("Everywhere","Mark the confidence. \u201cGut call\u201d and \u201cverified\u201d are different claims; label which one the reader is getting, and your gut earns more trust, not less.")]),

dict(profile="WHAT-HOW", primary="WHAT", secondary="HOW", tertiary="WHY",
write="You write like a cockpit: status, metrics, next actions, all instruments live. Short lines, real numbers, clear sequence, and you can drop into detail and pull back up without losing the thread. What thins out is the why: the purpose framing, the audience meaning, the sentence that says what all of it is for. Readers get an accurate picture and are left to conclude for themselves why it matters.",
present=["Conclusion-first; actions with owners and dates","Real metrics and current status, always","Detail on demand: steps, sequence, iteration notes","\u201cGood enough to ship, tweak from there\u201d energy"],
absent=["The purpose frame: \u201cthis matters because\u201d","The audience\u2019s so-what","The zoom-out to the bigger picture","The reframe question: is this the right problem?"],
land=[("WHAT readers","Hear a native speaker. Your updates are the ones they forward."),
("HOW readers","Trust your numbers and sequence; they may want the edge cases you skipped in the name of pace."),
("WHY readers","See motion without meaning. Metrics with no frame read as activity, not progress, and they will ask what it is all for, usually in the meeting you least want it.")],
blind="To a WHY reader, a perfect status update with no purpose line is noise with numbers. They are not asking for poetry, they are asking which decision your data serves. One sentence of meaning at the top changes how every figure below it is read, and it is the sentence your wiring skips.",
adjust=[("For WHY readers","Open with the one-line why: \u201cwe are doing this so that X\u201d, before the first metric. Borrow it from the North Star page; never regenerate it under pressure."),
("For HOW readers","Keep an appendix habit. Your compression is a gift to most readers; give precision wiring the full detail one layer down."),
("Everywhere","Translate one metric per message. Pick the number that matters most and complete \u201cwhich means that\u201d for the reader. Meaning is a habit, not a talent.")]),

dict(profile="HOW-WHY", primary="HOW", secondary="WHY", tertiary="WHAT",
write="You write to get it right. Careful terms, distinguished cases, caveats where they belong, and the deeper why of how things work woven through. You correct gently and completely, and length tracks the truth. What thins out is momentum: the decision pressure, the progress claim, the date. Your reader learns exactly how things stand, and rarely when anything will move.",
present=["Sequence and cases: \u201cthere are three scenarios here\u201d","Qualifiers as structure: \u201cassuming\u201d, \u201cunless\u201d, \u201cdepends\u201d","Mechanism plus meaning: why it works the way it does","Precise numbers, defined terms, named unknowns"],
absent=["Deadlines and decision pressure","Progress claims: \u201cshipped\u201d, \u201cmoving\u201d, \u201con track\u201d","The good-enough register","Urgency of any kind"],
land=[("HOW readers","Hear a native speaker. Your completeness relaxes them; they build on your messages."),
("WHY readers","Value the depth and the patterns. They may ask you to lift the meaning to the top rather than distributing it through the piece."),
("WHAT readers","Respect the rigor and cannot find the status. No date and no claim of motion reads as no motion, whatever is actually happening underneath.")],
blind="Being right and being seen to move are different currencies, and half your readers spend the second one. Three weeks of genuinely deep work with no visible claim reads, to WHAT wiring, identical to three weeks of nothing. The broadcast you consider premature is the evidence they consider missing.",
adjust=[("For WHAT readers","Claim the motion weekly. Four lines: shipped, moving, blocked, next, even when shipped is \u201cnothing, deep in X, on track for the 14th\u201d. Reliability is the message."),
("For WHY readers","Promote the pattern. Your best insight usually lives in paragraph four; open with it and let the mechanism support it."),
("Everywhere","Timestamp your certainty. \u201cVerified as of Tuesday\u201d and \u201cstill testing\u201d let you be precise about being unfinished, which is the honesty your wiring wants anyway.")]),

dict(profile="HOW-WHAT", primary="HOW", secondary="WHAT", tertiary="WHY",
write="You write like an operator\u2019s manual with a pulse: complete, ordered, and pointed at how work actually gets done. Process, structure, and efficiency are your native subjects, and you flag what breaks before it breaks. What thins out is the story: vision language, the reframe, the line that tells the reader why the system deserves to exist. You document the machine beautifully and leave the meaning as an exercise.",
present=["Numbered sequence, dependencies, criteria","Process vocabulary: \u201cstreamline\u201d, \u201chandoff\u201d, \u201cbottleneck\u201d","The pre-emptive flag: where it breaks, and the fix","Concrete next steps built into the structure"],
absent=["Vision and possibility language","The reframing question","The audience\u2019s so-what","Appetite for ambiguity of any kind"],
land=[("HOW readers","Hear a native speaker. Your documentation becomes the team\u2019s reference."),
("WHAT readers","Move easily on your structure; they may trim your completeness to hit a date, and you will feel it."),
("WHY readers","See a machine without a mission. Process detail with no frame reads as bureaucracy, even when it is the thing quietly saving everyone\u2019s week.")],
blind="The system you improved will be resourced by people who never read past the first paragraph. If that paragraph is process, the work reads as overhead. If it is impact, \u201cthis cuts onboarding from three weeks to one\u201d, the same document funds itself. The meaning is not decoration, it is the budget line.",
adjust=[("For WHY readers","Lead with the impact claim. One sentence of changed outcome before any process, pulled from the purpose brief, never improvised on the spot."),
("For WHAT readers","Surface the first step. Your structure is complete; bold the single next action so momentum wiring can grab it without reading the manual."),
("Everywhere","Ration the completeness. Full detail one layer down, always available, never mandatory. The appendix is your friend; the wall of text is not.")]),
]

def fieldguide_html(g):
    ac, soft, atext = ACCENTS[g["primary"]]
    present="".join(f'<li><span class="mk">+</span><span>{x}</span></li>' for x in g["present"])
    absent="".join(f'<li><span class="mk mka">&ndash;</span><span>{x}</span></li>' for x in g["absent"])
    land="".join(f'<div class="lr"><div class="lo">{a}</div><div class="lt">{b}</div></div>' for a,b in g["land"])
    adj="".join(f'<div class="adj"><div class="at">{a}</div><p>{b}</p></div>' for a,b in g["adjust"])
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{FONTS}
*{{margin:0;padding:0;box-sizing:border-box;}}
body{{font-family:'DM Sans',sans-serif;color:#1E293B;}}
.page{{width:8.5in;height:11in;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;}}
.header{{background:#0F172A;display:flex;align-items:center;justify-content:space-between;padding:0 44px;height:84px;}}
.wm{{font-family:'Caveat',cursive;font-weight:700;font-size:38px;color:#fff;}}.wm span{{color:#14B8A6;}}
.ht{{text-align:right;}}.ht .l{{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#A7F3D0;}}
.ht .t{{font-family:'Caveat',cursive;font-weight:600;font-size:20px;color:#fff;margin-top:3px;}}
.middle{{padding:24px 44px 18px;display:flex;flex-direction:column;gap:18px;justify-content:space-between;}}
.chips{{display:flex;gap:8px;}}
.chip{{font-size:8.5px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;padding:5px 12px;border-radius:20px;}}
.c1{{background:#0F172A;color:#fff;}}
.c2{{background:{soft};color:{atext};border:1px solid {ac};}}
h1{{font-family:'Caveat',cursive;font-weight:700;font-size:46px;color:#0F172A;line-height:1.05;margin-top:12px;}}
.lead{{font-size:12.5px;line-height:1.55;margin-top:8px;max-width:6.9in;}}
.grid{{display:grid;grid-template-columns:1fr 0.92fr;gap:26px;}}
.col{{display:flex;flex-direction:column;gap:16px;}}
.col > :last-child{{margin-top:auto;}}
.sl{{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#059669;margin-bottom:7px;display:flex;align-items:center;gap:8px;}}
.sl::after{{content:"";flex:1;height:1px;background:#E2E8F0;}}
.sec p{{font-size:11.6px;line-height:1.62;}}
.sig{{background:{soft};border:1px solid {ac};border-radius:10px;padding:15px 17px;}}
.sig .st{{font-family:'Caveat',cursive;font-weight:700;font-size:22px;color:#0F172A;margin-bottom:7px;}}
.sig ul{{list-style:none;}}
.sig li{{display:flex;gap:9px;padding:4px 0;font-size:11px;line-height:1.5;align-items:baseline;}}
.mk{{font-weight:700;color:{atext};min-width:10px;}}
.mka{{color:#B91C1C;}}
.sig .sub{{font-size:8.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:{atext};margin:9px 0 3px;}}
.lr{{display:grid;grid-template-columns:100px 1fr;gap:11px;padding:7px 0;border-bottom:1px solid #F1F5F9;align-items:baseline;}}
.lo{{font-size:10.5px;font-weight:700;letter-spacing:0.5px;color:#065F46;}}
.lt{{font-size:11.4px;line-height:1.55;}}
.honest{{background:#FFFBEB;border:1px solid #E9D8A6;border-radius:10px;padding:14px 16px;}}
.honest .sl{{color:#92400E;}}.honest .sl::after{{background:#E9D8A6;}}
.honest p{{font-size:11px;line-height:1.58;}}
.adjrow{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;border-top:1px solid #E2E8F0;padding-top:14px;}}
.adj{{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:13px 15px;}}
.at{{font-family:'Caveat',cursive;font-weight:700;font-size:19px;color:#065F46;margin-bottom:5px;}}
.adj p{{font-size:10.8px;line-height:1.55;}}
.footer{{background:#059669;display:flex;align-items:center;justify-content:space-between;padding:0 44px;height:56px;}}
.footer .l{{font-family:'Caveat',cursive;font-weight:600;font-size:18px;color:#fff;}}
.footer .r{{font-size:10px;font-weight:500;color:#fff;}}
</style></head><body><div class="page">
<div class="header"><div class="wm">Curio<span>.</span></div><div class="ht">
<div class="l">MindPrint&trade; Communication Field Guide</div>
<div class="t">Language Framework v1.0</div></div></div>
<div class="middle">
<div><div class="chips"><div class="chip c1">{g["profile"]}</div>
<div class="chip c2">Primary {g["primary"]} &middot; Secondary {g["secondary"]} &middot; Tertiary {g["tertiary"]}</div></div>
<h1>How the {g["profile"]} communicates</h1><p class="lead">{LEAD}</p></div>
<div class="grid"><div class="col">
<div class="sec"><div class="sl">How You Naturally Write</div><p>{g["write"]}</p></div>
<div class="sig"><div class="st">Your signature</div>
<div class="sub">Present</div><ul>{present}</ul>
<div class="sub">Conspicuously absent</div><ul>{absent}</ul></div>
</div><div class="col">
<div class="sec"><div class="sl">How You Land</div>{land}</div>
<div class="honest"><div class="sl">The Blind Spot</div><p>{g["blind"]}</p></div>
</div></div>
<div class="adjrow">{adj}</div>
</div>
<div class="footer"><div class="l">Work that fits how you're wired.</div>
<div class="r">hello@choosecurio.com &nbsp;&middot;&nbsp; choosecurio.com</div></div>
</div></body></html>"""
