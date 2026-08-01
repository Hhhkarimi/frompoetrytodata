export const VARIANTS = {
  narrative: {
    label: 'روایت‌محور',
    shortLabel: 'A',
    description: 'شروع از یک پرسش روشن و حرکت گام‌به‌گام از روایت به شاهد و روش.',
  },
  explorer: {
    label: 'کاوش‌محور',
    shortLabel: 'B',
    description: 'شروع مستقیم از جست‌وجو، فیلتر و پیوند میان شاعر، سده، استعاره و موضوع.',
  },
  research: {
    label: 'پژوهش‌محور',
    shortLabel: 'C',
    description: 'شروع از یافته‌ها، اندازهٔ اثر، روش، محدودیت و دادهٔ بازتولیدپذیر.',
  },
  audience: {
    label: 'مخاطب‌محور',
    shortLabel: 'D',
    description: 'ورودی‌های جدا برای خوانندهٔ عمومی، پژوهشگر ادبی و پژوهشگر داده.',
  },
};

export const PAGES = ['home', 'poet', 'century', 'metaphor', 'finding'];
export const STATES = ['ready', 'loading', 'empty', 'error'];

export const CORPUS_SUMMARY = {
  records: 54524,
  couplets: 699999,
  words: 9725652,
  poets: 67,
  centuries: 13,
};

export const POET_COVERAGE = [
  { slug: 'hafez', name: 'حافظ', texts: 595, century: 'سدهٔ هشتم' },
  { slug: 'saadi', name: 'سعدی', texts: 1904, century: 'سدهٔ هفتم' },
  { slug: 'rumi', name: 'مولوی', texts: 6242, century: 'سدهٔ هفتم' },
  { slug: 'ferdowsi', name: 'فردوسی', texts: 616, century: 'سدهٔ چهارم و پنجم' },
];

export const RESEARCH_ITEMS = [
  { id: 'computational-aesthetics', title: 'زیبایی‌شناسی محاسباتی', kind: 'ارزیابی مدل', qualification: 'امتیازها خروجی GPT‑5.6‑sol و قواعد وزن‌دهی‌اند؛ ارزیابی انسانی نیستند' },
  { id: 'themes', title: 'تحول مضمون‌ها', kind: 'روند تاریخی', qualification: 'مبتنی بر سدهٔ منتسب و پوشش همین پیکره' },
  { id: 'metaphors', title: 'دگرگونی استعاره‌ها', kind: 'الگوی محاسباتی', qualification: 'خانوادهٔ استعاره تعریف عملیاتی دارد، نه معنای یگانهٔ ادبی' },
  { id: 'similarity', title: 'شباهت متنی شاعران', kind: 'شباهت آماری', qualification: 'شباهت متنی به‌تنهایی شاهد اثرگذاری یا بینامتنیت نیست' },
  { id: 'attribution', title: 'سنجش انتساب', kind: 'اولویت بازبینی', qualification: 'خروجی مدل حکم قطعی دربارهٔ اصالت نیست' },
];

export const METAPHOR_SERIES = [
  { label: 'سدهٔ پنجم', value: 18 },
  { label: 'سدهٔ هفتم', value: 31 },
  { label: 'سدهٔ هشتم', value: 28 },
  { label: 'سدهٔ یازدهم', value: 16 },
  { label: 'سدهٔ چهاردهم', value: 22 },
];

export const AUDIENCE_PATHS = [
  { id: 'reader', title: 'برای خوانندهٔ عمومی', task: 'یک پرسش روشن را با پاسخ کوتاه و شاهد قابل‌دیدن دنبال کنید.', next: 'روایت سیزده سده' },
  { id: 'literary', title: 'برای پژوهشگر ادبی', task: 'از یافته به متن، تعریف اصطلاح، محدودیت و citation برسید.', next: 'یافته‌ها و روش' },
  { id: 'data', title: 'برای پژوهشگر داده', task: 'طرح‌واره، متغیرها، دادهٔ دانلودی و مسیر بازتولید را بررسی کنید.', next: 'داده و بازتولید' },
];

// PROTOTYPE-ONLY: real rows are included only to evaluate the presentation.
// Production must consume the validated, generated study artifact instead.
export const HAFEZ_AESTHETIC_AXES = [
  { label: 'نمادپردازی', value: 92.0 },
  { label: 'تصویرسازی', value: 77.3 },
  { label: 'زبان مجازی', value: 87.3 },
  { label: 'موسیقی', value: 72.3 },
  { label: 'فشردگی معنا', value: 89.8 },
  { label: 'عاطفه', value: 71.9 },
  { label: 'ساختار', value: 69.8 },
  { label: 'تازگی بیان', value: 86.0 },
];

export const HAFEZ_AESTHETIC_COUPLETS = [
  { rank: 1, source: 'رباعیات، رباعی شماره ۲۵', first: 'ای دوست دل از جفای دشمن درکش', second: 'با روی نکو شراب روشن درکش', score: 85.29 },
  { rank: 2, source: 'قطعات، قطعه شماره ۹', first: 'دادگرا تو را فلک جرعه کش پیاله باد', second: 'دشمن دل سیاه تو غرقه به خون چو لاله باد', score: 84.80 },
  { rank: 3, source: 'غزلیات، غزل شماره ۱۷', first: 'تنم از واسطه دوری دلبر بگداخت', second: 'جانم از آتش مهر رخ جانانه بسوخت', score: 82.96 },
  { rank: 4, source: 'غزلیات، غزل شماره ۲۹۴', first: 'کوه صبرم نرم شد چون موم در دست غمت', second: 'تا در آب و آتش عشقت گدازانم چو شمع', score: 81.99 },
  { rank: 5, source: 'غزلیات، غزل شماره ۱۳۰', first: 'سحر بلبل حکایت با صبا کرد', second: 'که عشق روی گل با ما چه‌ها کرد', score: 81.01 },
  { rank: 6, source: 'غزلیات، غزل شماره ۳۸۸', first: 'بهار و گل طرب انگیز گشت و توبه شکن', second: 'به شادی رخ گل بیخ غم ز دل برکن', score: 80.97 },
  { rank: 7, source: 'غزلیات، غزل شماره ۲۹۴', first: 'در وفای عشق تو مشهور خوبانم چو شمع', second: 'شب نشین کوی سربازان و رندانم چو شمع', score: 80.23 },
  { rank: 8, source: 'غزلیات، غزل شماره ۱۹۴', first: 'سمن بویان غبار غم چو بنشینند بنشانند', second: 'پری رویان قرار از دل چو بستیزند بستانند', score: 79.70 },
  { rank: 9, source: 'غزلیات، غزل شماره ۳۸۹', first: 'ببار ای شمع اشک از چشم خونین', second: 'که شد سوز دلت بر خلق روشن', score: 79.60 },
  { rank: 10, source: 'غزلیات، غزل شماره ۳۹۲', first: 'گه چون نسیم با گل راز نهفته گفتن', second: 'گه سر عشقبازی از بلبلان شنیدن', score: 79.51 },
];
