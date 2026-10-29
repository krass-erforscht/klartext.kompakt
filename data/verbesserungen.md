# Verbesserungen

Hier hält die App fest, was sie selbst verbessert hat (Datum, ein Satz).

- 2026-10-28: render.js setzt das Titelbild höchstens auf zwei Folien, und der Text hält Abstand zu einer mehrzeiligen Quellenzeile (kleinere Schrift auf der letzten Folie).
- 2026-10-28: Videos für Nachrichten: find-video.js sucht zuerst auf Wikimedia Commons (Weltraum-Archive nur mit --weltraum) und versucht es bei Überlastung (429) erneut; Symbolvideos sind jetzt auch mit Kurz-Nachweis sichtbar als „Symbolvideo“ gekennzeichnet.
- 2026-10-29: comments.js meldet Kommentare, die Instagram nicht über die Schnittstelle herausgibt (private oder als Spam markierte Konten), damit der Nutzer sie von Hand ansehen kann.
