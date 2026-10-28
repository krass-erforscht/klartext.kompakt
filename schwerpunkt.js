// Wählt Schwerpunkt und Ton für den nächsten Post: node schwerpunkt.js
// So findet der Account heraus, welcher Schwerpunkt (Geld, Digital, Alltag …) am besten ankommt.
// Testphase: solange ein Schwerpunkt weniger als 4 ausgewertete Posts hat, kommt der am wenigsten genutzte dran.
// Danach: zu 70 % der Schwerpunkt mit den besten Punkten, zu 30 % ein anderer zum Weitertesten.
// Ausgabe: Reihenfolge der Schwerpunkte (der erste ist dran; gibt es dazu heute keine gute Meldung, der nächste) und der Ton.
const fs = require('fs');
const { SCHWERPUNKTE, TOENE } = require('./config');
const MIN_TESTS = 4;

const posted = fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')) : [];
const ranking = fs.existsSync('data/learnings.json') ? JSON.parse(fs.readFileSync('data/learnings.json')).ranking : [];
const row = (art, name) => ranking.find(r => r.gruppe === `${art}:${name}`) || { posts: 0, punkte: 0 };
// Zuletzt genutzte hinten anstellen, damit nicht zweimal hintereinander dasselbe kommt
const lastUsed = (field, name) => posted.map(p => p[field]).lastIndexOf(name);
const used = (field, name) => posted.filter(p => p[field] === name).length;

function order(art, field, names) {
  const untested = names.filter(n => row(art, n).posts < MIN_TESTS);
  if (untested.length) {
    const first = untested.sort((a, b) => used(field, a) - used(field, b) || lastUsed(field, a) - lastUsed(field, b));
    return { liste: [...first, ...names.filter(n => !first.includes(n))], grund: 'Testphase: am wenigsten getestet zuerst' };
  }
  const best = names.slice().sort((a, b) => row(art, b).punkte - row(art, a).punkte);
  if (Math.random() < 0.7) return { liste: best, grund: `bester Schwerpunkt laut Auswertung (${row(art, best[0]).punkte} Punkte)` };
  const other = best.slice(1).sort(() => Math.random() - 0.5);
  return { liste: [...other, best[0]], grund: '30 %: bewusst etwas anderes ausprobieren' };
}

const s = order('thema', 'topic', Object.keys(SCHWERPUNKTE));
const t = order('ton', 'tone', Object.keys(TOENE));
console.log(JSON.stringify({
  schwerpunkt: s.liste[0], beschreibung: SCHWERPUNKTE[s.liste[0]], ersatz: s.liste.slice(1), grund: s.grund,
  ton: t.liste[0], tonGrund: t.grund,
  ranking: Object.keys(SCHWERPUNKTE).map(n => ({ schwerpunkt: n, posts: row('thema', n).posts, punkte: row('thema', n).punkte, reichweite: row('thema', n).reichweite || 0 })),
}, null, 2));
