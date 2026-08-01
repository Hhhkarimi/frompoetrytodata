import {
  AUDIENCE_PATHS,
  CORPUS_SUMMARY,
  HAFEZ_AESTHETIC_AXES,
  HAFEZ_AESTHETIC_COUPLETS,
  METAPHOR_SERIES,
  PAGES,
  POET_COVERAGE,
  RESEARCH_ITEMS,
  STATES,
  VARIANTS,
} from './prototype-data.js';

const app = document.querySelector('#prototype-app');
const URL_STATE_KEYS = ['variant', 'page', 'state', 'q', 'century'];
const number = new Intl.NumberFormat('fa-IR');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const getState = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    variant: Object.hasOwn(VARIANTS, params.get('variant')) ? params.get('variant') : 'narrative',
    page: PAGES.includes(params.get('page')) ? params.get('page') : 'home',
    state: STATES.includes(params.get('state')) ? params.get('state') : 'ready',
    q: params.get('q') ?? '',
    century: params.get('century') ?? 'all',
  };
};

const makeUrl = (updates = {}) => {
  const params = new URLSearchParams(window.location.search);
  const current = getState();
  for (const key of URL_STATE_KEYS) {
    const value = updates[key] ?? current[key];
    if (value && value !== 'all') params.set(key, value);
    else params.delete(key);
  }
  return `?${params.toString()}`;
};

const setUrlState = (updates, { replace = true } = {}) => {
  const nextUrl = makeUrl(updates);
  if (replace) history.replaceState(null, '', nextUrl);
  else history.pushState(null, '', nextUrl);
  render();
};

const qualification = (text) => `<p class="qualification"><strong>قید روش‌شناختی:</strong> ${escapeHtml(text)}</p>`;

const renderVariantSwitcher = (activeVariant) => `
  <section class="variant-switcher" aria-labelledby="variant-title">
    <div>
      <p class="eyebrow">چهار جهت عمداً متفاوت</p>
      <h1 id="variant-title">جهت طراحی را مقایسه کنید</h1>
      <p>هر گزینه همان دامنه و داده را با اولویت اطلاعاتی متفاوت ارائه می‌کند.</p>
    </div>
    <div class="variant-tabs" role="group" aria-label="انتخاب جهت طراحی">
      ${Object.entries(VARIANTS).map(([key, item]) => `
        <a class="variant-tab" data-active="${key === activeVariant}" aria-current="${key === activeVariant ? 'page' : 'false'}" href="${makeUrl({ variant: key, page: 'home' })}">
          <span aria-hidden="true">${item.shortLabel}</span>
          <strong>${item.label}</strong>
          <small>${item.description}</small>
        </a>
      `).join('')}
    </div>
  </section>`;

const renderUtilityBar = (state) => `
  <div class="utility-bar" aria-label="ابزارهای بررسی پروتوتایپ">
    <span>صفحهٔ نمونه:</span>
    ${PAGES.map((page) => `<a data-current="${page === state.page}" aria-current="${page === state.page ? 'page' : 'false'}" href="${makeUrl({ page })}">${({home:'خانه', poet:'شاعر', century:'سده', metaphor:'استعاره', finding:'یافته'})[page]}</a>`).join('')}
    <label>وضعیت
      <select id="state-select">
        ${STATES.map((item) => `<option value="${item}" ${item === state.state ? 'selected' : ''}>${({ready:'آماده', loading:'بارگذاری', empty:'خالی', error:'خطا'})[item]}</option>`).join('')}
      </select>
    </label>
  </div>`;

const summaryStats = () => `
  <dl class="summary-stats" aria-label="خلاصهٔ پیکره">
    <div><dt>متن</dt><dd>${number.format(CORPUS_SUMMARY.records)}</dd></div>
    <div><dt>بیت</dt><dd>${number.format(CORPUS_SUMMARY.couplets)}</dd></div>
    <div><dt>واژه</dt><dd>${number.format(CORPUS_SUMMARY.words)}</dd></div>
    <div><dt>شاعر</dt><dd>${number.format(CORPUS_SUMMARY.poets)}</dd></div>
  </dl>`;

const renderEvidencePair = (dataset, options = {}) => {
  const max = Math.max(...dataset.map((item) => item.texts ?? item.value));
  const title = options.title ?? 'نمونهٔ داده';
  const note = options.note ?? 'جدول و نمودار از یک آرایهٔ داده ساخته می‌شوند.';
  const rows = dataset.map((item) => ({ label: item.name ?? item.label, value: item.texts ?? item.value }));
  return `
    <section class="evidence-pair" aria-labelledby="evidence-title">
      <div class="section-heading">
        <div><p class="eyebrow">شاهد قابل بررسی</p><h2 id="evidence-title">${escapeHtml(title)}</h2></div>
        <p>${escapeHtml(note)}</p>
      </div>
      <div class="chart-and-table">
        <figure>
          <svg aria-hidden="true" viewBox="0 0 640 260" focusable="false">
            ${rows.map((item, index) => {
              const width = Math.max(8, Math.round((item.value / max) * 420));
              const y = 20 + index * 58;
              return `<g><text x="620" y="${y + 25}" text-anchor="end">${escapeHtml(item.label)}</text><rect x="120" y="${y}" width="${width}" height="32" rx="8"></rect><text x="${Math.max(130, 110 + width)}" y="${y + 23}" text-anchor="end">${number.format(item.value)}</text></g>`;
            }).join('')}
          </svg>
          <figcaption>${escapeHtml(note)}</figcaption>
        </figure>
        <div class="table-scroll" tabindex="0" aria-label="جدول دادهٔ نمودار">
          <table>
            <caption>${escapeHtml(title)}؛ نسخهٔ جدولی معادل نمودار</caption>
            <thead><tr><th scope="col">مورد</th><th scope="col">مقدار</th></tr></thead>
            <tbody>${rows.map((item) => `<tr><th scope="row">${escapeHtml(item.label)}</th><td>${number.format(item.value)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>`;
};

const narrativeHome = () => `
  <section class="narrative-hero">
    <p class="eyebrow">یک پرسش، سیزده سده، چند نوع شاهد</p>
    <h2>شعر فارسی در گذر زمان چگونه تغییر کرده است؟</h2>
    <p class="lead">با یک پاسخ ساده شروع کنید؛ بعد شاهد، تعریف عملیاتی، محدودیت و دادهٔ خام را مرحله‌به‌مرحله ببینید.</p>
    <div class="hero-actions"><a class="primary-action" href="#story-steps">داستان را آغاز کنید</a><a href="/methodology/">روش‌شناسی</a><a href="/data/">داده‌ها</a></div>
    ${summaryStats()}
  </section>
  <section id="story-steps" class="story-steps" aria-labelledby="story-title">
    <div class="section-heading"><div><p class="eyebrow">روایت سه‌لایه</p><h2 id="story-title">از مشاهده تا تفسیر محتاطانه</h2></div></div>
    <ol>
      <li><span>۱</span><div><h3>چه چیزی دیده‌ایم؟</h3><p>تغییر فراوانی و هم‌نشینی واژه‌ها در پیکرهٔ موجود.</p></div></li>
      <li><span>۲</span><div><h3>چطور سنجیده‌ایم؟</h3><p>واحد تحلیل، موازنهٔ شاعر و تعریف خانوادهٔ مفهومی روشن می‌شود.</p></div></li>
      <li><span>۳</span><div><h3>چه چیزی نمی‌توان گفت؟</h3><p>روند پیکره جایگزین اهمیت ادبی، نفوذ تاریخی یا علت‌مندی نیست.</p></div></li>
    </ol>
  </section>
  ${renderEvidencePair(POET_COVERAGE, { title: 'اندازهٔ حضور چند شاعر در پیکره', note: 'این اعداد پوشش پیکره‌اند، نه رتبهٔ ادبی یا نفوذ تاریخی.' })}
`;

const explorerHome = (state) => {
  const query = state.q.trim();
  const filtered = POET_COVERAGE.filter((poet) => {
    const matchesQuery = !query || poet.name.includes(query);
    const matchesCentury = state.century === 'all' || poet.century.includes(state.century);
    return matchesQuery && matchesCentury;
  });
  return `
    <section class="explorer-hero">
      <div><p class="eyebrow">مستقیم وارد داده شوید</p><h2>شاعر، سده، استعاره یا رابطه را پیدا کنید</h2><p>هر فیلتر در URL ثبت می‌شود تا نتیجه قابل اشتراک و بازگشت باشد.</p></div>
      <form id="explorer-form" class="search-panel" role="search">
        <label for="explorer-q">جست‌وجو در نمونهٔ شاعران</label>
        <div class="search-row"><input id="explorer-q" name="q" value="${escapeHtml(state.q)}" placeholder="مثلاً حافظ" /><button type="submit">جست‌وجو</button></div>
        <label for="explorer-century">سده</label>
        <select id="explorer-century" name="century"><option value="all">همهٔ سده‌ها</option><option value="هفتم" ${state.century === 'هفتم' ? 'selected' : ''}>سدهٔ هفتم</option><option value="هشتم" ${state.century === 'هشتم' ? 'selected' : ''}>سدهٔ هشتم</option></select>
      </form>
    </section>
    <section aria-labelledby="results-title">
      <div class="section-heading"><div><p class="eyebrow">نتیجهٔ نمونه</p><h2 id="results-title">${number.format(filtered.length)} مورد</h2></div><button id="copy-filter" type="button">کپی پیوند فیلتر</button></div>
      ${filtered.length ? `<div class="result-grid">${filtered.map((poet) => `<article><p class="badge">${poet.century}</p><h3><a href="${makeUrl({ page: 'poet', q: poet.name })}">${poet.name}</a></h3><p>${number.format(poet.texts)} متن در پیکره</p><p class="microcopy">پوشش پیکره، نه ارزیابی ادبی</p></article>`).join('')}</div>` : renderEmpty('برای این ترکیب فیلتر نتیجه‌ای در نمونه نیست.')}
    </section>
    <section class="entity-map" aria-labelledby="entity-map-title"><h2 id="entity-map-title">مسیرهای کاوش</h2><div class="result-grid"><a href="${makeUrl({ page:'poet' })}">شاعران</a><a href="${makeUrl({ page:'century' })}">سده‌ها</a><a href="${makeUrl({ page:'metaphor' })}">استعاره‌ها</a><a href="${makeUrl({ page:'finding' })}">روابط و یافته‌ها</a></div></section>
  `;
};

const researchHome = () => `
  <section class="research-hero">
    <div><p class="eyebrow">یافته، روش، شواهد، بازتولید</p><h2>مرکز نتایج پژوهشی</h2><p>ابتدا نتیجه و درجهٔ اطمینان را ببینید؛ سپس تعریف، جدول، citation و دادهٔ دانلودی را باز کنید.</p></div>
    <div class="research-actions"><a class="primary-action" href="/research/">همهٔ پژوهش‌ها</a><a href="/methodology/">روش کامل</a><a href="/data/">دانلود داده</a></div>
  </section>
  <section class="research-ledger" aria-labelledby="ledger-title">
    <div class="section-heading"><div><p class="eyebrow">دفتر یافته‌ها</p><h2 id="ledger-title">نتیجه‌ها با مرز ادعا</h2></div></div>
    ${RESEARCH_ITEMS.map((item, index) => `<article><div><span class="finding-number">${number.format(index + 1)}</span><p class="badge">${item.kind}</p></div><div><h3>${item.title}</h3>${qualification(item.qualification)}<div class="inline-actions"><a href="${makeUrl({ page:'finding' })}">شاهد و جدول</a><a href="/methodology/">روش</a><button type="button" data-citation="${item.id}">کپی citation</button></div></div></article>`).join('')}
  </section>
  ${renderEvidencePair(METAPHOR_SERIES, { title: 'نمونهٔ روند یک خانوادهٔ استعاری', note: 'مقادیر نمایشی برای مقایسهٔ طراحی‌اند و نباید به‌عنوان نتیجهٔ تولیدی استناد شوند.' })}
`;

const audienceHome = () => `
  <section class="audience-hero"><p class="eyebrow">از هدف خودتان شروع کنید</p><h2>امروز برای چه کاری آمده‌اید؟</h2><p>محتوا یکی است؛ ترتیب، واژگان و عمق پیش‌فرض متناسب با کار مخاطب تغییر می‌کند.</p></section>
  <section class="audience-paths" aria-label="مسیرهای مخاطبان">
    ${AUDIENCE_PATHS.map((path, index) => `<article data-audience="${path.id}"><span class="audience-index">${number.format(index + 1)}</span><h3>${path.title}</h3><p>${path.task}</p><a href="${makeUrl({ page: path.id === 'reader' ? 'home' : 'finding' })}">${path.next}</a></article>`).join('')}
  </section>
  <section class="shared-core"><div><p class="eyebrow">هستهٔ مشترک</p><h2>یک حقیقت، سه سطح ورود</h2></div><ul><li>قید ضروری همیشه در نمای اصلی</li><li>تعریف اصطلاح کنار نخستین کاربرد</li><li>دسترسی مستقیم به جدول، citation و دانلود</li></ul></section>
  ${renderEvidencePair(POET_COVERAGE, { title: 'نمونهٔ شاهد مشترک برای همهٔ مسیرها', note: 'خواننده توضیح کوتاه می‌بیند؛ پژوهشگر به جدول و تعریف واحد تحلیل دسترسی مستقیم دارد.' })}
`;

const renderCoupletTable = (rows) => `
  <div class="table-scroll" tabindex="0" aria-label="جدول ده بیت با بالاترین امتیاز محاسباتی حافظ">
    <table>
      <caption>بیت‌های حافظ در نمونهٔ واقعی پروتوتایپ؛ رتبه فقط درون همین شاعر است.</caption>
      <thead><tr><th scope="col">رتبه</th><th scope="col">بیت</th><th scope="col">منبع</th><th scope="col">نمرهٔ کل</th></tr></thead>
      <tbody>${rows.map((item) => `<tr><th scope="row">${number.format(item.rank)}</th><td><span class="couplet-lines">${escapeHtml(item.first)}<br>${escapeHtml(item.second)}</span></td><td>${escapeHtml(item.source)}</td><td>${number.format(item.score)}</td></tr>`).join('')}</tbody>
    </table>
  </div>`;

const renderAestheticDisclosure = () => `
  <aside class="ai-disclosure" aria-labelledby="ai-disclosure-title">
    <p class="eyebrow">منشأ ارزیابی</p>
    <h3 id="ai-disclosure-title">این امتیازدهی انسانی نیست</h3>
    <p>هشت شاخص توسط GPT‑5.6‑sol ارزیابی شده‌اند و نمرهٔ کل از ترکیب وزن‌دار همان خروجی‌ها ساخته شده است. امتیاز، داوری قطعی دربارهٔ زیبایی یا ارزش ادبی نیست.</p>
    <a href="/methodology/">روش، وزن‌ها و محدودیت‌ها</a>
  </aside>`;

const renderPoetPage = (state) => {
  const query = state.q.trim();
  const rows = HAFEZ_AESTHETIC_COUPLETS.filter((item) => !query || `${item.first} ${item.second} ${item.source}`.includes(query));
  return `
  <article class="entity-page">
    <header><p class="eyebrow">صفحهٔ نمونهٔ شاعر</p><h2>حافظ</h2><p class="lead">نمایی از حضور حافظ در پیکره، مسیرهای پژوهشی مرتبط و دسترسی به متن و روش.</p>${qualification('تعداد متن و الگوهای محاسباتی، اندازهٔ پوشش همین پیکره‌اند و رتبهٔ ادبی یا نفوذ تاریخی را نشان نمی‌دهند.')}</header>
    <div class="entity-summary"><dl><div><dt>سدهٔ منتسب</dt><dd>هشتم</dd></div><div><dt>میانگین ده انتخاب</dt><dd>${number.format(81.61)}</dd></div><div><dt>بیشترین نمره</dt><dd>${number.format(85.29)}</dd></div></dl><div><h3>مسیرهای مرتبط</h3><a href="${makeUrl({ page:'finding' })}">پژوهش زیبایی‌شناسی</a><a href="${makeUrl({ page:'metaphor' })}">استعاره‌ها</a><a href="/methodology/">روش‌شناسی</a></div></div>
    <section class="prototype-study-section" aria-labelledby="poet-aesthetics-title">
      <div class="section-heading"><div><p class="eyebrow">پروفایل هشت‌شاخصی</p><h2 id="poet-aesthetics-title">ده بیت با بالاترین امتیاز زیبایی‌شناختی محاسباتی</h2></div><p>میانگین هر شاخص فقط بر ده انتخاب همین شاعر محاسبه شده است.</p></div>
      ${renderAestheticDisclosure()}
      ${renderEvidencePair(HAFEZ_AESTHETIC_AXES, { title: 'میانگین هشت شاخص در ده انتخاب حافظ', note: 'نمودار میله‌ای و جدول از همان داده ساخته شده‌اند؛ مقیاس همهٔ شاخص‌ها صفر تا صد است.' })}
      <form id="couplet-filter" class="inline-filter" role="search">
        <label for="couplet-q">جست‌وجو در بیت و منبع</label>
        <div class="search-row"><input id="couplet-q" name="q" value="${escapeHtml(state.q)}" placeholder="مثلاً شمع یا غزل ۲۹۴"><button type="submit">اعمال فیلتر</button></div>
      </form>
      <p class="result-status" role="status">${number.format(rows.length)} بیت نمایش داده می‌شود.</p>
      ${rows.length ? renderCoupletTable(rows) : renderEmpty('در ده انتخاب حافظ، بیت یا منبعی مطابق این عبارت پیدا نشد.')}
    </section>
  </article>`;
};

const renderCenturyPage = () => `
  <article class="entity-page">
    <header><p class="eyebrow">صفحهٔ نمونهٔ سده</p><h2>سدهٔ هشتم</h2><p class="lead">چکیدهٔ روندهای محاسباتی، شاعران حاضر و پرسش‌های پژوهشی مربوط به این بازه.</p>${qualification('سده بر پایهٔ انتساب شاعر/اثر در داده است؛ زمان دقیق سرایش بسیاری از متن‌ها معلوم نیست.')}</header>
    <div class="century-grid"><section><h3>چه چیزی تغییر می‌کند؟</h3><p>فراوانی و هم‌نشینی خانواده‌های واژگانی، با شاعرمتوازن‌سازی و نمایش اندازهٔ نمونه.</p></section><section><h3>چه چیزی ثابت نمی‌شود؟</h3><p>افزایش یا کاهش یک شاخص به‌تنهایی علت تاریخی یا داوری زیبایی‌شناختی نیست.</p></section><section><h3>مسیر بعدی</h3><p><a href="${makeUrl({ page:'poet' })}">شاعران این سده</a> · <a href="/data/">دادهٔ دانلودی</a></p></section></div>
    ${renderEvidencePair(METAPHOR_SERIES, { title: 'جایگاه سدهٔ هشتم در روند نمونه', note: 'این سری صرفاً دادهٔ نمایشی پروتوتایپ است؛ عدد تولیدی باید از منبع واحد محاسباتی بیاید.' })}
  </article>`;

const renderMetaphorPage = () => `
  <article class="entity-page">
    <header><p class="eyebrow">صفحهٔ نمونهٔ استعاره</p><h2>خانوادهٔ روشنایی و تاریکی</h2><p class="lead">تعریف عملیاتی، واژه‌های عضو، روند زمانی و نمونهٔ متنی در یک صفحهٔ قابل‌بررسی.</p>${qualification('«خانوادهٔ استعاره» یک گروه‌بندی محاسباتی از نشانه‌هاست و همهٔ کاربردها الزاماً استعاری یا هم‌معنا نیستند.')}</header>
    <div class="definition-card"><h3>تعریف عملیاتی</h3><p>مجموعه‌ای مستند از واژه‌ها و الگوهای هم‌نشینی که برای یک سنجش مشخص به‌کار می‌رود.</p><details><summary>واژه‌ها و قواعد عضویت</summary><p>در محصول نهایی، فهرست واژه، نسخهٔ فرهنگ، قواعد حذف ابهام و تاریخ تولید اینجا ثبت می‌شود.</p></details></div>
    ${renderEvidencePair(METAPHOR_SERIES, { title: 'روند نمونهٔ خانوادهٔ روشنایی و تاریکی', note: 'نمودار و جدول یک داده را بازنمایی می‌کنند؛ تفسیر ادبی نیازمند خوانش متن است.' })}
  </article>`;

const aestheticsVariantIntro = (variant) => {
  if (variant === 'explorer') return {
    eyebrow: 'از شاعر و شاخص شروع کنید',
    title: 'کاوشگر زیبایی‌شناسی محاسباتی',
    copy: 'شاعر را پیدا کنید، هشت شاخص را کنار هم ببینید و از هر نتیجه به ده بیت و منبع آن برسید.',
  };
  if (variant === 'research') return {
    eyebrow: 'ادعا، روش، منشأ، بازاستفاده',
    title: 'ارزیابی محاسباتی زیبایی در ۶۷۶٬۷۴۸ بیت',
    copy: 'نتیجه‌ها همراه با تعریف شاخص، وزن، منشأ ارزیابی مدل، محدودیت، جدول، citation و دادهٔ ماشین‌خوان منتشر می‌شوند.',
  };
  if (variant === 'audience') return {
    eyebrow: 'یک پژوهش، چند مسیر خواندن',
    title: 'زیبایی شعر را چگونه می‌توان محاسباتی کاوید؟',
    copy: 'خواننده از یک بیت و توضیح روشن آغاز می‌کند؛ پژوهشگر به روش و محدودیت می‌رسد و کاربر داده CSV و JSON را دریافت می‌کند.',
  };
  return {
    eyebrow: 'از یک پرسش دشوار آغاز کنیم',
    title: 'آیا می‌توان زیبایی یک بیت را با داده کاوید؟',
    copy: 'مدل هشت جنبهٔ قابل‌اندازه‌گیری را کنار هم می‌گذارد تا نامزدهای پُرتراکم را پیدا کند؛ نتیجه پایان نقد ادبی نیست، آغاز خوانش نزدیک است.',
  };
};

const renderFindingPage = (state) => {
  const intro = aestheticsVariantIntro(state.variant);
  return `
  <article class="finding-page">
    <header class="aesthetics-hero"><p class="eyebrow">${intro.eyebrow}</p><h2>${intro.title}</h2><p class="lead">${intro.copy}</p><div class="hero-actions"><a class="primary-action" href="${makeUrl({ page:'poet', q:'' })}">دیدن نمونهٔ حافظ</a><a href="/methodology/">روش پژوهش</a><a href="/data/">CSV و JSON</a></div>${qualification('نمره‌ها ارزیابی محاسباتی مدل در همین پیکره‌اند؛ جایگزین داوری انسانی، اهمیت ادبی یا اجماع زیبایی‌شناختی نیستند.')}</header>
    <section class="study-facts" aria-label="دامنهٔ پژوهش"><dl><div><dt>بیت یکتای امتیازدهی‌شده</dt><dd>${number.format(676748)}</dd></div><div><dt>شاعر یا پدیدآورنده</dt><dd>${number.format(67)}</dd></div><div><dt>انتخاب درون هر شاعر</dt><dd>${number.format(10)}</dd></div><div><dt>شاخص محاسباتی</dt><dd>${number.format(8)}</dd></div></dl></section>
    <section>
      ${renderAestheticDisclosure()}
      <div class="finding-grid"><section><h3>پاسخ کوتاه</h3><p>مدل می‌تواند بیت‌های پُرتراکم را برای خوانش نزدیک اولویت‌بندی کند، اما «زیباتر بودن» را به‌صورت انسانی اثبات نمی‌کند.</p></section><section><h3>واحد تحلیل</h3><p>بیت دو‌مصراعی؛ در شعر نو، دو سطر متوالی همان‌گونه که از پیکره استخراج شده است.</p></section><section><h3>مسیر بازبینی</h3><p><a href="/methodology/">روش و وزن‌ها</a> · <a href="/data/">CSV/JSON</a> · <button type="button" data-citation="aesthetics">کپی استناد</button></p></section></div>
    </section>
    ${renderEvidencePair(HAFEZ_AESTHETIC_AXES, { title: 'نمونهٔ پروفایل هشت‌شاخصی حافظ', note: 'نمونهٔ واقعی برای سنجش طراحی؛ مقدارها میانگین ده انتخاب حافظ و روی مقیاس صفر تا صد هستند.' })}
    <section class="prototype-method"><h2>از ارزیابی مدل تا نتیجهٔ قابل‌بررسی</h2><ol><li><strong>ارزیابی هشت شاخص</strong><span>GPT‑5.6‑sol؛ بدون امتیازدهی انسانی</span></li><li><strong>ترکیب وزن‌دار</strong><span>وزن‌های مستند و نمرهٔ کل صفر تا صد</span></li><li><strong>کنترل کیفیت و تنوع</strong><span>ده انتخاب درون هر شاعر با منبع</span></li><li><strong>انتشار هم‌ارز</strong><span>صفحه، جدول، CSV و JSON از یک داده</span></li></ol></section>
  </article>`;
};

const renderLoading = () => `<section class="state-panel" aria-busy="true"><div class="skeleton wide"></div><div class="skeleton"></div><div class="skeleton"></div><p>در حال بارگذاری داده و توضیح روش…</p></section>`;
const renderEmpty = (message = 'برای این انتخاب داده‌ای وجود ندارد.') => `<section class="state-panel"><h2>نتیجه‌ای پیدا نشد</h2><p>${escapeHtml(message)}</p><a href="${makeUrl({ state:'ready', q:'', century:'all' })}">پاک‌کردن فیلترها</a></section>`;
const renderError = () => `<section class="state-panel error" role="alert"><h2>داده بارگذاری نشد</h2><p>آخرین دادهٔ تأییدشده نمایش داده نشده است؛ برای جلوگیری از عدد نادرست، نمودار پنهان مانده.</p><button type="button" id="retry-state">تلاش دوباره</button><a href="/data/">رفتن به داده‌های دانلودی</a></section>`;

const renderReadyPage = (state) => {
  if (state.page === 'poet') return renderPoetPage(state);
  if (state.page === 'century') return renderCenturyPage();
  if (state.page === 'metaphor') return renderMetaphorPage();
  if (state.page === 'finding') return renderFindingPage(state);
  if (state.variant === 'explorer') return explorerHome(state);
  if (state.variant === 'research') return researchHome();
  if (state.variant === 'audience') return audienceHome();
  return narrativeHome();
};

const bindInteractions = () => {
  document.querySelector('#state-select')?.addEventListener('change', (event) => setUrlState({ state: event.target.value }));
  document.querySelector('#retry-state')?.addEventListener('click', () => setUrlState({ state: 'ready' }));
  document.querySelector('#explorer-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUrlState({ q: form.get('q'), century: form.get('century'), state: 'ready' });
  });
  document.querySelector('#couplet-filter')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUrlState({ q: form.get('q'), state: 'ready' });
  });
  document.querySelector('#copy-filter')?.addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      event.currentTarget.textContent = 'پیوند کپی شد';
    } catch {
      event.currentTarget.textContent = 'نشانی را از نوار مرورگر کپی کنید';
    }
  });
  document.querySelectorAll('[data-citation]').forEach((button) => button.addEventListener('click', async (event) => {
    const citation = 'Karimi, H. From Poetry to Data. Prototype citation placeholder; replace with the published dataset citation.';
    try {
      await navigator.clipboard.writeText(citation);
      event.currentTarget.textContent = 'citation کپی شد';
    } catch {
      event.currentTarget.textContent = citation;
    }
  }));
};

const render = () => {
  const state = getState();
  document.body.dataset.variant = state.variant;
  const stateContent = state.state === 'loading' ? renderLoading() : state.state === 'empty' ? renderEmpty() : state.state === 'error' ? renderError() : renderReadyPage(state);
  app.innerHTML = `${renderVariantSwitcher(state.variant)}${renderUtilityBar(state)}<div class="prototype-canvas">${stateContent}</div>`;
  bindInteractions();
};

window.addEventListener('popstate', render);
render();
