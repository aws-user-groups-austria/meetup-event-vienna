# Sources for the #54 header

| File | What | Source |
|---|---|---|
| `canetti-tower-herold-commons.jpg` | The Canetti Tower, Canettistraße 5, the venue building, seen from the square at dusk | "CanettiTower Wien - Herold Büro.jpg" by HEROLD Business Data GmbH, 30 Aug 2024, Wikimedia Commons, CC BY-SA 4.0: https://commons.wikimedia.org/wiki/File:CanettiTower_Wien_-_Herold_B%C3%BCro.jpg . Unchanged here; in the header it is scaled, blurred slightly and washed purple |
| `erste-digital-white.svg` | Erste Digital logo, white lettering on transparent, for dark backgrounds | Erste Digital's own logo from the header of https://www.erstedigital.com/en/home (cdn.erstegroup.com, ED_Logo_screen_white.svg), unchanged |
| `erste-digital-white.png` | The same logo as PNG, 404 x 192, transparent, for the deck | Rendered from the SVG with rsvg-convert |
| `build_header.py` | The script that builds `../header.png` and `../../deck/header.jpeg` | Measured from the #53 Canva header; group mark from `logos/ug-vienna.png`, Amazon Ember from `usergroup-toolkit.com/assets/fonts/` |
| `build_talks.py` | The script that builds `../talk-1.png` and `../talk-2.png` | Measured from the #53 Canva talk cards; speaker photos from `../../assets/`, logo from `erste-digital-white.svg`, Amazon Ember as above |

## Licence of the photo

CC BY-SA 4.0 asks for attribution and for adaptations to carry the same licence.
There is no credit line on the artwork itself; the credit goes into the Meetup
event description and the post, for example:

> Header photo: Canetti Tower, HEROLD Business Data GmbH, CC BY-SA 4.0, via Wikimedia Commons

The header made from it is then shared under CC BY-SA 4.0 as well.

## Consent

These files sit in `canva/source/`, outside `assets/`, so `make consent` is
unchanged. When the Meetup event is published and `make new` has run, the logo
moves into `assets/` with a `sponsor` entry in `consent.json` once Erste
Digital has seen it in the preview. `consent.json` has no basis yet for an
openly licensed photo such as this one.
