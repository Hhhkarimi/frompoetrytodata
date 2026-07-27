# راهنمای دقیق به‌روزرسانی GitHub برای نسخهٔ ۷

این راهنما برای ارتقای مخزن از نسخهٔ ۶ به نسخهٔ ۷ است. فایل خام پیکره در مخزن باقی می‌ماند و نباید دوباره آپلود شود.

## ۱. فایل‌های جدیدی که باید اضافه شوند

این پنج فایل در نسخهٔ ۶ وجود نداشتند:

```text
RELEASE_NOTES_V7.md
scripts/generate_public_questions.py
src/data/publicQuestionsResearch.json
public/downloads/public-questions-analysis.csv
public/og/og-public-questions.png
```

## ۲. فایل‌های موجودی که باید جایگزین یا دوباره آپلود شوند

### متادیتا و مستندات

```text
CHANGELOG.md
CITATION.cff
README.md
SOURCE_MANIFEST_SHA256.txt
codemeta.json
docs/GITHUB_UPDATE_FA.md
docs/GROWTH_PLAYBOOK.md
index.html
package.json
package-lock.json
```

### رابط و محتوای سایت

```text
src/App.jsx
src/chartOptions.js
src/content/siteContent.js
src/styles.css
```

### تولید صفحات، API و ممیزی

```text
scripts/enhance-seo-geo.mjs
scripts/generate-og.py
scripts/postbuild.mjs
scripts/seo-audit.mjs
```

### تصاویر موجودی که در نسخهٔ ۷ بازتولید شده‌اند

```text
public/og-card.png
public/og/og-century-ai.png
public/og/og-data.png
public/og/og-forms.png
public/og/og-geography.png
public/og/og-glossary.png
public/og/og-home.png
public/og/og-lexical-life.png
public/og/og-metaphors.png
public/og/og-methodology.png
public/og/og-poets.png
public/og/og-research.png
public/og/og-stylometry.png
public/og/og-topics.png
```

## ۳. فایل‌هایی که نباید حذف یا دوباره آپلود شوند

```text
public/data/poems_with_more_info.tsv
```

همان فایل فعلی مخزن کافی است. اسکریپت‌های زیر آن را از همین مسیر داخلی می‌خوانند:

```bash
npm run data:attribution
npm run data:public-questions
```

یا:

```bash
npm run data:research
```

بسته‌های تحویل نسخهٔ ۷ عمداً فایل بزرگ TSV را تکرار نمی‌کنند. هیچ پیوندی به محل بیرونی آن نیز در رابط عمومی یا متادیتای سایت نمایش داده نمی‌شود.

## ۴. فایل حذفی

هیچ فایل منبعی نباید حذف شود.

## ۵. پوشهٔ dist

در Vercel پوشهٔ `dist` را از بستهٔ قبلی کپی یا دستی جایگزین نکنید. منبع‌ها را commit کنید تا Vercel با دستور زیر خروجی تازه را بسازد:

```bash
npm run build
```

اگر GitHub Pages مستقیماً از `dist` منتشر می‌شود، بعد از جایگزینی فایل‌های بالا اجرا کنید:

```bash
npm ci
npm run data:research
npm run build
```

سپس `dist/**` تازه را commit کنید. خروجی قدیمی `dist` را با نسخهٔ ۷ مخلوط نکنید.

## ۶. دستورهای پیشنهادی Git

ساده‌ترین روش، استخراج بستهٔ «فقط فایل‌های تغییرکرده» در ریشهٔ مخزن و سپس اجرای این دستورهاست:

```bash
git add RELEASE_NOTES_V7.md CHANGELOG.md CITATION.cff README.md SOURCE_MANIFEST_SHA256.txt codemeta.json index.html package.json package-lock.json
git add docs/GITHUB_UPDATE_FA.md docs/GROWTH_PLAYBOOK.md
git add src/App.jsx src/chartOptions.js src/content/siteContent.js src/styles.css src/data/publicQuestionsResearch.json
git add scripts/generate_public_questions.py scripts/enhance-seo-geo.mjs scripts/generate-og.py scripts/postbuild.mjs scripts/seo-audit.mjs
git add public/downloads/public-questions-analysis.csv
git add public/og-card.png public/og/og-public-questions.png
git add public/og/og-century-ai.png public/og/og-data.png public/og/og-forms.png public/og/og-geography.png public/og/og-glossary.png public/og/og-home.png
git add public/og/og-lexical-life.png public/og/og-metaphors.png public/og/og-methodology.png public/og/og-poets.png public/og/og-research.png public/og/og-stylometry.png public/og/og-topics.png
git commit -m "feat: add ten public poetry questions and corpus analysis"
git push
```

## ۷. کنترل قبل از push

```bash
npm run data:public-questions
npm run build
```

خروجی تحلیل باید اعلام کند که ۵۴٬۵۲۴ ردیف خوانده و ۱۳ رکورد توضیحی بلند کنار گذاشته شده‌اند.

## ۸. کنترل پس از انتشار

- بخش «کاوش» و عنوان «ده پرسش جذاب از هزار سال شعر فارسی» در صفحهٔ اصلی دیده شود.
- دکمهٔ «پرسش بعدی» سؤال و نمودار را تغییر دهد.
- هر ده تب پرسش قابل انتخاب باشند.
- مسیر `/research/public-questions/` باز شود.
- مسیر `/api/public-questions.json` یک JSON شامل ده پرسش برگرداند.
- مسیر `/downloads/public-questions-analysis.csv` قابل دانلود باشد.
- تصویر `/og/og-public-questions.png` نمایش داده شود.
- صفحهٔ `/data/` دو دانلود مربوط به پرسش‌های عمومی را نشان دهد.
- هیچ پیوندی به محل بیرونی فایل TSV در صفحات عمومی، Schema.org، OpenAPI یا فایل‌های llms دیده نشود.
- ممیزی SEO/GEO با ۱۰ پژوهش و بدون خطا پایان یابد.
