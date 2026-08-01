# Supplemental primary-source guidance for the computational-aesthetics study

Research date and last source check: 2026-07-29

This note supplements
[`primary-source-guidance.md`](./primary-source-guidance.md). It records only
requirements and guidance specific to publishing the AI-generated
computational-aesthetics results, their multidimensional charts, and their
CSV/JSON distributions.

## Source status

- WCAG 2.2 success criteria are normative for a WCAG conformance claim. WAI
  tutorials and Authoring Practices are informative implementation guidance.
- NIST AI RMF 1.0 and its Generative AI Profile are voluntary risk-management
  guidance, not a certification or a legal requirement.
- W3C PROV-O is a W3C Recommendation for interoperable provenance descriptions.
- Schema.org and Google Search documentation describe structured-data
  vocabulary and Google eligibility guidance. Markup does not guarantee a
  search feature.
- DataCite guidance applies directly when registering DataCite metadata; in
  this project it is otherwise an interoperability convention.

## External requirements and guidance

### 1. Multidimensional charts, tables, keyboard use, and screen readers

WCAG 2.2 requires information and relationships conveyed visually to be
programmatically determinable or available in text (1.3.1), prohibits relying
on sensory characteristics or color alone (1.3.3 and 1.4.1), requires
meaningful graphical objects and control states to have at least 3:1 contrast
against adjacent colors at Level AA (1.4.11), and requires all functionality to
be operable from a keyboard with a visible, unobscured focus indication (2.1.1,
2.4.7, and 2.4.11). Custom hover/focus content, including chart tooltips, must
also be dismissible, hoverable, and persistent under the conditions in 1.4.13.
Interactive chart controls need programmatic name, role, and state/value under
4.1.2.

WAI treats charts as complex images: a short identification is paired with a
longer textual equivalent containing the essential information. When that
equivalent is tabular, structural table markup must associate headers and cells
so screen readers retain row/column context. WAI further advises that complex
tables are harder to interpret and may be better split into simpler tables by
subtopic.

Sources:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI Complex Images Tutorial](https://www.w3.org/WAI/tutorials/images/complex/)
- [WAI Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/)
- [WAI table design tips](https://www.w3.org/WAI/tutorials/tables/tips/)

External implication: an eight-axis or multi-poet chart cannot make series,
selected state, score, or uncertainty discoverable only through hue or pointer
hover. Its essential data and qualifications must remain available without
seeing or operating the chart.

### 2. Disclosure, limitations, and reproducibility of AI evaluation

NIST AI RMF 1.0 identifies valid/reliable, accountable/transparent, explainable/
interpretable, and fair-with-harmful-bias-managed characteristics as relevant
to trustworthy AI. It warns that controlled measurements may differ from
real-world behavior, opaque systems complicate measurement, and comparing an AI
system with human activity requires an explicit human baseline.

The NIST Generative AI Profile recommends:

- establishing data-origin and content-lineage assumptions and testing original
  sources, transformations, and decision criteria (MP-2.1-001/002);
- documenting knowledge limits, upstream sources, and how outputs are used or
  overseen (MAP 2.2);
- evaluating capability claims with empirically validated methods
  (MS-2.3-002);
- avoiding extrapolation from narrow, non-systematic, or anecdotal assessments,
  documenting how much human domain knowledge is used, checking output sources
  and citations, and verifying evaluation-data provenance
  (MS-2.5-001/002/003/005);
- documenting model objectives, capabilities, provenance limitations, and
  modifications, and monitoring limitations through test, evaluation,
  validation, and verification.

The profile also notes that current pre-deployment tests can be mismatched to
deployment context and that prompt sensitivity limits extrapolation. These are
recommendations to document and test claims; NIST does not validate this
study—or the stated model identity—by being cited.

Sources:

- [NIST AI Risk Management Framework 1.0](https://doi.org/10.6028/NIST.AI.100-1)
- [NIST AI RMF: Generative Artificial Intelligence Profile](https://doi.org/10.6028/NIST.AI.600-1)

External implication: the publication must distinguish model-generated scores
from human judgement and disclose the evaluated corpus, eight variables,
weighting/selection process, absence or presence of human review, known
limitations, and enough run information to determine what can and cannot be
reproduced. It must not claim that NIST endorses the method or outcome.

### 3. Rankings, claims, and provenance

NIST's instruction not to extrapolate performance from narrow or
non-systematic assessments applies directly to turning ten selected verses into
a judgement about an author's overall literary value. The AI RMF also treats
validity and reliability as contextual: a score can be valid for a documented
computational procedure without being a validated measure of human aesthetic
judgement.

W3C PROV-O represents provenance as:

- an `Entity`, such as the source corpus, score table, or published dataset;
- an `Activity`, such as model evaluation, weighted aggregation, filtering, or
  export; and
- an `Agent`, including a person, organization, or software agent responsible
  for an activity or entity.

Its `prov:used`, `prov:wasGeneratedBy`, `prov:wasDerivedFrom`,
`prov:wasAssociatedWith`, and `prov:wasAttributedTo` relationships support a
traceable chain from corpus to displayed result. DataCite similarly provides
`IsDerivedFrom`, `IsSourceOf`, `IsDocumentedBy`, and version relation types;
its version guidance recommends a new identifier for a major version change.

Sources:

- [W3C PROV-O Recommendation](https://www.w3.org/TR/prov-o/)
- [DataCite 4.6 RelatedIdentifier](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/relatedidentifier/)
- [DataCite 4.6 Version](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/version/)
- [DataCite 4.6 Description](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/description/)

External implication: ranking order is evidence only about the documented model,
input, rubric, and aggregation run. It is not evidence of general literary
importance, historical influence, or consensus aesthetic quality.

### 4. `Dataset`, `DataDownload`, and `ScholarlyArticle` metadata

Google's Dataset guidance requires `name` and a 50–5000-character `description`
for Dataset rich-result eligibility. It recommends creator, identifier,
license, publisher, version/date and provenance-related links. `citation`
identifies a related scholarly publication; Google explicitly says not to use
it as the dataset's own citation. The dataset's own citation identity comes
from fields such as `name`, `identifier`, `creator`, and `publisher`.

Schema.org `Dataset` supports repeated `variableMeasured` values and
`measurementTechnique`; `distribution` points to one or more `DataDownload`
objects. Each download can state `contentUrl`, `encodingFormat`, and
`contentSize`. Google's Dataset guidance requires `distribution.contentUrl`
when a distribution is described and recommends `distribution.encodingFormat`.

Schema.org `ScholarlyArticle` is the article-like research work and separately
supports `headline`/name, abstract/description, author, publisher,
`datePublished`, `dateModified`, citation, license, version, `isBasedOn`, and
`mainEntityOfPage`. The article and dataset therefore remain distinct creative
works even when the article describes the dataset.

Sources:

- [Google Dataset structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/dataset)
- [Schema.org Dataset](https://schema.org/Dataset)
- [Schema.org DataDownload](https://schema.org/DataDownload)
- [Schema.org ScholarlyArticle](https://schema.org/ScholarlyArticle)
- [Google Scholar inclusion guidelines](https://scholar.google.com/intl/en/scholar/inclusion.html)

External implication: the research landing page may describe both a
`ScholarlyArticle` and a separate `Dataset`; CSV and JSON are two
`DataDownload` distributions of the same dataset, not two datasets. If Google
Scholar metadata is emitted, the author and publication date must be the
article's actual author and citable publication date—not the model, site owner
by default, build time, or repository-ingest time.

## Project recommendations

These recommendations apply the sources to this study; they are not additional
claims about what the standards mandate.

### Evidence and disclosure contract

- Label the result everywhere as «ارزیابی محاسباتی مدل» and the selection as
  «ده بیت با بالاترین امتیاز زیبایی‌شناختی محاسباتی».
- State adjacent to the first score/ranking that no human aesthetic assessment
  or human labelling was performed. Do not imply peer review, critical
  consensus, or human validation.
- Describe GPT-5.6-sol as the evaluator only if that identity can be supported.
  Record the provider's exact model identifier, run date, prompt/rubric version,
  parameters that affect repeatability, input corpus version/checksum, software
  version/commit, score weights, normalization, tie handling, selection rules,
  and any failed/retried rows.
- If reproducibility inputs are unavailable, say «بازآفرینی دقیق این اجرا در
  حال حاضر ممکن نیست» rather than calling the workflow reproducible.
- Keep the limitations adjacent to conclusions: model sensitivity, lack of a
  human baseline, verse-out-of-context analysis, approximate musical features,
  corpus coverage, and the mismatch between classical bayt structure and modern
  free verse.

### Ranking and claim contract

- Default poet ordering to historical period and name. Allow score sorting as an
  exploration control, but do not label it «بهترین شاعران» or present an
  overall literary leaderboard.
- Qualify comparisons as differences among this run's ten selected verses.
  Never infer author-wide quality, influence, canonicity, or historical
  importance.
- Show sample size, aggregation statistic, score range/scale, and active filters
  beside every aggregate. Avoid false precision beyond the source scores.
- Give every interpretive claim a direct link to methodology and the exact
  dataset version. Preserve negative, tied, and anomalous results rather than
  silently curating them away.

### Accessible visualization contract

- Use a radar chart only as an overview. Pair it with a simpler per-axis
  comparison (for example, grouped bars or small multiples) and a native table.
- Identify series through direct labels and at least one non-color cue such as
  marker shape, line style, or pattern. Keep the legend operable as real buttons
  if it changes state.
- Provide a concise chart summary before the visualization and a native table
  after it. The table must contain the same poet/verse subset, eight scores,
  weighted total, units, precision, ordering, and active filters as the chart.
- Prefer native filter controls. If individual chart marks are interactive,
  make them keyboard reachable with an accessible name containing poet/verse,
  metric, value, and position; do not make users traverse hundreds of marks when
  an equivalent table/filter path is more efficient.
- Announce filter-result counts as a status message without moving focus.
  Tooltips may enrich the view but must not contain unique values or caveats.

### Provenance and data-integrity contract

- Maintain one generated source of truth for page values, charts, tables, CSV,
  JSON, and structured data.
- Give every score record stable identifiers for poet, verse, source-corpus
  record, rubric version, evaluation run, and dataset version.
- Store a machine-readable lineage manifest from source corpus through model
  evaluation, weighted total, top-ten selection, and export. At minimum, record
  hashes for immutable inputs and released CSV/JSON.
- Treat normalization of poet names as an explicit mapping with audit tests,
  including the known Nima Yushij and Elyar variants; do not mutate the source
  labels silently.
- Publish UTF-8 CSV and schema-versioned JSON with equivalent records. Validate
  row count, per-poet count, unique IDs, score domains, total-score
  recomputation, mappings, and byte-level checksums in release tests.

### Structured-data contract

- Give the research page one stable canonical URL and emit a
  `ScholarlyArticle` node only if it exposes article-like title, abstract,
  method, results, limitations, actual human author/creator, citable publication
  date, and version.
- Emit a distinct `Dataset` node with a stable `@id`, unique Persian name,
  50–5000-character description, actual creator/publisher, publication and
  modification dates, version, license, corpus derivation (`isBasedOn`), eight
  `variableMeasured` entries, and `measurementTechnique` naming the documented
  model-based rubric.
- Attach CSV (`text/csv`) and JSON (`application/json`) as two `DataDownload`
  objects with absolute `contentUrl`, `encodingFormat`, and `contentSize`.
- Link article and dataset in both directions (`mainEntity`/`subjectOf`,
  `isBasedOn`, or an equivalent consistent relationship), but keep their
  citations, identifiers, and version histories separate.
- Do not mark the unpublished Word source as a distribution, citation target, or
  public download.

## Provenance caveat for this project

The claim that GPT-5.6-sol evaluated all eight axes and produced the final
evaluation was supplied by the project owner in the product interview. Unless a
first-party provider run record, exact model identifier, request/response log,
or equivalent signed audit artifact is available, publish that attribution as
owner-supplied provenance—not as independently verified model provenance. This
document does not verify the model identity or the execution history.
