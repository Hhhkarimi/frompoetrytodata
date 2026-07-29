import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { chartTableRows } from '../evidence/chart-table.js';
import { evidenceFromChart } from '../evidence/published-evidence.js';
import { faNumber } from '../utils.js';
import { emitAnalyticsEvent } from '../analytics/events.js';

const LazyECharts = lazy(() => import('echarts-for-react'));

const DEFAULT_QUALIFICATION = 'این نمودار شاهد محاسباتی در پیکره است و به‌تنهایی رتبهٔ ادبی، علت تاریخی یا تفسیر قطعی را ثابت نمی‌کند.';

function formatTableValue(value, precision = 4) {
  if (value === '' || value === null || value === undefined) return '—';
  if (typeof value === 'number') return faNumber(value, { maximumFractionDigits: precision });
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
}

export default function Chart({
  option,
  height = 430,
  className = '',
  onEvents,
  ariaLabel,
  summary,
  qualification = DEFAULT_QUALIFICATION,
  metricId = 'chart',
  pageType = 'atlas',
  definition,
  unit,
  denominator,
  precision,
  dataset,
}) {
  const shellRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);
  const label = ariaLabel || 'نمودار تعاملی';
  const evidence = evidenceFromChart({
    id: metricId,
    label,
    definition: definition || summary || label,
    qualification,
    values: option,
    unit,
    denominator,
    precision,
    dataset,
  });
  const rows = chartTableRows(evidence.values);

  useEffect(() => {
    const node = shellRef.current;
    if (!node || ready) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '450px 0px', threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  const accessibleOption = {
    aria: { enabled: true, decal: { show: false }, description: ariaLabel || 'نمودار تعاملی از پروژه از شعر تا داده' },
    animationDuration: 650,
    animationDurationUpdate: 420,
    ...evidence.values,
  };

  return (
    <section
      className={`evidence-view ${className}`}
      aria-label={label}
      data-evidence-id={evidence.id}
      data-evidence-source={evidence.source.dataset}
      data-publication-version={evidence.source.publicationVersion}
    >
      <p className="chart-summary">{summary || label}</p>
      <p className="chart-qualification">{qualification}</p>
      <dl className="evidence-metadata">
        <div><dt>واحد</dt><dd>{evidence.unit}</dd></div>
        <div><dt>مخرج/دامنه</dt><dd>{evidence.denominator}</dd></div>
        <div><dt>دقت</dt><dd>{faNumber(evidence.precision)} رقم اعشار</dd></div>
        <div><dt>نسخه</dt><dd dir="ltr">{evidence.source.publicationVersion}</dd></div>
      </dl>
      <div ref={shellRef} className="chart-shell" role="figure" aria-label={label} style={{ minHeight: height }} aria-busy={!ready}>
        {ready ? (
          <Suspense fallback={<div className="chart-loading" style={{ height }}><span />در حال آماده‌سازی نمودار…</div>}>
            <LazyECharts
              option={accessibleOption}
              style={{ height, width: '100%' }}
              notMerge
              lazyUpdate
              onEvents={onEvents}
              opts={{ renderer: 'canvas', locale: 'FA' }}
            />
          </Suspense>
        ) : <div className="chart-loading" style={{ height }}><span />نمودار هنگام نزدیک‌شدن شما بارگذاری می‌شود</div>}
      </div>
      <button type="button" className="chart-table-toggle" aria-expanded={tableVisible} onClick={() => setTableVisible((visible) => { if (!visible) emitAnalyticsEvent('evidence_table_opened', { metric_id: metricId, page_type: pageType }); return !visible; })}>
        {tableVisible ? 'پنهان‌کردن جدول داده' : 'نمایش جدول داده'}
      </button>
      {tableVisible && (
        <div className="chart-table-region" tabIndex="0" role="region" aria-label={`جدول ${label}`}>
          <table aria-label={`داده‌های ${label}`}>
            <thead><tr><th scope="col">دسته</th><th scope="col">مجموعه</th><th scope="col">مقدار</th><th scope="col">واحد</th><th scope="col">مخرج/دامنه</th><th scope="col">دقت</th></tr></thead>
            <tbody>
              {rows.map((row, index) => {
                const seriesEvidence = evidence.seriesDefinitions.find((item) => item.label === row.series);
                const rowPrecision = row.precision ?? seriesEvidence?.precision ?? evidence.precision;
                return (
                  <tr key={`${row.category}-${row.series}-${index}`}>
                    <th scope="row">{formatTableValue(row.category)}</th>
                    <td>{row.series}</td>
                    <td>{formatTableValue(row.value, rowPrecision)}</td>
                    <td>{row.unit || seriesEvidence?.unit || evidence.unit}</td>
                    <td>{row.denominator || seriesEvidence?.denominator || evidence.denominator}</td>
                    <td>{faNumber(rowPrecision)} رقم اعشار</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
