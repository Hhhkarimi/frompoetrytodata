# ADR 0003: Keep one canonical profile for each poet

- Status: Accepted
- Date: 2026-07-29

## Context

The computational-aesthetics study contains ten selected couplets and eight
computed scores for each of the 67 poets already represented by generated poet
pages. Publishing a second set of poet-profile URLs under the research route
would duplicate entity identity, navigation, metadata, and search-engine
signals.

## Decision

Each existing `/poets/{slug}/` page remains the canonical profile for its poet.
The computational-aesthetics study adds a distinct, linkable research section
to that profile. The study-level page presents the research question, aggregate
evidence, method, qualifications, and cross-poet exploration, then links to the
canonical poet profiles for individual results.

The study may expose filtered views or anchors, but it must not generate a
parallel canonical poet profile.

## Consequences

- Poet identity, metadata, citations, and related-research navigation remain
  centralized.
- The two known source-name differences for Nima Yushij and Aliyar require
  explicit aliases to existing poet identities rather than new poet records.
- Study-specific data can enrich poet pages without implying that the computed
  score is an overall literary ranking.

## Approval

Accepted by the project owner during computational-aesthetics clarification on
2026-07-29.
