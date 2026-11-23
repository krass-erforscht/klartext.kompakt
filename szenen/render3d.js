// Rendert eine 3D-Szene (Three.js im Headless-Chromium) Bild für Bild zu einem stummen Video:
//   node szenen/render3d.js <szenen-ordner> <config.json> <ziel.mp4>
// Der Ordner enthält scene.html mit window.setup(config) und window.frame(t). three.js kommt aus node_modules.
// config.json: { duration, fps, ...was die Szene braucht (shots, overlays, captions, source) }.
// Gerendert wird mit 720x1280 und auf 1080x1920 (Instagram-Reel) hochskaliert.
const fs = require('fs'), path = require('path');
const { spawn } = require('child_process');
const { launch } = require('../browser');

(async () => {
  const [dir, cfgFile, out] = process.argv.slice(2);
  const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  const fps = cfg.fps || 30, frames = Math.ceil(cfg.duration * fps);
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  // Dateien über eine Schein-Adresse ausliefern, damit ES-Module funktionieren
  await page.route('http://szene.local/**', route => {
    const name = new URL(route.request().url()).pathname.slice(1);
    const file = name === 'three.module.min.js' ? path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.module.min.js') : path.join(dir, name);
    route.fulfill({ path: file, contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : undefined });
  });
  page.on('pageerror', e => console.error('Szene:', e.message));
  await page.goto('http://szene.local/scene.html');
  await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
  await page.evaluate(c => window.setup(c), cfg);

  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.frame(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) console.error(`  ${Math.round(i / fps)} s von ${cfg.duration.toFixed(0)} s (${((Date.now() - t0) / 1000).toFixed(0)} s Rechenzeit)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log(`${frames} Bilder -> ${out}`);
})().catch(e => { console.error(e); process.exit(1); });
