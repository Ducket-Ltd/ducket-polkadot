# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
ducket-polkadot/
├── frontend/                      # React SPA (Vite + Wagmi)
│   ├── src/
│   │   ├── pages/                 # Route-level page components
│   │   ├── components/            # Reusable UI components
│   │   ├── config/                # Blockchain and chain configuration
│   │   ├── lib/                   # Utilities and data
│   │   ├── data/                  # (legacy) data directory
│   │   ├── App.tsx                # Router definition
│   │   ├── main.tsx               # Entry point with providers
│   │   └── index.css              # Tailwind + app styles
│   ├── public/                    # Static assets (images, metadata)
│   ├── dist/                      # Build output (generated)
│   ├── package.json               # Frontend dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   └── vite.config.ts             # Vite build configuration
├── contracts/                     # Hardhat project (Solidity)
│   ├── contracts/                 # Solidity source files
│   │   ├── DucketV2.sol           # Main contract (in progress)
│   │   └── DucketTickets.sol      # Active contract
│   ├── scripts/                   # Deployment and maintenance scripts
│   │   ├── deploy.ts              # Deploy + seed events
│   │   ├── seed.ts                # Create events on deployed contract
│   │   └── setMetadata.ts         # Configure metadata URIs
│   ├── test/                      # Test directory (empty)
│   ├── artifacts/                 # Compiled contracts (generated)
│   ├── typechain-types/           # TypeScript types from contracts (generated)
│   ├── package.json               # Hardhat dependencies
│   ├── hardhat.config.ts          # Network and compiler configuration
│   └── cache/                     # Build cache (generated)
├── docs/                          # Documentation files
├── .planning/                     # GSD planning artifacts
│   └── codebase/                  # Architecture analysis documents
├── .env                           # Environment variables (not committed)
├── .env.example                   # Environment template
└── vercel.json                    # Vercel deployment configuration
```

## Directory Purposes

**frontend/src/pages/:**
- Purpose: Full-page components, each corresponding to a route
- Contains: Home.tsx (event listing), Event.tsx (event detail + purchase), MyTickets.tsx (owned tickets), Resale.tsx (resale marketplace), HowItWorks.tsx (info page)
- Key files: All export default function components

**frontend/src/components/:**
- Purpose: Reusable component library for UI elements
- Contains: Header.tsx (navigation), WalletConnect.tsx (wallet connector), EventCard.tsx (event preview card), DemoBanner.tsx (demo mode banner), ui/ (primitive components: Button, Card, Badge, Separator)
- Key files: `ui/button.tsx`, `ui/card.tsx` (shadcn-style component patterns)

**frontend/src/config/:**
- Purpose: Blockchain configuration and setup
- Contains: wagmi.ts (wagmi client creation), chains.ts (Polkadot Hub TestNet chain definition)
- Key files: `wagmi.ts` (config exported for main.tsx provider)

**frontend/src/lib/:**
- Purpose: Shared utilities and data
- Contains: contract.ts (DucketTickets ABI), mockData.ts (event/listing fixtures), utils.ts (date/format helpers)
- Key files: `contract.ts` (ABI used by wagmi hooks), `mockData.ts` (MOCK_EVENTS array)

**contracts/contracts/:**
- Purpose: Solidity smart contracts
- Contains: DucketTickets.sol (main active contract, ERC1155), DucketV2.sol (extended contract with communities feature, not yet in frontend)
- Key files: `DucketTickets.sol` (deployed and active)

**contracts/scripts/:**
- Purpose: Deployment and lifecycle management scripts
- Contains: deploy.ts (initial contract deployment + event seeding), seed.ts (create events only), setMetadata.ts (update URI metadata)
- Key files: `deploy.ts` (main entry point for production deployment)

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx`: React DOM render, provider setup (Wagmi, QueryClient, Router)
- `frontend/src/App.tsx`: Route definitions and layout wrapper (Header, DemoBanner, Routes)
- `contracts/contracts/DucketTickets.sol`: Deployed contract, implements ticketing system
- `contracts/scripts/deploy.ts`: Initial deployment script (creates contract, seeds events)

**Configuration:**
- `frontend/tsconfig.json`: TypeScript compiler options, path aliases (`@/*` → `src/*`)
- `frontend/vite.config.ts`: Vite build setup, React plugin
- `frontend/tailwind.config.js`: TailwindCSS theming
- `contracts/hardhat.config.ts`: Network configuration (Polkadot Hub TestNet), compiler settings (Solidity 0.8.24)
- `.env`: Environment variables (VITE_CONTRACT_ADDRESS, PRIVATE_KEY, PLATFORM_WALLET)

**Core Logic:**
- `frontend/src/lib/contract.ts`: DucketTickets ABI definition (read/write functions)
- `contracts/contracts/DucketTickets.sol`: Core contract logic (minting, resale, payment distribution)
- `frontend/src/pages/Event.tsx`: Event detail page, handles ticket purchase flow
- `frontend/src/pages/Resale.tsx`: Resale marketplace page

**Testing:**
- No test files present (contracts/test/ is empty)

## Naming Conventions

**Files:**
- React components: PascalCase (Header.tsx, EventCard.tsx, MyTickets.tsx)
- Utilities: camelCase (utils.ts, mockData.ts, contract.ts)
- Styles: kebab-case if separate file, imported as .css (index.css)
- Solidity: PascalCase (DucketTickets.sol, DucketV2.sol)

**Directories:**
- Feature directories: lowercase (pages/, components/, config/, lib/, data/)
- UI component library: ui/ (reserved for shadcn-like primitives)
- Solidity directories: contracts/ (source), scripts/ (deployment), artifacts/ (build output)

**Variables & Functions:**
- TypeScript functions: camelCase (formatDate, shortenAddress, formatDOT)
- React hooks: camelCase (useAccount, useNavigate from libraries)
- Solidity functions: camelCase public/external (createEvent, mintTicket, listForResale), _camelCase private/internal (_mint, _update)
- Solidity constants: UPPER_CASE (MINTER_ROLE, DEFAULT_ADMIN_ROLE, platformFee)

**Types & Interfaces:**
- TypeScript: PascalCase (MockEvent, MockTicketTier, Event, TicketTier, ResaleListing)
- Solidity structs: PascalCase (EventConfig, TicketTier, ResaleListing)

## Where to Add New Code

**New Page/Route:**
- Implementation: Create `.tsx` file in `frontend/src/pages/` (e.g., `NewPage.tsx`)
- Add route to `frontend/src/App.tsx` in Routes section
- Pattern: Export default function component, use React Router hooks (useParams, useNavigate, useLocation)

**New Reusable Component:**
- Implementation: `frontend/src/components/ComponentName.tsx`
- If primitive UI element (button variant, etc.): `frontend/src/components/ui/componentName.tsx`
- Pattern: Export named function component, use TailwindCSS for styling via className prop
- Follow shadcn pattern: use clsx + tailwind-merge for className composition

**New Utility Function:**
- Shared helpers: `frontend/src/lib/utils.ts` (date formatting, address formatting, etc.)
- Contract interaction helpers: Extend `frontend/src/lib/contract.ts` (add new ABI functions)
- Data/mock functions: Add to `frontend/src/lib/mockData.ts` (MOCK_EVENTS, helper functions)

**New Smart Contract Function:**
- Add to `contracts/contracts/DucketTickets.sol` (active contract)
- Add event emission if state-changing
- Use `nonReentrant` guard for functions that transfer value
- Add role checks via `onlyRole()` for admin functions
- Update ABI in `frontend/src/lib/contract.ts` to include new function signature
- Add migration to `contracts/scripts/` if setup required

**New Hook for Blockchain Interaction:**
- Pattern: Create in `frontend/src/` directory (not yet organized into hooks/ folder)
- Use wagmi hooks: `useAccount`, `useWriteContract`, `useReadContract`
- Return loading state, error, and data for UI consumption

**Environment Configuration:**
- Add new env var to `frontend/.env` and `frontend/.env.example` (VITE_ prefix for frontend exposure)
- Add to `contracts/.env` for contract deployment (PRIVATE_KEY, PLATFORM_WALLET)
- Update `.github/workflows/` if new deploy script added (not present yet)

## Special Directories

**frontend/public/:**
- Purpose: Static assets served directly
- Generated: No
- Committed: Yes
- Contents: images/ (logo, etc.), metadata/ (token metadata JSONs)

**frontend/dist/:**
- Purpose: Built/bundled frontend output
- Generated: Yes (by `npm run build`)
- Committed: No (.gitignore)
- Contents: index.html, assets/ with JS/CSS bundles

**contracts/artifacts/ & contracts/typechain-types/:**
- Purpose: Generated contract ABIs and TypeScript bindings
- Generated: Yes (by `hardhat compile`)
- Committed: Yes (checked in for CI/CD)
- Contents: Compiled JSON ABIs, TypeScript type definitions from Solidity

**contracts/cache/:**
- Purpose: Hardhat build cache
- Generated: Yes
- Committed: No (.gitignore)

**.planning/codebase/:**
- Purpose: GSD architecture and analysis documents
- Generated: Yes (by mapping scripts)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md (analysis snapshots)

---

*Structure analysis: 2026-03-15*
