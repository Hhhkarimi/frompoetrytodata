import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chartTableRows } from '../src/evidence/chart-table.js';
import {
  geographyCentersOption,
  intertextNetworkOption,
  intertextScatterOption,
  metaphorBubbleOption,
  metaphorNetworkOption,
  regionFlowOption,
  stylometryPcaOption,
  topicStatsOption,
} from '../src/chartOptions.js';

test('graph tables preserve link scores and node values', () => {
  const rows = chartTableRows(intertextNetworkOption([{
    source: 'سعدی',
    target: 'حافظ',
    sourceCentury: 7,
    targetCentury: 8,
    score: 0.972,
    phrases: 4,
    lexical: 0.31,
    topic: 0.91,
    evidence: 'بسیار قوی',
  }], 0.94));

  assert.deepEqual(rows.filter((row) => row.category === 'سعدی ← حافظ' || (row.category === 'حافظ' && row.series === 'تعداد پیوند گره')), [
    { category: 'حافظ', series: 'تعداد پیوند گره', value: 1, unit: 'پیوند', denominator: 'پیوندهای عبورکرده از آستانهٔ فعال', precision: 0 },
    { category: 'سعدی ← حافظ', series: 'امتیاز پیوند', value: 0.972, unit: 'امتیاز مرکب از ۰ تا ۱', denominator: 'شاهدهای واژگانی، موضوعی و عبارتی همان جفت', precision: 3 },
    { category: 'سعدی ← حافظ', series: 'تعداد عبارت مشترک', value: 4, unit: 'عبارت پنج‌واژه‌ای', denominator: 'عبارت‌های مشترک همان جفت شاعر', precision: 0 },
    { category: 'سعدی ← حافظ', series: 'نوع شاهد', value: 'بسیار قوی', unit: 'ردهٔ متنی', denominator: 'ترکیب شاهدهای همان پیوند', precision: 0 },
  ]);
});

test('scatter tables expose named dimensions instead of collapsing tuples', () => {
  const rows = chartTableRows({
    xAxis: { type: 'value', name: 'شباهت واژگانی' },
    yAxis: { type: 'value', name: 'شباهت موضوعی' },
    series: [{
      type: 'scatter',
      data: [{ name: 'سعدی ← حافظ', value: [0.31, 0.94, 8] }],
    }],
  });

  assert.deepEqual(rows, [
    { category: 'سعدی ← حافظ', series: 'شباهت واژگانی', value: 0.31 },
    { category: 'سعدی ← حافظ', series: 'شباهت موضوعی', value: 0.94 },
    { category: 'سعدی ← حافظ', series: 'اندازه نشانه', value: 8 },
  ]);
});

test('heatmap and pie tables preserve category labels and numeric values', () => {
  assert.deepEqual(chartTableRows({
    xAxis: { type: 'category', data: ['۳'] },
    yAxis: { type: 'category', data: ['۴'] },
    series: [{ type: 'heatmap', name: 'بازیابی', data: [[0, 0, 0.75]] }],
  }), [{ category: '۳ / ۴', series: 'بازیابی', value: 0.75 }]);

  assert.deepEqual(chartTableRows({
    series: [{ type: 'pie', data: [{ name: 'داده کم', value: 12 }] }],
  }), [{ category: 'داده کم', series: 'مقدار', value: 12 }]);
});

test('mixed-unit tables apply explicit scale, unit, denominator, and precision', () => {
  const rows = chartTableRows({
    xAxis: { type: 'category', data: ['معاصر'] },
    yAxis: [
      { type: 'value', name: 'نرخ جابه‌جایی' },
      { type: 'value', name: 'کیلومتر' },
    ],
    series: [
      {
        name: 'نرخ جابه‌جایی',
        type: 'bar',
        data: [0.35],
        tableUnit: 'درصد',
        tableScale: 100,
        tablePrecision: 1,
        tableDenominator: 'همهٔ شاعران دوره',
      },
      {
        name: 'میانه طول مسیر',
        type: 'line',
        yAxisIndex: 1,
        data: [740],
        tableUnit: 'کیلومتر',
        tablePrecision: 0,
        tableDenominator: 'شاعران جابه‌جاشدهٔ دارای مسیر',
      },
    ],
  });

  assert.deepEqual(rows, [
    {
      category: 'معاصر',
      series: 'نرخ جابه‌جایی',
      value: 35,
      unit: 'درصد',
      denominator: 'همهٔ شاعران دوره',
      precision: 1,
    },
    {
      category: 'معاصر',
      series: 'میانه طول مسیر',
      value: 740,
      unit: 'کیلومتر',
      denominator: 'شاعران جابه‌جاشدهٔ دارای مسیر',
      precision: 0,
    },
  ]);
});

test('intertext graph tables expose evidence type in addition to color', () => {
  const rows = chartTableRows({
    series: [{
      type: 'graph',
      links: [{ source: 'سعدی', target: 'حافظ', score: 0.972, evidence: 'بسیار قوی' }],
    }],
  });

  assert.ok(rows.some((row) => row.series === 'نوع شاهد' && row.value === 'بسیار قوی'));
});

test('scatter dimensions preserve independent units and denominators', () => {
  const rows = chartTableRows(metaphorBubbleOption([{
    name: 'راه، سفر و منزل',
    poemPercent: 42,
    rate: 19.4,
    rho: 0.31,
    occurrences: 120,
  }]));

  assert.deepEqual(rows.map(({ series, value, unit, denominator, precision }) => ({
    series,
    value,
    unit,
    denominator,
    precision,
  })), [
    { series: 'درصد شعرهای دارای تصویر', value: 42, unit: 'درصد', denominator: 'همهٔ شعرهای پیکره', precision: 1 },
    { series: 'نرخ در ۱۰هزار واژه', value: 19.4, unit: 'رخداد در ۱۰هزار واژه', denominator: 'همهٔ واژه‌های پیکره', precision: 1 },
    { series: 'روند زمانی', value: 0.31, unit: 'ضریب ρ', denominator: 'سده‌های دارای داده', precision: 3 },
    { series: 'تعداد رخداد', value: 120, unit: 'رخداد', denominator: 'همهٔ رخدادهای خانواده در پیکره', precision: 0 },
  ]);
});

test('every production scatter family exposes dimension-specific table metadata', () => {
  const options = [
    topicStatsOption([{ name: 'حکمت', rho: 0.2, epsilonSquared: 0.15, overallShare: 10, significantTrend: true }]),
    intertextScatterOption([{ source: 'سعدی', target: 'حافظ', lexical: 0.3, topic: 0.9, phraseZ: 4, phrases: 3 }]),
    stylometryPcaOption([{ poet: 'حافظ', pc1: 1.2, pc2: -0.4, century: 8, uniqueRatio: 0.5 }]),
    geographyCentersOption([{ city: 'شیراز', lon: 52.5, lat: 29.6, words: 1000, poets: 2, poems: 20, region: 'فارس' }]),
  ];

  for (const option of options) {
    const rows = chartTableRows(option);
    assert.ok(rows.length >= 2);
    assert.ok(rows.every((row) => row.unit && row.denominator && Number.isInteger(row.precision)));
    assert.ok(new Set(rows.map((row) => row.series)).size >= 2);
  }
});

test('production scatter tables include every size, opacity, and tooltip encoding', () => {
  const cases = [
    {
      option: topicStatsOption([{
        name: 'حکمت',
        rho: 0.2,
        epsilonSquared: 0.15,
        overallShare: 10,
        significantTrend: true,
      }]),
      expected: [
        ['سهم کل مضمون', 10, 'درصد'],
        ['وضعیت روند', 'معنادار', 'نتیجهٔ آزمون'],
      ],
    },
    {
      option: metaphorBubbleOption([{
        name: 'راه، سفر و منزل',
        poemPercent: 42,
        rate: 19.4,
        rho: 0.31,
        occurrences: 120,
      }]),
      expected: [['تعداد رخداد', 120, 'رخداد']],
    },
    {
      option: intertextScatterOption([{
        source: 'سعدی',
        target: 'حافظ',
        lexical: 0.3,
        topic: 0.9,
        phraseZ: 4,
        phrases: 3,
      }]),
      expected: [['تعداد عبارت مشترک', 3, 'عبارت پنج‌واژه‌ای']],
    },
    {
      option: geographyCentersOption([{
        city: 'شیراز',
        lon: 52.5,
        lat: 29.6,
        words: 1000,
        poets: 2,
        poems: 20,
        region: 'فارس',
      }]),
      expected: [
        ['تعداد شاعر', 2, 'شاعر'],
        ['تعداد متن', 20, 'متن'],
        ['تعداد واژه', 1000, 'واژه'],
        ['منطقهٔ فرهنگی', 'فارس', 'ردهٔ جغرافیایی'],
      ],
    },
  ];

  for (const { option, expected } of cases) {
    const rows = chartTableRows(option);
    for (const [series, value, unit] of expected) {
      assert.ok(
        rows.some((row) => row.series === series && row.value === value && row.unit === unit),
        `missing accessible encoding: ${series}`,
      );
    }
  }
});

test('production graph families expose graph-specific node and link semantics', () => {
  const metaphorRows = chartTableRows(metaphorNetworkOption([
    { period: 'کلاسیک', source: 'آتش', target: 'نور', npmi: 0.253 },
  ], 'کلاسیک'));
  const metaphorLink = metaphorRows.find((row) => row.series === 'هم‌رخدادی فراتر از انتظار');
  assert.equal(metaphorLink.unit, 'nPMI');
  assert.equal(metaphorLink.value, 0.253);

  const geographyRows = chartTableRows(regionFlowOption([
    { origin: 'خراسان', center: 'فارس', poets: 3 },
  ]));
  const geographyLink = geographyRows.find((row) => row.series === 'شاعران جابه‌جاشده');
  assert.equal(geographyLink.unit, 'شاعر');
  assert.equal(geographyLink.value, 3);
  assert.equal(geographyRows.some((row) => row.value === ''), false);
});
