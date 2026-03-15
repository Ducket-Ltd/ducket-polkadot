# Stack Research

**Domain:** Stablecoin payments + light XCM cross-chain on Polkadot Hub EVM (Solidity)
**Researched:** 2026-03-15
**Confidence:** MEDIUM — XCM precompile interface is confirmed from official docs; stablecoin addresses on the specific testnet require on-chain verification

---

## Context: What Already Exists

This is an additive milestone. The following are **not** re-researched:

| Layer | Tech | Version |
|-------|------|---------|
| Contracts | Solidity + Hardhat | 0.8.24 / 2.22.0 |
| Contract lib | @openzeppelin/contracts | 5.0.0 |
| Frontend | React + wagmi + viem | 18.2.0 / 2.5.0 / 2.9.0 |
| Chain | Polkadot Hub Testnet | Chain ID 420420417 |

Everything below is **new tech** needed for stablecoin payments and XCM integration.

---

## Recommended Stack

### Core New Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| OpenZeppelin IERC20 | already in @openzeppelin/contracts 5.0.0 | Accept stablecoin payments in Solidity | Standard interface already shipped in existing dependency; zero additional install. `transferFrom` is the canonical pull-payment pattern for ERC-20. |
| OpenZeppelin SafeERC20 | already in @openzeppelin/contracts 5.0.0 | Safe wrapper around IERC20 calls | Handles non-standard ERC-20 return values (some stablecoin implementations don't return `bool`). Required defensive practice. |
| Polkadot XCM Precompile | built-in at `0x00000000000000000000000000000000000a0000` | Send/execute XCM messages from Solidity | Only XCM interface available natively to EVM contracts on Polkadot Hub. No library install needed — call via Solidity interface. |
| Deployed mock ERC-20 stablecoin (self-deploy) | any OpenZeppelin ERC20 | Testnet "USDC" stand-in | No canonical USDC/USDT ERC-20 contract exists on the specific Polkadot Hub Testnet (Chain ID 420420417). Must deploy a mock. See Stablecoin Strategy below. |

### Supporting Libraries (No New npm Installs Required)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@openzeppelin/contracts` IERC20 | 5.0.0 (already installed) | Stablecoin interface in Solidity | Import into DucketTickets.sol to receive ERC-20 payments |
| `@openzeppelin/contracts` SafeERC20 | 5.0.0 (already installed) | Safely call `transfer`/`transferFrom` | Wrap every outbound ERC-20 call; stablecoins from some issuers don't revert on failure |
| viem `readContract` / `writeContract` | 2.9.0 (already installed) | Frontend calls to stablecoin ERC-20 | Check allowance, trigger `approve`, then trigger ticket purchase in one UX flow |
| wagmi `useReadContract` / `useWriteContract` | 2.5.0 (already installed) | React hooks for allowance and approval state | Drive the approve-then-buy UI pattern |

### Development Tools (No Changes Needed)

| Tool | Purpose | Notes |
|------|---------|-------|
| Hardhat 2.22.0 | Deploy mock stablecoin + updated DucketTickets | Existing config targets Chain ID 420420417 — no new network setup needed |
| Hardhat Ignition or deploy scripts | Deploy MockUSDC.sol to testnet | A simple 30-line Hardhat deploy script is sufficient for a mock |

---

## Stablecoin Strategy on Polkadot Hub Testnet

**Finding:** USDC and USDT exist on Polkadot Asset Hub as **native substrate assets** (asset IDs 1337 and 1984 respectively), NOT as ERC-20 contracts at a stable Ethereum address. The EVM layer on Polkadot Hub (pallet_revive / REVM) emulates ERC-20 interfaces for substrate assets via precompiles, but specific precompile addresses for USDC/USDT on the testnet (Chain ID 420420417) are NOT documented publicly.

**Confidence:** LOW that a canonical ERC-20 USDC/USDT address exists on this specific testnet.

**Recommended approach:** Deploy a `MockUSDC.sol` ERC-20 to the testnet. This is standard hackathon practice and perfectly valid for the EVM Track demo. Name it "USDC (Mock)" with symbol "USDC", 6 decimals to match real USDC behavior.

```solidity
// contracts/contracts/MockUSDC.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    uint8 private _decimals = 6;

    constructor() ERC20("USD Coin (Mock)", "USDC") {
        // Mint 1,000,000 USDC to deployer for seeding
        _mint(msg.sender, 1_000_000 * 10 ** 6);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    // Faucet for testnet users
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
```

**What NOT to do:** Do not hardcode an assumed ERC-20 address for USDC/USDT on this testnet — the address doesn't exist as a plain ERC-20 and the contract will silently fail.

---

## ERC-20 Payment Pattern in Solidity

Standard pull-payment flow. No new primitives needed — this is vanilla Solidity ERC-20 interaction.

**In DucketTickets.sol:**

```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DucketTickets is ... {
    using SafeERC20 for IERC20;

    address public paymentToken;   // address of MockUSDC (or real stablecoin)

    function setPaymentToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        paymentToken = token;
    }

    function purchaseTicket(uint256 tokenId, uint256 ticketNumber) external nonReentrant {
        TicketTier storage tier = ticketTiers[tokenId];
        uint256 price = tier.price; // already in token units (6 decimals for USDC)

        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), price);

        // split fees: platform + organizer
        uint256 fee = (price * platformFee) / 10000;
        IERC20(paymentToken).safeTransfer(platformWallet, fee);
        IERC20(paymentToken).safeTransfer(events[tier.eventId].organizer, price - fee);

        _mint(msg.sender, tokenId, 1, "");
        // ... emit events, track purchases
    }
}
```

**Frontend flow (wagmi/viem — no new libraries):**

1. `useReadContract` → `IERC20.allowance(userAddr, contractAddr)` — check if approval needed
2. `useWriteContract` → `IERC20.approve(contractAddr, amount)` — if allowance insufficient
3. `useWriteContract` → `DucketTickets.purchaseTicket(...)` — after approval confirmed
4. Two-transaction UX is expected; communicate it clearly in the UI

---

## XCM Precompile Interface

**Confirmed (HIGH confidence):** The XCM precompile is live on Polkadot Hub at a fixed address and is callable from Solidity contracts.

**Precompile address:** `0x00000000000000000000000000000000000a0000`

**IXcm Solidity interface:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IXcm {
    struct Weight {
        uint64 refTime;
        uint64 proofSize;
    }

    /// Execute a SCALE-encoded XCM message using the contract's origin.
    /// Call weighMessage first to get the Weight parameter.
    function xcmExecute(bytes calldata message, Weight calldata weight) external;

    /// Send a SCALE-encoded XCM message to a destination.
    /// Used for cross-chain scenarios (e.g., opening HRMP channels, remote execution).
    function xcmSend(bytes calldata destination, bytes calldata message) external;

    /// Estimate execution weight for a given SCALE-encoded XCM message.
    /// Use this before xcmExecute to fill the weight parameter.
    function weighMessage(bytes calldata message) external view returns (Weight memory weight);
}
```

**Usage pattern for "light XCM" verification PoC:**

```solidity
IXcm constant XCM = IXcm(0x00000000000000000000000000000000000a0000);

function emitXcmVerification(uint256 tokenId, address holder) external {
    // Build a simple XCM message that emits a cross-chain notification.
    // For hackathon PoC: use xcmExecute with a ClearOrigin + SetTopic message
    // to demonstrate the plumbing works on-chain.
    bytes memory message = _buildVerificationXcm(tokenId, holder);
    IXcm.Weight memory weight = XCM.weighMessage(message);
    XCM.xcmExecute(message, weight);
}
```

**Important constraints:**
- XCM messages must be SCALE-encoded. Polkadot uses SCALE, not ABI encoding. You cannot construct a valid XCM message with Solidity string concatenation alone.
- For a hackathon PoC, the realistic scope is: emit an on-chain event AND call `xcmExecute` to prove the integration works, even if the cross-chain destination is minimal (e.g., local execution).
- Full cross-chain ticket transfer (sending XCM to another parachain to verify ownership there) is explicitly out of scope per PROJECT.md.

**SCALE encoding options (frontend/scripts):**
- `@polkadot/api` encodes XCM messages natively for scripts/testing.
- Pre-encode the XCM bytes off-chain, pass as `bytes calldata` to the contract.

---

## Installation

No new packages are required for the Solidity layer — IERC20, SafeERC20, and ERC20 are all in the existing `@openzeppelin/contracts 5.0.0`.

For frontend XCM message construction in scripts/tests:

```bash
# In /contracts
npm install @polkadot/api

# Only needed if building XCM messages off-chain (for scripts or testing)
# Not needed in the frontend bundle
```

For frontend allowance/approval UI:

```bash
# No install needed — wagmi 2.5.0 and viem 2.9.0 already handle ERC-20 reads/writes
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Deploy MockUSDC | Try to use native substrate USDC asset ID via ERC-20 precompile | Only viable if you can confirm the exact precompile address for testnet asset 1337 — currently undocumented for this specific testnet |
| `SafeERC20.safeTransferFrom` | raw `IERC20.transferFrom` | Never — some stablecoins (notably USDT on Ethereum mainnet) don't return `bool`, causing silent failures |
| xcmExecute with pre-encoded bytes | XTransfers library | XTransfers is still under development (September 2025 update mentions "continued work") — not stable for production or hackathon use |
| `@polkadot/api` for SCALE encoding | custom SCALE encoder | `@polkadot/api` is the canonical encoder, used throughout the Polkadot ecosystem |
| wagmi hooks for approve+buy flow | ethers.js | viem/wagmi is already in the stack; no reason to add ethers.js |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| XTransfers library | Marked as "continued work" in September 2025 Parity update — no stable release, incomplete API | Raw IXcm precompile calls |
| Hardcoded USDC/USDT ERC-20 address on testnet | No canonical ERC-20 address for these assets exists on Chain ID 420420417 — will silently fail | Deploy MockUSDC.sol |
| DOT (native currency) as payment token | Price volatility defeats stablecoin value prop; also requires `payable` functions and different fee logic | ERC-20 USDC mock |
| ethers.js | Already have viem 2.9.0; adding ethers.js creates two competing abstractions | viem + wagmi (already in stack) |
| `xcmSend` for basic PoC | Requires valid HRMP channels to be open to destination parachain — much harder to demo | `xcmExecute` for local execution PoC |
| Raw `IERC20.transfer` / `.transferFrom` | Non-standard stablecoins silently return `false` instead of reverting | `SafeERC20.safeTransfer` / `safeTransferFrom` |

---

## Stack Patterns by Variant

**If testnet has confirmed ERC-20 precompile for USDC (asset ID 1337):**
- Use the precompile address directly instead of MockUSDC
- Interface is identical (IERC20-compatible), so no Solidity changes needed beyond swapping the address

**If full XCM cross-chain verification is required (not current scope):**
- Use `xcmSend` with a properly constructed `VersionedXcm` message targeting Westend Hub
- Requires HRMP channel to be open — infrastructure work outside contract scope
- `@polkadot/api` v10+ handles encoding; use `createType('XcmVersionedXcm', ...)` pattern

**If DucketTickets.sol is redeployed (expected for stablecoin changes):**
- Keep constructor signature unchanged except add `address _paymentToken` param
- Update deploy.ts and `.env` with `PAYMENT_TOKEN_ADDRESS`

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@openzeppelin/contracts` 5.0.0 | Solidity 0.8.24 | IERC20, SafeERC20, ERC20 all compile clean on 0.8.24 |
| wagmi 2.5.0 | viem 2.9.0 | Peer dependency; already compatible in current stack |
| `@polkadot/api` (scripts only) | Node.js, not browser | Import in Hardhat scripts only — do NOT bundle into Vite frontend (too large) |
| IXcm precompile | Polkadot Hub Testnet Chain ID 420420417 | Precompile is live on testnet; confirmed via PolkaWorld announcement (July 2025) |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| IERC20/SafeERC20 payment pattern | HIGH | Standard Solidity ERC-20 pattern; works identically on Polkadot Hub EVM as on Ethereum |
| MockUSDC strategy | HIGH | OpenZeppelin ERC20 deploys fine on Polkadot Hub (confirmed by tutorial at docs.polkadot.com) |
| XCM precompile address | HIGH | `0x00000000000000000000000000000000000a0000` confirmed in official docs and community sources |
| IXcm function signatures | MEDIUM-HIGH | Confirmed from multiple sources (docs.polkadot.com XCM precompile page, OneBlock+ technical overview, PolkaWorld announcement) |
| Native USDC/USDT ERC-20 on this testnet | LOW | Docs confirm asset IDs on Asset Hub but specific ERC-20 precompile addresses for testnet 420420417 are undocumented — verify with block explorer before relying on it |
| SCALE-encoded XCM message construction | MEDIUM | `@polkadot/api` is the standard tool; exact message structure for PoC needs to be tested against testnet |

---

## Sources

- [Interact with the XCM Precompile — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/precompiles/xcm/) — precompile address, IXcm interface, function signatures
- [Advanced Functionalities via Precompiles — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/precompiles/) — precompile list for Polkadot Hub
- [Deploy an ERC-20 to Polkadot Hub — Polkadot Developer Docs](https://docs.polkadot.com/tutorials/smart-contracts/deploy-erc20/) — confirms OpenZeppelin ERC20 deploys on Hub testnet
- [Polkadot Hub Assets — Polkadot Developer Docs](https://docs.polkadot.com/reference/polkadot-hub/assets/) — asset IDs for USDT (1984) and USDC (1337)
- [ERC20 & XCM Precompiles: A Technical Overview — OneBlock+ Medium](https://medium.com/@OneBlockplus/erc20-xcm-precompiles-a-technical-overview-205392b4a7bd) — IXcm interface breakdown (LOW confidence, unverified secondary source)
- [PolkaWorld — XCM precompile on Polkadot testnet announcement](https://x.com/polkaworld_org/status/1950278403367809377) — confirms precompile live on testnet (July 2025)
- [Build on Polkadot: September 2025 Product Engineering Update — Parity](https://www.parity.io/blog/build-on-polkadot-september-2025-product-engineering-update) — XTransfers library still in development (reason to avoid it)
- [USDC for Polkadot — Circle](https://www.circle.com/multi-chain-usdc/polkadot) — confirms Circle USDC on Asset Hub (substrate native asset, not ERC-20 at stable address)
- [Crypto.com USDT/USDC on Polkadot Asset Hub — October 2025](https://bitcoinethereumnews.com/crypto/crypto-com-launches-usdt-usdc-deposits-and-withdrawals-on-polkadot-asset-hub/) — confirms asset IDs, not ERC-20 addresses

---

*Stack research for: Stablecoin payments + light XCM on Polkadot Hub EVM*
*Researched: 2026-03-15*
