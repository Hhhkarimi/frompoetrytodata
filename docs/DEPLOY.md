# انتشار «از شعر تا داده» روی GitHub و Vercel

## ۱. اجرای کنترل نهایی

```bash
npm install
npm run build
npm run seo:audit
npm run preview
```

در پیش‌نمایش، صفحه اصلی، `/research/geography/`، `/research/lexical-life/`، `/poets/hafez/`، `/data/`، `/sitemap.xml` و `/llms.txt` را بررسی کنید.

## ۲. ساخت مخزن GitHub

```bash
git init
git add .
git commit -m "Release v5: geography and lexical lifecycle"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## ۳. اتصال به Vercel

- در Vercel گزینه `Add New` و سپس `Project` را انتخاب کنید.
- مخزن GitHub را Import کنید.
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

`vercel.json` تنظیمات build، کش دارایی‌های fingerprint‌شده، هدرهای امنیتی و trailing slash را ثبت کرده است.

## ۴. دامنه نهایی

اسکریپت build آدرس production را از متغیر سیستمی Vercel می‌گیرد. برای دامنه اختصاصی، در Project Settings یک متغیر محیطی بسازید:

```text
SITE_URL=https://your-domain.example
```

پس از تغییر دامنه، Redeploy کنید تا canonical، sitemap، JSON-LD، feed و llms با دامنه نهایی ساخته شوند.

اگر از همان دامنه پیش‌فرض Vercel استفاده می‌کنید، متغیر اجباری ندارید. `GOOGLE_SITE_VERIFICATION` و `BING_SITE_VERIFICATION` نیز فقط پس از دریافت کد تأیید از سرویس مربوطه اختیاری‌اند.

## ۵. ثبت در موتورهای جست‌وجو

- مالکیت دامنه را در Google Search Console و Bing Webmaster Tools ثبت کنید.
- `https://your-domain.example/sitemap.xml` را ارسال کنید.
- صفحه‌های `/research/`، `/poets/` و `/data/` را برای ایندکس اولیه بررسی کنید.
- کارت‌های Open Graph و داده‌های ساخت‌یافته را آزمایش کنید.

جزئیات کامل در `docs/SEO_GEO.md` آمده است.
