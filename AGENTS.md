# Agent instructions

## Agent skills

Use the Matt Pocock engineering workflows deliberately and in their intended order. Do not bypass product clarification, prototype selection, specification approval, or public testing-seam identification.

## Issue tracker

Project work is tracked in GitHub Issues for `Hhhkarimi/frompoetrytodata`. See `docs/agents/issue-tracker.md`.

## Domain docs

This repository uses a single domain context documented in the root `CONTEXT.md`, with durable architectural decisions in `docs/adr/`. See `docs/agents/domain.md`.

## Product safety

- Never turn statistical association into a definitive literary or historical conclusion.
- Never treat corpus coverage as literary importance, canonical status, or historical influence.
- Keep necessary methodological qualifications adjacent to the claim they qualify.
- Do not silently alter source datasets, generated research outputs, or citation metadata.
- Prefer one generated source of truth for displayed statistics and downloadable data.

## Delivery workflow

1. Read `CONTEXT.md`, relevant ADRs, the current issue/specification, and repository scripts before changing production code.
2. Preserve the existing package manager, Vite/React conventions, post-build page generation, linting, testing, and data-generation commands.
3. Prototype changes under a disposable route before production implementation when the interaction model is unsettled.
4. State public testing seams before writing tests. Use vertical red-green-refactor slices.
5. Run focused tests regularly, then lint, the full test suite, build, accessibility checks, and browser checks before delivery.
