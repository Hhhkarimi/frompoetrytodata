import { PUBLICATION } from '../publication/publication.js';

const REQUIRED_FIELDS = [
  'id',
  'label',
  'definition',
  'unit',
  'denominator',
  'precision',
  'source',
  'qualification',
  'values',
];

function hasValue(record, field) {
  if (field === 'precision') return Number.isInteger(record[field]) && record[field] >= 0;
  return record[field] !== undefined && record[field] !== null && record[field] !== '';
}

export function createPublishedEvidence(record) {
  const missing = REQUIRED_FIELDS.filter((field) => !hasValue(record, field));
  if (missing.length > 0) {
    throw new TypeError(`Published evidence is missing: ${missing.join(', ')}`);
  }

  return Object.freeze({
    schemaVersion: 1,
    ...record,
    source: Object.freeze({ ...record.source }),
  });
}

function firstAxis(axis) {
  return Array.isArray(axis) ? axis[0] : axis;
}

function numericValues(value, output = []) {
  if (typeof value === 'number' && Number.isFinite(value)) output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => numericValues(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => numericValues(item, output));
  return output;
}

function decimalPlaces(value) {
  if (Number.isInteger(value)) return 0;
  return Math.min(4, String(value).split('.')[1]?.length ?? 0);
}

export function inferEvidenceMetadata(option = {}) {
  const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  const xAxis = firstAxis(option.xAxis);
  const yAxis = firstAxis(option.yAxis);
  const yAxes = Array.isArray(option.yAxis) ? option.yAxis : [yAxis];
  const seriesDefinitions = series.map((item, index) => {
    const axis = yAxes[item.yAxisIndex || 0] || yAxis;
    const unit = item.tableUnit || axis?.name || xAxis?.name || item.name || 'مقدار محاسباتی';
    const values = numericValues([item.data || [], item.links || item.edges || []]);
    const precision = item.tablePrecision
      ?? values.reduce((maximum, value) => Math.max(maximum, decimalPlaces(value)), 0);
    let denominator = item.tableDenominator || 'همهٔ رکوردهای منبع در فیلتر فعال';
    if (!item.tableDenominator && item.type === 'pie') denominator = 'مجموع دسته‌های نمایش‌داده‌شده';
    else if (!item.tableDenominator && (item.type === 'graph' || item.type === 'sankey')) denominator = 'گره‌ها و پیوندهای عبورکرده از آستانهٔ فعال';
    else if (!item.tableDenominator && item.type === 'scatter') denominator = 'هر رکورد یا جفتِ نمایش‌داده‌شده';
    else if (!item.tableDenominator && /درصد|نرخ|سهم/.test(unit)) denominator = 'همهٔ رکوردهای گروه مقایسه در فیلتر فعال';
    return {
      id: item.id || item.name || `series-${index + 1}`,
      label: item.name || `مجموعه ${index + 1}`,
      unit,
      denominator,
      precision,
    };
  });
  const units = [...new Set(seriesDefinitions.map((item) => item.unit))];
  const denominators = [...new Set(seriesDefinitions.map((item) => item.denominator))];

  return {
    unit: units.length === 1 ? units[0] : 'چندواحدی؛ برای هر مجموعه در جدول',
    denominator: denominators.length === 1 ? denominators[0] : 'متفاوت؛ برای هر مجموعه در جدول',
    precision: seriesDefinitions.reduce((maximum, item) => Math.max(maximum, item.precision), 0),
    seriesDefinitions,
  };
}

export function evidenceFromChart({
  id,
  label,
  definition,
  qualification,
  values,
  unit,
  denominator,
  precision,
  dataset = 'atlas-data',
}) {
  const inferred = inferEvidenceMetadata(values);
  return createPublishedEvidence({
    id,
    label,
    definition,
    unit: unit || inferred.unit,
    denominator: denominator || inferred.denominator,
    precision: precision ?? inferred.precision,
    source: {
      dataset,
      publicationVersion: PUBLICATION.version,
    },
    qualification,
    values,
    seriesDefinitions: inferred.seriesDefinitions,
  });
}
