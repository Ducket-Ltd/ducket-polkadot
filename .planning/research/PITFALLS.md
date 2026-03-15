# Pitfalls Research

**Domain:** Polkadot Hub EVM — ERC1155 ticketing dApp with stablecoin payments and XCM
**Researched:** 2026-03-15
**Confidence:** MEDIUM (Polkadot Hub EVM is relatively new; official docs verified key claims, some specifics are LOW confidence)

---

## Critical Pitfalls

### Pitfall 1: Native Currency is DOT/PAS, Not ETH — msg.value Payments Break for Stablecoin Track

**What goes wrong:**
The existing `mintTicket` function accepts `msg.value` (native token) for payment. When adding stablecoin support, developers assume they can just accept IERC20 tokens alongside native currency — but they forget to update the full payment distribution path. The result is a contract that mixes `msg.value` checks with ERC-20 `transferFrom`, causing the native-currency path to silently succeed while the stablecoin path reverts, or vice versa.

Specifically: `DucketTickets.sol` lines 187, 206-217 all use `msg.value` and `.call{value:...}`. Adding stablecoin support requires a parallel code path — callers must send `msg.value = 0` when paying with ERC-20, and the contract must enforce this. Failing to add `require(msg.value == 0, "Use ERC20 payment")` on the ERC-20 path means users can accidentally send native token AND approve ERC-20, with the contract taking both.

**Why it happens:**
Developers copy the existing `mintTicket` function and add an ERC-20 token address parameter without auditing every `msg.value` reference in the payment distribution block.

**How to avoid:**
Create a separate function `mintTicketWithToken(uint256 tokenId, uint256 quantity, address paymentToken)` that:
1. Requires `msg.value == 0` at the top
2. Calls `IERC20(paymentToken).transferFrom(msg.sender, address(this), totalPrice)`
3. Then distributes from the contract balance via `IERC20(paymentToken).transfer(...)` — never `.call{value:...}`
4. Keep original `mintTicket` for native currency — do not modify it

Use OpenZeppelin `SafeERC20.safeTransferFrom` instead of raw `transferFrom` to handle non-standard ERC-20s that return false instead of reverting.

**Warning signs:**
- Any function that has both an ERC-20 token parameter and a `require(msg.value >= ...)` check
- Mixing `.call{value:...}` and `IERC20.transfer` in the same payment distribution block
- No `require(msg.value == 0)` guard on stablecoin entry points

**Phase to address:**
Contract modification phase (stablecoin payment addition). Must be resolved before any frontend wiring.

---

### Pitfall 2: Stablecoin ERC-20 Approval Not Included in Demo Flow

**What goes wrong:**
The demo flow goes: connect wallet → pick ticket → click buy → transaction fails. The audience sees a failed transaction. The reason: ERC-20 stablecoin payments require an `approve()` call _before_ the purchase transaction. The frontend never calls `approve`, so `transferFrom` reverts with "ERC20: insufficient allowance".

This is the single most common live demo failure for stablecoin dApps.

**Why it happens:**
Developers focus on the `mintTicketWithToken` call and forget the two-step ERC-20 flow. The approval step is invisible in testing if the developer manually approves via Hardhat scripts and then tests the frontend.

**How to avoid:**
The purchase flow in the frontend must be:
1. Check current allowance: `token.allowance(userAddress, contractAddress)`
2. If `allowance < price`: send `approve(contractAddress, price)` transaction first — show "Approving stablecoin..." in UI
3. Wait for approval confirmation
4. Then send `mintTicketWithToken(...)` transaction — show "Purchasing ticket..."

Use wagmi's `useWriteContract` for both steps, gated sequentially. Do not combine into a single UX step that silently skips approval if allowance is sufficient — make it explicit during the demo.

**Warning signs:**
- Purchase flow only calls one contract function (no approve step visible in code)
- Testing was done with a pre-approved wallet
- `allowance` is never read in the frontend

**Phase to address:**
Frontend contract integration phase — wiring up real purchase calls.

---

### Pitfall 3: Contract Redeployment Orphans Existing Seed Data

**What goes wrong:**
The contract is already deployed at a specific address on Polkadot Hub Testnet with seed events. Any contract modification (adding stablecoin support) requires redeployment. After redeployment: the contract address changes, all seed events are gone, the frontend's `VITE_CONTRACT_ADDRESS` points to the old dead contract, and every transaction silently goes to address zero (because `contract.ts` line 2 defaults to `0x000...`).

This kills the demo — event list is empty, purchases revert, judges see a broken app.

**Why it happens:**
Developers modify the contract, run `npx hardhat deploy`, and forget to:
1. Update `VITE_CONTRACT_ADDRESS` in `.env`
2. Re-run the seed script to populate events
3. Rebuild the frontend with the new env var

**How to avoid:**
Create a single redeployment checklist script or Makefile target:
```bash
# deploy-and-seed.sh
npx hardhat run scripts/deploy.ts --network polkadot-hub-testnet
# capture new address
npx hardhat run scripts/seed.ts --network polkadot-hub-testnet
# prompt to update .env with new CONTRACT_ADDRESS
echo "Update VITE_CONTRACT_ADDRESS in frontend/.env"
```
Add validation in `contract.ts` to throw at startup if address is zero (already noted in CONCERNS.md).

**Warning signs:**
- `VITE_CONTRACT_ADDRESS` in `.env` not updated after running deploy
- Home page shows empty event list after a contract change
- No seed script run after deploy

**Phase to address:**
Any contract modification phase. Put this check in the Definition of Done for every contract deploy task.

---

### Pitfall 4: XCM Precompile at Wrong Address or Wrong Multilocation Encoding

**What goes wrong:**
The XCM precompile lives at `0x00000000000000000000000000000000000a0000` on Polkadot Hub. Using any other address causes every XCM call to silently revert or call the wrong contract. Additionally, the `Multilocation` struct used in the Solidity interface has a specific encoding format — `bytes[]` interior junctions — that differs from how most XCM documentation describes multilocations in SCALE encoding. Passing a raw Substrate AccountId32 directly as a `bytes` interior item causes malformed XCM that either gets dropped or results in unexpected behavior on the receiving parachain.

**Why it happens:**
Developers copy XCM examples from Moonbeam docs (which use a different precompile address) or from Substrate/Rust XCM documentation (which uses SCALE-encoded formats, not Solidity ABI encoding). Neither works directly on Polkadot Hub.

**How to avoid:**
- Pin the XCM precompile address from the official Polkadot Hub docs: `0x00000000000000000000000000000000000a0000`
- Use the exact `Multilocation` struct format from `docs.polkadot.com/smart-contracts/precompiles/xcm/`
- For cross-chain ticket verification (the light XCM use case), use `xcmExecute` with a simple `QueryResponse` or `Transact` instruction rather than a full multi-hop transfer
- Test on testnet first — incorrect XCM messages can result in permanent loss of funds on mainnet

**Warning signs:**
- Copying Multilocation examples from Moonbeam or Astar docs without adapting to Polkadot Hub format
- XCM call returns success (no revert) but the cross-chain effect never happens
- Using hardcoded precompile addresses without verifying against current Polkadot Hub docs

**Phase to address:**
XCM integration phase. Keep XCM scope minimal — a read/verification proof-of-concept, not a full asset transfer. This limits blast radius if encoding is wrong.

---

### Pitfall 5: Hackathon Disqualification — Code Similarity Threshold

**What goes wrong:**
The judging rules state that projects with more than 70% codebase similarity to an open-source repository will be immediately disqualified. Ducket is a port of `../ducket-web`. If the judge compares this repo to the parent, similarity may exceed 70% for shared files (contract structure, UI components, mock data patterns).

**Why it happens:**
Teams adapt existing codebases without adequately differentiating what they submit. The key word is "contribute during the hackathon" — only code contributed during the hackathon window counts toward the evaluation. Pre-existing code doesn't count as a contribution.

**How to avoid:**
- Document clearly in the README and submission: which components are pre-existing scaffolding vs. what was built during the hackathon
- The new contributions (stablecoin payment integration, XCM verification, Polkadot Hub-specific config, real contract wiring replacing mocks) are what get evaluated
- Frame the submission around the delta: "We ported Ducket to Polkadot Hub AND added stablecoin + XCM features during the hackathon"
- Include a CHANGELOG or "What we built" section in the submission notes listing every new function, component, and integration added during the hackathon period

**Warning signs:**
- README doesn't mention what was pre-existing vs. built during hackathon
- Submission description just describes the overall app without calling out new contributions
- No git commit history showing active development during the hackathon window

**Phase to address:**
Submission/demo preparation phase (last day before March 20 deadline).

---

### Pitfall 6: On-Chain Identity Not Set Up — Disqualified From Prize Distribution

**What goes wrong:**
The winning team cannot receive prizes because they haven't set up a Polkadot wallet with on-chain identity. This is a stated hard requirement: "To receive hackathon rewards, you must set up a Polkadot wallet with an on-chain identity." This is separate from the EVM wallet used for development.

**Why it happens:**
Developers focus entirely on building and testing. Setting up a Substrate/Polkadot wallet identity is a different UX from MetaMask/EVM. Teams assume their MetaMask address is sufficient.

**How to avoid:**
Set up on-chain identity now, not after submission:
1. Get a Polkadot.js extension wallet or Talisman wallet
2. Fund with small DOT amount (identity deposit required)
3. Set identity fields (display name, email, Twitter/X)
4. Submit identity to registrar for verification

This cannot be done in 5 minutes on demo day — identity verification takes time on-chain.

**Warning signs:**
- No Polkadot.js or Talisman wallet installed
- Team only using MetaMask for EVM development
- Not checked the DoraHacks submission form for identity requirement

**Phase to address:**
Day 1 of the hackathon plan — parallel with any dev work, takes under 1 hour but must be done early.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `msg.value` payment path alongside ERC-20 | Avoid rewriting mintTicket | Dual payment paths, risk of ETH+ERC20 double payment | MVP only — document clearly, remove before mainnet |
| Use `IERC20.transferFrom` without `SafeERC20` | Simpler code | Non-standard ERC-20s (USDT on some chains) return false instead of reverting; tokens silently not transferred | Never — use `SafeERC20.safeTransferFrom` always |
| Hardcode stablecoin token address in contract | No config needed | Contract locked to one stablecoin; can't support multiple | Acceptable for hackathon MVP if address is configurable via constructor |
| Skip XCM weight estimation; use fixed gas | Faster implementation | XCM message may run out of weight and be dropped silently | Only if weight buffer is generously over-estimated (2-3x expected) |
| Mock data in MyTickets.tsx while wiring other pages | Faster parallel dev | Page appears functional in review but empty in live demo | Never for demo day — will be caught during judges' live walkthrough |
| `.call{value:...}` for ETH transfers (current pattern) | Already implemented | Reentrancy risk even with ReentrancyGuard if call order is wrong | Acceptable with ReentrancyGuard AND checks-effects-interactions — verify order is correct |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| wagmi + Polkadot Hub Testnet | Using the default Ethereum chain config | Define custom chain: `id: 420420417`, `name: 'Polkadot Hub TestNet'`, `rpcUrls: { default: { http: ['https://services.polkadothub-rpc.com/testnet'] } }` |
| ERC-20 stablecoin payments | Calling `mintTicketWithToken` without prior `approve` | Frontend must check `allowance`, call `approve` first, wait for confirmation, then call purchase |
| XCM precompile | Copying Moonbeam XCM precompile address (0x0000...0800) | Polkadot Hub XCM precompile is `0x00000000000000000000000000000000000a0000` — verify from official docs |
| VITE_CONTRACT_ADDRESS env var | Zero-address default causes silent failures | Add `isAddress()` validation from viem at app startup; throw if address is zero |
| `wagmi useReadContract` for ticket data | No `staleTime` configured — refetches on every render | Set `staleTime: 30_000` for resale listings, `staleTime: 300_000` for event data |
| ERC-1155 `balanceOf` for ticket ownership | Checking `balanceOf(user, tokenId) > 0` doesn't distinguish tickets | On Polkadot Hub EVM, `balanceOf` works identically to Ethereum — this is fine, but UI must map tokenId to event tier correctly |
| MetaMask / wallet on Polkadot Hub Testnet | Network not added to MetaMask by default | User must add chain manually or app must call `wallet_addEthereumChain` with correct Chain ID 420420417 |
| DOT/PAS native currency decimals | Assuming 18 decimals for display (like ETH) | PAS on testnet uses 10 decimals — format displays with `formatUnits(value, 10)`, not `formatEther` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all events on every page navigation | Visible loading delay, RPC rate limiting on testnet | Cache with `@tanstack/react-query` (already installed) with `staleTime: 300_000` | Immediately on testnet with >5 events if judges navigate quickly |
| No pagination on event list | All events render at once; slow initial paint | Limit to 6-12 events on home page; add "load more" | At 20+ events — not a hackathon concern but affects polish |
| Fetching `getUserTicketsForEvent` in a loop | O(n) calls to RPC per user wallet | Batch with `useContractReads` (wagmi multicall) | With >3 events — visible lag in MyTickets page during demo |
| Re-rendering on every block | Ticker-like updates when not needed | Set explicit `watch: false` on wagmi hooks; only poll when user initiates action | Always — default wagmi behavior polls on each block |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Not checking `transferFrom` return value | USDT-like tokens return false on failure; ticket minted without payment received | Use `SafeERC20.safeTransferFrom` from OpenZeppelin — reverts on false return |
| Accepting both `msg.value` and ERC-20 in same function | Double payment: user sends ETH AND ERC-20 tokens | Stablecoin path must `require(msg.value == 0, "No ETH for ERC20 purchases")` |
| No minimum stablecoin amount validation | Zero-price tickets minted for free | Add `require(totalPrice > 0)` on stablecoin path |
| Contract address zero check missing | Silent failures on misconfigured deploy | Add `isAddress` and zero-check at app startup in `contract.ts` |
| XCM message with wrong Multilocation | Funds sent to wrong chain/address with no recovery | Test all XCM paths on testnet first; start with read-only XCM before write operations |
| `transfer` OR `resale` flag flaw (existing) | Transfer validation uses OR condition (CONCERNS.md line 46) | For hackathon: document this as known limitation; do not advertise transfer locking as a feature in demo |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No feedback during two-step ERC-20 approval + purchase | User clicks buy, sees two sequential MetaMask popups with no explanation, gets confused | Show step indicators: "Step 1/2: Approve stablecoin" → "Step 2/2: Purchase ticket" |
| MetaMask shows "Add Network" prompt with no context | Users abandon onboarding | Add `wallet_addEthereumChain` call with friendly name and block explorer URL; show instruction modal before connecting |
| Empty MyTickets page after real purchase | User buys a ticket, goes to My Tickets, sees nothing | MyTickets must read from contract `getUserTicketsForEvent` — mock array must be replaced before demo |
| Resale markup shows positive `+` even for below-original prices | Misleading price signal (bug in Resale.tsx line 79) | Fix calculation: `markup = ((listingPrice - originalPrice) / originalPrice) * 100`; only show `+` prefix when markup > 0 |
| Wallet connector silently fails if no connector found | Page appears to load but "Connect Wallet" does nothing | Add length check on connectors array; display "No wallet detected — install MetaMask" |
| PAS/DOT price displayed in ETH units (18 decimals) | Shows extremely small numbers (e.g., 0.000000001 DOT) | Use `formatUnits(value, 10)` for PAS on testnet; verify native currency decimals from chain config |

---

## "Looks Done But Isn't" Checklist

- [ ] **Stablecoin purchase**: Approval step implemented in frontend — verify by testing with a fresh wallet that has zero allowance
- [ ] **MyTickets page**: Shows real on-chain owned tickets — verify by purchasing a ticket and checking that it appears in My Tickets
- [ ] **Network switching**: App calls `wallet_addEthereumChain` for Polkadot Hub Testnet — verify with a fresh MetaMask installation
- [ ] **Contract address**: `VITE_CONTRACT_ADDRESS` set correctly after latest deploy — verify by logging the address at app startup and confirming it matches deployed contract
- [ ] **Seed events visible**: Run seed script after any contract redeployment — verify on Home page
- [ ] **Resale flow**: A ticket purchased with stablecoin can be listed for resale — verify end-to-end
- [ ] **XCM demo**: If XCM is included, the cross-chain call is live (not simulated with a mock) — verify on testnet before demo day
- [ ] **On-chain identity**: Polkadot wallet identity set up for prize distribution — verify with a `polkadot.js.org/apps` lookup
- [ ] **Submission notes**: README or DoraHacks submission clearly documents what was built during the hackathon vs. pre-existing — verify by re-reading it as a judge would
- [ ] **Demo video**: Recorded and uploaded before March 20 deadline — required even if presenting live on demo day

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Contract redeployed but frontend not updated | LOW | Update `VITE_CONTRACT_ADDRESS` in `.env`, rebuild frontend, re-run seed script |
| Stablecoin approval missing in demo | LOW | Add `approve` step to purchase flow in frontend — 1-2 hours of work |
| XCM call silently failing | MEDIUM | Fall back to simulated XCM (emit an event that represents the cross-chain signal, present as "XCM message sent") — acceptable for MVP framing |
| Wrong stablecoin address on testnet | LOW | Redeploy or update the accepted token address in contract constructor; re-seed |
| On-chain identity not set up by demo day | MEDIUM | Judges can verify identity at demo day; contact organizer immediately — grace period may be possible but is not guaranteed |
| Demo wallet has no testnet PAS for gas | LOW | Use Polkadot Hub testnet faucet before demo; keep 2 funded wallets ready |
| Hackathon similarity check triggered | HIGH | Document all new contributions explicitly in submission notes; appeal with git history showing hackathon-period commits |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Native currency vs. ERC-20 mixing in mintTicket | Contract modification (stablecoin addition) | Call `mintTicketWithToken` with `msg.value = 1` — must revert |
| Missing ERC-20 approval step in frontend | Frontend integration (purchase wiring) | Test purchase with fresh wallet that has zero stablecoin allowance |
| Contract redeployment orphans seed data | Every contract deploy | Home page shows expected seed events after deploy |
| XCM precompile address / Multilocation encoding | XCM integration | XCM call on testnet produces the expected cross-chain effect (or at minimum does not silently fail) |
| Hackathon code similarity disqualification | Submission preparation | Re-read submission as a judge; README clearly delineates new vs. existing code |
| On-chain identity missing | Day 1 setup (parallel, not dev work) | Check identity at `polkadot.js.org/apps` for the prize-receiving wallet |
| MyTickets shows empty mock data | Frontend integration (owned ticket display) | Purchase a ticket with the connected wallet; verify it appears in My Tickets immediately |
| Wrong native currency decimal formatting | Frontend integration | Displayed ticket price matches the value set in the contract (PAS uses 10 decimals on testnet) |
| Wallet network configuration for demo | Demo preparation | Test with a fresh MetaMask profile that has no custom networks added |
| Duplicate payment (ETH + ERC-20) | Contract modification (stablecoin addition) | Unit test: call stablecoin mintTicket with msg.value > 0; must revert |

---

## Sources

- [Polkadot Hub EVM vs PolkaVM — Polkadot Developer Docs](https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/)
- [Native EVM Contracts — Polkadot Developer Docs](https://docs.polkadot.com/develop/smart-contracts/evm/native-evm-contracts/)
- [Gas Model on Polkadot Hub — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/for-eth-devs/gas-model/)
- [XCM Precompile Interaction — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/precompiles/xcm/)
- [PolkaVM: Missing Opcodes and Workarounds — OpenGuild](https://openguild.wtf/blog/polkadot/polkavm-missing-opcodes-and-workarounds)
- [Polkadot Hub is Just Another EVM Chain — OpenGuild](https://openguild.wtf/blog/polkadot/polkadot-hub-is-another-evm-chain)
- [Accounts in Polkadot Hub Smart Contracts — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/for-eth-devs/accounts/)
- [ERC20 & XCM Precompiles Technical Overview — OneBlock+](https://medium.com/@OneBlockplus/erc20-xcm-precompiles-a-technical-overview-205392b4a7bd)
- [Polkadot Solidity Hackathon 2026 — DoraHacks Rules](https://dorahacks.io/hackathon/polkadot-solidity-hackathon/rules)
- [Polkadot Solidity Hackathon 2026 — Official Site](https://polkadothackathon.com/)
- [OpenGuild Hackathon Resources](https://build.openguild.wtf/hackathon-resources)
- [USDT & USDC enabled on Polkadot Asset Hub — October 2025](https://bitcoinethereumnews.com/tech/usdt-usdc-enabled-on-asset-hub/)
- [viem for Polkadot Hub — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/libraries/viem/)
- [Wagmi for Polkadot Hub — Polkadot Developer Docs](https://docs.polkadot.com/develop/smart-contracts/libraries/wagmi/)
- DucketTickets.sol codebase analysis (contracts/contracts/DucketTickets.sol)
- .planning/codebase/CONCERNS.md — known issues and fragile areas

---
*Pitfalls research for: Polkadot Hub EVM — Ducket ticketing dApp*
*Researched: 2026-03-15*
