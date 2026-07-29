// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test } from 'vitest';

import App from '../src/App.jsx';

class IdleIntersectionObserver {
  observe() {}
  disconnect() {}
}

beforeEach(() => {
  window.IntersectionObserver = IdleIntersectionObserver;
  window.history.replaceState({}, '', '/atlas/?q=%D8%AD%D8%A7%D9%81%D8%B8');
});

afterEach(cleanup);

test('poet dialog contains focus, closes with Escape, and restores its trigger', async () => {
  const user = userEvent.setup();
  render(<App />);

  const trigger = screen.getByRole('button', { name: 'بازکردن پرونده داده‌ای حافظ' });
  trigger.focus();
  await user.click(trigger);

  const dialog = screen.getByRole('dialog', { name: 'پرونده داده‌ای حافظ' });
  expect(dialog.contains(document.activeElement)).toBe(true);

  await user.keyboard('{Escape}');

  expect(screen.queryByRole('dialog', { name: 'پرونده داده‌ای حافظ' })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
