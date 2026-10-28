// Rendert alle Folien eines Posts als JPEG: node render.js posts/<datei>.json
const fs = require('fs'), path = require('path');
const { launch } = require('./browser');
const { slideHtml } = require('./template');

(async () => {
  const file = process.argv[2];
  const post = JSON.parse(fs.readFileSync(file, 'utf8'));
  // Titelbild und Bilder einzelner Folien einbetten
  for (const img of [post.image, ...post.slides.map(s => s.image)]) {
    if (!img?.file) continue;
    const ext = path.extname(img.file).slice(1).replace('jpg', 'jpeg');
    img.dataUri = `data:image/${ext};base64,` + fs.readFileSync(img.file).toString('base64');
  }
  // Dasselbe Foto höchstens auf zwei Folien: das Titelbild nur auf der Titelfolie und der nächsten Folie ohne eigenes Foto
  let titelbild = 0;
  for (const s of post.slides) if (!s.image && post.image && ++titelbild > 2) s.ohneTitelbild = true;
  const outDir = path.join('out', post.id);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < post.slides.length; i++) {
    await page.setContent(slideHtml(post, post.slides[i], i, post.slides.length));
    // Schrift verkleinern, bis nichts mehr über den Rand ragt oder die Folie überläuft
    await page.evaluate(() => {
      const slide = document.querySelector('.slide');
      // Der Textblock muss zwischen Kopfzeile (bis 130px) und Fußzeile passen, auch wenn er nach oben überläuft;
      // die Fußzeile kann bei vielen Quellen zweizeilig sein, darum zählt ihre tatsächliche Oberkante
      const footTop = Math.min(1350 - 130, slide.querySelector('.foot').getBoundingClientRect().top - 24);
      const blocks = () => [...slide.querySelectorAll('h2,p,.big,.swipe,.handle')].map(el => el.getBoundingClientRect());
      const tooBig = () => [...slide.querySelectorAll('h2,p,.big,.handle')].some(el => el.scrollWidth > el.clientWidth + 1) ||
        blocks().some(r => r.top < 130 || r.bottom > footTop);
      for (let k = 0; k < 30 && tooBig(); k++)
        slide.querySelectorAll('h2,p,.big,.handle').forEach(el => { el.style.fontSize = parseFloat(getComputedStyle(el).fontSize) * 0.95 + 'px'; });
    });
    await page.screenshot({ path: path.join(outDir, `${i + 1}.jpg`), type: 'jpeg', quality: 90 });
  }
  await browser.close();
  console.log(`${post.slides.length} Folien -> ${outDir}`);
})();
