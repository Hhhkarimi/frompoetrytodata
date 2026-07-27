# راهنمای بارگذاری بستهٔ v4

این آرشیو یک overlay برای ریشهٔ مخزن `Hhhkarimi/poetrytodata` است. ابتدا سورس اصلی مخزن را دریافت کنید، سپس همهٔ مسیرهای داخل این بسته را با حفظ ساختار پوشه‌ها در ریشهٔ مخزن کپی کنید.

## اصلاحات v4

- canonical پروتوتایپ با دامنهٔ فعال build یعنی `https://poetrytodata.vercel.app/prototype/` هم‌راستا شده است.
- `og:title`، `og:image` و سایر متادیتای Open Graph اضافه شده‌اند.
- Twitter Card کامل اضافه شده است.
- JSON-LD معتبر از نوع `WebPage` اضافه شده است.
- تصویر اجتماعی محلی `public/prototype/og-image.png` اضافه شده است.
- متن HTML اولیه برای جلوگیری از هشدار محتوای بسیار کوتاه توسعه یافته است.
- آزمون رگرسیون شرایط `scripts/seo-audit.mjs` را پوشش می‌دهد.
- سند prototype دقیقاً یک `h1` دارد؛ عنوان fallback بدون JavaScript با `h2` نمایش داده می‌شود.
- آزمون رگرسیون شمارش `h1` به test suite و verifier اضافه شده است.

پس از کپی، این فرمان‌ها را در ریشهٔ سورس اصلی اجرا کنید:

```bash
node --test tests/prototype.test.mjs
node scripts/verify-prototype.mjs
npm run build
```

پوشهٔ `public/prototype/` دورریختنی است و پس از انتخاب جهت طراحی و پایان پیاده‌سازی production باید حذف شود.
