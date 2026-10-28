# klartext.kompakt – Ablauf pro Zeitfenster

Instagram-Account mit aktuellen Nachrichten, kurz und verständlich erklärt, auf Deutsch. **Zwei Karussell-Posts pro Tag.**
Gleiches System wie krass.erforscht, aber für Nachrichten. Grundregel: **Es darf nichts kosten.** Keine kostenpflichtigen APIs, keine bezahlten Bilder.
**Nur frei lizenzierte Bilder, Videos und Musik.** Fotos und Videos von Nachrichtenseiten, Agenturen (dpa, Reuters, AP, Getty …) oder Social Media sind tabu,
auch wenn sie „überall“ zu sehen sind. Nachrichten-Fakten dürfen übernommen werden, aber immer **in eigenen Worten**, nie Sätze abschreiben.

Vor jedem `node`-Befehl: `export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt NODE_NO_WARNINGS=1`

Der Instagram-Schlüssel heißt hier **`KLARTEXT_IG_TOKEN`** (nicht `IG_TOKEN`, der gehört zu krass.erforscht).
`publish.js` und `comments.js` prüfen, dass der Schlüssel zu @klartext.kompakt gehört, und brechen sonst ab.
Name, Repository, Farben, Schwerpunkte und Töne stehen zentral in `config.js`.

## Ablauf

A. **Kommentare beantworten** (bei jedem Lauf, nur wenn `KLARTEXT_IG_TOKEN` gesetzt ist):
   `node comments.js list`, dann pro Kommentar `node comments.js reply <id> "<text>"` oder `node comments.js skip <id>` (Regeln unten).
   Danach `data/answered.json` committen und pushen.
0. **Zeitfenster prüfen:** `node slot.js <morgens|mittags|abends>` (das Fenster steht in der Aufgabe). Bei „NEIN“ hier aufhören.
   Nur wenn Kommentare beantwortet wurden, dem Nutzer kurz schreiben, wie viele; sonst keine Nachricht.
   Zwei Posts pro Tag in zwei von drei Fenstern (7:15, 12:15, 18:15 Uhr). Die ersten 30 Posts testen alle Fenster gleich oft, danach gewinnen die zwei besten.
1. `npm ci`
2. **Lernen:** `node insights.js` (nur mit Token). Danach **`node schwerpunkt.js`**: sagt, welcher Schwerpunkt und welcher Ton heute dran sind.
   Testphase: jeder Schwerpunkt (geld, digital, alltag, umwelt, welt, sport) kommt reihum dran, bis jeder 4 ausgewertete Posts hat.
   Danach zu 70 % der erfolgreichste, zu 30 % ein anderer. So setzt sich von selbst der Schwerpunkt durch, der am besten ankommt.
   Den zweiten Post am selben Tag nicht zum gleichen Schwerpunkt machen, wenn `ersatz` etwas Gutes bietet.
3. **Nachrichten sammeln:** `node fetch-news.js > data/candidates.json` (18 seriöse Feeds, höchstens 30 Stunden alt).
   `auchBei` zeigt, welche anderen Redaktionen dasselbe Thema haben: viele = große Nachricht, die viele interessiert.
4. **Meldung auswählen:** zum heutigen Schwerpunkt die Meldung, die **möglichst viele Menschen betrifft oder interessiert** und sich leicht erklären lässt
   („Was heißt das für mich?“). Nicht schon in `data/posted.json`, nicht dasselbe Thema wie ein Post der letzten 3 Tage (außer es gibt wirklich Neues).
   Findet sich zum Schwerpunkt nichts Gutes: den nächsten aus `ersatz` nehmen. Sicherheitsregeln unten beachten.
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
     (`<post-id>-2` …, `"position"` so wählen, dass das Motiv oben sichtbar ist). Dasselbe Foto höchstens auf zwei Folien.
6b. **Video:** `node find-video.js "<englischer Begriff>" <post-id>` und Websuche nach frei lizenzierten Videos (Wikimedia Commons, NASA, ESA, EU-Kommission
   Audiovisual Service nur wenn ausdrücklich frei). Nur Public Domain, CC0, CC BY, CC BY-SA. **Niemals** YouTube, TikTok, Instagram, Nachrichtenseiten, Agenturen.
   Symbolvideos mit `"symbolisch": true`. Danach `node format.js ja|nein` und das Ergebnis als `"format"` eintragen (ohne Video immer `bilder`).
7. **Post schreiben:** `posts/<YYYY-MM-DD>-<stichwort>.json` nach dem Muster von `beispiel/elterngeld.json`.
   - Felder: `id`, `date` (Zeitpunkt der Meldung, erscheint auf jeder Folie), `category` (Anzeigename, z. B. „Geld“), `topic` (= Schwerpunkt), `tone` (sachlich | ueberraschend | locker), `sources`.
   - 4–6 Folien: Titelfolie (die Nachricht in einem Satz), „Was ist passiert?“, „Was heißt das für dich?“, eine Zahl als `big`, Einordnung/„Wie geht es weiter?“, letzte Folie `cta`.
     Kurze Sätze, keine Fachwörter ohne Erklärung, `**Wort**` = Hervorhebung. Neutral bleiben, keine eigene Meinung.
   - Caption: erster Satz = Hook **mit dem Suchbegriff** (z. B. „Elterngeld“, „Deutschlandticket“, „WhatsApp“). Dann 1–2 Sätze Inhalt,
     eine Frage an die Leser (keine Streitfrage über Parteien), Quellen, „Text mit KI erstellt“, Bildnachweise aller Fotos mit Lizenz,
     **höchstens 5 Hashtags** (1–2 allgemeine wie #nachrichten, 3–4 genaue).
8. **Rendern:** `node render.js posts/<datei>.json`, jede Folie ansehen und korrigieren, bis nichts abgeschnitten ist.
   `node reel.js posts/<datei>.json` und zwei, drei Standbilder prüfen. Bei Format `video`/`zusammen` zusätzlich `node video-reel.js posts/<datei>.json`.
9. **Speichern:** Post, Bilder, Videos, `out/`, `data/` und `music/library.json` committen und pushen.
10. **Posten** (nur mit `KLARTEXT_IG_TOKEN`), je nach Format genau wie bei krass.erforscht:
    `bilder`: `node publish.js posts/<datei>.json`, danach `node publish.js posts/<datei>.json --reel` ·
    `zusammen`: `... --zusammen`, danach `... --reel` · `video`: nur `... --video`.
    Schlägt ein Video-Teil fehl: auf `bilder` zurückfallen, Fehler in `data/probleme.md`. Danach `data/posted.json` committen und pushen.
11. **Selbst verbessern** (einmal am Tag, beim zweiten Post des Tages):
    - Rückblick: Was ist schiefgegangen oder war umständlich? `data/probleme.md` und `data/learnings.json` lesen: Welche Schwerpunkte, Töne, Formate, Uhrzeiten laufen gut?
    - **Montags** kurz im Netz nachsehen, ob sich bei Instagram etwas geändert hat (Algorithmus, Regeln, Schnittstelle).
    - **Höchstens eine** kleine, sinnvolle Verbesserung umsetzen (Code, Anleitung, Vorlage, neuer freier Feed oder Bildquelle). Vorher testen
      (heutigen Post neu rendern bzw. geändertes Skript ausführen). Klappt der Test nicht: `git checkout -- <datei>`. **Nie Dateien, Posts oder Daten löschen.**
      Nur Funktionierendes committen und pushen, in `data/verbesserungen.md` mit Datum und einem Satz festhalten, dem Nutzer kurz nennen.
    - **Nicht ohne den Nutzer ändern:** Grundregeln (kostenlos, nur freie Medien, Sicherheitsregeln, Sorgfalt, Ehrlichkeit über KI), Zeitpläne der Aufgaben,
      Konten und Zugänge, die Zahl der Posts pro Tag, die Liste der Schwerpunkte. Das nur vorschlagen.
    - **Wenn etwas vom Nutzer gebraucht wird:** in der Tagesnachricht kurz und mit Schritt-für-Schritt-Anleitung auf Deutsch. Offene Bitten in
      `data/offene-bitten.md` führen und erst nach 3 Tagen erneut erinnern.
    - **Sonntags** dem Nutzer eine kurze Wochenbilanz schicken: welcher Schwerpunkt, welche Uhrzeit, welches Format bisher vorne liegt (aus `data/learnings.json`).

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
