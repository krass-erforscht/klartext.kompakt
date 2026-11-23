// Baut das Testvideo „Voyager 1 – ein Lichttag“ im 3D-Format: node szenen/voyager/build.js
// Voraussetzung: voice.wav und voice.json (stimme/sprechen.py voice.txt voice.wav) in diesem Ordner.
// Ablauf: Zeitplan aus den Satz-Zeiten der Stimme → 3D-Video (render3d.js) → Stimme + leise Musik darunter.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const dir = __dirname, root = path.join(dir, '..', '..');
const SPEED = 1.15, LEAD = 0.15;

// Pro Satz: Kamera-Einstellung und große Zahl oben (leer = keine)
const PLAN = [
  { shot: 'signal', big: '1 Tag', sub: 'braucht ein Funkspruch zur Sonde' },
  { shot: 'nah', big: '1 Lichttag', sub: 'Entfernung zur Erde, laut NASA' },
  { shot: 'weit', big: '25,9 Mrd. km', sub: 'so weit kommt Licht in 24 Stunden' },
  { shot: 'signal', big: '', sub: '' },
  { shot: 'erde', big: '1977', sub: 'Start am 5. September, Cape Canaveral' },
  { shot: 'helio', big: '2012', sub: 'Eintritt in den interstellaren Raum' },
  { shot: 'schnell', big: '17 km/s', sub: 'gegenüber der Sonne' },
  { shot: 'geraete', big: '2 von 11', sub: 'Messgeräten sind noch eingeschaltet' },
  { shot: 'echo', big: '2 Tage', sub: 'bis eine Antwort zurückkommt' },
  { shot: 'platte', big: '55 Sprachen', sub: 'Grüße auf der Goldenen Schallplatte' },
  { shot: 'signal', big: '', sub: '' },
];
const SHOW = [ // Untertitel mit Ziffern
  'Ein ganzer Tag. So lange braucht jetzt ein Funkspruch zu dieser Sonde.',
  'Voyager 1 ist laut NASA einen Lichttag von der Erde entfernt.',
  'Rund 25,9 Milliarden Kilometer.',
  'So weit ist noch nie etwas gekommen, das Menschen gebaut haben.',
  'Gestartet ist sie im September 1977.',
  'Seit 2012 fliegt sie durch den interstellaren Raum.',
  'Mit 17 Kilometern pro Sekunde.',
  'Von 11 Messgeräten an Bord laufen nur noch 2.',
  'Wer ihr heute etwas funkt, wartet 2 Tage auf die Antwort.',
  'An Bord ist eine goldene Schallplatte, mit Grüßen in 55 Sprachen.',
  'Ein ganzer Tag. So lange braucht jetzt ein Funkspruch zu dieser Sonde.',
];

const times = JSON.parse(fs.readFileSync(path.join(dir, 'voice.json'))).map(t => ({ start: t.start / SPEED + LEAD, end: t.end / SPEED + LEAD }));
if (times.length !== PLAN.length) throw new Error(`Stimme hat ${times.length} Sätze, Plan ${PLAN.length}`);
const duration = times.at(-1).end + 0.6;
// Einstellungen reichen jeweils bis zum Beginn des nächsten Satzes
const bounds = times.map((t, i) => [i === 0 ? 0 : t.start - 0.2, i === times.length - 1 ? duration : times[i + 1].start - 0.2]);
const shots = PLAN.map((p, i) => ({ name: p.shot, start: bounds[i][0], end: bounds[i][1] }));
const overlays = PLAN.map((p, i) => ({ start: times[i].start, end: bounds[i][1], big: p.big, sub: p.sub })).filter(o => o.big);
// Untertitel: Stücke von höchstens 4 Wörtern, zeitlich anteilig zur Satzlänge
const captions = [];
times.forEach((t, i) => {
  const words = SHOW[i].split(/\s+/), groups = [];
  for (const w of words) { const g = groups.at(-1); if (!g || g.length >= 4 || /[.,:;?!]$/.test(g.at(-1))) groups.push([w]); else g.push(w); }
  const total = groups.reduce((a, g) => a + g.join(' ').length, 0);
  let at = t.start;
  for (const g of groups) { const len = (t.end - t.start) * g.join(' ').length / total; captions.push({ text: g.join(' '), start: at, end: at + len }); at += len; }
});
const cfg = { duration, fps: 30, shots, overlays, captions, source: 'Quellen: NASA, t3n (Nov. 2026) · Größen und Abstände nicht maßstabsgetreu' };
fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(cfg, null, 1));

const silent = path.join(dir, 'bild.mp4'), out = path.join(dir, 'voyager.mp4');
execFileSync('node', [path.join(root, 'szenen/render3d.js'), dir, path.join(dir, 'config.json'), silent], { stdio: 'inherit', cwd: root });
const music = JSON.parse(execFileSync('node', ['--max-http-header-size=262144', 'music.js', 'ueberraschend', String(Math.ceil(duration))], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] }).toString());
fs.writeFileSync(path.join(dir, 'music.json'), JSON.stringify({ title: music.title, artist: music.artist, license: music.license, credit: music.credit }, null, 2));
const d = duration.toFixed(2), lead = Math.round(LEAD * 1000);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', path.join(dir, 'voice.wav'), '-stream_loop', '-1', '-i', path.join(root, music.file),
  '-filter_complex', `[1:a]atempo=${SPEED},adelay=${lead}|${lead},aresample=44100,pan=stereo|c0=c0|c1=c0,apad=pad_dur=${d}[v];` +
  `[2:a]atrim=0:${d},volume=0.07,afade=t=in:d=1,afade=t=out:st=${(duration - 1.5).toFixed(2)}:d=1.5,aformat=sample_rates=44100:channel_layouts=stereo[m];` +
  `[v][m]amix=inputs=2:duration=longest:normalize=0,atrim=0:${d},loudnorm=I=-15:TP=-1.5:LRA=11[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log(`Fertig (${d} s, Musik: ${music.credit || 'eigene Klangfläche'}) -> ${out}`);
