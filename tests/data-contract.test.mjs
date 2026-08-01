import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const number = (value) => Number(String(value).replace(/^\uFEFF/, ''));
const evidenceWithoutPublicationMetadata = ({
  schemaVersion: _schemaVersion,
  publicationVersion: _publicationVersion,
  modifiedDate: _modifiedDate,
  ...evidence
}) => evidence;

function parseCsv(relativePath) {
  const input = fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, '');
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted && character === '"' && input[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      record.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      record.push(field);
      if (record.some((value) => value !== '')) records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field || record.length) {
    record.push(field);
    records.push(record);
  }

  const [headers, ...rows] = records;
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}

test('generated research APIs preserve the canonical computed evidence', () => {
  assert.deepEqual(
    evidenceWithoutPublicationMetadata(readJson('dist/api/attribution.json')),
    readJson('app/attribution-data.json'),
  );
  assert.deepEqual(
    evidenceWithoutPublicationMetadata(readJson('dist/api/public-questions.json')),
    readJson('app/research-data.json'),
  );
});

test('computed research evidence has one committed source of truth', () => {
  assert.equal(fs.existsSync(path.join(root, 'src/data/attributionResearch.json')), false);
  assert.equal(fs.existsSync(path.join(root, 'src/data/publicQuestionsResearch.json')), false);
});

test('published audit downloads are byte-identical to their committed evidence', () => {
  for (const filename of ['attribution-corpus-audit.csv', 'public-questions-analysis.csv']) {
    assert.deepEqual(
      fs.readFileSync(path.join(root, 'dist/downloads', filename)),
      fs.readFileSync(path.join(root, 'public/downloads', filename)),
      `${filename} must not change while being published`,
    );
  }
});

test('published CSV statistics equal the source datasets', () => {
  const atlas = readJson('src/data/atlasData.json');
  const couplets = readJson('src/data/poetCouplets.json');
  const forms = readJson('src/data/formResearch.json');

  const poetRows = parseCsv('dist/downloads/poets.csv');
  assert.equal(poetRows.length, atlas.overview.poets.length);
  for (const poet of atlas.overview.poets) {
    const row = poetRows.find((candidate) => candidate['نام شاعر'] === poet.name);
    assert.ok(row, `missing poet row: ${poet.name}`);
    assert.equal(number(row['تعداد متن']), poet.poems);
    assert.equal(number(row['تعداد ابیات']), couplets[poet.name]);
    assert.equal(number(row['کل واژه']), poet.totalWords);
  }

  const topicRows = parseCsv('dist/downloads/topics-by-century.csv');
  assert.equal(topicRows.length, atlas.topics.items.reduce((sum, topic) => sum + topic.values.length, 0));
  for (const topic of atlas.topics.items) {
    for (const point of topic.values) {
      const row = topicRows.find((candidate) => number(candidate['شناسه موضوع']) === topic.id && number(candidate['سده']) === point.century);
      assert.equal(number(row['سهم درصد']), point.share);
      assert.equal(number(row['q روند']), topic.qTrend);
    }
  }

  const metaphorRows = parseCsv('dist/downloads/metaphors-by-century.csv');
  assert.equal(metaphorRows.length, atlas.metaphors.ratesByCentury.length);
  for (const point of atlas.metaphors.ratesByCentury) {
    const row = metaphorRows.find((candidate) => number(candidate['سده']) === point.century);
    for (const metaphor of atlas.metaphors.items) {
      assert.equal(number(row[metaphor.name]), point[metaphor.name]);
    }
  }

  const edgeRows = parseCsv('dist/downloads/intertext-edges.csv');
  assert.equal(edgeRows.length, atlas.intertext.edges.length);
  atlas.intertext.edges.forEach((edge, index) => {
    assert.equal(edgeRows[index]['شاعر متقدم'], edge.source);
    assert.equal(edgeRows[index]['شاعر متأخر'], edge.target);
    assert.equal(number(edgeRows[index]['امتیاز']), edge.score);
  });

  const recallRows = parseCsv('dist/downloads/century-model-recall.csv');
  assert.equal(recallRows.length, atlas.centuryModel.labels.length);
  atlas.centuryModel.labels.forEach((century, index) => {
    assert.equal(number(recallRows[index]['سده']), century);
    assert.equal(number(recallRows[index]['بازیابی']), atlas.centuryModel.recall[index]);
  });

  const anomalyRows = parseCsv('dist/downloads/stylometry-anomalies.csv');
  assert.equal(anomalyRows.length, atlas.stylometry.anomalies.length);
  atlas.stylometry.anomalies.forEach((anomaly, index) => {
    assert.equal(anomalyRows[index]['شاعر'], anomaly.poet);
    assert.equal(number(anomalyRows[index].robustZ), anomaly.robustZ);
  });

  const formRows = parseCsv('dist/downloads/forms-comparison.csv');
  assert.equal(formRows.length, forms.formats.length);
  forms.formats.forEach((form, index) => {
    assert.equal(formRows[index]['قالب'], form.name);
    assert.equal(number(formRows[index]['تعداد متن']), form.texts);
    assert.equal(number(formRows[index]['بازیابی مدل']), form.recall);
  });
});

test('computational-aesthetics CSV and JSON preserve every committed source score', () => {
  const sourceRows = parseCsv('research-data/computational-aesthetics/top-couplets.csv');
  const publishedRows = parseCsv('dist/downloads/computational-aesthetics.csv');
  const publishedJson = readJson('dist/api/computational-aesthetics.json');

  assert.equal(sourceRows.length, 670);
  assert.equal(publishedRows.length, sourceRows.length);
  assert.equal(publishedJson.records.length, sourceRows.length);

  for (const source of sourceRows) {
    const csv = publishedRows.find((row) => number(row.source_record_id) === number(source.id));
    const json = publishedJson.records.find((row) => row.id === number(source.id));
    assert.ok(csv, `missing published CSV record: ${source.id}`);
    assert.ok(json, `missing published JSON record: ${source.id}`);
    assert.equal(csv.source_poet_label, source.poet_display);
    assert.equal(json.source_poet_display, source.poet_display);
    assert.equal(csv.hemistich_1, source.hemistich1);
    assert.equal(csv.hemistich_2, source.hemistich2);
    assert.equal(json.hemistich1, source.hemistich1);
    assert.equal(json.hemistich2, source.hemistich2);
    for (const field of [
      'symbolism_score', 'imagery_score', 'figurative_score', 'music_score',
      'compression_score', 'emotion_score', 'structure_score', 'novelty_score',
      'overall_score',
    ]) {
      assert.equal(number(csv[field]), number(source[field]), `${source.id} CSV ${field}`);
      assert.equal(json[field], number(source[field]), `${source.id} JSON ${field}`);
    }
  }
});
