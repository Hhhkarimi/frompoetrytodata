# From Poetry to Data disposable prototypes

این پوشه و مسیر `/prototype/` عمداً **disposable** هستند. هدف، مقایسهٔ جهت‌های تجربهٔ کاربری پیش از هر تغییر در production routes است. هیچ فایل این پوشه نباید بدون مشخصات تأییدشده و بازنویسی مناسب مستقیماً به اجزای محصول منتقل شود.

## URL contract

- `/prototype/?variant=narrative&page=home&state=ready`
- `/prototype/?variant=explorer&page=home&q=حافظ&century=هشتم`
- `/prototype/?variant=research&page=finding&state=ready`
- `/prototype/?variant=audience&page=poet&state=ready`

پارامترها:

- `variant`: `narrative | explorer | research | audience`
- `page`: `home | poet | century | metaphor | finding`
- `state`: `ready | loading | empty | error`
- `q` و `century`: نمونهٔ فیلترهای قابل‌اشتراک

## چهار جهت

### A — Narrative-first

یک سؤال بزرگ در ابتدای تجربه، سپس حرکت مرحله‌ای از پاسخ کوتاه به شاهد، روش و محدودیت. مناسب‌ترین گزینه برای مخاطب عمومی است، اما برای رسیدن سریع پژوهشگر به جدول و دانلود یک لایهٔ اضافه ایجاد می‌کند.

### B — Explorer-first

جست‌وجو و فیلتر نقطهٔ شروع‌اند. برای بازدیدکننده‌ای که شاعر، سده یا مفهوم مشخصی در ذهن دارد سریع است؛ اما ممکن است مخاطب تازه‌وارد بدون یک پرسش هدایت‌گر سردرگم شود.

### C — Research-first

یافته‌ها، نوع شاهد، مرز ادعا، روش، citation و دانلود در اولویت‌اند. برای پژوهشگر روشن و کارآمد است؛ در صفحهٔ نخست می‌تواند خشک‌تر و پرجزئیات‌تر به نظر برسد.

### D — Audience-based

سه مسیر مجزا برای خوانندهٔ عمومی، پژوهشگر ادبی و پژوهشگر داده. نیازها را آشکار می‌کند، اما خطر تکرار محتوا یا انتخاب دشوار هویت در نخستین ورود را دارد.

## نمونه‌های پوشش‌داده‌شده

- صفحهٔ شاعر
- صفحهٔ سده
- صفحهٔ خانوادهٔ استعاره
- صفحهٔ نتیجهٔ پژوهش
- نمودار و جدول معادل از یک آرایهٔ داده
- جست‌وجو و فیلتر با URL قابل اشتراک
- حالت‌های loading، empty و error
- fallback بدون JavaScript
- صفحه‌آرایی RTL و موبایل
- focus state قابل مشاهده و کنترل‌های بومی مرورگر

## تصمیم لازم

مالک محصول باید یک جهت یا ترکیب صریح از جهت‌ها را انتخاب کند. بعد از انتخاب، `to-spec` اجرا می‌شود و تنها رفتارهای تأییدشده به specification و سپس production implementation منتقل می‌شوند.
