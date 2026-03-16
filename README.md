# Ducket — Fair Ticketing on Polkadot Hub

Blockchain-powered event ticketing with stablecoin payments, on-chain resale caps, and XCM cross-chain verification.

---

## Problem Statement

Ticket scalping, counterfeit tickets, and opaque fees undermine trust in live events. Buyers routinely pay 3–5x face value on secondary markets while platforms extract hidden fees. There is no reliable way to verify ticket authenticity across different platforms or blockchains.

---

## Solution

Ducket enforces fair ticketing rules at the contract level — no backend can override them.

- **ERC-1155 NFT tickets** on Polkadot Hub (EVM) — tickets are on-chain assets, not database rows
- **Stablecoin (USDC) payments** via `approve` + `transferFrom` — eliminates DOT price volatility for event organizers
- **Smart contract-enforced resale price caps** — resellers cannot list above 200% of original price
- **XCM cross-chain verification attestation** — ticket holders can prove ownership across Polkadot parachains
- **2.5% transparent platform fee** — displayed at purchase time, encoded in contract, not adjustable per-event

---

## Live Demo

- **Testnet:** Polkadot Hub Testnet (Chain ID: 420420417)
- **RPC:** `https://services.polkadothub-rpc.com/testnet`

**Contract Addresses:**
| Contract | Address |
|----------|---------|
| DucketTickets | `0x3c66B752B2B2cBddd9E1A776dA7a23224C8de9b4` |
| MockUSDC | `0x0F306B476DB8201Ed99ee1C3Ca029084b70Bf4Cf` |

**Demo Video:** [TBD — will be added after recording]

---

## Hackathon Contributions

This project builds on a pre-existing frontend scaffold and base ERC-1155 contract. All hackathon work is listed below with file-level detail.

### What's New (Built for This Hackathon)

| File/Feature | Status | Description |
|---|---|---|
| `contracts/contracts/DucketTickets.sol` — stablecoin + XCM extensions | Modified | Added `mintTicketWithToken`, `buyResaleTicketWithToken`, `stablePrice` field, `emitXcmVerification`, `IXcm` interface |
| `contracts/contracts/MockUSDC.sol` | New file | ERC-20 mock stablecoin (6 decimals, public faucet) for testnet |
| `frontend/src/hooks/useEventData.ts` | New file | Batched multicall for all event + tier data |
| `frontend/src/hooks/useMyTickets.ts` | New file | Wallet-owned ticket discovery via `balanceOf` |
| `frontend/src/hooks/usePurchaseTicket.ts` | New file | Dual-token purchase state machine (DOT + USDC) |
| `frontend/src/hooks/useListForResale.ts` | New file | Resale listing creation with price cap |
| `frontend/src/hooks/useResaleListings.ts` | New file | On-chain resale listing discovery via multicall scan |
| `frontend/src/hooks/useResalePurchase.ts` | New file | Resale purchase flow (DOT + USDC) |
| `frontend/src/hooks/useXcmVerification.ts` | New file | XCM cross-chain attestation via Polkadot precompile |
| `frontend/src/components/TicketQRCode.tsx` | New file | QR code encoding tokenId + owner + contract |
| `frontend/src/pages/Event.tsx` | Rewritten | Wired to real contract data, purchase flow, trust badges, fee transparency |
| `frontend/src/pages/Home.tsx` | Rewritten | Wired to real on-chain events, trust badges |
| `frontend/src/pages/MyTickets.tsx` | Rewritten | Real wallet data, QR codes, XCM verification, resale listing |
| `frontend/src/pages/Resale.tsx` | Rewritten | On-chain resale marketplace |
| `frontend/src/data/eventMetadata.ts` | New file | Static metadata mapping for seeded events |
| `frontend/src/lib/utils.ts` — formatters | Modified | Added `formatPAS`, `formatUSDC`, `formatDateTime` |
| Deployment scripts | New/Modified | Testnet deployment and seeding |

### Pre-Existing Scaffold (Not Hackathon Work)

| File | Source | Notes |
|---|---|---|
| `frontend/src/components/ui/*` | shadcn/ui | Standard component library |
| `frontend/src/config/chains.ts` | Adapted | Chain config changed for Polkadot Hub |
| Base contract (ERC-1155, AccessControl) | OpenZeppelin | Standard on-chain primitives |
| Tailwind + Vite config | Boilerplate | Standard React project setup |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Solidity (EVM on Polkadot Hub) |
| Frontend | React + TypeScript + Vite |
| Contract interaction | wagmi v2 + viem |
| Styling | Tailwind CSS + shadcn/ui |
| Cross-chain | XCM precompile (`0x000a0000`) |
| Payments | ERC-20 `approve` + `transferFrom` (USDC) |

---

## Architecture

Solidity ERC-1155 contract with stablecoin extension and XCM verification. React SPA reads all data from chain via wagmi multicall. No backend server — every state read and write goes directly to Polkadot Hub Testnet.

```
User Wallet (MetaMask)
    │
    ▼
React SPA (wagmi v2 + viem)
    │  multicall reads
    ▼
DucketTickets.sol (ERC-1155)
    │  emitXcmVerification
    ▼
XCM Precompile (0x000a0000)
    │  cross-chain message
    ▼
Polkadot Relay Chain / Parachains
```

---

## How to Run Locally

```bash
cd frontend && npm install && npm run dev
```

**Prerequisites:**
- MetaMask configured for Polkadot Hub Testnet
  - RPC URL: `https://services.polkadothub-rpc.com/testnet`
  - Chain ID: `420420417`
  - Currency symbol: `PAS`
- Testnet PAS for gas (from faucet)
- MockUSDC from faucet: call `faucet()` on `0x0F306B476DB8201Ed99ee1C3Ca029084b70Bf4Cf`

---

## Track

**EVM Smart Contract Track — Polkadot Solidity Hackathon 2026**

Submitted for the "DeFi & Stablecoin-enabled dapps" category with XCM cross-chain capability as a differentiator.
