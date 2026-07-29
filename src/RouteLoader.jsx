import { useEffect, useState } from 'react';
import { emitAnalyticsEvent } from './analytics/events.js';

export default function RouteLoader({ loadPage, summary }) {
  const [Page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setPage(null);
    setError(null);
    loadPage()
      .then((module) => {
        if (active) setPage(() => module.default);
      })
      .catch((reason) => {
        if (active) {
          emitAnalyticsEvent('recoverable_error_shown', { surface: 'route', error_category: 'module_load' });
          setError(reason);
        }
      });
    return () => {
      active = false;
    };
  }, [attempt, loadPage]);

  if (error) {
    return (
      <main className="route-state" role="alert">
        <h1>بارگذاری این بخش ممکن نشد</h1>
        <p>اتصال شبکه را بررسی کنید و دوباره تلاش کنید. نسخهٔ بدون جاوااسکریپت صفحه همچنان از مسیرهای پژوهشی در دسترس است.</p>
        <button type="button" className="primary-button" onClick={() => setAttempt((value) => value + 1)}>تلاش دوباره</button>
      </main>
    );
  }

  if (!Page) {
    return <main className="route-state" role="status" aria-live="polite"><p>در حال آماده‌سازی صفحه…</p></main>;
  }

  return <Page summary={summary} />;
}
