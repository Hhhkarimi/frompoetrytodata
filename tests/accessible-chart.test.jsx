// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test } from 'vitest';

import Chart from '../src/components/Chart.jsx';

class IdleIntersectionObserver {
  observe() {}
  disconnect() {}
}

beforeEach(() => {
  window.IntersectionObserver = IdleIntersectionObserver;
});

afterEach(cleanup);

test('chart exposes an equivalent native data table before the canvas loads', async () => {
  const user = userEvent.setup();
  render(
    <Chart
      ariaLabel="روند نمونه"
      summary="مقایسه دو مقدار در دو سده"
      qualification="این مقدار پوشش پیکره است، نه اهمیت ادبی."
      option={{
        xAxis: { type: 'category', data: ['سده ۷', 'سده ۸'] },
        yAxis: { type: 'value', name: 'درصد' },
        series: [{ name: 'سهم', type: 'bar', data: [12.5, 18] }],
      }}
    />,
  );

  expect(screen.getByText('مقایسه دو مقدار در دو سده')).toBeTruthy();
  expect(screen.getByText('این مقدار پوشش پیکره است، نه اهمیت ادبی.')).toBeTruthy();

  await user.click(screen.getByRole('button', { name: 'نمایش جدول داده' }));
  const table = screen.getByRole('table', { name: 'داده‌های روند نمونه' });
  const rows = within(table).getAllByRole('row');

  expect(rows).toHaveLength(3);
  expect(rows[1].textContent).toContain('سده ۷');
  expect(rows[1].textContent).toContain('سهم');
  expect(rows[1].textContent).toContain('۱۲٫۵');
  expect(rows[2].textContent).toContain('۱۸');
});
