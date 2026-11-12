"""Copies PropertyIndex query results, unchanged, out of the agent transcripts of a "refresh pix" run into raw/<file>.json.

Results are never retyped: this reads the tool results the agents received (or the file the harness saved a large
result to) and keeps a payload only if it is a real query result (a "rows" list and a "definitions" object) whose
queryId one of the agents reported. Raw results stay local (raw/ is git-ignored); the queries in queries.json can
always fetch them again.

usage: python3 -I capture.py <transcript_dir> <results.json>
  results.json: the run's report, a list of {"file", "queryId", "ok"} (one per query in queries.json)
"""
import glob
import json
import os
import re
import sys

tdir, res = sys.argv[1], json.load(open(sys.argv[2]))
RAW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw")
os.makedirs(RAW, exist_ok=True)
want = {r["queryId"]: r["file"] for r in res if r.get("ok") and r.get("queryId")}
got = {}


def try_payload(text):
    try:
        d = json.loads(text.strip())
    except Exception:
        return None
    if isinstance(d, dict) and d.get("queryId") in want and isinstance(d.get("rows"), list) and isinstance(d.get("definitions"), dict):
        return d
    return None


for path in glob.glob(os.path.join(tdir, "**", "*.jsonl"), recursive=True):
    for line in open(path, encoding="utf-8"):
        if '"tool_result"' not in line or "queryId" not in line:
            continue
        try:
            ev = json.loads(line)
        except Exception:
            continue
        content = (ev.get("message") or {}).get("content")
        if not isinstance(content, list):
            continue
        for c in content:
            if c.get("type") != "tool_result":
                continue
            parts = c.get("content")
            texts = [p.get("text", "") for p in parts if isinstance(p, dict)] if isinstance(parts, list) else [parts or ""]
            for t in texts:
                d = try_payload(t)
                if d is None and "saved to" in t:  # the harness saved a large result to a file
                    m = re.search(r"(/\S+\.(?:txt|json))", t)
                    if m and os.path.exists(m.group(1)):
                        raw = open(m.group(1), encoding="utf-8").read()
                        d = try_payload(raw)
                        if d is None:
                            try:
                                arr = json.loads(raw)
                                for p in arr if isinstance(arr, list) else []:
                                    d = try_payload(p.get("text", "")) if isinstance(p, dict) else None
                                    if d:
                                        break
                            except Exception:
                                pass
                if d:
                    got[d["queryId"]] = d

missing = [want[q] for q in want if q not in got]
for qid, d in got.items():
    json.dump(d, open(os.path.join(RAW, want[qid]), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("saved", want[qid], "rows", len(d.get("rows", [])), "complete", d.get("complete"), "coverage:", d.get("definitions", {}).get("coverage"))
print("missing:", missing)
sys.exit(1 if missing else 0)
