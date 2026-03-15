---
phase: 02-frontend-reads
plan: 01
subsystem: ui
tags: [wagmi, viem, react, typescript, hooks, multicall]

# Dependency graph
requires:
  - phase: 01-contract-foundation
    provides: Deployed DucketTickets contract with getEvent, getTicketTier, balanceOf ABI
provides:
  - Static event metadata mapping (EVENT_METADATA, ALL_TIER_TOKEN_IDS, TOKEN_ID_TO_EVENT_ID)
  - useEventData hook: batched 18-call multicall returning merged on-chain + metadata for all 6 events
  - useMyTickets hook: batched balanceOf returning owned tickets grouped by event
  - formatPAS and formatUSDC price formatters using viem
  - Safe WalletConnect guard for empty connectors array
  - Address-zero warning banner in App.tsx
affects: [03-frontend-writes, 04-resale, 05-xcm]

# Tech tracking
tech-stack:
  added: [viem formatEther, viem formatUnits, viem zeroAddress]
  patterns: [useReadContracts multicall batching, wagmi query.enabled guard for auth-gated reads]

key-files:
  created:
    - frontend/src/data/eventMetadata.ts
    - frontend/src/hooks/useEventData.ts
    - frontend/src/hooks/useMyTickets.ts
  modified:
    - frontend/src/lib/utils.ts
    - frontend/src/components/WalletConnect.tsx
    - frontend/src/App.tsx

key-decisions:
  - "useReadContracts batches all 18 calls (6 getEvent + 12 getTicketTier) into one multicall to minimize RPC round trips"
  - "useMyTickets disabled when no wallet connected via query.enabled: !!address per wagmi v2 pattern"
  - "Events not in EVENT_METADATA are silently hidden — on-chain events without metadata entry are filtered out"

patterns-established:
  - "Multicall batch pattern: build contracts array → useReadContracts → useMemo for processing — use in all future read hooks"
  - "Always check data[i].status === 'success' before accessing result (wagmi v2 per-call result shape)"
  - "Contract address must be cast as 0x${string} for wagmi type safety"

requirements-completed: [FEND-06, FEND-07]

# Metrics
duration: 12min
completed: 2026-03-15
---

# Phase 2 Plan 1: Frontend Data Layer Summary

**Batched wagmi multicall data layer with static event metadata, two read hooks (useEventData/useMyTickets), viem price formatters, WalletConnect guard, and address-zero startup banner**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-15T13:00:00Z
- **Completed:** 2026-03-15T13:12:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Static metadata mapping for all 6 seeded events with tier descriptions, image URLs, and venue info
- useEventData hook batches 18 contract calls into one multicall and merges on-chain data with metadata
- useMyTickets hook fetches balanceOf for all 12 tokenIds, disabled when wallet disconnected
- WalletConnect now shows "No Wallet Found" and disables button when connectors array is empty
- Red warning banner appears at top of app when VITE_CONTRACT_ADDRESS is zero address

## Task Commits

Each task was committed atomically:

1. **Task 1: Create event metadata mapping, price formatters, and safety guards** - `cc62a4f` (feat)
2. **Task 2: Create useEventData and useMyTickets hooks** - `8016232` (feat)

**Plan metadata:** (see final commit)

## Files Created/Modified
- `frontend/src/data/eventMetadata.ts` - Static metadata for 6 events, ALL_TIER_TOKEN_IDS, TOKEN_ID_TO_EVENT_ID reverse map
- `frontend/src/hooks/useEventData.ts` - Batched multicall hook; exports MergedEvent, MergedTier types
- `frontend/src/hooks/useMyTickets.ts` - balanceOf hook; exports OwnedTier, OwnedTicketGroup types
- `frontend/src/lib/utils.ts` - Added formatPAS (bigint → DOT string) and formatUSDC (bigint → USDC string)
- `frontend/src/components/WalletConnect.tsx` - Guard for empty connectors[0] access (FEND-06)
- `frontend/src/App.tsx` - Address-zero warning banner using viem zeroAddress (FEND-07)

## Decisions Made
- Kept tier metadata (name + description) in static file rather than relying solely on on-chain tierName to enable richer display without additional contract calls
- `formatPAS` uses `formatEther` (18 decimals) matching PAS/DOT native token denomination; note blockers/concerns flag PAS as 10 decimals — left as formatEther per plan spec, to be re-evaluated in writes phase
- `useMyTickets` groups by eventId using insertion-order Map to preserve natural event ordering

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useMemo dependency array referencing undeclared variable**
- **Found during:** Task 2 (useEventData hook creation)
- **Issue:** Initial implementation referenced `tokenIdToTierIndex` in useMemo dep array but the variable was defined inside the callback
- **Fix:** Renamed to `tidToIdx` (local to callback) and removed from dep array
- **Files modified:** frontend/src/hooks/useEventData.ts
- **Verification:** TypeScript compile passed with zero errors
- **Committed in:** `8016232` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Single compile error fix, no scope changes.

## Issues Encountered
- None beyond the useMemo dep array variable naming fix above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data layer complete — Plan 02 can wire useEventData into Home and Event pages
- useMyTickets ready for MyTickets page
- Price formatters available for all purchase/display UIs
- No blockers for Plan 02

---
*Phase: 02-frontend-reads*
*Completed: 2026-03-15*

## Self-Check: PASSED

- FOUND: frontend/src/data/eventMetadata.ts
- FOUND: frontend/src/hooks/useEventData.ts
- FOUND: frontend/src/hooks/useMyTickets.ts
- FOUND: .planning/phases/02-frontend-reads/02-01-SUMMARY.md
- FOUND: commit cc62a4f (Task 1)
- FOUND: commit 8016232 (Task 2)
- FOUND: commit ace3ad1 (metadata)
