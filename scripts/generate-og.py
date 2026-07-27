from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'og'
OUT.mkdir(parents=True, exist_ok=True)

def first_existing_font(*candidates):
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    raise FileNotFoundError(f'No usable font found in: {", ".join(filter(None, candidates))}')

FONT_BOLD = first_existing_font(
    '/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
)
FONT_REG = first_existing_font(
    '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
)
FONT_MIXED = first_existing_font(
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    FONT_REG,
)

CARDS = {
    'og-home.png': ('از شعر تا داده', 'اطلس تعاملی تحلیل داده‌های شعر فارسی', '#0f766e'),
    'og-research.png': ('ده پژوهش داده‌محور', 'از پرسش‌های عمومی تا سنجش انتساب و پیوندهای متنی', '#0f766e'),
    'og-topics.png': ('تحول مضامین شعر فارسی', 'یازده محور موضوعی در سده‌های سوم تا پانزدهم', '#0f766e'),
    'og-metaphors.png': ('زندگی و دگرگونی استعاره‌ها', 'آینه، آتش، قفس، راه و شش خانواده تصویری دیگر', '#b9862d'),
    'og-intertextuality.png': ('نقشه پیوندهای متنی شاعران', 'شباهت عبارتی، واژگانی و موضوعی در تاریخ شعر فارسی', '#9f2f38'),
    'og-century-ai.png': ('تشخیص سده شعر با هوش مصنوعی', 'ارزیابی معتبر، نشتی شاعر و خطاهای تاریخی', '#315ba8'),
    'og-stylometry.png': ('اثر انگشت سبکی شاعران', 'شناسایی امضای زبانی و شعرهای نامتعارف', '#7c3aed'),
    'og-forms.png': ('غزل، قصیده، رباعی و مثنوی', 'مقایسه ساختار، معنا و تشخیص قالب در ۳۶ هزار متن', '#c45d2a'),
    'og-geography.png': ('جغرافیای تخیل و مهاجرت شعر', 'خاستگاه، کانون فعالیت و مسیرهای تقریبی ۶۷ شاعر', '#0e7490'),
    'og-lexical-life.png': ('نیمه‌عمر واژگان شعر فارسی', 'تولد، اوج، افول، ماندگاری و بازبرجستگی واژه‌ها', '#4d7c0f'),
    'og-attribution.png': ('سنجش انتساب شعر فارسی', 'خیام، حافظ و شواهد زبانی، فکری، تاریخی و نسخه‌ای', '#7c3aed'),
    'og-public-questions.png': ('ده پرسش جذاب از شعر فارسی', 'دل یا عقل، شب یا روز، غم یا شادی و هفت پرسش دیگر', '#9f2f38'),
    'og-poets.png': ('۶۷ شاعر در یک اطلس داده‌ای', 'از رودکی و فردوسی تا نیما، فروغ و شاملو', '#b9862d'),
    'og-methodology.png': ('روش‌شناسی شفاف پژوهش', 'نمونه‌گیری متوازن، آزمون جایگشتی و اندازه اثر', '#315ba8'),
    'og-glossary.png': ('واژه‌نامه داده و ادبیات', 'تعریف ساده اصطلاحات تحلیل محاسباتی شعر', '#7c3aed'),
    'og-data.png': ('داده‌های قابل دانلود شعر فارسی', 'JSON و CSV برای پژوهش، بازتولید و آموزش', '#0f766e'),
}

def hexrgb(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0,2,4))

def blend(a, b, t):
    return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))

def fit_font(text, max_width, start=78, minimum=38):
    size = start
    while size >= minimum:
        font = ImageFont.truetype(FONT_BOLD, size)
        box = font.getbbox(text, direction='rtl', language='fa')
        if box[2]-box[0] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(FONT_BOLD, minimum)

def content_font(text, size):
    font_path = FONT_MIXED if any(char.isascii() and char.isalpha() for char in text) else FONT_REG
    return ImageFont.truetype(font_path, size)

def fit_content_font(text, max_width, start=34, minimum=24):
    size = start
    while size >= minimum:
        font = content_font(text, size)
        box = font.getbbox(text, direction='rtl', language='fa')
        if box[2]-box[0] <= max_width:
            return font
        size -= 1
    return content_font(text, minimum)

def draw_logo(draw, cx, cy, size=150):
    r = size / 2
    pts = []
    for i in range(6):
        angle = math.radians(30 + i*60)
        pts.append((cx + r*math.cos(angle), cy + r*math.sin(angle)))
    draw.polygon(pts, fill=(216, 174, 79))
    pen = [(cx, cy-r*0.55),(cx+r*0.28,cy-r*0.05),(cx,cy+r*0.55),(cx-r*0.28,cy-r*0.05)]
    draw.polygon(pen, fill=(255,248,232))
    draw.ellipse((cx-10,cy-12,cx+10,cy+8), fill=(159,47,56))
    draw.rounded_rectangle((cx-5,cy+5,cx+5,cy+45), radius=5, fill=(159,47,56))

def make_card(filename, title, subtitle, accent):
    W,H = 1200,630
    bg1=(7,45,44); bg2=(20,82,79); acc=hexrgb(accent)
    im=Image.new('RGB',(W,H),bg1); px=im.load()
    for y in range(H):
        for x in range(W):
            t=(x/W)*0.65+(y/H)*0.35
            px[x,y]=blend(bg1,bg2,t)
    draw=ImageDraw.Draw(im,'RGBA')
    # Persian geometric lattice
    for x in range(-80,W+160,80):
        for y in range(-80,H+160,80):
            draw.line([(x,y+40),(x+40,y),(x+80,y+40),(x+40,y+80),(x,y+40)], fill=(216,174,79,38), width=2)
            draw.ellipse((x+34,y+34,x+46,y+46), outline=(216,174,79,28), width=1)
    draw.ellipse((-180,330,370,880), fill=(*acc,55))
    draw.ellipse((780,-250,1380,350), fill=(*acc,35))
    draw_logo(draw,1000,150,165)
    right=850
    title_font=fit_font(title,760,82,38)
    subtitle_font=fit_content_font(subtitle,760,34,24)
    creator_font=ImageFont.truetype(FONT_REG,24)
    draw.text((right,275), title, font=title_font, fill=(255,248,232), anchor='ra', direction='rtl', language='fa')
    draw.text((right,390), subtitle, font=subtitle_font, fill=(224,194,120), anchor='ra', direction='rtl', language='fa')
    draw.rounded_rectangle((560,474,850,534), radius=18, fill=(255,255,255,25), outline=(255,255,255,42), width=1)
    draw.text((830,504),'کاری از حسین کریمی',font=creator_font,fill=(218,235,232),anchor='rm',direction='rtl',language='fa')
    draw.text((70,565),'az-sher-ta-dadeh',font=ImageFont.truetype(FONT_MIXED,20),fill=(218,235,232,150),anchor='la')
    im.save(OUT/filename,optimize=True)

for filename,(title,subtitle,accent) in CARDS.items():
    make_card(filename,title,subtitle,accent)
shutil.copyfile(OUT / 'og-home.png', ROOT / 'public' / 'og-card.png')
print(f'generated {len(CARDS)} cards in {OUT} and refreshed public/og-card.png')
