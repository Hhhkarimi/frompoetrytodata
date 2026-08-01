import { canonicalPoetName, poetSlug } from '../entities/poet-identity.js';

const SCORE_FIELDS = Object.freeze([
  'symbolism_score',
  'imagery_score',
  'figurative_score',
  'music_score',
  'compression_score',
  'emotion_score',
  'structure_score',
  'novelty_score',
  'overall_score',
  'poet_percentile',
]);

const DIMENSION_WEIGHTS = Object.freeze({
  symbolism_score: 0.18,
  imagery_score: 0.14,
  figurative_score: 0.14,
  music_score: 0.14,
  compression_score: 0.12,
  emotion_score: 0.12,
  structure_score: 0.08,
  novelty_score: 0.08,
});

const DIMENSIONS = Object.freeze([
  ['symbolism', 'symbolism_score'],
  ['imagery', 'imagery_score'],
  ['figurative-language', 'figurative_score'],
  ['music', 'music_score'],
  ['semantic-compression', 'compression_score'],
  ['emotion', 'emotion_score'],
  ['structure', 'structure_score'],
  ['novelty', 'novelty_score'],
]);

const DIMENSION_LABELS = Object.freeze({
  symbolism: 'نمادپردازی',
  imagery: 'تصویرسازی',
  'figurative-language': 'زبان مجازی',
  music: 'موسیقی',
  'semantic-compression': 'فشردگی معنا',
  emotion: 'عمق عاطفی',
  structure: 'ساختار',
  novelty: 'تازگی بیان',
});

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const source = String(input).replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted && character === '"' && source[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...values] = rows;
  return values.map((valuesRow) => Object.fromEntries(
    headers.map((header, index) => [header, valuesRow[index] ?? '']),
  ));
}

function normalizeRecord(record) {
  const canonicalName = canonicalPoetName(record.poet_display);
  return Object.freeze({
    ...record,
    source_poet_display: record.poet_display,
    poet_display: canonicalName,
    poet_slug: poetSlug(canonicalName),
    century: Number(record.century),
    poet_rank: Number(record.poet_rank),
    id: Number(record.id),
    ...Object.fromEntries(SCORE_FIELDS.map((field) => [field, Number(record[field])])),
  });
}

function validateOverallScore(record) {
  const expected = Object.entries(DIMENSION_WEIGHTS).reduce(
    (sum, [field, weight]) => sum + record[field] * weight,
    0,
  );
  if (Math.abs(record.overall_score - expected) > 0.011) {
    throw new TypeError(`Computational aesthetics overall score mismatch for record ${record.id}`);
  }
}

export function buildComputationalAestheticsArtifact(csvText) {
  const records = parseCsv(csvText).map(normalizeRecord);
  const poetRecords = new Map();
  const poetRanks = new Set();

  for (const record of records) {
    validateOverallScore(record);
    const poetRankKey = `${record.poet_display}:${record.poet_rank}`;
    if (poetRanks.has(poetRankKey)) {
      throw new TypeError(`Computational aesthetics duplicate poet rank: ${poetRankKey}`);
    }
    poetRanks.add(poetRankKey);
    if (!poetRecords.has(record.poet_display)) poetRecords.set(record.poet_display, []);
    poetRecords.get(record.poet_display).push(record);
  }

  if (records.length !== 670) {
    throw new TypeError(`Computational aesthetics expected 670 records; received ${records.length}`);
  }
  if (poetRecords.size !== 67) {
    throw new TypeError(`Computational aesthetics expected 67 canonical poets; received ${poetRecords.size}`);
  }
  for (const [poetName, poetRows] of poetRecords) {
    const ranks = new Set(poetRows.map((record) => record.poet_rank));
    const hasCompleteRanks = poetRows.length === 10
      && Array.from({ length: 10 }, (_, index) => index + 1).every((rank) => ranks.has(rank));
    if (!hasCompleteRanks) {
      throw new TypeError(`Computational aesthetics expected ranks 1-10 for poet: ${poetName}`);
    }
  }

  return Object.freeze({
    schemaVersion: 1,
    id: 'computational-aesthetics',
    title: 'زیبایی‌شناسی محاسباتی شعر فارسی',
    corpus: Object.freeze({
      sourceTexts: 54524,
      scoredUniqueUnits: 676748,
      poets: 67,
      attributedCenturies: 13,
    }),
    dimensions: Object.freeze(DIMENSIONS.map(([id, field]) => Object.freeze({
      id,
      field,
      label: DIMENSION_LABELS[id],
      weight: DIMENSION_WEIGHTS[field],
      scale: Object.freeze([0, 100]),
    }))),
    provenance: Object.freeze({
      evaluator: 'GPT-5.6-sol',
      evaluatorAttribution: 'project-owner-supplied',
      humanScoring: false,
    }),
    records: Object.freeze(records),
    poets: Object.freeze([...poetRecords].map(([name, poetRows]) => {
      const dimensionMeans = Object.fromEntries(DIMENSIONS.map(([id, field]) => [
        id,
        poetRows.reduce((sum, record) => sum + record[field], 0) / poetRows.length,
      ]));
      const dominantDimension = DIMENSIONS.reduce(
        (selected, [id]) => dimensionMeans[id] > dimensionMeans[selected] ? id : selected,
        DIMENSIONS[0][0],
      );
      return Object.freeze({
        name,
        slug: poetSlug(name),
        century: poetRows[0].century,
        meanOverall: Number((
          poetRows.reduce((sum, record) => sum + record.overall_score, 0) / poetRows.length
        ).toFixed(2)),
        maxOverall: Math.max(...poetRows.map((record) => record.overall_score)),
        dominantDimension,
        dimensionMeans: Object.freeze(Object.fromEntries(
          Object.entries(dimensionMeans).map(([id, value]) => [id, Number(value.toFixed(1))]),
        )),
        records: Object.freeze(poetRows),
      });
    })),
  });
}
