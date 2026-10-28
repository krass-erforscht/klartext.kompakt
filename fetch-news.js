// Sammelt aktuelle Meldungen aus seriösen Nachrichten-Feeds: node fetch-news.js > data/candidates.json
// Jede Meldung bekommt einen Schwerpunkt-Vorschlag (aus dem Feed) und die Liste der anderen Redaktionen,
// die über dasselbe Thema berichten („auchBei“). Viele Redaktionen = große Nachricht und leichter zu prüfen.
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const { NAME, REPO } = require('./config');

const FEEDS = [
  { name: 'tagesschau', url: 'https://www.tagesschau.de/index~rss2.xml' },
  { name: 'tagesschau', url: 'https://www.tagesschau.de/inland/index~rss2.xml', schwerpunkt: 'alltag' },
  { name: 'tagesschau', url: 'https://www.tagesschau.de/wirtschaft/index~rss2.xml', schwerpunkt: 'geld' },
  { name: 'tagesschau', url: 'https://www.tagesschau.de/wirtschaft/verbraucher/index~rss2.xml', schwerpunkt: 'geld' },
  { name: 'tagesschau', url: 'https://www.tagesschau.de/wirtschaft/technologie/index~rss2.xml', schwerpunkt: 'digital' },
  { name: 'tagesschau', url: 'https://www.tagesschau.de/wissen/index~rss2.xml', schwerpunkt: 'welt' },
  { name: 'tagesschau', url: 'https://www.tagesschau.de/ausland/index~rss2.xml', schwerpunkt: 'welt' },
  { name: 'ZDFheute', url: 'https://www.zdfheute.de/rss/zdf/nachrichten' },
  { name: 'Deutschlandfunk', url: 'https://www.deutschlandfunk.de/nachrichten-100.rss' },
  { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-de-all' },
  { name: 'MDR', url: 'https://www.mdr.de/nachrichten/index~rss2.xml' },
  { name: 'NDR', url: 'https://www.ndr.de/nachrichten/info/index~rdf.xml' },
  { name: 'Spiegel', url: 'https://www.spiegel.de/schlagzeilen/index.rss' },
  { name: 'n-tv', url: 'https://www.n-tv.de/rss' },
  { name: 'heise online', url: 'https://www.heise.de/rss/heise-top-atom.xml', schwerpunkt: 'digital' },
  { name: 't3n', url: 'https://t3n.de/rss.xml', schwerpunkt: 'digital' },
  { name: 'Sportschau', url: 'https://www.sportschau.de/index~rss2.xml', schwerpunkt: 'sport' },
  { name: 'Bundesregierung', url: 'https://www.bundesregierung.de/service/rss/breg-de/1151244/feed.xml', schwerpunkt: 'alltag' },
];
// Nachrichten müssen frisch sein: höchstens 30 Stunden alt
const MAX_AGE_HOURS = 30;

const strip = s => String(s?.['#text'] ?? s ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set('der die das und oder mit von für auf aus bei nach über unter dem den des ein eine einer eines ist sind wird werden hat haben nicht auch noch mehr wie was wer neue neuer neues soll sollen kann können vor zum zur gegen dass sich nun jetzt erst schon'.split(' '));
const words = s => new Set(s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w)));

// RSS 2.0, RDF (RSS 1.0) und Atom in eine gemeinsame Form bringen
function entries(doc) {
  if (doc?.rss) return [].concat(doc.rss.channel?.item || []).map(it => ({ title: it.title, summary: it.description, url: it.link, date: it.pubDate || it['dc:date'] }));
  if (doc?.['rdf:RDF']) return [].concat(doc['rdf:RDF'].item || []).map(it => ({ title: it.title, summary: it.description, url: it.link, date: it['dc:date'] }));
  if (doc?.feed) return [].concat(doc.feed.entry || []).map(it => ({ title: it.title, summary: it.summary || it.content,
    url: [].concat(it.link || []).map(l => l['@_href'] || l).find(l => typeof l === 'string'), date: it.updated || it.published }));
  return [];
}

(async () => {
  const parser = new XMLParser({ ignoreAttributes: false });
  const seen = new Set(fs.existsSync('data/posted.json') ? JSON.parse(fs.readFileSync('data/posted.json')).flatMap(p => p.sourceUrls || [p.sourceUrl]) : []);
  const items = [];
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { 'User-Agent': `${NAME}/0.1 (https://github.com/${REPO})` }, signal: AbortSignal.timeout(20000) });
      for (const it of entries(parser.parse(await res.text()))) {
        const date = new Date(it.date || Date.now());
        if (!it.url || !strip(it.title) || Date.now() - date > MAX_AGE_HOURS * 36e5 || seen.has(it.url)) continue;
        items.push({ source: feed.name, schwerpunkt: feed.schwerpunkt || null, title: strip(it.title), summary: strip(it.summary).slice(0, 500), url: it.url, date: date.toISOString() });
      }
    } catch (e) { console.error(`Feed fehlgeschlagen: ${feed.url} (${e.message})`); }
  }
  const unique = [...new Map(items.map(i => [i.url, i])).values()];
  // Andere Redaktionen mit demselben Thema: mindestens 2 gemeinsame seltene Wörter in Titel oder Anriss
  // (Wörter wie „Prozent“ oder „Jahr“, die in vielen Meldungen stehen, zählen nicht)
  const all = unique.map(i => words(i.title + ' ' + i.summary.slice(0, 150)));
  const df = {};
  all.forEach(ws => ws.forEach(w => { df[w] = (df[w] || 0) + 1; }));
  const bag = all.map(ws => new Set([...ws].filter(w => df[w] <= Math.max(3, unique.length * 0.03))));
  unique.forEach((a, i) => {
    a.auchBei = [...new Set(unique.filter((b, j) => b.source !== a.source && [...bag[j]].filter(w => bag[i].has(w)).length >= 2).map(b => b.source))];
  });
  unique.sort((a, b) => b.auchBei.length - a.auchBei.length || b.date.localeCompare(a.date));
  console.log(JSON.stringify(unique, null, 2));
})();
