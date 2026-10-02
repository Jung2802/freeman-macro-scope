// UI strings (DE/EN). Indicator texts live in the country config ({de, en} objects).

const STRINGS = {
  de: {
    'app.tagline': 'Makrodaten für Trader – automatisch aktualisiert',
    'app.loading': 'Daten werden geladen …',
    'err.load': 'Die Daten konnten nicht geladen werden. Bitte später erneut versuchen.',
    'err.notFound': 'Seite nicht gefunden.',
    'nav.overview': 'Übersicht', 'nav.compare': 'Vergleich', 'nav.method': 'Methodik', 'nav.sources': 'Quellen',
    'nav.country': 'Land', 'nav.lang': 'Sprache',
    'common.source': 'Quelle',

    'ov.title': '{country} – Makro-Überblick',
    'ov.subtitle': 'Die wichtigsten Konjunktur-, Geld-, Zins-, Inflations- und Arbeitsmarktdaten an einem Ort, mit Analyse und Quellen.',
    'ov.dataAsOf': 'Datenstand:', 'ov.autoUpdate': 'Wird jeden Werktag automatisch aktualisiert.',
    'ov.totalScore': 'Gesamt-Score (Saldo aller bewerteten Indikatoren)',
    'ov.scoreSentence': '{pos} von {n} bewerteten Indikatoren zeigen aktuell einen expansiven bzw. inflationären Impuls (Score > 0), {neg} einen restriktiven bzw. deflationären (Score < 0).',
    'ov.shortHint': 'Veränderung der letzten ~6 Monate', 'ov.longHint': 'Niveau relativ zur Schwelle',
    'ov.indicators': 'Indikatoren', 'ov.scoredOf': 'davon {n} bewertet',
    'ov.scoreLegend': '+ = expansiver/inflationärer Impuls, − = restriktiver/deflationärer Impuls. Statistische Zusammenfassung, keine Empfehlung.',
    'ov.byCategory': 'Score nach Bereich', 'ov.catScoreHint': 'Summe der Gesamt-Scores dieses Bereichs',
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
    'tab.gdp': 'BIP-Scorecard', 'tab.cycles': 'Zyklen', 'tab.table': 'Daten', 'tab.info': 'Info & Quellen',
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

    'gdp.title': '{name} → implizites BIP-Wachstum',
    'gdp.method': 'Lineare Regression des Quartalsdurchschnitts gegen das reale BIP-Wachstum desselben Quartals, Daten ab {from}, {n} Quartale, ohne Pandemie-Ausreißer Q2/Q3 2020.',
    'gdp.formula': 'Geschätzt:', 'gdp.weak': 'Der statistische Zusammenhang ist schwach (R² < 0,2). Das implizite BIP ist hier nur eingeschränkt aussagekräftig.',
    'gdp.implied': 'Implizites BIP', 'gdp.impliedSub': 'beim aktuellen Wert {v}', 'gdp.actual': 'Tatsächliches BIP', 'gdp.r2Sub': 'erklärter Anteil der BIP-Schwankung',
    'gdp.slope': 'Steigung', 'gdp.slopeSub': 'BIP-Prozentpunkte je Einheit ({u})', 'gdp.se': 'Streuung', 'gdp.seSub': 'Standardabweichung der Residuen',
    'gdp.lead': 'R² mit 1 Quartal Vorlauf', 'gdp.leadSub': 'Indikator vs. BIP des Folgequartals',
    'gdp.chart': 'Implizites vs. tatsächliches BIP-Wachstum (20 Jahre)', 'gdp.impliedLine': 'Implizit (aus Indikator)', 'gdp.actualBars': 'Tatsächlich (BEA)',
    'gdp.scatter': 'Indikator vs. BIP-Wachstum je Quartal', 'gdp.quarters': 'Quartale', 'gdp.fit': 'Regressionsgerade', 'gdp.now': 'Aktuell',
    'gdp.scorecard': 'Scorecard: Indikatorwert → implizites BIP %',
    'gdp.scorecardIntro': 'Wie die Scorecard-Zeilen der Excel-Analyse, aber aus der Regression berechnet. Markiert: der Wert, der dem aktuellen am nächsten liegt.',
    'gdp.disclaimer': 'Statistische Beschreibung eines historischen Zusammenhangs, keine BIP-Prognose.',

    'info.facts': 'Steckbrief', 'info.unit': 'Einheit', 'info.freq': 'Frequenz', 'info.transform': 'Darstellung',
    'info.yoy': 'Veränderung ggü. Vorjahr in % (Niveau in der Datentabelle)', 'info.level': 'Niveau', 'info.range': 'Zeitraum',
    'info.direction': 'Wirkungsrichtung im Score',
    'info.dirPos': 'höherer Wert = expansiver / inflationärer Impuls (+)', 'info.dirNeg': 'höherer Wert = restriktiver / deflationärer Impuls (−)', 'info.dirNone': 'nicht bewertet (Wirkung uneindeutig)',
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
    'common.source': 'Source',

    'ov.title': '{country} – Macro Overview',
    'ov.subtitle': 'The key growth, money, rates, inflation and labour-market data in one place, with analysis and sources.',
    'ov.dataAsOf': 'Data as of:', 'ov.autoUpdate': 'Updated automatically every business day.',
    'ov.totalScore': 'Total score (sum of all scored indicators)',
    'ov.scoreSentence': '{pos} of {n} scored indicators currently show an expansionary/inflationary impulse (score > 0), {neg} a restrictive/deflationary one (score < 0).',
    'ov.shortHint': 'Change over the last ~6 months', 'ov.longHint': 'Level relative to threshold',
    'ov.indicators': 'Indicators', 'ov.scoredOf': '{n} of them scored',
    'ov.scoreLegend': '+ = expansionary/inflationary impulse, − = restrictive/deflationary impulse. A statistical summary, not a recommendation.',
    'ov.byCategory': 'Score by area', 'ov.catScoreHint': 'Sum of total scores in this area',
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
    'tab.gdp': 'GDP scorecard', 'tab.cycles': 'Cycles', 'tab.table': 'Data', 'tab.info': 'Info & Sources',
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

    'gdp.title': '{name} → implied GDP growth',
    'gdp.method': 'Linear regression of the quarterly average against real GDP growth in the same quarter, data from {from}, {n} quarters, excluding pandemic outliers Q2/Q3 2020.',
    'gdp.formula': 'Estimated:', 'gdp.weak': 'The statistical relationship is weak (R² < 0.2). Implied GDP is of limited use here.',
    'gdp.implied': 'Implied GDP', 'gdp.impliedSub': 'at the current value {v}', 'gdp.actual': 'Actual GDP', 'gdp.r2Sub': 'share of GDP variation explained',
    'gdp.slope': 'Slope', 'gdp.slopeSub': 'GDP points per unit ({u})', 'gdp.se': 'Dispersion', 'gdp.seSub': 'standard deviation of residuals',
    'gdp.lead': 'R² with 1-quarter lead', 'gdp.leadSub': 'indicator vs next quarter GDP',
    'gdp.chart': 'Implied vs actual GDP growth (20 years)', 'gdp.impliedLine': 'Implied (from indicator)', 'gdp.actualBars': 'Actual (BEA)',
    'gdp.scatter': 'Indicator vs GDP growth by quarter', 'gdp.quarters': 'Quarters', 'gdp.fit': 'Regression line', 'gdp.now': 'Current',
    'gdp.scorecard': 'Scorecard: indicator value → implied GDP %',
    'gdp.scorecardIntro': 'Like the scorecard rows in the Excel analysis, but computed from the regression. Highlighted: the value closest to the current reading.',
    'gdp.disclaimer': 'A statistical description of a historical relationship, not a GDP forecast.',

    'info.facts': 'Fact sheet', 'info.unit': 'Unit', 'info.freq': 'Frequency', 'info.transform': 'Shown as',
    'info.yoy': '% change year over year (level in the data table)', 'info.level': 'Level', 'info.range': 'Period',
    'info.direction': 'Direction in score',
    'info.dirPos': 'higher = expansionary / inflationary impulse (+)', 'info.dirNeg': 'higher = restrictive / deflationary impulse (−)', 'info.dirNone': 'not scored (ambiguous impact)',
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

// Pick the current language from a {de, en} object (or return a plain string).
export function L(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.en ?? Object.values(obj)[0] ?? '';
}
