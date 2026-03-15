---
plan: 01-03
phase: 01-contract-foundation
status: complete
started: 2026-03-15
completed: 2026-03-15
tasks_completed: 3
tasks_total: 3
---

# Plan 01-03 Summary: Testnet Deployment + Frontend Config

## What Was Built

Deployed MockUSDC and updated DucketTickets to Polkadot Hub Testnet, seeded 6 events with 12 tiers including stablePrice data, rewrote frontend ABI to match V1 contract.

## Key Files

### Modified
- `contracts/scripts/deploy.ts` — Deploys MockUSDC first, sets paymentToken, seeds events with stablePrice
- `frontend/src/lib/contract.ts` — Rewritten ABI matching V1 + stablecoin extensions, added MOCK_USDC_ABI and MOCK_USDC_ADDRESS
- `contracts/.env` — Updated CONTRACT_ADDRESS and added MOCK_USDC_ADDRESS
- `frontend/.env` — Updated VITE_CONTRACT_ADDRESS and added VITE_MOCK_USDC_ADDRESS

## Deployed Contracts

| Contract | Address |
|----------|---------|
| MockUSDC | 0x49f628eDeFaB3507B57C71A77593966bCE550065 |
| DucketTickets | 0x930ED5cd4DBecF02010942316C75708686e077b6 |

Network: Polkadot Hub Testnet (Chain ID 420420417)

## Verification

On-chain queries confirmed:
- MockUSDC: name, symbol, 6 decimals all correct
- DucketTickets: paymentToken set to MockUSDC, 6 events seeded, stablePrice values correct
- Human verification: approved

## Self-Check: PASSED
