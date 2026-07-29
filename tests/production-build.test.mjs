import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { researchPages } from '../src/content/siteContent.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const officialOrigin = 'https://frompoetrytodata.vercel.app';

before(() => {
  execFileSync('npm', ['run', 'build'], {
    cwd: root,
    env: {
      ...process.env,
      SITE_URL: 'https://poetrytodata.vercel.app',
    },
    stdio: 'pipe',
  });
});

test('production artifacts keep the official publication identity', () => {
  const pages = [
    'index.html',
    'research/index.html',
    'research/topics/index.html',
    'poets/hafez/index.html',
    'centuries/8/index.html',
    'metaphors/journey-road-destination/index.html',
  ];

  for (const relativePath of pages) {
    const html = fs.readFileSync(path.join(dist, relativePath), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];

    assert.ok(
      canonical?.startsWith(officialOrigin),
      `${relativePath} must use the official publication origin`,
    );
    assert.doesNotMatch(
      html,
      /https:\/\/poetrytodata\.vercel\.app/,
      `${relativePath} must not publish the deployment alias`,
    );
  }
});

test('build publishes a narrative homepage and a no-JavaScript atlas entry', () => {
  const homepage = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const atlas = fs.readFileSync(path.join(dist, 'atlas/index.html'), 'utf8');
  const homepageDescription = homepage.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const atlasDescription = atlas.match(/<meta name="description" content="([^"]+)"/)?.[1];

  assert.match(homepage, /شعر فارسی در سیزده سده چگونه تغییر کرده است؟/);
  assert.match(homepage, /href="\/atlas\/"/);
  assert.match(homepage, /خوانندهٔ عمومی/);
  assert.match(homepage, /پژوهشگر ادبی/);
  assert.match(homepage, /پژوهشگر علوم انسانی دیجیتال/);
  assert.match(homepage, /کاربر داده/);

  assert.match(atlas, /<title>اطلس کاوش شعر فارسی/);
  assert.match(atlas, /<noscript>/);
  assert.match(atlas, /href="\/poets\/"/);
  assert.match(atlas, /href="\/centuries\/"/);
  assert.match(atlas, /href="\/metaphors\/"/);
  assert.match(atlas, /href="\/data\/"/);
  assert.notEqual(homepageDescription, atlasDescription);
  assert.match(atlas, /پوشش پیکره معادل اهمیت ادبی نیست/);
  assert.doesNotMatch(homepage, /__(?:PUBLICATION|MODIFIED)_DATE__/);
  assert.doesNotMatch(atlas, /__(?:PUBLICATION|MODIFIED)_DATE__/);
});

test('production styles preserve a visible focus indicator', () => {
  const homepage = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const stylesheetPath = homepage.match(/href="(\/assets\/[^"]+\.css)"/)?.[1];

  assert.ok(stylesheetPath, 'the production stylesheet must be linked');
  const stylesheet = fs.readFileSync(path.join(dist, stylesheetPath.slice(1)), 'utf8');

  assert.match(stylesheet, /:focus-visible\{[^}]*outline:/);
  assert.doesNotMatch(stylesheet, /:focus-visible\{[^}]*outline:(?:0|none)/);
});

test('citations and scholarly metadata use source-controlled publication identity', () => {
  const homepage = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const research = fs.readFileSync(path.join(dist, 'research/topics/index.html'), 'utf8');
  const cff = fs.readFileSync(path.join(dist, 'CITATION.cff'), 'utf8');
  const bib = fs.readFileSync(path.join(dist, 'citation.bib'), 'utf8');
  const citation = JSON.parse(fs.readFileSync(path.join(dist, 'citation.json'), 'utf8'));

  assert.match(research, /کریمی، حسین\. \(۲۰۲۶\)/);
  assert.match(research, /"datePublished":"2026-07-27"/);
  assert.match(research, /"dateModified":"2026-07-29"/);
  assert.match(cff, /url: "https:\/\/frompoetrytodata\.vercel\.app\/"/);
  assert.deepEqual(citation.issued, { 'date-parts': [[2026, 7, 27]] });
  assert.equal(citation.URL, `${officialOrigin}/`);
  assert.equal('accessed' in citation, false, 'build time is not a reader access date');
  assert.doesNotMatch(bib, /accessed/i);
  assert.match(homepage, /"@type":"Dataset"[^<]+"version":"7\.0\.0"/);
  assert.match(homepage, /"datePublished":"2026-07-27"/);
  assert.match(homepage, /downloads\/manifest\.json/);
});

test('download manifest records version, provenance, and verified checksums', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'downloads/manifest.json'), 'utf8'));
  const dataPage = fs.readFileSync(path.join(dist, 'data/index.html'), 'utf8');

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.publicationVersion, '7.0.0');
  assert.equal(manifest.modifiedDate, '2026-07-29');
  assert.match(manifest.license, /attributions/i);
  assert.equal(manifest.provenance.methodology, `${officialOrigin}/methodology/`);
  assert.ok(manifest.files.length > 10);
  assert.match(dataPage, /href="\/downloads\/manifest\.json"/);

  for (const entry of manifest.files) {
    const file = fs.readFileSync(path.join(dist, 'downloads', entry.path));
    assert.equal(entry.bytes, file.byteLength);
    assert.equal(entry.sha256, createHash('sha256').update(file).digest('hex'));
    assert.ok(entry.datasetId);
    assert.ok(entry.scope);
    assert.ok(entry.license);
    assert.ok(entry.provenance);
    assert.ok(entry.citation);
  }
});

test('published JSON APIs declare their schema and publication version', () => {
  const files = [
    'atlas-summary.json',
    'atlas-data.json',
    'research-findings.json',
    'poets.json',
    'themes.json',
    'metaphors.json',
    'centuries.json',
    'forms.json',
    'geography.json',
    'lexical-life.json',
    'attribution.json',
    'public-questions.json',
  ];

  for (const filename of files) {
    const payload = JSON.parse(fs.readFileSync(path.join(dist, 'api', filename), 'utf8'));
    assert.equal(payload.schemaVersion, 1, `${filename} schemaVersion`);
    assert.equal(payload.publicationVersion, '7.0.0', `${filename} publicationVersion`);
  }
});

test('disposable prototypes are not emitted as canonical production pages', () => {
  assert.equal(fs.existsSync(path.join(dist, 'prototype')), false);
  assert.doesNotMatch(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8'), /\/prototype\//);
});

test('all entity families are generated with local qualifications and current atlas links', () => {
  const families = [
    ['poets', 67, /اهمیت ادبی/],
    ['centuries', 13, /تاریخ دقیق سرایش/],
    ['metaphors', 10, /کاربرد حقیقی، نمادین و استعاری/],
    ['research', 10, /محدودیت/],
  ];

  for (const [directory, count, qualification] of families) {
    const pages = fs.readdirSync(path.join(dist, directory), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(dist, directory, entry.name, 'index.html'))
      .filter((file) => fs.existsSync(file));
    assert.equal(pages.length, count, `${directory} page count`);
    assert.ok(pages.some((file) => qualification.test(fs.readFileSync(file, 'utf8'))));
    for (const file of pages) {
      const html = fs.readFileSync(file, 'utf8');
      assert.match(html, /rel="canonical"/);
      assert.doesNotMatch(html, /href="\/#(?:overview|topics|metaphors|poets|attribution)"/);
    }
  }
});

test('every sensitive research summary carries its mandatory local qualification', () => {
  const homepage = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const researchIndex = fs.readFileSync(path.join(dist, 'research/index.html'), 'utf8');

  for (const page of researchPages) {
    assert.ok(page.qualification, `${page.id} must define a qualification`);
    assert.ok(homepage.includes(page.qualification), `${page.id} homepage qualification`);
    assert.ok(researchIndex.includes(page.qualification), `${page.id} index qualification`);
    const article = fs.readFileSync(path.join(dist, page.path.slice(1), 'index.html'), 'utf8');
    assert.ok(article.includes(page.qualification), `${page.id} article qualification`);
  }
});

test('research results separate evidence, method, interpretation, and reuse paths', () => {
  for (const page of researchPages) {
    const article = fs.readFileSync(path.join(dist, page.path.slice(1), 'index.html'), 'utf8');
    assert.match(article, /شاهد محاسباتی و واحد تحلیل/, `${page.id} evidence section`);
    assert.match(article, /روش و عدم‌قطعیت/, `${page.id} method section`);
    assert.match(article, /تفسیر ادبی/, `${page.id} interpretation section`);
    assert.match(article, /دانلودهای JSON و CSV/, `${page.id} download path`);
    assert.match(article, /href="\/methodology\/"/, `${page.id} methodology path`);
    assert.match(article, /href="\/(?:poets|centuries|themes|metaphors)\/"/, `${page.id} entity path`);
  }
});

test('narrative homepage keeps atlas data and ECharts off the initial request path', () => {
  const homepage = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const entryPath = homepage.match(/<script type="module" crossorigin src="(\/assets\/index-[^"]+\.js)"/)?.[1];
  assert.ok(entryPath, 'homepage entry script');
  const entry = fs.readFileSync(path.join(dist, entryPath.slice(1)), 'utf8');

  assert.doesNotMatch(homepage, /modulepreload[^>]+(?:App-|esm-)/);
  assert.doesNotMatch(homepage, /<script[^>]+src="\/assets\/(?:App-|esm-)/);
  assert.doesNotMatch(entry, /heart-or-reason|attribution-corpus-audit|echarts-for-react/);
  const entryBytes = Buffer.byteLength(entry);
  assert.ok(entryBytes < 250_000, `homepage entry is ${entryBytes} bytes`);
});
