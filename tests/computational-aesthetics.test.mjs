import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildComputationalAestheticsArtifact } from '../src/research/computational-aesthetics.js';
import { poetPath } from '../src/routes/entity-paths.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceCsv = fs.readFileSync(
  path.join(root, 'research-data/computational-aesthetics/top-couplets.csv'),
  'utf8',
);

test('computational-aesthetics source builds one complete canonical study artifact', () => {
  const artifact = buildComputationalAestheticsArtifact(sourceCsv);

  assert.equal(artifact.schemaVersion, 1);
  assert.equal(artifact.id, 'computational-aesthetics');
  assert.equal(artifact.provenance.evaluator, 'GPT-5.6-sol');
  assert.equal(artifact.provenance.humanScoring, false);
  assert.equal(artifact.publicationVersion, '7.0.0');
  assert.equal(artifact.generatedDate, '2026-08-01');
  assert.equal(artifact.provenance.model.provider, null);
  assert.equal(artifact.provenance.model.runId, null);
  assert.deepEqual(artifact.poetAliases, {
    'نیما یوشیج': 'نیما یوشیج (آوای آزاد)',
    'الیار (جبار محمدی)': 'ا لیار (جبار محمدی)',
  });
  assert.match(artifact.checksums.sourceCsvSha256, /^[a-f0-9]{64}$/);
  assert.match(artifact.checksums.semanticPayloadSha256, /^[a-f0-9]{64}$/);
  assert.ok(artifact.fieldDictionary.length >= 18);
  assert.ok(artifact.limitations.length > 0);
  assert.match(artifact.qualification, /ارزیابی انسانی نیست/);
  assert.match(artifact.reproduction.command, /postbuild/);
  assert.equal(artifact.records.length, 670);
  assert.equal(artifact.poets.length, 67);
  assert.deepEqual(
    new Set(artifact.poets.map((poet) => poet.records.length)),
    new Set([10]),
  );
});

test('computational-aesthetics ingest rejects an overall score that disagrees with its dimensions', () => {
  const invalidCsv = sourceCsv.replace(',91.91,100.0\n', ',0,100.0\n');

  assert.throws(
    () => buildComputationalAestheticsArtifact(invalidCsv),
    /overall score/i,
  );
});

test('study poet aliases resolve to the existing canonical poet profiles', () => {
  assert.equal(poetPath('نیما یوشیج'), '/poets/nima-yushij/');
  assert.equal(poetPath('الیار (جبار محمدی)'), '/poets/a-liyar-jabbar-mohammadi/');
});

test('poet summaries use canonical identity and derive statistics from their ten records', () => {
  const artifact = buildComputationalAestheticsArtifact(sourceCsv);
  const hafez = artifact.poets.find((poet) => poet.name === 'حافظ');

  assert.equal(hafez.meanOverall, 81.61);
  assert.equal(hafez.maxOverall, 85.29);
  assert.equal(hafez.dominantDimension, 'symbolism');
  assert.ok(artifact.poets.some((poet) => poet.name === 'نیما یوشیج (آوای آزاد)'));
  assert.ok(artifact.poets.some((poet) => poet.name === 'ا لیار (جبار محمدی)'));
  assert.equal(artifact.poets.some((poet) => poet.name === 'نیما یوشیج'), false);
});

test('computational-aesthetics ingest rejects duplicate within-poet ranks', () => {
  const invalidCsv = sourceCsv.replace('رودکی,3,1,108,', 'رودکی,3,2,108,');

  assert.throws(
    () => buildComputationalAestheticsArtifact(invalidCsv),
    /duplicate poet rank/i,
  );
});

test('computational-aesthetics ingest rejects an incomplete publication set', () => {
  const invalidCsv = sourceCsv.trimEnd().split('\n').slice(0, -1).join('\n');

  assert.throws(
    () => buildComputationalAestheticsArtifact(invalidCsv),
    /expected 670 records/i,
  );
});

test('computational-aesthetics ingest fails closed on invalid source contracts', () => {
  const cases = [
    [sourceCsv.replace('poem_title', 'poem_heading'), /schema mismatch/i],
    [sourceCsv.replace('رباعیات,رباعی شماره ۲۲', ',رباعی شماره ۲۲'), /missing book_title/i],
    [sourceCsv.replace(',99.94,78.97,', ',101,78.97,'), /outside 0-100/i],
    [sourceCsv.replace('رودکی,3,2,378,', 'رودکی,3,2,108,'), /duplicate source id/i],
    [sourceCsv.replace('رودکی,3,1,108,', 'شاعر ناشناخته,3,1,108,'), /unmapped poet/i],
  ];

  for (const [invalidCsv, expected] of cases) {
    assert.throws(() => buildComputationalAestheticsArtifact(invalidCsv), expected);
  }
});
