// Entscheidet, ob im aktuellen Zeitfenster gepostet wird: node slot.js <morgens|mittags|abends|spaet>
// Gibt "JA" oder "NEIN" aus. Pro Tag werden POSTS_PER_DAY Posts veröffentlicht, höchstens einer pro Fenster.
// Welche Fenster heute dran sind, richtet sich nach der besten bisherigen Reichweite, mit gelegentlichen Tests anderer Zeiten (choose.js):
// das erste Fenster nach der Regel aus allen, das zweite nach derselben Regel aus den übrigen.
// Damit das Format die Uhrzeit nicht verfälscht (Videos laufen viel besser als Bilder), zählt jede Reichweite
// im Verhältnis zum Median ihres Formats: 2,0 = doppelt so viel wie ein typischer Post desselben Formats (wie bei krass.erforscht).
const fs = require('fs');
const { choose, posts } = require('./choose');
const SLOTS = { morgens: [6, 7, 8, 9, 10], mittags: [11, 12, 13, 14, 15], abends: [16, 17, 18, 19], spaet: [20, 21, 22, 23] };
const POSTS_PER_DAY = 2;

const slot = process.argv[2];
if (!SLOTS[slot]) { console.error('Fenster muss morgens, mittags, abends oder spaet sein'); process.exit(1); }
const berlinDate = d => new Date(d).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
const hour = p => +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }).format(new Date(p.postedAt));
const slotOf = p => Object.keys(SLOTS).find(s => SLOTS[s].includes(hour(p)));
const posted = fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')) : [];
const today = posted.filter(p => berlinDate(p.postedAt) === berlinDate(Date.now()));

const median = a => { const s = a.slice().sort((x, y) => x - y), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = p => p.format || 'bilder';
const byFormat = {};
for (const p of posts()) (byFormat[fmt(p)] ||= []).push(p.stats.reach);
const relative = p => p.stats.reach / Math.max(median(byFormat[fmt(p)]), 1);

const names = Object.keys(SLOTS);
const first = choose(names, slotOf, 'uhrzeit', relative);
const second = choose(names.filter(n => n !== first.pick), slotOf, 'uhrzeit2', relative);
const chosen = [first, second].slice(0, POSTS_PER_DAY);
console.error(first.rows.map(r => `${r.option}: ${r.reichweite}× (${r.posts} Posts)`).join(', '));

if (today.length >= POSTS_PER_DAY) { console.log('NEIN (heute schon genug gepostet)'); process.exit(0); }
if (today.some(p => slotOf(p) === slot)) { console.log('NEIN (in diesem Fenster schon gepostet)'); process.exit(0); }
const mine = chosen.find(c => c.pick === slot);
// Für die Vorbereitung im früheren Lauf: welche heutigen Fenster noch kommen
const later = chosen.map(c => c.pick).filter(s => names.indexOf(s) > names.indexOf(slot) && !today.some(p => slotOf(p) === s));
console.log(mine ? `JA (${mine.why})` : `NEIN (heute sind ${chosen.map(c => c.pick).join(' und ')} dran${later.length ? `; später heute: ${later.join(', ')}` : ''})`);
