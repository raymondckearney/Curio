"""Resizes shots/*.png to web-sized JPEGs in shots/web/ for the sheets.
Run from the repo root:  python3 sales/tool-sheets/scripts/optimize.py
"""
import glob
import io
import json
import os
from PIL import Image, ImageCms

root = os.path.join(os.path.dirname(__file__), '..', 'shots')
web = os.path.join(root, 'web')
os.makedirs(web, exist_ok=True)
# Keep sizes already recorded, so re-running after new captures only adds.
dims_path = os.path.join(web, 'dims.json')
dims = json.load(open(dims_path)) if os.path.exists(dims_path) else {}
for f in sorted(glob.glob(os.path.join(root, '*.png'))):
    im = Image.open(f)
    # Screenshots taken on a Mac carry a Display P3 profile; convert to sRGB
    # so colors don't wash out once the profile is dropped from the JPEG.
    icc = im.info.get('icc_profile')
    im = im.convert('RGB')
    if icc:
        im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile('sRGB'), outputMode='RGB')
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    out = os.path.join(web, os.path.basename(f)[:-4] + '.jpg')
    im.save(out, 'JPEG', quality=86, optimize=True, progressive=True)
    dims[os.path.basename(f)[:-4]] = im.size
    print(os.path.basename(out), im.size, os.path.getsize(out) // 1024, 'KB')
# Image sizes, so build.js can fit and crop each screenshot exactly.
json.dump(dims, open(dims_path, 'w'), indent=1)
