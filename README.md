# tagesbild.kompakt

Aktuelle Nachrichten, kurz und verständlich erklärt. Instagram, zwei Posts pro Tag, automatisch erstellt mit Claude.
Gleiches System wie [krass.erforscht](https://github.com/krass-erforscht/krass-erforscht): Nachrichten sammeln, Fakten prüfen,
frei lizenzierte Fotos suchen, Folien und Reel mit Musik bauen, posten, Kommentare beantworten, Zahlen auswerten, sich selbst verbessern.
Der genaue Ablauf steht in [CLAUDE.md](CLAUDE.md).

**Was der Account selbst herausfindet:** welcher Schwerpunkt (Geld, Digital, Alltag, Umwelt, Welt, Sport), welcher Ton,
welches Format (Bilder, Video, beides) und welche Uhrzeit am besten ankommt (`schwerpunkt.js`, `slot.js`, `format.js`, `insights.js`).

## Einrichten – Schritt für Schritt

### 1. Instagram-Account anlegen
1. In der Instagram-App: Profil → oben auf deinen Namen → **Konto hinzufügen** → **Neues Konto erstellen**.
2. Benutzername **tagesbild.kompakt** (falls vergeben: anderen wählen und Claude Bescheid sagen, der Name steht nur in `config.js`).
3. Profilbild: `brand/profilbild.jpg` aus diesem Repository.
4. Einstellungen → **Kontotyp und Tools** → **Zu professionellem Konto wechseln** → Kategorie „Nachrichten und Medien“ → **Creator**.
5. Bio-Vorschlag: `Nachrichten, die dich betreffen – kurz erklärt. 2× täglich. Texte mit KI erstellt, Fakten aus seriösen Quellen.`

### 2. GitHub-Repository anlegen (Claude darf das nicht selbst)
1. Auf https://github.com/new gehen (angemeldet als **krass-erforscht**).
2. Repository name: **tagesbild-kompakt**, **Public** auswählen (Instagram muss die Bilder abrufen können), **kein** README, keine .gitignore, keine Lizenz.
3. **Create repository** klicken.
4. Claude Zugriff geben: https://github.com/apps/claude/installations/select_target → krass-erforscht → **Configure** →
   unter „Repository access“ **tagesbild-kompakt** hinzufügen (oder „All repositories“) → **Save**.

### 3. Instagram-Schlüssel (Token) erzeugen
1. https://developers.facebook.com → **Meine Apps** → deine App von krass.erforscht öffnen (oder **App erstellen** → „Andere“ → „Business“).
2. **Anwendungsfälle** → **Anpassen** bei „Instagram-API“ → **API-Einrichtung mit Instagram-Login**.
3. Bei „Zugriffsschlüssel generieren“ → **Konto hinzufügen** → mit **tagesbild.kompakt** anmelden → erlauben → **Token generieren** → kopieren.
   (Falls dort „Instagram-Tester“ verlangt wird: unter App-Rollen → Rollen → Instagram-Tester → tagesbild.kompakt einladen und in der
   Instagram-App unter Einstellungen → Website-Berechtigungen → Apps und Websites → Einladungen annehmen.)
4. In Claude Code: Umgebung **bearbeiten** → **Umgebungsvariablen** → neue Zeile `KLARTEXT_IG_TOKEN=<dein Token>` → speichern.
   **Wichtig:** nicht `IG_TOKEN` überschreiben, das ist der Schlüssel von krass.erforscht.
5. Der Token gilt 60 Tage. Claude erinnert dich rechtzeitig.

### 4. Impressum (Pflicht)
Ein öffentlicher Nachrichten-Account braucht in Deutschland eine Anbieterkennzeichnung, auch wenn die Nachrichten aus anderen Quellen umgeschrieben sind:
§ 18 Medienstaatsvertrag verlangt Name und Anschrift bei allen Angeboten, die nicht rein privat oder familiär sind; bei journalistisch-redaktionellen
Angeboten zusätzlich eine verantwortliche Person (§ 18 Abs. 2 MStV). Ohne Impressum drohen Abmahnungen von Mitbewerbern oder Bußgelder.
- Kostenlos: Claude baut eine Impressum-Seite in diesem Repository (GitHub Pages), du trägst den Link in die Instagram-Bio ein.
  Dafür braucht Claude deinen Namen, eine ladungsfähige Anschrift und eine E-Mail-Adresse. Die stehen dann öffentlich im Internet.
- Wer die Privatadresse nicht zeigen will: Impressums-Service mit Geschäftsadresse (kostet ein paar Euro im Monat; das entscheidest du).

### 5. Fertig melden
Claude Bescheid sagen. Dann lädt Claude das Projekt hoch, richtet die drei geplanten Aufgaben (7:15, 12:15, 18:15 Uhr) ein und erstellt den ersten Post.
