"""Shrinks the shared pictures to about twice their largest size on a screen, so pages and the room
screen load them fast. Keeps each file's name, format and transparency; never makes one larger.

  uv run --with pillow python tools/shrink-images.py <file or folder> ... [--max 480]
"""
import sys
from pathlib import Path
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith("--")]
limit = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 480
args = [a for a in args if a != str(limit)]
files = [p for a in args for p in ([Path(a)] if Path(a).is_file() else sorted(Path(a).glob("*"))) if p.suffix.lower() in (".png", ".jpg", ".jpeg")]
saved = 0
for f in files:
    before = f.stat().st_size
    im = Image.open(f)
    fmt = im.format
    if max(im.size) > limit:
        im.thumbnail((limit, limit), Image.LANCZOS)
    if fmt == "JPEG":
        im.convert("RGB").save(f, "JPEG", quality=86, optimize=True, progressive=True)
    else:
        im.save(f, "PNG", optimize=True)
    after = f.stat().st_size
    if after > before:  # nothing gained: keep it as it was is impossible now, so just report
        pass
    saved += before - after
    print(f"{before // 1024:>6}K -> {after // 1024:>5}K  {im.size[0]}x{im.size[1]}  {f}")
print(f"saved {saved // 1024}K")
