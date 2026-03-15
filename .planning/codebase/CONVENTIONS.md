# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Header.tsx`, `EventCard.tsx`, `WalletConnect.tsx`)
- Utilities and helpers: camelCase (e.g., `utils.ts`, `mockData.ts`)
- Directories: kebab-case for grouped features (e.g., `components/ui`, `config`, `data`)

**Functions:**
- React components: PascalCase (exported as named functions, e.g., `export function Header()`)
- Helper functions: camelCase (e.g., `getEventById()`, `formatDate()`, `shortenAddress()`)
- Event handlers: prefixed with `handle` (e.g., `handlePurchase()`, `handleDismiss()`, `handleScroll()`)
- Async operations: use verb-based names (e.g., `getEventById()`, `getTicketsRemaining()`)

**Variables:**
- State variables: camelCase (e.g., `isConnected`, `isMobileMenuOpen`, `selectedTier`)
- Constants: UPPER_SNAKE_CASE when global/config (e.g., `CONTRACT_ADDRESS`, `MINTER_ROLE`)
- Local constants: camelCase (e.g., `navLinks`, `BANNER_DISMISSED_KEY`)

**Types:**
- Interfaces: PascalCase with I prefix or suffix convention avoided (e.g., `ButtonProps`, `EventCardProps`, `MockEvent`)
- Types for small unions/tuples: PascalCase (e.g., `ClassValue` from clsx)

## Code Style

**Formatting:**
- No explicit linter/formatter detected in config (no .eslintrc, .prettierrc files found)
- TypeScript strict mode enabled in `tsconfig.json` (line 14)
- Imports organized with relative paths using @ alias for src/ (e.g., `@/components/ui/button`)
- Line length: appears to follow modern standards (~80-100 character soft limit)

**Linting:**
- TypeScript compiler flags enforced:
  - `strict: true` - strict type checking
  - `noUnusedLocals: true` - no unused variables
  - `noUnusedParameters: true` - no unused function parameters
  - `noFallthroughCasesInSwitch: true` - switch case fallthrough prevention

**Key Settings from tsconfig.json:**
- `target: "ES2020"` - modern JavaScript target
- `moduleResolution: "bundler"` - bundler-based module resolution
- `resolveJsonModule: true` - can import JSON files
- `paths: { "@/*": "./src/*" }` - alias for absolute imports

## Import Organization

**Order:**
1. External libraries (React, react-router-dom, wagmi, lucide-react)
2. Internal components from @ alias (e.g., `@/components/ui/button`)
3. Internal utilities (e.g., `@/lib/utils`)
4. Internal data/types (e.g., `@/data/mockEvents`)

**Example from `Header.tsx` (lines 1-5):**
```typescript
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAccount } from 'wagmi'
import { WalletConnect } from './WalletConnect'
```

**Path Aliases:**
- `@/*` maps to `./src/*` allowing absolute imports anywhere
- Used consistently throughout: `@/components/`, `@/lib/`, `@/data/`, `@/pages/`, `@/config/`

## Error Handling

**Patterns:**
- Null/undefined checks with conditional returns (e.g., `if (!event) { return ... }` in `Event.tsx` line 33)
- Safe optional chaining used (e.g., `event?.resaleEnabled` in templates)
- Graceful degradation for wallet state (e.g., shows connect button if not connected in `Event.tsx` line 284)
- Try-catch not explicitly visible in frontend code; focus on happy path with fallback UI

**Contract (Solidity):**
- Custom error handling via struct validation (`exists` boolean field in structs)
- Role-based access control using OpenZeppelin's `AccessControl` (line 5 of `DucketV2.sol`)
- Reentrancy protection via `ReentrancyGuard` (line 7 of `DucketV2.sol`)

## Logging

**Framework:** `console` (browser console, no logger library detected)

**Patterns:**
- No explicit logging observed in provided source files
- Frontend is demonstration/UI focused, not data transformation heavy
- Contract events would be used for state changes but not shown in sample

## Comments

**When to Comment:**
- Used for section headers and complex logic blocks
- Example: `// Spacer to prevent content from going under fixed nav` in `Header.tsx` line 121
- JSDoc/TSDoc not heavily used in frontend components
- Contract code uses extensive JSDoc (Solidity best practice shown in `DucketV2.sol`):
  ```solidity
  /**
   * @title DucketV2
   * @author Ducket
   * @notice Complete ticketing contract...
   */
  ```

**Multi-line Comments:**
- Used for logical groupings in JSX (e.g., `{/* Desktop Navigation */}` in `Header.tsx` line 45)

## Function Design

**Size:**
- Components typically 40-300 lines (e.g., `Event.tsx` is 320 lines for complex page)
- Helper functions kept small: 2-20 lines for pure utilities
- Complex layouts broken into sections with comments

**Parameters:**
- React components use destructured props (e.g., `function EventCard({ event }: EventCardProps)` in line 12)
- Prop interfaces declared above components
- Event handlers are methods passed directly (e.g., `onClick={() => connect({ connector: connectors[0] })}`)

**Return Values:**
- Components return JSX.Element
- Utilities return specific types (e.g., `formatDate() -> string`)
- Early returns used for null/error cases (guard clauses)
- Maps and filters used inline in JSX for lists

## Module Design

**Exports:**
- Named exports for components (e.g., `export function Header() { ... }` in `Header.tsx` line 13)
- Default exports for page components (e.g., `export default function Home() { ... }` in `Home.tsx` line 9)
- Re-exports from UI component library using named exports (e.g., `export { Button, buttonVariants }` in `button.tsx` line 52)

**Barrel Files:**
- UI components accessed individually: `import { Button } from '@/components/ui/button'`
- No index.ts barrel files observed; explicit imports preferred

**Component Organization:**
- Page components in `/pages/` directory with route-specific logic
- Reusable components in `/components/` with subdirectories: `ui/` for design system, others for feature components
- Business logic separated into `/lib/` (contract interactions, utilities) and `/config/` (blockchain config)
- Data mocks in `/data/` separate from component logic

---

*Convention analysis: 2026-03-15*
