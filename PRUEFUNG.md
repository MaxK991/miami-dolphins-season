# Prüfübersicht · Dolphins Hub v8.5.3

Stand: 22.09.2026

## Ergebnis

**71 automatisierte Tests erfolgreich:** 15 Tests für Spielplan-/Tabellenlogik, 27 DOM-Integrationstests, 9 Kalender-/Bereitstellungstests, 7 Playoff-Datentests und 13 Sender-/Bereitstellungstests.

Zusätzlich wurde die vollständige Kalendererzeugung mit frisch direkt von ESPN geladenen Daten ausgeführt: 20 Dolphins-Spiele der Saison 2026, davon **19 mit bestätigter Anstoßzeit** im Kalender. Week 18 gegen New England hat noch keine bestätigte Anstoßzeit und wird daher noch nicht als Kalendertermin angelegt.

Der Probelauf wurde ausdrücklich als lokal gekennzeichnet (`automatic: false`). Er wird nicht als aktiviertes Kalenderabo ausgegeben. Erst der eingerichtete GitHub-Ablauf veröffentlicht Kalender und Status mit `automatic: true`.

## Korrektur v8.5.3

- RTL-Originalartikel Woche 3 vom 22.09.2026 geladen und analysiert: fünf Spalten, weil Wochentag und Datum getrennt sind. Der bisherige Parser akzeptierte nur vier Spalten und lehnte die Liste deshalb ab.
- Beide Formate werden jetzt akzeptiert. Unbekannte Zusatzspalten bleiben abgewiesen; Datum, Kickoff, Paarung und Heimrecht werden weiterhin geprüft.
- Regressionstest mit einer minimalen, nach dem veröffentlichten Muster erstellten Liste: RTL+ wird als kostenpflichtiges Einzelspiel erkannt, NITRO getrennt als kostenlose Konferenz.
- Zusätzlich am vollständig frisch geladenen Original-HTML erfolgreich geprüft: Chiefs bei den Dolphins am 27.09.2026, RTL+ als Einzelspiel und NITRO als Konferenz.
- Bestätigte kostenlose Konferenzen erzeugen keinen pauschalen Hinweis auf unbestätigtes Free-TV mehr. Fehlende Einzelspiel-Zuordnung wird ausdrücklich als fehlender Datenbankeintrag bezeichnet.
- Das gesamte bestehende Testpaket einschließlich des neuen Formatfalls wurde erfolgreich ausgeführt: 71 Tests.
- Sender-Anfangsstand ergänzt; ältere Sky-Einträge werden nicht als frisch geprüft ausgegeben.

## Darstellung v8.5.2

Für die kompakte Darstellung wurden die **27 bestehenden DOM-Integrationstests erneut erfolgreich ausgeführt**. Die Senderprüfung kontrolliert zusätzlich die standardmäßig geschlossene Detailansicht, sichtbare Free-TV-/Abo-Kennzeichnungen in der Zusammenfassung und die Trennung der Konferenz von den Einzelspielen. Anbieterlinks, fehlende Quellen und der Start ohne optionales Sendermodul bleiben geprüft.

- Senderzusammenfassung ohne wiederholten Titel und lange Hinweistexte.
- Anbieterlinks, Konferenz und Quellen in nativen aufklappbaren Details.
- Mindestens 44 Pixel hohe Tippfläche; kurze Anbieterangaben dürfen bei schmalen Displays umbrechen.
- Veraltete bestätigte Senderangaben sind auch geschlossen gekennzeichnet.
- Keine Änderungen an Senderzuordnung, Kalender oder GitHub-Automatik.
- Die DOM-Prüfung ersetzt keine optische Safari-/iPhone-Prüfung; die Darstellung auf einem echten Gerät ist hier nicht verifiziert.

## Reparatur v8.5.1: Startabbruch bei unvollständiger Veröffentlichung

- Der Fehler wurde an der öffentlich veröffentlichten Website nachgewiesen: `app.js` und HTML v8.5 erreichbar, `broadcasts.js` und `broadcasts-de.json` mit HTTP 404.
- Der öffentliche Repository-Stand enthielt beide Hauptdateien, aber `automation/build-site.cjs` war noch die ältere Fassung ohne Senderdateien; `automation/broadcast-feed.cjs` fehlte.
- Aus den veröffentlichten Skripten ließ sich der Startfehler `ReferenceError: DolphinsBroadcasts is not defined` reproduzieren.
- Das Sendermodul ist für den Browser jetzt optional. Fehlt es, startet der Spielplan mit einem Hinweis auf nicht verfügbare Senderangaben.
- Ein neuer Regressionstest lässt das komplette Sender-Skript weg und prüft trotzdem Jahresauswahl, 20 Spielkarten, echte Live-Nullpunkte, Scroll-Aufruf, Tabelle, Playoffs und Kalenderabo.
- HTML-Dateien haben neue Versionsparameter 8.5.1, damit nach dem vollständigen Update die korrigierten Skripte neu geladen werden.
- Die genaue Reparatur für den beobachteten Repository-Stand steht oben in der README: vier Hauptdateien und zwei Dateien im bestehenden Ordner `automation`.

## Ergänzung v8.5: Sender in Deutschland

Ein kompletter lokaler Build mit frisch abgerufenen ESPN-, RTL- und Sky-Daten war am 21.09.2026 erfolgreich. Beide TV-Quellen wurden erkannt; 19 bestätigte Kalendertermine und die Senderdatei wurden erzeugt. Es wurde dabei nichts im GitHub-Konto veröffentlicht.

- Echte offizielle RTL-/Sky-Programmseiten als Prüfdaten: Dolphins bei den 49ers am 20.09.2026 als RTL-Einzelspiel; NITRO und Sky getrennt als Konferenz. Im Sky-Programm ist außerdem die Konferenz am 27.09.2026 bestätigt, ohne daraus ein Dolphins-Einzelspiel oder eine Free-TV-Auswahl abzuleiten.
- RTL+ wird als kostenpflichtig erkannt und erzeugt kein zusätzliches kostenloses RTL-Angebot.
- Beide Teams, Heimrecht, Datum in Deutschland, Jahreskontext und zeitliche Nähe zum Kickoff sind geprüft. Kurzer Vorlauf einer Übertragung ist zulässig; abweichender Kalendertag wird abgewiesen.
- Nachtspiele werden dem richtigen deutschen Datum zugeordnet. Eine verlegte Anstoßzeit entwertet die alte spezifische Senderzuordnung.
- Keine Übernahme von FOX/CBS/anderen US-Sendern als deutsche Anbieter.
- Noch nicht veröffentlichte Free-TV-Auswahl bleibt ausdrücklich unbestätigt; es gibt keine Behauptung „nur Pay-TV“ aus fehlenden Angaben.
- Historische Spiele und spätere Rechteperioden bekommen keine pauschale heutige Anbieterzuordnung.
- Fehlerhafte oder undatierte Programmseiten werden nicht als bestätigte Auswahl verwendet.
- Bei einem Quellenausfall bleiben bisherige Einträge mit unverändertem Prüfzeitpunkt erhalten. Bei künftigen Spielen erscheint ab 72 Stunden beziehungsweise aus dem Offline-Cache ein Hinweis auf ältere Angaben.
- Eine erfolgreich neu gelesene Programmquelle kann zurückgezogene zukünftige Übertragungen entfernen. Vergangene gespeicherte Übertragungen bleiben erhalten, wenn die Programmseite zur nächsten Woche wechselt.
- Links sind auf HTTPS und bekannte Programmquellen begrenzt; Darstellung und Inhalte werden maskiert. Externe Links öffnen getrennt mit `noopener noreferrer`.
- Der Site-Build enthält das neue Browsermodul und die erzeugte Senderdatei. TV-Quellenausfälle verhindern weder Kalendererzeugung noch Bereitstellung.
- Der bestehende GitHub-Workflow ist unverändert. Neue Senderdaten laufen über denselben geplanten Abruf; ein zusätzliches Konto oder Token ist nicht nötig.

## Ergänzung v8.4: Live-Punkte und zehn Archivjahre

- Der Fehler wurde mit frischen ESPN-Antworten reproduziert: laufendes Miami-Spiel mit Status und Uhr im Saison-Spielplan, aber ohne Punktzahlen; das separate Scoreboard enthält die Punktzahlen.
- Beide Quellen werden über die Ereignis-ID zusammengeführt; Miamis echte Nullpunkte und gegnerische Punkte bleiben der jeweiligen Team-ID zugeordnet.
- Live-Uhr, Viertel, 30-Sekunden-Abruf, Punkteänderung ohne Zurückspringen und gespeicherter Live-Stand bei Ausfällen sind getestet.
- Bestätigte Endergebnisse fallen nicht auf einen älteren Live-Status zurück. Nach Spielende wird das nächste Spiel ausgewählt.
- Die Auswahl enthält die aktuelle Saison und zehn frühere Saisons; der Jahreswechsel berücksichtigt die NFL-Playoffs im Januar/Februar.
- Archiv-Saisons rufen keine heutigen Live-Spielstände ab.
- Alle zehn historischen Saisons 2016–2025 wurden direkt von ESPN geladen und geprüft: Regular-Season-Spielplan, 32 Team-Bilanzen und vier Playoff-Runden je Jahr.
- Vor 2020: elf Playoff-Begegnungen insgesamt, sechs qualifizierte Teams je Conference, zwei Freilose. Ab 2020: 13 Begegnungen, sieben Teams, ein Freilos.
- Historische Kürzel OAK und SD werden den AFC-Teams zugeordnet.
- Die neue DOM-Prüfung für 2016 bestätigt sechs Teams pro Playoff-Feld und den Super Bowl direkt unter dem Champion.

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
