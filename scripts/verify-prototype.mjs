import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'public/prototype/index.html',
  'public/prototype/prototype.css',
  'public/prototype/og-image.png',
  'public/prototype/prototype-data.js',
  'public/prototype/prototype.js',
  'docs/prototypes/from-poetry-to-data/README.md',
  'tests/prototype.test.mjs',
];

for (const relativePath of required) {
  const info = await stat(path.join(root, relativePath));
  assert(info.isFile(), `${relativePath} must be a file`);
  assert(info.size > 0, `${relativePath} must not be empty`);
}

const html = await readFile(path.join(root, required[0]), 'utf8');
assert(html.includes('lang="fa" dir="rtl"'));
assert(html.includes('<noscript>'));
assert(
  html.includes('<link rel="canonical" href="https://poetrytodata.vercel.app/prototype/" />'),
  'prototype must declare the production canonical URL',
);
assert(
  !/<(?:script|link)[^>]+(?:src|href)="https?:\/\/(?!poetrytodata\.vercel\.app\/prototype\/)/i.test(html),
  'prototype must remain free of external runtime dependencies',
);


const openingH1s = html.match(/<h1(?:\s|>)/gi) ?? [];
const closingH1s = html.match(/<\/h1>/gi) ?? [];
assert.equal(openingH1s.length, 1, 'prototype must expose exactly one opening h1');
assert.equal(closingH1s.length, 1, 'prototype must expose exactly one closing h1');

assert(html.includes('property="og:title"'), 'prototype must include og:title');
assert(html.includes('property="og:image"'), 'prototype must include og:image');
assert(html.includes('name="twitter:card"'), 'prototype must include a Twitter Card');
const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
assert(jsonLdMatch, 'prototype must include JSON-LD');
JSON.parse(jsonLdMatch[1]);

const js = await readFile(path.join(root, 'public/prototype/prototype.js'), 'utf8');
for (const token of ['variant', 'page', 'state', 'q', 'century']) {
  assert(js.includes(`'${token}'`), `URL state must include ${token}`);
}

console.log('Prototype verification passed.');
