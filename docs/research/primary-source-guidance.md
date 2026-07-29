# Primary-source guidance for accessibility, performance, RTL, scholarly metadata, datasets, and SEO

Research date and last source check: 2026-07-29

This document separates externally sourced requirements/guidance from project recommendations. Sources are primary standards or first-party platform documentation.

## Source status

- WCAG 2.2 success criteria are normative W3C requirements for a claim of WCAG
  conformance. WAI tutorials, Understanding documents, techniques, and the
  Authoring Practices Guide are informative implementation guidance.
- W3C Internationalization documents are first-party internationalization
  guidance, not additional WCAG success criteria.
- Core Web Vitals thresholds and Google Search/Scholar documentation are
  first-party platform guidance, not W3C conformance requirements.
- Schema.org defines a shared vocabulary. DataCite and Citation File Format
  guidance becomes binding only when using the corresponding registration or
  metadata system; otherwise it remains a strong interoperability convention.

## External requirements and guidance

### 1. Interactive charts and equivalent data

WCAG 2.2 requires a text alternative for non-text content and programmatically
determinable information and relationships. WAI classifies charts and graphs as
complex images and describes a two-part alternative: a short identification and
a longer textual representation of the essential information.

When the equivalent information is tabular, W3C guidance for data tables uses
native `<table>`, `<th>`, and `<td>` markup; `scope`, `id`, or `headers` may be
needed for complex tables. Visual styling alone is not sufficient because
assistive technology depends on programmatic header/data relationships.

Sources:

- WCAG 2.2, including 1.1.1 and 1.3.1: https://www.w3.org/TR/WCAG22/
- W3C WAI Complex Images Tutorial: https://www.w3.org/WAI/tutorials/images/complex/
- W3C WAI Tables Tutorial: https://www.w3.org/WAI/tutorials/tables/
- W3C WAI Table Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/table/
- W3C WAI Table Tips: https://www.w3.org/WAI/tutorials/tables/tips/

External implication: every chart that communicates data needs an accessible
textual/data alternative containing the essential information. A native table
is preferred when the relationship is tabular. A table should not be converted
to an ARIA grid unless it truly behaves as an interactive composite widget.

### 2. Keyboard and visible focus

WCAG requires all functionality to be operable by keyboard and keyboard focus
to be visible. User-interface components and focus indicators also have
non-text contrast requirements at Level AA. Native links, buttons, inputs,
selects, details/summary, and tables reduce custom keyboard obligations.
Composite widgets such as tabs or comboboxes need their documented keyboard
behavior and programmatic state.

For a modal dialog, APG guidance contains the tab sequence inside the dialog,
moves focus into it on open, supports Escape to close, and restores focus to an
appropriate element after close.

Sources:

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C WAI Accessibility Principles: https://www.w3.org/WAI/fundamentals/accessibility-principles/
- W3C WAI Visible Keyboard Focus: https://www.w3.org/WAI/test-evaluate/easy-checks/keyboard-focus/
- W3C WAI Understanding Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- WAI-ARIA APG Tabs Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- WAI-ARIA APG Combobox Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- WAI-ARIA APG Disclosure Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- WAI-ARIA APG Modal Dialog Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

External implication: chart tooltips must not be the only place where essential values or qualifications appear. Pointer-only hover interaction is insufficient.

### 3. Persian and bidirectional interfaces

W3C Internationalization guidance recommends setting the page base direction with `dir="rtl"` on `<html>`, wrapping opposite-direction segments with appropriate markup, using `dir="auto"` for unknown user/content direction, and preferring markup over CSS or Unicode direction controls. Logical source order should be preserved.

Sources:

- W3C Structural markup and right-to-left text in HTML: https://www.w3.org/International/questions/qa-html-dir.en.html
- W3C Internationalization bidi tutorial: https://www.w3.org/International/tutorials/bidi-xhtml/Overview
- W3C inline bidi examples: https://www.w3.org/International/articles/inline-bidi-markup/bidi_examples.en

External implication: URLs, identifiers, code, DOI strings, Latin names, and mixed numeric labels need directional isolation (`bdi`, explicit `dir`, or `dir="auto"` where appropriate), not manual character reordering.

### 4. Core Web Vitals

Current Core Web Vitals guidance defines good field performance at the 75th percentile as:

- LCP ≤ 2.5 seconds;
- INP ≤ 200 milliseconds;
- CLS ≤ 0.1.

Measurement should be segmented for mobile and desktop and based on real-user/field data where available.

Sources:

- web.dev Web Vitals: https://web.dev/articles/vitals
- web.dev threshold rationale: https://web.dev/articles/defining-core-web-vitals-thresholds

### 5. Dataset structured data

Google's Dataset guidance supports `Dataset`, `DataCatalog`, and `DataDownload`. Canonical dataset landing pages should contain dataset markup. `DataDownload` distributions should identify the download URL and format. Dataset descriptions should include identity, creator, provenance, license, and identifiers where available. Sitemaps help discovery; `sameAs` and `isBasedOn` distinguish identity and derivation.

Sources:

- Google Dataset structured data: https://developers.google.com/search/docs/appearance/structured-data/dataset
- Schema.org Dataset: https://schema.org/Dataset
- Schema.org DataDownload: https://schema.org/DataDownload

### 6. Scholarly publication metadata

`ScholarlyArticle` is appropriate for scholarly article-like research pages when the page actually represents that content. Dataset identity should remain separate from article identity.

Google Scholar asks for one unique URL per article or abstract and supports
Highwire Press citation meta tags. It requires title, at least one actual
author, and publication date/year for inclusion; the publication date must not
be replaced by the repository-entry or build date. Dataset citation metadata
should consistently identify creator, title, publisher, publication year,
resource type, version, and persistent identifier where available.

Sources:

- Schema.org ScholarlyArticle: https://schema.org/ScholarlyArticle
- Google Scholar Inclusion Guidelines: https://scholar.google.com/intl/en/scholar/inclusion.html
- DataCite mandatory metadata properties: https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/overview/
- DataCite citation guidance: https://support.datacite.org/docs/datacite-citation

### 7. Citation and dataset-download conventions

DataCite's preferred human-readable dataset citation is based on Creator,
PublicationYear, Title, Publisher, ResourceType, and Identifier. Its versioning
guidance recommends updating metadata for minor changes and assigning a new DOI
for major changes, linked to the previous version.

Citation File Format provides machine-readable software citation metadata.
When no DOI is available, its specification recommends a version or commit
reference and a URL to the source-code/build repository or software landing
page. A software citation is not a substitute for a separately versioned
dataset citation.

Sources:

- DataCite Metadata Schema 4.6: https://datacite-metadata-schema.readthedocs.io/en/4.6/
- DataCite versioning guidance: https://support.datacite.org/docs/versioning
- Citation File Format 1.2.0: https://citation-file-format.github.io/1.2.0/
- Schema.org DataDownload: https://schema.org/DataDownload

### 8. Generated-page SEO

Structured data must describe the page where it appears and use the most specific applicable type. Canonical URLs should be consistent across HTML, sitemap, and structured data. Generated entity/research pages must be crawlable, internally linked, and not blocked by `noindex` or robots rules. Duplicate URL variants should consolidate on a preferred canonical.

Sources:

- Google general structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google canonical URL guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google Dataset structured data and sitemap guidance: https://developers.google.com/search/docs/appearance/structured-data/dataset

## Project recommendations

These are design/engineering recommendations derived from the external guidance and the project domain. They are not claims that a standard mandates a specific component architecture.

### Accessible chart contract

Every production chart should consume one dataset object that also renders:

1. a concise pre-chart explanation;
2. a visible methodological qualification;
3. an accessible name/summary;
4. a native data table with the same values, units, labels, ordering, precision, and filters;
5. a CSV/JSON download or link where appropriate.

Automated tests should compare normalized chart input and table rows rather than maintaining independent fixtures.

### Keyboard contract

- Prefer native controls.
- When a tab pattern is genuinely needed, implement roving focus/arrow behavior according to APG and keep deep links for shareability.
- Preserve logical DOM order in RTL.
- Never remove focus outlines; use a high-contrast `:focus-visible` treatment.
- Make every filter submit-able and recoverable without pointer input.

### RTL contract

- Set `lang="fa"` and `dir="rtl"` at the document root.
- Use CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline`, `border-inline-*`).
- Isolate DOI, URL, code, file names, and mixed-language labels with `bdi` or explicit direction.
- Keep numeric formatting a presentation concern; preserve machine values in data attributes/JSON.

### Performance contract

- Establish a field measurement baseline before redesign.
- Code-split visualization-heavy routes and defer off-screen charts.
- Avoid loading full analytical datasets on the narrative homepage.
- Reserve chart dimensions to prevent layout shift.
- Measure input latency for filter/search interactions on lower-end mobile hardware.
- Treat LCP/INP/CLS thresholds as acceptance targets at the 75th percentile, not only lab scores.

### Scholarly metadata contract

- Give each research page one stable canonical URL and an explicit version/date.
- Use `ScholarlyArticle` only when the content is article-like; use `Dataset` for dataset landing pages and `DataDownload` for each CSV/JSON distribution.
- Keep creator, title, publication year, publisher, version, license, identifier, `isBasedOn`, and citation text consistent across HTML, JSON-LD, `CITATION.cff`, `codemeta.json`, and downloads.
- Include the exact dataset/analysis version used by each claim.

### Citation and download contract

- A copied citation should match the visible citation and structured metadata.
- Software and datasets should have distinct citations and identities when they
  are distinct research outputs.
- Download links should disclose format, scope, version/date, approximate size when useful, license, and checksum or integrity information for stable releases.
- CSV should use UTF-8 and stable headers; JSON should expose a schema/version field.
- Generated files should be parsed and schema-validated in tests, not checked only for existence.

### Generated entity-page contract

- Poet, century, metaphor, and research pages need unique titles/descriptions, canonical URLs, breadcrumbs/internal links, explicit entity definitions, local methodological qualifications, and relevant structured data.
- Search/filter result pages with arbitrary query combinations should not create uncontrolled duplicate indexable pages; canonical and indexing behavior must be specified.
