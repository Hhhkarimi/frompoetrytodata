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

test('build publishes the computational-aesthetics study and machine-readable results', () => {
  const research = fs.readFileSync(
    path.join(dist, 'research/computational-aesthetics/index.html'),
    'utf8',
  );
  const payload = JSON.parse(
    fs.readFileSync(path.join(dist, 'api/computational-aesthetics.json'), 'utf8'),
  );
  const downloadPayload = JSON.parse(
    fs.readFileSync(path.join(dist, 'downloads/computational-aesthetics.json'), 'utf8'),
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dist, 'downloads/manifest.json'), 'utf8'),
  );
  const csv = fs.readFileSync(
    path.join(dist, 'downloads/computational-aesthetics.csv'),
    'utf8',
  );

  assert.equal(researchPages.length, 11);
  assert.match(research, /زیبایی‌شناسی محاسباتی/);
  assert.match(research, /GPT-5\.6-sol/);
  assert.match(research, /ارزیابی انسانی نیست/);
  assert.equal(payload.records.length, 670);
  assert.equal(payload.poets.length, 67);
  assert.deepEqual(downloadPayload, payload);
  const jsonManifestEntry = manifest.files.find(
    (file) => file.path === 'computational-aesthetics.json',
  );
  assert.ok(jsonManifestEntry, 'download JSON is included in the release manifest');
  assert.match(jsonManifestEntry.sha256, /^[a-f0-9]{64}$/);
  assert.equal(
    jsonManifestEntry.bytes,
    fs.statSync(path.join(dist, 'downloads/computational-aesthetics.json')).size,
  );
  assert.equal(csv.replace(/^\uFEFF/, '').trim().split('\n').length, 671);
  assert.doesNotMatch(research, /گزارش_جامع_زیبایی_شناسی|\.docx/i);
});

test('every canonical poet page publishes its computational-aesthetics profile', () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(dist, 'api/computational-aesthetics.json'), 'utf8'),
  );

  for (const poet of payload.poets) {
    const html = fs.readFileSync(
      path.join(dist, 'poets', poet.slug, 'index.html'),
      'utf8',
    );

    assert.match(html, /id="computational-aesthetics"/, `${poet.name} study section`);
    assert.match(html, /GPT-5\.6-sol/, `${poet.name} evaluator disclosure`);
    assert.match(html, /ارزیابی انسانی نیست/, `${poet.name} non-human disclosure`);
    assert.equal(
      [...html.matchAll(/data-aesthetic-couplet=/g)].length,
      10,
      `${poet.name} top-couplet count`,
    );
    assert.equal(
      [...html.matchAll(/data-aesthetic-dimension=/g)].length,
      16,
      `${poet.name} chart and table expose the same eight dimensions`,
    );
    const dimensionValues = [...html.matchAll(
      /data-aesthetic-dimension="(chart|table):([^"]+)" data-aesthetic-value="([^"]+)"/g,
    )].reduce((values, [, view, dimension, value]) => {
      if (!values[dimension]) values[dimension] = {};
      values[dimension][view] = Number(value);
      return values;
    }, {});
    assert.equal(Object.keys(dimensionValues).length, 8, `${poet.name} dimension identities`);
    for (const [dimension, value] of Object.entries(poet.dimensionMeans)) {
      assert.deepEqual(
        dimensionValues[dimension],
        { chart: value, table: value },
        `${poet.name} ${dimension} chart/table equivalence`,
      );
    }
    assert.match(html, /href="\/downloads\/computational-aesthetics\.csv"/);
    assert.match(html, /href="\/api\/computational-aesthetics\.json"/);
    assert.doesNotMatch(html, /گزارش_جامع_زیبایی_شناسی|\.docx/i);
  }
});

test('computational-aesthetics research page exposes a no-JavaScript, URL-driven explorer', () => {
  const html = fs.readFileSync(
    path.join(dist, 'research/computational-aesthetics/index.html'),
    'utf8',
  );

  assert.match(html, /<form[^>]+method="get"[^>]+data-aesthetic-explorer/);
  assert.match(html, /name="q"/);
  assert.match(html, /name="century"/);
  assert.match(html, /name="metric"/);
  assert.match(html, /name="sort"/);
  assert.match(html, /data-aesthetic-status[^>]+aria-live="polite"/);
  assert.match(html, /data-aesthetic-loading[^>]+aria-live="polite"/);
  assert.match(html, /data-aesthetic-error[^>]+role="alert"/);
  assert.match(html, /data-aesthetic-retry/);
  assert.match(html, /<noscript>[\s\S]*۶۷ شاعر/);
  assert.equal(
    [...html.matchAll(/data-aesthetic-poet=/g)].length,
    67,
    'all canonical poet summaries remain in the static table',
  );
  assert.match(html, /href="\/poets\/hafez\/"/);
  assert.match(html, /href="\/downloads\/computational-aesthetics\.csv"/);
  assert.match(html, /href="\/api\/computational-aesthetics\.json"/);
});

test('computational-aesthetics publishes scholarly Dataset metadata and catalog downloads', () => {
  const research = fs.readFileSync(
    path.join(dist, 'research/computational-aesthetics/index.html'),
    'utf8',
  );
  const dataPage = fs.readFileSync(path.join(dist, 'data/index.html'), 'utf8');

  assert.match(research, /research\/computational-aesthetics\/#dataset/);
  assert.match(research, /"@type":"Dataset"/);
  assert.match(research, /"measurementTechnique":\[[^\]]*GPT-5\.6-sol/);
  assert.match(research, /"variableMeasured":\[[^\]]*نمادپردازی[^\]]*تازگی بیان/);
  assert.match(research, /"contentUrl":"https:\/\/frompoetrytodata\.vercel\.app\/downloads\/computational-aesthetics\.csv"/);
  assert.match(research, /"contentUrl":"https:\/\/frompoetrytodata\.vercel\.app\/downloads\/computational-aesthetics\.json"/);
  assert.match(research, /"contentSize":"[1-9][0-9]* bytes"/);
  assert.match(research, /id="dataset-citation"/);
  assert.match(research, /کپی استناد مجموعه‌داده/);
  assert.match(research, /href="#downloads">داده و دانلود/);
  assert.match(research, /href="#citation">استناد/);
  assert.match(research, /id="audiences"/);
  assert.match(research, /خوانندهٔ عمومی/);
  assert.match(research, /پژوهشگر ادبی/);
  assert.match(research, /پژوهشگر علوم انسانی دیجیتال/);
  assert.match(research, /کاربر داده/);
  assert.match(dataPage, /href="\/downloads\/computational-aesthetics\.csv"/);
  assert.match(dataPage, /href="\/downloads\/computational-aesthetics\.json"/);
  assert.match(dataPage, /href="\/api\/computational-aesthetics\.json"/);
  assert.match(dataPage, /poet_slug/);
  assert.match(dataPage, /source_poet_display/);
});

test('machine discovery indexes the computational-aesthetics dataset', () => {
  const openapi = JSON.parse(fs.readFileSync(path.join(dist, 'openapi.json'), 'utf8'));
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap-data.xml'), 'utf8');
  const llms = fs.readFileSync(path.join(dist, 'llms-full.txt'), 'utf8');

  assert.ok(openapi.paths['/api/computational-aesthetics.json']);
  assert.match(sitemap, /\/api\/computational-aesthetics\.json/);
  assert.match(sitemap, /\/downloads\/computational-aesthetics\.json/);
  assert.match(llms, /## یازده مطالعهٔ پژوهشی/);
  assert.match(llms, /\/api\/computational-aesthetics\.json/);
  assert.match(llms, /\/downloads\/computational-aesthetics\.csv/);
  assert.match(llms, /\/downloads\/computational-aesthetics\.json/);
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
  assert.match(research, /"dateModified":"2026-08-01"/);
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
  assert.equal(manifest.modifiedDate, '2026-08-01');
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
    'published-evidence.json',
    'poets.json',
    'themes.json',
    'metaphors.json',
    'centuries.json',
    'forms.json',
    'geography.json',
    'lexical-life.json',
    'attribution.json',
    'public-questions.json',
    'computational-aesthetics.json',
  ];

  for (const filename of files) {
    const payload = JSON.parse(fs.readFileSync(path.join(dist, 'api', filename), 'utf8'));
    assert.equal(payload.schemaVersion, 1, `${filename} schemaVersion`);
    assert.equal(payload.publicationVersion, '7.0.0', `${filename} publicationVersion`);
  }
});

test('generated research pages and APIs share published evidence identities', () => {
  const payload = JSON.parse(fs.readFileSync(path.join(dist, 'api/published-evidence.json'), 'utf8'));
  assert.equal(payload.items.length, researchPages.length);
  for (const page of researchPages) {
    const evidence = payload.items.find((item) => item.id === `research:${page.id}`);
    assert.ok(evidence, page.id);
    assert.equal(evidence.source.publicationVersion, '7.0.0');
    assert.equal(evidence.source.dataset.startsWith('/downloads/'), true);
    assert.equal(evidence.qualification, page.qualification);
    const article = fs.readFileSync(path.join(dist, page.path.slice(1), 'index.html'), 'utf8');
    assert.ok(article.includes(evidence.values.method), `${page.id} method projection`);
    assert.ok(article.includes(evidence.qualification), `${page.id} qualification projection`);
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
    ['research', researchPages.length, /محدودیت/],
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
    assert.match(article, /دانلود مستقیم شاهد CSV/, `${page.id} download path`);
    assert.match(article, /href="\/methodology\/"/, `${page.id} methodology path`);
    assert.match(article, /href="\/(?:poets|centuries|themes|metaphors)\/[^"]+\/"/, `${page.id} entity path`);
    assert.match(article, /href="\/downloads\/[^"]+\.(?:csv|json)"/, `${page.id} direct evidence download`);
  }
});

test('entity pages expose records, related research, downloads, and operational examples', () => {
  const poet = fs.readFileSync(path.join(dist, 'poets/hafez/index.html'), 'utf8');
  const century = fs.readFileSync(path.join(dist, 'centuries/8/index.html'), 'utf8');
  const metaphor = fs.readFileSync(path.join(dist, 'metaphors/journey-road-destination/index.html'), 'utf8');

  assert.match(poet, /رکوردها و آثار در دسترس/);
  assert.match(poet, /href="\/research\/(?:stylometry|intertextuality)\//);
  assert.match(poet, /href="\/downloads\/poets\.csv"/);
  assert.match(century, /پژوهش‌های مرتبط/);
  assert.match(century, /href="\/research\/topics\//);
  assert.match(metaphor, /نمونه‌های عملیاتی خانواده/);
  assert.match(metaphor, /href="\/downloads\/metaphors-by-century\.csv"/);
});

test('OpenAPI schemas match versioned list endpoint payloads', () => {
  const openapi = JSON.parse(fs.readFileSync(path.join(dist, 'openapi.json'), 'utf8'));
  for (const endpoint of ['content-index', 'themes', 'metaphors', 'centuries', 'poets']) {
    const schema = openapi.paths[`/api/${endpoint}.json`].get.responses['200']
      .content['application/json'].schema;
    assert.equal(schema.type, 'object', endpoint);
    assert.equal(schema.properties.schemaVersion.type, 'integer', endpoint);
    assert.equal(schema.properties.publicationVersion.type, 'string', endpoint);
    assert.equal(schema.properties.items.type, 'array', endpoint);
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
