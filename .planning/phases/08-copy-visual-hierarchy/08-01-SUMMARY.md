---
phase: 08-copy-visual-hierarchy
plan: "01"
subsystem: frontend-copy
tags: [copy, ux, polish, hackathon]
dependency_graph:
  requires: [07-02]
  provides: [08-02]
  affects: [Home.tsx, HowItWorks.tsx, Event.tsx, MyTickets.tsx, Resale.tsx, copy.ts]
tech_stack:
  added: []
  patterns: [outcome-first copy, COPY constants, lucide-react icon differentiation]
key_files:
  created: []
  modified:
    - frontend/src/constants/copy.ts
    - frontend/src/pages/Home.tsx
    - frontend/src/pages/HowItWorks.tsx
    - frontend/src/pages/Event.tsx
    - frontend/src/pages/MyTickets.tsx
    - frontend/src/pages/Resale.tsx
decisions:
  - "Kept 'Ticket Rules' heading — 'Ticket Details' would be less precise, 'Rules' signals constraints accurately"
  - "Left hero trust badges unchanged — they are concise technical labels (ERC-1155, On-Chain), not verbose buzzword copy"
  - "Resale.tsx how-it-works steps kept inline (not extracted to copy.ts) — short labels, no reuse need"
metrics:
  duration: "4 minutes"
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_modified: 6
---

# Phase 8 Plan 1: Copy Rewrite — Outcome-First Voice Summary

Rewrote all UI copy across 6 files to replace AI-template buzzwords ("Blockchain-Powered Ticketing", "Reimagined", "mathematically impossible") with confident, outcome-first language built around concrete verifiable claims.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Rewrite copy.ts constants and add new keys | 20260ca | frontend/src/constants/copy.ts |
| 2 | Rewrite inline strings across all 5 page components | a7fc86f | Home.tsx, HowItWorks.tsx, Event.tsx, MyTickets.tsx, Resale.tsx |

## What Changed

### copy.ts
- `HERO_HEADLINE`: "Blockchain-Powered Ticketing on" → "Event tickets at face value, on"
- `HERO_SUBHEADLINE`: Removed "DucketV2 smart contracts" and "Scalping is impossible" — replaced with concrete claim: resale prices capped by contract, deployed on Polkadot Hub testnet
- `MY_TICKETS.PAGE_SUBTITLE`: "NFT tickets owned by your connected wallet" → "Your tickets, stored in your wallet"
- `RESALE_PAGE.PAGE_SUBTITLE`: Removed "smart contract enforcement" mechanism language — leads with outcome
- `HOW_IT_WORKS_PAGE.PAGE_SUBTITLE`: Removed "No middlemen, no scalpers" pitch — replaced with direct description
- Added `MY_TICKETS.VERIFY_OWNERSHIP_LABEL: 'Verify Ownership'`

### Home.tsx
- Features section label: "Blockchain-Powered" → "How It Works"
- Features h2: "Ticketing, Reimagined" → "Why Ducket"
- Feature card 2: Removed "mathematically impossible" — "Resale Capped at 150% by Contract"
- Feature card 3 (ownership): Changed duplicate `Blocks` icon to `Wallet` for visual distinction
- All 4 card descriptions rewritten with concrete claims

### HowItWorks.tsx
- Step 3 description: Removed "DucketV2 smart contract" mention
- Step 4 description: Removed "NFT you fully control" — simplified to outcome
- Feature 1: "DucketV2 smart contract enforces" → contract-level description without brand name
- Feature 2: "First NFT Ticketing dApp on Polkadot Hub" → "On-Chain Ticketing on Polkadot Hub" (removes unverifiable superlative)

### Event.tsx
- Verified badge: Wired to `COPY.EVENT_PAGE.VERIFIED_BADGE` (removes inline "on-chain NFTs")

### MyTickets.tsx
- "Emit XCM Attestation" static label → `COPY.MY_TICKETS.VERIFY_OWNERSHIP_LABEL` ("Verify Ownership")
- XCM loading states untouched (state-conditional — plan constraint honored)

### Resale.tsx
- Step 2: "Smart contracts verify..." → concrete: USDC approval in wallet
- Step 3: "Ticket transfers instantly" → "atomically, in one transaction" — specific technical claim

## Non-Negotiable Signals Preserved

- "Live on Polkadot Hub" pill in hero (untouched)
- Anti-scalping claim: "Resale Capped at 150% by Contract" in feature card
- XCM-readiness: preserved in both Home.tsx feature card and HowItWorks.tsx features array

## Verification Results

```
grep -r "mathematically impossible" frontend/src/ → 0 results
grep -r "Blockchain-Powered" frontend/src/ → 0 results
grep -r "Reimagined" frontend/src/ → 0 results
grep -r "Emit XCM Attestation" frontend/src/ → 0 results
grep -r "DucketV2" frontend/src/ → 0 results
npm run build → 0 errors
```

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- frontend/src/constants/copy.ts — exists, contains VERIFY_OWNERSHIP_LABEL
- frontend/src/pages/MyTickets.tsx — "Emit XCM Attestation" replaced
- Commits 20260ca and a7fc86f verified in git log
