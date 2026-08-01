import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  audiencePaths, researchPages, faqItems, glossaryItems,
} from '../src/content/siteContent.js';
import { resolvePublicationOrigin } from './lib/publication-identity.mjs';
import { buildPersianCitation, PUBLICATION } from '../src/publication/publication.js';
import { persianDigits, persianNumber } from '../src/publication/persian-format.js';
import { createPublishedEvidence } from '../src/evidence/published-evidence.js';
import { poetSlug as resolvePoetSlug } from '../src/entities/poet-identity.js';
import { buildComputationalAestheticsArtifact } from '../src/research/computational-aesthetics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/atlasData.json'), 'utf8'));
const poetCouplets = JSON.parse(fs.readFileSync(path.join(root, 'src/data/poetCouplets.json'), 'utf8'));
data.overview.poets = data.overview.poets.map((poet) => ({ ...poet, totalCouplets: poetCouplets[poet.name] || 0 }));
data.overview.couplets = data.overview.poets.reduce((sum, poet) => sum + poet.totalCouplets, 0);
const formResearch = JSON.parse(fs.readFileSync(path.join(root, 'src/data/formResearch.json'), 'utf8'));
const geographyResearch = JSON.parse(fs.readFileSync(path.join(root, 'src/data/geographyResearch.json'), 'utf8'));
const lexicalResearch = JSON.parse(fs.readFileSync(path.join(root, 'src/data/lexicalResearch.json'), 'utf8'));
const attributionResearch = JSON.parse(fs.readFileSync(path.join(root, 'app/attribution-data.json'), 'utf8'));
const publicQuestionsResearch = JSON.parse(fs.readFileSync(path.join(root, 'app/research-data.json'), 'utf8'));
const computationalAesthetics = buildComputationalAestheticsArtifact(
  fs.readFileSync(path.join(root, 'research-data/computational-aesthetics/top-couplets.csv'), 'utf8'),
);
const buildDate = PUBLICATION.modifiedDate;
const securityExpiry = `${Number(PUBLICATION.modifiedDate.slice(0, 4)) + 1}${PUBLICATION.modifiedDate.slice(4)}T00:00:00.000Z`;
const siteUrl = resolvePublicationOrigin();
const isProduction = siteUrl.startsWith('https://') && !siteUrl.includes('localhost');
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || '';
const bingVerification = process.env.BING_SITE_VERIFICATION || '';

const faDigits = persianDigits;
const faNumber = (value, maxFraction = 1) => persianNumber(value, { maximumFractionDigits: maxFraction });
const faPercent = (value, maxFraction = 1) => `${faNumber(value, maxFraction)}٪`;
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const jsonLd = (value) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`;
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const write = (relativePath, content) => {
  const target = path.join(dist, relativePath);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content, 'utf8');
};
const absolute = (pathname = '/') => `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
const publicationMetadata = () => ({
  schemaVersion: 1,
  publicationVersion: PUBLICATION.version,
  modifiedDate: PUBLICATION.modifiedDate,
});
const versionObject = (value) => ({ ...publicationMetadata(), ...value });
const versionItems = (items) => ({ ...publicationMetadata(), items });

const poetSlug = (name) => resolvePoetSlug(name) || `poet-${Buffer.from(name).toString('hex').slice(0, 16)}`;

const logo = `<a class="seo-brand" href="/" aria-label="از شعر تا داده؛ صفحه اصلی">
  <svg viewBox="0 0 128 128" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b615c"/><stop offset="1" stop-color="#b9862d"/></linearGradient></defs><path d="M64 8 114 37v54L64 120 14 91V37Z" fill="url(#g)"/><path d="M64 28 87 56 64 99 41 56Z" fill="#fff8e8"/><circle cx="64" cy="60" r="8" fill="#9f2f38"/><path d="M64 68v23" stroke="#9f2f38" stroke-width="6" stroke-linecap="round"/></svg>
  <span><strong>از شعر تا داده</strong><small>اطلس تعاملی شعر فارسی</small></span></a>`;

function breadcrumbSchema(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path),
    })),
  };
}

function globalSchemas() {
  const person = {
    '@type': 'Person', '@id': `${siteUrl}/#hossein-karimi`, name: 'حسین کریمی',
    url: absolute('/about/'), sameAs: [data.meta.linkedin], jobTitle: 'پژوهشگر و طراح داده‌نما',
  };
  const website = {
    '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: data.meta.title,
    alternateName: 'From Poetry to Data', inLanguage: 'fa-IR',
    description: 'اطلس تعاملی و پژوهشی تحلیل داده‌های شعر فارسی از سده سوم تا پانزدهم هجری.',
    creator: { '@id': `${siteUrl}/#hossein-karimi` }, publisher: { '@id': `${siteUrl}/#hossein-karimi` },
    potentialAction: {
      '@type': 'SearchAction', target: `${siteUrl}/poets/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  const catalog = {
    '@type': 'DataCatalog', '@id': `${siteUrl}/data/#catalog`,
    name: 'فهرست داده‌های از شعر تا داده', url: absolute('/data/'), inLanguage: 'fa-IR',
    description: 'فهرست خروجی‌های توصیفی و تحلیلی پروژه از شعر تا داده در قالب JSON و CSV.',
    creator: { '@id': `${siteUrl}/#hossein-karimi` },
  };
  const dataset = {
    '@type': 'Dataset', '@id': `${siteUrl}/data/#dataset`,
    name: 'پیکره و خروجی‌های تحلیلی از شعر تا داده',
    alternateName: 'From Poetry to Data Persian Poetry Analytics Dataset',
    description: `خروجی‌های توصیفی و تحلیلی ${faNumber(data.overview.texts)} متن، ${faNumber(data.overview.couplets)} بیت و ${faNumber(data.overview.words)} واژه از ${faNumber(data.overview.poets.length)} شاعر فارسی، شامل یازده پژوهش دربارهٔ پرسش‌های عمومی، مضمون، استعاره، پیوند متنی، تشخیص سده، سبک، قالب، جغرافیا، چرخهٔ واژگان، سنجش انتساب و زیبایی‌شناسی محاسباتی.`,
    url: absolute('/data/'), inLanguage: 'fa', isAccessibleForFree: true,
    creator: { '@id': `${siteUrl}/#hossein-karimi` },
    version: PUBLICATION.version,
    datePublished: PUBLICATION.publishedDate,
    dateModified: PUBLICATION.modifiedDate,
    license: absolute('/attributions/'),
    includedInDataCatalog: { '@id': `${siteUrl}/data/#catalog` },
    measurementTechnique: ['مدل موضوعی', 'تحلیل هم‌رخدادی', 'TF–IDF', 'آزمون جایگشتی', 'سبک‌سنجی نویسه‌ای', 'ممیزی انتساب', 'تحلیل جغرافیایی', 'تحلیل چرخه عمر واژه', 'ارزیابی هشت شاخص زیبایی‌شناختی با GPT-5.6-sol'],
    temporalCoverage: '800/2025',
    additionalProperty: [{ '@type': 'PropertyValue', name: 'پوشش تاریخی در گاه‌شماری هجری', value: 'سده سوم تا پانزدهم هجری' }],
    keywords: ['شعر فارسی', 'ادبیات فارسی', 'علوم انسانی دیجیتال', 'پردازش زبان طبیعی فارسی', 'سبک‌سنجی', 'بینامتنیت', 'جغرافیای ادبی', 'نیمه‌عمر واژگان'],
    variableMeasured: ['شاعر', 'سده هجری', 'عنوان کتاب', 'عنوان شعر', 'متن شعر', 'تعداد ابیات', 'تعداد واژه', 'سهم موضوع', 'نرخ استعاره', 'شاخص شباهت متنی', 'ویژگی سبک‌سنجی', 'وضعیت انتساب', 'کانون فعالیت', 'طول مسیر', 'نیمه‌عمر واژه', ...computationalAesthetics.dimensions.map((dimension) => dimension.label), 'امتیاز نهایی زیبایی‌شناختی محاسباتی'],
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/api/atlas-summary.json'), name: 'خلاصه JSON اطلس' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/poets.csv'), name: 'فهرست شاعران و آمار پیکره' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/topics-by-century.csv'), name: 'روند مضامین در سده‌ها' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/geography/poet_geography.csv'), name: 'جغرافیا و مسیر تقریبی شاعران' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/lexical-lifecycle.csv'), name: 'رده‌های چرخه عمر واژگان' },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/api/attribution.json'), name: 'خلاصه پژوهش سنجش انتساب' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/attribution-corpus-audit.csv'), name: 'ممیزی انتساب و کیفیت پیکره' },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/api/public-questions.json'), name: 'ده پرسش عمومی شعر فارسی' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/public-questions-analysis.csv'), name: 'اعداد پرسش‌های عمومی' },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/computational-aesthetics.csv'), name: 'ده بیت منتخب و هشت شاخص زیبایی‌شناختی برای هر شاعر' },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/downloads/computational-aesthetics.json'), name: 'پروفایل‌های ساخت‌یافته زیبایی‌شناسی محاسباتی' },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/downloads/manifest.json'), name: 'نسخه، منشأ و checksum دانلودها' },
    ],
  };
  catalog.dataset = { '@id': `${siteUrl}/data/#dataset` };
  return { person, website, catalog, dataset };
}

function head({ title, description, path: pathname, image = '/og/og-home.png', type = 'website', schemas = [], keywords = [] }) {
  const canonical = absolute(pathname);
  const ogImage = absolute(image);
  const robots = isProduction ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,nofollow';
  const allSchemas = { '@context': 'https://schema.org', '@graph': [...Object.values(globalSchemas()), ...schemas] };
  return `<!doctype html><html lang="fa" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}"><meta name="googlebot" content="${robots}"><meta name="bingbot" content="${robots}">
<meta name="author" content="حسین کریمی"><meta name="creator" content="حسین کریمی"><meta name="publisher" content="حسین کریمی">
${googleVerification ? `<meta name="google-site-verification" content="${escapeHtml(googleVerification)}">` : ""}${bingVerification ? `<meta name="msvalidate.01" content="${escapeHtml(bingVerification)}">` : ""}
<meta name="keywords" content="${escapeHtml(keywords.join('، '))}"><meta name="theme-color" content="#0b3b3a">
<meta name="referrer" content="strict-origin-when-cross-origin"><meta name="format-detection" content="telephone=no">
<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="fa" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="از شعر تا داده" href="${absolute('/feed.xml')}"><link rel="sitemap" type="application/xml" href="${absolute('/sitemap.xml')}">
<meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="از شعر تا داده"><meta property="og:type" content="${type}">
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}"><meta property="og:updated_time" content="${PUBLICATION.modifiedDate}T00:00:00Z"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(title)}">
${type === 'article' ? `<meta property="article:published_time" content="${PUBLICATION.publishedDate}T00:00:00Z"><meta property="article:modified_time" content="${PUBLICATION.modifiedDate}T00:00:00Z"><meta property="article:author" content="${absolute('/about/')}">` : ''}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${ogImage}">
<meta name="DC.title" content="${escapeHtml(title)}"><meta name="DC.creator" content="حسین کریمی"><meta name="DC.language" content="fa"><meta name="DC.type" content="InteractiveResource">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/seo-pages.css">${jsonLd(allSchemas)}</head>`;
}

function pageShell({ title, description, pathname, image, type = 'article', schemas = [], keywords = [], breadcrumbs = [], content, toc = [] }) {
  const crumbHtml = breadcrumbs.map((item, index) => `<li>${index === breadcrumbs.length - 1 ? `<span>${escapeHtml(item.name)}</span>` : `<a href="${item.path}">${escapeHtml(item.name)}</a>`}</li>`).join('');
  return `${head({ title, description, path: pathname, image, type, schemas, keywords })}<body>
<a class="skip-link" href="#main">پرش به محتوای اصلی</a>
<header class="seo-header"><div class="seo-header-inner">${logo}<nav aria-label="فهرست اصلی"><a href="/research/">پژوهش‌ها</a><a href="/themes/">مضامین</a><a href="/metaphors/">استعاره‌ها</a><a href="/centuries/">سده‌ها</a><a href="/poets/">شاعران</a><a href="/data/">داده‌ها</a></nav><a class="interactive-link" href="/atlas/#overview">ورود به اطلس تعاملی</a></div></header>
${breadcrumbs.length ? `<nav class="breadcrumbs" aria-label="مسیر صفحه"><ol>${crumbHtml}</ol></nav>` : ''}
<div class="reading-progress" aria-hidden="true"></div>
<div class="seo-layout${toc.length ? '' : ' seo-layout-wide'}">${toc.length ? `<aside class="seo-toc"><strong>در این صفحه</strong><ol>${toc.map((item) => `<li><a href="#${item.id}">${escapeHtml(item.label)}</a></li>`).join('')}</ol></aside>` : ''}
<main id="main" class="seo-main">${content}</main></div>
<footer class="seo-footer"><div>${logo}<p>تحلیل داده‌های شعر فارسی برای مخاطب عام و پژوهشگر.</p></div><div><strong>کاری از حسین کریمی</strong><a href="${data.meta.linkedin}" target="_blank" rel="me noopener">پروفایل LinkedIn</a><a href="/attributions/">اعتبارها</a></div><small>آخرین تولید خودکار صفحات: ${faDigits(buildDate)} · نتایج محاسباتی جایگزین نقد ادبی و بررسی تاریخی نیستند.</small></footer>
<script src="/seo-pages.js" defer></script></body></html>`;
}

function citationBlock(title, pathname) {
  const citation = buildPersianCitation(title, pathname, siteUrl);
  return `<section id="citation" class="citation-box"><div><span class="kicker">استناد پیشنهادی</span><h2>چگونه به این صفحه استناد کنیم؟</h2></div><blockquote id="citation-text">${escapeHtml(citation)}</blockquote><button type="button" data-copy="#citation-text" aria-describedby="citation-copy-status">کپی استناد</button><p id="citation-copy-status" class="citation-copy-status" role="status" aria-live="polite"></p></section>`;
}

function datasetCitationBlock(title, pathname) {
  const citation = buildPersianCitation(`${title} [مجموعه‌داده]`, pathname, siteUrl);
  return `<section id="dataset-citation" class="citation-box"><div><span class="kicker">استناد به مجموعه‌داده</span><h2>برای استفاده از داده چگونه استناد کنیم؟</h2></div><blockquote id="dataset-citation-text">${escapeHtml(citation)}</blockquote><button type="button" data-copy="#dataset-citation-text" aria-describedby="dataset-citation-copy-status">کپی استناد مجموعه‌داده</button><p id="dataset-citation-copy-status" class="citation-copy-status" role="status" aria-live="polite"></p></section>`;
}

function researchData(id) {
  if (id === 'computational-aesthetics') {
    const poets = [...computationalAesthetics.poets].sort(
      (left, right) => left.century - right.century || left.name.localeCompare(right.name, 'fa'),
    );
    const selectedMean = computationalAesthetics.records.reduce(
      (sum, record) => sum + record.overall_score,
      0,
    ) / computationalAesthetics.records.length;
    const topRecord = [...computationalAesthetics.records].sort(
      (left, right) => right.overall_score - left.overall_score,
    )[0];
    const dimensionLabels = Object.fromEntries(
      computationalAesthetics.dimensions.map((dimension) => [dimension.id, dimension.label]),
    );
    return {
      metrics: [
        ['بیت یا واحد دو‌سطری امتیازدهی‌شده', faNumber(computationalAesthetics.corpus.scoredUniqueUnits, 0)],
        ['شاعر یا پدیدآورنده', faNumber(computationalAesthetics.poets.length, 0)],
        ['انتخاب منتشرشده', faNumber(computationalAesthetics.records.length, 0)],
        ['شاخص ارزیابی مدل', faNumber(computationalAesthetics.dimensions.length, 0)],
      ],
      findings: [
        `میانگین نمرهٔ کل ${faNumber(computationalAesthetics.records.length, 0)} انتخاب درون‌شاعر ${faDigits(selectedMean.toFixed(2))} است؛ این مقدار میانگین گزیده‌هاست، نه میانگین کل پیکره.`,
        `بالاترین نمرهٔ محاسباتی در همین خروجی منتشرشده ${faDigits(topRecord.overall_score)} و متعلق به یک بیت از ${topRecord.poet_display} است؛ این مقایسه فقط خروجی مدل در گزیدهٔ حاضر است و رتبهٔ ادبی شاعر یا بیت محسوب نمی‌شود.`,
        'هر ۶۷ شاعر یا پدیدآورنده دقیقاً ده انتخاب دارد؛ رتبهٔ ۱ تا ۱۰ فقط درون همان شاعر تعریف می‌شود.',
        'هشت شاخص با GPT-5.6-sol ارزیابی شده‌اند و ارزیابی انسانی نیست؛ نمرهٔ کل از ترکیب وزن‌دار خروجی‌های مدل به دست آمده است.',
      ],
      tableHeaders: ['سدهٔ منتسب', 'شاعر', 'میانگین ده انتخاب', 'بیشترین نمره', 'شاخص غالب'],
      tableRows: poets.map((poet) => [
        faNumber(poet.century, 0),
        poet.name,
        faDigits(poet.meanOverall),
        faDigits(poet.maxOverall),
        dimensionLabels[poet.dominantDimension],
      ]),
      method: `GPT-5.6-sol هشت شاخص صفر تا صد را ارزیابی کرده است. نمرهٔ کل با وزن‌های مستند ساخته شده و سپس برای هر شاعر ده واحد سالم دارای بالاترین نمره با کنترل تکرار و تنوع منبع انتخاب شده‌اند. ارزیابی انسانی یا برچسب‌گذاری انسانی انجام نشده است. انتساب مدل بر پایهٔ اعلام مالک پروژه ثبت شده و سابقهٔ اجرای دست‌اول در دسترس نیست.`,
      limit: computationalAesthetics.limitations.join(' '),
    };
  }
  if (id === 'topics') {
    const topics = [...data.topics.items].sort((a, b) => b.overallShare - a.overallShare);
    const rising = [...data.topics.items].filter((x) => x.significantTrend).sort((a, b) => b.rho - a.rho)[0];
    const falling = [...data.topics.items].filter((x) => x.significantTrend).sort((a, b) => a.rho - b.rho)[0];
    return {
      metrics: [
        ['تعداد محور موضوعی', faNumber(data.topics.globalStats.modelTopics)],
        ['نمونه آموزش متوازن', faNumber(data.topics.globalStats.trainingTexts)],
        ['سهم تبیین‌شده سده', faPercent(data.topics.globalStats.rSquared * 100)],
        ['آزمون جایگشتی', `p = ${faDigits(data.topics.globalStats.permutationP)}`],
      ],
      findings: [
        `تفاوت ترکیب موضوعی سده‌ها پس از کنترل حجم شاعران همچنان معنادار است و سده حدود ${faPercent(data.topics.globalStats.rSquared * 100)} از تفاوت میان پروفایل‌های موضوعی شاعران را توضیح می‌دهد.`,
        `قوی‌ترین روند افزایشی در میان روندهای معنادار مربوط به «${rising.name}» است (ρ = ${faDigits(rising.rho)}).`,
        `قوی‌ترین روند کاهشی مربوط به «${falling.name}» است (ρ = ${faDigits(falling.rho)}).`,
        `بزرگ‌ترین گسست‌های ترکیب موضوعی در گذارهای ${data.topics.transitions.slice(0, 3).map((t) => `سده ${faNumber(t.from)} به ${faNumber(t.to)}`).join('، ')} دیده شده‌اند.`,
      ],
      tableHeaders: ['مضمون', 'سهم کلی', 'سده اوج', 'سهم در اوج', 'روند', 'ضریب اسپیرمن'],
      tableRows: topics.map((t) => [t.name, faPercent(t.overallShare), `سده ${faNumber(t.peakCentury)}`, faPercent(t.peakShare), t.direction, faDigits(t.rho)]),
      method: `مدل موضوعی روی ${faNumber(data.topics.globalStats.trainingTexts)} متن آموزش دیده است. از هر شاعر حداکثر ${faNumber(data.topics.globalStats.balancedPerPoet)} متن وارد نمونه آموزش شده و روندهای سده‌ای بر پایه میانگین برابر شاعران محاسبه شده‌اند.`,
      limit: 'موضوع‌های محاسباتی برچسب‌های تفسیری‌اند، نه مقوله‌های قطعی تاریخ ادبیات. برچسب سده نیز به دوره زندگی شاعر اشاره دارد و تاریخ دقیق سرایش را نشان نمی‌دهد.',
    };
  }
  if (id === 'metaphors') {
    const items = [...data.metaphors.items].sort((a, b) => b.rate - a.rate);
    const strongest = [...data.metaphors.transitions].sort((a, b) => b.jsd - a.jsd)[0];
    return {
      metrics: [
        ['خانواده استعاری', faNumber(data.metaphors.items.length)],
        ['جفت شعر–استعاره', faNumber(data.metaphors.globalStats.poemMetaphorPairs)],
        ['تفاوت تراکم تاریخی', `p = ${faDigits(data.metaphors.globalStats.absoluteP)}`],
        ['تفاوت ترکیب نسبی', `p = ${faDigits(data.metaphors.globalStats.relativeCompositionP)}`],
      ],
      findings: [
        'هیچ‌یک از ده خانواده تصویری در کل پیکره کاملاً ناپدید نمی‌شود؛ اصطلاح «مرگ» در این مطالعه به دوره خاموشی یا افت شدید اشاره دارد.',
        `پرتراکم‌ترین خانواده در کل پیکره «${items[0].name}» با نرخ ${faDigits(items[0].rate)} در هر هزار واژه است.`,
        `بزرگ‌ترین رانش ثبت‌شده مربوط به «${strongest.name}» در گذار سده ${faNumber(strongest.from)} به ${faNumber(strongest.to)} است (JSD = ${faDigits(strongest.jsd)}).`,
        `تراکم مطلق استعاره‌ها میان دوره‌های تاریخی معنادار است (p = ${faDigits(data.metaphors.globalStats.absoluteP)})، اما ترکیب نسبی خانواده‌ها ثبات بیشتری دارد.`,
      ],
      tableHeaders: ['خانواده تصویری', 'رخداد', 'درصد شعرها', 'سده اوج پایدار', 'دوره غالب', 'میدان معنایی غالب'],
      tableRows: items.map((m) => [m.name, faNumber(m.occurrences), faPercent(m.poemPercent), `سده ${faNumber(m.stablePeak)}`, m.dominantPeriod, m.semanticField]),
      method: 'برای هر خانواده، مجموعه‌ای از واژه‌های هم‌خانواده تعریف و رخدادها در پنجره‌های واژگانی بررسی شده‌اند. تغییر میدان معنایی با همسایگان واژگانی، واگرایی جنسن–شنون و شبکه NPMI سنجیده شده است.',
      limit: 'هر رخداد واژه الزاماً استعاری نیست. جداسازی کامل معنای حقیقی و مجازی به برچسب‌گذاری انسانی و مدل معنایی دقیق‌تر نیاز دارد.',
    };
  }
  if (id === 'intertextuality') {
    const edges = [...data.intertext.edges].sort((a, b) => b.score - a.score);
    const topInfluencer = data.intertext.influencers[0];
    return {
      metrics: [
        ['عبارت نادر پنج‌واژه‌ای', faNumber(data.intertext.globalStats.rareFiveGrams)],
        ['بودجه واژه هر شاعر', faNumber(data.intertext.globalStats.wordBudgetPerPoet)],
        ['اجتماع ادبی', faNumber(data.intertext.communities.length)],
        ['پایداری شبکه', faPercent(data.intertext.globalStats.stability * 100)],
      ],
      findings: [
        `در لایه شبکه، «${topInfluencer.name}» بالاترین قدرت خروجی گزارش‌شده را دارد؛ این شاخص به معنی رتبه ادبی یا اثبات نفوذ مستقیم نیست.`,
        `قوی‌ترین پیوند ترکیبی میان «${edges[0].source}» و «${edges[0].target}» با امتیاز ${faDigits(edges[0].score)} مشاهده شده است.`,
        `آزمون QAP برای لایه عبارت نادر و شباهت واژگانی p = ${faDigits(data.intertext.qap[0].p)} گزارش می‌کند؛ یعنی رابطه فاصله زمانی و شباهت از الگوی تصادفی متمایز است.`,
        'سه الگو از هم جدا شده‌اند: بازاستفاده متمرکز در یک جفت متن، بازگشت پراکنده به سنت پیشین و شباهت عمومی واژگانی یا موضوعی.',
      ],
      tableHeaders: ['شاعر متقدم', 'شاعر متأخر', 'امتیاز ترکیبی', 'عبارت مشترک', 'شباهت واژگانی', 'نوع شاهد'],
      tableRows: edges.map((e) => [e.source, e.target, faDigits(e.score), faNumber(e.phrases), faDigits(e.lexical), e.evidence]),
      method: `از هر شاعر حداکثر ${faNumber(data.intertext.globalStats.wordBudgetPerPoet)} واژه وارد مقایسه شده است. سه لایه عبارت‌های نادر، شباهت TF–IDF و نزدیکی موضوعی با آزمون‌های QAP و جایگشتی بررسی شده‌اند.`,
      limit: 'شباهت محاسباتی می‌تواند از ژانر مشترک، زبان قالبی، منبع سوم یا انتساب مشترک ناشی شود. جهت زمانی یال، رابطه علّی را ثابت نمی‌کند.',
    };
  }
  if (id === 'century-ai') {
    const rows = data.centuryModel.labels.map((label, index) => [`سده ${faNumber(label)}`, faPercent(data.centuryModel.recall[index] * 100)]);
    return {
      metrics: [
        ['سده‌های هدف', faNumber(data.centuryModel.labels.length)],
        ['خط مبنای یکنواخت', faPercent(data.centuryModel.baselines.uniform * 100)],
        ['خط مبنای پرتکرار', faPercent(data.centuryModel.baselines.majority * 100)],
        ['میانگین بازیابی مقایسه‌ای', faPercent(data.centuryModel.benchmark.meanRecall * 100)],
      ],
      findings: [
        'پاسخ علمی «بله، اما با احتیاط» است: زبان شعر نشانه‌های زمانی دارد، ولی شاعر، کتاب و ژانر می‌توانند به مدل سرنخ هویتی بدهند.',
        'تقسیم تصادفی شعرها ارزیابی آسان و مستعد نشتی است؛ Leave-One-Poet-Out سخت‌گیرانه‌ترین طرح برای سنجش تعمیم تاریخی است.',
        `در ماتریس مقایسه‌ای، میانگین بازیابی سده‌ها ${faPercent(data.centuryModel.benchmark.meanRecall * 100)} است؛ این عدد اجرای مستقیم روی همین فایل با حذف کامل شاعر نیست.`,
        'خطای یک سده‌ای باید جداگانه گزارش شود، زیرا تغییر زبان ادبی پیوسته است و پیش‌بینی سده مجاور با خطای دور تفاوت دارد.',
      ],
      tableHeaders: ['سده', 'بازیابی در مطالعه مقایسه‌ای'],
      tableRows: rows,
      method: 'پروتکل پیشنهادی شامل مدل‌های واژه‌ای، نویسه‌ای، سبک‌سنجی و مدل زبانی، همراه با Macro-F1، Balanced Accuracy، MAE سده‌ای و Accuracy±1 است. بازنمونه‌گیری باید در سطح شاعر انجام شود.',
      limit: data.centuryModel.benchmark.validation,
    };
  }
  if (id === 'forms') {
    return {
      metrics: [
        ['متن دارای برچسب قالب', faNumber(formResearch.corpus.labeledTexts)],
        ['پوشش کل پیکره', faPercent(formResearch.corpus.shareOfCorpus)],
        ['تفاوت معنایی توضیح‌داده‌شده', faPercent(formResearch.semantic.rSquared * 100)],
        ['دقت تشخیص قالب', faPercent(formResearch.classifier.accuracy)],
      ],
      findings: [
        `قالب اثر بسیار بزرگی بر طول متن دارد (η² = ${faDigits(formResearch.structuralEffects[0].effect)})؛ میانه رباعی ${faNumber(formResearch.formats[2].medianWords)} واژه و میانه قصیده ${faNumber(formResearch.formats[1].medianWords)} واژه است.`,
        `الگوی قافیه نیز یکی از روشن‌ترین جداکننده‌هاست (η² = ${faDigits(formResearch.structuralEffects[1].effect)}): رباعی و قصیده عمدتاً یک‌قافیه‌اند، درحالی‌که مثنوی برای هر بیت قافیه مستقل می‌سازد.`,
        `در فضای معنایی، قالب ${faPercent(formResearch.semantic.rSquared * 100)} از تفاوت نمونه را توضیح می‌دهد (PERMANOVA: pseudo-F = ${faDigits(formResearch.semantic.pseudoF)}، p = ${faDigits(formResearch.semantic.p)}).`,
        `مدل نویسه‌ای با حذف کامل شاعر آزمون به دقت ${faPercent(formResearch.classifier.accuracy)} رسید؛ رباعی با بازیابی ${faPercent(formResearch.formats[2].recall)} روشن‌ترین و مثنوی با ${faPercent(formResearch.formats[3].recall)} دشوارترین قالب برای مدل بود.`,
        `قاعده ساختاری مثنوی با دقت ${faPercent(formResearch.masnaviSensitivity.precision)}، ${faNumber(formResearch.masnaviSensitivity.likelyUnlabeled)} متن احتمالاً بی‌برچسب را پیدا کرد؛ این بخش فقط تحلیل حساسیت است و در آزمون‌های اصلی جای برچسب صریح را نمی‌گیرد.`,
      ],
      tableHeaders: ['قالب', 'متن', 'شاعر', 'میانه واژه', 'میانه بیت', 'سده تحت پوشش', 'بازیابی مدل'],
      tableRows: formResearch.formats.map((item) => [
        item.name,
        faNumber(item.texts),
        faNumber(item.poets),
        faNumber(item.medianWords),
        faNumber(item.medianCouplets),
        faNumber(item.centuries),
        faPercent(item.recall),
      ]),
      method: `${formResearch.classifier.model} روی ${faNumber(formResearch.classifier.balancedTexts)} متن متوازن ارزیابی شد. ${formResearch.classifier.evaluation} از شناخت شاعر به‌جای قالب جلوگیری می‌کند. تفاوت معنایی با PERMANOVA و تفاوت‌های ساختاری با اندازه اثر گزارش شده‌اند.`,
      limit: formResearch.limitations.join(' '),
    };
  }
  if (id === 'geography') {
    return {
      metrics: [
        ['شاعر در لایه جغرافیا', faNumber(geographyResearch.corpus.poets)],
        ['شاعر جابه‌جا', `${faNumber(geographyResearch.mobility.mobilePoets)} (${faPercent(geographyResearch.mobility.mobileRate * 100)})`],
        ['کانون فعالیت', faNumber(geographyResearch.corpus.centerCities)],
        ['میانه طول مسیر', `${faNumber(geographyResearch.mobility.medianRouteKm)} کیلومتر`],
      ],
      findings: [
        `${faNumber(geographyResearch.mobility.mobilePoets)} شاعر از ${faNumber(geographyResearch.corpus.poets)} شاعر پیکره، یعنی ${faPercent(geographyResearch.mobility.mobileRate * 100)}، در تعریف عملیاتی پژوهش جابه‌جا محسوب می‌شوند.`,
        `نرخ جابه‌جایی از ${faPercent(geographyResearch.periods[3].mobileRate * 100)} در دوره معاصر تا ${faPercent(geographyResearch.periods[2].mobileRate * 100)} در دوره متأخر کلاسیک تغییر می‌کند و آزمون تفاوت دوره‌ها معنادار است (p = ${faDigits(geographyResearch.tests.periodMobilityKruskal.p)}).`,
        `بلندترین مسیر ثبت‌شده به ${geographyResearch.mobility.maxRoutePoet} تعلق دارد: حدود ${faNumber(geographyResearch.mobility.maxRouteKm, 0)} کیلومتر در مسیر چندایستگاهی تقریبی.`,
        `منطقه فقط ${faPercent(geographyResearch.tests.regionalStyle.rSquared * 100)} از تفاوت پروفایل سبک را توضیح داد و نتیجه معنادار نبود (p = ${faDigits(geographyResearch.tests.regionalStyle.p)}).`,
        `${geographyResearch.intertextGeography.interpretation} آزمون فاصله p = ${faDigits(geographyResearch.intertextGeography.distancePermutationP)} بود.`,
      ],
      tableHeaders: ['منطقه کانون فعالیت', 'شاعر', 'متن', 'واژه', 'میانه مسیر', 'نرخ جابه‌جایی'],
      tableRows: geographyResearch.regions.map((item) => [
        item.name,
        faNumber(item.poets),
        faNumber(item.poems),
        faNumber(item.words),
        `${faNumber(item.medianRouteKm, 0)} کیلومتر`,
        faPercent(item.mobileRate * 100),
      ]),
      method: `برای ${faNumber(geographyResearch.corpus.poets)} شاعر، خاستگاه، کانون فعالیت، منطقه فرهنگی‌ـ‌تاریخی، مختصات تقریبی و مسیرهای منتخب ثبت شده است. تفاوت چهار دوره با آزمون‌های ناپارامتری و رابطه جغرافیا با سبک و شبکه با آزمون‌های جایگشتی سنجیده شده است.`,
      limit: geographyResearch.caveats.join(' '),
    };
  }
  if (id === 'lexical-life') {
    return {
      metrics: [
        ['واژه مدل چرخه عمر', faNumber(lexicalResearch.corpus.lifecycleWords)],
        ['افت تا نصف اوج مشاهده‌شده', faNumber(lexicalResearch.halfLife.observedWords)],
        ['میانه نیمه‌عمر', `${faNumber(lexicalResearch.halfLife.medianCenturies, 2)} سده`],
        ['سانسور راست', `${faNumber(lexicalResearch.halfLife.censoredWords)} (${faPercent(lexicalResearch.halfLife.censoredShare * 100)})`],
      ],
      findings: [
        `در ${faNumber(lexicalResearch.halfLife.observedWords)} واژه‌ای که افت تا نصف اوج مشاهده شد، میانه نیمه‌عمر ${faNumber(lexicalResearch.halfLife.medianCenturies, 2)} سده و فاصله چارکی ${faNumber(lexicalResearch.halfLife.q1Centuries, 2)} تا ${faNumber(lexicalResearch.halfLife.q3Centuries, 2)} سده بود.`,
        `${faNumber(lexicalResearch.halfLife.censoredWords)} واژه، معادل ${faPercent(lexicalResearch.halfLife.censoredShare * 100)}، تا پایان سده پانزدهم به نصف اوج نرسیدند و سانسور راست محسوب شدند.`,
        `بزرگ‌ترین رده «پایدار» با ${faNumber(lexicalResearch.categories[0].count)} واژه (${faPercent(lexicalResearch.categories[0].share * 100)}) است؛ رده «روبه‌افول» ${faNumber(lexicalResearch.categories[1].count)} واژه دارد.`,
        `تغییر واژگانی میان سده‌های مجاور از ترتیب تصادفی متمایز بود: فاصله کسینوسی ${faDigits(lexicalResearch.tests.adjacentCenturyCosineDistance)}، ${faNumber(lexicalResearch.tests.orderingPermutations)} جایگشت و p < ۰٫۰۰۱.`,
        `فراوانی کل با نیمه‌عمر رابطه مثبت داشت (ρ = ${faDigits(lexicalResearch.tests.frequencyHalfLifeRho)}، p < ۰٫۰۰۱)، اما این رابطه کامل نیست.`,
      ],
      tableHeaders: ['رده چرخه عمر', 'تعداد واژه', 'سهم', 'میانه دامنه فعالیت', 'میانه نیمه‌عمر'],
      tableRows: lexicalResearch.categories.map((item) => [
        item.name,
        faNumber(item.count),
        faPercent(item.share * 100),
        `${faNumber(item.medianSpan)} سده`,
        `${faNumber(item.medianHalfLife, 2)} سده`,
      ]),
      method: `${lexicalResearch.method.rate}. ${lexicalResearch.method.halfLifeDefinition}. ${lexicalResearch.method.rightCensoring}`,
      limit: lexicalResearch.caveats.join(' '),
    };
  }
  if (id === 'attribution') {
    const khayyam = attributionResearch.cases.find((item) => item.id === 'khayyam');
    const hafez = attributionResearch.cases.find((item) => item.id === 'hafez');
    const systemic = attributionResearch.cases.find((item) => item.id === 'systemic');
    return {
      metrics: [
        ['رکورد پیکره', faNumber(attributionResearch.generatedFrom.rows)],
        ['رکورد خیام', faNumber(khayyam.metrics[0].value)],
        ['اشعار منتسب حافظ', faNumber(hafez.metrics[2].value)],
        ['سده پوشش‌داده‌شده', faNumber(systemic.metrics[0].value)],
      ],
      findings: [...khayyam.findings, ...hafez.findings.slice(0, 2), ...systemic.findings.slice(0, 2)],
      tableHeaders: ['پرونده', 'شاخص', 'مقدار', 'توضیح'],
      tableRows: attributionResearch.cases.flatMap((item) => item.metrics.map((metric) => [item.name, metric.label, faNumber(metric.value), metric.detail])),
      method: 'تحلیل از فایل پنج‌ستونه پیکره ساخته می‌شود. ابتدا نثر، تکرار و واحدهای ناکافی ممیزی می‌شوند؛ سپس هم‌پوشانی مجموعه‌های خیام، فاصله سبک اشعار منتسب حافظ و نرخ شاعرمتوازن مفهوم‌ها در سده‌ها محاسبه می‌شود.',
      limit: 'این خروجی ابزار غربالگری و اولویت‌بندی است. TSV فعلی شناسه نسخه، تاریخ شاهد، تبار نسخه‌ها و اختلاف قرائت را ندارد؛ بنابراین نتیجه نباید حکم قطعی اصالت یا اثر تاریخی خوانده شود.',
    };
  }
  if (id === 'public-questions') {
    return {
      metrics: [
        ['پرسش تحلیل‌شده', faNumber(publicQuestionsResearch.questions.length)],
        ['رکورد پالایش‌شده', faNumber(publicQuestionsResearch.generatedFrom.usableRows)],
        ['واژه در تحلیل', faNumber(publicQuestionsResearch.generatedFrom.words)],
        ['رکورد توضیحی حذف‌شده', faNumber(publicQuestionsResearch.generatedFrom.excludedEditorialRows)],
      ],
      findings: publicQuestionsResearch.questions.map((question) => `${question.title} ${question.answer}`),
      tableHeaders: ['پرسش', 'پاسخ کوتاه', 'روش', 'محدودیت اصلی'],
      tableRows: publicQuestionsResearch.questions.map((question) => [question.shortTitle, question.answer, question.method, question.caveat]),
      method: 'برای هر پرسش یک فرهنگ واژگانی کوچک و آشکار تعریف شده است. شمارها پس از نرمال‌سازی نویسه‌ها محاسبه شده‌اند؛ روندهای تاریخی ابتدا در سطح شاعر و سپس با وزن برابر در سطح سده میانگین شده‌اند. رتبه‌بندی شاعران فقط افراد دارای دست‌کم ۲۰ هزار واژه را وارد می‌کند.',
      limit: 'این پاسخ‌ها اکتشافی‌اند. چندمعنایی، استعاره، تفاوت ژانر، ضمیر پنهان و ناهمگونی بقای متون می‌تواند تفسیر را تغییر دهد. نتیجه‌ها نقطه شروع خوانش نزدیک‌اند، نه داوری نهایی دربارهٔ شعر فارسی.',
    };
  }
  const m = data.stylometry.metrics;
  return {
    metrics: [
      ['شاعر واجد شرایط', faNumber(m.eligible_poets)],
      ['نمونه طبقه‌بندی', faNumber(m.classification_n)],
      ['دقت مدل', faPercent(m.accuracy * 100)],
      ['آزمون جایگشتی', `p < ${faDigits('0.005')}`],
    ],
    findings: [
      `مدل نویسه‌ای در آزمون متوازن ${faNumber(m.eligible_poets)} شاعر به دقت ${faPercent(m.accuracy * 100)} رسید، در برابر خط مبنای ${faPercent(m.majority * 100)}.`,
      `آزمون جایگشتی نشان می‌دهد این عملکرد از شانس متمایز است (p = ${faDigits(m.classifier_perm_p)}).`,
      `خوشه‌بندی صرفاً بر اساس سده معنادار نبود (p = ${faDigits(m.silhouette_perm_p)})؛ بنابراین امضای فردی شاعر از مرزبندی زمانی قوی‌تر دیده می‌شود.`,
      `در فهرست بازبینی، ${faNumber(data.stylometry.anomalies.length)} نمونه با علت‌هایی مانند کوتاهی، بلندی، نشانه‌گذاری یا فاصله واژگانی گزارش شده‌اند.`,
    ],
    tableHeaders: ['شاعر', 'اثر', 'کتاب', 'تعداد واژه', 'علت', 'نمره مقاوم'],
    tableRows: data.stylometry.anomalies.map((a) => [a.poet, a.title, a.book, faNumber(a.words), a.reason, faDigits(a.robustZ)]),
    method: 'اثر انگشت از الگوهای نویسه‌ای و واژگانی ساخته و طبقه‌بندی روی نمونه متوازن انجام شده است. دورافتادگی هر شعر نسبت به مرکز همان شاعر با معیار مقاوم محاسبه می‌شود.',
    limit: 'فاصله آماری حکم انتساب نیست. متن‌های بسیار کوتاه یا بلند، تفاوت ژانر، نسخه و آلودگی داده باید پیش از نتیجه‌گیری ادبی بررسی شوند.',
  };
}

function renderMetrics(metrics) {
  return `<div class="metric-grid">${metrics.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`;
}
function renderTable(headers, rows, limit = 60) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, limit).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderComputationalAestheticsProfile(profile) {
  const dimensions = computationalAesthetics.dimensions.map((dimension) => ({
    ...dimension,
    value: profile.dimensionMeans[dimension.id],
  }));
  const dimensionChartLabel = dimensions
    .map((dimension) => `${dimension.label} ${faNumber(dimension.value, 1)} از صد`)
    .join('، ');
  const dominantDimension = dimensions.find(
    (dimension) => dimension.id === profile.dominantDimension,
  );
  const dimensionChart = `<div class="aesthetic-chart" role="img" aria-label="میانگین هشت شاخص برای ${escapeHtml(profile.name)}: ${escapeHtml(dimensionChartLabel)}"><ol>${dimensions.map((dimension) => `<li data-aesthetic-dimension="chart:${dimension.id}" data-aesthetic-value="${dimension.value}"><span>${escapeHtml(dimension.label)}</span><i aria-hidden="true"><b style="--score:${dimension.value}"></b></i><strong>${faNumber(dimension.value, 1)}</strong></li>`).join('')}</ol></div>`;
  const dimensionTable = `<div class="table-wrap aesthetic-dimension-table"><table><caption>معادل جدولی نمودار هشت شاخص زیبایی‌شناختی ${escapeHtml(profile.name)}</caption><thead><tr><th scope="col">شاخص</th><th scope="col">وزن در امتیاز نهایی</th><th scope="col">میانگین از ۱۰۰</th></tr></thead><tbody>${dimensions.map((dimension) => `<tr data-aesthetic-dimension="table:${dimension.id}" data-aesthetic-value="${dimension.value}"><th scope="row">${escapeHtml(dimension.label)}</th><td>${faPercent(dimension.weight * 100, 0)}</td><td>${faNumber(dimension.value, 1)}</td></tr>`).join('')}</tbody></table></div>`;
  const couplets = [...profile.records]
    .sort((left, right) => left.poet_rank - right.poet_rank)
    .map((record) => `<article class="aesthetic-couplet" data-aesthetic-couplet="${record.id}">
      <header><span>رتبه ${faNumber(record.poet_rank)} در میان بیت‌های منتخب شاعر</span><strong>${faNumber(record.overall_score, 2)} از ۱۰۰</strong></header>
      <blockquote><span>${escapeHtml(record.hemistich1)}</span><span>${escapeHtml(record.hemistich2)}</span></blockquote>
      <p>${escapeHtml(record.book_title)} · ${escapeHtml(record.poem_title)}</p>
      <details><summary>مشاهده امتیاز هشت شاخص</summary><dl>${computationalAesthetics.dimensions.map((dimension) => `<div><dt>${escapeHtml(dimension.label)}</dt><dd>${faNumber(record[dimension.field], 2)}</dd></div>`).join('')}</dl></details>
    </article>`)
    .join('');

  return `<section id="computational-aesthetics" class="aesthetic-profile">
    <span class="kicker">پژوهش زیبایی‌شناسی محاسباتی</span>
    <h2>ده بیت با بالاترین امتیاز زیبایی‌شناختی محاسباتی</h2>
    <p>برای ${escapeHtml(profile.name)}، هر هشت شاخص و امتیاز نهایی با مدل <strong>GPT-5.6-sol</strong> ارزیابی شده‌اند؛ این ارزیابی انسانی نیست. امتیاز نهایی میانگین وزنی نمادپردازی، تصویرسازی، زبان مجازی، موسیقی، فشردگی معنا، عمق عاطفی، ساختار و تازگی بیان است.</p>
    <p class="local-qualification"><strong>مرز ادعا:</strong> این امتیازها خروجی یک ارزیابی محاسباتی‌اند و جایگزین خوانش ادبی، داوری منتقد یا اجماع پژوهشی نیستند. انتخاب «ده بیت» رتبه‌بندی درون داده‌های همین شاعر است و رتبه‌بندی شاعران محسوب نمی‌شود.</p>
    ${renderMetrics([
      ['میانگین ده بیت', faNumber(profile.meanOverall, 2)],
      ['بیشترین امتیاز', faNumber(profile.maxOverall, 2)],
      ['قوی‌ترین میانگین شاخص', dominantDimension?.label || '—'],
      ['تعداد شاخص‌ها', faNumber(dimensions.length)],
    ])}
    <div class="aesthetic-evidence-grid"><div><h3>پروفایل هشت شاخص</h3>${dimensionChart}</div><div><h3>همان داده به‌شکل جدول</h3>${dimensionTable}</div></div>
    <div class="aesthetic-couplets">${couplets}</div>
    <div class="hero-actions aesthetic-actions"><a class="primary" href="/research/computational-aesthetics/">روش، یافته‌ها و محدودیت‌ها</a><a href="/downloads/computational-aesthetics.csv" download>دانلود CSV نتایج</a><a href="/downloads/computational-aesthetics.json" download>دانلود JSON نتایج</a><a href="/api/computational-aesthetics.json">مشاهده API</a></div>
  </section>`;
}
function renderComputationalAestheticsExplorer() {
  const metricOptions = [
    ['overall', 'امتیاز نهایی'],
    ['symbolism', 'نمادپردازی'],
    ['imagery', 'تصویرسازی'],
    ['figurative', 'زبان مجازی'],
    ['music', 'موسیقی'],
    ['compression', 'فشردگی معنا'],
    ['emotion', 'عمق عاطفی'],
    ['structure', 'ساختار'],
    ['novelty', 'تازگی بیان'],
  ];
  const dimensionLabels = Object.fromEntries(
    computationalAesthetics.dimensions.map((dimension) => [dimension.id, dimension.label]),
  );
  const poets = [...computationalAesthetics.poets].sort(
    (left, right) => left.century - right.century || left.name.localeCompare(right.name, 'fa'),
  );
  const centuries = [...new Set(poets.map((poet) => poet.century))].sort((a, b) => a - b);
  const rows = poets.map((poet) => `<tr
      data-aesthetic-poet="${escapeHtml(poet.name)}"
      data-century="${poet.century}"
      data-overall="${poet.meanOverall}"
      data-symbolism="${poet.dimensionMeans.symbolism}"
      data-imagery="${poet.dimensionMeans.imagery}"
      data-figurative="${poet.dimensionMeans['figurative-language']}"
      data-music="${poet.dimensionMeans.music}"
      data-compression="${poet.dimensionMeans['semantic-compression']}"
      data-emotion="${poet.dimensionMeans.emotion}"
      data-structure="${poet.dimensionMeans.structure}"
      data-novelty="${poet.dimensionMeans.novelty}">
      <th scope="row"><a href="/poets/${poet.slug}/">${escapeHtml(poet.name)}</a></th>
      <td>${faNumber(poet.century, 0)}</td>
      <td data-aesthetic-score>${faNumber(poet.meanOverall, 2)}</td>
      <td>${faNumber(poet.maxOverall, 2)}</td>
      <td>${escapeHtml(dimensionLabels[poet.dominantDimension])}</td>
    </tr>`).join('');

  return `<section id="data" class="aesthetic-explorer">
    <span class="kicker">کاوش ۶۷ پروفایل شاعر</span>
    <h2>جست‌وجو، مقایسه و پیوند قابل اشتراک</h2>
    <p>ترتیب پیش‌فرض بر پایهٔ سدهٔ منتسب و نام شاعر است. مرتب‌سازی امتیازی صرفاً برای کاوش خروجی مدل است و جدول رتبه‌بندی ارزش ادبی شاعران نیست.</p>
    <form method="get" action="/research/computational-aesthetics/" data-aesthetic-explorer>
      <label>جست‌وجوی شاعر<input type="search" name="q" autocomplete="off" placeholder="مثلاً حافظ"></label>
      <label>سدهٔ منتسب<select name="century"><option value="">همهٔ سده‌ها</option>${centuries.map((century) => `<option value="${century}">سده ${faNumber(century, 0)}</option>`).join('')}</select></label>
      <label>شاخص نمایشی<select name="metric">${metricOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
      <label>ترتیب<select name="sort"><option value="century-name">سده و نام</option><option value="score-desc">امتیاز شاخص، نزولی</option></select></label>
      <button type="button" data-aesthetic-reset>پاک‌کردن فیلترها</button>
    </form>
    <p data-aesthetic-status role="status" aria-live="polite">${faNumber(poets.length, 0)} نتیجه نمایش داده می‌شود.</p>
    <p class="notice" data-aesthetic-url-notice role="status" aria-live="polite" hidden></p>
    <p data-aesthetic-loading role="status" aria-live="polite" aria-busy="false" hidden>در حال به‌روزرسانی نمای پژوهش زیبایی‌شناسی محاسباتی…</p>
    <div class="warning" data-aesthetic-error role="alert" hidden><strong>نمایش تعاملی کامل نشد.</strong><p>جدول ایستا همچنان در دسترس است؛ دوباره تلاش کنید یا داده‌ها را مستقیم دریافت کنید.</p><div class="hero-actions"><button type="button" data-aesthetic-retry>تلاش دوباره</button><a href="/downloads/computational-aesthetics.csv">دریافت جدول ایستا</a></div></div>
    <p class="notice" data-aesthetic-empty hidden>برای این ترکیب فیلتر نتیجه‌ای پیدا نشد. فیلترها را پاک کنید یا نام دیگری بنویسید.</p>
    <noscript><p class="notice">جاوااسکریپت خاموش است؛ جدول کامل هر ۶۷ شاعر همچنان در ادامه در دسترس است، اما فیلتر تعاملی اجرا نمی‌شود.</p></noscript>
    <div class="table-wrap"><table>
      <caption>خلاصهٔ محاسباتی ده بیت منتخب هر شاعر؛ ستون «امتیاز شاخص» با انتخاب فیلتر تغییر می‌کند.</caption>
      <thead><tr><th scope="col">شاعر</th><th scope="col">سده</th><th scope="col">امتیاز شاخص</th><th scope="col">بیشترین امتیاز نهایی</th><th scope="col">شاخص غالب</th></tr></thead>
      <tbody data-aesthetic-results>${rows}</tbody>
    </table></div>
  </section>`;
}
function relatedResearch(currentId) {
  return `<section class="related"><span class="kicker">مطالعه بیشتر</span><h2>پژوهش‌های مرتبط</h2><div class="related-grid">${researchPages.filter((p) => p.id !== currentId).slice(0, 3).map((p) => `<a href="${p.path}" style="--accent:${p.color}"><small>${p.eyebrow}</small><strong>${p.shortTitle}</strong><p>${p.description}</p></a>`).join('')}</div></section>`;
}

const researchReuse = Object.freeze({
  'computational-aesthetics': { download: '/downloads/computational-aesthetics.csv', entity: '/poets/hafez/', entityLabel: 'نمونه پروفایل زیبایی‌شناختی: حافظ' },
  topics: { download: '/downloads/topics-by-century.csv', entity: '/themes/ethics-wisdom/', entityLabel: 'نمونه موجودیت: اخلاق، حکمت و خرد' },
  metaphors: { download: '/downloads/metaphors-by-century.csv', entity: '/metaphors/journey-road-destination/', entityLabel: 'نمونه موجودیت: راه، سفر و منزل' },
  intertextuality: { download: '/downloads/intertext-edges.csv', entity: '/poets/hafez/', entityLabel: 'نمونه موجودیت شبکه: حافظ' },
  'century-ai': { download: '/downloads/century-model-recall.csv', entity: '/centuries/8/', entityLabel: 'نمونه موجودیت: سدهٔ ۸ منتسب' },
  stylometry: { download: '/downloads/stylometry-anomalies.csv', entity: '/poets/hafez/', entityLabel: 'نمونه پروندهٔ شاعر: حافظ' },
  forms: { download: '/downloads/forms-comparison.csv', entity: '/poets/rumi/', entityLabel: 'نمونه شاعر چندقالبی: مولوی' },
  geography: { download: '/downloads/geography/poet_geography.csv', entity: '/poets/rumi/', entityLabel: 'نمونه پروندهٔ جغرافیایی: مولوی' },
  'lexical-life': { download: '/downloads/lexical-lifecycle.csv', entity: '/centuries/14/', entityLabel: 'نمونه موجودیت: سدهٔ ۱۴ منتسب' },
  attribution: { download: '/downloads/attribution-corpus-audit.csv', entity: '/poets/hafez/', entityLabel: 'نمونه پروندهٔ بازبینی: حافظ' },
  'public-questions': { download: '/downloads/public-questions-analysis.csv', entity: '/themes/night-time-life/', entityLabel: 'نمونه مضمون پرسش‌ها: شب، زمان و زندگی' },
});

function publishedResearchEvidence(page) {
  const values = researchData(page.id);
  const reuse = researchReuse[page.id];
  return createPublishedEvidence({
    id: `research:${page.id}`,
    label: page.title,
    definition: page.description,
    unit: 'مطابق برچسب هر سنجه و ستون جدول',
    denominator: 'مطابق روش و واحد تحلیل اعلام‌شده در همین صفحه',
    precision: 4,
    source: {
      dataset: reuse.download,
      publicationVersion: PUBLICATION.version,
    },
    qualification: page.qualification,
    values,
  });
}

function generateResearchPages() {
  const missingQualification = researchPages.find((page) => !page.qualification);
  if (missingQualification) throw new Error(`Missing research qualification: ${missingQualification.id}`);
  const researchIndexItems = researchPages.map((p) => `<article class="research-index-card" style="--accent:${p.color}"><span>${p.eyebrow}</span><h2><a href="${p.path}">${p.title}</a></h2><p>${p.answer}</p><p class="local-qualification"><strong>مرز ادعا:</strong> ${p.qualification}</p><small>شاهد محاسباتی · جدول داده · روش و عدم‌قطعیت</small><div class="inline-actions"><a class="text-link" href="${p.path}">مشاهده یافته‌ها و جدول‌ها ←</a><a href="/methodology/">روش</a><a href="/data/">داده</a></div></article>`).join('');
  const indexSchema = {
    '@type': 'CollectionPage', '@id': `${siteUrl}/research/#page`, name: 'پژوهش‌های از شعر تا داده', url: absolute('/research/'),
    isPartOf: { '@id': `${siteUrl}/#website` }, hasPart: researchPages.map((p) => ({ '@type': 'Article', headline: p.title, url: absolute(p.path) })),
  };
  write('research/index.html', pageShell({
    title: 'پژوهش‌های تحلیل داده شعر فارسی | از شعر تا داده',
    description: 'یازده مطالعهٔ کامل دربارهٔ پرسش‌های عمومی، مضامین، استعاره‌ها، پیوندهای متنی، تشخیص سده، سبک، قالب، جغرافیای شعر، چرخهٔ واژگان، سنجش انتساب و زیبایی‌شناسی محاسباتی.',
    pathname: '/research/', image: '/og/og-research.png', type: 'website', schemas: [indexSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'پژوهش‌ها', path: '/research/' }])],
    keywords: ['تحلیل داده شعر فارسی', 'علوم انسانی دیجیتال', 'پردازش زبان طبیعی فارسی'],
    breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'پژوهش‌ها', path: '/research/' }],
    content: `<header class="article-hero"><span class="kicker">مرکز پژوهش</span><h1>یازده راه برای دیدن تاریخ شعر فارسی با داده</h1><p>هر صفحه با یک پاسخ روشن آغاز می‌شود، سپس شواهد کمی، روش، جدول داده و محدودیت‌های تفسیر را ارائه می‌کند.</p><div class="hero-actions"><a class="primary" href="/atlas/#topics">مشاهده نمودارهای تعاملی</a><a href="/methodology/">روش‌شناسی مشترک</a></div></header><section class="research-index-grid">${researchIndexItems}</section>`,
  }));

  for (const page of researchPages) {
    const evidence = publishedResearchEvidence(page);
    const r = evidence.values;
    const reuse = researchReuse[page.id];
    const pageImage = page.image || `/og/og-${page.id}.png`;
    const studyDataset = page.id === 'computational-aesthetics' ? {
      '@type': 'Dataset', '@id': `${siteUrl}${page.path}#dataset`, name: 'دادهٔ پژوهش زیبایی‌شناسی محاسباتی شعر فارسی',
      description: page.description, url: absolute(page.path), inLanguage: 'fa', isAccessibleForFree: true,
      creator: { '@id': `${siteUrl}/#hossein-karimi` }, version: PUBLICATION.version,
      datePublished: PUBLICATION.publishedDate, dateModified: PUBLICATION.modifiedDate,
      license: absolute('/attributions/'), temporalCoverage: 'سده سوم تا پانزدهم هجری',
      measurementTechnique: ['ارزیابی هشت شاخص و امتیاز نهایی با GPT-5.6-sol', 'انتخاب ده واحد دارای بالاترین امتیاز درون هر شاعر'],
      variableMeasured: computationalAesthetics.dimensions.map((dimension) => dimension.label),
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'نوع ارزیابی', value: 'ارزیابی ماشینی؛ ارزیابی انسانی نیست' },
        { '@type': 'PropertyValue', name: 'تعداد رکورد منتشرشده', value: computationalAesthetics.records.length },
        { '@type': 'PropertyValue', name: 'تعداد شاعر یا پدیدآورنده', value: computationalAesthetics.poets.length },
      ],
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/downloads/computational-aesthetics.csv'), contentSize: `${Buffer.byteLength(computationalAestheticsCsvText())} bytes`, name: 'نتایج ردیفی CSV' },
        { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/downloads/computational-aesthetics.json'), contentSize: `${Buffer.byteLength(computationalAestheticsJsonText())} bytes`, name: 'نتایج و پروفایل‌های JSON' },
      ],
    } : null;
    const schema = {
      '@type': 'Article', '@id': `${siteUrl}${page.path}#article`, headline: page.title, description: page.description,
      url: absolute(page.path), image: absolute(pageImage), inLanguage: 'fa-IR', datePublished: PUBLICATION.publishedDate, dateModified: PUBLICATION.modifiedDate,
      version: PUBLICATION.version, abstract: page.description,
      author: { '@id': `${siteUrl}/#hossein-karimi` }, publisher: { '@id': `${siteUrl}/#hossein-karimi` },
      isPartOf: { '@id': `${siteUrl}/#website` }, about: page.keywords,
      mainEntityOfPage: absolute(page.path),
      citation: [absolute('/methodology/'), absolute('/data/')],
      ...(studyDataset ? { mainEntity: { '@id': studyDataset['@id'] } } : {}),
    };
    const dataSection = page.id === 'computational-aesthetics'
      ? renderComputationalAestheticsExplorer()
      : `<section id="data"><span class="kicker">جدول داده</span><h2>خلاصه عددی قابل جست‌وجو</h2><p>جدول زیر همان اعداد اصلی نمودارها را به‌صورت متنی و قابل خواندن برای موتورهای جست‌وجو، ابزارهای کمکی و پژوهشگران ارائه می‌کند.</p>${renderTable(r.tableHeaders, r.tableRows)}</section>`;
    const jsonReuse = page.id === 'computational-aesthetics'
      ? '/downloads/computational-aesthetics.json'
      : '/api/research-findings.json';
    const interactiveHref = page.id === 'computational-aesthetics'
      ? '#data'
      : `/atlas/#${page.anchor}`;
    const interactiveLabel = page.id === 'computational-aesthetics'
      ? 'کاوش پروفایل‌های شاعر'
      : 'بازکردن نمودار تعاملی';
    const audienceSection = page.id === 'computational-aesthetics'
      ? `<section id="audiences"><span class="kicker">مسیرهای خواندن</span><h2>از کدام مسیر وارد این پژوهش شوید؟</h2><div class="related-grid">${audiencePaths.map((audience, index) => {
        const destinations = [
          '/poets/hafez/#computational-aesthetics', '#interpretation', '#method', '#downloads',
        ];
        return `<article><h3>${escapeHtml(audience.title)}</h3><p>${escapeHtml(audience.description)}</p><a href="${destinations[index]}">ورود به مسیر پیشنهادی ←</a></article>`;
      }).join('')}</div></section>`
      : '';
    const datasetCitation = page.id === 'computational-aesthetics'
      ? datasetCitationBlock('زیبایی‌شناسی محاسباتی شعر فارسی', '/downloads/computational-aesthetics.json')
      : '';
    const content = `<article>
<header class="article-hero" style="--accent:${page.color}"><span class="kicker">${page.eyebrow}</span><h1>${page.title}</h1>${page.id === 'computational-aesthetics' ? '<p class="research-question"><strong>پرسش پژوهش:</strong> آیا می‌توان با یک ارزیابی محاسباتی، بیت‌های پُرتراکم هر شاعر را برای خوانش نزدیک اولویت‌بندی کرد؟</p>' : ''}<p>${page.description}</p><div class="answer-box"><strong>پاسخ در یک نگاه</strong><p>${page.answer}</p><p class="local-qualification"><strong>مرز ادعا:</strong> ${page.qualification}</p></div><div class="hero-actions"><a class="primary" href="${interactiveHref}">${interactiveLabel}</a><a href="#downloads">داده و دانلود</a><a href="#citation">استناد</a><a href="/methodology/">روش‌شناسی</a></div></header>
<section id="results"><span class="kicker">شاهد محاسباتی و واحد تحلیل</span><h2>چه چیزی محاسبه شد؟</h2>${renderMetrics(r.metrics)}<ol class="finding-list">${r.findings.map((f) => `<li>${f}</li>`).join('')}</ol></section>
${dataSection}
<section id="method"><div class="method-grid"><div><span class="kicker">روش و عدم‌قطعیت</span><h2>این نتیجه چگونه ساخته شد؟</h2><p>${r.method}</p></div><div class="warning"><span class="kicker">مرز تفسیر</span><h2>چه چیزی را نباید نتیجه گرفت؟</h2><p>${r.limit}</p></div></div>${page.id === 'computational-aesthetics' ? `<h3>تعریف عملیاتی هشت شاخص</h3>${renderTable(['شاخص', 'تعریف عملیاتی', 'وزن در امتیاز نهایی'], computationalAesthetics.dimensions.map((dimension) => [dimension.label, dimension.definition, faPercent(dimension.weight * 100, 0)]))}` : ''}</section>
<section id="interpretation"><span class="kicker">تفسیر ادبی</span><h2>این شاهد چه خوانشی را پیشنهاد می‌کند؟</h2><p>${page.answer}</p><p class="local-qualification">${page.qualification}</p></section>
${audienceSection}
<section id="downloads"><span class="kicker">ممیزی و استفادهٔ دوباره</span><h2>داده، روش و موجودیت‌های مرتبط</h2><div class="hero-actions"><a class="primary" href="${reuse.download}" download>دانلود مستقیم شاهد CSV</a><a href="${jsonReuse}" download>دانلود شاهد JSON</a>${page.id === 'computational-aesthetics' ? '<a href="/api/computational-aesthetics.json">مشاهده API</a>' : ''}<a href="/methodology/">روش‌شناسی مشترک</a><a href="${reuse.entity}">${reuse.entityLabel}</a><a href="/data/">فهرست همهٔ داده‌ها</a></div></section>
<section id="faq"><span class="kicker">پرسش‌های مرتبط</span><h2>خوانش درست نتیجه</h2><div class="faq-list">${faqItems.slice(1, 5).map((item) => `<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join('')}</div></section>
${citationBlock(page.title, page.path)}${datasetCitation}${relatedResearch(page.id)}</article>`;
    const faqsSchema = { '@type': 'FAQPage', mainEntity: faqItems.slice(1, 5).map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
    write(path.join('research', page.id, 'index.html'), pageShell({
      title: `${page.title} | از شعر تا داده`, description: page.description, pathname: page.path,
      image: pageImage, type: 'article', schemas: [schema, ...(studyDataset ? [studyDataset] : []), faqsSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'پژوهش‌ها', path: '/research/' }, { name: page.shortTitle, path: page.path }])],
      keywords: page.keywords, breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'پژوهش‌ها', path: '/research/' }, { name: page.shortTitle, path: page.path }],
      toc: [{ id: 'results', label: 'شاهد محاسباتی' }, { id: 'data', label: 'جدول داده' }, { id: 'method', label: 'روش و محدودیت' }, { id: 'interpretation', label: 'تفسیر ادبی' }, ...(page.id === 'computational-aesthetics' ? [{ id: 'audiences', label: 'مسیرهای خواندن' }] : []), { id: 'downloads', label: 'داده و پیوندها' }, { id: 'citation', label: 'استناد صفحه' }, ...(page.id === 'computational-aesthetics' ? [{ id: 'dataset-citation', label: 'استناد داده' }] : [])], content,
    }));
  }
}

function generatePoetPages() {
  const totalTexts = data.overview.texts;
  const aestheticsByPoet = new Map(
    computationalAesthetics.poets.map((profile) => [profile.name, profile]),
  );
  const centuryGroups = new Map();
  for (const poet of data.overview.poets) {
    if (!centuryGroups.has(poet.century)) centuryGroups.set(poet.century, []);
    centuryGroups.get(poet.century).push(poet);
  }
  const indexRows = data.overview.poets.map((poet) => `<a class="poet-index-card" href="/poets/${poetSlug(poet.name)}/">${poet.image ? `<img src="${poet.image.src}" alt="تصویر ${poet.name}" loading="lazy" width="96" height="96">` : `<span class="poet-initial">${poet.name.slice(0, 1)}</span>`}<div><strong>${poet.name}</strong><small>سده ${faNumber(poet.century)} هجری · ${faNumber(poet.poems)} متن · ${faNumber(poet.totalCouplets)} بیت</small></div></a>`).join('');
  const indexSchema = { '@type': 'CollectionPage', name: 'فهرست ۶۷ شاعر در پیکره از شعر تا داده', url: absolute('/poets/'), mainEntity: { '@type': 'ItemList', numberOfItems: data.overview.poets.length, itemListElement: data.overview.poets.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/poets/${poetSlug(p.name)}/`), name: p.name })) } };
  write('poets/index.html', pageShell({
    title: 'فهرست ۶۷ شاعر فارسی با آمار داده‌ای | از شعر تا داده',
    description: 'نمایه قابل جست‌وجوی ۶۷ شاعر از رودکی و فردوسی تا نیما، فروغ، شاملو و شاعران معاصر؛ همراه با سده، تعداد متن، کتاب و طول آثار در پیکره.',
    pathname: '/poets/', image: '/og/og-poets.png', type: 'website', schemas: [indexSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'شاعران', path: '/poets/' }])],
    keywords: ['فهرست شاعران فارسی', 'شاعران شعر فارسی', 'آمار شاعران فارسی'], breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'شاعران', path: '/poets/' }],
    content: `<header class="article-hero"><span class="kicker">دایره‌المعارف داده‌ای</span><h1>${faNumber(data.overview.poets.length)} شاعر؛ از سده ${faNumber(Math.min(...data.overview.poets.map((p) => p.century)))} تا ${faNumber(Math.max(...data.overview.poets.map((p) => p.century)))}</h1><p>این نمایه اندازه حضور هر شاعر در پیکره را گزارش می‌کند؛ نه ارزش یا رتبه ادبی او را.</p><label class="poet-filter">جست‌وجوی شاعر<input type="search" placeholder="مثلاً حافظ یا فروغ" data-poet-filter></label></header><section class="poet-index-grid" data-poet-grid>${indexRows}</section>`,
  }));

  for (const poet of data.overview.poets) {
    const slug = poetSlug(poet.name);
    const aestheticsProfile = aestheticsByPoet.get(poet.name);
    if (!aestheticsProfile) {
      throw new Error(`Missing computational-aesthetics profile for canonical poet: ${poet.name}`);
    }
    const peers = (centuryGroups.get(poet.century) || []).filter((p) => p.name !== poet.name).sort((a, b) => b.poems - a.poems).slice(0, 6);
    const share = poet.poems / totalTexts * 100;
    const image = poet.image?.src || '/og/og-poets.png';
    const personSchema = {
      '@type': 'ProfilePage', '@id': `${siteUrl}/poets/${slug}/#profile`, name: `نمایه داده‌ای ${poet.name}`, url: absolute(`/poets/${slug}/`),
      dateModified: PUBLICATION.modifiedDate, isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: {
        '@type': 'Person', name: poet.name, image: poet.image ? absolute(poet.image.src) : undefined,
        description: `${poet.name}، شاعر سده ${faNumber(poet.century)} هجری در پیکره از شعر تا داده؛ شامل ${faNumber(poet.poems)} متن و ${faNumber(poet.books)} عنوان کتاب.`,
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'سده هجری', value: poet.century },
          { '@type': 'PropertyValue', name: 'تعداد متن در پیکره', value: poet.poems },
          { '@type': 'PropertyValue', name: 'تعداد بیت در پیکره', value: poet.totalCouplets },
          { '@type': 'PropertyValue', name: 'تعداد عنوان کتاب', value: poet.books },
          { '@type': 'PropertyValue', name: 'کل واژه‌ها در پیکره', value: poet.totalWords },
          { '@type': 'PropertyValue', name: 'میانه تعداد واژه', value: poet.medianWords },
          { '@type': 'PropertyValue', name: 'میانگین زیبایی‌شناختی محاسباتی ده بیت منتخب', value: aestheticsProfile.meanOverall },
          { '@type': 'PropertyValue', name: 'مدل ارزیاب شاخص‌های زیبایی‌شناختی', value: computationalAesthetics.provenance.evaluator },
        ],
      },
    };
    const content = `<article><header class="poet-profile-hero">${poet.image ? `<figure><img src="${poet.image.src}" alt="تصویر ${poet.name}" width="320" height="320"><figcaption>منبع و مجوز تصویر در پایین صفحه آمده است.</figcaption></figure>` : `<div class="poet-profile-initial">${poet.name.slice(0, 1)}</div>`}<div><span class="kicker">پرونده داده‌ای شاعر</span><h1>${poet.name}</h1><p>سده ${faNumber(poet.century)} هجری</p><a class="primary" href="/atlas/#poets">بازکردن در نمای تعاملی شاعران</a></div></header>
<section id="statistics"><span class="kicker">در پیکره</span><h2>آمار توصیفی ${poet.name}</h2>${renderMetrics([['تعداد متن', faNumber(poet.poems)], ['تعداد ابیات', faNumber(poet.totalCouplets)], ['عنوان کتاب', faNumber(poet.books)], ['کل واژه‌ها', faNumber(poet.totalWords)], ['میانه طول متن', `${faNumber(poet.medianWords)} واژه`], ['سهم از کل پیکره', faPercent(share)]])}<p class="notice">کم یا زیاد بودن تعداد متن، بیت یا واژه معادل اهمیت ادبی شاعر نیست؛ این اعداد فقط پوشش داده را نشان می‌دهند.</p></section>
<section id="records"><span class="kicker">دامنه رکورد</span><h2>رکوردها و آثار در دسترس</h2><p>artifact منتشرشده برای ${poet.name} شامل ${faNumber(poet.poems)} رکورد متنی در ${faNumber(poet.books)} عنوان کتاب است. نام تک‌تک آثار در این خلاصهٔ عمومی نگهداری نشده و این صفحه عنوانی را حدس نمی‌زند.</p><div class="hero-actions"><a href="/downloads/poets.csv" download>دانلود رکورد خلاصه شاعر</a><a href="/api/poets.json">نسخه JSON</a></div></section>
${renderComputationalAestheticsProfile(aestheticsProfile)}
<section id="context"><span class="kicker">هم‌دوره‌ها در پیکره</span><h2>شاعران دیگر سده ${faNumber(poet.century)}</h2><div class="tag-links">${peers.map((p) => `<a href="/poets/${poetSlug(p.name)}/">${p.name}</a>`).join('') || '<span>برای این سده شاعر دیگری در پیکره ثبت نشده است.</span>'}</div></section>
<section id="research"><span class="kicker">پژوهش‌های مرتبط</span><h2>شواهدی برای ادامهٔ بررسی</h2><div class="tag-links"><a href="/research/stylometry/">اثر انگشت سبکی و نامتعارف‌ها</a><a href="/research/intertextuality/">پیوندهای متنی شاعران</a><a href="/research/attribution/">انتساب و اعتبار پیکره</a><a href="/centuries/${poet.century}/">زمینهٔ سدهٔ منتسب</a></div></section>
<section id="interpretation"><span class="kicker">راهنمای خوانش</span><h2>این صفحه چه می‌گوید و چه نمی‌گوید؟</h2><p>این نمایه برای فهم ساختار پیکره ساخته شده است. برای قضاوت درباره سبک، دوره‌های زندگی، انتساب آثار یا جایگاه تاریخی ${poet.name} باید از نسخه‌ها و منابع تخصصی تاریخ ادبیات استفاده کرد.</p></section>
${poet.image ? `<section class="image-credit"><h2>اعتبار تصویر</h2><p>${escapeHtml(poet.image.credit)} · ${escapeHtml(poet.image.license)}</p><a href="${poet.image.source}" target="_blank" rel="noopener">مشاهده صفحه منبع تصویر</a></section>` : ''}${citationBlock(`نمایه داده‌ای ${poet.name}`, `/poets/${slug}/`)}</article>`;
    write(path.join('poets', slug, 'index.html'), pageShell({
      title: `${poet.name}: آمار شعرها و نمایه داده‌ای | از شعر تا داده`,
      description: `نمایه داده‌ای ${poet.name}، شاعر سده ${faNumber(poet.century)} هجری؛ ${faNumber(poet.poems)} متن، ${faNumber(poet.totalCouplets)} بیت و ${faNumber(poet.totalWords)} واژه در پیکره شعر فارسی.`,
      pathname: `/poets/${slug}/`, image, type: 'profile', schemas: [personSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'شاعران', path: '/poets/' }, { name: poet.name, path: `/poets/${slug}/` }])],
      keywords: [poet.name, `شعرهای ${poet.name}`, `شاعر سده ${faNumber(poet.century)}`, 'شعر فارسی'],
      breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'شاعران', path: '/poets/' }, { name: poet.name, path: `/poets/${slug}/` }],
      toc: [{ id: 'statistics', label: 'آمار پیکره' }, { id: 'records', label: 'رکوردها و آثار' }, { id: 'computational-aesthetics', label: 'زیبایی‌شناسی محاسباتی' }, { id: 'context', label: 'شاعران هم‌دوره' }, { id: 'research', label: 'پژوهش مرتبط' }, { id: 'interpretation', label: 'راهنمای خوانش' }, { id: 'citation', label: 'استناد' }], content,
    }));
  }
}

function generateUtilityPages() {
  const methodSchema = { '@type': 'TechArticle', headline: 'روش‌شناسی تحلیل داده‌های شعر فارسی', description: 'روش‌های کنترل عدم‌توازن، آزمون جایگشتی، مدل موضوعی، شبکهٔ پیوند متنی و سبک‌سنجی در پروژه از شعر تا داده.', url: absolute('/methodology/'), author: { '@id': `${siteUrl}/#hossein-karimi` }, inLanguage: 'fa-IR', datePublished: PUBLICATION.publishedDate, dateModified: PUBLICATION.modifiedDate };
  write('methodology/index.html', pageShell({
    title: 'روش‌شناسی تحلیل داده‌های شعر فارسی | از شعر تا داده', description: 'توضیح شفاف نمونه‌گیری متوازن، مدل موضوعی، استعاره، شبکه، هوش مصنوعی، سبک‌سنجی، قالب، جغرافیای ادبی، چرخه عمر واژگان و محدودیت‌ها.',
    pathname: '/methodology/', image: '/og/og-methodology.png', schemas: [methodSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'روش‌شناسی', path: '/methodology/' }])],
    keywords: ['روش تحلیل شعر فارسی', 'علوم انسانی دیجیتال', 'آزمون جایگشتی', 'سبک‌سنجی'], breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'روش‌شناسی', path: '/methodology/' }],
    toc: [{ id: 'corpus', label: 'پیکره' }, { id: 'balance', label: 'کنترل عدم‌توازن' }, { id: 'models', label: 'مدل‌ها' }, { id: 'aesthetics', label: 'زیبایی‌شناسی محاسباتی' }, { id: 'statistics', label: 'آمار' }, { id: 'reproducibility', label: 'بازتولید' }],
    content: `<article><header class="article-hero"><span class="kicker">شفافیت پژوهش</span><h1>از داده خام تا نتیجه قابل دفاع</h1><p>این صفحه توضیح می‌دهد هر عدد چگونه ساخته شده، کجا قابل اعتماد است و کجا باید با احتیاط خوانده شود.</p></header>
<section id="corpus"><h2>۱. واحد تحلیل و پیکره</h2><p>هر ردیف فایل اصلی یک متن یا شعر کامل است و ستون‌های شاعر، سده، کتاب، عنوان و متن را دارد. پیکره شامل ${faNumber(data.overview.texts)} متن، ${faNumber(data.overview.couplets)} بیت و ${faNumber(data.overview.words)} واژه از ${faNumber(data.overview.poets.length)} شاعر است. بیت با جفت‌کردن مصراع‌های جداشده در متن منبع و گردکردن واحد پایانیِ فرد در سطح هر رکورد شمارش شده است. برچسب سده، دوره زندگی شاعر را نشان می‌دهد و تاریخ دقیق سرایش نیست.</p></section>
<section id="balance"><h2>۲. کنترل عدم‌توازن</h2><p>حجم آثار شاعران بسیار متفاوت است. برای جلوگیری از سلطه شاعران پرحجم، تحلیل‌های تاریخی از نمونه‌گیری سقف‌دار، میانگین برابر شاعران یا وزن‌دهی در سطح شاعر استفاده می‌کنند. شمار خام فقط در بخش توصیفی نمایش داده می‌شود.</p></section>
<section id="models"><h2>۳. مدل‌های محاسباتی</h2><div class="definition-grid"><div><strong>پرسش‌های واژه‌محور</strong><p>شمارش فرهنگ‌های کوچک، نرخ شاعرمتوازن و پنجرهٔ هشت‌واژه‌ای؛ برای پاسخ توصیفی، نه داوری معنایی قطعی.</p></div><div><strong>مدل موضوعی</strong><p>کشف هم‌رخدادی واژه‌ها و تفسیر یازده محور موضوعی.</p></div><div><strong>رانش معنایی</strong><p>مقایسه همسایگان واژگانی استعاره‌ها در دوره‌های مختلف.</p></div><div><strong>شبکهٔ پیوند متنی</strong><p>ترکیب عبارت‌های نادر، TF–IDF و شباهت موضوعی؛ نام تخصصی این حوزه بینامتنیت است.</p></div><div><strong>سبک‌سنجی</strong><p>ویژگی‌های نویسه‌ای و واژگانی برای شناسایی امضای شاعر.</p></div><div><strong>جغرافیای ادبی</strong><p>مقایسه خاستگاه، کانون فعالیت و مسیر تقریبی با دوره، سبک و شبکه.</p></div><div><strong>چرخه عمر واژه</strong><p>فراوانی متوازن شاعر، اوج، افت تا نصف و سانسور راست در پایان پیکره.</p></div></div></section>
<section id="aesthetics"><h2>۴. زیبایی‌شناسی محاسباتی</h2><p>مدل GPT-5.6-sol برای هر واحد دو‌سطری هشت شاخص صفر تا صد تولید کرده است: نمادپردازی، تصویرسازی، زبان مجازی، موسیقی، فشردگی معنا، عمق عاطفی، ساختار و تازگی بیان. امتیاز نهایی از جمع وزن‌دار این هشت خروجی ساخته می‌شود و برای هر شاعر ده واحد دارای بالاترین امتیاز منتشر شده است.</p><p class="local-qualification"><strong>مرز روش:</strong> این فرایند ارزیابی انسانی نیست. خروجی مدل برای اولویت‌بندی خوانش نزدیک مناسب است، اما معیار جهان‌شمول زیبایی، ارزش ادبی یا برتری شاعر نیست.</p></section>
<section id="statistics"><h2>۵. معناداری و اندازه اثر</h2><p>p-value به‌تنهایی گزارش نمی‌شود. آزمون‌های جایگشتی، اصلاح چندآزمونی، اندازه اثر، بازه اطمینان و تحلیل حساسیت در کنار تفسیر کیفی استفاده شده‌اند. در شبکه، QAP وابستگی میان یال‌ها را بهتر از آزمون‌های مستقل کنترل می‌کند.</p></section>
<section id="reproducibility"><h2>۶. بازتولید و ممیزی</h2><p>خروجی‌های ماشین‌خوان، فرهنگ فیلدها و تعریف شمارش در <a href="/data/">صفحه داده</a> در دسترس‌اند. فایل‌های CITATION.cff و codemeta.json نیز هویت و نسخه پروژه را ثبت می‌کنند.</p></section>
<section class="warning"><h2>اصل احتیاط</h2><p>مدل‌ها ابزار کشف الگو و تولید فرضیه‌اند. نتیجه محاسباتی باید با خوانش نزدیک متن، تاریخ ادبیات، نسخه‌شناسی و داوری متخصص ترکیب شود.</p></section>${citationBlock('روش‌شناسی تحلیل داده‌های شعر فارسی', '/methodology/')}</article>`,
  }));

  const glossarySchema = { '@type': 'DefinedTermSet', name: 'واژه‌نامه تحلیل محاسباتی شعر فارسی', url: absolute('/glossary/'), hasDefinedTerm: glossaryItems.map(([name, description]) => ({ '@type': 'DefinedTerm', name, description })) };
  write('glossary/index.html', pageShell({
    title: 'واژه‌نامه تحلیل محاسباتی شعر فارسی | از شعر تا داده', description: 'تعریف ساده و دقیق اصطلاحات مدل موضوعی، پیوند متنی، سبک‌سنجی، رانش معنایی، NPMI، آزمون جایگشتی و Leave-One-Poet-Out.',
    pathname: '/glossary/', image: '/og/og-glossary.png', schemas: [glossarySchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'واژه‌نامه', path: '/glossary/' }])],
    keywords: ['واژه‌نامه داده‌کاوی ادبیات', 'سبک‌سنجی چیست', 'مدل موضوعی چیست', 'بینامتنیت چیست'], breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'واژه‌نامه', path: '/glossary/' }],
    content: `<header class="article-hero"><span class="kicker">برای مخاطب عام</span><h1>واژه‌نامه تحلیل داده و ادبیات</h1><p>تعریف‌ها کوتاه‌اند، اما مرزهای علمی هر اصطلاح را حفظ می‌کنند.</p><label class="poet-filter">جست‌وجوی اصطلاح<input type="search" placeholder="مثلاً پیوند متنی" data-term-filter></label></header><section class="glossary-grid" data-term-grid>${glossaryItems.map(([term, definition]) => `<article><h2>${term}</h2><p>${definition}</p></article>`).join('')}</section>`,
  }));

  const aboutSchema = { '@type': 'ProfilePage', name: 'درباره حسین کریمی و پروژه از شعر تا داده', url: absolute('/about/'), mainEntity: { '@id': `${siteUrl}/#hossein-karimi` } };
  write('about/index.html', pageShell({
    title: 'درباره پروژه و حسین کریمی | از شعر تا داده', description: 'معرفی پروژه از شعر تا داده، اهداف علمی و عمومی آن و راه ارتباط با حسین کریمی در LinkedIn.',
    pathname: '/about/', image: '/og/og-home.png', type: 'profile', schemas: [aboutSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'درباره', path: '/about/' }])],
    keywords: ['حسین کریمی', 'از شعر تا داده', 'اطلس شعر فارسی'], breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'درباره', path: '/about/' }],
    content: `<article><header class="article-hero"><span class="kicker">پشت پروژه</span><h1>کاری از حسین کریمی</h1><p class="nastaliq-title">جایی که بیت‌ها، به روایت داده تبدیل می‌شوند</p><div class="hero-actions"><a class="primary" href="${data.meta.linkedin}" target="_blank" rel="me noopener">پروفایل LinkedIn</a></div></header><section><h2>چرا «از شعر تا داده»؟</h2><p>هدف پروژه نزدیک‌کردن علوم انسانی دیجیتال به مخاطب عمومی است: نمودارهای تعاملی برای کشف، صفحات مستقل برای مطالعه، داده‌های ماشین‌خوان برای بازتولید و محدودیت‌های روشن برای جلوگیری از اغراق.</p></section><section><h2>سه مخاطب، یک تجربه</h2><div class="definition-grid"><div><strong>مخاطب عمومی</strong><p>روایت روشن، نمودار زنده و توضیح بدون اصطلاحات اضافی.</p></div><div><strong>پژوهشگر</strong><p>روش، آزمون، جدول، گزارش کامل و استناد پایدار.</p></div><div><strong>داده‌کاو</strong><p>JSON، CSV، متادیتای Dataset و کد تولید داده.</p></div></div></section>${citationBlock('از شعر تا داده؛ اطلس تعاملی تحلیل داده‌های شعر فارسی', '/')}</article>`,
  }));

  const datasetSchema = globalSchemas().dataset;
  write('data/index.html', pageShell({
    title: 'داده‌ها و خروجی‌های قابل دانلود شعر فارسی | از شعر تا داده', description: 'دانلود JSON و CSV نتایج یازده پژوهش روی ۵۴٬۵۲۴ متن فارسی؛ شامل پرسش‌های عمومی، جغرافیا، چرخهٔ واژگان، ممیزی انتساب و زیبایی‌شناسی محاسباتی.',
    pathname: '/data/', image: '/og/og-data.png', schemas: [datasetSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'داده‌ها', path: '/data/' }])],
    keywords: ['دیتاست شعر فارسی', 'دانلود داده شعر فارسی', 'Persian poetry dataset', 'CSV شعر فارسی'], breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'داده‌ها', path: '/data/' }],
    toc: [{ id: 'downloads', label: 'دانلودها' }, { id: 'aesthetic-dictionary', label: 'فرهنگ پژوهش یازدهم' }, { id: 'dictionary', label: 'فرهنگ داده' }, { id: 'license', label: 'منبع و مجوز' }],
    content: `<article><header class="article-hero"><span class="kicker">داده باز</span><h1>خروجی نمودارها، به‌صورت ماشین‌خوان</h1><p>برای بازتولید، آموزش، تحلیل تکمیلی و ارجاع دقیق، داده‌های خلاصه در قالب JSON و CSV ارائه شده‌اند.</p></header><section id="downloads"><h2>فایل‌های آماده دانلود</h2><div class="download-grid">
<a href="/api/atlas-summary.json"><strong>خلاصه کامل اطلس</strong><span>JSON · متادیتا و نتایج اصلی</span></a>
<a href="/downloads/poets.csv"><strong>فهرست شاعران</strong><span>CSV · سده، متن، بیت، کتاب و واژه</span></a>
<a href="/downloads/topics-by-century.csv"><strong>مضامین در سده‌ها</strong><span>CSV · سهم یازده موضوع</span></a>
<a href="/downloads/metaphors-by-century.csv"><strong>استعاره‌ها در سده‌ها</strong><span>CSV · نرخ ده خانواده تصویری</span></a>
<a href="/downloads/intertext-edges.csv"><strong>لبه‌های پیوند متنی</strong><span>CSV · امتیازها و نوع شاهد</span></a>
<a href="/downloads/public-questions-analysis.csv"><strong>ده پرسش عمومی شعر فارسی</strong><span>CSV · دل و عقل، شب و روز، رنگ، پرنده و جغرافیا</span></a>
<a href="/api/public-questions.json"><strong>پروندهٔ ساخت‌یافتهٔ پرسش‌ها</strong><span>JSON · پاسخ، روش، محدودیت و دادهٔ نمودار</span></a>
<a href="/downloads/computational-aesthetics.csv"><strong>زیبایی‌شناسی محاسباتی شاعران</strong><span>CSV · ۶۷۰ بیت منتخب و هشت شاخص مدل</span></a>
<a href="/downloads/computational-aesthetics.json"><strong>پروفایل زیبایی‌شناختی شاعران</strong><span>JSON · رکوردها، میانگین‌ها، منشأ و مدل ارزیاب</span></a>
<a href="/api/computational-aesthetics.json"><strong>API زیبایی‌شناسی محاسباتی</strong><span>JSON · مسیر خواندنی برای ابزارهای ماشینی</span></a>
<a href="/downloads/attribution-corpus-audit.csv"><strong>ممیزی انتساب و کیفیت پیکره</strong><span>CSV · نثر آلوده، متن کوتاه و اولویت بازبینی</span></a>
<a href="/downloads/stylometry-anomalies.csv"><strong>متن‌های نامتعارف</strong><span>CSV · علت و نمره دورافتادگی</span></a>
<a href="/downloads/forms-comparison.csv"><strong>مقایسه قالب‌های شعر</strong><span>CSV · غزل، قصیده، رباعی و مثنوی</span></a>
<a href="/downloads/geography/poet_geography.csv"><strong>جغرافیا و مسیر شاعران</strong><span>CSV · خاستگاه، کانون و مسیر تقریبی</span></a>
<a href="/downloads/geography/period_mobility.csv"><strong>جابه‌جایی در چهار دوره</strong><span>CSV · نرخ و فاصله‌های مسیر</span></a>
<a href="/downloads/lexical-lifecycle.csv"><strong>رده‌های چرخه عمر واژگان</strong><span>CSV · تعداد، سهم و نیمه‌عمر</span></a>
<a href="/downloads/lexical-examples.csv"><strong>نمونه واژگان تاریخی</strong><span>CSV · پایدار، افولی، متأخر و بازبرجسته</span></a>
<a href="/api/published-evidence.json"><strong>رکوردهای شواهد منتشرشده</strong><span>JSON · شناسه، تعریف، واحد، مخرج، دقت، نسخه و صلاحیت</span></a>
<a href="/downloads/manifest.json"><strong>راستی‌آزمایی دانلودها</strong><span>JSON · نسخه، منشأ، اندازه و SHA-256 همه فایل‌ها</span></a>
</div></section><section id="aesthetic-dictionary"><h2>فرهنگ دادهٔ زیبایی‌شناسی محاسباتی</h2><p>فیلدهای زیر قرارداد رکورد منتشرشده را تعریف می‌کنند؛ نمره‌ها عدد ماشین‌خوان صفر تا صد باقی می‌مانند.</p>${renderTable(['فیلد', 'معنا'], computationalAesthetics.fieldDictionary.map((item) => [item.field, item.description]))}</section><section id="dictionary"><h2>فرهنگ داده</h2>${renderTable(['فیلد', 'معنا'], [['poet','نام شاعر'],['century','سده هجری منتسب به دوره زندگی شاعر'],['poems','تعداد متن‌های شاعر در پیکره'],['totalCouplets','تعداد ابیات؛ جفت مصراع‌های جداشده در منبع، با گردکردن واحد پایانی فرد در هر رکورد'],['totalWords','مجموع واژه‌های فارسی شاعر پس از نرمال‌سازی'],['share','سهم موضوع یا رده، به درصد'],['rate','نرخ نرمال‌شده رخداد'],['score','شاخص ترکیبی شباهت و پیوند متنی'],['robustZ','فاصله مقاوم متن از مرکز سبک شاعر'],['center_city','کانون تقریبی فعالیت شاعر'],['route_km','طول تقریبی مسیر منتخب، به کیلومتر'],['half_life','زمان پس از اوج تا نصف فراوانی'],['right_censored','نرسیدن به نصف اوج تا پایان پیکره']])}</section><section id="license"><h2>منبع، انتساب و مجوز</h2><p>کد رابط با مجوز MIT منتشر می‌شود؛ داده‌ها و تصاویر تابع شرایط منبع و اعتبارهای درج‌شده در پروژه‌اند. مختصات و مسیرهای پژوهش جغرافیا برای تحلیل کلان تقریبی‌اند.</p><div class="hero-actions"><a href="/attributions/">اعتبارها و مجوزها</a></div></section>${citationBlock('پیکره و خروجی‌های تحلیلی از شعر تا داده', '/data/')}</article>`,
  }));


  const attributionText = escapeHtml(fs.readFileSync(path.join(root, 'ATTRIBUTIONS.md'), 'utf8'));
  write('attributions/index.html', pageShell({
    title: 'اعتبار منابع، تصاویر و مجوزها | از شعر تا داده', description: 'فهرست منابع داده، اعتبار تصاویر شاعران، مجوز کد و اصول استفاده از خروجی‌های پروژه از شعر تا داده.',
    pathname: '/attributions/', image: '/og/og-data.png', schemas: [breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'اعتبارها', path: '/attributions/' }])],
    keywords: ['منابع شعر فارسی', 'مجوز تصاویر شاعران', 'اعتبار داده'], breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'اعتبارها', path: '/attributions/' }],
    content: `<article><header class="article-hero"><span class="kicker">شفافیت منبع</span><h1>اعتبار منابع و مجوزها</h1><p>منبع هر دارایی، دامنه استفاده و مسئولیت‌های بازنشر در این صفحه ثبت شده است.</p></header><section><h2>متن کامل اعتبارها</h2><pre class="attribution-pre">${attributionText}</pre></section><section class="warning"><h2>یادآوری</h2><p>مجوز MIT فقط کد رابط کاربری را پوشش می‌دهد. داده‌های شعر، تصاویر و فونت‌ها تابع شرایط منبع اصلی خود هستند.</p></section></article>`,
  }));
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function serializeCsv(headers, rows) {
  return `\uFEFF${headers.map(csvEscape).join(',')}\n${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`;
}
function writeCsv(file, headers, rows) {
  write(file, serializeCsv(headers, rows));
}
function computationalAestheticsCsvText() {
  return serializeCsv(
    [
      'poet_display', 'poet_slug', 'source_poet_display', 'century',
      'poet_rank', 'id', 'book_title', 'poem_title',
      'hemistich1', 'hemistich2', 'symbolism_score', 'imagery_score',
      'figurative_score', 'music_score', 'compression_score', 'emotion_score',
      'structure_score', 'novelty_score', 'overall_score', 'poet_percentile',
    ],
    computationalAesthetics.records.map((record) => [
      record.poet_display, record.poet_slug, record.source_poet_display, record.century,
      record.poet_rank, record.id, record.book_title, record.poem_title,
      record.hemistich1, record.hemistich2, record.symbolism_score, record.imagery_score,
      record.figurative_score, record.music_score, record.compression_score,
      record.emotion_score, record.structure_score, record.novelty_score,
      record.overall_score, record.poet_percentile,
    ]),
  );
}
function computationalAestheticsJsonText() {
  return `${JSON.stringify(versionObject(computationalAesthetics), null, 2)}\n`;
}
function generateMachineReadable() {
  const summary = versionObject({
    meta: { ...data.meta, generatedFrom: 'یازده مطالعهٔ داده‌محور دربارهٔ پرسش‌های عمومی، مضامین، استعاره، پیوند متنی، تشخیص سده، سبک‌سنجی، قالب‌ها، جغرافیای ادبی، چرخهٔ واژگان، سنجش انتساب و زیبایی‌شناسی محاسباتی', siteUrl, buildDate, language: 'fa-IR', license: 'See ATTRIBUTIONS.md and LICENSE' },
    corpus: { texts: data.overview.texts, poets: data.overview.poets.length, books: data.overview.books, couplets: data.overview.couplets, words: data.overview.words, centuries: data.overview.centuries },
    research: researchPages.map((page) => ({ id: page.id, title: page.title, url: absolute(page.path), answer: page.answer, keywords: page.keywords })),
    keyResults: {
      topics: data.topics.globalStats, metaphors: data.metaphors.globalStats, intertext: data.intertext.globalStats,
      centuryModel: { baselines: data.centuryModel.baselines, benchmark: data.centuryModel.benchmark }, stylometry: data.stylometry.metrics,
      forms: formResearch,
      geography: geographyResearch,
      lexicalLife: lexicalResearch,
      attribution: attributionResearch,
    },
  });
  write('api/atlas-summary.json', JSON.stringify(summary, null, 2));
  const publishedEvidence = researchPages.map((page) => publishedResearchEvidence(page));
  write('api/published-evidence.json', JSON.stringify(versionItems(publishedEvidence), null, 2));
  write('api/research-findings.json', JSON.stringify(versionItems(publishedEvidence.map((evidence) => ({
    ...researchPages.find((page) => `research:${page.id}` === evidence.id),
    evidenceId: evidence.id,
    metrics: evidence.values.metrics,
    findings: evidence.values.findings,
    method: evidence.values.method,
    limitation: evidence.values.limit,
    source: evidence.source,
    qualification: evidence.qualification,
  }))), null, 2));
  write('api/poets.json', JSON.stringify(versionItems(data.overview.poets.map((p) => ({ ...p, slug: poetSlug(p.name), url: absolute(`/poets/${poetSlug(p.name)}/`) }))), null, 2));
  write('api/atlas-data.json', JSON.stringify(versionObject(data), null, 2));
  write('api/forms.json', JSON.stringify(versionObject(formResearch), null, 2));
  write('api/geography.json', JSON.stringify(versionObject(geographyResearch), null, 2));
  write('api/lexical-life.json', JSON.stringify(versionObject(lexicalResearch), null, 2));
  write('api/attribution.json', JSON.stringify(versionObject(attributionResearch), null, 2));
  write('api/public-questions.json', JSON.stringify(versionObject(publicQuestionsResearch), null, 2));
  const aestheticsJson = computationalAestheticsJsonText();
  write('api/computational-aesthetics.json', aestheticsJson);
  write('downloads/computational-aesthetics.json', aestheticsJson);
  write('CITATION.cff', fs.readFileSync(path.join(root, 'CITATION.cff'), 'utf8'));
  write('codemeta.json', fs.readFileSync(path.join(root, 'codemeta.json'), 'utf8'));
  write('CHANGELOG.md', fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8'));

  writeCsv('downloads/poets.csv', ['نام شاعر', 'slug', 'سده هجری', 'تعداد متن', 'تعداد ابیات', 'تعداد کتاب', 'کل واژه', 'میانه واژه'], data.overview.poets.map((p) => [p.name, poetSlug(p.name), p.century, p.poems, p.totalCouplets, p.books, p.totalWords, p.medianWords]));
  writeCsv('downloads/topics-by-century.csv', ['شناسه موضوع', 'مضمون', 'سده', 'سهم درصد', 'جهت روند', 'rho', 'q روند'], data.topics.items.flatMap((t) => t.values.map((v) => [t.id, t.name, v.century, v.share, t.direction, t.rho, t.qTrend])));
  writeCsv('downloads/metaphors-by-century.csv', ['سده', ...data.metaphors.items.map((m) => m.name)], data.metaphors.ratesByCentury.map((row) => [row.century, ...data.metaphors.items.map((m) => row[m.name])]));
  writeCsv('downloads/intertext-edges.csv', ['شاعر متقدم', 'سده متقدم', 'شاعر متأخر', 'سده متأخر', 'امتیاز', 'شباهت واژگانی', 'شباهت موضوعی', 'تعداد عبارت', 'نوع شاهد'], data.intertext.edges.map((e) => [e.source, e.sourceCentury, e.target, e.targetCentury, e.score, e.lexical, e.topic, e.phrases, e.evidence]));
  writeCsv('downloads/stylometry-anomalies.csv', ['شاعر', 'سده', 'کتاب', 'عنوان', 'تعداد واژه', 'علت', 'robustZ', 'صدک', 'نمونه متن'], data.stylometry.anomalies.map((a) => [a.poet, a.century, a.book, a.title, a.words, a.reason, a.robustZ, a.percentile, a.snippet]));
  writeCsv('downloads/century-model-recall.csv', ['سده', 'بازیابی'], data.centuryModel.labels.map((label, i) => [label, data.centuryModel.recall[i]]));
  writeCsv('downloads/forms-comparison.csv', ['قالب', 'تعداد متن', 'تعداد شاعر', 'سده تحت پوشش', 'میانه واژه', 'میانه بیت', 'بازیابی مدل'], formResearch.formats.map((item) => [item.name, item.texts, item.poets, item.centuries, item.medianWords, item.medianCouplets, item.recall]));
  write('downloads/computational-aesthetics.csv', computationalAestheticsCsvText());
}

function generateDownloadManifest() {
  const downloadsRoot = path.join(dist, 'downloads');
  const files = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.name !== 'manifest.json') files.push(target);
    }
  };
  walk(downloadsRoot);

  const mediaTypes = {
    '.csv': 'text/csv; charset=utf-8',
    '.json': 'application/json',
    '.md': 'text/markdown; charset=utf-8',
  };
  const entries = files
    .sort((left, right) => left.localeCompare(right, 'en'))
    .map((file) => {
      const content = fs.readFileSync(file);
      return {
        path: path.relative(downloadsRoot, file).split(path.sep).join('/'),
        datasetId: path.relative(downloadsRoot, file).split(path.sep).join('/').replace(/\.[^.]+$/, ''),
        mediaType: mediaTypes[path.extname(file)] || 'application/octet-stream',
        scope: `Published ${path.basename(file)} distribution from From Poetry to Data`,
        license: absolute('/attributions/'),
        provenance: absolute('/methodology/'),
        citation: buildPersianCitation('مجموعه‌دادهٔ از شعر تا داده', '/data/', siteUrl),
        bytes: content.byteLength,
        sha256: createHash('sha256').update(content).digest('hex'),
      };
    });

  write('downloads/manifest.json', JSON.stringify({
    schemaVersion: 1,
    publicationVersion: PUBLICATION.version,
    modifiedDate: PUBLICATION.modifiedDate,
    license: 'See /attributions/ and the repository LICENSE for code, data, and source-specific terms.',
    provenance: {
      methodology: absolute('/methodology/'),
      attributions: absolute('/attributions/'),
      generator: 'scripts/postbuild.mjs',
    },
    files: entries,
  }, null, 2));
}

function homeFallback() {
  return `<div class="prerender-home"><header><span>روایت داده‌محور شعر فارسی</span><h1>شعر فارسی در سیزده سده چگونه تغییر کرده است؟</h1><p>داده‌ها از جابه‌جایی مضمون‌ها، دگرگونی خانواده‌های استعاری و تفاوت الگوهای زبانی خبر می‌دهند؛ اما این الگوها شاهد محاسباتی‌اند، نه حکم قطعی درباره ارزش ادبی یا علت تاریخی.</p><a href="/atlas/">کاوش در اطلس</a><a href="/research/">دیدن یافته‌های پژوهشی</a></header><main id="main"><section><h2>دامنه پیکره</h2><p>${faNumber(data.overview.texts)} متن از ${faNumber(data.overview.poets.length)} شاعر در سیزده سدهٔ منتسب. پوشش پیکره معادل اهمیت ادبی نیست و سدهٔ منتسب لزوماً تاریخ دقیق سرایش نیست.</p></section><section><h2>برای چه کاری آمده‌اید؟</h2><nav><a href="/research/public-questions/">خوانندهٔ عمومی</a><a href="/research/">پژوهشگر ادبی</a><a href="/methodology/">پژوهشگر علوم انسانی دیجیتال</a><a href="/data/">کاربر داده</a></nav></section><section><h2>${faNumber(researchPages.length, 0)} پژوهش اصلی</h2>${researchPages.map((p) => `<article><h3><a href="${p.path}">${p.title}</a></h3><p>${p.answer}</p><p class="local-qualification"><strong>مرز ادعا:</strong> ${p.qualification}</p></article>`).join('')}</section></main></div>`;
}

function atlasFallback() {
  return `<div class="prerender-home"><header><span>کاوش مستقیم در پیکره</span><h1>اطلس کاوش شعر فارسی</h1><p>برای مشاهدهٔ نمودارهای تعاملی JavaScript را فعال کنید؛ همهٔ صفحات موجودیت، جدول‌ها، روش و داده‌های دانلودی بدون JavaScript در دسترس‌اند.</p></header><main id="main"><noscript><p>نسخهٔ تعاملی در دسترس نیست؛ از مسیرهای ایستای زیر استفاده کنید.</p></noscript><section><h2>این اطلس چه چیزی را نشان می‌دهد؟</h2><p>اطلس مسیرهای جست‌وجو و مقایسهٔ شاعران، سده‌های منتسب، مضمون‌های محاسباتی، خانواده‌های استعاری و یافته‌های پژوهشی را کنار هم قرار می‌دهد. نمودارها و جدول‌های هم‌ارز از یک دادهٔ منتشرشده تغذیه می‌شوند و داده‌های CSV و JSON نیز برای بررسی مستقل در دسترس‌اند.</p></section><section><h2>مرز تفسیر</h2><p>پوشش پیکره معادل اهمیت ادبی نیست؛ سدهٔ منتسب لزوماً تاریخ دقیق سرایش نیست و شباهت یا هم‌بستگی محاسباتی به‌تنهایی علت تاریخی، تأثیر ادبی یا انتساب قطعی را ثابت نمی‌کند.</p></section><nav aria-label="مسیرهای ایستای اطلس"><a href="/poets/">شاعران</a><a href="/centuries/">سده‌ها</a><a href="/themes/">مضمون‌ها</a><a href="/metaphors/">استعاره‌ها</a><a href="/research/">پژوهش‌ها</a><a href="/methodology/">روش‌شناسی</a><a href="/data/">داده‌ها</a></nav></main></div>`;
}

function patchAtlas() {
  const source = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const robots = isProduction ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,nofollow';
  const atlasUrl = absolute('/atlas/');
  const summary = JSON.stringify({ texts: data.overview.texts, poets: data.overview.poets.length, centuries: data.overview.centuryStats.length }).replaceAll('<', '\\u003c');
  const { person, website, dataset } = globalSchemas();
  const atlasSchema = {
    '@type': 'CollectionPage',
    '@id': `${atlasUrl}#page`,
    name: 'اطلس کاوش شعر فارسی',
    url: atlasUrl,
    inLanguage: 'fa-IR',
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: { '@id': `${siteUrl}/data/#dataset` },
  };
  const graph = jsonLd({ '@context': 'https://schema.org', '@graph': [person, website, dataset, atlasSchema] });
  let html = source
    .replaceAll('__SITE_URL__', siteUrl)
    .replaceAll('__ROBOTS__', robots)
    .replaceAll('__PUBLICATION_DATE__', PUBLICATION.publishedDate)
    .replaceAll('__MODIFIED_DATE__', PUBLICATION.modifiedDate)
    .replace('__HOME_JSON_LD__', graph)
    .replace(`<link rel="canonical" href="${siteUrl}/" />`, `<link rel="canonical" href="${atlasUrl}" />`)
    .replace(`<link rel="alternate" hreflang="fa" href="${siteUrl}/" />`, `<link rel="alternate" hreflang="fa" href="${atlasUrl}" />`)
    .replace(`<link rel="alternate" hreflang="x-default" href="${siteUrl}/" />`, `<link rel="alternate" hreflang="x-default" href="${atlasUrl}" />`)
    .replace(`<meta property="og:url" content="${siteUrl}/" />`, `<meta property="og:url" content="${atlasUrl}" />`)
    .replace('<title>از شعر تا داده | تحلیل تعاملی شعر فارسی و هوش مصنوعی</title>', '<title>اطلس کاوش شعر فارسی | از شعر تا داده</title>')
    .replace(
      '<meta name="description" content="روایتی داده‌محور از دگرگونی شعر فارسی در سیزده سده، با مسیرهای جدا برای خوانندگان عمومی، پژوهشگران ادبی، پژوهشگران داده و کاوش مستقیم در اطلس." />',
      '<meta name="description" content="اطلس تعاملی یازده پژوهش روی ۵۴٬۵۲۴ متن از ۶۷ شاعر فارسی؛ برای کاوش شاعران، سده‌های منتسب، مضمون‌ها، استعاره‌ها، زیبایی‌شناسی محاسباتی، روش‌شناسی و داده‌های قابل دانلود." />',
    )
    .replace('<meta name="citation_title" content="از شعر تا داده: اطلس تعاملی تحلیل داده‌های شعر فارسی" />', '<meta name="citation_title" content="اطلس کاوش شعر فارسی" />')
    .replace('<div id="root"></div>', `<script type="application/json" id="publication-summary">${summary}</script><div id="root">${atlasFallback()}</div>`);
  write('atlas/index.html', html);
}

function patchHome() {
  const indexPath = path.join(dist, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const { person, website, dataset } = globalSchemas();
  const faqSchema = { '@type': 'FAQPage', mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
  const collection = { '@type': 'CollectionPage', '@id': `${siteUrl}/#home`, name: 'از شعر تا داده', url: siteUrl, isPartOf: { '@id': `${siteUrl}/#website` }, mainEntity: { '@id': `${siteUrl}/data/#dataset` }, hasPart: researchPages.map((p) => ({ '@type': 'Article', headline: p.title, url: absolute(p.path) })) };
  const graph = jsonLd({ '@context': 'https://schema.org', '@graph': [person, website, dataset, collection, faqSchema] });
  html = html
    .replaceAll('__SITE_URL__', siteUrl)
    .replaceAll('__ROBOTS__', isProduction ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,nofollow')
    .replaceAll('__PUBLICATION_DATE__', PUBLICATION.publishedDate)
    .replaceAll('__MODIFIED_DATE__', PUBLICATION.modifiedDate)
    .replace('__HOME_JSON_LD__', graph);
  const homeVerification = `${googleVerification ? `<meta name="google-site-verification" content="${escapeHtml(googleVerification)}">` : ''}${bingVerification ? `<meta name="msvalidate.01" content="${escapeHtml(bingVerification)}">` : ''}`;
  if (homeVerification) html = html.replace('</head>', `${homeVerification}</head>`);
  const summary = JSON.stringify({ texts: data.overview.texts, poets: data.overview.poets.length, centuries: data.overview.centuryStats.length }).replaceAll('<', '\\u003c');
  html = html.replace('<div id="root"></div>', `<script type="application/json" id="publication-summary">${summary}</script><div id="root">${homeFallback()}</div>`);
  fs.writeFileSync(indexPath, html, 'utf8');
}

function generateDiscoveryFiles() {
  const urls = [
    '/', '/atlas/', '/research/', ...researchPages.map((p) => p.path), '/poets/',
    ...data.overview.poets.map((p) => `/poets/${poetSlug(p.name)}/`), '/data/', '/methodology/', '/glossary/', '/about/', '/attributions/',
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${escapeHtml(absolute(u))}</loc><lastmod>${buildDate}</lastmod><changefreq>${u === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${u === '/' ? '1.0' : u.startsWith('/research/') ? '0.9' : '0.7'}</priority></url>`).join('\n')}\n</urlset>`;
  write('sitemap.xml', sitemap);
  const imageEntries = data.overview.poets.filter((p) => p.image).map((p) => `<url><loc>${absolute(`/poets/${poetSlug(p.name)}/`)}</loc><image:image><image:loc>${absolute(p.image.src)}</image:loc><image:title>تصویر ${escapeHtml(p.name)}</image:title></image:image></url>`).join('\n');
  write('sitemap-images.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${imageEntries}</urlset>`);
  write('robots.txt', `# از شعر تا داده — ${buildDate}\nUser-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\nSitemap: ${absolute('/sitemap-images.xml')}\n`);
  const rssItems = researchPages.map((p) => `<item><title>${escapeHtml(p.title)}</title><link>${absolute(p.path)}</link><guid>${absolute(p.path)}</guid><description>${escapeHtml(p.answer)}</description><pubDate>${new Date(`${buildDate}T00:00:00Z`).toUTCString()}</pubDate></item>`).join('');
  write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>از شعر تا داده</title><link>${siteUrl}</link><description>پژوهش‌های تحلیل داده شعر فارسی</description><language>fa</language>${rssItems}</channel></rss>`);
  write('feed.json', JSON.stringify({ version: 'https://jsonfeed.org/version/1.1', title: 'از شعر تا داده', home_page_url: siteUrl, feed_url: absolute('/feed.json'), language: 'fa', items: researchPages.map((p) => ({ id: absolute(p.path), url: absolute(p.path), title: p.title, summary: p.answer, date_modified: `${PUBLICATION.modifiedDate}T00:00:00Z` })) }, null, 2));
  const llms = `# از شعر تا داده\n\n> اطلس تعاملی و پژوهشی تحلیل داده‌های شعر فارسی، کاری از حسین کریمی. پیکره شامل ${faNumber(data.overview.texts)} متن، ${faNumber(data.overview.couplets)} بیت و ${faNumber(data.overview.words)} واژه از ${faNumber(data.overview.poets.length)} شاعر است.\n\n## صفحات اصلی\n- [صفحه اصلی](${siteUrl}/): نمودارهای تعاملی و روایت عمومی\n- [پژوهش‌ها](${absolute('/research/')}): ده مطالعه مستقل با روش و جدول\n- [فهرست شاعران](${absolute('/poets/')}): نمایه داده‌ای همه شاعران\n- [داده‌های قابل دانلود](${absolute('/data/')}): JSON و CSV\n- [روش‌شناسی](${absolute('/methodology/')}): کنترل عدم‌توازن، آزمون‌ها و محدودیت‌ها\n- [واژه‌نامه](${absolute('/glossary/')}): تعریف اصطلاحات
- [اعتبار منابع](${absolute('/attributions/')}): منابع، تصاویر و مجوزها\n\n## پژوهش‌ها\n${researchPages.map((p) => `- [${p.title}](${absolute(p.path)}): ${p.answer}`).join('\n')}\n\n## استناد\nکریمی، حسین. «از شعر تا داده: اطلس تعاملی تحلیل داده‌های شعر فارسی». ${siteUrl}/\n\n## سیاست تفسیر\nپیوندهای متنی، شباهت محاسباتی‌اند، نامتعارف آماری حکم انتساب نیست و اندازه حضور شاعر در پیکره رتبه ادبی محسوب نمی‌شود.\n`;
  write('llms.txt', llms.replace('ده مطالعه مستقل', `${faNumber(researchPages.length)} مطالعه مستقل`));
  const full = `${llms}\n## یافته‌ها و روش‌های تفصیلی\n${researchPages.map((p) => { const r = researchData(p.id); return `\n### ${p.title}\n${p.description}\n\nپاسخ: ${p.answer}\n\nیافته‌ها:\n${r.findings.map((x) => `- ${x}`).join('\n')}\n\nروش: ${r.method}\n\nمحدودیت: ${r.limit}\n`; }).join('\n')}\n## داده و API\n- ${absolute('/api/atlas-summary.json')}\n- ${absolute('/api/research-findings.json')}\n- ${absolute('/api/poets.json')}\n- ${absolute('/api/forms.json')}\n- ${absolute('/api/geography.json')}\n- ${absolute('/api/lexical-life.json')}\n- ${absolute('/api/attribution.json')}\n- ${absolute('/downloads/attribution-corpus-audit.csv')}\n- ${absolute('/downloads/topics-by-century.csv')}\n- ${absolute('/downloads/metaphors-by-century.csv')}\n- ${absolute('/downloads/intertext-edges.csv')}\n- ${absolute('/downloads/forms-comparison.csv')}\n- ${absolute('/downloads/geography/poet_geography.csv')}\n- ${absolute('/downloads/lexical-lifecycle.csv')}\n`;
  write('llms-full.txt', full.replace('ده مطالعه مستقل', `${faNumber(researchPages.length)} مطالعه مستقل`));
  write('humans.txt', `/* TEAM */\nCreator: حسین کریمی\nLinkedIn: ${data.meta.linkedin}\n\n/* SITE */\nName: از شعر تا داده\nLanguage: Persian (fa-IR)\nLast update: ${buildDate}\nTechnology: React, Vite, Apache ECharts\n`);
  write('.well-known/security.txt', `Contact: ${data.meta.linkedin}\nPreferred-Languages: fa, en\nCanonical: ${absolute('/.well-known/security.txt')}\nExpires: ${securityExpiry}\n`);
  write('opensearch.xml', `<?xml version="1.0" encoding="UTF-8"?><OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"><ShortName>از شعر تا داده</ShortName><Description>جست‌وجوی شاعران در اطلس شعر فارسی</Description><InputEncoding>UTF-8</InputEncoding><Url type="text/html" template="${absolute('/poets/?q={searchTerms}')}"/></OpenSearchDescription>`);
  write('manifest.webmanifest', JSON.stringify({ name: 'از شعر تا داده؛ اطلس تعاملی شعر فارسی', short_name: 'از شعر تا داده', description: 'تحلیل تعاملی بیش از پنجاه‌وچهار هزار متن شعر فارسی', lang: 'fa', dir: 'rtl', start_url: '/', scope: '/', display: 'standalone', background_color: '#f8f2e5', theme_color: '#0b3b3a', icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, null, 2));
  write('404.html', `${head({ title: 'صفحه پیدا نشد | از شعر تا داده', description: 'صفحه درخواستی در اطلس تعاملی از شعر تا داده پیدا نشد؛ از صفحه اصلی، پژوهش‌ها یا فهرست شاعران مسیر درست را پیدا کنید.', path: '/404.html', schemas: [] })}<body><main class="not-found"><span class="kicker">خطای ${faNumber(404)}</span><h1>این بیت در دفتر ما نیست</h1><p>صفحه‌ای که دنبالش بودید پیدا نشد.</p><a class="primary" href="/">بازگشت به صفحه اصلی</a></main></body></html>`);
}

function validateOutput() {
  const required = ['index.html', 'sitemap.xml', 'robots.txt', 'llms.txt', 'research/topics/index.html', 'research/geography/index.html', 'research/lexical-life/index.html', 'research/attribution/index.html', 'research/public-questions/index.html', 'poets/index.html', 'data/index.html', 'attributions/index.html', 'api/atlas-summary.json', 'api/published-evidence.json', 'api/geography.json', 'api/lexical-life.json', 'api/attribution.json', 'api/public-questions.json', 'downloads/public-questions-analysis.csv', 'downloads/geography/poet_geography.csv', 'downloads/lexical-lifecycle.csv'];
  const missing = required.filter((p) => !fs.existsSync(path.join(dist, p)));
  if (missing.length) throw new Error(`Missing generated files: ${missing.join(', ')}`);
  const sitemapText = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  if (sitemapText.includes('localhost') && isProduction) throw new Error('Production sitemap contains localhost');
  const htmlFiles = [];
  const walk = (dir) => { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, item.name); if (item.isDirectory()) walk(p); else if (item.name.endsWith('.html')) htmlFiles.push(p); } };
  walk(dist);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    if (!/<html lang="fa" dir="rtl">/.test(html) && !file.endsWith('index.html')) continue;
    if (!/<title>[^<]+<\/title>/.test(html)) throw new Error(`Missing title in ${file}`);
    if (!/rel="canonical"/.test(html) && !file.endsWith('404.html')) throw new Error(`Missing canonical in ${file}`);
  }
  console.log(`SEO/GEO generation complete: ${htmlFiles.length} HTML pages, ${urlsCount()} sitemap URLs, site=${siteUrl}`);
}
function urlsCount() { return 1 + 1 + researchPages.length + 1 + data.overview.poets.length + 6; }

ensureDir(dist);
fs.rmSync(path.join(dist, 'prototype'), { recursive: true, force: true });
generateResearchPages();
generatePoetPages();
generateUtilityPages();
generateMachineReadable();
generateDownloadManifest();
generateDiscoveryFiles();
patchAtlas();
patchHome();
validateOutput();
