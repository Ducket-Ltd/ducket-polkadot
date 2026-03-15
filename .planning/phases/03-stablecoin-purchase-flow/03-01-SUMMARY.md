---
phase: 03-stablecoin-purchase-flow
plan: 01
subsystem: payments
tags: [wagmi, viem, usdc, erc20, approve, stablecoin, react, typescript]

# Dependency graph
requires:
  - phase: 02-frontend-reads
    provides: MergedTier interface, useEventData hook, Event.tsx page with tier selection
  - phase: 01-contract-foundation
    provides: DUCKET_ABI with mintTicket/mintTicketWithToken, MOCK_USDC_ABI with approve/allowance
provides:
  - usePurchaseTicket hook — two-step USDC approve+purchase state machine with DOT single-step path
  - Event.tsx — DOT/USDC payment selector, step indicators, error/success UI, real contract calls
affects: [04-resale-flow, 05-xcm-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Single useWriteContract instance reused for approve then purchase (avoids stale closure bug with two instances)
    - useEffect on isConfirmed + step drives state machine transitions
    - txHash change detection via useEffect to update step from approving -> approve-confirming

key-files:
  created:
    - frontend/src/hooks/usePurchaseTicket.ts
  modified:
    - frontend/src/pages/Event.tsx

key-decisions:
  - "Single useWriteContract instance reused for approve and purchase — two instances cause stale closure issues per research"
  - "stablePrice already in 6-decimal units from contract — do not call parseUnits (would double-scale)"
  - "paymentMethod state resets to DOT when selectedTier changes — prevents stale USDC state across tier switches"

patterns-established:
  - "State machine pattern: PurchaseStep union type driving all UI and logic transitions"
  - "useEffect watches isConfirmed + step to chain approve -> purchase without imperative callbacks"

requirements-completed: [FEND-02, STBL-01, STBL-02, STBL-03]

# Metrics
duration: 15min
completed: 2026-03-15
---

# Phase 03 Plan 01: Stablecoin Purchase Flow Summary

**Two-step USDC approve+purchase state machine hook with DOT/USDC payment selector wired to real on-chain mintTicket and mintTicketWithToken calls**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-15T15:10:00Z
- **Completed:** 2026-03-15T15:25:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `usePurchaseTicket` hook exporting `PurchaseStep`, `PaymentMethod`, and full state machine
- Replaced setTimeout placeholder in Event.tsx with real wagmi writeContract calls
- DOT path calls `mintTicket` (payable) as a single step; USDC path calls `approve` then `mintTicketWithToken`
- Step indicator UI renders "Step 1/2: Approve USDC" / "Step 2/2: Purchase Ticket" during USDC flow
- USDC payment option correctly disabled when `tier.stablePrice === 0n`
- Error state with truncated message and "Try again" retry; success navigates to /my-tickets after 2s

## Task Commits

Each task was committed atomically:

1. **Task 1: Create usePurchaseTicket state machine hook** - `64dd6a9` (feat)
2. **Task 2: Wire Event.tsx with payment selector and purchase step UI** - `9c594a2` (feat)

## Files Created/Modified
- `frontend/src/hooks/usePurchaseTicket.ts` - Two-step approve+purchase state machine hook with DOT and USDC paths
- `frontend/src/pages/Event.tsx` - Payment selector, step indicators, error/success UI, real contract calls replacing setTimeout

## Decisions Made
- Single `useWriteContract` instance reused for both approve and purchase calls. Two separate instances cause stale closure issues where the second instance's callbacks reference outdated state.
- `stablePrice` comes from the contract already in 6-decimal USDC units — do NOT call `parseUnits` on it (would double-scale to 12 decimals).
- `paymentMethod` state resets to `'DOT'` whenever `selectedTier` changes to prevent a stale USDC selection after switching tiers.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Purchase flow complete and compiling cleanly; ready for Phase 04 resale listing flow
- `usePurchaseTicket` pattern (state machine + single writeContract) available as template for `useBuyResale` hook in Phase 04
- No blockers; TypeScript passes and production build succeeds

## Self-Check: PASSED

All created files confirmed on disk. All task commits verified in git history.

---
*Phase: 03-stablecoin-purchase-flow*
*Completed: 2026-03-15*
