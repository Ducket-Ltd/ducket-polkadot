---
phase: 04-resale-mytickets
verified: 2026-03-16T00:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Open MyTickets with a connected wallet that owns tickets"
    expected: "Each tier row shows a QR code on the left side that encodes tokenId, owner address, and contract address as JSON"
    why_human: "QR content and visual rendering cannot be verified programmatically"
  - test: "Click 'List for Resale' on an owned tier"
    expected: "Modal opens, max allowed resale price banner appears prominently before any input, price input with step=0.01 is present, submitting above the cap shows an inline error without sending a transaction"
    why_human: "Modal flow and inline validation UX require browser interaction"
  - test: "Submit a valid resale listing price via the modal"
    expected: "Wallet prompt appears for listForResale, step indicator transitions listing -> confirming -> success, modal closes automatically after ~2 seconds"
    why_human: "Wallet interaction and on-chain confirmation are runtime events"
  - test: "Open Resale page with active on-chain listings"
    expected: "Listings grid appears with price cap badge (amber, top-right of image), price cap detail line below price, and seller address truncated"
    why_human: "Requires seeded on-chain data to populate listings"
  - test: "Click Buy on a resale listing with insufficient USDC allowance"
    expected: "Wallet prompts for USDC approve first (step label shows 'Step 1/2: Approve USDC'), then prompts for buyResaleTicketWithToken ('Step 2/2: Buy Ticket')"
    why_human: "Two-step approve+buy wallet flow requires live wallet interaction"
---

# Phase 4: Resale + My Tickets Verification Report

**Phase Goal:** Users can see their owned tickets, list them for resale, and others can buy those listings
**Verified:** 2026-03-16
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each owned ticket displays a QR code encoding tokenId, owner address, and contract address | VERIFIED | `TicketQRCode.tsx` renders `QRCodeSVG` with `JSON.stringify({ tokenId, owner: address, contract: CONTRACT_ADDRESS })`; `MyTickets.tsx` renders `<TicketQRCode tokenId={tier.tokenId} size={96} />` inside each tier row |
| 2 | Ticket owner can open a listing modal, enter a price, and submit a listForResale transaction | VERIFIED | `MyTickets.tsx` has `Dialog` open on "List for Resale" button click; `handleSubmit` calls `list(tokenId, 0, priceBigint, true)` via `useListForResale`; hook calls `writeContract` with `functionName: 'listForResale'` |
| 3 | The max allowed resale price is displayed in the listing modal before submission | VERIFIED | `getMaxResalePrice()` computes `(tier.stablePrice * BigInt(event.maxResalePercentage)) / 100n`; rendered in a prominent banner before the price input field (line 230–239, MyTickets.tsx) |
| 4 | Resale page shows real on-chain listings fetched via multicall scan of resaleListings mapping | VERIFIED | `useResaleListings.ts` builds multicall array over `ALL_TIER_TOKEN_IDS` x `[0, scanLimit)` using `useReadContracts`; `Resale.tsx` imports `useResaleListings` and renders from `listings` array; no mock data imports remain |
| 5 | Buyer can purchase a resale ticket using USDC approve+buy two-step flow | VERIFIED | `useResalePurchase.ts` reads allowance, calls `approve` if insufficient, then `buyResaleTicketWithToken` via single `useWriteContract` instance; state machine transitions `approving -> approve-confirming -> purchasing -> purchase-confirming -> success` |
| 6 | Each resale listing displays the max allowed resale price prominently | VERIFIED | Price cap badge in card image top-right (`Max: {formatUSDC(listing.maxResalePrice)}`, amber, DEMO-07); plus `Price cap: {formatUSDC(listing.maxResalePrice)}` text line below price |
| 7 | Resale listings show seller address, price in USDC, tier name, and event name | VERIFIED | `Resale.tsx` renders `listing.eventName`, `listing.tierName` badge, `formatUSDC(listing.price)`, and `truncateAddress(listing.seller)` |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `frontend/src/components/TicketQRCode.tsx` | QR code SVG component encoding ticket ownership proof | VERIFIED | 28 lines; imports `QRCodeSVG` from `qrcode.react`; renders correct JSON payload; gracefully handles no wallet (empty div placeholder) |
| `frontend/src/hooks/useListForResale.ts` | Write hook wrapping listForResale with state tracking | VERIFIED | 90 lines; exports `useListForResale` and `ListingStep`; single `useWriteContract` instance; useEffect chains for txHash and isConfirmed; zero-address guard present |
| `frontend/src/pages/MyTickets.tsx` | Updated page with QR codes per tier and List for Resale action | VERIFIED | 338 lines; imports and renders `<TicketQRCode>` per tier; Dialog modal with price cap banner, price input, step indicators |
| `frontend/src/hooks/useResaleListings.ts` | Multicall scan hook returning active ActiveListing[] | VERIFIED | 137 lines; exports `useResaleListings` and `ActiveListing`; `useReadContracts` multicall over all tokenIds; filters `active === true` and non-zero seller; enriches with eventName, tierName, maxResalePrice |
| `frontend/src/hooks/useResalePurchase.ts` | Approve+buy state machine hook for resale purchases | VERIFIED | 194 lines; exports `useResalePurchase` and `ResalePurchaseStep`; mirrors `usePurchaseTicket` pattern exactly; handles DOT path (native value) and USDC path (approve+buy); stepLabel computed correctly |
| `frontend/src/pages/Resale.tsx` | Resale marketplace page wired to on-chain hooks, no mock data | VERIFIED | 244 lines; imports `useResaleListings` and `useResalePurchase`; no mockData imports; loading/empty/grid states all implemented |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `TicketQRCode.tsx` | `qrcode.react` | `QRCodeSVG` import | WIRED | Line 1: `import { QRCodeSVG } from 'qrcode.react'`; rendered on line 25 |
| `useListForResale.ts` | `frontend/src/lib/contract.ts` | `writeContract` with `listForResale` | WIRED | Line 75: `functionName: 'listForResale'`; uses `DUCKET_ABI` and `CONTRACT_ADDRESS` |
| `MyTickets.tsx` | `TicketQRCode.tsx` | `<TicketQRCode` render per tier | WIRED | Line 17: import; line 172: `<TicketQRCode tokenId={tier.tokenId} size={96} />` in tier map |
| `useResaleListings.ts` | `frontend/src/lib/contract.ts` | `useReadContracts` multicall on `resaleListings` | WIRED | Line 49: `functionName: 'resaleListings'`; uses `DUCKET_ABI` and `CONTRACT_ADDRESS` |
| `useResalePurchase.ts` | `frontend/src/lib/contract.ts` | `writeContract` with `buyResaleTicketWithToken` and `approve` | WIRED | Line 62: `functionName: 'buyResaleTicketWithToken'`; line 142: `functionName: 'approve'` on MockUSDC |
| `Resale.tsx` | `useResaleListings.ts` | hook call for listing data | WIRED | Line 10: import; line 16: `const { listings, isLoading, refetch } = useResaleListings()` |
| `Resale.tsx` | `useResalePurchase.ts` | hook call for purchase action | WIRED | Line 11: import; line 17: `const { stepLabel, isPending, errorMessage, isSuccess, buy, reset } = useResalePurchase()` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FEND-04 | 04-01-PLAN.md | Wire resale listing creation to contract (listForResale) | SATISFIED | `useListForResale.ts` calls `writeContract({ functionName: 'listForResale', ... })`; wired into MyTickets modal submit handler |
| DEMO-04 | 04-01-PLAN.md | QR code generated on owned tickets (tokenId + owner + contract) | SATISFIED | `TicketQRCode.tsx` encodes `{ tokenId, owner: address, contract: CONTRACT_ADDRESS }` as JSON in QRCodeSVG |
| FEND-05 | 04-02-PLAN.md | Wire resale purchase to contract (buyResaleTicket / buyResaleTicketWithToken) | SATISFIED | `useResalePurchase.ts` calls `buyResaleTicketWithToken` (USDC path) and `buyResaleTicket` (DOT path); wired in Resale.tsx `handleBuy` |
| DEMO-07 | 04-02-PLAN.md | Resale price cap displayed prominently on resale listings | SATISFIED | Amber badge on each card image ("Max: $X.XX USDC") and detail line below price ("Price cap: $X.XX USDC"); also shown in MyTickets listing modal banner |

All 4 phase-mapped requirements satisfied. No orphaned requirements found for Phase 4.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `frontend/src/pages/Resale.tsx` | 103–108 | Markup % computed against `maxResalePrice` (cap), not `stablePrice` (face value) | Warning | Cosmetic: a ticket listed at 130% of face value shows "0%" markup instead of "+30%". Price cap display is still accurate. Does not block purchase or mislead on the cap. |

No blocker anti-patterns. The single warning is a minor cosmetic inaccuracy in the markup badge.

### Human Verification Required

#### 1. QR Code Visual Rendering

**Test:** Open MyTickets page with a wallet that owns tickets. Inspect the QR code displayed per tier.
**Expected:** A scannable QR code appears; scanning it produces JSON with `tokenId`, `owner` (wallet address), and `contract` (deployed contract address).
**Why human:** QR code visual output and scan correctness cannot be verified programmatically.

#### 2. Listing Modal Flow

**Test:** Click "List for Resale" on an owned tier. Observe the modal.
**Expected:** Modal opens immediately; max allowed resale price appears in a highlighted banner before any input is available; entering a price above the cap shows an inline error; valid price triggers a wallet signature request.
**Why human:** Dialog open/close behavior and inline validation UX require browser interaction.

#### 3. listForResale On-Chain Submission

**Test:** Submit a valid listing price in the modal with a connected wallet.
**Expected:** Wallet prompts for `listForResale` confirmation; step indicator advances listing -> confirming -> success; modal auto-closes after ~2 seconds.
**Why human:** Wallet prompt appearance and on-chain confirmation flow are runtime events.

#### 4. Resale Page With Active Listings

**Test:** View the Resale page when on-chain listings exist (requires prior `listForResale` calls on testnet).
**Expected:** Listing cards appear in a grid; each has an amber "Max: $X.XX USDC" badge on the image; price cap detail line shows below the listed price; seller address is truncated.
**Why human:** Requires seeded on-chain data; listing rendering cannot be verified without live contract state.

#### 5. USDC Approve+Buy Flow for Resale

**Test:** Click Buy on a resale listing with zero USDC allowance.
**Expected:** Wallet first prompts for USDC `approve`; button label shows "Step 1/2: Approve USDC"; after approval confirms, wallet prompts again for `buyResaleTicketWithToken`; label shows "Step 2/2: Buy Ticket"; on success, listing disappears after refresh.
**Why human:** Two-step wallet interaction requires live wallet and contract state.

### Gaps Summary

No gaps. All 7 observable truths are verified by the actual codebase. All 6 artifacts exist and are substantive (no stubs). All 7 key links are wired. All 4 requirement IDs (FEND-04, FEND-05, DEMO-04, DEMO-07) are satisfied by concrete implementations. Build compiles cleanly with zero errors.

One minor warning exists: the markup percentage badge in Resale.tsx computes against the price cap rather than face value, making the indicator cosmetically inaccurate for listings above face value. This does not affect the price cap display (DEMO-07), purchase flow (FEND-05), or any other phase goal criterion.

---

_Verified: 2026-03-16_
_Verifier: Claude (gsd-verifier)_
