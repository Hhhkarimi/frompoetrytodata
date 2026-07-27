# ADR 0002: One generated source for displayed statistics and downloads

- Status: Proposed
- Date: 2026-07-27

## Context

The system generates interactive views, static research/entity pages, JSON APIs, and CSV downloads. Recomputing the same metric independently in presentation layers risks inconsistent values, labels, denominators, qualifications, and rounding.

## Proposed decision

Each published metric is produced once by a versioned data-generation pipeline. Interactive components, generated pages, accessible tables, metadata, JSON, and CSV consume that canonical artifact or a typed projection of it. Presentation layers may format values but may not redefine the metric.

## Consequences

- Metric identifiers, units, denominators, precision, provenance, and qualification become explicit data fields.
- Integrity tests can compare page values and downloads to the canonical artifact.
- Generators require stable schemas and validation.
- Migration may need adapters for existing `atlasData.json`, research JSON files, and CSV outputs.

## Approval gate

Accept or revise this ADR during specification after a prototype direction is selected. It is not authorization for a broad refactor.
