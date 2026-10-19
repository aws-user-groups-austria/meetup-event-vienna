/**
 * Brings every meetup up to date from Meetup (and Sessionize), as the
 * scheduled job does every Monday and Friday (.github/workflows/update.yml):
 *
 *   1. the past meetups on the group's "past events" page: make archive
 *   2. each coming meetup in the group's RSS feed: make sync EVENT=<id> when
 *      a folder has its link, else make new URL=<link> (a new folder)
 *
 *   node tools/update.mjs            (or: make update)
 *
 * A meetup that fails is reported and the others go on; the exit code is 1
 * when any failed, so the job shows it.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GROUP = "amazon-web-services-aws-vienna";
const UA = "Mozilla/5.0 (compatible; meetup-event-vienna/1.0; +https://awscommunity.at)";

const make = (...args) => {
  console.log(`\n$ make ${args.join(" ")}`);
  return spawnSync("make", ["--no-print-directory", ...args], { cwd: here, stdio: "inherit" }).status === 0;
};

/** The pathname of a Meetup event link, the way folders are matched: "/<group>/events/<number>/". */
const key = (url) => {
  try {
    return new URL(url).pathname.replace(/\/?$/, "/");
  } catch {
    return "";
  }
};

/** Folder by Meetup link, from each events/<id>/source.json. */
const folders = () => {
  const byLink = new Map();
  for (const id of readdirSync(join(here, "events"))) {
    const f = join(here, "events", id, "source.json");
    if (!existsSync(f)) continue;
    try {
      byLink.set(key(JSON.parse(readFileSync(f, "utf8")).meetupUrl), id);
    } catch {
      // not a meetup folder
    }
  }
  return byLink;
};

/** The coming events' links from the group's RSS feed (its pubDate is the announcement, not the date). */
async function comingLinks() {
  const res = await fetch(`https://www.meetup.com/${GROUP}/events/rss/`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for the RSS feed`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((m) => m[1].match(/<link>\s*(?:<!\[CDATA\[)?\s*(.*?)\s*(?:\]\]>)?\s*<\/link>/)?.[1])
    .filter((l) => l && /\/events\/\d+\/?$/.test(key(l)));
}

const failed = [];
if (!make("archive")) failed.push("archive (past meetups)");

let links = [];
try {
  links = await comingLinks();
} catch (err) {
  console.error(`Could not read the coming meetups: ${err.message}`);
  failed.push("coming meetups (RSS)");
}
const byLink = folders();
for (const link of links) {
  const id = byLink.get(key(link));
  const ok = id ? make("sync", `EVENT=${id}`) : make("new", `URL=${link}`);
  if (!ok) failed.push(id ?? link);
}

// A file whose only change is the time it was fetched (source.fetchedAt) goes back as it was, so a
// run without news leaves nothing to commit.
const git = (...args) => spawnSync("git", args, { cwd: here, encoding: "utf8" });
if (git("rev-parse", "--is-inside-work-tree").status === 0) {
  for (const file of git("diff", "--name-only", "--", "events").stdout.split("\n").filter(Boolean)) {
    const changed = git("diff", "-U0", "--", file).stdout.split("\n").filter((l) => /^[-+](?![-+])/.test(l));
    if (changed.length && changed.every((l) => l.includes('"fetchedAt"'))) git("checkout", "--", file);
  }
}

console.log(`\nupdate: ${links.length} coming meetup${links.length === 1 ? "" : "s"}, past meetups from the archive page${failed.length ? `; failed: ${failed.join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
