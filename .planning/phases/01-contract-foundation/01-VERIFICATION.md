---
phase: 01-contract-foundation
verified: 2026-03-15T12:30:00Z
status: gaps_found
score: 4/5 success criteria verified
re_verification: false
gaps:
  - truth: "Redeployed contract address is in .env and frontend connects without errors"
    status: failed
    reason: "frontend/src/lib/contract.ts is not imported by any page or component. Home.tsx reads from MOCK_EVENTS (mockData.ts). The ABI and contract addresses exist as exports but are orphaned — the frontend does not connect to the deployed contract."
    artifacts:
      - path: "frontend/src/lib/contract.ts"
        issue: "Exported but never imported — DUCKET_ABI, MOCK_USDC_ABI, CONTRACT_ADDRESS, MOCK_USDC_ADDRESS are all orphaned exports with zero consumers in the frontend"
      - path: "frontend/src/pages/Home.tsx"
        issue: "Imports MOCK_EVENTS from mockData.ts, not from contract reads. Real on-chain events are not shown."
      - path: "frontend/src/vite-env.d.ts"
        issue: "Only declares VITE_CONTRACT_ADDRESS; VITE_MOCK_USDC_ADDRESS is missing from the type declaration (minor — does not block runtime but is inconsistent)"
    missing:
      - "At least one page or hook must import CONTRACT_ADDRESS and DUCKET_ABI from contract.ts and make a real eth_call to confirm no ABI decode errors"
      - "Home.tsx (or a data hook) must read events from the on-chain contract instead of MOCK_EVENTS — or there must be a clear mechanism wiring contract.ts reads to the UI"
human_verification:
  - test: "Open the frontend in a browser pointed at Polkadot Hub Testnet and inspect browser console"
    expected: "No ABI decode errors, no 'call revert exception' errors. Home page displays 6 seeded events loaded from the contract (or clearly shows testnet data, not mock data)."
    why_human: "Cannot verify browser console errors or live contract reads programmatically. The current code uses mockData.ts, so this test is currently expected to FAIL (showing mock data, not on-chain data) — which is the root of the gap."
  - test: "Call MockUSDC faucet() from a fresh wallet on Polkadot Hub Testnet using the deployed address 0x49f628eDeFaB3507B57C71A77593966bCE550065"
    expected: "Transaction succeeds and wallet receives USDC (up to 10,000)"
    why_human: "Requires live testnet interaction to confirm the deployed contract is live and callable"
---

# Phase 1: Contract Foundation Verification Report

**Phase Goal:** The on-chain infrastructure supports stablecoin payments and is live on testnet with real seed data
**Verified:** 2026-03-15T12:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Phase Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | MockUSDC contract is deployed on Polkadot Hub Testnet and any wallet can mint test tokens | VERIFIED | Address 0x49f628eDeFaB3507B57C71A77593966bCE550065 in contracts/.env and frontend/.env. MockUSDC.sol has `faucet()` with 10k cap. 7/7 unit tests pass including faucet revert and multi-user tests. |
| 2 | DucketTickets accepts USDC payment via `mintTicketWithToken()` (approve+transferFrom pattern) | VERIFIED | DucketTickets.sol line 351-393: `mintTicketWithToken` is nonReentrant, pulls via `IERC20(paymentToken).safeTransferFrom`, mints ERC1155, distributes fee. 6/6 CONT-02 unit tests pass. |
| 3 | Each TicketTier has a `stablePrice` field populated with a 6-decimal USDC amount | VERIFIED | TicketTier struct (line 41-50) has `stablePrice` field. deploy.ts seeds all 12 tiers with `ethers.parseUnits(tier.stablePrice, 6)`. 2/2 CONT-03 unit tests pass. |
| 4 | Native DOT payment path still works alongside the new USDC path | VERIFIED | `mintTicket` (line 177) is unchanged with `payable` + MINTER_ROLE. 2/2 CONT-05 dual-path tests pass confirming both paths coexist. |
| 5 | Redeployed contract address is in `.env` and frontend connects without errors | FAILED | .env files have correct non-zero addresses. However `frontend/src/lib/contract.ts` is not imported by any frontend file. Home.tsx reads from `MOCK_EVENTS` (mockData.ts). The frontend does not connect to the deployed contract. |

**Score:** 4/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `contracts/contracts/MockUSDC.sol` | ERC-20 mock with 6 decimals and faucet | VERIFIED | 19 lines. `function faucet` present. `decimals()` returns 6. Constructor mints 1M to deployer. |
| `contracts/test/MockUSDC.test.ts` | 7 unit tests | VERIFIED | 57 lines. All 7 test cases present. All pass. |
| `contracts/contracts/DucketTickets.sol` | Contains `mintTicketWithToken` | VERIFIED | 473 lines. `mintTicketWithToken` at line 351. `buyResaleTicketWithToken` at line 400. `stablePrice` in TicketTier struct. SafeERC20 imported and used. |
| `contracts/contracts/DucketTickets.sol` | Contains `buyResaleTicketWithToken` | VERIFIED | Present at line 400. Uses `safeTransferFrom` pull-payment and transfers ERC1155. |
| `contracts/test/DucketTickets.test.ts` | 100+ lines, stablecoin tests | VERIFIED | 333 lines. 17 test cases covering CONT-02/03/04/05. All pass. |
| `contracts/scripts/deploy.ts` | Deploys MockUSDC + seeds with stablePrice | VERIFIED | MockUSDC deployed first (line 98). `setPaymentToken` called (line 114). All 12 tiers seeded with `ethers.parseUnits(tier.stablePrice, 6)`. |
| `frontend/src/lib/contract.ts` | ABI with stablePrice + MOCK_USDC_ABI | VERIFIED (file) / ORPHANED (wiring) | File exists with correct ABI matching V1 contract. `stablePrice` present in ticketTiers output. `mintTicketWithToken` and `buyResaleTicketWithToken` present. `MOCK_USDC_ABI` and `MOCK_USDC_ADDRESS` exported. BUT: not imported by any other file. |
| `contracts/.env` | CONTRACT_ADDRESS and MOCK_USDC_ADDRESS set | VERIFIED | CONTRACT_ADDRESS=0x930ED5cd4DBecF02010942316C75708686e077b6, MOCK_USDC_ADDRESS=0x49f628eDeFaB3507B57C71A77593966bCE550065 |
| `frontend/.env` | VITE_CONTRACT_ADDRESS and VITE_MOCK_USDC_ADDRESS set | VERIFIED | Both non-zero addresses present. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `contracts/test/MockUSDC.test.ts` | `contracts/contracts/MockUSDC.sol` | `getContractFactory('MockUSDC')` | WIRED | Line 14: `ethers.getContractFactory("MockUSDC")`. Pattern present. |
| `contracts/contracts/DucketTickets.sol` | SafeERC20 | `using SafeERC20 for IERC20` | WIRED | Line 10: import SafeERC20. Line 19: `using SafeERC20 for IERC20`. `safeTransferFrom` called at lines 372, 413. |
| `contracts/contracts/DucketTickets.sol` | paymentToken state var | `IERC20(paymentToken).safeTransferFrom` | WIRED | `paymentToken` declared at line 75. `safeTransferFrom` calls at lines 372 and 413 use it. |
| `contracts/scripts/deploy.ts` | `contracts/contracts/MockUSDC.sol` | `getContractFactory('MockUSDC')` | WIRED | Line 98: `ethers.getContractFactory("MockUSDC")`. |
| `frontend/src/lib/contract.ts` | `contracts/contracts/DucketTickets.sol` | ABI must match deployed contract | PARTIAL | ABI contains correct fields (mintTicketWithToken, stablePrice, buyResaleTicketWithToken). But contract.ts is never imported in any page/component — the link to the UI is NOT_WIRED. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| CONT-01 | 01-01 | Deploy MockUSDC ERC-20 (6 decimals, public mint) on Polkadot Hub Testnet | SATISFIED | MockUSDC.sol deployed. faucet() tested. Address in .env. 7/7 unit tests pass. |
| CONT-02 | 01-02 | Add `mintTicketWithToken()` accepting ERC-20 via approve+transferFrom | SATISFIED | Function present in DucketTickets.sol line 351. SafeERC20 safeTransferFrom used. 6 tests verify behavior. |
| CONT-03 | 01-02 | Add `stablePrice` field to TicketTier struct | SATISFIED | Field present in struct at line 46. Stored in createTicketTier. Tests confirm storage and retrieval. |
| CONT-04 | 01-02 | Add `buyResaleTicketWithToken()` for stablecoin resale | SATISFIED | Function present at line 400. isStablecoin check at line 406. 4 tests verify behavior including revert and fee distribution. |
| CONT-05 | 01-02 | Support dual payment — both native DOT and stablecoin paths coexist | SATISFIED | mintTicket (payable, MINTER_ROLE) unchanged. mintTicketWithToken (nonpayable, no role). 2 tests confirm coexistence. |
| CONT-06 | 01-03 | Redeploy DucketTickets with stablecoin support and seed events on testnet | PARTIAL | Contracts deployed with correct addresses in .env. Seed data confirmed in SUMMARY. But frontend does not connect to contract — contract.ts is orphaned. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `frontend/src/pages/Home.tsx` | 6, 110 | Imports and uses `MOCK_EVENTS` from mockData.ts instead of on-chain contract reads | Blocker | Home page shows static mock data, not live testnet events. Goal criterion 5 fails. |
| `frontend/src/pages/MyTickets.tsx` | 12 | Comment: "In production, this would be fetched from the contract" | Warning | Confirms frontend is not yet reading from contract. (Phase 2 concern, but relevant here for goal 5.) |
| `frontend/src/vite-env.d.ts` | 4 | Missing `VITE_MOCK_USDC_ADDRESS` type declaration | Info | TypeScript will not type-check `import.meta.env.VITE_MOCK_USDC_ADDRESS` — could surface as `any` in strict mode. |

### Human Verification Required

#### 1. Live testnet contract reachability

**Test:** Call `faucet(1000000000)` on MockUSDC at 0x49f628eDeFaB3507B57C71A77593966bCE550065 from a fresh wallet on Polkadot Hub Testnet (Chain ID 420420417)
**Expected:** Transaction confirms and wallet receives 1,000 USDC
**Why human:** Requires live testnet interaction; cannot verify programmatically that the deployed bytecode is reachable

#### 2. Frontend console — no ABI errors (currently expected to fail)

**Test:** Run `cd frontend && npm run dev`, open http://localhost:5173 in a browser connected to Polkadot Hub Testnet
**Expected:** Home page loads. Currently will show MOCK_EVENTS (mock data), not real contract events. Browser console may show no errors but data is not on-chain.
**Why human:** The frontend currently does not call the contract at all — so there are no ABI decode errors because no calls are made. This is the "connects without errors" claim in the SUMMARY, but it is misleading: silence is not connection.

### Gaps Summary

**One gap blocks the phase goal.** The phase goal states "the frontend connects without errors" — this requires that the frontend actually attempts to connect to the deployed contract. Currently, `frontend/src/lib/contract.ts` is entirely orphaned: it exports `DUCKET_ABI`, `CONTRACT_ADDRESS`, `MOCK_USDC_ABI`, and `MOCK_USDC_ADDRESS` but no page, component, or hook imports these exports. Home.tsx displays `MOCK_EVENTS` from a static mock data file. The frontend UI is not wired to the on-chain data.

This is distinct from Phase 2 requirements (FEND-01: Replace mock event data with real contract reads) — the CONT-06 success criterion explicitly requires "frontend connects without errors," implying at minimum that the contract addresses resolve and no wiring errors exist. The current state goes further: there is no connection attempt at all, so "connects without errors" cannot be verified.

The four contracts-side success criteria (CONT-01 through CONT-05) are fully satisfied. 24/24 unit tests pass. Deployment addresses are correctly configured in both .env files. The on-chain infrastructure itself is complete and correct.

---

_Verified: 2026-03-15T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
