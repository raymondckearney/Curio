import os, re, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen import onepager_html, artifact_html, catalog_html
from content_ab import TOOLS_AB
from content_cde import TOOLS_CDE
from arts1 import ARTS_1
from arts2 import ARTS_2

TOOLS = TOOLS_AB + TOOLS_CDE
ARTS = ARTS_1 + ARTS_2
def coll(n): return "A" if n<=10 else "B" if n<=20 else "C" if n<=30 else "D" if n<=34 else "E"
def slug(s): return re.sub(r'[^A-Za-z0-9]+','_', s.replace('&trade;','').replace('™','')).strip('_')

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("LIBRARY_OUT", os.path.join(BASE, "dist"))
HTML = os.path.join(BASE, ".build")
os.makedirs(HTML, exist_ok=True)
jobs = []  # (html_path, pdf_path, label)

for t in TOOLS:
    c = t["collection"]
    d = f"{OUT}/Collection_{c}"; os.makedirs(d, exist_ok=True)
    hp = f"{HTML}/op_{t['num']:02d}.html"
    open(hp,"w").write(onepager_html(t))
    jobs.append((hp, f"{d}/Tool_{t['num']:02d}_{slug(t['title'])}.pdf", f"OP{t['num']:02d}"))

hp = f"{HTML}/catalog.html"
open(hp,"w").write(catalog_html(TOOLS))
jobs.append((hp, f"{OUT}/Library_Catalog.pdf", "CATALOG"))

for a in ARTS:
    c = coll(a["num"])
    d = f"{OUT}/Collection_{c}"; os.makedirs(d, exist_ok=True)
    hp = f"{HTML}/kit_{a['num']:02d}.html"
    open(hp,"w").write(artifact_html(a, c))
    jobs.append((hp, f"{d}/Tool_{a['num']:02d}_Kit_{slug(a['title'])}.pdf", f"K{a['num']:02d}"))

async def main():
    from playwright.async_api import async_playwright
    over, heights = [], []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width":816,"height":1056})
        for hp, pp, label in jobs:
            await pg.goto("file://"+hp)
            h = await pg.evaluate("""() => {const p=document.querySelector('.page');
                p.style.height='auto'; p.style.overflow='visible';
                const h=p.scrollHeight; p.style.height='11in'; p.style.overflow='hidden'; return h;}""")
            heights.append((label,h))
            if h > 1056: over.append((label,h))
            await pg.pdf(path=pp, width="8.5in", height="11in", print_background=True)
        await b.close()
    print("rendered", len(jobs), "pages")
    print("OVERFLOW:", over if over else "none")
    lows = [(l,h) for l,h in heights if h < 880]
    print("UNDERFILLED (<880px):", lows if lows else "none")

asyncio.run(main())
