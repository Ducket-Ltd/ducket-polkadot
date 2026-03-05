# Ducket × Polkadot Solidity Hackathon — Build Plan

## Context

Adapt Ducket (blockchain-secured NFT ticketing with anti-scalping enforcement) for Polkadot Hub.
Same playbook as `ducket-etherlink`: sterilised repo, no backend, on-chain only, testnet deployment.

**Source repo:** `../ducket-web` (reference for UI components, contract logic, chain config patterns)
**Target repo:** `ducket-polkadot` (new, clean repo — no git history from source)

---

## Chain Config

| Field        | Value                                        |
|--------------|----------------------------------------------|
| Network Name | Polkadot Hub TestNet                         |
| RPC URL      | `https://services.polkadothub-rpc.com/testnet` |
| Chain ID     | `420420417`                                  |
| Currency     | DOT                                          |
| Faucet       | https://faucet.polkadot.io (select Westend)  |
| Block Explorer | https://blockscout-asset-hub.parity-chains.parity.io |

---

## Sterilised Repo Structure

```
ducket-polkadot/
├── README.md
├── .env.example
├── .gitignore
│
├── contracts/
│   ├── DucketV2.sol              # ERC-1155 ticket contract (copied from ../ducket-web)
│   ├── hardhat.config.ts         # Reconfigured for Polkadot Hub testnet
│   ├── package.json
│   ├── scripts/
│   │   ├── deploy.ts             # Deploy script for Polkadot Hub
│   │   └── setMetadata.ts        # Post-deploy: call setURI() and setContractURI()
│   ├── test/
│   │   └── DucketV2.test.ts
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── metadata/             # Static NFT metadata JSON files (one per tokenId)
│   │   │   ├── 0                 # No .json extension — served as application/json via vercel.json
│   │   │   ├── 1
│   │   │   └── 2
│   │   └── contract-metadata.json  # Collection-level metadata for OpenSea
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── config/
│   │   │   ├── chains.ts         # Polkadot Hub testnet chain config
│   │   │   └── wagmi.ts          # Wagmi setup — MetaMask compatible (Polkadot Hub uses ETH proxy)
│   │   ├── components/
│   │   │   ├── ui/               # Copy generic shadcn components from ../ducket-web
│   │   │   ├── EventCard.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   ├── BuyTicketModal.tsx
│   │   │   └── WalletConnect.tsx
│   │   ├── hooks/
│   │   │   ├── useContract.ts    # wagmi/viem contract reads
│   │   │   └── useTickets.ts     # fetch owned tickets from chain
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Event listing (mock data)
│   │   │   ├── Event.tsx         # Event detail + buy ticket flow (PRIMARY DEMO PAGE)
│   │   │   ├── MyTickets.tsx     # Owned tickets from contract
│   │   │   └── Resale.tsx        # List ticket for resale + browse resale listings
│   │   ├── data/
│   │   │   └── mockEvents.ts     # Static mock events (no Supabase)
│   │   └── lib/
│   │       └── contract.ts       # Contract ABI + address constants
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── vercel.json                   # Rewrites for metadata files (serve without .json extension)
└── DEPLOYMENT.md
```

---

## What to KEEP vs STRIP (from `../ducket-web`)

### ✅ KEEP
- `DucketV2.sol` — full contract with ERC-1155 ticketing, communities, memberships, burning, perk redemption
- Buyer-facing UI components: EventCard, TicketCard, BuyTicketModal
- wagmi/viem chain config pattern
- shadcn/ui components
- Hardhat deploy script structure

### ❌ STRIP (IP — do not include)
- All Supabase references, imports, or types
- Stripe / Airwallex / payment logic
- Edge functions or API routes
- Organizer dashboard / admin panel
- Scanner / QR validation app
- Anti-scalping queue implementation
- Payout / refund / settlement logic
- Any `.env` files (only `.env.example`)
- Git history (fresh repo only)
- Internal org references (`ducket-hk`, internal URLs)

---

## Hackathon Focus — What to Build & Highlight

This is an EVM Smart Contract Track submission. The narrative is:
**"First NFT ticketing dApp on Polkadot Hub — Solidity smart contracts enforcing real-world consumer rules on-chain."**

### Core features to demo (build these, make them work end-to-end):
1. **Buy a ticket** — connect MetaMask → pay DOT → mint NFT ticket → show in My Tickets
2. **On-chain anti-scalping** — resale price cap enforced at contract level (`maxResalePercentage`), immutable once tickets are sold
3. **Resale marketplace** — list ticket for resale, buy resale ticket, cancel listing — all on-chain, no intermediary

### Secondary features to mention (exist in contract, no need to build full UI):
- Communities & membership gates — frame as "venue/collective membership unlocks free or discounted tickets"
- Ticket burning on refund — on-chain proof of cancellation
- Perk redemption logging — on-chain event emission for merch/backstage claims

### What NOT to build UI for:
- Admin/organizer dashboard (IP — keep out of sterilised repo)
- Membership management UI (out of scope for hackathon demo)
- Batch minting flows

### Why this fits the EVM Smart Contract Track:
- Pure Solidity — no backend, all logic lives on-chain
- Demonstrates a **real consumer use case** (ticketing) vs another DeFi clone
- Anti-scalping rules are a novel use of smart contract immutability
- Communities + membership gates show XCM-ready architecture (members from any parachain could theoretically be verified via XCM in future)
- Polkadot Hub narrative: "Solidity finally works on Polkadot — here's a production-ready dApp proving it"

---

## Step-by-Step Claude Code Instructions

### STEP 1: Initialise Clean Repo

```
Create a new directory called ducket-polkadot at the same level as ducket-web.
Do NOT clone or copy git history. Initialise a fresh git repo.
Create the folder structure as specified in the plan.
```

### STEP 2: Copy & Adapt Smart Contract

```
Copy DucketV2.sol from ../ducket-web/contracts/ into contracts/DucketV2.sol.
Do not copy any migration files, deployment artifacts, or .env files.

Note: DucketV2 includes communities, memberships, ticket burning, perk redemption logging,
and batch minting on top of core ERC-1155 ticketing. The contract is standalone — no changes needed.

Create contracts/hardhat.config.ts with the following Polkadot Hub testnet config:
- Network name: polkadotHubTestnet
- RPC URL: https://services.polkadothub-rpc.com/testnet
- Chain ID: 420420417
- accounts: [process.env.PRIVATE_KEY]

Create contracts/.env.example:
PRIVATE_KEY=your_wallet_private_key_here
PLATFORM_WALLET=your_platform_wallet_address_here

Create contracts/scripts/deploy.ts that deploys DucketV2 (constructor takes one arg: platformWallet address)
to polkadotHubTestnet and logs the deployed contract address.

Install dependencies: hardhat, @openzeppelin/contracts, @nomicfoundation/hardhat-toolbox

Compile the contract and confirm it succeeds.
```

### STEP 3: Set Up NFT Metadata

```
DucketV2's uri() returns: _baseURI + tokenId
e.g. if baseURI = "https://ducket-polkadot.vercel.app/metadata/" then
token 0 resolves to "https://ducket-polkadot.vercel.app/metadata/0"

We'll serve static metadata JSON files from the frontend's public folder so no backend is needed.

Create frontend/public/metadata/ directory.

For each mock event tier (one file per tokenId, e.g. 0.json, 1.json, 2.json):

{
  "name": "Ducket × Polkadot — [Event Name] [Tier Name]",
  "description": "NFT ticket for [Event Name] on [Date]. Issued on Polkadot Hub. Resale capped at [X]% of face value — enforced on-chain by DucketV2 smart contract.",
  "image": "https://[image url — use a real Unsplash event photo]",
  "external_url": "https://ducket-polkadot.vercel.app/event/[eventId]",
  "attributes": [
    { "trait_type": "Event", "value": "[Event Name]" },
    { "trait_type": "Tier", "value": "[Tier Name e.g. GA / VIP]" },
    { "trait_type": "Date", "value": "[ISO date string]" },
    { "trait_type": "Venue", "value": "[Venue Name]" },
    { "trait_type": "Price (DOT)", "value": "[face value]" },
    { "trait_type": "Resale Cap", "value": "[e.g. 150%]" },
    { "trait_type": "Chain", "value": "Polkadot Hub" }
  ]
}

IMPORTANT: These files must be served without .json extension (Vercel does this by default
if you add a vercel.json with rewrites, or name files without extension).
Alternatively, host metadata on a public GitHub raw URL during hackathon if simpler.

After Vercel deploy, call setURI() on the deployed contract:
  setURI("https://ducket-polkadot.vercel.app/metadata/")
  → only callable by DEFAULT_ADMIN_ROLE (the deployer wallet)

Also call setContractURI() with a contract-level metadata JSON:
  {
    "name": "Ducket Tickets — Polkadot Hub",
    "description": "NFT event tickets with on-chain anti-scalping enforcement. Built on Polkadot Hub.",
    "image": "https://[logo image url]",
    "external_link": "https://ducket-polkadot.vercel.app"
  }
  Host this at frontend/public/contract-metadata.json
  setContractURI("https://ducket-polkadot.vercel.app/contract-metadata.json")

Add a post-deploy script contracts/scripts/setMetadata.ts that calls both setURI() and setContractURI()
so metadata setup is one command after deploy.
```

### STEP 4: Copy & Sterilise Frontend

```
Copy buyer-facing UI components from ../ducket-web/src into frontend/src.
Reference ../ducket-web for component structure and styling patterns.

Strip all of the following — search and remove every instance:
- imports from @supabase/supabase-js or any supabase client
- imports from stripe or @stripe
- Any references to process.env.SUPABASE_* or STRIPE_*
- Any organizer, admin, scanner, or QR-related components or routes
- Any payout, refund, or settlement logic
- Any references to ducket-hk or internal API endpoints

Keep:
- Event listing page (Home.tsx)
- Event detail + ticket purchase page (Event.tsx)  
- My Tickets page (MyTickets.tsx)
- WalletConnect component

Replace all Supabase data fetches with imports from src/data/mockEvents.ts
```

### STEP 4: Configure Chain (Polkadot Hub)

```
Create frontend/src/config/chains.ts:

import { defineChain } from 'viem'

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  nativeCurrency: {
    decimals: 18,
    name: 'DOT',
    symbol: 'DOT',
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-asset-hub.parity-chains.parity.io',
    },
  },
  testnet: true,
})

Create frontend/src/config/wagmi.ts using this chain.
Wallet connectors: injected (MetaMask) — no RainbowKit wallet-specific connectors needed,
Polkadot Hub uses standard ETH JSON-RPC proxy so MetaMask works out of the box.
```

### STEP 5: Create Mock Data

```
Create frontend/src/data/mockEvents.ts with 3 realistic mock events.
Each event should have: id, title, date, venue, city, imageUrl, tiers (with name, price in DOT, maxSupply).
Use Unsplash URLs for images.
Prices should be denominated in DOT (e.g. 0.5 DOT, 1 DOT, 2 DOT).
```

### STEP 6: Set Up NFT Metadata

```
DucketV2 uses a baseURI + tokenId pattern:
  uri(tokenId) returns → _baseURI + tokenId (e.g. "https://your-url.com/metadata/1")
  contractURI() returns → _contractURI (collection-level metadata for OpenSea)

After deploying, two admin calls must be made to the contract:
  1. setURI("https://<your-vercel-url>/metadata/")  → token-level metadata
  2. setContractURI("https://<your-vercel-url>/metadata/contract")  → collection metadata

These are called by the deployer wallet (DEFAULT_ADMIN_ROLE).

------

SEED SCRIPT — create contracts/scripts/seed.ts that:
1. Creates 3 mock events on-chain using createEvent()
2. Creates 2 tiers per event using createTicketTier() — e.g. "General Admission" and "VIP"
3. Logs all tokenIds returned by createTicketTier()
4. Calls setURI() with the final Vercel URL
5. Calls setContractURI() with the contract metadata URL

Use these mock events (match mockEvents.ts so on-chain data aligns with UI):
  Event 1: "Neon Nights Festival" — EDM, Singapore, future date, maxResalePercentage: 150
  Event 2: "Jazz in the Park" — Jazz, Hong Kong, future date, maxResalePercentage: 120
  Event 3: "Ducket Dev Conf" — Tech conference, Bangkok, future date, maxResalePercentage: 110

Run seed script: npx hardhat run scripts/seed.ts --network polkadotHubTestnet
Note down the tokenIds output — you'll need them for the metadata files.

------

METADATA FILES — create static JSON in frontend/public/metadata/:

/public/metadata/contract (no extension — served via vercel.json rewrite):
{
  "name": "Ducket Tickets",
  "description": "NFT-based event tickets with on-chain anti-scalping enforcement, powered by Polkadot Hub.",
  "image": "https://<your-vercel-url>/logo.png",
  "external_link": "https://<your-vercel-url>",
  "seller_fee_basis_points": 250,
  "fee_recipient": "<platform wallet address>"
}

/public/metadata/{tokenId} for each tier — fill in values from seed script output.
Example for tokenId 0 (Event 1 GA):
{
  "name": "Neon Nights Festival — General Admission",
  "description": "Official NFT ticket for Neon Nights Festival. Resale capped on-chain at 150% of face value.",
  "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600",
  "external_url": "https://<your-vercel-url>/event/0",
  "attributes": [
    { "trait_type": "Event", "value": "Neon Nights Festival" },
    { "trait_type": "Tier", "value": "General Admission" },
    { "trait_type": "Date", "display_type": "date", "value": <unix timestamp> },
    { "trait_type": "Venue", "value": "Marina Bay Sands, Singapore" },
    { "trait_type": "Face Price (DOT)", "value": 0.5 },
    { "trait_type": "Resale Cap", "value": "150%" },
    { "trait_type": "Chain", "value": "Polkadot Hub" }
  ]
}
Repeat for each tokenId. 3 events × 2 tiers = 6 metadata files total.

------

vercel.json — add rewrites so extensionless URLs resolve to .json files:
{
  "rewrites": [
    { "source": "/metadata/:path*", "destination": "/metadata/:path*.json" }
  ]
}

------

VERIFICATION — run these checks before submission:
1. Deploy + seed to testnet
2. curl https://<your-vercel-url>/metadata/0 → must return valid JSON with name, image, attributes
3. curl https://<your-vercel-url>/metadata/contract → must return collection metadata JSON
4. Call uri(0) on deployed contract via Blockscout → must return "https://<your-vercel-url>/metadata/0"
5. Check token on Blockscout: https://blockscout-asset-hub.parity-chains.parity.io
   → Token page should show name, image, and attributes
6. Copy/paste the token URI into https://opensea.io/asset/... format to verify OpenSea compatibility

If image or attributes are missing on Blockscout, the most common cause is:
  - setURI() was not called after deploy (contract still has empty _baseURI)
  - vercel.json rewrite missing (URL returns 404)
  - Metadata JSON has wrong content-type (Vercel serves .json files correctly by default)
```

### STEP 7: Wire Contract Reads & Writes

```
After contract is deployed (run deploy script and paste address), create:

frontend/src/lib/contract.ts — export CONTRACT_ADDRESS and ABI (copy ABI from contracts/artifacts/DucketV2.json)

frontend/src/hooks/useTickets.ts — use wagmi's useReadContract to:
  - getUserTicketsForEvent(address, eventId) → show owned tickets on My Tickets page
  - getTicketInfo(ticketId) → show seat, tier, event details per ticket
  - resaleListings(ticketId) → show active resale listings

frontend/src/hooks/useContract.ts — expose these write functions using useWriteContract:
  - mintTicket(tokenId, to, quantity) → primary purchase flow
  - listForResale(ticketId, price) → resale listing
  - buyResaleTicket(ticketId) → buy resale ticket
  - cancelResaleListing(ticketId) → cancel listing

Show the resale price cap on the Event page UI:
  - Read events(eventId).maxResalePercentage from contract
  - Display: "Resale capped at X% of face value — enforced on-chain"
  - This is the key differentiator to highlight in the demo

Do NOT wire up: community management, membership granting, burnTicket, logRedemption.
These exist in the contract but are backend/admin operations — not part of the buyer demo.
```

### STEP 8: Write Docs

```
Create README.md at root with:
- Project title: Ducket × Polkadot Hub
- One-liner: NFT-based event ticketing with on-chain anti-scalping enforcement — now on Polkadot Hub
- Problem / Solution / How it works (3 short paragraphs)
- Tech stack: Solidity, Hardhat, React, wagmi/viem, Polkadot Hub
- Hackathon track: EVM Smart Contract Track (Polkadot Solidity Hackathon)
- Live demo link (fill in after Vercel deploy)
- Contract address on Polkadot Hub testnet (fill in after deploy)
- How to run locally

Create DEPLOYMENT.md with steps to:
- Get testnet DOT from faucet.polkadot.io
- Deploy contract: npx hardhat run scripts/deploy.ts --network polkadotHubTestnet
- Add contract address to frontend .env
- Deploy frontend to Vercel first (need the URL for metadata)
- Run seed script: npx hardhat run scripts/seed.ts --network polkadotHubTestnet (sets URI, creates events/tiers)
- Verify metadata: curl https://<vercel-url>/metadata/0
- Run frontend locally: npm install && npm run dev
```

### STEP 9: Final IP Audit

```
Run the following checks and report results:

grep -r "supabase" . --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "stripe" . --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "airwallex" . --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "ducket-hk" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.md"
grep -r "SUPABASE" . --include="*.env*"
find . -name ".env" -not -name ".env.example"

All results should return 0 matches. Fix any that don't before committing.
Confirm the frontend builds: cd frontend && npm install && npm run build
Confirm contracts compile: cd contracts && npm install && npx hardhat compile
```

---

## Hackathon Submission Notes

- **Track:** EVM Smart Contract Track
- **Narrative:** "First NFT ticketing dApp on Polkadot Hub — Solidity enforcing real-world anti-scalping rules on-chain, no intermediary required"
- **Key differentiator to lead with:** Resale price cap is written into the contract and mathematically cannot be exceeded — not a policy, a protocol guarantee
- **Secondary differentiator:** Communities + membership gates show composability with Polkadot's ecosystem (members-only events, free entry for members)
- **Demo flow:** Connect MetaMask → browse events → buy ticket (pay DOT → NFT minted) → view in My Tickets → list for resale (capped at contract-enforced max) → buy resale ticket
- **Submission deadline:** March 20, 2026
- **Demo Day:** March 24–25, 2026

---

## Pre-Submission Checklist

- [ ] Fresh git repo with no history from original
- [ ] Zero Supabase/Stripe/Airwallex references
- [ ] Zero API keys or secrets committed
- [ ] No organizer/admin/scanner code
- [ ] Contract compiled and deployed to Polkadot Hub testnet
- [ ] Contract address added to frontend config
- [ ] Frontend builds successfully
- [ ] Wallet connects via MetaMask on Polkadot Hub testnet
- [ ] Metadata JSON files in frontend/public/metadata/ (one per tokenId)
- [ ] contract-metadata.json in frontend/public/
- [ ] vercel.json configured to serve metadata without .json extension
- [ ] setURI() called on deployed contract pointing to Vercel metadata URL
- [ ] setContractURI() called on deployed contract
- [ ] Token metadata visible on Blockscout explorer after minting
- [ ] setURI() called on deployed contract pointing to Vercel metadata URL
- [ ] setContractURI() called with collection metadata URL
- [ ] /public/metadata/contract.json exists and is valid
- [ ] /public/metadata/{tokenId}.json exists for each mock event tier
- [ ] uri(tokenId) on contract resolves and returns valid JSON
- [ ] NFT visible with image + attributes on Blockscout explorer
- [ ] Seed script run — mock events and tiers created on-chain
- [ ] setURI() called — contract baseURI points to Vercel deployment
- [ ] setContractURI() called — collection metadata resolves correctly
- [ ] curl /metadata/0 returns valid JSON with name, image, attributes
- [ ] Token visible with metadata on Blockscout explorer
- [ ] Buy ticket flow works end-to-end on testnet (pay DOT → NFT minted)
- [ ] Resale flow works end-to-end (list → buy → cancel)
- [ ] Resale price cap displayed on Event page UI
- [ ] README has live demo link and contract address
- [ ] Deployed to Vercel
