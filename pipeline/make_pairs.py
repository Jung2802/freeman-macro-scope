"""Generates config/countries/<pair>.json: currency comparisons (exogenous drivers).

Every pair compares the base currency's economy with the quote currency's. A plus
score means a tailwind for the base currency. Run

    python pipeline/make_pairs.py

audusd.json is maintained by hand and is not touched. Series ids checked live on FRED (2026-11).
"""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "config" / "countries"


def T(de, en):
    return {"de": de, "en": en}


# One entry per currency: where its economy's data comes from.
# infl_m: monthly price index (yoy is computed); infl_a: annual inflation in % (World Bank).
SIDES = {
    "USD": {"region": T("die USA", "the US"), "regionN": T("USA", "US"), "in": T("in den USA", "in the US"), "lands": [("us", T("USA", "United States"))],
            "gdp": "GDPC1", "policy": "FEDFUNDS", "t10": "GS10", "infl_m": "CPIAUCSL", "unemp": "UNRATE",
            "stocks": ["SPASTT01USM661N"], "cb": T("Fed", "Fed")},
    "EUR": {"region": T("der Euroraum", "the euro area"), "regionN": T("Euroraum", "Euro area"), "in": T("im Euroraum", "in the euro area"),
            "lands": [("de", T("Deutschland", "Germany")), ("fr", T("Frankreich", "France")), ("it", T("Italien", "Italy")), ("es", T("Spanien", "Spain"))],
            "gdp": "CLVMNACSCAB1GQEA19", "policy": "ECBDFR", "t10": "IRLTLT01DEM156N", "infl_m": "CP0000EZ19M086NEST", "unemp": None,
            "stocks": ["SPASTT01DEM661N", "SPASTT01FRM661N", "SPASTT01ITM661N", "SPASTT01ESM661N"], "cb": T("EZB", "ECB")},
    "GBP": {"region": T("das Vereinigte Königreich", "the UK"), "regionN": T("UK", "UK"), "in": T("im Vereinigten Königreich", "in the UK"), "lands": [("gb", T("Vereinigtes Königreich", "United Kingdom"))],
            "gdp": "NGDPRSAXDCGBQ", "policy": "IRSTCI01GBM156N", "t10": "IRLTLT01GBM156N", "infl_a": "FPCPITOTLZGGBR", "unemp": "LRHUTTTTGBM156S",
            "stocks": ["SPASTT01GBM661N"], "cb": T("BoE", "BoE")},
    "JPY": {"region": T("Japan", "Japan"), "regionN": T("Japan", "Japan"), "in": T("in Japan", "in Japan"), "lands": [("jp", T("Japan", "Japan"))],
            "gdp": "NGDPRSAXDCJPQ", "policy": "IRSTCI01JPM156N", "t10": "IRLTLT01JPM156N", "infl_a": "FPCPITOTLZGJPN", "unemp": "LRHUTTTTJPM156S",
            "stocks": ["SPASTT01JPM661N"], "cb": T("BoJ", "BoJ")},
    "CAD": {"region": T("Kanada", "Canada"), "regionN": T("Kanada", "Canada"), "in": T("in Kanada", "in Canada"), "lands": [("ca", T("Kanada", "Canada"))],
            "gdp": "NGDPRSAXDCCAQ", "policy": "IRSTCI01CAM156N", "t10": "IRLTLT01CAM156N", "infl_a": "FPCPITOTLZGCAN", "unemp": "LRHUTTTTCAM156S",
            "stocks": ["SPASTT01CAM661N"], "cb": T("BoC", "BoC")},
}

# FRED daily spot rates, as a formula over these names.
SPOT_INPUTS = {"eu": "DEXUSEU", "uk": "DEXUSUK", "jp": "DEXJPUS", "ca": "DEXCAUS"}
PAIRS = [
    # base, quote, formula over SPOT_INPUTS, decimals, oil direction (None = not shown)
    ("EUR", "USD", "eu", 4, None),
    ("GBP", "USD", "uk", 4, None),
    ("USD", "JPY", "jp", 2, 1),
    ("USD", "CAD", "ca", 4, -1),
    ("EUR", "GBP", "eu / uk", 4, None),
    ("EUR", "JPY", "eu * jp", 2, None),
    ("GBP", "JPY", "uk * jp", 2, None),
    ("EUR", "CAD", "eu * ca", 4, -1),
]

FRED = "https://fred.stlouisfed.org/series/"
SOURCE_NAMES = {
    "GDPC1": "U.S. Bureau of Economic Analysis – Real GDP", "FEDFUNDS": "Federal Reserve – Effective Federal Funds Rate",
    "GS10": "Federal Reserve – 10-Year Treasury Yield", "CPIAUCSL": "U.S. Bureau of Labor Statistics – CPI", "UNRATE": "U.S. Bureau of Labor Statistics – Unemployment Rate",
    "CLVMNACSCAB1GQEA19": "Eurostat – Real GDP, euro area", "ECBDFR": "European Central Bank – Deposit Facility Rate",
    "IRLTLT01DEM156N": "OECD – 10-Year Bund Yield (euro benchmark)", "CP0000EZ19M086NEST": "Eurostat – HICP, euro area",
    "DEXUSEU": "Federal Reserve H.10 – USD per EUR", "DEXUSUK": "Federal Reserve H.10 – USD per GBP",
    "DEXJPUS": "Federal Reserve H.10 – JPY per USD", "DEXCAUS": "Federal Reserve H.10 – CAD per USD",
    "MCOILWTICO": "U.S. Energy Information Administration – WTI Crude Oil Price",
}


def name_of(sid):
    if sid in SOURCE_NAMES:
        return SOURCE_NAMES[sid]
    if sid.startswith("NGDPRSAXDC"):
        return "IMF International Financial Statistics – Real GDP"
    if sid.startswith("IRSTCI01"):
        return "OECD – Overnight interbank rate (policy-rate proxy)"
    if sid.startswith("IRLTLT01"):
        return "OECD – 10-Year Government Bond Yield"
    if sid.startswith("FPCPITOTLZG"):
        return "World Bank – Inflation, consumer prices"
    if sid.startswith("LRHUTTTT"):
        return "OECD – Harmonised Unemployment Rate"
    if sid.startswith("SPASTT01"):
        return "OECD – Share Prices"
    return "FRED"


def srcs(*ids):
    return [{"name": f"{name_of(i)} (via FRED: {i})", "url": FRED + i} for i in ids]


def fill(obj, ctx):
    return {k: v.format(**{n: (x[k] if isinstance(x, dict) else x) for n, x in ctx.items()}) for k, v in obj.items()}


def pair_config(base, quote, spot, dec, oil):
    A, B = SIDES[base], SIDES[quote]
    pid = (base + quote).lower()
    code = f"{base}/{quote}"
    ctx = {"A": base, "B": quote, "a": A["region"], "b": B["region"], "ia": A["in"], "ib": B["in"], "aN": A["regionN"], "bN": B["regionN"], "ca": A["cb"], "cb": B["cb"]}
    f = lambda o: fill(o, ctx)
    inds = []

    def add(**kw):
        for k in ("name", "short", "unit", "description", "interpretation", "replaces"):
            if k in kw:
                kw[k] = f(kw[k])
        kw["zones"] = {z: f(v) for z, v in kw["zones"].items()}
        kw.setdefault("transform", "level")
        kw.setdefault("license", "citation")
        kw.setdefault("gdpRegression", False)
        inds.append(kw)

    # the exchange rate itself
    names = {"eu": "DEXUSEU", "uk": "DEXUSUK", "jp": "DEXJPUS", "ca": "DEXCAUS"}
    used = [n for n in names if n in spot.replace("/", " ").replace("*", " ").split()]
    add(id="spot", category="fx", code=code, decimals=dec, frequency="M",
        name=T("Wechselkurs {A}/{B}", "Exchange Rate {A}/{B}"), short=T("Kurs {A}/{B}", "{A}/{B} Rate"),
        unit=T("{B} je {A}", "{B} per {A}"), inputs={n: {"fred": names[n]} for n in used}, formula=spot,
        threshold="mean", zones={"above": T("{A} über Durchschnitt", "{A} above average"), "below": T("{A} unter Durchschnitt", "{A} below average")},
        direction=0, license="public", sources=srcs(*[names[n] for n in used]),
        description=T("Wie viele {B} ein {A} kostet (Monatsdurchschnitt der täglichen Kurse der Federal Reserve)." + (" Der Kreuzkurs wird aus den Dollarkursen beider Währungen berechnet." if len(used) > 1 else ""),
                      "How many {B} one {A} costs (monthly average of the Federal Reserve's daily rates)." + (" The cross rate is computed from both currencies' dollar rates." if len(used) > 1 else "")),
        interpretation=T("Das ist die Größe, die die anderen Treiber erklären sollen. Sie bekommt deshalb keinen eigenen Score. Vergleiche ihre Richtung mit dem Gesamt-Score: Laufen beide lange auseinander, ist der Kurs entweder überdehnt oder andere Kräfte (Risikostimmung, Kapitalflüsse) dominieren.",
                         "This is what the other drivers are meant to explain, so it is not scored. Compare its direction with the total score: if the two diverge for long, the rate is either stretched or other forces (risk sentiment, capital flows) dominate."))

    add(id="rel_gdp", category="growth", code="GDP-DIFF", decimals=2, frequency="Q",
        name=T("Relatives BIP-Wachstum ({aN} − {bN})", "Relative GDP Growth ({aN} − {bN})"), short=T("Relatives BIP-Wachstum", "Relative GDP Growth"),
        unit=T("Prozentpunkte", "Percentage points"),
        inputs={"a": {"fred": A["gdp"], "transform": "yoy"}, "b": {"fred": B["gdp"], "transform": "yoy"}}, formula="a - b",
        threshold=0, zones={"above": T("{aN} wächst schneller", "{aN} grows faster"), "below": T("{bN} wächst schneller", "{bN} grows faster")},
        direction=1, sources=srcs(A["gdp"], B["gdp"]),
        description=T("Reales BIP-Wachstum ggü. Vorjahr {ia} minus {ib}.", "Real GDP growth year on year {ia} minus {ib}."),
        interpretation=T("Über 0: Die Wirtschaft {ia} wächst schneller. Das zieht tendenziell Kapital an und stützt den {A}. Unter 0: Rückenwind für den {B}.",
                         "Above 0: the economy {ia} grows faster, which tends to attract capital and support the {A}. Below 0: tailwind for the {B}."))

    add(id="rate_diff", category="carry", code="IR-DIFF", decimals=2, frequency="M",
        name=T("Leitzinsdifferenz & Carry ({ca} − {cb})", "Policy Rate Differential & Carry ({ca} − {cb})"), short=T("Leitzinsdifferenz", "Policy Rate Gap"),
        unit=T("Prozentpunkte", "Percentage points"), inputs={"a": {"fred": A["policy"]}, "b": {"fred": B["policy"]}}, formula="a - b",
        threshold=0, zones={"above": T("Zinsvorteil {A}", "Yield advantage {A}"), "below": T("Zinsvorteil {B}", "Yield advantage {B}")},
        direction=1, sources=srcs(A["policy"], B["policy"]),
        description=T("Leitzins (bzw. Tagesgeldsatz) {ia} minus {ib}. Die Differenz ist der Zinsvorteil (Carry), den man beim Halten von {A} statt {B} erhält.",
                      "Policy (or overnight) rate {ia} minus {ib}. The difference is the carry earned by holding {A} instead of {B}."),
        interpretation=T("Über 0: der {A} bringt mehr Zins, Carry-Kapital fließt eher in den {A}. Wichtiger als das Niveau ist oft die Richtung: Steigt die Differenz, weil {ca} strafft oder {cb} lockert, bekommt der {A} Rückenwind.",
                         "Above 0: the {A} yields more and carry capital tends to flow into it. Direction often matters more than level: when the gap widens because the {ca} tightens or the {cb} eases, the {A} gains."))

    add(id="yield_diff", category="carry", code="10Y-DIFF", decimals=2, frequency="M",
        name=T("Renditedifferenz 10 Jahre ({aN} − {bN})", "10-Year Yield Differential ({aN} − {bN})"), short=T("Renditedifferenz 10J", "10Y Yield Gap"),
        unit=T("Prozentpunkte", "Percentage points"), inputs={"a": {"fred": A["t10"]}, "b": {"fred": B["t10"]}}, formula="a - b",
        threshold=0, zones={"above": T("Renditevorteil {A}", "Yield advantage {A}"), "below": T("Renditevorteil {B}", "Yield advantage {B}")},
        direction=1, sources=srcs(A["t10"], B["t10"]),
        description=T("Rendite 10-jähriger Staatsanleihen {ia} minus {ib}." + (" Für den Euroraum dient die deutsche Bundesanleihe als Referenz." if "EUR" in (base, quote) else ""),
                      "10-year government bond yield {ia} minus {ib}." + (" For the euro area the German Bund is the benchmark." if "EUR" in (base, quote) else "")),
        interpretation=T("Langfristige Zinsen spiegeln Wachstums- und Inflationserwartungen. Ein steigender Vorsprung zieht Anleihekäufer an und stützt den {A}.",
                         "Long-term yields reflect growth and inflation expectations. A widening lead attracts bond buyers and supports the {A}."))

    if A.get("infl_m") and B.get("infl_m"):
        inp = {"a": {"fred": A["infl_m"], "transform": "yoy"}, "b": {"fred": B["infl_m"], "transform": "yoy"}}
        freq, unit = "M", T("Prozentpunkte", "Percentage points")
        ids = (A["infl_m"], B["infl_m"])
    else:
        side = lambda S: {"fred": S["infl_a"]} if S.get("infl_a") else {"fred": S["infl_m"], "transform": "yoy"}
        inp = {"a": side(A), "b": side(B)}
        freq, unit = "A", T("Prozentpunkte (Jahresdurchschnitt)", "Percentage points (annual average)")
        ids = (inp["a"]["fred"], inp["b"]["fred"])
    add(id="infl_diff", category="prices", code="CPI-DIFF", decimals=2, frequency=freq,
        name=T("Inflationsdifferenz ({aN} − {bN})", "Inflation Differential ({aN} − {bN})"), short=T("Inflationsdifferenz", "Inflation Gap"),
        unit=unit, inputs=inp, formula="a - b", threshold=0,
        zones={"above": T("Höhere Inflation in {aN}", "Higher inflation in {aN}"), "below": T("Höhere Inflation in {bN}", "Higher inflation in {bN}")},
        direction=-1, sources=srcs(*ids),
        description=T("Inflationsrate {ia} minus {ib}." + (" Für UK, Japan und Kanada gibt es über FRED nur noch jährliche Verbraucherpreise, deshalb ist diese Reihe jährlich." if freq == "A" else ""),
                      "Inflation rate {ia} minus {ib}." + (" For the UK, Japan and Canada FRED only has annual consumer prices now, so this series is annual." if freq == "A" else "")),
        interpretation=T("Höhere Inflation zehrt auf Dauer an der Kaufkraft einer Währung (Kaufkraftparität). Im Score zählt eine höhere Inflation {ia} deshalb negativ für den {A}. Kurzfristig kann sie den {A} aber stützen, wenn die Notenbank deswegen die Zinsen erhöht, siehe Zinsdifferenz.",
                         "Higher inflation erodes a currency's purchasing power over time (purchasing power parity). In the score higher inflation {ia} therefore counts against the {A}. In the short run it can support the {A} if the central bank raises rates in response, see the rate gap."))

    if A.get("unemp") and B.get("unemp"):
        add(id="unemp_diff", category="growth", code="UR-DIFF", decimals=2, frequency="M",
            name=T("Arbeitslosenquote-Differenz ({aN} − {bN})", "Unemployment Rate Differential ({aN} − {bN})"), short=T("Arbeitsmarkt-Differenz", "Unemployment Gap"),
            unit=T("Prozentpunkte", "Percentage points"), inputs={"a": {"fred": A["unemp"]}, "b": {"fred": B["unemp"]}}, formula="a - b",
            threshold="median", zones={"above": T("Arbeitsmarkt {bN} relativ stärker", "{bN} labour market relatively stronger"), "below": T("Arbeitsmarkt {aN} relativ stärker", "{aN} labour market relatively stronger")},
            direction=-1, sources=srcs(A["unemp"], B["unemp"]),
            description=T("Arbeitslosenquote {ia} minus {ib}. Weil die Quoten strukturell verschieden hoch sind, dient der historische Median als Schwelle.",
                          "Unemployment rate {ia} minus {ib}. Because the rates differ structurally, the historical median is the threshold."),
            interpretation=T("Sinkt die Differenz, verbessert sich der Arbeitsmarkt {ia} relativ. Das spricht für Wachstum und straffere Geldpolitik und stützt den {A}.",
                             "A falling gap means the labour market {ia} is improving relatively, which points to growth and tighter policy and supports the {A}."))

    sa = A["stocks"]
    a_inp = {f"a{i}": {"fred": s, "transform": "yoy"} for i, s in enumerate(sa)}
    b_inp = {f"b{i}": {"fred": s, "transform": "yoy"} for i, s in enumerate(B["stocks"])}
    fa = f"mean({', '.join(a_inp)})" if len(a_inp) > 1 else "a0"
    fb = f"mean({', '.join(b_inp)})" if len(b_inp) > 1 else "b0"
    euro_note = (" Für den Euroraum ist es der Durchschnitt der Aktienmärkte Deutschlands, Frankreichs, Italiens und Spaniens.", " For the euro area it is the average of the German, French, Italian and Spanish markets.") if "EUR" in (base, quote) else ("", "")
    add(id="rel_stocks", category="wealth", code="EQ-DIFF", decimals=1, frequency="M",
        name=T("Relative Aktienrendite ({aN} − {bN}, Vorjahr)", "Relative Stock Returns ({aN} − {bN}, year on year)"), short=T("Relative Aktienrendite", "Relative Stock Returns"),
        unit=T("Prozentpunkte", "Percentage points"), inputs={**a_inp, **b_inp}, formula=f"{fa} - {fb}", threshold=0,
        zones={"above": T("Aktien {aN} stärker", "{aN} stocks stronger"), "below": T("Aktien {bN} stärker", "{bN} stocks stronger")},
        direction=1, sources=srcs(*sa, *B["stocks"]),
        description=T("Jahresveränderung der Aktienkurse {ia} minus {ib} (OECD-Indizes in Landeswährung)." + euro_note[0],
                      "Year-on-year change in share prices {ia} minus {ib} (OECD indices in local currency)." + euro_note[1]),
        interpretation=T("Über 0: die Börse {ia} läuft besser, ausländisches Kapital fließt eher dorthin und stützt den {A}.",
                         "Above 0: the stock market {ia} outperforms, foreign capital tends to flow there and support the {A}."))

    if oil is not None:
        cad = "CAD" in (base, quote)
        add(id="oil", category="trade", code="WTI", decimals=1, frequency="M",
            name=T("Ölpreis (WTI)", "Oil Price (WTI)"), short=T("Ölpreis", "Oil Price"), unit=T("USD je Barrel", "USD per barrel"),
            inputs={"p": {"fred": "MCOILWTICO"}}, formula="p", threshold="median",
            zones={"above": T("Teuer", "High"), "below": T("Billig", "Low")}, direction=oil, license="public", sources=srcs("MCOILWTICO"),
            description=T("Preis für ein Barrel US-Rohöl (WTI, Monatsdurchschnitt). " + ("Rohöl ist Kanadas wichtigstes Exportgut: Steigt der Ölpreis, brauchen Käufer mehr CAD." if cad else "Japan importiert fast sein gesamtes Öl: Steigt der Ölpreis, muss das Land mehr Fremdwährung kaufen, das belastet den JPY."),
                          "Price of a barrel of US crude (WTI, monthly average). " + ("Crude is Canada's most important export: when oil rises, buyers need more CAD." if cad else "Japan imports almost all its oil: when oil rises, it must buy more foreign currency, which weighs on the JPY.")),
            interpretation=T(("Hoher Ölpreis = Rückenwind für den CAD, also Minus-Score für {A}/{B}." if cad else "Hoher Ölpreis = Gegenwind für den JPY, also Plus-Score für {A}/{B}."),
                             ("High oil = tailwind for the CAD, i.e. a minus score for {A}/{B}." if cad else "High oil = headwind for the JPY, i.e. a plus score for {A}/{B}.")))

    selector = [{"land": l, "landName": n, "group": "exogenous", "vs": quote} for l, n in A["lands"]]
    selector += [{"land": l, "landName": n, "group": "exogenous", "vs": base} for l, n in B["lands"]]
    cats = [("fx", "neutral", "#e9e9e9", T("Wechselkurs", "Exchange Rate")),
            ("growth", "growth", "#a3e635", T("Relatives Wachstum & Arbeitsmarkt", "Relative Growth & Labour")),
            ("carry", "growth", "#60a5fa", T("Zinsdifferenz & Carry", "Interest Rate Differential & Carry")),
            ("prices", "growth", "#f472b6", T("Inflation & Kaufkraft", "Inflation & Purchasing Power")),
            ("trade", "growth", "#22d3ee", T("Rohstoffe & Handel", "Commodities & Trade")),
            ("wealth", "growth", "#f59e0b", T("Aktienmarkt / Relativer Wohlstand", "Stock Markets / Relative Wealth"))]
    used = {i["category"] for i in inds}
    cfg = {
        "id": pid, "name": T(code, code), "currency": code, "selector": selector,
        "texts": {
            "ov.subtitle": f(T("{aN} gegen {bN}: Welche der beiden Wirtschaften ist gerade stärker? Die wichtigsten Treiber des Wechselkurses {A}/{B} an einem Ort, einfach bewertet und mit Quellen.",
                               "{aN} versus {bN}: which of the two economies is stronger right now? The key drivers of the {A}/{B} exchange rate in one place, simply scored and with sources.")),
            "ov.scoreSentence": f(T("{{pos}} von {{n}} bewerteten Treibern sprechen aktuell für den {A} (Score > 0), {{neg}} für den {B} (Score < 0).",
                                    "{{pos}} of {{n}} scored drivers currently favour the {A} (score > 0), {{neg}} favour the {B} (score < 0).")),
            "ov.scoreLegend": f(T("+ = Vorteil {aN} / Rückenwind für {A}, − = Vorteil {bN} / Rückenwind für {B}. Statistische Zusammenfassung, keine Empfehlung.",
                                  "+ = advantage {aN} / tailwind for {A}, − = advantage {bN} / tailwind for {B}. Statistical summary, not a recommendation.")),
            "info.dirPos": f(T("höherer Wert = Rückenwind für {A} (+)", "higher = tailwind for {A} (+)")),
            "info.dirNeg": f(T("höherer Wert = Rückenwind für {B} (−)", "higher = tailwind for {B} (−)")),
        },
        "groups": [{"id": "exogenous", "name": T("Währungsvergleich · exogene Treiber", "Currency comparison · exogenous drivers"),
                    "description": f(T("Ein Wechselkurs ist immer ein Vergleich zweier Wirtschaftsräume. Darum stehen hier {a} und {b} direkt nebeneinander: Wer wächst schneller, bietet höhere Zinsen, hat die stabileren Preise und die stärkere Börse? Wo {a} vorne liegt, fließt tendenziell Geld dorthin und der {A} steigt gegenüber dem {B}. Plus heißt also: Rückenwind für den {A}, Minus: Rückenwind für den {B}.",
                                       "An exchange rate always compares two economies. So {a} and {b} stand side by side here: which grows faster, pays higher rates, has more stable prices and the stronger stock market? Where {a} leads, money tends to flow there and the {A} rises against the {B}. Plus means a tailwind for the {A}, minus a tailwind for the {B}."))}],
        "categories": [{"id": c, "group": "exogenous", "tone": tone, "color": col, "name": n} for c, tone, col, n in cats if c in used],
        "indicators": inds,
    }
    if "USD" in (base, quote):
        cfg["recession"] = {"fred": "USREC", "source": {"name": "NBER Business Cycle Dating Committee (via FRED: USREC)",
                                                        "url": "https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions"}}
    return cfg


def main():
    for p in PAIRS:
        cfg = pair_config(*p)
        path = OUT / f"{cfg['id']}.json"
        path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {path.name}  ({len(cfg['indicators'])} indicators)")


if __name__ == "__main__":
    main()
