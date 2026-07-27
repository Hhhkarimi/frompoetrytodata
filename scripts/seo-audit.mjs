import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) throw new Error('dist پیدا نشد؛ ابتدا npm run build را اجرا کنید.');

const htmlFiles = [];
const allFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else {
      allFiles.push(target);
      if (entry.name.endsWith('.html')) htmlFiles.push(target);
    }
  }
};
walk(dist);

const errors = [];
const warnings = [];
const titleOwners = new Map();
const descriptionOwners = new Map();
const canonicalOwners = new Map();
const internalLinks = [];

const stripMarkup = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[^;]+;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const remember = (map, value, file, label) => {
  if (!value) return;
  if (map.has(value)) warnings.push(`${file}: ${label} با ${map.get(value)} تکراری است`);
  else map.set(value, file);
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file).replaceAll(path.sep, '/');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1];
  const h1Count = [...html.matchAll(/<h1(?:\s|>)/gi)].length;
  const text = stripMarkup(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (!title) errors.push(`${rel}: title ندارد`);
  if (!description) errors.push(`${rel}: meta description ندارد`);
  if (!canonical && rel !== '404.html') errors.push(`${rel}: canonical ندارد`);
  if (!robots) errors.push(`${rel}: robots meta ندارد`);
  if (h1Count !== 1) errors.push(`${rel}: تعداد h1 برابر ${h1Count} است`);
  if (!/lang="fa"/i.test(html)) errors.push(`${rel}: lang=fa ندارد`);
  if (!/dir="rtl"/i.test(html)) errors.push(`${rel}: dir=rtl ندارد`);
  if (/<div class="seo-layout">[\s\S]*?<main id="main"/i.test(html) && !/<aside class="seo-toc"/i.test(html)) errors.push(`${rel}: صفحه بدون فهرست، کلاس تمام‌عرض ندارد`);
  if (!/property="og:title"/i.test(html)) errors.push(`${rel}: og:title ندارد`);
  if (!/property="og:image"/i.test(html)) errors.push(`${rel}: og:image ندارد`);
  if (!/name="twitter:card"/i.test(html)) errors.push(`${rel}: Twitter Card ندارد`);
  if (!/rel="canonical"/i.test(html) && rel !== '404.html') errors.push(`${rel}: canonical link ندارد`);
  if (html.includes('__SITE_URL__') || html.includes('__ROBOTS__') || html.includes('__HOME_JSON_LD__')) errors.push(`${rel}: placeholder ساخت در خروجی باقی مانده است`);
  if (description && (description.length < 65 || description.length > 230)) warnings.push(`${rel}: طول description برابر ${description.length}`);
  if (title && (title.length < 15 || title.length > 90)) warnings.push(`${rel}: طول title برابر ${title.length}`);
  if (wordCount < 110 && rel !== '404.html') warnings.push(`${rel}: محتوای متنی کوتاه است (${wordCount} واژه)`);

  remember(titleOwners, title, rel, 'title');
  remember(descriptionOwners, description, rel, 'description');
  remember(canonicalOwners, canonical, rel, 'canonical');

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed['@context']) errors.push(`${rel}: JSON-LD فاقد @context است`);
    } catch (error) {
      errors.push(`${rel}: JSON-LD نامعتبر — ${error.message}`);
    }
  }
  if (!/<script type="application\/ld\+json">/i.test(html)) errors.push(`${rel}: JSON-LD ندارد`);

  for (const img of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(img[1])) errors.push(`${rel}: تصویر بدون alt دارد`);
    if (!/\bwidth="\d+"/i.test(img[1]) || !/\bheight="\d+"/i.test(img[1])) warnings.push(`${rel}: تصویر بدون width/height صریح دارد`);
  }

  for (const link of html.matchAll(/\bhref="([^"]+)"/gi)) {
    const href = link[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    internalLinks.push({ href, rel });
  }
}

function targetForHref(href) {
  const raw = href.split('#')[0].split('?')[0];
  if (!raw) return null;
  let pathname;
  try { pathname = decodeURI(raw); } catch { pathname = raw; }
  if (pathname === '/') return path.join(dist, 'index.html');
  const relative = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return path.join(dist, relative, 'index.html');
  return path.join(dist, relative);
}

for (const { href, rel } of internalLinks) {
  const target = targetForHref(href);
  if (target && !fs.existsSync(target)) errors.push(`${rel}: لینک داخلی شکسته ${href}`);
}

const required = [
  'sitemap.xml', 'sitemap-core.xml', 'sitemap-entities.xml', 'sitemap-data.xml', 'sitemap-images.xml',
  'robots.txt', 'llms.txt', 'llms-full.txt', 'llms-data.txt', 'feed.xml', 'manifest.webmanifest',
  'openapi.json', 'citation.json', 'citation.bib', 'api/atlas-summary.json', 'api/content-index.json', 'api/knowledge-graph.json',
  'api/forms.json', 'research/forms/index.html', 'downloads/forms-comparison.csv',
  'api/geography.json', 'research/geography/index.html', 'downloads/geography/poet_geography.csv', 'og/og-geography.png',
  'api/lexical-life.json', 'research/lexical-life/index.html', 'downloads/lexical-lifecycle.csv', 'downloads/lexical-examples.csv', 'og/og-lexical-life.png',
  'api/attribution.json', 'research/attribution/index.html', 'downloads/attribution-corpus-audit.csv', 'og/og-attribution.png',
  'themes/index.html', 'metaphors/index.html', 'centuries/index.html', 'questions/index.html',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
];
for (const requiredFile of required) {
  if (!fs.existsSync(path.join(dist, requiredFile))) errors.push(`${requiredFile}: وجود ندارد`);
}

for (const jsonFile of ['openapi.json','citation.json','manifest.webmanifest','api/atlas-summary.json','api/content-index.json','api/knowledge-graph.json','api/themes.json','api/metaphors.json','api/centuries.json','api/forms.json','api/geography.json','api/lexical-life.json','api/attribution.json']) {
  const target = path.join(dist, jsonFile);
  if (!fs.existsSync(target)) continue;
  try { JSON.parse(fs.readFileSync(target, 'utf8')); }
  catch (error) { errors.push(`${jsonFile}: JSON نامعتبر — ${error.message}`); }
}

const sitemapIndex = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
if (!/<sitemapindex/i.test(sitemapIndex)) errors.push('sitemap.xml: باید sitemap index باشد');
for (const name of ['sitemap-core.xml','sitemap-entities.xml','sitemap-data.xml','sitemap-images.xml']) {
  if (!sitemapIndex.includes(name)) errors.push(`sitemap.xml: ${name} ثبت نشده است`);
}
for (const sitemapFile of ['sitemap-core.xml','sitemap-entities.xml','sitemap-data.xml']) {
  const xml = fs.readFileSync(path.join(dist, sitemapFile), 'utf8');
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      const url = new URL(match[1].replaceAll('&amp;', '&'));
      const target = targetForHref(url.pathname);
      if (target && !fs.existsSync(target)) errors.push(`${sitemapFile}: URL بدون خروجی ${url.pathname}`);
    } catch (error) { errors.push(`${sitemapFile}: URL نامعتبر ${match[1]}`); }
  }
}

const robotsText = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
if (!/Sitemap:\s+https?:\/\//i.test(robotsText)) errors.push('robots.txt: مسیر sitemap مطلق ندارد');
for (const crawler of ['OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','PerplexityBot']) {
  if (!robotsText.includes(crawler)) warnings.push(`robots.txt: سیاست صریح ${crawler} ثبت نشده است`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) {
  const target = targetForHref(icon.src);
  if (!target || !fs.existsSync(target)) errors.push(`manifest: آیکن ${icon.src} وجود ندارد`);
}

const expectedCounts = {
  research: fs.readdirSync(path.join(dist, 'research'), { withFileTypes: true }).filter((x) => x.isDirectory()).length,
  themes: fs.readdirSync(path.join(dist, 'themes'), { withFileTypes: true }).filter((x) => x.isDirectory()).length,
  metaphors: fs.readdirSync(path.join(dist, 'metaphors'), { withFileTypes: true }).filter((x) => x.isDirectory()).length,
  centuries: fs.readdirSync(path.join(dist, 'centuries'), { withFileTypes: true }).filter((x) => x.isDirectory()).length,
  poets: fs.readdirSync(path.join(dist, 'poets'), { withFileTypes: true }).filter((x) => x.isDirectory()).length,
};
if (expectedCounts.research !== 9) errors.push(`تعداد صفحات پژوهش ${expectedCounts.research} است؛ انتظار 9`);
if (expectedCounts.themes !== 11) errors.push(`تعداد صفحات مضمون ${expectedCounts.themes} است؛ انتظار 11`);
if (expectedCounts.metaphors !== 10) errors.push(`تعداد صفحات استعاره ${expectedCounts.metaphors} است؛ انتظار 10`);
if (expectedCounts.centuries !== 13) errors.push(`تعداد صفحات سده ${expectedCounts.centuries} است؛ انتظار 13`);
if (expectedCounts.poets !== 67) errors.push(`تعداد صفحات شاعر ${expectedCounts.poets} است؛ انتظار 67`);

const assetSizes = allFiles.filter((file) => /\/assets\/.+\.(js|css)$/.test(file)).map((file) => ({ file: path.relative(dist, file), size: fs.statSync(file).size }));
for (const asset of assetSizes) {
  if (asset.file.endsWith('.js') && asset.size > 1_500_000) warnings.push(`${asset.file}: حجم JavaScript برابر ${(asset.size / 1024 / 1024).toFixed(2)}MB است`);
  if (asset.file.endsWith('.css') && asset.size > 250_000) warnings.push(`${asset.file}: حجم CSS برابر ${(asset.size / 1024).toFixed(0)}KB است`);
}

console.log(`صفحات HTML بررسی‌شده: ${htmlFiles.length}`);
console.log(`موجودیت‌ها: ${expectedCounts.poets} شاعر، ${expectedCounts.themes} مضمون، ${expectedCounts.metaphors} استعاره، ${expectedCounts.centuries} سده`);
console.log(`لینک‌های داخلی بررسی‌شده: ${internalLinks.length}`);
console.log(`هشدارها: ${warnings.length}`);
warnings.slice(0, 40).forEach((item) => console.log(`WARN ${item}`));
if (errors.length) {
  [...new Set(errors)].forEach((item) => console.error(`ERROR ${item}`));
  process.exit(1);
}
console.log('Advanced SEO/GEO audit passed.');
