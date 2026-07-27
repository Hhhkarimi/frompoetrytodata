# Architecture assessment for the homepage and research-navigation improvement

Date: 2026-07-27

## Scope

This is an assessment only. It does not authorize broad refactoring. It focuses on modules and pipelines likely to be touched after a prototype is selected: the interactive application shell, research navigation, chart/table composition, generated pages, metadata, citations, filters, and data outputs.

## Codebase-design vocabulary

- **Module:** a cohesive unit that owns a responsibility and exposes an interface.
- **Interface:** the stable contract consumed by another module, including data schemas and URL behavior.
- **Implementation:** internal details hidden behind the interface.
- **Public seam:** a stable observable boundary suitable for tests, such as URL output, generated HTML, JSON schema, or user interaction.
- **Source of truth:** the authoritative artifact from which all representations are projected.
- **Coupling:** the amount of knowledge one module requires about another's implementation.
- **Cohesion:** how closely a module's responsibilities belong together.

## Observed or likely pressure points

### 1. Page-generation logic

`postbuild.mjs` is documented as generating research/entity pages, Schema, sitemap, and API outputs. If templates, metadata, citations, and navigation are assembled in one script, it risks low cohesion and difficult testing.

Assessment target after checkout: identify whether page types share a typed page model and reusable renderer, or duplicate HTML/meta/citation fragments.

### 2. Metric definitions

Analytical JSON, prose content, chart options, generated HTML, and CSV downloads can drift if values or denominators are restated in multiple places.

Assessment target: trace a representative metric from Python generation through JSON, interactive chart, table, static page, structured data, and CSV. Record every transformation and rounding step.

### 3. Visualization wrappers

A `chartOptions.js` module may be either a deep abstraction (owning accessible labels, formatting, RTL, resize behavior, table equivalence) or a shallow option factory that leaves every page to repeat concerns.

Assessment target: determine whether chart configuration exposes a domain-level interface or leaks the chart library throughout the application.

### 4. Citation generation

Citation text exists on methodology/data pages and likely research pages. Repeated string construction risks mismatched title, year, canonical URL, version, and copy behavior.

Assessment target: locate one citation model and render it to visible HTML, clipboard text, JSON-LD, `CITATION.cff`, and metadata projections.

### 5. Persian number formatting

Counts, percentages, years, p-values, and file sizes have different formatting rules. Repeated `toLocaleString` or manual replacement can produce inconsistent separators and machine-value loss.

Assessment target: inventory formatting functions and create a small domain-aware formatter interface only if duplication is confirmed.

### 6. Transformation/presentation coupling

React components or page templates should not recompute research metrics. Python/data-generation code should not emit presentation-specific prose where a structured field would be more stable.

Assessment target: classify each transformation as corpus cleaning, metric computation, evidence packaging, or presentation formatting.

### 7. Chart accessibility

Chart-library output may be inaccessible if the only values are canvas/SVG marks or hover tooltips.

Assessment target: verify whether chart and table consume one array/schema, whether keyboard users can reach meaningful controls, and whether qualification text is visible without interaction.

### 8. Metadata generation

Repeated title/description/canonical/JSON-LD assembly across page types creates drift and duplicate-page risk.

Assessment target: identify a page metadata interface keyed by page identity and content version.

### 9. URL state

Explorer filters that live only in React state cannot be shared, bookmarked, restored, or tested through stable public seams.

Assessment target: map filter state to normalized URL parameters, define defaults, ordering, invalid-value behavior, and canonical/indexing policy.

## Changes required by the selected feature

These are likely required regardless of visual direction, but still need specification approval:

1. A stable URL contract for selected navigation/filter behavior.
2. An accessible chart/table composition contract.
3. Local methodological qualification fields for sensitive claims.
4. Cross-output data-integrity tests for representative statistics.
5. A metadata/citation contract for any newly generated page.
6. Loading, empty, error, and no-JavaScript behavior for the selected public seams.

## Safe preparatory refactors

Only perform these when duplication is confirmed and the selected feature needs them:

- extract a pure URL-state parser/serializer;
- extract a pure Persian display formatter while preserving machine values;
- extract a claim/evidence/qualification data shape;
- extract a chart-table projection from one dataset;
- extract a citation model/rendering function;
- split page metadata assembly from filesystem output in the generator.

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

After a prototype direction is selected and specified, re-open this report against the actual checkout. Any refactor expanding beyond the selected user stories requires explicit approval.
