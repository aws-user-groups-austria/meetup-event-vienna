#!/usr/bin/env node
/**
 * The consent check: every photo and logo in this repository has an entry in
 * consent.json that says where its owner's agreement comes from.
 *
 *   node tools/check-consent.mjs          (make consent)
 *
 * Fails on an image without an entry, an entry without a file, an unknown
 * basis, or a basis without the fields CONSENT.md asks for. Lists the files
 * still marked "before-ledger" without failing: they are the open work.
 * No dependencies, no network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const IMAGE = /\.(png|jpe?g|svg|webp|gif|avif)$/i;
const SHARED = ["people", "logos", "community", "badges"];
const NEEDS = {
  preview: ["date", "note"],
  sessionize: ["note"],
  sponsor: ["note"],
  asked: ["by", "date", "note"],
  own: [],
  "public-page": [],
  "before-ledger": [],
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : IMAGE.test(e.name) ? [p] : [];
  });
}

const images = [
  ...SHARED.flatMap((d) => walk(path.join(ROOT, d))),
  ...(fs.existsSync(path.join(ROOT, "events"))
    ? fs.readdirSync(path.join(ROOT, "events"), { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .flatMap((e) => walk(path.join(ROOT, "events", e.name, "assets")))
    : []),
].map((p) => path.relative(ROOT, p).split(path.sep).join("/")).sort();

let ledger;
try {
  ledger = JSON.parse(fs.readFileSync(path.join(ROOT, "consent.json"), "utf8")).files;
} catch (err) {
  console.error(`consent.json cannot be read: ${err.message}`);
  process.exit(1);
}
if (!ledger || typeof ledger !== "object") {
  console.error('consent.json needs a "files" object.');
  process.exit(1);
}

const errors = [];
const open = [];
for (const file of images) {
  const entry = ledger[file];
  if (!entry) {
    errors.push(`${file}: no entry in consent.json`);
    continue;
  }
  if (!(entry.basis in NEEDS)) {
    errors.push(`${file}: unknown basis ${JSON.stringify(entry.basis)}`);
    continue;
  }
  for (const field of NEEDS[entry.basis]) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) {
      errors.push(`${file}: basis "${entry.basis}" needs "${field}"`);
    }
  }
  if (entry.date && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    errors.push(`${file}: "date" is not YYYY-MM-DD`);
  }
  if (entry.basis === "before-ledger") open.push(file);
}
for (const file of Object.keys(ledger)) {
  if (!images.includes(file)) errors.push(`${file}: in consent.json, but the file is gone`);
}

if (open.length) {
  console.log(`${open.length} of ${images.length} files are still "before-ledger" (see CONSENT.md):`);
  for (const file of open) console.log(`  ${file}`);
}
if (errors.length) {
  console.error(`\nConsent check failed, ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ${e}`);
  console.error("\nOnly add a photo or logo once its owner has agreed, then add its entry. See CONSENT.md.");
  process.exit(1);
}
console.log(`Consent check passed: ${images.length} files, ${images.length - open.length} with a recorded basis.`);
