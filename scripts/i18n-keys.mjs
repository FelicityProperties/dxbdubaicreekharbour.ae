// Lists every text the site shows and what the Arabic and Chinese dictionaries still lack: `npm run i18n:keys`.
// Writes src/i18n/keys.json (commit it: the diff shows what a change or a data refresh added) and prints the
// missing keys per language. src/test/i18n.test.ts fails while keys.json is stale or a translation is missing.
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const root = fileURLToPath(new URL("..", import.meta.url));
const jiti = createJiti(import.meta.url, { alias: { "@": join(root, "src") } });
const { extractKeys } = await jiti.import(join(root, "src/i18n/extract.ts"));
const { dataStrings, legalStrings } = await jiti.import(join(root, "src/i18n/data-strings.ts"));
const { codeFiles } = await jiti.import(join(root, "src/i18n/code-files.ts"));

const files = codeFiles(root).map((p) => ({ path: relative(root, p), text: readFileSync(p, "utf8") }));
const { keys, problems } = extractKeys(files);
const out = { ui: [...keys.keys()].sort(), data: dataStrings(), legal: legalStrings() };
writeFileSync(join(root, "src/i18n/keys.json"), `${JSON.stringify(out, null, 1)}\n`);
console.log(`keys.json: ${out.ui.length} from code, ${out.data.length} from data, ${out.legal.length} legal`);
for (const p of problems) console.log(`PROBLEM ${p}`);
for (const locale of ["ar", "zh"]) {
  for (const part of ["ui", "data", "legal"]) {
    const dict = JSON.parse(readFileSync(join(root, `src/i18n/${locale}/${part}.json`), "utf8"));
    const missing = out[part].filter((k) => typeof dict[k] !== "string" || !dict[k].trim());
    const extra = Object.keys(dict).filter((k) => !out[part].includes(k));
    if (missing.length || extra.length) console.log(`${locale}/${part}.json: ${missing.length} missing, ${extra.length} no longer used`);
  }
}
if (problems.length) process.exitCode = 1;
