# راهنمای دقیق به‌روزرسانی GitHub برای نسخهٔ ۶

## فایل‌هایی که باید جایگزین یا دوباره آپلود شوند

این فایل‌ها در مخزن موجودند و نسخهٔ تازهٔ آن‌ها باید جایگزین شود:

```text
package.json
package-lock.json
README.md
CHANGELOG.md
CITATION.cff
codemeta.json
index.html
src/App.jsx
src/chartOptions.js
src/styles.css
src/content/siteContent.js
scripts/postbuild.mjs
scripts/enhance-seo-geo.mjs
scripts/generate_data.py
scripts/generate-og.py
scripts/seo-audit.mjs
docs/GROWTH_PLAYBOOK.md
public/og/og-research.png
public/og/og-intertextuality.png
```

## فایل‌های جدیدی که باید اضافه شوند

```text
src/data/attributionResearch.json
scripts/generate_attribution_research.py
public/downloads/attribution-corpus-audit.csv
public/og/og-attribution.png
RELEASE_NOTES_V6.md
docs/GITHUB_UPDATE_FA.md
```

## فایلی که نباید حذف یا دوباره آپلود شود

```text
public/data/poems_with_more_info.tsv
```

همان نسخهٔ فعلی این فایل در مخزن کافی است. اسکریپت `npm run data:attribution` آن را از همین مسیر می‌خواند. بستهٔ تغییرات نسخهٔ ۶ عمداً فایل بزرگ خام را تکرار نمی‌کند.

## فایل‌هایی که نباید دستی با نسخهٔ قدیمی جایگزین شوند

```text
dist/**
```

در استقرار Vercel، پوشهٔ `dist` با دستور `npm run build` ساخته می‌شود. بنابراین منبع‌های بالا را commit کنید و اجازه دهید CI/Vercel خروجی تازه را بسازد. اگر مخزن شما مستقیماً `dist` را برای GitHub Pages منتشر می‌کند، پس از نصب وابستگی‌ها این دستورات را اجرا و سپس خروجی تازهٔ `dist` را commit کنید:

```bash
npm ci
npm run data:attribution
npm run build
```

## فایل حذفی

هیچ فایل منبعی برای حذف وجود ندارد.

## ترتیب پیشنهادی commit

```bash
git add package.json package-lock.json README.md CHANGELOG.md CITATION.cff codemeta.json index.html
git add src/App.jsx src/chartOptions.js src/styles.css src/content/siteContent.js
git add src/data/attributionResearch.json
git add scripts/postbuild.mjs scripts/enhance-seo-geo.mjs scripts/generate_data.py scripts/generate-og.py scripts/seo-audit.mjs scripts/generate_attribution_research.py
git add public/downloads/attribution-corpus-audit.csv
git add public/og/og-research.png public/og/og-intertextuality.png public/og/og-attribution.png
git add RELEASE_NOTES_V6.md docs/GITHUB_UPDATE_FA.md docs/GROWTH_PLAYBOOK.md
git commit -m "feat: add corpus-grounded poetry attribution research and UX redesign"
git push
```

## کنترل پس از انتشار

- مسیر `/research/attribution/` باز شود.
- بخش «انتساب و اعتبار شعر» در صفحهٔ اصلی دیده شود.
- تغییر حالت ساده/پژوهشی کار کند.
- فیلتر، آستانه و چیدمان نقشهٔ پیوند متنی کار کند.
- `/api/attribution.json` و `/downloads/attribution-corpus-audit.csv` در دسترس باشند.
- هیچ پیوندی به محل بیرونی فایل خام در رابط، صفحهٔ داده یا متادیتای عمومی دیده نشود.
