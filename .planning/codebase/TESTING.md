# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Frontend:**
- **Status:** No test framework detected
- **Analysis:** No `.test.tsx`, `.spec.tsx` files found in `/src` directory
- **Build:** Vite configured in `vite.config` (inferred, not explicit), TypeScript compilation only
- **Package.json scripts:** Only `dev`, `build`, `preview` - no test script

**Contracts:**
- **Runner:** Hardhat Test Framework (hardhat/test)
- **Config:** `/Users/justinsoon/Desktop/others/ducket-polkadot/contracts/hardhat.config.ts`
- **Assertion Library:** Chai (via @nomicfoundation/hardhat-toolbox)
- **Test Directory:** `/Users/justinsoon/Desktop/others/ducket-polkadot/contracts/test/`

**Run Commands:**
```bash
# Contracts
npm test                              # Run Hardhat tests
npm run compile                       # Compile Solidity contracts

# Frontend
npm run dev                           # Development server (no tests)
npm run build                         # Build (TypeScript validation via tsc)
npm run preview                       # Preview build locally
```

## Test File Organization

**Frontend:**
- **Status:** Not applicable - no frontend tests present
- **Implications:** UI logic verified manually or through browser testing

**Contracts:**
- **Location:** `/Users/justinsoon/Desktop/others/ducket-polkadot/contracts/test/`
- **Directory is currently empty:** No test files present at time of analysis
- **Pattern (if implemented):** Would follow Hardhat convention of `*.test.ts` or `*.spec.ts` in test directory

## Test Structure

**Frontend (Not Implemented):**
Would typically follow React Testing Library pattern:
```typescript
// Recommended future pattern (not in use):
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
describe('EventCard', () => {
  it('should render event title', () => {
    // test body
  })
})
```

**Contracts (Hardhat/Chai pattern):**
While not currently present, standard Hardhat structure would be:
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DucketV2", function () {
  it("Should create event", async function () {
    const ducket = await ethers.deployContract("DucketV2");
    await ducket.waitForDeployment();

    // test assertions
    expect(await ducket.eventIdCounter()).to.equal(0);
  });
});
```

## Mocking

**Framework:** Not applicable - no testing framework integrated

**Frontend Strategy (when implemented should follow):**
- Mock Wagmi hooks for wallet functionality
- Mock React Query for API calls
- Mock localStorage/sessionStorage for browser storage (like `BANNER_DISMISSED_KEY` in `DemoBanner.tsx`)

**Current Data Mocking Approach (non-test):**
- `/Users/justinsoon/Desktop/others/ducket-polkadot/frontend/src/lib/mockData.ts` contains `MOCK_EVENTS` array
- `/Users/justinsoon/Desktop/others/ducket-polkadot/frontend/src/data/mockEvents.ts` contains alternative mock events structure
- Mock data used directly in components for development/demonstration
- Two separate mock data files indicate transition or experimentation period

**What to Mock (Recommended for future):**
- Wagmi hooks (`useAccount`, `useConnect`, `useDisconnect`)
- Contract interactions (`mintTicket`, `listForResale`, `buyResaleTicket`)
- React Router navigation
- Query cache behavior

**What NOT to Mock (Recommended):**
- Core component rendering (use actual components)
- Tailwind CSS classes (CSS-in-JS should work naturally)
- Small utility functions (`formatDate`, `cn`)

## Fixtures and Factories

**Test Data (Frontend):**
Located in `src/lib/mockData.ts` and `src/data/mockEvents.ts`:

**Structure from mockData.ts:**
```typescript
export interface MockEvent {
  id: string
  onChainEventId?: number
  name: string
  description: string
  date: Date
  venue: string
  city: string
  country: string
  imageUrl: string
  category: string
  organizer: string
  ticketTiers: MockTicketTier[]
  maxResalePercentage: number
  resaleEnabled: boolean
  transferEnabled: boolean
  maxTicketsPerWallet?: number
}

export interface MockTicketTier {
  id: string
  tokenId: number
  onChainTierId?: number
  name: string
  price: number // in DOT
  maxSupply: number
  sold: number
  description: string
}

export const MOCK_EVENTS: MockEvent[] = [ /* 6 events */ ]
```

**Helper Functions:**
- `getEventById(id: string): MockEvent | undefined` (line 277)
- `isEventSoldOut(event: MockEvent): boolean` (line 287)
- `getTicketsRemaining(tier: MockTicketTier): number` (line 292)
- `getResaleListingsForEvent(eventId: string): MockResaleListing[]` (line 314)

**Alternative Mock Structure from data/mockEvents.ts:**
```typescript
export interface TicketTier {
  id: number
  tokenId: number
  name: string
  price: number // in DOT
  maxSupply: number
  minted: number
}
// Simpler interface, fewer fields than mockData version
```

**Current Usage:** Both mock files present; `mockData.ts` is more feature-complete. Migration or consolidation recommended.

**Location:** `/Users/justinsoon/Desktop/others/ducket-polkadot/frontend/src/lib/mockData.ts` and `/Users/justinsoon/Desktop/others/ducket-polkadot/frontend/src/data/mockEvents.ts`

## Coverage

**Requirements:** Not enforced - no test configuration present

**Frontend:** No coverage tracking
- **Status:** Not implemented
- **Recommendation:** If testing added, target 80%+ coverage for components, utilities

**Contracts:** No coverage tracking
- **Status:** Not implemented
- **Recommendation:** Critical for production smart contracts - use hardhat-coverage plugin

**View Coverage (When Implemented):**
```bash
# Contracts (recommended setup):
npm run coverage               # Would generate coverage report
# Opens coverage/index.html

# Frontend (if Jest added):
npm test -- --coverage        # Coverage report with threshold enforcement
```

## Test Types

**Unit Tests:**
- **Scope:** Individual functions and components
- **Status:** Not implemented for frontend
- **Recommendation for contracts:**
  - `mintTicket()` function with various quantity/wallet scenarios
  - `listForResale()` price cap validation
  - `buyResaleTicket()` transfer and payment logic
  - Helper functions: `getEvent()`, `getTicketInfo()`

**Integration Tests:**
- **Scope:** Component interactions with hooks and context
- **Status:** Not implemented
- **Recommendation for frontend:**
  - Event detail page + ticket purchase flow
  - Wallet connection → Purchase interaction
  - Resale marketplace listing and buying

**E2E Tests:**
- **Framework:** Not used
- **Recommendation:** Cypress or Playwright for:
  - User journey: Browse → Connect Wallet → Purchase → View Tickets
  - Resale workflow: List → View Listing → Purchase Resale Ticket
  - Mobile responsive behavior

## Common Patterns

**Async Testing (When Implemented):**
Frontend components use async patterns with loading states:
```typescript
// From Event.tsx (lines 49-58)
const handlePurchase = async () => {
  if (!selectedTierData || !isConnected) return

  setIsPurchasing(true)

  // Simulate purchase - in real implementation, call contract
  setTimeout(() => {
    setIsPurchasing(false)
    navigate('/my-tickets')
  }, 2000)
}

// Pattern: set loading state → perform async action → clear loading state
// Test pattern would be:
// it('should show Confirming button while purchasing', async () => {
//   userEvent.click(purchaseButton)
//   expect(screen.getByText('Confirming...')).toBeInTheDocument()
// })
```

**Error Testing (Recommended Pattern):**
Current error handling relies on UI states:
```typescript
// From Event.tsx (lines 33-44)
if (!event) {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
      <Button><ArrowLeft className="mr-2" />Back to Events</Button>
    </div>
  )
}

// Test pattern:
// it('should show "Event Not Found" when event does not exist', () => {
//   render(<Event />)
//   expect(screen.getByText('Event Not Found')).toBeInTheDocument()
// })
```

**Wallet Connection Patterns:**
Components conditionally render based on wallet state (from `WalletConnect.tsx` lines 11-27):
```typescript
if (isConnected && address) {
  return (
    <div className="flex items-center gap-2">
      <div>{shortenAddress(address)}</div>
      <Button onClick={() => disconnect()}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Returns connect button otherwise
```

**Component State Patterns:**
Heavy use of `useState` for local state (example from `Header.tsx`):
```typescript
const [isScrolled, setIsScrolled] = useState(false)
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20)
  }
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

// Pattern: useState for component state, useEffect for side effects with cleanup
```

## Key Testing Gaps

**Critical Missing Tests:**
1. **Contract Logic:** No Hardhat tests for smart contract functions
   - Event creation and configuration
   - Ticket minting and resale price enforcement
   - Membership tier validation

2. **Frontend Components:** No component tests
   - EventCard rendering with different data states
   - WalletConnect integration with wagmi hooks
   - Event detail page with complex state management

3. **Integration:** No integration tests
   - Frontend ↔ Contract interaction
   - Multi-step purchase flow
   - Resale listing creation and cancellation

4. **E2E:** No end-to-end tests
   - Full user journey from landing to ticket purchase
   - Mobile responsiveness
   - Cross-browser compatibility

---

*Testing analysis: 2026-03-15*
