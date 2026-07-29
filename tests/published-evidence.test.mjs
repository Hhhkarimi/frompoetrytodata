import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createPublishedEvidence } from '../src/evidence/published-evidence.js';

const option = {
  xAxis: { type: 'category', data: ['سده ۷'] },
  yAxis: { type: 'value', name: 'درصد' },
  series: [{ name: 'سهم', type: 'bar', data: [12.5] }],
};

test('published evidence requires the complete versioned metric contract', () => {
  const evidence = createPublishedEvidence({
    id: 'atlas:topic-share',
    label: 'سهم مضمون',
    definition: 'سهم رکوردهای منتسب به مضمون در هر سده',
    unit: 'درصد',
    denominator: 'همهٔ رکوردهای موازنه‌شده در همان سده',
    precision: 1,
    source: { publicationVersion: '7.0.0', dataset: 'atlas-data' },
    qualification: 'سدهٔ منتسب تاریخ دقیق سرایش نیست.',
    values: option,
  });

  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.source.publicationVersion, '7.0.0');
  assert.equal(evidence.values, option);
  assert.throws(
    () => createPublishedEvidence({ id: 'incomplete' }),
    /label, definition, unit, denominator, precision, source, qualification, values/,
  );
});
