# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**Blockchain RPC:**
- Polkadot Hub Testnet - Blockchain network for smart contracts
  - Service: `https://services.polkadothub-rpc.com/testnet`
  - Chain ID: 420420417
  - Used by: `frontend/src/config/chains.ts`
  - SDK: viem (via wagmi)

**Block Explorer:**
- Blockscout - Blockchain transaction and contract explorer
  - Service: `https://blockscout-asset-hub.parity-chains.parity.io`
  - Configured in: `frontend/src/config/chains.ts`
  - Used for: Transaction verification and contract viewing

**Wallet Connection:**
- No explicit third-party wallet service integration
  - Implementation: Browser-injected wallets (MetaMask, Ledger, etc.)
  - SDK: wagmi `injected()` connector in `frontend/src/config/wagmi.ts`
  - Auth method: Self-custody via wallet signatures

## Data Storage

**Databases:**
- Blockchain-based state storage only
  - Type: Smart contract state in Polkadot Hub
  - Client: viem/ethers.js via wagmi
  - Data stored on-chain: Events, ticket tiers, ticket information, resale listings

**File Storage:**
- No backend file storage detected
- Event images: External URLs from Unsplash (frontend only, no upload capability in current scope)
  - Example: `https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80`

**Caching:**
- @tanstack/react-query - Client-side query caching
  - Configured in: `frontend/src/main.tsx`
  - Used for: Contract read caching and synchronization

## Authentication & Identity

**Auth Provider:**
- Custom wallet-based authentication (no OAuth, Supabase, or Firebase)
  - Implementation: EVM wallet connection via wagmi
  - Account hook: `useAccount()` from wagmi
  - Wallet detection: Browser-injected providers (MetaMask, WalletConnect)
  - No server-side session storage

**Account Detection:**
- wagmi `useAccount()` hook
  - Provides: `isConnected`, account address, chain info
  - Used in: `frontend/src/pages/Event.tsx`, `frontend/src/components/WalletConnect.tsx`

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Console logging only (no external log aggregation)
- Deployment-phase logging in Hardhat scripts: `frontend/src/main.tsx`

## CI/CD & Deployment

**Hosting:**
- Vercel (frontend deployment)
  - Configuration: `vercel.json`
  - Rewrites: `/metadata/:path*` endpoint
  - Headers: Content-Type: application/json for metadata
  - Environment variables: `VITE_CONTRACT_ADDRESS`

**Smart Contract Deployment:**
- Manual deployment via Hardhat to Polkadot Hub Testnet
  - Deployment script: `contracts/scripts/deploy.ts`
  - Network: polkadotHubTestnet (configured in `contracts/hardhat.config.ts`)
  - Auth: Private key from environment variable `PRIVATE_KEY`

**Build Pipeline:**
- Frontend build: `tsc && vite build`
  - TypeScript compilation then Vite bundling
  - Output: Static assets for Vercel
- Contract build: `hardhat compile`
  - Solidity compilation to artifacts

**CI Pipeline:**
- Not detected (no GitHub Actions, GitLab CI, or CircleCI config found)

## Environment Configuration

**Required env vars (Frontend):**
- `VITE_CONTRACT_ADDRESS` - Deployed DucketV2 contract address

**Required env vars (Contracts):**
- `PRIVATE_KEY` - Wallet private key for contract deployment signer
- `PLATFORM_WALLET` - Admin/platform wallet address (set as contract owner on deployment)
- `CONTRACT_ADDRESS` - Target contract address (used in utility scripts)
- `VERCEL_URL` - Optional, for frontend deployment URL

**Secrets location:**
- `.env` files (present but not committed - in `.gitignore`)
- `.env.example` provides template structure

**Example config loading:**
- Hardhat: `dotenv.config()` in `contracts/hardhat.config.ts`
- Vite: `import.meta.env.VITE_*` in `frontend/src/lib/contract.ts`

## Smart Contract Interactions

**Contract Type:**
- ERC1155 multi-token standard (ticket tiers as token types)
- Standard: `@openzeppelin/contracts` implementations

**Contract Address:**
- Stored in environment variable `VITE_CONTRACT_ADDRESS`
- Configured in: `frontend/src/lib/contract.ts`
- Fallback: `0x0000000000000000000000000000000000000000` (placeholder)

**Contract ABI:**
- Minimal ABI defined in: `frontend/src/lib/contract.ts`
- Read functions:
  - `events(uint256)` - Event configuration
  - `ticketTiers(uint256)` - Ticket tier details
  - `ticketInfos(uint256)` - Individual ticket info
  - `resaleListings(uint256)` - Resale listing details
  - `getUserTicketsForEvent(address, uint256)` - User's tickets
  - `getEvent(uint256)` - Event struct
  - `getTicketInfo(uint256)` - Ticket info struct

- Write functions:
  - `mintTicket(uint256, address, uint256)` - Purchase tickets
  - `listForResale(uint256, uint256)` - List ticket for resale
  - `buyResaleTicket(uint256)` - Purchase resale ticket
  - `cancelResaleListing(uint256)` - Cancel resale listing

**Contract Events:**
- Events triggered on-chain for ticket minting, resale, cancellation
- Monitored via blockchain events (not explicitly implemented in frontend yet)

## Webhooks & Callbacks

**Incoming:**
- Metadata endpoint: `/metadata/:path*` (configured in `vercel.json`)
  - Returns: JSON content with `Content-Type: application/json`
  - Purpose: Contract metadata serving (not fully implemented)

**Outgoing:**
- Not detected

---

*Integration audit: 2026-03-15*
