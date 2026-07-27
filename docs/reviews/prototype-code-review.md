# Prototype code review

Date: 2026-07-27

## Axis 1 — Standards

### Repository conventions

- Prototype files are isolated under `public/prototype/` and do not alter production routes.
- Code and test identifiers are English; user-facing copy is Persian.
- No external runtime dependency was added.

### Accessibility and RTL

- Root language/direction are explicit.
- Native links, form controls, buttons, details, and tables are used.
- Focus is visibly styled; no focus outline is removed.
- Essential qualifications are visible, not tooltip-only.
- Chart and table share one dataset; SVG is decorative because the table carries the programmatic data.
- Reduced motion and mobile reflow are present.
- No-JavaScript content includes navigation and an equivalent sample table.

### Test quality

- Tests target stable public seams rather than internal helper implementation.
- URL/shareability, semantics, data integrity, and disposable-route constraints are represented.
- Browser/screen-reader checks remain manual because a working browser automation environment was unavailable.

### Maintainability

- The prototype is deliberately small and dependency-free.
- It is not production architecture and is clearly labeled disposable.
- Copy and sample data should not be migrated by copying markup wholesale.

Blocking standards findings: none within the disposable prototype scope.

## Axis 2 — Prototype requirements

- Four radically different homepage/research-navigation variants: complete.
- One throwaway route with visible switcher and search-parameter switching: complete.
- Persian RTL desktop/mobile layouts: implemented; static browser screenshot capture unavailable in this environment.
- Keyboard-accessible native navigation and visible focus: complete at code level; manual assistive-technology verification pending.
- No reliance on color alone: variants and states include text labels and structure.
- Explanations before charts and access to method/citation/downloads: complete.
- Poet, century, metaphor, and research-result samples: complete.
- Accessible chart plus equivalent table: complete.
- Search/filter and URL state: complete.
- Empty/loading/error/no-JavaScript states: complete.
- Winner selection: intentionally not performed.

Blocking specification findings: production implementation remains blocked until the product owner selects a direction and approves a specification.
