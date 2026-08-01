# Computational aesthetics study

- Status: Approved locally by the product owner
- Date: 2026-07-29
- Issue: GitHub publication blocked — connector returned HTTP 403 for the
  confirmed repository `Hhhkarimi/frompoetrytodata`
- Selected prototype direction: integrated narrative, explorer, research, and
  audience paths
- Related domain context: `CONTEXT.md`
- Related durable decisions: ADR 0001, ADR 0002, and ADR 0003
- Related research:
  `docs/research/computational-aesthetics-guidance.md`

## Problem Statement

From Poetry to Data has a completed computational-aesthetics study covering
676,748 unique couplets or operational two-line units from 67 poets or
creators. The supplied result set contains ten selected units for every poet,
eight model-evaluated dimensions, a weighted overall score, within-poet rank,
source identifiers, and percentile values. The results currently exist only in
a Word report and a CSV file and are not integrated into the publication.

Readers cannot yet:

- understand the study question, method, result, and limitations as a public
  research page;
- explore the eight dimensions without mistaking them for a human judgement of
  beauty;
- reach the ten selected couplets from each canonical poet profile;
- compare dimensions and poets without creating an overall literary
  leaderboard;
- inspect equivalent chart and table values;
- cite the study or download versioned CSV and JSON results;
- verify that displayed scores, generated pages, and downloads agree.

The publication must add these results without exposing the Word source,
silently changing the supplied scores, creating duplicate poet entities, or
describing model output as human critical consensus. It must also replace the
English word `canonical` wherever that word is visible in the Persian user
interface while preserving the technical HTML relationship
`rel="canonical"`.

## Solution

Add an eleventh research study dedicated to computational aesthetics. Its
stable research page combines the four already selected product directions:

1. a narrative introduction beginning with the question of whether aspects of
   a couplet's aesthetics can be explored computationally;
2. an explorer for poets, attributed centuries, score dimensions, sources, and
   selected couplets with shareable URL state;
3. a research-first evidence section containing definitions, weights, model
   provenance, aggregate findings, accessible charts and tables, methodology,
   limitations, citation, and downloads;
4. audience-oriented next paths for general readers, literary researchers,
   digital-humanities researchers, and data users.

Every existing canonical poet page receives one linkable computational-
aesthetics section containing that poet's ten selected units, eight-dimension
profile, within-poet score summary, source information, local qualification,
and path back to the study. No parallel poet-profile route is created.

The supplied CSV is ingested into a validated, versioned publication artifact.
The research page, poet sections, charts, tables, CSV, JSON, metadata, and
structured data consume projections of that artifact. The Word report remains
a private source used for reconciliation and is never emitted as a public
asset or download.

The publication states that the eight dimensions were evaluated by
GPT-5.6-sol, no human aesthetic scoring or labelling was performed, and the
overall score is a documented weighted composition of those model outputs.
Because no first-party run record is supplied, the model attribution is
identified in provenance metadata as declared by the project owner rather than
independently verified by this implementation.

## User Stories

1. As a general reader, I want the study to begin with a plain-Persian
   question, so that I understand why computational aesthetics is being
   explored.
2. As a general reader, I want a concise answer before the first chart, so that
   I know what the evidence can and cannot show.
3. As a general reader, I want “beauty” framed as eight operational dimensions,
   so that I do not mistake the score for an objective universal definition.
4. As a general reader, I want the phrase «ده بیت با بالاترین امتیاز
   زیبایی‌شناختی محاسباتی», so that the selection is not presented as a
   definitive list of a poet's best work.
5. As a general reader, I want a visible statement that the evaluation was not
   human, so that I understand the nature of the judgement.
6. As a general reader, I want Persian display numbers, so that ranks,
   dimensions, scores, and counts are easy to read.
7. As a general reader, I want each selected couplet shown as two readable
   lines, so that the computational result remains connected to poetry.
8. As a general reader, I want the book and poem source beside each couplet, so
   that I can locate its context.
9. As a general reader, I want a clear next path to a poet profile, so that I
   can continue from the global study to a named poet.
10. As a general reader, I want a clear path from a poet profile back to the
    study, so that I can understand how the score was produced.
11. As a literary researcher, I want the eight dimensions defined
    operationally, so that I can assess what each score represents.
12. As a literary researcher, I want the dimension weights visible, so that I
    can inspect how the overall score is composed.
13. As a literary researcher, I want the distinction between model evaluation
    and literary interpretation explicit, so that an automated score is not
    presented as critical consensus.
14. As a literary researcher, I want the within-poet rank clearly labelled, so
    that rank 1 for one poet is not treated as directly equivalent to rank 1
    for another.
15. As a literary researcher, I want comparisons qualified as comparisons of
    the ten selected units in this run, so that author-wide quality is not
    inferred.
16. As a literary researcher, I want the verse-out-of-context limitation near
    the results, so that narrative and poem-level context are not hidden.
17. As a literary researcher, I want modern poetry described as an operational
    two-line unit where applicable, so that “couplet” is not falsely treated as
    a classical prosodic unit.
18. As a literary researcher, I want the approximate treatment of metre and
    music disclosed, so that the music score is not confused with complete
    prosodic scansion.
19. As a literary researcher, I want rule- and model-sensitivity limitations
    disclosed, so that apparent precision is not mistaken for certainty.
20. As a literary researcher, I want a stable citation for the research page,
    so that I can cite the exact published version.
21. As a literary researcher, I want the copied citation to match the visible
    citation and publication metadata, so that references remain consistent.
22. As a digital-humanities researcher, I want the exact corpus scope and
    filtering stages, so that I understand the evaluated population.
23. As a digital-humanities researcher, I want the exact model name represented
    as owner-supplied provenance, so that verified and unverified provenance
    are not conflated.
24. As a digital-humanities researcher, I want the absence of human labels or
    aesthetic review declared, so that no human baseline is implied.
25. As a digital-humanities researcher, I want the source corpus version or
    checksum recorded when available, so that the input identity is auditable.
26. As a digital-humanities researcher, I want rubric, prompt, run, and model
    parameters recorded when available, so that reproducibility can be assessed.
27. As a digital-humanities researcher, I want missing run records identified
    as a reproducibility limitation, so that the publication does not overclaim
    exact reproducibility.
28. As a digital-humanities researcher, I want the overall score recomputable
    from the eight dimensions and documented weights, so that aggregation can
    be independently verified.
29. As a digital-humanities researcher, I want score domains, precision, and
    percentile definitions, so that values are not ambiguous.
30. As a digital-humanities researcher, I want selection, deduplication, source
    diversity, and tie rules documented, so that top-ten membership can be
    interpreted.
31. As a digital-humanities researcher, I want raw source labels preserved
    separately from canonical poet identity, so that normalization remains
    auditable.
32. As a digital-humanities researcher, I want the Nima Yushij alias mapped to
    the existing Nima profile, so that no duplicate entity is generated.
33. As a digital-humanities researcher, I want the Aliyar alias mapped to the
    existing Aliyar profile, so that spacing differences do not create a new
    poet.
34. As a visitor with a poet in mind, I want to search the study by poet name,
    so that I can reach the relevant canonical profile quickly.
35. As an explorer, I want to filter by attributed century, so that I can
    narrow the 67 poet profiles.
36. As an explorer, I want to choose one of the eight dimensions, so that I can
    compare a specific operational feature.
37. As an explorer, I want default poet ordering by attributed century and
    name, so that the interface does not begin as a literary leaderboard.
38. As an explorer, I want optional sorting by overall score or a selected
    dimension, so that I can inspect this run's numerical pattern.
39. As an explorer, I want score sorting labelled as model-output sorting, so
    that it is not read as ranking literary importance.
40. As an explorer, I want active filters and sort represented in the URL, so
    that the same view can be refreshed, bookmarked, or shared.
41. As an explorer, I want default values omitted and parameters serialized in
    deterministic order, so that equivalent views have stable URLs.
42. As an explorer, I want invalid filters removed safely with an accessible
    notice, so that malformed shared links do not break the page.
43. As an explorer, I want a global reset action, so that I can return to the
    chronological unfiltered study.
44. As an explorer, I want result counts announced without focus movement, so
    that filter changes are understandable to assistive technology.
45. As an explorer, I want an explicit empty state with recovery controls, so
    that zero matches do not resemble a data failure.
46. As a keyboard user, I want all filters and sorting controls to use native
    keyboard-operable controls, so that pointer input is unnecessary.
47. As a keyboard user, I want visible high-contrast focus, so that my current
    location is always clear.
48. As a keyboard user, I want logical DOM and focus order in RTL, so that
    visual direction does not reverse interaction semantics.
49. As a screen-reader user, I want a concise summary before each chart, so
    that I understand its purpose without inspecting graphical marks.
50. As a screen-reader user, I want a native table equivalent for every chart,
    so that all values and relationships are available nonvisually.
51. As a screen-reader user, I want chart and table filters to remain
    equivalent, so that both representations show the same subset and order.
52. As a low-vision user, I want labels, patterns, shapes, or line styles in
    addition to color, so that color is never the only distinction.
53. As a user who opens a chart tooltip, I want every essential value available
    elsewhere, so that hover is supplementary rather than required.
54. As a mobile visitor, I want filters to stack and remain touch-friendly, so
    that the explorer works at narrow widths.
55. As a mobile visitor, I want couplet text to remain readable without
    horizontal scrolling, so that poetry is not compressed into tiny columns.
56. As a mobile visitor, I want wide data tables contained in labelled,
    keyboard-scrollable regions, so that page layout does not overflow.
57. As a reduced-motion user, I want nonessential chart animation disabled, so
    that the study remains comfortable.
58. As a visitor on a slow connection, I want a meaningful loading state, so
    that deferred study data does not leave a blank page.
59. As a visitor after a load failure, I want a retry action and a path to
    static data, so that I can recover without trusting partial values.
60. As a visitor without JavaScript, I want the research summary, method,
    limitations, citation, downloads, poet links, and tables available, so that
    the scholarly core is not client-only.
61. As a data user, I want a UTF-8 CSV distribution containing all 670 records,
    so that I can analyse the study in tabular tools.
62. As a data user, I want a schema-versioned JSON distribution containing the
    same 670 records, so that I can consume the study programmatically.
63. As a data user, I want stable ASCII field names and numeric machine values,
    so that localisation does not corrupt parsing.
64. As a data user, I want a data dictionary for every field, so that IDs,
    scores, ranks, percentiles, sources, and aliases are understandable.
65. As a data user, I want CSV and JSON versions, dates, provenance, licences,
    sizes, and checksums, so that released artifacts can be identified.
66. As a data user, I want the CSV and JSON record sets to be equivalent, so
    that format choice does not change the evidence.
67. As a data user, I want a dataset citation separate from the website/software
    citation, so that I can cite the correct research object.
68. As a visitor, I do not want the supplied Word report exposed as a download,
    indexed asset, or structured-data distribution, so that only approved
    results are public.
69. As a search engine, I want the study page to have a unique title,
    description, canonical URL, breadcrumbs, and internal links, so that the
    eleventh study can be discovered.
70. As a scholarly indexer, I want article-like metadata with the actual human
    author, publication date, version, and abstract, so that the model is not
    incorrectly represented as the author.
71. As a dataset indexer, I want a distinct Dataset identity with eight
    variables and two DataDownload distributions, so that data and article
    identities remain separate.
72. As a search engine, I want arbitrary filtered URLs excluded from the
    sitemap and consolidated to the unfiltered study URL, so that filter
    permutations do not create duplicate indexable pages.
73. As a returning visitor, I want all existing routes to keep working, so that
    the new study does not regress the current publication.
74. As a visitor reading Persian interface text, I want visible uses of
    `canonical` replaced with «مرجع» or «یکپارچه», so that the interface does
    not contain avoidable English jargon.
75. As a maintainer, I want ingest validation to reject missing fields,
    duplicate record IDs, duplicate poet ranks, or out-of-domain scores, so
    that invalid results cannot be published.
76. As a maintainer, I want validation to require exactly 67 poets and ten
    records per poet for this supplied version, so that partial ingestion fails
    loudly.
77. As a maintainer, I want tests to recompute every overall score from its
    dimensions, so that aggregation drift is detected.
78. As a maintainer, I want chart, table, generated HTML, CSV, and JSON values
    compared at stable public seams, so that independent presentation literals
    cannot diverge.
79. As a maintainer, I want generated-page coverage for all 67 poet profiles,
    so that a mapping or generator change cannot silently omit a poet.
80. As the publication owner, I want analytics for study entry, filter use,
    poet navigation, table reveal, citation copy, and downloads, so that the
    study can be improved without collecting raw search or poem text.

## Implementation Decisions

### Domain terminology and claim boundaries

- **Computational aesthetics — زیبایی‌شناسی محاسباتی:** an exploratory
  model-based measurement of explicitly defined textual dimensions. It is not
  a universal theory of beauty.
- **Model evaluation — ارزیابی مدل:** scores assigned to the eight dimensions
  by GPT-5.6-sol according to the study rubric. The publication states that no
  human aesthetic scoring or labelling was performed.
- **Dimension score — نمرهٔ شاخص:** a zero-to-100 score for symbolism, imagery,
  figurative language, music, semantic compression, emotion, structure, or
  novelty.
- **Overall score — نمرهٔ کل:** the weighted sum of the eight dimension scores:
  18% symbolism; 14% imagery, figurative language, and music; 12% compression
  and emotion; 8% structure and novelty.
- **Within-poet rank — رتبهٔ درون‌شاعر:** rank 1–10 among the selected records
  for one poet. It is not a cross-poet literary rank.
- **Selected unit — واحد برگزیده:** a source-preserving two-line record. It is
  a classical couplet where the source structure supports that term and an
  operational consecutive-two-line unit for modern/free-verse material.
- **Owner-supplied model provenance:** the project owner's statement that
  GPT-5.6-sol produced the eight evaluations. Until a first-party run record is
  available, the application must not describe the attribution as independently
  verified.
- Every score, order, “highest”, “top ten”, poet comparison, and model
  capability claim carries a local qualification.
- The publication never infers literary importance, influence, canonical
  status, historical causation, critical consensus, or human preference from
  these scores.

### Information architecture and public routes

- The study becomes the eleventh item in the existing research hub and has one
  stable unfiltered research URL.
- The research page uses one integrated layout: narrative question and answer,
  explorer, evidence and method, and audience next paths.
- Existing poet URLs remain the only canonical poet profiles. Each receives a
  linkable computational-aesthetics section; no nested duplicate poet page is
  generated under the research URL.
- The study and every enriched poet page link to each other.
- Existing routes, fragments, sitemap entries, and entity families remain
  valid.

### Canonical study artifact

- The supplied CSV is an immutable ingest source, not a presentation data file.
- Ingest produces one versioned canonical study artifact with:
  - publication schema/version and generation date;
  - study identity and title;
  - owner-supplied model-provenance statement;
  - rubric/model/run fields, explicitly nullable when unknown;
  - eight dimension definitions and weights;
  - corpus and selection summaries;
  - explicit poet-name alias mapping;
  - all 670 selected records;
  - precomputed but reproducible poet summaries;
  - limitations and local qualification;
  - source and released-artifact checksums.
- Required record fields include canonical poet ID/slug, source poet label,
  attributed century, within-poet rank, source record ID, book title, poem
  title, two lines, eight numeric dimension scores, weighted overall score, and
  within-poet percentile.
- The original source label remains available after alias mapping.
- Ingest fails on schema mismatch, missing data, duplicate source ID, duplicate
  poet/rank, an unexpected poet count, an unexpected per-poet record count,
  nonnumeric score, score outside zero to 100, overall-score residual outside
  the source rounding tolerance, or an unmapped poet.
- The two known aliases map to existing Nima Yushij and Aliyar entities. Alias
  mapping is explicit and regression-tested.
- Displayed poet means and maxima are derived from the record array, not copied
  from the Word tables.
- The Word report is a reconciliation source only. It is not copied into a
  public directory, build output, download manifest, sitemap, feed, API,
  structured data, or repository package intended for deployment.

### Research page

- The first view contains the question, concise answer, evaluated-unit count,
  poet count, dimension count, unit of analysis, AI-evaluation disclosure,
  principal qualification, and direct links to explorer, method, citation, and
  data.
- The research narrative distinguishes model evaluation, computed aggregation,
  statistical description, and literary interpretation.
- Aggregate sections may include score distribution, attributed-century
  description, dimension relationships, symbolic enrichment, sensitivity
  results, and selected examples only when their values are present in the
  canonical artifact.
- No aggregate is reconstructed from prose or chart pixels in the Word report.
  A result absent from the validated artifact is omitted until its source data
  is supplied.
- Poet comparison defaults to attributed century then Persian display name.
  Optional numeric sorting is labelled as sorting this run's model outputs.
- Each poet result links to the canonical poet profile rather than opening a
  parallel profile.
- Filters support poet query, attributed century, selected dimension, and sort
  order.
- Stable URL parameters use ASCII names and deterministic ordering. Defaults
  are omitted; unknown parameters are ignored; invalid known values are removed
  with an accessible notice.
- The unfiltered research page is canonical. Filtered permutations are not
  included in sitemaps or treated as separate scholarly articles.

### Poet-profile section

- All 67 existing poet pages receive the study section.
- The section contains attributed century, mean and maximum overall score among
  the ten selections, dominant mean dimension, the eight-dimension profile,
  and ten source-preserving selected records.
- Each selected record contains within-poet rank, two-line text, book title,
  poem title, overall score, and access to all eight dimension scores.
- Details may use progressive disclosure, but rank, couplet, source, overall
  score, AI disclosure, and main qualification remain visible without opening
  a tooltip.
- A poet page never says or implies that its ten selected records are the
  poet's objectively or humanly “best” poems.
- Poet identity, title, canonical metadata, and existing research links remain
  authoritative; the new section is an enrichment, not a replacement page.

### Charts and equivalent tables

- Charts use the existing visualization stack and shared accessible-evidence
  adapter rather than introducing a new chart library.
- Each chart has a concise explanation before it, an accessible name/summary,
  a visible local qualification, and a native table derived from the same
  filtered data object.
- The primary precise eight-dimension comparison uses bars or small multiples.
  A radar chart may be included only as a supplementary overview and never as
  the sole representation.
- Chart and table equivalence includes labels, selected subset, values, scale,
  units, precision, sorting, source identity, and active filters.
- Color is never the only series or state cue. Direct labels, marker shape,
  line style, pattern, or table columns provide a second cue.
- Essential values and caveats never exist only in tooltips.
- Native filters remain the efficient keyboard and screen-reader path; hundreds
  of chart marks are not added to the tab order merely to claim interactivity.
- Tables use semantic headers and may scroll inside a labelled container on
  narrow screens without causing page-level horizontal overflow.

### AI disclosure and methodology

- The visible disclosure says the eight dimension evaluations were produced by
  GPT-5.6-sol and were not human aesthetic judgements or human labels.
- The overall score is described as a weighted calculation over model outputs,
  not as a separate human verdict.
- Provenance metadata distinguishes:
  - the human author/creator of the publication;
  - the project owner who supplied the model-provenance statement;
  - GPT-5.6-sol as the declared software evaluator;
  - the aggregation and selection pipeline as computational activities.
- Unknown prompt, run, snapshot, parameter, retry, or log details remain
  explicitly unknown. The publication does not claim exact reproducibility
  without them.
- Required local limitations include lack of a human baseline, model/rubric
  sensitivity, approximate music/prosody, rule sensitivity for figurative
  features where applicable, novelty relative to this corpus, corpus
  imbalance, analysis outside full-poem context, and the modern-poetry unit
  caveat.

### Downloads and citation

- Publish one UTF-8 CSV and one schema-versioned JSON distribution from the
  canonical artifact.
- Both distributions contain the same 670 records and stable machine fields.
- Published downloads include version/date, scope, licence, provenance, byte
  size, and SHA-256 checksum in the existing download manifest.
- Download filenames and public URLs are stable and descriptive.
- The data page gains a clearly qualified entry for the computational-
  aesthetics dataset.
- The Word file is not a distribution and is not linked publicly.
- The research article citation and dataset citation are distinct and
  internally consistent.
- Citation copy uses the existing accessible clipboard behavior and preserves a
  visible fallback when clipboard access fails.

### SEO and structured data

- The research page emits article-like metadata only when the page contains the
  full article elements required by the publication contract.
- The human publication author remains the author. GPT-5.6-sol is represented
  through methodology/provenance, not falsely as the human author.
- A distinct Dataset node identifies the result set, its eight
  `variableMeasured` values, measurement technique, creator/publisher, version,
  dates, licence, derivation, and stable identity.
- CSV and JSON are two DataDownload distributions of the same Dataset with
  absolute URLs, MIME types, and sizes.
- The article and dataset link to one another but retain distinct citations and
  identifiers.
- Generated title, description, canonical URL, breadcrumbs, sitemap, feed,
  content index, research API, and internal links include the eleventh study.
- The Word source is absent from structured data and crawlable output.

### Responsive, RTL, and localisation

- Document language and base direction remain Persian RTL.
- Layout uses logical properties and logical DOM order.
- Latin model identifiers, URLs, IDs, MIME types, hashes, and code are
  directionally isolated.
- Persian digit formatting remains a display concern; downloads and structured
  data preserve machine numbers.
- Visible English `canonical` wording is replaced contextually with «مرجع»,
  «اصلی», or «یکپارچه». Technical code, identifiers, test names, and
  `rel="canonical"` remain unchanged.
- Controls meet existing touch-target and focus contracts at mobile widths.
- Long couplets wrap naturally and wide tables are contained.

### Loading, empty, error, and no-JavaScript behavior

- Loading state identifies the study data being loaded and uses `aria-busy`
  without announcing decorative skeletons.
- Empty state identifies active filters and offers reset/recovery.
- Error state does not render partial or stale values as current; it offers
  retry and links to static tables/downloads.
- No-JavaScript output contains the research answer, domain and model
  disclosures, limitations, citation, downloads, poet links, and equivalent
  tables.
- Invalid URL state never causes a blank or unhandled-error page.

### Analytics

- Approved events include study view, explorer use, filter commit, sort commit,
  poet-profile navigation, poet-section view, table reveal, methodology open,
  citation copy result, and CSV/JSON download.
- Event properties use approved categorical IDs such as study ID, dimension ID,
  attributed century, sort key, result-count band, and outcome.
- Raw search strings, poet text, couplet text, source titles, clipboard
  contents, URLs containing queries, and model prompts are never collected.
- Unknown events or properties continue to fail closed.

### Migration strategy

1. Preserve the supplied source files outside public build output and record
   their checksums.
2. Add the validator and canonical artifact generator without changing routes.
3. Validate all 670 records, formulas, aliases, and Word/CSV reconciliation.
4. Add public-data projections and tests before rendering new page content.
5. Add the eleventh research metadata record and generated research page.
6. Enrich all 67 canonical poet pages through the existing generator.
7. Add explorer behavior, charts, equivalent tables, citation, and downloads.
8. Add structured data, sitemap/feed/index integration, analytics, and
   no-JavaScript output.
9. Replace visible user-interface uses of `canonical` with Persian wording.
10. Run the full quality gates and confirm that existing public routes and
    research results are unchanged.

No migration step silently edits the source CSV or Word report. Corrections to
source research data require a new explicit source version and regenerated
artifacts.

## Testing Decisions

Tests assert observable public contracts rather than component internals.
Existing browser, accessibility, generated-build, publication, data-contract,
chart-table, Persian-formatting, URL-state, analytics, and route-compatibility
tests are the prior art.

The approved public seams are:

1. **Canonical data seam:** validated study artifact and its public CSV/JSON
   projections.
2. **Generated-build seam:** research HTML, all 67 enriched poet pages,
   metadata, structured data, sitemap, feed, and absence of the Word file.
3. **Browser behavior seam:** search, filtering, sorting, shareable URLs,
   keyboard operation, focus, citation copy, and loading/empty/error behavior.
4. **Publication-integrity seam:** normalized equivalence among chart data,
   tables, generated HTML, CSV, and JSON.

Required coverage includes:

- exactly 670 records, 67 canonical poets, and ten unique ranks per poet;
- required fields, unique IDs, score domains, and no missing values;
- exact alias resolution for Nima Yushij and Aliyar without duplicate pages;
- recomputation of all overall scores within the documented source rounding
  tolerance;
- stable poet summaries derived from records;
- source text and source titles preserved in CSV/JSON and generated pages;
- research hub count increases from ten to eleven;
- all 67 existing poet routes include the new section;
- existing poet, century, metaphor, theme, research, data, methodology, and
  atlas routes remain valid;
- default historical poet ordering and optional qualified score sorting;
- URL round-trip, deterministic serialization, invalid-value recovery, reset,
  and back/forward restoration;
- chart/table equivalence under every filter and sort;
- keyboard-only filter, sort, table, disclosure, and citation workflows;
- visible focus and automated accessibility checks;
- Persian display numbers and machine-number preservation;
- UTF-8 CSV parse integrity and schema-versioned JSON parse integrity;
- CSV/JSON record and field equivalence;
- manifest size/checksum integrity;
- visible AI/nonhuman disclosure and required local qualifications;
- accurate article/dataset/DataDownload structured data;
- copied and visible citation equivalence;
- loading, empty, error, mobile RTL, and no-JavaScript states;
- absence of the Word filename and bytes from build output, public manifests,
  HTML, APIs, sitemap, feed, and structured data;
- replacement of visible `canonical` wording without altering technical
  canonical metadata;
- analytics allow-list behavior and raw-content exclusion;
- performance boundaries that keep large study data and visualization code off
  the narrative homepage.

Implementation follows vertical red-green-refactor slices. Typechecking and
focused tests run regularly; lint, the complete test suite, production build,
SEO audit, accessibility checks, and available browser/end-to-end checks run
before completion.

## Acceptance Criteria

1. The research hub presents eleven studies and links to one stable
   computational-aesthetics page.
2. The study page combines narrative, explorer, research, and audience paths
   without creating duplicate content identities.
3. All 67 canonical poet pages contain a linkable study section with exactly
   ten selected units.
4. The public study dataset contains exactly 670 valid records.
5. All overall scores match the documented weighted formula within source
   rounding tolerance.
6. Nima Yushij and Aliyar source labels resolve to existing poet profiles and
   do not create duplicate entities.
7. The first visible score context states that evaluation was produced by
   GPT-5.6-sol and was not human aesthetic scoring or labelling.
8. The model attribution is recorded as owner-supplied unless a first-party run
   record is added.
9. Every rank and poet comparison carries the required local qualification.
10. Default poet order is historical/name order; numerical sorting is optional
    and explicitly labelled as model-output sorting.
11. Every production chart has a concise explanation, visible qualification,
    accessible summary, and exactly equivalent native table.
12. Chart, table, poet page, research page, CSV, JSON, and structured-data
    values derive from one versioned artifact.
13. Filters and sorting are keyboard operable and round-trip through stable
    shareable URLs.
14. Loading, empty, error, mobile RTL, reduced-motion, and no-JavaScript states
    are implemented and tested.
15. CSV and JSON contain equivalent records and publish version, provenance,
    licence, size, and verified SHA-256 checksums.
16. The Word source is not downloadable, indexed, copied to build output, or
    represented as a DataDownload.
17. Research article and dataset identities, citations, and structured data are
    distinct and internally consistent.
18. The study page and enriched poet pages have correct titles, descriptions,
    canonical URLs, internal links, breadcrumbs, and structured data.
19. Visible uses of the English word `canonical` are replaced with appropriate
    Persian wording while technical canonical metadata remains valid.
20. Existing route, publication, data-integrity, accessibility, performance,
    analytics, and SEO regression tests remain green.
21. Typecheck, lint, focused tests, full test suite, production build, SEO
    audit, accessibility checks, and available browser checks pass.

## Out of Scope

- Publishing or offering the supplied Word report as a download.
- Creating a second poet-profile URL family under the study.
- Re-scoring any source record or changing any supplied score.
- Claiming that the model establishes objective beauty, literary importance,
  influence, canonical status, historical causation, or human preference.
- Claiming human validation, peer review, or a human baseline that did not
  occur.
- Claiming independently verified GPT-5.6-sol provenance without a first-party
  run record.
- Reconstructing missing aggregate values from raster charts or prose.
- Rewriting the existing corpus-analysis pipeline beyond the seams required to
  ingest and publish this study.
- Replacing React, Vite, ECharts, generated static pages, or the existing
  routing architecture.
- Broad redesigns of unrelated research or entity pages.
- Silent poet-name, century, source-text, or dataset corrections.
- Building a literary leaderboard or selecting one “best poet”.
- Adding new human literary interpretations without evidence and review.
- Adding model prompts, provider logs, or run records that have not been
  supplied.

## Further Notes

- The supplied CSV passed preliminary validation: 670 rows, 67 poets, ten
  unique ranks per poet, no empty fields, no duplicate IDs, no duplicate
  couplets, scores within zero to 100, and weighted-score residual within
  rounding tolerance.
- All 670 detailed Word table rows reconcile with the supplied CSV. LibreOffice
  page rendering was unavailable in the current sandbox because `/proc` is not
  mounted, but all 15 embedded figures, 107 tables, 479 paragraphs, section
  structure, and source text were inspected through the DOCX package.
- The research source reports 676,748 unique scored units, 54,524 source texts,
  67 poets/creators, and 13 attributed centuries. These counts must be
  validated against the publication artifact before release.
- Exact model-run metadata has not been supplied. The publication must preserve
  that limitation rather than treating the user statement as a signed provider
  log.
