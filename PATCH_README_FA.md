# بستهٔ مرحلهٔ discovery و prototype برای «از شعر تا داده»

این ZIP یک overlay کم‌خطر برای مخزن `Hhhkarimi/frompoetrytodata` است. شامل تنظیمات عامل، مدل دامنه، ADRها، گزارش بررسی، پژوهش مبتنی بر منابع اولیه، گزارش معماری، چهار پروتوتایپ دورریختنی و آزمون‌های آن‌هاست.

## آنچه این بسته نیست

این بسته پیاده‌سازی تولیدی یا redesign نهایی نیست. طبق workflow تأییدشده، انتخاب جهت طراحی و specification باید پیش از تغییر production انجام شود.

## نصب روی یک checkout تمیز

از ریشهٔ مخزن:

```bash
unzip frompoetrytodata-discovery-prototype-package.zip -d /tmp/frompoetrytodata-overlay
rsync -av /tmp/frompoetrytodata-overlay/ ./
node --test tests/prototype.test.mjs
node scripts/verify-prototype.mjs
```

سپس dev server موجود مخزن را اجرا کنید و مسیر زیر را باز کنید:

```text
/prototype/?variant=narrative&page=home&state=ready
```

## جهت‌ها

- A: `variant=narrative`
- B: `variant=explorer`
- C: `variant=research`
- D: `variant=audience`

## صفحات نمونه

- `page=home`
- `page=poet`
- `page=century`
- `page=metaphor`
- `page=finding`

## وضعیت‌ها

- `state=ready`
- `state=loading`
- `state=empty`
- `state=error`

## کنترل‌های اجراشده

```bash
node --test tests/prototype.test.mjs
node scripts/verify-prototype.mjs
node --check public/prototype/prototype.js
node --check public/prototype/prototype-data.js
```

## گام بعدی اجباری

پس از مشاهدهٔ چهار جهت، مالک محصول باید یک جهت یا ترکیب دقیق را انتخاب کند. سپس `to-spec` روی همان تصمیم اجرا می‌شود. هیچ فایل production در این بسته تغییر نکرده است.
