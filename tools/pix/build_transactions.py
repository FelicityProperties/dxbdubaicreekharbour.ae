"""Builds src/data/transactions.json from the PropertyIndex query results in raw/ (fetched with queries.json and copied
unchanged by capture.py). Every number is a registered Dubai Land Department record, or a PropertyIndex aggregate of
them: nothing is estimated, rounded beyond whole units, or typed in.

usage: python3 -I build_transactions.py <snapshot date YYYY-MM-DD> [out.json]   (default out: src/data/transactions.json)

Rules (the same as every snapshot since October 2026):
- Latest rows: the 200 most recent ready (existing) sales, 200 off-plan sales and 200 apartment rentals the register
  holds. Related-party transfers ("no_party_link") and completion re-registrations of the same purchase
  ("prior_buyer_retained") are left out of the sales rows.
- 12-month figures: the 12 full calendar months ending with the month in definitions.coverage. When coverage moves,
  move the window dates in queries.json to match; this script refuses to build from a mismatched window.
- A building maps to a site project through project_map.json (longest prefix first). A registration the register has
  not yet tied to a building is labelled as a new launch; other buildings keep the register's name.
"""
import calendar
import collections
import datetime
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SNAPSHOT = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(REPO, "src", "data", "transactions.json")
datetime.date.fromisoformat(SNAPSHOT)


def load(f):
    return json.load(open(os.path.join(RAW, f), encoding="utf-8"))


QUERIES = json.load(open(os.path.join(HERE, "queries.json"), encoding="utf-8"))
MAP = json.load(open(os.path.join(HERE, "project_map.json"), encoding="utf-8"))["prefixes"]
PREFIXES = sorted(MAP, key=len, reverse=True)  # longest first: creek-waters-2 before creek-waters
COMMUNITY = "dubai-creek-harbour-the-lagoons"   # a registration on the community itself: no building named yet
UNNAMED_ROW = "New launch — building not yet named in the register"
UNNAMED_GROUP = "New launches not yet named in the register"


def site_for(slug):
    for p in PREFIXES:
        if slug == p or (p + "-") in slug:
            return MAP[p]
    return None


def building(slug, name, unnamed):
    return (unnamed, None) if slug == COMMUNITY else (name, site_for(slug))


def r0(x):
    return None if x in (None, 0) else int(round(x))


# ── The 12-month window follows the coverage month, and the 12-month queries must have used it. ──
files = [f for f in QUERIES]
coverages = {load(f)["definitions"]["coverage"] for f in files}
if len(coverages) != 1:
    sys.exit(f"queries disagree on coverage: {coverages}")
coverage = coverages.pop()
m = re.fullmatch(r"DLD registrations loaded through (\w+) (\d{4})", coverage)
if not m:
    sys.exit(f"unexpected coverage wording: {coverage!r}")
month = list(calendar.month_name).index(m.group(1))
year = int(m.group(2))
last = calendar.monthrange(year, month)[1]
w_to = datetime.date(year, month, last)
w_from = datetime.date(year, 1, 1) if month == 12 else datetime.date(year - 1, month + 1, 1)  # 12 full months ending with w_to
window = [w_from.isoformat(), w_to.isoformat()]
for f, q in QUERIES.items():
    for flt in q["input"].get("filters", []):
        if flt.get("operator") == "between" and flt["value"] != window:
            sys.exit(f"{f}: window {flt['value']} does not match coverage ({coverage}) -> {window}; update queries.json and re-run")
# Every 12-month aggregate must be whole (the latest-row queries are partial on purpose: newest 200 only).
for f in ["sales_12m_by_basis.json", "sales_12m_by_basis_bedrooms.json", "rentals_12m_by_bedrooms.json",
          "rentals_12m_new_vs_renewal.json", "rentals_12m_by_building.json"]:
    if not load(f).get("complete"):
        sys.exit(f"{f}: more groups exist than were fetched; add a page or raise its limit")
# A later page is never marked complete (rows exist before its offset): it is the last page if it came back short.
last = load("sales_12m_by_building_p2.json")
if len(last["rows"]) >= last["limit"]:
    sys.exit("sales_12m_by_building_p2.json: a full page; buildings may be missing, add a third page")

# ── Latest registered sales ──
KIND = {("existing", "prior_buyer_sold"): "Resale", ("existing", ""): "First registration",
        ("off_plan", "prior_buyer_sold"): "Off-plan resale", ("off_plan", ""): "First registration"}
sales = []
for f in ["sales_existing_p1.json", "sales_existing_p2.json", "sales_offplan_p1.json", "sales_offplan_p2.json"]:
    for r in load(f)["rows"]:
        relation = r["prior_sale_relation"] or ""
        if relation in ("no_party_link", "prior_buyer_retained"):
            continue
        name, project = building(r["location_slug"], r["location_name"], UNNAMED_ROW)
        sales.append({
            "date": r["sale_date"], "building": name, "project": project, "floor": r["floor"], "bedrooms": r["bedrooms"],
            "sizeSqft": r0(r["size_sqft"]), "price": r0(r["sale_price"]), "psf": r0(r["sale_psf"]),
            "basis": "ready" if r["market_basis"] == "existing" else "offplan", "kind": KIND[(r["market_basis"], relation)],
            "tier": r["price_tier"],
        })
sales.sort(key=lambda s: s["date"], reverse=True)  # stable: ready before off-plan on the same day, as queried

# ── Latest registered tenancy contracts (apartments and hotel apartments) ──
# Every row is kept: two tenancy contracts can share every published detail (same building, size, rent and dates).
rentals = []
for f in ["rentals_p1.json", "rentals_p2.json"]:
    for r in load(f)["rows"]:
        name, project = building(r["location_slug"], r["location_name"], UNNAMED_ROW)
        rentals.append({
            "registered": r["registration_date"], "start": r["start_date"], "end": r["end_date"], "building": name,
            "project": project, "bedrooms": r["bedrooms"], "sizeSqft": r0(r["size_sqft"]), "annualRent": r0(r["annual_rent"]),
            "rentPsf": r0(r["annual_rent_psf"]), "newContract": bool(r["is_new_contract"]),
        })

# ── 12-month summaries (apartments only) ──
BASIS = {"existing": "ready", "off_plan": "offplan"}
ORDER = {"ready": 0, "offplan": 1}
summary = {
    "sales": sorted([{"basis": BASIS[r["market_basis"]], "count": r["count_rows"], "medianPsf": r0(r["median_sale_psf"]),
                      "p25Psf": r0(r["p25_sale_psf"]), "p75Psf": r0(r["p75_sale_psf"]), "medianPrice": r0(r["median_sale_price"]),
                      "totalValue": r0(r["sum_sale_price"])} for r in load("sales_12m_by_basis.json")["rows"]],
                    key=lambda x: ORDER[x["basis"]]),
    "salesByBedroom": sorted([{"basis": BASIS[r["market_basis"]], "bedrooms": r["bedrooms"], "count": r["count_rows"],
                               "medianPsf": r0(r["median_sale_psf"]), "medianPrice": r0(r["median_sale_price"]),
                               "p25Price": r0(r["p25_sale_price"]), "p75Price": r0(r["p75_sale_price"]),
                               "medianSizeSqft": r0(r["median_size_sqft"])}
                              for r in load("sales_12m_by_basis_bedrooms.json")["rows"] if r["bedrooms"]],
                             key=lambda x: (ORDER[x["basis"]], x["bedrooms"])),
    "rentalsByBedroom": [{"bedrooms": r["bedrooms"], "count": r["count_rows"], "medianRent": r0(r["median_annual_rent"]),
                          "p25Rent": r0(r["p25_annual_rent"]), "p75Rent": r0(r["p75_annual_rent"]),
                          "medianRentPsf": r0(r["median_annual_rent_psf"]), "medianSizeSqft": r0(r["median_size_sqft"])}
                         for r in load("rentals_12m_by_bedrooms.json")["rows"] if r["bedrooms"]],
    "rentalsNewVsRenewal": [{"newContract": bool(r["is_new_contract"]), "count": r["count_rows"],
                             "medianRent": r0(r["median_annual_rent"]), "medianRentPsf": r0(r["median_annual_rent_psf"])}
                            for r in load("rentals_12m_new_vs_renewal.json")["rows"]],
}

# ── 12 months by building (market sales; rentals of every kind) ──
by_sales = []
for f in ["sales_12m_by_building_p1.json", "sales_12m_by_building_p2.json"]:
    for r in load(f)["rows"]:
        name, project = building(r["location_slug"], r["location_name"], UNNAMED_GROUP)
        by_sales.append({"building": name, "project": project, "basis": BASIS[r["market_basis"]], "count": r["count_rows"],
                         "medianPsf": r0(r["median_sale_psf"]), "p25Psf": r0(r["p25_sale_psf"]), "p75Psf": r0(r["p75_sale_psf"]),
                         "medianPrice": r0(r["median_sale_price"])})
by_rent = []
for r in load("rentals_12m_by_building.json")["rows"]:
    name, project = building(r["location_slug"], r["location_name"], UNNAMED_GROUP)
    by_rent.append({"building": name, "project": project, "count": r["count_rows"], "medianRent": r0(r["median_annual_rent"]),
                    "p25Rent": r0(r["p25_annual_rent"]), "p75Rent": r0(r["p75_annual_rent"]),
                    "medianRentPsf": r0(r["median_annual_rent_psf"])})

ready = [s for s in sales if s["basis"] == "ready"]
off = [s for s in sales if s["basis"] == "offplan"]
out = {
    "source": {
        "name": "Dubai Land Department",
        "basis": "Dubai Land Department registration records",
        "coverage": coverage,
        "snapshotDate": SNAPSHOT,
        "filters": "Market sales only: related-party transfers and completion re-registrations of the same purchase are left out. Apartments only in the 12-month summaries.",
    },
    "window": {"from": window[0], "to": window[1], "label": f"12 months to {w_to.day} {calendar.month_name[w_to.month]} {w_to.year}"},
    "recent": {
        "readySales": {"count": len(ready), "from": ready[-1]["date"], "to": ready[0]["date"]},
        "offplanSales": {"count": len(off), "from": off[-1]["date"], "to": off[0]["date"]},
        "rentals": {"count": len(rentals), "from": rentals[-1]["registered"], "to": rentals[0]["registered"],
                    "newContracts": sum(1 for r in rentals if r["newContract"])},
    },
    "summary": summary,
    "byBuilding": {"sales": by_sales, "rentals": by_rent},
    "sales": sales,
    "rentals": rentals,
}
open(OUT, "w", encoding="utf-8").write(json.dumps(out, indent=1, ensure_ascii=False))
print("wrote", OUT, "| coverage:", coverage, "| window:", window)
print("latest: ready", out["recent"]["readySales"], "| off-plan", out["recent"]["offplanSales"], "| rentals", out["recent"]["rentals"])
unmapped = collections.Counter(b["building"] for b in by_sales + by_rent if b["project"] is None)
print("buildings without a site project (12 months):", len(unmapped))
