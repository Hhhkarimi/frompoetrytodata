// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import App from '../src/App.jsx';
import { buildPersianCitation } from '../src/publication/publication.js';

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

  const search = screen.getByRole('searchbox', { name: 'جست‌وجوی شاعر' });
  const century = screen.getByRole('combobox', { name: 'فیلتر سده شاعر' });

  expect(search.value).toBe('حافظ');
  expect(century.value).toBe('8');

  await user.clear(search);
  await user.type(search, 'سعدی');

  expect(new URL(window.location.href).searchParams.get('q')).toBe('سعدی');
  expect(screen.getByRole('status').textContent).toMatch(/نتیجه/);
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
  const search = screen.getByRole('searchbox', { name: 'جست‌وجوی شاعر' });

  await user.clear(search);
  await user.type(search, 'ناموجودقطعی');

  expect(screen.getByRole('heading', { name: 'شاعری با این فیلترها پیدا نشد' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'پاک‌کردن فیلترهای شاعر' }));

  expect(search.value).toBe('');
  expect(screen.getByText('۶۷ نتیجه؛ شاعر یافت شد')).toBeTruthy();
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
