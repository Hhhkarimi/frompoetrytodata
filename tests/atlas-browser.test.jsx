// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import App from '../src/App.jsx';
import { buildPersianCitation } from '../src/publication/publication.js';
import atlas from '../src/data/atlasData.json';
import { faNumber } from '../src/utils.js';

class IdleIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  window.IntersectionObserver = IdleIntersectionObserver;
  window.history.replaceState({}, '', '/atlas/?q=%D8%AD%D8%A7%D9%81%D8%B8&century=8');
});

afterEach(() => {
  cleanup();
});

test('atlas restores search filters from the URL and keeps changes shareable', async () => {
  const user = userEvent.setup();
  render(<App />);

  const search = screen.getByRole('searchbox', { name: 'جست‌وجوی اطلس' });
  const century = screen.getByRole('combobox', { name: 'فیلتر سدهٔ منتسب' });

  expect(search.value).toBe('حافظ');
  expect(century.value).toBe('8');

  await user.clear(search);
  await user.type(search, 'سعدی');

  expect(new URL(window.location.href).searchParams.get('q')).toBe('سعدی');
  expect(screen.getByRole('status', { name: 'تعداد نتیجه‌های کاوشگر' }).textContent).toMatch(/نتیجه/);
});

test('research tabs support the APG arrow, Home, and End keyboard pattern', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/atlas/');
  render(<App />);

  const tablist = screen.getByRole('tablist', { name: 'پرسش‌های عمومی شعر فارسی' });
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

  tabs[0].focus();
  await user.keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(tabs[1]);
  expect(tabs[1].getAttribute('aria-selected')).toBe('true');

  await user.keyboard('{End}');
  expect(document.activeElement).toBe(tabs.at(-1));
  expect(tabs.at(-1).getAttribute('aria-selected')).toBe('true');

  await user.keyboard('{Home}');
  expect(document.activeElement).toBe(tabs[0]);
  expect(tabs[0].getAttribute('aria-selected')).toBe('true');
});

test('atlas copies the exact shareable URL and announces success', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'کپی پیوند این نما' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
  expect(await screen.findByText('پیوند این نما کپی شد')).toBeTruthy();
});

test('poet search exposes a recoverable empty state', async () => {
  const user = userEvent.setup();
  render(<App />);
  const search = screen.getByRole('searchbox', { name: 'جست‌وجوی اطلس' });

  await user.clear(search);
  await user.type(search, 'ناموجودقطعی');

  expect(screen.getByRole('heading', { name: 'موردی با این فیلترها پیدا نشد' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'پاک‌کردن فیلترهای کاوشگر' }));

  expect(search.value).toBe('');
  expect(screen.getByText(/نتیجه در کاوشگر/)).toBeTruthy();
});

test('citation copy uses the canonical publication model', async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'کپی استناد پیشنهادی' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith(buildPersianCitation()));
  expect(screen.getByRole('button', { name: 'استناد کپی شد' })).toBeTruthy();
});

test('citation copy failure keeps selectable text and announces a manual fallback', async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockRejectedValue(new Error('denied'));
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render(<App />);

  const citation = screen.getByText(buildPersianCitation());
  const button = screen.getByRole('button', { name: 'کپی استناد پیشنهادی' });
  await user.click(button);

  expect(citation.tagName).toBe('BLOCKQUOTE');
  expect(await screen.findByText('کپی خودکار ممکن نشد؛ متن استناد را انتخاب و کپی کنید.')).toBeTruthy();
  expect(document.activeElement).toBe(button);
});

test('every atlas chart receives a distinct card-level accessible identity', () => {
  window.history.replaceState({}, '', '/atlas/');
  const { container } = render(<App />);
  const evidenceViews = Array.from(container.querySelectorAll('.evidence-view'));
  const labels = evidenceViews.map((view) => view.getAttribute('aria-label'));
  const genericTitles = evidenceViews
    .filter((view) => view.getAttribute('aria-label') === 'نمودار تعاملی')
    .map((view) => view.closest('.chart-card')?.querySelector('h3')?.textContent);

  expect(labels.length).toBeGreaterThan(20);
  expect(genericTitles).toEqual([]);
  expect(new Set(labels).size).toBe(labels.length);
  expect(
    container.querySelector('[aria-label="جابه‌جایی در چهار دوره تاریخی"]')
      ?.getAttribute('data-evidence-source'),
  ).toBe('geography-research');
});

test('mobile navigation exposes expanded and current state', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/atlas/');
  render(<App />);

  const menu = screen.getByRole('button', { name: 'فهرست' });
  expect(menu.getAttribute('aria-expanded')).toBe('false');
  expect(menu.getAttribute('aria-controls')).toBe('atlas-navigation');
  expect(screen.getByRole('button', { name: 'خانه' }).getAttribute('aria-current')).toBe('location');

  await user.click(menu);
  expect(menu.getAttribute('aria-expanded')).toBe('true');
});

test('atlas searches multiple entity types with canonical links and a global reset', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/atlas/?q=%D8%AD%DA%A9%D9%85%D8%AA&entity=theme&sort=title');
  render(<App />);

  expect(screen.getByRole('combobox', { name: 'نوع موجودیت' }).value).toBe('theme');
  expect(screen.getByRole('combobox', { name: 'ترتیب نتیجه‌ها' }).value).toBe('title');
  const themeLink = screen.getByRole('link', { name: /اخلاق، حکمت و خرد/ });
  expect(themeLink.getAttribute('href')).toBe('/themes/ethics-wisdom/');

  await user.click(screen.getByRole('button', { name: 'بازنشانی همهٔ فیلترهای کاوشگر' }));
  expect(screen.getByRole('searchbox', { name: 'جست‌وجوی اطلس' }).value).toBe('');
  expect(window.location.search).toBe('');
});

test('history navigation restores explorer state and search focus', async () => {
  window.history.replaceState({}, '', '/atlas/?q=%D8%B3%D8%B9%D8%AF%DB%8C&entity=poet');
  render(<App />);

  window.history.replaceState({}, '', '/atlas/?q=%D8%AD%D8%A7%D9%81%D8%B8&entity=poet&century=8');
  window.dispatchEvent(new PopStateEvent('popstate'));

  const search = screen.getByRole('searchbox', { name: 'جست‌وجوی اطلس' });
  await waitFor(() => expect(search.value).toBe('حافظ'));
  expect(screen.getByRole('combobox', { name: 'فیلتر سدهٔ منتسب' }).value).toBe('8');
  await waitFor(() => expect(document.activeElement).toBe(search));
});

test('active graph threshold produces an equivalent filtered table with explicit units', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/atlas/?threshold=0.96');
  render(<App />);

  const evidenceView = screen.getByRole('region', { name: 'نقشه تعاملی شاخص شباهت متنی میان شاعران' });
  await user.click(within(evidenceView).getByRole('button', { name: 'نمایش جدول داده' }));

  const table = within(evidenceView).getByRole('table');
  const scoreRows = within(table).getAllByRole('row')
    .filter((row) => row.textContent.includes('امتیاز پیوند'));
  const expectedEdges = atlas.intertext.edges.filter((edge) => edge.score >= 0.96);

  expect(scoreRows).toHaveLength(expectedEdges.length);
  scoreRows.forEach((row, index) => {
    const edge = expectedEdges[index];
    expect(row.textContent).toContain(`${edge.source} ← ${edge.target}`);
    expect(row.textContent).toContain(faNumber(edge.score, { maximumFractionDigits: 3 }));
    expect(row.textContent).toContain('امتیاز مرکب از ۰ تا ۱');
    expect(row.textContent).toContain('شاهدهای واژگانی، موضوعی و عبارتی همان جفت');
    expect(row.textContent).toContain('۳ رقم اعشار');
  });
});
