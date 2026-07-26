# از شعر تا داده

**اطلس تعاملی و چندصفحه‌ای تحلیل داده‌های شعر فارسی — کاری از حسین کریمی**

«از شعر تا داده» هشت مطالعه پژوهشی را برای مخاطب عمومی، پژوهشگر و داده‌کاو در یک تجربه بصری فارسی ارائه می‌کند. رابط اصلی نمودارهای زنده دارد و فرایند build هم‌زمان یک دانشنامه ایستا و قابل ایندکس می‌سازد.

## فصل‌های پژوهش

1. رودخانه تحول مضامین شعر فارسی
2. تولد، خاموشی و دگرگونی استعاره‌ها
3. شبکه بینامتنیت و قرابت شاعران
4. تشخیص سده شعر با هوش مصنوعی
5. اثر انگشت سبکی و کشف شعرهای نامتعارف
6. مقایسه تکامل غزل، قصیده، رباعی و مثنوی
7. جغرافیای تخیل و مهاجرت شعر فارسی
8. نیمه‌عمر واژگان در شعر فارسی

## ویژگی‌های نسخه ۵

- ۲۷ نمودار تعاملی با Apache ECharts
- صفحات مستقل برای هشت پژوهش، همه ۶۷ شاعر، ۱۱ مضمون، ۱۰ خانواده استعاری و ۱۳ سده
- متن و جدول معادل برای نمودارها، قابل خواندن بدون JavaScript
- Schema.org برای Dataset، Article، ProfilePage، FAQ، Person، Breadcrumb و واژه‌نامه
- sitemap عمومی و تصویری، robots.txt، RSS، JSON Feed و OpenSearch
- `llms.txt`، `llms-full.txt` و `llms-data.txt` برای GEO و بازیابی توسط سامانه‌های هوش مصنوعی
- OpenAPI ایستا، گراف دانش Schema.org و نمایه جامع محتوا برای عامل‌های هوش مصنوعی
- صفحه پرسش‌های کلیدی با پاسخ‌های مستقیم و FAQ Schema
- APIهای JSON و خروجی‌های CSV قابل استناد
- نمودار سهم شاعران با سه معیار قابل‌تغییر: تعداد متن، تعداد بیت و تعداد واژه
- کارت Open Graph اختصاصی برای هر فصل
- پیش‌رندر صفحه اصلی و بارگذاری تنبل نمودارها
- ممیزی خودکار SEO/GEO و GitHub Actions
- رابط راست‌به‌چپ، اعداد فارسی، فونت Vazirmatn و استفاده نمایشی از ایران‌نستعلیق
- حالت روشن و تاریک و طراحی واکنش‌گرا

## اجرای محلی

نیازمند Node.js نسخه ۲۲.۱۲ یا جدیدتر:

```bash
npm install
npm run dev
```

ساخت و ممیزی نسخه تولیدی:

```bash
npm run build
npm run seo:audit
npm run preview
```

## استقرار روی Vercel

پروژه را در GitHub قرار دهید و در Vercel Import کنید. تنظیمات از قبل در `vercel.json` ثبت شده‌اند:

```text
Framework: Vite
Build Command: npm run build
Output Directory: dist
Node.js: 22
```

فرایند ساخت، دامنه production را از متغیر سیستمی Vercel می‌خواند. برای دامنه اختصاصی می‌توان متغیر زیر را تعیین کرد:

```text
SITE_URL=https://your-domain.example
```

راهنمای مرحله‌به‌مرحله در [`docs/DEPLOY.md`](./docs/DEPLOY.md) و چک‌لیست کامل SEO/GEO در [`docs/SEO_GEO.md`](./docs/SEO_GEO.md) آمده است. برنامه انتشار و رشد محتوایی نیز در [`docs/GROWTH_PLAYBOOK.md`](./docs/GROWTH_PLAYBOOK.md) قرار دارد.

## معماری خروجی

```text
src/App.jsx                     تجربه تعاملی اصلی
src/components/Chart.jsx        بارگذاری تنبل نمودارها
src/content/siteContent.js      محتوای صفحات پژوهش و FAQ
src/data/atlasData.json         خروجی‌های تحلیلی
src/data/poetCouplets.json      تعداد ابیات هر شاعر در پیکره
src/data/geographyResearch.json پژوهش هفتم و شاخص‌های جغرافیایی
src/data/lexicalResearch.json   پژوهش هشتم و چرخه عمر واژگان
scripts/postbuild.mjs           تولید صفحات ایستا، Schema، sitemap و API
scripts/seo-audit.mjs           ممیزی خودکار SEO/GEO
public/og/                      کارت‌های اشتراک‌گذاری
public/poets/                   تصاویر منتخب شاعران
public/downloads/geography/     ۱۵ جدول داده پژوهش جغرافیا
dist/research/                  هشت صفحه پژوهشی تولیدشده
dist/poets/                     ۶۷ نمایه شاعر تولیدشده
dist/api/ و dist/downloads/     JSON و CSV
```

## URLهای مهم پس از build

- `/research/` مرکز پژوهش‌ها
- `/poets/` نمایه همه شاعران
- `/themes/` یازده پرونده موضوعی
- `/metaphors/` ده پرونده استعاری
- `/centuries/` سیزده نمایه سده‌ای
- `/questions/` پاسخ‌های مستقیم و مستند
- `/data/` داده باز و فرهنگ فیلدها
- `/methodology/` روش‌شناسی و محدودیت‌ها
- `/glossary/` واژه‌نامه ساده
- `/attributions/` اعتبار منابع و مجوزها
- `/sitemap.xml` نقشه سایت
- `/llms.txt` راهنمای کوتاه برای مدل‌های زبانی
- `/llms-full.txt` نسخه تفصیلی یافته‌ها و محدودیت‌ها
- `/openapi.json` تعریف APIهای ایستا
- `/api/knowledge-graph.json` گراف دانش پروژه
- `/api/geography.json` خلاصه ساخت‌یافته پژوهش هفتم
- `/api/lexical-life.json` خلاصه ساخت‌یافته پژوهش هشتم

## به‌روزرسانی داده

مسیر TSV در `scripts/generate_data.py` ثبت شده است. پس از به‌روزرسانی داده خام:

```bash
npm run data:generate
npm run build
npm run seo:audit
```

تعداد بیت با جفت‌کردن مصراع‌های جداشده در متن منبع محاسبه می‌شود؛ اگر یک رکورد واحد پایانیِ فرد داشته باشد، آن واحد یک بیت شمرده می‌شود. این تعریف برای بازتولیدپذیری در فرهنگ داده و خروجی API نیز ثبت شده است.

## فونت‌ها و تصاویر

فونت‌ها در مخزن بازتوزیع نشده‌اند. Vazirmatn و ایران‌نستعلیق هنگام نمایش از منابع عمومی بارگذاری می‌شوند و fallback فارسی تعریف شده است. منابع و مجوز تصاویر در [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md) و صفحه `/attributions/` ثبت می‌شوند.

## استناد و متادیتا

- [`CITATION.cff`](./CITATION.cff)
- [`codemeta.json`](./codemeta.json)
- [`CHANGELOG.md`](./CHANGELOG.md)

## مجوز

کد رابط کاربری با مجوز MIT ارائه شده است. داده‌های شعر، تصاویر و فونت‌ها تابع شرایط منابع اصلی هستند.

## سازنده

**کاری از حسین کریمی**  
[LinkedIn](https://www.linkedin.com/in/hossein-karimi-8a452153/)
