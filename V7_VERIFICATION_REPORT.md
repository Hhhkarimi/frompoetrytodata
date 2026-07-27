# گزارش اعتبارسنجی نسخهٔ ۷ Next.js

تاریخ بررسی: ۲۰۲۶-۰۷-۲۷

## مبنای سازگاری

نسخه برای ساختار Next.js App Router فعلی طراحی شده است. صفحهٔ اصلی موجود جایگزین نمی‌شود و قابلیت‌های تازه در مسیر مستقل `app/research` قرار گرفته‌اند.

## آزمون‌های موفق

- پارس و Transpile فایل `app/layout.tsx`: موفق، بدون Diagnostic
- پارس و Transpile فایل `app/research/layout.tsx`: موفق، بدون Diagnostic
- پارس و Transpile فایل `app/research/page.tsx`: موفق، بدون Diagnostic
- TypeScript strict check با اعلان‌های شبیه‌سازی‌شدهٔ React، Next و Lucide: موفق
- بررسی نحوی دو اسکریپت Python با `py_compile`: موفق
- بررسی نحوی `scripts/verify_v7_patch.mjs` با `node --check`: موفق
- اعتبار JSON مربوط به ده پرسش و پرونده‌های انتساب: موفق
- تعداد پرسش‌ها: ۱۰
- تعداد پرونده‌های انتساب: ۳
- CSV پرسش‌های عمومی: ۱۹۲ ردیف شامل Header
- CSV ممیزی انتساب: ۲۶ ردیف شامل Header
- توازن آکولادهای دو فایل CSS تازه: موفق
- بررسی وجود تمام Importهای محلی: موفق
- بررسی نبود نشانی مخزن اصلی یا Raw GitHub در صفحهٔ عمومی `/research`: موفق
- بررسی سازگاری پیام‌های صفحهٔ پیکره با Web Worker فعلی: موفق
- اجرای `scripts/verify_v7_patch.mjs` روی یک مخزن شبیه‌سازی‌شده با ساختار فعلی: موفق

## حفاظت در برابر عقب‌گرد

- `app/page.tsx` تغییر نکرده است.
- `app/globals.css` تغییر نکرده است.
- `app/data.ts` تغییر نکرده است.
- Web Worker و TSV تغییر نکرده‌اند.
- هیچ وابستگی npm جدیدی اضافه نشده است.
- فایل‌های Vite، `src`، `index.html` و `dist` در بسته وجود ندارند.

## محدودیت محیط بررسی

در محیط تولید بسته، پکیج‌های Next.js و React نصب نبودند و دسترسی مستقیم به رجیستری npm نیز فراهم نبود؛ بنابراین اجرای واقعی `next build` در همان Container ممکن نشد. برای کاهش ریسک، فایل‌ها با تنظیمات TypeScript سازگار با `moduleResolution: bundler` بررسی شدند و هیچ خطای نوع یا Syntax باقی نماند. اجرای نهایی `npm ci && npm run build` باید در Clone واقعی مخزن یا Vercel انجام شود.
