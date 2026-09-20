# Miami Dolphins Season Hub · v8.2

Dein privater Dolphins-Hub, optimiert für die Nutzung auf dem iPhone.
Statische Website für GitHub Pages – ohne Installation, Build oder API-Schlüssel.

## Bei GitHub aktualisieren

1. ZIP entpacken.
2. Im bisherigen GitHub-Repository den Ordner öffnen, in dem deine `index.html` liegt (je nach Einrichtung im Hauptordner oder unter `docs`).
3. **Alle entpackten Dateien und Ordner** dort hochladen und bestehende Dateien ersetzen. Nicht die ZIP-Datei selbst hochladen. Insbesondere `app.js`, `core.js`, `calendar.js`, `postseason.js` und `styles.css` müssen neben der `index.html` liegen.
4. Änderungen mit **Commit changes** speichern. Die bisherige GitHub-Pages-Einstellung kann bestehen bleiben.
5. Nach dem abgeschlossenen Pages-Deployment deine Website neu öffnen. Unten steht **v8.2**. Falls noch die alte Version zu sehen ist, die Seite einmal neu laden.

Die Adressen `index.html`, `tabelle.html` und `playoffs.html` bleiben erhalten.
Es werden keine Daten zu einem eigenen Server übertragen; die Website lädt öffentliche ESPN-Daten und Teamlogos.

## Neu in v8.2: Saisonkalender und vollständige Playoffs

### Saisonkalender – ausschließlich unter Spielplan

Oben im festen Kopfbereich gibt es **„Saison in den Kalender“**. Der Button bleibt sichtbar, auch wenn automatisch zum aktuellen Spiel gescrollt wird. In Tabelle und Playoffs ist er ausgeblendet.

Der Button öffnet einen kleinen Kalenderdialog mit der Anzahl bestätigter Spieltermine. **„Kalenderdatei öffnen“** erzeugt eine `.ics`-Datei mit allen verfügbaren terminierten Dolphins-Spielen der ausgewählten Saison, inklusive vergangener Spiele, Preseason und bereits feststehender Dolphins-Playoff-Spiele. Noch unbestätigte Anstoßzeiten und abgesagte, verschobene oder unterbrochene Spiele werden nicht mit einer erfundenen Uhrzeit exportiert. Fehlende Daten oder ein gespeicherter Datenstand werden im Dialog kenntlich gemacht.

Auf Geräten mit Unterstützung für das Teilen dieser Datei erscheint zusätzlich **„Datei teilen“**. Der Kalenderimport selbst muss anschließend auf dem Gerät bestätigt werden. Abhängig von iOS und der öffnenden App kann zunächst eine Vorschau beziehungsweise ein Download erscheinen. Dann lässt sich die Datei über das Teilen-Menü an eine unterstützte Kalender-App oder als Mail-Anhang weitergeben. Der konkrete iPhone-Import konnte hier nicht am Gerät überprüft werden.

Es handelt sich um einen **einmaligen Import**, nicht um ein Kalenderabo: nachträgliche Terminänderungen werden nicht automatisch übernommen. Erneutes Importieren kann doppelte Einträge erzeugen. Die Endzeit ist auf 3,5 Stunden geschätzt. Die vorhandene Einzelspiel-Kalenderfunktion bleibt erhalten. Einzel- und Gesamtexport verwenden dieselben stabilen Ereignis-IDs.

### Playoffs – AFC, NFC und tatsächlich gespielte Begegnungen

- Beide Conferences haben eigene Setzlisten mit Seeds 1–7 und aufklappbaren Plätzen 8–16.
- Zusätzlich werden die tatsächlichen Playoff-Begegnungen nach Wild Card, Divisional Round, Conference Finals und Super Bowl angezeigt.
- Jede Begegnung enthält Teams, korrekt zugeordnete Punkte, Datum, deutsche Anstoßzeit, Stadion, Stadt und – nach bestätigtem Spielende – den Sieger.
- Der bestätigte Super-Bowl-Sieger erscheint oben als Champion.
- Die Saisonauswahl gilt auch für die Playoff-Historie. **Saison 2025** zeigt beispielsweise die Playoffs im Januar/Februar **2026**.
- Aktuelle Paarungen und Ergebnisse werden nach Veröffentlichung automatisch geladen. Platzhalter wie „TBD gegen TBD“ werden nicht als feststehende Begegnungen ausgegeben.
- Die Setzlisten und tatsächlichen Playoff-Spiele werden getrennt dargestellt. Ein aktueller Seed ist während der Regular Season noch keine feste Playoff-Qualifikation.
- Wenn eine Runde oder die Tabelle nicht erreichbar ist, werden die weiterhin verfügbaren Daten angezeigt und die fehlenden Bereiche benannt.

## Korrektur in v8.1

Jedes neue Öffnen und Neuladen startet jetzt auf **Spielplan → aktuelle Saison → aktuelles Spiel**, auch wenn vorher Tabelle oder Playoffs geöffnet waren. Auch die URL wird auf `index.html` zurückgesetzt. Die Navigation zu Tabelle und Playoffs funktioniert während der Nutzung weiterhin normal. Die Rückkehr aus dem Browser-Zwischenspeicher oder nach mehr als einer Minute im Hintergrund führt ebenfalls zum aktuellen Spielplan.

## Was neu ist

- Dunkles Dolphins-Design mit Türkis, Orange, größeren Teamnamen und einer festen Navigation unten.
- Punkte stehen direkt in der Zeile des zugehörigen Teams. Miami steht immer oben; Sieg/Niederlage bezieht sich immer auf Miami. So bleibt beispielsweise Miami **6** / Gegner **9** eine eindeutig erkennbare Niederlage.
- Beim neuen Öffnen oder Neuladen startet der Hub automatisch mit der aktuellen NFL-Saison. Eine zuvor gewählte Archiv-Saison und alte `?season=`-Lesezeichen werden dabei zurückgesetzt.
- Im Januar und Februar gilt noch die Saison des Vorjahres, da deren Playoffs im neuen Kalenderjahr stattfinden. Ab März wird das neue Saisonjahr verwendet. Solange der neue Spielplan fehlt, erscheint ein ehrlicher Leerzustand.
- Das laufende beziehungsweise nächste Spiel ist grün hervorgehoben und wird automatisch in den sichtbaren Bereich gescrollt. Frühere Spiele bleiben darüber, spätere darunter.
- Nach dem letzten Spiel einer abgeschlossenen Saison wird das letzte Ergebnis ausgewählt.
- Beim Wechsel zwischen Spielplan, Tabelle und Playoffs bleibt eine bewusst ausgewählte Archiv-Saison erhalten. Das Dolphins-Logo bringt dich zur aktuellen Saison zurück.
- Bei Rückkehr aus dem Browser-Zwischenspeicher oder nach mehr als einer Minute im Hintergrund wird die aktuelle Saison erneut gewählt und das aktuelle Spiel eingeblendet. Kürzere Unterbrechungen aktualisieren nur die Daten.
- Automatische Aktualisierung: während eines laufenden Dolphins-Spiels alle 30 Sekunden, sonst alle zwei Minuten, solange die Seite sichtbar ist. Bei Rückkehr in die Seite wird erneut geladen. Der Button oben löst zusätzlich eine manuelle Aktualisierung aus.
- Automatische Updates reißen dich beim Lesen nicht zurück zum aktuellen Spiel. Dafür gibt es den Button **Aktuelles Spiel**.
- Anstoßzeiten werden in **Europe/Berlin** dargestellt, inklusive Sommer-/Winterzeit und Datumswechsel nach Mitternacht. Unbestätigte Uhrzeiten erscheinen als „Offen“.
- Ein **Kalender**-Button am nächsten terminierten Spiel lädt eine `.ics`-Datei. Nachträgliche Spielplanänderungen werden in einem einmal importierten Kalendereintrag nicht automatisch geändert; die Endzeit ist geschätzt.
- Bei Abrufproblemen können zuletzt erfolgreich geladene Daten angezeigt werden. Sie werden ausdrücklich als gespeicherter Stand gekennzeichnet. Es gibt keine erfundenen Ersatzwerte.

## Korrektur von Tabelle und Playoffs

Die alte Version leitete sogar die Bilanzen anderer Teams nur aus Miami-Spielen ab und zählte dabei aus Miamis Perspektive. Das war keine belastbare NFL-Tabelle.

Version 8.2 verwendet die vollständigen Regular-Season-Tabellendaten von ESPN. Die AFC East enthält die jeweiligen Gesamtbilanzen aller vier Teams. Die Playoff-Seeds werden direkt aus dem ESPN-Feld `playoffSeed` übernommen. Sie werden nicht aus einer simplen Sortierung nach Siegen selbst erfunden. Vor Saisonbeginn oder bei fehlenden eindeutigen Seeds wird keine Playoff-Qualifikation behauptet.

## Auf dem iPhone

In Safari die Website öffnen → **Teilen** → **Zum Home-Bildschirm**.
Das vorhandene Dolphins-App-Icon bleibt erhalten. Die Website benötigt zum erstmaligen Laden und für aktuelle Daten eine Internetverbindung. Sie ist keine vollständig offlinefähige App.

## Datenquelle und Grenzen

- Spielplan: ESPN Team Schedule API, Miami-Team-ID 15; Preseason, Regular Season und Playoffs getrennt.
- Tabelle und Seeds: ESPN NFL Standings API, ausgewähltes Saisonjahr, Regular Season.
- Playoff-Begegnungen: ESPN NFL Scoreboard API mit Saisonjahr, `seasontype=3` und Runden 1, 2, 3 und 5; keine Pro-Bowl-Spiele.
- Logos: ESPN; vorhandenes lokales Dolphins-Icon für App und Kopfbereich.
- Die öffentlichen Schnittstellen sind keine garantierte offizielle API. Verzögerungen, kurzfristige Ausfälle, CORS-Änderungen oder Strukturänderungen können Anpassungen erfordern. „Live“ beschreibt den Spielstatus der Datenquelle, keine sekundengenaue Übertragung.
- Keine Wettquoten, Konten, Tracker oder Zugangsschlüssel.

## Prüfung

39 automatisierte Daten- und DOM-Integrationstests erfolgreich. Die Tests prüfen unter anderem Zuordnung der Punkte, Sieg/Niederlage, Saisonauswahl, Spiel-Fokus, Archivnavigation, Tabellen, Seeds und gespeicherte Daten bei Ausfällen.

Echte ESPN-Antworten für die Saisons 2025 und 2026 wurden geprüft. **Eine visuelle Prüfung in einem echten iPhone/Safari oder im Testbrowser konnte in dieser Umgebung nicht durchgeführt werden:** Der verfügbare Testbrowser blockiert lokale Vorschauen. DOM-Tests ersetzen diesen Sichttest nicht.

Die detaillierte Prüfübersicht steht in `PRUEFUNG.md`.

Technische Referenz des Kalenderformats: [iCalendar / RFC 5545](https://www.rfc-editor.org/rfc/rfc5545). Hinweise von Apple zu Kalendern und ICS-Abonnements: [iPhone-Kalender](https://support.apple.com/en-euro/guide/iphone/iph3d1110d4/ios). Dieser Hub erzeugt Importdateien und stellt keinen Abo-Endpunkt bereit.
