// UI strings (DE/EN). Indicator texts live in the country config ({de, en} objects).

const STRINGS = {
  de: {
    'app.tagline': 'Makrodaten für Trader – automatisch aktualisiert',
    'app.loading': 'Daten werden geladen …',
    'err.load': 'Die Daten konnten nicht geladen werden. Bitte später erneut versuchen.',
    'err.notFound': 'Seite nicht gefunden.',
    'nav.overview': 'Übersicht', 'nav.compare': 'Vergleich', 'nav.method': 'Methodik', 'nav.sources': 'Quellen',
    'nav.country': 'Land', 'nav.lang': 'Sprache',
    'nav.group': 'Ansicht', 'nav.vs': 'Vergleichswährung', 'nav.vsShort': 'vs.', 'nav.soon': 'bald',
    'group.endogenous': 'Binnenwirtschaft', 'group.exogenous': 'Währungsvergleich',
    'common.source': 'Quelle',

    'ov.title': '{country} – Makro-Überblick',
    'ov.heroLine': 'Was die Märkte bewegt.', 'ov.totalShort': 'Gesamt-Score', 'ov.toIndicators': 'Zu den Indikatoren', 'ov.terms': 'Begriffe einfach erklärt',
    'ov.subtitle': 'Wie steht die Wirtschaft da? Die wichtigsten Daten zu Konjunktur, Geld, Zinsen, Preisen und Jobs an einem Ort, einfach bewertet und mit Quellen.',
    'ov.dataAsOf': 'Datenstand:', 'ov.autoUpdate': 'Wird jeden Werktag automatisch aktualisiert.',
    'ov.totalScore': 'Gesamt-Score (Saldo aller bewerteten Indikatoren)',
    'ov.scoreSentence': '{pos} von {n} bewerteten Indikatoren zeigen gerade eine anziehende Wirtschaft oder steigenden Preisdruck (Plus), {neg} eine Abkühlung oder nachlassenden Preisdruck (Minus).',
    'ov.shortHint': 'Wohin die Daten in den letzten rund 6 Monaten gelaufen sind', 'ov.longHint': 'Wo die Daten heute im Vergleich zu ihrer Geschichte stehen',
    'ov.indicators': 'Indikatoren', 'ov.scoredOf': 'davon {n} bewertet',
    'ov.scoreLegend': 'Plus = die Wirtschaft zieht an oder die Preise steigen schneller. Minus = sie kühlt ab oder der Preisdruck lässt nach. Eine Zusammenfassung der Daten, keine Empfehlung.',
    'ov.byCategory': 'Score nach Bereich', 'ov.catScoreHint': 'Summe der Scores aller Indikatoren in diesem Bereich',
    'ov.nowcastTitle': 'Kombiniertes implizites BIP-Wachstum',
    'ov.nowcastIntro': 'Gewichteter Schnitt aus {n} Frühindikatoren, deren eigene (Lead/Lag-getestete) Regression gegen das BIP mindestens R² {min} erreicht — Gewicht je Indikator = sein R². Indikatoren mit schwachem direktem BIP-Bezug (z. B. Geldmenge M2, die primär über die Inflation wirkt, siehe deren Scorecard) fließen bewusst nicht ein, zählen aber weiter in den Gesamt-Score oben.',
    'ov.nowcastValue': 'Implizites BIP-Wachstum',
    'ov.nowcastNote': 'Statistische Beschreibung historischer Zusammenhänge, keine BIP-Prognose. Methodik: Methodik-Seite.',
    'ov.score': 'Score', 'ov.unscored': 'nicht bewertet',
    'ov.filter': 'Indikator suchen …', 'ov.scoreTable': 'Score-Tabelle (alle Indikatoren)',
    'ov.sum': 'Summe', 'ov.scale': 'Skala ±{max}',

    'score.short': 'K', 'score.long': 'L', 'score.total': 'Score',
    'score.shortLong': 'Kurzfristig (K)', 'score.longLong': 'Langfristig (L)',
    'trend.up': 'steigend', 'trend.down': 'fallend', 'trend.flat': 'seitwärts',

    'tbl.category': 'Bereich', 'tbl.indicator': 'Indikator', 'tbl.code': 'Code', 'tbl.value': 'Wert', 'tbl.period': 'Periode',
    'tbl.state': 'Zustand', 'tbl.source': 'Quelle', 'tbl.zone': 'Zone', 'tbl.csv': 'CSV herunterladen', 'tbl.rows': '{n} Werte',

    'cyc.title': 'Konjunkturzyklen (NBER-Rezessionen)', 'cyc.count': 'Rezessionen', 'cyc.since': 'seit {y}',
    'cyc.avgRec': 'Ø Rezessionsdauer', 'cyc.avgExp': 'Ø Aufschwungsdauer', 'cyc.months': 'Monate',
    'cyc.current': 'Laufender Aufschwung', 'cyc.sinceEnd': 'Monate seit {d}',
    'cyc.start': 'Beginn', 'cyc.end': 'Ende (Tiefpunkt)', 'cyc.length': 'Dauer (Monate)', 'cyc.expBefore': 'Aufschwung davor (Monate)', 'cyc.ongoing': 'andauernd',
    'cyc.note': 'Beginn = erster Rezessionsmonat nach dem Hochpunkt, Ende = Tiefpunkt (NBER)',

    'tab.overview': 'Überblick', 'tab.trend': 'Trend', 'tab.heatmap': 'Heatmap', 'tab.stats': 'Verteilung & Statistik',
    'tab.gdp': 'BIP-Scorecard', 'tab.scorecard': '{target}-Scorecard', 'tab.cycles': 'Zyklen', 'tab.table': 'Daten', 'tab.info': 'Info & Quellen',
    'freq.M': 'monatlich', 'freq.Q': 'quartalsweise', 'freq.A': 'jährlich',
    'unit.M': 'Monate', 'unit.Q': 'Quartale', 'unit.A': 'Jahre', 'unit.M1': 'Monat', 'unit.Q1': 'Quartal', 'unit.A1': 'Jahr',
    'ind.threshold': 'Schwelle', 'thr.median': 'hist. Median', 'thr.mean': 'hist. Mittelwert',
    'ind.lastObs': 'letzter Wert', 'ind.partial': 'Teildaten', 'ind.partialHint': 'Der laufende Zeitraum ist noch nicht abgeschlossen – Durchschnitt der bisher veröffentlichten Werte.',
    'ind.stale': 'Quelle verzögert', 'ind.recession': 'Rezession (NBER)',
    'ind.whatIs': 'Was ist das?', 'ind.reading': 'Einordnung:', 'ind.note': 'Hinweis:',

    'm.latest': 'Aktuell', 'm.change': 'Veränderung', 'm.vsPrior': 'ggü. Vorperiode', 'm.change1y': 'Veränderung 1 J.', 'm.vsYearAgo': 'ggü. Vorjahr',
    'm.avg': 'Ø {n} Jahre', 'm.high': 'Hoch {n} J.', 'm.low': 'Tief {n} J.', 'm.percentile': 'Perzentil', 'm.percentileSub': 'Rang in der Historie seit {from}',
    'range.y': '{n}J', 'range.max': 'Max',
    'c.change': 'Veränderung ggü. Vorperiode', 'c.rolling': 'Gleitender Durchschnitt ({n} {u})', 'c.avg': 'Gleitender Ø',
    'c.streak': 'Aufeinanderfolgende Perioden über/unter {thr}', 'c.seasonal': 'Vergleich der letzten 3 Jahre',
    'c.momentum': 'Momentum: Veränderung über {h} {u}', 'c.sahm': 'Sahm-Regel (Anstieg ggü. 12-Monats-Tief, Prozentpunkte)',
    'c.base': 'Niveau', 'c.baseChange': 'Monatliche Veränderung, letzte 5 Jahre',
    'c.histLevel': 'Häufigkeitsverteilung der Werte', 'c.aboveBelow': 'Perioden über / unter der Schwelle', 'c.annual': 'Jahresdurchschnitte',
    'sahm.note': 'Aktueller Wert: {v} Prozentpunkte. Ab 0,5 fiel der Wert historisch mit dem Beginn von Rezessionen zusammen.',

    'trend.thrText': 'Werte darüber: {above}, darunter: {below}.',
    'trend.current': 'Aktuell:', 'trend.runText': 'seit {n} {u} in Folge „{zone}“',
    'trend.momentum': 'Veränderung über {h} {u}:', 'trend.allTime': 'Gesamte Historie:', 'trend.high': 'Hoch', 'trend.low': 'Tief',

    'hm.info': 'Farbe = Abstand zur Schwelle {thr} in Standardabweichungen (σ = {sd}). Kräftigere Farbe = weiter entfernt. Oberhalb: {above}, unterhalb: {below}. Die letzte Spalte zeigt den Jahresdurchschnitt.',
    'hm.far': '{s}', 'hm.last30': 'Letzte 30 Jahre', 'hm.all': 'Alle {n} Jahre',

    'st.changeTitle': 'Statistik der Veränderungen (wie Excel-Analyse)',
    'st.changeIntro': 'Verteilung der Veränderungen von Periode zu Periode über die gesamte Historie, verglichen mit einer Normalverteilung (gelbe Linie).',
    'st.n': 'Anzahl', 'st.mean': 'Mittelwert', 'st.median': 'Median', 'st.std': 'Standardabweichung', 'st.stderr': 'Standardfehler', 'st.var': 'Varianz',
    'st.skew': 'Schiefe', 'st.kurt': 'Wölbung (Exzess-Kurtosis)', 'st.min': 'Minimum', 'st.max': 'Maximum',
    'st.posNeg': 'Positiv / negativ / null', 'st.avgPos': 'Ø positive Veränderung', 'st.avgNeg': 'Ø negative Veränderung', 'st.ratio': 'Verhältnis positiv / negativ',
    'st.band': 'Band', 'st.range': 'Bereich', 'st.actual': 'Tatsächlich', 'st.normal': 'Normalverteilung', 'st.diff': 'Differenz',
    'st.reading': 'Lesart:',
    'st.kurtHigh': 'Die Verteilung ist spitzer als eine Normalverteilung und hat dickere Ränder: Meist sind die Veränderungen klein, extreme Ausschläge kommen aber häufiger vor als „normal“.',
    'st.kurtLow': 'Die Verteilung ist flacher als eine Normalverteilung: Veränderungen sind gleichmäßiger gestreut, Extreme sind selten.',
    'st.kurtNormal': 'Die Wölbung liegt nahe an einer Normalverteilung.',
    'st.skewPos': 'Die Schiefe ist positiv: große Ausschläge nach oben sind häufiger als nach unten.',
    'st.skewNeg': 'Die Schiefe ist negativ: große Ausschläge nach unten sind häufiger als nach oben.',
    'st.skewSym': 'Die Verteilung ist annähernd symmetrisch.',
    'st.latestChange': 'Die letzte Veränderung ({v}) liegt {z} Standardabweichungen vom Mittelwert entfernt.',
    'st.levelTitle': 'Niveau-Statistik', 'st.fullHistory': 'gesamte Historie', 'st.zLevel': 'Abstand zur Schwelle (σ)', 'st.zLevelSub': 'Basis des langfristigen Scores',

    'gdp.title': '{name} → impliziert {target}',
    'gdp.method': 'Lineare Regression des Quartalsdurchschnitts gegen {target} {lead} Quartale später, Daten ab {from}, {n} Quartale, ohne Pandemie-Ausreißer Q2/Q3 2020.',
    'gdp.methodNoLead': 'Lineare Regression des Quartalsdurchschnitts gegen {target} desselben Quartals, Daten ab {from}, {n} Quartale, ohne Pandemie-Ausreißer Q2/Q3 2020.',
    'gdp.formula': 'Geschätzt:',
    'gdp.weak': 'Der statistische Zusammenhang ist schwach (R² < 0,2). Der implizite Wert ist hier nur eingeschränkt aussagekräftig.',
    'gdp.veryWeak': 'Kein belastbarer statistischer Zusammenhang (R² < 0,05, auch nach Test aller Vorläufe von 0-8 Quartalen). Die Werte unten dienen nur der Einordnung, nicht als Prognose.',
    'gdp.implied': 'Implizit: {target}', 'gdp.impliedSub': 'beim aktuellen Wert {v}', 'gdp.impliedSubLead': 'beim aktuellen Wert {v}, in {lead} Quartalen',
    'gdp.actual': 'Tatsächlich: {target}', 'gdp.r2Sub': 'erklärter Anteil der Schwankung von {target}',
    'gdp.slope': 'Steigung', 'gdp.slopeSub': '{target}-Punkte je Einheit ({u})', 'gdp.se': 'Streuung', 'gdp.seSub': 'Standardabweichung der Residuen',
    'gdp.lead': 'Gewählter Vorlauf', 'gdp.leadSub': 'bestes R² im Test über 0–8 Quartale (Lead/Lag-Test)',
    'gdp.leadZero': 'kein Vorlauf (gleiches Quartal)', 'gdp.leadQ': '{n} Quartale (≈ {m} Monate)',
    'gdp.leadProfile': 'R² je getestetem Vorlauf (Quartale)', 'gdp.leadProfileIntro': 'Methodik nach Anton Kreils PTM/PFTM-Kurs (Video 7): eine behauptete Vorlaufzeit wird nie übernommen, sondern an den Daten geprüft — hier automatisch für 0 bis 8 Quartale.',
    'gdp.chart': 'Implizit vs. tatsächlich: {target} (20 Jahre)', 'gdp.impliedLine': 'Implizit (aus Indikator)', 'gdp.actualBars': 'Tatsächlich ({target})',
    'gdp.scatter': 'Indikator vs. {target} je Quartal', 'gdp.quarters': 'Quartale', 'gdp.fit': 'Regressionsgerade', 'gdp.now': 'Aktuell',
    'gdp.scorecard': 'Scorecard: Indikatorwert → impliziert {target} %',
    'gdp.scorecardIntro': 'Wie die Scorecard-Zeilen der Excel-Analyse, aber aus der Regression berechnet. Markiert: der Wert, der dem aktuellen am nächsten liegt.',
    'gdp.disclaimer': 'Statistische Beschreibung eines historischen Zusammenhangs, keine Prognose.',

    'info.facts': 'Steckbrief', 'info.unit': 'Einheit', 'info.freq': 'Frequenz', 'info.transform': 'Darstellung',
    'info.yoy': 'Veränderung ggü. Vorjahr in % (Niveau in der Datentabelle)', 'info.level': 'Niveau', 'info.range': 'Zeitraum',
    'info.direction': 'Wirkungsrichtung im Score',
    'info.dirPos': 'steigender Wert = Wirtschaft zieht an bzw. Preisdruck steigt (+)', 'info.dirNeg': 'steigender Wert = Wirtschaft kühlt ab bzw. Preisdruck sinkt (−)', 'info.dirNone': 'nicht bewertet (dient als Hintergrund, Wirkung nicht eindeutig)',
    'info.fetched': 'Zuletzt abgerufen', 'info.license': 'Nutzung',
    'lic.public': 'Öffentliche Daten (US-Behörde)', 'lic.citation': 'Frei mit Quellenangabe', 'lic.restricted': 'Urheberrechtlich geschützt – Quelle wird genannt',
    'info.sources': 'Originalquellen', 'info.rawSeries': 'Rohdaten (FRED)',
    'info.fredNote': 'Abruf über FRED®, Federal Reserve Bank of St. Louis. Die Werte werden automatisch übernommen und umgerechnet.',

    'cmp.title': 'Indikatoren vergleichen',
    'cmp.intro': 'Zwei Indikatoren übereinanderlegen, Korrelation messen und prüfen, ob einer dem anderen zeitlich vorausläuft.',
    'cmp.normalize': 'Normalisieren (z-Score)', 'cmp.noOverlap': 'Zu wenig gemeinsame Daten für einen Vergleich.',
    'cmp.rLevel': 'Korrelation (Niveau)', 'cmp.rChange': 'Korrelation (Veränderungen)', 'cmp.obs': '{n} gemeinsame Werte', 'cmp.changesSub': 'Veränderung je {u}',
    'cmp.bestLag': 'Stärkster Vorlauf', 'cmp.freq': 'Frequenz', 'cmp.cc': 'Kreuzkorrelation nach Vorlauf (positiv = A läuft voraus)', 'cmp.lag': 'Vorlauf',
    'cmp.reading': 'Lesart:',
    'cmp.leadNone': 'Der stärkste Zusammenhang besteht ohne zeitliche Verschiebung.',
    'cmp.leadA': 'Der stärkste Zusammenhang ergibt sich, wenn „{a}“ „{b}“ um {n} {u} vorausläuft.',
    'cmp.leadB': 'Der stärkste Zusammenhang ergibt sich, wenn „{b}“ „{a}“ um {n} {u} vorausläuft.',
    'cmp.ccNote': 'Korrelation beschreibt einen gemeinsamen Verlauf in der Vergangenheit, keinen ursächlichen Zusammenhang.',

    'ads.label': 'Anzeige', 'ads.preview': 'Werbefläche (Vorschau)', 'ads.removeWithPro': 'Werbefrei mit Pro',
    'pro.text': 'Mit FreemanMacroScope Pro nutzt du alle Inhalte ohne Werbung, für {price}.', 'pro.cta': 'Pro holen',

    'legal.imprint': 'Impressum', 'legal.privacy': 'Datenschutz', 'legal.disclaimer': 'Disclaimer', 'legal.email': 'E-Mail',
    'legal.missing': 'wird ergänzt', 'legal.imprintNote': 'Verantwortlich für den Inhalt dieser Website.',
    'foot.disclaimer': 'Keine Anlageberatung. Alle Angaben ohne Gewähr. Daten von Dritten, automatisch verarbeitet.',
    'foot.data': 'Daten: FRED®, Federal Reserve Bank of St. Louis, sowie die jeweils genannten Originalquellen.',

    'src.intro': 'Alle Indikatoren mit Originalquelle und den zugrunde liegenden FRED-Reihen.',
    'src.notUsed': 'Bewusst nicht verwendet', 'src.recessions': 'Rezessionsdatierung',
    'src.fred': 'FRED® ist eine eingetragene Marke der Federal Reserve Bank of St. Louis. Die Nutzung bedeutet keine Billigung dieser Website.',
  },
  en: {
    'app.tagline': 'Macro data for traders – updated automatically',
    'app.loading': 'Loading data …',
    'err.load': 'The data could not be loaded. Please try again later.',
    'err.notFound': 'Page not found.',
    'nav.overview': 'Overview', 'nav.compare': 'Compare', 'nav.method': 'Methodology', 'nav.sources': 'Sources',
    'nav.country': 'Country', 'nav.lang': 'Language',
    'nav.group': 'View', 'nav.vs': 'Comparison currency', 'nav.vsShort': 'vs', 'nav.soon': 'soon',
    'group.endogenous': 'Domestic economy', 'group.exogenous': 'Currency comparison',
    'common.source': 'Source',

    'ov.title': '{country} – Macro Overview',
    'ov.heroLine': 'See what moves markets.', 'ov.totalShort': 'Total score', 'ov.toIndicators': 'View indicators', 'ov.terms': 'Key terms explained',
    'ov.subtitle': 'How is the economy doing? The key data on growth, money, rates, prices and jobs in one place, simply scored and with sources.',
    'ov.dataAsOf': 'Data as of:', 'ov.autoUpdate': 'Updated automatically every business day.',
    'ov.totalScore': 'Total score (sum of all scored indicators)',
    'ov.scoreSentence': '{pos} of {n} scored indicators currently point to a strengthening economy or rising price pressure (plus), {neg} to cooling or easing price pressure (minus).',
    'ov.shortHint': 'Where the data has moved over the last ~6 months', 'ov.longHint': 'Where the data stands today compared with its history',
    'ov.indicators': 'Indicators', 'ov.scoredOf': '{n} of them scored',
    'ov.scoreLegend': 'Plus = the economy is strengthening or prices are rising faster. Minus = it is cooling or price pressure is easing. A summary of data, not a recommendation.',
    'ov.byCategory': 'Score by area', 'ov.catScoreHint': 'Sum of total scores in this area',
    'ov.nowcastTitle': 'Combined implied GDP growth',
    'ov.nowcastIntro': 'A weighted blend of {n} leading indicators whose own (lead/lag-tested) regression against GDP reaches at least R² {min} — each indicator is weighted by its R². Indicators with a weak direct GDP link (e.g. M2 money supply, which works mainly through inflation, see its own scorecard) are deliberately left out here, but still count in the total score above.',
    'ov.nowcastValue': 'Implied GDP growth',
    'ov.nowcastNote': 'A statistical description of historical relationships, not a GDP forecast. Methodology: see the Methodology page.',
    'ov.score': 'Score', 'ov.unscored': 'not scored',
    'ov.filter': 'Search indicators …', 'ov.scoreTable': 'Score table (all indicators)',
    'ov.sum': 'Total', 'ov.scale': 'Scale ±{max}',

    'score.short': 'S', 'score.long': 'L', 'score.total': 'Score',
    'score.shortLong': 'Short-term (S)', 'score.longLong': 'Long-term (L)',
    'trend.up': 'rising', 'trend.down': 'falling', 'trend.flat': 'sideways',

    'tbl.category': 'Area', 'tbl.indicator': 'Indicator', 'tbl.code': 'Code', 'tbl.value': 'Value', 'tbl.period': 'Period',
    'tbl.state': 'State', 'tbl.source': 'Source', 'tbl.zone': 'Zone', 'tbl.csv': 'Download CSV', 'tbl.rows': '{n} values',

    'cyc.title': 'Business cycles (NBER recessions)', 'cyc.count': 'Recessions', 'cyc.since': 'since {y}',
    'cyc.avgRec': 'Avg recession length', 'cyc.avgExp': 'Avg expansion length', 'cyc.months': 'months',
    'cyc.current': 'Current expansion', 'cyc.sinceEnd': 'months since {d}',
    'cyc.start': 'Start', 'cyc.end': 'End (trough)', 'cyc.length': 'Length (months)', 'cyc.expBefore': 'Prior expansion (months)', 'cyc.ongoing': 'ongoing',
    'cyc.note': 'Start = first recession month after the peak, end = trough (NBER)',

    'tab.overview': 'Overview', 'tab.trend': 'Trend', 'tab.heatmap': 'Heat map', 'tab.stats': 'Distribution & Stats',
    'tab.gdp': 'GDP scorecard', 'tab.scorecard': '{target} scorecard', 'tab.cycles': 'Cycles', 'tab.table': 'Data', 'tab.info': 'Info & Sources',
    'freq.M': 'monthly', 'freq.Q': 'quarterly', 'freq.A': 'annual',
    'unit.M': 'months', 'unit.Q': 'quarters', 'unit.A': 'years', 'unit.M1': 'month', 'unit.Q1': 'quarter', 'unit.A1': 'year',
    'ind.threshold': 'Threshold', 'thr.median': 'hist. median', 'thr.mean': 'hist. mean',
    'ind.lastObs': 'latest', 'ind.partial': 'partial', 'ind.partialHint': 'The current period is not complete yet – average of the values published so far.',
    'ind.stale': 'source delayed', 'ind.recession': 'Recession (NBER)',
    'ind.whatIs': 'What is it?', 'ind.reading': 'Context:', 'ind.note': 'Note:',

    'm.latest': 'Latest', 'm.change': 'Change', 'm.vsPrior': 'vs prior period', 'm.change1y': 'Change 1Y', 'm.vsYearAgo': 'vs a year ago',
    'm.avg': '{n}Y average', 'm.high': '{n}Y high', 'm.low': '{n}Y low', 'm.percentile': 'Percentile', 'm.percentileSub': 'rank in history since {from}',
    'range.y': '{n}Y', 'range.max': 'Max',
    'c.change': 'Change vs prior period', 'c.rolling': 'Moving average ({n} {u})', 'c.avg': 'Moving avg',
    'c.streak': 'Consecutive periods above/below {thr}', 'c.seasonal': 'Last 3 years compared',
    'c.momentum': 'Momentum: change over {h} {u}', 'c.sahm': 'Sahm rule (rise vs 12-month low, percentage points)',
    'c.base': 'Level', 'c.baseChange': 'Monthly change, last 5 years',
    'c.histLevel': 'Frequency distribution of values', 'c.aboveBelow': 'Periods above / below threshold', 'c.annual': 'Annual averages',
    'sahm.note': 'Current reading: {v} percentage points. Readings of 0.5 and above have historically coincided with the start of recessions.',

    'trend.thrText': 'Above: {above}, below: {below}.',
    'trend.current': 'Currently:', 'trend.runText': '"{zone}" for {n} {u} in a row',
    'trend.momentum': 'Change over {h} {u}:', 'trend.allTime': 'Full history:', 'trend.high': 'High', 'trend.low': 'Low',

    'hm.info': 'Colour = distance from the threshold {thr} in standard deviations (σ = {sd}). Stronger colour = further away. Above: {above}, below: {below}. The last column shows the annual average.',
    'hm.far': '{s}', 'hm.last30': 'Last 30 years', 'hm.all': 'All {n} years',

    'st.changeTitle': 'Statistics of changes (as in the Excel analysis)',
    'st.changeIntro': 'Distribution of period-to-period changes over the full history, compared with a normal distribution (yellow line).',
    'st.n': 'Count', 'st.mean': 'Mean', 'st.median': 'Median', 'st.std': 'Standard deviation', 'st.stderr': 'Standard error', 'st.var': 'Variance',
    'st.skew': 'Skewness', 'st.kurt': 'Excess kurtosis', 'st.min': 'Minimum', 'st.max': 'Maximum',
    'st.posNeg': 'Positive / negative / zero', 'st.avgPos': 'Avg positive change', 'st.avgNeg': 'Avg negative change', 'st.ratio': 'Ratio positive / negative',
    'st.band': 'Band', 'st.range': 'Range', 'st.actual': 'Actual', 'st.normal': 'Normal distribution', 'st.diff': 'Difference',
    'st.reading': 'Reading:',
    'st.kurtHigh': 'The distribution is more peaked than normal with fatter tails: most changes are small, but extreme moves occur more often than "normal".',
    'st.kurtLow': 'The distribution is flatter than normal: changes are spread more evenly and extremes are rare.',
    'st.kurtNormal': 'Kurtosis is close to a normal distribution.',
    'st.skewPos': 'Skewness is positive: large upward moves are more common than downward ones.',
    'st.skewNeg': 'Skewness is negative: large downward moves are more common than upward ones.',
    'st.skewSym': 'The distribution is roughly symmetric.',
    'st.latestChange': 'The latest change ({v}) is {z} standard deviations from the mean.',
    'st.levelTitle': 'Level statistics', 'st.fullHistory': 'full history', 'st.zLevel': 'Distance to threshold (σ)', 'st.zLevelSub': 'basis of the long-term score',

    'gdp.title': '{name} → implies {target}',
    'gdp.method': 'Linear regression of the quarterly average against {target} {lead} quarters later, data from {from}, {n} quarters, excluding pandemic outliers Q2/Q3 2020.',
    'gdp.methodNoLead': 'Linear regression of the quarterly average against {target} in the same quarter, data from {from}, {n} quarters, excluding pandemic outliers Q2/Q3 2020.',
    'gdp.formula': 'Estimated:',
    'gdp.weak': 'The statistical relationship is weak (R² < 0.2). The implied value is of limited use here.',
    'gdp.veryWeak': 'No reliable statistical relationship (R² < 0.05, even after testing every lead from 0-8 quarters). The figures below are for context only, not a forecast.',
    'gdp.implied': 'Implied: {target}', 'gdp.impliedSub': 'at the current value {v}', 'gdp.impliedSubLead': 'at the current value {v}, {lead} quarters from now',
    'gdp.actual': 'Actual: {target}', 'gdp.r2Sub': 'share of {target} variation explained',
    'gdp.slope': 'Slope', 'gdp.slopeSub': '{target} points per unit ({u})', 'gdp.se': 'Dispersion', 'gdp.seSub': 'standard deviation of residuals',
    'gdp.lead': 'Chosen lead', 'gdp.leadSub': 'best R² tested over 0–8 quarters (lead/lag test)',
    'gdp.leadZero': 'no lead (same quarter)', 'gdp.leadQ': '{n} quarters (≈ {m} months)',
    'gdp.leadProfile': 'R² by tested lead (quarters)', 'gdp.leadProfileIntro': "Methodology after Anton Kreil's PTM/PFTM course (Video 7): a claimed lead time is never taken at face value, it is tested against the data — here automatically, for 0 to 8 quarters.",
    'gdp.chart': 'Implied vs actual: {target} (20 years)', 'gdp.impliedLine': 'Implied (from indicator)', 'gdp.actualBars': 'Actual ({target})',
    'gdp.scatter': 'Indicator vs {target} by quarter', 'gdp.quarters': 'Quarters', 'gdp.fit': 'Regression line', 'gdp.now': 'Current',
    'gdp.scorecard': 'Scorecard: indicator value → implies {target} %',
    'gdp.scorecardIntro': 'Like the scorecard rows in the Excel analysis, but computed from the regression. Highlighted: the value closest to the current reading.',
    'gdp.disclaimer': 'A statistical description of a historical relationship, not a forecast.',

    'info.facts': 'Fact sheet', 'info.unit': 'Unit', 'info.freq': 'Frequency', 'info.transform': 'Shown as',
    'info.yoy': '% change year over year (level in the data table)', 'info.level': 'Level', 'info.range': 'Period',
    'info.direction': 'Direction in score',
    'info.dirPos': 'rising value = economy strengthening or price pressure rising (+)', 'info.dirNeg': 'rising value = economy cooling or price pressure easing (−)', 'info.dirNone': 'not scored (background only, impact not clear-cut)',
    'info.fetched': 'Last retrieved', 'info.license': 'Usage',
    'lic.public': 'Public data (US agency)', 'lic.citation': 'Free with attribution', 'lic.restricted': 'Copyrighted – source credited',
    'info.sources': 'Original sources', 'info.rawSeries': 'Raw data (FRED)',
    'info.fredNote': 'Retrieved via FRED®, Federal Reserve Bank of St. Louis. Values are taken over and transformed automatically.',

    'cmp.title': 'Compare indicators',
    'cmp.intro': 'Overlay two indicators, measure their correlation and check whether one leads the other.',
    'cmp.normalize': 'Normalise (z-score)', 'cmp.noOverlap': 'Not enough overlapping data to compare.',
    'cmp.rLevel': 'Correlation (levels)', 'cmp.rChange': 'Correlation (changes)', 'cmp.obs': '{n} common values', 'cmp.changesSub': 'change per {u}',
    'cmp.bestLag': 'Strongest lead', 'cmp.freq': 'Frequency', 'cmp.cc': 'Cross-correlation by lead (positive = A leads)', 'cmp.lag': 'Lead',
    'cmp.reading': 'Reading:',
    'cmp.leadNone': 'The relationship is strongest without a time shift.',
    'cmp.leadA': 'The relationship is strongest when "{a}" leads "{b}" by {n} {u}.',
    'cmp.leadB': 'The relationship is strongest when "{b}" leads "{a}" by {n} {u}.',
    'cmp.ccNote': 'Correlation describes past co-movement, not causation.',

    'ads.label': 'Advertisement', 'ads.preview': 'Ad space (preview)', 'ads.removeWithPro': 'Ad-free with Pro',
    'pro.text': 'FreemanMacroScope Pro gives you everything without ads, for {price}.', 'pro.cta': 'Get Pro',

    'legal.imprint': 'Imprint', 'legal.privacy': 'Privacy', 'legal.disclaimer': 'Disclaimer', 'legal.email': 'Email',
    'legal.missing': 'to be added', 'legal.imprintNote': 'Responsible for the content of this website.',
    'foot.disclaimer': 'Not investment advice. No warranty. Third-party data, processed automatically.',
    'foot.data': 'Data: FRED®, Federal Reserve Bank of St. Louis, and the original sources named on each page.',

    'src.intro': 'All indicators with original source and underlying FRED series.',
    'src.notUsed': 'Deliberately not used', 'src.recessions': 'Recession dating',
    'src.fred': 'FRED® is a registered trademark of the Federal Reserve Bank of St. Louis. Use does not imply endorsement of this website.',
  },
};

const KEY = 'fms_lang';
let lang = (() => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && STRINGS[saved]) return saved;
  } catch { /* storage blocked */ }
  return (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
})();

export const LANGS = Object.keys(STRINGS);
export const getLang = () => lang;

export function setLang(l) {
  if (!STRINGS[l]) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
  document.documentElement.lang = l;
}

export function t(key, vars) {
  let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  return s;
}

// Like t(), but a country config may override the text via cfg.texts[key] = {de, en}.
export function tc(cfg, key, vars) {
  const own = cfg?.texts?.[key];
  if (!own) return t(key, vars);
  let s = L(own);
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  return s;
}

// Pick the current language from a {de, en} object (or return a plain string).
export function L(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.en ?? Object.values(obj)[0] ?? '';
}
