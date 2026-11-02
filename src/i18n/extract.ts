/**
 * Finds the translation keys typed in code: the first argument of t("…") and msg("…"), which must be a plain
 * double-quoted string so it can be found here. Anything else inside t( — a template literal, a ternary of two
 * strings — is reported, because its text would never reach the dictionaries.
 */
export type Found = { keys: Map<string, string[]>; problems: string[] };

const CALL = /(?<![\w$.])(t|msg)\(\s*/g;

function readString(src: string, at: number): { value: string; end: number } | null {
  if (src[at] !== '"') return null;
  let i = at + 1, raw = "";
  while (i < src.length && src[i] !== '"') {
    if (src[i] === "\\") { raw += src[i]! + src[i + 1]!; i += 2; continue; }
    if (src[i] === "\n") return null;
    raw += src[i++];
  }
  // JSON reads the same escapes JS does, except \' (never needed inside double quotes).
  return { value: JSON.parse(`"${raw.replace(/\\'/g, "'")}"`) as string, end: i + 1 };
}

export function extractKeys(files: { path: string; text: string }[]): Found {
  const keys = new Map<string, string[]>();
  const problems: string[] = [];
  for (const { path, text } of files) {
    for (const m of text.matchAll(CALL)) {
      const start = m.index! + m[0].length;
      const str = readString(text, start);
      const line = text.slice(0, m.index).split("\n").length;
      if (str) {
        const rest = text.slice(str.end).trimStart();
        if (/^[?:]/.test(rest) || rest.startsWith("+")) problems.push(`${path}:${line} ${m[1]}("…") is followed by "${rest[0]}": put the whole key in one string`);
        keys.set(str.value, [...(keys.get(str.value) ?? []), `${path}:${line}`]);
      } else if (text[start] === "`") problems.push(`${path}:${line} ${m[1]}(\`…\`): use a plain "…" string with {placeholders}`);
      else if (text[start] === "'") problems.push(`${path}:${line} ${m[1]}('…'): use double quotes`);
      else if (/^[^,)]*\?\s*"/.test(text.slice(start, start + 200)) && m[1] === "t") problems.push(`${path}:${line} t(cond ? "…" : "…"): write cond ? t("…") : t("…")`);
    }
  }
  return { keys, problems };
}
