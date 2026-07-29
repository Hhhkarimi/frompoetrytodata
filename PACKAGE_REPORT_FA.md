# گزارش تحویل بستهٔ discovery و prototype

تاریخ: ۲۰۲۶-۰۷-۲۷

## چه چیزی بررسی شد

- ساختار عمومی مخزن، README و معماری اعلام‌شدهٔ Vite/React و post-build؛
- مسیرهای سایت مستقر، مرکز پژوهش، صفحهٔ داده، روش‌شناسی و نمایهٔ شاعران؛
- جریان TSV → Python generators → JSON/CSV → React/static pages/API؛
- ریسک‌های دسترس‌پذیری نمودار، RTL، URL state، citation، metadata و منبع واحد آمار؛
- راهنمایی اولیهٔ W3C، web.dev، Google Search، Schema.org و DataCite.

## تصمیم‌های تثبیت‌شده

- GitHub Issues مسئله‌نگار پروژه است.
- `AGENTS.md` راهنمای عامل و `CONTEXT.md` مدل دامنهٔ مشترک است.
- پوشش پیکره از اهمیت ادبی و نفوذ تاریخی جداست.
- دادهٔ خام، سنجهٔ محاسباتی، شاهد آماری و تفسیر ادبی چهار لایهٔ متمایزند.
- ادعاهای حساس قید روش‌شناختی محلی دارند.
- جزئیات با افشای تدریجی ارائه می‌شود، اما هشدار ضروری پنهان نمی‌ماند.

## پروتوتایپ منتخب

هنوز هیچ گزینه‌ای انتخاب نشده است. چهار جهت A تا D در `/prototype/` آمادهٔ مقایسه‌اند. طبق workflow، specification و production implementation عمداً شروع نشده‌اند.

## فایل‌ها و ماژول‌های افزوده‌شده

- تنظیمات عامل و دامنه: `AGENTS.md`, `CONTEXT.md`, `docs/agents/**`, `docs/adr/**`
- تحقیق و بررسی: `docs/discovery/**`, `docs/research/**`, `docs/architecture/**`
- پروتوتایپ: `public/prototype/index.html`, `prototype.css`, `prototype-data.js`, `prototype.js`
- آزمون و راستی‌آزمایی: `tests/prototype.test.mjs`, `scripts/verify-prototype.mjs`
- مرور و انتخاب: `docs/reviews/**`, `docs/prototypes/from-poetry-to-data/**`

هیچ فایل production موجود، دادهٔ TSV، پژوهش یا route فعلی جایگزین نشده است.

## آزمون‌های افزوده و اجراشده

- هفت آزمون Node روی semantics، RTL، fallback بدون JavaScript، URL state، دادهٔ نمونه، focus/mobile CSS، chart-table equivalence و disposable isolation؛
- `node --check` برای دو ماژول JavaScript؛
- parser استاندارد HTML؛
- verifier مستقل فایل‌ها و قرارداد URL.

نتیجه: همهٔ آزمون‌های قابل اجرا سبز هستند.

## بهبودهای دسترس‌پذیری در پروتوتایپ

- `lang="fa"` و `dir="rtl"`؛
- skip link و focus قابل مشاهده؛
- کنترل‌های بومی و قابل‌صفحه‌کلید؛
- CSS logical properties و reduced motion؛
- توضیح و قید پیش از نمودار؛
- جدول معادل با همان منبع داده؛
- حالت‌های loading/empty/error با پیام معنایی؛
- fallback بدون JavaScript.

## اثر عملکرد

پروتوتایپ بدون وابستگی خارجی و بدون کتابخانهٔ نمودار ساخته شده و فقط در مسیر دورریختنی بارگذاری می‌شود. اثر تولیدی اندازه‌گیری نشده، زیرا production code تغییر نکرده است. اهداف پیشنهادی LCP/INP/CLS در سند پژوهش ثبت شده‌اند.

## کنترل‌های یکپارچگی داده

- نمونهٔ تعداد متن چهار شاعر با دادهٔ مشاهده‌شدهٔ نمایهٔ مستقر هماهنگ است.
- نمودار و جدول از یک آرایه ساخته می‌شوند.
- ADR پیشنهادی برای منبع واحد آمار، JSON/CSV و صفحه ثبت شده است.
- اعداد نمایشی خانوادهٔ استعاره صریحاً غیرتولیدی و غیرقابل استناد برچسب خورده‌اند.

## محدودیت‌های باقی‌مانده

- clone کامل مخزن و اجرای build/lint/test production در این محیط ممکن نبود.
- دسترسی نوشتن به GitHub Issues وجود نداشت.
- headless Chromium در container برای screenshot/Browser check پایان نمی‌یافت؛ این محدودیت محیطی با تغییر کد دور زده نشد.
- علت اختلاف «ده پژوهش در README» و «نه پژوهش در استقرار» بدون لاگ build/deploy مشخص نیست.
- specification و production implementation منتظر انتخاب جهت است.

## کار اختیاری بعدی

پس از انتخاب A/B/C/D یا hybrid، specification کامل تهیه و در GitHub Issue ثبت شود؛ سپس checkout واقعی مخزن، audit فایل‌های hotspot، TDD تولیدی، build، SEO/a11y و browser checks انجام شوند.

## اصلاح سازگاری build

نسخهٔ v2 به فایل `public/prototype/index.html` یک canonical خودارجاع برای مسیر `/prototype/` افزوده است. این اصلاح مانع خطای `Missing canonical` در اعتبارسنجی `scripts/postbuild.mjs` می‌شود و با آزمون رگرسیون پوشش داده شده است.

## اصلاح build در نسخهٔ v3

صفحهٔ `public/prototype/index.html` اکنون تمام الزامات مسدودکنندهٔ audit مخزن را دارد: Open Graph، تصویر اجتماعی محلی، Twitter Card و JSON-LD معتبر. canonical نیز با دامنهٔ تولیدی اعلام‌شدهٔ `frompoetrytodata.vercel.app` هم‌راستا شده و آزمون رگرسیون برای این قراردادها افزوده شده است.


## اصلاح build در نسخهٔ v4

صفحهٔ `public/prototype/index.html` اکنون دقیقاً یک `h1` دارد. عنوان fallback داخل `noscript` از `h1` به `h2` تغییر کرده تا ساختار معنایی آن حفظ شود، بدون اینکه audit مخزن دو عنوان اصلی برای یک سند بشمارد. شمارش دقیق `h1` نیز به آزمون و verifier مستقل اضافه شده است.
