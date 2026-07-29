function firstAxis(axis) {
  return Array.isArray(axis) ? axis[0] : axis;
}

function displayValue(value) {
  if (Array.isArray(value)) return value.join('، ');
  if (value && typeof value === 'object') return displayValue(value.value);
  return value;
}

function categoryLabel(axis, item, index) {
  if (item && typeof item === 'object' && !Array.isArray(item) && item.name) return item.name;
  return axis?.data?.[index] ?? index + 1;
}

/** @param {any} option */
export function chartTableRows(option = {}) {
  const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  const xAxis = firstAxis(option.xAxis);
  const yAxis = firstAxis(option.yAxis);
  const categoryAxis = xAxis?.type === 'category' ? xAxis : yAxis?.type === 'category' ? yAxis : xAxis;
  const rows = [];

  for (const itemSeries of series) {
    const seriesName = itemSeries.name || 'مقدار';

    if (itemSeries.type === 'graph' || itemSeries.type === 'sankey') {
      for (const node of itemSeries.data || itemSeries.nodes || []) {
        rows.push({ category: node.name || 'گره', series: 'گره', value: displayValue(node.value ?? '') });
      }
      for (const link of itemSeries.links || itemSeries.edges || []) {
        const linkLabel = `${link.source} ← ${link.target}`;
        rows.push({
          category: linkLabel,
          series: 'امتیاز پیوند',
          value: displayValue(link.value ?? link.score ?? ''),
        });
        if (link.phrases !== undefined) {
          rows.push({
            category: linkLabel,
            series: 'تعداد عبارت مشترک',
            value: displayValue(link.phrases),
          });
        }
      }
      continue;
    }

    for (const [index, item] of (itemSeries.data || []).entries()) {
      const value = item && typeof item === 'object' && !Array.isArray(item) ? item.value : item;

      if (itemSeries.type === 'heatmap' && Array.isArray(value)) {
        rows.push({
          category: `${xAxis?.data?.[value[0]] ?? value[0]} / ${yAxis?.data?.[value[1]] ?? value[1]}`,
          series: seriesName,
          value: value[2],
        });
        continue;
      }

      if (itemSeries.type === 'scatter' && Array.isArray(value)) {
        const dimensionLabels = [
          xAxis?.name || itemSeries.dimensions?.[0] || 'محور افقی',
          yAxis?.name || itemSeries.dimensions?.[1] || 'محور عمودی',
          itemSeries.dimensions?.[2] || 'اندازه نشانه',
        ];
        const label = item?.name || categoryLabel(categoryAxis, item, index);
        value.forEach((dimensionValue, dimensionIndex) => {
          rows.push({
            category: label,
            series: dimensionLabels[dimensionIndex] || `بعد ${dimensionIndex + 1}`,
            value: displayValue(dimensionValue),
          });
        });
        continue;
      }

      rows.push({
        category: categoryLabel(categoryAxis, item, index),
        series: seriesName,
        value: displayValue(value),
      });
    }
  }

  return rows;
}
