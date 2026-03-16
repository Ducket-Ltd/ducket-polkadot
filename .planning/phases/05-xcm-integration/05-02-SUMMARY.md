---
phase: 05-xcm-integration
plan: 02
subsystem: ui
tags: [xcm, polkadot, wagmi, react, verification, blockscout]

# Dependency graph
requires:
  - phase: 05-xcm-integration
    plan: 01
    provides: emitXcmVerification function and TicketVerified event on DucketTickets contract
provides:
  - useXcmVerification hook — state machine calling emitXcmVerification on-chain
  - Verify on Polkadot button on each ticket tier in MyTickets
  - Green verification badge with Blockscout link after successful XCM tx
  - Listed for Resale indicator badge on resale-listed tickets in MyTickets
affects: [MyTickets page, XCM integration UX]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Separate useWriteContract instances per hook to avoid stale closure collisions
    - Per-tokenId verification Map for tracking multiple in-flight/completed verifications
    - XCM verification state machine: idle -> verifying -> confirming -> success | error
    - Manual gas limit (200_000n) required for XCM precompile calls — MetaMask cannot auto-estimate

key-files:
  created:
    - frontend/src/hooks/useXcmVerification.ts
  modified:
    - frontend/src/pages/MyTickets.tsx

key-decisions:
  - "Separate useXcmVerification hook with its own useWriteContract instance — prevents state collision with useListForResale (per Phase 5 research pitfall #3)"
  - "Verification state stored in component Map keyed by tokenId — allows multiple tickets to show verified badge independently"
  - "Manual gas limit 200_000n added to writeContract call — MetaMask cannot estimate gas for XCM precompile address, causing silent rejection without explicit override"
  - "Added Listed for Resale badge indicator on MyTickets — ticket holders need visibility into their own resale listing status"

patterns-established:
  - "Pattern: additive UI — XCM verification does not modify existing List for Resale modal, only adds new state/buttons"
  - "Pattern: explicit gas override for XCM precompile — any future XCM precompile interaction requires gas: 200_000n or higher"

requirements-completed: [XCM-01, XCM-02]

# Metrics
duration: ~45min
completed: 2026-03-16
---

# Phase 5 Plan 02: XCM Verification UI Summary

**useXcmVerification hook with idle/verifying/confirming/success/error state machine wired into MyTickets with Verify on Polkadot button, badge, and Blockscout link — gas estimation fix for XCM precompile required to make transactions succeed**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-16T03:00:00Z
- **Completed:** 2026-03-16T03:45:00Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint, all complete)
- **Files modified:** 2

## Accomplishments

- Created useXcmVerification.ts hook mirroring usePurchaseTicket state machine pattern
- Wired Verify on Polkadot button into MyTickets tier rows alongside List for Resale
- Added green verification badge with Blockscout testnet link after tx confirmation
- Fixed MetaMask gas estimation failure for XCM precompile by adding explicit `gas: 200_000n`
- Added Listed for Resale badge indicator so ticket holders can see their resale listing status
- No regression to existing List for Resale modal or QR code functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useXcmVerification hook** - `4022f67` (feat)
2. **Task 2: Wire Verify on Polkadot button and badge into MyTickets** - `fdc69da` (feat)
3. **Task 3: Human verification — gas fix + listed-for-resale badge** - `73326e4` (fix)

## Files Created/Modified

- `frontend/src/hooks/useXcmVerification.ts` — XCM verification state machine hook, exports VerifyStep type and useXcmVerification; includes gas: 200_000n override
- `frontend/src/pages/MyTickets.tsx` — Added verification state, handleVerify, button row with flex layout, error display, verification badge with Blockscout link, and Listed for Resale indicator badge

## Decisions Made

- Separate useXcmVerification hook with its own useWriteContract instance (avoids stale closure issues with useListForResale)
- Verification results stored in Map<tokenId, txHash> in component state (component-level persistence, resets on page refresh — expected for demo)
- Added `gas: 200_000n` to writeContract call — MetaMask fails to estimate gas for the XCM precompile address; without this, every verification transaction is rejected before submission

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added manual gas limit to fix MetaMask XCM precompile rejection**
- **Found during:** Task 3 (human verification)
- **Issue:** MetaMask could not estimate gas for the XCM precompile address and rejected all "Verify on Polkadot" transactions silently before submission — the core feature was non-functional
- **Fix:** Added `gas: 200_000n` to the `writeContract` call in `useXcmVerification.ts`
- **Files modified:** `frontend/src/hooks/useXcmVerification.ts`
- **Verification:** Transaction submitted and confirmed on Polkadot Hub testnet after fix; TicketVerified event emitted
- **Committed in:** `73326e4`

**2. [Rule 2 - Missing Critical] Added Listed for Resale indicator badge on MyTickets**
- **Found during:** Task 3 (human verification)
- **Issue:** Ticket holders had no way to know which of their tickets were already listed for resale — discovered during hands-on verification of the page
- **Fix:** Added a "Listed for Resale" Badge component on each tier row where the resale listings map contains an entry for that tokenId
- **Files modified:** `frontend/src/pages/MyTickets.tsx`
- **Verification:** Badge appears for listed tickets, absent for unlisted tickets; no regression to resale modal
- **Committed in:** `73326e4`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical UX)
**Impact on plan:** Gas fix was essential — the feature was completely non-functional without it. Listed for Resale badge was an additive UX improvement discovered during verification, no scope creep.

## Issues Encountered

MetaMask gas estimation fails for XCM precompile addresses. The precompile at the XCM execution address is not a standard ERC-20/ERC-721 contract MetaMask can introspect, so gas estimation returns an error and MetaMask blocks the transaction. Resolution: always supply an explicit `gas` value when calling XCM precompiles.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 XCM integration fully complete — contract emits TicketVerified, frontend calls emitXcmVerification, badge + Blockscout link confirmed working on testnet
- No blockers for final demo preparation
- Verification badge resets on page refresh (component state only) — acceptable for hackathon demo

## Self-Check: PASSED

- `frontend/src/hooks/useXcmVerification.ts` — created in commit `4022f67`
- `frontend/src/pages/MyTickets.tsx` — modified in commits `fdc69da`, `73326e4`
- Commits `4022f67`, `fdc69da`, `73326e4` verified in git log

---
*Phase: 05-xcm-integration*
*Completed: 2026-03-16*
