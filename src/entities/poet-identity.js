export const POET_SLUGS = Object.freeze({
  'رودکی': 'rudaki', 'فردوسی': 'ferdowsi', 'کسایی': 'kasaei', 'ابوسعید ابوالخیر': 'abu-saeid-abul-kheir',
  'ناصرخسرو': 'naser-khosrow', 'باباطاهر': 'baba-taher', 'هجویری': 'hojviri', 'اسدی توسی': 'asadi-tusi',
  'فخرالدین اسعد گرگانی': 'fakhr-al-din-asad-gorgani', 'منوچهری': 'manuchehri', 'فرخی سیستانی': 'farrokhi-sistani',
  'مسعود سعد سلمان': 'masud-sad-salman', 'عطار': 'attar', 'سنایی': 'sanai', 'انوری': 'anvari', 'خاقانی': 'khaghani',
  'نظامی': 'nezami', 'خیام': 'khayyam', 'نصرالله منشی': 'nasrallah-monshi', 'باباافضل کاشانی': 'baba-afzal-kashani',
  'مهستی گنجوی': 'mahasti-ganjavi', 'عبدالواسع جبلی': 'abd-al-vase-jabali', 'مولوی': 'rumi', 'سعدی': 'saadi',
  'خواجوی کرمانی': 'khwaju-kermani', 'عراقی': 'iraqi', 'سیف فرغانی': 'seyf-farghani', 'شاه نعمت‌الله ولی': 'shah-nematollah-vali',
  'اوحدی': 'owhadi', 'سلمان ساوجی': 'salman-savoji', 'امیرخسرو دهلوی': 'amir-khosrow-dehlavi', 'حافظ': 'hafez',
  'عبید زاکانی': 'obeyd-zakani', 'شیخ محمود شبستری': 'mahmud-shabestari', 'هلالی جغتایی': 'helali-jaghatai', 'جامی': 'jami',
  'محتشم کاشانی': 'mohtasham-kashani', 'عرفی': 'orfi', 'وحشی': 'vahshi', 'رضی‌الدین آرتیمانی': 'razi-al-din-artimani',
  'شیخ بهایی': 'sheikh-bahaei', 'صائب تبریزی': 'saeb-tabrizi', 'بیدل دهلوی': 'bidel-dehlavi', 'فیض کاشانی': 'feiz-kashani',
  'هاتف اصفهانی': 'hatef-esfahani', 'قاآنی': 'qaani', 'فروغی بسطامی': 'forughi-bastami', 'ملا هادی سبزواری': 'molla-hadi-sabzevari',
  'ملک‌الشعرای بهار': 'malek-al-shoara-bahar', 'اقبال لاهوری': 'iqbal-lahori', 'احمد شاملو': 'ahmad-shamlou',
  'سیمین بهبهانی': 'simin-behbahani', 'پروین اعتصامی': 'parvin-etesami', 'شهریار': 'shahriar',
  'کامبیز صدیقی کسمایی': 'kambiz-sedighi-kasmaei', 'رهی معیری': 'rahi-moayeri', 'سهراب سپهری': 'sohrab-sepehri',
  'فروغ فرخزاد': 'forough-farrokhzad', 'مهدی اخوان ثالث': 'mehdi-akhavan-sales', 'بهرام سالکی': 'bahram-saleki',
  'شاطرعباس صبوحی': 'shater-abbas-sabouhi', 'شیون فومنی': 'shivon-foumani', 'نیما یوشیج (آوای آزاد)': 'nima-yushij',
  'خلیل‌الله خلیلی': 'khalilullah-khalili', 'محمدحسن بارق شفیعی': 'mohammad-hasan-bareq-shafiei',
  'ا لیار (جبار محمدی)': 'a-liyar-jabbar-mohammadi', 'عبدالقهار عاصی': 'abdul-qahar-asi',
});

export const POET_ALIASES = Object.freeze({
  'نیما یوشیج': 'نیما یوشیج (آوای آزاد)',
  'الیار (جبار محمدی)': 'ا لیار (جبار محمدی)',
});

export function canonicalPoetName(name) {
  return POET_ALIASES[name] || name;
}

export function poetSlug(name) {
  return POET_SLUGS[canonicalPoetName(name)] || null;
}
