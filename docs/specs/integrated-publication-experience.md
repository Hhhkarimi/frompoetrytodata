# Integrated publication experience

- Status: Approved — site-wide production coverage
- Date: 2026-07-29
- Issue: Pending publication to GitHub Issues
- Prototype decision: `A — narrative` for the homepage, `B — explorer` for the atlas, `C — research` for the research hub and result pages, and `D — audience` for task-oriented entry paths
- Related domain context: `CONTEXT.md`
- Related durable decisions: ADR 0001 (accepted) and ADR 0002 (accepted)

## Problem Statement

From Poetry to Data contains a substantial Persian-poetry corpus, ten research
studies, interactive visualizations, generated entity pages, methodology,
citations, and downloadable data. The current long homepage places most of that
material in one client-rendered experience. This makes the publication harder
to enter for a general reader, slower and denser on mobile, and less direct for
researchers and data users who already know what they need.

The current experience also blurs several public contracts:

- homepage navigation and explorer filters are mostly local UI state rather
  than shareable URLs;
- interactive canvas charts do not consistently expose an equivalent native
  data table;
- keyboard focus, dialog behavior, and tab-like controls are inconsistent;
- displayed values, prose, generated pages, JSON, and CSV are not protected by
  one enforceable published-statistic contract;
- research evidence, methodological qualification, citation, and download
  actions are not presented consistently across research and entity pages;
- the same publication is reachable through multiple deployment hosts while
  generated canonicals can depend on the build environment;
- the committed analytical artifacts cannot currently be regenerated all the
  way from the raw corpus because the referenced TSV is absent.

The redesign must improve entry, navigation, accessibility, performance, and
data integrity without silently changing datasets or turning statistical
association into definitive literary or historical interpretation.

The product owner clarified on 2026-07-29 that the approved contracts apply
across the complete production publication, not only a representative subset.
React/Vite, ECharts, existing canonical routes, and the current published data
remain in place. Framework replacement and a research-pipeline rewrite remain
out of scope.

## Solution

Create one integrated Persian RTL-first publication with four complementary
entry modes:

1. The default homepage is narrative-first. It begins with the question of how
   Persian poetry changed across thirteen attributed centuries, gives a concise
   answer, names the unit of analysis, shows the most important local
   qualification, and then offers clear next actions.
2. A dedicated atlas experience is explorer-first. It provides searchable,
   filterable access to poets, attributed centuries, computational themes,
   metaphor families, research findings, and their relationships. All
   meaningful filter state is represented in the URL.
3. The research hub and result pages are research-first. Each result connects
   a short answer to evidence, an equivalent data table, method, uncertainty,
   local qualification, citation, and related downloads.
4. The homepage provides audience-based paths for general readers, literary
   researchers, digital-humanities researchers, and data users. These paths
   lead to the same canonical content rather than duplicating it.

Existing poet, century, metaphor, theme, methodology, glossary, data, and
research URLs remain valid. A new atlas URL may be added as a stable public
entry point, while existing homepage fragment links remain useful through
visible gateway anchors or equivalent compatibility behavior.

The implementation will introduce a canonical published-evidence contract for
the values touched by this work. Chart input, accessible tables, generated
pages, metadata, and CSV/JSON projections will consume the same versioned
artifact. This contract will preserve the existing published numbers; it will
not claim end-to-end corpus reproducibility until the missing raw source and
pipeline provenance are available.

## User Stories

1. As a general reader, I want the homepage to start with one understandable
   question, so that I can enter the project without first understanding its
   information architecture.
2. As a general reader, I want a short answer before a complex chart, so that I
   understand what the evidence is intended to show.
3. As a general reader, I want unfamiliar computational terms explained in
   plain Persian, so that technical vocabulary does not block exploration.
4. As a general reader, I want the main methodological limitation next to each
   sensitive claim, so that I do not mistake corpus coverage for literary
   importance.
5. As a general reader, I want a guided next step after each finding, so that I
   can continue to a poet, century, metaphor, or research explanation.
6. As a general reader, I want Persian numbers displayed consistently, so that
   counts, percentages, years, and decimal values are easy to read.
7. As a general reader, I want a clear distinction between evidence and
   interpretation, so that I can see what was computed and what was inferred.
8. As a literary researcher, I want to move directly from a claim to its unit
   of analysis, method, qualification, and citation, so that I can assess the
   scholarly basis of the claim.
9. As a literary researcher, I want poet pages to disclose corpus coverage and
   attributed-century assumptions, so that the page is not read as a ranking
   of literary importance.
10. As a literary researcher, I want century pages to say that attributed
    century may differ from composition century, so that chronology is not
    overstated.
11. As a literary researcher, I want metaphor-family pages to expose their
    operational membership rules and ambiguities, so that computational
    matches are not treated as guaranteed metaphors.
12. As a literary researcher, I want textual-similarity claims to carry a local
    warning about influence and intertextuality, so that similarity is not
    converted into a historical claim.
13. As a literary researcher, I want attribution and anomaly results framed as
    review signals rather than verdicts, so that computational uncertainty is
    preserved.
14. As a literary researcher, I want a stable citation for each research page,
    so that I can cite the exact work I reviewed.
15. As a literary researcher, I want the visible citation, copied citation,
    citation metadata, and canonical URL to agree, so that references do not
    drift.
16. As a digital-humanities researcher, I want each metric to identify its
    denominator, unit, precision, and version, so that I can interpret and
    reproduce the published comparison.
17. As a digital-humanities researcher, I want charts and data tables to derive
    from one artifact, so that different representations cannot silently
    disagree.
18. As a digital-humanities researcher, I want balanced-sampling and
    poet-coverage decisions exposed near historical trends, so that sampling
    effects remain visible.
19. As a digital-humanities researcher, I want uncertainty and sensitivity
    information when available, so that statistical significance is not the
    only evidence presented.
20. As a digital-humanities researcher, I want a direct path from a research
    result to methodology and downloadable evidence, so that audit work does
    not require searching the whole site.
21. As a digital-humanities researcher, I want generated research and entity
    pages to share stable definitions, so that terminology is consistent
    across the publication.
22. As a data user, I want each download to disclose format, scope, version,
    license, and provenance, so that I can decide whether it fits my use.
23. As a data user, I want CSV files with stable headers and UTF-8 encoding, so
    that Persian text can be imported reliably.
24. As a data user, I want JSON outputs to carry a schema or publication
    version, so that changes can be detected programmatically.
25. As a data user, I want the downloadable values to match the visible
    statistics, so that the website and dataset are not competing sources.
26. As a data user, I want dataset citation to remain distinct from software
    citation, so that I cite the correct research object.
27. As a visitor with a named poet in mind, I want to search from the atlas, so
    that I can reach the relevant entity page quickly.
28. As a visitor with a time period in mind, I want to filter by attributed
    century, so that I can narrow the visible poets, themes, metaphors, and
    findings.
29. As an explorer, I want to filter by entity type, so that unlike result
    types remain understandable.
30. As an explorer, I want selected filters reflected in the URL, so that I can
    bookmark, share, refresh, and restore the same view.
31. As an explorer, I want invalid or obsolete URL filters handled
    predictably, so that a shared link does not produce a broken interface.
32. As an explorer, I want a clear reset action, so that I can return to the
    canonical unfiltered atlas.
33. As an explorer, I want an explicit empty state with recovery actions, so
    that zero matches do not look like a rendering failure.
34. As an explorer, I want filter results announced to assistive technology, so
    that I know when the result set changes.
35. As an explorer, I want search and filters to work by keyboard, so that
    pointer input is not required.
36. As a keyboard user, I want a visible high-contrast focus indicator on every
    interactive control, so that I always know where focus is.
37. As a keyboard user, I want logical focus order in the RTL layout, so that
    visual direction does not produce confusing navigation order.
38. As a keyboard user, I want dialogs to contain focus, close with Escape, and
    restore focus, so that modal content does not trap or lose me.
39. As a keyboard user, I want tab interfaces to implement their complete
    keyboard and panel relationship, so that custom controls behave
    predictably.
40. As a screen-reader user, I want every chart to have a concise summary and a
    native equivalent table, so that canvas output is not the only evidence.
41. As a screen-reader user, I want table headers and data relationships marked
    semantically, so that rows and columns are understandable.
42. As a low-vision user, I want state and differences communicated by text,
    shape, or pattern as well as color, so that color is never the sole signal.
43. As a reduced-motion user, I want nonessential motion disabled, so that the
    publication remains comfortable to use.
44. As a mobile visitor, I want the narrative answer and primary actions to fit
    a narrow viewport without horizontal scrolling, so that the entry
    experience remains usable.
45. As a mobile visitor, I want filter controls and tables to remain operable
    at touch and zoom sizes, so that exploration does not require desktop
    layout.
46. As a mobile visitor, I want visualization code and large datasets deferred
    until I open the atlas or a result that needs them, so that the homepage
    does not pay the full analytical payload cost.
47. As a visitor on a slow connection, I want an informative loading state, so
    that deferred data does not leave a blank region.
48. As a visitor after a data-load failure, I want a concise error and retry
    action, so that I can recover without reloading the whole publication.
49. As a visitor without JavaScript, I want the homepage, research pages,
    entity pages, methodology, citations, and download links to remain
    readable, so that core scholarly content is not client-only.
50. As a visitor without JavaScript, I want the atlas route to link to static
    entity indexes, research pages, and data tables, so that exploration has a
    meaningful fallback.
51. As a search-engine crawler, I want each generated research and entity page
    to have a unique title, description, canonical URL, and internal links, so
    that canonical content can be discovered.
52. As a scholarly indexer, I want article-like research pages to expose
    accurate publication metadata, so that build time is not mistaken for
    publication date.
53. As a dataset indexer, I want dataset landing pages and distributions
    described with Dataset, DataCatalog, and DataDownload where applicable, so
    that downloadable research objects are machine-understandable.
54. As a person sharing a filtered atlas view, I want noncanonical query
    permutations normalized, so that equivalent URLs do not create uncontrolled
    indexable duplicates.
55. As a returning visitor, I want old poet, century, metaphor, theme, research,
    methodology, glossary, data, and download URLs to keep working, so that
    existing references are preserved.
56. As a returning visitor with an old homepage fragment link, I want to reach
    an equivalent visible gateway or atlas state, so that earlier bookmarks do
    not become dead ends.
57. As the publication owner, I want one declared production host used by
    canonical, social, sitemap, structured-data, and citation URLs, so that
    deployment aliases do not split identity.
58. As the publication owner, I want research-sensitive statements to require a
    qualification field, so that future content cannot accidentally omit the
    caveat.
59. As the publication owner, I want analytics to measure entry paths,
    exploration, evidence use, citations, and downloads without collecting raw
    Persian search text, so that product decisions can be informed with less
    privacy risk.
60. As a maintainer, I want route behavior, built artifacts, and data integrity
    tested at stable public seams, so that refactors do not invalidate tests
    unnecessarily.
61. As a maintainer, I want data-integrity failures to stop the build, so that
    mismatched chart, table, JSON, or CSV values cannot be deployed.
62. As a maintainer, I want generated page counts and representative entity
    routes covered by regression tests, so that a generator change cannot
    silently remove a page family.
63. As a maintainer, I want Persian display formatting separated from machine
    values, so that localization does not corrupt filtering, sorting, downloads,
    or structured data.
64. As a maintainer, I want loading, empty, error, and no-JavaScript behavior
    tested explicitly, so that only the happy path is not treated as complete.

## Implementation Decisions

### Information architecture and routes

- The publication has one information architecture, not four parallel sites.
- The default homepage uses the narrative-first direction and includes four
  audience-path cards. Audience selection changes the recommended next links;
  it does not create duplicate copies of the same content.
- The atlas receives a stable public entry point. Its query state is a public
  interface and must not depend on component-local state alone.
- The existing research hub remains the canonical index for research studies.
  Its cards expose the question, short result, evidence type, main
  qualification, and direct paths to method and data.
- Existing canonical entity and utility routes remain valid. The implementation
  may improve their shared shell but must not rename them.
- Existing homepage fragment identifiers receive compatibility behavior. A
  fragment must land on a visible gateway or map to the corresponding atlas or
  research destination.
- The production host is `https://frompoetrytodata.vercel.app`. Production
  metadata generation must not allow a deployment alias or incidental build
  environment to change scholarly identity.

### Homepage

- The first viewport contains the guiding question, a concise project answer,
  the corpus scope, the unit of analysis, the most important coverage
  qualification, and primary actions for guided reading, atlas exploration,
  and research review.
- The homepage does not eagerly load ECharts or the full analytical datasets.
- A small evidence preview may use semantic HTML or a lightweight static visual
  with a visible text/table alternative. It must not introduce a second metric
  definition.
- The four audience paths are: general reader, literary researcher,
  digital-humanities researcher, and data user.
- Methodology, citations, and data downloads remain visible in primary or
  secondary navigation rather than being hidden only in the footer.

### Atlas and shareable URL state

- The atlas supports these normalized state dimensions: query, entity type,
  attributed century, computational theme, metaphor family, research study,
  and sort order where relevant.
- Parameter names are stable ASCII identifiers; values use canonical entity
  identifiers rather than translated display labels when stable identifiers
  exist.
- Default values are omitted from the canonical URL. Parameters are serialized
  in deterministic order.
- Unknown parameter names are ignored. Invalid known values are removed with an
  accessible notice and the nearest safe default; they must not throw.
- Back and forward navigation restore filter state and focus context.
- Filter updates use replace-state while the user is still editing and
  push-state for a committed search or explicit share action, avoiding an
  unusable history entry per keystroke.
- The unfiltered atlas is canonical. Arbitrary filtered combinations are not
  separate indexable documents; they point to the unfiltered atlas canonical
  and are not added to sitemaps.
- Entity-result links use canonical generated entity URLs rather than encoding
  entity identity only in atlas state.
- The no-JavaScript atlas fallback provides static links to entity indexes,
  research studies, methodology, and downloads.

### Evidence, claims, charts, and tables

- A published-evidence record distinguishes raw corpus data, computed metric,
  statistical evidence, and literary interpretation.
- Each metric record includes a stable identifier, label, definition, unit,
  denominator, precision, source/version, values, and any required local
  qualification.
- Sensitive claim categories defined in `CONTEXT.md` require a local
  qualification. Rendering a sensitive claim without that field is a build or
  test failure.
- Each production chart touched by this redesign consumes a published-evidence
  record and exposes:
  - a concise pre-chart explanation;
  - the visible local methodological qualification;
  - an accessible name and summary;
  - a native data table with equivalent labels, ordering, units, precision,
    and active filters;
  - a related CSV/JSON download when a distribution exists.
- Chart and table values are projected from the same in-memory normalized data,
  not separately maintained literals.
- Color is not the only carrier of series, status, selection, increase, or
  decrease. Text labels, symbols, line styles, patterns, or table fields supply
  the second cue.
- Hover tooltips are supplementary. Essential values and qualifications remain
  available without hover or pointer input.
- Native table markup is preferred. ARIA grid behavior is not added unless the
  table truly becomes an interactive composite widget.

### Canonical data and download behavior

- Approval of this specification accepts ADR 0002: one generated source for
  displayed statistics and downloads.
- The first implementation scope creates a versioned publication artifact from
  the currently committed analytical sources. It does not recompute research
  findings or change their numeric values.
- Interactive views, accessible tables, static pages, metadata summaries, JSON,
  and CSV consume that artifact or typed projections of it.
- Formatting may localize a value for display but may not redefine, round at a
  different precision, or change its denominator independently.
- CSV remains UTF-8 with a BOM where the existing consumer contract requires
  it, stable documented headers, and numeric machine values.
- JSON includes a schema/publication version and preserves machine-readable
  numeric values.
- Each download discloses dataset identity, version/date, format, scope,
  license, provenance, and a stable citation. Approximate size and checksum are
  included where the release process can generate them reliably.
- Dataset citation and software citation are distinct research objects.
- The missing raw corpus TSV and nonportable Python paths are documented as a
  reproducibility limitation. This implementation must not fabricate the
  missing source, silently replace it, or imply that the entire analysis was
  rerun.

### Entity and research pages

- Poet pages expose identity, corpus coverage, attributed century, available
  works/records, related research and evidence, downloads where applicable,
  and the explicit statement that coverage is not literary importance.
- Century pages expose their attributed-century definition, represented poets,
  evidence summaries, related research, equivalent tables, and the distinction
  from composition century.
- Metaphor-family pages expose operational definition, membership terms or
  rules, trend evidence, examples, ambiguity, local qualification, and related
  downloads.
- Computational-theme pages continue to identify themes as computational
  constructs rather than complete literary meanings.
- Research-result pages expose, in this order: question, concise answer, evidence
  and unit of analysis, local qualification, chart/table where applicable,
  method and uncertainty, literary interpretation clearly labeled as such,
  citation, related downloads, and related entities.
- Generated page families share page models for identity, breadcrumb,
  metadata, citation, evidence, and qualification while keeping type-specific
  content explicit.

### Accessibility

- Target conformance is WCAG 2.2 Level AA for the implementation scope.
- Documents declare Persian language and RTL base direction at the root.
- Mixed-direction content such as URLs, DOI strings, identifiers, file names,
  code, and Latin titles is isolated with semantic direction markup.
- CSS uses logical properties for new and modified layout rules.
- All functionality is available from a keyboard without a timing requirement.
- Every interactive control has a visible focus indicator meeting non-text
  contrast requirements and not relying on color alone.
- DOM and focus order remain logical in RTL layouts.
- Dialogs move focus inside on open, contain Tab and Shift+Tab, close with
  Escape, and restore focus to a meaningful trigger.
- If tabs remain, they expose complete tab/tabpanel relationships, selection
  state, and expected arrow/Home/End behavior. Native disclosure or links are
  preferred when tab behavior is unnecessary.
- Dynamic result counts, errors, and successful citation copying use concise,
  noninterruptive status announcements.
- Touch targets, zoom, text reflow, reduced motion, forced colors, and
  200-percent text resizing are considered in responsive acceptance checks.

### Responsive and RTL behavior

- The supported presentation states are narrow mobile, wide mobile/tablet, and
  desktop; layout decisions are content-driven rather than tied to one device.
- No core page has two-dimensional page-level scrolling at 320 CSS pixels.
- Wide data tables may scroll inside a labelled region while keeping headers
  understandable and without trapping keyboard focus.
- Filters stack into a logical source order on narrow screens. Their visual RTL
  arrangement does not reverse their reading or tab order.
- Chart dimensions are reserved before rendering to avoid layout shift.
- Persian text remains right-aligned where appropriate; machine identifiers
  and URLs retain readable bidirectional isolation.

### Metadata, structured data, and SEO

- Canonical URL, Open Graph URL, social image URL, sitemap entry, JSON-LD
  identity, citation metadata, and visible citation share the official host.
- Research pages use `ScholarlyArticle` only when they are article-like and
  contain accurate title, author, publication date, version, and canonical
  identity.
- Build time is not substituted for scholarly publication date. A content
  modification date changes only when the content or evidence version changes.
- Dataset landing pages use `Dataset` and `DataCatalog` as applicable. Each
  downloadable distribution uses `DataDownload` with encoding format and URL.
- Entity pages use the most specific truthful page/entity vocabulary and
  breadcrumbs without inventing unsupported facts.
- Each generated research, poet, century, theme, and metaphor page has a unique
  title, description, canonical, breadcrumb path, and internal links.
- Static page content remains crawlable without relying on post-load client
  rendering.
- Filtered atlas query combinations are excluded from sitemaps and consolidate
  to the atlas canonical.
- Deployment configuration should redirect nonpreferred aliases to the official
  host when the hosting provider permits it. Regardless of alias behavior,
  production artifacts always declare the official canonical.

### Citation behavior

- Each citable page has a visible citation block with copy action and machine-
  readable metadata.
- The copy action copies exactly the displayed citation, excluding purely
  presentational direction characters.
- A successful copy produces visible and announced confirmation without moving
  focus.
- If the Clipboard API is unavailable or denied, the citation remains
  selectable and the interface provides a nonblocking fallback instruction.
- Citation fields are produced from one citation model, including title,
  creator, publication year, version, resource type, and canonical identifier.
- Research-page, dataset, and software citations remain distinct where they
  identify different objects.

### Analytics events

Analytics are emitted through a provider-neutral adapter. Provider selection,
consent infrastructure, and historical backfill are not part of this
specification. Event payloads must not include full raw search strings, poem
text, copied citation text, or other free-form user content.

Required event contracts:

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `homepage_primary_action` | A primary homepage path is activated | `destination`, `audience_path` |
| `audience_path_selected` | An audience card is activated | `audience`, `destination` |
| `atlas_search_committed` | Search is submitted or committed | `query_length_bucket`, `result_count`, `entity_type` |
| `atlas_filters_changed` | A filter selection is committed | `filter_keys`, `active_filter_count`, `result_count` |
| `atlas_share_activated` | The share/copy-link action is activated | `active_filter_count` |
| `entity_result_opened` | An atlas result opens | `entity_type`, `source_view` |
| `evidence_table_opened` | Equivalent table is revealed or focused | `metric_id`, `page_type` |
| `methodology_opened` | A local method link is activated | `claim_type`, `page_type` |
| `citation_copied` | Citation copy succeeds | `resource_type`, `citation_format` |
| `dataset_download_started` | A download link is activated | `dataset_id`, `format`, `version` |
| `recoverable_error_shown` | A defined data-loading error appears | `surface`, `error_category` |

### Performance

- The narrative homepage does not request the ECharts chunk or full research
  datasets before the user navigates to a visualization-dependent experience.
- Visualization-heavy code and datasets are split from the narrative homepage
  and loaded on demand.
- Off-screen charts remain deferred and reserve layout dimensions.
- Search/filter interaction avoids blocking work on every keystroke and remains
  responsive on representative lower-end mobile emulation.
- The implementation records the current bundle baseline and fails on
  unapproved regression beyond existing build budgets.
- Field targets are LCP at or below 2.5 seconds, INP at or below 200
  milliseconds, and CLS at or below 0.1 at the 75th percentile, segmented by
  mobile and desktop. These become monitored targets; absence of sufficient
  field data does not justify fabricating a pass.
- Lab verification must confirm no layout shift from late chart sizing and no
  eager homepage ECharts/data request.

### Loading, empty, error, and no-JavaScript states

- Loading regions retain their heading and expected dimensions, identify what
  is loading, and use `aria-busy` without repeatedly announcing animation.
- Empty results state the active constraint, show zero results, and offer clear
  reset or broader-search actions.
- Recoverable data errors identify the affected surface, preserve navigation
  and already loaded content, and offer retry.
- Invalid URL parameters produce a recoverable notice and normalized state
  rather than a generic error page.
- Core homepage, research, entity, methodology, citation, and download content
  is present in generated HTML.
- The no-JavaScript atlas state provides useful static navigation and data
  access rather than an empty application root.

### Migration strategy

1. Characterize current routes, generated page counts, representative
   statistics, downloads, and metadata before changing behavior.
2. Introduce the published-evidence schema and adapters over existing committed
   artifacts without changing numeric values.
3. Add cross-output integrity tests for representative metrics and every
   download family touched by the feature.
4. Add the narrative homepage and atlas shell behind stable public routes while
   keeping existing entity, research, utility, and fragment entry points valid.
5. Move visualization-heavy loading out of the narrative homepage only after
   parity tests cover existing atlas content.
6. Apply the shared evidence, qualification, citation, and metadata contracts
   to research and selected entity page generators.
7. Expand those contracts across all poet, century, metaphor, theme, and
   research page families through their generators.
8. Verify canonical host behavior in generated artifacts and document any
   hosting-provider redirect step that cannot be performed in the repository.
9. Deploy only after accessibility, browser, build, SEO, and data-integrity
   gates pass.

## Testing Decisions

### Public testing seams

The user approved three stable public seams:

1. **Browser behavior:** routes, navigation, RTL layout, keyboard operation,
   visible focus, filters, shareable URL behavior, chart/table interaction,
   citation copying, and loading/empty/error/no-JavaScript states.
2. **Built publication artifacts:** generated HTML page families, metadata,
   structured data, canonical identity, static fallback content, and route
   regression.
3. **Data contract:** canonical published-evidence records and their chart,
   table, JSON, and CSV projections.

Tests assert observable behavior and public output. They do not assert React
component structure, ECharts option-object internals, helper call counts, or
generator implementation details.

### Harness and prior art

- Existing Node tests and the SEO audit are prior art for built-artifact and
  generated-output checks.
- A browser test harness will exercise the built/previewed publication through
  roles, accessible names, URLs, and visible output.
- Automated accessibility checks supplement, but do not replace, keyboard and
  screen-reader-oriented behavior tests.
- Data-contract tests parse actual generated CSV and JSON and compare numeric
  values after normalization; they do not compare formatting strings such as
  `6` versus `6.0`.
- Tests use representative records from every generated page family and
  exhaustive schema/integrity checks where runtime remains reasonable.

### Vertical TDD slices

Implementation follows red-green-refactor slices in this order unless a
dependency requires a smaller preliminary slice:

1. Official canonical-host generation.
2. Narrative homepage navigation and no-JavaScript content.
3. Audience entry paths.
4. Atlas route and URL parser/serializer.
5. Search, filters, reset, history, and share behavior.
6. Loading, empty, invalid-filter, and recoverable-error states.
7. Global focus treatment and keyboard navigation.
8. Dialog and tab/disclosure behavior.
9. Published-evidence record and one representative chart/table pair.
10. Cross-output JSON/CSV equality for that representative metric.
11. Expansion to all touched chart and download families.
12. Citation model, copy behavior, and fallback.
13. Persian number display with preserved machine values.
14. Research-result page model and generation.
15. Poet, century, metaphor, and theme page generation.
16. Metadata and structured-data parity.
17. Performance loading boundaries and bundle regressions.
18. Existing-route and fragment compatibility.

For each slice: write one failing test, implement only enough behavior to pass,
refactor while green, then proceed.

### Required coverage

- Homepage primary and audience-path navigation.
- Responsive Persian RTL layout at narrow and desktop viewports.
- Keyboard-only navigation and visible focus.
- Dialog focus containment, Escape close, and focus restoration where dialogs
  remain.
- Search, filters, reset, result announcements, history, and shareable URLs.
- URL normalization for default, reordered, unknown, and invalid parameters.
- Chart and native-table equivalence from the same filtered dataset.
- Local qualification presence for every sensitive claim category.
- Displayed statistics matching the canonical publication artifact.
- CSV headers, encoding, parsing, row counts, numeric values, version, and
  integrity metadata.
- JSON parsing, schema/publication version, identifiers, and numeric equality.
- Citation rendering, copy success, copy fallback, and status announcement.
- Persian integers, decimals, percentages, years, and mixed-direction values
  while preserving machine data.
- Canonical, Open Graph, citation metadata, JSON-LD, publication dates,
  Dataset/DataDownload, and sitemap behavior.
- Generation and internal linking for research, poet, century, metaphor, and
  theme page families.
- Loading, empty, invalid-filter, recoverable-error, and no-JavaScript states.
- Existing canonical routes, downloads, API outputs, and homepage fragments.
- Homepage exclusion of eager ECharts and full analytical dataset requests.

### Completion gates

Before final review, run and pass:

- typechecking for all checked source;
- linting;
- focused tests during each slice;
- the complete test suite;
- the production build;
- the SEO audit;
- automated accessibility checks;
- keyboard-focused browser tests;
- responsive browser tests;
- no-JavaScript browser tests;
- generated data-integrity tests.

Any unexpected failure or performance regression uses the documented
diagnosis loop: reproduce, minimize, form competing hypotheses, instrument,
identify root cause, fix root cause, and add a regression test.

## Acceptance Criteria

1. `/` presents the narrative-first entry with a clear question, concise
   answer, corpus scope, unit of analysis, and local coverage qualification.
2. The homepage visibly offers guided reading, atlas exploration, research,
   methodology, citation, and data paths.
3. Four audience paths exist and lead to canonical content without duplicating
   page identity.
4. The homepage does not request ECharts or the full analytical datasets before
   a visualization-dependent destination is opened.
5. The atlas has a stable public URL and remains useful without JavaScript
   through static navigation and data links.
6. Search and every specified filter are operable by keyboard and represented
   in a normalized, shareable URL.
7. Refresh, back, forward, copied URL, defaults, unknown parameters, and invalid
   parameters produce the specified state.
8. Empty, loading, recoverable-error, and invalid-filter states are visible,
   announced where appropriate, and provide recovery actions.
9. Every production chart touched by the redesign has a visible qualification,
   accessible summary, and native equivalent table.
10. Automated tests prove chart and table equality after active filtering,
    including labels, ordering, units, precision, and values.
11. No series, state, or comparison relies on color alone.
12. All functionality in scope is keyboard operable with a visible
    high-contrast focus indicator.
13. Dialogs and remaining composite widgets meet their specified focus and
    keyboard contracts.
14. Modified pages reflow at 320 CSS pixels without page-level horizontal
    scrolling; labelled table regions may scroll internally.
15. Modified pages preserve Persian root language/direction and isolate mixed-
    direction identifiers and URLs.
16. A sensitive claim cannot be generated without its required local
    methodological qualification.
17. Research pages visibly distinguish computed metric, statistical evidence,
    and literary interpretation.
18. Poet pages state that corpus coverage is not literary importance.
19. Century pages distinguish attributed century from composition century.
20. Metaphor pages expose operational membership and semantic limitations.
21. Similarity, attribution, anomaly, ranking, and association claims retain
    the qualifications defined in `CONTEXT.md`.
22. The same versioned published-evidence record supplies every touched visible
    statistic, chart, table, generated page, JSON, and CSV projection.
23. No existing research value or dataset is silently changed.
24. CSV and JSON outputs parse successfully, retain documented schemas and
    versions, and match canonical numeric values.
25. Every download in scope exposes identity, version, format, scope, license,
    provenance, and citation; checksum is included when generated reliably.
26. Dataset and software citations remain distinct.
27. Visible and copied citations agree with canonical metadata, and copy
    failure has an accessible fallback.
28. Research, poet, century, metaphor, and theme page families generate the
    expected routes and internal links.
29. Generated pages remain readable without JavaScript.
30. Research pages use truthful scholarly metadata and do not substitute build
    time for publication date.
31. Dataset landing and distribution pages expose valid Dataset/DataCatalog/
    DataDownload structured data where applicable.
32. Canonical, social, sitemap, citation, and structured-data URLs use
    `https://frompoetrytodata.vercel.app`.
33. Filtered atlas permutations are not added to sitemaps and consolidate to
    the atlas canonical.
34. Existing poet, century, metaphor, theme, research, methodology, glossary,
    data, API, and download routes do not regress.
35. Existing homepage fragments reach an equivalent visible gateway or
    destination.
36. Analytics events conform to the documented names and property allowlists
    and contain no raw query or content text.
37. Typecheck, lint, focused tests, full tests, production build, SEO audit,
    accessibility checks, browser tests, and data-integrity checks all pass.
38. Final code review has no blocking Standards or Specification findings.

## Out of Scope

- Rewriting research findings, literary interpretation, or methodological
  prose without new evidence.
- Recomputing the corpus or changing published metric definitions.
- Fabricating or sourcing a replacement for the missing raw TSV.
- Claiming complete end-to-end reproducibility before raw-source provenance is
  restored.
- Replacing ECharts solely for aesthetic or architectural preference.
- Migrating from Vite/React to another framework or introducing a new CMS.
- A broad rewrite of the Python analysis pipeline.
- A speculative universal design-system package.
- New research studies, new poet attributions, or new literary rankings.
- Treating corpus coverage as importance, popularity, influence, or quality.
- Treating association as causation, similarity as influence, or anomaly as a
  definitive attribution judgment.
- User accounts, saved server-side workspaces, comments, annotations, or
  personalization.
- Selecting or procuring an analytics provider, consent-management platform,
  DOI registration service, or long-term repository.
- Historical analytics backfill.
- Translation into a non-Persian product experience.
- Broad refactors outside modules required by this specification.

## Further Notes

- The disposable prototype is evidence for information hierarchy, states, and
  public URL behavior only. Its markup and styling are not production code.
- `CONTEXT.md` is the source for stable domain vocabulary. This specification
  is the feature contract and must not be copied into that context document.
- ADR 0001 remains mandatory for local methodological qualifications.
- Approval of this specification changes ADR 0002 from Proposed to Accepted.
- The architecture assessment follows approval and must distinguish required
  feature changes, safe preparatory refactors, and optional future work. Any
  architecture expansion beyond this specification requires separate approval.
- GitHub Issues is the configured tracker. Because authenticated GitHub write
  access was unavailable while drafting, this document is the proposed local
  specification. Product approval of this exact document authorizes it as the
  implementation reference; it may later be copied to a `ready-for-agent`
  GitHub issue without changing scope.
