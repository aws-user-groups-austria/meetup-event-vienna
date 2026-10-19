# logos

Host and sponsor logos for the dark room screens, shared by every meetup:
`../logos.json` maps a company's name and its other spellings to a file here,
and `make sync` / `make archive` put that logo into each meetup's `event.json`
where the company hosts or sponsors (an override in `source.json` still wins).
The players, the stills and the website's `/present/` serve this folder as
`logos/`. Every file has a transparent background; dark lettering is white.
The deck uses the PNG of the same name.

| File | Company | Source |
|---|---|---|
| `rbi.svg`, `rbi.png` | Raiffeisen Bank International | RBI's official SVG (rbinternational.com), lettering white, cross dark on yellow |
| `eversports.svg`, `eversports.png` | Eversports | Eversports' header logo (eversports.at, `filled-horizontal.svg`), grey lettering white |
| `bytesource.svg`, `bytesource.png` | ByteSource | ByteSource's logo (assets.bytesource.net, `b_logo_r_b`), all white as on the group's Canva cards |
| `tu-wien.svg`, `tu-wien.png` | TU Wien | TU Wien's logo (Wikimedia Commons, `TU_Wien-Logo.svg`), grey lettering white |
| `doit.png` | DoIT | Cut from the group's Canva announcement of the Agentic Football Cup (page 7, separated from its background), all white as on the Canva "hosted by" line |
| `squer.svg`, `squer.png` | SQUER | SQUER's white logo from squer.io (`SQUER_Logo-white.svg`), unchanged |
| `labyrinth-labs.svg`, `labyrinth-labs.png` | Labyrinth Labs | Labyrinth Labs' icon and word mark from lablabs.io (`logo.svg`, `logo-text.svg`) set side by side, white |
| `raiffeisen-informatik.svg`, `raiffeisen-informatik.png` | Raiffeisen Informatik | Raiffeisen Informatik's logo (raiffeiseninformatik.at, `logo.svg`), the R and the lettering white, the cross dark on yellow |
| `enspired.png` | enspired | The website's `enspired.png` (from the group's deck), magenta on transparent |

