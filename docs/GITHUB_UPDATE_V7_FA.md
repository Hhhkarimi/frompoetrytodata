# راهنمای دقیق به‌روزرسانی GitHub به نسخهٔ ۷

این راهنما مخصوص مخزن Next.js فعلی است.

## نتیجه‌ای که باید بعد از استقرار ببینید

1. در پایین سمت چپ تمام صفحات یک دکمه با عنوان «پژوهش‌های تازه» نمایش داده می‌شود.
2. با کلیک روی آن، مسیر `/research` باز می‌شود.
3. در این صفحه دو تب وجود دارد:
   - ده پرسش برای همه
   - انتساب و اصالت‌سنجی

## فایل موجودی که باید جایگزین شود

فقط این فایل را دوباره آپلود و Replace کنید:

```text
app/layout.tsx
```

این نسخه همان فونت‌ها و Metadata فعلی را حفظ می‌کند و فقط فایل CSS میان‌بر و لینک `/research` را اضافه می‌کند.

## فایل‌های جدیدی که باید اضافه شوند

```text
app/v7-shortcut.css
app/research/layout.tsx
app/research/page.tsx
app/research/research.module.css
app/research-data.json
app/attribution-data.json
public/downloads/public-questions-analysis.csv
public/downloads/attribution-corpus-audit.csv
scripts/generate_public_questions.py
scripts/generate_attribution_research.py
scripts/verify_v7_patch.mjs
RELEASE_NOTES_V7.md
docs/GITHUB_UPDATE_V7_FA.md
V7_VERIFICATION_REPORT.md
```

## فایل‌های حذفی

هیچ فایل یا پوشه‌ای را حذف نکنید.

## فایل‌هایی که نباید تغییر یا دوباره آپلود شوند

```text
app/page.tsx
app/globals.css
app/data.ts
app/chatgpt-auth.ts
public/data/poems_with_more_info.tsv
public/workers/poetry-dataset-worker.js
package.json
package-lock.json
next.config.ts
tsconfig.json
vercel.json
```

به‌ویژه فایل بزرگ TSV را دست نزنید. تحلیل‌های JSON و CSV همراه این بسته آماده‌اند و صفحهٔ فعلی پیکره همچنان همان فایل و همان Web Worker موجود را استفاده می‌کند.

## روش پیشنهادی با Git

پوشهٔ ZIP را در یک مسیر موقت Extract کنید. محتویات داخل آن را روی ریشهٔ Clone مخزن کپی کنید؛ پوشهٔ والد یا خود ZIP را داخل مخزن نگذارید.

```bash
cd Persian-Literature-Digital-Atlas

# فایل‌های بسته را با حفظ مسیرها روی ریشهٔ مخزن کپی کنید.
node scripts/verify_v7_patch.mjs
npm ci
npm run typecheck
npm run lint
npm run test:dataset
npm run build

git add \
  app/layout.tsx \
  app/v7-shortcut.css \
  app/research \
  app/research-data.json \
  app/attribution-data.json \
  public/downloads/public-questions-analysis.csv \
  public/downloads/attribution-corpus-audit.csv \
  scripts/generate_public_questions.py \
  scripts/generate_attribution_research.py \
  scripts/verify_v7_patch.mjs \
  RELEASE_NOTES_V7.md \
  docs/GITHUB_UPDATE_V7_FA.md \
  V7_VERIFICATION_REPORT.md

git commit -m "Add Next.js research experience v7"
git push origin main
```

## کنترل قبل از Commit

خروجی فرمان زیر باید با عبارت `V7 verification passed` آغاز شود:

```bash
node scripts/verify_v7_patch.mjs
```

همچنین این فرمان نباید فایلی خارج از فهرست بالا نشان دهد:

```bash
git status --short
```

## تنظیم Vercel

- Framework Preset: Next.js
- Root Directory: خالی یا `.`
- Build Command: `npm run build`
- Output Directory: Override نشود
- متغیر محیطی تازه‌ای لازم نیست

## بازتولید تحلیل‌ها در آینده

این دو فرمان JSON و CSV را از فایل TSV داخلی پروژه دوباره تولید می‌کنند:

```bash
python scripts/generate_public_questions.py
python scripts/generate_attribution_research.py
```

اجرای این فرمان‌ها برای استقرار نسخهٔ تحویلی لازم نیست؛ خروجی‌های آماده داخل بسته قرار دارند.
