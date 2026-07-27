#!/usr/bin/env python3
"""Generate compact, explainable attribution/context analyses from the main TSV corpus.

The script intentionally produces *research triage*, not authenticity verdicts.
It reads the five-column corpus and writes:
  - src/data/attributionResearch.json
  - public/downloads/attribution-corpus-audit.csv

Usage:
  python scripts/generate_attribution_research.py [path/to/poems_with_more_info.tsv]
"""
from __future__ import annotations

import csv
import json
import math
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

csv.field_size_limit(sys.maxsize)

ROOT = Path(__file__).resolve().parents[1]
DATASET = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'public' / 'data' / 'poems_with_more_info.tsv'
OUT = ROOT / 'src' / 'data' / 'attributionResearch.json'
AUDIT = ROOT / 'public' / 'downloads' / 'attribution-corpus-audit.csv'

FA_MAP = str.maketrans({'ي':'ی','ك':'ک','ۀ':'ه','ة':'ه','ؤ':'و','إ':'ا','أ':'ا','ٱ':'ا','ـ':''})
DIACRITICS = re.compile(r'[\u064b-\u065f\u0670\u06d6-\u06ed]')
TOKEN_RE = re.compile(r'[آ-ی]+')
UNIT_RE = re.compile(r'\s{3,}')
STOPWORDS = set('و در به از که را این آن من تو او ما شما ایشان بر با برای تا چون چه نه هم هر یک ای اگر یا ولی ز چو کز کان اندر مرا ترا بود شد است هست می'.split())
FUNCTION_WORDS = ['و','که','به','از','در','را','این','آن','من','تو','چو','گر']

CONCEPTS = {
    'زمان، مرگ و ناپایداری': ['زمان','روزگار','عمر','مرگ','مردن','خاک','فنا','نیستی','گذشت','دم','امروز','فردا'],
    'باده، بزم و لذت اکنون': ['می','باده','شراب','جام','ساغر','ساقی','میخانه','بزم','مطرب','مستی'],
    'تقدیر، بخت و جبر': ['قضا','قدر','تقدیر','بخت','فلک','چرخ','قسمت','ازل','سرنوشت'],
    'پرسش، دانش و تردید': ['دانستن','دانم','دانی','راز','معما','حقیقت','علم','عقل','پرسش','چرا','اسرار'],
    'عشق، دل و معشوق': ['عشق','عاشق','یار','دل','جانان','معشوق','زلف','لب','رخ','چشم'],
    'دین، تصوف و زهد': ['خدا','حق','دین','ایمان','کفر','زاهد','صوفی','مسجد','خانقاه','قرآن','نماز'],
    'قدرت، دربار و جنگ': ['شاه','سلطان','ملک','تخت','تاج','سپاه','جنگ','لشکر','دربار','وزیر'],
    'طبیعت، گل و بهار': ['گل','باغ','بهار','بلبل','چمن','لاله','سرو','ابر','باران','سبزه'],
}
CONCEPT_SETS = {k:set(v) for k,v in CONCEPTS.items()}
SYSTEM_CONCEPTS = ['قدرت، دربار و جنگ','دین، تصوف و زهد','عشق، دل و معشوق','طبیعت، گل و بهار','زمان، مرگ و ناپایداری','باده، بزم و لذت اکنون']


def normalize(text: str) -> str:
    text = DIACRITICS.sub('', str(text or '').translate(FA_MAP))
    return re.sub(r'\s+', ' ', text).strip()


def tokens(text: str) -> list[str]:
    return TOKEN_RE.findall(normalize(text))


def units(text: str) -> int:
    return len([x for x in UNIT_RE.split(str(text or '').strip()) if x.strip()])


def cosine(a: list[str], b: list[str]) -> float:
    ca, cb = Counter(a), Counter(b)
    dot = sum(v * cb[k] for k, v in ca.items())
    na = math.sqrt(sum(v*v for v in ca.values()))
    nb = math.sqrt(sum(v*v for v in cb.values()))
    return dot / (na * nb) if na and nb else 0.0


def median_abs_deviation(values: list[float]) -> tuple[float, float]:
    med = statistics.median(values)
    mad = statistics.median(abs(x-med) for x in values) or 1e-9
    return med, mad


def feature_vector(rec: dict) -> dict[str, float]:
    ts = rec['tokens']
    n = max(1, len(ts))
    counts = Counter(ts)
    vec = {
        'طول متن': math.log1p(n),
        'تعداد واحدهای شعری': math.log1p(rec['units']),
        'میانگین طول واژه': sum(len(x) for x in ts) / n,
        'تنوع واژگانی': len(set(ts)) / n,
    }
    for word in FUNCTION_WORDS:
        vec[f'کاربرد «{word}»'] = counts[word] / n * 100
    return vec


def concept_profile(records: list[dict]) -> list[dict]:
    result=[]
    total_words=sum(r['words'] for r in records) or 1
    for name, terms in CONCEPT_SETS.items():
        hits=sum(sum(1 for t in r['tokens'] if t in terms) for r in records)
        docs=sum(any(t in terms for t in r['tokens']) for r in records)
        result.append({
            'name': name,
            'documentShare': round(docs / max(1,len(records)) * 100, 1),
            'ratePer10k': round(hits / total_words * 10000, 1),
        })
    return sorted(result, key=lambda x:x['ratePer10k'], reverse=True)


if not DATASET.exists():
    raise SystemExit(f'Dataset not found: {DATASET}')

records=[]
poets=set(); books=set(); centuries=set(); exact_rows=Counter(); normalized_poems=Counter()
with DATASET.open(encoding='utf-8', newline='') as fh:
    reader=csv.DictReader(fh, delimiter='\t')
    expected=['poet','century','book_title','poem_title','poem']
    if reader.fieldnames != expected:
        raise SystemExit(f'Unexpected columns: {reader.fieldnames}; expected {expected}')
    for idx,row in enumerate(reader, start=2):
        ts=tokens(row['poem'])
        rec={
            **row,
            'row': idx,
            'centuryInt': int(row['century']),
            'norm': normalize(row['poem']),
            'tokens': ts,
            'words': len(ts),
            'units': units(row['poem']),
        }
        records.append(rec)
        poets.add(row['poet']);books.add(row['book_title']);centuries.add(rec['centuryInt'])
        exact_rows[(row['poet'],row['century'],row['book_title'],row['poem_title'],rec['norm'])]+=1
        normalized_poems[rec['norm']]+=1

# Corpus-level audit.
exact_duplicate_extra=sum(v-1 for v in exact_rows.values() if v>1)
text_duplicate_extra=sum(v-1 for v in normalized_poems.values() if v>1)
word_counts=[r['words'] for r in records]
q1,q3=statistics.quantiles(word_counts,n=4)[0],statistics.quantiles(word_counts,n=4)[2]
short_records=[r for r in records if r['words']<=8]
# Explicit contamination heuristics: titles/books signalling editorial prose, not long narrative poems.
prose_markers=('مقدمه','فیلسوف','زندگینامه','شرح حال','درباره')
prose_candidates=[r for r in records if r['words']>=500 and any(m in (r['poem_title']+' '+r['book_title']) for m in prose_markers)]

# Khayyam: edition overlap + contamination + concept profile.
kh=[r for r in records if r['poet']=='خیام']
kh_prose=[r for r in kh if r['book_title']=='ترانه‌های خیام (صادق هدایت)']
kh_verse=[r for r in kh if r not in kh_prose]
kh_core=[r for r in kh_verse if r['book_title']=='رباعیات']
kh_thematic=[r for r in kh_verse if r['book_title']!='رباعیات']
kh_parallel=[]
for r in kh_thematic:
    rt=[t for t in r['tokens'] if t not in STOPWORDS]
    best=max(((cosine(rt,[t for t in c['tokens'] if t not in STOPWORDS]),c) for c in kh_core), key=lambda x:x[0])
    kh_parallel.append((best[0],r,best[1]))
parallel_80=[x for x in kh_parallel if x[0]>=.80]
parallel_90=[x for x in kh_parallel if x[0]>=.90]
kh_books=Counter(r['book_title'] for r in kh)
kh_distribution=[
    {'name':'رباعیاتِ مجموعهٔ اصلی','value':len(kh_core),'note':'متن‌های کتاب «رباعیات»'},
    {'name':'رباعیاتِ دسته‌بندی موضوعی','value':len(kh_thematic),'note':'هشت بخش موضوعی با صورت‌های گاه نزدیک'},
    {'name':'نثر پژوهشی/مقدمه','value':len(kh_prose),'note':'باید پیش از تحلیل شعر حذف شود'},
]
kh_parallel_examples=[]
for score,a,b in sorted(kh_parallel,key=lambda x:x[0],reverse=True)[:5]:
    kh_parallel_examples.append({'left':a['poem_title'],'leftBook':a['book_title'],'right':b['poem_title'],'score':round(score,3),'snippet':a['norm'][:110]+'…'})

# Hafez: book/genre coverage and triage of records already labeled attributed.
hf=[r for r in records if r['poet']=='حافظ']
hf_core=[r for r in hf if r['book_title']=='غزلیات']
hf_attr=[r for r in hf if r['book_title']=='اشعار منتسب']
core_features=[feature_vector(r) for r in hf_core]
feature_names=list(core_features[0])
centers={}; scales={}
for key in feature_names:
    centers[key], scales[key]=median_abs_deviation([x[key] for x in core_features])
review=[]
for r in hf_attr:
    fv=feature_vector(r)
    z={k:abs(fv[k]-centers[k])/(1.4826*scales[k]+1e-9) for k in feature_names}
    # Clip extreme dimensions so a short fragment does not completely drown all other evidence.
    score=sum(min(v,8) for v in z.values())/len(z)
    strongest=max(z,key=z.get)
    review.append({'title':r['poem_title'],'book':r['book_title'],'words':r['words'],'units':r['units'],'distance':round(score,2),'reason':strongest,'snippet':r['norm'][:125]+'…'})
review=sorted(review,key=lambda x:x['distance'],reverse=True)
hf_distribution=[{'name':name,'value':count,'note':'برچسب کتاب در پیکره'} for name,count in Counter(r['book_title'] for r in hf).most_common()]

# Systemic period analysis: poet-balanced concept rates by century.
by_poet_century=defaultdict(lambda: {'words':0,'hits':Counter()})
century_counts=Counter(); century_poets=defaultdict(set)
for r in records:
    key=(r['poet'],r['centuryInt'])
    by_poet_century[key]['words']+=r['words']
    counts=Counter(r['tokens'])
    for concept,terms in CONCEPT_SETS.items():
        by_poet_century[key]['hits'][concept]+=sum(counts[t] for t in terms)
    century_counts[r['centuryInt']]+=1;century_poets[r['centuryInt']].add(r['poet'])
trend=[]
for c in sorted(centuries):
    poets_in=[v for (p,cent),v in by_poet_century.items() if cent==c]
    item={'century':c,'texts':century_counts[c],'poets':len(century_poets[c])}
    for concept in SYSTEM_CONCEPTS:
        rates=[v['hits'][concept]/max(1,v['words'])*10000 for v in poets_in]
        item[concept]=round(sum(rates)/max(1,len(rates)),1)
    trend.append(item)
shifts=[]
for a,b in zip(trend,trend[1:]):
    for concept in SYSTEM_CONCEPTS:
        delta=b[concept]-a[concept]
        shifts.append({'concept':concept,'from':a['century'],'to':b['century'],'delta':round(delta,1),'direction':'افزایش' if delta>0 else 'کاهش'})
shifts=sorted(shifts,key=lambda x:abs(x['delta']),reverse=True)[:8]
counts_values=list(century_counts.values())

principles=[
    {'id':'lexicon','title':'واژگان و ترکیب','plain':'آیا واژه‌ها، ترکیب‌ها و عادت‌های زبانی متن با آثار مطمئن شاعر هم‌خوان است؟','detail':'فراوانی واژه‌های کارکردی، نویسه‌نگاشت، عبارت‌های نادر، هم‌آیی‌ها و الگوی قافیه با مجموعهٔ مرجع مقایسه می‌شود.'},
    {'id':'ideas','title':'جهان فکری و مفاهیم','plain':'آیا شیوهٔ پرسش‌گری، استدلال و تصویرسازی متن به جهان فکری شاعر نزدیک است؟','detail':'مضامین، نسبت مفاهیم، الگوی استدلال و نزدیکی به آثار علمی یا نثر مسلم‌الانتساب بررسی می‌شود؛ تفاوت ژانر باید جدا کنترل شود.'},
    {'id':'style','title':'سبک و ساختار','plain':'آیا ریتم، طول، نحو و شکل بیان با عادت‌های سبکی شاعر سازگار است؟','detail':'ویژگی‌های نویسه‌ای، نحوی، وزنی، طول مصراع، ساخت قافیه و فاصله از مرکز سبک شاعر سنجیده می‌شود.'},
    {'id':'context','title':'بستر تاریخی و فکری','plain':'آیا اشخاص، رویدادها، باورها و واژگان متن با زمان زندگی شاعر سازگارند؟','detail':'ناسازگاری زمانی، اشاره به رخدادهای متأخر، جریان‌های فکری، شبکهٔ حامیان و جغرافیای فرهنگی کنترل می‌شود.'},
    {'id':'manuscript','title':'نسخه‌ها و زنجیرهٔ نقل','plain':'متن از چه نسخه‌ای آمده و در شاهدهای کهن‌تر چگونه ثبت شده است؟','detail':'قدمت شاهد، استقلال نسخه‌ها، اختلاف قرائت و افزوده‌های کاتبان وارد ارزیابی می‌شود؛ این ستون در TSV فعلی وجود ندارد.'},
]

cases=[
    {
        'id':'khayyam','name':'خیام','subtitle':'بررسی هستهٔ رباعیات و هم‌پوشانی مجموعه‌ها',
        'question':'کدام رباعیات از نظر زبان، ساختار اندیشه و بستر تاریخی با هستهٔ قابل‌اعتمادتر آثار خیام سازگارترند؟',
        'next':'گام بعدی، افزودن تاریخ و تبار نسخه‌ها و یک مجموعهٔ مرجع چندسطحی است؛ دادهٔ فعلی فقط پالایش و مقایسهٔ درون‌پیکره‌ای را ممکن می‌کند.',
        'currentLimit':'پیکره، نام نسخه و تاریخ شاهد را ثبت نمی‌کند؛ بنابراین از این داده نمی‌توان احتمال اصالت نسخه‌شناختی ساخت.',
        'metrics':[
            {'label':'کل رکوردهای خیام','value':len(kh),'detail':f'{len(kh_books)} عنوان کتاب/بخش'},
            {'label':'رباعیِ قابل تحلیل','value':len(kh_verse),'detail':f'{sum(r["units"]==4 for r in kh_verse)} رکورد چهارواحدی'},
            {'label':'نثرِ نیازمند حذف','value':len(kh_prose),'detail':f'{sum(r["words"] for r in kh_prose):,} واژه غیرشعری'},
            {'label':'صورت‌های نزدیک میان دو مجموعه','value':len(parallel_80),'detail':f'{len(parallel_90)} جفت با شباهت دست‌کم ۰٫۹۰'},
        ],
        'findings':[
            f'از {len(kh)} رکورد خیام، سه رکورد با عنوان‌های «مقدمه»، «خیام فیلسوف» و «خیام شاعر» نثر پژوهشی‌اند و در مجموع {sum(r["words"] for r in kh_prose):,} واژه دارند.',
            f'{len(parallel_80)} رباعی از بخش‌های موضوعی، همتایی با شباهت واژگانی دست‌کم ۰٫۸۰ در کتاب «رباعیات» دارد؛ این هم‌پوشانی باید در تقسیم آموزش/آزمون گروه‌بندی شود.',
            f'{sum(r["units"]==4 for r in kh_verse)} از {len(kh_verse)} رکورد شعری چهار واحد جداشده دارند؛ یک رکورد ساخت متفاوت دارد و نیازمند بازبینی است.',
        ],
        'distribution':kh_distribution,
        'conceptProfile':concept_profile(kh_verse),
        'reviewCandidates':kh_parallel_examples,
        'reference':['رباعیات حاضر در شاهدهای کهن‌تر و نسخه‌های مستقل‌تر','آثار علمی و نثرهای دارای انتساب قوی‌تر، با کنترل تفاوت ژانر','مجموعهٔ منفی از رباعیات متأخر یا دارای ناسازگاری روشن'],
        'risks':['شباهت اندیشه بدون شاهد نسخه‌ای، انتساب را ثابت نمی‌کند.','کوتاهی رباعی، عدم‌قطعیت آماری را بالا می‌برد.','صورت‌های نزدیکِ یک شعر نباید به‌عنوان نمونه‌های مستقل شمرده شوند.'],
    },
    {
        'id':'hafez','name':'حافظ','subtitle':'تفکیک دیوان، اشعار منتسب و نیاز نسخه‌شناختی',
        'question':'کدام اختلاف قرائت یا شعر منتسب با زبان، ساختار و شبکهٔ نسخه‌ها سازگارتر است؟',
        'next':'در نسخهٔ بعد باید هر قرائت بیت با شناسهٔ نسخه، تاریخ، تبار و دلیل مصحح ثبت شود؛ سپس امتیاز سبکی فقط یکی از شاهدها خواهد بود.',
        'currentLimit':'TSV فعلی ۱۹ شعر را با برچسب «اشعار منتسب» جدا می‌کند، اما اختلاف نسخه‌ها و انتخاب‌های مصححان را سطر به سطر ندارد.',
        'metrics':[
            {'label':'کل رکوردهای حافظ','value':len(hf),'detail':f'{len(set(r["book_title"] for r in hf))} گروه کتاب'},
            {'label':'غزلِ هستهٔ مقایسه','value':len(hf_core),'detail':'برای ساخت مرکز سبک درون‌پیکره'},
            {'label':'اشعار از پیش برچسب‌خوردهٔ منتسب','value':len(hf_attr),'detail':'فهرست اولویت بازبینی، نه حکم رد'},
            {'label':'رباعیات','value':sum(r['book_title']=='رباعیات' for r in hf),'detail':'باید جدا از غزل سبک‌سنجی شوند'},
        ],
        'findings':[
            f'پیکرهٔ حافظ از {len(hf_core)} غزل، {sum(r["book_title"]=="رباعیات" for r in hf)} رباعی، {sum(r["book_title"]=="قطعات" for r in hf)} قطعه و {len(hf_attr)} شعر با برچسب «منتسب» تشکیل شده است.',
            'فاصلهٔ سبکی ۱۹ شعر منتسب با مرکز ۴۹۵ غزل محاسبه شده است؛ این رتبه‌بندی فقط برای اولویت بازبینی انسانی کاربرد دارد.',
            'مقایسهٔ «حافظ به سعی سایه» یا هر تصحیح دیگر بدون دادهٔ اختلاف قرائت و تبار نسخه‌ها ممکن نیست؛ رابط این کمبود را پنهان نمی‌کند.',
        ],
        'distribution':hf_distribution,
        'conceptProfile':concept_profile(hf_core),
        'reviewCandidates':review[:7],
        'reference':['ثبت هر قرائت در نسخه‌ها و تصحیح‌های منتخب','مقایسهٔ وزن، قافیه، دستور و پیوند قرائت با کل غزل','ثبت دلیل مصحح و جداسازی داوری ذوقی از شاهد نسخه‌شناختی'],
        'risks':['قرائت خوش‌آهنگ‌تر الزاماً کهن‌تر نیست.','نسخه‌های متعدد ممکن است از یک نیای مشترک آمده باشند.','مقایسهٔ رباعی با مرکز سبک غزل، خطای ژانری ایجاد می‌کند.'],
    },
    {
        'id':'systemic','name':'تحلیل دوره‌ای','subtitle':'روندهای فکری و سیاسی در سده‌ها',
        'question':'کدام تغییرهای زبانی و مفهومی هم‌زمان با دگرگونی قدرت، نهادها، مهاجرت و شبکه‌های فکری رخ داده‌اند؟',
        'next':'روندهای فعلی باید در مرحلهٔ بعد به خط زمانی رخدادها و شبکهٔ اشخاص وصل شوند و با گروه کنترل و بازهٔ عدم‌قطعیت آزمون شوند.',
        'currentLimit':'سده در این پیکره عمدتاً سدهٔ زندگی شاعر است، نه تاریخ دقیق سرایش هر شعر؛ هم‌زمانی را نباید علت‌ومعلول خواند.',
        'metrics':[
            {'label':'سده‌های پوشش‌داده‌شده','value':len(centuries),'detail':f'از سده {min(centuries)} تا {max(centuries)} هجری'},
            {'label':'بیشترین متن در یک سده','value':max(counts_values),'detail':f'سده {max(century_counts,key=century_counts.get)}'},
            {'label':'کمترین متن در یک سده','value':min(counts_values),'detail':f'سده {min(century_counts,key=century_counts.get)}'},
            {'label':'نسبت عدم‌توازن','value':round(max(counts_values)/min(counts_values),1),'detail':'لزوم میانگین‌گیری در سطح شاعر'},
        ],
        'findings':[
            'نرخ مفاهیم در نمودار، ابتدا برای هر شاعر جدا و سپس در سطح سده میانگین شده است تا شاعران پرحجم کل روند را تصاحب نکنند.',
            f'پوشش سده‌ها بسیار نامتوازن است: از {min(counts_values)} تا {max(counts_values)} متن؛ بنابراین شمار خام واژه‌ها برای نتیجه‌گیری تاریخی مناسب نیست.',
            'بزرگ‌ترین جهش‌های مشاهده‌شده در رابط نمایش داده می‌شوند، اما هیچ جهش به‌تنهایی اثر یک دولت، جنگ یا جریان فکری را ثابت نمی‌کند.',
        ],
        'distribution':[{'name':f'سده {c}','value':century_counts[c],'note':f'{len(century_poets[c])} شاعر'} for c in sorted(centuries)],
        'conceptProfile':[],
        'reviewCandidates':shifts,
        'reference':['خط زمانی رویدادها، دولت‌ها، جنگ‌ها و مهاجرت‌ها','شبکهٔ دربارها، خانقاه‌ها، مدرسه‌ها و حامیان','مدل مقایسه‌ای برای جداسازی تغییر عمومی زبان از اثر رویداد خاص'],
        'risks':['هم‌زمانی رابطهٔ علت و معلولی را ثابت نمی‌کند.','تاریخ سرایش بسیاری از شعرها دقیق نیست.','پیکرهٔ باقی‌مانده نمایندهٔ کامل تولید ادبی هر دوره نیست.'],
    },
]

quality_alerts=[
    {'level':'critical','title':'نثرِ مخلوط با شعر در پروندهٔ خیام','value':len(kh_prose),'detail':'سه متن بلند توضیحی باید پیش از سبک‌سنجی و انتساب حذف شوند.','items':[r['poem_title'] for r in kh_prose]},
    {'level':'warning','title':'متن‌های تکراری در کل پیکره','value':text_duplicate_extra,'detail':f'{exact_duplicate_extra} ردیف کاملاً یکسان و {text_duplicate_extra} تکرار اضافیِ متن نرمال‌شده دیده شد.','items':[]},
    {'level':'warning','title':'واحدهای بسیار کوتاه','value':len(short_records),'detail':'رکوردهای هشت‌واژه‌ای یا کوتاه‌تر برای مدل مستقل انتساب دادهٔ کافی ندارند.','items':[f'{r["poet"]} — {r["poem_title"]}' for r in short_records[:5]]},
]

result={
    'title':'آزمایشگاه انتساب و اصالت‌سنجی',
    'status':'تحلیل اکتشافی مبتنی بر پیکره؛ نه سامانهٔ صدور حکم قطعی',
    'generatedFrom':{'rows':len(records),'poets':len(poets),'books':len(books),'centuries':len(centuries),'columns':['شاعر','سده','کتاب','عنوان','متن']},
    'qualityAlerts':quality_alerts,
    'principles':principles,
    'cases':cases,
    'systemTrends':{'series':trend,'concepts':SYSTEM_CONCEPTS,'largestShifts':shifts},
    'workflow':[
        ['۱','پاک‌سازی منبع','حذف مقدمه، شرح، حاشیه، تکرار و متن‌های ویراستار از پیکرهٔ شعر'],
        ['۲','ساخت هستهٔ مرجع','درجه‌بندی آثار مطمئن، محتمل، محل اختلاف و مردود'],
        ['۳','استخراج شواهد','محاسبهٔ زبان، سبک، مفهوم، زمان و نسخه‌شناسی به‌صورت جداگانه'],
        ['۴','کنترل جانشین‌ها','بررسی ژانر، طول متن، کاتب، دوره و منبع سوم'],
        ['۵','برآورد احتمال','کالیبراسیون روی نمونه‌های شناخته‌شده و نمایش بازهٔ اطمینان'],
        ['۶','داوری انسانی','مرور پژوهشگر ادبیات و نسخه‌شناس پیش از انتشار نتیجه'],
    ],
    'outputs':[
        ['سازگار','شواهد چندلایه عمدتاً با انتساب همراه‌اند؛ هنوز حکم قطعی نیست.'],
        ['نیازمند بازبینی','شواهد متناقض یا ناکافی‌اند و نسخه یا زمینه باید دوباره بررسی شود.'],
        ['انتساب ضعیف','چند ناسازگاری مستقل وجود دارد، اما رد نهایی نیازمند شاهد تاریخی است.'],
        ['غیرقابل برآورد','دادهٔ مرجع یا طول متن برای نتیجهٔ قابل‌اعتماد کافی نیست.'],
    ],
    'team':[
        ['ادبیات و سبک‌شناسی','تعریف آثار مرجع، تفسیر شواهد و کنترل تفاوت ژانر'],
        ['نسخه‌شناسی و تصحیح متن','تبار نسخه‌ها، اختلاف قرائت و تاریخ شاهدها'],
        ['تاریخ اندیشه و علوم','سنجش سازگاری مفاهیم، اصطلاحات و جهان فکری'],
        ['تاریخ اجتماعی و سیاسی','ساخت خط زمان، شبکهٔ اشخاص و سنجش ادعاهای زمینه‌ای'],
        ['زبان‌شناسی رایانشی','مدل‌های سبک، معنا، عدم‌قطعیت و ارزیابی بدون نشت'],
        ['طراحی اطلاعات','تبدیل نتیجهٔ پیچیده به توضیح روشن، قابل‌ردیابی و غیراغراق‌آمیز'],
    ],
}
OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
AUDIT.parent.mkdir(parents=True,exist_ok=True)
with AUDIT.open('w',encoding='utf-8-sig',newline='') as fh:
    w=csv.writer(fh)
    w.writerow(['نوع هشدار','شاعر','کتاب','عنوان','تعداد واژه','تعداد واحد','توضیح'])
    for r in kh_prose:
        w.writerow(['نثر در پیکره شعر',r['poet'],r['book_title'],r['poem_title'],r['words'],r['units'],'حذف پیش از تحلیل انتساب'])
    for r in short_records:
        w.writerow(['متن بسیار کوتاه',r['poet'],r['book_title'],r['poem_title'],r['words'],r['units'],'عدم کفایت برای داوری مستقل'])
    for item in review[:10]:
        w.writerow(['اولویت بازبینی سبک حافظ','حافظ',item['book'],item['title'],item['words'],item['units'],f"فاصله درون‌پیکره‌ای {item['distance']}؛ {item['reason']}"])
print(f'Wrote {OUT.relative_to(ROOT)} and {AUDIT.relative_to(ROOT)} from {len(records):,} records')
