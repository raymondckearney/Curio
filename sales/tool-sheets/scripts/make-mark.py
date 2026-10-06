"""Makes assets/mark-white.png: the brain-print watermark as white line art
at 10% opacity, for the sheet headers. Run from the repo root."""
from PIL import Image
src = Image.open('public/images/brain-fingerprint-watermark.webp').convert('RGBA').resize((700, 700), Image.LANCZOS)
out = Image.new('RGBA', src.size, (255, 255, 255, 0))
px, op = src.load(), out.load()
for y in range(src.height):
    for x in range(src.width):
        r, g, b, a = px[x, y]
        darkness = 1 - (r + g + b) / 765   # the line art is dark on a white fill
        op[x, y] = (255, 255, 255, int(a * darkness * 0.10))
out.save('sales/tool-sheets/assets/mark-white.png', optimize=True)
