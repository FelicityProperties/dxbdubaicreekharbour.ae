/** The source files whose t("…") and msg("…") calls are translation keys: the public site, not /leads or tests. */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP = /(^|\/)(test|ui|i18n\/(ar|zh|extract\.ts|code-files\.ts))(\/|$)|\.test\.tsx?$|routeTree\.gen\.ts$|(^|\/)(leads\.tsx|VisitorStats\.tsx|leads)(\/|$)/;

export function codeFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const rel = p.slice(root.length + 1);
      if (SKIP.test(rel)) continue;
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(name)) out.push(p);
    }
  };
  walk(join(root, "src"));
  return out.sort();
}
