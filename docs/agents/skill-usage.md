# Matt Pocock skill usage

## Applied in this phase

- `setup-matt-pocock-skills`: repository governance files, issue-tracker convention, domain-doc layout, and agent instructions.
- `grill-with-docs` + `grilling`: prior one-decision-at-a-time clarification, completed with explicit user confirmation.
- `domain-modeling`: terminology and stable conceptual boundaries in `CONTEXT.md`; durable decisions separated into ADRs.
- `research`: primary-source standards research in
  `docs/research/primary-source-guidance.md`. A background research agent
  reached its usage limit after source collection, so the primary sources and
  report were rechecked and completed by the main agent.
- `prototype`: four disposable variants behind one route and URL contract. The
  main agent revalidated the deployed variants and added programmatic current
  state to the switcher.
- `to-spec`: synthesized the selected integrated direction into
  `docs/specs/integrated-publication-experience.md`. Authenticated GitHub issue
  access was unavailable, so the user explicitly approved the local
  specification as the implementation reference.
- `tdd`: public prototype seams were tested red-green-refactor; see `docs/prototypes/from-poetry-to-data/TDD_LOG.md`.
- `codebase-design`: the post-selection architecture assessment uses module,
  interface, implementation, seam, adapter, depth, leverage, and locality
  vocabulary.
- `improve-codebase-architecture`: assessment only; a read-only exploration
  agent and a visual report identified the required evidence, URL-state,
  accessible-view, and publication deepening opportunities. No production
  refactor was performed during assessment.
- `implement`: implemented the approved integrated-publication specification
  through the browser, generated-artifact, and published-data seams. The work
  keeps the existing React/Vite/ECharts architecture and does not attempt the
  rejected wholesale rewrite.
- `tdd`: production behavior was delivered in vertical red-green-refactor
  slices covering routing, URL state, accessible charts and dialogs,
  publication identity, generated entities, downloads, data integrity,
  analytics contracts, loading/error states, and performance boundaries.
- `code-review`: two-axis review of the prototype package; see `docs/reviews/prototype-code-review.md`.

## Deliberate boundaries

- `diagnosing-bugs`: used for the prototype production-domain metadata
  regression and the TypeScript 7 compiler failure under the container's
  `/proc/self/exe` restrictions. The root causes were fixed through canonical
  publication identity and an exact TypeScript 5.9 toolchain rather than by
  weakening tests. The unavailable headless browser remains an environment
  limitation and was not patched around in application code.

Optional wholesale pipeline rewrites and unrelated content changes remain out
of scope.
