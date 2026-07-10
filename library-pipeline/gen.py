# Curio MindPrint(tm) Tertiary Support Library generator
# One locked one-pager skeleton + three artifact templates (worksheet / checklist / cards)

import os
_HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = open(os.path.join(_HERE, 'fonts_embedded.css')).read()

COLL = {
 "A": dict(accent="#FCD34D", soft="rgba(252,211,77,0.18)", text="#92400E",
           tert="Supports Tertiary HOW", prof="For WHY-WHAT &middot; WHAT-WHY", name="Collection A"),
 "B": dict(accent="#93C5FD", soft="rgba(147,197,253,0.18)", text="#1E40AF",
           tert="Supports Tertiary WHAT", prof="For WHY-HOW &middot; HOW-WHY", name="Collection B"),
 "C": dict(accent="#6EE7B7", soft="rgba(110,231,183,0.16)", text="#065F46",
           tert="Supports Tertiary WHY", prof="For WHAT-HOW &middot; HOW-WHAT", name="Collection C"),
 "D": dict(accent="#14B8A6", soft="rgba(20,184,166,0.14)", text="#0F766E",
           tert="Universal", prof="For All Six Profiles", name="Collection D"),
 "E": dict(accent="#059669", soft="rgba(5,150,105,0.10)", text="#065F46",
           tert="Teams &amp; Meetings", prof="For Intact Teams", name="Collection E"),
}

BASE_CSS = """
:root{--navy:#0F172A;--emerald:#059669;--deep:#065F46;--teal:#14B8A6;--ink:#1E293B;
--slate:#F1F5F9;--cream:#FFFBEB;--cream-border:#E9D8A6;--lightmint:#A7F3D0;--rule:#E2E8F0;
--accent:%(accent)s;--accent-soft:%(soft)s;--accent-text:%(text)s;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;color:var(--ink);background:#fff;}
.page{width:8.5in;height:11in;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;background:#fff;}
.header{background:var(--navy);display:flex;align-items:center;justify-content:space-between;padding:0 44px;}
.wordmark{font-family:'Caveat',cursive;font-weight:700;color:#fff;line-height:1;}
.wordmark span{color:var(--teal);}
.lib-label{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--lightmint);}
.tool-id{font-family:'Caveat',cursive;font-weight:600;font-size:20px;color:#fff;margin-top:3px;}
.section-label{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--emerald);margin-bottom:6px;display:flex;align-items:center;gap:8px;}
.section-label::after{content:"";flex:1;height:1px;background:var(--rule);}
"""

ONEPAGER_CSS = BASE_CSS + """
.header{height:84px;}
.wordmark{font-size:38px;}
.middle{padding:22px 44px 16px;display:flex;flex-direction:column;gap:15px;justify-content:space-between;}
.chips{display:flex;gap:8px;align-items:center;}
.chip{font-size:8.5px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;padding:5px 12px;border-radius:20px;}
.chip-mode{background:var(--emerald);color:#fff;}
.chip-tertiary{background:var(--accent-soft);color:var(--accent-text);border:1px solid var(--accent);}
.chip-profiles{background:var(--slate);color:var(--ink);border:1px solid var(--rule);}
h1{font-family:'Caveat',cursive;font-weight:700;font-size:40px;color:var(--navy);line-height:1.05;margin-top:11px;}
.lead{font-size:12px;line-height:1.5;color:var(--ink);margin-top:7px;max-width:6.9in;}
.lead b{color:var(--deep);font-weight:600;}
.body-grid{display:grid;grid-template-columns:1fr 0.9fr;gap:24px;}
.col{display:flex;flex-direction:column;gap:14px;}
.col > :last-child{margin-top:auto;}
.section p{font-size:10.8px;line-height:1.58;color:var(--ink);}
.device{background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:14px 16px;}
.device-title{font-family:'Caveat',cursive;font-weight:700;font-size:21px;color:var(--navy);margin-bottom:7px;}
.device ol{list-style:none;}
.device li{display:grid;grid-template-columns:15px 158px 1fr;gap:0 10px;padding:4.5px 0;align-items:start;}
.device li .dn{font-family:'Caveat',cursive;font-weight:700;font-size:16px;color:var(--accent-text);line-height:1.2;}
.device li .dl{font-weight:600;color:var(--navy);font-size:10.6px;line-height:1.45;}
.device li .dd{font-size:10.6px;line-height:1.45;color:var(--ink);}
.device li .full{grid-column:2/4;}
.steps{list-style:none;}
.steps li{display:flex;gap:11px;padding:5px 0;font-size:10.8px;line-height:1.5;align-items:baseline;}
.steps li .n{font-family:'Caveat',cursive;font-weight:700;font-size:18px;color:var(--emerald);min-width:15px;}
.steps li b{font-weight:600;color:var(--deep);}
.honest{background:var(--cream);border:1px solid var(--cream-border);border-radius:10px;padding:13px 15px;}
.honest .section-label{color:#92400E;}
.honest .section-label::after{background:var(--cream-border);}
.honest p{font-size:10.3px;line-height:1.55;color:var(--ink);}
.kit{border-top:1px solid var(--rule);padding-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:24px;}
.kit-items{display:flex;flex-wrap:wrap;gap:6px;}
.kit-chip{font-size:9.5px;font-weight:500;padding:5px 11px;border-radius:6px;background:var(--slate);border:1px solid var(--rule);}
.pair-list{font-size:10.3px;line-height:1.6;}
.pair-list b{font-weight:600;color:var(--deep);}
.footer{background:var(--emerald);display:flex;align-items:center;justify-content:space-between;padding:0 44px;height:56px;}
.footer .left{font-family:'Caveat',cursive;font-weight:600;font-size:18px;color:#fff;}
.footer .right{font-size:10px;font-weight:500;color:#fff;}
"""

ART_CSS = BASE_CSS + """
.page{page-break-after:always;}
.page:last-of-type{page-break-after:auto;}
.header{height:62px;}
.wordmark{font-size:28px;}
.middle{padding:22px 48px 18px;display:flex;flex-direction:column;gap:14px;}
.flexnotes{flex:1;display:flex;flex-direction:column;min-height:70px;}
.flexnotes .wbox{flex:1;}
h1{font-family:'Caveat',cursive;font-weight:700;font-size:34px;color:var(--navy);line-height:1.05;}
.sub{font-size:11px;line-height:1.55;color:var(--ink);margin-top:5px;max-width:6.6in;}
.piece-tag{font-family:'Caveat',cursive;font-weight:600;font-size:16px;color:var(--teal);margin-left:10px;}
.ws-section{margin-top:2px;}
.ws-prompt{font-size:10.3px;color:#475569;line-height:1.5;margin-bottom:7px;}
.line{height:27px;border-bottom:1px solid #CBD5E1;}
.wbox{border:1px solid #CBD5E1;border-radius:8px;background:#fff;}
.cl-group{margin-top:2px;}
.cl-item{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--rule);}
.cl-item .box{width:13px;height:13px;border:1.5px solid var(--emerald);border-radius:3px;flex-shrink:0;margin-top:1px;}
.cl-item span{font-size:10.8px;line-height:1.5;}
.cards-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;grid-auto-rows:1fr;}
.card{background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:14px 16px;}
.card h3{font-family:'Caveat',cursive;font-weight:700;font-size:19px;color:var(--navy);margin-bottom:5px;}
.card p{font-size:10.3px;line-height:1.5;color:var(--ink);}
.footer{border-top:1px solid var(--rule);display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:44px;}
.footer .left{font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#64748B;}
.footer .right{font-size:9.5px;color:#64748B;}

/* TABLE — logs, trackers, matrices, reference grids */
.tbl-note{font-size:9.8px;color:#475569;line-height:1.5;margin-bottom:2px;background:var(--slate);border-left:3px solid var(--accent);padding:8px 12px;border-radius:0 6px 6px 0;}
.tbl-wrap{flex:1;overflow:hidden;border:1px solid var(--rule);border-radius:9px;}
table.kit-table{width:100%%;height:100%%;border-collapse:collapse;table-layout:fixed;}
table.kit-table th{background:var(--accent-soft);color:var(--accent-text);font-size:8.2px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;padding:7px 9px;text-align:left;border-bottom:1px solid var(--accent);}
table.kit-table td{font-size:9.7px;padding:7px 9px;border-bottom:1px solid var(--rule);color:var(--ink);vertical-align:top;line-height:1.35;}
table.kit-table tr:last-child td{border-bottom:none;}
table.kit-table td.blank{height:22px;}

/* CANVAS — posted one-pagers */
.canvas-zones{display:flex;flex-direction:column;gap:11px;flex:1;}
.cz{border:1px solid var(--rule);border-radius:10px;padding:12px 16px;background:#fff;display:flex;flex-direction:column;}
.cz.lg{background:var(--accent-soft);border-color:var(--accent);flex:2.1;}
.cz.md{flex:1.3;}
.cz.sm{flex:0.85;}
.cz .czlabel{font-size:8.7px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:var(--accent-text);margin-bottom:6px;}
.cz.exclude{background:var(--cream);border-color:var(--cream-border);}
.cz.exclude .czlabel{color:#92400E;}
.cz-box{flex:1;border-bottom:1px dashed #CBD5E1;min-height:18px;}
.cz-row{display:flex;gap:14px;flex:1.3;}
.sig-strip{display:flex;gap:26px;border-top:1px solid var(--rule);padding-top:10px;}
.sig{flex:1;}
.sig .sl{font-size:8.2px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#64748B;margin-bottom:16px;}
.sig .sline{border-bottom:1px solid #94A3B8;height:1px;}
.tag-row{display:flex;gap:14px;font-size:9px;color:#64748B;align-items:center;}
.tag-row .tagbox{border:1px dashed #CBD5E1;border-radius:6px;padding:5px 11px;flex:1;}

/* BOARD — kanban columns */
.board{display:flex;gap:13px;flex:1;}
.board-col{flex:1;background:var(--slate);border-radius:11px;padding:12px 13px;display:flex;flex-direction:column;}
.board-col h4{font-family:'Caveat',cursive;font-weight:700;font-size:18px;color:var(--navy);}
.board-col .cap{font-size:8.4px;color:var(--accent-text);font-weight:700;margin-bottom:8px;letter-spacing:0.4px;text-transform:uppercase;}
.board-slot{background:#fff;border:1.5px dashed #CBD5E1;border-radius:8px;min-height:30px;margin-bottom:8px;}
.board-col .foot{margin-top:auto;font-size:8.7px;color:#475569;border-top:1px solid var(--rule);padding-top:8px;line-height:1.4;}

/* CONTRACT — agreement forms */
.contract-head{display:inline-flex;align-items:center;gap:8px;background:var(--accent-soft);border:1px solid var(--accent);border-radius:20px;padding:6px 15px;font-size:8.7px;font-weight:700;color:var(--accent-text);letter-spacing:1px;text-transform:uppercase;align-self:flex-start;}
.clause{margin-top:1px;}
.clause-label{font-size:10.5px;font-weight:600;color:var(--navy);margin-bottom:3px;}
.clause-prompt{font-size:9.6px;color:#475569;line-height:1.45;margin-bottom:6px;}

/* REFERENCE — read-only blocks */
.ref-list{display:flex;flex-direction:column;gap:9px;flex:1;justify-content:space-evenly;}
.ref-item{border-left:3px solid var(--accent);padding:1px 0 1px 13px;}
.ref-item h4{font-family:'Caveat',cursive;font-weight:700;font-size:17px;color:var(--navy);margin-bottom:2px;}
.ref-item p{font-size:10.1px;line-height:1.5;color:var(--ink);}
.ref-item p.quote{font-style:italic;color:var(--deep);}

/* SCRIPT — facilitation say/note */
.script-line{margin-bottom:16px;}
.script-say{background:var(--accent-soft);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;padding:13px 16px;font-size:11.4px;color:var(--navy);font-weight:500;line-height:1.48;}
.script-note{font-size:9.1px;color:#64748B;margin-top:5px;padding-left:16px;font-style:italic;line-height:1.4;}

/* TREE — decomposition cascade */
.tree-goal{background:var(--navy);color:#fff;border-radius:9px;padding:9px 18px;}
.tree-goal .tgl{font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.85;margin-bottom:5px;}
.tree-goal .tgb{border-bottom:1px solid rgba(255,255,255,0.4);height:18px;}
.tree-level{margin-top:9px;flex:1;display:flex;flex-direction:column;min-height:60px;}
.tree-level .tl-label{font-size:8.2px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--accent-text);margin-bottom:5px;}
.tree-row{display:flex;gap:7px;flex:1;}
.tree-box{flex:1;border:1px solid var(--accent);background:var(--accent-soft);border-radius:7px;min-height:22px;}
.tree-margin{margin-top:10px;background:var(--cream);border:1px solid var(--cream-border);border-radius:8px;padding:9px 13px;font-size:9.2px;color:#78350F;line-height:1.5;}

/* TIMELINE — chain / relay strip / storyboard */
.timeline{display:flex;align-items:stretch;gap:0;flex:1;}
.tl-node{flex:1;border:1.5px solid var(--accent);background:var(--accent-soft);border-radius:9px;padding:10px 11px;display:flex;flex-direction:column;gap:4px;}
.tl-node.flag{border-color:#92400E;background:var(--cream);}
.tl-node .tln{font-size:8.2px;font-weight:700;color:var(--accent-text);text-transform:uppercase;letter-spacing:0.5px;}
.tl-node.flag .tln{color:#92400E;}
.tl-node .tlf{font-size:9.2px;color:#475569;border-bottom:1px dashed #CBD5E1;padding:3px 0;}
.tl-arrow{width:15px;display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:15px;flex-shrink:0;}
.tl-band{border:1px solid var(--rule);border-radius:9px;padding:10px 14px;margin-bottom:10px;display:flex;gap:20px;}
.tl-band .tbf{flex:1;font-size:9.7px;color:#475569;}
.tl-band .tbf b{color:var(--navy);}

/* TENT — large standing role cards */
.tent{display:flex;flex-direction:column;gap:14px;flex:1;}
.tent-card{flex:1;border:2px solid var(--accent);background:var(--accent-soft);border-radius:16px;padding:16px 26px;display:flex;flex-direction:column;justify-content:center;}
.tent-card h2{font-family:'Caveat',cursive;font-weight:700;font-size:27px;color:var(--navy);margin-bottom:6px;}
.tent-card p{font-size:11.3px;line-height:1.55;color:var(--ink);}

/* FLOW — branching decision paths */
.flow-q{border:1px solid var(--navy);background:var(--slate);border-radius:8px;padding:9px 14px;font-size:10.2px;font-weight:600;color:var(--navy);text-align:center;margin-bottom:8px;}
.flow-paths{display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1;grid-auto-rows:1fr;}
.flow-path{border:1px solid var(--accent);background:var(--accent-soft);border-radius:9px;padding:14px 16px;display:flex;flex-direction:column;justify-content:center;}
.flow-path h4{font-family:'Caveat',cursive;font-weight:700;font-size:18px;color:var(--navy);margin-bottom:4px;}
.flow-path p{font-size:10px;line-height:1.45;color:var(--ink);}

/* Generic vertical-fill wrapper for block types with several loose siblings
   (tree, script, contract, flow) so they spread evenly across the page or
   combo slot instead of leaving dead space beneath the last item. */
.fill-spread{display:flex;flex-direction:column;flex:1;justify-content:space-between;gap:8px;}
"""

def esc(s): return s

def device_items_html(items):
    out=[]
    for i,it in enumerate(items,1):
        if isinstance(it,(tuple,list)):
            out.append(f'<li><span class="dn">{i}</span><span class="dl">{it[0]}</span><span class="dd">{it[1]}</span></li>')
        else:
            out.append(f'<li><span class="dn">{i}</span><span class="dd full">{it}</span></li>')
    return "\n".join(out)

def onepager_html(t):
    c=COLL[t["collection"]]
    steps="\n".join(f'<li><span class="n">{i}</span><span><b>{b}</b> {r}</span></li>' for i,(b,r) in enumerate(t["steps"],1))
    kit="\n".join(f'<div class="kit-chip">{k}</div>' for k in t["kit"])
    pairs=" &middot; ".join(f'<b>Tool {n}</b> {nm}' for n,nm in t["pairs"])
    css=ONEPAGER_CSS % c
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{t['title']}</title>
<style>{FONTS}{css}</style></head><body><div class="page">
<div class="header"><div class="wordmark">Curio<span>.</span></div><div style="text-align:right">
<div class="lib-label">MindPrint&trade; Tertiary Support Library</div>
<div class="tool-id">{c['name']} &middot; Tool {t['num']}</div></div></div>
<div class="middle">
<div><div class="chips"><div class="chip chip-mode">{t['mode']}</div>
<div class="chip chip-tertiary">{c['tert']}</div><div class="chip chip-profiles">{c['prof']}</div></div>
<h1>{t['title']}</h1><p class="lead">{t['lead']}</p></div>
<div class="body-grid"><div class="col">
<div class="section"><div class="section-label">The Drain</div><p>{t['drain']}</p></div>
<div class="section"><div class="section-label">What This Tool Does</div><p>{t['does']}</p></div>
<div class="device"><div class="device-title">{t['device_title']}</div><ol>{device_items_html(t['device'])}</ol></div>
</div><div class="col">
<div class="section"><div class="section-label">How To Use It</div><ol class="steps">{steps}</ol></div>
<div class="honest"><div class="section-label">What It Won't Do</div><p>{t['wont']}</p></div>
</div></div>
<div class="kit"><div><div class="section-label">In The Kit</div><div class="kit-items">{kit}</div></div>
<div><div class="section-label">Pairs Well With</div><p class="pair-list">{pairs}</p></div></div>
</div>
<div class="footer"><div class="left">Work that fits how you're wired.</div>
<div class="right">hello@choosecurio.com &nbsp;&middot;&nbsp; choosecurio.com</div></div>
</div></body></html>"""

def _table_block(a):
    cols = a["columns"]
    def lbl(c): return c["label"] if isinstance(c, dict) else c
    ths = "".join(
        f'<th style="width:{c["w"]}">{c["label"]}</th>' if isinstance(c, dict) and c.get("w") else
        f'<th>{lbl(c)}</th>' for c in cols)
    rows_html = ""
    for r in a.get("rows", []):
        tds = "".join(f'<td>{r.get(lbl(c), "")}</td>' for c in cols)
        rows_html += f'<tr>{tds}</tr>'
    for _ in range(a.get("blank_rows", 0)):
        tds = "".join('<td class="blank"></td>' for _ in cols)
        rows_html += f'<tr>{tds}</tr>'
    note = f'<div class="tbl-note">{a["note"]}</div>' if a.get("note") else ""
    return f'{note}<div class="tbl-wrap"><table class="kit-table"><thead><tr>{ths}</tr></thead><tbody>{rows_html}</tbody></table></div>'

def _canvas_block(a):
    def zone(z):
        size = z.get("size", "md")
        cls = f'cz {size}' + (' exclude' if z.get("exclude") else '')
        boxes = "".join('<div class="cz-box"></div>' for _ in range(z.get("boxes", 1)))
        return f'<div class="{cls}"><div class="czlabel">{z["label"]}</div>{boxes}</div>'
    zones_html = ""
    for row in a.get("zones", []):
        if isinstance(row, list):
            zones_html += f'<div class="cz-row">{"".join(zone(z) for z in row)}</div>'
        else:
            zones_html += zone(row)
    sig = ""
    if a.get("sig"):
        parts = "".join(f'<div class="sig"><div class="sl">{s}</div><div class="sline"></div></div>' for s in a["sig"])
        sig = f'<div class="sig-strip">{parts}</div>'
    tag = f'<div class="tag-row"><div class="tagbox">{a["tag"]}</div></div>' if a.get("tag") else ""
    return f'<div class="canvas-zones">{zones_html}</div>{tag}{sig}'

def _board_block(a):
    cols_html = ""
    for col in a["columns"]:
        cap = f'<div class="cap">{col["cap"]}</div>' if col.get("cap") else ""
        slots = "".join('<div class="board-slot"></div>' for _ in range(col.get("slots", 4)))
        foot = f'<div class="foot">{col["foot"]}</div>' if col.get("foot") else ""
        cols_html += f'<div class="board-col"><h4>{col["title"]}</h4>{cap}{slots}{foot}</div>'
    return f'<div class="board">{cols_html}</div>'

def _contract_block(a):
    head = f'<div class="contract-head">{a["head"]}</div>' if a.get("head") else ""
    clauses = ""
    for cl in a["clauses"]:
        clauses += f'<div class="clause"><div class="clause-label">{cl["label"]}</div>'
        if cl.get("prompt"): clauses += f'<div class="clause-prompt">{cl["prompt"]}</div>'
        clauses += "".join('<div class="line"></div>' for _ in range(cl.get("lines", 2))) + '</div>'
    sig = ""
    if a.get("sig"):
        parts = "".join(f'<div class="sig"><div class="sl">{s}</div><div class="sline"></div></div>' for s in a["sig"])
        sig = f'<div class="sig-strip">{parts}</div>'
    return f'{head}{clauses}<div style="flex:1"></div>{sig}'

def _reference_block(a):
    items = "".join(
        f'<div class="ref-item"><h4>{it["title"]}</h4><p class="{"quote" if it.get("quote") else ""}">{it["body"]}</p></div>'
        for it in a["items"])
    return f'<div class="ref-list">{items}</div>'

def _script_block(a):
    out = ""
    for it in a["items"]:
        out += f'<div class="script-line"><div class="script-say">{it["say"]}</div>'
        if it.get("note"): out += f'<div class="script-note">{it["note"]}</div>'
        if it.get("capture"): out += '<div class="line" style="margin-top:6px;height:34px"></div>'
        out += '</div>'
    return out

def _tree_block(a):
    goal = f'<div class="tree-goal"><div class="tgl">Goal</div><div class="tgb"></div></div>'
    levels = ""
    for lv in a["levels"]:
        prompt = f'<div class="ws-prompt" style="margin-top:2px">{lv["prompt"]}</div>' if lv.get("prompt") else ""
        boxes = "".join('<div class="tree-box"></div>' for _ in range(lv.get("n", 3)))
        levels += f'<div class="tree-level"><div class="tl-label">{lv["label"]}</div>{prompt}<div class="tree-row">{boxes}</div></div>'
    margin = f'<div class="tree-margin">{a["margin"]}</div>' if a.get("margin") else ""
    return f'<div style="display:flex;flex-direction:column;flex:1;gap:10px">{goal}{levels}{margin}</div>'

def _timeline_block(a):
    band = ""
    if a.get("band"):
        fields = "".join(f'<div class="tbf"><b>{f[0]}</b> {f[1]}</div>' for f in a["band"])
        band = f'<div class="tl-band">{fields}</div>'
    nodes = ""
    for i, nd in enumerate(a["nodes"]):
        if i > 0: nodes += '<div class="tl-arrow">&#8594;</div>'
        cls = "tl-node flag" if nd.get("flag") else "tl-node"
        fields = "".join(f'<div class="tlf">{f}</div>' for f in nd.get("fields", []))
        nodes += f'<div class="{cls}"><div class="tln">{nd["label"]}</div>{fields}</div>'
    return f'{band}<div class="timeline">{nodes}</div>'

def _tent_block(a):
    cards = "".join(f'<div class="tent-card"><h2>{c["title"]}</h2><p>{c["body"]}</p></div>' for c in a["cards"])
    return f'<div class="tent">{cards}</div>'

def _flow_block(a):
    qs = "".join(f'<div class="flow-q">{q}</div>' for q in a["questions"])
    paths = "".join(f'<div class="flow-path"><h4>{p["title"]}</h4><p>{p["body"]}</p></div>' for p in a["paths"])
    return f'<div class="fill-spread"><div>{qs}</div><div class="flow-paths">{paths}</div></div>'

def _artifact_body(a):
    t = a["type"]
    if t == "worksheet":
        body = ""
        for s in a["sections"]:
            body += f'<div class="ws-section"><div class="section-label">{s["label"]}</div>'
            if s.get("prompt"): body += f'<div class="ws-prompt">{s["prompt"]}</div>'
            if s.get("box"): body += f'<div class="wbox" style="height:{s["box"]}px"></div>'
            else: body += "".join('<div class="line"></div>' for _ in range(s.get("lines", 2)))
            body += '</div>'
        return body
    if t == "checklist":
        body = ""
        for g in a["groups"]:
            items = "".join(f'<div class="cl-item"><div class="box"></div><span>{i}</span></div>' for i in g["items"])
            body += f'<div class="cl-group"><div class="section-label">{g["label"]}</div>{items}</div>'
        if a.get("notes", True):
            body += '<div class="flexnotes"><div class="section-label">Notes</div><div class="wbox"></div></div>'
        return body
    if t == "cards":
        cards = "".join(f'<div class="card"><h3>{cd["title"]}</h3><p>{cd["body"]}</p></div>' for cd in a["cards"])
        return f'<div class="cards-grid">{cards}</div>'
    if t == "table": return _table_block(a)
    if t == "canvas": return _canvas_block(a)
    if t == "board": return _board_block(a)
    if t == "contract": return _contract_block(a)
    if t == "reference": return _reference_block(a)
    if t == "script": return _script_block(a)
    if t == "tree": return _tree_block(a)
    if t == "timeline": return _timeline_block(a)
    if t == "tent": return _tent_block(a)
    if t == "flow": return _flow_block(a)
    if t == "combo":
        out = ""
        for blk in a["blocks"]:
            heading = f'<div class="section-label">{blk["heading"]}</div>' if blk.get("heading") else ""
            out += f'<div style="display:flex;flex-direction:column;gap:7px;flex:{blk.get("flex",1)}">{heading}{_artifact_body(blk)}</div>'
        return f'<div style="display:flex;flex-direction:column;gap:15px;flex:1">{out}</div>'
    raise ValueError(f"unknown artifact type: {t}")

def _artifact_page(p, num, piece=None):
    body = _artifact_body(p)
    piecetag = f'<span class="piece-tag">{piece}</span>' if piece else ""
    return f"""<div class="page">
<div class="header"><div class="wordmark">Curio<span>.</span></div><div style="text-align:right">
<div class="lib-label">MindPrint&trade; Library Kit &middot; Tool {num}{piecetag}</div></div></div>
<div class="middle"><div><h1>{p['title']}</h1><p class="sub">{p['sub']}</p></div>{body}</div>
<div class="footer"><div class="left">MindPrint&trade; Tertiary Support Library</div>
<div class="right">choosecurio.com</div></div>
</div>"""

def artifact_html(a, coll):
    c=COLL[coll]
    css=ART_CSS % c
    if "pages" in a:
        n = len(a["pages"])
        pages = "\n".join(_artifact_page(p, a["num"], piece=f"Piece {i+1} of {n}") for i, p in enumerate(a["pages"]))
    else:
        pages = _artifact_page(a, a["num"])
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{a['title']}</title>
<style>{FONTS}{css}</style></head><body>{pages}</body></html>"""


# --- Library catalog (auto-built from the content files) ---------------------
CAT_NAMES = {
 "A":"Collection A &middot; Supports Tertiary HOW &middot; WHY-WHAT and WHAT-WHY",
 "B":"Collection B &middot; Supports Tertiary WHAT &middot; WHY-HOW and HOW-WHY",
 "C":"Collection C &middot; Supports Tertiary WHY &middot; WHAT-HOW and HOW-WHAT",
 "D":"Collection D &middot; Universal &middot; All Six Profiles",
 "E":"Collection E &middot; Teams and Meetings",
}

def catalog_html(tools):
    cols = {k: [] for k in CAT_NAMES}
    for t in tools: cols[t["collection"]].append(t)
    n = sum(len(v) for v in cols.values())
    def block(c):
        rows = "".join(
            f'<div class="row"><span class="tn">{t["num"]:02d}</span>'
            f'<span class="tt">{t["title"]}</span><span class="tm">{t["mode"]}</span></div>'
            for t in cols[c])
        return (f'<div class="coll"><div class="chead" style="border-left:4px solid '
                f'{COLL[c]["accent"]}">{CAT_NAMES[c]}</div>{rows}</div>')
    blocks = "".join(block(c) for c in CAT_NAMES if cols[c])
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{FONTS}
*{{margin:0;padding:0;box-sizing:border-box;}}
body{{font-family:'DM Sans',sans-serif;color:#1E293B;}}
.page{{width:8.5in;height:11in;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;}}
.header{{background:#0F172A;display:flex;align-items:center;justify-content:space-between;padding:0 44px;height:96px;}}
.wm{{font-family:'Caveat',cursive;font-weight:700;font-size:42px;color:#fff;}}.wm span{{color:#14B8A6;}}
.ht{{text-align:right;}}.ht .l{{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#A7F3D0;}}
.ht .t{{font-family:'Caveat',cursive;font-weight:600;font-size:24px;color:#fff;margin-top:3px;}}
.middle{{padding:22px 44px 14px;column-count:2;column-gap:28px;}}
.coll{{break-inside:avoid;margin-bottom:16px;}}
.chead{{font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#065F46;padding:4px 0 4px 10px;margin-bottom:5px;}}
.row{{display:flex;gap:9px;align-items:baseline;padding:3.2px 0;border-bottom:1px solid #F1F5F9;}}
.tn{{font-family:'Caveat',cursive;font-weight:700;font-size:15px;color:#059669;min-width:20px;}}
.tt{{font-size:10.3px;flex:1;}}
.tm{{font-size:7.5px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#64748B;}}
.intro{{break-inside:avoid;font-size:10.3px;line-height:1.55;margin-bottom:14px;}}
.intro b{{color:#065F46;}}
.footer{{background:#059669;display:flex;align-items:center;justify-content:space-between;padding:0 44px;height:56px;}}
.footer .l{{font-family:'Caveat',cursive;font-weight:600;font-size:18px;color:#fff;}}
.footer .r{{font-size:10px;font-weight:500;color:#fff;}}
</style></head><body><div class="page">
<div class="header"><div class="wm">Curio<span>.</span></div><div class="ht">
<div class="l">MindPrint&trade; Tertiary Support Library</div><div class="t">The Catalog &middot; {n} Tools</div></div></div>
<div class="middle">
<div class="intro">Every tool in this library reduces the cost of work in your tertiary orientation, the work that drains rather than energizes. Each carries one of four support modes: <b>Scaffold</b> (structure that carries the thinking), <b>Teach</b> (a learnable micro-skill), <b>Support</b> (a ritual that reduces the drain), or <b>Replace</b> (delegate, automate, or partner it away). None of them will make tertiary work energizing. All of them make it cheaper.</div>
{blocks}
</div>
<div class="footer"><div class="l">Work that fits how you're wired.</div>
<div class="r">hello@choosecurio.com &nbsp;&middot;&nbsp; choosecurio.com</div></div>
</div></body></html>"""
