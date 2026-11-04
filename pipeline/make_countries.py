"""Generates config/countries/<id>.json for the international endogenous dashboards.

The countries share one indicator template; only the FRED series ids and a few
country facts differ. Edit the template or COUNTRIES below and run

    python pipeline/make_countries.py

us.json and audusd.json are maintained by hand and are not touched.
Every series id below was checked to be live on FRED (2026-11).
"""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "config" / "countries"

SRC = {
    "oecd_bts": ("OECD – Business Tendency and Consumer Opinion Surveys (via FRED)", "https://www.oecd.org/en/data/datasets/business-tendency-and-consumer-opinion-surveys.html"),
    "oecd_mei": ("OECD – Main Economic Indicators (via FRED)", "https://www.oecd.org/en/data/datasets/main-economic-indicators.html"),
    "oecd_qna": ("OECD – Quarterly National Accounts (via FRED)", "https://www.oecd.org/en/data/datasets/quarterly-national-accounts.html"),
    "oecd_lab": ("OECD – Infra-annual Labour Statistics (via FRED)", "https://www.oecd.org/en/data/datasets/infra-annual-labour-statistics.html"),
    "eurostat_hicp": ("Eurostat – Harmonised Index of Consumer Prices (via FRED)", "https://ec.europa.eu/eurostat/web/hicp"),
    "bis_pp": ("Bank for International Settlements – Residential Property Prices (via FRED)", "https://data.bis.org/topics/RPP"),
    "bis_credit": ("Bank for International Settlements – Credit to the Non-Financial Sector (via FRED)", "https://data.bis.org/topics/TOTAL_CREDIT"),
    "bis_eer": ("Bank for International Settlements – Effective Exchange Rates (via FRED)", "https://data.bis.org/topics/EER"),
    "ecb_rates": ("European Central Bank – Key ECB Interest Rates (via FRED: ECBDFR)", "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"),
    "ecb_bs": ("European Central Bank – Weekly Financial Statement (via FRED: ECBASSETSW)", "https://www.ecb.europa.eu/press/annual-reports-financial-statements/wfs/html/index.en.html"),
    "boj_bs": ("Bank of Japan – Bank of Japan Accounts (via FRED: JPNASSETS)", "https://www.boj.or.jp/en/statistics/boj/other/acmai/index.htm"),
    "imf_debt": ("International Monetary Fund – Fiscal Monitor / World Economic Outlook (via FRED)", "https://www.imf.org/en/Publications/FM"),
    "wb_cpi": ("World Bank – World Development Indicators: Inflation, consumer prices (via FRED)", "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG"),
    "epu": ("Baker, Bloom & Davis – Economic Policy Uncertainty Index (via FRED)", "https://www.policyuncertainty.com/"),
    "indeed": ("Indeed Hiring Lab – Job Postings Index (via FRED)", "https://data.indeed.com/"),
}


def src(*keys, fred=()):
    # `fred` documents which series a source covers; the series links themselves are rendered from `inputs`.
    return [{"name": SRC[k][0], "url": SRC[k][1]} for k in keys]


# ── countries ───────────────────────────────────────────────────────────────
# s = series ids per template key; a key missing here means the indicator is left out.

def ez(iso2, iso3, de, en, de_in, en_in, epu=None, indeed=False, ip=True, svc=True, cons=True, gdpl=True, spread=True, infl_exp=True):
    s = {
        "mfg_conf": f"BSCICP02{iso2}M460S", "constr_conf": f"BCCICP02{iso2}M460S", "capu": f"BSCURT02{iso2}Q160S",
        "hp": f"Q{iso2}R628BIS", "constr_out": f"PRCNTO01{iso2}Q659S",
        "cb_assets": "ECBASSETSW", "credit": f"Q{iso2}PAM770A", "hh_debt": f"Q{iso2}HAM770A", "reer": f"RB{iso2}BIS",
        "policy": "ECBDFR", "t10": f"IRLTLT01{iso2}M156N", "short": f"IRSTCI01{iso2}M156N",
        "hicp": f"CP0000{iso2}M086NEST", "hicp_core": f"00XEFD{iso2}M086NEST",
        "unemp": f"LRHUTTTT{iso2}M156S", "emp": f"LFEMTTTT{iso2}Q647S", "emprate": f"LREMTTTT{iso2}Q156S",
        "gdp": f"NAEXKP01{iso2}Q657S", "retail": f"{iso3}SLRTTO01GYSAM",
        "debt": f"GGGDTA{iso2}A188N", "deficit": f"GGNLBA{iso2}A188N",
    }
    if svc: s["svc_conf"] = f"BVCICP02{iso2}M460S"
    if cons: s["cons_conf"] = f"CSCICP02{iso2}M460S"
    if infl_exp: s["infl_exp"] = f"CSINFT02{iso2}M460S"
    if epu: s["epu"] = epu
    if indeed: s["indeed"] = f"IHLIDX{iso2}"
    if ip: s["ip"] = f"{iso3}PRINTO01GYSAM"
    if gdpl: s["gdp_yoy"] = f"NGDPRSAXDC{iso2}Q"
    if spread: s["bund_spread"] = f"IRLTLT01{iso2}M156N"
    return {"id": iso2.lower(), "name": {"de": de, "en": en}, "in": {"de": de_in, "en": en_in}, "currency": "EUR",
            "euro": True, "cb": {"de": "die Europäische Zentralbank (EZB)", "en": "the European Central Bank (ECB)"},
            "cbShort": {"de": "EZB", "en": "ECB"}, "s": s}


def other(iso2, iso3, de, en, de_in, en_in, cur, cb, cb_short, s):
    return {"id": iso2.lower(), "name": {"de": de, "en": en}, "in": {"de": de_in, "en": en_in}, "currency": cur,
            "euro": False, "cb": cb, "cbShort": cb_short, "s": s}


COUNTRIES = [
    ez("DE", "DEU", "Deutschland", "Germany", "in Deutschland", "in Germany", epu="DEEPUINDXM", indeed=True, ip=False, spread=False),
    ez("FR", "FRA", "Frankreich", "France", "in Frankreich", "in France", indeed=True),
    ez("IT", "ITA", "Italien", "Italy", "in Italien", "in Italy", epu="ITEPUINDXM"),
    ez("ES", "ESP", "Spanien", "Spain", "in Spanien", "in Spain", svc=False, cons=False, gdpl=False, infl_exp=False),
    other("GB", "GBR", "Vereinigtes Königreich", "United Kingdom", "im Vereinigten Königreich", "in the United Kingdom", "GBP",
          {"de": "die Bank of England (BoE)", "en": "the Bank of England (BoE)"}, {"de": "BoE", "en": "BoE"}, {
              "mfg_conf": "BSCICP02GBM460S", "cons_conf": "CSCICP02GBM460S", "epu": "UKEPUINDXM",
              "hp": "QGBR628BIS", "constr_out": "PRCNTO01GBQ659S",
              "credit": "QGBPAM770A", "hh_debt": "QGBHAM770A", "reer": "RBGBBIS",
              "policy": "IRSTCI01GBM156N", "t10": "IRLTLT01GBM156N", "short": "IRSTCI01GBM156N",
              "wb_cpi": "FPCPITOTLZGGBR",
              "unemp": "LRHUTTTTGBM156S", "emp": "LFEMTTTTGBQ647S", "emprate": "LREMTTTTGBQ156S", "indeed": "IHLIDXGB",
              "gdp": "NAEXKP01GBQ657S", "gdp_yoy": "NGDPRSAXDCGBQ", "ip": "GBRPRINTO01GYSAM", "retail": "GBRSLRTTO01GYSAM",
              "debt": "GGGDTAGBA188N", "deficit": "GGNLBAGBA188N"}),
    other("JP", "JPN", "Japan", "Japan", "in Japan", "in Japan", "JPY",
          {"de": "die Bank of Japan (BoJ)", "en": "the Bank of Japan (BoJ)"}, {"de": "BoJ", "en": "BoJ"}, {
              "cons_conf": "CSCICP02JPM460S", "retail_conf": "JPNBRCICP02STSAQ",
              "hp": "QJPR628BIS",
              "cb_assets": "JPNASSETS", "credit": "QJPPAM770A", "hh_debt": "QJPHAM770A", "reer": "RBJPBIS",
              "policy": "IRSTCI01JPM156N", "t10": "IRLTLT01JPM156N", "short": "IRSTCI01JPM156N",
              "wb_cpi": "FPCPITOTLZGJPN",
              "unemp": "LRHUTTTTJPM156S", "emp": "LFEMTTTTJPQ647S", "emprate": "LREMTTTTJPQ156S",
              "gdp": "NAEXKP01JPQ657S", "gdp_yoy": "NGDPRSAXDCJPQ", "ip": "JPNPRINTO01GYSAM", "retail": "JPNSLRTTO01GYSAM",
              "debt": "GGGDTAJPA188N", "deficit": "GGNLBAJPA188N"}),
    other("CA", "CAN", "Kanada", "Canada", "in Kanada", "in Canada", "CAD",
          {"de": "die Bank of Canada (BoC)", "en": "the Bank of Canada (BoC)"}, {"de": "BoC", "en": "BoC"}, {
              "epu": "CANEPUINDXM",
              "hp": "QCAR628BIS", "constr_out": "PRCNTO01CAQ659S",
              "credit": "QCAPAM770A", "hh_debt": "QCAHAM770A", "reer": "RBCABIS",
              "policy": "IRSTCI01CAM156N", "t10": "IRLTLT01CAM156N", "short": "IRSTCI01CAM156N",
              "wb_cpi": "FPCPITOTLZGCAN",
              "unemp": "LRHUTTTTCAM156S", "emp": "LFEMTTTTCAQ647S", "emprate": "LREMTTTTCAQ156S", "indeed": "IHLIDXCA",
              "gdp": "NAEXKP01CAQ657S", "gdp_yoy": "NGDPRSAXDCCAQ", "ip": "CANPRINTO01GYSAM", "retail": "CANSLRTTO01GYSAM",
              "debt": "GGGDTACAA188N", "deficit": "GGNLBACAA188N"}),
]

CATEGORIES = [
    ("surveys", "growth", "#a78bfa", "Frühindikatoren & Umfragen", "Leading Indicators & Surveys"),
    ("housing", "growth", "#f59e0b", "Immobilien & Bau", "Housing & Construction"),
    ("money", "neutral", "#22d3ee", "Geld, Kredit & Währung", "Money, Credit & Currency"),
    ("rates", "neutral", "#60a5fa", "Zinsen", "Interest Rates"),
    ("inflation", "neutral", "#f472b6", "Inflation", "Inflation"),
    ("labour", "growth", "#34d399", "Arbeitsmarkt", "Labour Market"),
    ("activity", "growth", "#a3e635", "Wachstum & Aktivität", "Growth & Activity"),
    ("fiscal", "neutral", "#fb923c", "Staatsfinanzen", "Public Finances"),
]


def T(de, en):
    return {"de": de, "en": en}


def fill(obj, c):
    """Replace {in}, {name}, {cb}, {cbs} placeholders in a {de, en} text."""
    return {lang: obj[lang].format(**{"in": c["in"][lang], "name": c["name"][lang], "cb": c["cb"][lang], "cbs": c["cbShort"][lang]})
            for lang in ("de", "en")}


BAL = T("Saldo (Prozentpunkte)", "Balance (percentage points)")
EXPZ = {"above": T("Über Durchschnitt", "Above average"), "below": T("Unter Durchschnitt", "Below average")}
MEDZ = {"above": T("Über Median", "Above median"), "below": T("Unter Median", "Below median")}
GROWZ = {"above": T("Wachstum", "Growth"), "below": T("Rückgang", "Decline")}
YOY = T("% ggü. Vorjahr", "% year over year")


def ind(c, key, **kw):
    """Builds one indicator from the template entry `key` for country c."""
    sid = c["s"][key]
    base = {
        "id": key, "category": kw.pop("category"), "code": kw.pop("code", sid),
        "name": fill(kw.pop("name"), c), "short": fill(kw.pop("short"), c), "unit": kw.pop("unit"),
        "decimals": kw.pop("decimals", 1), "frequency": kw.pop("frequency", "M"),
        "inputs": kw.pop("inputs", {"v": {"fred": sid}}), "formula": kw.pop("formula", "v"),
        "transform": kw.pop("transform", "level"),
    }
    texts = {k: fill(kw.pop(k), c) for k in ("description", "interpretation", "replaces") if k in kw}
    out = {**base, **kw, "sources": kw.pop("sources", None)}
    out.update(texts)
    out.setdefault("license", "citation")
    out.setdefault("gdpRegression", False)
    return {k: v for k, v in out.items() if v is not None}


def indicators(c):
    s, euro = dict(c["s"]), c["euro"]
    # Derived indicators: present whenever their inputs are.
    s["curve"] = s["t10"]
    if euro:
        s["real_rate"] = s["policy"]
    c = {**c, "s": s}
    out = []
    add = lambda key, **kw: out.append(ind(c, key, **kw)) if key in s else None

    # surveys
    add("mfg_conf", category="surveys", code="BCI-MFG",
        name=T("Industrievertrauen (EU-/OECD-Unternehmensumfrage)", "Industrial Confidence (EU/OECD business survey)"),
        short=T("Industrievertrauen", "Industrial Confidence"), unit=BAL, threshold="mean", zones=EXPZ, direction=1, gdpRegression=True,
        sources=src("oecd_bts", fred=[s.get("mfg_conf", "")]),
        description=T("Monatliche Umfrage unter Industriebetrieben {in} zu Auftragsbestand, Lagern und Produktionserwartungen, zusammengefasst als Saldo: Anteil positiver minus Anteil negativer Antworten. In der EU stammt sie aus dem harmonisierten Umfrageprogramm der Europäischen Kommission und ist das Gegenstück zu den Einkaufsmanagerindizes (PMI), die nur gegen Lizenz verfügbar sind.",
                      "Monthly survey of manufacturers {in} on order books, stocks and production expectations, summarised as a balance: share of positive minus share of negative answers. In the EU it comes from the European Commission's harmonised survey programme and is the counterpart of the purchasing managers' indices (PMI), which are only available under licence."),
        interpretation=T("Als Schwelle dient der langjährige Durchschnitt, denn der Saldo liegt bei manchen Ländern dauerhaft unter 0. Darüber: überdurchschnittliche Stimmung in der Industrie. Die Umfrage läuft der Produktion einige Monate voraus.",
                         "The threshold is the long-run average, because in some countries the balance sits permanently below 0. Above it: above-average sentiment among manufacturers. The survey leads production by a few months."))
    add("svc_conf", category="surveys", code="BCI-SVC",
        name=T("Dienstleistungsvertrauen (EU-Unternehmensumfrage)", "Services Confidence (EU business survey)"),
        short=T("Dienstleistungsvertrauen", "Services Confidence"), unit=BAL, threshold="mean", zones=EXPZ, direction=1, gdpRegression=True,
        sources=src("oecd_bts", fred=[s.get("svc_conf", "")]),
        description=T("Umfrage unter Dienstleistern {in} zu Geschäftslage, Nachfrage der letzten Monate und erwarteter Nachfrage (Saldo). Dienstleistungen sind der größte Teil der Wirtschaftsleistung.",
                      "Survey of service providers {in} on business situation, recent demand and expected demand (balance). Services are the largest part of output."),
        interpretation=T("Über dem Durchschnitt: Dienstleister sind zuversichtlicher als üblich. Fällt der Saldo deutlich, folgen oft schwächerer Konsum und weniger Einstellungen.",
                         "Above average: service firms are more confident than usual. A sharp fall is often followed by weaker consumption and hiring."))
    add("cons_conf", category="surveys", code="CCI",
        name=T("Verbrauchervertrauen", "Consumer Confidence"), short=T("Verbrauchervertrauen", "Consumer Confidence"),
        # Japan's Cabinet Office survey is published as an index (50 = neutral), the EU survey as a balance.
        unit=T("Index (50 = neutral)", "Index (50 = neutral)") if c["id"] == "jp" else BAL,
        threshold="mean", zones={"above": T("Optimistisch", "Optimistic"), "below": T("Pessimistisch", "Pessimistic")}, direction=1, gdpRegression=True,
        sources=src("oecd_bts", fred=[s.get("cons_conf", "")]),
        description=T("Monatliche Umfrage unter Haushalten {in} zu finanzieller Lage, Wirtschaftslage und geplanten größeren Anschaffungen. Der private Konsum ist meist mehr als die Hälfte der Wirtschaftsleistung.",
                      "Monthly household survey {in} on finances, the economic situation and planned major purchases. Private consumption is usually more than half of output."),
        interpretation=T("Die Werte liegen meist dauerhaft auf einer Seite der Nulllinie bzw. der Neutralmarke, deshalb ist der langjährige Durchschnitt die Schwelle. Wichtiger als das Niveau ist die Richtung: steigt das Vertrauen, ziehen Konsum und Einzelhandel meist nach.",
                         "Readings usually stay on one side of zero or the neutral mark, so the long-run average is the threshold. Direction matters more than the level: when confidence rises, consumption and retail sales usually follow."))
    add("retail_conf", category="surveys", code="BCI-RET", frequency="Q",
        name=T("Einzelhandelsvertrauen (Unternehmensumfrage)", "Retail Trade Confidence (business survey)"),
        short=T("Einzelhandelsvertrauen", "Retail Confidence"), unit=BAL, threshold="mean", zones=EXPZ, direction=1, gdpRegression=True,
        sources=src("oecd_bts", fred=[s.get("retail_conf", "")]),
        description=T("Vierteljährliche Umfrage unter Einzelhändlern {in} zur Geschäftslage (Saldo). Ergänzt das Verbrauchervertrauen aus Sicht der Händler.",
                      "Quarterly survey of retailers {in} on their business situation (balance). Complements consumer confidence from the retailers' side."),
        interpretation=T("Über dem Durchschnitt: Händler melden eine bessere Lage als üblich. Für Japan gibt es keine monatliche Industrieumfrage über FRED; diese Reihe ist der beste verfügbare Stimmungsindikator der Unternehmen.",
                         "Above average: retailers report better conditions than usual. For Japan no monthly manufacturing survey is available via FRED; this series is the best available business-sentiment gauge."))
    add("epu", category="surveys", code="EPU",
        name=T("Wirtschaftspolitische Unsicherheit (EPU-Index)", "Economic Policy Uncertainty (EPU index)"),
        short=T("Politische Unsicherheit", "Policy Uncertainty"), unit=T("Index (Ø = 100)", "Index (mean = 100)"), decimals=0,
        threshold="median", zones={"above": T("Erhöht", "Elevated"), "below": T("Niedrig", "Low")}, direction=-1, gdpRegression=True,
        sources=src("epu", fred=[s.get("epu", "")]),
        description=T("Zählt, wie oft große Zeitungen {in} über Unsicherheit in der Wirtschaftspolitik berichten (Steuern, Regulierung, Geldpolitik, Handel). Ein Wert von 100 entspricht dem langjährigen Durchschnitt.",
                      "Counts how often major newspapers {in} report on uncertainty about economic policy (taxes, regulation, monetary policy, trade). A value of 100 equals the long-run average."),
        interpretation=T("Hohe Unsicherheit lässt Firmen Investitionen und Einstellungen aufschieben. Im Score zählt ein hoher Wert deshalb negativ.",
                         "High uncertainty makes firms postpone investment and hiring. In the score a high value therefore counts negative."))
    add("capu", category="surveys", code="CAPU", frequency="Q",
        name=T("Kapazitätsauslastung der Industrie", "Manufacturing Capacity Utilisation"), short=T("Kapazitätsauslastung", "Capacity Utilisation"),
        unit=T("% der Kapazität", "% of capacity"), threshold="mean", zones=EXPZ, direction=1, gdpRegression=True, regressorTransform="diff1",
        sources=src("oecd_bts", fred=[s.get("capu", "")]),
        description=T("Vierteljährliche Unternehmensumfrage: Wie stark sind die Produktionsanlagen der Industrie {in} ausgelastet?",
                      "Quarterly business survey: how intensively is manufacturing capacity {in} being used?"),
        interpretation=T("Hohe Auslastung bedeutet Investitionsbedarf und Preisdruck, niedrige Auslastung freie Kapazitäten. In der BIP-Scorecard wird die Veränderung zum Vorquartal verwendet, nicht das Niveau.",
                         "High utilisation means pressure to invest and pricing power, low utilisation means spare capacity. The GDP scorecard uses the change from the prior quarter, not the level."))

    # housing
    add("hp", category="housing", code="RPP", frequency="Q", transform="yoy",
        name=T("Reale Wohnimmobilienpreise", "Real Residential Property Prices"), short=T("Immobilienpreise (real)", "House Prices (real)"),
        unit=YOY, base={"unit": T("Index (2010 = 100, inflationsbereinigt)", "Index (2010 = 100, inflation-adjusted)"), "decimals": 1},
        threshold=0, zones={"above": T("Steigend", "Rising"), "below": T("Fallend", "Falling")}, direction=1, gdpRegression=True,
        sources=src("bis_pp", fred=[s.get("hp", "")]),
        description=T("Preise für Wohnimmobilien {in}, bereinigt um die Verbraucherpreise, als Veränderung gegenüber dem Vorjahr. Die BIS vereinheitlicht dafür die Daten der nationalen Quellen.",
                      "Residential property prices {in}, deflated by consumer prices, as change versus the prior year. The BIS harmonises the national sources."),
        interpretation=T("Steigende Immobilienpreise stärken Vermögen und Konsum der Haushalte und die Sicherheiten der Banken. Lange fallende reale Preise gingen oft schwachen Jahren voraus.",
                         "Rising house prices lift household wealth, consumption and bank collateral. Long stretches of falling real prices often preceded weak years."))
    add("constr_conf", category="housing", code="BCI-CON",
        name=T("Bauvertrauen (Unternehmensumfrage)", "Construction Confidence (business survey)"), short=T("Bauvertrauen", "Construction Confidence"),
        unit=BAL, threshold="mean", zones=EXPZ, direction=1, gdpRegression=True,
        sources=src("oecd_bts", fred=[s.get("constr_conf", "")]),
        description=T("Monatliche Umfrage unter Bauunternehmen {in} zu Auftragsbestand und Beschäftigungserwartung (Saldo). Ersetzt die in Europa nicht einheitlich verfügbaren Baugenehmigungen als zeitnahen Frühindikator.",
                      "Monthly survey of construction firms {in} on order books and hiring plans (balance). Replaces building permits, which are not uniformly available in Europe, as a timely leading indicator."),
        interpretation=T("Über dem Durchschnitt: Die Bauwirtschaft ist besser ausgelastet als üblich. Bau reagiert stark auf Zinsen, deshalb dreht diese Reihe oft früh.",
                         "Above average: construction is busier than usual. Building reacts strongly to interest rates, so this series often turns early."))
    add("constr_out", category="housing", code="CONSTR", frequency="Q",
        name=T("Bauproduktion", "Construction Output"), short=T("Bauproduktion", "Construction Output"), unit=YOY,
        threshold=0, zones=GROWZ, direction=1, gdpRegression=True,
        sources=src("oecd_mei", fred=[s.get("constr_out", "")]),
        description=T("Real erbrachte Bauleistung {in} (Hoch- und Tiefbau), Veränderung zum Vorjahresquartal, saisonbereinigt.",
                      "Real construction output {in} (buildings and civil engineering), change versus the same quarter a year earlier, seasonally adjusted."),
        interpretation=T("Negative Raten zeigen eine schrumpfende Bauwirtschaft. Ergänzt das Bauvertrauen um die tatsächlich gebaute Menge.",
                         "Negative rates show a contracting construction sector. Complements construction confidence with actual volumes."))

    # money, credit & currency
    if "cb_assets" in s:
        is_ecb = s["cb_assets"] == "ECBASSETSW"
        add("cb_assets", category="money", code="CBBS", transform="yoy",
            name=T("Notenbank-Bilanzsumme ({cbs}) – Wachstum", "Central Bank Balance Sheet ({cbs}) – Growth"),
            short=T("{cbs}-Bilanz", "{cbs} Balance Sheet"), unit=YOY,
            base={"unit": T("Mio. EUR", "EUR million") if is_ecb else T("100 Mio. JPY", "JPY 100 million"), "decimals": 0},
            threshold=0, zones={"above": T("Wächst (QE)", "Expanding (QE)"), "below": T("Schrumpft (QT)", "Shrinking (QT)")}, direction=1,
            sources=src("ecb_bs" if is_ecb else "boj_bs"),
            description=T("Summe aller Vermögenswerte {cb}, als Veränderung gegenüber dem Vorjahr. Sie steigt bei Anleihekäufen (Quantitative Easing) und sinkt beim Bilanzabbau (Quantitative Tightening)." + (" Die EZB-Bilanz gilt für den ganzen Euroraum." if is_ecb else ""),
                          "Total assets of {cb}, as change versus the prior year. It rises with asset purchases (quantitative easing) and falls with balance-sheet runoff (quantitative tightening)." + (" The ECB balance sheet covers the whole euro area." if is_ecb else "")),
            interpretation=T("Eine wachsende Bilanz bringt zusätzliche Liquidität ins System, eine schrumpfende zieht sie ab. Wirkt eher auf Anleihen- und Aktienmärkte als direkt auf das BIP.",
                             "An expanding balance sheet adds liquidity, a shrinking one withdraws it. It works more through bond and equity markets than directly through GDP."))
    add("credit", category="money", code="CREDIT", frequency="Q",
        name=T("Kredit an den privaten Sektor in % des BIP", "Credit to the Private Sector as % of GDP"), short=T("Privatkredit / BIP", "Private Credit / GDP"),
        unit=T("% des BIP", "% of GDP"), threshold="mean", zones=EXPZ, direction=1, gdpRegression=True, regressorTransform="yoy",
        sources=src("bis_credit", fred=[s.get("credit", "")]),
        description=T("Alle Kredite an Unternehmen und Haushalte {in} (Bankkredite, Anleihen und Kredite aus dem Ausland) im Verhältnis zur Wirtschaftsleistung. Ersetzt die Geldmenge M3, deren internationale Reihe 2023 eingestellt wurde.",
                      "All credit to companies and households {in} (bank loans, bonds and cross-border lending) relative to output. Replaces the M3 money supply, whose international series was discontinued in 2023."),
        interpretation=T("Ein schneller Anstieg der Kreditquote treibt die Nachfrage an, kann aber auch Übertreibungen anzeigen. In der BIP-Scorecard wird die Veränderung über ein Jahr verwendet: Wichtig ist der Kreditimpuls, nicht das Niveau.",
                         "A rapid rise in the credit ratio boosts demand but can also signal excess. The GDP scorecard uses the change over one year: the credit impulse matters, not the level."))
    add("hh_debt", category="money", code="HH-DEBT", frequency="Q",
        name=T("Verschuldung der privaten Haushalte in % des BIP", "Household Debt as % of GDP"), short=T("Haushaltsschulden / BIP", "Household Debt / GDP"),
        unit=T("% des BIP", "% of GDP"), threshold="mean", zones=EXPZ, direction=0,
        sources=src("bis_credit", fred=[s.get("hh_debt", "")]),
        description=T("Kredite an private Haushalte {in}, vor allem Hypotheken, im Verhältnis zur Wirtschaftsleistung.",
                      "Credit to households {in}, mostly mortgages, relative to output."),
        interpretation=T("Hohe Haushaltsschulden machen den Konsum zinsempfindlich. Die Wirkung ist nicht eindeutig, deshalb fließt der Indikator nicht in den Score ein.",
                         "High household debt makes consumption sensitive to interest rates. The effect is ambiguous, so the indicator is not scored."))
    add("reer", category="money", code="REER",
        name=T("Realer effektiver Wechselkurs", "Real Effective Exchange Rate"), short=T("Realer Wechselkurs", "Real Exchange Rate"),
        unit=T("Index (2020 = 100)", "Index (2020 = 100)"), threshold="mean",
        zones={"above": T("Stark (teuer)", "Strong (expensive)"), "below": T("Schwach (günstig)", "Weak (cheap)")}, direction=-1,
        sources=src("bis_eer", fred=[s.get("reer", "")]),
        description=T("Außenwert der Währung {in} gegenüber einem breiten Korb von Handelspartnern, bereinigt um Preisunterschiede. Steigt der Index, werden Exporte teurer und Importe billiger.",
                      "External value of the currency {in} against a broad basket of trading partners, adjusted for price differences. A rising index makes exports dearer and imports cheaper."),
        interpretation=T("Eine starke Währung dämpft Exporte und Inflation, eine schwache stützt beides. Im Score zählt ein hoher Wert deshalb negativ (straffend).",
                         "A strong currency dampens exports and inflation, a weak one supports both. In the score a high value therefore counts negative (tightening)."))

    # rates
    if euro:
        add("policy", category="rates", code="ECB-DFR", decimals=2,
            name=T("Leitzins (EZB-Einlagesatz)", "Policy Rate (ECB Deposit Facility Rate)"), short=T("Leitzins (EZB)", "Policy Rate (ECB)"),
            unit=T("%", "%"), threshold="median", zones=MEDZ, direction=-1, sources=src("ecb_rates"),
            description=T("Zinssatz, zu dem Banken überschüssiges Geld über Nacht bei der EZB anlegen. Seit der Zinswende 2022 ist er der maßgebliche Leitzins für den ganzen Euroraum, also auch {in}.",
                          "The rate at which banks park excess money overnight at the ECB. Since 2022 it is the decisive policy rate for the whole euro area, including {name}."),
            interpretation=T("Höhere Zinsen verteuern Kredite und bremsen die Wirtschaft. Im Score zählt ein hoher Zins negativ (restriktiv). Die EZB richtet sich nach dem gesamten Euroraum, nicht nach einem einzelnen Land.",
                             "Higher rates make credit more expensive and slow the economy. In the score a high rate counts negative (restrictive). The ECB sets policy for the whole euro area, not for a single country."))
        add("real_rate", category="rates", code="RIR%", decimals=2,
            inputs={"r": {"fred": "ECBDFR"}, "p": {"fred": s["hicp"], "transform": "yoy"}}, formula="r - p",
            name=T("Realer Leitzins (EZB-Einlagesatz minus Inflation)", "Real Policy Rate (ECB deposit rate minus inflation)"),
            short=T("Realer Leitzins", "Real Policy Rate"), unit=T("Prozentpunkte", "Percentage points"), threshold=0,
            zones={"above": T("Positiv (restriktiv)", "Positive (restrictive)"), "below": T("Negativ (expansiv)", "Negative (accommodative)")}, direction=-1,
            sources=src("ecb_rates", "eurostat_hicp"),
            description=T("EZB-Einlagesatz abzüglich der Inflationsrate {in} (HVPI, ggü. Vorjahr). Zeigt, ob die Geldpolitik für dieses Land straff oder locker ist.",
                          "ECB deposit rate minus inflation {in} (HICP, year over year). Shows whether monetary policy is tight or loose for this country."),
            interpretation=T("Ein Leitzins für viele Länder wirkt unterschiedlich: Wo die Inflation höher ist, ist der reale Zins niedriger und die Geldpolitik lockerer.",
                             "One policy rate for many countries works differently: where inflation is higher, the real rate is lower and policy looser."))
    else:
        add("policy", category="rates", code="IR%", decimals=2,
            name=T("Leitzins-Proxy (Tagesgeldsatz)", "Policy Rate Proxy (overnight rate)"), short=T("Leitzins (Tagesgeld)", "Policy Rate (overnight)"),
            unit=T("%", "%"), threshold="median", zones=MEDZ, direction=-1, sources=src("oecd_mei", fred=[s.get("policy", "")]),
            description=T("Tagesgeldsatz am Geldmarkt {in}. Er wird von {cb} über den Leitzins gesteuert und folgt ihm sehr eng.",
                          "Overnight money-market rate {in}. It is steered by {cb} through its policy rate and tracks it very closely."),
            interpretation=T("Höhere Zinsen verteuern Kredite und bremsen die Wirtschaft. Im Score zählt ein hoher Zins negativ (restriktiv).",
                             "Higher rates make credit more expensive and slow the economy. In the score a high rate counts negative (restrictive)."))
    add("t10", category="rates", code="T10%", decimals=2,
        name=T("Rendite 10-jähriger Staatsanleihen", "10-Year Government Bond Yield"), short=T("10J-Rendite", "10Y Yield"),
        unit=T("%", "%"), threshold="median", zones=MEDZ, direction=-1, sources=src("oecd_mei", fred=[s["t10"]]),
        description=T("Marktrendite der 10-jährigen Staatsanleihe {in} (Monatsdurchschnitt). Sie ist Referenz für Hypotheken- und Unternehmenszinsen und bestimmt die Zinslast des Staates mit.",
                      "Market yield on the 10-year government bond {in} (monthly average). It is the benchmark for mortgage and corporate rates and drives the government's interest bill."),
        interpretation=T("Steigende Renditen erhöhen die Finanzierungskosten von Staat, Firmen und Haushalten.",
                         "Rising yields increase financing costs for government, companies and households."))
    add("curve", category="rates", code="10Y-ON", decimals=2,
        inputs={"l": {"fred": s["t10"]}, "k": {"fred": s["short"]}}, formula="l - k",
        name=T("Zinskurve (10 Jahre minus Tagesgeld)", "Yield Curve (10Y minus overnight)"), short=T("Zinskurve 10J–Tagesgeld", "Yield Curve 10Y–O/N"),
        unit=T("Prozentpunkte", "Percentage points"), threshold=0,
        zones={"above": T("Normal (steil)", "Normal (upward)"), "below": T("Invers", "Inverted")}, direction=1,
        sources=src("oecd_mei", fred=[s["t10"], s["short"]]),
        description=T("Differenz zwischen der 10-jährigen Rendite und dem Tagesgeldsatz {in}. Normalerweise liegen lange Zinsen über kurzen.",
                      "Spread between the 10-year yield and the overnight rate {in}. Normally long rates sit above short rates."),
        interpretation=T("Eine inverse Kurve (unter 0) zeigt, dass der Markt sinkende Leitzinsen und eine schwächere Wirtschaft erwartet. Sie ging vielen Abschwüngen voraus.",
                         "An inverted curve (below 0) shows markets expect falling policy rates and a weaker economy. It preceded many downturns."))
    if "bund_spread" in s:
        add("bund_spread", category="rates", code="SPREAD-DE", decimals=2,
            inputs={"x": {"fred": s["bund_spread"]}, "de": {"fred": "IRLTLT01DEM156N"}}, formula="x - de",
            name=T("Risikoaufschlag ggü. Bundesanleihen (10 Jahre)", "Spread over German Bunds (10Y)"), short=T("Spread zu Bunds", "Spread vs Bunds"),
            unit=T("Prozentpunkte", "Percentage points"), threshold="median", zones={"above": T("Erhöht", "Elevated"), "below": T("Niedrig", "Low")},
            direction=-1, sources=src("oecd_mei", fred=[s["bund_spread"], "IRLTLT01DEM156N"]),
            description=T("Zusätzliche Rendite, die Anleger für 10-jährige Staatsanleihen {in} gegenüber deutschen Bundesanleihen verlangen. Der wichtigste Stressindikator innerhalb des Euroraums.",
                          "Extra yield investors demand on 10-year government bonds {in} over German Bunds. The key stress gauge inside the euro area."),
            interpretation=T("Steigende Aufschläge zeigen Zweifel an den Staatsfinanzen oder Fragmentierung des Euroraums (wie 2011/12). Sinkende Aufschläge zeigen Vertrauen.",
                             "Widening spreads show doubts about public finances or euro-area fragmentation (as in 2011/12). Narrowing spreads show confidence."))

    # inflation
    add("hicp", category="inflation", code="HICP", transform="yoy",
        name=T("Verbraucherpreise (HVPI, gesamt)", "Consumer Prices (HICP, headline)"), short=T("Inflation (HVPI)", "Inflation (HICP)"),
        unit=YOY, base={"unit": T("Index", "Index"), "decimals": 2}, threshold=2,
        zones={"above": T("Über Ziel (2 %)", "Above target (2%)"), "below": T("Unter Ziel (2 %)", "Below target (2%)")}, direction=1,
        license="citation", sources=src("eurostat_hicp", fred=[s.get("hicp", "")]),
        description=T("Harmonisierter Verbraucherpreisindex {in}: Preisentwicklung eines repräsentativen Warenkorbs inklusive Energie und Nahrungsmittel, nach einheitlicher EU-Methode.",
                      "Harmonised index of consumer prices {in}: price change of a representative basket including energy and food, using the common EU method."),
        interpretation=T("Das Inflationsziel der EZB liegt bei 2 % für den gesamten Euroraum. Energiepreise sorgen beim Gesamtindex für starke Schwankungen.",
                         "The ECB's target is 2% for the euro area as a whole. Energy prices make the headline index volatile."))
    add("hicp_core", category="inflation", code="HICP-CORE", transform="yoy",
        name=T("Kerninflation (HVPI ohne Energie, Nahrung, Alkohol & Tabak)", "Core Inflation (HICP ex energy, food, alcohol & tobacco)"),
        short=T("Kerninflation", "Core Inflation"), unit=YOY, base={"unit": T("Index", "Index"), "decimals": 2}, threshold=2,
        zones={"above": T("Über 2 %", "Above 2%"), "below": T("Unter 2 %", "Below 2%")}, direction=1,
        sources=src("eurostat_hicp", fred=[s.get("hicp_core", "")]),
        description=T("Verbraucherpreise {in} ohne die schwankungsanfälligen Komponenten Energie, Nahrungsmittel, Alkohol und Tabak. Zeigt den zugrunde liegenden Preistrend.",
                      "Consumer prices {in} excluding the volatile components energy, food, alcohol and tobacco. Shows the underlying price trend."),
        interpretation=T("Die Kernrate reagiert träger als der Gesamtindex. Auf sie achtet die EZB, um den mittelfristigen Preisdruck einzuschätzen.",
                         "The core rate moves more slowly than the headline. The ECB watches it to gauge medium-term price pressure."))
    add("infl_exp", category="inflation", code="CS-PRICES",
        name=T("Preiserwartungen der Verbraucher (12 Monate)", "Consumer Price Expectations (12 months)"), short=T("Preiserwartungen", "Price Expectations"),
        unit=BAL, threshold="mean", zones=EXPZ, direction=1, sources=src("oecd_bts", fred=[s.get("infl_exp", "")]),
        description=T("Erwarten die Haushalte {in}, dass die Preise in den nächsten 12 Monaten schneller steigen? Saldo aus der EU-Verbraucherumfrage.",
                      "Do households {in} expect prices to rise faster over the next 12 months? Balance from the EU consumer survey."),
        interpretation=T("Steigende Erwartungen können sich über Lohnforderungen und Preissetzung selbst erfüllen. Notenbanken beobachten sie deshalb genau.",
                         "Rising expectations can become self-fulfilling through wage demands and price setting. Central banks therefore watch them closely."))
    add("wb_cpi", category="inflation", code="CPI-A", frequency="A",
        name=T("Verbraucherpreise (Jahresinflation)", "Consumer Prices (annual inflation)"), short=T("Inflation (jährlich)", "Inflation (annual)"),
        unit=T("% ggü. Vorjahr (Jahresdurchschnitt)", "% year over year (annual average)"), threshold=2,
        zones={"above": T("Über 2 %", "Above 2%"), "below": T("Unter 2 %", "Below 2%")}, direction=1,
        sources=src("wb_cpi", fred=[s.get("wb_cpi", "")]),
        replaces=T("Die monatlichen Verbraucherpreise {in} sind über FRED nicht mehr aktuell verfügbar (die OECD hat die Reihe 2025 eingestellt). Bis eine aktuelle Monatsquelle verfügbar ist, steht hier die Jahresinflation der Weltbank.",
                   "Monthly consumer prices {in} are no longer updated on FRED (the OECD discontinued the series in 2025). Until a current monthly source is available, this shows the World Bank's annual inflation."),
        description=T("Durchschnittliche Teuerung der Verbraucherpreise {in} im Kalenderjahr, laut Weltbank.",
                      "Average consumer price inflation {in} over the calendar year, per the World Bank."),
        interpretation=T("{cb} strebt eine Inflation von rund 2 % an. Die Linie bei 2 % dient als Orientierung.",
                         "{cb} targets inflation of around 2%. The 2% line is a reference point."))

    # labour
    add("unemp", category="labour", code="UNRATE",
        name=T("Arbeitslosenquote (harmonisiert)", "Unemployment Rate (harmonised)"), short=T("Arbeitslosenquote", "Unemployment Rate"),
        unit=T("%", "%"), threshold="median", zones=MEDZ, direction=-1, gdpRegression=True, regressorTransform="diff1",
        sources=src("oecd_lab", fred=[s["unemp"]]),
        description=T("Anteil der Arbeitslosen an den Erwerbspersonen {in} nach der international vergleichbaren ILO-Definition, saisonbereinigt. Nationale Quoten (z. B. der Bundesagentur für Arbeit) können wegen anderer Definitionen abweichen.",
                      "Unemployed as a share of the labour force {in} using the internationally comparable ILO definition, seasonally adjusted. National rates may differ because of other definitions."),
        interpretation=T("Steigt die Quote, schrumpft die Wirtschaft meist (Okun'sches Gesetz). Deshalb verwendet die BIP-Scorecard die monatliche Veränderung, nicht das Niveau.",
                         "When the rate rises the economy usually contracts (Okun's law). That's why the GDP scorecard uses the monthly change, not the level."))
    add("emp", category="labour", code="EMP", frequency="Q", transform="yoy",
        name=T("Erwerbstätige – Wachstum", "Employment – Growth"), short=T("Beschäftigung", "Employment"), unit=YOY,
        base={"unit": T("Tsd. Personen", "Thousand persons"), "decimals": 0}, threshold="mean", zones=EXPZ, direction=1, gdpRegression=True,
        sources=src("oecd_lab", fred=[s["emp"]]),
        description=T("Zahl der Erwerbstätigen ab 15 Jahren {in}, als Veränderung gegenüber dem Vorjahresquartal. Das Gegenstück zu den US-Nonfarm-Payrolls.",
                      "Number of employed persons aged 15+ {in}, as change versus the same quarter a year earlier. The counterpart of US nonfarm payrolls."),
        interpretation=T("Beschäftigungswachstum ist die Einkommensbasis des Konsums. Negative Raten traten meist nur in Rezessionen auf.",
                         "Employment growth is the income base for consumption. Negative rates mostly occurred only in recessions."))
    add("emprate", category="labour", code="EMP-RATE", frequency="Q",
        name=T("Erwerbstätigenquote", "Employment Rate"), short=T("Erwerbstätigenquote", "Employment Rate"),
        unit=T("% der Bevölkerung ab 15", "% of population 15+"), threshold="median", zones=MEDZ, direction=1,
        sources=src("oecd_lab", fred=[s["emprate"]]),
        description=T("Anteil der Erwerbstätigen an der Bevölkerung ab 15 Jahren {in}. Weniger anfällig für Verzerrungen als die Arbeitslosenquote, weil sie nicht davon abhängt, wer als arbeitssuchend gilt.",
                      "Employed persons as a share of the population aged 15+ {in}. Less prone to distortion than the unemployment rate because it does not depend on who counts as job-seeking."),
        interpretation=T("Eine steigende Quote zeigt einen aufnahmefähigen Arbeitsmarkt. Langfristig wird sie auch von der Alterung beeinflusst.",
                         "A rising rate shows a labour market that is absorbing workers. Over the long run it is also shaped by ageing."))
    add("indeed", category="labour", code="INDEED", decimals=1,
        name=T("Online-Stellenanzeigen (Indeed)", "Online Job Postings (Indeed)"), short=T("Stellenanzeigen", "Job Postings"),
        unit=T("Index (1. Feb. 2020 = 100)", "Index (1 Feb 2020 = 100)"), threshold=100,
        zones={"above": T("Über Vor-Corona-Niveau", "Above pre-pandemic"), "below": T("Unter Vor-Corona-Niveau", "Below pre-pandemic")}, direction=1,
        sources=src("indeed", fred=[s.get("indeed", "")]),
        description=T("Täglich aktualisierter Index der auf Indeed ausgeschriebenen Stellen {in}, hier als Monatsdurchschnitt. Der zeitnaheste Indikator für die Arbeitsnachfrage der Unternehmen.",
                      "Daily index of job postings on Indeed {in}, shown as a monthly average. The most timely gauge of companies' demand for labour."),
        interpretation=T("Über 100: mehr Stellenanzeigen als vor der Pandemie. Ein anhaltender Rückgang zeigt, dass Unternehmen bei Einstellungen vorsichtiger werden. Die Reihe beginnt erst 2020, Vergleiche sind daher kurz.",
                         "Above 100: more postings than before the pandemic. A sustained decline shows firms becoming cautious about hiring. The series only starts in 2020, so comparisons are short."))

    # activity
    add("gdp", category="activity", code="GDP", frequency="Q", formula="((1 + v / 100) ** 4 - 1) * 100",
        name=T("Reales BIP-Wachstum (annualisiert)", "Real GDP Growth (annualised)"), short=T("Reales BIP", "Real GDP"),
        unit=T("% ggü. Vorquartal, annualisiert", "% q/q, annualised"), threshold=0,
        zones={"above": T("Wachstum", "Growth"), "below": T("Schrumpfung", "Contraction")}, direction=1,
        sources=src("oecd_qna", fred=[s["gdp"]]),
        description=T("Veränderung des preisbereinigten Bruttoinlandsprodukts {in} gegenüber dem Vorquartal, auf ein Jahr hochgerechnet (wie in den USA üblich, damit die Länder vergleichbar sind). Referenz für die BIP-Scorecards der anderen Indikatoren.",
                      "Change in inflation-adjusted GDP {in} versus the prior quarter, annualised (as is customary in the US, so countries are comparable). Reference for the other indicators' GDP scorecards."),
        interpretation=T("Unter 0: die Wirtschaft schrumpft. In Europa wird das Quartalswachstum meist nicht annualisiert gemeldet; der Vorquartalswert entspricht etwa einem Viertel der hier gezeigten Zahl.",
                         "Below 0: the economy is contracting. In Europe quarterly growth is usually reported non-annualised; the quarter-on-quarter figure is roughly a quarter of the number shown here."))
    add("gdp_yoy", category="activity", code="GDP-YOY", frequency="Q", transform="yoy",
        name=T("Reales BIP – Wachstum ggü. Vorjahr", "Real GDP – Year-over-Year Growth"), short=T("BIP ggü. Vorjahr", "GDP y/y"), unit=YOY,
        threshold=0, zones={"above": T("Wachstum", "Growth"), "below": T("Schrumpfung", "Contraction")}, direction=1,
        sources=src("oecd_qna", fred=[s.get("gdp_yoy", "")]),
        description=T("Preisbereinigtes BIP {in} gegenüber dem Vorjahresquartal. Glatter als die Quartalsrate und die in Europa übliche Darstellung.",
                      "Inflation-adjusted GDP {in} versus the same quarter a year earlier. Smoother than the quarterly rate and the usual presentation in Europe."),
        interpretation=T("Zwei Jahreswerte unter 0 hintereinander deuten auf eine Rezession hin.",
                         "Two consecutive readings below 0 point to a recession."))
    add("ip", category="activity", code="INDPRO",
        name=T("Industrieproduktion", "Industrial Production"), short=T("Industrieproduktion", "Industrial Production"), unit=YOY,
        threshold=0, zones=GROWZ, direction=1, gdpRegression=True, sources=src("oecd_mei", fred=[s.get("ip", "")]),
        description=T("Reale Produktion von Industrie, Bergbau und Energieversorgung {in}, Veränderung gegenüber dem Vorjahresmonat, saisonbereinigt.",
                      "Real output of manufacturing, mining and utilities {in}, change versus the same month a year earlier, seasonally adjusted."),
        interpretation=T("Negative Raten zeigen eine schrumpfende Industrie. Ergänzt die Stimmungsumfragen um die tatsächlich produzierte Menge.",
                         "Negative rates show a contracting industrial sector. Complements the sentiment surveys with actual volumes."))
    add("retail", category="activity", code="RETAIL",
        name=T("Einzelhandelsumsätze (real)", "Retail Sales (volume)"), short=T("Einzelhandel", "Retail Sales"), unit=YOY,
        threshold=0, zones=GROWZ, direction=1, gdpRegression=True, sources=src("oecd_mei", fred=[s["retail"]]),
        description=T("Preisbereinigte Umsätze im Einzelhandel {in}, Veränderung gegenüber dem Vorjahresmonat, saisonbereinigt. Der zeitnaheste Indikator für den privaten Konsum.",
                      "Inflation-adjusted retail sales {in}, change versus the same month a year earlier, seasonally adjusted. The most timely gauge of private consumption."),
        interpretation=T("Anders als in den USA ist die Reihe real, also bereits um Preissteigerungen bereinigt. Über 0: die Haushalte kaufen mehr als vor einem Jahr.",
                         "Unlike the US series this one is real, i.e. already adjusted for price increases. Above 0: households are buying more than a year ago."))

    # fiscal
    add("debt", category="fiscal", code="Govt", frequency="A",
        name=T("Staatsverschuldung in % des BIP", "Government Debt as % of GDP"), short=T("Schulden / BIP", "Debt / GDP"),
        unit=T("% des BIP", "% of GDP"), threshold=60 if euro else 100,
        zones={"above": T("Über 60 % (Maastricht)", "Above 60% (Maastricht)"), "below": T("Unter 60 % (Maastricht)", "Below 60% (Maastricht)")} if euro
        else {"above": T("Über 100 %", "Above 100%"), "below": T("Unter 100 %", "Below 100%")},
        direction=0, sources=src("imf_debt", fred=[s["debt"]]),
        description=T("Bruttoschulden des Gesamtstaats {in} (Bund, Länder, Gemeinden, Sozialversicherung) im Verhältnis zum BIP, laut IWF.",
                      "Gross debt of general government {in} (central, regional and local government, social security) relative to GDP, per the IMF."),
        interpretation=T(("Die Schwelle ist die 60-%-Grenze des Maastricht-Vertrags. " if euro else "Die Schwelle von 100 % markiert eine historisch kritische Zone. ")
                         + "Eine hohe Schuldenquote schränkt den fiskalischen Spielraum ein. Jahresdaten erscheinen mit ein bis zwei Jahren Verzögerung. Der Indikator fließt nicht in den Score ein.",
                         ("The threshold is the Maastricht Treaty's 60% limit. " if euro else "The 100% threshold marks a historically critical zone. ")
                         + "A high debt ratio limits fiscal room. Annual data appear with a lag of one to two years. The indicator is not scored."))
    add("deficit", category="fiscal", code="Govt S/D", frequency="A",
        name=T("Haushaltssaldo des Staates in % des BIP", "Government Surplus/Deficit as % of GDP"), short=T("Haushaltssaldo / BIP", "Surplus/Deficit / GDP"),
        unit=T("% des BIP", "% of GDP"), threshold=-3 if euro else 0,
        zones={"above": T("Über −3 % (Maastricht)", "Above −3% (Maastricht)"), "below": T("Defizit über 3 %", "Deficit beyond 3%")} if euro
        else {"above": T("Überschuss", "Surplus"), "below": T("Defizit", "Deficit")},
        direction=-1, sources=src("imf_debt", fred=[s["deficit"]]),
        description=T("Überschuss (positiv) oder Defizit (negativ) des Gesamtstaats {in} im Verhältnis zum BIP, laut IWF.",
                      "Surplus (positive) or deficit (negative) of general government {in} relative to GDP, per the IMF."),
        interpretation=T(("Die Schwelle ist die Defizitgrenze von 3 % aus dem Maastricht-Vertrag. " if euro else "")
                         + "Defizite bedeuten zusätzliche staatliche Nachfrage, die über Schulden finanziert wird. Im Score zählt ein größeres Defizit deshalb als expansiv.",
                         ("The threshold is the Maastricht Treaty's 3% deficit limit. " if euro else "")
                         + "Deficits mean additional government demand financed by debt. In the score a larger deficit therefore counts as expansionary."))
    return out


def config(c):
    name = c["name"]
    inds = indicators(c)
    used = {i["category"] for i in inds}
    disabled = [
        {"id": "pmi", "name": "S&P Global / HCOB PMIs", "reason": "Commercial licence required; replaced by the EU/OECD business surveys."},
        {"id": "m3", "name": "Broad money (OECD M3)", "reason": "OECD monetary aggregates on FRED end in 2023; replaced by BIS private credit / GDP."},
    ]
    if not c["euro"]:
        disabled.append({"id": "cpi_m", "name": "Monthly CPI (OECD MEI)", "reason": "Discontinued on FRED in 2025; annual World Bank inflation used until a monthly source is available."})
    return {
        "id": c["id"],
        "name": name,
        "currency": c["currency"],
        "selector": [{"land": c["id"], "landName": name, "group": "endogenous"}],
        "gdpIndicator": "gdp",
        "groups": [{
            "id": "endogenous",
            "name": T("Binnenwirtschaft · endogene Treiber", "Domestic economy · endogenous drivers"),
            "description": fill(T(
                "Wie geht es der Wirtschaft {in}? Hier stehen die Daten, die im Land selbst entstehen: Stimmung von Unternehmen und Verbrauchern, Immobilien und Bau, Kredit und Währung, Zinsen, Preise, Jobs, Wachstum und Staatsfinanzen. Zusammen zeigen sie, in welcher Phase des Konjunkturzyklus das Land steht und wie {cb} und die Regierung wahrscheinlich reagieren. Alle Reihen sind international vergleichbar, damit sich die Länder nebeneinanderlegen lassen.",
                "How is the economy doing {in}? These are the data generated inside the country: business and consumer sentiment, housing and construction, credit and currency, rates, prices, jobs, growth and public finances. Together they show which phase of the business cycle the country is in and how {cb} and the government are likely to react. All series are internationally comparable, so countries can be set side by side."), c),
        }],
        "categories": [{"id": cid, "group": "endogenous", "tone": tone, "color": col, "name": T(de, en)}
                       for cid, tone, col, de, en in CATEGORIES if cid in used],
        "indicators": inds,
        "disabled": disabled,
    }


def main():
    for c in COUNTRIES:
        path = OUT / f"{c['id']}.json"
        path.write_text(json.dumps(config(c), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {path.relative_to(OUT.parent.parent)}  ({len(config(c)['indicators'])} indicators)")


if __name__ == "__main__":
    main()
