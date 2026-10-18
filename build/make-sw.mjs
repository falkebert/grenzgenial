// Writes the precache list and a content hash into grenzgenial/sw.js, so the service worker
// ships every flag and font for offline play and replaces its cache when anything changes.
// Usage: node build/make-sw.mjs   (re-run after changing files in grenzgenial/)
import fs from 'node:fs';
import crypto from 'node:crypto';

const DIR = new URL('../grenzgenial/', import.meta.url);
const SW = new URL('sw.js', DIR);
const list = d => fs.readdirSync(new URL(d, DIR)).filter(f => /\.(svg|woff2)$/.test(f)).sort().map(f => d + f);
const files = ['index.html', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', ...list('fonts/'), ...list('flags/')];

const hash = crypto.createHash('sha256');
for (const f of files) hash.update(f).update(fs.readFileSync(new URL(f, DIR)));
const version = hash.digest('hex').slice(0, 10);

let sw = fs.readFileSync(SW, 'utf8');
sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`)
  .replace(/const ASSETS = \[[\s\S]*?\];/, `const ASSETS = ['./',\n${files.map(f => `  '${f}'`).join(',\n')}\n];`);
fs.writeFileSync(SW, sw);
console.log(`sw.js: ${files.length} files, version ${version}`);
