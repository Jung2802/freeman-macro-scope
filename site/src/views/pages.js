import { loadConfig, loadIndex } from '../data.js';
import { t, L, getLang } from '../i18n.js';
import { esc, dateTime } from '../format.js';
import { SITE } from '../site-config.js';

const placeholder = (v) => (v ? esc(v) : `<span class="warn-text">[${t('legal.missing')}]</span>`);

// Long-form texts are kept per language here instead of in i18n.js.
const TEXT = {
  method: {
    de: `
      <h2>Datenbasis</h2>
      <p>Alle Reihen stammen aus offiziellen Quellen (Statistikämter, Federal Reserve, Universitäten) und werden über die öffentliche Datenschnittstelle von FRED® (Federal Reserve Bank of St. Louis) abgerufen. Ein automatischer Job lädt die Daten jeden Werktag neu, rechnet sie um und veröffentlicht sie. Niemand tippt etwas von Hand ein.</p>
      <p>Höherfrequente Reihen (täglich, wöchentlich) werden als Durchschnitt pro Monat oder Quartal dargestellt. Ist der laufende Zeitraum noch nicht abgeschlossen, ist der letzte Wert mit <em>Teildaten</em> markiert. Makrodaten werden von den Quellen nachträglich revidiert, deshalb können sich historische Werte leicht ändern.</p>
      <h2>Darstellung</h2>
      <p>Viele Reihen werden als Veränderung gegenüber dem Vorjahr gezeigt (z. B. Inflation, Geldmenge). So werden Niveaus über Jahrzehnte vergleichbar. Das ursprüngliche Niveau steht jeweils in der Datentabelle. Zusammengesetzte Indikatoren (z. B. Fed-Bilanz in % des BIP, Zinsdeckung) werden aus den Rohreihen berechnet. Die Formel steht im Tab „Info &amp; Quellen".</p>
      <h2>Schwellen</h2>
      <p>Jeder Indikator hat eine Schwelle, die die Grafiken in zwei Zonen teilt: eine feste Marke mit ökonomischer Bedeutung (z. B. 0 bei Diffusionsindizes, 2 % bei Inflation, 0 bei der Zinskurve) oder den historischen Median bzw. Mittelwert der Reihe. Die Farben sind beschreibend: Bei Wachstumsindikatoren steht Grün für expansiv und Rot für kontraktiv. Bei Inflation, Zinsen, Geldmenge und Staatsfinanzen werden neutrale Farben (Blau/Orange) verwendet.</p>
      <h2>Score (−10 bis +10)</h2>
      <p>Der Score fasst zusammen, in welche Richtung ein Indikator aktuell zeigt, angelehnt an die Inflations-/Deflations-Bewertung (I/D) der ursprünglichen Excel-Analyse. Er ist rein statistisch und transparent berechnet:</p>
      <ul>
        <li><strong>Langfristig (L):</strong> Abstand des letzten Werts zur Schwelle, gemessen in Standardabweichungen der gesamten Historie. 2σ entsprechen ±10.</li>
        <li><strong>Kurzfristig (K):</strong> Veränderung über rund 6 Monate (6 Monate, 2 Quartale bzw. 1 Jahr), gemessen in Standardabweichungen aller historischen Veränderungen dieser Länge. 2σ entsprechen ±10.</li>
        <li><strong>Gesamt:</strong> Mittelwert aus K und L.</li>
      </ul>
      <p>Das Vorzeichen richtet sich nach der Wirkungsrichtung: <strong>+</strong> bedeutet einen expansiven bzw. inflationären Impuls (z. B. steigende Stimmung, steigende Geldmenge, sinkende Zinsen), <strong>−</strong> einen restriktiven bzw. deflationären Impuls. Indikatoren mit unklarer Wirkungsrichtung (z. B. Zinslast) werden nicht bewertet. Der Score ist eine Zusammenfassung von Daten, <strong>keine Prognose und keine Handlungsempfehlung</strong>.</p>
      <h2>BIP-Scorecard</h2>
      <p>Für geeignete Indikatoren wird eine lineare Regression zwischen dem Quartalsdurchschnitt des Indikators und dem realen BIP-Wachstum desselben Quartals geschätzt (Daten ab 1985, ohne die Pandemie-Ausreißer Q2/Q3 2020). Daraus ergibt sich das „implizierte" BIP-Wachstum für jeden Indikatorwert, angelehnt an die Scorecard-Zeilen der Excel-Analyse, aber aus den Daten geschätzt statt manuell festgelegt. R² zeigt, wie viel der BIP-Schwankung der Indikator statistisch erklärt.</p>
      <h2>Statistik der Veränderungen</h2>
      <p>Wie in der Excel-Analyse werden die Veränderungen von Periode zu Periode beschrieben: Mittelwert, Median, Standardabweichung, Schiefe und Wölbung (Exzess-Kurtosis, Excel-Definition KURT), Anteil positiver/negativer Veränderungen und der Vergleich der tatsächlichen Verteilung mit einer Normalverteilung in ±1σ/2σ/3σ-Bändern.</p>
      <h2>Konjunkturzyklen &amp; Sahm-Regel</h2>
      <p>Rezessionen folgen der offiziellen Datierung des NBER (grau hinterlegt in allen Zeitreihen). Die Sahm-Regel ist der Anstieg des 3-Monats-Durchschnitts der Arbeitslosenquote über sein Tief der vorangegangenen 12 Monate.</p>
      <h2>ISM-Daten</h2>
      <p>Die ISM-Einkaufsmanagerindizes (Manufacturing PMI und Services PMI, früher NMI) erscheinen weiterhin. Laut ISM-Nutzungsbedingungen dürfen sie aber nur privat und nicht-kommerziell genutzt werden. Stattdessen nutzt FreemanMacroScope die frei verfügbaren regionalen Industrie- und Dienstleistungsumfragen der Federal Reserve Banks (Philadelphia, New York, Dallas). Sie erscheinen früher im Monat und laufen historisch eng mit dem ISM.</p>`,
    en: `
      <h2>Data</h2>
      <p>All series come from official sources (statistical agencies, the Federal Reserve, universities) and are retrieved via the public FRED® interface (Federal Reserve Bank of St. Louis). An automated job reloads, transforms and publishes the data every business day. Nothing is typed in by hand.</p>
      <p>Higher-frequency series (daily, weekly) are shown as monthly or quarterly averages. If the current period is not complete yet, the last value is marked <em>partial</em>. Sources revise macro data, so historical values may change slightly.</p>
      <h2>Presentation</h2>
      <p>Many series are shown as year-over-year change (e.g. inflation, money supply), which makes levels comparable across decades. The original level is always in the data table. Composite indicators (e.g. Fed balance sheet as % of GDP, interest cover) are computed from the raw series. The formula is listed under "Info &amp; Sources".</p>
      <h2>Thresholds</h2>
      <p>Each indicator has a threshold that splits the charts into two zones: a fixed level with economic meaning (e.g. 0 for diffusion indices, 2% for inflation, 0 for the yield curve) or the series' historical median or mean. Colours are descriptive: for growth indicators green means expansionary and red contractionary. Inflation, rates, money and fiscal indicators use neutral colours (blue/orange).</p>
      <h2>Score (−10 to +10)</h2>
      <p>The score summarises which way an indicator currently points, inspired by the inflationary/deflationary (I/D) rating of the original Excel analysis. It is purely statistical and transparent:</p>
      <ul>
        <li><strong>Long-term (L):</strong> distance of the latest value from the threshold in standard deviations of the full history. 2σ = ±10.</li>
        <li><strong>Short-term (S):</strong> change over roughly 6 months (6 months, 2 quarters or 1 year), in standard deviations of all historical changes of that length. 2σ = ±10.</li>
        <li><strong>Total:</strong> average of S and L.</li>
      </ul>
      <p>The sign follows the direction of impact: <strong>+</strong> is an expansionary/inflationary impulse (e.g. rising sentiment, faster money growth, falling rates), <strong>−</strong> a restrictive/deflationary one. Indicators with ambiguous impact (e.g. interest burden) are not scored. The score summarises data. It is <strong>not a forecast and not a recommendation</strong>.</p>
      <h2>GDP scorecard</h2>
      <p>For suitable indicators a linear regression is estimated between the indicator's quarterly average and real GDP growth in the same quarter (data from 1985, excluding the pandemic outliers Q2/Q3 2020). This gives the "implied" GDP growth for each indicator value, inspired by the scorecard rows of the Excel analysis but estimated from data rather than set by hand. R² shows how much of GDP variation the indicator explains statistically.</p>
      <h2>Statistics of changes</h2>
      <p>As in the Excel analysis, period-to-period changes are described: mean, median, standard deviation, skewness and excess kurtosis (Excel KURT definition), share of positive/negative changes, and actual vs. normal distribution in ±1σ/2σ/3σ bands.</p>
      <h2>Business cycles &amp; Sahm rule</h2>
      <p>Recessions follow the official NBER dating (shaded grey in all time series). The Sahm rule is the rise of the 3-month average unemployment rate above its low of the prior 12 months.</p>
      <h2>ISM data</h2>
      <p>The ISM purchasing managers' indices (Manufacturing PMI and Services PMI, formerly NMI) are still published, but ISM's terms of use allow personal, non-commercial use only. FreemanMacroScope therefore uses the freely available regional manufacturing and services surveys of the Federal Reserve Banks (Philadelphia, New York, Dallas). They are released earlier in the month and have historically tracked the ISM closely.</p>`,
  },
  privacy: {
    de: (ads) => `
      <h2>Verantwortlich</h2><p>${placeholder(SITE.contact.name)}<br>${placeholder(SITE.contact.address)}<br>${placeholder(SITE.contact.email)}</p>
      <h2>Hosting</h2><p>Diese Website wird über GitHub Pages (GitHub Inc., USA) ausgeliefert. Beim Aufruf verarbeitet GitHub technisch notwendige Verbindungsdaten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Datei), um die Seite auszuliefern und vor Missbrauch zu schützen. Details: <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub Privacy Statement</a>.</p>
      <h2>Keine Cookies, kein Tracking</h2><p>FreemanMacroScope setzt ${ads ? 'selbst ' : ''}keine Cookies und verwendet keine Analyse- oder Tracking-Werkzeuge. Schriften und Skripte werden vom eigenen Server geladen, nicht von Drittanbietern. Im lokalen Speicher deines Browsers wird nur die gewählte Sprache gespeichert. Diese Information verlässt dein Gerät nicht.</p>
      ${ads ? `<h2>Werbung (Google AdSense)</h2><p>Zur Finanzierung zeigt diese Website Werbung über Google AdSense (Google Ireland Ltd.). Google kann dabei Cookies setzen und Daten verarbeiten, auch in den USA. Personalisierte Werbung wird nur nach deiner Einwilligung über das Einwilligungsfenster von Google angezeigt. Die Einwilligung kannst du dort jederzeit widerrufen. Details: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google-Werberichtlinien</a>.</p>` : ''}
      <h2>Externe Links</h2><p>Links zu Datenquellen führen zu externen Websites, für deren Datenschutz die jeweiligen Betreiber verantwortlich sind.</p>
      <h2>Deine Rechte</h2><p>Du hast nach dem Schweizer Datenschutzgesetz (DSG) und ggf. der DSGVO das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Wende dich dazu an die oben genannte Adresse.</p>`,
    en: (ads) => `
      <h2>Controller</h2><p>${placeholder(SITE.contact.name)}<br>${placeholder(SITE.contact.address)}<br>${placeholder(SITE.contact.email)}</p>
      <h2>Hosting</h2><p>This website is served via GitHub Pages (GitHub Inc., USA). When you visit, GitHub processes technically necessary connection data (e.g. IP address, time, requested file) to deliver the site and protect it from abuse. Details: <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub Privacy Statement</a>.</p>
      <h2>No cookies, no tracking</h2><p>FreemanMacroScope ${ads ? 'itself ' : ''}sets no cookies and uses no analytics or tracking tools. Fonts and scripts are served from our own server, not from third parties. Only your language choice is stored in your browser's local storage, and it never leaves your device.</p>
      ${ads ? `<h2>Advertising (Google AdSense)</h2><p>To fund the site, ads are shown via Google AdSense (Google Ireland Ltd.). Google may set cookies and process data, including in the USA. Personalised ads are only shown after you consent via Google's consent dialog, where you can withdraw consent at any time. Details: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google advertising policies</a>.</p>` : ''}
      <h2>External links</h2><p>Links to data sources lead to external websites whose operators are responsible for their privacy practices.</p>
      <h2>Your rights</h2><p>Under the Swiss Federal Act on Data Protection (FADP) and, where applicable, the GDPR you have the right to access, correct and delete your data. Contact the address above.</p>`,
  },
  disclaimer: {
    de: `
      <p><strong>FreemanMacroScope bietet ausschließlich allgemeine Wirtschaftsinformationen. Es handelt sich nicht um Anlageberatung, Finanzanalyse oder eine Aufforderung zum Kauf oder Verkauf von Finanzinstrumenten.</strong></p>
      <p>Alle Daten stammen von Dritten, werden automatisch verarbeitet und können verspätet, unvollständig, revidiert oder fehlerhaft sein. Scores, Schwellen und Regressionen sind statistische Beschreibungen vergangener Daten. Sie sind keine Prognosen. Vergangene Zusammenhänge gelten nicht zwingend für die Zukunft.</p>
      <p>Jede Anlageentscheidung triffst du selbst und auf eigenes Risiko. Für Verluste oder Schäden aus der Nutzung dieser Website wird keine Haftung übernommen, soweit gesetzlich zulässig. Bei Bedarf wende dich an eine zugelassene Finanzberatung.</p>
      <p>FRED® ist eine eingetragene Marke der Federal Reserve Bank of St. Louis. Die Nutzung der Daten bedeutet keine Billigung dieser Website durch die Federal Reserve Bank of St. Louis oder andere Datenanbieter.</p>`,
    en: `
      <p><strong>FreemanMacroScope provides general economic information only. It is not investment advice, financial analysis or a solicitation to buy or sell any financial instrument.</strong></p>
      <p>All data comes from third parties, is processed automatically and may be delayed, incomplete, revised or wrong. Scores, thresholds and regressions are statistical descriptions of past data, not forecasts. Past relationships do not necessarily hold in the future.</p>
      <p>You make every investment decision yourself and at your own risk. To the extent permitted by law, no liability is accepted for losses or damages arising from the use of this website. If needed, consult a licensed financial adviser.</p>
      <p>FRED® is a registered trademark of the Federal Reserve Bank of St. Louis. Use of the data does not imply endorsement of this website by the Federal Reserve Bank of St. Louis or any other data provider.</p>`,
  },
};

function page(title, html) {
  return `<article class="page"><h1>${title}</h1>${html}</article>`;
}

export async function renderPage(el, { name, country }) {
  const lang = getLang();
  if (name === 'methodik') {
    el.innerHTML = page(t('nav.method'), TEXT.method[lang]);
  } else if (name === 'disclaimer') {
    el.innerHTML = page(t('legal.disclaimer'), TEXT.disclaimer[lang]);
  } else if (name === 'datenschutz') {
    el.innerHTML = page(t('legal.privacy'), TEXT.privacy[lang](SITE.ads.enabled));
  } else if (name === 'impressum') {
    el.innerHTML = page(t('legal.imprint'), `
      <p>${placeholder(SITE.contact.name)}<br>${placeholder(SITE.contact.address)}<br>${t('legal.email')}: ${placeholder(SITE.contact.email)}</p>
      <p class="fine">${t('legal.imprintNote')}</p>
      <p><a href="#/disclaimer">${t('legal.disclaimer')} →</a></p>`);
  } else if (name === 'pro' && SITE.pro.enabled) {
    el.innerHTML = page('FreemanMacroScope Pro', `
      <p>${t('pro.text', { price: L(SITE.pro.price) })}</p>
      ${SITE.pro.checkoutUrl ? `<p><a class="btn primary" href="${esc(SITE.pro.checkoutUrl)}" target="_blank" rel="noopener">${t('pro.cta')}</a></p>` : ''}`);
  } else if (name === 'quellen') {
    const cfg = await loadConfig(country);
    const index = await loadIndex(country);
    el.innerHTML = page(t('nav.sources'), `
      <p>${t('src.intro')} ${t('ov.dataAsOf')} ${dateTime(index.fetchedAt)}.</p>
      ${cfg.categories.map((cat) => `
        <h2>${esc(L(cat.name))}</h2>
        <div class="table-wrap"><table>
          <thead><tr><th>${t('tbl.indicator')}</th><th>${t('tbl.source')}</th><th>FRED</th><th>${t('info.license')}</th></tr></thead>
          <tbody>${cfg.indicators.filter((i) => i.category === cat.id).map((i) => `<tr>
            <td><a href="#/${country}/${i.id}">${esc(L(i.short))}</a></td>
            <td>${i.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('<br>')}</td>
            <td class="mono">${Object.values(i.inputs).map((x) => `<a href="https://fred.stlouisfed.org/series/${esc(x.fred)}" target="_blank" rel="noopener">${esc(x.fred)}</a>`).join('<br>')}</td>
            <td>${t('lic.' + (i.license || 'public'))}</td></tr>`).join('')}</tbody>
        </table></div>`).join('')}
      <h2>${t('src.notUsed')}</h2>
      <ul>${(cfg.disabled || []).map((x) => `<li><strong>${esc(x.name)}</strong> – ${esc(x.reason)}</li>`).join('')}</ul>
      <h2>${t('src.recessions')}</h2>
      <p><a href="${esc(cfg.recession.source.url)}" target="_blank" rel="noopener">${esc(cfg.recession.source.name)}</a></p>
      <p class="fine">${t('src.fred')}</p>`);
  } else {
    el.innerHTML = `<div class="empty">${t('err.notFound')}</div>`;
  }
  return () => {};
}
