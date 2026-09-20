# Prüfübersicht · Dolphins Hub v8.1

Stand: 20.09.2026

## Gefundene und korrigierte Fehler

1. **Punktzahlen vertauscht dargestellt:** Bisher erschien links das gegnerische Team, darunter links aber Miamis Punktzahl. Jetzt besitzt jede Teamzeile ihre eigene Punktzahl, bestimmt durch Team-ID 15 beziehungsweise Kürzel MIA, unabhängig von Heimrecht und API-Reihenfolge.
2. **Jahreszahl fest einprogrammiert:** Bisher wurden nur 2024 bis 2026 unterstützt und 2026 war der feste Standard. Jetzt werden aktuelle Saison und Auswahl dynamisch berechnet.
3. **Laufende Spiele übersprungen:** Bisher musste die Anstoßzeit in der Zukunft liegen, damit ein Spiel als aktuell ausgewählt wurde. Jetzt haben laufende Spiele Vorrang; ein gerade erfolgter Anstoß bleibt bei verzögertem Status-Update berücksichtigt.
4. **Kein automatischer Sprung zum aktuellen Spiel:** Jetzt wird die ausgewählte Karte beim Öffnen unterhalb des festen Kopfbereichs sichtbar. Manuelles Scrollen während des Ladens wird respektiert.
5. **Falsche Tabellen und Playoff-Platzierungen:** Bisher basierten Bilanzen sämtlicher AFC-Teams nur auf Begegnungen der Dolphins, aus Dolphins-Perspektive. Jetzt werden die vollständigen Tabellendaten und gelieferten Seeds verwendet.
6. **Fehlende robuste Fehlerbehandlung:** Teilfehler und gespeicherte Daten werden sichtbar gekennzeichnet. Fehlende Daten werden nicht als 0:0 oder erfundene Platzierungen ausgegeben.

## Erfolgreiche automatisierte Tests

### Datenlogik (12 Tests)

- Miamis 6:9-Niederlage für beide Heimrechte und beide Reihenfolgen der API-Teams.
- Unterschiedliche Punkteformate, Siege, Unentschieden, echte Nullpunkte und fehlende Werte.
- Ausschluss von Preseason und Playoffs aus der Regular-Season-Bilanz.
- Aktuelles Saisonjahr, Januar/Februar und Jahresfortschreibung ab März.
- Vorrang eines laufenden Spiels vor späteren Spielen.
- Spiel-Fokus unmittelbar nach Anstoß bei noch verzögertem API-Status.
- Weiterspringen nach Spielende, Umgang mit abgesagten/verschobenen Spielen und abgeschlossenen Saisons.
- Filterung nach Saison/Phase und Entfernung doppelter Ereignisse.
- Deutsche Zeiten, Mitternacht, Sommer-/Winterzeit, unbestätigte Termine.
- Vollständige 2025er Bilanzen und Seeds aller AFC-Teams aus echten ESPN-Daten.
- Erkennung fehlender oder doppelter Playoff-Seeds.
- Verarbeitung echter 2026er Spielplan- und Tabellendaten.

### DOM-Integration (10 Tests)

Die Integrationstests verwenden eine DOM-Simulation mit kontrollierter Uhrzeit und aufgezeichneten ESPN-Antworten. Sie sind keine Tests in einem Browser mit Layout-Engine.

- Neues Öffnen trotz alter Saison-URL: aktuelle Saison, 20 Spielkarten, eine aktuelle Karte und automatischer Scroll-Aufruf.
- Archiv-Saisonauswahl und interne Navigation; frischer Seitenaufruf setzt die Saison zurück.
- Vollständige AFC-Seeds, alle 16 Teams und sieben Teams im aktuellen Playoff-Feld.
- Aktualisierung ohne Zurückspringen; gespeicherte Werte bei Netzfehler sichtbar markiert.
- Komplettausfall ohne Fantasiedaten, mit Erneut-versuchen-Button.
- Teilfehler: verfügbare Spiele bleiben sichtbar, fehlende Phase wird ausgewiesen.
- Fehlende Seeds: Bilanzübersicht statt erfundener Playoff-Plätze.
- Wiederherstellung aus dem Browser-Zwischenspeicher setzt die aktuelle Saison und das Spiel zurück.

## Weitere Prüfungen

- JavaScript-Syntax von `app.js` und `core.js` geprüft.
- Spielplan und Tabelle direkt über die ESPN-Endpunkte erfolgreich abgerufen.
- Tabellen-Endpunkt antwortet mit HTTP 200 und `Access-Control-Allow-Origin: *` auf einen Abruf mit GitHub-Pages-Origin; direkter Abruf aus einer statischen Website ist damit zum Prüfzeitpunkt grundsätzlich zugelassen.
- Alle internen Assets werden relativ eingebunden: kompatibel mit GitHub-Pages-Projektpfaden.
- Existierende Einstiegsseiten und 180×180-Pixel-App-Icon bleiben erhalten.

## Nicht verifiziert

- Optische Darstellung, tatsächliche Scrollposition und Touch-Bedienung auf einem echten iPhone/Safari.
- Vollständiger Browser-Klicktest: Die Browser-Sicherheitsrichtlinie dieser Umgebung sperrt lokale Vorschauen.
- Tatsächlicher Kalenderimport in iOS und Installation auf dem Home-Bildschirm.
- Zukünftige Stabilität der öffentlichen ESPN-Schnittstelle.

Die mobile Darstellung wurde im CSS für kleine Bildschirme, Safe Areas und größere Touch-Flächen implementiert, aber nicht als visuell geprüft ausgegeben.

## Ergänzung v8.1

- Neuladen von Tabelle und Playoffs wird mit zuvor ausgewählter Archiv-Saison getestet: URL, aktive Navigation, Saison und Scroll-Aufruf zeigen danach den aktuellen Spielplan.
- Wiederherstellung einer Archiv-Playoff-Seite aus dem Browser-Zwischenspeicher führt ebenfalls zum aktuellen Spielplan.
- 22 automatisierte Tests erfolgreich; weiterhin keine echte Browser-Sichtprüfung.
