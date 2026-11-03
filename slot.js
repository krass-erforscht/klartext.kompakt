// Entscheidet, ob im aktuellen Zeitfenster gepostet wird: node slot.js <morgens|mittags|abends>
// Gibt "JA" oder "NEIN" aus. Pro Tag werden POSTS_PER_DAY Posts veröffentlicht, höchstens einer pro Fenster.
// Welche Fenster heute dran sind, richtet sich nach der besten bisherigen Reichweite, mit gelegentlichen Tests anderer Zeiten (choose.js):
// das erste Fenster nach der Regel aus allen dreien, das zweite nach derselben Regel aus den übrigen.
const fs = require('fs');
const { choose } = require('./choose');
const SLOTS = { morgens: [6, 7, 8, 9, 10], mittags: [11, 12, 13, 14], abends: [17, 18, 19, 20, 21] };
const POSTS_PER_DAY = 2;

const slot = process.argv[2];
if (!SLOTS[slot]) { console.error('Fenster muss morgens, mittags oder abends sein'); process.exit(1); }
const berlinDate = d => new Date(d).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
const hour = p => +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }).format(new Date(p.postedAt));
const slotOf = p => Object.keys(SLOTS).find(s => SLOTS[s].includes(hour(p)));
const posted = fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')) : [];
const today = posted.filter(p => berlinDate(p.postedAt) === berlinDate(Date.now()));

if (today.length >= POSTS_PER_DAY) { console.log('NEIN (heute schon genug gepostet)'); process.exit(0); }
if (today.some(p => slotOf(p) === slot)) { console.log('NEIN (in diesem Fenster schon gepostet)'); process.exit(0); }

const names = Object.keys(SLOTS);
const first = choose(names, slotOf, 'uhrzeit');
const second = choose(names.filter(n => n !== first.pick), slotOf, 'uhrzeit2');
const chosen = [first, second].slice(0, POSTS_PER_DAY);
const mine = chosen.find(c => c.pick === slot);
console.log(mine ? `JA (${mine.why})` : `NEIN (heute sind ${chosen.map(c => c.pick).join(' und ')} dran)`);
