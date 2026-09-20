# Prüfübersicht · Dolphins Hub v8.3

Stand: 20.09.2026

## Ergebnis

**45 automatisierte Tests erfolgreich:** 12 Tests für Spielplan-/Tabellenlogik, 18 DOM-Integrationstests, 9 Kalender-/Bereitstellungstests und 6 Playoff-Datentests.

Zusätzlich wurde die vollständige Kalendererzeugung mit frisch direkt von ESPN geladenen Daten ausgeführt: 20 Dolphins-Spiele der Saison 2026, davon **19 mit bestätigter Anstoßzeit** im Kalender. Week 18 gegen New England hat noch keine bestätigte Anstoßzeit und wird daher noch nicht als Kalendertermin angelegt.

Der Probelauf wurde ausdrücklich als lokal gekennzeichnet (`automatic: false`). Er wird nicht als aktiviertes Kalenderabo ausgegeben. Erst der eingerichtete GitHub-Ablauf veröffentlicht Kalender und Status mit `automatic: true`.

## Neue Kalenderfunktion

- Wiederholtes Laden unveränderter Daten erzeugt keine zusätzlichen Termine und erhöht die Ereignisversion nicht.
- Eine verlegte Anstoßzeit behält die Ereignis-ID und erhöht `SEQUENCE`; der bestehende Termin lässt sich dadurch aktualisieren.
- Zusätzliche Spiele erscheinen als neue Termine.
- Bereits abonnierte, danach unbestimmt verschobene Termine werden als entfallen gekennzeichnet; bei bestätigter Neuansetzung wird dieselbe ID reaktiviert.
- Neue Termine ohne bestätigte Anstoßzeit werden ausgelassen.
- Historische abonnierte Termine bleiben erhalten. Entfallene zukünftige Termine werden gekennzeichnet.
- Der Saisonwechsel 2026 → 2027 ist mit Testdaten geprüft: der Abo-Link bleibt gleich, historische Einträge bleiben bestehen, veröffentlichte neue Saisonspiele kommen hinzu.
- UTC-Zeiten, geschätzte Endzeit, Text-Escaping, CRLF-Zeilenenden und Zeilenfaltung mit maximal 75 UTF-8-Bytes geprüft.
- Keine fest erzwungene Kalenderfarbe und keine automatisch hinzugefügten Erinnerungsalarme.
- Projektpfade unter GitHub Pages bleiben im HTTPS-/webcal-Link erhalten; eine Archiv-Jahresauswahl verändert den Link nicht.
- Einmalige Importaktionen und der Kalenderbutton an der Spielkarte sind entfernt.
- Der Abo-Button ist nur unter Spielplan sichtbar. Das Abo funktioniert unabhängig davon, ob die Website gerade ESPN-Daten abrufen kann.
- Fehlender oder als nicht automatisch bereitgestellt gekennzeichneter Kalender aktiviert keinen Abo-Link.
- Ein Kalenderstand älter als drei Tage löst einen sichtbaren Hinweis im geöffneten Dialog aus.

## Bereitstellung

- Die Kalendererzeugung lädt den zuletzt veröffentlichten Ereignisstatus zur Erhaltung von IDs, Erstellungszeiten und Versionsnummern.
- HTTP-Fehler, unplausible Saisonantworten und plötzlich leere zuvor vorhandene Spielplanabschnitte brechen die Bereitstellung ab.
- Geprüft: Bei simuliertem Ausfall wird eine vorhandene Kalenderdatei nicht überschrieben.
- Die Veröffentlichung in GitHub Actions hängt vom erfolgreichen Build ab. Die Website wird direkt als Pages-Artefakt veröffentlicht, ohne Bot-Commits als indirekten Auslöser.
- YAML-Struktur, Zeitplan, Standardbranch und Abhängigkeit des Deploy-Jobs geprüft.
- Die Website-Ausgabe enthält nur die vorgesehenen öffentlichen Dateien. Build-Skripte werden nicht in die Website-Ausgabe kopiert.
- Die benötigte `.nojekyll`-Datei wird automatisch erzeugt; der Finder muss keine versteckten Dateien hochladen.
- GitHub kann geplante Abläufe nach 60 Tagen ohne Repository-Aktivität deaktivieren. Diese Grenze und die Reaktivierung sind in `ABO_EINRICHTEN.md` dokumentiert.

## Playoffs und neue Reihenfolge

- Der Champion steht oben; **direkt danach folgt das Super-Bowl-Feld**, genau einmal.
- Danach folgen Miami-Status sowie Wild Card, Divisional Round und Conference Finals; AFC-/NFC-Setzlisten bleiben enthalten.
- Historische ESPN-Daten für 2024 und 2025 enthalten jeweils 13 Begegnungen: 6 Wild Cards, 4 Divisional Games, 2 Conference Finals und 1 Super Bowl.
- Team-Punkte bleiben auch bei vertauschter API-Reihenfolge richtig zugeordnet.
- Datum, deutsche Uhrzeit, Stadion, Sieger und korrekte Zuordnung der Playoffs zum Saisonjahr geprüft.
- Keine Siegerbehauptung während laufender oder noch nicht gestarteter Spiele.
- TBD-Platzhalter, Pro Bowl, falsche Saison/Runde und Duplikate werden ausgeschlossen.
- Fehlende Tabelle unterdrückt verfügbare Begegnungen nicht; eine fehlende Runde unterdrückt die übrigen Runden nicht.

## Bisherige Funktionen weiterhin geprüft

- Miamis 6:9-Niederlage wird unabhängig von Heimrecht und API-Teamreihenfolge korrekt zugeordnet.
- Unterschiedliche Punkteformate, echte Nullpunkte, Unentschieden und fehlende Ergebnisse.
- Regular-Season-Bilanz schließt Preseason und Playoffs aus.
- Aktuelle Saison dynamisch; Januar/Februar gehören noch zur vorangegangenen NFL-Saison.
- Laufendes beziehungsweise nächstes Spiel wird ausgewählt; gerade erfolgter Anstoß bleibt bei verspäteten Quelldaten berücksichtigt.
- Beim Öffnen/Neuladen auch aus Tabelle und Playoffs: Spielplan, aktuelle Saison und Scroll-Aufruf zum aktuellen Spiel.
- Archivwahl bleibt während interner Navigation erhalten; eine neue Sitzung setzt sie zurück.
- Deutsche Zeitzone inklusive Sommer-/Winterzeit und Datumswechsel nach Mitternacht.
- Vollständige AFC-/NFC-Tabellen und gelieferte Seeds, keine erfundenen Tiebreaker.
- Netzfehler und gespeicherte Daten werden sichtbar gekennzeichnet; keine Fantasie-Spielstände.

## Nicht verifiziert

- Echte optische Darstellung, tatsächliche Scrollposition und Touch-Bedienung auf einem iPhone/Safari.
- Vollständiger Browser-Klicktest: Die Browser-Sicherheitsrichtlinie dieser Umgebung blockiert lokale Vorschauen. Die DOM-Tests besitzen keine Layout-Engine.
- Ausführung des neuen Workflows im GitHub-Konto des Nutzers und dessen tatsächliches Pages-Deployment.
- Abonnieren und spätere Aktualisierungsintervalle in der iPhone-Kalender-App.
- Dauerhafte Verfügbarkeit und unveränderte Struktur der öffentlichen ESPN-Schnittstellen.

Die Version ist als Upload-Paket vorbereitet. Die einmalige Aktivierung durch den Nutzer ist in `ABO_EINRICHTEN.md` beschrieben; ein erfolgreicher lokaler Probelauf ersetzt diese Einrichtung nicht.
