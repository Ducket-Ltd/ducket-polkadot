# Roadmap: Ducket Polkadot

## Milestones

- 🚧 **v1.0 Core** - Phases 1-6 (in progress — see details below)
- 🚧 **v1.1 UI/UX Refinement** - Phases 7-9 (active milestone)

## Phases

<details>
<summary>🚧 v1.0 Core (Phases 1-6)</summary>

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
**Plans:** 1/2 plans executed

Plans:
- [ ] 06-01-PLAN.md — Trust badges (Verified on Polkadot) and fee transparency (2.5% platform fee) on Event + Home pages
- [ ] 06-02-PLAN.md — Hackathon README, full demo smoke test, and video recording

</details>

### v1.1 UI/UX Refinement (Active Milestone)

**Milestone Goal:** Transform the UI from AI-template look to confident, clean design (Stripe/Linear energy) — rewrite copy, fix layouts, reduce clutter, add micro-interactions, harden demo reliability.

- [x] **Phase 7: Foundation** - Install Inter font, unify color system, create copy constants file (completed 2026-03-17)
- [ ] **Phase 8: Copy + Visual Hierarchy** - Rewrite all page copy, fix layouts, tighten visual density
- [ ] **Phase 9: Micro-interactions + Demo Hardening** - Animations, toast replacement, RPC timeout safety net

## Phase Details

### Phase 7: Foundation
**Goal**: The design and content systems are ready for copy and layout work to begin — font installed, color tokens unified, all UI strings extracted into one editable file
**Depends on**: Phase 6
**Requirements**: VIS-01, VIS-06, COPY-01
**Success Criteria** (what must be TRUE):
  1. App renders in Inter Variable font across all pages with no layout shift
  2. All hardcoded hex color values are replaced by CSS custom properties and the UI looks identical to before
  3. A `src/constants/copy.ts` file exists with named sections (HOME, EVENT_PAGE, MY_TICKETS, RESALE_PAGE, HOW_IT_WORKS_PAGE) and at least one string per page imported and rendered correctly in the UI
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — Install Inter font, add primary-light to Tailwind, replace all hardcoded hex with token classes
- [ ] 07-02-PLAN.md — Create centralized copy.ts and wire one string per page

### Phase 8: Copy + Visual Hierarchy
**Goal**: Every page sounds like a person wrote it and visual hierarchy guides the judge's eye to the three credibility signals — Polkadot deployment, anti-scalping enforcement, XCM-readiness
**Depends on**: Phase 7
**Requirements**: COPY-02, COPY-03, COPY-04, COPY-05, COPY-06, COPY-07, VIS-02, VIS-03, VIS-04, VIS-05
**Success Criteria** (what must be TRUE):
  1. The homepage hero headline explains what Ducket does in one outcome-first sentence with no blockchain buzzwords
  2. The homepage trust badge section shows 2-3 specific verifiable claims, not 5+ generic badges
  3. The Header shows an active link state that visually indicates which page the user is on
  4. The HowItWorks, Event, MyTickets, and Resale pages use direct human tone — no "mathematically impossible" or "Emit XCM Attestation" phrasing
  5. Border radius and spacing are consistent with Stripe/Linear aesthetic across all pages (tighter radius, generous whitespace)
**Plans**: TBD

Plans:
- (Planned by /gsd:plan-phase 8)

### Phase 9: Micro-interactions + Demo Hardening
**Goal**: The UI responds to user actions with subtle feedback and the demo survives real conditions — cold RPC, wallet switches, and demo hardware
**Depends on**: Phase 8
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, DEMO-08
**Success Criteria** (what must be TRUE):
  1. Page sections and cards fade in on entrance — animations are subtle enough that a non-developer wouldn't consciously notice them
  2. Event cards and interactive elements lift slightly on hover
  3. Buttons give immediate press feedback (scale or opacity shift) on click
  4. Purchase and error actions show sonner toast notifications, not the deprecated shadcn Toast
  5. If `useEventData` has not resolved after 8 seconds, the page shows a static fallback with a retry button instead of an infinite spinner
**Plans**: TBD

Plans:
- (Planned by /gsd:plan-phase 9)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Contract Foundation | v1.0 | 1/3 | In Progress | - |
| 2. Frontend Reads | v1.0 | 2/2 | Complete | 2026-03-15 |
| 3. Stablecoin Purchase Flow | v1.0 | 0/2 | Not started | - |
| 4. Resale + MyTickets | v1.0 | 0/2 | Not started | - |
| 5. XCM Integration | v1.0 | 2/2 | Complete | 2026-03-16 |
| 6. Demo Polish + Submission | v1.0 | 1/2 | In Progress | - |
| 7. Foundation | 2/2 | Complete   | 2026-03-17 | - |
| 8. Copy + Visual Hierarchy | v1.1 | 0/TBD | Not started | - |
| 9. Micro-interactions + Demo Hardening | v1.1 | 0/TBD | Not started | - |
