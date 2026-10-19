/**
 * One local page with the real content made for one meetup, to look at
 * before the evening: every stream screen (the stills of this event's
 * event.json, in running order), the filled-in deck (its PDF, when
 * `make deck-pdf` made one), and the website screenshots.
 *
 *   node tools/review.mjs <event id>
 *
 * Writes events/<id>/review/index.html (gitignored) with relative links, so
 * it works opened straight from the disk. Test data (examples/, stills-stress)
 * is never on it.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
if (!id) {
  console.error("usage: node tools/review.mjs <event id>");
  process.exit(2);
}
const eventDir = join(here, "events", id);
const eventFile = join(eventDir, "event.json");
if (!existsSync(eventFile)) {
  console.error(`${eventFile} not found: run make sync EVENT=${id} first`);
  process.exit(2);
}
const event = JSON.parse(readFileSync(eventFile, "utf8"));
const outDir = join(eventDir, "review");
mkdirSync(outDir, { recursive: true });
const rel = (p) => relative(outDir, p).split("\\").join("/");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const when = (p) => new Date(statSync(p).mtimeMs).toLocaleString("en-GB", { timeZone: "Europe/Vienna" });

// Stills in the order the evening shows them.
const ORDER = ["PreShow", "Welcome", "SponsorHandover", "SpeakerHandover", "NowSpeaking", "Break", "Closing", "Upcoming", "AfterEnd", "Agenda"];
const stillsDir = join(here, "..", "meetup-stream-templates", "out", "stills");
const segIndex = (name) => {
  const seg = name.split("--")[1];
  const i = event.segments.findIndex((s) => s.id === seg);
  return i < 0 ? 0 : i;
};
const stills = existsSync(stillsDir)
  ? readdirSync(stillsDir)
      .filter((f) => f.endsWith(".png"))
      .sort((a, b) => {
        const [sa, sb] = [a.replace(".png", ""), b.replace(".png", "")];
        const oa = ORDER.indexOf(sa.split("--")[0]);
        const ob = ORDER.indexOf(sb.split("--")[0]);
        const ka = sa.startsWith("SpeakerHandover") || sa.startsWith("NowSpeaking") ? segIndex(sa) * 2 + (sa.startsWith("Now") ? 1 : 0) : -1;
        const kb = sb.startsWith("SpeakerHandover") || sb.startsWith("NowSpeaking") ? segIndex(sb) * 2 + (sb.startsWith("Now") ? 1 : 0) : -1;
        if (ka >= 0 && kb >= 0) return ka - kb;
        return oa - ob || sa.localeCompare(sb);
      })
  : [];
const stillsEvent = stills.length ? when(join(stillsDir, stills[0])) : "";

const deckPdf = join(eventDir, "deck", `${id}.pdf`);
const deckPptx = join(eventDir, "deck", `${id}.pptx`);
const siteDir = join(here, "..", "out", "website");
const site = existsSync(siteDir) ? readdirSync(siteDir).filter((f) => f.endsWith(".png")).sort() : [];

const figure = (src, caption) =>
  `<figure><a href="${esc(src)}" target="_blank"><img loading="lazy" src="${esc(src)}" alt="${esc(caption)}"></a><figcaption>${esc(caption)}</figcaption></figure>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Review ${esc(event.title)}</title>
<style>
  :root { --bg: #151E2C; --surface: #1E2538; --text: #fff; --muted: #9CA3AF; --accent: #9E5EFB; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.5 system-ui, sans-serif; }
  header, section { max-width: 1400px; margin: 0 auto; padding: 24px 16px; }
  h1 { margin: 0 0 4px; font-size: 28px; } h2 { margin: 32px 0 12px; color: var(--accent); }
  p { color: var(--muted); margin: 4px 0; } a { color: var(--accent); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
  figure { margin: 0; background: var(--surface); border-radius: 10px; overflow: hidden; }
  figure img { display: block; width: 100%; height: auto; }
  figcaption { padding: 8px 12px; font-size: 14px; color: var(--muted); }
  .pdf { width: 100%; height: 80vh; border: 0; border-radius: 10px; background: #fff; }
  @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
</style></head><body>
<header>
  <h1>${esc(event.title)}</h1>
  <p>The real content for this meetup, from <code>events/${esc(id)}/event.json</code>. No test data.</p>
  <p><a href="${esc(event.links.meetup)}" target="_blank">Meetup event</a> &middot; <a href="https://awscommunity.at/meetups/${esc(id)}/" target="_blank">Meetup page on awscommunity.at</a></p>
</header>
<section>
  <h2>Stream screens (${stills.length})</h2>
  ${stills.length ? `<p>Rendered ${esc(stillsEvent)}. Each is what the room screen shows in that part of the evening.</p><div class="grid">${stills.map((f) => figure(rel(join(stillsDir, f)), f.replace(".png", "").replace(/--/g, " "))).join("")}</div>` : `<p>No stills yet: run <code>make stills</code>.</p>`}
</section>
<section>
  <h2>Slide deck</h2>
  ${existsSync(deckPdf) ? `<p>Exported ${esc(when(deckPdf))} from <code>${esc(rel(deckPptx))}</code>. <a href="${esc(rel(deckPdf))}" target="_blank">Open the PDF</a></p><iframe class="pdf" src="${esc(rel(deckPdf))}"></iframe>` : existsSync(deckPptx) ? `<p>The deck is <a href="${esc(rel(deckPptx))}">${esc(rel(deckPptx))}</a>; run <code>make deck-pdf</code> to see it here.</p>` : `<p>No deck yet: run <code>make deck</code>.</p>`}
</section>
<section>
  <h2>Website (${site.length})</h2>
  ${site.length ? `<p>Screenshots of the last website check.</p><div class="grid">${site.map((f) => figure(rel(join(siteDir, f)), f.replace(".png", ""))).join("")}</div>` : `<p>No website screenshots yet.</p>`}
</section>
</body></html>
`;
writeFileSync(join(outDir, "index.html"), html);
console.log(`wrote ${relative(here, join(outDir, "index.html"))}: ${stills.length} stills, deck ${existsSync(deckPdf) ? "PDF" : "missing"}, ${site.length} website screenshots`);
