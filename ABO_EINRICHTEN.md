# Dolphins-Kalenderabo einmalig einrichten · v8.5.3

**Bereits eingerichtet?** Dann genügt das Update aus [README.md](README.md), einschließlich der beiden geänderten/neuen Dateien im Ordner `automation`. Der bestehende Workflow und dein Kalenderabo bleiben eingerichtet. Der Ablauf aktualisiert jetzt zusätzlich die deutsche Senderauswahl. Die folgenden Schritte sind für die erstmalige Einrichtung.

Diese Version erstellt einen **eigenen, automatisch aktualisierten Dolphins-Kalender**. Neue Spiele, bestätigte Playoff-Termine und verlegte Anstoßzeiten werden unter derselben Abo-Adresse bereitgestellt. Die Farbe wählst du anschließend auf deinem iPhone. Der Einzelspiel-Import wurde entfernt.

**Nur die Website-Dateien hochzuladen reicht für das automatische Abo noch nicht.** Zusätzlich richtest du einmalig den mitgelieferten GitHub-Ablauf ein. Du brauchst keinen weiteren Dienst, keinen API-Schlüssel und kein zusätzliches Konto. Die folgende Anleitung passt zu deinem Repository `MaxK991/miami-dolphins-season` mit dem Branch `main` und den Website-Dateien im Hauptordner.

## 1. Neue Dateien hochladen

1. ZIP entpacken.
2. Dein bisheriges Repository auf GitHub öffnen, oben **Code**, Branch **main**.
3. **Add file → Upload files** auswählen.
4. Den gesamten Inhalt des entpackten Ordners hochladen, **einschließlich des Ordners `automation`**. Die `index.html` muss direkt im Hauptordner liegen. Nicht die ZIP und nicht den äußeren entpackten Ordner hochladen.
5. Mit **Commit changes** speichern. Gleichnamige Website-Dateien werden ersetzt. Du musst das Repository vorher nicht leeren.

## 2. GitHub Pages umstellen

Im Repository **Settings → Pages → Build and deployment → Source** öffnen und **GitHub Actions** auswählen.

Die Website wird danach vom unten eingerichteten Ablauf veröffentlicht. Deine bisherige Website-Adresse bleibt gleich.

## 3. Die vorbereitete Automatik aktivieren

1. Zurück zu **Code**. Den Ordner **automation** öffnen und die Datei **dolphins-hub.yml** anklicken.
2. Über das **Stiftsymbol** die Datei bearbeiten.
3. Den Dateipfad oben auf **`.github/workflows/dolphins-hub.yml`** ändern. Den Inhalt unverändert lassen. Im GitHub-Dateinamenfeld kannst du mit Rückschritt aus dem bisherigen Ordner und mit `/` in neue Ordner wechseln.
4. Mit **Commit changes** direkt im Branch **main** speichern.

Die Datei wird damit aus `automation` nach `.github/workflows` verschoben. `automation/build-site.cjs`, `automation/calendar-feed.cjs` und `automation/broadcast-feed.cjs` bleiben im Ordner `automation`.

Falls das Ändern des Pfads unübersichtlich ist: Den gesamten Inhalt der mitgelieferten `automation/dolphins-hub.yml` kopieren. Im Hauptordner **Add file → Create new file** wählen, als Dateinamen `.github/workflows/dolphins-hub.yml` eingeben und den kopierten Inhalt einsetzen. Speichern. Die ursprüngliche Vorlage in `automation` darf in diesem Fall zusätzlich liegen bleiben.

## 4. Den ersten erfolgreichen Lauf prüfen

1. Oben **Actions** öffnen.
2. Links **Dolphins Hub und Kalenderabo** auswählen.
3. Der letzte Commit startet den Ablauf normalerweise bereits. Falls noch kein Lauf gestartet wurde: **Run workflow → main → Run workflow** wählen.
4. Warten, bis sowohl **build** als auch **deploy** einen grünen Haken haben.
5. Die Website neu laden. Unten muss **v8.5.3** stehen.
6. Unter **Spielplan → Dolphins-Kalender abonnieren** muss ein Kalenderstand erscheinen und **Auf dem iPhone abonnieren** aktiv sein.

Der Ablauf erstellt die Kalenderdatei selbst. Eine lokal erzeugte `.ics`-Datei brauchst du nicht hochzuladen. Solange die Einrichtung fehlt oder der Status nicht erreichbar ist, bietet die Website keinen scheinbar fertigen Abo-Link an.

## 5. Einmal auf dem iPhone abonnieren

1. Die Website in Safari öffnen.
2. Oben unter **Spielplan** auf **Dolphins-Kalender abonnieren** tippen.
3. **Auf dem iPhone abonnieren** wählen und das Kalenderabo auf dem Gerät bestätigen.
4. Falls sich die Kalender-App nicht öffnet: **Abo-Link kopieren**. Dann in Apples Kalender-App **Kalender → Hinzufügen → Kalenderabonnement** öffnen und den Link einsetzen. Die Beschriftung kann je nach iOS-Version etwas abweichen.
5. Die Farbe kannst du in der Kalender-App unter **Kalender → ⓘ neben Miami Dolphins** auswählen.

Der Kalender ist ein eigener, schreibgeschützter Abo-Kalender. Du kannst ihn unabhängig von deinen persönlichen Kalendern ein- oder ausblenden. Die Anstoßzeiten erscheinen in der Zeitzone deines Kalenders. Die Endzeit ist auf 3,5 Stunden geschätzt.

**Schon importierte Einzeltermine werden nicht automatisch gelöscht oder mit dem Abo zusammengeführt.** Entferne diese bei Bedarf manuell. Wenn du dafür bisher einen separaten Dolphins-Kalender angelegt hattest, kannst du diesen alten Kalender nach Prüfung entfernen. Deinen persönlichen Kalender mit anderen Terminen bitte behalten.

## Was wird automatisch aktualisiert?

- Beim ersten Einrichten: alle bestätigten Dolphins-Spiele der aktuellen NFL-Saison, einschließlich bereits vergangener Spiele dieser Saison.
- Weitere bestätigte Spiele und Dolphins-Playoff-Begegnungen kommen hinzu, sobald sie in den Quelldaten stehen.
- Verlegte Anstoßzeiten und Spielorte aktualisieren den bestehenden Abo-Termin über eine feste Ereignis-ID.
- Wird ein bestehender Termin abgesagt oder unbestimmt verschoben, wird der alte Termin als entfallen gekennzeichnet. Eine später bestätigte Neuansetzung verwendet dieselbe ID. Die Darstellung entfallener Termine hängt von der Kalender-App ab.
- Ab März kommt die neue NFL-Saison unter demselben Link hinzu. Frühere bereits abonnierte Saisontermine bleiben erhalten. Die Jahresauswahl auf der Website verändert den Abo-Link nicht.
- Das Abo enthält ausschließlich Dolphins-Spiele. Die vollständigen AFC-/NFC-Playoffs anderer Teams bleiben auf der Website unter Playoffs sichtbar.

## Aktualisierung und Wartung

GitHub plant einen Abruf **alle sechs Stunden**, jeweils um **00:23, 06:23, 12:23 und 18:23 UTC**. Außerdem startet ein Lauf beim Hochladen neuer Dateien nach `main` und bei **Run workflow**. Die Kalender-App ruft den veröffentlichten Kalender in ihrem eigenen Rhythmus ab. Änderungen erscheinen deshalb nicht zwingend sofort auf dem iPhone.

**GitHub kann zeitgesteuerte Abläufe in öffentlichen Repositories nach 60 Tagen ohne Repository-Aktivität deaktivieren.** Das Kalenderabo ist deshalb nicht dauerhaft wartungsfrei. Falls das passiert: **Actions → Dolphins Hub und Kalenderabo → Enable workflow** und anschließend **Run workflow**. Ein manuell gestarteter Lauf allein ist kein Ersatz für das erneute Aktivieren eines deaktivierten Zeitplans. Bei ausgelasteten GitHub-Systemen können geplante Läufe außerdem verspätet starten oder ausfallen.

Der Abo-Dialog zeigt den Stand des Kalenders an und warnt, wenn die Datei seit mehr als drei Tagen nicht aktualisiert wurde. Diese Warnung erscheint beim Öffnen des Dialogs, nicht als automatische iPhone-Benachrichtigung.

Wenn ESPN nicht erreichbar ist oder unplausible Daten liefert, bricht der Ablauf ab. Der bereits veröffentlichte Kalender und die Website bleiben bestehen. Ein veralteter Stand wird nicht mit erfundenen Daten ersetzt.

Nach der Einrichtung bitte **Source: GitHub Actions** beibehalten. Für spätere Website-Updates lädst du wieder die neuen Dateien in den Hauptordner hoch; der Ablauf veröffentlicht sie samt aktuellem Kalender. Wenn eine neue Version auch die Workflow-Vorlage ändert, muss deren Inhalt zusätzlich in `.github/workflows/dolphins-hub.yml` übernommen werden.

## Falls ein roter Fehler erscheint

- **Pages nicht eingerichtet:** Settings → Pages → Source muss GitHub Actions sein; danach Run workflow.
- **Datei nicht gefunden:** `index.html`, `core.js` und die übrigen Website-Dateien liegen direkt im Hauptordner; die beiden `.cjs`-Dateien unter `automation`.
- **HTTP-Fehler beim ESPN-Abruf:** später Run workflow erneut starten. Der bisherige Kalender bleibt erreichbar.
- **Ablauf fehlt:** Die `.yml`-Datei muss im Branch `main` unter `.github/workflows/` liegen.
- **Abo bleibt trotz grünem Lauf grau:** kurz warten, Website neu laden und den Abo-Dialog erneut öffnen. Erscheint der Kalenderstand weiterhin nicht, den letzten Ablauf unter Actions prüfen.

## Quellen und Prüfgrenze

- [Apple: Kalender verwalten, abonnieren und Farben ändern](https://support.apple.com/en-euro/guide/iphone/iph3d1110d4/ios)
- [GitHub: Pages mit GitHub Actions veröffentlichen](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub: Zeitgesteuerte Abläufe, Verzögerungen und 60-Tage-Regel](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

Die Kalendererzeugung und Website-Logik wurden lokal automatisiert geprüft. Die Aktivierung in deinem GitHub-Repository und das tatsächliche Abonnieren auf deinem iPhone erfolgen erst mit dieser Einrichtung; sie wurden hier nicht als bereits erledigt ausgegeben.
