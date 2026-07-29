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
  else if (value && typeof value === 'object') numericValues(value.value, output);
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
  const unit = yAxis?.name || xAxis?.name || series[0]?.name || 'مقدار محاسباتی';
  const types = new Set(series.map((item) => item.type));
  const values = series.flatMap((item) => numericValues(item.data || item.links || []));
  const precision = values.reduce((maximum, value) => Math.max(maximum, decimalPlaces(value)), 0);

  let denominator = 'همهٔ رکوردهای منبع در فیلتر فعال';
  if (types.has('pie')) denominator = 'مجموع دسته‌های نمایش‌داده‌شده';
  else if (types.has('graph') || types.has('sankey')) denominator = 'گره‌ها و پیوندهای عبورکرده از آستانهٔ فعال';
  else if (types.has('scatter')) denominator = 'هر رکورد یا جفتِ نمایش‌داده‌شده';
  else if (/درصد|نرخ|سهم/.test(unit)) denominator = 'همهٔ رکوردهای گروه مقایسه در فیلتر فعال';

  return { unit, denominator, precision };
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
  });
}
