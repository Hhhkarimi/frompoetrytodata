# گزارش تحویل نسخهٔ ۶

## خلاصه

- فایل‌های تغییرکرده یا جدید: 25
- فایل‌های حذف‌شده: 0
- فایل خام `public/data/poems_with_more_info.tsv` در بسته تکرار نشده و باید در مخزن فعلی حفظ شود.
- پوشهٔ `dist` در بستهٔ منبع قرار نگرفته و باید با `npm run build` در CI/Vercel ساخته شود.

## فایل‌های تغییرکرده یا جدید

- `CHANGELOG.md`
- `CITATION.cff`
- `README.md`
- `RELEASE_NOTES_V6.md`
- `codemeta.json`
- `docs/GITHUB_UPDATE_FA.md`
- `docs/GROWTH_PLAYBOOK.md`
- `index.html`
- `package-lock.json`
- `package.json`
- `public/downloads/attribution-corpus-audit.csv`
- `public/og/og-attribution.png`
- `public/og/og-intertextuality.png`
- `public/og/og-research.png`
- `scripts/enhance-seo-geo.mjs`
- `scripts/generate-og.py`
- `scripts/generate_attribution_research.py`
- `scripts/generate_data.py`
- `scripts/postbuild.mjs`
- `scripts/seo-audit.mjs`
- `src/App.jsx`
- `src/chartOptions.js`
- `src/content/siteContent.js`
- `src/data/attributionResearch.json`
- `src/styles.css`

## فایل‌های حذف‌شده

- هیچ فایل منبعی حذف نشده است.

## آزمون‌های انجام‌شده

- پارس و transpile فایل `src/App.jsx` با پارسر TypeScript: موفق
- بررسی نحوی JavaScript و Python: موفق
- تولید صفحات ایستا و API پژوهش انتساب: موفق
- ممیزی SEO/GEO روی ۱۲۳ صفحه و ۲۸۹۱ لینک داخلی: موفق، بدون هشدار
- build کامل Vite: اجرا نشد؛ دریافت وابستگی‌ها از رجیستری npm در محیط اجرا timeout شد.
