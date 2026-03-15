---
phase: 03-stablecoin-purchase-flow
plan: 02
subsystem: payments
tags: [usdc, dot, stablecoin, purchase-flow, human-verification, wagmi, erc20]

# Dependency graph
requires:
  - phase: 03-stablecoin-purchase-flow
    provides: usePurchaseTicket hook, DOT/USDC payment selector, Event.tsx purchase step UI

provides:
  - Human-verified confirmation that stablecoin and DOT purchase flows work end-to-end on testnet
  - Confirmed: DOT payment selector renders, USDC approve+purchase two-step flow executes, tickets mint on-chain
affects: [04-resale-flow, 05-xcm-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - frontend/.env (correct contract addresses, blockscout explorer URL)
    - frontend/src/hooks/usePurchaseTicket.ts (zero-address guard added)
    - frontend/src/main.tsx or wagmi config (storage config fix)

key-decisions:
  - "Contract addresses in .env were incorrect — corrected to match deployed testnet contracts"
  - "Blockscout explorer URL needed fixing for correct transaction link display"
  - "wagmi storage config fix applied to prevent stale wallet state across sessions"
  - "Zero-address guard added to usePurchaseTicket to prevent calls with unresolved contract address"

patterns-established: []

requirements-completed: [FEND-02, STBL-01, STBL-02, STBL-03]

# Metrics
duration: human-review
completed: 2026-03-15
---

# Phase 03 Plan 02: Stablecoin Purchase Flow Verification Summary

**End-to-end browser verification confirmed: DOT and USDC purchase flows mint tickets on-chain with correct approve+purchase two-step USDC sequence**

## Performance

- **Duration:** Human review (async)
- **Started:** 2026-03-15T15:25:00Z
- **Completed:** 2026-03-15 (user approved)
- **Tasks:** 1 (human-verify checkpoint)
- **Files modified:** 3 (env fixes, hook guard, wagmi config)

## Accomplishments
- User verified DOT payment selector renders correctly and transactions go through on-chain
- USDC approve+purchase two-step flow confirmed working — approve step fires first, then purchase
- Tickets confirmed minting after successful purchase transaction
- Applied runtime fixes discovered during verification: correct contract addresses, blockscout explorer URL, wagmi storage config, and zero-address guard in usePurchaseTicket hook

## Task Commits

1. **Task 1: Verify stablecoin purchase flow in browser** — human-verify checkpoint, approved by user

## Files Created/Modified
- `frontend/.env` - Corrected contract addresses for deployed testnet contracts; fixed blockscout explorer URL
- `frontend/src/hooks/usePurchaseTicket.ts` - Added zero-address guard to prevent write calls before contract address resolves
- `frontend/src/main.tsx` (or wagmi config) - Storage config fix to prevent stale wallet connection state

## Decisions Made
- Contract addresses in `.env` were pointing at wrong addresses — corrected to match actual deployed DucketTickets and MockUSDC contracts on testnet
- Blockscout explorer URL had a formatting issue causing incorrect transaction links — fixed inline
- wagmi storage config was causing stale wallet state — fixed configuration to use correct storage adapter
- Zero-address guard (`if (!contractAddress || contractAddress === zeroAddress) return`) added to usePurchaseTicket to prevent premature contract calls before address resolves from config

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected .env contract addresses**
- **Found during:** Task 1 (browser verification)
- **Issue:** Purchase transactions were failing because .env had incorrect/stale contract addresses that didn't match the deployed testnet contracts
- **Fix:** Updated VITE_DUCKET_ADDRESS and VITE_MOCK_USDC_ADDRESS in frontend/.env to correct deployed addresses
- **Files modified:** frontend/.env
- **Verification:** Purchase transactions successfully reached the chain after fix

**2. [Rule 1 - Bug] Fixed blockscout explorer URL**
- **Found during:** Task 1 (browser verification)
- **Issue:** Transaction explorer links were malformed
- **Fix:** Corrected the blockscout base URL format
- **Files modified:** frontend/.env or wagmi config
- **Verification:** Transaction links render correctly in UI

**3. [Rule 1 - Bug] Fixed wagmi storage configuration**
- **Found during:** Task 1 (browser verification)
- **Issue:** Stale wallet connection state causing unexpected behavior across page loads
- **Fix:** Corrected wagmi storage config
- **Files modified:** wagmi config file
- **Verification:** Wallet state behaves correctly after page reload

**4. [Rule 2 - Missing Critical] Added zero-address guard to usePurchaseTicket**
- **Found during:** Task 1 (browser verification)
- **Issue:** Hook could attempt contract writes with unresolved (zero) address during initial render
- **Fix:** Added guard checking for zero address before invoking writeContract
- **Files modified:** frontend/src/hooks/usePurchaseTicket.ts
- **Verification:** No premature write calls; purchase flow initiates only when address is resolved

---

**Total deviations:** 4 auto-fixed (3 bugs, 1 missing critical guard)
**Impact on plan:** All fixes necessary for correct on-chain operation. No scope creep.

## Issues Encountered
Runtime environment issues discovered during browser verification that were not caught during compilation: incorrect .env addresses, explorer URL format, wagmi storage config, and missing zero-address guard. All resolved inline during verification session.

## User Setup Required
None - all fixes applied to the codebase directly.

## Next Phase Readiness
- All four requirements (FEND-02, STBL-01, STBL-02, STBL-03) human-verified and confirmed working
- Purchase flow stable and confirmed on testnet with real on-chain transactions
- Phase 03 complete — ready for Phase 04 resale listing flow
- `usePurchaseTicket` pattern (state machine, single writeContract, zero-address guard) available as template for Phase 04's `useBuyResale` hook

## Self-Check: PASSED

Human verification approved. All plan requirements confirmed working in browser.

---
*Phase: 03-stablecoin-purchase-flow*
*Completed: 2026-03-15*
