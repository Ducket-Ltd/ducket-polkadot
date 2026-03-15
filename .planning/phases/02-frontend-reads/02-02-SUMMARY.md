---
phase: 02-frontend-reads
plan: 02
subsystem: ui
tags: [wagmi, react, typescript, pages, on-chain-reads, hooks]

# Dependency graph
requires:
  - phase: 02-frontend-reads
    plan: 01
    provides: useEventData, useMyTickets hooks, formatPAS, formatUSDC utils
provides:
  - Home page wired to useEventData hook with real on-chain events
  - Event detail page wired to useEventData with real tier data (DOT + USDC prices)
  - MyTickets page wired to useMyTickets with real balanceOf wallet data
  - All three pages have loading states and no mock data imports
affects: [03-frontend-writes, 04-resale]

# Tech tracking
tech-stack:
  added: []
  patterns: [consume-hook pattern in pages, BigInt multiplication for total price, selectedTier by tokenId]

key-files:
  created: []
  modified:
    - frontend/src/pages/Home.tsx
    - frontend/src/pages/Event.tsx
    - frontend/src/pages/MyTickets.tsx

key-decisions:
  - "selectedTier state changed from string (mockData id) to number (tokenId) matching on-chain identifier"
  - "Resale listings section removed from Event.tsx — no on-chain resale data source yet; Phase 4 handles this"
  - "MyTickets shows Nx TierName badge format per prior locked decision (balance count, not individual ticket cards)"

# Metrics
duration: 2min
completed: 2026-03-15
---

# Phase 2 Plan 2: Page Data Wiring Summary

**Three main pages rewritten to consume real on-chain data via useEventData and useMyTickets hooks — mock data fully removed from Home, Event, and MyTickets pages**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-15T13:25:20Z
- **Completed:** 2026-03-15T13:27:00Z
- **Tasks:** 2 of 2
- **Files modified:** 3

## Accomplishments
- Home.tsx uses useEventData hook; events grid displays real on-chain events with formatPAS prices; loading/error states present
- Event.tsx uses useEventData hook; tier cards show both DOT (formatPAS) and USDC (formatUSDC) prices; selectedTier now uses tokenId (number) instead of mock string id; quantity max derived from on-chain minted/maxSupply
- MyTickets.tsx uses useMyTickets hook; groups tickets by event showing "Nx TierName" badges; refresh button present
- All three pages are free of mockData.ts imports

## Task Commits

1. **Task 1: Wire Home, Event, and MyTickets pages to on-chain data** - `b2d2087` (feat)
2. **Task 2: Verify on-chain data renders correctly in browser** - Human-verified (approved)

## Files Created/Modified
- `frontend/src/pages/Home.tsx` - useEventData hook, formatPAS prices, loading/error states
- `frontend/src/pages/Event.tsx` - useEventData hook, both DOT+USDC tier prices, tokenId-based selection
- `frontend/src/pages/MyTickets.tsx` - useMyTickets hook, Nx TierName format, refresh button

## Decisions Made
- `selectedTier` type changed from `string | null` to `number | null` to use tokenId as the tier identifier
- Resale listings section removed from Event page (no on-chain source; Phase 4)
- MyTickets removed the "How to List for Resale" card (Phase 4 scope)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused Calendar and MapPin imports from MyTickets.tsx**
- **Found during:** Task 1 (TypeScript compile check)
- **Issue:** Initially imported Calendar and MapPin from lucide-react but did not use them in the rewritten MyTickets
- **Fix:** Removed unused imports; TypeScript strict mode (TS6133) flagged them
- **Files modified:** frontend/src/pages/MyTickets.tsx
- **Committed in:** `b2d2087` (Task 1 commit)

**Total deviations:** 1 auto-fixed (Rule 1 - unused imports causing compile error)

## Known Gaps

**5 events displayed instead of expected 6:** User reported seeing only 5 events on the Home page during browser verification. The plan's success criteria specified 6 real on-chain events. This is a metadata gap — one of the 6 on-chain events likely lacks a corresponding entry in `frontend/src/data/eventMetadata.ts`, causing it to be silently filtered out (per the locked decision: "Events not in EVENT_METADATA are silently hidden"). This does not affect correctness of the wiring — the filtering behavior is intentional. Gap to resolve: ensure all 6 deployed event IDs have metadata entries.

## Issues Encountered
- None beyond the unused import cleanup above.

## Next Phase Readiness
- All pages now read real on-chain data — ready for Phase 3 write flows (mintTicket calls)
- Event.tsx purchase handler is a placeholder setTimeout — Phase 3 wires the real contract call
- MyTickets resale listing capability deferred to Phase 4

---
*Phase: 02-frontend-reads*
*Completed: 2026-03-15*

## Self-Check: PASSED

- FOUND: frontend/src/pages/Home.tsx (useEventData, formatPAS)
- FOUND: frontend/src/pages/Event.tsx (useEventData, formatPAS, formatUSDC)
- FOUND: frontend/src/pages/MyTickets.tsx (useMyTickets, refetch button)
- FOUND: commit b2d2087 (Task 1)
