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
  studies: ['topics', 'metaphors'],
};

test('atlas search and filters round-trip through a canonical public URL', () => {
  const input = 'https://frompoetrytodata.vercel.app/atlas/?century=8&q=%20حافظ%20&unknown=x&metric=invalid';
  const parsed = parseAtlasUrl(input, options);

  assert.deepEqual(parsed.state, {
    query: 'حافظ',
    entityType: null,
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
    study: null,
    sort: null,
    audience: null,
  });
  assert.deepEqual(parsed.invalidParameters, ['metric']);
  assert.equal(
    normalizeAtlasUrl(input, options),
    'https://frompoetrytodata.vercel.app/atlas/?q=%D8%AD%D8%A7%D9%81%D8%B8&century=8',
  );
});

test('multi-entity explorer dimensions normalize in deterministic order', () => {
  const input = 'https://frompoetrytodata.vercel.app/atlas/?sort=title&study=topics&entity=research&q=شب';
  const parsed = parseAtlasUrl(input, options);

  assert.equal(parsed.state.entityType, 'research');
  assert.equal(parsed.state.study, 'topics');
  assert.equal(parsed.state.sort, 'title');
  assert.equal(
    normalizeAtlasUrl(input, options),
    'https://frompoetrytodata.vercel.app/atlas/?q=%D8%B4%D8%A8&entity=research&study=topics&sort=title',
  );
});
