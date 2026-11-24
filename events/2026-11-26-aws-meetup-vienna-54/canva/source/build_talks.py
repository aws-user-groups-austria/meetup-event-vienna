"""AWS Meetup Vienna #54 talk cards, in the #53 Canva layout (1920 x 1080).

Measured from events/2026-10-20-aws-meetup-vienna-53/canva/talk-2.png:
  navy ground (20,30,45), band from y 950 navy to x 700 then to (157,97,246),
  group mark top left as on the header, date and venue top right centred on
  x 1597, the speaker photo as a circle at (419, 574) r 190 with a purple ring,
  title, "by <name>" in purple and the role stacked in a column from x 655.

Inputs, copied next to this script before running:
  fonts/AmazonEmber_W_{Bd,Rg,Lt}.ttf  usergroup-toolkit.com/assets/fonts/*.woff, converted with fontTools
  ugv.png     = logos/ug-vienna.png
  ed400.png   = assets/erste-digital.svg rendered 400 px high
  <speaker>.png = the speaker photos in assets/

Run: python3 build_talks.py        writes talk-1.png and talk-2.png
"""
from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H, BAND = 1920, 1080, 950
NAVY, PURPLE, WHITE = (20, 30, 45), (157, 97, 246), (255, 255, 255)
F = "fonts/"
bold = lambda s: ImageFont.truetype(F + "AmazonEmber_W_Bd.ttf", s)
reg = lambda s: ImageFont.truetype(F + "AmazonEmber_W_Rg.ttf", s)
light = lambda s: ImageFont.truetype(F + "AmazonEmber_W_Lt.ttf", s)

DATE = "- 26th November 5 PM -"
VENUE = ["@Erste Digital, Zeta Bite room", "Canettistraße 5, 1100 Wien"]

TALKS = [
    ("talk-1.png", "AWS Tooling in the age of AI abundance", "florian-motlik.png",
     "Florian Motlik", ["Independent AWS Cloud Consultant", "Co-founder of attendit.at"]),
    ("talk-2.png", "How Amazon and AWS Build Resilient Services", "tom-reichenbach.png",
     "Tom Reichenbach", ["Senior Solutions Architect at AWS"]),
]


def wrap(draw, text, font, width):
    lines, line = [], ""
    for word in text.split():
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=font) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def circle(photo, d):
    """The photo as a circle of diameter d, cropped square from its centre."""
    im = ImageOps.fit(photo.convert("RGB"), (d, d), Image.LANCZOS, centering=(0.5, 0.5))
    mask = Image.new("L", (d * 4, d * 4), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, d * 4 - 1, d * 4 - 1], fill=255)
    im.putalpha(mask.resize((d, d), Image.LANCZOS))
    return im


def build(out, title, photo_file, name, roles):
    canvas = Image.new("RGB", (W, H), NAVY)

    # bottom band, navy to purple from x 700, as on the header
    band = Image.new("RGB", (W, H - BAND))
    bd = ImageDraw.Draw(band)
    for x in range(W):
        t = 0 if x < 700 else (x - 700) / (W - 700)
        bd.line([(x, 0), (x, H - BAND)], fill=tuple(round(NAVY[i] + (PURPLE[i] - NAVY[i]) * t) for i in range(3)))
    canvas.paste(band, (0, BAND))

    d = ImageDraw.Draw(canvas)

    # group mark, same size and place as on the header
    ug = Image.open("ugv.png").convert("RGBA")
    k = 0.68
    ugs = ug.resize((round(ug.width * k), round(ug.height * k)), Image.LANCZOS)
    canvas.paste(ugs, (55 - round(38 * k), 55 - round(103 * k)), ugs)

    def centred(text, font, cx, cy, fill=WHITE):
        l, t, r, b = d.textbbox((0, 0), text, font=font, anchor="ls")
        d.text((cx - (r - l) / 2 - l, cy), text, font=font, fill=fill, anchor="ls")

    # date, arrow and venue, top right
    CX = 1597
    centred(DATE, bold(44), CX, 113)
    d.line([(1372, 137), (1826, 137)], fill=WHITE, width=5)
    d.polygon([(1844, 137), (1820, 125), (1820, 149)], fill=WHITE)
    d.ellipse([1359, 124, 1385, 150], fill=NAVY, outline=WHITE, width=5)
    centred(VENUE[0], reg(32), CX, 176)
    centred(VENUE[1], reg(32), CX, 207)

    # speaker photo, a circle with a purple ring
    cx, cy, r = 419, 574, 190
    pic = circle(Image.open(photo_file), r * 2)
    canvas.paste(pic, (cx - r, cy - r), pic)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=PURPLE, width=7)

    # title, name and role, stacked and centred on the photo
    X0, COL = 655, 1215
    size = 76
    while size > 46:
        lines = wrap(d, title, bold(size), COL)
        if len(lines) <= 2:
            break
        size -= 4
    tf, nf, rf = bold(size), reg(58), reg(50)
    # baseline steps as on #53: title lines, then 109 to the name, then 77 a role line
    th, to_name, role_step = round(size * 1.22), 109, 77
    span = (len(lines) - 1) * th + to_name + role_step * len(roles)
    y = cy - span / 2 + size * 0.36
    for ln in lines:
        d.text((X0, y), ln, font=tf, fill=WHITE, anchor="ls")
        y += th
    y += to_name - th
    d.text((X0, y), "by " + name, font=nf, fill=PURPLE, anchor="ls")
    for role in roles:
        y += role_step
        d.text((X0, y), role, font=rf, fill=WHITE, anchor="ls")

    # hosted by, with the sponsor logo
    d.text((74, 1025), "hosted by", font=light(32), fill=(214, 216, 224), anchor="ls")
    ed = Image.open("ed400.png").convert("RGBA")
    lh = 84
    eds = ed.resize((round(ed.width * lh / ed.height), lh), Image.LANCZOS)
    canvas.paste(eds, (262, 1015 - lh // 2), eds)

    canvas.save(out)
    print(out, canvas.size, "|", len(lines), "title line(s) at", size)


for args in TALKS:
    build(*args)
