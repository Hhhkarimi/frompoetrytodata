# Prototype TDD log

## Public testing seams

1. `/prototype/` document semantics and no-JavaScript fallback.
2. URL parameters `variant`, `page`, `state`, `q`, and `century`.
3. Exported prototype data module.
4. CSS behavior contract: RTL logical properties, visible focus, reduced motion, and mobile breakpoint.
5. One-source chart/table rendering contract.
6. Disposable-route documentation.

## Red

`node --test tests/prototype.test.mjs` was run before implementation. Five tests failed because the HTML, data module, CSS, JavaScript, and prototype documentation did not exist.

## Green

The minimum dependency-free implementation was added under `public/prototype/`. The same test command then passed all five tests.

## Refactor while green

- Shared `makeUrl` and `setUrlState` normalize shareable state.
- Shared `renderEvidencePair` renders both SVG and table from the same dataset.
- Shared `qualification` renders local methodological caveats.
- Page and state renderers keep variant layout from error/loading behavior.

## Current result

- 5 tests passing.
- JavaScript syntax checks passing.
- HTML parser check passing.
- Headless Chromium screenshot generation could not complete in this container; no production code was changed to work around the environment.

## 2026-07-27 — Canonical build regression

- **Reproduce:** the repository postbuild validator rejected `dist/prototype/index.html` with `Missing canonical`.
- **Root cause:** the disposable static prototype was copied into `dist/` and therefore entered the same HTML validation scope as production-generated pages, but its source document had no canonical link.
- **Red:** added a public-document assertion requiring the canonical URL for `/prototype/`.
- **Green:** added `<link rel="canonical" href="https://frompoetrytodata.vercel.app/prototype/" />`.
- **Refactor:** dependency checks now permit the canonical metadata URL while still rejecting external runtime script or stylesheet dependencies.

## SEO audit regression — v3

- **Red:** Vercel build failed because `prototype/index.html` lacked `og:title`, `og:image`, a Twitter Card, and JSON-LD.
- **Green:** added complete social metadata, valid `WebPage` JSON-LD, a local 1200×630 PNG social image, and a longer static prototype summary.
- **Refactor:** aligned the prototype canonical and social URLs with the deployment domain reported by the repository build (`poetrytodata.vercel.app`).
- **Regression seam:** `tests/prototype.test.mjs` and `scripts/verify-prototype.mjs` now validate all four blocking SEO requirements and parse JSON-LD.


## Slice 7 — single document heading

- Red: repository SEO audit reported two `h1` elements in `prototype/index.html`.
- Green: changed the no-JavaScript fallback heading to `h2` and added an exact-one-`h1` assertion.
- Refactor: mirrored the assertion in the standalone prototype verifier.

## 2026-07-29 — production-domain metadata regression

- **Reproduce:** `/prototype/` on the declared production site
  `frompoetrytodata.vercel.app` exposed canonical, Open Graph, Twitter, and
  JSON-LD URLs for the alternate `poetrytodata.vercel.app` deployment.
- **Root cause:** a previous build inferred the Vercel project URL and its value
  was copied into static prototype metadata and regression assertions, even
  though the product owner identifies `frompoetrytodata.vercel.app` as the
  production website.
- **Red:** changed the public-document assertions to require the declared
  production host and reject the alternate alias; two tests failed.
- **Green:** aligned all static prototype metadata and the standalone verifier
  with `https://frompoetrytodata.vercel.app/prototype/`.
- **Deferred:** canonical-host and redirect policy for the complete production
  site belongs in the approved specification; this slice changes only the
  disposable prototype.

## 2026-07-29 — current prototype selection

- **Red:** added a public-document assertion requiring a programmatically
  exposed current item; the URL-state test failed because selection was only
  represented by `data-*` attributes and styling.
- **Green:** variant and sample-page links now expose `aria-current="page"` for
  the current item and `aria-current="false"` for the remaining items.
- **Scope:** this changes only the disposable prototype navigation.

## 2026-07-29 — production vertical slices

The approved integrated direction was implemented against three public seams:
browser-observable behavior, generated production artifacts, and the published
data contract.

- **Routing and URL state:** tests first required a narrative `/`, an
  independently addressable `/atlas/`, compatibility for legacy fragments,
  deterministic filter serialization, history restoration, and exact share
  URLs.
- **Accessible evidence:** tests first required a native table derived from the
  same row model as each chart, visible focus, APG tab keys, contained modal
  focus, Escape close, and focus restoration.
- **Publication identity:** tests first required one official origin,
  source-controlled publication dates, consistent citations, Dataset JSON-LD,
  and a download manifest with byte counts and SHA-256 checksums.
- **Data integrity:** tests compare generated JSON and CSV values with their
  canonical analytical sources and verify all generated poet, century,
  metaphor, and research page families.
- **Resilience and performance:** tests cover loading, recoverable failure,
  empty search results, no-JavaScript entries, and the absence of atlas data and
  ECharts from the homepage's initial request path.
- **Refactor while green:** publication formatting, route compatibility,
  analytics contracts, atlas URL state, modal behavior, and chart/table
  projections were extracted behind small public modules.

The last metadata slice reproduced duplicate homepage/atlas descriptions,
introduced a failing production-build assertion, then gave each route a
distinct description and expanded the atlas no-JavaScript qualification while
keeping publication dates projected from the shared publication model.

## 2026-07-29 — review remediation slices

- **Multi-entity explorer:** a failing browser test required theme search,
  canonical entity links, global reset, URL-backed entity/study/sort fields,
  history restoration, and focus return. Pure filtering and route adapters
  were added, then wired into the atlas.
- **Chart/table equivalence:** graph links and scatter tuples first failed
  exact row assertions. The shared table projection now preserves link scores,
  phrase counts, and named scatter dimensions.
- **Published evidence:** a failing contract test required identifier, label,
  definition, unit, denominator, precision, source/version, qualification, and
  values. The chart and native table now consume the same versioned record.
- **Research qualifications:** production-artifact tests now fail if any
  sensitive research summary lacks its adjacent qualification or if a research
  page omits evidence, method, interpretation, and reuse sections.
- **Accessibility:** the first automated axe run found three serious issues:
  invalid logo labelling, an unnamed threshold slider, and two unnamed select
  controls. Their source semantics were corrected and the unmodified serious/
  critical rule set passed for the narrative homepage and atlas shell.
- **API and download contracts:** failing build tests required schema and
  publication versions for JSON APIs, per-file manifest identity/scope/license/
  provenance/citation, and exclusion of disposable prototypes from production.
- **Citation fallback:** a rejected clipboard promise first failed the browser
  test; visible selectable citation text and an announced manual-copy path now
  remain available without changing focus.
- **Final review remediation:** period «جدید» first failed URL round-trip;
  mixed-unit geography values first exposed raw fractions; graph tables first
  omitted textual evidence type; generated entity pages first omitted required
  related paths; and OpenAPI first described the new versioned list payloads
  as arrays. Each was reproduced with a focused failing test before the URL
  vocabulary, per-series evidence metadata, graph cues, page generators, and
  API schema were corrected.
- **Full axe rule set:** after the serious/critical pass, the test was tightened
  to reject every automated violation except the color-contrast rule that
  jsdom cannot compute. It then found a nested complementary landmark, an
  invalid tabpanel host, and redundant image alternatives; all three source
  semantics were corrected before the test returned green.
- **Per-dimension and filtered equivalence:** a second standards review found
  that a three-dimensional scatter inherited one series-level unit. A failing
  test now requires independent unit, denominator, and precision metadata for
  every dimension. A browser-level test also opens the intertext table after
  applying `threshold=0.96` and proves its link ordering, values, units, and
  denominators against the filtered canonical edge set.
- **Production option coverage:** the first generic graph fix accidentally
  encoded intertext-specific units for metaphor nPMI and geography poet counts.
  Production-builder tests now cover every scatter family and all three graph
  families. Graph adapters consume series-specific node/link metadata, omit
  empty node values, and expose precision in the native table.
