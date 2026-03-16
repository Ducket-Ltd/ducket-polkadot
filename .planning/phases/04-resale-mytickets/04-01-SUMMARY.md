---
phase: 04-resale-mytickets
plan: 01
status: complete
started: 2026-03-16
completed: 2026-03-16
tasks_completed: 2
tasks_total: 2
---

# Plan 04-01 Summary: QR Codes + List for Resale

## What Was Built

Added QR code display to owned tickets and wired the "List for Resale" action on MyTickets page. Users can now see scannable QR codes encoding ownership proof and list tickets for resale at price-capped rates.

## Key Files

### Created
- `frontend/src/components/TicketQRCode.tsx` — QR code SVG component using qrcode.react, encodes tokenId + owner + contract address
- `frontend/src/hooks/useListForResale.ts` — Write hook wrapping listForResale contract call with idle/listing/confirming/success/error state machine

### Modified
- `frontend/src/pages/MyTickets.tsx` — Added QR codes per tier, "List for Resale" button with dialog modal, price cap display
- `frontend/package.json` — Added qrcode.react dependency

## Commits
- `c0778b6` feat(04-01): install qrcode.react and create TicketQRCode component + useListForResale hook
- `697761a` feat(04-01): wire QR codes and List for Resale modal into MyTickets page

## Decisions
- QR payload is JSON with tokenId, owner address, and contract address
- Listing modal shows max resale price (stablePrice * maxResalePercentage / 100) before submission
- USDC-only listings (isStablecoin=true) per research recommendation
- Single useWriteContract instance pattern maintained from Phase 3

## Deviations
- useResaleListings.ts was created in this plan's first commit instead of plan 04-02 (no functional impact — hook was needed by both plans)

## Self-Check: PASSED
- TicketQRCode renders QR SVG with correct payload ✓
- useListForResale follows established write-contract patterns ✓
- MyTickets page shows QR codes and listing modal ✓
- Build passes ✓
