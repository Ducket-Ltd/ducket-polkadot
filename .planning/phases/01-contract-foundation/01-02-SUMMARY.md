---
plan: 01-02
phase: 01-contract-foundation
status: complete
started: 2026-03-15
completed: 2026-03-15
tasks_completed: 2
tasks_total: 2
---

# Plan 01-02 Summary: DucketTickets Stablecoin Integration

## What Was Built

Extended DucketTickets.sol with full stablecoin payment support — dual payment paths (native DOT + USDC) coexisting in a single contract.

## Key Files

### Created
- `contracts/contracts/test/TestERC20.sol` — Minimal ERC-20 for test isolation (6 decimals)
- `contracts/test/DucketTickets.test.ts` — 17 test cases covering all stablecoin paths

### Modified
- `contracts/contracts/DucketTickets.sol` — Added stablePrice, mintTicketWithToken, buyResaleTicketWithToken, setPaymentToken, isStablecoin resale

## Changes Made

1. **TicketTier struct** — Added `stablePrice` field (6-decimal USDC amounts)
2. **mintTicketWithToken** — Public function (no MINTER_ROLE gate), pulls USDC via SafeERC20, mints ERC1155, distributes platform fee + organizer payment
3. **buyResaleTicketWithToken** — Stablecoin resale path, validates isStablecoin listing, distributes fee
4. **listForResale** — Extended with `isStablecoin` parameter for stablecoin-denominated listings
5. **setPaymentToken** — Admin function to set ERC-20 payment token address
6. **ResaleListing struct** — Added `isStablecoin` field

## Deviations

- Removed `require(msg.value == 0)` guard from mintTicketWithToken and buyResaleTicketWithToken — non-payable functions already reject ETH at the EVM level, making the explicit check cause a compilation error
- Test expects generic revert instead of custom "No ETH for ERC20 purchases" message for ETH rejection

## Test Results

17 passing (632ms) — all CONT-02, CONT-03, CONT-04, CONT-05 requirements verified

## Self-Check: PASSED
