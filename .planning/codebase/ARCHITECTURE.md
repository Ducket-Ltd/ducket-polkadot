# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Monorepo with decoupled blockchain and frontend layers: a Solidity smart contract system (backend logic) deployed on Polkadot Hub TestNet, and a React SPA (frontend UI) connected via wagmi and viem for blockchain interactions.

**Key Characteristics:**
- Smart contract enforces all business rules (pricing, resale caps, supply limits)
- Frontend reads contract state and submits transactions via wallet
- Event-driven architecture: contract emits events for tickets, resales, cancellations
- Mock data for demo purposes until full contract integration
- Account-based access control with wallet connection required

## Layers

**Smart Contract Layer (DucketTickets/DucketV2):**
- Purpose: Core ticketing logic, resale enforcement, payment distribution
- Location: `contracts/contracts/DucketTickets.sol`, `contracts/contracts/DucketV2.sol`
- Contains: Event creation, ticket tier management, minting, resale listings, payment logic
- Depends on: OpenZeppelin (ERC1155, AccessControl, ReentrancyGuard)
- Used by: Frontend (via viem/wagmi), deployment scripts, metadata setup scripts

**Blockchain Configuration Layer:**
- Purpose: Network and wallet setup for Polkadot Hub TestNet
- Location: `frontend/src/config/` (chains.ts, wagmi.ts)
- Contains: Chain configuration, wagmi client setup, RPC endpoints
- Depends on: wagmi, viem
- Used by: Main app entry point

**Presentation Layer (React Components):**
- Purpose: User-facing UI for browsing events, purchasing tickets, managing resales
- Location: `frontend/src/components/`, `frontend/src/pages/`
- Contains: Reusable UI components (Header, EventCard, etc.), page-level components (Home, Event, MyTickets, Resale, HowItWorks)
- Depends on: React Router, wagmi hooks (useAccount, etc.), TailwindCSS
- Used by: App.tsx (main router)

**Data & State Layer:**
- Purpose: Mock data structures and utilities for demo purposes
- Location: `frontend/src/lib/mockData.ts`, `frontend/src/lib/utils.ts`, `frontend/src/lib/contract.ts`
- Contains: Mock events/listings, formatting utilities, contract ABI definitions
- Depends on: Nothing (utilities), viem (contract ABI type)
- Used by: All pages and components

**Entry Points:**
- Frontend: `frontend/src/main.tsx` (React DOM setup, provider wrapping)
- Smart Contract: `contracts/contracts/DucketTickets.sol` (deployed contract at CONTRACT_ADDRESS)
- Deployment: `contracts/scripts/deploy.ts` (contract deployment + seed), `contracts/scripts/setMetadata.ts` (metadata configuration)

## Data Flow

**Primary Purchase Flow:**

1. User navigates to Home page
2. Frontend queries MOCK_EVENTS from `mockData.ts`
3. Displays event cards with ticket tiers
4. User clicks event → Event.tsx page loads with tier selection
5. User selects tier and quantity, clicks "Purchase"
6. If wallet not connected, WalletConnect component prompts connection
7. On purchase, frontend calls contract's `mintTicket(tokenId, to, quantity)` via wagmi writeContract
8. Contract validates supply limits, payment, wallet limits
9. Contract mints ERC1155 tokens, emits TicketMinted events, distributes payment
10. Frontend listens for events, displays confirmation

**Resale Flow:**

1. Ticket holder navigates to Resale page
2. Frontend displays MOCK_RESALE_LISTINGS
3. Buyer clicks "Purchase Resale Listing"
4. Frontend calls contract's `buyResaleTicket(tokenId, ticketNumber)` with ETH payment
5. Contract validates listing is active, price is within cap
6. Contract transfers token from seller to buyer, distributes payment
7. Contract emits TicketResold event

**State Management:**
- Frontend component state: React useState for UI interactions (selectedTier, quantity, loading states)
- Blockchain state: Contract storage (events, ticketTiers, resaleListing mappings)
- Query state: React Query (tanstack/react-query) configured in main.tsx for potential API calls
- Wallet state: wagmi hooks (useAccount) track connection status, address

## Key Abstractions

**Event:**
- Purpose: Represents a ticketed event with resale rules and supply limits
- Examples: `contracts/contracts/DucketTickets.sol:26-36 (Event struct)`, `frontend/src/lib/mockData.ts:4-21 (MockEvent interface)`
- Pattern: Struct on-chain (DucketTickets.sol), interface in frontend; organizer controls resale/transfer settings

**TicketTier:**
- Purpose: Pricing and supply tier within an event (e.g., GA vs VIP)
- Examples: `contracts/contracts/DucketTickets.sol:38-46 (TicketTier struct)`, `frontend/src/lib/mockData.ts:23-32 (MockTicketTier interface)`
- Pattern: Contract tracks tier.price, maxSupply, minted count; frontend maps tokenId to tier data

**ResaleListing:**
- Purpose: Marketplace entry for resale of a single ticket
- Examples: `contracts/contracts/DucketTickets.sol:48-52 (ResaleListing struct)`
- Pattern: Seller lists ticket at capped price; buyer triggers purchase; contract enforces original price cap

**Token Ownership:**
- Purpose: ERC1155 token represents a single ticket NFT
- Examples: Contract mints via `_mint(to, tokenId, quantity, "")` in DucketTickets.sol:190
- Pattern: tokenId = tier ID, quantity = number of tickets of that tier

## Entry Points

**Frontend Entry Point:**
- Location: `frontend/src/main.tsx`
- Triggers: Page load/refresh
- Responsibilities: Initialize React DOM, wrap app with WagmiProvider (blockchain), QueryClientProvider (data fetching), BrowserRouter (routing)

**Application Root:**
- Location: `frontend/src/App.tsx`
- Triggers: After providers initialized
- Responsibilities: Define routes (Home, Event/:id, MyTickets, Resale, HowItWorks), render Header + DemoBanner

**Smart Contract Deployment:**
- Location: `contracts/scripts/deploy.ts`
- Triggers: `npm run deploy` (production) or `npm run deploy:local` (local)
- Responsibilities: Deploy DucketTickets to Polkadot Hub TestNet, seed MOCK_EVENTS, create ticket tiers, output CONTRACT_ADDRESS

**Seed Script:**
- Location: `contracts/scripts/seed.ts`
- Triggers: `npm run seed`
- Responsibilities: Create 6 mock events on already-deployed contract with all ticket tiers

## Error Handling

**Strategy:** Contract validation first (Solidity require statements), frontend graceful fallback to mock data if contract unavailable.

**Patterns:**

- **Supply Validation:** Contract requires `tier.minted + quantity <= tier.maxSupply` (DucketTickets.sol:176)
- **Wallet Limits:** Contract requires `eventPurchases[eventId][to] + quantity <= eventData.maxTicketsPerWallet` (DucketTickets.sol:180-183)
- **Resale Price Caps:** Contract validates `price <= (originalPrice * maxResalePercentage / 100)` (DucketTickets.sol:235)
- **Payment:** Contract validates `msg.value >= totalPrice` (DucketTickets.sol:187)
- **Ownership:** Contract uses `nonReentrant` guard on mintTicket and buyResaleTicket
- **Frontend Fallback:** If CONTRACT_ADDRESS not set, app displays mock data; walletConnect hidden until address available

## Cross-Cutting Concerns

**Logging:** Frontend uses console methods implicitly in components; no logging framework configured. Contract emits events (EventCreated, TicketMinted, TicketListedForResale, TicketResold, ResaleListingCancelled).

**Validation:**
- Frontend: TypeScript types enforce interface contracts (MockEvent, MockTicketTier)
- Contract: Solidity require statements on all state-changing functions
- Contract: Event date must be in future, maxResalePercentage must be 100-200

**Authentication:**
- Frontend: Wallet connection via wagmi/injected (metamask, etc.)
- Contract: MINTER_ROLE for ticket creation, organizer check for tier creation, seller check for resale cancellation
- Contract: DEFAULT_ADMIN_ROLE for platform config (fee, wallet, URI)

**Asset/Payment Flow:**
- Frontend initiates transaction (user clicks Purchase)
- Contract receives ETH payment, validates amount
- Contract splits: `fee = (totalPrice * platformFee) / 10000` sent to platformWallet, remainder to organizer/seller
- Contract refunds excess with low-level call `{value: excess}("")`
- Contract uses ReentrancyGuard on payment functions to prevent attacks

---

*Architecture analysis: 2026-03-15*
