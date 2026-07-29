import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chartTableRows } from '../src/evidence/chart-table.js';

test('graph tables preserve link scores and node values', () => {
  const rows = chartTableRows({
    series: [{
      type: 'graph',
      data: [{ name: 'حافظ', value: 3 }],
      links: [{ source: 'سعدی', target: 'حافظ', score: 0.972, phrases: 4 }],
    }],
  });

  assert.deepEqual(rows, [
    { category: 'حافظ', series: 'گره', value: 3 },
    { category: 'سعدی ← حافظ', series: 'امتیاز پیوند', value: 0.972 },
    { category: 'سعدی ← حافظ', series: 'تعداد عبارت مشترک', value: 4 },
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
