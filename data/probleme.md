# Probleme

- 2026-10-28: Beim Einrichten waren Wikimedia Commons (429, zu viele Anfragen) und Openverse (Zeitüberschreitung) aus der Cloud-Umgebung nicht erreichbar. Die neue Openverse-Quelle in find-image.js ist deshalb noch ungetestet. Beim ersten Post prüfen.
  → Erledigt: Beim ersten Post (28.10.) kam ein Foto von Wikimedia Commons, die Suche lief.
- 2026-10-28: Die ersten zwei geplanten Läufe konnten nicht pushen (403), weil das Repository nicht als Quelle der Aufgaben eingetragen war. Behoben: klartext.kompakt ist jetzt Quelle aller drei Aufgaben. Der dritte Lauf hat gepostet.
- 2026-10-28: Erster Post: dasselbe Foto auf allen 6 Folien, und die lange Quellenzeile lag auf der letzten Folie zu nah am Text. Behoben (siehe verbesserungen.md).
- 2026-10-29 (abends): Wikimedia Commons meldete wieder „zu viele Anfragen“ und Openverse Zeitüberschreitung; nach ca. 1 Minute Pause klappte die Bildsuche. Videosuche „gas station“ lieferte nur Unpassendes (Arduino, Schießerei), deshalb Format „bilder“. ccMixter-Download 403 (Reel nutzte Incompetech-Musik).
- 2026-10-30 (mittags): Der Lauf startete auf losgelöstem HEAD, `git pull` scheiterte; mit `git checkout main` behoben. Wikimedia 429 und Openverse-Timeout wieder aufgetreten (Suche klappte trotzdem). Videosuche zu „Zwergplanet“ ohne passendes Ergebnis (Format „bilder“). ccMixter 403 (Reel mit Incompetech-Musik). 5 Kommentare unter https://www.instagram.com/p/DfC7CbBmz8N/ per API nicht abrufbar.
