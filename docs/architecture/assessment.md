# Architecture assessment for the homepage and research-navigation improvement

Last updated: 2026-07-29

## Scope

This is an assessment only. It does not authorize broad refactoring. It is
bounded by the approved integrated-publication specification: the narrative
homepage, atlas URL state, research navigation, chart/table composition,
generated entity/research pages, metadata, citations, filters, and published
data outputs.

The scan used the current checkout at `c75b939`, recent file history, the domain
model, ADR 0001, ADR 0002, and the three approved public testing seams. No
production implementation was changed during the assessment.

## Codebase-design vocabulary

- **Module:** a cohesive unit that owns a responsibility and exposes an interface.
- **Interface:** the stable contract consumed by another module, including data schemas and URL behavior.
- **Implementation:** internal details hidden behind the interface.
- **Public seam:** a stable observable boundary suitable for tests, such as URL output, generated HTML, JSON schema, or user interaction.
- **Source of truth:** the authoritative artifact from which all representations are projected.
- **Coupling:** the amount of knowledge one module requires about another's implementation.
- **Cohesion:** how closely a module's responsibilities belong together.

## Confirmed pressure points

### 1. Page-generation logic

Two ordered generators own overlapping publication behavior.
`scripts/postbuild.mjs` and `scripts/enhance-seo-geo.mjs` each define their own
host resolution, Persian formatters, HTML escaping, JSON-LD serialization,
breadcrumb rendering, document head, page shell, citation block, metric cards,
and table rendering. The second generator then patches existing HTML by string
replacement. Generator order is therefore part of an undocumented interface.

### 2. Metric definitions

The React application and both generators independently import and transform
the same analytical JSON files. For example, corpus couplets are reconstructed
in both the interactive application and the static generator, while topic
statistics are formatted in interactive cards, research HTML, entity HTML,
machine-discovery prose, JSON, and CSV generation. There is no schema that
requires metric identifier, denominator, precision, version, and local
qualification to travel together.

### 3. Visualization wrappers

The current `Chart` module adds deferred loading, a figure label, and common
ECharts ARIA/animation options, but its interface accepts a raw ECharts option
object. Twenty-eight exported option factories and their callers therefore
share knowledge of the chart library. The module cannot require a pre-chart
explanation, local qualification, native table, units, precision, or equivalent
filtered rows.

### 4. Citation generation

Citation strings are independently constructed in `App.jsx`,
`postbuild.mjs`, and `enhance-seo-geo.mjs`, with different publication names.
Machine-readable citation files are generated elsewhere. The interactive copy
path derives its host from `window.location.origin`; generator paths derive it
from several environment variables. A copied citation can therefore disagree
with the visible static citation, canonical host, and machine metadata.

### 5. Persian number formatting

Duplication is confirmed. `src/utils.js` uses `Intl.NumberFormat` with an options
object, while both generators carry separate `faNumber`, `faPercent`, and
`faDigits` implementations with different parameter shapes and defaults.
Machine values and display values are not represented as an explicit pair.

### 6. Transformation/presentation coupling

`App.jsx` selects, filters, aggregates, formats, narrates, and renders evidence
inside one 847-line implementation. `postbuild.mjs` similarly derives research
metrics, writes prose, renders documents, and writes CSV/JSON/filesystem
outputs. This couples evidence packaging to presentation and makes it difficult
to test the public data contract without exercising unrelated implementations.

### 7. Chart accessibility

Interactive charts render to canvas and expose an ARIA description, but
production callers do not provide equivalent native tables from the same data.
Some chart copy explicitly tells visitors to hover for exact values. Static
generated pages contain tables, but those tables are separate renderings and
are not protected against drift from the interactive chart.

### 8. Metadata generation

Metadata assembly is duplicated by the two generators. One generator assigns
the build date as research publication and modification date, while the other
has a fixed publication date but still uses build time widely as modification
time. Host resolution can also select a deployment alias. Page identity,
content version, publication date, modification date, citation, and canonical
host are not one cohesive publication model.

### 9. URL state

`App.jsx` initializes at least 17 local state values, including topic,
metaphor, period, similarity threshold/layout/poet, poet search/century/metric,
audience mode, attribution case, and public question. It does not parse or
serialize `URLSearchParams`, push/replace browser history, or restore state on
navigation. Static pages link back to homepage fragments rather than a
canonical atlas-state contract.

## Deepening candidates

### Candidate 1: published-evidence module

- **Classification:** required by the approved specification
- **Recommendation:** Strong
- **Files/modules involved:** analytical JSON sources, the interactive
  application, chart-option implementation, both static generators, JSON APIs,
  and CSV downloads
- **Problem:** callers must know where each metric lives, how to transform it,
  how to format it, which qualification belongs to it, and how its download is
  generated. This is a broad and unstable interface spread across callers.
  Attribution and public-question generators also write `app/` artifacts while
  the React application consumes corresponding `src/data/` artifacts, leaving
  byte-equal copies without one enforced ownership path.
- **Deepening:** place evidence identity, values, unit, denominator, precision,
  source version, and required qualification behind one cohesive module.
  Interactive, static-page, table, JSON, and CSV adapters consume the same
  published record.
- **Deletion test:** deleting this module would force metric definitions,
  version rules, qualification validation, and projections back into every
  caller. That concentration demonstrates depth.
- **Leverage/locality:** one integrity rule protects every representation;
  metric or qualification fixes remain local; data-contract tests use the same
  seam as production callers.

### Candidate 2: atlas-state module

- **Classification:** required by the approved specification
- **Recommendation:** Strong
- **Files/modules involved:** interactive application state, explorer filtering,
  navigation links, canonical/indexing logic, and browser tests
- **Problem:** local state and filter implementation are the effective
  interface. URLs, history, invalid values, defaults, result projection, and
  canonical behavior are absent or scattered.
- **Deepening:** own normalized atlas state, parsing, serialization, validation,
  deterministic ordering, filter projection, and history semantics in one
  module. The browser URL is the public seam.
- **Deletion test:** deleting this module would redistribute parsing,
  validation, history, canonicalization, and filter rules through event
  handlers and pages. The proposed module therefore earns its seam.
- **Leverage/locality:** browser tests exercise stable URLs; all entry links and
  filter controls share one rule set; invalid-state bugs become local.

### Candidate 3: accessible-evidence module

- **Classification:** required by the approved specification
- **Recommendation:** Strong
- **Files/modules involved:** chart shell, option factories, chart cards,
  methodological qualification rendering, native tables, loading/error states,
  and ECharts adapter
- **Problem:** the current chart interface leaks ECharts options and cannot
  enforce equivalent tables, local qualifications, accessible summaries,
  units, or filtered-row equality.
- **Deepening:** make the evidence presentation—not the chart-library option—
  the meaningful interface. Keep ECharts as one adapter inside the
  implementation alongside the native-table and no-JavaScript projections.
- **Deletion test:** deleting this module would return accessible-summary,
  qualification, table, loading, and chart-equivalence logic to every chart
  caller. This is substantial complexity worth concentrating.
- **Leverage/locality:** each published-evidence record gains the same
  accessible behavior; chart/table tests cross one seam; a future visualization
  adapter could change without rewriting evidence callers.

### Candidate 4: generated-publication module

- **Classification:** required behavior plus safe preparatory refactor
- **Recommendation:** Strong
- **Files/modules involved:** both ordered generators, shared page shells,
  metadata, structured data, breadcrumbs, citation, Persian display formatting,
  filesystem output, and SEO audit
- **Problem:** two implementations repeat the same publication rules and then
  patch each other's HTML. Filesystem writing, page identity, rendering,
  citation, metadata, and date semantics are coupled.
- **Deepening:** concentrate the publication model and renderer behind one seam;
  keep page-type adapters explicit, and keep filesystem writing as an
  implementation detail. Page identity, citation fields, canonical host and
  publication dates form a cohesive internal module used by the renderer.
  Consolidate Persian display formatting only where the feature exercises it.
- **Deletion test:** deleting the module would duplicate the shell, metadata,
  citation, date, formatting, and structured-data logic across every page
  family, which is the current failure mode.
- **Leverage/locality:** one fix updates all generated page families; built-
  artifact tests use the same seam; generator ordering stops defining output
  semantics.

### Candidate 5: wholesale application or analysis-pipeline rewrite

- **Classification:** optional future work; outside the approved specification
- **Recommendation:** Speculative
- **Files/modules involved:** the full React application, framework entry,
  Python research pipeline, and all analytical artifacts
- **Problem:** `App.jsx` is large and the raw-data pipeline is not reproducible
  from the checkout, but size and incompleteness alone do not justify an
  unrelated rewrite.
- **Assessment:** do not create a generic module decomposition, replace the
  framework, or rewrite research computation during this feature. Extract only
  the seams demanded by the approved browser, build-artifact, and data
  contracts.
- **Deletion test:** a speculative layer with only one pass-through adapter
  would move code rather than remove caller complexity. It would be shallow.

## Priority

| Order | Candidate | Why now |
| --- | --- | --- |
| 1 | Published evidence | ADR 0002 and chart/download integrity depend on it |
| 2 | Atlas state | The approved explorer and shareable URL are impossible without it |
| 3 | Accessible evidence | Every in-scope chart needs a table and qualification contract |
| 4 | Generated publication | Research/entity metadata and citation consistency depend on it |
| Later | Wholesale rewrite | No approved user story requires it |

## Changes required by the selected feature

These are authorized by the approved specification:

1. A stable URL contract for selected navigation/filter behavior.
2. An accessible chart/table composition contract.
3. Local methodological qualification fields for sensitive claims.
4. Cross-output data-integrity tests for representative statistics.
5. A metadata/citation contract for any newly generated page.
6. Loading, empty, error, and no-JavaScript behavior for the selected public seams.

## Safe preparatory refactors

Duplication is confirmed. Perform these only in the vertical slice that needs
them, behind characterization tests:

- extract a pure URL-state parser/serializer;
- extract a pure Persian display formatter while preserving machine values;
- extract the approved published-evidence/qualification record;
- extract one chart-table projection from one published dataset before
  expanding it;
- consolidate citation identity and rendering where the selected pages use it;
- separate page identity/metadata rendering from filesystem output without
  rewriting unrelated discovery files.

Each refactor should be protected by characterization tests and remain narrow.

## Optional future improvements

These are explicitly outside the current approved work unless separately authorized:

- broad decomposition of `App.jsx`;
- replacement of the chart library;
- migration to a different router/framework;
- wholesale redesign of all research pages;
- unified content management system;
- complete rewrite of the Python analysis pipeline;
- speculative generic design-system package.

## Architecture approval gate

The implementation may perform Candidates 1–4 only to the extent required by
the approved specification and its vertical TDD slices. Candidate 5 and any
other broad refactor remain blocked. Architecture work that changes research
definitions, replaces the framework or chart library, rewrites the Python
pipeline, or expands beyond the approved user stories requires explicit product
approval.

The product owner approved Candidates 1–4 for site-wide production coverage on
2026-07-29, while explicitly selecting preservation of React/Vite, ECharts, and
the current data over a full technical rewrite.
