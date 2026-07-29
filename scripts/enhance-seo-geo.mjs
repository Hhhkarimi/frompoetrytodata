import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { researchPages, faqItems } from '../src/content/siteContent.js';
import { resolvePublicationOrigin } from './lib/publication-identity.mjs';
import { buildPersianCitation, PUBLICATION } from '../src/publication/publication.js';
import { persianDigits, persianNumber } from '../src/publication/persian-format.js';

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
const buildDate = new Date().toISOString().slice(0, 10);
const siteUrl = resolvePublicationOrigin();
const isProduction = siteUrl.startsWith('https://') && !siteUrl.includes('localhost');
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || '';
const bingVerification = process.env.BING_SITE_VERIFICATION || '';

if (!fs.existsSync(dist)) throw new Error('dist پیدا نشد؛ ابتدا vite build و postbuild را اجرا کنید.');

const faDigits = persianDigits;
const faNumber = (value, maxFraction = 1) => persianNumber(value, { maximumFractionDigits: maxFraction });
const faPercent = (value, maxFraction = 1) => `${faNumber(value, maxFraction)}٪`;
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const escapeXml = escapeHtml;
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const write = (relativePath, content) => {
  const target = path.join(dist, relativePath);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content, 'utf8');
};
const absolute = (pathname = '/') => `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
const jsonLd = (value) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`;

const topicSlugs = {
  1: 'ethics-wisdom',
  2: 'epic-kingship-war',
  3: 'religion-sufism-praise',
  4: 'soul-heart-romantic-bond',
  5: 'sensory-existential-images',
  6: 'beloved-beauty-feast',
  7: 'nature-flower-spring',
  8: 'night-time-life',
  9: 'mystical-romantic-love',
  10: 'cosmos-power-fortune',
  11: 'grief-separation',
};
const metaphorSlugs = {
  'راه، سفر و منزل': 'journey-road-destination',
  'گل و بلبل': 'flower-nightingale',
  'نور، شمع و تاریکی': 'light-candle-darkness',
  'خون، زخم و خنجر': 'blood-wound-dagger',
  'باده، شراب و ساقی': 'wine-cupbearer',
  'آتش، شعله و شرر': 'fire-flame-spark',
  'دریا، موج و ساحل': 'sea-wave-shore',
  'آینه و بازتاب': 'mirror-reflection',
  'قفس و زندان': 'cage-prison',
  'زنجیر و اسارت': 'chain-captivity',
};
const poetSlugs = {
  'رودکی': 'rudaki', 'فردوسی': 'ferdowsi', 'کسایی': 'kasaei', 'ابوسعید ابوالخیر': 'abu-saeid-abul-kheir',
  'ناصرخسرو': 'naser-khosrow', 'باباطاهر': 'baba-taher', 'هجویری': 'hojviri', 'اسدی توسی': 'asadi-tusi',
  'فخرالدین اسعد گرگانی': 'fakhr-al-din-asad-gorgani', 'منوچهری': 'manuchehri', 'فرخی سیستانی': 'farrokhi-sistani',
  'مسعود سعد سلمان': 'masud-sad-salman', 'عطار': 'attar', 'سنایی': 'sanai', 'انوری': 'anvari', 'خاقانی': 'khaghani',
  'نظامی': 'nezami', 'خیام': 'khayyam', 'نصرالله منشی': 'nasrallah-monshi', 'باباافضل کاشانی': 'baba-afzal-kashani',
  'مهستی گنجوی': 'mahasti-ganjavi', 'عبدالواسع جبلی': 'abd-al-vase-jabali', 'مولوی': 'rumi', 'سعدی': 'saadi',
  'خواجوی کرمانی': 'khwaju-kermani', 'عراقی': 'iraqi', 'سیف فرغانی': 'seyf-farghani', 'شاه نعمت‌الله ولی': 'shah-nematollah-vali',
  'اوحدی': 'owhadi', 'سلمان ساوجی': 'salman-savoji', 'امیرخسرو دهلوی': 'amir-khosrow-dehlavi', 'حافظ': 'hafez',
  'عبید زاکانی': 'obeyd-zakani', 'شیخ محمود شبستری': 'mahmud-shabestari', 'هلالی جغتایی': 'helali-jaghatai', 'جامی': 'jami',
  'محتشم کاشانی': 'mohtasham-kashani', 'عرفی': 'orfi', 'وحشی': 'vahshi', 'رضی‌الدین آرتیمانی': 'razi-al-din-artimani',
  'شیخ بهایی': 'sheikh-bahaei', 'صائب تبریزی': 'saeb-tabrizi', 'بیدل دهلوی': 'bidel-dehlavi', 'فیض کاشانی': 'feiz-kashani',
  'هاتف اصفهانی': 'hatef-esfahani', 'قاآنی': 'qaani', 'فروغی بسطامی': 'forughi-bastami', 'ملا هادی سبزواری': 'molla-hadi-sabzevari',
  'ملک‌الشعرای بهار': 'malek-al-shoara-bahar', 'اقبال لاهوری': 'iqbal-lahori', 'احمد شاملو': 'ahmad-shamlou',
  'سیمین بهبهانی': 'simin-behbahani', 'پروین اعتصامی': 'parvin-etesami', 'شهریار': 'shahriar',
  'کامبیز صدیقی کسمایی': 'kambiz-sedighi-kasmaei', 'رهی معیری': 'rahi-moayeri', 'سهراب سپهری': 'sohrab-sepehri',
  'فروغ فرخزاد': 'forough-farrokhzad', 'مهدی اخوان ثالث': 'mehdi-akhavan-sales', 'بهرام سالکی': 'bahram-saleki',
  'شاطرعباس صبوحی': 'shater-abbas-sabouhi', 'شیون فومنی': 'shivon-foumani', 'نیما یوشیج (آوای آزاد)': 'nima-yushij',
  'خلیل‌الله خلیلی': 'khalilullah-khalili', 'محمدحسن بارق شفیعی': 'mohammad-hasan-bareq-shafiei',
  'ا لیار (جبار محمدی)': 'a-liyar-jabbar-mohammadi', 'عبدالقهار عاصی': 'abdul-qahar-asi',
};
const poetSlug = (name) => poetSlugs[name] || `poet-${Buffer.from(name).toString('hex').slice(0, 16)}`;

const logo = `<a class="seo-brand" href="/" aria-label="از شعر تا داده؛ صفحه اصلی">
<svg viewBox="0 0 128 128" aria-hidden="true"><defs><linearGradient id="entity-logo" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b615c"/><stop offset="1" stop-color="#b9862d"/></linearGradient></defs><path d="M64 8 114 37v54L64 120 14 91V37Z" fill="url(#entity-logo)"/><path d="M64 28 87 56 64 99 41 56Z" fill="#fff8e8"/><circle cx="64" cy="60" r="8" fill="#9f2f38"/><path d="M64 68v23" stroke="#9f2f38" stroke-width="6" stroke-linecap="round"/></svg>
<span><strong>از شعر تا داده</strong><small>اطلس تعاملی شعر فارسی</small></span></a>`;

function breadcrumbSchema(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path),
    })),
  };
}

function globalGraph() {
  return [
    {
      '@type': 'Person', '@id': `${siteUrl}/#hossein-karimi`, name: 'حسین کریمی',
      url: absolute('/about/'), sameAs: [data.meta.linkedin], jobTitle: 'پژوهشگر و طراح داده‌نما',
    },
    {
      '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: 'از شعر تا داده',
      alternateName: 'From Poetry to Data', inLanguage: 'fa-IR',
      description: 'اطلس تعاملی و پژوهشی تحلیل داده‌های شعر فارسی از سده سوم تا پانزدهم هجری.',
      creator: { '@id': `${siteUrl}/#hossein-karimi` },
    },
    {
      '@type': 'Dataset', '@id': `${siteUrl}/data/#dataset`, name: 'خروجی‌های تحلیلی از شعر تا داده',
      url: absolute('/data/'), inLanguage: 'fa', isAccessibleForFree: true,
      description: `خروجی‌های تحلیلی ${faNumber(data.overview.texts)} متن، ${faNumber(data.overview.couplets)} بیت و ${faNumber(data.overview.words)} واژه از ${faNumber(data.overview.poets.length)} شاعر فارسی.`,
      creator: { '@id': `${siteUrl}/#hossein-karimi` },
      version: PUBLICATION.version, datePublished: PUBLICATION.publishedDate, dateModified: PUBLICATION.modifiedDate,
      license: absolute('/attributions/'),
      distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/downloads/manifest.json'), name: 'نسخه، منشأ و checksum دانلودها' }],
    },
  ];
}

function head({ title, description, pathname, image = '/og/og-research.png', schemas = [], keywords = [], jsonPath = '' }) {
  const canonical = absolute(pathname);
  const robots = isProduction ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,nofollow';
  const webPage = {
    '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title,
    description, inLanguage: 'fa-IR', dateModified: PUBLICATION.modifiedDate,
    isPartOf: { '@id': `${siteUrl}/#website` },
    primaryImageOfPage: { '@type': 'ImageObject', url: absolute(image), width: 1200, height: 630 },
  };
  const graph = { '@context': 'https://schema.org', '@graph': [...globalGraph(), webPage, ...schemas] };
  return `<!doctype html><html lang="fa" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}"><meta name="googlebot" content="${robots}"><meta name="bingbot" content="${robots}">
<meta name="author" content="حسین کریمی"><meta name="creator" content="حسین کریمی"><meta name="publisher" content="حسین کریمی">
${googleVerification ? `<meta name="google-site-verification" content="${escapeHtml(googleVerification)}">` : ""}${bingVerification ? `<meta name="msvalidate.01" content="${escapeHtml(bingVerification)}">` : ""}
<meta name="generator" content="From Poetry to Data static knowledge layer 7.0"><meta name="application-name" content="از شعر تا داده">
<meta name="keywords" content="${escapeHtml(keywords.join('، '))}"><meta name="theme-color" content="#0b3b3a"><meta name="color-scheme" content="light dark">
<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="fa" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${canonical}">
<link rel="author" href="${absolute('/about/')}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="از شعر تا داده" href="${absolute('/feed.xml')}"><link rel="sitemap" type="application/xml" href="${absolute('/sitemap.xml')}">
${jsonPath ? `<link rel="alternate" type="application/json" href="${absolute(jsonPath)}">` : ''}
<meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="از شعر تا داده"><meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${absolute(image)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(title)}">
<meta property="article:published_time" content="${PUBLICATION.publishedDate}T00:00:00Z"><meta property="article:modified_time" content="${PUBLICATION.modifiedDate}T00:00:00Z"><meta property="article:author" content="${absolute('/about/')}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${absolute(image)}"><meta name="twitter:image:alt" content="${escapeHtml(title)}">
<meta name="citation_author" content="${PUBLICATION.creator}"><meta name="citation_title" content="${escapeHtml(title)}"><meta name="citation_publication_date" content="${PUBLICATION.publishedDate}"><meta name="citation_online_date" content="${PUBLICATION.publishedDate}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
<link rel="stylesheet" href="/seo-pages.css"><link rel="stylesheet" href="/entity-pages.css">${jsonLd(graph)}</head>`;
}

function shell({ title, description, pathname, image, schemas = [], keywords = [], breadcrumbs = [], toc = [], jsonPath = '', content }) {
  const crumbs = breadcrumbs.map((item, index) => `<li>${index === breadcrumbs.length - 1 ? `<span>${escapeHtml(item.name)}</span>` : `<a href="${item.path}">${escapeHtml(item.name)}</a>`}</li>`).join('');
  return `${head({ title, description, pathname, image, schemas, keywords, jsonPath })}<body>
<a class="skip-link" href="#main">پرش به محتوای اصلی</a>
<header class="seo-header"><div class="seo-header-inner">${logo}<nav aria-label="فهرست اصلی"><a href="/research/">پژوهش‌ها</a><a href="/themes/">مضامین</a><a href="/metaphors/">استعاره‌ها</a><a href="/centuries/">سده‌ها</a><a href="/poets/">شاعران</a><a href="/data/">داده‌ها</a></nav><a class="interactive-link" href="/atlas/#overview">اطلس تعاملی</a></div></header>
<nav class="breadcrumbs" aria-label="مسیر صفحه"><ol>${crumbs}</ol></nav><div class="reading-progress" aria-hidden="true"></div>
<div class="seo-layout${toc.length ? '' : ' seo-layout-wide'}">${toc.length ? `<aside class="seo-toc"><strong>در این صفحه</strong><ol>${toc.map((item) => `<li><a href="#${item.id}">${escapeHtml(item.label)}</a></li>`).join('')}</ol></aside>` : ''}<main id="main" class="seo-main">${content}</main></div>
<footer class="seo-footer"><div>${logo}<p>روایت داده‌محور شعر فارسی برای مخاطب عام، پژوهشگر و ماشین.</p></div><div><strong>کاری از حسین کریمی</strong><a href="${data.meta.linkedin}" target="_blank" rel="me noopener">LinkedIn</a><a href="/questions/">پرسش‌های کلیدی</a><a href="/methodology/">روش‌شناسی</a><a href="/attributions/">اعتبارها</a></div><small>آخرین به‌روزرسانی محتوایی: ${faDigits(PUBLICATION.modifiedDate)} · نتایج محاسباتی جایگزین نقد ادبی نیستند.</small></footer>
<script src="/seo-pages.js" defer></script></body></html>`;
}

function citationBlock(title, pathname) {
  const citation = buildPersianCitation(title, pathname, siteUrl);
  return `<section id="citation" class="citation-box"><div><span class="kicker">استناد آماده</span><h2>استناد پیشنهادی</h2></div><blockquote id="citation-text">${escapeHtml(citation)}</blockquote><button type="button" data-copy="#citation-text">کپی استناد</button></section>`;
}

function renderMetrics(metrics) {
  return `<div class="metric-grid">${metrics.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`;
}

function renderTable(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderSeries(rows, valueKey, label, suffix = '') {
  const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1);
  return `<div class="entity-series" role="img" aria-label="${escapeHtml(label)}">${rows.map((row) => {
    const value = Number(row[valueKey]) || 0;
    return `<div class="entity-series-row"><span>سده ${faNumber(row.century)}</span><div><i style="--bar:${Math.max(2, value / max * 100).toFixed(2)}%"></i></div><strong>${faNumber(value, 2)}${suffix}</strong></div>`;
  }).join('')}</div>`;
}

function pearson(a, b) {
  if (!a.length || a.length !== b.length) return 0;
  const am = a.reduce((s, x) => s + x, 0) / a.length;
  const bm = b.reduce((s, x) => s + x, 0) / b.length;
  let numerator = 0; let da = 0; let db = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] - am; const y = b[i] - bm;
    numerator += x * y; da += x * x; db += y * y;
  }
  return da && db ? numerator / Math.sqrt(da * db) : 0;
}

function topicTrend(topic) {
  if (!topic.significantTrend) return 'روند یکنواخت و معنادار ثبت نشده است';
  if (topic.rho > 0) return `روند بلندمدت افزایشی است (ρ = ${faDigits(topic.rho)})`;
  return `روند بلندمدت کاهشی است (ρ = ${faDigits(topic.rho)})`;
}

function topicAnswer(topic) {
  return `مضمون محاسباتی «${topic.name}» در کل پیکره سهم ${faPercent(topic.overallShare)} دارد، در سده ${faNumber(topic.peakCentury)} به بیشترین سهم خود یعنی ${faPercent(topic.peakShare)} می‌رسد و ${topicTrend(topic)}.`;
}

function topicRelated(topic) {
  return data.topics.items.filter((item) => item.id !== topic.id).map((item) => ({
    ...item,
    similarity: pearson(topic.values.map((v) => v.share), item.values.map((v) => v.share)),
  })).sort((a, b) => Math.abs(b.similarity) - Math.abs(a.similarity)).slice(0, 4);
}

function generateThemePages() {
  const cards = data.topics.items.map((topic) => `<a class="entity-card" href="/themes/${topicSlugs[topic.id]}/"><span>مضمون ${faNumber(topic.id)}</span><h2>${topic.name}</h2><p>${topicAnswer(topic)}</p><small>واژه‌های شاخص: ${topic.keywords.join('، ')}</small></a>`).join('');
  const indexPath = '/themes/';
  const setSchema = {
    '@type': 'DefinedTermSet', '@id': `${siteUrl}${indexPath}#set`, name: 'یازده مضمون محاسباتی شعر فارسی',
    description: 'مجموعه یازده محور موضوعی استخراج‌شده از پیکره از شعر تا داده.', url: absolute(indexPath),
    hasDefinedTerm: data.topics.items.map((topic) => ({ '@id': `${absolute(`/themes/${topicSlugs[topic.id]}/`)}#term` })),
  };
  write('themes/index.html', shell({
    title: 'یازده مضمون اصلی شعر فارسی در گذر سده‌ها | از شعر تا داده',
    description: 'نمایه یازده مضمون محاسباتی شعر فارسی؛ از حکمت، حماسه و عرفان تا عشق، طبیعت، غم و تصویرهای حسی، همراه با روند سده‌ای و داده قابل دانلود.',
    pathname: indexPath, image: '/og/og-topics.png',
    schemas: [setSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'مضامین', path: indexPath }])],
    keywords: ['مضامین شعر فارسی', 'موضوع شعر فارسی', 'تحلیل موضوعی شعر', 'مدل موضوعی فارسی'],
    breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'مضامین', path: indexPath }],
    content: `<header class="article-hero"><span class="kicker">واژه‌نامه موضوعی</span><h1>یازده مسیر برای خواندن تاریخ شعر فارسی</h1><p>این صفحه موضوع‌های کشف‌شده توسط مدل را به زبان ساده معرفی می‌کند. هر کارت به یک پرونده مستقل با روند تاریخی، جدول سده‌ای و موضوع‌های هم‌حرکت پیوند دارد.</p><div class="answer-box"><strong>نتیجه کلیدی</strong><p>سده تاریخی حدود ${faPercent(data.topics.globalStats.rSquared * 100)} از تفاوت ترکیب موضوعی میان شاعران را توضیح می‌دهد و آزمون جایگشتی معنادار است.</p></div><div class="hero-actions"><a class="primary" href="/research/topics/">پژوهش کامل مضامین</a><a href="/atlas/#topics">نمودار تعاملی</a></div></header><section class="entity-grid">${cards}</section>${citationBlock('نمایه مضامین شعر فارسی', indexPath)}`,
  }));

  for (const topic of data.topics.items) {
    const slug = topicSlugs[topic.id];
    const pathname = `/themes/${slug}/`;
    const related = topicRelated(topic);
    const minPoint = [...topic.values].sort((a, b) => a.share - b.share)[0];
    const lastPoint = topic.values.at(-1);
    const schema = {
      '@type': 'DefinedTerm', '@id': `${absolute(pathname)}#term`, name: topic.name,
      description: topicAnswer(topic), url: absolute(pathname), termCode: `topic-${topic.id}`,
      inDefinedTermSet: { '@id': `${siteUrl}/themes/#set` },
      subjectOf: { '@type': 'ScholarlyArticle', '@id': `${absolute(pathname)}#article`, headline: `تحول مضمون ${topic.name} در شعر فارسی`,
        author: { '@id': `${siteUrl}/#hossein-karimi` }, datePublished: PUBLICATION.publishedDate, dateModified: PUBLICATION.modifiedDate,
        isBasedOn: { '@id': `${siteUrl}/data/#dataset` }, inLanguage: 'fa-IR' },
    };
    const qText = topic.significantTrend ? `پس از اصلاح چندآزمونی نیز روند معنادار گزارش شده است (q = ${faDigits(topic.qTrend)}).` : `پس از اصلاح چندآزمونی، شواهد کافی برای یک روند خطی معنادار وجود ندارد (q = ${faDigits(topic.qTrend)}).`;
    const content = `<article><header class="article-hero"><span class="kicker">مضمون ${faNumber(topic.id)} از ${faNumber(data.topics.items.length)}</span><h1>${topic.name}</h1><p>واژه‌های شاخص این محور: ${topic.keywords.join('، ')}.</p><div class="answer-box"><strong>پاسخ مستقیم</strong><p>${topicAnswer(topic)} ${qText}</p></div><div class="hero-actions"><a class="primary" href="/atlas/#topics">مشاهده نمودار تعاملی</a><a href="/downloads/topics-by-century.csv">دریافت CSV</a></div></header>
<section id="profile"><span class="kicker">پروفایل کمی</span><h2>این مضمون در یک نگاه</h2>${renderMetrics([['سهم کلی', faPercent(topic.overallShare)], ['سده اوج', `سده ${faNumber(topic.peakCentury)}`], ['سهم در اوج', faPercent(topic.peakShare)], ['کمینه ثبت‌شده', `${faPercent(minPoint.share)} در سده ${faNumber(minPoint.century)}`], ['سهم سده پایانی', faPercent(lastPoint.share)], ['اندازه اثر سده', faDigits(topic.epsilonSquared)]])}</section>
<section id="trajectory"><span class="kicker">سیر سده‌ای</span><h2>تغییر سهم «${topic.name}»</h2><p>طول هر نوار سهم این محور از ترکیب موضوعی سده را نشان می‌دهد. اعداد از تحلیل برابرِ شاعران به دست آمده‌اند، نه شمار خام متن‌ها.</p>${renderSeries(topic.values, 'share', `روند مضمون ${topic.name}`, '٪')}${renderTable(['سده هجری', 'سهم موضوع'], topic.values.map((v) => [`سده ${faNumber(v.century)}`, faPercent(v.share)]))}</section>
<section id="relations"><span class="kicker">ارتباط موضوعی</span><h2>موضوع‌های هم‌حرکت یا خلاف‌جهت</h2><p>همبستگی زیر فقط شباهت مسیر تاریخی را می‌سنجد؛ رابطه علّی یا هم‌معنایی را اثبات نمی‌کند.</p><div class="relation-grid">${related.map((item) => `<a href="/themes/${topicSlugs[item.id]}/"><strong>${item.name}</strong><span>${item.similarity >= 0 ? 'هم‌حرکت' : 'خلاف‌جهت'} · r = ${faDigits(item.similarity.toFixed(2))}</span></a>`).join('')}</div></section>
<section id="interpretation"><div class="method-grid"><div><span class="kicker">تفسیر عمومی</span><h2>چگونه این نمودار را بخوانیم؟</h2><p>افزایش سهم یعنی واژه‌های این خوشه در میان موضوع‌های مدل وزن بیشتری گرفته‌اند؛ نه اینکه همه شعرهای آن سده درباره همین مضمون بوده‌اند. اوج سده‌ای نیز یک نشانه پیکره‌ای است، نه مرز قطعی سبک تاریخی.</p></div><div class="warning"><span class="kicker">محدودیت</span><h2>برچسب، تفسیر انسانی است</h2><p>مدل گروه واژه‌ها را استخراج می‌کند و پژوهشگر به آن برچسب می‌دهد. واژه‌های چندمعنا، تفاوت ژانر و انتساب سده‌ای می‌توانند بر نتیجه اثر بگذارند.</p></div></div></section>
${citationBlock(`تحول مضمون ${topic.name} در شعر فارسی`, pathname)}</article>`;
    write(path.join('themes', slug, 'index.html'), shell({
      title: `${topic.name} در شعر فارسی؛ روند سده‌ای و داده | از شعر تا داده`,
      description: `${topicAnswer(topic)} مشاهده جدول کامل سده‌های سوم تا پانزدهم، واژه‌های شاخص و موضوع‌های هم‌حرکت.`,
      pathname, image: '/og/og-topics.png', jsonPath: `/api/themes/${slug}.json`,
      schemas: [schema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'مضامین', path: '/themes/' }, { name: topic.name, path: pathname }])],
      keywords: [topic.name, ...topic.keywords, 'مضامین شعر فارسی', 'تحلیل موضوعی'],
      breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'مضامین', path: '/themes/' }, { name: topic.name, path: pathname }],
      toc: [{ id: 'profile', label: 'پروفایل کمی' }, { id: 'trajectory', label: 'روند سده‌ای' }, { id: 'relations', label: 'موضوع‌های مرتبط' }, { id: 'interpretation', label: 'راهنمای تفسیر' }, { id: 'citation', label: 'استناد' }],
      content,
    }));
    write(`api/themes/${slug}.json`, JSON.stringify({
      '@context': 'https://schema.org', '@type': 'DefinedTerm', id: topic.id, slug, url: absolute(pathname),
      name: topic.name, keywords: topic.keywords, answer: topicAnswer(topic), overallShare: topic.overallShare,
      peakCentury: topic.peakCentury, peakShare: topic.peakShare, trend: { rho: topic.rho, q: topic.qTrend, significant: topic.significantTrend, direction: topic.direction },
      values: topic.values, related: related.map((r) => ({ id: r.id, name: r.name, slug: topicSlugs[r.id], correlation: Number(r.similarity.toFixed(4)) })),
      methodology: absolute('/methodology/'), dataset: absolute('/data/'), dateModified: PUBLICATION.modifiedDate,
    }, null, 2));
  }
}

function metaphorAnswer(item) {
  return `خانواده تصویری «${item.name}» در ${faPercent(item.poemPercent)} از شعرهای پیکره دیده شده، نرخ کلی آن ${faNumber(item.rate, 2)} رخداد در هر هزار واژه است و اوج پایدارش در سده ${faNumber(item.stablePeak)} قرار دارد.`;
}

function metaphorSeries(item) {
  return data.metaphors.ratesByCentury.map((row) => ({ century: row.century, rate: row[item.name] }));
}

function metaphorRelations(item) {
  const pairs = data.metaphors.pairs.filter((p) => p.source === item.name || p.target === item.name)
    .map((p) => ({ ...p, other: p.source === item.name ? p.target : p.source }))
    .sort((a, b) => b.npmi - a.npmi);
  const unique = new Map();
  for (const pair of pairs) if (!unique.has(pair.other)) unique.set(pair.other, pair);
  return [...unique.values()].slice(0, 5);
}

function generateMetaphorPages() {
  const cards = [...data.metaphors.items].sort((a, b) => b.rate - a.rate).map((item) => `<a class="entity-card" href="/metaphors/${metaphorSlugs[item.name]}/"><span>${faNumber(item.rate, 2)} در هزار واژه</span><h2>${item.name}</h2><p>${metaphorAnswer(item)}</p><small>میدان معنایی غالب: ${item.semanticField}</small></a>`).join('');
  const indexPath = '/metaphors/';
  const setSchema = {
    '@type': 'DefinedTermSet', '@id': `${siteUrl}${indexPath}#set`, name: 'ده خانواده استعاری در شعر فارسی',
    description: 'خانواده‌های تصویری ردیابی‌شده در پروژه از شعر تا داده.', url: absolute(indexPath),
    hasDefinedTerm: data.metaphors.items.map((item) => ({ '@id': `${absolute(`/metaphors/${metaphorSlugs[item.name]}/`)}#term` })),
  };
  write('metaphors/index.html', shell({
    title: 'ده استعاره ماندگار شعر فارسی و دگرگونی آن‌ها | از شعر تا داده',
    description: 'ردیابی آینه، آتش، قفس، دریا، باده، گل‌وبلبل، زنجیر، راه، نور و زخم در شعر فارسی؛ نرخ تاریخی، اوج، میدان معنایی و هم‌رخدادی.',
    pathname: indexPath, image: '/og/og-metaphors.png', schemas: [setSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'استعاره‌ها', path: indexPath }])],
    keywords: ['استعاره در شعر فارسی', 'نمادهای شعر فارسی', 'گل و بلبل', 'آینه در شعر فارسی'],
    breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'استعاره‌ها', path: indexPath }],
    content: `<header class="article-hero"><span class="kicker">اطلس تصویرهای ادبی</span><h1>استعاره‌ها نمی‌میرند؛ میدان معنایی عوض می‌کنند</h1><p>ده خانواده تصویری در سده‌های مختلف ردیابی شده‌اند. صفحه هر خانواده، فراوانی، دوره اوج، شبکه هم‌رخدادی و محدودیت تشخیص کاربرد مجازی را نشان می‌دهد.</p><div class="answer-box"><strong>نتیجه کلیدی</strong><p>هیچ‌یک از ده خانواده بررسی‌شده کاملاً ناپدید نمی‌شود؛ الگوی غالب خاموشی موقت، بازگشت و جابه‌جایی همسایگان معنایی است.</p></div><div class="hero-actions"><a class="primary" href="/research/metaphors/">پژوهش کامل استعاره‌ها</a><a href="/atlas/#metaphors">نمودار تعاملی</a></div></header><section class="entity-grid">${cards}</section>${citationBlock('نمایه استعاره‌های شعر فارسی', indexPath)}`,
  }));

  for (const item of data.metaphors.items) {
    const slug = metaphorSlugs[item.name];
    const pathname = `/metaphors/${slug}/`;
    const series = metaphorSeries(item);
    const relations = metaphorRelations(item);
    const strongestShift = [...data.metaphors.transitions].filter((t) => t.name === item.name).sort((a, b) => b.jsd - a.jsd)[0];
    const schema = {
      '@type': 'DefinedTerm', '@id': `${absolute(pathname)}#term`, name: item.name,
      description: metaphorAnswer(item), url: absolute(pathname), termCode: `metaphor-${slug}`,
      inDefinedTermSet: { '@id': `${siteUrl}/metaphors/#set` },
      subjectOf: { '@type': 'ScholarlyArticle', '@id': `${absolute(pathname)}#article`, headline: `تحول استعاره ${item.name} در شعر فارسی`,
        author: { '@id': `${siteUrl}/#hossein-karimi` }, datePublished: PUBLICATION.publishedDate, dateModified: PUBLICATION.modifiedDate,
        isBasedOn: { '@id': `${siteUrl}/data/#dataset` }, inLanguage: 'fa-IR' },
    };
    const content = `<article><header class="article-hero"><span class="kicker">خانواده استعاری</span><h1>${item.name}</h1><p>میدان معنایی غالب در تحلیل همسایگان واژگانی: ${item.semanticField}.</p><div class="answer-box"><strong>پاسخ مستقیم</strong><p>${metaphorAnswer(item)} دوره غالب آن «${item.dominantPeriod}» گزارش شده است.</p></div><div class="hero-actions"><a class="primary" href="/atlas/#metaphors">مشاهده نمودار تعاملی</a><a href="/downloads/metaphors-by-century.csv">دریافت CSV</a></div></header>
<section id="profile"><span class="kicker">چرخه عمر</span><h2>پروفایل کمی «${item.name}»</h2>${renderMetrics([['تعداد رخداد', faNumber(item.occurrences)], ['تعداد شعر', faNumber(item.poems)], ['درصد شعرهای پیکره', faPercent(item.poemPercent)], ['نرخ در هزار واژه', faNumber(item.rate, 2)], ['تعداد شاعر', faNumber(item.poets)], ['ظهور پایدار', `سده ${faNumber(item.stableEmergence)}`], ['اوج پایدار', `سده ${faNumber(item.stablePeak)}`], ['نسبت دوره جدید به آغازین', faNumber(item.newToEarlyRatio, 2)]])}</section>
<section id="trajectory"><span class="kicker">روند تاریخی</span><h2>فراوانی در سده‌های سوم تا پانزدهم</h2><p>نرخ‌ها به‌صورت رخداد در هر هزار واژه گزارش شده‌اند تا تفاوت حجم متن‌ها کمتر بر مقایسه اثر بگذارد.</p>${renderSeries(series, 'rate', `روند استعاره ${item.name}`, '')}${renderTable(['سده هجری', 'نرخ در هر هزار واژه'], series.map((v) => [`سده ${faNumber(v.century)}`, faNumber(v.rate, 3)]))}</section>
<section id="shift"><span class="kicker">رانش معنایی</span><h2>معنا ثابت نمی‌ماند</h2><p>${strongestShift ? `بزرگ‌ترین گسست همسایگان معنایی در گذار سده ${faNumber(strongestShift.from)} به ${faNumber(strongestShift.to)} ثبت شده است (JSD = ${faDigits(strongestShift.jsd)}). این گذار بر پایه ${faNumber(strongestShift.poetsBefore)} شاعر پیش و ${faNumber(strongestShift.poetsAfter)} شاعر پس از مرز محاسبه شده است.` : 'برای این خانواده گذار مستقلی در جدول اصلی ثبت نشده است.'}</p><p>رانش معنایی به معنی تغییر قطعی تعریف واژه نیست؛ بلکه نشان می‌دهد چه واژه‌ها و میدان‌هایی در پیرامون این تصویر بیشتر یا کمتر ظاهر شده‌اند.</p></section>
<section id="relations"><span class="kicker">شبکه هم‌رخدادی</span><h2>تصویرهای همراه</h2><div class="relation-grid">${relations.length ? relations.map((rel) => `<a href="/metaphors/${metaphorSlugs[rel.other]}/"><strong>${rel.other}</strong><span>${rel.period} · NPMI = ${faDigits(rel.npmi)}</span></a>`).join('') : '<p>هم‌رخدادی شاخصی در فهرست برتر ثبت نشده است.</p>'}</div></section>
<section id="interpretation"><div class="method-grid"><div><span class="kicker">خوانش عمومی</span><h2>«تولد» و «مرگ» یعنی چه؟</h2><p>تولد به نخستین حضور واژه اشاره نمی‌کند؛ منظور دوره‌ای است که خانواده تصویری میان چند شاعر و به‌طور پایدار دیده می‌شود. مرگ نیز نابودی کامل نیست و معمولاً افت، خاموشی یا تغییر میدان معنایی است.</p></div><div class="warning"><span class="kicker">محدودیت</span><h2>همه رخدادها استعاری نیستند</h2><p>شمارش خانواده واژگانی میان کاربرد حقیقی، نمادین و استعاری تمایز کامل ایجاد نمی‌کند. نتیجه برای تولید فرضیه و انتخاب نمونه خوانش نزدیک مناسب است.</p></div></div></section>
${citationBlock(`تحول استعاره ${item.name} در شعر فارسی`, pathname)}</article>`;
    write(path.join('metaphors', slug, 'index.html'), shell({
      title: `${item.name} در شعر فارسی؛ فراوانی و تحول معنایی | از شعر تا داده`,
      description: `${metaphorAnswer(item)} روند سده‌ای، رانش معنایی، هم‌رخدادی و جدول کامل داده را ببینید.`,
      pathname, image: '/og/og-metaphors.png', jsonPath: `/api/metaphors/${slug}.json`,
      schemas: [schema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'استعاره‌ها', path: '/metaphors/' }, { name: item.name, path: pathname }])],
      keywords: [item.name, item.semanticField, 'استعاره شعر فارسی', 'تحول معنایی'],
      breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'استعاره‌ها', path: '/metaphors/' }, { name: item.name, path: pathname }],
      toc: [{ id: 'profile', label: 'پروفایل کمی' }, { id: 'trajectory', label: 'روند تاریخی' }, { id: 'shift', label: 'رانش معنایی' }, { id: 'relations', label: 'تصویرهای همراه' }, { id: 'interpretation', label: 'راهنمای تفسیر' }, { id: 'citation', label: 'استناد' }],
      content,
    }));
    write(`api/metaphors/${slug}.json`, JSON.stringify({
      '@context': 'https://schema.org', '@type': 'DefinedTerm', slug, url: absolute(pathname), name: item.name,
      answer: metaphorAnswer(item), ...item, values: series, related: relations.map((r) => ({ name: r.other, slug: metaphorSlugs[r.other], period: r.period, npmi: r.npmi })),
      strongestSemanticShift: strongestShift || null, methodology: absolute('/methodology/'), dataset: absolute('/data/'), dateModified: PUBLICATION.modifiedDate,
    }, null, 2));
  }
}

function generateCenturyPages() {
  const indexPath = '/centuries/';
  const stats = [...data.overview.centuryStats].sort((a, b) => a.century - b.century);
  const cards = stats.map((row) => {
    const poets = data.overview.poets.filter((p) => p.century === row.century).sort((a, b) => b.poems - a.poems);
    return `<a class="century-card" href="/centuries/${row.century}/"><span>سده ${faNumber(row.century)} هجری</span><strong>${faNumber(row.texts)} متن · ${faNumber(row.poets)} شاعر</strong><p>${poets.slice(0, 4).map((p) => p.name).join('، ')}${poets.length > 4 ? ' و دیگران' : ''}</p></a>`;
  }).join('');
  const indexSchema = {
    '@type': 'CollectionPage', '@id': `${siteUrl}${indexPath}#collection`, name: 'سده‌های شعر فارسی در پیکره از شعر تا داده', url: absolute(indexPath),
    mainEntity: { '@type': 'ItemList', numberOfItems: stats.length, itemListElement: stats.map((row, i) => ({ '@type': 'ListItem', position: i + 1, name: `سده ${faNumber(row.century)} هجری`, url: absolute(`/centuries/${row.century}/`) })) },
  };
  write('centuries/index.html', shell({
    title: 'شعر فارسی از سده سوم تا پانزدهم هجری | اطلس سده‌ها',
    description: 'مرور سده‌به‌سده پیکره شعر فارسی؛ تعداد متن و شاعر، چهره‌های هر دوره، مضامین غالب و خانواده‌های استعاری از سده سوم تا پانزدهم هجری.',
    pathname: indexPath, image: '/og/og-research.png', schemas: [indexSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'سده‌ها', path: indexPath }])],
    keywords: ['تاریخ شعر فارسی', 'شاعران سده‌های هجری', 'سده شعر فارسی', 'ادبیات فارسی'],
    breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'سده‌ها', path: indexPath }],
    content: `<header class="article-hero"><span class="kicker">خط زمانی دانشنامه‌ای</span><h1>سیزده ایستگاه در تاریخ پیکره شعر فارسی</h1><p>از سده سوم تا پانزدهم هجری، هر صفحه آمار پوشش، شاعران حاضر، مضامین برجسته و تصویرهای پرتراکم همان سده را کنار هم می‌گذارد.</p><div class="answer-box"><strong>نکته مهم</strong><p>سده به دوره زندگی شاعر نسبت داده شده است، نه تاریخ دقیق سرایش هر شعر. تعداد متن‌ها نیز پوشش پیکره است و رتبه تاریخی یک دوره را نشان نمی‌دهد.</p></div></header><section class="century-grid">${cards}</section>${citationBlock('اطلس سده‌های شعر فارسی', indexPath)}`,
  }));

  for (const row of stats) {
    const century = row.century;
    const pathname = `/centuries/${century}/`;
    const poets = data.overview.poets.filter((p) => p.century === century).sort((a, b) => b.poems - a.poems);
    const topics = data.topics.items.map((topic) => ({ ...topic, share: topic.values.find((v) => v.century === century)?.share ?? 0 })).sort((a, b) => b.share - a.share);
    const metaphorRow = data.metaphors.ratesByCentury.find((item) => item.century === century) || {};
    const metaphors = data.metaphors.items.map((item) => ({ ...item, centuryRate: metaphorRow[item.name] ?? 0 })).sort((a, b) => b.centuryRate - a.centuryRate);
    const prev = stats.find((item) => item.century === century - 1);
    const next = stats.find((item) => item.century === century + 1);
    const transition = data.topics.transitions.find((item) => item.from === century - 1 && item.to === century) || data.topics.transitions.find((item) => item.from === century && item.to === century + 1);
    const schema = {
      '@type': 'CollectionPage', '@id': `${absolute(pathname)}#collection`, name: `شعر فارسی در سده ${faNumber(century)} هجری`, url: absolute(pathname),
      description: `نمایه داده‌ای سده ${faNumber(century)} هجری با ${faNumber(row.texts)} متن و ${faNumber(row.poets)} شاعر در پیکره.`,
      mainEntity: { '@type': 'ItemList', numberOfItems: poets.length, itemListElement: poets.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: absolute(`/poets/${poetSlug(p.name)}/`) })) },
      isPartOf: { '@id': `${siteUrl}/centuries/#collection` },
    };
    const content = `<article><header class="article-hero"><span class="kicker">خط زمانی شعر فارسی</span><h1>سده ${faNumber(century)} هجری</h1><p>${faNumber(row.texts)} متن از ${faNumber(row.poets)} شاعر و ${faNumber(row.books)} عنوان کتاب در این بخش پیکره قرار گرفته‌اند.</p><div class="answer-box"><strong>پاسخ مستقیم</strong><p>در مدل موضوعی متوازن، برجسته‌ترین محور این سده «${topics[0].name}» با سهم ${faPercent(topics[0].share)} است. پرتراکم‌ترین خانواده تصویری نیز «${metaphors[0].name}» با نرخ ${faNumber(metaphors[0].centuryRate, 2)} در هر هزار واژه است.</p></div><div class="hero-actions"><a class="primary" href="/atlas/#overview">مشاهده خط زمانی تعاملی</a><a href="/downloads/poets.csv">دریافت داده شاعران</a></div></header>
<section id="corpus"><span class="kicker">پوشش پیکره</span><h2>آمار توصیفی سده ${faNumber(century)}</h2>${renderMetrics([['تعداد متن', faNumber(row.texts)], ['تعداد شاعر', faNumber(row.poets)], ['عنوان کتاب', faNumber(row.books)], ['میانه طول متن', `${faNumber(row.medianWords)} واژه`], ['سهم از کل پیکره', faPercent(row.share)]])}<p class="notice">این اعداد میزان حضور در فایل داده را نشان می‌دهند. برای سده‌هایی با یک یا دو شاعر، نتیجه تاریخی باید با احتیاط بیشتری خوانده شود.</p></section>
<section id="poets"><span class="kicker">چهره‌های حاضر</span><h2>شاعران سده ${faNumber(century)} در پیکره</h2><div class="poet-link-grid">${poets.map((p) => `<a href="/poets/${poetSlug(p.name)}/"><strong>${p.name}</strong><span>${faNumber(p.poems)} متن · ${faNumber(p.totalCouplets)} بیت · ${faNumber(p.totalWords)} واژه</span></a>`).join('')}</div></section>
<section id="topics"><span class="kicker">ترکیب موضوعی</span><h2>موضوع‌های برجسته این سده</h2>${renderTable(['رتبه', 'مضمون', 'سهم'], topics.map((topic, i) => [faNumber(i + 1), topic.name, faPercent(topic.share)]))}<div class="tag-links">${topics.slice(0, 5).map((topic) => `<a href="/themes/${topicSlugs[topic.id]}/">${topic.name}</a>`).join('')}</div></section>
<section id="metaphors"><span class="kicker">منظومه تصویری</span><h2>خانواده‌های استعاری پرتراکم</h2>${renderTable(['رتبه', 'خانواده تصویری', 'نرخ در هزار واژه'], metaphors.map((item, i) => [faNumber(i + 1), item.name, faNumber(item.centuryRate, 3)]))}<div class="tag-links">${metaphors.slice(0, 5).map((item) => `<a href="/metaphors/${metaphorSlugs[item.name]}/">${item.name}</a>`).join('')}</div></section>
<section id="context"><span class="kicker">جایگاه در خط زمانی</span><h2>پیش و پس از این سده</h2><div class="timeline-neighbors">${prev ? `<a href="/centuries/${prev.century}/">← سده ${faNumber(prev.century)}</a>` : '<span>آغاز پوشش پیکره</span>'}<strong>سده ${faNumber(century)}</strong>${next ? `<a href="/centuries/${next.century}/">سده ${faNumber(next.century)} ←</a>` : '<span>پایان پوشش پیکره</span>'}</div>${transition ? `<p>شاخص گسست موضوعی در گذار ${faNumber(transition.from)} به ${faNumber(transition.to)} برابر ${faDigits(transition.jsd)} گزارش شده است؛ این مقدار فاصله ترکیب موضوعی دو سده را خلاصه می‌کند.</p>` : '<p>برای این مرز زمانی، گسست مستقلی در فهرست گذارهای برتر ثبت نشده است.</p>'}</section>
<section id="limits" class="warning"><span class="kicker">محدودیت تاریخی</span><h2>از «سده شاعر» تا «تاریخ شعر» فاصله است</h2><p>سدهٔ این صفحه به دورهٔ زندگی منتسب شاعر اشاره دارد، نه تاریخ دقیق سرایش هر شعر. آثار یک شاعر ممکن است در دهه‌های مختلف زندگی سروده شده باشند. همچنین گزینش کتاب‌ها و حجم متفاوت آثار سبب می‌شود این صفحه نماینده کامل همه ادبیات تولیدشده در سده ${faNumber(century)} نباشد.</p></section>
${citationBlock(`شعر فارسی در سده ${faNumber(century)} هجری`, pathname)}</article>`;
    write(path.join('centuries', String(century), 'index.html'), shell({
      title: `شعر فارسی در سده ${faNumber(century)} هجری؛ شاعران و مضامین | از شعر تا داده`,
      description: `نمایه سده ${faNumber(century)} هجری با ${faNumber(row.texts)} متن، ${faNumber(row.poets)} شاعر، مضامین برجسته، استعاره‌های پرتراکم و جدول‌های قابل جست‌وجو.`,
      pathname, image: '/og/og-research.png', jsonPath: `/api/centuries/${century}.json`,
      schemas: [schema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'سده‌ها', path: '/centuries/' }, { name: `سده ${faNumber(century)}`, path: pathname }])],
      keywords: [`شعر سده ${faNumber(century)}`, `شاعران سده ${faNumber(century)}`, 'تاریخ شعر فارسی', ...poets.slice(0, 5).map((p) => p.name)],
      breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'سده‌ها', path: '/centuries/' }, { name: `سده ${faNumber(century)}`, path: pathname }],
      toc: [{ id: 'corpus', label: 'آمار پیکره' }, { id: 'poets', label: 'شاعران' }, { id: 'topics', label: 'مضامین' }, { id: 'metaphors', label: 'استعاره‌ها' }, { id: 'context', label: 'خط زمانی' }, { id: 'limits', label: 'محدودیت' }, { id: 'citation', label: 'استناد' }],
      content,
    }));
    write(`api/centuries/${century}.json`, JSON.stringify({
      '@context': 'https://schema.org', '@type': 'CollectionPage', century, url: absolute(pathname), corpus: row,
      poets: poets.map((p) => ({ name: p.name, slug: poetSlug(p.name), url: absolute(`/poets/${poetSlug(p.name)}/`), poems: p.poems, totalCouplets: p.totalCouplets, totalWords: p.totalWords, books: p.books, medianWords: p.medianWords })),
      topics: topics.map((t) => ({ id: t.id, name: t.name, slug: topicSlugs[t.id], share: t.share })),
      metaphors: metaphors.map((m) => ({ name: m.name, slug: metaphorSlugs[m.name], rate: m.centuryRate })),
      methodology: absolute('/methodology/'), dataset: absolute('/data/'), dateModified: PUBLICATION.modifiedDate,
    }, null, 2));
  }
}

const expandedFaq = [
  ...faqItems,
  {
    question: 'شعر فارسی در طول سده‌ها چه تغییری کرده است؟',
    answer: `ترکیب موضوعی در طول زمان تغییر معنادار دارد و سده تاریخی حدود ${faPercent(data.topics.globalStats.rSquared * 100)} از تفاوت پروفایل‌های موضوعی میان شاعران را توضیح می‌دهد. این نتیجه پس از وزن‌دهی برابر شاعران به دست آمده است.`,
    href: '/research/topics/',
  },
  {
    question: 'آیا استعاره‌های قدیمی از شعر فارسی حذف می‌شوند؟',
    answer: 'در ده خانواده بررسی‌شده حذف کامل دیده نشد. استعاره‌ها بیشتر دوره‌های افت و بازگشت دارند و واژه‌های پیرامونشان تغییر می‌کند؛ یعنی زندگی آن‌ها بیشتر شبیه دگرگونی است تا مرگ.',
    href: '/research/metaphors/',
  },
  {
    question: 'آیا هوش مصنوعی می‌تواند شاعر را از روی سبک تشخیص دهد؟',
    answer: `در آزمون متوازن ${faNumber(data.stylometry.metrics.eligible_poets)} شاعر، مدل نویسه‌ای به دقت ${faPercent(data.stylometry.metrics.accuracy * 100)} رسید؛ بسیار بالاتر از خط مبنای حدود ${faPercent(data.stylometry.metrics.majority * 100)}.`,
    href: '/research/stylometry/',
  },
  {
    question: 'چرا صفحات سده‌ای تاریخ دقیق شعر را نشان نمی‌دهند؟',
    answer: 'برچسب سده از دوره زندگی شاعر گرفته شده است. تاریخ دقیق سرایش بسیاری از متن‌ها در فایل وجود ندارد؛ بنابراین صفحات سده‌ای برای دیدن روندهای کلان مناسب‌اند، نه تاریخ‌گذاری یک شعر خاص.',
    href: '/centuries/',
  },
  {
    question: 'بهترین راه استفاده پژوهشی از سایت چیست؟',
    answer: 'ابتدا پاسخ مستقیم صفحه پژوهش را بخوانید، سپس جدول و روش را بررسی کنید، فایل CSV را دریافت کنید و در نهایت نمونه‌های متنی را با خوانش نزدیک و منابع تاریخ ادبیات اعتبارسنجی کنید.',
    href: '/methodology/',
  },
];

function generateQuestionsPage() {
  const pathname = '/questions/';
  const faqSchema = {
    '@type': 'FAQPage', mainEntity: expandedFaq.map((item) => ({
      '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  const items = expandedFaq.map((item, index) => `<details class="qa-card" ${index < 3 ? 'open' : ''}><summary>${item.question}</summary><p>${item.answer}</p>${item.href ? `<a href="${item.href}">مشاهده شواهد و روش ←</a>` : ''}</details>`).join('');
  write('questions/index.html', shell({
    title: 'پرسش و پاسخ درباره تحلیل داده شعر فارسی | از شعر تا داده',
    description: 'پاسخ روشن و مستند به پرسش‌های مهم دربارهٔ تحول شعر فارسی، استعاره‌ها، پیوندهای متنی، تشخیص سده با هوش مصنوعی، سبک شاعران، انتساب و محدودیت داده.',
    pathname, image: '/og/og-glossary.png', schemas: [faqSchema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'پرسش‌ها', path: pathname }])],
    keywords: ['پرسش درباره شعر فارسی', 'هوش مصنوعی و شعر', 'تحلیل داده ادبیات', 'FAQ شعر فارسی'],
    breadcrumbs: [{ name: 'خانه', path: '/' }, { name: 'پرسش‌های کلیدی', path: pathname }],
    content: `<header class="article-hero"><span class="kicker">پاسخ‌های کوتاه، شواهد روشن</span><h1>پرسش‌های کلیدی درباره شعر، داده و هوش مصنوعی</h1><p>هر پاسخ با زبان عمومی نوشته شده و به صفحه‌ای پیوند دارد که عدد، روش، جدول و محدودیت را کامل توضیح می‌دهد.</p></header><section class="qa-grid">${items}</section>${citationBlock('پرسش و پاسخ از شعر تا داده', pathname)}`,
  }));
}

function generateMachineKnowledge() {
  const themes = data.topics.items.map((topic) => ({
    id: topic.id, slug: topicSlugs[topic.id], name: topic.name, url: absolute(`/themes/${topicSlugs[topic.id]}/`),
    answer: topicAnswer(topic), keywords: topic.keywords, overallShare: topic.overallShare, peakCentury: topic.peakCentury, values: topic.values,
  }));
  const metaphors = data.metaphors.items.map((item) => ({
    slug: metaphorSlugs[item.name], name: item.name, url: absolute(`/metaphors/${metaphorSlugs[item.name]}/`), answer: metaphorAnswer(item),
    occurrences: item.occurrences, poemPercent: item.poemPercent, rate: item.rate, peakCentury: item.stablePeak, semanticField: item.semanticField,
  }));
  const centuries = data.overview.centuryStats.map((row) => ({
    ...row, url: absolute(`/centuries/${row.century}/`),
    poets: data.overview.poets.filter((p) => p.century === row.century).map((p) => p.name),
  }));
  write('api/themes.json', JSON.stringify(themes, null, 2));
  write('api/metaphors.json', JSON.stringify(metaphors, null, 2));
  write('api/centuries.json', JSON.stringify(centuries, null, 2));
  write('api/forms.json', JSON.stringify(formResearch, null, 2));
  write('api/geography.json', JSON.stringify(geographyResearch, null, 2));
  write('api/lexical-life.json', JSON.stringify(lexicalResearch, null, 2));
  write('api/attribution.json', JSON.stringify(attributionResearch, null, 2));
  write('api/public-questions.json', JSON.stringify(publicQuestionsResearch, null, 2));

  const contentIndex = [
    { type: 'website', title: 'از شعر تا داده', url: absolute('/'), summary: 'اطلس تعاملی تحلیل داده‌های شعر فارسی.' },
    ...researchPages.map((page) => ({ type: 'research', title: page.title, url: absolute(page.path), summary: page.answer })),
    ...themes.map((item) => ({ type: 'theme', title: item.name, url: item.url, summary: item.answer })),
    ...metaphors.map((item) => ({ type: 'metaphor', title: item.name, url: item.url, summary: item.answer })),
    ...centuries.map((item) => ({ type: 'century', title: `سده ${faNumber(item.century)} هجری`, url: item.url, summary: `${faNumber(item.texts)} متن از ${faNumber(item.poets.length)} شاعر.` })),
    ...data.overview.poets.map((p) => ({ type: 'poet', title: p.name, url: absolute(`/poets/${poetSlug(p.name)}/`), summary: `شاعر سده ${faNumber(p.century)} هجری؛ ${faNumber(p.poems)} متن، ${faNumber(p.totalCouplets)} بیت و ${faNumber(p.totalWords)} واژه در پیکره.` })),
  ].map((item) => ({ ...item, language: 'fa-IR', dateModified: PUBLICATION.modifiedDate }));
  write('api/content-index.json', JSON.stringify(contentIndex, null, 2));

  const graph = [
    ...globalGraph(),
    ...researchPages.map((page) => ({ '@type': 'ScholarlyArticle', '@id': `${absolute(page.path)}#article`, headline: page.title, abstract: page.answer, url: absolute(page.path), author: { '@id': `${siteUrl}/#hossein-karimi` }, isBasedOn: { '@id': `${siteUrl}/data/#dataset` } })),
    ...themes.map((item) => ({ '@type': 'DefinedTerm', '@id': `${item.url}#term`, name: item.name, description: item.answer, url: item.url, inDefinedTermSet: { '@id': `${siteUrl}/themes/#set` } })),
    ...metaphors.map((item) => ({ '@type': 'DefinedTerm', '@id': `${item.url}#term`, name: item.name, description: item.answer, url: item.url, inDefinedTermSet: { '@id': `${siteUrl}/metaphors/#set` } })),
    ...data.overview.poets.map((p) => ({ '@type': 'Person', '@id': `${absolute(`/poets/${poetSlug(p.name)}/`)}#person`, name: p.name, subjectOf: absolute(`/poets/${poetSlug(p.name)}/`), additionalProperty: [{ '@type': 'PropertyValue', name: 'سده هجری', value: p.century }, { '@type': 'PropertyValue', name: 'تعداد متن در پیکره', value: p.poems }, { '@type': 'PropertyValue', name: 'تعداد بیت در پیکره', value: p.totalCouplets }, { '@type': 'PropertyValue', name: 'کل واژه‌ها در پیکره', value: p.totalWords }] })),
  ];
  write('api/knowledge-graph.json', JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2));

  const openapi = {
    openapi: '3.1.0',
    info: { title: 'From Poetry to Data Static API', version: PUBLICATION.version, description: 'Static, read-only JSON endpoints for the Persian poetry data atlas. Content language is Persian.' },
    servers: [{ url: siteUrl }],
    paths: {
      '/api/atlas-summary.json': { get: { summary: 'خلاصه اطلس', operationId: 'getAtlasSummary', responses: { 200: { description: 'Atlas summary JSON', content: { 'application/json': { schema: { type: 'object' } } } } } } },
      '/api/content-index.json': { get: { summary: 'نمایه همه صفحات و موجودیت‌ها', operationId: 'getContentIndex', responses: { 200: { description: 'Content index', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } } } },
      '/api/themes.json': { get: { summary: 'فهرست مضامین', operationId: 'getThemes', responses: { 200: { description: 'Themes', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } } } },
      '/api/metaphors.json': { get: { summary: 'فهرست خانواده‌های استعاری', operationId: 'getMetaphors', responses: { 200: { description: 'Metaphors', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } } } },
      '/api/centuries.json': { get: { summary: 'فهرست سده‌ها', operationId: 'getCenturies', responses: { 200: { description: 'Centuries', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } } } },
      '/api/poets.json': { get: { summary: 'فهرست شاعران', operationId: 'getPoets', responses: { 200: { description: 'Poets', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } } } },
      '/api/forms.json': { get: { summary: 'مقایسه غزل، قصیده، رباعی و مثنوی', operationId: 'getPoetryForms', responses: { 200: { description: 'Poetry form comparison', content: { 'application/json': { schema: { type: 'object' } } } } } } },
      '/api/geography.json': { get: { summary: 'جغرافیا و جابه‌جایی شاعران', operationId: 'getPoetryGeography', responses: { 200: { description: 'Poet geography and mobility', content: { 'application/json': { schema: { type: 'object' } } } } } } },
      '/api/lexical-life.json': { get: { summary: 'چرخه عمر و نیمه‌عمر واژگان', operationId: 'getLexicalLifecycle', responses: { 200: { description: 'Lexical lifecycle research', content: { 'application/json': { schema: { type: 'object' } } } } } } },
      '/api/attribution.json': { get: { summary: 'ممیزی انتساب شعر و کیفیت پیکره', operationId: 'getPoetryAttribution', responses: { 200: { description: 'Poetry attribution research triage', content: { 'application/json': { schema: { type: 'object' } } } } } } },
      '/api/public-questions.json': { get: { summary: 'ده پرسش عمومی درباره شعر فارسی', operationId: 'getPublicPoetryQuestions', responses: { 200: { description: 'Public-facing corpus questions and results', content: { 'application/json': { schema: { type: 'object' } } } } } } },
      '/api/knowledge-graph.json': { get: { summary: 'گراف دانش Schema.org', operationId: 'getKnowledgeGraph', responses: { 200: { description: 'Knowledge graph', content: { 'application/ld+json': { schema: { type: 'object' } } } } } } },
    },
  };
  write('openapi.json', JSON.stringify(openapi, null, 2));

  const citation = {
    type: 'webpage', id: 'karimi-from-poetry-to-data', title: 'از شعر تا داده: اطلس تعاملی تحلیل داده‌های شعر فارسی',
    author: [{ family: 'کریمی', given: 'حسین' }], issued: { 'date-parts': [[2026, 7, 27]] },
    URL: absolute('/'), language: 'fa', version: PUBLICATION.version,
  };
  write('citation.json', JSON.stringify(citation, null, 2));
  write('citation.bib', `@misc{karimi_from_poetry_to_data_2026,\n  author = {Hossein Karimi},\n  title = {${PUBLICATION.title}},\n  year = {${PUBLICATION.publishedDate.slice(0, 4)}},\n  url = {${absolute('/')}},\n  note = {Version ${PUBLICATION.version}}\n}\n`);
  write('manifest.webmanifest', JSON.stringify({
    name: 'از شعر تا داده؛ اطلس تعاملی شعر فارسی', short_name: 'از شعر تا داده',
    description: 'دانشنامه داده‌ای و تعاملی تحلیل شعر فارسی', lang: 'fa', dir: 'rtl',
    start_url: '/', scope: '/', display: 'standalone', orientation: 'any',
    background_color: '#f8f2e5', theme_color: '#0b3b3a',
    categories: ['education', 'books', 'data visualization'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }, null, 2));
}

function generateDiscovery() {
  const core = ['/', '/atlas/', '/research/', ...researchPages.map((p) => p.path), '/data/', '/methodology/', '/glossary/', '/about/', '/attributions/', '/questions/'];
  const entities = [
    '/poets/', ...data.overview.poets.map((p) => `/poets/${poetSlug(p.name)}/`),
    '/themes/', ...data.topics.items.map((t) => `/themes/${topicSlugs[t.id]}/`),
    '/metaphors/', ...data.metaphors.items.map((m) => `/metaphors/${metaphorSlugs[m.name]}/`),
    '/centuries/', ...data.overview.centuryStats.map((c) => `/centuries/${c.century}/`),
  ];
  const dataUrls = ['/openapi.json', '/api/atlas-summary.json', '/api/research-findings.json', '/api/poets.json', '/api/themes.json', '/api/metaphors.json', '/api/centuries.json', '/api/forms.json', '/api/geography.json', '/api/lexical-life.json', '/api/attribution.json', '/api/public-questions.json', '/api/content-index.json', '/api/knowledge-graph.json'];
  const urlset = (urls, defaultPriority = '0.7') => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${escapeXml(absolute(u))}</loc><lastmod>${buildDate}</lastmod><changefreq>${u === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${u === '/' ? '1.0' : defaultPriority}</priority></url>`).join('\n')}\n</urlset>`;
  write('sitemap-core.xml', urlset(core, '0.9'));
  write('sitemap-entities.xml', urlset(entities, '0.8'));
  write('sitemap-data.xml', urlset(dataUrls, '0.4'));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${escapeXml(absolute('/sitemap-core.xml'))}</loc><lastmod>${buildDate}</lastmod></sitemap>\n  <sitemap><loc>${escapeXml(absolute('/sitemap-entities.xml'))}</loc><lastmod>${buildDate}</lastmod></sitemap>\n  <sitemap><loc>${escapeXml(absolute('/sitemap-data.xml'))}</loc><lastmod>${buildDate}</lastmod></sitemap>\n  <sitemap><loc>${escapeXml(absolute('/sitemap-images.xml'))}</loc><lastmod>${buildDate}</lastmod></sitemap>\n</sitemapindex>`);

  write('robots.txt', `# از شعر تا داده — دانشنامه داده‌ای شعر فارسی\n# Generated: ${buildDate}\nUser-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`);

  const llms = `# از شعر تا داده\n\n> اطلس تعاملی و دانشنامه داده‌ای شعر فارسی، کاری از حسین کریمی. شامل ${faNumber(data.overview.texts)} متن، ${faNumber(data.overview.couplets)} بیت، ${faNumber(data.overview.words)} واژه، ${faNumber(data.overview.poets.length)} شاعر و ${faNumber(data.overview.books)} عنوان کتاب.\n\n## پاسخ‌های اصلی\n- ترکیب موضوعی شعر فارسی در طول زمان تغییر معنادار دارد؛ سده حدود ${faPercent(data.topics.globalStats.rSquared * 100)} از تفاوت موضوعی میان شاعران را توضیح می‌دهد.\n- هیچ‌یک از ده خانواده استعاری بررسی‌شده کاملاً حذف نمی‌شود؛ الگوی غالب افت، بازگشت و رانش معنایی است.\n- پیوندهای متنی، شباهت محاسباتی‌اند و تأثیر تاریخی مستقیم را به‌تنهایی اثبات نمی‌کنند.\n- تاریخ‌گذاری هوش مصنوعی باید با حذف کامل شاعر آزمون ارزیابی شود تا مدل به‌جای سده، شاعر را نشناسد.\n- مدل نویسه‌ای در آزمون متوازن ${faNumber(data.stylometry.metrics.eligible_poets)} شاعر به دقت ${faPercent(data.stylometry.metrics.accuracy * 100)} رسیده است؛ نامتعارف آماری حکم انتساب نیست.\n- در مقایسه چهار قالب، قصیده جهان بیرونی را گسترش می‌دهد، غزل رابطه را فشرده می‌کند، رباعی معنا را کوتاه و ناگهانی جمع می‌کند و مثنوی زمان و روایت می‌سازد؛ قالب ${faPercent(formResearch.semantic.rSquared * 100)} از تفاوت معنایی نمونه را توضیح می‌دهد.\n- در پرسش‌های عمومی، «دل» ${faNumber(publicQuestionsResearch.questions[0].metrics[2].value, 2)} برابر «عقل» دیده شد؛ این عدد فراوانی واژه است، نه حکم فلسفی درباره احساس و خرد.\n\n## مسیرهای توصیه‌شده\n- [پژوهش‌ها](${absolute('/research/')})\n- [پرسش‌های کلیدی](${absolute('/questions/')})\n- [مضامین](${absolute('/themes/')})\n- [استعاره‌ها](${absolute('/metaphors/')})\n- [سده‌ها](${absolute('/centuries/')})\n- [شاعران](${absolute('/poets/')})\n- [روش‌شناسی](${absolute('/methodology/')})\n- [داده و API](${absolute('/data/')})\n- [داده چهار قالب](${absolute('/api/forms.json')})\n- [OpenAPI](${absolute('/openapi.json')})\n- [گراف دانش](${absolute('/api/knowledge-graph.json')})\n\n## قواعد نقل\n۱. عدد را همراه روش و محدودیت نقل کنید.\n۲. «قرابت محاسباتی» را با «تأثیر قطعی» جایگزین نکنید.\n۳. «نامتعارف آماری» را «انتساب نادرست» ننامید.\n۴. اندازه حضور شاعر در پیکره رتبه ادبی نیست.\n\n## استناد\nکریمی، حسین. «از شعر تا داده: اطلس تعاملی تحلیل داده‌های شعر فارسی». ${siteUrl}/\n`;
  const llmsExtended = llms
    .replace('\n\n## مسیرهای توصیه‌شده', `\n- در پژوهش جغرافیا، ${faPercent(geographyResearch.mobility.mobileRate * 100)} شاعران جابه‌جا تعریف شدند؛ تفاوت دوره‌ها معنادار بود، اما سبک منطقه‌ای و رابطه جابه‌جایی با نوآوری سبکی معنادار نشد.\n- در پژوهش نیمه‌عمر واژگان، میانه افت از اوج تا نصف ${faNumber(lexicalResearch.halfLife.medianCenturies, 2)} سده بود و ${faPercent(lexicalResearch.halfLife.censoredShare * 100)} واژه‌ها تا پایان پیکره به نصف اوج نرسیدند.\n\n## مسیرهای توصیه‌شده`)
    .replace(`- [داده چهار قالب](${absolute('/api/forms.json')})`, `- [داده چهار قالب](${absolute('/api/forms.json')})\n- [داده جغرافیای شعر](${absolute('/api/geography.json')})\n- [داده چرخه عمر واژگان](${absolute('/api/lexical-life.json')})
- [داده ممیزی انتساب](${absolute('/api/attribution.json')})
- [ده پرسش عمومی](${absolute('/api/public-questions.json')})`);
  write('llms.txt', llmsExtended);
  const llmsFull = `${llms}\n## ده مطالعهٔ پژوهشی\n${researchPages.map((p) => `### ${p.title}\n${p.answer}\nصفحه: ${absolute(p.path)}\n`).join('\n')}\n## یازده مضمون\n${data.topics.items.map((t) => `- ${t.name}: ${topicAnswer(t)} صفحه: ${absolute(`/themes/${topicSlugs[t.id]}/`)}`).join('\n')}\n\n## ده خانواده استعاری\n${data.metaphors.items.map((m) => `- ${m.name}: ${metaphorAnswer(m)} صفحه: ${absolute(`/metaphors/${metaphorSlugs[m.name]}/`)}`).join('\n')}\n\n## سده‌ها\n${data.overview.centuryStats.map((c) => `- سده ${faNumber(c.century)}: ${faNumber(c.texts)} متن، ${faNumber(c.poets)} شاعر. ${absolute(`/centuries/${c.century}/`)}`).join('\n')}\n\n## API\n- ${absolute('/api/content-index.json')}\n- ${absolute('/api/themes.json')}\n- ${absolute('/api/metaphors.json')}\n- ${absolute('/api/centuries.json')}\n- ${absolute('/api/poets.json')}\n- ${absolute('/api/forms.json')}\n- ${absolute('/api/knowledge-graph.json')}\n`;
  const llmsFullExtended = llmsFull
    .replace(llms, llmsExtended)
    .replace(`- ${absolute('/api/forms.json')}\n`, `- ${absolute('/api/forms.json')}\n- ${absolute('/api/geography.json')}\n- ${absolute('/api/lexical-life.json')}\n- ${absolute('/api/attribution.json')}\n- ${absolute('/api/public-questions.json')}\n`);
  write('llms-full.txt', llmsFullExtended);
  write('llms-data.txt', `# Data dictionary — از شعر تا داده\n\n- poet: نام شاعر\n- century: سده هجری منتسب به دوره زندگی شاعر\n- poems/texts: تعداد متن در پیکره\n- totalCouplets: تعداد ابیات؛ جفت‌سازی مصراع‌های جداشده در متن منبع و گردکردن واحد پایانی فرد در هر رکورد\n- totalWords: مجموع واژه‌های فارسی شاعر پس از نرمال‌سازی\n- share: سهم موضوع از ترکیب سده، به درصد\n- rate: نرخ نرمال‌شده رخداد\n- rho: ضریب روند اسپیرمن\n- qTrend: p-value اصلاح‌شده برای چندآزمونی\n- JSD: فاصله جنسن–شنون میان توزیع‌ها\n- NPMI: قدرت هم‌رخدادی نرمال‌شده\n- robustZ: فاصله مقاوم متن از مرکز سبک شاعر\n- center_city: کانون تقریبی فعالیت شاعر\n- route_km: طول تقریبی مسیر منتخب، به کیلومتر\n- half_life: زمان پس از اوج تا نصف فراوانی\n- right_censored: نرسیدن واژه به نصف اوج تا پایان پیکره\n\nOpenAPI: ${absolute('/openapi.json')}\nKnowledge graph: ${absolute('/api/knowledge-graph.json')}\n`);
}

function patchExistingPages() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.name.endsWith('.html')) files.push(target);
    }
  };
  walk(dist);
  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    if (html.includes('class="seo-header"') && !html.includes('href="/themes/"')) {
      html = html.replace('<a href="/research/">پژوهش‌ها</a><a href="/poets/">شاعران</a><a href="/data/">داده‌ها</a><a href="/methodology/">روش‌شناسی</a><a href="/glossary/">واژه‌نامه</a><a href="/about/">درباره</a>', '<a href="/research/">پژوهش‌ها</a><a href="/themes/">مضامین</a><a href="/metaphors/">استعاره‌ها</a><a href="/centuries/">سده‌ها</a><a href="/poets/">شاعران</a><a href="/data/">داده‌ها</a>');
    }
    if (!html.includes('name="generator"')) html = html.replace('<meta name="author"', '<meta name="generator" content="From Poetry to Data static knowledge layer 7.0"><meta name="author"');
    fs.writeFileSync(file, html, 'utf8');
  }
}

function validate() {
  const required = [
    'themes/index.html', 'metaphors/index.html', 'centuries/index.html', 'questions/index.html',
    'api/themes.json', 'api/metaphors.json', 'api/centuries.json', 'api/geography.json', 'api/lexical-life.json', 'api/attribution.json', 'api/public-questions.json', 'api/content-index.json', 'api/knowledge-graph.json',
    'openapi.json', 'citation.json', 'citation.bib', 'llms-data.txt', 'sitemap-core.xml', 'sitemap-entities.xml',
  ];
  const missing = required.filter((file) => !fs.existsSync(path.join(dist, file)));
  if (missing.length) throw new Error(`خروجی‌های GEO ناقص‌اند: ${missing.join(', ')}`);
  const counts = {
    themes: data.topics.items.filter((t) => fs.existsSync(path.join(dist, 'themes', topicSlugs[t.id], 'index.html'))).length,
    metaphors: data.metaphors.items.filter((m) => fs.existsSync(path.join(dist, 'metaphors', metaphorSlugs[m.name], 'index.html'))).length,
    centuries: data.overview.centuryStats.filter((c) => fs.existsSync(path.join(dist, 'centuries', String(c.century), 'index.html'))).length,
  };
  if (counts.themes !== 11 || counts.metaphors !== 10 || counts.centuries !== 13) throw new Error(`تعداد صفحات موجودیت اشتباه است: ${JSON.stringify(counts)}`);
  console.log(`SEO/GEO enhancement complete: ${counts.themes} themes, ${counts.metaphors} metaphors, ${counts.centuries} centuries, site=${siteUrl}`);
}

generateThemePages();
generateMetaphorPages();
generateCenturyPages();
generateQuestionsPage();
generateMachineKnowledge();
generateDiscovery();
patchExistingPages();
validate();
