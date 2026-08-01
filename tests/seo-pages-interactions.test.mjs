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
    <p data-aesthetic-url-notice hidden></p>
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

test('computational-aesthetics explorer recovers invalid URLs and restores browser history', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <form data-aesthetic-explorer>
      <input name="q" type="search">
      <select name="century"><option value="">همه</option><option value="7">۷</option><option value="8">۸</option></select>
      <select name="metric"><option value="overall">نهایی</option><option value="music">موسیقی</option></select>
      <select name="sort"><option value="century-name">سده</option><option value="score-desc">امتیاز</option></select>
      <button type="button" data-aesthetic-reset>پاک‌کردن</button>
    </form>
    <p role="status" data-aesthetic-status></p>
    <p data-aesthetic-url-notice hidden></p>
    <p data-aesthetic-empty hidden></p>
    <table><tbody data-aesthetic-results>
      <tr data-aesthetic-poet="حافظ" data-century="8" data-overall="81" data-music="78"><td>حافظ</td></tr>
      <tr data-aesthetic-poet="سعدی" data-century="7" data-overall="79" data-music="82"><td>سعدی</td></tr>
    </tbody></table>
  </body></html>`, {
    url: 'https://example.test/research/computational-aesthetics/?q=حافظ&century=999&metric=bogus&sort=nope',
    runScripts: 'outside-only',
  });

  dom.window.eval(script);

  const form = dom.window.document.querySelector('[data-aesthetic-explorer]');
  const notice = dom.window.document.querySelector('[data-aesthetic-url-notice]');
  assert.equal(dom.window.location.search, '?q=%D8%AD%D8%A7%D9%81%D8%B8');
  assert.equal(notice.hidden, false);
  assert.match(notice.textContent, /نامعتبر/);

  dom.window.history.pushState({}, '', '?q=سعدی&century=7&metric=music');
  dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));

  assert.equal(form.elements.q.value, 'سعدی');
  assert.equal(form.elements.century.value, '7');
  assert.equal(form.elements.metric.value, 'music');
  assert.equal(
    dom.window.document.querySelector('[data-aesthetic-poet="سعدی"]').hidden,
    false,
  );
  assert.equal(
    dom.window.document.querySelector('[data-aesthetic-poet="حافظ"]').hidden,
    true,
  );
});

test('computational-aesthetics explorer exposes a recoverable error without removing static data', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <form data-aesthetic-explorer>
      <input name="q" type="search">
      <select name="century"><option value="">همه</option></select>
      <select name="metric"><option value="overall">نهایی</option></select>
      <select name="sort"><option value="century-name">سده</option></select>
    </form>
    <p data-aesthetic-status></p><p data-aesthetic-loading aria-busy="false" hidden></p>
    <div data-aesthetic-error hidden><button data-aesthetic-retry>تلاش دوباره</button></div>
    <table><tbody data-aesthetic-results><tr data-aesthetic-poet="حافظ" data-century="8" data-overall="81"><td>حافظ</td></tr></tbody></table>
  </body></html>`, { url: 'https://example.test/research/computational-aesthetics/', runScripts: 'outside-only' });

  dom.window.eval(script);
  dom.window.history.replaceState = () => { throw new Error('simulated history failure'); };
  const input = dom.window.document.querySelector('[name="q"]');
  input.value = 'حافظ';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(dom.window.document.querySelector('[data-aesthetic-error]').hidden, false);
  assert.equal(dom.window.document.querySelector('[data-aesthetic-loading]').hidden, true);
  assert.equal(dom.window.document.querySelector('[data-aesthetic-loading]').getAttribute('aria-busy'), 'false');
  assert.ok(dom.window.document.querySelector('[data-aesthetic-poet="حافظ"]'));
});

test('poet study analytics expose identity but never poem text', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <section id="computational-aesthetics">
      <article data-aesthetic-couplet><details><summary>شاهد</summary><p>متن شعر</p></details></article>
    </section>
  </body></html>`, {
    url: 'https://example.test/poets/hafez/', runScripts: 'outside-only',
  });
  const events = [];
  dom.window.addEventListener('from-poetry-to-data:analytics', (event) => events.push(event.detail));

  dom.window.eval(script);
  dom.window.document.querySelector('details').open = true;
  dom.window.document.querySelector('details').dispatchEvent(new dom.window.Event('toggle'));

  assert.deepEqual(JSON.parse(JSON.stringify(events[0])), {
    name: 'research_poet_section_viewed',
    properties: { study_id: 'computational-aesthetics', poet_slug: 'hafez' },
  });
  assert.equal(JSON.stringify(events).includes('متن شعر'), false);
});
