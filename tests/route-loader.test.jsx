// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import RouteLoader from '../src/RouteLoader.jsx';

afterEach(cleanup);

test('route loader exposes loading and recoverable error states', async () => {
  let rejectImport;
  const loadPage = vi.fn(() => new Promise((resolve, reject) => {
    rejectImport = reject;
  }));
  const user = userEvent.setup();
  render(<RouteLoader loadPage={loadPage} summary={null} />);

  expect(screen.getByRole('status').textContent).toContain('در حال آماده‌سازی');
  rejectImport(new Error('chunk unavailable'));

  expect((await screen.findByRole('alert')).textContent).toContain('بارگذاری این بخش ممکن نشد');
  await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));

  expect(loadPage).toHaveBeenCalledTimes(2);
});
