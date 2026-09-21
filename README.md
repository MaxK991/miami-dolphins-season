# Miami Dolphins Season Hub · v8.5

Dein privater Dolphins-Hub für iPhone und GitHub Pages.

## Neu: Wo läuft das Spiel in Deutschland?

Jede Spielkarte im Spielplan zeigt **Free-TV**, **Pay-TV / Abo** und gegebenenfalls eine getrennte **Konferenz**. Die Anbieter lassen sich antippen. RTL+ ist kostenpflichtig; eine NITRO-Konferenz bedeutet nicht, dass dort das gesamte Dolphins-Spiel einzeln läuft.

- Die deutsche RTL-Wochenauswahl und der Sky-Sendeplan werden im vorhandenen GitHub-Ablauf alle sechs Stunden abgerufen. Team-Paarung, Heimrecht, Datum und Uhrzeit müssen zum Dolphins-Spiel passen.
- Noch nicht veröffentlichte Free-TV-Sender erscheinen als **„Free-TV noch nicht bestätigt“**. Aus fehlenden Daten wird niemals „nur Pay-TV“ abgeleitet.
- **NFL Game Pass bei DAZN** erscheint als eigenes kostenpflichtiges Abo für die geprüfte Saison 2026, einschließlich Dolphins-Playoffs. Es wird kein gewöhnliches DAZN-Paket vorausgesetzt. Die allgemeine Game-Pass-Zuordnung muss bei einem späteren Saisonwechsel anhand der dann geltenden Rechte überprüft werden; die RTL-/Sky-Programmsuche läuft weiter automatisch.
- Konferenzen sind klar als Ausschnitte mehrerer Spiele gekennzeichnet. Programmquellen und Prüfzeitpunkt stehen an bestätigten Senderangaben.
- Ältere oder nicht vollständig abrufbare Senderdaten werden gekennzeichnet. Der Ausfall einer Programmquelle stoppt weder Spielstände noch Kalenderabo.
- US-Sender aus ESPN werden nicht als deutsche Empfangsmöglichkeit angezeigt. Historische Spiele erhalten nur gespeicherte damalige Einzelzuordnungen; heutige Anbieter werden nicht pauschal auf die letzten zehn Jahre übertragen.

## Update deiner bereits eingerichteten Version 8.4

**ZIP entpacken. Die entpackten Dateien und den Ordner `automation` wie bisher ins Repository hochladen; gleichnamige Dateien ersetzen. Nicht die ZIP hochladen und das Repository nicht leeren.**

Wenn du nur die technisch benötigten Änderungen hochladen möchtest, sind es diese **neun Dateien**:

| Ziel im Repository | Datei |
| --- | --- |
| Hauptordner | `index.html` |
| Hauptordner | `tabelle.html` |
| Hauptordner | `playoffs.html` |
| Hauptordner | `app.js` |
| Hauptordner | `styles.css` |
| Hauptordner, neu | `broadcasts.js` |
| Hauptordner, neu | `broadcasts-de.json` |
| Ordner `automation`, ersetzen | `build-site.cjs` |
| Ordner `automation`, neu | `broadcast-feed.cjs` |

Die Dateien aus `automation` müssen in diesem Unterordner bleiben. Auf dem Handy kannst du auf GitHub erst die sieben Hauptdateien hochladen, danach den Ordner `automation` öffnen und dort die beiden Automatikdateien gemeinsam hochladen. Erst nach dem vollständigen Update den neuesten Actions-Lauf prüfen.

Die aktive Datei `.github/workflows/dolphins-hub.yml` bleibt unverändert. GitHub Pages bleibt auf **GitHub Actions**. Dein Kalenderabo behält seinen Link und muss nicht erneut abonniert werden. Nach dem Upload unter **Actions → Dolphins Hub und Kalenderabo** auf einen grünen Durchlauf warten und die Website neu laden. Die beigefügte Senderdatei enthält einen geprüften Anfangsstand; danach erzeugt der Workflow ihre Aktualisierungen selbst.

## Live-Spielstände und Saisonarchiv

- Während laufender Spiele ergänzt das ESPN-Scoreboard die Punkte, Viertel und Uhr. Die Zuordnung erfolgt über Spiel- und Team-ID. Bestätigte Endergebnisse werden nicht durch ältere Live-Werte ersetzt.
- Zehn vergangene Saisons plus die aktuelle: derzeit 2016–2026, jährlich automatisch fortgeschrieben. Die Auswahl gilt für Spielplan, Tabelle und Playoffs.
- Historisches Playoff-Format: bis 2019 sechs Teams pro Conference mit zwei Freilosen; ab 2020 sieben Teams mit einem Freilos.

Bei geöffneter, sichtbarer Website werden laufende Spiele alle 30 Sekunden neu abgefragt, sonst alle zwei Minuten. Ein Ausfall der Live-Quelle wird angezeigt; gespeicherte Live-Werte sind als veraltet gekennzeichnet. Die Aktualität hängt zusätzlich von ESPN ab.

## Weiterhin enthalten

- **Ein echtes Kalenderabo:** Ein fester Link, neue Spiele und Terminänderungen werden automatisch bereitgestellt. Das Abo läuft saisonübergreifend weiter. Deine Kalenderfarbe wählst du auf dem iPhone.
- **Nur ein Kalenderbutton:** „Dolphins-Kalender abonnieren“ oben unter Spielplan. Der Kalenderbutton am einzelnen Spiel wurde entfernt.
- **Super Bowl weiter oben:** Das vollständige Super-Bowl-Feld steht direkt unter dem Champion.
- Die bisherigen Verbesserungen an Punkten, aktuellem Spiel, Neuladen, AFC-/NFC-Playoffs und Tabellen bleiben erhalten.

## Bei GitHub einrichten

**Für das Kalenderabo ist zusätzlich zum Datei-Upload eine einmalige GitHub-Actions-Einrichtung nötig.** Die vollständige Anleitung steht in [ABO_EINRICHTEN.md](ABO_EINRICHTEN.md).

1. Alle entpackten Dateien einschließlich `automation` ins Hauptverzeichnis des bisherigen Repositorys hochladen und gleichnamige Dateien ersetzen. Das Repository vorher nicht leeren.
2. Settings → Pages → Source auf **GitHub Actions** stellen.
3. Die mitgelieferte Workflow-Vorlage `automation/dolphins-hub.yml` als `.github/workflows/dolphins-hub.yml` im Branch `main` speichern.
4. Unter Actions den Ablauf **Dolphins Hub und Kalenderabo** prüfen beziehungsweise einmal starten. Wenn build und deploy grün sind, ist das Abo bereit.
5. Auf der Website unter Spielplan das Kalenderabo öffnen und einmal auf dem iPhone bestätigen.

Der Abruf ist alle sechs Stunden geplant. GitHub kann solche Zeitpläne nach **60 Tagen ohne Repository-Aktivität** deaktivieren; dann ist eine Reaktivierung unter Actions nötig. Der Abo-Dialog zeigt den Kalenderstand und warnt ab drei Tagen ohne Aktualisierung. Die Kalender-App bestimmt ihren eigenen Abrufrhythmus. Ausführliche Hinweise, Fehlerhilfe und Quellen stehen in der Anleitung.

Die Website und öffentliche Kalenderdatei bleiben unter deiner GitHub-Pages-Adresse. Es ist kein eigenes Backend, Zugangsschlüssel oder zusätzliches Konto erforderlich. GitHub Actions erzeugt die Kalenderdatei und veröffentlicht die Website direkt als Pages-Artefakt. Bei fehlerhaften Spielplan- oder Kalenderdaten wird nicht veröffentlicht; der letzte erfolgreiche Stand bleibt erhalten. Senderquellen dürfen unabhängig davon ausfallen: Gespeicherte Angaben behalten ihren alten Prüfzeitpunkt.

## Kalenderabo

Der Abo-Button ist ausschließlich im Spielplan sichtbar. Er ist unabhängig von der ausgewählten Archiv-Saison. Beim ersten Einrichten enthält das Abo die aktuelle NFL-Saison; künftige Saisons kommen hinzu, zuvor abonnierte Termine bleiben bestehen. Unbestätigte Anstoßzeiten werden nicht erfunden. Pro Spiel wird eine stabile Ereignis-ID verwendet, Änderungen erhöhen dessen Versionsnummer.

Bereits einmalig importierte Termine werden durch das Abo nicht gelöscht. Diese bei Bedarf manuell entfernen, damit keine doppelten Einträge sichtbar sind. Die Abo-Termine sind schreibgeschützt; die Farbe wird in der Kalender-App gewählt. Die Endzeit ist weiterhin auf 3,5 Stunden geschätzt.

### Playoffs – AFC, NFC und tatsächlich gespielte Begegnungen

- Beide Conferences haben eigene Setzlisten mit sechs beziehungsweise sieben Playoff-Plätzen je nach Saison und aufklappbaren übrigen Plätzen.
- Zusätzlich werden die tatsächlichen Playoff-Begegnungen nach Wild Card, Divisional Round, Conference Finals und Super Bowl angezeigt.
- Jede Begegnung enthält Teams, korrekt zugeordnete Punkte, Datum, deutsche Anstoßzeit, Stadion, Stadt und – nach bestätigtem Spielende – den Sieger.
- Der bestätigte Super-Bowl-Sieger erscheint oben als Champion. Direkt darunter steht das Super-Bowl-Feld mit Teams, Ergebnis, Datum und Spielort; die übrigen Runden folgen weiter unten.
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
- Bei Abrufproblemen können zuletzt erfolgreich geladene Daten angezeigt werden. Sie werden ausdrücklich als gespeicherter Stand gekennzeichnet. Es gibt keine erfundenen Ersatzwerte.

## Korrektur von Tabelle und Playoffs

Die alte Version leitete sogar die Bilanzen anderer Teams nur aus Miami-Spielen ab und zählte dabei aus Miamis Perspektive. Das war keine belastbare NFL-Tabelle.

Der Hub verwendet die vollständigen Regular-Season-Tabellendaten von ESPN. Die AFC East enthält die jeweiligen Gesamtbilanzen aller vier Teams. Die Playoff-Seeds werden direkt aus dem ESPN-Feld `playoffSeed` übernommen. Sie werden nicht aus einer simplen Sortierung nach Siegen selbst erfunden. Vor Saisonbeginn oder bei fehlenden eindeutigen Seeds wird keine Playoff-Qualifikation behauptet.

## Auf dem iPhone

In Safari die Website öffnen → **Teilen** → **Zum Home-Bildschirm**.
Das vorhandene Dolphins-App-Icon bleibt erhalten. Die Website benötigt zum erstmaligen Laden und für aktuelle Daten eine Internetverbindung. Sie ist keine vollständig offlinefähige App.

## Datenquelle und Grenzen

- Deutsche Einzelspiel-Auswahl: [RTL NFL](https://www.rtl.de/sport/nfl/) und [Sky NFL-Sendeplan](https://www.sky.de/sport/nfl/sendeplan). Aktuell zugeordnete RTL-Übertragungen sind jeweils direkt mit dem Wochenprogramm verknüpft.
- Game-Pass-Leistungsumfang: [DAZN-Hilfe](https://www.dazn.com/en-GB/help/articles/16310468908957-dazn-and-nfl-game-pass-the-ultimate-football-experience); separates Abonnement, Spiele live und auf Abruf. Aktuelle Deutschland-Verfügbarkeit zusätzlich am 21.09.2026 mit dem [Bericht zum Rechtewechsel](https://www.bild.de/sport/mehr-sport/pay-tv-vertrag-vorzeitig-gekuendigt-dazn-setzt-kuenftig-voll-auf-den-nfl-game-pass-69a583c24ffe244904b6503f) abgeglichen. Keine Preise oder Abopaket-Empfehlung hinterlegt.
- Die Senderanzeige ist keine vollständige historische TV-Datenbank. Programmänderungen und Änderungen der Quellseiten können zu Lücken führen; dann bleibt die Auswahl offen. Nicht bestätigte Sender und exklusive Verfügbarkeit werden nicht geraten.

- Spielplan: ESPN Team Schedule API, Miami-Team-ID 15; Preseason, Regular Season und Playoffs getrennt.
- Tabelle und Seeds: ESPN NFL Standings API, ausgewähltes Saisonjahr, Regular Season.
- Playoff-Begegnungen: ESPN NFL Scoreboard API mit Saisonjahr, `seasontype=3` und Runden 1, 2, 3 und 5; keine Pro-Bowl-Spiele.
- Logos: ESPN; vorhandenes lokales Dolphins-Icon für App und Kopfbereich.
- Die öffentlichen Schnittstellen sind keine garantierte offizielle API. Verzögerungen, kurzfristige Ausfälle, CORS-Änderungen oder Strukturänderungen können Anpassungen erfordern. „Live“ beschreibt den Spielstatus der Datenquelle, keine sekundengenaue Übertragung.
- Keine Wettquoten, Konten, Tracker oder Zugangsschlüssel.

## Prüfung

Automatisierte Tests prüfen Datenlogik, Kalenderaktualisierungen, Termin-IDs, Fehlerfälle, DOM-Integration und die neue Super-Bowl-Reihenfolge. Details und die Grenzen der Prüfung stehen in [PRUEFUNG.md](PRUEFUNG.md).

Eine echte Safari-/iPhone-Sichtprüfung, ein Live-Deployment des neuen Workflows und das tatsächliche Kalenderabo auf dem Gerät wurden hier nicht durchgeführt.
