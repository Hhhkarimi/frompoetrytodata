import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');

test('prototype exposes an RTL, dependency-free, no-JavaScript-safe document', async () => {
  const html = await read('public/prototype/index.html');
  assert.match(html, /<html[^>]+lang="fa"[^>]+dir="rtl"/i);
  assert.match(html, /<a[^>]+href="#prototype-main"[^>]*>[^<]*پرش/u);
  assert.match(html, /<noscript>/i);
  assert.match(html, /<script type="module" src="\.\/prototype\.js"><\/script>/i);
  assert.match(
    html,
    /<link\s+rel="canonical"\s+href="https:\/\/poetrytodata\.vercel\.app\/prototype\/"\s*\/?>/i,
  );
  assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)="https?:\/\/(?!poetrytodata\.vercel\.app\/prototype\/)/i);
});





test('prototype exposes exactly one document-level h1', async () => {
  const html = await read('public/prototype/index.html');
  const openingHeadings = html.match(/<h1(?:\s|>)/gi) ?? [];
  const closingHeadings = html.match(/<\/h1>/gi) ?? [];
  assert.equal(openingHeadings.length, 1);
  assert.equal(closingHeadings.length, 1);
});

test('prototype satisfies repository social metadata and structured-data requirements', async () => {
  const html = await read('public/prototype/index.html');
  assert.match(html, /<meta\s+property="og:title"\s+content="[^"]+"\s*\/>/i);
  assert.match(html, /<meta\s+property="og:image"\s+content="https:\/\/poetrytodata\.vercel\.app\/prototype\/og-image\.png"\s*\/>/i);
  assert.match(html, /<meta\s+name="twitter:card"\s+content="summary_large_image"\s*\/>/i);
  assert.match(html, /<meta\s+name="twitter:title"\s+content="[^"]+"\s*\/>/i);
  assert.match(html, /<meta\s+name="twitter:image"\s+content="https:\/\/poetrytodata\.vercel\.app\/prototype\/og-image\.png"\s*\/>/i);

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(jsonLdMatch, 'prototype must include JSON-LD');
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.equal(jsonLd['@context'], 'https://schema.org');
  assert.equal(jsonLd['@type'], 'WebPage');
  assert.equal(jsonLd.url, 'https://poetrytodata.vercel.app/prototype/');

  const image = await stat(path.join(root, 'public/prototype/og-image.png'));
  assert(image.isFile());
  assert(image.size > 10_000, 'social image must be a non-placeholder PNG');
});

test('prototype data defines all required variants, pages, states, and canonical corpus examples', async () => {
  const dataUrl = pathToFileURL(path.join(root, 'public/prototype/prototype-data.js'));
  const data = await import(`${dataUrl.href}?cache=${Date.now()}`);
  assert.deepEqual(Object.keys(data.VARIANTS), ['narrative', 'explorer', 'research', 'audience']);
  assert.deepEqual(data.PAGES, ['home', 'poet', 'century', 'metaphor', 'finding']);
  assert.deepEqual(data.STATES, ['ready', 'loading', 'empty', 'error']);
  assert.equal(data.CORPUS_SUMMARY.poets, 67);
  assert.equal(data.CORPUS_SUMMARY.centuries, 13);
  assert.deepEqual(
    data.POET_COVERAGE.map(({ slug, texts }) => [slug, texts]),
    [
      ['hafez', 595],
      ['saadi', 1904],
      ['rumi', 6242],
      ['ferdowsi', 616],
    ],
  );
});

test('styles include visible focus, logical properties, reduced motion, and mobile behavior', async () => {
  const css = await read('public/prototype/prototype.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /margin-inline|padding-inline|inset-inline/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media\s*\([^)]*max-width/i);
  assert.doesNotMatch(css, /outline\s*:\s*none/i);
});

test('prototype state is shareable and chart/table are rendered from one dataset', async () => {
  const js = await read('public/prototype/prototype.js');
  assert.match(js, /new URLSearchParams/);
  assert.match(js, /history\.replaceState/);
  assert.match(js, /renderEvidencePair\(POET_COVERAGE/);
  assert.match(js, /<svg[^>]+aria-hidden="true"/);
  assert.match(js, /<table/);
  assert.match(js, /URL_STATE_KEYS/);
});

test('prototype is explicitly disposable and does not alter production routes', async () => {
  const readme = await read('docs/prototypes/from-poetry-to-data/README.md');
  assert.match(readme, /disposable/i);
  assert.match(readme, /\/prototype\//);
  assert.match(readme, /production routes/i);
  assert.match(readme, /variant=narrative/);
});
