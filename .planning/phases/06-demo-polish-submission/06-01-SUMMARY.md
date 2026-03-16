---
phase: 06-demo-polish-submission
plan: 01
subsystem: ui
tags: [react, trust-badge, fee-transparency, polkadot, xcm, lucide-react]

# Dependency graph
requires:
  - phase: 05-xcm-integration
    provides: XCM verification flow and on-chain TicketVerified events
provides:
  - Trust badge "Verified on Polkadot" in Event page purchase card
  - Platform fee (2.5%) breakdown row in Event page purchase card
  - XCM-Verified Ticket Ownership badge in Home page hero section
affects: [demo, submission, pitch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fee display uses 250n/10000n bigint math matching contract's platformFee = 250 basis points"
    - "Trust badges gated behind selectedTierData conditional — no render when no tier selected"

key-files:
  created: []
  modified:
    - frontend/src/pages/Event.tsx
    - frontend/src/pages/Home.tsx

key-decisions:
  - "Fee row is static display only — does not read platformFee from chain, uses hardcoded 250 basis points matching contract"
  - "Trust badge replaces 'Powered by Polkadot Hub blockchain' footer text with styled badge for stronger visual impact"

patterns-established:
  - "Platform fee calculation: (price * quantity * 250n) / 10000n — consistent with contract basis points"

requirements-completed:
  - DEMO-05
  - DEMO-06

# Metrics
duration: 1min
completed: 2026-03-16
---

# Phase 6 Plan 01: Demo Polish — Trust Badges and Fee Transparency Summary

**"Verified on Polkadot" trust badge and 2.5% platform fee breakdown added to Event purchase card; "XCM-Verified Ticket Ownership" badge added to Home hero section**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-16T06:50:31Z
- **Completed:** 2026-03-16T06:51:31Z
- **Tasks:** 1 of 1
- **Files modified:** 2

## Accomplishments

- Event.tsx purchase card footer now shows a styled "Verified on Polkadot — tickets are on-chain NFTs" badge with Shield icon
- Event.tsx shows a "Platform fee (2.5%)" row displaying the calculated fee in DOT or USDC, gated on selectedTierData (no render when no tier selected)
- Home.tsx hero section trust badges row now includes "XCM-Verified Ticket Ownership" badge with Shield icon as the fifth badge

## Task Commits

Each task was committed atomically:

1. **Task 1: Add trust badges and fee transparency to Event.tsx and Home.tsx** - `d61bb2a` (feat)

**Plan metadata:** (pending — docs commit)

## Files Created/Modified

- `frontend/src/pages/Event.tsx` - Added Info import, fee breakdown row (250 basis points), replaced footer text with Verified on Polkadot trust badge
- `frontend/src/pages/Home.tsx` - Added XCM-Verified Ticket Ownership badge to hero section trust badges row

## Decisions Made

- Fee row uses static 250n/10000n (250 basis points) matching the contract's `platformFee = 250` — no chain read, intentionally static display
- Trust badge replaces the plain text footer for stronger visual presence in the purchase card

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DEMO-05 and DEMO-06 requirements fulfilled
- Event page purchase card is demo-ready with trust badge and fee transparency
- Home page hero section communicates XCM verification to users
- Ready for submission polish (06-02 and beyond)

## Self-Check: PASSED

- Event.tsx: FOUND
- Home.tsx: FOUND
- Commit d61bb2a: FOUND

---
*Phase: 06-demo-polish-submission*
*Completed: 2026-03-16*
