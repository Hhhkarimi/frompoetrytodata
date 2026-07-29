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

function rowWithMetadata(row, series) {
  const scale = Number.isFinite(series.tableScale) ? series.tableScale : 1;
  const enriched = {
    ...row,
    value: typeof row.value === 'number' ? row.value * scale : row.value,
  };
  if (series.tableUnit) enriched.unit = series.tableUnit;
  if (series.tableDenominator) enriched.denominator = series.tableDenominator;
  if (Number.isInteger(series.tablePrecision)) enriched.precision = series.tablePrecision;
  return enriched;
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
      const graphMetadata = itemSeries.tableGraph || {};
      for (const node of itemSeries.data || itemSeries.nodes || []) {
        const nodeValue = node.value ?? '';
        if (nodeValue === '') continue;
        const dimensions = graphMetadata.nodeDimensions;
        if (Array.isArray(nodeValue) && dimensions) {
          nodeValue.forEach((value, index) => {
            const metadata = dimensions[index];
            if (!metadata) return;
            rows.push({
              category: node.name || 'گره',
              series: metadata.label,
              value: displayValue(value),
              unit: metadata.unit,
              denominator: metadata.denominator,
              precision: metadata.precision,
            });
          });
        } else {
          const metadata = graphMetadata.node || {};
          rows.push({
            category: node.name || 'گره',
            series: metadata.label || 'مقدار گره',
            value: displayValue(nodeValue),
            unit: metadata.unit || 'مقدار',
            denominator: metadata.denominator || 'گره‌های نمایش‌داده‌شده',
            precision: metadata.precision ?? 4,
          });
        }
      }
      for (const link of itemSeries.links || itemSeries.edges || []) {
        const linkLabel = `${link.source} ← ${link.target}`;
        const linkMetadata = graphMetadata.link || {};
        rows.push({
          category: linkLabel,
          series: linkMetadata.label || 'مقدار پیوند',
          value: displayValue(link.value ?? link.score ?? ''),
          unit: linkMetadata.unit || 'مقدار',
          denominator: linkMetadata.denominator || 'همان جفت گره',
          precision: linkMetadata.precision ?? 4,
        });
        if (link.phrases !== undefined) {
          const phraseMetadata = graphMetadata.phrases || {};
          rows.push({
            category: linkLabel,
            series: phraseMetadata.label || 'تعداد عبارت مشترک',
            value: displayValue(link.phrases),
            unit: phraseMetadata.unit || 'عبارت',
            denominator: phraseMetadata.denominator || 'همان جفت گره',
            precision: phraseMetadata.precision ?? 0,
          });
        }
        if (link.evidence) {
          const evidenceMetadata = graphMetadata.evidence || {};
          rows.push({
            category: linkLabel,
            series: evidenceMetadata.label || 'نوع شاهد',
            value: link.evidence,
            unit: evidenceMetadata.unit || 'ردهٔ متنی',
            denominator: evidenceMetadata.denominator || 'همان پیوند',
            precision: evidenceMetadata.precision ?? 0,
          });
        }
      }
      continue;
    }

    for (const [index, item] of (itemSeries.data || []).entries()) {
      const value = item && typeof item === 'object' && !Array.isArray(item) ? item.value : item;

      if (itemSeries.type === 'heatmap' && Array.isArray(value)) {
        rows.push(rowWithMetadata({
          category: `${xAxis?.data?.[value[0]] ?? value[0]} / ${yAxis?.data?.[value[1]] ?? value[1]}`,
          series: seriesName,
          value: value[2],
        }, itemSeries));
        continue;
      }

      if (itemSeries.type === 'scatter' && Array.isArray(value)) {
        const defaultDimensionLabels = [
          xAxis?.name || itemSeries.dimensions?.[0] || 'محور افقی',
          yAxis?.name || itemSeries.dimensions?.[1] || 'محور عمودی',
          itemSeries.dimensions?.[2] || 'اندازه نشانه',
        ];
        const label = item?.name || categoryLabel(categoryAxis, item, index);
        value.forEach((dimensionValue, dimensionIndex) => {
          const dimension = itemSeries.tableDimensions?.[dimensionIndex];
          const dimensionSeries = dimension ? {
            ...itemSeries,
            tableUnit: dimension.unit,
            tableDenominator: dimension.denominator,
            tablePrecision: dimension.precision,
            tableScale: dimension.scale,
          } : itemSeries;
          rows.push(rowWithMetadata({
            category: label,
            series: dimension?.label || defaultDimensionLabels[dimensionIndex] || `بعد ${dimensionIndex + 1}`,
            value: displayValue(dimensionValue),
          }, dimensionSeries));
        });
        continue;
      }

      rows.push(rowWithMetadata({
        category: categoryLabel(categoryAxis, item, index),
        series: seriesName,
        value: displayValue(value),
      }, itemSeries));
    }
  }

  return rows;
}
