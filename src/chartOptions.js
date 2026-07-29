import { chartColors, faNumber, faPercent } from './utils.js';

const palette = chartColors;

const baseTooltip = (dark = false) => ({
  trigger: 'axis',
  backgroundColor: dark ? 'rgba(7,34,34,.96)' : 'rgba(255,252,245,.97)',
  borderColor: dark ? '#2e6f6a' : '#d8c7a1',
  textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#f6efdf' : '#243b39' },
  extraCssText: 'direction:rtl;text-align:right;border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.18);',
});

const axis = (dark = false) => ({
  axisLine: { lineStyle: { color: dark ? '#315654' : '#cfc3aa' } },
  axisTick: { show: false },
  axisLabel: { fontFamily: 'Vazirmatn', color: dark ? '#b9cecb' : '#6b6256' },
  splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,.07)' : 'rgba(58,75,70,.09)' } },
});

export function overviewCoverageOption(data, dark = false) {
  return {
    color: ['#0f766e', '#d29d35'],
    tooltip: {
      ...baseTooltip(dark),
      formatter: (params) => {
        const century = params[0]?.axisValue;
        const lines = params.map((p) => `${p.marker}${p.seriesName}: <b>${faNumber(p.value)}</b>`);
        return `<b>سده ${faNumber(century)}</b><br/>${lines.join('<br/>')}`;
      },
    },
    legend: { top: 2, right: 10, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#d9e7e5' : '#4d5957' } },
    grid: { left: 42, right: 48, top: 48, bottom: 46, containLabel: true },
    xAxis: { type: 'category', data: data.map((d) => d.century), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: [
      { type: 'value', name: 'متن', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
      { type: 'value', name: 'شاعر', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) }, splitLine: { show: false } },
    ],
    series: [
      { name: 'تعداد متن', type: 'bar', data: data.map((d) => d.texts), barMaxWidth: 32, itemStyle: { borderRadius: [8, 8, 0, 0] } },
      { name: 'تعداد شاعر', type: 'line', yAxisIndex: 1, data: data.map((d) => d.poets), symbolSize: 8, smooth: true, lineStyle: { width: 3 } },
    ],
  };
}

export function poetTreemapOption(poets, selectedMetric = 'poems', dark = false) {
  const metrics = {
    poems: { key: 'poems', label: 'شعر/متن' },
    couplets: { key: 'totalCouplets', label: 'بیت' },
    words: { key: 'totalWords', label: 'واژه' },
  };
  const metric = metrics[selectedMetric] || metrics.poems;
  return {
    tooltip: {
      ...baseTooltip(dark),
      trigger: 'item',
      formatter: (p) => `<b>${p.name}</b><br/>سده ${faNumber(p.data.century)}<br/>${faNumber(p.data.poems)} شعر/متن<br/>${faNumber(p.data.totalCouplets)} بیت<br/>${faNumber(p.data.totalWords)} واژه<br/>${faNumber(p.data.books)} کتاب`,
    },
    series: [{
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      data: poets.map((p) => ({
        name: p.name,
        value: p[metric.key],
        century: p.century,
        books: p.books,
        poems: p.poems,
        totalCouplets: p.totalCouplets,
        totalWords: p.totalWords,
      })),
      label: { show: true, fontFamily: 'Vazirmatn', formatter: (p) => `${p.name}\n${faNumber(p.value)} ${metric.label}`, color: '#fff' },
      upperLabel: { show: false },
      itemStyle: { borderColor: dark ? '#0c3433' : '#f8f2e5', borderWidth: 3, gapWidth: 2 },
      visualDimension: 0,
      levels: [{ itemStyle: { borderWidth: 0, gapWidth: 2 } }],
      color: palette,
      colorMappingBy: 'index',
    }],
  };
}

export function topicRiverOption(topics, dark = false) {
  const centuries = topics[0].values.map((v) => v.century);
  return {
    color: palette,
    tooltip: {
      ...baseTooltip(dark),
      formatter: (params) => {
        const sorted = [...params].sort((a, b) => b.value - a.value).slice(0, 6);
        return `<b>سده ${faNumber(params[0]?.axisValue)}</b><br/>${sorted.map((p) => `${p.marker}${p.seriesName}: <b>${faPercent(p.value)}</b>`).join('<br/>')}`;
      },
    },
    legend: { type: 'scroll', top: 0, right: 5, left: 5, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#d7e6e4' : '#52605e' }, pageTextStyle: { color: dark ? '#fff' : '#333' } },
    grid: { left: 42, right: 22, top: 70, bottom: 48, containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: centuries, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', max: 100, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => `${faNumber(v)}٪` } },
    series: topics.map((t) => ({
      name: t.name,
      type: 'line',
      stack: 'کل',
      smooth: 0.28,
      symbol: 'none',
      areaStyle: { opacity: 0.78 },
      emphasis: { focus: 'series' },
      data: t.values.map((v) => v.share),
      lineStyle: { width: 1.2 },
    })),
  };
}

export function singleTopicOption(topic, dark = false) {
  return {
    color: ['#0f766e'],
    tooltip: { ...baseTooltip(dark), formatter: (p) => `<b>${topic.name}</b><br/>سده ${faNumber(p[0].axisValue)}: ${faPercent(p[0].value)}` },
    grid: { left: 42, right: 24, top: 36, bottom: 44, containLabel: true },
    xAxis: { type: 'category', data: topic.values.map((v) => v.century), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => `${faNumber(v)}٪` } },
    series: [{
      type: 'line', smooth: true, symbolSize: 10, data: topic.values.map((v) => v.share),
      lineStyle: { width: 4 }, areaStyle: { opacity: 0.18 },
      markPoint: { symbolSize: 56, label: { fontFamily: 'Vazirmatn', formatter: 'اوج' }, data: [{ type: 'max' }] },
    }],
  };
}

export function topicStatsOption(topics, dark = false) {
  return {
    color: palette,
    tooltip: {
      ...baseTooltip(dark), trigger: 'item',
      formatter: (p) => `<b>${p.data.name}</b><br/>روند زمانی: ${faNumber(p.data.value[0], { maximumFractionDigits: 3 })}<br/>اندازه اثر سده: ${faNumber(p.data.value[1], { maximumFractionDigits: 3 })}<br/>سهم کل: ${faPercent(p.data.share)}`,
    },
    grid: { left: 52, right: 28, top: 30, bottom: 50, containLabel: true },
    xAxis: { type: 'value', min: -0.55, max: 0.72, name: 'همبستگی روند زمانی', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    yAxis: { type: 'value', name: 'اندازه اثر سده‌ای', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    series: [{
      type: 'scatter',
      tableDimensions: [
        { label: 'همبستگی روند زمانی', unit: 'ضریب ρ', denominator: 'سده‌های دارای داده برای همان مضمون', precision: 3 },
        { label: 'اندازه اثر سده‌ای', unit: 'ε²', denominator: 'تفاوت سهم مضمون میان سده‌های دارای داده', precision: 3 },
      ],
      data: topics.map((t, i) => ({ name: t.name, value: [t.rho, t.epsilonSquared], share: t.overallShare, itemStyle: { color: palette[i % palette.length], opacity: t.significantTrend ? 1 : 0.5 } })),
      symbolSize: (v, p) => 13 + p.data.share * 1.25,
      label: { show: false, fontFamily: 'Vazirmatn' },
      emphasis: { label: { show: true, formatter: (p) => p.name, position: 'top', color: dark ? '#fff' : '#263533', fontFamily: 'Vazirmatn' } },
      markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: dark ? '#6e8784' : '#a5a097' }, data: [{ xAxis: 0 }, { yAxis: 0.15 }] },
    }],
  };
}

export function transitionBarOption(transitions, dark = false, label = 'واگرایی معنایی') {
  return {
    color: ['#9f2f38'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.name}</b><br/>${label}: ${faNumber(p.value, { maximumFractionDigits: 3 })}<br/>${p.data.note || ''}` },
    grid: { left: 52, right: 26, top: 28, bottom: 90, containLabel: true },
    xAxis: { type: 'category', data: transitions.map((d) => `${d.from}←${d.to}`), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, rotate: 35, formatter: (v) => String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]) } },
    yAxis: { type: 'value', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    series: [{ type: 'bar', barMaxWidth: 36, itemStyle: { borderRadius: [8, 8, 0, 0] }, data: transitions.map((d) => ({ value: d.jsd, note: d.confidence || `${faNumber(d.poetsBefore)} / ${faNumber(d.poetsAfter)} شاعر` })) }],
  };
}

export function metaphorBubbleOption(items, dark = false) {
  return {
    color: palette,
    tooltip: {
      ...baseTooltip(dark), trigger: 'item',
      formatter: (p) => `<b>${p.data.name}</b><br/>درصد شعرها: ${faPercent(p.data.value[0])}<br/>نرخ در ده‌هزار واژه: ${faNumber(p.data.value[1], { maximumFractionDigits: 1 })}<br/>رخداد: ${faNumber(p.data.occurrences)}<br/>روند: ${faNumber(p.data.rho, { maximumFractionDigits: 3 })}`,
    },
    grid: { left: 52, right: 26, top: 28, bottom: 52, containLabel: true },
    xAxis: { type: 'value', name: 'درصد شعرهای دارای تصویر', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => `${faNumber(v)}٪` } },
    yAxis: { type: 'value', name: 'نرخ در ۱۰هزار واژه', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    visualMap: { show: false, min: 0.2, max: 0.5, dimension: 2, inRange: { color: ['#d29d35', '#9f2f38'] } },
    series: [{
      type: 'scatter',
      tableDimensions: [
        { label: 'درصد شعرهای دارای تصویر', unit: 'درصد', denominator: 'همهٔ شعرهای پیکره', precision: 1 },
        { label: 'نرخ در ۱۰هزار واژه', unit: 'رخداد در ۱۰هزار واژه', denominator: 'همهٔ واژه‌های پیکره', precision: 1 },
        { label: 'روند زمانی', unit: 'ضریب ρ', denominator: 'سده‌های دارای داده', precision: 3 },
      ],
      data: items.map((d) => ({ name: d.name, value: [d.poemPercent, d.rate, d.rho], occurrences: d.occurrences, rho: d.rho })),
      symbolSize: (v, p) => 18 + Math.sqrt(p.data.occurrences) / 5,
      label: { show: true, formatter: (p) => p.name.split('،')[0], position: 'top', fontFamily: 'Vazirmatn', color: dark ? '#eaf5f3' : '#364b48', fontSize: 11 },
    }],
  };
}

export function metaphorLifeOption(selected, rates, dark = false) {
  return {
    color: ['#0f766e'],
    tooltip: { ...baseTooltip(dark), formatter: (p) => `<b>${selected}</b><br/>سده ${faNumber(p[0].axisValue)}: ${faNumber(p[0].value, { maximumFractionDigits: 2 })} رخداد در ۱۰هزار واژه` },
    grid: { left: 50, right: 24, top: 32, bottom: 48, containLabel: true },
    xAxis: { type: 'category', data: rates.map((d) => d.century), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', name: 'نرخ متوازن شاعر', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    series: [{ type: 'line', smooth: 0.35, symbol: 'circle', symbolSize: 9, data: rates.map((d) => d[selected]), lineStyle: { width: 4 }, areaStyle: { opacity: 0.2 }, markPoint: { data: [{ type: 'max', name: 'اوج' }], label: { fontFamily: 'Vazirmatn', formatter: 'اوج' } } }],
  };
}

export function metaphorNetworkOption(pairs, period, dark = false) {
  const chosen = pairs.filter((p) => p.period === period);
  const names = [...new Set(chosen.flatMap((p) => [p.source, p.target]))];
  const degrees = Object.fromEntries(names.map((n) => [n, 0]));
  chosen.forEach((e) => { degrees[e.source] += 1; degrees[e.target] += 1; });
  return {
    color: palette,
    tooltip: {
      ...baseTooltip(dark), trigger: 'item',
      formatter: (p) => p.dataType === 'edge' ? `<b>${p.data.source}</b> + <b>${p.data.target}</b><br/>هم‌رخدادی فراتر از انتظار: ${faNumber(p.data.value, { maximumFractionDigits: 3 })}` : `<b>${p.name}</b><br/>تعداد پیوند: ${faNumber(degrees[p.name])}`,
    },
    series: [{
      type: 'graph', layout: 'force', roam: true, draggable: true,
      tableGraph: {
        node: { label: 'تعداد پیوند خانواده', unit: 'پیوند', denominator: 'پیوندهای دورهٔ انتخاب‌شده', precision: 0 },
        link: { label: 'هم‌رخدادی فراتر از انتظار', unit: 'nPMI', denominator: 'هم‌رخدادی همان دو خانواده در دورهٔ انتخاب‌شده', precision: 3 },
      },
      force: { repulsion: 240, edgeLength: [100, 180], gravity: 0.08 },
      data: names.map((name, i) => ({ name, value: degrees[name], symbolSize: 42 + degrees[name] * 9, itemStyle: { color: palette[i % palette.length] } })),
      links: chosen.map((e) => ({ source: e.source, target: e.target, value: e.npmi, lineStyle: { width: 2 + e.npmi * 9, opacity: 0.72, curveness: 0.1 } })),
      label: { show: true, fontFamily: 'Vazirmatn', color: dark ? '#f5f1e6' : '#233b38', fontSize: 11 },
      lineStyle: { color: 'source' }, emphasis: { focus: 'adjacency', lineStyle: { width: 6 } },
    }],
  };
}

export function intertextNetworkOption(edges, threshold, dark = false, layoutMode = 'force') {
  const chosen = edges.filter((e) => e.score >= threshold);
  const names = [...new Set(chosen.flatMap((e) => [e.source, e.target]))];
  const stats = Object.fromEntries(names.map((n) => [n, { in: 0, out: 0, century: 0 }]));
  chosen.forEach((e) => { stats[e.source].out += 1; stats[e.source].century = e.sourceCentury; stats[e.target].in += 1; stats[e.target].century = e.targetCentury; });
  const centuries = names.map((n) => stats[n].century);
  const minCentury = centuries.length ? Math.min(...centuries) : 3;
  const maxCentury = centuries.length ? Math.max(...centuries) : 15;
  const scores = chosen.map((e) => e.score);
  const minScore = scores.length ? Math.min(...scores) : threshold;
  const maxScore = scores.length ? Math.max(...scores) : threshold;
  const edgeWidth = (score) => {
    if (maxScore === minScore) return 4.2;
    return 1.4 + ((score - minScore) / (maxScore - minScore)) * 5.8;
  };
  const evidenceColor = {
    'بسیار قوی': '#9f2f38',
    'قابل توجه': '#b9862d',
    'محدود': dark ? '#9eb5b1' : '#5f7773',
  };
  return {
    tooltip: {
      ...baseTooltip(dark), trigger: 'item',
      formatter: (p) => {
        if (p.dataType === 'edge') return `<b>از ${p.data.source} به ${p.data.target}</b><br/>نوع شاهد: ${p.data.evidence}<br/>امتیاز مرکب: ${faNumber(p.data.score, { maximumFractionDigits: 3 })}<br/>پنج‌واژه مشترک: ${faNumber(p.data.phrases)}<br/>واژگانی: ${faNumber(p.data.lexical, { maximumFractionDigits: 3 })}<br/>موضوعی: ${faNumber(p.data.topic, { maximumFractionDigits: 3 })}`;
        return `<b>${p.name}</b><br/>سده ${faNumber(p.data.century)}<br/>خروجی: ${faNumber(stats[p.name].out)} | ورودی: ${faNumber(stats[p.name].in)}`;
      },
    },
    visualMap: { show: false, min: minCentury, max: maxCentury, dimension: 1, inRange: { color: ['#d29d35', '#0f766e', '#315ba8', '#9f2f38'] } },
    series: [{
      type: 'graph', layout: layoutMode === 'circular' ? 'circular' : 'force', roam: true, draggable: layoutMode !== 'circular',
      tableGraph: {
        nodeDimensions: [
          { label: 'تعداد پیوند گره', unit: 'پیوند', denominator: 'پیوندهای عبورکرده از آستانهٔ فعال', precision: 0 },
          { label: 'سدهٔ منتسب گره', unit: 'سده هجری', denominator: 'برچسب انتسابی شاعر', precision: 0 },
        ],
        link: { label: 'امتیاز پیوند', unit: 'امتیاز مرکب از ۰ تا ۱', denominator: 'شاهدهای واژگانی، موضوعی و عبارتی همان جفت', precision: 3 },
        phrases: { label: 'تعداد عبارت مشترک', unit: 'عبارت پنج‌واژه‌ای', denominator: 'عبارت‌های مشترک همان جفت شاعر', precision: 0 },
        evidence: { label: 'نوع شاهد', unit: 'ردهٔ متنی', denominator: 'ترکیب شاهدهای همان پیوند', precision: 0 },
      },
      force: { repulsion: 320, edgeLength: [100, 220], gravity: 0.055 },
      circular: { rotateLabel: true },
      data: names.map((name) => ({ name, value: [stats[name].in + stats[name].out, stats[name].century], century: stats[name].century, symbolSize: 32 + (stats[name].in + stats[name].out) * 6 })),
      links: chosen.map((e) => ({
        source: e.source,
        target: e.target,
        score: e.score,
        phrases: e.phrases,
        lexical: e.lexical,
        topic: e.topic,
        evidence: e.evidence,
        lineStyle: {
          width: edgeWidth(e.score),
          opacity: .76,
          curveness: .12,
          color: evidenceColor[e.evidence] || evidenceColor['محدود'],
          type: e.evidence === 'بسیار قوی' ? 'solid' : e.evidence === 'قابل توجه' ? 'dashed' : 'dotted',
        },
      })),
      edgeSymbol: ['none', 'arrow'], edgeSymbolSize: [0, 11],
      label: { show: true, fontFamily: 'Vazirmatn', color: dark ? '#f6efe0' : '#233b38', fontSize: 11 },
      emphasis: { focus: 'adjacency', lineStyle: { opacity: 1, width: 5 } },
    }],
  };
}

export function intertextScatterOption(edges, dark = false) {
  return {
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.data.name}</b><br/>شباهت واژگانی: ${faNumber(p.data.value[0], { maximumFractionDigits: 3 })}<br/>شباهت موضوعی: ${faNumber(p.data.value[1], { maximumFractionDigits: 3 })}<br/>پنج‌واژه: ${faNumber(p.data.phrases)}` },
    grid: { left: 55, right: 26, top: 30, bottom: 52, containLabel: true },
    xAxis: { type: 'value', name: 'شباهت واژگانی', min: .18, max: .47, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    yAxis: { type: 'value', name: 'شباهت موضوعی', min: .86, max: 1, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    visualMap: { show: false, min: 0, max: 12, dimension: 2, inRange: { color: ['#d29d35', '#9f2f38'] } },
    series: [{
      type: 'scatter',
      tableDimensions: [
        { label: 'شباهت واژگانی', unit: 'امتیاز ۰ تا ۱', denominator: 'بردارهای واژگانی همان جفت شاعر', precision: 3 },
        { label: 'شباهت موضوعی', unit: 'امتیاز ۰ تا ۱', denominator: 'بردارهای موضوعی همان جفت شاعر', precision: 3 },
        { label: 'قدرت عبارت مشترک', unit: 'z-score', denominator: 'عبارت‌های پنج‌واژه‌ای همان جفت شاعر', precision: 3 },
      ],
      data: edges.map((e) => ({ name: `${e.source} ← ${e.target}`, value: [e.lexical, e.topic, Math.min(e.phraseZ, 12)], phrases: e.phrases })),
      symbolSize: (v, p) => 12 + Math.sqrt(p.data.phrases) * 5,
      emphasis: { label: { show: true, formatter: (p) => p.name, position: 'top', fontFamily: 'Vazirmatn', color: dark ? '#fff' : '#263b38' } },
    }],
  };
}

export function rankingBarOption(items, valueKey, dark = false, color = '#0f766e') {
  const data = [...items].sort((a, b) => a[valueKey] - b[valueKey]).slice(-12);
  return {
    color: [color],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.name}</b><br/>امتیاز: ${faNumber(p.value, { maximumFractionDigits: 4 })}` },
    grid: { left: 30, right: 28, top: 18, bottom: 26, containLabel: true },
    xAxis: { type: 'value', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    yAxis: { type: 'category', data: data.map((d) => d.name), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, width: 130, overflow: 'truncate' } },
    series: [{ type: 'bar', data: data.map((d) => d[valueKey]), barMaxWidth: 20, itemStyle: { borderRadius: [0, 8, 8, 0] }, label: { show: true, position: 'right', formatter: (p) => faNumber(p.value, { maximumFractionDigits: 3 }), fontFamily: 'Vazirmatn', color: dark ? '#dcebe8' : '#4f5e5b' } }],
  };
}

export function centuryHeatmapOption(model, dark = false) {
  const labels = model.labels;
  const data = [];
  model.confusionMatrix.forEach((row, i) => row.forEach((v, j) => data.push([j, i, v])));
  return {
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `سده واقعی ${faNumber(labels[p.value[1]])}<br/>پیش‌بینی ${faNumber(labels[p.value[0]])}<br/>نسبت: ${faPercent(p.value[2] * 100)}` },
    grid: { left: 70, right: 20, top: 40, bottom: 80, containLabel: true },
    xAxis: { type: 'category', data: labels, name: 'سده پیش‌بینی‌شده (میلادی)', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'category', data: labels, name: 'سده واقعی', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    visualMap: { min: 0, max: .9, calculable: true, orient: 'horizontal', left: 'center', bottom: 8, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#dce8e5' : '#53605e' }, inRange: { color: dark ? ['#123e3b','#2c7f77','#e0bd68'] : ['#f4ead4','#62a6a0','#0b5a55'] } },
    series: [{ type: 'heatmap', data, tableUnit: 'درصد', tableScale: 100, tablePrecision: 1, tableDenominator: 'همهٔ نمونه‌های سدهٔ واقعی در آزمون', label: { show: true, formatter: (p) => p.value[2] >= .1 ? faNumber(p.value[2], { maximumFractionDigits: 2 }) : '', fontFamily: 'Vazirmatn', color: dark ? '#fff' : '#203230', fontSize: 9 }, emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.35)' } } }],
  };
}

export function recallOption(model, dark = false) {
  return {
    color: ['#315ba8'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `سده ${faNumber(p.name)}: ${faPercent(p.value * 100)}` },
    grid: { left: 48, right: 24, top: 26, bottom: 48, containLabel: true },
    xAxis: { type: 'category', data: model.labels, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', min: 0, max: 1, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => `${faNumber(v * 100)}٪` } },
    series: [{ type: 'bar', name: 'بازیابی', data: model.recall, tableUnit: 'درصد', tableScale: 100, tablePrecision: 1, tableDenominator: 'همهٔ نمونه‌های همان سده در آزمون', barMaxWidth: 30, itemStyle: { borderRadius: [8,8,0,0] }, markLine: { symbol: 'none', lineStyle: { type: 'dashed', color: '#9f2f38' }, data: [{ yAxis: model.benchmark.meanRecall, name: 'میانگین' }], label: { fontFamily: 'Vazirmatn', formatter: 'میانگین' } } }],
  };
}

export function evaluationOption(designs, dark = false) {
  return {
    color: ['#9f2f38','#0f766e'],
    tooltip: { ...baseTooltip(dark), formatter: (p) => `${p.marker}${p.seriesName}: ${faNumber(p.value)}` },
    legend: { top: 0, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#e4efed' : '#4e5e5b' } },
    grid: { left: 42, right: 24, top: 50, bottom: 75, containLabel: true },
    xAxis: { type: 'category', data: designs.map((d) => d.name), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, interval: 0, rotate: 15 } },
    yAxis: { type: 'value', max: 100, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    series: [
      { name: 'ریسک نشت', type: 'bar', data: designs.map((d) => d.leakage), barMaxWidth: 28, itemStyle: { borderRadius: [7,7,0,0] } },
      { name: 'اعتبار تاریخی', type: 'bar', data: designs.map((d) => d.validity), barMaxWidth: 28, itemStyle: { borderRadius: [7,7,0,0] } },
    ],
  };
}

export function stylometryPcaOption(profiles, dark = false) {
  return {
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.data.name}</b><br/>سده ${faNumber(p.data.century)}<br/>تنوع واژگانی: ${faNumber(p.data.uniqueRatio, { maximumFractionDigits: 2 })}` },
    grid: { left: 52, right: 28, top: 32, bottom: 50, containLabel: true },
    xAxis: { type: 'value', name: 'مولفه نخست', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 1 }) } },
    yAxis: { type: 'value', name: 'مولفه دوم', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 1 }) } },
    visualMap: { min: 3, max: 15, dimension: 2, orient: 'horizontal', left: 'center', bottom: 0, text: ['جدیدتر','کهن‌تر'], textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#dce8e5' : '#596663' }, inRange: { color: ['#d4a23d','#0f766e','#315ba8','#9f2f38'] } },
    series: [{
      type: 'scatter',
      tableDimensions: [
        { label: 'مؤلفه نخست', unit: 'امتیاز مؤلفه اصلی', denominator: 'پروفایل ویژگی‌های سبکی شاعر', precision: 3 },
        { label: 'مؤلفه دوم', unit: 'امتیاز مؤلفه اصلی', denominator: 'پروفایل ویژگی‌های سبکی شاعر', precision: 3 },
        { label: 'سدهٔ منتسب', unit: 'سده هجری', denominator: 'برچسب انتسابی شاعر', precision: 0 },
      ],
      data: profiles.map((d) => ({ name: d.poet, value: [d.pc1, d.pc2, d.century], century: d.century, uniqueRatio: d.uniqueRatio })),
      symbolSize: 12,
      emphasis: { scale: 1.7, label: { show: true, formatter: (p) => p.name, position: 'top', fontFamily: 'Vazirmatn', color: dark ? '#fff' : '#203735' } },
    }],
  };
}

export function classifierOption(metrics, dark = false) {
  const vals = [metrics.accuracy * 100, metrics.macro_f1 * 100, metrics.majority * 100];
  return {
    color: ['#0f766e','#315ba8','#b8a98d'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `${p.name}: ${faPercent(p.value)}` },
    grid: { left: 42, right: 24, top: 25, bottom: 50, containLabel: true },
    xAxis: { type: 'category', data: ['دقت','ماکرو اف‌یک','خط مبنا'], ...axis(dark) },
    yAxis: { type: 'value', max: 75, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => `${faNumber(v)}٪` } },
    series: [{ type: 'bar', data: vals.map((v, i) => ({ value: v, itemStyle: { color: ['#0f766e','#315ba8','#b8a98d'][i] } })), barMaxWidth: 52, itemStyle: { borderRadius: [10,10,0,0] }, label: { show: true, position: 'top', formatter: (p) => faPercent(p.value), fontFamily: 'Vazirmatn', color: dark ? '#e7f0ee' : '#354744' } }],
  };
}

export function nearestOption(items, dark = false) {
  const data = [...items].slice(0, 12).reverse();
  return {
    color: ['#b9862d'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.data.poet}</b> و <b>${p.data.nearest}</b><br/>شباهت: ${faPercent(p.value * 100, 1)}<br/>سده‌های ${faNumber(p.data.century)} و ${faNumber(p.data.nearestCentury)}` },
    grid: { left: 24, right: 42, top: 22, bottom: 30, containLabel: true },
    xAxis: { type: 'value', min: .8, max: 1, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    yAxis: { type: 'category', data: data.map((d) => `${d.poet} — ${d.nearest}`), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, width: 210, overflow: 'truncate' } },
    series: [{ type: 'bar', data: data.map((d) => ({ value: d.similarity, ...d })), barMaxWidth: 18, itemStyle: { borderRadius: [0,8,8,0] } }],
  };
}

export function dispersionOption(items, dark = false) {
  const data = [...items].slice(0, 14).reverse();
  return {
    color: ['#9f2f38'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.name}</b><br/>پراکندگی درونی: ${faNumber(p.value, { maximumFractionDigits: 3 })}<br/>متن: ${faNumber(p.data.texts)}<br/>دورافتاده‌های یک درصد: ${faNumber(p.data.topOnePercent)}` },
    grid: { left: 24, right: 45, top: 22, bottom: 30, containLabel: true },
    xAxis: { type: 'value', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 2 }) } },
    yAxis: { type: 'category', data: data.map((d) => d.poet), ...axis(dark) },
    series: [{ type: 'bar', data: data.map((d) => ({ value: d.iqr, texts: d.texts, topOnePercent: d.topOnePercent })), barMaxWidth: 18, itemStyle: { borderRadius: [0,8,8,0] } }],
  };
}

export function reasonDonutOption(reasonCounts, dark = false) {
  const map = {
    'بلندی نامعمول':'بلندی نامعمول',
    'کوتاهی نامعمول':'کوتاهی نامعمول',
    'واژگان/ساختار دور از مرکز شاعر':'واژگان یا ساختار متفاوت',
  };
  return {
    color: ['#0f766e','#d29d35','#9f2f38','#315ba8','#7c3aed'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `${p.name}: ${faNumber(p.value)} مورد (${faPercent(p.percent)})` },
    legend: { bottom: 0, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#dce9e7' : '#52615e' } },
    series: [{ type: 'pie', radius: ['42%','70%'], center: ['50%','44%'], itemStyle: { borderRadius: 8, borderColor: dark ? '#0a3331' : '#fbf6eb', borderWidth: 4 }, label: { fontFamily: 'Vazirmatn', color: dark ? '#fff' : '#384845', formatter: (p) => `${p.name}\n${faNumber(p.value)}` }, data: Object.entries(reasonCounts).map(([name, value]) => ({ name: map[name] || name, value })) }],
  };
}

export function geographyCentersOption(centers, dark = false) {
  const minWords = Math.min(...centers.map((d) => d.words));
  const maxWords = Math.max(...centers.map((d) => d.words));
  const size = (words) => 16 + ((Math.sqrt(words) - Math.sqrt(minWords)) / (Math.sqrt(maxWords) - Math.sqrt(minWords))) * 34;
  return {
    color: ['#0e7490'],
    tooltip: {
      ...baseTooltip(dark),
      trigger: 'item',
      formatter: (p) => `<b>${p.data.name}</b><br/>${p.data.region}<br/>${faNumber(p.data.poets)} شاعر<br/>${faNumber(p.data.poems)} متن<br/>${faNumber(p.data.words)} واژه`,
    },
    grid: { left: 48, right: 34, top: 32, bottom: 50, containLabel: true },
    xAxis: { type: 'value', min: 28, max: 82, name: 'طول جغرافیایی تقریبی', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', min: 26, max: 43, name: 'عرض جغرافیایی تقریبی', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    series: [{
      type: 'scatter',
      tableDimensions: [
        { label: 'طول جغرافیایی تقریبی', unit: 'درجهٔ جغرافیایی', denominator: 'مختصات تقریبی کانون فعالیت', precision: 3 },
        { label: 'عرض جغرافیایی تقریبی', unit: 'درجهٔ جغرافیایی', denominator: 'مختصات تقریبی کانون فعالیت', precision: 3 },
      ],
      data: centers.map((d) => ({ name: d.city, value: [d.lon, d.lat], ...d, symbolSize: size(d.words) })),
      symbolSize: (value, params) => params.data.symbolSize,
      itemStyle: { opacity: .78, borderColor: dark ? '#d9f1f5' : '#fff', borderWidth: 2 },
      label: { show: true, position: 'top', formatter: (p) => p.name, fontFamily: 'Vazirmatn', fontSize: 11, color: dark ? '#ecf8fa' : '#29494f' },
      emphasis: { scale: 1.15, itemStyle: { opacity: 1 } },
    }],
  };
}

export function regionFlowOption(flows, dark = false) {
  const names = [...new Set(flows.flatMap((d) => [d.origin, d.center]))];
  const volumes = Object.fromEntries(names.map((name) => [name, 0]));
  flows.forEach((d) => { volumes[d.origin] += d.poets; volumes[d.center] += d.poets; });
  return {
    color: palette,
    tooltip: {
      ...baseTooltip(dark),
      trigger: 'item',
      formatter: (p) => p.dataType === 'edge'
        ? `<b>${p.data.source}</b><br/>به ${p.data.target}<br/>${faNumber(p.data.value)} شاعر`
        : `<b>${p.name}</b><br/>حجم پیوندهای بین‌منطقه‌ای: ${faNumber(volumes[p.name])}`,
    },
    series: [{
      type: 'graph',
      tableGraph: {
        node: { label: 'حجم پیوندهای منطقه', unit: 'شاعر', denominator: 'شاعران پیوندهای بین‌منطقه‌ای', precision: 0 },
        link: { label: 'شاعران جابه‌جاشده', unit: 'شاعر', denominator: 'مسیر همان دو منطقه', precision: 0 },
      },
      layout: 'circular',
      roam: true,
      circular: { rotateLabel: false },
      data: names.map((name, index) => ({
        name,
        value: volumes[name],
        symbolSize: 34 + volumes[name] * 5,
        itemStyle: { color: palette[index % palette.length] },
      })),
      links: flows.map((d) => ({
        source: d.origin,
        target: d.center,
        value: d.poets,
        lineStyle: { width: 1.8 + d.poets * 2.2, opacity: .65, curveness: .2 },
      })),
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 10],
      label: { show: true, formatter: (p) => p.name.replace(' و ', '\nو '), fontFamily: 'Vazirmatn', fontSize: 10, color: dark ? '#f5f0e6' : '#29413e' },
      lineStyle: { color: 'source' },
      emphasis: { focus: 'adjacency', lineStyle: { opacity: 1 } },
    }],
  };
}

export function periodMobilityOption(periods, dark = false) {
  return {
    color: ['#0e7490', '#b9862d'],
    tooltip: {
      ...baseTooltip(dark),
      formatter: (items) => {
        const row = periods[items[0]?.dataIndex];
        return `<b>${row.period}</b><br/>${faNumber(row.mobile)} شاعر جابه‌جا از ${faNumber(row.poets)} شاعر<br/>نرخ: ${faPercent(row.mobileRate * 100)}<br/>میانه مسیر: ${faNumber(row.medianRouteKm, { maximumFractionDigits: 0 })} کیلومتر`;
      },
    },
    legend: { top: 0, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#dceae8' : '#52605e' } },
    grid: { left: 48, right: 52, top: 50, bottom: 84, containLabel: true },
    xAxis: { type: 'category', data: periods.map((d) => d.period), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, interval: 0, rotate: 16 } },
    yAxis: [
      { type: 'value', name: 'نرخ جابه‌جایی', max: .7, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => `${faNumber(v * 100)}٪` } },
      { type: 'value', name: 'کیلومتر', ...axis(dark), splitLine: { show: false }, axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    ],
    series: [
      { name: 'نرخ جابه‌جایی', type: 'bar', data: periods.map((d) => d.mobileRate), tableUnit: 'درصد', tableScale: 100, tablePrecision: 1, tableDenominator: 'همهٔ شاعران همان دوره', barMaxWidth: 46, itemStyle: { borderRadius: [9, 9, 0, 0] } },
      { name: 'میانه طول مسیر', type: 'line', yAxisIndex: 1, data: periods.map((d) => Math.round(d.medianRouteKm)), tableUnit: 'کیلومتر', tablePrecision: 0, tableDenominator: 'شاعران جابه‌جاشدهٔ دارای مسیر تقریبی', symbolSize: 10, lineStyle: { width: 4 } },
    ],
  };
}

export function lexicalLifecycleOption(categories, dark = false) {
  return {
    color: ['#0f766e', '#9f2f38', '#315ba8', '#7c3aed', '#b9862d', '#4d7c0f'],
    tooltip: {
      ...baseTooltip(dark),
      trigger: 'item',
      formatter: (p) => `<b>${p.name}</b><br/>${faNumber(p.value)} واژه (${faPercent(p.data.share * 100)})<br/>میانه دامنه فعالیت: ${faNumber(p.data.medianSpan)} سده<br/>میانه نیمه‌عمر: ${faNumber(p.data.medianHalfLife, { maximumFractionDigits: 2 })} سده`,
    },
    legend: { type: 'scroll', bottom: 0, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#dce9e7' : '#52615e' } },
    series: [{
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['50%', '44%'],
      minAngle: 2,
      itemStyle: { borderRadius: 8, borderColor: dark ? '#0a3331' : '#fbf6eb', borderWidth: 4 },
      label: { fontFamily: 'Vazirmatn', color: dark ? '#fff' : '#384845', formatter: (p) => p.percent >= 4 ? `${p.name}\n${faNumber(p.value)}` : '' },
      data: categories.map((d) => ({ name: d.name, value: d.count, ...d })),
    }],
  };
}

export function halfLifeOption(halfLife, dark = false) {
  const values = [
    { name: 'چارک یکم', value: halfLife.q1Centuries, color: '#315ba8' },
    { name: 'میانه', value: halfLife.medianCenturies, color: '#0f766e' },
    { name: 'چارک سوم', value: halfLife.q3Centuries, color: '#b9862d' },
  ];
  return {
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.name}</b><br/>${faNumber(p.value, { maximumFractionDigits: 2 })} سده پس از اوج` },
    grid: { left: 42, right: 28, top: 28, bottom: 48, containLabel: true },
    xAxis: { type: 'category', data: values.map((d) => d.name), ...axis(dark) },
    yAxis: { type: 'value', name: 'سده', max: 2.2, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 1 }) } },
    series: [{
      type: 'bar',
      barMaxWidth: 72,
      data: values.map((d) => ({ value: d.value, itemStyle: { color: d.color, borderRadius: [10, 10, 0, 0] } })),
      label: { show: true, position: 'top', formatter: (p) => faNumber(p.value, { maximumFractionDigits: 2 }), fontFamily: 'Vazirmatn', color: dark ? '#e8f1ef' : '#354744' },
    }],
  };
}

export function attributionDistributionOption(items, dark = false, color = '#7c3aed') {
  const data = [...items].sort((a, b) => a.value - b.value);
  const max = Math.max(...data.map((d) => d.value), 1);
  return {
    color: [color],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.data.name}</b><br/>${faNumber(p.value)} رکورد<br/>${p.data.note || ''}` },
    grid: { left: 26, right: 42, top: 20, bottom: 24, containLabel: true },
    xAxis: { type: 'value', max: Math.ceil(max * 1.12), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'category', data: data.map((d) => d.name), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, width: 165, overflow: 'truncate' } },
    series: [{ type: 'bar', data: data.map((d) => ({ ...d, value: d.value })), barMaxWidth: 24, itemStyle: { borderRadius: [0, 8, 8, 0] }, label: { show: true, position: 'right', formatter: (p) => faNumber(p.value), fontFamily: 'Vazirmatn', color: dark ? '#e8f0ee' : '#3d4d4a' } }],
  };
}

export function conceptProfileOption(items, dark = false) {
  const data = [...items].slice(0, 7).sort((a, b) => a.ratePer10k - b.ratePer10k);
  return {
    color: ['#0f766e'],
    tooltip: { ...baseTooltip(dark), trigger: 'item', formatter: (p) => `<b>${p.data.name}</b><br/>${faNumber(p.value, { maximumFractionDigits: 1 })} رخداد در ده‌هزار واژه<br/>حضور در ${faPercent(p.data.documentShare)} متن` },
    grid: { left: 26, right: 48, top: 20, bottom: 24, containLabel: true },
    xAxis: { type: 'value', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'category', data: data.map((d) => d.name), ...axis(dark), axisLabel: { ...axis(dark).axisLabel, width: 180, overflow: 'truncate' } },
    series: [{ type: 'bar', data: data.map((d) => ({ ...d, value: d.ratePer10k })), barMaxWidth: 21, itemStyle: { borderRadius: [0, 8, 8, 0] }, label: { show: true, position: 'right', formatter: (p) => faNumber(p.value, { maximumFractionDigits: 1 }), fontFamily: 'Vazirmatn', color: dark ? '#e8f0ee' : '#3d4d4a' } }],
  };
}

export function systemConceptTrendOption(systemTrends, dark = false) {
  const concepts = systemTrends.concepts;
  const series = systemTrends.series;
  return {
    color: palette,
    tooltip: { ...baseTooltip(dark), trigger: 'axis', formatter: (params) => [`<b>سده ${faNumber(params[0]?.axisValue)}</b>`, ...params.map((p) => `${p.marker}${p.seriesName}: ${faNumber(p.value, { maximumFractionDigits: 1 })}`)].join('<br/>') },
    legend: { type: 'scroll', top: 0, textStyle: { fontFamily: 'Vazirmatn', color: dark ? '#dce8e5' : '#53605e', fontSize: 10 } },
    grid: { left: 52, right: 25, top: 72, bottom: 44, containLabel: true },
    xAxis: { type: 'category', data: series.map((d) => d.century), name: 'سده هجری', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', name: 'نرخ شاعرمتوازن در ده‌هزار واژه', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    series: concepts.map((name) => ({ name, type: 'line', smooth: .25, showSymbol: false, data: series.map((d) => d[name]), lineStyle: { width: 2.2 }, emphasis: { focus: 'series' } })),
  };
}

export function publicQuestionOption(question, dark = false) {
  const chart = question.chart;
  const legendText = { fontFamily: 'Vazirmatn', color: dark ? '#dce8e5' : '#53605e', fontSize: 11 };

  if (chart.kind === 'ranking' || chart.kind === 'ranking-poets') {
    const items = [...chart.items].slice(0, 10).reverse();
    const isPoetReach = chart.kind === 'ranking-poets';
    return {
      color: ['#9f2f38'],
      tooltip: {
        ...baseTooltip(dark),
        trigger: 'item',
        formatter: (p) => {
          const item = p.data;
          const main = isPoetReach
            ? `${faNumber(item.poets)} شاعر`
            : `${faNumber(item.value, { maximumFractionDigits: 1 })} ${chart.yLabel}`;
          const details = [];
          if (isPoetReach) details.push(`${faNumber(item.value)} رخداد`);
          else if (typeof item.poets === 'number') details.push(`در آثار ${faNumber(item.poets)} شاعر`);
          if (typeof item.hits === 'number') details.push(`${faNumber(item.hits)} رخداد واقعی`);
          if (typeof item.words === 'number') details.push(`از ${faNumber(item.words)} واژه`);
          return `<b>${item.name}</b><br/>${main}${details.length ? `<br/>${details.join('<br/>')}` : ''}`;
        },
      },
      grid: { left: 28, right: 56, top: 24, bottom: 35, containLabel: true },
      xAxis: {
        type: 'value', name: chart.yLabel, ...axis(dark),
        axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 1 }) },
      },
      yAxis: {
        type: 'category', data: items.map((item) => item.name), ...axis(dark),
        axisLabel: { ...axis(dark).axisLabel, width: 150, overflow: 'truncate' },
      },
      series: [{
        type: 'bar', barMaxWidth: 24,
        data: items.map((item) => ({ ...item, value: isPoetReach ? item.poets : item.value })),
        itemStyle: { borderRadius: [0, 8, 8, 0] },
        label: {
          show: true, position: 'right', fontFamily: 'Vazirmatn', color: dark ? '#e8f0ee' : '#3d4d4a',
          formatter: (p) => faNumber(p.value, { maximumFractionDigits: 1 }),
        },
      }],
    };
  }

  if (chart.kind === 'grouped') {
    return {
      color: ['#315ba8', '#b9862d'],
      tooltip: {
        ...baseTooltip(dark), trigger: 'axis',
        formatter: (params) => [`<b>${params[0]?.axisValue}</b>`, ...params.map((p) => `${p.marker}${p.seriesName}: ${faNumber(p.value, { maximumFractionDigits: 1 })}`)].join('<br/>'),
      },
      legend: { top: 0, textStyle: legendText },
      grid: { left: 52, right: 28, top: 54, bottom: 64, containLabel: true },
      xAxis: { type: 'category', data: chart.labels, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, interval: 0, rotate: 12 } },
      yAxis: { type: 'value', name: chart.yLabel, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 1 }) } },
      series: chart.series.map((series) => ({ name: series.name, type: 'bar', data: series.values, barMaxWidth: 38, itemStyle: { borderRadius: [7, 7, 0, 0] } })),
    };
  }

  return {
    color: palette,
    tooltip: {
      ...baseTooltip(dark), trigger: 'axis',
      formatter: (params) => [`<b>سده ${faNumber(params[0]?.axisValue)}</b>`, ...params.map((p) => `${p.marker}${p.seriesName}: ${faNumber(p.value, { maximumFractionDigits: 1 })}`)].join('<br/>'),
    },
    legend: { type: 'scroll', top: 0, textStyle: legendText },
    grid: { left: 54, right: 28, top: 56, bottom: 45, containLabel: true },
    xAxis: { type: 'category', data: chart.labels, name: 'سده هجری', ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v) } },
    yAxis: { type: 'value', name: chart.yLabel, ...axis(dark), axisLabel: { ...axis(dark).axisLabel, formatter: (v) => faNumber(v, { maximumFractionDigits: 1 }) } },
    series: chart.series.map((series) => ({ name: series.name, type: 'line', data: series.values, smooth: .24, showSymbol: false, lineStyle: { width: 3 }, emphasis: { focus: 'series' } })),
  };
}
