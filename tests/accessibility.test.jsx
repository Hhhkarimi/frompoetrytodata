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

async function expectNoAutomatedViolations(container) {
  const result = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
    resultTypes: ['violations'],
  });
  expect(result.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }))).toEqual([]);
}

test('narrative homepage has no automated accessibility violations', async () => {
  const { container } = render(<NarrativeHome summary={{ texts: 54524, poets: 67, centuries: 13 }} />);
  await expectNoAutomatedViolations(container);
});

test('atlas shell has no automated accessibility violations', async () => {
  window.history.replaceState({}, '', '/atlas/');
  const { container } = render(<App />);
  await expectNoAutomatedViolations(container);
});
