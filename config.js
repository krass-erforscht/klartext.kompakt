// Name, Repository und Farben an einer Stelle. Wird der Account umbenannt, reicht eine Änderung hier.
module.exports = {
  NAME: 'klartext.kompakt',
  HANDLE: '@klartext.kompakt',
  REPO: 'krass-erforscht/klartext-kompakt',
  // Eigener Name für den Instagram-Schlüssel, damit nie aus Versehen auf krass.erforscht (IG_TOKEN) gepostet wird
  TOKEN_VAR: 'KLARTEXT_IG_TOKEN',
  // Dunkles Nachrichten-Blau, Signalrot als Markenfarbe, Gelb für Zahlen
  COLORS: { dark: '#0f1b2d', accent: '#e8412c', mark: '#ffd23f', light: '#f5f6f8', text: '#121826', muted: '#5b6475' },
  // Schwerpunkte, zwischen denen getestet wird; das erfolgreichste setzt sich durch (schwerpunkt.js)
  SCHWERPUNKTE: {
    geld: 'Geld & Verbraucher: Preise, Löhne, Steuern, Rente, Mieten, Energiekosten (keine Anlage- oder Finanztipps)',
    digital: 'Digital & Technik: Apps, KI, Smartphones, Internet, Datenschutz, Betrugsmaschen',
    alltag: 'Alltag & neue Regeln: Gesetze, die ab einem Datum gelten, Bahn, Verkehr, Reisen, Arbeit, Schule',
    umwelt: 'Umwelt & Wetter: Klima, Energie, Wetter-Rekorde, Natur (keine Unglücke mit Opfern)',
    welt: 'Welt & Wissen: Raumfahrt, Forschung, Rekorde, internationale Entscheidungen ohne Krieg',
    sport: 'Sport: große Ergebnisse, Rekorde, Turniere, Entscheidungen von Verbänden',
  },
  // Ton → Musikstimmung in music.js
  TOENE: { sachlich: 'nuetzlich', ueberraschend: 'staunen', locker: 'witzig' },
};
