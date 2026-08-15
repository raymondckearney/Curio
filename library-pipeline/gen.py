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
.header{height:62px;}
.wordmark{font-size:28px;}
.middle{padding:22px 48px 18px;display:flex;flex-direction:column;gap:14px;}
.flexnotes{flex:1;display:flex;flex-direction:column;min-height:70px;}
.flexnotes .wbox{flex:1;}
h1{font-family:'Caveat',cursive;font-weight:700;font-size:34px;color:var(--navy);line-height:1.05;}
.sub{font-size:11px;line-height:1.55;color:var(--ink);margin-top:5px;max-width:6.6in;}
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

def artifact_html(a, coll):
    c=COLL[coll]
    css=ART_CSS % c
    body=""
    if a["type"]=="worksheet":
        for s in a["sections"]:
            body+=f'<div class="ws-section"><div class="section-label">{s["label"]}</div>'
            if s.get("prompt"): body+=f'<div class="ws-prompt">{s["prompt"]}</div>'
            if s.get("box"): body+=f'<div class="wbox" style="height:{s["box"]}px"></div>'
            else: body+="".join('<div class="line"></div>' for _ in range(s.get("lines",2)))
            body+='</div>'
    elif a["type"]=="checklist":
        for g in a["groups"]:
            items="".join(f'<div class="cl-item"><div class="box"></div><span>{i}</span></div>' for i in g["items"])
            body+=f'<div class="cl-group"><div class="section-label">{g["label"]}</div>{items}</div>'
        body+='<div class="flexnotes"><div class="section-label">Notes</div><div class="wbox"></div></div>'
    elif a["type"]=="cards":
        cards="".join(f'<div class="card"><h3>{cd["title"]}</h3><p>{cd["body"]}</p></div>' for cd in a["cards"])
        body+=f'<div class="cards-grid">{cards}</div>'
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{a['title']}</title>
<style>{FONTS}{css}</style></head><body><div class="page">
<div class="header"><div class="wordmark">Curio<span>.</span></div><div style="text-align:right">
<div class="lib-label">MindPrint&trade; Library Kit &middot; Tool {a['num']}</div></div></div>
<div class="middle"><div><h1>{a['title']}</h1><p class="sub">{a['sub']}</p></div>{body}</div>
<div class="footer"><div class="left">MindPrint&trade; Tertiary Support Library</div>
<div class="right">choosecurio.com</div></div>
</div></body></html>"""


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
