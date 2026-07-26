# معماری SEO و GEO نسخه ۳ «از شعر تا داده»

## هدف

نسخه ۳ سایت را از یک رابط تک‌صفحه‌ای به سه لایه مکمل تبدیل می‌کند:

1. **لایه تعاملی:** نمودارهای زنده React و ECharts برای کاوش عمومی.
2. **لایه دانشنامه‌ای:** HTML ایستا، مستقل و قابل ایندکس برای هر پژوهش، شاعر، مضمون، استعاره و سده.
3. **لایه ماشین‌خوان:** JSON، CSV، OpenAPI، Schema.org، sitemap و فایل‌های llms برای موتورهای جست‌وجو و سامانه‌های پاسخ‌گو.

## معماری URL

- `/research/` و هشت صفحه پژوهشی
- `/poets/` و ۶۷ نمایه شاعر
- `/themes/` و ۱۱ پرونده مضمون
- `/metaphors/` و ۱۰ پرونده خانواده استعاری
- `/centuries/` و ۱۳ پرونده سده‌ای
- `/questions/` پاسخ‌های مستقیم و FAQ
- `/data/` فهرست داده‌های قابل دانلود
- `/methodology/` روش‌شناسی و محدودیت‌ها
- `/glossary/` واژه‌نامه

هر صفحه موجودیت دارای این اجزاست:

- عنوان و توضیح یکتا
- canonical و hreflang فارسی
- پاسخ مستقیم در ابتدای صفحه
- جدول HTML معادل داده نمودار
- پیوند داخلی به موجودیت‌های مرتبط
- JSON-LD متناسب با نوع صفحه
- فایل JSON مستقل با `rel=alternate`
- بلوک استناد پایدار
- توضیح محدودیت و مرز تفسیر

## داده‌های ساخت‌یافته

اسکیماهای اصلی:

- `WebSite` و `WebPage`
- `Person` برای سازنده و شاعران
- `Dataset` و `DataCatalog`
- `ScholarlyArticle` برای مطالعات و پرونده‌های تحلیلی
- `ProfilePage` برای نمایه شاعران
- `DefinedTermSet` و `DefinedTerm` برای مضامین و استعاره‌ها
- `CollectionPage` و `ItemList` برای سده‌ها و فهرست‌ها
- `FAQPage` برای پرسش‌های کلیدی
- `BreadcrumbList` برای مسیر صفحه

## لایه GEO

- `/llms.txt`: نقشه کوتاه، پاسخ‌های اصلی و قواعد نقل
- `/llms-full.txt`: یافته‌های تفصیلی، موجودیت‌ها و URLها
- `/llms-data.txt`: فرهنگ فیلدها و اصطلاحات داده
- `/openapi.json`: تعریف APIهای فقط‌خواندنی
- `/api/content-index.json`: نمایه همه صفحات و موجودیت‌ها
- `/api/knowledge-graph.json`: گراف دانش Schema.org
- `/api/themes/`، `/api/metaphors/` و `/api/centuries/`: داده هر موجودیت

اصول محتوایی GEO:

1. پاسخ روشن پیش از جزئیات ارائه می‌شود.
2. عدد همراه روش و محدودیت است.
3. واژه‌های پرخطر مانند «تأثیر» و «انتساب» مرزبندی می‌شوند.
4. نمودارها جایگزین متنی و جدول HTML دارند.
5. موجودیت‌ها URL پایدار و نام فارسی یکتا دارند.
6. استناد، نسخه و تاریخ به‌روزرسانی ثبت می‌شود.

## sitemap

`/sitemap.xml` یک sitemap index است و فایل‌های زیر را معرفی می‌کند:

- `sitemap-core.xml`
- `sitemap-entities.xml`
- `sitemap-data.xml`
- `sitemap-images.xml`

## ممیزی خودکار

فرمان ساخت تولیدی، ممیزی را نیز اجرا می‌کند:

```bash
npm run build
```

برای اجرای مستقل:

```bash
npm run seo:audit
```

ممیزی نسخه ۳ موارد زیر را کنترل می‌کند:

- عنوان، description، canonical، robots، H1 و زبان/جهت
- Open Graph و Twitter Card
- اعتبار JSON-LD و JSONهای API
- لینک‌های داخلی شکسته
- URLهای sitemap و وجود فایل متناظر
- تکرار عنوان، description و canonical
- alt و ابعاد تصاویر
- وجود ۶۷ شاعر، ۱۱ مضمون، ۱۰ استعاره و ۱۳ سده
- فایل‌های llms، OpenAPI، گراف دانش و آیکن‌های PWA
- بودجه تقریبی فایل‌های JavaScript و CSS

## متغیرهای محیطی

```text
SITE_URL=https://domain.example
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
```

در Vercel، دامنه تولیدی از `VERCEL_PROJECT_PRODUCTION_URL` خوانده می‌شود. برای دامنه اختصاصی، `SITE_URL` را صریح تنظیم کنید تا canonical و sitemap همیشه روی دامنه نهایی ساخته شوند.

## سنجش موفقیت

- تعداد URLهای معتبر و ایندکس‌شده
- Impression و CTR صفحات موجودیت، نه فقط صفحه اصلی
- عبارت‌های جست‌وجوی نام شاعر + سده/موضوع/استعاره
- دانلود CSV و JSON
- ورودی مستقیم به صفحات پژوهشی
- ارجاع دامنه در موتورهای پاسخ‌گو
- Core Web Vitals: LCP، INP و CLS
- خطاهای Rich Results و Dataset markup
