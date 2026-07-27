# ADR 0001: Methodological qualifications are local to sensitive claims

- Status: Accepted
- Date: 2026-07-27

## Context

The publication contains historical trends, computational themes, metaphor families, textual similarity, attribution signals, rankings, and statistical associations. A global disclaimer cannot reliably prevent readers from interpreting those outputs as literary rank, causal history, direct influence, or definitive authenticity.

## Decision

Every sensitive claim includes a concise methodological qualification adjacent to the claim. The local qualification links to fuller methodology where appropriate. Necessary qualifications are not hidden only in a tooltip, closed disclosure, footer, or separate methodology page.

## Consequences

- Claim components need a dedicated qualification field or slot.
- Generated pages and interactive views must render the same qualification.
- Tests should verify qualification presence for claim categories defined in `CONTEXT.md`.
- Copy becomes slightly longer, but the boundary between evidence and interpretation remains visible.
