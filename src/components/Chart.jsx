import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';

const LazyECharts = lazy(() => import('echarts-for-react'));

export default function Chart({ option, height = 430, className = '', onEvents, ariaLabel }) {
  const shellRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = shellRef.current;
    if (!node || ready) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '450px 0px', threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  const accessibleOption = {
    aria: { enabled: true, decal: { show: false }, description: ariaLabel || 'نمودار تعاملی از پروژه از شعر تا داده' },
    animationDuration: 650,
    animationDurationUpdate: 420,
    ...option,
  };

  return (
    <div ref={shellRef} className={`chart-shell ${className}`} role="figure" aria-label={ariaLabel || 'نمودار تعاملی'} style={{ minHeight: height }}>
      {ready ? (
        <Suspense fallback={<div className="chart-loading" style={{ height }}><span />در حال آماده‌سازی نمودار…</div>}>
          <LazyECharts
            option={accessibleOption}
            style={{ height, width: '100%' }}
            notMerge
            lazyUpdate
            onEvents={onEvents}
            opts={{ renderer: 'canvas', locale: 'FA' }}
          />
        </Suspense>
      ) : <div className="chart-loading" style={{ height }}><span />نمودار هنگام نزدیک‌شدن شما بارگذاری می‌شود</div>}
    </div>
  );
}
