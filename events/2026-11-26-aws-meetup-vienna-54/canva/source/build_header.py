"""AWS Meetup Vienna #54 header, rebuilt in the #53 Canva layout (1920 x 1080).

Measured from events/2026-10-20-aws-meetup-vienna-53/canva/header-plain.png:
  photo area 0..918, navy diagonal panel (top edge x 1183, bottom x 815),
  purple wash on the right, band 918..1080 navy (21,30,44) to x 700 then to (157,97,246).

Inputs, copied next to this script before running:
  tower.jpg              = canva/source/canetti-tower-herold-commons.jpg
  ugv.png                = logos/ug-vienna.png
  dl/ed_white_h400.png   = canva/source/erste-digital-white.svg rendered 400 px high (rsvg-convert -h 400)
  fonts/AmazonEmber_W_{Bd,Rg,Lt}.ttf = usergroup-toolkit.com/assets/fonts/*.woff converted with fontTools
Run: python3 build_header.py header.png
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

W, H, BAND = 1920, 1080, 918
F = "fonts/"
bold = lambda s: ImageFont.truetype(F + "AmazonEmber_W_Bd.ttf", s)
reg = lambda s: ImageFont.truetype(F + "AmazonEmber_W_Rg.ttf", s)
light = lambda s: ImageFont.truetype(F + "AmazonEmber_W_Lt.ttf", s)

photo = Image.open("tower.jpg").convert("RGB")
ug = Image.open("ugv.png").convert("RGBA")
ed = Image.open("dl/ed_white_h400.png").convert("RGBA")

out = sys.argv[1] if len(sys.argv) > 1 else "header.png"
show_people = False

# 1 photo, full height of the picture area, tower placed right of centre
s = BAND / photo.height
ph = photo.resize((round(photo.width * s), BAND), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
x0 = W - ph.width
canvas = Image.new("RGB", (W, H), (21, 30, 44))
fill = ImageOps.mirror(ph)
canvas.paste(fill, (x0 - fill.width, 0))
canvas.paste(ph, (x0, 0))

# 2 purple wash over the whole picture area
wash = Image.new("RGBA", (W, BAND), (0, 0, 0, 0))
wd = ImageDraw.Draw(wash)
for y in range(BAND):
    t = y / BAND
    a = int(165 + 35 * t)          # a little denser towards the floor
    wd.line([(0, y), (W, y)], fill=(114, 72, 200, a))
canvas.paste(Image.alpha_composite(canvas.crop((0, 0, W, BAND)).convert("RGBA"), wash).convert("RGB"), (0, 0))

# 3 navy diagonal panel
panel = Image.new("RGBA", (W, BAND), (0, 0, 0, 0))
ImageDraw.Draw(panel).polygon([(0, 0), (1183, 0), (815, BAND), (0, BAND)], fill=(23, 31, 44, 238))
canvas.paste(Image.alpha_composite(canvas.crop((0, 0, W, BAND)).convert("RGBA"), panel).convert("RGB"), (0, 0))

# 4 bottom band
band = Image.new("RGB", (W, H - BAND))
bd = ImageDraw.Draw(band)
c0, c1 = (21, 30, 44), (157, 97, 246)
for x in range(W):
    t = 0 if x < 700 else (x - 700) / (W - 700)
    bd.line([(x, 0), (x, H - BAND)], fill=tuple(round(c0[i] + (c1[i] - c0[i]) * t) for i in range(3)))
canvas.paste(band, (0, BAND))

d = ImageDraw.Draw(canvas)

# 5 group mark, same size and place as on #53
k = 0.68
ugs = ug.resize((round(ug.width * k), round(ug.height * k)), Image.LANCZOS)
canvas.paste(ugs, (55 - round(38 * k), 55 - round(103 * k)), ugs)

def centred(text, font, cx, cy, fill=(255, 255, 255)):
    l, t, r, b = d.textbbox((0, 0), text, font=font, anchor="ls")
    d.text((cx - (r - l) / 2 - l, cy), text, font=font, fill=fill, anchor="ls")

# 6 title on the navy side
centred("AWS Meetup Vienna #54", bold(66), 457, 568)

# 7 date, arrow, venue on the picture side
CX = 1422
centred("- 26th November 5 PM -", bold(66), CX, 500)
d.line([(1040, 540), (1812, 540)], fill="white", width=7)
d.polygon([(1834, 540), (1806, 524), (1806, 556)], fill="white")
d.ellipse([1027, 527, 1053, 553], fill=(108, 70, 180), outline="white", width=6)
centred("@Erste Digital, Zeta Bite room", reg(37), CX, 597)
centred("Canettistraße 5, 1100 Wien", reg(37), CX, 648)

# 8 hosted by
d.text((74, 1011), "hosted by", font=light(36), fill=(214, 216, 224), anchor="ls")
lh = 104
eds = ed.resize((round(ed.width * lh / ed.height), lh), Image.LANCZOS)
canvas.paste(eds, (262, 999 - lh // 2), eds)

canvas.save(out)
print(out, canvas.size)
