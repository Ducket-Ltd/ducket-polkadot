# Ducket Polkadot

## What This Is

Ducket is a stablecoin-powered event ticketing dApp on Polkadot Hub with built-in anti-scalping mechanics and cross-chain ticket verification via XCM. It lets event organizers create events with tiered tickets (GA, VIP, etc.), enforces resale price caps to prevent scalping, and allows ticket holders to verify ownership across Polkadot parachains. This is an MVP targeting the Polkadot Solidity Hackathon (EVM Smart Contract Track).

## Core Value

Event organizers and attendees get fair, transparent ticketing with stable pricing — tickets priced in stablecoins so revenue doesn't fluctuate with DOT price, and resale caps prevent scalpers from gouging buyers.

## Requirements

### Validated

- ✓ ERC1155 smart contract deployed on Polkadot Hub Testnet — existing
- ✓ Event creation with tiered tickets (GA, VIP, etc.) — existing (contract)
- ✓ Resale price cap enforcement (100-200% of original) — existing (contract)
- ✓ Platform fee splitting on primary and resale — existing (contract)
- ✓ Frontend scaffolding with event browsing, ticket detail pages — existing (UI)
- ✓ Wallet connection via wagmi/viem — existing (config)
- ✓ Contract deployment and seeding scripts — existing

### Active

- [ ] Wire up real contract calls for ticket purchase (replace mock setTimeout)
- [ ] Wire up real contract calls for resale listing and buying
- [ ] Display user's owned tickets from on-chain data (replace empty mock array)
- [ ] Stablecoin (ERC-20) payment support for ticket purchases
- [ ] Light XCM cross-chain ticket verification proof-of-concept
- [ ] Ticket transfer functionality between wallets
- [ ] Polish UI/UX for demo day presentation
- [ ] End-to-end demo flow that works live on Polkadot Hub Testnet

### Out of Scope

- Deep XCM cross-chain ticket transfers between parachains — too complex for 5-day timeline
- AI-powered features — not aligned with existing codebase
- PVM Smart Contracts — targeting EVM track only
- Mobile app — web-first for hackathon
- Full test suite — hackathon MVP, not production
- Event cancellation/refund logic — nice-to-have, not needed for demo
- DucketV2 contract migration — stick with DucketTickets.sol

## Context

- This is a modified version of the main Ducket platform (../ducket-web), adapted for Polkadot Hub
- Similar adaptations exist for other chains (../ducket-starknet)
- Contract is already deployed on Polkadot Hub Testnet with seed events
- Frontend currently uses mock data and setTimeout instead of real contract calls
- The user has experience wiring up contract integrations (~1 day effort)
- Hackathon is co-led by OpenGuild and Web3 Foundation
- EVM Smart Contract Track focuses on "DeFi & Stablecoin-enabled dapps"
- Polkadot Hub is EVM-compatible, supports XCM natively

## Constraints

- **Timeline**: Submission closes March 20, 2026 (5 days from now)
- **Demo Day**: March 24-25, 2026 — must have polished demo flow
- **Track**: EVM Smart Contract Track — Solidity on Polkadot Hub
- **Contract changes**: Moderate — add stablecoin support and light XCM, keep existing structure
- **Chain**: Polkadot Hub Testnet (Chain ID: 420420417, RPC: https://services.polkadothub-rpc.com/testnet)
- **Existing contract**: DucketTickets.sol already deployed — may need redeployment with changes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Target EVM Smart Contract Track | Already have Solidity contract deployed; natural fit | — Pending |
| Stablecoin ticket pricing | Directly matches track focus area "DeFi & Stablecoin-enabled dapps" | — Pending |
| Light XCM integration | Shows Polkadot-native capability without overscoping for 5 days | — Pending |
| Consumer dApp framing | User-friendly ticketing that happens to be on-chain | — Pending |
| Keep DucketTickets.sol (not V2) | V2 is incomplete; V1 is deployed and functional | — Pending |
| Moderate contract changes only | Balance between competitive features and shipping deadline | — Pending |

---
*Last updated: 2026-03-15 after initialization*
