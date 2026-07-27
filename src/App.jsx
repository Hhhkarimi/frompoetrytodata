import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown, ArrowLeft, BarChart3, BookOpen, BrainCircuit, ChevronLeft,
  CircleHelp, Clock3, Database, ExternalLink, Feather, Fingerprint,
  GitBranch, Heart, Info, Menu, Moon, Network, Search,
  Sparkles, Sun, X, ZoomIn,
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import atlas from './data/atlasData.json';
import poetCouplets from './data/poetCouplets.json';
import formResearch from './data/formResearch.json';
import geographyResearch from './data/geographyResearch.json';
import lexicalResearch from './data/lexicalResearch.json';
import Logo from './components/Logo.jsx';
import { Linkedin } from './components/BrandIcons.jsx';
import Chart from './components/Chart.jsx';
import { Card, Insight, Section } from './components/Section.jsx';
import {
  overviewCoverageOption, poetTreemapOption, topicRiverOption, singleTopicOption,
  topicStatsOption, transitionBarOption, metaphorBubbleOption, metaphorLifeOption,
  metaphorNetworkOption, intertextNetworkOption, intertextScatterOption,
  rankingBarOption, centuryHeatmapOption, recallOption, evaluationOption,
  stylometryPcaOption, classifierOption, nearestOption, dispersionOption,
  reasonDonutOption, geographyCentersOption, regionFlowOption, periodMobilityOption,
  lexicalLifecycleOption, halfLifeOption,
} from './chartOptions.js';
import { compactFa, faDigits, faNumber, faPercent } from './utils.js';
import { audiencePaths, faqItems, researchPages } from './content/siteContent.js';

const NAV_ITEMS = [
  ['خانه', 'home'], ['پیکره', 'overview'], ['مضامین', 'topics'], ['استعاره‌ها', 'metaphors'],
  ['بینامتنیت', 'intertext'], ['هوش مصنوعی', 'century-ai'], ['اثر انگشت', 'stylometry'],
  ['قالب‌ها', 'forms'], ['جغرافیا', 'geography'], ['نیمه‌عمر واژه', 'lexical-life'],
  ['شاعران', 'poets'], ['راهنما', 'knowledge'],
];

const accents = ['#0f766e', '#b9862d', '#9f2f38', '#315ba8', '#7c3aed', '#c45d2a', '#0e7490', '#4d7c0f'];
const corpusPoets = atlas.overview.poets.map((poet) => ({
  ...poet,
  totalCouplets: poetCouplets[poet.name] || 0,
}));
const corpusCouplets = corpusPoets.reduce((sum, poet) => sum + poet.totalCouplets, 0);
const POET_METRICS = {
  poems: { label: 'شعر/متن', note: 'تعداد رکوردهای کامل هر شاعر در پیکره' },
  couplets: { label: 'بیت', note: 'تعداد ابیات هر شاعر بر پایه جفت‌سازی مصراع‌های جداشده در متن منبع' },
  words: { label: 'واژه', note: 'مجموع واژه‌های فارسی هر شاعر پس از نرمال‌سازی' },
};

function StatCard({ value, label, note, icon: Icon, accent = '#0f766e' }) {
  return (
    <Card className="stat-card reveal" accent={accent}>
      <span className="stat-icon"><Icon size={22} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </Card>
  );
}

function ChartCard({ title, kicker, children, className = '', actions, note }) {
  return (
    <Card className={`chart-card reveal ${className}`}>
      <div className="card-head">
        <div>{kicker && <span>{kicker}</span>}<h3>{title}</h3></div>
        {actions && <div className="card-actions">{actions}</div>}
      </div>
      {children}
      {note && <p className="chart-note"><Info size={15} />{note}</p>}
    </Card>
  );
}

function MiniMetric({ label, value, detail }) {
  return (
    <div className="mini-metric">
      <span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}
    </div>
  );
}

function PersianSelect({ value, onChange, children, label }) {
  return (
    <label className="select-wrap">
      {label && <span>{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </label>
  );
}

function StoryRail({ items }) {
  return (
    <div className="story-rail">
      {items.map((item, index) => (
        <article className="story-step reveal" key={item.period}>
          <span>{faNumber(index + 1)}</span>
          <div><h3>{item.period}</h3><p>{item.text}</p></div>
        </article>
      ))}
    </div>
  );
}

function PoetCard({ poet, onOpen }) {
  const initials = poet.name.split(' ').slice(0, 2).map((x) => x[0]).join('');
  return (
    <button className="poet-card reveal" onClick={() => onOpen(poet)}>
      <div className={`poet-avatar ${poet.image ? 'has-image' : ''}`}>
        {poet.image ? <img src={poet.image.src} alt={`تصویری از ${poet.name}`} loading="lazy" /> : <span>{initials}</span>}
      </div>
      <div className="poet-card-copy">
        <h3>{poet.name}</h3>
        <p>سده {faNumber(poet.century)} هجری</p>
        <div><span>{faNumber(poet.poems)} متن</span><span>{faNumber(poet.books)} کتاب</span></div>
      </div>
      <ChevronLeft size={18} />
    </button>
  );
}

function PoetModal({ poet, onClose }) {
  if (!poet) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article className="poet-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={poet.name}>
        <button className="modal-close" onClick={onClose} aria-label="بستن"><X /></button>
        <div className="poet-modal-hero">
          <div className={`poet-modal-image ${poet.image ? 'has-image' : ''}`}>
            {poet.image ? <img src={poet.image.src} alt={poet.name} /> : <Feather size={58} />}
          </div>
          <div><span className="eyebrow">پرونده داده‌ای شاعر</span><h2>{poet.name}</h2><p>سده {faNumber(poet.century)} هجری</p></div>
        </div>
        <div className="poet-modal-stats">
          <MiniMetric label="تعداد متن" value={faNumber(poet.poems)} />
          <MiniMetric label="تعداد ابیات" value={faNumber(poet.totalCouplets)} />
          <MiniMetric label="عنوان کتاب" value={faNumber(poet.books)} />
          <MiniMetric label="میانه طول متن" value={`${faNumber(poet.medianWords)} واژه`} />
          <MiniMetric label="کل واژه‌ها" value={faNumber(poet.totalWords)} />
        </div>
        <p className="modal-explain">این نمایه توصیفی، تعداد متن‌ها، ابیات و واژه‌های حاضر در پیکره را نشان می‌دهد؛ کم یا زیاد بودن آن‌ها معادل اهمیت ادبی شاعر نیست.</p>
        {poet.image && <a className="credit-link" href={poet.image.source} target="_blank" rel="noreferrer">اعتبار تصویر: {poet.image.credit} — {poet.image.license}<ExternalLink size={14} /></a>}
      </article>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [topicId, setTopicId] = useState(atlas.topics.items[0].id);
  const [metaphor, setMetaphor] = useState(atlas.metaphors.items[0].name);
  const [metaphorPeriod, setMetaphorPeriod] = useState('کلاسیک');
  const [edgeThreshold, setEdgeThreshold] = useState(0.94);
  const [poetSearch, setPoetSearch] = useState('');
  const [poetCentury, setPoetCentury] = useState('همه');
  const [selectedPoet, setSelectedPoet] = useState(null);
  const [showAllPoets, setShowAllPoets] = useState(false);
  const [poetMetric, setPoetMetric] = useState('poems');
  const [progress, setProgress] = useState(0);
  const [citationCopied, setCitationCopied] = useState(false);

  const selectedTopic = atlas.topics.items.find((t) => t.id === Number(topicId)) || atlas.topics.items[0];
  const selectedMetaphor = atlas.metaphors.items.find((m) => m.name === metaphor) || atlas.metaphors.items[0];
  const centuries = useMemo(() => [...new Set(corpusPoets.map((p) => p.century))].sort((a, b) => a - b), []);
  const filteredPoets = useMemo(() => corpusPoets.filter((p) => {
    const searchOk = p.name.replace(/\s/g, '').includes(poetSearch.replace(/\s/g, ''));
    const centuryOk = poetCentury === 'همه' || p.century === Number(poetCentury);
    return searchOk && centuryOk;
  }), [poetSearch, poetCentury]);
  const visiblePoets = showAllPoets ? filteredPoets : filteredPoets.slice(0, 18);
  const featuredPoets = corpusPoets.filter((p) => p.image);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible'));
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

    const sections = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-20% 0px -65%', threshold: [0.05, 0.2, 0.5] });
    NAV_ITEMS.forEach(([, id]) => { const el = document.getElementById(id); if (el) sections.observe(el); });

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { reveal.disconnect(); sections.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const copyCitation = async () => {
    const citation = `کریمی، حسین. (${faDigits(new Date().getFullYear())}). «از شعر تا داده؛ اطلس تعاملی تحلیل داده‌های شعر فارسی». ${window.location.origin}/`;
    try {
      await navigator.clipboard.writeText(citation);
      setCitationCopied(true);
      window.setTimeout(() => setCitationCopied(false), 1800);
    } catch {
      setCitationCopied(false);
    }
  };

  return (
    <div className="site-shell">
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <header className="site-header">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}><Logo /></a>
        <nav className={menuOpen ? 'is-open' : ''}>
          {NAV_ITEMS.map(([label, id]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => scrollTo(id)}>{label}</button>)}
          <a className="nav-linkedin" href={atlas.meta.linkedin} target="_blank" rel="me noreferrer"><Linkedin size={17} />لینکدین</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? 'حالت روشن' : 'حالت تاریک'}>{dark ? <Sun /> : <Moon />}</button>
          <button className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="فهرست">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-pattern" />
          <div className="hero-copy reveal">
            <span className="hero-badge"><Sparkles size={16} />روایت تعاملی هزار سال شعر فارسی</span>
            <h1>از <em>شعر</em> تا <strong>داده</strong></h1>
            <p className="nastaliq">واژه‌ها را ببین؛ تاریخ را لمس کن</p>
            <p className="hero-intro">اطلسی عمومی و پژوهشی با هشت مطالعه درباره تحول مضامین، زندگی استعاره‌ها، شبکه شاعران، هوش مصنوعی، سبک، قالب، جغرافیا و چرخه عمر واژگان شعر فارسی.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => scrollTo('overview')}>شروع کاوش <ArrowDown size={18} /></button>
              <a className="secondary-button" href="/research/">مطالعات پژوهشی <BookOpen size={18} /></a>
            </div>
            <div className="creator-line"><span>کاری از</span><strong>حسین کریمی</strong><a href={atlas.meta.linkedin} target="_blank" rel="noreferrer" aria-label="لینکدین حسین کریمی"><Linkedin size={18} /></a></div>
          </div>
          <div className="hero-visual reveal">
            <div className="poet-orbit">
              <div className="orbit-core"><Logo compact /><span>{faNumber(atlas.overview.texts)}</span><small>متن</small></div>
              {featuredPoets.map((poet, i) => (
                <button className={`orbit-poet orbit-poet-${i + 1}`} key={poet.name} onClick={() => setSelectedPoet(poet)} title={poet.name}>
                  <img src={poet.image.src} alt={poet.name} /><span>{poet.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="hero-scroll" onClick={() => scrollTo('overview')}><span>پایین بروید</span><ArrowDown /></button>
        </section>

        <Section id="overview" eyebrow="در یک نگاه" title="گستره پیکره شعر فارسی" intro="پیش از هر تفسیر، باید بدانیم داده از چه دوره‌ها و شاعرانی ساخته شده است. اندازه هر بخش در این صفحه، بازتاب حضور آن در پیکره است؛ نه رتبه ادبی.">
          <div className="stats-grid corpus-stats">
            <StatCard icon={BookOpen} value={faNumber(atlas.overview.texts)} label="متن و شعر" note="واحد اصلی تحلیل" accent="#0f766e" />
            <StatCard icon={Feather} value={faNumber(corpusPoets.length)} label="شاعر" note="از سده سوم تا پانزدهم" accent="#b9862d" />
            <StatCard icon={Database} value={faNumber(atlas.overview.books)} label="عنوان کتاب" note="گونه‌ها و مجموعه‌های متفاوت" accent="#9f2f38" />
            <StatCard icon={Feather} value={compactFa(corpusCouplets)} label="بیت" note="بر پایه مصراع‌های جداشده در منبع" accent="#7c3aed" />
            <StatCard icon={BarChart3} value={compactFa(atlas.overview.words)} label="واژه" note={`میانه هر متن: ${faNumber(atlas.overview.medianWords)}`} accent="#315ba8" />
          </div>
          <div className="two-column">
            <ChartCard title="پوشش زمانی پیکره" kicker="متن و شاعر در هر سده" note="محور میله‌ها تعداد متن و خط، تعداد شاعران را نشان می‌دهد.">
              <Chart option={overviewCoverageOption(atlas.overview.centuryStats, dark)} ariaLabel="نمودار تعداد متن و شاعر در سده‌های هجری" />
            </ChartCard>
            <ChartCard title="سهم شاعران از پیکره" kicker={`اندازه خانه بر پایه ${POET_METRICS[poetMetric].label}`} actions={
              <div className="segmented poet-metric-switch" role="group" aria-label="معیار اندازه خانه‌های نمودار شاعران">
                {Object.entries(POET_METRICS).map(([key, item]) => (
                  <button type="button" key={key} className={poetMetric === key ? 'active' : ''} aria-pressed={poetMetric === key} onClick={() => setPoetMetric(key)}>{item.label}</button>
                ))}
              </div>
            } note={`${POET_METRICS[poetMetric].note}. با مکث روی هر خانه، هر سه مقدار شعر/متن، بیت و واژه نمایش داده می‌شود.`}>
              <Chart option={poetTreemapOption(corpusPoets, poetMetric, dark)} ariaLabel={`نقشه درختی سهم شاعران بر پایه ${POET_METRICS[poetMetric].label}`} />
            </ChartCard>
          </div>
          <div className="insight-grid">
            <Insight title="چرا وزن‌دهی لازم است؟" tone="gold" icon={<BarChart3 />}>تعداد شعرها میان شاعران یکسان نیست. تحلیل‌های تاریخی با میانگین برابر شاعران یا نمونه‌گیری متوازن محاسبه شده‌اند.</Insight>
            <Insight title="یک سده، یک تاریخ دقیق نیست" tone="blue" icon={<CircleHelp />}>برچسب سده به دوره زندگی شاعر اشاره دارد، نه زمان دقیق سرایش هر متن؛ پس نتایج، روندهای کلان‌اند.</Insight>
            <Insight title="برای مخاطب عام" tone="teal" icon={<Heart />}>هر نمودار را می‌توانید لمس، بزرگ‌نمایی یا فیلتر کنید. توضیح پایین هر نمودار، معنای آن را بدون نیاز به دانش آماری بیان می‌کند.</Insight>
          </div>
        </Section>

        <Section id="topics" eyebrow="پژوهش یکم" title="رودخانه تحول مضامین" intro="یازده محور موضوعی نشان می‌دهند ذهن و زبان شعر فارسی در طول سده‌ها چگونه جابه‌جا شده است. این تحلیل روی نمونه‌ای متوازن از شاعران انجام شده تا شاعران پرحجم بر نتیجه مسلط نشوند." className="section-tinted">
          <div className="research-banner reveal">
            <div><BrainCircuit /><span>مدل موضوعی</span><strong>{faNumber(atlas.topics.globalStats.modelTopics)} مضمون</strong></div>
            <div><Database /><span>نمونه آموزش</span><strong>{faNumber(atlas.topics.globalStats.trainingTexts)} متن</strong></div>
            <div><BarChart3 /><span>تبیین تفاوت</span><strong>{faPercent(atlas.topics.globalStats.rSquared * 100)}</strong></div>
            <div><Sparkles /><span>معناداری</span><strong>p = {faDigits(atlas.topics.globalStats.permutationP)}</strong></div>
          </div>
          <ChartCard title="رودخانه یازده مضمون" kicker="سهم نسبی هر مضمون در سده‌ها">
            <Chart height={540} option={topicRiverOption(atlas.topics.items, dark)} ariaLabel="نمودار رودخانه‌ای تحول مضامین" />
          </ChartCard>
          <div className="two-column split-40-60">
            <ChartCard title="داستان یک مضمون" kicker="انتخاب و دنبال‌کردن یک مسیر" actions={
              <PersianSelect value={topicId} onChange={setTopicId}>
                {atlas.topics.items.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}
              </PersianSelect>
            }>
              <Chart option={singleTopicOption(selectedTopic, dark)} height={360} />
              <div className="metric-strip">
                <MiniMetric label="اوج" value={`سده ${faNumber(selectedTopic.peakCentury)}`} detail={faPercent(selectedTopic.peakShare)} />
                <MiniMetric label="جهت روند" value={selectedTopic.direction} detail={`ρ = ${faNumber(selectedTopic.rho, { maximumFractionDigits: 3 })}`} />
                <MiniMetric label="واژگان راهنما" value={selectedTopic.keywords.slice(0, 3).join('، ')} />
              </div>
            </ChartCard>
            <ChartCard title="کدام مضمون واقعاً تغییر کرده؟" kicker="روند زمانی در برابر اندازه اثر سده">
              <Chart option={topicStatsOption(atlas.topics.items, dark)} height={455} />
            </ChartCard>
          </div>
          <StoryRail items={atlas.topics.story} />
          <div className="two-column">
            <ChartCard title="لحظه‌های گسست موضوعی" kicker="واگرایی ترکیب مضامین میان دو سده" note="ستون بلندتر یعنی ساختار موضوعی در آن گذار بیشتر تغییر کرده است.">
              <Chart option={transitionBarOption(atlas.topics.transitions, dark, 'واگرایی موضوعی')} />
            </ChartCard>
            <Card className="finding-panel reveal">
              <span className="eyebrow">نتیجه قابل‌فهم</span>
              <h3>از حماسه و حکمت، به تجربه حسی و فردی</h3>
              <p>در آغاز پیکره، زبان شاهی، جنگ و خرد برجسته است. در دوره‌های میانی، عشق، جان و زیبایی میدان مشترک می‌سازند. در سده یازدهم تصویرهای حسی و وجودی بالا می‌آیند و در شعر جدید، شب، زمان و تجربه فردی سهم بیشتری می‌گیرند.</p>
              <div className="finding-numbers">
                <MiniMetric label="قوی‌ترین افزایش" value="تصویرپردازی حسی" detail="ρ = ۰٫۶۴۷" />
                <MiniMetric label="قوی‌ترین کاهش" value="حماسه و شاهی" detail="ρ = −۰٫۴۳۹" />
                <MiniMetric label="بزرگ‌ترین گسست" value="سده ۱۳ ← ۱۴" detail="JSD = ۰٫۱۱۳" />
              </div>
            </Card>
          </div>
        </Section>

        <Section id="metaphors" eyebrow="پژوهش دوم" title="تولد، خاموشی و دگرگونی استعاره‌ها" intro="ده خانواده تصویری از راه و سفر تا آینه، قفس و آتش دنبال شده‌اند. در اینجا «مرگ» به معنی ناپدیدشدن کامل نیست؛ بیشتر با خاموشی، بازگشت و تغییر همسایگان معنایی روبه‌رو هستیم.">
          <div className="three-metric-band reveal">
            <MiniMetric label="خانواده استعاری" value={faNumber(atlas.metaphors.items.length)} />
            <MiniMetric label="پیوند شعر–استعاره" value={faNumber(atlas.metaphors.globalStats.poemMetaphorPairs)} />
            <MiniMetric label="تفاوت تراکم دوره‌ای" value="معنادار" detail={`p = ${faDigits(atlas.metaphors.globalStats.absoluteP)}`} />
          </div>
          <div className="two-column">
            <ChartCard title="نقشه فراوانی استعاره‌ها" kicker="گستردگی در شعرها و شدت کاربرد">
              <Chart option={metaphorBubbleOption(atlas.metaphors.items, dark)} />
            </ChartCard>
            <ChartCard title="خط زندگی یک استعاره" kicker="نرخ متوازن میان شاعران" actions={
              <PersianSelect value={metaphor} onChange={setMetaphor}>
                {atlas.metaphors.items.map((m) => <option key={m.name}>{m.name}</option>)}
              </PersianSelect>
            }>
              <Chart option={metaphorLifeOption(metaphor, atlas.metaphors.ratesByCentury, dark)} />
              <div className="metric-strip">
                <MiniMetric label="ظهور پایدار" value={`سده ${faNumber(selectedMetaphor.stableEmergence)}`} />
                <MiniMetric label="دوره غالب" value={faDigits(selectedMetaphor.dominantPeriod)} />
                <MiniMetric label="نسبت جدید به کهن" value={faNumber(selectedMetaphor.newToEarlyRatio, { maximumFractionDigits: 2 })} />
              </div>
            </ChartCard>
          </div>
          <div className="semantic-shift reveal">
            <div className="shift-head"><div><span className="eyebrow">دگرگونی معنا</span><h3>{metaphor}</h3></div><strong>{selectedMetaphor.semanticField}</strong></div>
            <div className="word-cloud-pair">
              <div><span>همسایگان کلاسیک</span>{atlas.metaphors.wordShifts[metaphor].classic.map((w, i) => <b style={{ '--i': i }} key={w}>{w}</b>)}</div>
              <ArrowLeft />
              <div><span>همسایگان جدید</span>{atlas.metaphors.wordShifts[metaphor].modern.map((w, i) => <b style={{ '--i': i }} key={w}>{w}</b>)}</div>
            </div>
            <p>معنای یک تصویر از خود واژه به‌تنهایی به دست نمی‌آید؛ تغییر واژه‌های اطراف آن نشان می‌دهد چگونه کاربرد ادبی‌اش در طول زمان بازتعریف شده است.</p>
          </div>
          <div className="two-column">
            <ChartCard title="منظومه هم‌رخدادی استعاره‌ها" kicker="کدام تصویرها بیش از انتظار کنار هم می‌آیند؟" actions={
              <div className="segmented"><button className={metaphorPeriod === 'کلاسیک' ? 'active' : ''} onClick={() => setMetaphorPeriod('کلاسیک')}>کلاسیک</button><button className={metaphorPeriod === 'جدید' ? 'active' : ''} onClick={() => setMetaphorPeriod('جدید')}>جدید</button></div>
            }>
              <Chart option={metaphorNetworkOption(atlas.metaphors.pairs, metaphorPeriod, dark)} height={500} />
            </ChartCard>
            <ChartCard title="بزرگ‌ترین جهش‌های معنایی" kicker="تغییر شبکه واژگان پیرامونی">
              <Chart option={transitionBarOption(atlas.metaphors.transitions.map((d) => ({ ...d, confidence: d.name })), dark, 'واگرایی معنایی')} height={500} />
            </ChartCard>
          </div>
        </Section>

        <Section id="intertext" eyebrow="پژوهش سوم" title="شبکه بینامتنیت و قرابت شاعران" intro="شباهت عبارت‌های نادر، واژگان و الگوی موضوعی در یک شبکه جهت‌دار ترکیب شده‌اند. پیکان از شاعر قدیمی‌تر به شاعر جدیدتر می‌رود؛ اما این پیوند، شاهد محاسباتی است و به‌تنهایی تأثیر تاریخی مستقیم را اثبات نمی‌کند." className="section-tinted">
          <div className="network-toolbar reveal">
            <div><Network /><div><strong>آستانه نمایش شبکه</strong><span>پیوندهای قوی‌تر از {faNumber(edgeThreshold, { maximumFractionDigits: 2 })}</span></div></div>
            <input type="range" min="0.93" max="0.98" step="0.005" value={edgeThreshold} onChange={(e) => setEdgeThreshold(Number(e.target.value))} />
          </div>
          <ChartCard title="نقشه تعاملی قرابت بینامتنی" kicker="گره‌ها را جابه‌جا و شبکه را بزرگ‌نمایی کنید" note="ضخامت یال در پیوندهای نمایش‌داده‌شده از ۱٫۴ تا ۷٫۲ پیکسل نرمال شده و قدرت امتیاز مرکب را نشان می‌دهد؛ پیکان همیشه از شاعر متقدم به شاعر متأخر است. رنگ، نوع شاهد را جدا می‌کند.">
            <Chart option={intertextNetworkOption(atlas.intertext.edges, edgeThreshold, dark)} height={650} />
            <div className="network-legend" aria-label="راهنمای رنگ و ضخامت یال‌ها">
              <span><i className="edge-thin" />امتیاز کمتر</span>
              <span><i className="edge-thick" />امتیاز بیشتر</span>
              <span><b className="evidence-strong" />شاهد بسیار قوی</span>
              <span><b className="evidence-notable" />شاهد قابل توجه</span>
              <span><b className="evidence-limited" />شاهد محدود</span>
            </div>
          </ChartCard>
          <div className="two-column">
            <ChartCard title="واژه شبیه است یا موضوع؟" kicker="مقایسه سه نوع شاهد">
              <Chart option={intertextScatterOption(atlas.intertext.edges, dark)} />
            </ChartCard>
            <Card className="method-card reveal">
              <span className="eyebrow">سه لایه شاهد</span>
              <div className="method-steps">
                <div><span>۱</span><strong>عبارت نادر</strong><p>پنج‌واژه‌های مشترکی که در کل پیکره کم‌تکرارند.</p></div>
                <div><span>۲</span><strong>واژگان</strong><p>هم‌پوشانی وزن‌دار واژه‌ها پس از کنترل حجم آثار.</p></div>
                <div><span>۳</span><strong>موضوع</strong><p>نزدیکی ترکیب مضامین، بدون نیاز به عبارت یکسان.</p></div>
              </div>
              <p className="method-result">پایداری شبکه در نمونه‌گیری‌های متفاوت: <strong>{faPercent(atlas.intertext.globalStats.stability * 100)}</strong></p>
            </Card>
          </div>
          <div className="two-column">
            <ChartCard title="شاعران با بیشترین خروجی شبکه" kicker="اثرگذاری محاسباتی">
              <Chart option={rankingBarOption(atlas.intertext.influencers, 'strength', dark, '#0f766e')} />
            </ChartCard>
            <ChartCard title="شاعران با بیشترین دریافت شبکه" kicker="ورودی قرابت‌های جهت‌دار">
              <Chart option={rankingBarOption(atlas.intertext.receivers, 'strength', dark, '#9f2f38')} />
            </ChartCard>
          </div>
          <div className="phrase-grid">
            {atlas.intertext.sharedPhrases.map((item) => (
              <Card className="phrase-card reveal" key={item.pair}>
                <GitBranch /><h3>{item.pair}</h3>
                {item.phrases.map((p) => <blockquote key={p}>«{p}»</blockquote>)}
              </Card>
            ))}
          </div>
          <div className="community-grid">
            {atlas.intertext.communities.map((c) => (
              <article className="community-card reveal" key={c.id}>
                <span>{faNumber(c.id)}</span><h3>{c.name}</h3><p>سده‌های {faDigits(c.centuries)}</p>
                <div>{c.members.map((m) => <button key={m} onClick={() => setSelectedPoet(corpusPoets.find((p) => p.name === m))}>{m}</button>)}</div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="century-ai" eyebrow="پژوهش چهارم" title="آیا هوش مصنوعی سده شعر را تشخیص می‌دهد؟" intro="پرسش اصلی ساده است، اما ارزیابی آن دشوار: اگر آثار یک شاعر هم در آموزش و هم در آزمون باشند، مدل ممکن است شاعر را بشناسد نه زمان را. معتبرترین آزمون، حذف کامل شاعر آزمون از آموزش است.">
          <div className="two-column split-40-60">
            <ChartCard title="دام ارزیابی آسان" kicker="نشت اطلاعات در برابر اعتبار تاریخی">
              <Chart option={evaluationOption(atlas.centuryModel.evaluationDesigns, dark)} />
            </ChartCard>
            <Card className="ai-answer reveal">
              <BrainCircuit size={44} />
              <span className="nastaliq">پاسخ: بله، اما با احتیاط</span>
              <h3>هوش مصنوعی نشانه‌های زمانی را می‌بیند؛ بااین‌حال شاعر، ژانر و کتاب می‌توانند پاسخ را لو بدهند.</h3>
              <p>دقت بالا در تقسیم تصادفی لزوماً به معنای تاریخ‌گذاری واقعی نیست. این مطالعه، معیارهای ماکرو اف‌یک، دقت متوازن، خطای مطلق سده‌ای و دقت در بازه یک سده را پیشنهاد می‌کند.</p>
              <div className="baseline-row">
                <MiniMetric label="حدس یکنواخت" value={faPercent(atlas.centuryModel.baselines.uniform * 100)} />
                <MiniMetric label="سده پرتکرار" value={faPercent(atlas.centuryModel.baselines.majority * 100)} />
                <MiniMetric label="میانگین بازیابی مقایسه‌ای" value={faPercent(atlas.centuryModel.benchmark.meanRecall * 100)} />
              </div>
            </Card>
          </div>
          <ChartCard title="مدل کدام سده‌ها را با هم اشتباه می‌گیرد؟" kicker="ماتریس خطای پژوهش مقایسه‌ای" note={atlas.centuryModel.benchmark.validation}>
            <Chart option={centuryHeatmapOption(atlas.centuryModel, dark)} height={650} />
          </ChartCard>
          <div className="two-column">
            <ChartCard title="بازیابی هر سده" kicker="نسبت نمونه‌های درست تشخیص‌داده‌شده">
              <Chart option={recallOption(atlas.centuryModel, dark)} />
            </ChartCard>
            <Card className="caveat-card reveal">
              <span className="eyebrow">چگونه نتیجه را بخوانیم؟</span>
              <h3>خطاهای نزدیک همیشه شکست کامل نیستند</h3>
              <p>زبان ادبی پیوسته تغییر می‌کند، نه با دیوارهای ناگهانی. پیش‌بینی سده مجاور می‌تواند نشانه یادگیری روند تاریخی باشد؛ بنابراین خطای مطلق سده‌ای در کنار دقت طبقه‌بندی اهمیت دارد.</p>
              <ul>
                <li>تمام شعرهای شاعر آزمون باید از آموزش حذف شوند.</li>
                <li>کتاب‌ها و نسخه‌های تکراری باید گروه‌بندی شوند.</li>
                <li>نتیجه در سطح شاعر، نه فقط شعر، بازنمونه‌گیری شود.</li>
              </ul>
            </Card>
          </div>
        </Section>

        <Section id="stylometry" eyebrow="پژوهش پنجم" title="اثر انگشت سبکی و شعرهای نامتعارف" intro="الگوهای ریز نویسه‌ای، واژگانی و ساختاری می‌توانند شاعر را شناسایی کنند. سپس هر شعر نسبت به مرکز سبک همان شاعر سنجیده می‌شود تا موارد دورافتاده برای بازبینی انسانی پیدا شوند." className="section-tinted">
          <div className="result-hero reveal">
            <div><Fingerprint /><span className="nastaliq">هر شاعر، امضایی در زبان دارد</span></div>
            <strong>{faPercent(atlas.stylometry.metrics.accuracy * 100)}</strong>
            <p>دقت تشخیص شاعر میان {faNumber(atlas.stylometry.metrics.eligible_poets)} شاعر واجد شرایط، در برابر خط مبنای حدود {faPercent(atlas.stylometry.metrics.majority * 100)}؛ آزمون جایگشتی p &lt; {faDigits('0.005')}.</p>
          </div>
          <div className="two-column">
            <ChartCard title="آیا امضای سبکی واقعی است؟" kicker="مدل نویسه‌ای در برابر خط مبنا">
              <Chart option={classifierOption(atlas.stylometry.metrics, dark)} />
            </ChartCard>
            <ChartCard title="کهکشان سبک‌شناختی شاعران" kicker="فاصله در فضای ویژگی‌های سبکی">
              <Chart option={stylometryPcaOption(atlas.stylometry.profiles, dark)} />
            </ChartCard>
          </div>
          <div className="two-column">
            <ChartCard title="نزدیک‌ترین جفت‌های سبکی" kicker="شباهت پروفایل‌های شاعرانه">
              <Chart option={nearestOption(atlas.stylometry.nearest, dark)} />
            </ChartCard>
            <ChartCard title="کدام شاعر درون خود متنوع‌تر است؟" kicker="پراکندگی آثار پیرامون اثر انگشت شاعر">
              <Chart option={dispersionOption(atlas.stylometry.dispersion, dark)} />
            </ChartCard>
          </div>
          <div className="two-column split-40-60">
            <ChartCard title="چرا یک متن نامتعارف شده؟" kicker="دسته‌بندی علت‌های محتمل">
              <Chart option={reasonDonutOption(atlas.stylometry.reasonCounts, dark)} />
            </ChartCard>
            <Card className="anomaly-table-card reveal">
              <div className="card-head"><div><span>اولویت بازبینی</span><h3>نمونه‌های نامتعارف</h3></div></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>شاعر</th><th>اثر</th><th>واژه</th><th>علت</th><th>نمره دورافتادگی</th></tr></thead>
                  <tbody>{atlas.stylometry.anomalies.slice(0, 10).map((a) => <tr key={`${a.poet}-${a.title}`}><td>{a.poet}</td><td><strong>{a.title}</strong><small>{a.book}</small></td><td>{faNumber(a.words)}</td><td><span className="reason-pill">{a.reason}</span></td><td>{faNumber(a.robustZ, { maximumFractionDigits: 1 })}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="chart-note"><Info size={15} />نامتعارف آماری به معنی انتساب نادرست نیست؛ ممکن است ژانر، طول متن یا آلودگی داده علت باشد.</p>
            </Card>
          </div>
        </Section>

        <Section id="forms" eyebrow="پژوهش ششم" title="غزل، قصیده، رباعی و مثنوی چه تفاوتی دارند؟" intro="چهار قالب فقط ظرف‌هایی با طول متفاوت نیستند. ساختار قافیه، فشردگی، زاویه دید و نوع حرکت معنا در هر کدام الگوی متمایزی می‌سازد. این مقایسه بر ۳۶٬۱۰۷ متن دارای برچسب قالب انجام شده است.">
          <div className="form-summary reveal">
            <div>
              <span className="eyebrow">پاسخ در یک نگاه</span>
              <p>{formResearch.summary}</p>
            </div>
            <div className="form-summary-metrics">
              <MiniMetric label="متن برچسب‌دار" value={faNumber(formResearch.corpus.labeledTexts)} detail={`${faNumber(formResearch.corpus.shareOfCorpus)}٪ کل پیکره`} />
              <MiniMetric label="تفاوت معنایی توضیح‌داده‌شده" value={faPercent(formResearch.semantic.rSquared * 100)} detail={`p = ${faDigits(formResearch.semantic.p)}`} />
              <MiniMetric label="دقت تشخیص قالب" value={faPercent(formResearch.classifier.accuracy)} detail={`Macro-F1: ${faPercent(formResearch.classifier.macroF1)}`} />
            </div>
          </div>
          <div className="form-card-grid">
            {formResearch.formats.map((format) => (
              <article className="form-card reveal" key={format.id} style={{ '--form-color': format.color }}>
                <header><span>{format.name}</span><strong>{format.role}</strong></header>
                <p>{format.description}</p>
                <div>
                  <MiniMetric label="میانه واژه" value={faNumber(format.medianWords)} />
                  <MiniMetric label="میانه بیت" value={faNumber(format.medianCouplets)} />
                  <MiniMetric label="متن" value={faNumber(format.texts)} />
                  <MiniMetric label="بازیابی مدل" value={faPercent(format.recall)} />
                </div>
              </article>
            ))}
          </div>
          <div className="two-column">
            <Card className="effect-card reveal">
              <span className="eyebrow">ساختار</span>
              <h3>کدام ویژگی‌ها قالب‌ها را بیشتر از هم جدا می‌کنند؟</h3>
              <p>اندازه اثر بالاتر یعنی تفاوت میان چهار قالب در آن ویژگی روشن‌تر است.</p>
              <div className="effect-bars">
                {formResearch.structuralEffects.map((item) => (
                  <div key={item.feature}>
                    <span>{item.feature}</span>
                    <i><b style={{ width: `${item.effect * 100}%` }} /></i>
                    <strong>{faNumber(item.effect, { maximumFractionDigits: 3 })}</strong>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="form-method-card reveal">
              <span className="eyebrow">آزمون سخت‌گیرانه هوش مصنوعی</span>
              <h3>{formResearch.classifier.model}</h3>
              <p>در هر دور ارزیابی، آثار شاعر آزمون به‌طور کامل از آموزش حذف شده‌اند؛ بنابراین مدل نمی‌تواند با شناخت نامحسوس شاعر، قالب را حدس بزند.</p>
              <div className="baseline-row">
                <MiniMetric label="نمونه متوازن" value={faNumber(formResearch.classifier.balancedTexts)} />
                <MiniMetric label="دقت" value={faPercent(formResearch.classifier.accuracy)} />
                <MiniMetric label="ماکرو اف‌یک" value={faPercent(formResearch.classifier.macroF1)} />
              </div>
              <p className="form-caveat">بازیابی پایین‌تر مثنوی ({faPercent(formResearch.formats.find((item) => item.id === 'masnavi').recall)}) عمدتاً از کمبود نمونه‌های صریح و تنوع روایی آن می‌آید؛ نه از بی‌ساختاری این قالب.</p>
              <a className="secondary-button" href="/research/forms/">مطالعه یافته‌ها، جدول و محدودیت‌ها <ArrowLeft size={17} /></a>
            </Card>
          </div>
        </Section>

        <Section id="geography" eyebrow="پژوهش هفتم" title="جغرافیای تخیل و مهاجرت شعر فارسی" intro="خاستگاه، کانون فعالیت و مسیرهای تقریبی ۶۷ شاعر نشان می‌دهد شبکه شعر فارسی چگونه میان منطقه‌ها حرکت کرده است. نقشه‌ها برای تحلیل کلان ساخته شده‌اند و سفرنامه دقیق تاریخی نیستند." className="section-tinted">
          <div className="research-result reveal">
            <span className="eyebrow">پاسخ کوتاه</span>
            <h3>جابه‌جایی مهم است؛ اما جغرافیا به‌تنهایی سبک را توضیح نمی‌دهد</h3>
            <p>در تعریف عملیاتی پژوهش، {faNumber(geographyResearch.mobility.mobilePoets)} شاعر از {faNumber(geographyResearch.corpus.poets)} شاعر جابه‌جا محسوب می‌شوند. نرخ جابه‌جایی میان دوره‌ها تفاوت دارد، اما تفاوت سبک منطقه‌ای و رابطه جابه‌جایی با نوآوری سبکی در این نمونه معنادار نشد.</p>
          </div>
          <div className="stats-grid">
            <StatCard icon={Feather} value={faPercent(geographyResearch.mobility.mobileRate * 100)} label="شاعر جابه‌جا" note={`${faNumber(geographyResearch.mobility.mobilePoets)} نفر از ${faNumber(geographyResearch.corpus.poets)} شاعر`} accent="#0e7490" />
            <StatCard icon={GitBranch} value={`${faNumber(geographyResearch.mobility.medianRouteKm, { maximumFractionDigits: 0 })} km`} label="میانه طول مسیر" note="مسیر تاریخی تقریبی" accent="#b9862d" />
            <StatCard icon={Database} value={faNumber(geographyResearch.corpus.centerCities)} label="کانون فعالیت" note={`در ${faNumber(geographyResearch.corpus.centerCountries)} کشور امروزی`} accent="#9f2f38" />
            <StatCard icon={Network} value={faNumber(geographyResearch.intertextGeography.meanDistanceKm, { maximumFractionDigits: 0 })} label="کیلومتر میانگین یال‌های منتخب" note="فاصله، قدرت یال را توضیح نداد" accent="#315ba8" />
          </div>
          <div className="two-column">
            <ChartCard title="کانون‌های اصلی فعالیت" kicker="مختصات تقریبی؛ اندازه دایره بر پایه حجم واژه" note="این نمودار جای نقشه تاریخی مرزبندی‌شده را نمی‌گیرد. روی هر کانون بروید تا شاعر، متن و واژه را ببینید.">
              <Chart option={geographyCentersOption(geographyResearch.centers, dark)} />
            </ChartCard>
            <ChartCard title="جابه‌جایی در چهار دوره تاریخی" kicker="نرخ شاعران جابه‌جا و میانه طول مسیر" note="میله، سهم شاعران جابه‌جا و خط، میانه طول مسیر تقریبی را نشان می‌دهد؛ میانگین مسیر در برابر چند سفر بسیار بلند حساس است.">
              <Chart option={periodMobilityOption(geographyResearch.periods, dark)} />
            </ChartCard>
          </div>
          <div className="two-column">
            <ChartCard title="جریان‌های میان‌منطقه‌ای" kicker="از منطقه خاستگاه به کانون فعالیت" note="ضخامت پیوند بر اساس تعداد شاعر نرمال شده است؛ پیوندهای درون همان منطقه برای خوانایی این نما حذف شده‌اند.">
              <Chart option={regionFlowOption(geographyResearch.flows, dark)} />
            </ChartCard>
            <Card className="migration-card reveal">
              <div className="card-head"><div><span>مسیرهای بلند منتخب</span><h3>جابه‌جایی‌های ثبت‌شده در داده</h3></div></div>
              <div className="migration-list">
                {geographyResearch.topMigrations.map((item) => (
                  <article key={item.name}>
                    <div><strong>{item.name}</strong><span>سده {faNumber(item.century)}</span></div>
                    <p>{item.route}</p>
                    <b>{faNumber(item.routeKm, { maximumFractionDigits: 0 })} کیلومتر</b>
                  </article>
                ))}
              </div>
              <p className="chart-note"><Info size={15} />طول مسیر از نقاط منتخب تاریخی محاسبه شده و برابر فاصله مستقیم تولد تا کانون نیست.</p>
            </Card>
          </div>
          <div className="insight-grid">
            <Insight title="تفاوت دوره‌ها" tone="teal" icon={<Clock3 />}>نرخ جابه‌جایی از {faPercent(geographyResearch.periods[3].mobileRate * 100)} در دوره معاصر تا {faPercent(geographyResearch.periods[2].mobileRate * 100)} در دوره متأخر کلاسیک تغییر می‌کند؛ آزمون دوره‌ای معنادار است.</Insight>
            <Insight title="سبک منطقه‌ای قطعی نیست" tone="gold" icon={<CircleHelp />}>منطقه فقط {faPercent(geographyResearch.tests.regionalStyle.rSquared * 100)} از تفاوت پروفایل سبک را توضیح داد و نتیجه معنادار نبود (p = {faDigits(geographyResearch.tests.regionalStyle.p)}).</Insight>
            <Insight title="شبکه فراتر از مرزها" tone="blue" icon={<Network />}>هر {faNumber(geographyResearch.intertextGeography.edges)} یال منتخب میان‌منطقه‌ای بود؛ بااین‌حال آزمون فاصله معنادار نشد (p = {faDigits(geographyResearch.intertextGeography.distancePermutationP)}).</Insight>
          </div>
          <div className="section-actions reveal">
            <a className="secondary-button" href="/research/geography/">صفحه پژوهش، روش و جدول‌ها <ArrowLeft size={17} /></a>
            <a className="secondary-button" href="/downloads/geography/poet_geography.csv">دانلود داده جغرافیایی <Database size={17} /></a>
          </div>
        </Section>

        <Section id="lexical-life" eyebrow="پژوهش هشتم" title="نیمه‌عمر واژگان در شعر فارسی" intro="برای ۷٬۹۳۵ واژه پرتکرار و چندشاعری، تولد مشاهده‌شده، اوج، افت، ماندگاری و بازبرجستگی از سده سوم تا پانزدهم دنبال شده است. «نیمه‌عمر» سرعت افت پس از اوج را می‌سنجد، نه مرگ قطعی واژه.">
          <div className="research-result lexical-result reveal">
            <span className="eyebrow">نتیجه محوری</span>
            <h3>واژه‌ها بیشتر نقش عوض می‌کنند تا اینکه ناگهان بمیرند</h3>
            <p>{lexicalResearch.meta.coreAnswer} در {faNumber(lexicalResearch.halfLife.observedWords)} واژه‌ای که افت تا نصف اوج مشاهده شد، میانه نیمه‌عمر {faNumber(lexicalResearch.halfLife.medianCenturies, { maximumFractionDigits: 2 })} سده بود.</p>
          </div>
          <div className="stats-grid">
            <StatCard icon={BookOpen} value={faNumber(lexicalResearch.corpus.lifecycleWords)} label="واژه مدل چرخه عمر" note="پرتکرار و چندشاعری" accent="#4d7c0f" />
            <StatCard icon={Clock3} value={`${faNumber(lexicalResearch.halfLife.medianCenturies, { maximumFractionDigits: 2 })} سده`} label="میانه نیمه‌عمر مشاهده‌شده" note="از اوج تا نصف فراوانی" accent="#0f766e" />
            <StatCard icon={Feather} value={faPercent(lexicalResearch.categories[0].share * 100)} label="واژه‌های پایدار" note={`${faNumber(lexicalResearch.categories[0].count)} واژه`} accent="#315ba8" />
            <StatCard icon={CircleHelp} value={faPercent(lexicalResearch.halfLife.censoredShare * 100)} label="سانسور راست" note="تا پایان سده پانزدهم به نصف نرسیدند" accent="#9f2f38" />
          </div>
          <div className="two-column">
            <ChartCard title="شش الگوی چرخه عمر" kicker="رده‌بندی ۷٬۹۳۵ واژه" note="رده‌ها از شکل کلی مسیر تاریخی ساخته شده‌اند؛ یک واژه می‌تواند در معنای ادبی، کارکردهای متفاوتی درون یک رده داشته باشد.">
              <Chart option={lexicalLifecycleOption(lexicalResearch.categories, dark)} />
            </ChartCard>
            <ChartCard title="نیمه‌عمر پس از اوج" kicker="چارک یکم، میانه و چارک سوم" note={`این خلاصه فقط ${faNumber(lexicalResearch.halfLife.observedWords)} واژه با افت مشاهده‌شده را دربر می‌گیرد؛ ${faNumber(lexicalResearch.halfLife.censoredWords)} واژه سانسور راست‌اند.`}>
              <Chart option={halfLifeOption(lexicalResearch.halfLife, dark)} />
            </ChartCard>
          </div>
          <div className="lexical-groups">
            <article className="lexical-group reveal stable">
              <span>هسته پایدار</span><h3>دل، جان، عشق، جهان، خاک، آب</h3>
              <p>واژه‌های هسته شاعرانه معمولاً دامنه فعالیت طولانی دارند. «دل» در هر {faNumber(lexicalResearch.examples.stable[0].poets)} شاعر دیده شده و تا پایان پیکره فعال است.</p>
              <div>{lexicalResearch.examples.stable.map((item) => <em key={item.word}>{item.word}<small>{faNumber(item.frequency)}</small></em>)}</div>
            </article>
            <article className="lexical-group reveal declining">
              <span>روبه‌افول</span><h3>درم، دینار، خاقان، سپه، سپهدار، نبید</h3>
              <p>واژگان اقتصاد، دربار و حماسه کهن بیشتر افت کرده‌اند؛ اما افت فراوانی یک صورت، ناپدیدشدن قطعی مفهوم را ثابت نمی‌کند.</p>
              <div>{lexicalResearch.examples.declining.map((item) => <em key={item.word}>{item.word}<small>{faNumber(item.halfLife, { maximumFractionDigits: 2 })} سده</small></em>)}</div>
            </article>
            <article className="lexical-group reveal late">
              <span>برجسته در شعر متأخر</span><h3>آزادی، خیابان، سکوت، جنگل، خاطره، غروب</h3>
              <p>واژه‌های تجربه فردی و فضای مدرن در سده‌های سیزدهم تا پانزدهم برجسته‌تر می‌شوند؛ «تولد» اینجا نخستین عبور از آستانه فعالیت است.</p>
              <div>{lexicalResearch.examples.late.map((item) => <em key={item.word}>{item.word}<small>اوج {faNumber(item.peak)}</small></em>)}</div>
            </article>
            <article className="lexical-group reveal revived">
              <span>بازبرجستگی محتمل</span><h3>ملت، ریشه، پنجره، ستاره، تنهایی، خاموش</h3>
              <p>پس از یک دوره افت، کاربرد دوباره بالا رفته است. اثبات بازگشت همان معنای تاریخی به تحلیل بافت و چندمعنایی نیاز دارد.</p>
              <div>{lexicalResearch.examples.revived.map((item) => <em key={item.word}>{item.word}<small>×{faNumber(item.lateToMiddleRatio, { maximumFractionDigits: 1 })}</small></em>)}</div>
            </article>
          </div>
          <div className="insight-grid">
            <Insight title="تغییر تاریخی واقعی است" tone="teal" icon={<BarChart3 />}>فاصله میان سده‌های مجاور {faDigits(lexicalResearch.tests.adjacentCenturyCosineDistance)} بود و در {faNumber(lexicalResearch.tests.orderingPermutations)} جایگشت، ترتیب واقعی معنادار ماند (p &lt; ۰٫۰۰۱).</Insight>
            <Insight title="فراوانی با ماندگاری همراه است" tone="gold" icon={<Database />}>رابطه فراوانی و نیمه‌عمر مثبت اما متوسط بود: ρ = {faDigits(lexicalResearch.tests.frequencyHalfLifeRho)}، p &lt; ۰٫۰۰۱.</Insight>
            <Insight title="حجم پیکره بر نرخ جابه‌جایی اثر دارد" tone="blue" icon={<CircleHelp />}>در سده‌های کم‌حجم، جابه‌جایی ظاهری بیشتر بود (ρ = {faDigits(lexicalResearch.tests.turnoverVolumeRho)}). این هشدار در تفسیر تولد و افول لحاظ شده است.</Insight>
          </div>
          <div className="section-actions reveal">
            <a className="secondary-button" href="/research/lexical-life/">صفحه پژوهش، روش و محدودیت‌ها <ArrowLeft size={17} /></a>
            <a className="secondary-button" href="/downloads/lexical-lifecycle.csv">دانلود رده‌های چرخه عمر <Database size={17} /></a>
          </div>
        </Section>

        <Section id="poets" eyebrow="دایره‌المعارف داده‌ای" title="۶۷ شاعر، یک نمای قابل جست‌وجو" intro="نام همه شاعران و اعداد به فارسی ارائه شده‌اند. با جست‌وجو یا انتخاب سده، حضور هر شاعر در پیکره را ببینید.">
          <div className="poet-tools reveal">
            <label className="search-box"><Search size={20} /><input value={poetSearch} onChange={(e) => setPoetSearch(e.target.value)} placeholder="نام شاعر را جست‌وجو کنید…" /></label>
            <PersianSelect label="سده" value={poetCentury} onChange={setPoetCentury}><option value="همه">همه سده‌ها</option>{centuries.map((c) => <option value={c} key={c}>سده {faNumber(c)}</option>)}</PersianSelect>
            <span>{faNumber(filteredPoets.length)} شاعر یافت شد</span>
          </div>
          <div className="poet-grid">{visiblePoets.map((p) => <PoetCard poet={p} onOpen={setSelectedPoet} key={p.name} />)}</div>
          {filteredPoets.length > 18 && <button className="load-more" onClick={() => setShowAllPoets(!showAllPoets)}>{showAllPoets ? 'نمایش کمتر' : `نمایش همه ${faNumber(filteredPoets.length)} شاعر`}<ZoomIn size={17} /></button>}
        </Section>


        <Section id="knowledge" eyebrow="لایه دانش و استناد" title="سه مسیر برای سه نوع مخاطب" intro="اطلس تعاملی نقطه شروع است؛ صفحات مستقل پژوهشی، داده‌های ماشین‌خوان و واژه‌نامه کمک می‌کنند هر مخاطب مسیر مناسب خود را ادامه دهد.">
          <div className="audience-grid">
            {audiencePaths.map((path, index) => (
              <a className="audience-card reveal" href={path.href} key={path.title}>
                <span>{faNumber(index + 1)}</span><small>{path.label}</small><h3>{path.title}</h3><p>{path.description}</p>
                <div>{path.items.map((item) => <em key={item}>{item}</em>)}</div><ArrowLeft size={19} />
              </a>
            ))}
          </div>
          <div className="knowledge-layout">
            <div className="research-door-grid">
              {researchPages.map((page, index) => (
                <a className="research-door reveal" href={page.path} key={page.id} style={{ '--accent': page.color }}>
                  <span>{faNumber(index + 1)}</span><small>{page.eyebrow}</small><h3>{page.shortTitle}</h3><p>{page.answer}</p><strong>صفحه پژوهشی و جدول داده <ArrowLeft size={16} /></strong>
                </a>
              ))}
            </div>
            <Card className="citation-panel reveal">
              <span className="eyebrow">قابل استناد و ماشین‌خوان</span><h3>نتیجه‌ها فقط داخل نمودار پنهان نیستند</h3>
              <p>برای هر پژوهش یک صفحه مستقل با پاسخ کوتاه، یافته‌های عددی، جدول قابل جست‌وجو، روش، محدودیت و استناد پایدار ساخته شده است.</p>
              <div className="machine-links">
                <a href="/data/"><Database size={18} />دانلود JSON و CSV</a>
                <a href="/themes/"><Sparkles size={18} />دانشنامه مضامین</a>
                <a href="/metaphors/"><Network size={18} />اطلس استعاره‌ها</a>
                <a href="/centuries/"><Clock3 size={18} />مرور سده‌به‌سده</a>
                <a href="/questions/"><CircleHelp size={18} />پرسش‌های کلیدی</a>
                <a href="/methodology/"><BookOpen size={18} />روش‌شناسی کامل</a>
                <a href="/glossary/"><CircleHelp size={18} />واژه‌نامه ساده</a>
                <a href="/llms.txt"><BrainCircuit size={18} />راهنمای مدل‌های هوش مصنوعی</a>
              </div>
              <button className="copy-citation" onClick={copyCitation}>{citationCopied ? 'استناد کپی شد' : 'کپی استناد پیشنهادی'}</button>
            </Card>
          </div>
          <div className="faq-block reveal">
            <div className="faq-heading"><span className="eyebrow">پرسش‌های پرتکرار</span><h3>پیش از تفسیر نمودارها</h3><p>پاسخ‌های کوتاه برای جلوگیری از برداشت‌های اغراق‌آمیز یا نادرست.</p></div>
            <div className="faq-accordion">{faqItems.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
          </div>
        </Section>

        <section className="about" id="about">
          <div className="about-pattern" />
          <div className="about-copy reveal">
            <Logo />
            <p className="nastaliq">جایی که بیت‌ها، به روایت داده تبدیل می‌شوند</p>
            <p>«از شعر تا داده» تلاشی برای نزدیک‌کردن تحلیل محاسباتی ادبیات به مخاطب عمومی است؛ با نمودارهای زنده، زبان روشن و وفاداری به عدم‌قطعیت پژوهش.</p>
          </div>
          <div className="creator-card reveal">
            <span>طراحی و پژوهش</span><h2>کاری از حسین کریمی</h2>
            <a href={atlas.meta.linkedin} target="_blank" rel="me noreferrer"><Linkedin />مشاهده پروفایل لینکدین</a>
          </div>
        </section>
      </main>

      <footer>
        <Logo compact />
        <p>از شعر تا داده — اطلس تعاملی تحلیل داده‌های شعر فارسی</p>
        <div><a href={atlas.meta.linkedin} target="_blank" rel="me noreferrer"><Linkedin />حسین کریمی</a><a href="/research/">پژوهش‌ها</a><a href="/themes/">مضامین</a><a href="/metaphors/">استعاره‌ها</a><a href="/centuries/">سده‌ها</a><a href="/poets/">شاعران</a><a href="/data/">داده‌ها</a></div>
        <small>تصاویر منتخب شاعران از Wikimedia Commons؛ اعتبار هر تصویر در کارت شاعر درج شده است.</small>
      </footer>
      <PoetModal poet={selectedPoet} onClose={() => setSelectedPoet(null)} />
      <Analytics />
    </div>
  );
}

export default App;
