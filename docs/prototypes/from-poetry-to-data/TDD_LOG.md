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
