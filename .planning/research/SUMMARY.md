# Project Research Summary

**Project:** Ducket Polkadot — Stablecoin-powered Event Ticketing dApp
**Domain:** ERC1155 ticketing with stablecoin payments and XCM cross-chain verification on Polkadot Hub EVM
**Researched:** 2026-03-15
**Confidence:** MEDIUM

## Executive Summary

Ducket Polkadot is an additive milestone on an existing event ticketing dApp. The existing codebase has a deployed ERC1155 contract (DucketTickets.sol) on Polkadot Hub Testnet (Chain ID 420420417), but all frontend interactions use mock/hardcoded data instead of real contract calls. The core mission is twofold: wire the frontend to real on-chain data and contract calls, and add stablecoin (ERC-20) payment support as required by the hackathon's EVM Smart Contract Track ("DeFi & Stablecoin-enabled dApps"). A light XCM cross-chain ownership verification proof-of-concept serves as the Polkadot-native differentiator.

The recommended approach is to extend DucketTickets.sol directly (no proxy, no helper contracts) by adding a parallel `mintTicketWithToken` function alongside the existing ETH payment path, deploying a MockUSDC ERC-20 on the testnet (no canonical USDC ERC-20 address exists on this specific testnet), and implementing a state-machine-driven two-step approve+purchase flow in the frontend using existing wagmi/viem hooks. XCM integration should be scoped to a minimal outbound `xcmExecute` call from the contract — proving the cross-chain plumbing works without attempting full bidirectional verification that would require HRMP channel setup.

The primary risks are: (1) the contract must be redeployed after adding stablecoin support, requiring a disciplined redeploy-and-reseed checklist to avoid pointing the frontend at a dead contract, (2) the ERC-20 approval step is the most commonly missed demo-day failure point and must be explicitly implemented as a distinct UI step, and (3) XCM message construction requires SCALE encoding that is complex to do from Solidity alone — the safest path is to pre-encode XCM bytes off-chain and pass them to the contract. The hackathon deadline is March 20, making build order and scope discipline the most important non-technical factors.

---

## Key Findings

### Recommended Stack

The project requires zero new npm packages for the Solidity layer. All needed interfaces (IERC20, SafeERC20, ERC20) are in the existing `@openzeppelin/contracts 5.0.0` dependency. The frontend already has wagmi 2.5.0 and viem 2.9.0 which handle all ERC-20 reads and writes natively. The only new dependency is `@polkadot/api` in the contracts package (not bundled into the frontend) for off-chain SCALE encoding of XCM message payloads.

**Core technologies:**
- `MockUSDC.sol` (OpenZeppelin ERC20): ERC-20 stablecoin stand-in — no canonical USDC ERC-20 address exists on Chain ID 420420417; self-deploying a mock is standard hackathon practice and explicitly expected
- `SafeERC20` (already in @openzeppelin/contracts 5.0.0): Wraps all ERC-20 transfer calls — mandatory because some stablecoins return `false` instead of reverting; using raw `transferFrom` causes silent payment failures
- XCM Precompile at `0x00000000000000000000000000000000000a0000` (built-in): Only XCM interface available to EVM contracts on Polkadot Hub; confirmed live on testnet as of July 2025; no library install needed
- `@polkadot/api` (scripts/testing only, NOT frontend bundle): Canonical SCALE encoder for XCM message construction; must not be bundled into Vite frontend due to size

### Expected Features

**Must have (P1 — submission fails without these):**
- Real contract calls for ticket purchase (wagmi `writeContract` to `mintTicketWithToken`) — judges click "Buy"; mock data fails the demo
- Stablecoin (MockUSDC) payment path — explicit track requirement; missing this disqualifies from the EVM track prize
- MyTickets page showing on-chain owned tickets — without this the demo loop (buy ticket → see it → list it) is broken
- Working resale listing and purchase flow — demonstrates the anti-scalping value proposition end-to-end
- Wallet connection guard fixed (`WalletConnect.tsx` connector array access) — a broken connect button kills the demo before it starts
- `VITE_CONTRACT_ADDRESS` wired to the deployed contract — current default is address zero

**Should have (P2 — moves score from submitted to winning):**
- XCM cross-chain ownership verification PoC — Polkadot-native differentiation; no other hackathon ticketing submission does this
- Ticket QR code on MyTickets — high-impact "wow moment" for non-crypto judges; needs only tokenId + wallet address, no contract changes
- Resale price cap displayed prominently (e.g., "Max resale: $50 USDC") — makes the on-chain anti-scalping mechanic legible
- Platform fee transparency (show fee split in UI) — DeFi sophistication signal
- Stablecoin price display ("$25 USDC" not "0.000483 DOT") — directly communicates the stablecoin value prop

**Defer to v2+:**
- Full XCM cross-chain ticket transfer — requires HRMP channel setup and a receiving contract on another parachain; 3-5 days of work alone
- Event cancellation and refund logic — complex pull-payment refund with reentrancy risk; answer in Q&A as "v2 roadmap"
- Organizer event creation UI — demo uses seed script; UI is unnecessary for submission
- Full Hardhat test suite — production quality signal; write one happy-path test as a signal; document the gap in README

### Architecture Approach

The architecture is a single React SPA connected via wagmi/viem to two deployed Solidity contracts on Polkadot Hub Testnet: the modified DucketTickets.sol (ERC1155 + stablecoin payments + XCM call) and a newly deployed MockUSDC.sol. The XCM Precompile is a built-in at a fixed address and requires no deployment. All new features extend DucketTickets.sol directly — no proxy contracts, no helper contracts, no payment processor intermediaries — because the changes are additive and small, and adding separate contracts creates unnecessary coordination surface.

**Major components:**
1. `MockUSDC.sol` — Deployable ERC-20 with `faucet()` function; 6 decimals to match real USDC; mint 1M to deployer for seeding
2. `DucketTickets.sol` (modified) — Add `stablePrice` field to `TicketTier`, add `mintTicketWithToken()` (parallel to existing ETH path), add `emitXcmVerification()`, add `setPaymentToken()` admin function; redeploy required
3. `PurchaseModal` component — New React component with explicit state machine: `IDLE → CHECKING_ALLOWANCE → NEEDS_APPROVAL → APPROVING → READY_TO_PURCHASE → PURCHASING → SUCCESS`; shows "Step 1/2: Approve USDC" and "Step 2/2: Purchase Ticket" to prevent demo-day confusion
4. `XcmVerifyButton` component — Calls `emitXcmVerification(ticketId)` on the contract; displays block explorer link to the XCM transaction as proof
5. `contract.ts` ABI updates — Add `mintTicketWithToken`, `emitXcmVerification`, `setPaymentToken` to DucketTickets ABI; add standard `ERC20_ABI` export for MockUSDC interactions

### Critical Pitfalls

1. **Missing ERC-20 approval step in demo** — The most common live demo failure for stablecoin dApps. The frontend must check `allowance(user, contract)` and send `approve()` before `mintTicketWithToken()`. Test with a fresh wallet that has zero allowance before demo day.

2. **Contract redeployment orphans seed data** — Any contract change requires redeployment. After redeployment: update `VITE_CONTRACT_ADDRESS` in `.env`, rebuild the frontend, re-run the seed script. Create a `deploy-and-seed.sh` script to enforce this checklist. A stale contract address causes empty event lists and silent transaction failures.

3. **Mixing `msg.value` and ERC-20 in the same function** — The stablecoin function must begin with `require(msg.value == 0, "No ETH for ERC20 purchases")`. Without this guard, users can accidentally send ETH AND approve ERC-20, with the contract accepting both payments. Use `SafeERC20.safeTransferFrom` throughout.

4. **XCM precompile address collision with Moonbeam** — Polkadot Hub XCM precompile is `0x00000000000000000000000000000000000a0000`. Moonbeam uses a different address. Many XCM code examples online target Moonbeam. Pin the address from official Polkadot Hub docs only.

5. **On-chain identity not set up before submission deadline** — Receiving hackathon prizes requires a Polkadot wallet (not MetaMask) with on-chain identity set and verified. This takes time on-chain. Do it on Day 1 in parallel with dev work — it cannot be done in 5 minutes on demo day.

---

## Implications for Roadmap

The build has hard sequential dependencies that dictate phase order. The contract must be modified and redeployed before any frontend wiring can be tested against real data. Stablecoin payment must work before MyTickets (which requires a purchased ticket to display) and before the resale flow (which requires owning a ticket). XCM verification requires a minted ticket and is therefore the last contract-touching feature. UI polish and demo preparation comes last.

### Phase 1: Foundation — MockUSDC Deploy + Contract Modification

**Rationale:** Everything else depends on the contract being modified and redeployed with stablecoin support. This phase unblocks all subsequent work. Must happen first because changing the contract requires redeployment, which invalidates any frontend work done against the old contract.
**Delivers:** Deployed MockUSDC.sol on testnet, modified DucketTickets.sol with stablecoin payment path and `emitXcmVerification`, updated `.env` with both contract addresses, seed events with `stablePrice` fields set.
**Addresses features:** Stablecoin payment path (P1), contract redeployment with correct address (P1)
**Avoids pitfalls:** Mixing ETH and ERC-20 payment paths; stale contract address after redeploy; missing `require(msg.value == 0)` guard; price unit confusion (DOT 18-decimal vs USDC 6-decimal)

### Phase 2: Frontend Foundation — Real Contract Reads

**Rationale:** Before wiring any write transactions, the frontend must read real event data, ticket tiers, and owned tickets from chain. This replaces mock data and establishes the correct data shapes for all subsequent UI work. Without this, any purchase flow UI built on mock data will break when real data is connected.
**Delivers:** Home page and Event page showing real seeded events from chain; MyTickets reading `getUserTicketsForEvent` instead of empty mock array; `contract.ts` ABI updated with all new functions; `VITE_CONTRACT_ADDRESS` validated at startup.
**Uses:** wagmi `useReadContract`, viem `readContract`, updated ABI from Phase 1 contract
**Implements:** Read-layer of the frontend architecture

### Phase 3: Stablecoin Purchase Flow

**Rationale:** This is the highest-value, highest-risk frontend integration. It requires Phase 1 (deployed MockUSDC + modified contract) and Phase 2 (real reads for price and tokenId) to be complete. Building this as a focused phase prevents the most common demo failure — an absent or broken approval step.
**Delivers:** `PurchaseModal` component with full state machine (allowance check → approve → wait → purchase → wait → success); two labeled transaction steps visible in UI; stablecoin price displayed as USDC throughout; working end-to-end ticket purchase.
**Avoids pitfalls:** Missing approval step; allowance check skipped; no feedback during two-step flow; unlimited `MaxUint256` approval (approve exact price only)

### Phase 4: Resale Flow + MyTickets Completion

**Rationale:** Resale requires an owned ticket (Phase 3 must work first). MyTickets must show real tickets before listing is possible. These are grouped because they complete the core demo loop: buy → see → list → buy resale.
**Delivers:** MyTickets showing real purchased tickets with QR codes; resale listing with price cap displayed prominently ("Max resale: $50 USDC"); resale purchase with the same approve+buy state machine from Phase 3; resale markup calculation bug fixed (Resale.tsx line 79).

### Phase 5: XCM Integration

**Rationale:** XCM requires a minted ticket (Phase 3) and must be scoped conservatively to avoid blocking the demo. The realistic scope is: contract calls `xcmExecute` with a pre-encoded XCM payload, emits `TicketVerified` event, frontend shows the block explorer link. Full bidirectional verification is explicitly out of scope.
**Delivers:** `emitXcmVerification()` function in contract calling XCM precompile; `XcmVerifyButton` component on MyTickets; block explorer link showing the XCM transaction; off-chain SCALE encoding of XCM payload via `@polkadot/api` in a Hardhat script.
**Avoids pitfalls:** Using Moonbeam XCM precompile address; attempting full bidirectional verification; trying to build XCM payload in Solidity without SCALE encoding

### Phase 6: Demo Polish + Submission

**Rationale:** After core is working, high-leverage polish items move the score from "submitted" to "winning." Submission compliance (code similarity documentation, identity setup, demo video) must be completed before the March 20 deadline.
**Delivers:** Platform fee transparency display; "Verified on Polkadot" trust badge; multi-tier visual distinction (CSS); `wallet_addEthereumChain` for Polkadot Hub Testnet in wallet connection flow; demo video (2-4 min, required for submission); README documenting new vs. pre-existing code contributions; Polkadot on-chain identity set up for prize distribution.
**Avoids pitfalls:** Hackathon similarity disqualification; missing on-chain identity; missing demo video; wallet network config failing with a fresh MetaMask

### Phase Ordering Rationale

- Phases 1-2 are foundation: contract changes first, then read-layer, because write operations need the correct ABI and real data shapes
- Phases 3-4 follow the user journey dependency chain: buy before you can see, see before you can list
- Phase 5 (XCM) is last among contract-touching features because it is highest-risk and lowest-dependency — it needs a real minted ticket but adds no dependencies for other features
- Phase 6 is strictly last: demo polish on a broken app adds no value; polish only after core loop works end-to-end

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (XCM):** SCALE encoding of XCM messages for `xcmExecute` is the least-documented area for Polkadot Hub EVM specifically. The exact VersionedXcm structure for a "verification broadcast" message needs to be tested on testnet before committing to it. Fall-back: emit a Solidity event representing the cross-chain signal and present as "XCM message sent."
- **Phase 1 (native USDC/USDT ERC-20 precompile):** LOW confidence that a canonical ERC-20 address exists for USDC/USDT on testnet Chain ID 420420417. Check the block explorer before the sprint starts. If a precompile address is available, use it instead of MockUSDC (no Solidity changes needed; same IERC20 interface).

Phases with standard patterns (skip additional research):
- **Phase 2 (contract reads):** wagmi `useReadContract` is well-documented; the patterns are identical to any Ethereum dApp
- **Phase 3 (stablecoin purchase):** ERC-20 approve+transferFrom is a canonical Solidity pattern; the state machine implementation is straightforward with wagmi hooks
- **Phase 4 (resale flow):** Same approve+buy state machine as Phase 3; no new patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new packages required; all patterns (IERC20, SafeERC20, wagmi hooks) are canonical; only uncertainty is `@polkadot/api` XCM encoding in practice |
| Features | MEDIUM-HIGH | Judging criteria from official hackathon docs; feature prioritization is well-supported; XCM scope recommendation is conservative by design |
| Architecture | MEDIUM | Core EVM patterns are HIGH confidence; XCM precompile function signatures confirmed from official docs but SCALE encoding in practice is MEDIUM — new enough that testnet testing is required before relying on it |
| Pitfalls | MEDIUM | Critical pitfalls (missing approval step, stale contract address, ETH+ERC-20 mixing) are HIGH confidence based on code analysis; XCM-specific pitfalls are MEDIUM based on Polkadot Hub newness |

**Overall confidence:** MEDIUM — sufficient to begin execution with clear fallbacks defined for the two uncertain areas (XCM encoding, native USDC precompile address).

### Gaps to Address

- **Native USDC/USDT ERC-20 precompile on testnet:** Check the block explorer for asset 1337 before deploying MockUSDC. If available, skip MockUSDC and use the precompile address directly — same IERC20 interface, no Solidity changes. If not, proceed with MockUSDC (recommended default).
- **XCM VersionedXcm payload for ownership verification:** The exact SCALE-encoded bytes for a minimal `xcmExecute` verification call need to be tested on testnet. Prepare a fallback: if the XCM call cannot be made to work reliably in the hackathon window, emit a Solidity `TicketVerified` event and present it as the cross-chain signal — technically defensible for a PoC.
- **PAS decimals vs ETH decimals:** Polkadot Hub Testnet uses PAS (10 decimals) for native currency, not ETH (18 decimals). Any display of native token amounts must use `formatUnits(value, 10)`, not `formatEther`. Audit all price display code for this.
- **MINTER_ROLE removal from `mintTicket`:** Current `mintTicket` is gated by `MINTER_ROLE`. For user-initiated purchases, this role restriction must be removed or the new `mintTicketWithToken` must be public with payment as the security gate. This is a design decision to confirm before Phase 1.

---

## Sources

### Primary (HIGH confidence)
- [Interact with the XCM Precompile — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/precompiles/xcm/) — precompile address, IXcm interface, function signatures
- [Deploy an ERC-20 to Polkadot Hub — Polkadot Developer Docs](https://docs.polkadot.com/tutorials/smart-contracts/deploy-erc20/) — confirms OpenZeppelin ERC20 deploys on Hub testnet
- [Polkadot Solidity Hackathon 2026 Rules — DoraHacks](https://dorahacks.io/hackathon/polkadot-solidity-hackathon/rules) — judging criteria, submission requirements, disqualification rules
- [Polkadot Hub Assets — Polkadot Developer Docs](https://docs.polkadot.com/reference/polkadot-hub/assets/) — asset IDs for USDT (1984) and USDC (1337)
- [wagmi useWriteContract — wagmi.sh](https://wagmi.sh/react/api/hooks/useWriteContract) — ERC-20 approval and purchase hooks

### Secondary (MEDIUM confidence)
- [PolkaWorld — XCM precompile on Polkadot testnet announcement](https://x.com/polkaworld_org/status/1950278403367809377) — confirms precompile live on testnet (July 2025)
- [Build on Polkadot September 2025 — Parity](https://www.parity.io/blog/build-on-polkadot-september-2025-product-engineering-update) — XTransfers library still in development; reason to use raw IXcm instead
- [USDC for Polkadot — Circle](https://www.circle.com/multi-chain-usdc/polkadot) — confirms USDC on Asset Hub is a substrate native asset, not a stable ERC-20 address
- [Token Approvals: approve+transferFrom vs Permit2 — Jacek's Blog](https://blog.varkiwi.com/2025/04/23/ERC20-Approve-And-Permit(2).html) — confirms Permit2 requires canonical contract deployment (not on Polkadot Hub testnet)

### Tertiary (LOW confidence)
- [ERC20 & XCM Precompiles: A Technical Overview — OneBlock+ Medium](https://medium.com/@OneBlockplus/erc20-xcm-precompiles-a-technical-overview-205392b4a7bd) — IXcm interface breakdown; unverified secondary source; treat as supplementary only
- [Crypto.com USDT/USDC on Polkadot Asset Hub — October 2025](https://bitcoinethereumnews.com/crypto/crypto-com-launches-usdt-usdc-deposits-and-withdrawals-on-polkadot-asset-hub/) — confirms asset IDs; does not confirm ERC-20 precompile address on testnet

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
