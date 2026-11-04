# FreemanMacroScope

Makrodaten-Dashboards für Trader. Die Daten werden automatisch aktualisiert und kommen mit Analyse und Quellen.
Binnenwirtschaft (Endogenous Drivers) für USA, Deutschland, Frankreich, Italien, Spanien, Vereinigtes Königreich, Japan, Kanada und Australien,
dazu Währungsvergleiche (Exogenous Drivers: EUR/USD, GBP/USD, USD/JPY, USD/CAD, AUD/USD, EUR/GBP, EUR/JPY, GBP/JPY, EUR/CAD)
und ein Länderradar, das alle Länder nebeneinanderstellt.

## Aufbau

```
config/countries/us.json   ← EIN Land = EINE Datei: Kategorien, Indikatoren, Quellen, Texte (DE/EN)
config/countries/de.json … ← DE, FR, IT, ES, GB, JP, CA, AU: von pipeline/make_countries.py erzeugt
pipeline/fetch.py          ← lädt Rohdaten (FRED-CSV, kein API-Key), rechnet um, schreibt site/data/
pipeline/make_countries.py ← Vorlage für die internationalen Länder (gemeinsame Indikatoren, Serien-IDs je Land)
pipeline/make_pairs.py     ← Vorlage für die Währungspaare (eurusd.json, gbpusd.json …; audusd.json bleibt handgepflegt)
site/                      ← die fertige Website (statisch, kein Build-Schritt)
  index.html, sw.js, manifest.webmanifest   (PWA: installierbar, offline-fähig)
  src/analysis.js          ← alle Berechnungen (Score, Statistik, Regression, Zyklen, Sahm, …)
  src/views/*.js           ← Übersicht, Indikator-Detail, Vergleich, Länderradar (world.js), Inhaltsseiten
  src/cosmos.js            ← Hintergrund: Sterne, Sternschnuppen, Scroll-Effekte, Einblend-Animationen
  src/horizon.js           ← Erde (Originalfoto, fest rechts) und Wechselkurs-Laufband entlang ihres Horizonts
  src/markets.js           ← Börsen und Handelszeiten für die Box „Weltbörsen jetzt“
  src/site-config.js       ← Werbung, Pro-Version, Impressum-Kontakt
  data/                    ← von der Pipeline erzeugt (nicht von Hand bearbeiten)
tests/                     ← Tests (node --test)
.github/workflows/         ← holt Daten jeden Werktag, testet, veröffentlicht auf GitHub Pages
```

## Lokal starten

```
python pipeline/fetch.py          # Daten aktualisieren
node --test tests/*.test.mjs      # Tests
python -m http.server 8080 --directory site   # → http://localhost:8080
```

## Häufige Änderungen

- **Indikator hinzufügen:** Eintrag in `config/countries/us.json` ergänzen (`inputs` = FRED-Serien-IDs,
  `formula`, `transform` = `level`/`yoy`, `threshold`, `direction`, Texte, Quellen). Danach `fetch.py` ausführen. Fertig.
- **Neues Land:** `config/countries/<id>.json` nach Vorlage `us.json` anlegen. Die Länderauswahl erscheint automatisch.
  Für ein Land mit denselben internationalen Reihen wie DE/FR/…: in `pipeline/make_countries.py` unter `COUNTRIES` ergänzen
  und `python pipeline/make_countries.py` ausführen (die Dateien de/fr/it/es/gb/jp/ca.json nicht von Hand bearbeiten).
- **Neue Treibergruppe (z. B. Exogenous Drivers später):** in `groups` ergänzen und Kategorien zuordnen.
- **Werbung aktivieren:** in `site/src/site-config.js` `ads.enabled = true` setzen und die AdSense-Client-ID eintragen.
  Im AdSense-Konto die DSGVO-Einwilligungsmeldung aktivieren. Vorschau der Werbeflächen: `?adpreview=1` an die URL anhängen.
- **Impressum:** `contact` in `site-config.js` ausfüllen (Pflicht, sobald die Seite kommerziell ist).
- **Pro-Version:** `pro` in `site-config.js` ist vorbereitet. Für den Start braucht es einen Zahlungsanbieter
  und eine echte Lizenzprüfung in `ads.js → isPro()`.
- **App (später):** Die Seite ist eine PWA und lässt sich bereits installieren. Für die App-Stores kann sie
  mit Capacitor (iOS/Android) oder als Trusted Web Activity (Android) verpackt werden, ohne den Code umzubauen.

## Datenquellen & Lizenzen

Alle Reihen werden über FRED® (Federal Reserve Bank of St. Louis) abgerufen, auch die internationalen
(OECD, Eurostat, BIS, IWF, Weltbank, EZB, Bank of Japan, Indeed Hiring Lab, Economic Policy Uncertainty). Pro Indikator stehen die Originalquelle und
ein Lizenzhinweis (`license`: `public` / `citation` / `restricted`) in der Konfiguration.
ISM-PMIs sind bewusst nicht enthalten (Lizenz nur privat/nicht-kommerziell) und werden durch die regionalen
Fed-Umfragen ersetzt. Details: Seite „Methodik" und „Quellen".

Die Erde zeigt den Kontinent des gewählten Landes (`site/assets/img/earth/<kontinent>.webp`, Feld `continent` in der
Länder-Konfiguration); Währungsvergleiche und das Länderradar zeigen `neutral.webp`. Die Horizontkreise der Bilder
stehen in `site/src/horizon.js` – ein neues Bild braucht dort einen Eintrag.

## Sicherung / Zurücksetzen

Der Stand vor dem Live-Hintergrund liegt im Branch `backup/upgrade-1` (Commit `4acddd3`).
