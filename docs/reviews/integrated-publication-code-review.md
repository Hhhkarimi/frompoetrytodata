# Integrated publication code review

## Review scope

- Fixed point: `c75b939`
- Reviewed range: `git diff c75b939...HEAD`
- Specification: `docs/specs/integrated-publication-experience.md`
- Axes: repository standards and specification fidelity

## Standards

The independent review rounds found blocking issues in mixed-unit chart
projections, graph-specific evidence semantics, API documentation, historical
claim wording, control state semantics, and automated accessibility coverage.
The implementation now:

- assigns unit, denominator, and precision metadata per scatter dimension;
- assigns graph metadata per production series instead of treating every graph
  as an intertextuality score;
- includes every scatter size, opacity, and tooltip encoding in the equivalent
  native table, including topic share/significance, metaphor occurrences,
  shared phrases, and geography coverage;
- omits graph-node rows that do not have a measurable value;
- exercises production chart option builders in regression tests;
- documents the wrapped, versioned JSON payloads in OpenAPI;
- qualifies computational associations and attribution signals locally;
- exposes toggle state through `aria-pressed`; and
- runs the full automated axe rule set available in jsdom, except for the
  `color-contrast` rule that jsdom cannot calculate.

The disposable prototype remains in `public/prototype/` as a design record but
is removed from `dist/` by the production generator and rejected by a
production-build regression test.

The final Standards pass initially found the missing scatter encodings above.
A focused production-builder test reproduced the omission before the chart
contracts were corrected. No blocking Standards finding remains after that
remediation. Duplicated slug maps and unvalidated chart metadata shapes are
nonblocking locality risks and should be consolidated only when their module
boundaries are next changed.

## Specification

The implementation covers the selected integrated experience across:

- the narrative homepage, explorer, research hub, and audience entry paths;
- poet, century, metaphor, theme, and research page generation;
- URL-backed search, filters, sorting, history restoration, and share links;
- accessible chart/table pairs and keyboard-operable disclosure controls;
- citation, metadata, structured data, downloads, and versioned JSON APIs;
- loading, empty, recoverable error, and no-JavaScript fallbacks; and
- publication, filter, generated-route, download-integrity, and regression
  testing seams.

One strict specification limitation remains. The published research record
catalog projects static research pages and JSON and links each record to a
versioned CSV source, while runtime atlas charts create their own evidence
records from the same canonical analytical data. This proves lineage and value
equivalence, but it does not yet satisfy the strongest reading of AC22 that one
identical record object must be the direct source for every chart, page, JSON,
and CSV projection. Closing that gap requires a broader evidence-catalog
migration, not a local adapter patch.

No unrelated product redesign or silent dataset change was introduced.

## Verification limits

The container has no installed Chromium, Chrome, or Firefox executable.
Therefore real-browser verification at 320 px, browser-computed color contrast,
full keyboard traversal, and an actual disabled-JavaScript session could not be
run. jsdom accessibility tests, URL/browser-behavior tests, static artifact
tests, and no-JavaScript markup assertions cover the corresponding stable
seams, but they do not replace a real-browser CI gate.

## Outcome

- Standards axis: pass, with one nonblocking architecture risk.
- Specification axis: partial pass, with the strict AC22 cross-output identity
  migration remaining.
- Environment: real-browser accessibility and responsive checks remain to be
  added in browser-capable CI.
