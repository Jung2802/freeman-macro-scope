# FreemanMacroScope

Makrodaten-Dashboards für Trader. Die Daten werden automatisch aktualisiert und kommen mit Analyse und Quellen.
Start mit den USA (Endogenous Drivers). Die Architektur ist auf weitere Länder, Treibergruppen und eine App ausgelegt.

## Aufbau

```
config/countries/us.json   ← EIN Land = EINE Datei: Kategorien, Indikatoren, Quellen, Texte (DE/EN)
pipeline/fetch.py          ← lädt Rohdaten (FRED-CSV, kein API-Key), rechnet um, schreibt site/data/
site/                      ← die fertige Website (statisch, kein Build-Schritt)
  index.html, sw.js, manifest.webmanifest   (PWA: installierbar, offline-fähig)
  src/analysis.js          ← alle Berechnungen (Score, Statistik, Regression, Zyklen, Sahm, …)
  src/views/*.js           ← Übersicht, Indikator-Detail, Vergleich, Inhaltsseiten
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
- **Neue Treibergruppe (z. B. Exogenous Drivers später):** in `groups` ergänzen und Kategorien zuordnen.
- **Werbung aktivieren:** in `site/src/site-config.js` `ads.enabled = true` setzen und die AdSense-Client-ID eintragen.
  Im AdSense-Konto die DSGVO-Einwilligungsmeldung aktivieren. Vorschau der Werbeflächen: `?adpreview=1` an die URL anhängen.
- **Impressum:** `contact` in `site-config.js` ausfüllen (Pflicht, sobald die Seite kommerziell ist).
- **Pro-Version:** `pro` in `site-config.js` ist vorbereitet. Für den Start braucht es einen Zahlungsanbieter
  und eine echte Lizenzprüfung in `ads.js → isPro()`.
- **App (später):** Die Seite ist eine PWA und lässt sich bereits installieren. Für die App-Stores kann sie
  mit Capacitor (iOS/Android) oder als Trusted Web Activity (Android) verpackt werden, ohne den Code umzubauen.

## Datenquellen & Lizenzen

Alle Reihen werden über FRED® (Federal Reserve Bank of St. Louis) abgerufen. Pro Indikator stehen die Originalquelle und
ein Lizenzhinweis (`license`: `public` / `citation` / `restricted`) in der Konfiguration.
ISM-PMIs sind bewusst nicht enthalten (Lizenz nur privat/nicht-kommerziell) und werden durch die regionalen
Fed-Umfragen ersetzt. Details: Seite „Methodik" und „Quellen".
