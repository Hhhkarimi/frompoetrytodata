# Computational-aesthetics architecture assessment

- Date: 2026-07-29
- Scope: approved computational-aesthetics study only
- Status: assessment; no production refactor performed
- Visual report:
  `architecture-review-computational-aesthetics-20260729.html` in the
  workspace analysis directory

## Scope and vocabulary

This assessment uses the `codebase-design` meanings of **module**,
**interface**, **implementation**, **seam**, **adapter**, **depth**,
**leverage**, and **locality**. It respects ADR 0001 (local qualifications),
ADR 0002 (one generated source for statistics and downloads), and ADR 0003
(one canonical profile per poet).

The scan covered the recently active publication paths: research registry,
static-page generation, poet identity and slug resolution, structured data,
download generation, published evidence, chart/table projection, URL state,
Persian formatting, citation, and their public tests.

## Findings

### 1. Validated computational-aesthetics publication module

- Classification: **required by the selected feature**
- Recommendation: **Strong**
- Evidence: the supplied study needs CSV parsing, record validation,
  owner-supplied model provenance, weighted-score verification, explicit alias
  resolution, poet aggregation, page projection, table projection, JSON, CSV,
  and manifest checks.
- Current friction: putting those responsibilities directly into the static
  page generator would couple transformation and presentation and invite
  independent statistics in page/download callers.
- Deepening opportunity: provide one small interface that returns a validated,
  versioned study artifact. Page, chart, table, JSON, and CSV implementations
  become adapters over that artifact.
- Deletion test: deleting this module would redistribute its invariants and
  calculations across at least five callers; it therefore earns depth.
- Testing effect: schema, alias, formula, aggregate, and provenance behavior
  can be tested through one canonical data seam.

### 2. Shared poet-identity module

- Classification: **required by the selected feature**
- Recommendation: **Strong**
- Evidence: poet slug tables currently exist in runtime entity paths and in
  both publication generators. The new source differs from existing identity
  labels for Nima Yushij and Aliyar.
- Current friction: adding aliases to only one implementation can generate a
  duplicate poet, a broken link, or inconsistent structured data.
- Deepening opportunity: centralize canonical name, slug, and source aliases
  behind one interface used by runtime-route, static-page, SEO, and ingest
  adapters.
- Deletion test: deleting the module would recreate three slug tables and
  multiple fallback/alias rules, demonstrating locality and leverage.
- Testing effect: one public identity seam can prove that every source label
  resolves to exactly one existing route.

### 3. Complete research-entry contract

- Classification: **safe preparatory refactor**
- Recommendation: **Worth exploring, implemented only as needed**
- Evidence: research identity is registered in content while detailed data,
  method, downloads, API projections, feed, and structured data are completed
  in separate generator branches.
- Current friction: an eleventh research card can exist while one of its
  publication projections is absent.
- Deepening opportunity: make completeness validation part of a research-entry
  interface that the publication implementation projects to hub, page, API,
  feed, and sitemap.
- Deletion test: a pass-through wrapper would be shallow. This module is
  justified only if it hides completeness invariants and multiple projections.
- Testing effect: one complete entry can be checked instead of coordinating
  separate fixtures.

### 4. Unified HTML/SEO publication generator

- Classification: **optional future architecture improvement**
- Recommendation: **Speculative for this feature**
- Evidence: the main post-build generator and SEO/GEO enhancer repeat slug
  maps, page-head construction, citation blocks, formatting, tables, and
  structured-data concerns.
- Current friction: study count, dataset metadata, and poet identity changes
  may require coordinated edits.
- Deepening opportunity: a future publication module could own shell and
  metadata behavior while existing passes become adapters.
- Deletion test: consolidation would move substantial complexity and carries a
  broad regression surface.
- Decision for this feature: do not perform the broad merge. Share only the
  identity and study-artifact knowledge required by the approved
  specification.

## Existing modules that should remain

- Persian number formatting and publication citation already expose useful,
  centralized interfaces; do not duplicate them.
- Published evidence and chart-table projection already form the correct
  accessibility seam. Extend their supported study data rather than replacing
  them with a new chart wrapper.
- Existing URL-state helpers provide prior art for deterministic, shareable
  filters; the study should use their interface rather than local query-state
  serialization.

## Recommended implementation boundary

Implement findings 1 and 2. Apply finding 3 only to the minimum completeness
validation needed for the eleventh study. Defer finding 4.

This boundary is fully inside the approved specification. Any broader
publication-generator consolidation requires separate approval.
