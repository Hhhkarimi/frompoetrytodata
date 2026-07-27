# Matt Pocock skill usage

## Applied in this phase

- `setup-matt-pocock-skills`: repository governance files, issue-tracker convention, domain-doc layout, and agent instructions.
- `grill-with-docs` + `grilling`: prior one-decision-at-a-time clarification, completed with explicit user confirmation.
- `domain-modeling`: terminology and stable conceptual boundaries in `CONTEXT.md`; durable decisions separated into ADRs.
- `research`: primary-source standards research in `docs/research/primary-source-guidance.md`.
- `prototype`: four disposable variants behind one route and URL contract.
- `tdd`: public prototype seams were tested red-green-refactor; see `docs/prototypes/from-poetry-to-data/TDD_LOG.md`.
- `codebase-design`: architecture assessment uses module, interface, implementation, coupling, source-of-truth, and seam vocabulary.
- `improve-codebase-architecture`: assessment only; no broad refactor was performed.
- `code-review`: two-axis review of the prototype package; see `docs/reviews/prototype-code-review.md`.

## Deliberately gated

- `to-spec`: blocked until the product owner selects a prototype direction.
- `implement`: production implementation is blocked until an approved specification exists.
- `diagnosing-bugs`: no unexpected product regression was found. The unavailable headless screenshot facility was treated as an environment limitation rather than patched into application code.

This gating is intentional and follows the approved workflow rather than skipping required decisions.
