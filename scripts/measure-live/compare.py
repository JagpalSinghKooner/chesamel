# Side by side, live on the left and ours on the right, from shots.mjs output.
#   python3 scripts/measure-live/compare.py what-we-do_1440 ours [scale]
# Writes out/cmp/<name>_<tag>_<n>.png (needs Pillow).
import sys, glob, os
from PIL import Image

base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
name, tag = sys.argv[1], sys.argv[2]
scale = float(sys.argv[3]) if len(sys.argv) > 3 else (0.5 if name.endswith('1440') else 1.0)


def full(t):
    parts = sorted(glob.glob(f'{base}/shots/{t}/{name}_*.png'), key=lambda p: int(p.rsplit('_', 1)[1][:-4]))
    ims = [Image.open(p) for p in parts]
    w = ims[0].width
    h = sum(i.height for i in ims)
    out = Image.new('RGB', (w, h), 'white')
    y = 0
    for i in ims:
        out.paste(i, (0, y))
        y += i.height
    return out.resize((int(w * scale), int(h * scale)))


a, b = full('live'), full(tag)
gap = 10
h = max(a.height, b.height)
out = Image.new('RGB', (a.width + b.width + gap, h), (255, 0, 0))
out.paste(a, (0, 0))
out.paste(b, (a.width + gap, 0))
seg = 2000
os.makedirs(f'{base}/cmp', exist_ok=True)
for f in glob.glob(f'{base}/cmp/{name}_{tag}_*.png'):
    os.remove(f)
for i, y in enumerate(range(0, h, seg)):
    out.crop((0, y, out.width, min(h, y + seg))).save(f'{base}/cmp/{name}_{tag}_{i}.png')
    print(f'{base}/cmp/{name}_{tag}_{i}.png')
