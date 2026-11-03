// Gemeinsame Auswahl-Logik: immer nach der besten Reichweite richten, aber weiter dazulernen (wie bei krass.erforscht).
// Regeln für jede Auswahl (Uhrzeit, Format, Schwerpunkt, Ton):
//   - Gezählt wird die Reichweite (erreichte Konten) aller Posts, die mindestens einen Tag alt sind.
//   - Optionen mit weniger als 2 solchen Posts sind noch kaum getestet und kommen bevorzugt dran (am wenigsten getestete zuerst).
//   - Sonst: an 3 von 4 Tagen die Option mit der höchsten durchschnittlichen Reichweite, am 4. eine andere zum Weiterlernen.
// Die Zufallsentscheidung hängt nur vom Datum ab, damit alle Läufe eines Tages dasselbe Ergebnis bekommen.
const fs = require('fs');

const MIN_DATA = 2;
const EXPLORE = 0.25;

function posts() {
  const all = fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')) : [];
  // Zahlen jüngerer Posts sind noch nicht aussagekräftig
  return all.filter(p => p.stats && Date.now() - new Date(p.postedAt) > 864e5);
}

// Pseudozufall aus Datum und Art der Entscheidung (z. B. „uhrzeit“): gleicher Tag → gleiche Zahl zwischen 0 und 1
function dayRandom(kind) {
  const key = new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }) + kind;
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return (h % 10000) / 10000;
}

// options: Liste möglicher Werte; groupOf: ordnet einem Post seinen Wert zu; kind: Name der Entscheidung
function choose(options, groupOf, kind) {
  const data = posts();
  const reaches = o => data.filter(p => groupOf(p) === o).map(p => p.stats.reach);
  const avg = o => { const r = reaches(o); return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0; };
  const rows = options.map(o => ({ option: o, posts: reaches(o).length, reichweite: Math.round(avg(o)) }));
  const ranked = rows.slice().sort((a, b) => b.reichweite - a.reichweite);
  const fewest = Math.min(...rows.map(r => r.posts));
  let pick, why;
  if (fewest < MIN_DATA) {
    // Kaum getestete Optionen bekommen eine faire Chance, unter gleich wenig getesteten entscheidet der Tageszufall
    const fresh = rows.filter(r => r.posts === fewest);
    pick = fresh[Math.floor(dayRandom(kind) * fresh.length)].option; why = 'noch kaum getestet';
  } else if (dayRandom(kind) >= EXPLORE || ranked.length < 2) {
    pick = ranked[0].option; why = 'beste Reichweite';
  } else {
    const others = ranked.slice(1);
    pick = others[Math.floor(dayRandom(kind + 'x') * others.length)].option; why = 'zum Weiterlernen';
  }
  return { pick, why, rows: ranked };
}

module.exports = { choose, posts };
