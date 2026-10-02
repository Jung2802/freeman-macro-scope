"""FreemanMacroScope data pipeline.

Reads every country config in config/countries/*.json, downloads the raw series
(FRED CSV endpoint, no API key needed), resamples them to the indicator's
frequency, evaluates the indicator formula, applies the display transform and
writes static JSON files to site/data/<country>/ for the website.

Standard library only, so it runs unchanged on GitHub Actions.

Usage:
    python pipeline/fetch.py              # all countries
    python pipeline/fetch.py --only us    # one country
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import math
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = ROOT / "config" / "countries"
OUT_DIR = ROOT / "site" / "data"

FRED_CSV = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={id}"
USER_AGENT = "FreemanMacroScope-DataBot/1.0 (+https://github.com/)"

# How old the latest observation may be before it is flagged as stale (days).
STALE_AFTER = {"M": 100, "Q": 200, "A": 500}
YOY_LAG = {"M": 12, "Q": 4, "A": 1}

_raw_cache: dict[str, list[tuple[date, float]]] = {}


# ── download ────────────────────────────────────────────────────────────────

def fetch_fred(series_id: str, retries: int = 4) -> list[tuple[date, float]]:
    if series_id in _raw_cache:
        return _raw_cache[series_id]
    url = FRED_CSV.format(id=series_id)
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=60) as resp:
                text = resp.read().decode("utf-8")
            if not text.startswith("observation_date") and not text.startswith("DATE"):
                raise ValueError(f"unexpected response for {series_id}: {text[:80]!r}")
            rows = []
            for rec in csv.reader(io.StringIO(text)):
                if not rec or rec[0] in ("observation_date", "DATE"):
                    continue
                raw = rec[1].strip()
                if raw in ("", "."):
                    continue
                rows.append((date.fromisoformat(rec[0]), float(raw)))
            if not rows:
                raise ValueError(f"no observations for {series_id}")
            _raw_cache[series_id] = rows
            return rows
        except (urllib.error.URLError, ValueError, TimeoutError) as err:
            last_err = err
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"download failed for {series_id}: {last_err}")


# ── time handling ───────────────────────────────────────────────────────────

def period_start(d: date, freq: str) -> date:
    if freq == "M":
        return date(d.year, d.month, 1)
    if freq == "Q":
        return date(d.year, 3 * ((d.month - 1) // 3) + 1, 1)
    if freq == "A":
        return date(d.year, 1, 1)
    raise ValueError(f"unknown frequency {freq}")


def period_end(start: date, freq: str) -> date:
    months = {"M": 1, "Q": 3, "A": 12}[freq]
    m = start.month - 1 + months
    nxt = date(start.year + m // 12, m % 12 + 1, 1)
    return date.fromordinal(nxt.toordinal() - 1)


def shift_years(d: date, years: int) -> date:
    return date(d.year + years, d.month, d.day)


def resample(rows: list[tuple[date, float]], freq: str) -> tuple[dict[date, float], bool]:
    """Average observations into periods. Returns (series, last_period_is_partial)."""
    buckets: dict[date, list[float]] = {}
    for d, v in rows:
        buckets.setdefault(period_start(d, freq), []).append(v)
    out = {k: sum(v) / len(v) for k, v in buckets.items()}
    # A period is partial when the source is finer than the target and the
    # source has not reached the end of the last period yet.
    last_src = rows[-1][0]
    last_key = max(out)
    partial = _source_is_finer(rows, freq) and last_src < period_end(last_key, freq) - _tolerance(rows)
    return dict(sorted(out.items())), partial


def _source_is_finer(rows: list[tuple[date, float]], freq: str) -> bool:
    if len(rows) < 3:
        return False
    gap = (rows[-1][0] - rows[-3][0]).days / 2
    return gap < {"M": 25, "Q": 80, "A": 300}[freq]


def _tolerance(rows: list[tuple[date, float]]):
    """Allow the last source observation to be one source-interval before period end."""
    from datetime import timedelta
    if len(rows) < 2:
        return timedelta(0)
    return timedelta(days=max(1, (rows[-1][0] - rows[-2][0]).days))


def yoy(series: dict[date, float]) -> dict[date, float]:
    out = {}
    for d, v in series.items():
        prev = series.get(shift_years(d, -1))
        if prev not in (None, 0):
            out[d] = (v / prev - 1) * 100
    return out


# ── formula evaluation ──────────────────────────────────────────────────────

def _mean(*vals: float) -> float:
    return sum(vals) / len(vals)


SAFE_FUNCS = {"mean": _mean, "abs": abs, "min": min, "max": max}


def evaluate(formula: str, inputs: dict[str, dict[date, float]]) -> dict[date, float]:
    code = compile(formula, "<formula>", "eval")
    for name in code.co_names:
        if name not in inputs and name not in SAFE_FUNCS:
            raise ValueError(f"formula uses unknown name {name!r}")
    keys = set.intersection(*(set(s) for s in inputs.values()))
    out = {}
    for d in sorted(keys):
        env = {name: s[d] for name, s in inputs.items()}
        val = eval(code, {"__builtins__": {}, **SAFE_FUNCS}, env)  # noqa: S307 - names validated above
        if isinstance(val, (int, float)) and math.isfinite(val):
            out[d] = float(val)
    return out


# ── build one indicator ─────────────────────────────────────────────────────

def round_sig(v: float, digits: int = 6) -> float:
    if v == 0:
        return 0.0
    return round(v, max(0, digits - int(math.floor(math.log10(abs(v)))) - 1))


def build_indicator(ind: dict) -> dict:
    freq = ind["frequency"]
    inputs: dict[str, dict[date, float]] = {}
    input_meta = []
    partial = False
    for name, spec in ind["inputs"].items():
        raw = fetch_fred(spec["fred"])
        series, is_partial = resample(raw, freq)
        partial = partial or is_partial
        if spec.get("transform") == "yoy":
            series = yoy(series)
        inputs[name] = series
        input_meta.append({
            "key": name,
            "fred": spec["fred"],
            "url": f"https://fred.stlouisfed.org/series/{spec['fred']}",
            "first": raw[0][0].isoformat(),
            "last": raw[-1][0].isoformat(),
        })

    base = evaluate(ind["formula"], inputs)
    if not base:
        raise RuntimeError("formula produced no observations")
    values = yoy(base) if ind.get("transform") == "yoy" else base
    if ind.get("transform") not in (None, "level", "yoy"):
        raise ValueError(f"unknown transform {ind['transform']}")

    last = max(values)
    stale = (date.today() - period_end(last, freq)).days > STALE_AFTER[freq]
    out = {
        "id": ind["id"],
        "frequency": freq,
        "transform": ind.get("transform", "level"),
        "first": min(values).isoformat(),
        "last": last.isoformat(),
        "partialLast": partial,
        "stale": stale,
        "inputs": input_meta,
        "values": [[d.isoformat()[:7] if freq != "A" else d.isoformat()[:4], round_sig(v)] for d, v in values.items()],
    }
    if ind.get("transform") == "yoy":
        out["base"] = [[d.isoformat()[:7] if freq != "A" else d.isoformat()[:4], round_sig(v, 8)] for d, v in base.items()]
    return out


def build_recessions(fred_id: str) -> list[list[str]]:
    rows = fetch_fred(fred_id)
    spans, start, prev = [], None, None
    for d, v in rows:
        if v >= 0.5 and start is None:
            start = d
        if v < 0.5 and start is not None:
            spans.append([start.isoformat()[:7], prev.isoformat()[:7]])
            start = None
        prev = d
    if start is not None:
        spans.append([start.isoformat()[:7], None])
    return spans


# ── main ────────────────────────────────────────────────────────────────────

def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(path)


def run_country(cfg_path: Path) -> tuple[dict, list[str]]:
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    cid = cfg["id"]
    out_dir = OUT_DIR / cid
    errors: list[str] = []
    status: dict[str, dict] = {}

    for ind in cfg["indicators"]:
        target = out_dir / f"{ind['id']}.json"
        try:
            data = build_indicator(ind)
            write_json(target, data)
            status[ind["id"]] = {"ok": True, "last": data["last"], "stale": data["stale"], "n": len(data["values"])}
            print(f"  ✓ {cid}/{ind['id']:<16} {len(data['values']):>5} obs  last {data['last']}" + ("  (STALE)" if data["stale"] else ""))
        except Exception as err:  # keep previous file, report the failure
            errors.append(f"{cid}/{ind['id']}: {err}")
            status[ind["id"]] = {"ok": False, "error": str(err), "kept": target.exists()}
            print(f"  ✗ {cid}/{ind['id']}: {err}", file=sys.stderr)

    try:
        write_json(out_dir / "recessions.json", build_recessions(cfg["recession"]["fred"]))
    except Exception as err:
        errors.append(f"{cid}/recessions: {err}")

    # The site reads the config from the data folder so there is one source of truth.
    write_json(out_dir / "config.json", cfg)
    index = {"country": cid, "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"), "indicators": status}
    write_json(out_dir / "index.json", index)
    return {"id": cid, "name": cfg["name"], "currency": cfg.get("currency")}, errors


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="country id to update")
    args = parser.parse_args()

    countries, errors = [], []
    for cfg_path in sorted(CONFIG_DIR.glob("*.json")):
        if args.only and cfg_path.stem != args.only:
            continue
        print(f"[{cfg_path.stem}]")
        meta, errs = run_country(cfg_path)
        countries.append(meta)
        errors.extend(errs)

    if not args.only:
        write_json(OUT_DIR / "countries.json", countries)
    if errors:
        print(f"\n{len(errors)} problem(s):", *errors, sep="\n  ", file=sys.stderr)
    total = sum(len(json.loads(p.read_text(encoding='utf-8'))["indicators"]) for p in CONFIG_DIR.glob("*.json"))
    # Fail the CI run only if most indicators failed (e.g. source down) – partial
    # failures keep the last good file and are reported in index.json.
    return 1 if errors and len(errors) > total / 2 else 0


if __name__ == "__main__":
    sys.exit(main())
