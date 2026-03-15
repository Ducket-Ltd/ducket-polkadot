# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.4.2 - Frontend and contract tooling
- Solidity 0.8.24 - Smart contracts (ERC1155-based ticketing)

**Secondary:**
- JavaScript - Build configuration and development tooling
- JSX/TSX - React component definitions

## Runtime

**Environment:**
- Node.js (implied, not explicitly versioned in config)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present in `/frontend` and `/contracts`

## Frameworks

**Core (Frontend):**
- React 18.2.0 - UI library
- React Router DOM 6.22.3 - Client-side routing
- Vite 5.1.6 - Build tool and dev server

**Web3/Blockchain:**
- wagmi 2.5.0 - React hooks for Ethereum/EVM chains
- viem 2.9.0 - Ethereum JavaScript client library
- Hardhat 2.22.0 - Smart contract development framework and deployment tool

**UI/Styling:**
- Tailwind CSS 3.4.1 - Utility-first CSS framework
- PostCSS 8.4.35 - CSS transformation tool
- autoprefixer 10.4.18 - Vendor prefix handling
- Radix UI Dialog 1.0.5 - Unstyled, accessible dialog component
- Radix UI Slot 1.0.2 - Composition utility
- class-variance-authority 0.7.0 - Type-safe component variants
- clsx 2.1.0 - Conditional className utility
- tailwind-merge 2.2.2 - Tailwind class merging utility
- tailwindcss-animate 1.0.7 - Animation preset plugin

**Data Management:**
- @tanstack/react-query 5.28.0 - Server state management and caching

**Smart Contract Development:**
- @nomicfoundation/hardhat-toolbox 5.0.0 - Hardhat plugin collection
- @openzeppelin/contracts 5.0.0 - Standard smart contract library (ERC1155, AccessControl, ReentrancyGuard)

**Icons:**
- lucide-react 0.363.0 - SVG icon library

**Utilities:**
- dotenv 16.4.0 - Environment variable loading

## Key Dependencies

**Critical:**
- wagmi 2.5.0 - Wallet connection and contract interaction, core to blockchain UX
- viem 2.9.0 - Low-level Ethereum client, powers wagmi
- @openzeppelin/contracts 5.0.0 - Secure smart contract implementations (ERC1155 token standard)
- Hardhat 2.22.0 - Contract compilation, testing, and deployment to Polkadot Hub

**Infrastructure:**
- React Router DOM 6.22.3 - Multi-page application navigation
- Vite 5.1.6 - Fast build and HMR for development
- @tanstack/react-query 5.28.0 - Query caching and synchronization
- Tailwind CSS 3.4.1 - Consistent styling across application

## Configuration

**Environment:**
- Frontend: `VITE_CONTRACT_ADDRESS` - Deployed contract address on Polkadot Hub
- Contracts: `PRIVATE_KEY` - Wallet private key for deployment
- Contracts: `PLATFORM_WALLET` - Admin wallet address for contract owner
- Contracts: `CONTRACT_ADDRESS` - Target contract address (used in scripts)
- Frontend: `VERCEL_URL` - Deployment base URL for Vercel

**Build:**
- `frontend/vite.config.ts` - Vite configuration with React plugin and path alias (@/)
- `frontend/tsconfig.json` - TypeScript compiler options (ES2020, DOM libs, strict mode)
- `contracts/hardhat.config.ts` - Hardhat configuration for Polkadot Hub Testnet
- `frontend/tailwind.config.ts` - Tailwind CSS configuration
- `frontend/postcss.config.js` - PostCSS configuration
- `frontend/tsconfig.node.json` - TypeScript config for build tools

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript 5.4.2+
- Modern web browser with Ethereum wallet support (MetaMask, etc.)

**Production:**
- Deployment target: Vercel (frontend) - configured in `vercel.json`
- Smart contracts: Polkadot Hub Testnet
  - RPC: `https://services.polkadothub-rpc.com/testnet`
  - Chain ID: 420420417
  - Native currency: DOT (18 decimals)
  - Gas settings: 5,000,000 max gas, 1000000000000 gwei/gas price

**Compiler Settings (Contracts):**
- Solidity compiler version: 0.8.24
- EVM version: cancun
- Optimizer enabled with 1 run
- viaIR compilation enabled for improved code generation

---

*Stack analysis: 2026-03-15*
