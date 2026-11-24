# Strategie: Was der Algorithmus belohnt

Lebendes Dokument (nach dem Vorbild von krass.erforscht). Wird nach jeder Analyse (`node analyse.js`) aktualisiert.
Status: **bestätigt** (immer anwenden) · **im Test** (abwechselnd anwenden und vergleichen) · **verworfen**.
Höchstens 6 Regeln. Eine Regel gilt erst als bestätigt, wenn sie in mindestens 3 Posts mit und 3 ohne getestet wurde und klar besser ist.
Keine Regel gilt gegen Sorgfalt, Sicherheitsregeln oder Ehrlichkeit (keine reißerischen oder irreführenden Überschriften).

## Was Instagram laut Fachseiten 2026 belohnt (Montags-Recherche)
- Teilen per Direktnachricht, Speichern und Wiedergabezeit zählen mehr als Likes.
- Bei Reels entscheidet der Anfang: Wer in den ersten Sekunden wegwischt, senkt die Verbreitung.
- Nicht-Follower sehen vor allem Reels; Karussells erreichen eher bestehende Follower.

## Vorbilder (Auswertung 2026-11-16)
Aus der YouTube-Auswertung von krass.erforscht (240 meistgesehene deutsche Wissens-Shorts) und Recherchen zu Nachrichten-Kurzvideos:
- Erfolgreiche Kurzvideos sind **erzählt** (Sprecherstimme), meist 25–90 s (Median ~52 s), mit **mitlaufenden Untertiteln**
  (laut einem Anbieter-Bericht nutzen 86,6 % der erfolgreichsten Kurzvideos Wort-für-Wort-Untertitel; viele schauen ohne Ton).
- **Die ersten 2–3 Sekunden entscheiden:** sofort sprechen, kein langsamer Einstieg; Frage-Einstiege halten laut Anbieter-Daten ~22 % besser
  in den ersten 5 Sekunden. Erst die Tatsache, dann die Erklärung.
- Titel emotional, ~60–70 Zeichen, oft mit **einem** Emoji; Formate: Frage/Rätsel, Liste, Superlativ, „Was heißt das für dich?“.
- Auch kleine Kanäle erreichen viel – Reichweite hängt am einzelnen Video, nicht an der Größe des Accounts.
- Nachrichten auf Social Media (Reuters Digital News Report 2026): soziale Netzwerke und Video-Plattformen sind die meistgenutzte Online-Quelle
  (54 % weltweit), 77 % schauen wöchentlich Nachrichtenvideos; junge Leute wollen **kurze Erklärformate** („Was heißt das?“). Vertrauen ist
  niedrig (37 %) – darum Quellen nennen und nichts übertreiben: Glaubwürdigkeit ist unser Vorteil gegenüber reißerischen Accounts.
- Instagram 2026: Originalität wird belohnt, reine Sammel-Accounts mit fremden Clips abgewertet – eigene erzählte Videos passen.
- Bei TikTok-Nachrichten waren im Januar 2026 vier der Top-5-Accounts tagesaktuelle Nachrichten (Brand & Brilliance) – News funktionieren als Kurzvideo.

## Regeln

1. **Immer ein Reel dazu** – bestätigt (2026-11-16): Fast die ganze Reichweite kommt über das Reel (Folien- oder Video-Reel),
   Karussells allein erreichen 2–8 Konten. Am 7.11. fiel das Reel aus: 3 Konten. Nie ohne Reel posten.
2. **Erzähltes Video mit Stimme, 25–45 s** – bestätigt per Entscheidung des Nutzers (2026-11-16, siehe CLAUDE.md „Richtung“):
   Posts mit echtem Video im Mittel 158 Konten (2 Posts), reine Bilder 95 (31 Posts); bei krass.erforscht gleiche Erfahrung.
3. **Aussage statt Frage in der Überschrift** – bestätigt (2026-11-23): Aussagen 112 Konten (39 Posts), Fragen 34 (3 Posts, alle klar schwächer).
   Titelfolie und Video-Überschrift als klare Aussage mit der wichtigsten Tatsache (Frage-Einstieg im gesprochenen Text bleibt erlaubt).
4. **Zum Teilen bringen** – im Test (seit 2026-11-16): Teilen + Speichern liegt fast immer bei 0.
   Letzte Folie / Caption mit konkretem Anlass („Schick das jemandem, der … / Speichern für …“). Test-Kurzname: `teilen-anreiz`.
   Stand 2026-11-23: mit 122 Konten (4 Posts), ohne 106,5 (2 Posts), Teilen aber in beiden Gruppen 0 – weiter im Test, abwechselnd.
5. **Kürzeres Video (25–30 s statt 35–45 s)** – im Test (seit 2026-11-23): Videos 16–25 s erreichen im Median 144 Konten (3 Posts),
   über 25 s nur 106,5 (6 Posts); geschaut werden ohnehin nur ~6 s. Innerhalb der Vorgabe 25–45 s das kurze Ende testen. Test-Kurzname: `kurz-video`.

## Uhrzeit Instagram
- Seit 2026-11-16 vier Fenster: 7:15, 12:15, 18:15 und neu 20:45 Uhr (bei krass.erforscht inzwischen das beste Fenster).
- Verglichen wird die Reichweite im Verhältnis zum Median des Formats. Stand 2026-11-16: morgens 1,2×, mittags 0,89×, abends 0,48×, spät noch ungetestet.

## Verlauf
- 2026-11-24 (mittags): Keine Regeländerung (Black-Week-Post noch keine 24 h alt). Schaltsekunde abgeschafft (Welt, laut schwerpunkt.js zum Weiterlernen dran; tagesschau + Euronews) mit `teilen-anreiz` im Test, ~36 s statt kurz (Morgen-Post hatte `kurz-video`).
- 2026-11-24 (morgens): Keine Regeländerung (Klimagipfel noch keine 24 h alt, BVB-Zahlen noch nicht aktualisiert). Black-Week-Post (Alltag, laut schwerpunkt.js zum Weiterlernen dran; Fake-Rabatte, Stiftung-Warentest-Zahlen, 5 Redaktionen) mit `kurz-video` im Test (~30 s, ohne Teil-Aufforderung; letzter Post hatte `teilen-anreiz`).
- 2026-11-23 (mittags, Vorbereitung für abends): Keine Regeländerung (BVB-Post noch keine 24 h alt). Klimagipfel-Post (Umwelt, laut schwerpunkt.js dran; COP31 endet ohne Einigung, über 7 Redaktionen) mit `teilen-anreiz` im Test, ~35 s statt kurz (Morgen-Post hatte `kurz-video`).
- 2026-11-23 (morgens): `aussage-titel` **bestätigt** (Aussagen 112 vs. Fragen 34 Konten, 39 vs. 3 Posts). Neu im Test: `kurz-video` (16–25 s: 144 vs. über 25 s: 106,5). BVB-Tabellenführung (Sport, stärkster Schwerpunkt) als ~28-s-Video mit `kurz-video`, ohne Teil-Aufforderung (Vergleich für `teilen-anreiz`).
- 2026-11-22 (mittags, Vorbereitung für spät): Keine Regeländerung (Zverev-Post noch keine 24 h alt). Merkur-Post (Welt/Weltraum statt Geld: BepiColombo ist am Ziel, echte Kamerabilder der Sonde von ESA; Geld-Thema Spritpreisdeckel ist nur ein Entwurf im Ministerienstreit) mit `teilen-anreiz` im Test (Morgen-Post hatte `aussage-titel`).
- 2026-11-22 (morgens): Keine Regeländerung (neue Zahlen da, aber Stimm-Videos noch zu wenige für Bestätigung). Zverev-Alcaraz-Post (Sport, stärkster Schwerpunkt; Finale heute 18 Uhr) mit `aussage-titel` im Test (letzter Post hatte `teilen-anreiz`).
- 2026-11-21 (morgens): Keine Regeländerung (ohne Token keine neuen Zahlen). Riemann-Post (Digital, KI löst angeblich Mathe-Rätsel; als Behauptung gekennzeichnet) mit `teilen-anreiz` im Test (letzter Post hatte `aussage-titel`).
- 2026-11-20 (mittags): Keine Regeländerung (ohne Token keine neuen Zahlen). Ratenkauf-Post (Geld statt Sport: im Sport heute nichts Starkes; neue EU-Regeln gelten ab heute und betreffen viele) mit `aussage-titel` im Test (Morgen-Post hatte `teilen-anreiz`).
- 2026-11-20 (morgens): Keine Regeländerung (ohne Token keine neuen Zahlen abrufbar). Windrad-Post (Umwelt statt Sport: echtes Foto der Anlage, starke Geschichte) mit `teilen-anreiz` im Test (letzter Post hatte `aussage-titel`).
- 2026-11-19 (morgens): Keine Regeländerung (erst 3 Stimm-Videos, je unter 1 Tag bis 2 Tage alt). Stromsteuer-Post (Geld) mit `teilen-anreiz` im Test (letzter Post hatte `aussage-titel`). Auffällig: Stimm-Videos werden im Schnitt nur ~6 s geschaut – Einstieg wird nächster Prüfpunkt.
- 2026-11-18 (morgens): Keine Regeländerung (DFB-Post noch keine 24 h alt, erst 2 Posts im Stimm-Format). Mittags-Post (Solar-Ausbau, Umwelt) vorbereitet mit `aussage-titel` im Test; Stromsteuer-Ergebnis war noch nicht verkündet, bleibt für den 10:40-Lauf.
- 2026-11-17 (mittags): Keine Regeländerung (noch zu wenige Posts im neuen Video-Format). Spät-Post (20:45) vorbereitet mit `teilen-anreiz` im Test (Tesla-Post abends hat `aussage-titel`).
- 2026-11-17 (morgens): Keine Regeländerung (Vulcan noch keine 24 h alt). Abend-Post vorbereitet mit `aussage-titel` im Test, erstes erzähltes Video mit Stimme.
- 2026-11-16 (abends): Neue Richtung: jedes Post ein erzähltes Video mit Sprecherstimme (25–45 s), schnelle Schnitte, emotionale aber wahre Überschrift. Läufe zeitlich von krass.erforscht getrennt (6:15, 10:40, 16:20, 19:35).
- 2026-11-16: Analyse und Strategie eingeführt (von krass.erforscht übernommen), Regeln 1–4 aufgestellt, Fenster 20:45 ergänzt.
