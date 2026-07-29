# ADR 0002: One generated source for displayed statistics and downloads

- Status: Accepted
- Date: 2026-07-27

## Context

The system generates interactive views, static research/entity pages, JSON APIs, and CSV downloads. Recomputing the same metric independently in presentation layers risks inconsistent values, labels, denominators, qualifications, and rounding.

## Decision

Each published metric is produced once by a versioned data-generation pipeline. Interactive components, generated pages, accessible tables, metadata, JSON, and CSV consume that canonical artifact or a typed projection of it. Presentation layers may format values but may not redefine the metric.

## Consequences

- Metric identifiers, units, denominators, precision, provenance, and qualification become explicit data fields.
- Integrity tests can compare page values and downloads to the canonical artifact.
- Generators require stable schemas and validation.
- Migration may need adapters for existing `atlasData.json`, research JSON files, and CSV outputs.

## Approval

Accepted with the integrated publication experience specification on
2026-07-29. This decision authorizes only the canonical published-evidence
contract required by that specification; it does not authorize a broad
refactor or claim end-to-end corpus reproducibility.
