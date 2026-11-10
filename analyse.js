// Tägliche Reichweiten-Analyse: schreibt data/analyse.md (aus data/posted.json, kostenlos, ohne Token)
const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('data/posted.json', 'utf8'));
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const f = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
const withStats = posts.filter((p) => p.stats);
const gruppen = (key) => {
  const m = {};
  for (const p of withStats) (m[key(p)] ||= []).push(p);
  return Object.entries(m).map(([k, a]) => ({
    k, n: a.length,
    reach: avg(a.map((p) => p.stats.reach || 0)),
    likes: avg(a.map((p) => p.stats.likes || 0)),
    saved: avg(a.map((p) => (p.stats.saved || 0) + (p.stats.shares || 0))),
    follows: a.reduce((s, p) => s + (p.stats.follows || 0), 0),
    reel: avg(a.filter((p) => p.reelStats).map((p) => p.reelStats.reach || 0)),
  })).sort((a, b) => b.reach - a.reach);
};
const tabelle = (titel, g) =>
  `### ${titel}\n| Gruppe | Posts | Ø Reichweite | Ø Likes | Ø Speichern+Teilen | Follower gesamt | Ø Reel-Reichweite |\n|---|---|---|---|---|---|---|\n` +
  g.map((x) => `| ${x.k} | ${x.n} | ${f(x.reach)} | ${f(x.likes)} | ${f(x.saved)} | ${x.follows} | ${f(x.reel)} |`).join('\n') + '\n';
const stunde = (p) => `${String(new Date(p.postedAt).getUTCHours()).padStart(2, '0')} Uhr UTC`;
const wtag = (p) => ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date(p.postedAt).getUTCDay()];
const top = [...withStats].sort((a, b) => b.stats.reach - a.stats.reach);
const heute = new Date().toISOString().slice(0, 10);
const md = `# Algorithmus-Analyse (Stand ${heute})\n\nZiel: verstehen, was bei Instagram Reichweite, Likes und Follower bringt. ${withStats.length} Posts mit Zahlen.\n\n` +
  tabelle('Schwerpunkt', gruppen((p) => p.topic)) + '\n' + tabelle('Ton', gruppen((p) => p.tone)) + '\n' +
  tabelle('Format', gruppen((p) => p.format)) + '\n' + tabelle('Uhrzeit', gruppen(stunde)) + '\n' + tabelle('Wochentag', gruppen(wtag)) + '\n' +
  `### Top 3 / Flop 3 (Reichweite)\n` + top.slice(0, 3).map((p) => `- ${p.id}: ${p.stats.reach} (${p.topic}, ${p.tone}, ${p.format})`).join('\n') + '\n' +
  top.slice(-3).map((p) => `- ${p.id}: ${p.stats.reach} (${p.topic}, ${p.tone}, ${p.format})`).join('\n') + '\n\n' +
  `Hinweis: kleine Stichproben, Zufall möglich. Signale, die Instagram laut eigenen Angaben stark gewichtet: Speichern und Teilen, Verweildauer/Wischen, Likes in den ersten Stunden.\n`;
fs.writeFileSync('data/analyse.md', md);
console.log(md);
