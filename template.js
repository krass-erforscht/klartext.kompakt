// Baut das HTML für eine einzelne Folie (1080x1350, Instagram-Hochformat 4:5) im Nachrichten-Look:
// rotes Schwerpunkt-Etikett und Datum oben, Schlagzeile unten, Foto als Hintergrund.
// Jede Folie bekommt ein Foto: ihr eigenes ("image" in der Folie) oder sonst das Titelbild des Posts mit wechselndem Ausschnitt.
// Ohne Foto: dunkle Titelfolie, helle Inhaltsfolien.
const { HANDLE, COLORS: C } = require('./config');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// **Wort** im Text wird hervorgehoben
const mark = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>');

// Ausschnitte für wiederverwendete Fotos, damit nicht jede Folie gleich aussieht
const CROPS = ['30% center', '75% center', '50% 25%', '15% 70%', '85% 40%', '50% 80%', '40% 50%'];

const css = `
*{box-sizing:border-box}
html,body{margin:0;width:1080px;height:1350px}
body{font-family:"DejaVu Sans",Arial,sans-serif;color:${C.text}}
.slide{position:relative;width:1080px;height:1350px;padding:150px 90px 150px;display:flex;flex-direction:column;justify-content:center;gap:40px;background:${C.light};border-left:18px solid ${C.accent}}
.meta{position:absolute;top:56px;left:72px;right:90px;display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.tag{background:${C.accent};color:#fff;padding:10px 22px}
.date{color:${C.muted};font-family:"DejaVu Sans Mono",monospace;font-weight:400}
.foot{position:absolute;bottom:54px;left:72px;right:90px;font-size:30px;font-weight:700;color:${C.muted}}
h2{font-weight:800;font-size:100px;line-height:1.05;margin:0;letter-spacing:-.02em}
p{font-size:58px;line-height:1.3;margin:0}
.big{font-weight:800;font-size:250px;line-height:.9;color:${C.accent}}
.hl{background:linear-gradient(transparent 58%,${C.mark} 58%,${C.mark} 92%,transparent 92%);padding:0 .08em}
.cover,.cta{background:${C.dark};color:#fff}
.cover .date,.cta .date{color:rgba(255,255,255,.7)}.cover .foot,.cta .foot{color:rgba(255,255,255,.7)}
.cover .hl,.cta .hl{background:none;color:${C.mark};padding:0}
.swipe{font-size:34px;font-weight:700;color:${C.mark}}
.handle{font-weight:800;font-size:84px;color:${C.accent}}
.credit{position:absolute;bottom:56px;right:90px;max-width:560px;text-align:right;font-size:24px;line-height:1.25;color:rgba(255,255,255,.78)}

/* Foto-Folien: Bild füllt die ganze Folie, ein dunkler Verlauf hält den Text lesbar */
.photo{background-size:cover;color:#fff;justify-content:flex-end}
.photo::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(8,14,26,.25) 0%,rgba(8,14,26,.3) 30%,rgba(8,14,26,.9) 70%)}
.photo>*{position:relative}.photo .meta,.photo .foot,.photo .credit{position:absolute}
.photo .date{color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7)}.photo .foot{color:rgba(255,255,255,.8)}
.photo h2,.photo p{text-shadow:0 3px 18px rgba(0,0,0,.55)}
.photo .big{color:${C.mark};text-shadow:0 4px 24px rgba(0,0,0,.5)}
.photo .hl{background:${C.accent};color:#fff;padding:0 .14em;box-decoration-break:clone;-webkit-box-decoration-break:clone;text-shadow:none}
`;

// Datum der Meldung in der Kopfzeile, damit jeder sieht, wie aktuell sie ist
const datum = post => new Date(post.date || Date.now()).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' });

function slideHtml(post, slide, i, n) {
  const img = slide.image || post.image;
  let cls = 'slide', body = '', foot = HANDLE, style = '';
  if (img?.dataUri) {
    cls += ' photo';
    const pos = slide.image ? (slide.image.position || 'center') : CROPS[i % CROPS.length];
    style = ` style="background-image:url('${img.dataUri}');background-position:${pos}"`;
  }
  if (slide.type === 'cover') {
    cls += ' cover';
    body = `<h2>${mark(slide.title)}</h2><span class="swipe">Was du wissen musst →</span>`;
  } else if (slide.type === 'cta') {
    cls += ' cta';
    body = `<h2>${mark(slide.title)}</h2><span class="handle">${HANDLE}</span><p>Folgen für Nachrichten, kurz erklärt.</p>`;
    foot = `Quellen: ${esc(post.sources.map(s => s.name).join(', '))}`;
  } else {
    if (slide.big) body += `<span class="big">${esc(slide.big)}</span>`;
    if (slide.title) body += `<h2>${mark(slide.title)}</h2>`;
    for (const t of slide.text || []) body += `<p>${mark(t)}</p>`;
  }
  // Bildnachweis auf jeder Foto-Folie; Fotos, die nicht das Ereignis selbst zeigen, sind als Symbolbild gekennzeichnet
  if (img?.dataUri && slide.type !== 'cta') body += `<div class="credit">${img.symbolbild ? 'Symbolbild · ' : ''}${esc(img.short || 'Foto: ' + img.credit)}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<section class="${cls}"${style}><div class="meta"><span class="tag">${esc(slide.label || post.category)}</span><span class="date">${datum(post)} · ${i + 1}/${n}</span></div>${body}<div class="foot">${foot}</div></section></body></html>`;
}
module.exports = { slideHtml };
