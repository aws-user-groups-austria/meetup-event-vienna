# people

Photos shared by every meetup: the organizers and speakers who come back,
for example on the "next AWS Community Day" screen. Refer to them in
`event.json`, `source.json` or `../upcoming.json` as `people/<file>`; the web
player, the website's `/present/` and the stills serve this folder at their root.
File names are the person's name in lower case with hyphens.

Sources: `linda-mohamed.png` is the photo in the green blazer from the AWS Community GameDay Europe stream (`community-gameday-europe-stream-templates/public/assets/faces/linda.jpg`, cropped inside its ring), the same file as the website's `organizers/Linda.png`; `dmytro-hlotenko.png` from the website
(`aws-community-austria-website/public/assets/organizers/`),
`darko-mesaros.png` cut from the team's Canva announcement of Meetup #53.

Also: `roman-jokel.png` and `mladen-trampic.png` cut from the Canva announcement of
Meetup #53, `gunnar-grosch.png` from the Canva announcement of Meetup #51
("Copy of AWS UG Vienna 2025", page 8). Past speakers without a file here get
their Sessionize photo when they are on the group's Sessionize.

From the same Canva design: `viktor-vedmich.png` (page 8), `manuel-lindner.png` (page 10),
`florian-ettinger.png` (page 11). Any speaker whose photo is saved here as
`<name>.png` (lower case, hyphens, no accents) gets it on every meetup automatically.

## Bios and links: `<name>.json`

For speakers who are not on Sessionize, `<name>.json` (same name as the photo)
holds a short bio and profile links; meetup-sync adds them to every talk of that
speaker where the Meetup page and Sessionize have none:

```json
{ "bio": "Two or three sentences, third person.", "links": [{ "title": "LinkedIn", "url": "https://..." }], "sources": ["where each fact is from"] }
```

`sources` is for us only: write down where each fact comes from, so a bio never
says more than a public page does. Speakers on Sessionize get their own bio from
there; the LinkedIn link from the Meetup description always comes first.

- `roman-jokel.json`, `mladen-trampic.json`: from their LinkedIn profiles, the
  AWS blog posts and Meetup pages listed in each file (October 2026).
