// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, beforeEach, expect, test } from 'vitest';

import App from '../src/App.jsx';
import NarrativeHome from '../src/NarrativeHome.jsx';

class IdleIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  window.IntersectionObserver = IdleIntersectionObserver;
  window.history.replaceState({}, '', '/');
});

afterEach(cleanup);

async function expectNoSeriousViolations(container) {
  const result = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
    resultTypes: ['violations'],
  });
  const serious = result.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(serious.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
}

test('narrative homepage has no serious automated accessibility violations', async () => {
  const { container } = render(<NarrativeHome summary={{ texts: 54524, poets: 67, centuries: 13 }} />);
  await expectNoSeriousViolations(container);
});

test('atlas shell has no serious automated accessibility violations', async () => {
  window.history.replaceState({}, '', '/atlas/');
  const { container } = render(<App />);
  await expectNoSeriousViolations(container);
});
