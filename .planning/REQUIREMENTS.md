# Requirements: Ducket Polkadot

**Defined:** 2026-03-17
**Core Value:** Fair, transparent ticketing with stable pricing — stablecoin payments prevent revenue volatility, resale caps prevent scalpers

## v1.1 Requirements

Requirements for UI/UX refinement milestone — transform AI-template look to confident, clean design.

### Copy & Content

- [x] **COPY-01**: Create centralized `src/constants/copy.ts` with all UI strings extracted per page
- [ ] **COPY-02**: Rewrite homepage hero — outcome-first headline, no "Blockchain-Powered" or "Reimagined"
- [ ] **COPY-03**: Rewrite homepage feature card descriptions — one concrete claim each, no buzzwords
- [ ] **COPY-04**: Rewrite HowItWorks page — direct tone, remove "mathematically impossible" and similar
- [ ] **COPY-05**: Rewrite Event detail page copy — ticket rules, fee descriptions, purchase labels
- [ ] **COPY-06**: Rewrite MyTickets page — celebrate ownership, rename "Emit XCM Attestation" to human-readable
- [ ] **COPY-07**: Rewrite Resale page copy — simplify "How Resale Works", tighten listing descriptions

### Visual Hierarchy

- [x] **VIS-01**: Install and configure Inter Variable font as primary typeface
- [ ] **VIS-02**: Consolidate homepage trust badges from 5 to 2-3 specific verifiable claims
- [ ] **VIS-03**: Add active nav link state to Header component
- [ ] **VIS-04**: Declutter homepage layout — rethink feature card grid, reduce repetitive sections
- [ ] **VIS-05**: Tighten border radius and apply Stripe/Linear-style spacing across all pages
- [x] **VIS-06**: Unify color system — replace hardcoded hex values with CSS custom properties

### Micro-interactions

- [ ] **ANIM-01**: Install motion library and add entrance fade animations to page sections and cards
- [ ] **ANIM-02**: Add hover lift effect to event cards and interactive elements
- [ ] **ANIM-03**: Add button press feedback animation
- [ ] **ANIM-04**: Install sonner and replace deprecated Toast with sonner toasts for purchase/error feedback

### Demo Hardening

- [ ] **DEMO-08**: Add 8-second timeout to useEventData with error fallback instead of infinite spinner

## v1.0 Requirements (Previous Milestone)

### Contract Foundation

- [x] **CONT-01**: Deploy MockUSDC ERC-20 (6 decimals, public mint) on Polkadot Hub Testnet
- [x] **CONT-02**: Add `mintTicketWithToken()` function accepting ERC-20 payments via approve+transferFrom
- [x] **CONT-03**: Add `stablePrice` field to TicketTier struct for stablecoin pricing (6 decimals)
- [x] **CONT-04**: Add `buyResaleTicketWithToken()` for stablecoin resale purchases
- [x] **CONT-05**: Support dual payment — both native DOT and stablecoin paths coexist
- [x] **CONT-06**: Redeploy DucketTickets with stablecoin support and seed events on testnet

### Frontend Integration

- [x] **FEND-01**: Replace mock event data with real contract reads (getEvent, getTicketTier)
- [x] **FEND-02**: Wire ticket purchase to real contract call (mintTicket / mintTicketWithToken)
- [x] **FEND-03**: Display user's owned tickets from on-chain data (getUserTicketsForEvent)
- [ ] **FEND-04**: Wire resale listing creation to contract (listForResale)
- [ ] **FEND-05**: Wire resale purchase to contract (buyResaleTicket / buyResaleTicketWithToken)
- [x] **FEND-06**: Fix WalletConnect connector array access guard
- [x] **FEND-07**: Set VITE_CONTRACT_ADDRESS correctly after redeployment

### Stablecoin UX

- [x] **STBL-01**: Implement approve+purchase state machine flow in purchase modal
- [x] **STBL-02**: Display ticket prices in stablecoin units ("$25 USDC") alongside DOT price
- [x] **STBL-03**: Payment token selector allowing user to choose DOT or USDC

### XCM Integration

- [x] **XCM-01**: Implement light XCM cross-chain ticket verification via xcmExecute precompile
- [x] **XCM-02**: Add UI indicator showing cross-chain verification status on owned tickets

### Demo & Submission

- [ ] **DEMO-01**: End-to-end demo flow working on Polkadot Hub Testnet (buy → view → resale)
- [ ] **DEMO-02**: Record 2-4 minute demo video for submission
- [ ] **DEMO-03**: Document hackathon contributions clearly (70% similarity rule)
- [ ] **DEMO-04**: QR code generated on owned tickets (tokenId + owner + contract)
- [x] **DEMO-05**: Trust badges and "Verified on Polkadot" indicators
- [x] **DEMO-06**: Fee transparency UI showing platform fee split
- [ ] **DEMO-07**: Resale price cap displayed prominently on resale listings

## v2 Requirements

Deferred to post-hackathon.

### Advanced Features

- **ADV-01**: Full XCM cross-chain ticket transfer between parachains
- **ADV-02**: Event cancellation with automated refund logic
- **ADV-03**: Organizer event creation UI
- **ADV-04**: Real USDC/USDT via Circle bridge (mainnet)
- **ADV-05**: Comprehensive smart contract test suite
- **ADV-06**: Mobile-responsive design overhaul
- **ADV-07**: Admin emergency pause (Pausable pattern)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode toggle | Existing light theme is clean; adding toggle wastes timeline |
| Skeleton loading screens | Over-engineering for demo — simple spinner is fine |
| Onboarding tour | Not needed for hackathon demo with narrated walkthrough |
| Component library (Storybook) | No value for single-developer hackathon project |
| Mobile layout audit | Web-first for hackathon demo on laptop |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COPY-01 | Phase 7 | Complete |
| COPY-02 | Phase 8 | Pending |
| COPY-03 | Phase 8 | Pending |
| COPY-04 | Phase 8 | Pending |
| COPY-05 | Phase 8 | Pending |
| COPY-06 | Phase 8 | Pending |
| COPY-07 | Phase 8 | Pending |
| VIS-01 | Phase 7 | Complete |
| VIS-02 | Phase 8 | Pending |
| VIS-03 | Phase 8 | Pending |
| VIS-04 | Phase 8 | Pending |
| VIS-05 | Phase 8 | Pending |
| VIS-06 | Phase 7 | Complete |
| ANIM-01 | Phase 9 | Pending |
| ANIM-02 | Phase 9 | Pending |
| ANIM-03 | Phase 9 | Pending |
| ANIM-04 | Phase 9 | Pending |
| DEMO-08 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after v1.1 roadmap creation (phases 7-9)*
