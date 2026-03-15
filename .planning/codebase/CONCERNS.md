# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Placeholder Purchase Logic:**
- Issue: Purchase and resale transactions use hardcoded `setTimeout` delays instead of actual blockchain interaction
- Files: `frontend/src/pages/Event.tsx` (lines 54-58), `frontend/src/pages/Resale.tsx` (lines 21-24)
- Impact: Frontend simulates user interactions but never executes actual smart contract calls. Real blockchain integration required before production use.
- Fix approach: Replace setTimeout mocks with actual wagmi/viem contract calls to `mintTicket`, `listForResale`, `buyResaleTicket` functions on the smart contract

**Mock Data in Production Code:**
- Issue: Owned tickets and resale listings populated from empty mock arrays instead of on-chain data
- Files: `frontend/src/pages/MyTickets.tsx` (lines 13-20), `frontend/src/lib/mockData.ts` (line 311)
- Impact: Users cannot view their actual purchased tickets or resale listings. App is non-functional for core workflow.
- Fix approach: Integrate with contract's `getUserTicketsForEvent` and `resaleListings` mappings; fetch real data from blockchain on component mount

**Dual Contract Architecture:**
- Issue: Two separate contracts exist (DucketTickets.sol and DucketV2.sol) with overlapping functionality
- Files: `contracts/contracts/DucketTickets.sol`, `contracts/contracts/DucketV2.sol`
- Impact: Unclear which contract is actively deployed and used. Frontend points to single CONTRACT_ADDRESS but may hit wrong implementation.
- Fix approach: Consolidate to single contract or establish clear deprecation path and frontend routing logic

**Contract Address Hardcoded as Zero:**
- Issue: Default CONTRACT_ADDRESS is 0x0000... (line 2 in contract.ts)
- Files: `frontend/src/lib/contract.ts` (line 2)
- Impact: Without proper VITE_CONTRACT_ADDRESS environment variable, all contract calls will fail silently
- Fix approach: Make environment variable required during build; add validation that address is not zero

## Known Bugs

**Incorrect Resale Markup Calculation:**
- Symptoms: Markup percentage shows as positive markup even when resale is below original price
- Files: `frontend/src/pages/Resale.tsx` (line 79), `frontend/src/pages/Event.tsx` (line 156)
- Trigger: When `listingPrice` < `originalPrice` (e.g., ticket drops in price), markup shows negative percentage but displayed with `+` prefix if > 20%
- Workaround: None - calculation uses basic formula without negative handling

**Wallet Connector Always Uses First Connector:**
- Symptoms: WalletConnect defaults to connectors[0] without checking if it exists or is available
- Files: `frontend/src/components/WalletConnect.tsx` (line 32)
- Trigger: When connectors array is empty or undefined, accessing `connectors[0]` silently fails
- Workaround: None - app will not connect if wagmi has no available connectors

**Transfer Validation Logic Flaw:**
- Symptoms: Smart contract allows transfer OR resale, but should enforce stricter rules
- Files: `contracts/contracts/DucketTickets.sol` (line 366)
- Trigger: Transfer validation uses OR condition; ticket transfers work if either resaleEnabled OR transferEnabled, not requiring both false for complete lock
- Workaround: Organizer must set both flags to false; resale restrictions alone don't prevent transfers

## Security Considerations

**No Input Validation on Event Creation:**
- Risk: Event name can be empty or extremely long, no sanitization before storage
- Files: `contracts/contracts/DucketTickets.sol` (line 116)
- Current mitigation: Only checks `bytes(eventName).length > 0` - allows valid but malicious content
- Recommendations: Add max length validation (e.g., 256 chars), consider onchain string encoding limits

**Direct Fund Transfers Using .call():**
- Risk: Low-level .call{value:...}() is used instead of safer patterns; potential for reentrancy even with ReentrancyGuard if code path has issues
- Files: `contracts/contracts/DucketTickets.sol` (lines 206, 210, 215, 273, 277, 282)
- Current mitigation: ReentrancyGuard is applied to vulnerable functions
- Recommendations: Consider using pull-payment pattern or OpenZeppelin's SafeTransferLib for ETH transfers

**Platform Fee Percentage Unchecked:**
- Risk: platformFee stored as uint256 but checked only against 1000 (10%); no lower bound enforced
- Files: `contracts/contracts/DucketTickets.sol` (line 332)
- Current mitigation: Upper bound of 10% enforced
- Recommendations: Add minimum fee (e.g., 25 basis points) to prevent fee = 0 bypass

**No Expiration on Resale Listings:**
- Risk: Listings remain active indefinitely; seller cannot update price if market conditions change
- Files: `contracts/contracts/DucketTickets.sol` (struct ResaleListing, lines 48-51)
- Current mitigation: Only seller can cancel, but no automatic expiry
- Recommendations: Add listing expiry timestamp (e.g., 30 days); allow seller to update price without canceling

**Contract Address Validation Missing in Frontend:**
- Risk: No validation that VITE_CONTRACT_ADDRESS is a valid Ethereum address before sending transactions
- Files: `frontend/src/lib/contract.ts` (line 2)
- Current mitigation: None
- Recommendations: Add address validation using isAddress() from viem; throw error if invalid at startup

**Wallet Connection Not Required for Read Operations:**
- Risk: Contract ABI is exposed in frontend without authentication; potential for frontend targeting to reverse-engineer contract behavior
- Files: `frontend/src/lib/contract.ts` (lines 5-169)
- Current mitigation: None - ABI is public
- Recommendations: This is acceptable for public contracts, but ensure contract doesn't leak sensitive data in custom fields

## Performance Bottlenecks

**Full Event List Rendered on Home Page:**
- Problem: All MOCK_EVENTS are mapped and rendered simultaneously; no pagination or lazy loading
- Files: `frontend/src/pages/Home.tsx` (event grid rendering)
- Cause: React renders full list even if only visible events should load initially
- Improvement path: Implement pagination (show 6-12 per page) or infinite scroll with React Virtualization

**No Caching for Contract Data:**
- Problem: Every page load refetches all event/ticket data from contract without cache
- Files: `frontend/src/lib/contract.ts` - no caching layer implemented
- Cause: Wagmi queries not configured with staleTime/cacheTime
- Improvement path: Use @tanstack/react-query (already installed, see package.json line 14) with appropriate cache times (e.g., 5 min for event data, 30 sec for resale listings)

**No Memoization in Component Trees:**
- Problem: EventCard and other components re-render parent list unnecessarily
- Files: `frontend/src/components/EventCard.tsx`, page components
- Cause: Props not compared with React.memo; no useMemo for derived values
- Improvement path: Wrap components with React.memo; memoize computed values like formatDOT results

**DOM List Rendering Without Keys:**
- Problem: If mock data changes order, mapped lists may have rendering artifacts
- Files: `frontend/src/pages/Event.tsx` (line 78, uses listing.id as key), but other pages use index-based keys
- Cause: Map indices used as React keys in some places
- Improvement path: Use stable unique IDs throughout; review all .map() calls for proper keying

## Fragile Areas

**MyTickets Page Empty by Design:**
- Files: `frontend/src/pages/MyTickets.tsx` (lines 13-20)
- Why fragile: ownedTickets hardcoded as empty array; changing this breaks without contract integration. Current UI shows placeholder forever.
- Safe modification: Keep ownedTickets as state, integrate with contract's getUserTicketsForEvent on wallet change; add test that verifies fetching after wallet connect
- Test coverage: No tests exist for wallet state changes or contract data loading

**Event Details View Tight Coupling:**
- Files: `frontend/src/pages/Event.tsx`
- Why fragile: Event lookup from MOCK_EVENTS uses string ID matching; if mock data structure changes, component breaks silently
- Safe modification: Add prop validation/TypeScript guard at top of component; extract event lookup to custom hook with error boundary
- Test coverage: No tests for missing event ID or invalid tier selection

**Resale Listing Price Validation:**
- Files: `frontend/src/pages/Resale.tsx` (line 79 markup calculation), contract lines 235-237
- Why fragile: Frontend calculates original price from MOCK_EVENTS, but contract tracks originalPrices in separate mapping; data can diverge
- Safe modification: Remove frontend price calculation; fetch all listing details with original prices from contract getResaleListing; verify contract-side original price matches event's tier price
- Test coverage: No validation that frontend price assumptions match contract state

**Wallet Connector Integration Points:**
- Files: `frontend/src/components/WalletConnect.tsx`
- Why fragile: Hard dependency on wagmi/viem versions; no fallback if connector unavailable. Uses direct array access without length check.
- Safe modification: Add explicit connector availability checks; provide clear error message if no connectors; add version pinning to package.json
- Test coverage: No tests for connector state or connection failures

## Scaling Limits

**Event ID Counter Not Persisted Across Deployments:**
- Current capacity: Single contract instance tracks _eventIdCounter; resets on redeployment
- Limit: If contract is redeployed, event IDs restart from 0, causing collision with old on-chain data if not properly migrated
- Scaling path: Implement event URI standard (EIP-1155 metadata) with versioning; or migrate to factory pattern with new contract per deployment cycle

**Ticket Tier ID Space:**
- Current capacity: tokenId increments globally as uint256; practical limit ~4.3 billion token IDs
- Limit: In DucketTickets.sol, no partitioning by event; all token IDs in single counter namespace
- Scaling path: DucketV2 (partial implementation) separates event/tier; either complete DucketV2 migration or use nested mapping structure

**Resale Listings Storage Without Indexes:**
- Current capacity: O(n) to find all listings for an event; mappings(tokenId => mapping(ticketNumber => ResaleListing))
- Limit: No way to efficiently query "all active resale listings for event X" without iterating all token IDs
- Scaling path: Add EventIdToListings reverse index; or emit events and use subgraph indexing for frontend queries

## Dependencies at Risk

**Wagmi v2.5.0 with Viem v2.9.0:**
- Risk: Wagmi 2.x is relatively new; breaking changes possible in minor versions
- Impact: If viem 3.x released with breaking changes, wagmi may not support it immediately
- Migration plan: Pin exact versions in package-lock.json; add compatibility testing before bumping; consider using caret constraints (^2.5.0) with regular audits

**Hardhat v2.22.0 - Active but Not Newest:**
- Risk: Hardhat 3.x planned; test compatibility of current contracts
- Impact: Solidity pragma ^0.8.24 is recent; older Hardhat versions may have compiler issues
- Migration plan: Test with latest Hardhat beta; document minimum Hardhat version; consider ethers.js v6 compatibility for scripts

**OpenZeppelin Contracts v5.0.0 - Recent Major Version:**
- Risk: v5.0.0 is very new (Feb 2024); bugs may be discovered
- Impact: ReentrancyGuard implementation may differ from v4; AccessControl interfaces changed
- Migration plan: Monitor OpenZeppelin security advisories; consider upgrading to v5.1+ once stable; test contract before mainnet

## Missing Critical Features

**No Admin Emergency Pause:**
- Problem: If contract is compromised, no way to pause minting/resale without redeployment
- Blocks: Emergency incident response; user fund protection
- Implementation: Add `paused` state variable and `onlyRole(DEFAULT_ADMIN_ROLE) { require(!paused) }` to all state-changing functions

**No Upgrade Path for Events:**
- Problem: Event configuration (name, date, resale %) cannot be modified after creation
- Blocks: Fixing incorrect event dates; adjusting resale policies mid-event
- Implementation: Add governance timelock for event updates; or allow organizer to update specific fields with cooldown

**Missing Event Cancellation Refund Logic:**
- Problem: DucketV2 has `cancelled` flag but no refund mechanism for buyers
- Blocks: Handling postponed/cancelled events fairly
- Implementation: Add refund function; track purchase amounts per ticket; distribute refunds pro-rata

**No Resale Price Negotiation:**
- Problem: Buyer must accept exact listed price; no offer/counteroffer system
- Blocks: Secondary market liquidity and discovery
- Implementation: Consider implementing Dutch auction or allow sellers to set price ranges; not critical v1 but impacts UX

## Test Coverage Gaps

**No Smart Contract Tests:**
- What's not tested: Core contract functions (mintTicket, listForResale, buyResaleTicket) have no automated test suite
- Files: `contracts/` directory contains no .test.ts or .spec.ts files
- Risk: Redeployments or modifications could introduce bugs in critical payment/transfer logic without detection
- Priority: High - foundational for security

**No Frontend Component Tests:**
- What's not tested: React components (Event.tsx, Resale.tsx, MyTickets.tsx) have no unit tests
- Files: `frontend/src/pages/` and `frontend/src/components/` directories have no test files
- Risk: UI regressions and logic errors undetected; wallet connection failures not caught
- Priority: High - user-facing functionality

**No Integration Tests:**
- What's not tested: End-to-end workflows (purchase flow, resale flow) not tested
- Files: No test/ or e2e/ directory in project
- Risk: Contract and frontend may have integration mismatches (ABI version mismatch, wrong function signatures)
- Priority: High - blocks confident deployment

**No Environment Configuration Tests:**
- What's not tested: VITE_CONTRACT_ADDRESS validation, network selection, RPC connectivity
- Files: No setup validation in frontend/src/config/
- Risk: Misconfigured deployment silently fails; users see blank errors
- Priority: Medium - could be caught by deployment scripts

**No Error Handling Tests:**
- What's not tested: Insufficient balance, transaction rejection, network failures
- Files: No error boundary or error handling tests
- Risk: Users encounter unhandled errors; no graceful fallbacks
- Priority: Medium - improves UX but not critical for v1

---

*Concerns audit: 2026-03-15*
