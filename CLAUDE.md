# tagesbild.kompakt – Ablauf pro Zeitfenster

Instagram-Account mit aktuellen Nachrichten, kurz und verständlich erklärt, auf Deutsch. **Zwei Karussell-Posts pro Tag.**
Gleiches System wie krass.erforscht, aber für Nachrichten. Grundregel: **Es darf nichts kosten.** Keine kostenpflichtigen APIs, keine bezahlten Bilder.
**Nur frei lizenzierte Bilder, Videos und Musik.** Fotos und Videos von Nachrichtenseiten, Agenturen (dpa, Reuters, AP, Getty …) oder Social Media sind tabu,
auch wenn sie „überall“ zu sehen sind. Nachrichten-Fakten dürfen übernommen werden, aber immer **in eigenen Worten**, nie Sätze abschreiben.

Zuerst immer `git checkout main && git pull origin main` (Läufe starten oft auf losgelöstem HEAD, `git pull` scheitert sonst).

Vor jedem `node`-Befehl: `export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt NODE_NO_WARNINGS=1`

Der Instagram-Schlüssel heißt hier **`KLARTEXT_IG_TOKEN`** (nicht `IG_TOKEN`, der gehört zu krass.erforscht).
`publish.js` und `comments.js` prüfen, dass der Schlüssel zu @tagesbild.kompakt gehört, und brechen sonst ab.
Name, Repository, Farben, Schwerpunkte und Töne stehen zentral in `config.js`.

## Richtung (vom Nutzer festgelegt, 2026-11-16) – gilt für jeden Post

Ziel ist **Reichweite, Likes und Follower**. Wir gehen **komplett** in die Richtung erfolgreicher Kurzvideos (wie krass.erforscht,
Muster in `data/strategie.md`, Abschnitt „Vorbilder“), nicht im Wechsel – aber immer als **seriöser Nachrichten-Account**:
- **Immer ein Video mit Sprecherstimme** (Format `video`, Felder `video.voice` und `video.voiceText`), **25–45 Sekunden**,
  Stimme ab Sekunde 0, Tempo 1,2, mitlaufende Untertitel (macht `video-reel.js` automatisch). Ein Satz pro Zeile in `voice`,
  Zahlen dort ausgeschrieben, in `voiceText` derselbe Satz mit Ziffern. Das Wort „Wow“ nicht sprechen lassen (die Stimme sagt „Bau“).
- **Spannende Bilder statt Standbild:** möglichst echtes, bewegtes Material, das zur Meldung passt (Ort, Gegenstand, Ereignis).
  **Alle 3–5 Sekunden ein Schnitt:** mehrere Szenen mit `node clips.js videos/<id>.mp4 "<datei>|<start>|<dauer>" …` zusammensetzen
  (Videos und Fotos gemischt möglich). Die stärkste, bewegteste Szene zuerst. Ohne echtes Video: aus 2–4 guten Fotos mit `clips.js`
  oder `bilder-video.js` ein Video bauen. Fremdmotive als „Symbolvideo/Symbolbild“ kennzeichnen.
- **Aufbau:** erster gesprochener Satz = die überraschendste Tatsache oder eine Neugier-Frage („Ab Januar zahlst du für … mehr – warum?“),
  dann „Was heißt das für dich?“, Auflösung im Video; letzter Satz = leichte A-oder-B-Frage oder „Folge für Nachrichten in 30 Sekunden“.
- **Überschrift (`video.headline`) emotional mit genau einem passenden Emoji**, ca. 50–70 Zeichen, **aber wahr und angemessen**:
  bei ernsten oder traurigen Themen kein 😱/🤯, keine Übertreibung, Pläne bleiben Pläne („soll“). Sorgfalt geht immer vor Reichweite.
- **Caption:** „Text und Stimme mit KI erstellt“ statt nur „Text mit KI erstellt“.
- Getestet wird nur noch **innerhalb** dieser Richtung (z. B. 25 vs. 45 s, Frage- vs. Aussage-Einstieg, Schwerpunkt), immer eine Sache pro Post.
- **Stimme einrichten** (einmal pro Lauf, falls `/tmp/cb` fehlt, ca. 5 Minuten): siehe Kopf von `stimme/sprechen.py`.
  Die Sprachaufnahme dauert ca. 5–15 Minuten. Warnungen der Stimmprüfung lesen; klingt ein Satz falsch, umformulieren und neu bauen.
- **Zeiten:** Die Läufe liegen so, dass sie sich nicht mit krass.erforscht überschneiden (dessen Läufe: 7:45, 12:15, 18:15, 20:45 Uhr).

## Ablauf

A. **Kommentare beantworten** (bei jedem Lauf, nur wenn `KLARTEXT_IG_TOKEN` gesetzt ist):
   `node comments.js list`, dann pro Kommentar `node comments.js reply <id> "<text>"` oder `node comments.js skip <id>` (Regeln unten).
   Danach `data/answered.json` committen und pushen.
   Meldet `comments.js` „nicht abrufbar“ (Instagram gibt Kommentare privater oder als Spam markierter Konten nicht heraus):
   dem Nutzer in der Tagesnachricht kurz sagen, unter welchem Post er selbst nachsehen soll (Link), höchstens einmal pro Kommentar.
0. **Zeitfenster prüfen:** `node slot.js <morgens|mittags|abends|spaet>` (das Fenster steht in der Aufgabe). Bei „NEIN“ hier aufhören –
   **außer** die Ausgabe nennt „später heute: …“ und es gibt für dieses spätere Fenster noch keine vorbereitete Post-Datei von heute:
   dann den Post jetzt schon fertig vorbereiten (Schritte 1–9, aber **nicht** veröffentlichen, in der Post-Datei `"vorbereitet": true`),
   damit er im späteren Fenster pünktlich erscheint (Herstellung dauert ~45 Minuten). Vorbereitete Meldungen vor dem Posten kurz
   auf neue Entwicklungen prüfen (Nachrichten können sich in Stunden ändern) und wenn nötig aktualisieren.
   Liegt im Posting-Fenster schon eine fertige, gerenderte Post-Datei von heute vor: nach dieser Prüfung direkt mit Schritt 10 veröffentlichen.
   Nur wenn Kommentare beantwortet wurden, dem Nutzer kurz schreiben, wie viele; sonst keine Nachricht.
   Zwei Posts pro Tag in zwei von vier Fenstern (Läufe um 6:15, 10:40, 16:20 und 19:35 Uhr; veröffentlicht wird frühestens zu Beginn des Fensters: morgens ab 6, mittags ab 11, abends ab 16, spät ab 20 Uhr). Welche Fenster dran sind, entscheidet die Reichweite
   im Verhältnis zum Median des jeweiligen Formats (siehe „Immer nach der besten Reichweite“).
1. `npm ci`
2. **Lernen:** `node insights.js` (nur mit Token, holt Reichweite, Aufrufe, Zuschaudauer und Follower), dann **`node analyse.js`**.
   **Algorithmus-Analyse:** `data/analyse.md` lesen (Vergleich aller Posts nach Format, Schwerpunkt, Ton, Uhrzeit, Wochentag, Überschrift,
   Videolänge, Zuschaudauer) und `data/strategie.md` aktualisieren: neue deutliche Unterschiede als Regel „im Test“ aufnehmen, Regeln mit
   genug Daten (je 3 Posts mit/ohne) auf „bestätigt“ oder „verworfen“ setzen, mit Datum und Zahlen begründen, Verlauf ergänzen.
   Höchstens 6 Regeln; wenig Daten vorsichtig deuten. Beim heutigen Post **alle bestätigten Regeln anwenden** und **genau eine Regel im Test**
   (abwechselnd, damit es Vergleichsposts mit und ohne gibt); deren Kurzname als `"test"` in die Post-Datei schreiben.
   Ändert sich eine Regel, das dem Nutzer in der Tagesnachricht in einem Satz sagen. Die Regeln gelten nie gegen Sorgfalt und Sicherheitsregeln.
   Danach **`node schwerpunkt.js`**: sagt, welcher Schwerpunkt
   (geld, digital, alltag, umwelt, welt, sport) und welcher Ton heute dran sind, nach der Regel „Immer nach der besten Reichweite“.
   Der zweite Post des Tages bekommt automatisch einen anderen Schwerpunkt als der erste.
3. **Nachrichten sammeln:** `node fetch-news.js > data/candidates.json` (18 seriöse Feeds, höchstens 30 Stunden alt).
   `auchBei` zeigt, welche anderen Redaktionen dasselbe Thema haben: viele = große Nachricht, die viele interessiert.
3b. **Aus der Analyse lernen (Wunsch des Nutzers):** Vor Auswahl und Text `data/analyse.md` lesen und den Post danach ausrichten, innerhalb der Grundregeln:
   Was die besten Posts gemeinsam haben (Schwerpunkt, Ton, Format, Uhrzeit, Hook-Art, Folienzahl) häufiger nutzen, Schwaches seltener.
   Auf die Signale zielen, die Instagram stark gewichtet: **Speichern und Teilen** (Folie „Das solltest du dir merken“ oder eine Zahl zum Weitersagen, CTA-Folie mit
   „Speichern“ und „Teilen“), **Verweildauer** (starker Hook in der ersten Folie, Wischen lohnt sich) und **Follower** (CTA „Folge uns“ bei starken Posts).
   Wenn ein Video verfügbar ist, Video/Reel bevorzugen, solange es laut Analyse mehr Reichweite bringt. Die offene Hypothese vom Vortag bewusst testen
   und im Post-JSON nicht vermerken, aber in `data/analyse.md` festhalten, was geändert wurde.
4. **Meldung auswählen:** zum heutigen Schwerpunkt die Meldung, die **möglichst viele Menschen betrifft oder interessiert** und sich leicht erklären lässt
   („Was heißt das für mich?“). Nicht schon in `data/posted.json`, nicht dasselbe Thema wie ein Post der letzten 3 Tage (außer es gibt wirklich Neues).
   Findet sich zum Schwerpunkt nichts Gutes: den nächsten aus `ersatz` nehmen. Sicherheitsregeln unten beachten.
   **Eine richtig starke Geschichte oder ein besonders gutes Foto/Video geht vor:** Ist heute etwas deutlich Größeres oder Spannenderes
   in einem anderen Schwerpunkt da, das nehmen (Schwerpunkt und Ton im Post ehrlich so eintragen, wie sie sind).
5. **Fakten prüfen (Sorgfalt wie in einer Redaktion):**
   - Den Originalartikel ganz lesen. **Mindestens zwei voneinander unabhängige seriöse Redaktionen** müssen dasselbe berichten
     (z. B. tagesschau und Deutschlandfunk), **oder** eine Primärquelle (Behörde, Ministerium, Gericht, Statistisches Bundesamt, Bundesnetzagentur,
     Pressemitteilung eines Unternehmens über sich selbst).
   - Exklusivmeldungen einer einzelnen Redaktion nur mit Nennung: „laut ARD-Hauptstadtstudio“, „wie der Spiegel berichtet“.
   - Zahlen und Aussagen genau übernehmen. **Pläne, Entwürfe und Forderungen nie als Beschluss darstellen.** „soll“, „plant“, „laut“ beibehalten.
   - Bei laufenden Ereignissen nur Bestätigtes; lieber einen Tag später als falsch.
   - Alle verwendeten Quellen in `sources` eintragen.
6. **Bild suchen:** wie bei krass.erforscht, `node find-image.js "<englischer Begriff>" <post-id>` (Wikimedia Commons, Openverse, NASA).
   - Mindestens 3 Suchbegriffe (genau, allgemeiner, verwandtes Motiv), bei Bedarf mit `--mehr` (Smithsonian, Library of Congress, NASA, ESA, ESO).
   - Gut geeignet: Orte und Gebäude (Bundestag, Bahnhof, Firmenzentrale), Gegenstände (Geldscheine, Smartphone, Windrad), Personen des öffentlichen Lebens
     (Porträts auf Wikimedia Commons mit freier Lizenz).
   - **Zeigt ein Foto nicht das Ereignis selbst, `"symbolbild": true` setzen.** Dann steht „Symbolbild“ auf der Folie. Nie so tun, als zeige ein Foto das Ereignis.
   - Symbolfotos mit erkennbaren Privatpersonen nur in neutralem Zusammenhang (nie bei Betrug, Schulden, Krankheit …).
   - Jeden Kandidaten ansehen. Lieber kein Foto als ein falsches; ohne Foto gibt es die dunkle Titelfolie.
   - Titelbild nach `images/<post-id>.jpg`, `image` (file, credit, short, license, page, symbolbild) eintragen. Weitere Folien mit eigenen Fotos wie bei krass.erforscht
     (`<post-id>-2` …, `"position"` so wählen, dass das Motiv oben sichtbar ist). Dasselbe Foto höchstens auf zwei Folien
     (`render.js` setzt das Titelbild automatisch nur auf zwei Folien, die übrigen ohne eigenes Foto bleiben schlicht; besser: für jede Folie ein eigenes passendes Foto suchen).
6b. **Video (bei jedem Post gründlich suchen, kurze Videos machen die Posts deutlich spannender):**
   - `node find-video.js "<englischer Begriff>" <post-id>` (Wikimedia Commons, NASA; bei Weltraum-Themen mit `--weltraum` auch ESA/Webb, ESA/Hubble, ESO).
     **Mindestens 3 Suchbegriffe:** das Ereignis selbst, der Ort/Gegenstand (z. B. „Bundestag“, „euro banknotes“, „ICE train“, „smartphone“), ein verwandtes Motiv.
   - Zusätzlich per Websuche nach frei lizenzierten Videos zum Thema (Wikimedia Commons, Behörden mit ausdrücklich freier Lizenz).
     Nur Public Domain, CC0, CC BY, CC BY-SA, und die Lizenz muss auf der Seite stehen. Dann `node find-video.js --url <mp4> <post-id> --credit … --license … --page …`.
   - **Niemals** YouTube, TikTok, Instagram, Nachrichtenseiten, Agenturen oder Videos ohne klare freie Lizenz.
   - Bei jedem Kandidaten den Bogen `videos/candidates/<post-id>-v<n>-frames.jpg` ansehen. Erste Wahl: zeigt genau das Ereignis.
     Zweite Wahl: ein **Symbolvideo**, das zum Thema passt und nichts Falsches zeigt (Geldscheine bei einem Geld-Thema, fahrender Zug bei Bahn-News);
     dann `"symbolisch": true`, es wird sichtbar als „Symbolvideo“ gekennzeichnet. Besten Abschnitt wählen (8–30 Sekunden).
   - Gefunden: wie bei krass.erforscht nach `videos/<post-id>.mp4` (webm vorher mit ffmpeg umwandeln) und `"video"` eintragen
     (`file, start, duration, credit, short, license, page, symbolisch, headline, captions`).
   - **Format:** immer `video` (siehe „Richtung“); `node format.js` erinnert daran.
   - Früher: `node format.js ja` (Video gefunden) bzw. `nein`. Es wählt zwischen `bilder`, `video` (echtes Video als Reel im Feed) und `zusammen`
     (Karussell mit dem Video als zweiter Folie) nach der Regel „Immer nach der besten Reichweite“. Ergebnis als `"format"` eintragen.
7. **Post schreiben:** `posts/<YYYY-MM-DD>-<stichwort>.json` nach dem Muster von `beispiel/elterngeld.json`.
   - Felder: `id`, `date` (Zeitpunkt der Meldung, erscheint auf jeder Folie), `category` (Anzeigename, z. B. „Geld“), `topic` (= Schwerpunkt), `tone` (sachlich | ueberraschend | locker), `sources`.
   - 4–6 Folien: Titelfolie (die Nachricht in einem Satz), „Was ist passiert?“, „Was heißt das für dich?“, eine Zahl als `big`, Einordnung/„Wie geht es weiter?“, letzte Folie `cta`.
     Kurze Sätze, keine Fachwörter ohne Erklärung, `**Wort**` = Hervorhebung. Neutral bleiben, keine eigene Meinung.
   - Caption: erster Satz = Hook **mit dem Suchbegriff** (z. B. „Elterngeld“, „Deutschlandticket“, „WhatsApp“). Dann 1–2 Sätze Inhalt,
     eine Frage an die Leser (keine Streitfrage über Parteien), Quellen, „Text und Stimme mit KI erstellt“, Bildnachweise aller Fotos mit Lizenz,
     **höchstens 5 Hashtags** (1–2 allgemeine wie #nachrichten, 3–4 genaue).
8. **Rendern:** `node render.js posts/<datei>.json`, jede Folie ansehen und korrigieren, bis nichts abgeschnitten ist.
   `node reel.js posts/<datei>.json` und zwei, drei Standbilder prüfen. Bei Format `video`/`zusammen` zusätzlich `node video-reel.js posts/<datei>.json`.
9. **Speichern:** Post, Bilder, Videos, `out/`, `data/` und `music/library.json` committen und pushen.
10. **Posten** (nur mit `KLARTEXT_IG_TOKEN`), je nach Format genau wie bei krass.erforscht:
    `bilder`: `node publish.js posts/<datei>.json`, danach `node publish.js posts/<datei>.json --reel` ·
    `zusammen`: `... --zusammen`, danach `... --reel` · `video`: nur `... --video`.
    Schlägt ein Video-Teil fehl: auf `bilder` zurückfallen, Fehler in `data/probleme.md`. Danach `data/posted.json` committen und pushen (auch `data/analyse.md`, `data/analyse.json`, `data/account.json`, `data/strategie.md`).
10b. **Tägliche Analyse (Wunsch des Nutzers, bei jedem Lauf nach dem Posten):** `node analyse.js` schreibt `data/analyse.md`
    (Reichweite, Likes, Speichern/Teilen, Follower je Schwerpunkt, Ton, Format, Uhrzeit, Wochentag). Danach in `data/analyse.md` unter
    „Erkenntnisse“ 2–4 Sätze ergänzen: Was verstehen wir über den Instagram-Algorithmus, was bringt Aufrufe, Likes, Follower?
    Eine konkrete Hypothese zum Testen für morgen nennen (kleine Stichprobe ehrlich benennen). Der Nutzer bekommt 1–2 Sätze davon in der Tagesnachricht.
    Committen und pushen (`data/analyse.md`).
11. **Selbst verbessern** (fester Teil jedes Tages: einmal täglich nach dem Posten, beim zweiten Post des Tages):
    - Rückblick: Was ist heute schiefgegangen oder war umständlich? `data/probleme.md`, `data/learnings.json` und die Ausgabe von
      `node schwerpunkt.js` lesen: Welche Schwerpunkte, Töne, Formate, Uhrzeiten laufen laut Reichweite gut oder schlecht?
    - **Fehler aus dem heutigen Lauf haben Vorrang:** Was den Lauf aufgehalten hat (Skriptfehler, Quelle nicht erreichbar, Folie abgeschnitten),
      wird als Erstes so behoben, dass es beim nächsten Lauf nicht wieder passiert.
    - **Montags** kurz im Netz nachsehen, ob sich bei Instagram etwas geändert hat (Algorithmus, Regeln, Schnittstelle, neue Funktionen).
      Neue Erkenntnisse oben in `data/strategie.md` eintragen und, wenn sinnvoll, als Regel „im Test“ aufnehmen.
    - **Höchstens eine** kleine, sinnvolle Verbesserung umsetzen (Code, Anleitung, Vorlage, neuer freier Feed oder Bildquelle). Vorher testen
      (heutigen Post neu rendern bzw. geändertes Skript ausführen). Klappt der Test nicht: `git checkout -- <datei>`. **Nie Dateien, Posts oder Daten löschen.**
      Nur Funktionierendes committen und pushen, in `data/verbesserungen.md` mit Datum und einem Satz festhalten, dem Nutzer in der Tagesnachricht kurz nennen.
    - **Nicht ohne den Nutzer ändern:** Grundregeln (kostenlos, nur freie Medien, Sicherheitsregeln, Sorgfalt, Ehrlichkeit über KI), Zeitpläne der Aufgaben,
      Konten und Zugänge, die Zahl der Posts pro Tag, die Liste der Schwerpunkte. Das nur vorschlagen.
    - **Wenn etwas vom Nutzer gebraucht wird:** in der Tagesnachricht kurz und mit Schritt-für-Schritt-Anleitung auf Deutsch. Offene Bitten in
      `data/offene-bitten.md` führen und erst nach 3 Tagen erneut erinnern.
    - **Sonntags** dem Nutzer eine kurze Wochenbilanz schicken: welcher Schwerpunkt, welche Uhrzeit, welches Format bisher vorne liegt (aus `data/learnings.json`).

## Immer nach der besten Reichweite

Uhrzeit (`slot.js`), Format (`format.js`), Schwerpunkt und Ton (`schwerpunkt.js`) folgen derselben Regel aus `choose.js`:
gezählt werden die erreichten Konten aller Posts, die mindestens einen Tag alt sind. Was noch keine 2 Posts hat, bekommt eine faire Chance;
sonst gewinnt an 3 von 4 Tagen die Variante mit der höchsten mittleren Reichweite (Median, damit ein einzelner Ausreißer nicht alles verzerrt),
am 4. wird zum Weiterlernen etwas anderes probiert. Bei der Uhrzeit zählt die Reichweite im Verhältnis zum Median des Formats.
Die Entscheidung hängt nur vom Datum ab, damit alle Läufe eines Tages übereinstimmen. Eine richtig starke Geschichte oder ein besonders gutes Bild geht trotzdem vor.

## Sicherheitsregeln – immer überspringen

- Krieg, Terror, Anschläge, Kriminalität, Unglücke und Unfälle mit Toten oder Verletzten
- Parteipolitik, Wahlkampf, Umfragen zu Parteien, Meinungsstreit. Erlaubt: neutral erklären, **was sich für die Leute ändert** (beschlossene Gesetze,
  konkrete Pläne mit „soll“), ohne Partei zu loben oder zu kritisieren. (Instagram empfiehlt politische Inhalte Nicht-Followern ohnehin kaum.)
- Religion, Migration als Streitthema
- Gesundheits- und Ernährungstipps, Medikamente, Heilversprechen; Anlage- und Finanztipps (Aktien, Krypto, „jetzt kaufen“)
- Meldungen über einzelne, namentlich genannte Privatpersonen
- Gerüchte, Boulevard, unbestätigte Meldungen, Meldungen nur aus Social Media

## Bildregeln

Nur Bilder aus `find-image.js`. Erlaubt: Public Domain, CC0, CC BY, CC BY-SA. Nie „NC“ oder „ND“.
Niemals Bilder von Nachrichtenseiten, Agenturen, Pressemitteilungen oder Social Media, auch nicht „weil sie überall sind“.
Bei CC BY und CC BY-SA in der Caption: Fotograf, Lizenz, Quelle (z. B. „Foto: Rushen, CC BY-SA 2.0, via Wikimedia Commons“).
Fotos, die nicht das Ereignis selbst zeigen, sind Symbolbilder und werden so gekennzeichnet.

## Kommentare

Wie bei krass.erforscht: locker, freundlich, auf Deutsch (sonst in der Sprache des Kommentars), mit „du“, 1–2 Sätze, höchstens ein Emoji, mit @Name.
- **Witze und Sprüche:** mitspielen statt belehren. Nicht korrigieren oder erklären, warum etwas nicht geht – das wirkt klugscheißerisch
  (Wunsch des Nutzers). Bei ernsten Nachrichten trotzdem respektvoll bleiben.
- Fragen nur mit Fakten aus dem Post oder den geprüften Quellen beantworten. Unsicher: ehrlich sagen und auf die Quelle verweisen.
- Hinweis auf einen Fehler: Quelle prüfen. Stimmt er, bedanken, richtigstellen, in `data/probleme.md` notieren und dem Nutzer melden.
- Gegenfrage, wenn es passt („Betrifft dich das auch?“).
- **Auslassen (`skip`):** Spam, Links, Beleidigungen, Hass, **politische Debatten und Parteistreit**, Religion, Gesundheits- oder Finanzrat, sehr Persönliches,
  reine Emoji- oder Ein-Wort-Kommentare (höchstens ab und zu mit einem Emoji antworten).
- Frage nach KI: ehrlich ja (Texte mit KI erstellt, Fakten aus seriösen Quellen geprüft).
- Nie Privates erfragen, nichts versprechen, keine Links schicken, nicht auf Streit einsteigen. Höchstens 30 Antworten pro Lauf.

## Wenn etwas schiefgeht

Posten schlägt fehl, ein Post wird gemeldet oder als falsch kritisiert: nichts weiter posten, Problem in `data/probleme.md`, Nutzer informieren.
Stellt sich eine Meldung nachträglich als falsch heraus: Richtigstellung als Kommentar unter den Post und dem Nutzer sagen, dass er den Post prüfen oder löschen sollte.
