// Startet den vorinstallierten Chromium. Der Pfad ändert sich mit neuen Versionen der Cloud-Umgebung,
// deshalb wird der erste vorhandene genommen statt eines festen Pfads.
const fs = require('fs');
const { chromium } = require('playwright-core');
const CANDIDATES = [
  '/opt/pw-browsers/chromium',
  ...(fs.existsSync('/opt/pw-browsers') ? fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium_headless_shell'))
    .flatMap(d => [`/opt/pw-browsers/${d}/chrome-headless-shell-linux64/chrome-headless-shell`, `/opt/pw-browsers/${d}/chrome-linux/headless_shell`]) : []),
];
const launch = () => chromium.launch({ executablePath: CANDIDATES.find(p => fs.existsSync(p)) });
module.exports = { launch };
