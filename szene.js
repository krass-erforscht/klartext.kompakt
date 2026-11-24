// Baut das erzählte 3D-Erklärvideo eines Posts (Format seit 2026-11-24, vom Nutzer freigegeben):
//   node szene.js posts/<datei>.json
// Braucht in der Post-Datei unter "video": "voice" (ein Satz pro Zeile, Zahlen ausgeschrieben), "voiceText" (dieselben Sätze mit Ziffern)
// und "szene": pro Satz genau eine Einstellung { "typ": …, Parameter, "big": große Zahl oben, "sub": Zeile darunter }.
// Typen (szenen/daten/scene.html):
//   zahl       { wert: "25,9", einheit: "Milliarden km" }                 große 3D-Zahl, zählt hoch
//   balken     { werte: [{ name, wert, text }], hervor: 1, stil: "muenzen" }  Vergleich als Balken oder Münzstapel
//   anteil     { prozent: 23, text: "23 %" }                              Ring füllt sich
//   menge      { von: 11, markiert: 2 }                                   „2 von 11“ als Kugeln
//   trend      { werte: [..], labels: [..], text: "+ 40 %" }              Verlauf als leuchtende Linie
//   zeitstrahl { punkte: [{ jahr, text }], aktiv: 2 }                     Jahreszahlen auf einer Linie
//   erde       { lat, lon, ort }                                         Erdkugel mit Markierung (NASA Blue Marble)
//   foto       { bild: "images/<id>.jpg", symbolbild: true, credit }      frei lizenziertes Foto als Karte im Raum
//   datum      { tag: "1", monat: "Januar", jahr: "2027" }               Kalenderblatt
// Ablauf: Stimme aufnehmen (stimme/sprechen.py) → Zeitplan aus den Satz-Zeiten → 3D-Bild (szenen/render3d.js)
// → Stimme + leise Musik → out/<id>/video-reel.mp4 (+ Kopie in docs/v/<id>/) → Pflicht-Prüfung stimme/pruefen.py.
// Endet mit Exit-Code 1, wenn die Prüfung einen Fehler findet. Dann nicht posten, sondern den Satz umformulieren und neu bauen.
const fs = require('fs'), path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { HANDLE, COLORS } = require('./config');

const file = process.argv[2];
const post = JSON.parse(fs.readFileSync(file, 'utf8'));
const v = post.video || {};
const voiceLines = v.voice || [], plan = v.szene || [];
if (!voiceLines.length) throw new Error('"video.voice" fehlt');
if (plan.length !== voiceLines.length) throw new Error(`"video.szene" hat ${plan.length} Einstellungen, "voice" ${voiceLines.length} Sätze – pro Satz genau eine`);
const show = Array.isArray(v.voiceText) && v.voiceText.length === voiceLines.length ? v.voiceText : voiceLines;
for (const s of plan) if (s.typ === 'foto' && !fs.existsSync(s.bild)) throw new Error(`Foto fehlt: ${s.bild}`);

const dir = path.join('out', post.id), py = process.env.STIMME_PY || '/tmp/cb/bin/python';
fs.mkdirSync(dir, { recursive: true });

// 1) Stimme (nur neu aufnehmen, wenn sich der Text geändert hat)
const wav = path.join(dir, 'voice.wav'), txt = path.join(dir, 'voice.txt'), body = voiceLines.join('\n');
if (!(fs.existsSync(wav) && fs.existsSync(txt) && fs.readFileSync(txt, 'utf8') === body)) {
  fs.writeFileSync(txt, body);
  execFileSync(py, [path.join(__dirname, 'stimme/sprechen.py'), txt, wav], { stdio: ['ignore', 'inherit', 'inherit'] });
}
const SPEED = v.voiceSpeed || 1.15, LEAD = 0.15;
const times = JSON.parse(fs.readFileSync(wav.replace(/\.wav$/, '.json'))).map(t => ({ start: t.start / SPEED + LEAD, end: t.end / SPEED + LEAD }));
if (times.length !== plan.length) throw new Error(`Stimme hat ${times.length} Sätze, Plan ${plan.length}`);
const duration = times.at(-1).end + 0.6;
if (duration > 50) console.error(`Achtung: ${duration.toFixed(1)} s – Ziel sind 25–45 s, Text kürzen.`);

// 2) Zeitplan: jede Einstellung reicht bis kurz vor den nächsten Satz; Untertitel in Stücken von höchstens 4 Wörtern
const bounds = times.map((t, i) => [i === 0 ? 0 : t.start - 0.2, i === times.length - 1 ? duration : times[i + 1].start - 0.2]);
const shots = plan.map((p, i) => ({ ...p, start: bounds[i][0], end: bounds[i][1] }));
const overlays = plan.map((p, i) => ({ start: times[i].start, end: bounds[i][1], big: p.big || '', sub: p.sub || '' })).filter(o => o.big);
const captions = [];
times.forEach((t, i) => {
  const groups = [];
  for (const w of show[i].split(/\s+/).filter(Boolean)) { const g = groups.at(-1); if (!g || g.length >= 4 || /[.,:;?!]$/.test(g.at(-1))) groups.push([w]); else g.push(w); }
  const total = groups.reduce((a, g) => a + g.join(' ').length, 0);
  let at = t.start;
  for (const g of groups) { const len = (t.end - t.start) * g.join(' ').length / total; captions.push({ text: g.join(' '), start: at, end: at + len }); at += len; }
});
const quellen = [...new Set(post.sources.map(s => s.name.split(/\s*[/(]/)[0].trim()))].join(', ');
const cfg = {
  duration, fps: 30, shots, overlays, captions, handle: HANDLE,
  colors: { accent: COLORS.accent, mark: COLORS.mark }, capColor: 'rgba(232,65,44,.92)',
  source: `Quellen: ${quellen}${v.szeneHinweis ? ' · ' + v.szeneHinweis : ''}`,
};
const cfgFile = path.join(dir, 'szene.json');
fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 1));

// 3) 3D-Bild rendern (ca. 0,5 s Rechenzeit pro Bild → 40 s Video ≈ 10 Minuten)
const silent = path.join(dir, 'szene-bild.mp4'), out = path.join(dir, 'video-reel.mp4');
execFileSync('node', [path.join(__dirname, 'szenen/render3d.js'), path.join(__dirname, 'szenen/daten'), cfgFile, silent], { stdio: 'inherit' });

// 4) Stimme + leise Musik (Ton des Posts bestimmt die Stimmung)
const music = JSON.parse(execFileSync('node', ['--max-http-header-size=262144', 'music.js', post.tone || 'sachlich', String(Math.ceil(duration))], { stdio: ['ignore', 'pipe', 'inherit'] }).toString());
fs.writeFileSync(path.join(dir, 'video-music.json'), JSON.stringify({ title: music.title, artist: music.artist, source: music.source, license: music.license, credit: music.credit }, null, 2));
const d = duration.toFixed(2), lead = Math.round(LEAD * 1000);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', wav, '-stream_loop', '-1', '-i', music.file,
  '-filter_complex', `[1:a]atempo=${SPEED},adelay=${lead}|${lead},aresample=44100,pan=stereo|c0=c0|c1=c0,apad=pad_dur=${d}[v];` +
  `[2:a]atrim=0:${d},volume=0.07,afade=t=in:d=1,afade=t=out:st=${(duration - 1.5).toFixed(2)}:d=1.5,aformat=sample_rates=44100:channel_layouts=stereo[m];` +
  `[v][m]amix=inputs=2:duration=longest:normalize=0,atrim=0:${d},loudnorm=I=-15:TP=-1.5:LRA=11[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
fs.rmSync(silent, { force: true });

// Nachweise in der Post-Datei: eigene Visualisierung, plus Erdbild und Fotos
const fotos = plan.filter(s => s.typ === 'foto' && s.credit).map(s => s.credit);
v.credit = ['eigene 3D-Visualisierung', plan.some(s => s.typ === 'erde') ? 'Erdbild: NASA Blue Marble (Public Domain)' : null, ...fotos.map(f => 'Foto: ' + f)].filter(Boolean).join('; ');
v.license = 'eigene Erstellung';
v.duration = +duration.toFixed(1);
v.file = out;
post.format = 'video';
fs.writeFileSync(file, JSON.stringify(post, null, 2) + '\n');

// Kopie für GitHub Pages (von dort holt Instagram das Video, siehe publish.js)
fs.mkdirSync(path.join('docs/v', post.id), { recursive: true });
fs.copyFileSync(out, path.join('docs/v', post.id, 'video-reel.mp4'));
console.log(`Video fertig (${d} s, ${music.credit || 'eigene Klangfläche'}) -> ${out}`);

// 5) Pflicht-Prüfung: ganzes Video abhören, Zahlen streng, Aussetzer, Standbilder-Bogen
const sheet = path.join(dir, 'pruefung.jpg');
const r = spawnSync(py, [path.join(__dirname, 'stimme/pruefen.py'), out, txt, sheet], { stdio: ['ignore', 'pipe', 'pipe'] });
const res = r.stdout.toString();
console.log(res.split('\n').filter(l => !/Warning/.test(l)).join('\n'));
if (r.status !== 0) { console.error(`Nicht posten: Prüfung fehlgeschlagen. Bogen: ${sheet}`); process.exit(1); }
console.log(`Bogen ansehen: ${sheet}`);
