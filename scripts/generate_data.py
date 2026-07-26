from __future__ import annotations

import json
import math
import re
import shutil
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path('/mnt/data/from-poetry-to-data-site')
DATASET = Path('/mnt/data/stylometry/poems_with_more_info.tsv')
STYL = Path('/mnt/data/stylometry_report')
OUT = ROOT / 'src' / 'data' / 'atlasData.json'

FA_MAP = str.maketrans({'ي':'ی','ك':'ک','ۀ':'ه','ة':'ه','ؤ':'و','إ':'ا','أ':'ا','ٱ':'ا','ـ':''})
DIACRITICS = re.compile(r'[\u064b-\u065f\u0670\u06d6-\u06ed]')
TOKEN_RE = re.compile(r'[آ-ی]+')
VERSE_SEPARATOR_RE = re.compile(r'\s{3,}')


def normalize(text: str) -> str:
    text = str(text or '').translate(FA_MAP)
    text = DIACRITICS.sub('', text)
    return re.sub(r'\s+', ' ', text).strip()


def tokens(text: str) -> list[str]:
    return TOKEN_RE.findall(normalize(text))


def couplet_count(text: str) -> int:
    """Pair source hemistich units into couplets; round an odd final unit up."""
    units = [part for part in VERSE_SEPARATOR_RE.split(str(text or '').strip()) if part.strip()]
    return math.ceil(len(units) / 2)


def clean_poet_name(name: str) -> str:
    name = normalize(name)
    name = re.sub(r'\s*\(\s*', ' (', name)
    name = re.sub(r'\s*\)\s*', ')', name)
    name = re.sub(r'\s+', ' ', name).strip()
    name = name.replace('ا لیـــار', 'الیار').replace('اِ لیار', 'الیار')
    return name


df = pd.read_csv(DATASET, sep='\t')
df['poet_display'] = df['poet'].map(clean_poet_name)
df['poem_norm'] = df['poem'].fillna('').map(normalize)
df['word_count'] = df['poem_norm'].map(lambda x: len(TOKEN_RE.findall(x)))
df['couplet_count'] = df['poem'].fillna('').map(couplet_count)

century = (
    df.groupby('century')
      .agg(texts=('poem', 'size'), poets=('poet', 'nunique'), books=('book_title', 'nunique'), couplets=('couplet_count', 'sum'), words=('word_count', 'sum'), median_words=('word_count', 'median'))
      .reset_index()
      .sort_values('century')
)
century['share'] = century['texts'] / len(df) * 100

total_words = int(df['word_count'].sum())

poets = (
    df.groupby(['poet', 'poet_display', 'century'])
      .agg(poems=('poem', 'size'), books=('book_title', 'nunique'), median_words=('word_count', 'median'), total_words=('word_count', 'sum'), total_couplets=('couplet_count', 'sum'))
      .reset_index()
      .sort_values(['century', 'poems'], ascending=[True, False])
)
poets['avg_words'] = poets['total_words'] / poets['poems']

featured_images = {
    'فردوسی': {
        'src': '/poets/ferdowsi.jpg',
        'source': 'https://commons.wikimedia.org/wiki/File:FerdowsiFartur.jpg',
        'license': 'مالکیت عمومی',
        'credit': 'وزارت معارف ایران، بزرگداشت هزاره فردوسی'
    },
    'مولوی': {
        'src': '/poets/rumi.jpg',
        'source': 'https://commons.wikimedia.org/wiki/File:Maul%C3%A1n%C3%A1_Jal%C3%A1l_al-D%C3%ADn..jpg',
        'license': 'مالکیت عمومی',
        'credit': 'نگاره پسامرگ، هند گورکانی، سده نوزدهم'
    },
    'حافظ': {
        'src': '/poets/hafez.jpg',
        'source': 'https://commons.wikimedia.org/wiki/File:Mohammad_Shams_al-Din_Hafez.jpg',
        'license': 'مالکیت عمومی',
        'credit': 'جزئی از تذهیب نسخه خطی دیوان حافظ'
    },
    'سعدی': {
        'src': '/poets/saadi.png',
        'source': 'https://commons.wikimedia.org/wiki/File:Saadi_Shirazi.png',
        'license': 'مالکیت عمومی',
        'credit': 'تمبر کنگره بین‌المللی سعدی'
    },
    'فروغ فرخزاد': {
        'src': '/poets/forough.jpg',
        'source': 'https://commons.wikimedia.org/wiki/File:Forough_Farrokhzad.JPG',
        'license': 'مالکیت عمومی',
        'credit': 'عکس منتشرشده در مجموعه اشعار فروغ'
    },
    'نیما یوشیج (آوای آزاد)': {
        'src': '/poets/nima.jpg',
        'source': 'https://commons.wikimedia.org/wiki/File:Nima_Yushij_-_Original.jpg',
        'license': 'مالکیت عمومی',
        'credit': 'هادی شفائیه'
    },
}

poets_json = []
for row in poets.itertuples(index=False):
    image = featured_images.get(row.poet_display)
    poets_json.append({
        'name': row.poet_display,
        'rawName': row.poet,
        'century': int(row.century),
        'poems': int(row.poems),
        'books': int(row.books),
        'medianWords': round(float(row.median_words), 1),
        'averageWords': round(float(row.avg_words), 1),
        'totalWords': int(row.total_words),
        'totalCouplets': int(row.total_couplets),
        'image': image,
    })

# Topic-model results, transcribed from the validated research report.
topic_names = [
    'اخلاق، حکمت و خرد',
    'حماسه، شاهی و جنگ',
    'دین، تصوف تعلیمی و مناقب',
    'جان، دل و پیوند عاشقانه',
    'تصویرهای حسی و وجودی',
    'زیبایی معشوق و بزم',
    'طبیعت، گل و بهار',
    'شب، زمان و گذر عمر',
    'عشق عرفانی و عاشقانه',
    'کیهان، قدرت و بخت',
    'غم، فراق و هجران',
]

topic_keywords = [
    ['کار','خویش','سخن','بد','همی','نیک','دست'],
    ['همی','شاه','سپاه','تخت','جنگ'],
    ['الله','حق','تعالی','علیه','رضی'],
    ['دل','جان','درد','دلم','تن','جانان'],
    ['آب','پر','چشم','رنگ','آتش','آیینه','خاک','سینه'],
    ['سر','زلف','لب','چشم','مست','لعل','رخ'],
    ['گل','باغ','لاله','بلبل','چمن','بهار','خار'],
    ['شب','روز','خواب','ماه','سیاه'],
    ['عشق','عاشق','دوست','حسن','عقل','عاشقان'],
    ['جهان','ملک','فلک','باد','دولت','چرخ','شاه'],
    ['غم','دلم','یار','شادی','درد','عمر'],
]

topic_matrix = {
    3: [18.2,22.0,3.1,7.1,10.8,8.6,8.2,5.8,2.4,9.2,4.4],
    4: [10.6,48.7,1.6,5.2,5.0,5.6,7.1,6.7,1.3,6.4,1.9],
    5: [13.2,18.7,13.1,8.8,5.6,5.1,8.3,7.9,2.4,10.3,6.8],
    6: [15.8,7.5,6.9,11.1,6.9,9.5,6.3,6.4,4.8,18.5,6.3],
    7: [11.3,3.2,4.0,16.7,5.8,15.8,8.1,7.0,10.5,10.0,7.3],
    8: [11.9,3.4,6.9,14.4,6.4,15.9,7.6,5.9,8.5,13.2,5.9],
    9: [10.8,6.0,2.6,13.3,10.7,12.5,8.0,8.0,7.6,11.9,8.4],
    10:[9.7,2.8,5.3,14.5,12.4,12.2,7.0,4.4,10.1,11.3,10.2],
    11:[6.4,0.9,3.6,14.3,29.0,10.7,9.8,3.3,9.3,7.1,5.4],
    12:[6.0,2.9,3.4,18.9,7.3,7.9,11.7,10.8,5.4,15.4,10.2],
    13:[6.8,4.0,4.0,12.6,7.0,20.9,7.1,6.6,9.2,17.1,4.7],
    14:[8.5,4.2,2.1,8.3,28.7,7.0,10.1,12.8,6.3,6.4,5.6],
    15:[5.2,3.8,3.3,18.5,18.3,6.9,12.8,6.0,11.3,6.3,7.5],
}

topic_shares = [10.8,7.8,5.4,11.5,14.0,10.0,8.4,8.0,6.6,10.9,6.4]
topic_peaks = [3,4,5,12,11,13,15,14,15,6,12]
topic_peak_shares = [18.2,48.7,13.1,18.9,29.0,20.9,12.8,12.8,11.3,18.5,10.2]
topic_eps = [0.133,0.277,0.090,0.189,0.584,0.419,0.000,0.364,0.292,0.292,0.039]
topic_rho = [-0.413,-0.439,-0.181,0.012,0.647,-0.036,0.244,0.212,0.393,-0.322,0.108]
topic_qtrend = [0.002,0.001,0.196,0.924,0.0001,0.849,0.086,0.133,0.003,0.017,0.471]
topic_qdiff = [0.076,0.007,0.140,0.031,0.0001,0.001,0.522,0.002,0.006,0.006,0.281]

topics_json=[]
for i,n in enumerate(topic_names):
    topics_json.append({
        'id': i+1,
        'name': n,
        'keywords': topic_keywords[i],
        'overallShare': topic_shares[i],
        'peakCentury': topic_peaks[i],
        'peakShare': topic_peak_shares[i],
        'epsilonSquared': topic_eps[i],
        'rho': topic_rho[i],
        'qTrend': topic_qtrend[i],
        'qCentury': topic_qdiff[i],
        'significantTrend': topic_qtrend[i] < 0.05,
        'direction': 'افزایشی' if topic_rho[i] > 0 else 'کاهشی',
        'values': [{'century': c, 'share': topic_matrix[c][i]} for c in range(3,16)],
    })

topic_transitions = [
    {'from':13,'to':14,'jsd':0.113,'confidence':'پوشش شاعر نسبتاً مناسب'},
    {'from':4,'to':5,'jsd':0.108,'confidence':'احتیاط؛ یک سده کم‌نمونه است'},
    {'from':11,'to':12,'jsd':0.093,'confidence':'احتیاط؛ یک سده کم‌نمونه است'},
    {'from':3,'to':4,'jsd':0.065,'confidence':'احتیاط؛ یک سده کم‌نمونه است'},
    {'from':12,'to':13,'jsd':0.047,'confidence':'احتیاط؛ یک سده کم‌نمونه است'},
    {'from':5,'to':6,'jsd':0.045,'confidence':'پوشش شاعر نسبتاً مناسب'},
    {'from':7,'to':8,'jsd':0.007,'confidence':'پایدارترین گذار کلاسیک'},
]

# Metaphor extraction for dynamic century trends.
metaphor_defs = [
    ('آینه و بازتاب', ['آینه','آیینه']),
    ('قفس و زندان', ['قفس','زندان']),
    ('دریا، موج و ساحل', ['دریا','موج','ساحل']),
    ('آتش، شعله و شرر', ['آتش','شعله','شرر','اخگر']),
    ('باده، شراب و ساقی', ['باده','شراب','ساقی','ساغر','میخانه','جام']),
    ('گل و بلبل', ['گل','گلستان','گلزار','گلشن','بلبل']),
    ('زنجیر و اسارت', ['زنجیر','اسیر','اسارت']),
    ('راه، سفر و منزل', ['راه','ره','سفر','منزل','کاروان','رهرو']),
    ('نور، شمع و تاریکی', ['نور','شمع','چراغ','ظلمت','تاریکی','روشنایی']),
    ('خون، زخم و خنجر', ['خون','خونین','زخم','خنجر']),
]

# Convert each poem once to token counts; this is more memory-friendly than a document-term matrix.
metaphor_names = [x[0] for x in metaphor_defs]
metaphor_terms = {name:set(terms) for name,terms in metaphor_defs}
records=[]
for row in df[['poet_display','century','poem_norm','word_count']].itertuples(index=False):
    ts=TOKEN_RE.findall(row.poem_norm)
    cnt=Counter(ts)
    rec={'poet':row.poet_display,'century':int(row.century),'words':max(1,int(row.word_count))}
    for name,terms in metaphor_terms.items():
        rec[name]=sum(cnt[t] for t in terms)
    records.append(rec)
mdf=pd.DataFrame(records)

# Poet-level rates and century-balanced mean.
poet_meta = mdf.groupby(['poet','century']).agg(words=('words','sum'), **{f'c{i}':(name,'sum') for i,name in enumerate(metaphor_names)}).reset_index()
for i,name in enumerate(metaphor_names):
    poet_meta[f'r{i}'] = poet_meta[f'c{i}'] / poet_meta['words'] * 10000

metaphor_rates=[]
for cent in range(3,16):
    sub=poet_meta[poet_meta['century']==cent]
    row={'century':cent}
    for i,name in enumerate(metaphor_names):
        row[name]=round(float(sub[f'r{i}'].mean()),3) if len(sub) else 0
    metaphor_rates.append(row)

# Validated summary statistics from report.
metaphor_summary_rows = [
    ('راه، سفر و منزل',35316,15591,28.6,36.3,67,4,10,'۹–۱۱',1.58,0.000,0.253,0.048,'عشق، بدن و معشوق',8.4,0.143,0.007),
    ('گل و بلبل',27370,13556,24.9,28.1,67,4,11,'۱۲–۱۵',1.51,0.042,0.280,0.034,'عشق، بدن و معشوق',-3.1,0.115,0.017),
    ('نور، شمع و تاریکی',23952,12588,23.1,24.6,67,4,8,'۶–۸',1.55,0.177,0.376,0.004,'رنج، مرگ و فقدان',5.2,0.122,0.007),
    ('خون، زخم و خنجر',23438,12895,23.7,24.1,67,4,13,'۱۲–۱۵',2.13,0.000,0.244,0.052,'قدرت و نبرد',-4.4,0.118,0.020),
    ('باده، شراب و ساقی',21796,10856,19.9,22.4,67,4,8,'۶–۸',2.17,0.219,0.213,0.084,'عشق، بدن و معشوق',6.0,0.068,0.164),
    ('آتش، شعله و شرر',19037,11033,20.2,19.5,67,4,11,'۹–۱۱',1.55,0.099,0.332,0.012,'عشق، بدن و معشوق',2.9,0.072,0.100),
    ('دریا، موج و ساحل',17175,9182,16.8,17.6,67,4,11,'۹–۱۱',1.54,0.171,0.276,0.034,'عشق، بدن و معشوق',7.7,0.087,0.065),
    ('آینه و بازتاب',9057,5831,10.7,9.3,64,7,11,'۹–۱۱',2.33,0.191,0.379,0.004,'عشق، بدن و معشوق',7.6,0.091,0.041),
    ('قفس و زندان',3376,2543,4.7,3.5,64,5,14,'۱۲–۱۵',2.07,0.198,0.489,0.0001,'طبیعت و زیبایی',18.9,0.094,0.041),
    ('زنجیر و اسارت',3055,2458,4.5,3.1,67,4,11,'۹–۱۱',1.26,0.211,0.435,0.001,'عشق، بدن و معشوق',-7.1,0.061,0.197),
]
metaphor_summaries=[]
for r in metaphor_summary_rows:
    metaphor_summaries.append({
        'name':r[0],'occurrences':r[1],'poems':r[2],'poemPercent':r[3],'rate':r[4],'poets':r[5],
        'stableEmergence':r[6],'stablePeak':r[7],'dominantPeriod':r[8],'newToEarlyRatio':r[9],
        'epsilonSquared':r[10],'rho':r[11],'qTrend':r[12],
        'semanticField':r[13],'semanticShiftPoints':r[14],'semanticR2':r[15],'semanticQ':r[16],
    })

metaphor_transitions = [
    {'name':'آینه و بازتاب','from':5,'to':6,'jsd':0.578,'poetsBefore':6,'poetsAfter':8},
    {'name':'قفس و زندان','from':13,'to':14,'jsd':0.550,'poetsBefore':3,'poetsAfter':15},
    {'name':'دریا، موج و ساحل','from':13,'to':14,'jsd':0.428,'poetsBefore':3,'poetsAfter':16},
    {'name':'زنجیر و اسارت','from':5,'to':6,'jsd':0.418,'poetsBefore':9,'poetsAfter':8},
    {'name':'باده، شراب و ساقی','from':5,'to':6,'jsd':0.360,'poetsBefore':9,'poetsAfter':10},
    {'name':'نور، شمع و تاریکی','from':13,'to':14,'jsd':0.324,'poetsBefore':3,'poetsAfter':16},
    {'name':'آتش، شعله و شرر','from':13,'to':14,'jsd':0.293,'poetsBefore':3,'poetsAfter':16},
    {'name':'خون، زخم و خنجر','from':5,'to':6,'jsd':0.267,'poetsBefore':9,'poetsAfter':10},
    {'name':'گل و بلبل','from':13,'to':14,'jsd':0.259,'poetsBefore':3,'poetsAfter':17},
    {'name':'راه، سفر و منزل','from':13,'to':14,'jsd':0.257,'poetsBefore':3,'poetsAfter':17},
]

metaphor_pairs = [
    {'period':'کلاسیک','source':'آتش، شعله و شرر','target':'نور، شمع و تاریکی','npmi':0.253},
    {'period':'کلاسیک','source':'آتش، شعله و شرر','target':'خون، زخم و خنجر','npmi':0.244},
    {'period':'کلاسیک','source':'قفس و زندان','target':'زنجیر و اسارت','npmi':0.240},
    {'period':'کلاسیک','source':'دریا، موج و ساحل','target':'نور، شمع و تاریکی','npmi':0.237},
    {'period':'کلاسیک','source':'دریا، موج و ساحل','target':'آتش، شعله و شرر','npmi':0.221},
    {'period':'جدید','source':'دریا، موج و ساحل','target':'نور، شمع و تاریکی','npmi':0.248},
    {'period':'جدید','source':'آتش، شعله و شرر','target':'نور، شمع و تاریکی','npmi':0.239},
    {'period':'جدید','source':'دریا، موج و ساحل','target':'آتش، شعله و شرر','npmi':0.233},
    {'period':'جدید','source':'قفس و زندان','target':'زنجیر و اسارت','npmi':0.223},
    {'period':'جدید','source':'آتش، شعله و شرر','target':'خون، زخم و خنجر','npmi':0.220},
]

word_shifts = {
    'آینه و بازتاب': {'classic':['ببینی','دان','نمود','بنماید','صفات'], 'modern':['آغوش','برکه','خاموشی','پرواز','دنیا']},
    'قفس و زندان': {'classic':['کرم','خرد','جدا','عاشق','هجران'], 'modern':['نغمه','بهار','آشیانه','صدا','صیاد']},
    'دریا، موج و ساحل': {'classic':['خیمه','خدمت','خداوند','مراد'], 'modern':['جنگل','افق','صدای','زندگی','ناخدا']},
    'آتش، شعله و شرر': {'classic':['یابی','تافته','برافروز','ندانی'], 'modern':['فانوس','خاموش','تمنا','شراره','خاموشی']},
    'باده، شراب و ساقی': {'classic':['نعمت','طعام','بهرام','چوگان','سراب'], 'modern':['مینای','کهنه','لب‌های','تنهایی','قلب']},
    'گل و بلبل': {'classic':['نوایی','صافی','هشیار','حضرت','دلستان'], 'modern':['گلچین','شاخه','جنون','عطر','نگاه']},
    'زنجیر و اسارت': {'classic':['هجر','کمر','قفل','تخت','خواری'], 'modern':['سایه','آشیان','جسم','شکسته','مرغ']},
    'راه، سفر و منزل': {'classic':['طالب','زاهد','قول','قبول','آمدن'], 'modern':['تلاش','جست‌وجو','ریشه','نگاه','مهتاب']},
    'نور، شمع و تاریکی': {'classic':['ساکن','میغ','سپر','گریم','بگشاد'], 'modern':['سکوت','آزادی','پنجره','کوچه','صدا']},
    'خون، زخم و خنجر': {'classic':['جگرها','کوس','نباید','برآرم'], 'modern':['تنهایی','جاده','انسان','ملت','تپیده']},
}

# Intertextual network.
intertext_edges = [
    ('خاقانی','مولوی',6,7,29,12.00,0.267,0.959,0.983,'بسیار قوی'),
    ('فردوسی','اسدی توسی',4,5,1,0.40,0.439,0.988,0.978,'محدود'),
    ('حافظ','هلالی جغتایی',8,9,2,0.93,0.282,0.953,0.974,'محدود'),
    ('حافظ','فروغی بسطامی',8,13,1,0.76,0.315,0.939,0.972,'محدود'),
    ('جامی','وحشی',9,10,1,0.43,0.298,0.938,0.967,'محدود'),
    ('خواجوی کرمانی','امیرخسرو دهلوی',7,8,8,3.22,0.266,0.928,0.966,'بسیار قوی'),
    ('حافظ','شهریار',8,14,10,7.19,0.278,0.879,0.961,'بسیار قوی'),
    ('سلمان ساوجی','هلالی جغتایی',8,9,1,0.48,0.275,0.933,0.960,'محدود'),
    ('ابوسعید ابوالخیر','عراقی',5,7,4,5.13,0.255,0.925,0.959,'قابل توجه'),
    ('سیف فرغانی','وحشی',7,10,1,1.21,0.260,0.917,0.957,'محدود'),
    ('ابوسعید ابوالخیر','سعدی',5,7,5,6.05,0.241,0.941,0.952,'قابل توجه'),
    ('ابوسعید ابوالخیر','امیرخسرو دهلوی',5,8,4,6.13,0.244,0.929,0.951,'قابل توجه'),
    ('ابوسعید ابوالخیر','مولوی',5,7,3,3.88,0.234,0.979,0.951,'قابل توجه'),
    ('خواجوی کرمانی','هلالی جغتایی',7,9,1,0.93,0.246,0.944,0.948,'محدود'),
    ('ابوسعید ابوالخیر','شیخ بهایی',5,10,16,12.00,0.225,0.984,0.948,'بسیار قوی'),
    ('ابوسعید ابوالخیر','عبید زاکانی',5,8,8,11.23,0.230,0.950,0.946,'بسیار قوی'),
    ('وحشی','شهریار',10,14,1,1.09,0.250,0.900,0.943,'محدود'),
    ('حافظ','عرفی',8,10,1,0.95,0.270,0.930,0.940,'محدود'),
    ('ابوسعید ابوالخیر','باباافضل کاشانی',5,6,38,6.51,0.300,0.970,0.938,'قابل توجه'),
    ('عرفی','صائب تبریزی',10,11,1,0.42,0.330,0.940,0.932,'محدود'),
]
intertext_json=[{
    'source':a,'target':b,'sourceCentury':sc,'targetCentury':tc,'phrases':phr,'phraseZ':z,
    'lexical':lex,'topic':top,'score':score,'evidence':ev
} for a,b,sc,tc,phr,z,lex,top,score,ev in intertext_edges]

influencers = [
    ('حافظ',8,7,0.1967,0.0033),('ابوسعید ابوالخیر',5,11,0.1833,0.0049),('سعدی',7,4,0.0865,0.0023),
    ('هلالی جغتایی',9,3,0.0864,0.0044),('باباافضل کاشانی',6,4,0.0725,0.0033),('خواجوی کرمانی',7,3,0.0687,0.0),
    ('رودکی',3,5,0.0648,0.0),('جامی',9,2,0.0609,0.0),('امیرخسرو دهلوی',8,2,0.0541,0.0033),('خیام',6,3,0.0529,0.0016),
    ('سیف فرغانی',7,2,0.0469,0.0),('هاتف اصفهانی',12,1,0.0398,0.0007)
]
receivers = [
    ('کسایی',4,1,0.8976,1),('اسدی توسی',5,1,0.3259,2),('ناصرخسرو',5,1,0.2965,3),('منوچهری',5,1,0.2942,4),
    ('ابوسعید ابوالخیر',5,1,0.2887,5),('نصرالله منشی',6,4,0.2756,6),('باباافضل کاشانی',6,3,0.2025,7),
    ('شاه نعمت‌الله ولی',8,5,0.1608,8),('عراقی',7,4,0.1566,9),('سنایی',6,2,0.1384,10),('انوری',6,2,0.1354,11),
    ('امیرخسرو دهلوی',8,4,0.1290,12)
]
communities = [
    {'id':1,'name':'حماسه و روایت منظوم','centuries':'۴–۶','members':['فردوسی','اسدی توسی','فخرالدین اسعد گرگانی','نظامی']},
    {'id':2,'name':'تعلیم، عرفان و نثر کلاسیک','centuries':'۵–۸','members':['ناصرخسرو','هجویری','سنایی','عطار','نصرالله منشی','شیخ محمود شبستری']},
    {'id':3,'name':'سبک هندی و شعر دوره میانه/جدید','centuries':'۹–۱۴','members':['جامی','شیخ بهایی','عرفی','محتشم کاشانی','وحشی','بیدل دهلوی','صائب تبریزی']},
    {'id':4,'name':'غزل کلاسیک تا غزل معاصر','centuries':'۵–۱۵','members':['باباطاهر','خیام','سعدی','حافظ','سلمان ساوجی','عبید زاکانی','هلالی جغتایی']},
    {'id':5,'name':'رباعی و عرفان غنایی','centuries':'۵–۱۴','members':['ابوسعید ابوالخیر','باباافضل کاشانی','مهستی گنجوی','خواجوی کرمانی','سیف فرغانی','عراقی','مولوی']},
    {'id':6,'name':'قصیده خراسانی و مدح','centuries':'۳–۱۳','members':['رودکی','کسایی','فرخی سیستانی','مسعود سعد سلمان','منوچهری','انوری','خاقانی']},
    {'id':7,'name':'شعر نو و معاصر','centuries':'۱۴–۱۵','members':['احمد شاملو','سهراب سپهری','سیمین بهبهانی','شیون فومنی','فروغ فرخزاد','مهدی اخوان ثالث','نیما یوشیج (آوای آزاد)']},
]
shared_phrases = [
    {'pair':'خاقانی ← مولوی','phrases':['ادمانی فالقهوه من شرطی لاالتوبه','انصف ندمانی لو انکر ادمانی','برکش چون طفل دبستانی تا']},
    {'pair':'خواجوی کرمانی ← امیرخسرو دهلوی','phrases':['بر ورق لاله زار بنویسد','بنویسد نسیم باد صبا شرح','ریحان به مشک بر ورق']},
    {'pair':'حافظ ← شهریار','phrases':['امیدم که نسیم صبحگاهی به','به دور لاله دماغ مرا','بگو آن غزال رعنا را']},
]

# Century classification benchmark.
cm = np.array([
[.68,.01,.07,.08,.07,.02,.01,.01,.01,.00,.01,.03,.01],
[.02,.47,.18,.16,.03,.00,.01,.04,.00,.01,.05,.04,.01],
[.01,.06,.55,.09,.08,.01,.02,.05,.01,.01,.03,.06,.00],
[.03,.03,.09,.54,.10,.01,.02,.05,.01,.01,.04,.08,.00],
[.01,.01,.08,.16,.53,.03,.04,.03,.01,.00,.02,.06,.01],
[.01,.01,.03,.05,.06,.73,.01,.01,.02,.02,.01,.04,.00],
[.00,.01,.05,.04,.06,.01,.78,.02,.00,.01,.00,.02,.00],
[.00,.01,.03,.04,.03,.01,.00,.79,.01,.01,.01,.03,.01],
[.01,.01,.01,.02,.00,.00,.01,.04,.84,.00,.01,.03,.01],
[.05,.02,.14,.07,.00,.05,.00,.11,.02,.32,.05,.11,.07],
[.02,.02,.10,.06,.05,.01,.04,.06,.03,.01,.53,.05,.02],
[.02,.02,.08,.12,.09,.01,.03,.07,.03,.02,.04,.45,.02],
[.00,.00,.00,.01,.02,.00,.00,.03,.00,.00,.01,.02,.89],
])

# Stylometry.
metrics=json.loads((STYL/'metrics.json').read_text())
profile=pd.read_csv(STYL/'poet_profiles.csv')
profile['poet']=profile['poet'].map(clean_poet_name)
nearest=pd.read_csv(STYL/'nearest_poets.csv')
nearest['poet']=nearest['poet'].map(clean_poet_name)
nearest['nearest_poet']=nearest['nearest_poet'].map(clean_poet_name)
disp=pd.read_csv(STYL/'dispersion.csv')
disp['poet']=disp['poet'].map(clean_poet_name)
anom=pd.read_csv(STYL/'top_anomalies.csv')
anom['poet']=anom['poet'].map(clean_poet_name)
anom['snippet']=anom['text'].fillna('').map(lambda x: normalize(x)[:280] + ('…' if len(normalize(x))>280 else ''))

reason_counts=anom['reason'].fillna('نامشخص').value_counts().to_dict()

# Hero poetic snippets are from the corpus; keep them brief and paired with source attribution.
hero_snippets=[]
for poet_name in ['رودکی','فردوسی','مولوی','حافظ','سعدی','فروغ فرخزاد','سهراب سپهری']:
    row=df[df['poet_display']==poet_name].iloc[0]
    snippet=' '.join(tokens(row['poem_norm'])[:18])
    hero_snippets.append({'poet':poet_name,'text':snippet,'title':normalize(row['poem_title'])})

payload = {
    'meta': {
        'title':'از شعر تا داده',
        'subtitle':'اطلس تعاملی تحلیل داده‌های شعر فارسی',
        'creator':'حسین کریمی',
        'linkedin':'https://www.linkedin.com/in/hossein-karimi-8a452153/',
        'source':None,
        'generatedFrom':'هشت مطالعه داده‌محور درباره مضامین، استعاره، بینامتنیت، تشخیص سده، سبک‌سنجی، مقایسه قالب‌ها، جغرافیای ادبی و چرخه عمر واژگان',
    },
    'overview': {
        'texts':int(len(df)), 'poets':int(df['poet'].nunique()), 'centuries':int(df['century'].nunique()),
        'books':int(df['book_title'].nunique()), 'couplets':int(df['couplet_count'].sum()), 'words':total_words,
        'medianWords':round(float(df['word_count'].median()),1), 'averageWords':round(float(df['word_count'].mean()),1),
        'centuryStats':[
            {'century':int(r.century),'texts':int(r.texts),'poets':int(r.poets),'books':int(r.books),'couplets':int(r.couplets),'words':int(r.words),'medianWords':round(float(r.median_words),1),'share':round(float(r.share),2)}
            for r in century.itertuples(index=False)
        ],
        'poets':poets_json,
        'heroSnippets':hero_snippets,
    },
    'topics': {
        'items':topics_json,
        'transitions':topic_transitions,
        'globalStats': {'rSquared':0.376,'permutationP':0.002,'modelTopics':11,'trainingTexts':13166,'balancedPerPoet':250},
        'story':[ 
            {'period':'سده‌های ۳ تا ۵','text':'پیکره با حکمت و حماسه آغاز می‌شود؛ در سده چهارم وزن فردوسی، زبان شاهی و جنگ را برجسته می‌کند.'},
            {'period':'سده‌های ۶ تا ۱۰','text':'جان و دل، زیبایی معشوق، عشق و واژگان کیهانی هم‌زمان حضور دارند؛ سده‌های هفتم و هشتم پایدارترین گذار را می‌سازند.'},
            {'period':'سده یازدهم','text':'تصویرهای حسی و وجودی به اوج می‌رسند؛ آینه، رنگ، خاک و آتش در زبان بیدل و شاعران سبک هندی پررنگ‌اند.'},
            {'period':'سده‌های ۱۴ و ۱۵','text':'شب، زمان، تجربه فردی و تصویر حسی برجسته می‌شوند؛ اما کمبود شاعر در سده پانزدهم نیازمند احتیاط است.'},
        ],
    },
    'metaphors': {
        'items':metaphor_summaries,
        'ratesByCentury':metaphor_rates,
        'transitions':metaphor_transitions,
        'pairs':metaphor_pairs,
        'wordShifts':word_shifts,
        'globalStats': {'poemMetaphorPairs':96533,'absoluteR2':0.095,'absoluteP':0.007,'relativeCompositionP':0.568},
    },
    'intertext': {
        'edges':intertext_json,
        'influencers':[{'name':a,'century':b,'outLinks':c,'strength':d,'betweenness':e} for a,b,c,d,e in influencers],
        'receivers':[{'name':a,'century':b,'inLinks':c,'strength':d,'rank':e} for a,b,c,d,e in receivers],
        'communities':communities,
        'sharedPhrases':shared_phrases,
        'qap':[
            {'layer':'عبارت نادر','stat':-0.1305,'p':0.001},
            {'layer':'شباهت واژگانی','stat':-0.3508,'p':0.001},
            {'layer':'شباهت موضوعی','stat':-0.3268,'p':0.001},
        ],
        'globalStats': {'rareFiveGrams':641,'wordBudgetPerPoet':30000,'stability':0.6883},
    },
    'centuryModel': {
        'labels':list(range(9,22)),
        'confusionMatrix':cm.tolist(),
        'recall':np.diag(cm).round(3).tolist(),
        'benchmark': {'meanRecall':round(float(np.diag(cm).mean()),3),'medianRecall':round(float(np.median(np.diag(cm))),3),'minRecall':round(float(np.diag(cm).min()),3),'maxRecall':round(float(np.diag(cm).max()),3),'validation':'تقسیم ۸۵/۱۵ در پژوهش مقایسه‌ای؛ نه حذف کامل شاعر'},
        'baselines': {'uniform':round(1/13,4),'majority':round(float(century['share'].max()/100),4)},
        'evaluationDesigns':[
            {'name':'تقسیم تصادفی شعر','leakage':95,'validity':20},
            {'name':'تقسیم بر اساس کتاب','leakage':65,'validity':55},
            {'name':'حذف کامل شاعر','leakage':10,'validity':95},
        ],
        'metrics':['ماکرو اف‌یک','دقت متوازن','خطای مطلق سده‌ای','دقت در فاصله یک سده','کالیبراسیون'],
    },
    'stylometry': {
        'metrics':metrics,
        'profiles':[
            {'poet':r.poet,'century':int(r.century),'pc1':round(float(r.pc1),4),'pc2':round(float(r.pc2),4),
             'uniqueRatio':round(float(r.unique_ratio),4),'averageWordLength':round(float(r.avg_word_len),3),
             'commaRate':round(float(r.comma_rate),3),'questionRate':round(float(r.question_rate),3)}
            for r in profile.itertuples(index=False)
        ],
        'nearest':[
            {'poet':r.poet,'nearest':r.nearest_poet,'similarity':round(float(r.similarity),4),'century':int(r.century),'nearestCentury':int(r.nearest_century)}
            for r in nearest.head(20).itertuples(index=False)
        ],
        'dispersion':[
            {'poet':r.poet,'texts':int(r.n),'medianWords':round(float(r.median_words),1),'iqr':round(float(r.iqr_anomaly),4),'topOnePercent':int(r.top1_n)}
            for r in disp.head(20).itertuples(index=False)
        ],
        'anomalies':[
            {'poet':r.poet,'century':int(r.century),'book':normalize(r.book_title),'title':normalize(r.poem_title),
             'words':int(r.n_words),'percentile':round(float(r.anomaly_percentile),4),'robustZ':round(float(r.robust_z),3),
             'reason':normalize(r.reason),'snippet':r.snippet}
            for r in anom.head(24).itertuples(index=False)
        ],
        'reasonCounts':reason_counts,
    },
}

OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(',',':')), encoding='utf-8')
print(f'Wrote {OUT} ({OUT.stat().st_size/1024:.1f} KB)')
