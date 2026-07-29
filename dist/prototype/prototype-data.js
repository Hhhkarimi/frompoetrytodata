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
