import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'public/seo-pages.js'), 'utf8');

test('computational-aesthetics explorer restores and shares filters through its URL', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <form data-aesthetic-explorer>
      <input name="q" type="search">
      <select name="century"><option value="">همه</option><option value="8">۸</option></select>
      <select name="metric"><option value="overall">نهایی</option><option value="music">موسیقی</option></select>
      <select name="sort"><option value="century-name">سده</option><option value="score-desc">امتیاز</option></select>
      <button type="button" data-aesthetic-reset>پاک‌کردن</button>
    </form>
    <p role="status" data-aesthetic-status></p>
    <p data-aesthetic-empty hidden>بدون نتیجه</p>
    <table><tbody data-aesthetic-results>
      <tr data-aesthetic-poet="حافظ" data-century="8" data-overall="81.61" data-music="78"><td>حافظ</td></tr>
      <tr data-aesthetic-poet="سعدی" data-century="7" data-overall="79" data-music="82"><td>سعدی</td></tr>
    </tbody></table>
  </body></html>`, {
    url: 'https://example.test/research/computational-aesthetics/?q=حافظ&century=8&metric=music&sort=score-desc',
    runScripts: 'outside-only',
  });

  dom.window.eval(script);

  const form = dom.window.document.querySelector('[data-aesthetic-explorer]');
  const rows = [...dom.window.document.querySelectorAll('[data-aesthetic-results] tr')];
  const hafez = rows.find((row) => row.dataset.aestheticPoet === 'حافظ');
  const saadi = rows.find((row) => row.dataset.aestheticPoet === 'سعدی');
  assert.equal(form.elements.q.value, 'حافظ');
  assert.equal(form.elements.century.value, '8');
  assert.equal(form.elements.metric.value, 'music');
  assert.equal(form.elements.sort.value, 'score-desc');
  assert.equal(hafez.hidden, false);
  assert.equal(saadi.hidden, true);
  assert.match(dom.window.document.querySelector('[data-aesthetic-status]').textContent, /۱ نتیجه/);

  form.elements.q.value = 'سعدی';
  form.elements.century.value = '';
  form.elements.q.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(dom.window.location.search, '?q=%D8%B3%D8%B9%D8%AF%DB%8C&metric=music&sort=score-desc');
  assert.equal(hafez.hidden, true);
  assert.equal(saadi.hidden, false);
});
