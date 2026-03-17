---
phase: 07-foundation
plan: 02
subsystem: frontend-content
tags: [copy, constants, content-management, typescript]
dependency_graph:
  requires: []
  provides: [COPY-constants-pattern]
  affects: [frontend/src/pages/*, Phase 8 copy rewrites]
tech_stack:
  added: []
  patterns: [centralized-copy-constants, as-const-typing]
key_files:
  created:
    - frontend/src/constants/copy.ts
  modified:
    - frontend/src/pages/Home.tsx
    - frontend/src/pages/Event.tsx
    - frontend/src/pages/HowItWorks.tsx
    - frontend/src/pages/MyTickets.tsx
    - frontend/src/pages/Resale.tsx
decisions:
  - "Split HERO_HEADLINE and HERO_HEADLINE_HIGHLIGHT as separate constants to preserve the gradient-text span structure in Home.tsx"
  - "Included subtitle/description keys beyond the minimum to give Phase 8 editors a comprehensive set without needing to re-extract"
  - "Did not extract state-conditional button labels (isPending, step enums) as instructed — only static display strings extracted"
metrics:
  duration: 8 minutes
  completed: "2026-03-17"
  tasks_completed: 2
  files_changed: 6
---

# Phase 7 Plan 02: Centralized Copy Constants Summary

**One-liner:** Centralized UI string constants in `copy.ts` with 5 typed sections, wired into all 5 page components as the Phase 8 content editing foundation.

## What Was Built

Created `frontend/src/constants/copy.ts` exporting a single `COPY` object typed with `as const`, containing 5 named sections:

- `COPY.HOME` — hero headline (split into base + highlight for gradient span), subheadline, CTA button labels, events section strings (8 keys)
- `COPY.EVENT_PAGE` — loading label, not found title, tickets section title, connect prompt, verified badge (5 keys)
- `COPY.MY_TICKETS` — page title, subtitle, empty state heading and body, connect prompt heading and body (6 keys)
- `COPY.RESALE_PAGE` — page title, subtitle, price protection label and subtitle, how resale works title (5 keys)
- `COPY.HOW_IT_WORKS_PAGE` — page title, page subtitle, features section title, CTA title and subtitle (5 keys)

All 5 page components import `{ COPY }` from `@/constants/copy` and render multiple constants. TypeScript compiles without errors. Rendered output is visually identical to before.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create copy.ts with all page sections | 0d04493 | frontend/src/constants/copy.ts |
| 2 | Wire copy constants into all 5 pages | a051368 | Home.tsx, Event.tsx, HowItWorks.tsx, MyTickets.tsx, Resale.tsx |

## Verification Results

- `test -f frontend/src/constants/copy.ts` — PASS
- `npx tsc --noEmit` — PASS (zero errors)
- `grep -l "COPY\." src/pages/*.tsx | wc -l` — 5 (all pages)
- Each page renders multiple COPY constants — PASS

## Decisions Made

1. **HERO_HEADLINE split:** The Home hero headline renders as two parts — plain text and a gradient-highlighted span. Splitting into `HERO_HEADLINE` + `HERO_HEADLINE_HIGHLIGHT` preserves the JSX structure while keeping both strings editable from copy.ts.

2. **Broader key set:** Included subtitle and description keys beyond the plan's minimum so Phase 8 editors have a comprehensive file to work from without needing to re-extract strings.

3. **State-conditional strings excluded:** Per plan instruction, button labels that change based on `isPending`, step enums, or purchase state were not extracted. Only static display strings are in copy.ts.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

- [x] `frontend/src/constants/copy.ts` exists
- [x] `git log` shows commits 0d04493 and a051368
- [x] TypeScript compiles without errors
- [x] All 5 pages use COPY constants
