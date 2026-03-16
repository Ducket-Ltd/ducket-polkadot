---
phase: 05-xcm-integration
plan: 01
subsystem: contracts
tags: [solidity, xcm, polkadot, erc1155, hardhat]

# Dependency graph
requires:
  - phase: 04-resale-market
    provides: DucketTickets.sol with resale functions (cancelResaleListing base)
provides:
  - IXcm interface and emitXcmVerification function in DucketTickets.sol
  - TicketVerified event for on-chain verification signal
  - emitXcmVerification and TicketVerified entries in frontend DUCKET_ABI
affects: [05-02-xcm-ui, frontend hooks using emitXcmVerification]

# Tech tracking
tech-stack:
  added: [IXcm precompile interface (0x000a0000)]
  patterns: [try/catch XCM fallback — always emit Solidity event even if XCM precompile reverts]

key-files:
  created: []
  modified:
    - contracts/contracts/DucketTickets.sol
    - frontend/src/lib/contract.ts

key-decisions:
  - "XCM try/catch fallback pattern: TicketVerified always fires regardless of XCM precompile result — aligns with STATE.md fallback strategy"
  - "XCM_PAYLOAD uses Polkadot docs example hex — sufficient for demo, plan 05-02 can refine if needed"
  - "Frontend ABI pre-populated before redeployment — allows 05-02 UI work to start in parallel"

patterns-established:
  - "XCM fallback pattern: wrap precompile calls in try/catch, emit Solidity event unconditionally"

requirements-completed: [XCM-01]

# Metrics
duration: 10min
completed: 2026-03-16
---

# Phase 5 Plan 01: XCM Integration — Contract Extension Summary

**IXcm interface + emitXcmVerification function added to DucketTickets.sol with try/catch fallback, TicketVerified event always fires**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-16T03:09:03Z
- **Completed:** 2026-03-16T03:19:00Z
- **Tasks:** 1.5 of 2 (Task 1 complete, Task 2 partial — ABI updated, deployment is human-action gate)
- **Files modified:** 2

## Accomplishments
- Added IXcm interface above DucketTickets contract with Weight struct, execute, send, weighMessage signatures
- Added XCM_PRECOMPILE constant (0x00000000000000000000000000000000000a0000) and XCM_PAYLOAD constant
- Added TicketVerified event (indexed tokenId, indexed holder, bytes32 txContext)
- Added emitXcmVerification function with try/catch fallback — transaction always succeeds
- Updated DUCKET_ABI in contract.ts with emitXcmVerification function and TicketVerified event entries
- Hardhat compile and frontend npm run build both succeed

## Task Commits

Each task was committed atomically:

1. **Task 1: Add IXcm interface and emitXcmVerification** - `03094d9` (feat)
2. **Task 2 (partial): Add ABI entries to contract.ts** - `f51dda2` (feat)

**Plan metadata:** (pending final commit after deployment)

## Files Created/Modified
- `contracts/contracts/DucketTickets.sol` - IXcm interface, XCM_PRECOMPILE constant, XCM_PAYLOAD constant, TicketVerified event, emitXcmVerification function
- `frontend/src/lib/contract.ts` - emitXcmVerification function ABI entry, TicketVerified event ABI entry

## Decisions Made
- Used try/catch around IXcm.weighMessage + IXcm.execute so TicketVerified always fires — aligns with Phase 5 fallback strategy noted in STATE.md
- Frontend ABI pre-populated before redeployment to unblock 05-02 UI development

## Deviations from Plan

None - plan executed exactly as written. ABI update was executed as automation ahead of the human-action checkpoint as that portion is fully automatable.

## Auth Gates

Task 2 is a `checkpoint:human-action` gate: deploying the updated contract to Polkadot Hub Testnet requires PRIVATE_KEY wallet access and gas. Steps below.

## User Setup Required

**Deployment required.** Run the following to redeploy the updated contract:

```bash
cd /Users/justinsoon/Desktop/others/ducket-polkadot/contracts
npx hardhat run scripts/deploy.ts --network polkadotHubTestnet
```

Then update `frontend/.env` with the new addresses:
```
VITE_CONTRACT_ADDRESS=<new DucketTickets address>
VITE_MOCK_USDC_ADDRESS=<new MockUSDC address>
```

Verify: `cd frontend && npm run build`

## Next Phase Readiness
- Contract code and ABI are complete — 05-02 UI wiring can begin once new addresses are in .env
- emitXcmVerification is callable and will always succeed (try/catch fallback)
- TicketVerified event indexable from frontend for confirmation display

---
*Phase: 05-xcm-integration*
*Completed: 2026-03-16*
