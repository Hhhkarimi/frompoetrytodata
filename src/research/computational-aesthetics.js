import { createHash } from 'node:crypto';
import { canonicalPoetName, poetSlug, POET_ALIASES } from '../entities/poet-identity.js';
import { PUBLICATION } from '../publication/publication.js';

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

const REQUIRED_FIELDS = Object.freeze([
  'poet_display', 'century', 'poet_rank', 'id', 'book_title', 'poem_title',
  'hemistich1', 'hemistich2', ...SCORE_FIELDS,
]);

const FIELD_DESCRIPTIONS = Object.freeze({
  poet_display: 'برچسب شاعر در منبع', century: 'سدهٔ منتسب', poet_rank: 'رتبهٔ درون‌شاعر',
  id: 'شناسهٔ رکورد منبع', book_title: 'عنوان کتاب', poem_title: 'عنوان شعر',
  hemistich1: 'سطر یا مصراع نخست', hemistich2: 'سطر یا مصراع دوم',
  symbolism_score: 'امتیاز نمادپردازی', imagery_score: 'امتیاز تصویرسازی',
  figurative_score: 'امتیاز زبان مجازی', music_score: 'امتیاز موسیقی',
  compression_score: 'امتیاز فشردگی معنا', emotion_score: 'امتیاز عمق عاطفی',
  structure_score: 'امتیاز ساختار', novelty_score: 'امتیاز تازگی بیان',
  overall_score: 'جمع وزن‌دار هشت شاخص', poet_percentile: 'صدک رکورد در دادهٔ شاعر',
});

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

const DIMENSION_DEFINITIONS = Object.freeze({
  symbolism: 'شدت حضور نمادها و ظرفیت ارجاع فراتر از معنای مستقیم واژه‌ها در همان واحد دو‌سطری',
  imagery: 'وضوح و تراکم تصویرهای حسی و صحنه‌پردازی قابل تصور در همان واحد دو‌سطری',
  'figurative-language': 'شدت کاربرد تشبیه، استعاره، مجاز و دیگر جابه‌جایی‌های معنایی در همان واحد دو‌سطری',
  music: 'هماهنگی آوایی، تکرار واجی و ریتم قابل تشخیص از متن؛ نه تحلیل کامل عروض',
  'semantic-compression': 'میزان فشردگی لایه‌های معنا و نسبت معنای استنباطی به طول همان واحد دو‌سطری',
  emotion: 'شدت و چندلایگی عاطفه‌ای که متن همان واحد دو‌سطری القا می‌کند',
  structure: 'انسجام نحوی و معنایی و کیفیت پیوند دو سطر در همان واحد ارزیابی',
  novelty: 'غیرکلیشه‌ای‌بودن ترکیب و بیان نسبت به الگوهای دیده‌شده در همین پیکره',
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

  const [headers = [], ...values] = rows;
  return {
    headers,
    records: values.map((valuesRow) => Object.fromEntries(
      headers.map((header, index) => [header, valuesRow[index] ?? '']),
    )),
  };
}

function normalizeRecord(record) {
  const canonicalName = canonicalPoetName(record.poet_display);
  const canonicalSlug = poetSlug(canonicalName);
  if (!canonicalSlug) {
    throw new TypeError(`Computational aesthetics unmapped poet: ${record.poet_display}`);
  }
  return Object.freeze({
    ...record,
    source_poet_display: record.poet_display,
    poet_display: canonicalName,
    poet_slug: canonicalSlug,
    century: Number(record.century),
    poet_rank: Number(record.poet_rank),
    id: Number(record.id),
    ...Object.fromEntries(SCORE_FIELDS.map((field) => [field, Number(record[field])])),
  });
}

function validateRawRecord(record, rowNumber) {
  for (const field of REQUIRED_FIELDS) {
    if (record[field] === undefined || String(record[field]).trim() === '') {
      throw new TypeError(`Computational aesthetics missing ${field} at row ${rowNumber}`);
    }
  }
  for (const field of SCORE_FIELDS) {
    const value = Number(record[field]);
    if (!Number.isFinite(value)) {
      throw new TypeError(`Computational aesthetics nonnumeric ${field} at row ${rowNumber}`);
    }
    if (value < 0 || value > 100) {
      throw new TypeError(`Computational aesthetics ${field} outside 0-100 at row ${rowNumber}`);
    }
  }
  for (const field of ['century', 'poet_rank', 'id']) {
    if (!Number.isInteger(Number(record[field]))) {
      throw new TypeError(`Computational aesthetics invalid integer ${field} at row ${rowNumber}`);
    }
  }
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
  const parsed = parseCsv(csvText);
  if (parsed.headers.length !== REQUIRED_FIELDS.length
    || parsed.headers.some((header, index) => header !== REQUIRED_FIELDS[index])) {
    throw new TypeError('Computational aesthetics schema mismatch');
  }
  parsed.records.forEach((record, index) => validateRawRecord(record, index + 2));
  const records = parsed.records.map(normalizeRecord);
  const poetRecords = new Map();
  const poetRanks = new Set();
  const sourceIds = new Set();
  const couplets = new Set();

  for (const record of records) {
    validateOverallScore(record);
    if (sourceIds.has(record.id)) {
      throw new TypeError(`Computational aesthetics duplicate source id: ${record.id}`);
    }
    sourceIds.add(record.id);
    const coupletKey = `${record.poet_display}:${record.hemistich1}:${record.hemistich2}`;
    if (couplets.has(coupletKey)) {
      throw new TypeError(`Computational aesthetics duplicate couplet: ${record.id}`);
    }
    couplets.add(coupletKey);
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

  const dimensions = Object.freeze(DIMENSIONS.map(([id, field]) => Object.freeze({
    id,
    field,
    label: DIMENSION_LABELS[id],
    definition: DIMENSION_DEFINITIONS[id],
    weight: DIMENSION_WEIGHTS[field],
    scale: Object.freeze([0, 100]),
  })));
  const poets = Object.freeze([...poetRecords].map(([name, poetRows]) => {
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
  }));
  const semanticPayloadSha256 = createHash('sha256')
    .update(JSON.stringify({ dimensions, records, poets }))
    .digest('hex');

  return Object.freeze({
    schemaVersion: 1,
    publicationVersion: PUBLICATION.version,
    generatedDate: PUBLICATION.modifiedDate,
    id: 'computational-aesthetics',
    title: 'زیبایی‌شناسی محاسباتی شعر فارسی',
    corpus: Object.freeze({
      sourceTexts: 54524,
      scoredUniqueUnits: 676748,
      poets: 67,
      attributedCenturies: 13,
    }),
    dimensions,
    provenance: Object.freeze({
      evaluator: 'GPT-5.6-sol',
      evaluatorAttribution: 'project-owner-supplied',
      humanScoring: false,
      model: Object.freeze({
        identifier: 'GPT-5.6-sol', provider: null, rubricVersion: null, runId: null, runDate: null,
      }),
    }),
    poetAliases: Object.freeze({ ...POET_ALIASES }),
    fieldDictionary: Object.freeze([
      Object.freeze({ field: 'poet_display', description: 'نام معیار شاعر پس از یکسان‌سازی هویت' }),
      Object.freeze({ field: 'poet_slug', description: 'شناسهٔ پایدار و URL-safe شاعر معیار' }),
      Object.freeze({ field: 'source_poet_display', description: 'برچسب شاعر دقیقاً مطابق فایل منبع' }),
      ...REQUIRED_FIELDS.filter((field) => field !== 'poet_display').map((field) => Object.freeze({
        field, description: FIELD_DESCRIPTIONS[field],
      })),
    ]),
    limitations: Object.freeze([
      'امتیازها تعریف جهان‌شمول زیبایی یا رتبهٔ ارزش ادبی نیستند.',
      'خط مبنای داوری انسانی برای سنجش توافق یا اختلاف مدل در دسترس نیست.',
      'نمره‌ها به مدل، صورت‌بندی rubric، وزن‌ها و قواعد انتخاب حساس‌اند؛ جزئیات اجرای دست‌اول برای تحلیل این حساسیت‌ها در دسترس نیست.',
      'واحدها بیرون از بافت کامل شعر ارزیابی شده‌اند و در شعر نو دو سطر الزاماً بیت کلاسیک نیست.',
      'موسیقی و عروض فقط از نشانه‌های متنی تقریبی ارزیابی شده‌اند و تحلیل کامل وزنی نیستند.',
      'سنجش زبان مجازی و انتخاب ده رکورد به قواعد تشخیص، حذف تکرار و تنوع منبع حساس است.',
      'تازگی بیان فقط نسبت به الگوهای همین پیکره معنا دارد و ادعایی دربارهٔ کل سنت شعر فارسی نیست.',
      'عدم‌توازن اندازه و پوشش آثار شاعران می‌تواند بر فضای مقایسه و انتخاب‌ها اثر بگذارد.',
      'سابقهٔ اجرای دست‌اول مدل، نسخهٔ rubric و شناسهٔ run در اختیار پروژه نیست.',
    ]),
    qualification: 'هشت شاخص و امتیاز نهایی خروجی GPT-5.6-sol هستند؛ این ارزیابی انسانی نیست.',
    reproduction: Object.freeze({
      sourcePath: 'research-data/computational-aesthetics/top-couplets.csv',
      command: 'node scripts/postbuild.mjs',
      formula: Object.freeze({ ...DIMENSION_WEIGHTS }),
    }),
    checksums: Object.freeze({
      sourceCsvSha256: createHash('sha256').update(csvText).digest('hex'),
      semanticPayloadSha256,
      semanticPayloadScope: 'dimensions+records+poets',
    }),
    records: Object.freeze(records),
    poets,
  });
}
