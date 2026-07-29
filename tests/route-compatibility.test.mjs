import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveAppRoute } from '../src/routes/route.js';

test('legacy homepage fragments redirect to the equivalent atlas gateway', () => {
  for (const hash of ['#overview', '#topics', '#metaphors', '#poets', '#attribution']) {
    assert.deepEqual(resolveAppRoute({ pathname: '/', hash }), {
      route: 'home',
      redirect: `/atlas/${hash}`,
    });
  }
});

test('current publication routes load without compatibility redirects', () => {
  assert.deepEqual(resolveAppRoute({ pathname: '/', hash: '' }), { route: 'home', redirect: null });
  assert.deepEqual(resolveAppRoute({ pathname: '/atlas/', hash: '#topics' }), { route: 'atlas', redirect: null });
});
