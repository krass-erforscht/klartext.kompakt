// Wählt Schwerpunkt und Ton für den nächsten Post: node schwerpunkt.js
// Richtet sich nach der besten bisherigen Reichweite, mit gelegentlichen Tests (Regeln in choose.js).
// Der zweite Post des Tages bekommt einen anderen Schwerpunkt als der erste.
// Ausgabe: der Schwerpunkt, der dran ist, und als „ersatz“ die übrigen nach Reichweite (gibt es zum ersten heute keine gute Meldung, der nächste).
const fs = require('fs');
const { SCHWERPUNKTE, TOENE } = require('./config');
const { choose } = require('./choose');

const berlinDate = d => new Date(d).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
const posted = fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')) : [];
const today = posted.filter(p => berlinDate(p.postedAt) === berlinDate(Date.now()));
const kind = today.length ? '2' : '';

const usedToday = new Set(today.map(p => p.topic));
const s = choose(Object.keys(SCHWERPUNKTE).filter(n => !usedToday.has(n)), p => p.topic, 'thema' + kind);
const t = choose(Object.keys(TOENE), p => p.tone, 'ton' + kind);
console.log(JSON.stringify({
  schwerpunkt: s.pick, beschreibung: SCHWERPUNKTE[s.pick], grund: s.why,
  ersatz: s.rows.map(r => r.option).filter(o => o !== s.pick),
  ton: t.pick, tonGrund: t.why,
  schwerpunkte: s.rows, toene: t.rows,
}, null, 2));
