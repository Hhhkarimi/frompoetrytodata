import Logo from './components/Logo.jsx';
import { audiencePaths, researchPages } from './content/siteContent.js';
import { faNumber } from './utils.js';
import { emitAnalyticsEvent } from './analytics/events.js';

export default function NarrativeHome({ summary }) {
  return (
    <div className="narrative-home">
      <a className="skip-link" href="#main">پرش به محتوای اصلی</a>
      <header className="narrative-header">
        <a href="/" aria-current="page"><Logo /></a>
        <nav aria-label="فهرست اصلی">
          <a href="/atlas/">اطلس</a>
          <a href="/research/">پژوهش‌ها</a>
          <a href="/methodology/">روش‌شناسی</a>
          <a href="/data/">داده‌ها</a>
        </nav>
      </header>

      <main id="main">
        <section className="narrative-hero" aria-labelledby="narrative-question">
          <div>
            <span className="eyebrow">روایت داده‌محور شعر فارسی</span>
            <h1 id="narrative-question">شعر فارسی در سیزده سده چگونه تغییر کرده است؟</h1>
            <p className="narrative-answer">
              داده‌ها از جابه‌جایی مضمون‌ها، دگرگونی خانواده‌های استعاری و
              تفاوت الگوهای زبانی خبر می‌دهند؛ اما این الگوها شاهد محاسباتی‌اند،
              نه حکم قطعی دربارهٔ ارزش ادبی یا علت تاریخی.
            </p>
            <div className="narrative-actions">
              <a className="primary-button" href="/atlas/" onClick={() => emitAnalyticsEvent('homepage_primary_action', { destination: '/atlas/', audience_path: 'explorer' })}>کاوش در اطلس</a>
              <a className="secondary-button" href="/research/" onClick={() => emitAnalyticsEvent('homepage_primary_action', { destination: '/research/', audience_path: 'research' })}>دیدن یافته‌های پژوهشی</a>
            </div>
          </div>
          <div className="narrative-scope" role="note" aria-label="دامنه پیکره">
            <strong>پیش از تفسیر</strong>
            <p>
              واحدهای این انتشار رکوردهای متنی پیکره‌اند و سده، عمدتاً سدهٔ
              منتسب به شاعر یا اثر است؛ نه تاریخ دقیق سرایش.
            </p>
            {summary && (
              <dl>
                <div><dt>متن</dt><dd>{faNumber(summary.texts)}</dd></div>
                <div><dt>شاعر</dt><dd>{faNumber(summary.poets)}</dd></div>
                <div><dt>سده</dt><dd>{faNumber(summary.centuries)}</dd></div>
                <div><dt>پژوهش</dt><dd>{faNumber(researchPages.length)}</dd></div>
              </dl>
            )}
          </div>
        </section>

        <section className="audience-entry" aria-labelledby="audience-title">
          <div className="narrative-section-heading">
            <span className="eyebrow">مسیر مناسب شما</span>
            <h2 id="audience-title">برای چه کاری آمده‌اید؟</h2>
            <p>همهٔ مسیرها به محتوای canonical یکسان می‌رسند؛ فقط نقطهٔ شروع فرق دارد.</p>
          </div>
          <div className="audience-entry-grid">
            {audiencePaths.map((path) => (
              <a href={path.href} className="audience-entry-card" onClick={() => emitAnalyticsEvent('audience_path_selected', { audience: path.label, destination: path.href })} key={path.title}>
                <span>{path.label}</span>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <strong>ادامه مسیر ←</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="narrative-research" aria-labelledby="research-title">
          <div className="narrative-section-heading">
            <span className="eyebrow">یافته، روش، داده</span>
            <h2 id="research-title">ده پرسش پژوهشی، با مرز ادعا</h2>
          </div>
          <div className="narrative-research-grid">
            {researchPages.slice(0, 4).map((page) => (
              <article key={page.id}>
                <span>{page.eyebrow}</span>
                <h3><a href={page.path}>{page.shortTitle}</a></h3>
                <p>{page.answer}</p>
                <p className="local-qualification"><strong>مرز ادعا:</strong> {page.qualification}</p>
              </article>
            ))}
          </div>
          <a className="secondary-button" href="/research/">مرکز پژوهش و همهٔ یافته‌ها</a>
        </section>
      </main>

      <footer className="narrative-footer">
        <Logo />
        <nav aria-label="پیوندهای پژوهشی">
          <a href="/methodology/">روش‌شناسی</a>
          <a href="/data/">دانلود داده</a>
          <a href="/glossary/">واژه‌نامه</a>
          <a href="/about/">درباره پروژه</a>
        </nav>
      </footer>
    </div>
  );
}
