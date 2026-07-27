#!/usr/bin/env python3
"""Generate public-facing research questions from the main Persian poetry TSV.

The output is intentionally descriptive and explainable. It does not perform
sentiment classification, authorship verdicts, or historical causal inference.

Writes:
  - src/data/publicQuestionsResearch.json
  - public/downloads/public-questions-analysis.csv

Usage:
  python scripts/generate_public_questions.py [path/to/poems_with_more_info.tsv]
"""
from __future__ import annotations

import csv
import json
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

csv.field_size_limit(sys.maxsize)

ROOT = Path(__file__).resolve().parents[1]
DATASET = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'public' / 'data' / 'poems_with_more_info.tsv'
OUT = ROOT / 'src' / 'data' / 'publicQuestionsResearch.json'
CSV_OUT = ROOT / 'public' / 'downloads' / 'public-questions-analysis.csv'

FA_MAP = str.maketrans({'ي': 'ی', 'ك': 'ک', 'ۀ': 'ه', 'ة': 'ه', 'ؤ': 'و', 'إ': 'ا', 'أ': 'ا', 'ٱ': 'ا', 'ـ': ''})
DIACRITICS = re.compile(r'[\u064b-\u065f\u0670\u06d6-\u06ed]')
TOKEN_RE = re.compile(r'[آ-ی]+')
EDITORIAL_MARKERS = ('مقدمه', 'فیلسوف', 'زندگینامه', 'شرح حال', 'درباره')

LEXICONS = {
    'heart': {'دل'},
    'reason': {'عقل'},
    'night': {'شب', 'شبانگاه', 'شبانه', 'دوش'},
    'day': {'روز', 'روزانه', 'بامداد', 'صبح'},
    'sadness': {'غم', 'غصه', 'اندوه', 'درد', 'ماتم', 'گریه', 'اشک', 'رنج', 'محنت', 'حزن'},
    'joy': {'شاد', 'شادی', 'خوشی', 'خنده', 'طرب', 'نشاط', 'جشن', 'فرح', 'سرور', 'خرم'},
    'self': {'من', 'مرا', 'منم'},
    'collective': {'ما', 'مارا', 'ماییم'},
    'past': {'دیروز', 'دوش', 'گذشته', 'دیرین'},
    'present': {'امروز', 'اکنون'},
    'future': {'فردا', 'آینده'},
    'question': {'چرا', 'چگونه', 'کجا', 'کی', 'کدام', 'آیا', 'چند', 'چیست', 'چه'},
    'road': {'راه', 'سفر', 'مسافر', 'کاروان', 'کوچ'},
    'home': {'خانه', 'وطن', 'دیار', 'بوم', 'کاشانه'},
}

CONTEXTS = {
    'عشق و معشوق': {'عشق', 'عاشق', 'یار', 'دل', 'جانان', 'معشوق', 'زلف', 'لب', 'رخ', 'چشم'},
    'غم و اندوه': LEXICONS['sadness'],
    'شادی و بزم': LEXICONS['joy'],
    'طبیعت': {'گل', 'باغ', 'بهار', 'بلبل', 'چمن', 'لاله', 'سرو', 'ابر', 'باران', 'سبزه'},
    'دین و عرفان': {'خدا', 'حق', 'دین', 'ایمان', 'کفر', 'زاهد', 'صوفی', 'مسجد', 'خانقاه', 'قرآن', 'نماز'},
}

COLOR_FAMILIES = {
    'سیاه': {'سیاه'},
    'سبز': {'سبز'},
    'سفید و سپید': {'سفید', 'سپید'},
    'زرد': {'زرد'},
    'زرین و طلایی': {'زرین', 'طلایی'},
    'سرخ و قرمز': {'سرخ', 'قرمز'},
    'آبی و نیلی': {'آبی', 'کبود', 'نیلی', 'لاجوردی'},
    'بنفش و ارغوانی': {'بنفش', 'ارغوانی'},
}

BIRD_FAMILIES = {
    'مرغ (نام عام پرنده)': {'مرغ'},
    'بلبل و عندلیب': {'بلبل', 'عندلیب'},
    'طوطی': {'طوطی'},
    'کبوتر، قمری و فاخته': {'کبوتر', 'قمری', 'فاخته'},
    'کلاغ و زاغ': {'کلاغ', 'زاغ'},
    'شاهین و عقاب': {'شاهین', 'عقاب'},
    'طاووس': {'طاووس'},
    'هما': {'هما'},
    'هدهد': {'هدهد'},
    'گنجشک': {'گنجشک'},
}

# Deliberately excludes highly ambiguous single-token names such as چین، روم، شام and ری.
PLACES = [
    'ایران', 'خراسان', 'مصر', 'هند', 'بغداد', 'تبریز', 'توران', 'مکه', 'مدینه',
    'بلخ', 'شیراز', 'سمرقند', 'بخارا', 'هرات', 'غزنین', 'نیشابور', 'اصفهان',
    'کاشان', 'کرمان', 'یزد', 'قونیه', 'دهلی', 'لاهور', 'کابل', 'مازندران', 'گیلان',
]

TREND_KEYS = ['heart', 'reason', 'night', 'day', 'sadness', 'joy', 'self', 'collective', 'past', 'present', 'future', 'road', 'home']


def normalize(text: str) -> str:
    return re.sub(r'\s+', ' ', DIACRITICS.sub('', str(text or '').translate(FA_MAP))).strip()


def tokens(text: str) -> list[str]:
    return TOKEN_RE.findall(normalize(text))


def ratio(a: float, b: float) -> float:
    return round(a / b, 2) if b else 0


def percent(a: float, b: float) -> float:
    return round(a / b * 100, 1) if b else 0


def fa_decimal(value: float) -> str:
    return f'{value:.1f}'.rstrip('0').rstrip('.')


def localize_narrative(value: str) -> str:
    """Render numeric parts of Persian prose with Persian digits and separators."""
    value = str(value).translate(str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')).replace(',', '٬')
    return re.sub(r'(?<=[۰-۹])\.(?=[۰-۹])', '٫', value)


if not DATASET.exists():
    raise SystemExit(f'Dataset not found: {DATASET}')

aggregate = Counter()
poet_hits: dict[str, Counter] = defaultdict(Counter)
poet_words = Counter()
century_poet_hits: dict[int, dict[str, Counter]] = defaultdict(lambda: defaultdict(Counter))
century_poet_words: dict[int, Counter] = defaultdict(Counter)
family_hits = {'colors': Counter(), 'birds': Counter()}
family_poets = {'colors': defaultdict(set), 'birds': defaultdict(set)}
place_hits = Counter()
place_poets: dict[str, set[str]] = defaultdict(set)
context_hits: dict[str, Counter] = defaultdict(Counter)
anchor_hits = Counter()
rows = 0
usable_rows = 0
excluded_rows = 0
total_words = 0
poets = set()
centuries = set()

with DATASET.open(encoding='utf-8', newline='') as fh:
    reader = csv.DictReader(fh, delimiter='\t')
    expected = ['poet', 'century', 'book_title', 'poem_title', 'poem']
    if reader.fieldnames != expected:
        raise SystemExit(f'Unexpected columns: {reader.fieldnames}; expected {expected}')

    for row in reader:
        rows += 1
        ts = tokens(row['poem'])
        n = len(ts)
        title_context = f"{row['poem_title']} {row['book_title']}"
        if n >= 500 and any(marker in title_context for marker in EDITORIAL_MARKERS):
            excluded_rows += 1
            continue

        usable_rows += 1
        poet = row['poet']
        century = int(row['century'])
        poets.add(poet)
        centuries.add(century)
        total_words += n
        poet_words[poet] += n
        century_poet_words[century][poet] += n
        counts = Counter(ts)

        for key, lexicon in LEXICONS.items():
            hits = sum(counts[token] for token in lexicon)
            aggregate[key] += hits
            poet_hits[poet][key] += hits
            century_poet_hits[century][poet][key] += hits

        for family, lexicon in COLOR_FAMILIES.items():
            hits = sum(counts[token] for token in lexicon)
            if hits:
                family_hits['colors'][family] += hits
                family_poets['colors'][family].add(poet)

        for family, lexicon in BIRD_FAMILIES.items():
            hits = sum(counts[token] for token in lexicon)
            if hits:
                family_hits['birds'][family] += hits
                family_poets['birds'][family].add(poet)

        for place in PLACES:
            if counts[place]:
                place_hits[place] += counts[place]
                place_poets[place].add(poet)

        # Local ±8-token windows around day/night anchors. Long poems do not make the
        # context percentage larger unless the relevant concept is locally nearby.
        for index, token in enumerate(ts):
            anchor = 'شب و شبانگاه' if token in LEXICONS['night'] else 'روز و بامداد' if token in LEXICONS['day'] else None
            if not anchor:
                continue
            anchor_hits[anchor] += 1
            window = ts[max(0, index - 8): min(len(ts), index + 9)]
            for label, lexicon in CONTEXTS.items():
                context_hits[anchor][label] += sum(1 for item in window if item in lexicon)


def poet_balanced_trend(keys: list[str]) -> tuple[list[int], dict[str, list[float]], dict[int, int]]:
    labels = sorted(centuries)
    series = {key: [] for key in keys}
    eligible_counts = {}
    for century in labels:
        eligible = [p for p, word_count in century_poet_words[century].items() if word_count >= 1000]
        eligible_counts[century] = len(eligible)
        for key in keys:
            rates = [century_poet_hits[century][p][key] / century_poet_words[century][p] * 10000 for p in eligible]
            series[key].append(round(statistics.mean(rates), 1) if rates else 0)
    return labels, series, eligible_counts


century_labels, trends, eligible_century_poets = poet_balanced_trend(TREND_KEYS)

def paired_series(left_key: str, left_name: str, right_key: str, right_name: str):
    return {
        'kind': 'trend',
        'labels': century_labels,
        'yLabel': 'رخداد شاعرمتوازن در ده‌هزار واژه',
        'series': [
            {'name': left_name, 'values': trends[left_key]},
            {'name': right_name, 'values': trends[right_key]},
        ],
    }


def ranking_items(counter: Counter, poet_sets, *, sort_by_poets: bool = False, limit: int = 10):
    items = [
        {'name': name, 'value': int(value), 'poets': len(poet_sets[name])}
        for name, value in counter.items()
    ]
    if sort_by_poets:
        items.sort(key=lambda item: (item['poets'], item['value']), reverse=True)
    else:
        items.sort(key=lambda item: (item['value'], item['poets']), reverse=True)
    return items[:limit]


heart_ratio = ratio(aggregate['heart'], aggregate['reason'])
day_over_night = ratio(aggregate['day'], aggregate['night'])
sad_over_joy = ratio(aggregate['sadness'], aggregate['joy'])
self_over_we = ratio(aggregate['self'], aggregate['collective'])
present_total = aggregate['present']
past_total = aggregate['past']
future_total = aggregate['future']
road_over_home = ratio(aggregate['road'], aggregate['home'])

question_rank = []
for poet, word_count in poet_words.items():
    if word_count < 20000:
        continue
    question_rank.append({
        'name': poet,
        'value': round(poet_hits[poet]['question'] / word_count * 10000, 1),
        'hits': poet_hits[poet]['question'],
        'words': word_count,
    })
question_rank.sort(key=lambda item: item['value'], reverse=True)
question_rank = question_rank[:10]

color_rank = ranking_items(family_hits['colors'], family_poets['colors'], limit=8)
bird_rank = ranking_items(family_hits['birds'], family_poets['birds'], limit=10)
place_rank = ranking_items(place_hits, place_poets, sort_by_poets=True, limit=10)

night_context = [round(context_hits['شب و شبانگاه'][label] / max(1, anchor_hits['شب و شبانگاه']) * 100, 1) for label in CONTEXTS]
day_context = [round(context_hits['روز و بامداد'][label] / max(1, anchor_hits['روز و بامداد']) * 100, 1) for label in CONTEXTS]

# Find the centuries where paired rates are closest / furthest, while preserving
# the warning that some centuries have very few eligible poets.
def closest_century(left: str, right: str):
    rows_ = []
    for index, century in enumerate(century_labels):
        a, b = trends[left][index], trends[right][index]
        rows_.append((abs(a - b), century, a, b, eligible_century_poets[century]))
    return min(rows_, key=lambda item: item[0])


def largest_ratio_century(left: str, right: str):
    rows_ = []
    for index, century in enumerate(century_labels):
        a, b = trends[left][index], trends[right][index]
        if b > 0:
            rows_.append((a / b, century, a, b, eligible_century_poets[century]))
    return max(rows_, key=lambda item: item[0])


closest_i_we = closest_century('self', 'collective')
max_sad_ratio = largest_ratio_century('sadness', 'joy')
max_heart_ratio = largest_ratio_century('heart', 'reason')

questions = [
    {
        'id': 'heart-or-reason',
        'category': 'زبان و اندیشه',
        'shortTitle': 'دل یا عقل؟',
        'title': 'در شعر فارسی «دل» بیشتر حرف می‌زند یا «عقل»؟',
        'teaser': 'دو واژهٔ مرکزی فرهنگ فارسی را در سیزده سده رو‌به‌روی هم می‌گذاریم.',
        'answer': f'در پیکرهٔ پالایش‌شده، «دل» {heart_ratio} برابر «عقل» آمده است؛ {aggregate["heart"]:,} رخداد در برابر {aggregate["reason"]:,}. این اختلاف بزرگ است، اما فقط فراوانی دو واژه را نشان می‌دهد، نه پیروزی فلسفی احساس بر خرد.',
        'metrics': [
            {'label': 'رخداد دل', 'value': aggregate['heart'], 'detail': 'واژهٔ دقیق «دل»'},
            {'label': 'رخداد عقل', 'value': aggregate['reason'], 'detail': 'واژهٔ دقیق «عقل»'},
            {'label': 'نسبت دل به عقل', 'value': heart_ratio, 'suffix': 'برابر'},
        ],
        'highlights': [
            f'بیشترین نسبت شاعرمتوازن دل به عقل در سدهٔ {max_heart_ratio[1]} دیده می‌شود؛ آن سده فقط {max_heart_ratio[4]} شاعر واجد حداقل حجم دارد و باید محتاط خوانده شود.',
            'نمودار در سطح شاعر میانگین‌گیری شده است تا شاعرانی با هزاران متن نتیجه را به‌تنهایی تعیین نکنند.',
        ],
        'method': 'شمارش دقیق دو واژه پس از یکسان‌سازی نویسه‌ها؛ نرخ هر شاعر در ده‌هزار واژه محاسبه و سپس در هر سده میانگین شده است.',
        'caveat': '«دل» و «عقل» شبکه‌ای از معناهای جسمانی، عاشقانه، عرفانی و فلسفی دارند. شمار واژه جای تحلیل استدلال یا موضع شاعر را نمی‌گیرد.',
        'chart': paired_series('heart', 'دل', 'reason', 'عقل'),
    },
    {
        'id': 'night-or-day',
        'category': 'زبان و احساس',
        'shortTitle': 'شب یا روز؟',
        'title': 'شعر فارسی شب‌دوست‌تر است یا روزدوست؟',
        'teaser': 'فراوانی یک پاسخ می‌دهد و همسایگی واژه‌ها پاسخی ظریف‌تر.',
        'answer': f'روز و بامداد در کل {day_over_night} برابر شب و شبانگاه دیده شده‌اند؛ اما در پنجره‌های محلی، نشانه‌های عشق کنار شب بیشتر از روز ظاهر می‌شوند ({night_context[0]} در برابر {day_context[0]} رخداد در هر صد لنگر).',
        'metrics': [
            {'label': 'روز و بامداد', 'value': aggregate['day'], 'detail': 'روز، روزانه، بامداد، صبح'},
            {'label': 'شب و شبانگاه', 'value': aggregate['night'], 'detail': 'شب، شبانه، شبانگاه، دوش'},
            {'label': 'برتری شمار روز', 'value': day_over_night, 'suffix': 'برابر'},
        ],
        'highlights': [
            f'نشانه‌های شادی و بزم در پیرامون روز تقریباً {ratio(day_context[2], night_context[2])} برابر شب‌اند.',
            'تفاوت میان «فراوانی واژه» و «فضای معنایی پیرامون واژه» نشان می‌دهد یک پاسخ تک‌عددی برای این پرسش کافی نیست.',
        ],
        'method': 'علاوه بر شمار لنگرهای شب و روز، برای هر رخداد پنجرهٔ هشت‌واژه‌ای در دو سوی آن ساخته و واژه‌های عشق، غم، شادی، طبیعت و عرفان شمرده شده است.',
        'caveat': '«دوش» گاه فقط گذشته را می‌رساند و «روز» می‌تواند معنای روزگار داشته باشد. این تحلیل الگوی زبانی است، نه تشخیص قطعی معنای هر بیت.',
        'chart': {
            'kind': 'grouped',
            'labels': list(CONTEXTS.keys()),
            'yLabel': 'رخداد زمینه‌ای در هر صد لنگر',
            'series': [
                {'name': 'شب و شبانگاه', 'values': night_context},
                {'name': 'روز و بامداد', 'values': day_context},
            ],
        },
    },
    {
        'id': 'sadness-or-joy',
        'category': 'زبان و احساس',
        'shortTitle': 'غم یا شادی؟',
        'title': 'آیا شعر فارسی واقعاً غمگین‌تر از شاد است؟',
        'teaser': 'به‌جای برچسب‌زدن به کل شعر، فقط نشانه‌های واژگانی دو میدان را مقایسه می‌کنیم.',
        'answer': f'واژه‌نشانه‌های غم {sad_over_joy} برابر واژه‌نشانه‌های شادی‌اند: {aggregate["sadness"]:,} در برابر {aggregate["joy"]:,} رخداد. این نتیجه دربارهٔ واژگان است و به معنی «غمگین بودن» همهٔ شعرها نیست.',
        'metrics': [
            {'label': 'نشانه‌های غم', 'value': aggregate['sadness'], 'detail': 'غم، درد، اشک، رنج و هم‌خانواده‌ها'},
            {'label': 'نشانه‌های شادی', 'value': aggregate['joy'], 'detail': 'شاد، طرب، نشاط، جشن و هم‌خانواده‌ها'},
            {'label': 'نسبت غم به شادی', 'value': sad_over_joy, 'suffix': 'برابر'},
        ],
        'highlights': [
            f'بیشترین نسبت شاعرمتوازن غم به شادی در سدهٔ {max_sad_ratio[1]} ثبت شده است؛ این سده {max_sad_ratio[4]} شاعر واجد حداقل حجم دارد.',
            '«درد» در شعر عرفانی می‌تواند ارزش مثبت یا راه شناخت داشته باشد؛ بنابراین فرهنگ واژگان، تحلیل احساس رایانه‌ای نیست.',
        ],
        'method': 'دو فرهنگ واژگانی کوچک و شفاف تعریف شده و نرخ آن‌ها برای هر شاعر و هر سده محاسبه شده است.',
        'caveat': 'طنز، نفی، استعاره و معنای عرفانی می‌توانند جهت عاطفی واژه را عوض کنند. نتیجه باید «چگالی نشانه‌های غم/شادی» خوانده شود.',
        'chart': paired_series('sadness', 'نشانه‌های غم', 'joy', 'نشانه‌های شادی'),
    },
    {
        'id': 'i-or-we',
        'category': 'صدا و جامعه',
        'shortTitle': 'من یا ما؟',
        'title': 'صدای شعر فارسی بیشتر «من» است یا «ما»؟',
        'teaser': 'ردپای گویندهٔ فردی و جمعی را با ضمیرهای آشکار دنبال می‌کنیم.',
        'answer': f'ضمیرهای آشکارِ فردی {self_over_we} برابر صورت‌های جمعی آمده‌اند: {aggregate["self"]:,} در برابر {aggregate["collective"]:,} رخداد. نزدیک‌ترین فاصلهٔ شاعرمتوازن میان دو صدا در سدهٔ {closest_i_we[1]} دیده می‌شود.',
        'metrics': [
            {'label': 'من و مرا', 'value': aggregate['self'], 'detail': 'من، مرا، منم'},
            {'label': 'ما و مارا', 'value': aggregate['collective'], 'detail': 'ما، مارا، ماییم'},
            {'label': 'نسبت فردی به جمعی', 'value': self_over_we, 'suffix': 'برابر'},
        ],
        'highlights': [
            f'در سدهٔ {closest_i_we[1]} نرخ «من» و «ما» به هم نزدیک‌تر است؛ این برآورد بر {closest_i_we[4]} شاعر با حداقل هزار واژه تکیه دارد.',
            'ضمیر پنهان در فعل فارسی در این شمارش دیده نمی‌شود؛ بنابراین این تحلیل فقط «ضمیرهای آشکار» را می‌سنجد.',
        ],
        'method': 'صورت‌های مستقل من/مرا/منم و ما/مارا/ماییم شمرده و روند شاعرمتوازن ساخته شده است.',
        'caveat': 'گویندهٔ شعر لزوماً خود شاعر نیست و بسیاری از فاعل‌ها در فارسی به صورت پسوند یا فعل صرف‌شده ظاهر می‌شوند.',
        'chart': paired_series('self', 'صدای فردی: من', 'collective', 'صدای جمعی: ما'),
    },
    {
        'id': 'questioning-poets',
        'category': 'صدا و اندیشه',
        'shortTitle': 'پرسشگرترین شاعر؟',
        'title': 'کدام شاعران بیشتر با پرسش‌واژه‌ها فکر می‌کنند؟',
        'teaser': 'چرا، کجا، چگونه و چه را به نرخ حجم پیکره تبدیل می‌کنیم.',
        'answer': f'در میان شاعرانی با دست‌کم ۲۰ هزار واژه، {question_rank[0]["name"]} با {fa_decimal(question_rank[0]["value"])} پرسش‌واژه در ده‌هزار واژه در صدر این شاخص قرار دارد؛ پس از او {question_rank[1]["name"]} و {question_rank[2]["name"]} دیده می‌شوند.',
        'metrics': [
            {'label': 'کل پرسش‌واژه‌ها', 'value': aggregate['question'], 'detail': 'چه، چرا، کجا، چگونه و صورت‌های منتخب'},
            {'label': 'شاعران وارد رتبه‌بندی', 'value': sum(1 for value in poet_words.values() if value >= 20000), 'detail': 'حداقل ۲۰ هزار واژه'},
            {'label': 'نرخ نفر نخست', 'value': question_rank[0]['value'], 'suffix': 'در ۱۰هزار واژه'},
        ],
        'highlights': [
            f'{question_rank[0]["name"]} در پیکره {question_rank[0]["hits"]:,} پرسش‌واژه در {question_rank[0]["words"]:,} واژه دارد.',
            'رتبه‌بندی بر اساس نرخ است، نه شمار خام؛ بنابراین حجم بسیار بزرگ یک شاعر به‌تنهایی مزیت ایجاد نمی‌کند.',
        ],
        'method': 'نه پرسش‌واژهٔ آشکار شمرده و فقط شاعران دارای حداقل ۲۰ هزار واژه مقایسه شده‌اند.',
        'caveat': '«چه» می‌تواند تعجبی یا موصولی باشد و علامت سؤال در نسخه‌ها یکدست نیست. شاخص، گرایش واژگانی به صورت پرسش است نه تعداد دقیق جمله‌های پرسشی.',
        'chart': {
            'kind': 'ranking',
            'yLabel': 'پرسش‌واژه در ده‌هزار واژه',
            'items': question_rank,
            'secondaryLabel': 'رخداد واقعی',
        },
    },
    {
        'id': 'time-direction',
        'category': 'زمان و جهان',
        'shortTitle': 'گذشته، اکنون یا فردا؟',
        'title': 'شعر فارسی بیشتر رو به گذشته دارد، اکنون یا آینده؟',
        'teaser': 'سه سبد کوچک و روشن از نشانه‌های زمانی را در طول سده‌ها دنبال می‌کنیم.',
        'answer': f'در این تعریف محافظه‌کارانه، نشانه‌های اکنون با {present_total:,} رخداد از گذشته ({past_total:,}) و آینده ({future_total:,}) بیشترند. «امروز» و «اکنون» در مجموع {ratio(present_total, future_total)} برابر «فردا» و «آینده» آمده‌اند.',
        'metrics': [
            {'label': 'اکنون', 'value': present_total, 'detail': 'امروز، اکنون'},
            {'label': 'گذشته', 'value': past_total, 'detail': 'دیروز، دوش، گذشته، دیرین'},
            {'label': 'آینده', 'value': future_total, 'detail': 'فردا، آینده'},
        ],
        'highlights': [
            'واژهٔ «حال» و «عاقبت» عمداً حذف شده‌اند تا ابهام معنایی کمتر شود.',
            'این نتیجه می‌گوید کدام نشانه‌ها بیشتر ظاهر شده‌اند؛ جهت‌گیری فلسفی شعر درباره زمان را تعیین نمی‌کند.',
        ],
        'method': 'فرهنگ‌های زمانی کوچک و کم‌ابهام تعریف و نرخ شاعرمتوازن آن‌ها در هر سده محاسبه شده است.',
        'caveat': '«دوش» هم شب و هم گذشته را می‌رساند و زمان دستوری در فعل‌ها در این تحلیل وارد نشده است.',
        'chart': {
            'kind': 'trend',
            'labels': century_labels,
            'yLabel': 'رخداد شاعرمتوازن در ده‌هزار واژه',
            'series': [
                {'name': 'گذشته', 'values': trends['past']},
                {'name': 'اکنون', 'values': trends['present']},
                {'name': 'آینده', 'values': trends['future']},
            ],
        },
    },
    {
        'id': 'road-or-home',
        'category': 'زمان و جهان',
        'shortTitle': 'راه یا خانه؟',
        'title': 'شعر فارسی بیشتر در راه است یا در خانه؟',
        'teaser': 'زبان سفر، کوچ و کاروان را کنار خانه، وطن و دیار می‌گذاریم.',
        'answer': f'واژه‌های راه و سفر {road_over_home} برابر واژه‌های خانه و وطن دیده شده‌اند: {aggregate["road"]:,} در برابر {aggregate["home"]:,} رخداد. این برتری می‌تواند هم سفر واقعی و هم سلوک، مرگ یا عشق را بازتاب دهد.',
        'metrics': [
            {'label': 'راه و سفر', 'value': aggregate['road'], 'detail': 'راه، سفر، مسافر، کاروان، کوچ'},
            {'label': 'خانه و وطن', 'value': aggregate['home'], 'detail': 'خانه، وطن، دیار، بوم، کاشانه'},
            {'label': 'نسبت راه به خانه', 'value': road_over_home, 'suffix': 'برابر'},
        ],
        'highlights': [
            '«راه» در شعر عرفانی اغلب مسیر معنوی است، نه جابه‌جایی جغرافیایی.',
            'برای تبدیل این شاخص به تاریخ مهاجرت باید متن با زندگی‌نامه، مکان و تاریخ سرایش پیوند بخورد.',
        ],
        'method': 'دو فرهنگ واژگانی محافظه‌کارانه شمرده و نرخ‌ها در سطح شاعر و سده متوازن شده‌اند.',
        'caveat': 'زبان سفر به‌شدت استعاری است؛ این نمودار تعداد سفرهای واقعی یا مهاجرت شاعران را نشان نمی‌دهد.',
        'chart': paired_series('road', 'راه و سفر', 'home', 'خانه و وطن'),
    },
    {
        'id': 'poetry-colors',
        'category': 'تصویر و تخیل',
        'shortTitle': 'رنگ محبوب شعر؟',
        'title': 'پالت رنگی شعر فارسی با کدام رنگ آغاز می‌شود؟',
        'teaser': 'رنگ‌های هم‌خانواده را یکی می‌کنیم و هم فراوانی و هم گستره میان شاعران را می‌بینیم.',
        'answer': f'«{color_rank[0]["name"]}» با {color_rank[0]["value"]:,} رخداد پرتکرارترین خانوادهٔ رنگی این فهرست است؛ پس از آن «{color_rank[1]["name"]}» و «{color_rank[2]["name"]}» قرار دارند.',
        'metrics': [
            {'label': 'رنگ نخست', 'value': color_rank[0]['value'], 'detail': color_rank[0]['name']},
            {'label': 'شاعرانِ رنگ نخست', 'value': color_rank[0]['poets'], 'detail': 'از ۶۷ شاعر پیکره'},
            {'label': 'خانواده‌های رنگی', 'value': len(color_rank), 'detail': 'صورت‌های نزدیک ادغام شده‌اند'},
        ],
        'highlights': [
            f'رنگ نخست در آثار {color_rank[0]["poets"]} شاعر دیده شده و فقط محصول یک دیوان پرحجم نیست.',
            'سفید/سپید، سرخ/قرمز و چند طیف آبی برای جلوگیری از دو بار شمردن یک خانواده با هم ادغام شده‌اند.',
        ],
        'method': 'هشت خانوادهٔ رنگی با واژه‌های صریح ساخته شده و برای هر خانواده شمار رخداد و تعداد شاعر دارای حداقل یک رخداد گزارش شده است.',
        'caveat': 'رنگ ممکن است صفت واقعی، نماد اخلاقی، نشانه سوگ، زیبایی‌شناسی یا نام شیء باشد. این تحلیل کارکرد رنگ را طبقه‌بندی نمی‌کند.',
        'chart': {'kind': 'ranking', 'yLabel': 'تعداد رخداد', 'items': color_rank, 'secondaryLabel': 'تعداد شاعر'},
    },
    {
        'id': 'poetry-birds',
        'category': 'تصویر و تخیل',
        'shortTitle': 'پرنده محبوب شعر؟',
        'title': 'کدام پرنده بیشتر در آسمان شعر فارسی دیده می‌شود؟',
        'teaser': 'نام‌های کم‌ابهام‌تر را نگه می‌داریم و «باز» را به‌دلیل معنای «دوباره» حذف می‌کنیم.',
        'answer': f'نام عام «{bird_rank[0]["name"]}» با {bird_rank[0]["value"]:,} رخداد در صدر است؛ در میان نام‌های شناخته‌شده‌تر، «{bird_rank[1]["name"]}» جایگاه بعدی را دارد.',
        'metrics': [
            {'label': 'رخداد پرنده نخست', 'value': bird_rank[0]['value'], 'detail': bird_rank[0]['name']},
            {'label': 'گستره شاعر نخست', 'value': bird_rank[0]['poets'], 'detail': 'تعداد شاعران دارای رخداد'},
            {'label': 'خانواده‌های پرنده', 'value': len(bird_rank), 'detail': 'نام‌های پرابهام حذف شده‌اند'},
        ],
        'highlights': [
            f'«{bird_rank[1]["name"]}» در آثار {bird_rank[1]["poets"]} شاعر ظاهر شده است.',
            '«باز» با وجود فراوانی زیاد کنار گذاشته شد، زیرا در فارسی غالباً به معنی «دوباره» است؛ این حذف از یک نتیجهٔ جذاب اما گمراه‌کننده جلوگیری می‌کند.',
        ],
        'method': 'خانواده‌های پرندگان با واژه‌های صریح ساخته و صورت‌های نزدیک مانند بلبل/عندلیب یا کلاغ/زاغ ادغام شده‌اند.',
        'caveat': '«مرغ» نام عام پرنده است و ممکن است معنای نمادین روح یا انسان داشته باشد. رتبه، زیست‌شناختی یا گونه‌شناختی نیست.',
        'chart': {'kind': 'ranking', 'yLabel': 'تعداد رخداد', 'items': bird_rank, 'secondaryLabel': 'تعداد شاعر'},
    },
    {
        'id': 'shared-places',
        'category': 'تصویر و جهان',
        'shortTitle': 'جغرافیای مشترک؟',
        'title': 'کدام نام‌های جغرافیایی میان شاعران بیشتری سفر کرده‌اند؟',
        'teaser': 'به‌جای شمار خام، نخست گسترهٔ حضور در میان شاعران را رتبه‌بندی می‌کنیم.',
        'answer': f'«{place_rank[0]["name"]}» در آثار {place_rank[0]["poets"]} شاعر دیده شده و از نظر گسترهٔ میان‌شاعری در صدر فهرست کم‌ابهام‌تر قرار دارد؛ پس از آن «{place_rank[1]["name"]}» و «{place_rank[2]["name"]}» قرار می‌گیرند.',
        'metrics': [
            {'label': 'گسترده‌ترین نام', 'value': place_rank[0]['poets'], 'detail': f'{place_rank[0]["name"]}؛ {place_rank[0]["value"]:,} رخداد'},
            {'label': 'نام‌های بررسی‌شده', 'value': len(PLACES), 'detail': 'نام‌های پرابهام حذف شده‌اند'},
            {'label': 'شاعران پیکره', 'value': len(poets), 'detail': 'مبنای سنجش گستره'},
        ],
        'highlights': [
            f'«{place_rank[0]["name"]}» {place_rank[0]["value"]:,} بار و «{place_rank[1]["name"]}» {place_rank[1]["value"]:,} بار در پیکره آمده‌اند.',
            'نام‌هایی مانند چین، روم، شام و ری عمداً حذف شده‌اند، چون بدون تحلیل بافت می‌توانند کشور، فعل، زمان روز یا معنای دیگری باشند.',
        ],
        'method': 'برای هر نام جغرافیایی، هم تعداد رخداد و هم تعداد شاعران دارای آن نام شمرده شده است؛ رتبه اصلی بر اساس تعداد شاعر است.',
        'caveat': 'ذکر یک مکان به معنی سفر شاعر به آنجا نیست. مکان می‌تواند اسطوره‌ای، دینی، استعاری یا بخشی از یک روایت تاریخی باشد.',
        'chart': {'kind': 'ranking-poets', 'yLabel': 'تعداد شاعر', 'items': place_rank, 'secondaryLabel': 'تعداد رخداد'},
    },
]

for question in questions:
    for field in ('teaser', 'answer', 'method', 'caveat'):
        question[field] = localize_narrative(question[field])
    question['highlights'] = [localize_narrative(item) for item in question['highlights']]
    for metric in question['metrics']:
        if metric.get('detail'):
            metric['detail'] = localize_narrative(metric['detail'])

result = {
    'title': 'پرسش‌های کنجکاوی از شعر فارسی',
    'status': 'ده پاسخ اکتشافی برای مخاطب عمومی، با روش و محدودیت آشکار',
    'generatedFrom': {
        'rows': rows,
        'usableRows': usable_rows,
        'excludedEditorialRows': excluded_rows,
        'words': total_words,
        'poets': len(poets),
        'centuries': len(centuries),
        'minimumPoetWordsForRanking': 20000,
        'minimumPoetCenturyWordsForTrend': 1000,
    },
    'questions': questions,
    'readingGuide': [
        ['پاسخ یک‌جمله‌ای', 'نتیجه‌ای که بدون دانش آماری قابل‌فهم است.'],
        ['عدد قابل‌ردیابی', 'هر ادعا به شمار، نرخ یا گسترهٔ میان شاعران متصل است.'],
        ['چرا ممکن است اشتباه برداشت شود؟', 'ابهام واژه، استعاره، ژانر و عدم‌توازن پیکره آشکار نوشته می‌شود.'],
        ['گام پژوهشی بعدی', 'این سؤال‌ها نقطه شروع خوانش نزدیک و پژوهش تخصصی‌اند، نه پایان آن.'],
    ],
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
with CSV_OUT.open('w', encoding='utf-8-sig', newline='') as fh:
    writer = csv.writer(fh)
    writer.writerow(['شناسه پرسش', 'پرسش', 'نوع داده', 'برچسب', 'سری', 'مقدار', 'جزئیات'])
    for question in questions:
        chart = question['chart']
        if chart['kind'] in {'trend', 'grouped'}:
            for series in chart['series']:
                for label, value in zip(chart['labels'], series['values']):
                    writer.writerow([question['id'], question['title'], chart['kind'], label, series['name'], value, chart['yLabel']])
        else:
            for item in chart['items']:
                secondary = item.get('poets', item.get('hits', ''))
                writer.writerow([question['id'], question['title'], chart['kind'], item['name'], '', item['value'], secondary])

print(f'Wrote {OUT.relative_to(ROOT)} and {CSV_OUT.relative_to(ROOT)} from {rows:,} rows; excluded {excluded_rows} editorial candidates')
