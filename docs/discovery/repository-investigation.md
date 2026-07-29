# Repository and deployed-site investigation

Last verified: 2026-07-29

## Scope and evidence

This investigation used the complete local checkout, a clean temporary install
and production build, generated output, and direct inspection of the deployed
site. No production source or dataset was changed during investigation.

The checkout was updated to `c75b939` after the initial investigation. The
deployment was rechecked after that update.

## Framework and rendering architecture

- React 19 and Vite 8 build the interactive root application.
- `src/main.jsx` mounts a client-rendered SPA; it removes the static root
  fallback rather than hydrating it.
- `src/App.jsx` is a large single-page composition with section navigation and
  local React state rather than a route library.
- `scripts/postbuild.mjs` and `scripts/enhance-seo-geo.mjs` turn the Vite output
  into a hybrid static publication with generated research/entity pages, JSON
  APIs, CSV downloads, metadata, citation artifacts, sitemaps, and a knowledge
  graph.
- Vercel serves the generated `dist` directory. Static entity/research pages
  remain readable without the React application.

## Route structure

A clean build generated 124 HTML pages:

- `/` interactive homepage/atlas;
- `/research/` plus 10 research studies;
- `/poets/` plus 67 poet pages;
- `/themes/` plus 11 computational-theme pages;
- `/metaphors/` plus 10 metaphor-family pages;
- `/centuries/` plus 13 attributed-century pages;
- `/questions/`, `/methodology/`, `/glossary/`, `/about/`, `/data/`, and
  `/attributions/`;
- `/api/` JSON resources and `/downloads/` CSV distributions.

The disposable work adds `/prototype/` only. It does not replace a production
route.

The repository also contains a legacy/incomplete `app/` Next.js tree. The
package and build pipeline are Vite-based, so that tree is not part of the
current production build.

## Content and data-generation pipeline

The intended analytical flow is:

1. Read `poems_with_more_info.tsv`.
2. Compute or assemble research artifacts with Python scripts.
3. Commit compact JSON/CSV outputs.
4. Import JSON into the React atlas.
5. Project the same artifacts into generated HTML, APIs, and downloads.

The current checkout cannot reproduce that flow end to end:

- `public/data/poems_with_more_info.tsv` is absent although README and scripts
  refer to it.
- `scripts/generate_data.py` contains environment-specific absolute `/mnt/data`
  paths.
- Several topic, metaphor, intertext, and evaluation values are transcribed or
  assembled in the generator rather than recomputed from a versioned in-repo
  source.
- Geography, lexical, and form artifacts are committed outputs without a
  complete in-repo provenance chain.
- Attribution and public-question generators default to the missing TSV and
  write `app/*.json`, while the React build imports corresponding
  `src/data/*.json` files.
- `app/research-data.json` and `app/attribution-data.json` duplicate the
  corresponding `src/data` artifacts.

These are reproducibility and drift risks; they do not demonstrate that the
currently published numbers are incorrect.

## Visualization layer and reusable components

- ECharts 6 is used through `echarts-for-react`.
- `src/components/Chart.jsx` lazy-loads chart rendering with
  `IntersectionObserver` and uses a canvas renderer.
- `src/chartOptions.js` is a large collection of chart-specific option
  factories.
- `src/components/Section.jsx` provides small presentational wrappers.
- Chart configuration, page composition, interactions, content, and data
  selection remain concentrated in `App.jsx`, `chartOptions.js`, and generated
  page scripts.

The chart wrapper provides a figure label and ECharts ARIA configuration, but
production atlas charts do not consume and render an equivalent native table
from the same data contract.

## Typography, RTL, mobile, and accessibility

Strengths:

- Documents declare `lang="fa"` and `dir="rtl"`.
- A skip link and semantic static-page headings/navigation exist.
- Responsive CSS covers desktop, tablet, and narrow mobile widths.
- Reduced-motion handling exists.
- Static century, metaphor, research, and data pages include useful native
  tables.

Observed gaps:

- The production stylesheet has no project-wide `:focus-visible` treatment;
  some inputs remove their outline and fall back on inconsistent browser focus.
- Poet and glossary dialogs declare `aria-modal` but do not contain focus,
  restore focus, or close with Escape. On the deployed site, Tab moved into
  background content while a poet dialog was open.
- Tab-like question controls expose `role="tab"` but not the complete APG
  keyboard/tabpanel relationship.
- Interactive canvas charts expose labels but not equivalent native data
  tables; important values remain pointer-oriented.
- Homepage filters and section selection live in local state and are not
  represented in shareable URLs.
- Search can produce a visually empty grid without a dedicated empty-state
  announcement.

Mobile behavior is implemented through CSS breakpoints, but the production SPA
still carries the same long page and analytical payload on mobile.

## Metadata and structured data

Generated output includes:

- canonical, hreflang, Open Graph, Twitter, and citation meta tags;
- `WebSite`, `Person`, `Dataset`, `DataCatalog`, `DataDownload`,
  `ScholarlyArticle`, `ProfilePage`, `DefinedTerm`, `CollectionPage`,
  `BreadcrumbList`, and FAQ-style Schema.org graphs where applicable;
- `CITATION.cff`, `codemeta.json`, BibTeX/JSON citation outputs, OpenAPI,
  sitemaps, content index, and a knowledge graph.

Risks:

- build time is frequently projected as `dateModified`, even when the scholarly
  content did not change;
- software and heterogeneous analytical datasets share overlapping identity
  and citation metadata;
- `CITATION.cff` currently points its top-level URL to LinkedIn rather than a
  stable software/project landing page;
- two active Vercel aliases currently serve the same publication with
  self-referential canonicals. The product owner identifies
  `frompoetrytodata.vercel.app` as the production website, so host consolidation
  must be specified before production implementation.

## Test coverage and build verification

Before the disposable prototype package, the repository had no general
`test`, `lint`, or `typecheck` scripts. Its principal automated check was
`scripts/seo-audit.mjs`, which validates generated pages, JSON parsing, links,
route counts, and asset budgets.

A clean temporary install and production build succeeded under Node 24 with an
engine warning because the project declares Node 22. The build reported:

- main JavaScript: approximately 463 KB uncompressed / 132 KB gzip;
- lazy ECharts chunk: approximately 1.14 MB uncompressed / 377 KB gzip;
- CSS: approximately 56 KB uncompressed / 11 KB gzip;
- 124 HTML pages and zero SEO-audit warnings.

The disposable prototype now has focused Node tests and a standalone verifier.
These tests do not replace production component, accessibility, or browser
coverage.

## Performance pressure points

- All major analytical JSON modules are imported into the long homepage SPA.
- The main application is monolithic even though ECharts itself is lazy.
- Many chart shells can initialize during a long scroll.
- The chart chunk is the largest client asset.
- Persian fonts are loaded from external origins, adding connection and
  rendering risk.
- The narrative homepage and research explorer are not route-level code-split.

Core Web Vitals need real-user baselines segmented by mobile and desktop; bundle
sizes alone do not establish a field-performance failure.

## CSV and JSON integrity

`postbuild.mjs` derives poet, topic, metaphor, intertext, stylometry,
century-recall, and form CSVs from committed JSON. Attribution, public-question,
geography, and lexical downloads come from additional committed/generated
artifacts.

Read-only integrity checks on a clean build confirmed:

- 67 poet rows match core poet fields in `atlasData.json`;
- 143 topic-century rows match the source values;
- 13 metaphor-century rows match the source values;
- intertext edges, stylometry anomalies, century recall, and forms have the
  expected source counts;
- the public-question CSV contains 191 rows covering all 10 question IDs;
- attribution and public-question APIs are semantically equal to their source
  JSON;
- generated CSVs use a UTF-8 BOM.

The check also confirmed that integer-equivalent values may be serialized as
`6` rather than `6.0`; comparisons must be numeric rather than string-format
comparisons.

## Entity and research page generation

`postbuild.mjs` owns core research, poet, methodology, glossary, about, data,
and attribution outputs. `enhance-seo-geo.mjs` adds or overwrites theme,
metaphor, century, question, API, metadata, and sitemap outputs.

Both scripts repeat formatting, metadata, citation, and shell-building logic.
This creates a shallow boundary between content transformation and filesystem
presentation and makes generator ordering significant.

## Single-source-of-truth assessment

Displayed statistics do not yet have one enforceable source of truth:

- multiple analytical JSON files are imported separately;
- some narratives and metrics are restated in JavaScript/Python;
- two page-generation scripts repeat projections;
- duplicate `app/` and `src/data/` artifacts can drift;
- downloadable data and displayed prose are not protected by a common schema
  or cross-output test suite.

The prototype's chart/table pair demonstrates the desired contract but does not
change production architecture.

## Deployment comparison

During the initial check, the deployment showed 9 studies and returned 404 for
`/research/public-questions/` while the source generated 10. After the upstream
update, the deployment was rechecked on 2026-07-29:

- the homepage now mentions the tenth/public-question study;
- `/research/public-questions/` resolves with its generated title;
- `/prototype/` resolves on the declared production host.

The earlier source/deployment discrepancy is therefore resolved. The duplicate
Vercel-host canonical policy remains unresolved.

## Conclusion

The safe next gate is prototype selection. Production implementation remains
blocked until a selected direction is converted into an approved specification.
Architecture work should then be limited to modules required by that
specification.
