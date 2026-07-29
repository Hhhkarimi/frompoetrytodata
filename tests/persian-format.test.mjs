import assert from 'node:assert/strict';
import { test } from 'node:test';

import { persianDigits, persianNumber } from '../src/publication/persian-format.js';

test('Persian display formatting preserves numeric meaning', () => {
  const value = 12345.67;
  assert.equal(persianNumber(value, { maximumFractionDigits: 2 }), '۱۲٬۳۴۵٫۶۷');
  assert.equal(value, 12345.67);
  assert.equal(persianDigits('2026-07-29'), '۲۰۲۶-۰۷-۲۹');
});

test('missing or non-numeric display values use an explicit mark', () => {
  assert.equal(persianNumber(null), '—');
  assert.equal(persianNumber('not-a-number'), '—');
});
