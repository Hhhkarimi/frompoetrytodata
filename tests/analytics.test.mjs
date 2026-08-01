import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createAnalyticsEvent } from '../src/analytics/events.js';

test('analytics event contracts remove raw and unapproved content', () => {
  assert.deepEqual(createAnalyticsEvent('atlas_search_committed', {
    query: 'حافظ',
    query_length_bucket: '1-10',
    result_count: 1,
    entity_type: 'poet',
    copied_text: 'sensitive',
  }), {
    name: 'atlas_search_committed',
    properties: {
      query_length_bucket: '1-10',
      result_count: 1,
      entity_type: 'poet',
    },
  });
});

test('unknown analytics events fail closed', () => {
  assert.throws(() => createAnalyticsEvent('raw_search_text', { query: 'حافظ' }), /Unknown analytics event/);
});

test('computational-aesthetics analytics exclude raw search and poem content', () => {
  assert.deepEqual(createAnalyticsEvent('research_explorer_changed', {
    study_id: 'computational-aesthetics',
    filter_keys: ['q', 'century'],
    query_length_bucket: '1-10',
    result_count: 1,
    query: 'حافظ',
    poem_text: 'متن حساس',
  }), {
    name: 'research_explorer_changed',
    properties: {
      study_id: 'computational-aesthetics',
      filter_keys: ['q', 'century'],
      query_length_bucket: '1-10',
      result_count: 1,
    },
  });
});
