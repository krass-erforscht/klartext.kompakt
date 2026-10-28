// Entscheidet, ob im aktuellen Zeitfenster gepostet wird: node slot.js <morgens|mittags|abends>
// Gibt "JA" oder "NEIN" aus. Pro Tag werden POSTS_PER_DAY Posts veröffentlicht, höchstens einer pro Fenster.
// Testphase (erste 30 Posts): jeden Tag fällt ein anderes Fenster weg, damit jede Uhrzeit gleich oft getestet wird.
// Danach: die Fenster mit den besten Punkten aus data/learnings.json.
const fs = require('fs');
const SLOTS = { morgens: [6, 7, 8, 9], mittags: [11, 12, 13, 14], abends: [17, 18, 19, 20, 21] };
const POSTS_PER_DAY = 2;
const TEST_POSTS = 30;

const slot = process.argv[2];
if (!SLOTS[slot]) { console.error('Fenster muss morgens, mittags oder abends sein'); process.exit(1); }
const berlinDate = d => new Date(d).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
const hour = d => +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }).format(new Date(d));
const posted = fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')) : [];
const today = posted.filter(p => berlinDate(p.postedAt) === berlinDate(Date.now()));

if (today.length >= POSTS_PER_DAY) { console.log('NEIN (heute schon genug gepostet)'); process.exit(0); }
if (today.some(p => SLOTS[slot].includes(hour(p.postedAt)))) { console.log('NEIN (in diesem Fenster schon gepostet)'); process.exit(0); }

let chosen;
if (posted.length < TEST_POSTS) {
  const day = Math.floor(Date.now() / 864e5);
  const names = Object.keys(SLOTS);
  chosen = names.filter((_, i) => i !== day % names.length);
} else {
  const ranking = fs.existsSync('data/learnings.json') ? JSON.parse(fs.readFileSync('data/learnings.json')).ranking : [];
  const score = name => {
    const rows = ranking.filter(r => r.gruppe.startsWith('uhrzeit:') && SLOTS[name].includes(+r.gruppe.slice(8)));
    const n = rows.reduce((a, r) => a + r.posts, 0);
    return n ? rows.reduce((a, r) => a + r.punkte * r.posts, 0) / n : -1;
  };
  chosen = Object.keys(SLOTS).sort((a, b) => score(b) - score(a)).slice(0, POSTS_PER_DAY);
}
console.log(chosen.includes(slot) ? 'JA' : `NEIN (heute sind ${chosen.join(' und ')} dran)`);
