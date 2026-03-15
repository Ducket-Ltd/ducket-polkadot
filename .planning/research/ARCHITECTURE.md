# Architecture Research

**Domain:** ERC1155 ticketing dApp with stablecoin payments and XCM cross-chain verification on Polkadot Hub
**Researched:** 2026-03-15
**Confidence:** MEDIUM (Polkadot Hub XCM precompile is relatively new; core EVM patterns are HIGH confidence)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React SPA)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Event Pages │  │ Purchase UI  │  │ XCM Verify   │              │
│  │  (existing)  │  │ (ERC20 flow) │  │  Page (new)  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│  ┌──────▼─────────────────▼──────────────────▼───────────────────┐  │
│  │              wagmi hooks + viem contract calls                  │  │
│  │  useReadContract, useWriteContract, useWaitForTransactionReceipt│  │
│  └──────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │  (JSON-RPC / EVM transactions)
┌─────────────────────────────▼───────────────────────────────────────┐
│                    POLKADOT HUB TESTNET (REVM)                      │
├───────────────────────────┬─────────────────────────────────────────┤
│  ┌────────────────────┐   │  ┌──────────────────────────────────┐   │
│  │   MockUSDC.sol     │   │  │        DucketTickets.sol          │   │
│  │   (ERC-20 token)   │◄──┤  │   (ERC1155 — existing deployed)  │   │
│  │   deploy for test  │   │  │                                  │   │
│  └────────────────────┘   │  │  + stablecoin payment methods    │   │
│                            │  │  + XCM verification emit        │   │
│                            │  └──────────────┬───────────────────┘  │
│  ┌────────────────────┐   │                 │                       │
│  │   XCM Precompile   │◄──┘                 │                       │
│  │   0x...0a0000      │                     │                       │
│  │   (built-in)       │◄────────────────────┘                       │
│  └────────────────────┘                                             │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │         Polkadot Relay / Connected Parachains (XCM target)    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Status |
|-----------|----------------|--------|
| DucketTickets.sol | ERC1155 minting, resale enforcement, payment distribution | Deployed (ETH payments only) |
| DucketTickets.sol (modified) | Add ERC-20 payment path alongside ETH path | Needs modification + redeploy |
| MockUSDC.sol | ERC-20 stablecoin for testnet (mintable, 6 decimals) | New deploy needed |
| XCM Precompile | Built-in Polkadot Hub EVM interface at 0x...0a0000 for cross-chain messages | Available (built-in) |
| Purchase UI | Two-step ERC-20 approval flow (approve → purchase) | New frontend work |
| XCM Verify Page | Emits XCM verification event for cross-chain proof-of-concept | New frontend + contract work |
| wagmi hooks | Read/write contract calls, transaction state, allowance checking | Existing, extend for ERC-20 |

---

## How New Features Integrate with Existing Architecture

### Question 1: ERC-20 Payment Architecture (approve+transferFrom vs permit2)

**Recommendation: approve+transferFrom (standard pattern)**

For the hackathon timeline and the target chain (Polkadot Hub EVM testnet), the standard two-step approve+transferFrom pattern is the correct choice.

**Why not permit2:**
- Permit2 is a Uniswap-deployed canonical contract. It is NOT pre-deployed on Polkadot Hub Testnet. You would have to deploy and maintain the Permit2 contract yourself, which adds scope.
- EIP-2612 permit (which is embedded in some stablecoin tokens) requires the token itself to implement `permit()` — your MockUSDC won't have it unless you add it.
- Permit2 adds frontend complexity (EIP-712 signing) that is not worth the UX improvement for a demo.

**Standard approve+transferFrom pattern (HIGH confidence):**
```
User clicks "Buy with USDC"
    ↓
Frontend reads: allowance(user, DucketTickets) via useReadContract
    ↓ (if allowance < price)
Frontend calls: USDC.approve(DucketTickets, amount) via useWriteContract
    ↓ waits for confirmation via useWaitForTransactionReceipt
Frontend calls: DucketTickets.mintTicketWithToken(tokenId, to, qty, stablecoinAddress)
    ↓
Contract calls: IERC20(stablecoin).transferFrom(buyer, address(this), totalPrice)
Contract splits payment to organizer + platformWallet
Contract mints ERC1155 ticket
```

**Contract change needed in DucketTickets.sol:**
Add a parallel payment path that accepts an ERC-20 token address. Keep the existing ETH path untouched. Store a `paymentToken` address on the contract (set by admin), or accept it as a parameter and validate against a whitelist.

```solidity
// Minimal addition to DucketTickets.sol
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// New storage
address public paymentToken; // set by admin (MockUSDC address)

// New function alongside existing mintTicket (payable)
function mintTicketWithToken(
    uint256 tokenId,
    address to,
    uint256 quantity
) external nonReentrant {
    require(paymentToken != address(0), "Stablecoin not configured");
    TicketTier storage tier = ticketTiers[tokenId];
    // ... same supply/wallet validations as mintTicket ...

    uint256 totalPrice = tier.price * quantity; // price stored in token units
    SafeERC20.safeTransferFrom(IERC20(paymentToken), msg.sender, address(this), totalPrice);

    _mint(to, tokenId, quantity, "");
    // ... emit events, update counters ...

    // Distribute
    uint256 fee = (totalPrice * platformFee) / 10000;
    SafeERC20.safeTransfer(IERC20(paymentToken), platformWallet, fee);
    SafeERC20.safeTransfer(IERC20(paymentToken), events[tier.eventId].organizer, totalPrice - fee);
}
```

**Price denomination decision:** Prices in `TicketTier.price` are currently in native DOT units (18 decimals). For stablecoin support you need prices in USDC units (6 decimals). Two approaches:
- **Recommended:** Store a separate `stablePrice` per tier, set at event creation. Keeps existing DOT pricing intact, no conversion ambiguity.
- Alternative: Store all prices in stablecoin units and do an oracle conversion for DOT — overkill for this timeline.

### Question 2: XCM Message Architecture for Cross-Chain Verification

**Verdict: Emit XCM "proof of ownership" message from contract, do not attempt bidirectional cross-chain query**

Full cross-chain verification (parachain queries ownership on Asset Hub) requires infrastructure on the receiving parachain that you do not control for a hackathon. The realistic proof-of-concept is:

**Light XCM approach — outbound verification broadcast:**
```
Ticket holder requests "verify across chains"
    ↓
Frontend calls: DucketTickets.emitXcmVerification(ticketId, targetParachain)
    ↓
Contract checks: balanceOf(msg.sender, tokenId) > 0
Contract builds: XCM message payload (VersionedXcm SCALE-encoded)
Contract calls: IXcm(0x...0a0000).execute(xcmPayload, maxWeight)
    ↓
XCM Precompile routes message toward target parachain
    ↓
TicketVerified event emitted on-chain (observable by frontend and explorers)
```

The XCM precompile on Polkadot Hub EVM is at fixed address `0x00000000000000000000000000000000000a0000` and exposes `execute(bytes xcmPayload, Weight maxWeight)` and `send(MultiLocation dest, bytes xcmPayload)`. (MEDIUM confidence — confirmed in official docs, but SCALE encoding of XCM messages from Solidity is complex and may require off-chain assistance for the payload bytes.)

**Practical implementation for demo:**
The cleanest demo approach is to emit the XCM verification attempt and show the transaction hash. The `TicketVerified` event on the source chain is observable in block explorers and proves the cross-chain signal was sent. Full receipt confirmation on a remote parachain is out of scope given the 5-day timeline.

**Solidity interface for XCM Precompile:**
```solidity
interface IXcm {
    struct Weight {
        uint64 refTime;
        uint64 proofSize;
    }
    function execute(bytes memory message, Weight memory maxWeight) external;
    function send(bytes memory dest, bytes memory message) external;
}
```

### Question 3: Extend Existing Contract vs Deploy Helper Contracts

**Recommendation: Extend DucketTickets.sol directly. Do not add separate proxy or helper contracts.**

**Rationale:**
- The existing contract is already deployed and functional. The changes needed (stablecoin payment method, XCM call, price storage additions) are additive and small.
- Adding a separate PaymentProcessor contract would require the ERC1155 to delegate or the processor to have `MINTER_ROLE`, creating an unnecessary 2-contract coordination surface.
- Proxy upgradeable patterns (OpenZeppelin TransparentProxy, UUPS) add deployment and initialization complexity with no benefit for a hackathon demo.
- **The contract will need to be redeployed** regardless because:
  - `mintTicket` currently requires `MINTER_ROLE` — for direct user purchases this is wrong (must remove role check or change the role design)
  - New storage variables and functions require bytecode change
  - New seed events can set `stablePrice` on tiers

**Minimal changes to DucketTickets.sol:**
1. Import `IERC20` and `SafeERC20`
2. Add `address public paymentToken` (admin-settable)
3. Add `stablePrice` field to `TicketTier` struct
4. Add `mintTicketWithToken()` function (non-payable, pulls ERC-20)
5. Modify `mintTicket()` to remove `MINTER_ROLE` restriction (let any user call it directly)
6. Add `emitXcmVerification()` function that checks ownership then calls XCM precompile
7. Add `setPaymentToken()` admin function

**New MockUSDC contract** (separate, simple):
Deploy a minimal ERC-20 with a public `mint()` function so testnet users can get tokens. This is a utility contract, not part of core ticketing logic.

### Question 4: Frontend Integration Patterns for ERC-20 Approval Flows

**Pattern: Sequential two-step with state machine UI**

The frontend must handle the approval transaction as a distinct step before the purchase transaction. Wagmi's `useReadContract` + `useWriteContract` + `useWaitForTransactionReceipt` compose cleanly for this.

```
State machine for purchase flow:
  IDLE
    → (user clicks Buy with USDC)
  CHECKING_ALLOWANCE   [reads allowance(user, contractAddress)]
    → (allowance >= price) → READY_TO_PURCHASE
    → (allowance < price)  → NEEDS_APPROVAL
  NEEDS_APPROVAL
    → (user confirms approve tx) → APPROVING
  APPROVING            [waitForTransactionReceipt(approveTxHash)]
    → (confirmed) → READY_TO_PURCHASE
  READY_TO_PURCHASE
    → (user confirms buy tx) → PURCHASING
  PURCHASING           [waitForTransactionReceipt(purchaseTxHash)]
    → (confirmed) → SUCCESS
    → (reverted)  → ERROR
```

**Key wagmi hooks used:**
- `useReadContract` — read `allowance(address owner, address spender)` on ERC-20
- `useWriteContract` — call `approve(contractAddress, amount)` on ERC-20
- `useWriteContract` — call `mintTicketWithToken(tokenId, to, qty)` on DucketTickets
- `useWaitForTransactionReceipt` — confirm each tx before proceeding

**UX consideration:** Show two clearly labelled steps. "Step 1: Approve USDC (1 of 2 transactions)" and "Step 2: Purchase Ticket (2 of 2 transactions)". Users who have already approved (from a previous purchase with sufficient allowance) skip Step 1 automatically.

**ABI additions needed in `frontend/src/lib/contract.ts`:**
- `mintTicketWithToken(tokenId, to, quantity)` — nonpayable
- `emitXcmVerification(ticketId)` — nonpayable
- `setPaymentToken(tokenAddress)` — admin only
- Standard ERC-20 ABI (approve, allowance, balanceOf) for MockUSDC in a separate `ERC20_ABI` export

---

## Recommended Project Structure Changes

```
contracts/contracts/
├── DucketTickets.sol         # Modify: add stablecoin + XCM functions
└── MockUSDC.sol              # New: simple mintable ERC-20 for testnet

contracts/scripts/
├── deploy.ts                 # Modify: deploy MockUSDC, pass address to DucketTickets
├── seed.ts                   # Modify: seed events with stablePrice on tiers
└── setPaymentToken.ts        # New: admin script to set USDC address on contract

frontend/src/lib/
├── contract.ts               # Modify: add new ABIs (mintTicketWithToken, ERC20, XCM)
├── mockData.ts               # Modify: add stablePrice to MockTicketTier
└── utils.ts                  # Modify: add formatUSDC helper

frontend/src/components/
├── PurchaseModal/            # New: extract purchase flow to component with state machine
│   ├── index.tsx             # Orchestrates approval + purchase steps
│   ├── ApprovalStep.tsx      # Step 1 UI: show approve button, pending state
│   └── PurchaseStep.tsx      # Step 2 UI: show purchase button, pending state
└── XcmVerifyButton.tsx       # New: button that calls emitXcmVerification

frontend/src/pages/
├── Event.tsx                 # Modify: wire real contract calls, use PurchaseModal
├── MyTickets.tsx             # Modify: add XcmVerifyButton per ticket
└── Resale.tsx                # Modify: wire real resale contract calls
```

---

## Data Flow

### ERC-20 Primary Purchase Flow

```
User selects tier + quantity
    ↓
PurchaseModal opens
    ↓
useReadContract: USDC.allowance(user, DucketTickets)
    ↓ allowance < price
useWriteContract: USDC.approve(DucketTickets, price)
    → wallet popup (approve tx)
    → useWaitForTransactionReceipt(approveTxHash)
    ↓ confirmed
useWriteContract: DucketTickets.mintTicketWithToken(tokenId, user, qty)
    → wallet popup (purchase tx)
    → contract: USDC.transferFrom(user, contract, price)
    → contract: _mint(user, tokenId, qty)
    → contract: USDC.transfer(platformWallet, fee)
    → contract: USDC.transfer(organizer, organizerAmount)
    → contract: emit TicketMinted
    → useWaitForTransactionReceipt(purchaseTxHash)
    ↓ confirmed
Frontend shows success + ticket in MyTickets
```

### XCM Verification Flow

```
User on MyTickets page, owns ticket (tokenId, ticketNumber)
    ↓
Clicks "Verify Cross-Chain" (XcmVerifyButton)
    ↓
useWriteContract: DucketTickets.emitXcmVerification(ticketId)
    → contract: require balanceOf(msg.sender, tokenId) > 0
    → contract: build XCM payload bytes (VersionedXcm encoding)
    → contract: IXcm(XCM_PRECOMPILE).execute(payload, weight)
    → contract: emit TicketVerified(ticketId, msg.sender, block.timestamp)
    ↓
Frontend shows block explorer link to the XCM transaction
Demo: show the Polkadot.js Apps XCM tab confirming message was sent
```

### Resale Flow (with ERC-20)

```
Buyer clicks "Buy Resale Listing"
    ↓
Same two-step approval check as primary purchase
    ↓
useWriteContract: DucketTickets.buyResaleTicketWithToken(ticketId)
    → contract: USDC.transferFrom(buyer, contract, listingPrice)
    → contract: safeTransferFrom(seller, buyer, tokenId, 1)
    → contract: USDC.transfer(platformWallet, fee)
    → contract: USDC.transfer(seller, sellerAmount)
    → contract: emit TicketResold
```

---

## Build Order (Dependencies)

The milestone has hard sequential dependencies. Build in this order:

```
1. MockUSDC.sol (no dependencies)
        ↓
2. DucketTickets.sol modifications (depends on: MockUSDC address, IERC20 interface)
        ↓
3. Redeploy DucketTickets + deploy MockUSDC + run seed (depends on: both contracts)
        ↓
4. Update contract.ts ABI (depends on: new contract functions)
        ↓
5. Wire real contract reads (getEvent, getUserTicketsForEvent) to replace mock data
        ↓
6. ERC-20 approval flow — PurchaseModal component (depends on: ABI, re-wired reads)
        ↓
7. Resale contract wiring (listForResale, buyResaleTicketWithToken)
        ↓
8. XCM verification UI — XcmVerifyButton (depends on: ticket ownership reads working)
        ↓
9. UI polish + end-to-end demo flow test
```

Step 5 (wiring real reads) is a prerequisite for the ERC-20 purchase flow because you need to know the real `price` and `tokenId` from chain, not mock data.

---

## Architectural Patterns

### Pattern 1: Parallel Payment Paths in Contract

**What:** Keep existing `mintTicket(payable)` and add `mintTicketWithToken(nonpayable)`. Both paths share the same minting, supply, and wallet-limit validation logic extracted to an internal `_validateAndMint()` function.

**When to use:** When adding a new payment method to a deployed-and-tested contract. Avoids breaking the ETH path.

**Trade-offs:** Slight code duplication vs clean separation. For 5-day timeline, shared internal function is adequate.

```solidity
function _validateAndMint(uint256 tokenId, address to, uint256 quantity) internal {
    TicketTier storage tier = ticketTiers[tokenId];
    require(tier.exists, "Ticket tier does not exist");
    require(tier.minted + quantity <= tier.maxSupply, "Exceeds max supply");
    Event storage eventData = events[tier.eventId];
    if (eventData.maxTicketsPerWallet > 0) {
        require(eventPurchases[tier.eventId][to] + quantity <= eventData.maxTicketsPerWallet, "Wallet limit exceeded");
    }
    _mint(to, tokenId, quantity, "");
    tier.minted += quantity;
    eventPurchases[tier.eventId][to] += quantity;
    for (uint256 i = 0; i < quantity; i++) {
        originalPrices[tokenId][tier.minted - quantity + i] = tier.price;
        emit TicketMinted(tokenId, to, tier.minted - quantity + i, tier.price);
    }
}
```

### Pattern 2: Allowance Check Before Purchase (Frontend)

**What:** Always read current allowance before initiating a purchase. If allowance is already sufficient (e.g., user previously approved a large amount), skip the approval step entirely.

**When to use:** All ERC-20 payment flows.

**Trade-offs:** Extra read call per purchase attempt. Worth it for UX — avoids confusing the user with an unnecessary approval transaction.

### Pattern 3: XCM as Outbound Signal, Not Query

**What:** Use XCM `execute` to broadcast a "this ticket is owned by address X" message outward, not to query state from a remote chain.

**When to use:** When you need cross-chain visibility but cannot control the receiving parachain.

**Trade-offs:** Proof is send-only; the receiving chain cannot automatically act on it without its own listener. Sufficient for hackathon demo (visible in explorer, technically valid XCM).

---

## Anti-Patterns

### Anti-Pattern 1: Setting MINTER_ROLE on DucketTickets for ERC-20 Purchases

**What people do:** Keep `mintTicket` restricted to `MINTER_ROLE` and grant the role to a "payment processor" helper contract.

**Why it's wrong:** Adds an unnecessary contract hop. The helper contract becomes a bottleneck and introduces another deploy/upgrade surface. The original role restriction was a security measure for trusted minting — for user-initiated ERC-20 purchases, the payment validation in `mintTicketWithToken` is the security gate.

**Do this instead:** Remove `onlyRole(MINTER_ROLE)` from `mintTicket` / add `mintTicketWithToken` as a public function gated by ERC-20 payment validation, not role.

### Anti-Pattern 2: Unlimited ERC-20 Allowance in Frontend

**What people do:** Call `approve(contract, MaxUint256)` for maximum convenience.

**Why it's wrong:** Security risk — if the contract has a bug, attacker can drain the user's full stablecoin balance. Bad look for a hackathon demo presenting "safe" ticketing.

**Do this instead:** Approve exactly `totalPrice`. User can re-approve for future purchases. For demo, this is the better story.

### Anti-Pattern 3: Storing Prices in Mixed Units (DOT and USDC)

**What people do:** Reuse the existing `price` field in `TicketTier` for both DOT and stablecoin prices.

**Why it's wrong:** DOT has 18 decimals, USDC has 6. The same uint256 value means radically different amounts. Silent incorrect payment distributions result.

**Do this instead:** Add a separate `stablePrice` uint256 field to `TicketTier`. The ETH `price` remains in DOT units (18 decimals), `stablePrice` is in token units (e.g., 6 decimals for USDC). Set both when creating tiers in the seed script.

### Anti-Pattern 4: Attempting Full Bidirectional XCM Verification

**What people do:** Try to have the source chain query ownership on a remote chain, or have a remote chain call back to confirm receipt.

**Why it's wrong:** Requires runtime configuration on the receiving parachain, HRMP channel setup, and a responding contract on the target. None of this is within scope or controllable on a public testnet in 5 days.

**Do this instead:** Emit a well-structured XCM message outbound and demonstrate the transaction in the explorer. The proof-of-concept value is in showing a Solidity contract calling the XCM precompile — not in full roundtrip verification.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Polkadot Hub Testnet RPC | wagmi chain config (existing `frontend/src/config/chains.ts`) | No change needed |
| XCM Precompile `0x...0a0000` | Solidity `interface IXcm` call from DucketTickets.sol | SCALE-encode XCM payload; may need off-chain construction |
| MockUSDC (new deploy) | ERC-20 standard interface, `USDC_ADDRESS` env var | Set in `.env` and contract storage |
| Block Explorer | Link to tx hash after XCM verification | Use Polkadot Hub Testnet explorer URL |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend → DucketTickets.sol | wagmi `useReadContract` / `useWriteContract` | Add new ABI entries for ERC-20 functions |
| Frontend → MockUSDC.sol | wagmi `useReadContract` (allowance) / `useWriteContract` (approve) | Use standard ERC20_ABI, no custom entries needed |
| DucketTickets.sol → MockUSDC.sol | `IERC20.transferFrom` / `SafeERC20.safeTransfer` | Pull payment in, push fee/organizer share out |
| DucketTickets.sol → XCM Precompile | `IXcm(0x...0a0000).execute(bytes, Weight)` | Caller is the contract, not user |
| Seed Script → Both Contracts | Hardhat `ethers.getContractAt` | Deploy MockUSDC first, pass address to setPaymentToken |

---

## Scaling Considerations

This is a hackathon demo, not production. Scaling is not a concern for the 5-day timeline. Notes for reference only:

| Scale | Architecture Adjustment |
|-------|--------------------------|
| Demo (< 100 txs) | Current monolithic contract is fine |
| Production (10k+ tickets) | Extract payment logic to upgradeable router; support multiple stablecoins via registry |
| Multi-chain production | Replace outbound XCM signal with proper HRMP channel + receiving contract |

---

## Sources

- [Polkadot Hub Smart Contracts — official docs](https://docs.polkadot.com/reference/polkadot-hub/smart-contracts/)
- [Interact with the XCM Precompile — official docs](https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile/)
- [Native EVM Contracts on Polkadot Hub](https://docs.polkadot.com/develop/smart-contracts/evm/native-evm-contracts/)
- [Deploy ERC-20 to Polkadot Hub tutorial](https://docs.polkadot.com/tutorials/smart-contracts/deploy-erc20/)
- [wagmi useWriteContract](https://wagmi.sh/react/api/hooks/useWriteContract)
- [Full Guide to Implementing Permit2 — Cyfrin](https://www.cyfrin.io/blog/how-to-implement-permit2) (referenced to confirm Permit2 requires canonical deployment)
- [Token Approvals: approve+transferFrom vs Permit2 — Jacek's Blog](https://blog.varkiwi.com/2025/04/23/ERC20-Approve-And-Permit(2).html)
- [ERC-2612 Permit Extension EIP](https://eips.ethereum.org/EIPS/eip-2612)
- [Build on Polkadot September 2025 — XCM precompile progress update](https://www.parity.io/blog/build-on-polkadot-september-2025-product-engineering-update)

---

*Architecture research for: ERC1155 ticketing dApp — stablecoin payments and XCM on Polkadot Hub*
*Researched: 2026-03-15*
