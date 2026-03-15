# Requirements: Ducket Polkadot

**Defined:** 2026-03-15
**Core Value:** Fair, transparent ticketing with stable pricing — stablecoin payments prevent revenue volatility, resale caps prevent scalping

## v1 Requirements

Requirements for hackathon submission (March 20) and demo day (March 24-25).

### Contract Foundation

- [x] **CONT-01**: Deploy MockUSDC ERC-20 (6 decimals, public mint) on Polkadot Hub Testnet
- [ ] **CONT-02**: Add `mintTicketWithToken()` function accepting ERC-20 payments via approve+transferFrom
- [ ] **CONT-03**: Add `stablePrice` field to TicketTier struct for stablecoin pricing (6 decimals)
- [ ] **CONT-04**: Add `buyResaleTicketWithToken()` for stablecoin resale purchases
- [ ] **CONT-05**: Support dual payment — both native DOT and stablecoin paths coexist
- [ ] **CONT-06**: Redeploy DucketTickets with stablecoin support and seed events on testnet

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

- [ ] **XCM-01**: Implement light XCM cross-chain ticket verification via xcmExecute precompile
- [ ] **XCM-02**: Add UI indicator showing cross-chain verification status on owned tickets

### Demo & Submission

- [ ] **DEMO-01**: End-to-end demo flow working on Polkadot Hub Testnet (buy → view → resale)
- [ ] **DEMO-02**: Record 2-4 minute demo video for submission
- [ ] **DEMO-03**: Document hackathon contributions clearly (70% similarity rule)
- [ ] **DEMO-04**: QR code generated on owned tickets (tokenId + owner + contract)
- [ ] **DEMO-05**: Trust badges and "Verified on Polkadot" indicators
- [ ] **DEMO-06**: Fee transparency UI showing platform fee split
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
| Full XCM cross-chain transfers | Requires parachain channel setup, 3-5 days alone — too risky for deadline |
| AI-powered features | Not aligned with existing codebase or team expertise |
| PVM Smart Contracts | Targeting EVM track only |
| Dutch auction / offer-counteroffer | Different resale logic, significant scope — mention as v2 |
| Full test suite | Hackathon MVP — judges weight working demo over test coverage |
| Event creation UI | Demo uses seed script; organizer UI is post-hackathon |
| Mobile app | Web-first for hackathon |
| DucketV2 migration | V2 is incomplete; stick with V1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 1 | Pending |
| CONT-03 | Phase 1 | Pending |
| CONT-04 | Phase 1 | Pending |
| CONT-05 | Phase 1 | Pending |
| CONT-06 | Phase 1 | Pending |
| FEND-01 | Phase 2 | Complete |
| FEND-03 | Phase 2 | Complete |
| FEND-06 | Phase 2 | Complete |
| FEND-07 | Phase 2 | Complete |
| FEND-02 | Phase 3 | Complete |
| STBL-01 | Phase 3 | Complete |
| STBL-02 | Phase 3 | Complete |
| STBL-03 | Phase 3 | Complete |
| FEND-04 | Phase 4 | Pending |
| FEND-05 | Phase 4 | Pending |
| DEMO-04 | Phase 4 | Pending |
| DEMO-07 | Phase 4 | Pending |
| XCM-01 | Phase 5 | Pending |
| XCM-02 | Phase 5 | Pending |
| DEMO-01 | Phase 6 | Pending |
| DEMO-02 | Phase 6 | Pending |
| DEMO-03 | Phase 6 | Pending |
| DEMO-05 | Phase 6 | Pending |
| DEMO-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 — traceability complete after roadmap creation*
