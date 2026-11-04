# Verbesserungen

Hier hält die App fest, was sie selbst verbessert hat (Datum, ein Satz).

- 2026-10-28: render.js setzt das Titelbild höchstens auf zwei Folien, und der Text hält Abstand zu einer mehrzeiligen Quellenzeile (kleinere Schrift auf der letzten Folie).
- 2026-10-28: Videos für Nachrichten: find-video.js sucht zuerst auf Wikimedia Commons (Weltraum-Archive nur mit --weltraum) und versucht es bei Überlastung (429) erneut; Symbolvideos sind jetzt auch mit Kurz-Nachweis sichtbar als „Symbolvideo“ gekennzeichnet.
- 2026-10-29: comments.js meldet Kommentare, die Instagram nicht über die Schnittstelle herausgibt (private oder als Spam markierte Konten), damit der Nutzer sie von Hand ansehen kann.
- 2026-11-01: CLAUDE.md: Hinweis, zu Beginn `git checkout main && git pull origin main` auszuführen (losgelöster HEAD trat in vier Läufen auf).
- 2026-11-02: find-image.js und find-video.js nutzen einen optionalen Wikimedia-Schlüssel (WIKIMEDIA_TOKEN), damit die Bildsuche nicht mehr an „zu viele Anfragen“ scheitert; ohne Schlüssel bleibt alles wie bisher.
- 2026-11-03: Auswahl wie bei krass.erforscht: Uhrzeit, Format, Schwerpunkt und Ton richten sich ab sofort nach der besten Reichweite (choose.js), mit fairer Chance für wenig Getestetes und jedem 4. Tag zum Weiterlernen.
- 2026-11-04: publish.js prüft vor jedem Post, ob derselbe Beitrag in den letzten 6 Stunden schon erschienen ist, und postet dann nicht noch einmal.
- 2026-11-04 (mittags): find-video.js bricht einzelne Anfragen nach 20 s ab, damit die Videosuche bei Wikimedia-Drosselung nicht minutenlang hängt.
