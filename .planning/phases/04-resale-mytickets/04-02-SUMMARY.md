---
phase: 04-resale-mytickets
plan: 02
status: complete
started: 2026-03-16
completed: 2026-03-16
tasks_completed: 2
tasks_total: 2
---

# Plan 04-02 Summary: Resale Marketplace

## What Was Built

Built the full resale marketplace page with on-chain listing discovery and USDC purchase flow. The Resale page now shows real on-chain listings (no mock data) with price cap badges, markup indicators, and a working buy flow.

## Key Files

### Created
- `frontend/src/hooks/useResalePurchase.ts` — Approve+buy state machine hook mirroring usePurchaseTicket for resale purchases

### Modified
- `frontend/src/pages/Resale.tsx` — Full rewrite: replaced mock data with useResaleListings/useResalePurchase hooks, added price cap badges, markup indicators, refresh button, loading/empty states

## Commits
- `3112719` feat(04-02): add useResaleListings and useResalePurchase hooks
- `459152d` feat(04-02): rewrite Resale.tsx with on-chain listings and USDC purchase flow

## Decisions
- Multicall scan with SCAN_DEPTH=10 per tokenId for listing discovery
- Markup indicator: green (face value), amber (<=20%), orange (>20%)
- Price cap badge displayed on each listing card image (DEMO-07)
- useResalePurchase mirrors exact state machine pattern from usePurchaseTicket
- Zero-address guards for CONTRACT_ADDRESS and MOCK_USDC_ADDRESS

## Deviations
- useResaleListings.ts was committed in plan 04-01's first commit (parallel execution overlap) — no functional impact

## Self-Check: PASSED
- Resale page displays on-chain listings (no mock imports) ✓
- Each listing shows max resale price prominently (DEMO-07) ✓
- Buy button triggers USDC approve+purchase flow (FEND-05) ✓
- Loading and empty states work ✓
- Build passes ✓
