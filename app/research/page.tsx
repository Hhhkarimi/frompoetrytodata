"use client";

import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  Database,
  Download,
  FlaskConical,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import researchJson from "../research-data.json";
import attributionJson from "../attribution-data.json";
import styles from "./research.module.css";

type Metric = { label: string; value: number; detail?: string; suffix?: string };
type RankingItem = { name: string; value: number; hits?: number; words?: number; poets?: number; detail?: string };
type TrendSeries = { name: string; values: number[] };
type Question = {
  id: string;
  category: string;
  shortTitle: string;
  title: string;
  teaser: string;
  answer: string;
  metrics: Metric[];
  highlights: string[];
  method: string;
  caveat: string;
  chart: {
    kind: "trend" | "grouped" | "ranking" | "ranking-poets";
    labels?: Array<string | number>;
    yLabel: string;
    series?: TrendSeries[];
    items?: RankingItem[];
    secondaryLabel?: string;
  };
};
type AttributionCase = {
  id: string;
  name: string;
  subtitle: string;
  question: string;
  next: string;
  currentLimit: string;
  metrics: Metric[];
  findings: string[];
  distribution?: Array<{ name: string; value: number; note?: string }>;
  conceptProfile?: Array<{ name: string; documentShare: number; ratePer10k: number }>;
  risks?: string[];
};

type ResearchData = {
  generatedFrom: {
    rows: number;
    usableRows: number;
    excludedEditorialRows: number;
    words: number;
    poets: number;
    centuries: number;
    minimumPoetWordsForRanking: number;
    minimumPoetCenturyWordsForTrend: number;
  };
  questions: Question[];
  readingGuide: string[][];
};
type AttributionData = {
  qualityAlerts: Array<{ level: string; title: string; value: number; detail: string; items?: string[] }>;
  principles: Array<{ id: string; title: string; plain: string; detail: string }>;
  cases: AttributionCase[];
  workflow: string[][];
  team: string[][];
};

const research = researchJson as unknown as ResearchData;
const attribution = attributionJson as unknown as AttributionData;
const faNumber = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("fa-IR", { maximumFractionDigits }).format(value);

function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className={styles.metrics}>
      {metrics.map((metric) => (
        <article key={metric.label}>
          <small>{metric.label}</small>
          <strong>{faNumber(metric.value, metric.value % 1 ? 2 : 0)}{metric.suffix ? ` ${metric.suffix}` : ""}</strong>
          {metric.detail && <span>{metric.detail}</span>}
        </article>
      ))}
    </div>
  );
}

function TrendChart({ question }: { question: Question }) {
  const labels = question.chart.labels ?? [];
  const series = question.chart.series ?? [];
  const allValues = series.flatMap((item) => item.values);
  const max = Math.max(...allValues, 1);
  const width = 900;
  const height = 330;
  const padX = 54;
  const padTop = 28;
  const padBottom = 54;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padTop - padBottom;
  const pointString = (values: number[]) => values.map((value, index) => {
    const x = padX + (index / Math.max(1, values.length - 1)) * innerWidth;
    const y = padTop + innerHeight - (value / max) * innerHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className={styles.trendWrap}>
      <div className={styles.legend}>
        {series.map((item, index) => <span key={item.name}><i data-series={index} />{item.name}</span>)}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={question.title}>
        {[0, .25, .5, .75, 1].map((ratio) => {
          const y = padTop + innerHeight - ratio * innerHeight;
          return <g key={ratio}><line x1={padX} x2={width - padX} y1={y} y2={y} className={styles.gridLine} /><text x={padX - 10} y={y + 5} textAnchor="end">{faNumber(max * ratio, 1)}</text></g>;
        })}
        {series.map((item, index) => (
          <g key={item.name} className={styles[`series${index}`] ?? styles.series0}>
            <polyline points={pointString(item.values)} fill="none" />
            {item.values.map((value, pointIndex) => {
              const x = padX + (pointIndex / Math.max(1, item.values.length - 1)) * innerWidth;
              const y = padTop + innerHeight - (value / max) * innerHeight;
              return <circle key={`${item.name}-${pointIndex}`} cx={x} cy={y} r="4" />;
            })}
          </g>
        ))}
        {labels.map((label, index) => {
          if (labels.length > 8 && index % 2 === 1 && index !== labels.length - 1) return null;
          const x = padX + (index / Math.max(1, labels.length - 1)) * innerWidth;
          return <text key={`${label}-${index}`} x={x} y={height - 18} textAnchor="middle">{faNumber(Number(label))}</text>;
        })}
      </svg>
      <small className={styles.axisLabel}>{question.chart.yLabel}</small>
    </div>
  );
}

function GroupedChart({ question }: { question: Question }) {
  const labels = question.chart.labels ?? [];
  const series = question.chart.series ?? [];
  const max = Math.max(...series.flatMap((item) => item.values), 1);
  return (
    <div className={styles.groupedChart}>
      {labels.map((label, labelIndex) => (
        <article key={`${label}-${labelIndex}`}>
          <strong>{label}</strong>
          <div>
            {series.map((item, seriesIndex) => (
              <span key={item.name} title={`${item.name}: ${item.values[labelIndex] ?? 0}`}>
                <i data-series={seriesIndex} style={{ height: `${Math.max(5, ((item.values[labelIndex] ?? 0) / max) * 100)}%` }} />
                <small>{item.name}</small>
                <em>{faNumber(item.values[labelIndex] ?? 0, 1)}</em>
              </span>
            ))}
          </div>
        </article>
      ))}
      <p>{question.chart.yLabel}</p>
    </div>
  );
}

function RankingChart({ question }: { question: Question }) {
  const items = question.chart.items ?? [];
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className={styles.rankingChart}>
      {items.map((item, index) => (
        <article key={item.name}>
          <span>{faNumber(index + 1)}</span>
          <div><strong>{item.name}</strong><small>{item.detail ?? (item.poets ? `${faNumber(item.poets)} شاعر` : "")}</small></div>
          <i><b style={{ width: `${Math.max(3, item.value / max * 100)}%` }} /></i>
          <em>{faNumber(item.value, 2)}</em>
        </article>
      ))}
      <p>{question.chart.yLabel}</p>
    </div>
  );
}

function QuestionChart({ question }: { question: Question }) {
  if (question.chart.kind === "ranking" || question.chart.kind === "ranking-poets") return <RankingChart question={question} />;
  if (question.chart.kind === "grouped") return <GroupedChart question={question} />;
  return <TrendChart question={question} />;
}

function QuestionsPanel() {
  const [selectedId, setSelectedId] = useState(research.questions[0].id);
  const selected = research.questions.find((question) => question.id === selectedId) ?? research.questions[0];
  const nextQuestion = () => {
    const index = research.questions.findIndex((question) => question.id === selected.id);
    setSelectedId(research.questions[(index + 1) % research.questions.length].id);
  };

  return (
    <>
      <div className={styles.questionTabs} role="tablist" aria-label="پرسش‌های پژوهشی">
        {research.questions.map((question) => (
          <button key={question.id} type="button" role="tab" aria-selected={selected.id === question.id} className={selected.id === question.id ? styles.activeTab : ""} onClick={() => setSelectedId(question.id)}>
            <small>{question.category}</small><strong>{question.shortTitle}</strong>
          </button>
        ))}
      </div>
      <article className={styles.questionCard}>
        <header><span><Lightbulb /> پاسخ داده‌محور</span><small>{selected.teaser}</small><h2>{selected.title}</h2><p>{selected.answer}</p></header>
        <MetricCards metrics={selected.metrics} />
        <div className={styles.chartPanel}><QuestionChart question={selected} /></div>
        <div className={styles.explanationGrid}>
          <article><CheckCircle2 /><div><strong>چه چیزی در داده دیده شد؟</strong>{selected.highlights.map((item) => <p key={item}>{item}</p>)}</div></article>
          <article><BarChart3 /><div><strong>چطور محاسبه شد؟</strong><p>{selected.method}</p></div></article>
          <article className={styles.caveat}><ShieldAlert /><div><strong>چه چیزی را ثابت نمی‌کند؟</strong><p>{selected.caveat}</p></div></article>
        </div>
        <footer>
          <button type="button" onClick={nextQuestion}><RefreshCw /> پرسش بعدی</button>
          <a href="/downloads/public-questions-analysis.csv" download><Download /> دریافت جدول تحلیل‌ها</a>
        </footer>
      </article>
    </>
  );
}

function Distribution({ items }: { items: Array<{ name: string; value: number; note?: string }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className={styles.distribution}>{items.map((item) => <article key={item.name}><div><strong>{item.name}</strong><small>{item.note}</small></div><i><b style={{ width: `${item.value / max * 100}%` }} /></i><em>{faNumber(item.value)}</em></article>)}</div>;
}

function AttributionPanel() {
  const [selectedId, setSelectedId] = useState(attribution.cases[0].id);
  const selected = attribution.cases.find((item) => item.id === selectedId) ?? attribution.cases[0];
  return (
    <>
      <div className={styles.alertGrid}>
        {attribution.qualityAlerts.map((alert) => <article key={alert.title} data-level={alert.level}><ShieldAlert /><div><small>کنترل کیفیت</small><strong>{alert.title}</strong><p>{alert.detail}</p></div><em>{faNumber(alert.value)}</em></article>)}
      </div>
      <section className={styles.principles}>
        <div className={styles.sectionTitle}><Scale /><div><small>چارچوب پژوهشی</small><h2>پنج شاهدی که باید جداگانه سنجیده شوند</h2></div></div>
        <div>{attribution.principles.map((item, index) => <article key={item.id}><span>{faNumber(index + 1)}</span><strong>{item.title}</strong><p>{item.plain}</p><small>{item.detail}</small></article>)}</div>
      </section>
      <div className={styles.caseTabs} role="tablist" aria-label="پرونده‌های پژوهشی">
        {attribution.cases.map((item) => <button key={item.id} type="button" role="tab" aria-selected={selected.id === item.id} className={selected.id === item.id ? styles.activeTab : ""} onClick={() => setSelectedId(item.id)}><strong>{item.name}</strong><small>{item.subtitle}</small></button>)}
      </div>
      <article className={styles.caseCard}>
        <header><span><FlaskConical /> پروندهٔ پژوهشی</span><h2>{selected.name}</h2><p>{selected.question}</p></header>
        <MetricCards metrics={selected.metrics} />
        <div className={styles.caseGrid}>
          <section><h3>یافته‌های فعلی</h3>{selected.findings.map((finding) => <p key={finding}><CheckCircle2 />{finding}</p>)}</section>
          {selected.distribution && <section><h3>ترکیب داده</h3><Distribution items={selected.distribution} /></section>}
        </div>
        {selected.conceptProfile && <section className={styles.conceptProfile}><h3>نمایهٔ مفهومی</h3><div>{selected.conceptProfile.map((item) => <article key={item.name}><strong>{item.name}</strong><span>{faNumber(item.documentShare, 1)}٪ متن‌ها</span><i><b style={{ width: `${Math.min(100, item.documentShare)}%` }} /></i><small>{faNumber(item.ratePer10k, 1)} رخداد در ده‌هزار واژه</small></article>)}</div></section>}
        <div className={styles.limitGrid}>
          <article><Info /><div><strong>محدودیت دادهٔ فعلی</strong><p>{selected.currentLimit}</p></div></article>
          <article><ArrowLeft /><div><strong>گام بعدی</strong><p>{selected.next}</p></div></article>
        </div>
        <footer><a href="/downloads/attribution-corpus-audit.csv" download><Download /> دریافت ممیزی پیکره</a></footer>
      </article>
      <section className={styles.workflow}>
        <div className={styles.sectionTitle}><BookOpenCheck /><div><small>از داده تا داوری</small><h2>گردش کار پیشنهادی و تیم میان‌رشته‌ای</h2></div></div>
        <div className={styles.workflowGrid}>{attribution.workflow.map(([number, title, detail]) => <article key={number}><span>{number}</span><strong>{title}</strong><p>{detail}</p></article>)}</div>
        <div className={styles.teamGrid}>{attribution.team.map(([title, detail]) => <article key={title}><UsersRound /><strong>{title}</strong><p>{detail}</p></article>)}</div>
      </section>
    </>
  );
}

export default function ResearchPage() {
  const [tab, setTab] = useState<"questions" | "attribution">("questions");
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a href="/"><Home /> بازگشت به صفحهٔ اصلی</a>
        <span><Sparkles /> نسخهٔ ۷ · پژوهش‌های داده‌محور</span>
      </header>
      <section className={styles.hero}>
        <div><small>کاوش عمومی و پژوهش تخصصی</small><h1>پرسش‌هایی که شعر فارسی را دوباره دیدنی می‌کنند</h1><p>از «دل یا عقل؟» تا پروندهٔ خیام و حافظ؛ هر نتیجه با عدد، روش محاسبه و هشدار تفسیر ارائه می‌شود.</p></div>
        <aside><Database /><strong>{faNumber(research.generatedFrom.rows)}</strong><span>متن در پیکره</span><small>{faNumber(research.generatedFrom.poets)} شاعر · {faNumber(research.generatedFrom.centuries)} سده</small></aside>
      </section>
      <section className={styles.guide}>
        {research.readingGuide.map(([title, detail], index) => <article key={title}><span>{faNumber(index + 1)}</span><div><strong>{title}</strong><p>{detail}</p></div></article>)}
      </section>
      <nav className={styles.mainTabs} aria-label="بخش‌های پژوهشی">
        <button type="button" className={tab === "questions" ? styles.activeTab : ""} onClick={() => setTab("questions")}><HelpCircle /><span><strong>ده پرسش برای همه</strong><small>پاسخ‌های ساده، نمودار و روش</small></span></button>
        <button type="button" className={tab === "attribution" ? styles.activeTab : ""} onClick={() => setTab("attribution")}><FlaskConical /><span><strong>انتساب و اصالت‌سنجی</strong><small>خیام، حافظ و تحلیل دوره‌ای</small></span></button>
      </nav>
      <section className={styles.content}>{tab === "questions" ? <QuestionsPanel /> : <AttributionPanel />}</section>
      <footer className={styles.footer}><a href="/"><ChevronLeft /> بازگشت به اطلس</a><p>نتایج این صفحه ابزار تولید فرضیه‌اند و جای خوانش ادبی، نسخه‌شناسی و داوری متخصص را نمی‌گیرند.</p></footer>
    </main>
  );
}
