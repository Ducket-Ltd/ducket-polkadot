# Roadmap: Ducket Polkadot

## Overview

Ducket Polkadot ships in six phases driven by hard sequential dependencies: the contract must be extended and redeployed before any frontend wiring can be tested, the purchase flow must work before you can own a ticket to resell, and XCM verification requires a minted ticket. Demo polish is strictly last. The path runs from contract foundation through working core loop to submission-ready demo, with every phase delivering an observable, verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Contract Foundation** - MockUSDC deployed, DucketTickets extended with stablecoin support, redeployed with seed events
- [x] **Phase 2: Frontend Reads** - Real on-chain data replaces all mock data; wallet connection fixed (completed 2026-03-15)
- [ ] **Phase 3: Stablecoin Purchase Flow** - Users can buy tickets with USDC via two-step approve+purchase flow
- [ ] **Phase 4: Resale + MyTickets** - Users can view owned tickets and list/buy resale tickets
- [x] **Phase 5: XCM Integration** - Light cross-chain ticket verification PoC via xcmExecute precompile (completed 2026-03-16)
- [ ] **Phase 6: Demo Polish + Submission** - Presentation-ready UI and all hackathon submission requirements met

## Phase Details

### Phase 1: Contract Foundation
**Goal**: The on-chain infrastructure supports stablecoin payments and is live on testnet with real seed data
**Depends on**: Nothing (first phase)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
  1. MockUSDC contract is deployed on Polkadot Hub Testnet and any wallet can mint test tokens
  2. DucketTickets contract accepts USDC payment via `mintTicketWithToken()` (approve+transferFrom pattern)
  3. Each TicketTier has a `stablePrice` field populated with a 6-decimal USDC amount
  4. Native DOT payment path still works alongside the new USDC path
  5. Redeployed contract address is in `.env` and frontend connects without errors
**Plans:** 1/3 plans executed

Plans:
- [ ] 01-01-PLAN.md — MockUSDC contract with TDD (6 decimals, public faucet)
- [ ] 01-02-PLAN.md — DucketTickets stablecoin extensions with TDD (mintTicketWithToken, buyResaleTicketWithToken, stablePrice)
- [ ] 01-03-PLAN.md — Deploy to testnet, seed events, update frontend ABI and env vars

### Phase 2: Frontend Reads
**Goal**: The frontend displays live on-chain data for all events, tiers, and owned tickets
**Depends on**: Phase 1
**Requirements**: FEND-01, FEND-03, FEND-06, FEND-07
**Success Criteria** (what must be TRUE):
  1. Home page and Event detail page show real seeded events and ticket tiers from contract (not hardcoded)
  2. MyTickets page shows tickets actually owned by the connected wallet (not empty mock array)
  3. Wallet connect button works without runtime errors on first click
  4. App startup fails loudly (visible warning) if `VITE_CONTRACT_ADDRESS` is address-zero
**Plans:** 2/2 plans complete

Plans:
- [ ] 02-01-PLAN.md — Data layer: event metadata mapping, useEventData/useMyTickets hooks, price formatters, WalletConnect fix, address-zero guard
- [ ] 02-02-PLAN.md — Wire Home, Event, MyTickets pages to on-chain hooks; human verification

### Phase 3: Stablecoin Purchase Flow
**Goal**: Users can buy tickets with USDC and the two-step approval flow is explicit and clear
**Depends on**: Phase 2
**Requirements**: FEND-02, STBL-01, STBL-02, STBL-03
**Success Criteria** (what must be TRUE):
  1. User sees ticket prices displayed as "$25 USDC" in addition to DOT price
  2. User can select USDC or DOT as payment token before purchasing
  3. Purchase modal shows "Step 1/2: Approve USDC" and then "Step 2/2: Purchase Ticket" as distinct steps
  4. A wallet with zero USDC allowance can complete a full ticket purchase end-to-end without errors
**Plans:** 2 plans

Plans:
- [ ] 03-01-PLAN.md — usePurchaseTicket state machine hook + Event.tsx payment selector and purchase flow wiring
- [ ] 03-02-PLAN.md — Human verification of purchase flow in browser

### Phase 4: Resale + MyTickets
**Goal**: Users can see their owned tickets, list them for resale, and others can buy those listings
**Depends on**: Phase 3
**Requirements**: FEND-04, FEND-05, DEMO-04, DEMO-07
**Success Criteria** (what must be TRUE):
  1. MyTickets shows each owned ticket with a QR code encoding tokenId, owner address, and contract address
  2. Ticket owner can create a resale listing and the maximum allowed resale price is displayed prominently
  3. Buyer can purchase a resale ticket using the same USDC approve+buy flow
  4. Resale listings accurately reflect the on-chain price cap (no listing above the cap is possible)
**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — MyTickets: QR codes per ticket, List for Resale modal with price cap enforcement
- [ ] 04-02-PLAN.md — Resale marketplace: on-chain listing discovery, USDC purchase flow, price cap display

### Phase 5: XCM Integration
**Goal**: Ticket ownership can trigger a cross-chain verification signal via the XCM precompile
**Depends on**: Phase 4
**Requirements**: XCM-01, XCM-02
**Success Criteria** (what must be TRUE):
  1. Clicking "Verify on Polkadot" on a ticket calls `emitXcmVerification()` and the transaction succeeds on testnet
  2. MyTickets shows a cross-chain verification status indicator after a ticket has been verified
  3. A block explorer link to the XCM transaction is accessible from the owned ticket UI
**Plans:** 2/2 plans complete

Plans:
- [ ] 05-01-PLAN.md — Solidity XCM extension: IXcm interface, emitXcmVerification function, redeploy to testnet, update ABI
- [ ] 05-02-PLAN.md — Frontend XCM UI: useXcmVerification hook, Verify on Polkadot button, verification badge with Blockscout link

### Phase 6: Demo Polish + Submission
**Goal**: The app is presentation-ready and all hackathon submission requirements are satisfied before March 20
**Depends on**: Phase 5
**Requirements**: DEMO-01, DEMO-02, DEMO-03, DEMO-05, DEMO-06
**Success Criteria** (what must be TRUE):
  1. Full demo flow (buy ticket → view in MyTickets → create resale listing → buy resale) works without errors on testnet
  2. "Verified on Polkadot" trust badge and platform fee split are visible in the UI
  3. Demo video (2-4 minutes) is recorded and uploaded
  4. README clearly documents which code is new vs. pre-existing (addresses 70% similarity rule)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Contract Foundation | 1/3 | In Progress|  |
| 2. Frontend Reads | 2/2 | Complete   | 2026-03-15 |
| 3. Stablecoin Purchase Flow | 0/2 | Not started | - |
| 4. Resale + MyTickets | 0/2 | Not started | - |
| 5. XCM Integration | 2/2 | Complete   | 2026-03-16 |
| 6. Demo Polish + Submission | 0/? | Not started | - |
