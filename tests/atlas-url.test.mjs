import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  normalizeAtlasUrl,
  parseAtlasUrl,
} from '../src/atlas/atlas-url.js';

const options = {
  centuries: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  topics: [1, 2, 3],
  metaphors: ['راه، سفر و مقصد', 'آینه و بازتاب'],
  periods: ['کلاسیک', 'میانه', 'معاصر'],
  poets: ['حافظ', 'سعدی'],
  cases: ['khayyam', 'hafez', 'systemic'],
  questions: ['heart-mind', 'sadness-joy'],
};

test('atlas search and filters round-trip through a canonical public URL', () => {
  const input = 'https://frompoetrytodata.vercel.app/atlas/?century=8&q=%20حافظ%20&unknown=x&metric=invalid';
  const parsed = parseAtlasUrl(input, options);

  assert.deepEqual(parsed.state, {
    query: 'حافظ',
    century: 8,
    topic: null,
    metaphor: null,
    period: null,
    threshold: null,
    layout: null,
    poet: null,
    metric: null,
    caseId: null,
    question: null,
    audience: null,
  });
  assert.deepEqual(parsed.invalidParameters, ['metric']);
  assert.equal(
    normalizeAtlasUrl(input, options),
    'https://frompoetrytodata.vercel.app/atlas/?q=%D8%AD%D8%A7%D9%81%D8%B8&century=8',
  );
});
