# Domain documentation

## Layout

The repository uses a single domain context:

- `CONTEXT.md`: shared mental model, stable terminology, conceptual distinctions, and durable constraints.
- `docs/adr/`: architectural decisions with meaningful alternatives, long-term consequences, or costly reversal.

## Consumer rules

- Read `CONTEXT.md` and related ADRs before design, specification, or implementation.
- Do not use `CONTEXT.md` as a feature specification, backlog, or daily work log.
- Add only terminology, domain rules, and distinctions likely to remain useful across features.
- Create an ADR only for a durable decision with real alternatives and consequences.
- Keep temporary UI choices, implementation details, and feature acceptance criteria out of ADRs.
- Surface conflicts between code and domain documentation explicitly; never silently choose one.
