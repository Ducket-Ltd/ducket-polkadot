# Feature Research

**Domain:** Stablecoin-powered event ticketing dApp on Polkadot Hub (EVM track)
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH (hackathon-specific judging intelligence from official hackathon docs + general DeFi hackathon patterns; Polkadot-specific XCM data from official Polkadot docs)

---

## Context: What Judges Are Scoring

The Polkadot Solidity Hackathon 2026 (co-led by OpenGuild and Web3 Foundation) judges on:

1. **Design overview** — does it look and feel like a real product?
2. **Novelty/originality** — does it do something new, not a fork clone?
3. **Technical complexity** — did you use the chain capabilities, not just deploy a contract?
4. **Daily/mass usability** — can non-crypto-native users understand and use it?
5. **Impact and roadmap** — does this have a believable future?

**Track-specific signal (EVM Smart Contract Track):** The track explicitly calls out "DeFi & Stablecoin-enabled dApps" as the target problem space. Hyperbridge is a Strategic Partner with $30,000 prize pool emphasis on cross-chain DeFi use cases. Projects that show XCM usage get ecosystem-alignment points.

**Disqualifier to avoid:** More than 70% codebase similarity to original repo — the Ducket base is being substantially modified so this is fine, but keep commit history active during hackathon window.

---

## Feature Landscape

### Table Stakes (Judges Dismiss Without These)

Features the judges assume exist. Missing these signals an incomplete submission.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Working ticket purchase with real contract calls | Judges click "Buy" — if it does nothing, submission fails | MEDIUM | Replace setTimeout mocks in Event.tsx with wagmi writeContract to mintTicket |
| Stablecoin (ERC-20) payment path | Track is explicitly "DeFi & Stablecoin-enabled" — submitting without stablecoin payment fails the track requirement | MEDIUM | Deploy mock ERC-20 on testnet; add approve+transferFrom to DucketTickets.sol; UI shows token symbol not ETH |
| User's owned tickets visible after purchase | Without MyTickets working, the demo loop is broken — buy a ticket, can't see it | MEDIUM | Replace empty mock array with on-chain reads from getUserTicketsForEvent |
| Working resale listing and purchase | Core anti-scalping mechanic — if it doesn't demo, the value prop collapses | MEDIUM | Wire Resale.tsx to listForResale and buyResaleTicket contract calls |
| Wallet connection that actually works | Judges connect MetaMask/SubWallet — if it errors silently, project is dead on arrival | LOW | Fix WalletConnect.tsx connector[0] array access guard |
| Live deployment on Polkadot Hub Testnet | Judges want to see it running on the actual chain, not localhost | LOW | Contract is already deployed; wire VITE_CONTRACT_ADDRESS correctly |
| Demo video (2-4 minutes) | Required for submission; judges evaluate it before live demo | LOW | Record after full wire-up; show purchase flow end-to-end |

### Differentiators (Competitive Advantage for Winning)

Features that show ecosystem understanding and technical sophistication beyond table stakes.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| XCM cross-chain ticket ownership verification | Shows Polkadot-native thinking — tickets minted on Hub can be verified from another parachain. No other ticketing dApp does this natively. XCM precompile at 0x00000000000000000000000000000000000a0000 makes this callable from Solidity | HIGH | Scope to "emit an XCM message proving ownership" as PoC — doesn't need full cross-chain transfer. Even a working executeXCM call from the contract is a differentiator |
| Ticket price displayed in stablecoin (USDC/USDT), not native token | Directly addresses the core value prop: organizer revenue doesn't fluctuate with DOT price. Judges in DeFi track will recognize this as the real-world killer feature | LOW | UI change + contract stores price in ERC-20 units; show "$25 USDC" not "0.000483 DOT" |
| Resale price cap enforced at contract level, visible in UI | Anti-scalping is the pitch; making the cap visually obvious (e.g. "max resale: $50 USDC") demonstrates on-chain enforcement judges can verify | LOW | Already in contract; surface prominently in Event page and Resale page |
| On-chain ticket transfer between wallets | Real-world ticketing requires gifting/transferring tickets. Shows ERC1155 composability beyond simple mint | LOW | Already in contract (transferEnabled flag); add Transfer button to MyTickets with address input |
| Platform fee transparency dashboard | Shows DeFi sophistication — organizer sees the fee split, demonstrates the payment distribution is trustless | LOW | Read platformFee from contract and display "X% goes to platform, Y% to organizer" on event creation or event detail page |
| "Verified on Polkadot" trust badge | Consumer psychology win for demo day — non-technical judges respond to visual trust signals | LOW | Static badge in ticket detail + "Why blockchain?" tooltip. 1-hour design task |
| Multi-tier pricing clarity (GA vs VIP visual distinction) | Already seeded; making tiers visually distinct (color coding, icons) shows product polish that generic contracts lack | LOW | CSS/UI only; zero contract changes |
| Ticket QR code or shareable proof link | Demo-day "wow moment" — buying a ticket and immediately seeing a scannable QR code closes the loop for non-crypto judges | MEDIUM | Generate QR from tokenId + ownerAddress + contractAddress; no contract changes needed; use qrcode.react library |

### Anti-Features (Do NOT Build in 5-Day Timeline)

Features that seem good but will consume time without moving the score needle.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full XCM cross-chain ticket transfer (parachain to parachain) | Shows maximum Polkadot capability | Requires parachain runtime config, channel setup, significant testing — easily 3-5 days alone. Likely to demo-break | Scope to XCM ownership verification message only: one executeXCM call that emits a verifiable proof. Same story, 10% of the work |
| Event cancellation and refund logic | Judges ask "what if event is cancelled?" | Complex pull-payment refund logic, re-entrant risk, needs heavy testing to be safe. Adds contract risk near deadline | Answer verbally in Q&A: "planned for v2, refund mapping is straightforward to add" |
| Real USDC/USDT from Circle/Tether mainnet | Using real stablecoins looks more legitimate | Testnet has no bridged Circle USDC with liquidity; faucets don't support it. Will break demo if token isn't funded | Deploy your own MockUSDC ERC-20 on testnet. Judges understand this is a testnet. Label it clearly in UI |
| Admin emergency pause (Pausable) | Security best practice | Adds contract surface area, requires redeployment, testing | Mention in README as "production-ready addition" — judges credit the awareness |
| Full test suite (Hardhat unit tests) | Production quality signal | 5-day timeline; tests add correctness but judges weight working demo over test coverage | Write one happy-path integration test as a signal you know how, document the gap |
| Mobile-responsive design overhaul | Consumer ticketing = mobile-first | Currently web-first; full mobile rework is a distraction from getting contract integration working | Make header and purchase flow not-broken on mobile (1-2 hours CSS) rather than full overhaul |
| Dutch auction / offer-counteroffer resale | Secondary market sophistication | Completely different resale contract logic, new UI states, significant scope | Cap enforcement is already a differentiator; mention dynamic pricing as v2 roadmap |
| AI-powered features | "AI + DeFi" is trending in 2025-2026 hackathons | Not aligned with existing codebase, judges for EVM track value on-chain mechanics over AI wrappers | N/A — not in scope |
| Event creation UI for organizers | Full dApp completeness | Demo only needs one organizer creating events (you, via script); building a creation UI burns time without changing the demo story | Use the existing seed script for demo. Mention organizer UI as roadmap item |

---

## Feature Dependencies

```
[Stablecoin Payment]
    └──requires──> [MockUSDC ERC-20 deployed on testnet]
    └──requires──> [DucketTickets.sol: approve/transferFrom logic]
                       └──requires──> [Contract redeployment]

[Real Ticket Purchase]
    └──requires──> [DucketTickets.sol wired in frontend]
    └──requires──> [VITE_CONTRACT_ADDRESS set correctly]

[MyTickets (owned tickets)]
    └──requires──> [Real Ticket Purchase] (need to own tickets first)
    └──requires──> [getUserTicketsForEvent contract read]

[Resale Listing + Purchase]
    └──requires──> [MyTickets working] (must own ticket to list it)
    └──requires──> [Stablecoin Payment] (if stablecoin used for resale)

[Ticket QR Code]
    └──requires──> [MyTickets working] (need tokenId + owner address)

[XCM Ownership Verification]
    └──requires──> [Real Ticket Purchase] (need an actual minted ticket)
    └──requires──> [XCM precompile call from contract or frontend]

[Platform Fee Transparency]
    └──enhances──> [Stablecoin Payment] (shows split in stablecoin units)

[Multi-tier Visual Distinction]
    └──enhances──> [Real Ticket Purchase] (makes the tier selection clearer)
```

### Dependency Notes

- **Stablecoin Payment requires contract redeployment:** DucketTickets.sol currently takes `msg.value` (ETH). Adding ERC-20 payment requires adding `IERC20 paymentToken` and replacing ETH logic with `transferFrom`. This is the single highest-risk change because it affects every payment path.
- **MyTickets requires Real Purchase:** The demo loop is: buy ticket → see it in MyTickets → list for resale → buy resale. Each step depends on the previous one working. Wire in order.
- **XCM requires a minted ticket:** XCM verification proves ownership of a specific tokenId. The demo flow is: buy ticket → trigger XCM proof → show cross-chain verification message. XCM cannot be demoed standalone.
- **QR Code is low-dependency:** It only needs the tokenId and wallet address — both available after purchase. No contract changes needed. High demo-day impact for low effort.

---

## MVP Definition

### Launch With (Hackathon Submission — must be done by March 20)

These are the non-negotiable items. Missing any of these is a submission-level failure.

- [ ] Real contract calls for ticket purchase (mintTicket via wagmi) — judges click "Buy"
- [ ] Stablecoin (MockUSDC) payment path — track requirement, zero exceptions
- [ ] MyTickets page shows on-chain owned tickets — closes the demo loop
- [ ] Working resale listing and purchase — demonstrates anti-scalping value prop
- [ ] Wallet connection guard fixed (WalletConnect.tsx) — demo cannot break here
- [ ] VITE_CONTRACT_ADDRESS wired to deployed contract — deploy works
- [ ] Demo video recorded (2-4 min) — required for submission

### Add for Demo Day Polish (March 20-24)

Features to add after core is working. These move the score from "submitted" to "winning."

- [ ] Ticket QR code on MyTickets — "wow moment" for non-crypto judges
- [ ] Resale price cap displayed prominently (e.g. "Max resale: $50 USDC") — makes anti-scalping legible
- [ ] Platform fee transparency (show fee split in UI) — DeFi sophistication signal
- [ ] XCM ownership verification PoC — Polkadot-native differentiation
- [ ] "Verified on Polkadot" trust badge — consumer polish signal

### Future Consideration (Post-Hackathon v2)

- [ ] Full XCM cross-chain ticket transfer — requires parachain channel setup
- [ ] Event cancellation + refund logic — pull-payment pattern, needs careful testing
- [ ] Organizer event creation UI — production feature, not needed for hackathon
- [ ] Full smart contract test suite — production quality, mention as roadmap in README
- [ ] Real USDC via Circle bridge — mainnet launch requirement

---

## Feature Prioritization Matrix

| Feature | Judge Value | Implementation Cost | Priority |
|---------|-------------|---------------------|----------|
| Real ticket purchase (contract call) | HIGH | MEDIUM | P1 |
| Stablecoin payment (MockUSDC) | HIGH | MEDIUM | P1 |
| MyTickets on-chain read | HIGH | MEDIUM | P1 |
| Working resale flow | HIGH | MEDIUM | P1 |
| Wallet connection fix | HIGH | LOW | P1 |
| Demo video | HIGH | LOW | P1 |
| Ticket QR code | HIGH | LOW | P2 |
| Resale price cap UI visibility | MEDIUM | LOW | P2 |
| Platform fee transparency | MEDIUM | LOW | P2 |
| XCM ownership verification PoC | HIGH | HIGH | P2 |
| Multi-tier visual distinction (CSS) | MEDIUM | LOW | P2 |
| "Verified on Polkadot" trust badge | MEDIUM | LOW | P2 |
| Stablecoin price display (not native token) | HIGH | LOW | P2 |
| Event cancellation/refund | LOW | HIGH | P3 |
| Full test suite | LOW | HIGH | P3 |
| Organizer creation UI | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for submission (failure without it)
- P2: Moves score from "submitted" to "winning" — target for demo day
- P3: Post-hackathon roadmap

---

## Competitor Feature Analysis

The field for blockchain ticketing in a hackathon context is primarily other hackathon submissions — not production products like GET Protocol or YellowHeart. Judges compare within the submission pool.

| Feature | Typical Hackathon Submission | Production (GET Protocol, YellowHeart) | Ducket's Approach |
|---------|-------------------------------|----------------------------------------|-------------------|
| Anti-scalping | Usually missing or trivial | Programmatic resale enforcement | On-chain price cap 100-200% enforced at contract level — already differentiated |
| Stablecoin pricing | Rarely implemented (most use native ETH) | FIAT gateway, no stablecoin | MockUSDC ERC-20 native to contract — track-aligned |
| Cross-chain | Almost never in hackathon submissions | Bridge solutions only | XCM precompile PoC — unique in field |
| Multi-tier tickets | Sometimes (ERC721 only usually) | Yes (GA/VIP/etc.) | ERC1155 tiered — already implemented |
| Resale marketplace | Sometimes | Yes | Already in contract — needs frontend wire-up |
| UX polish | Usually rough | Polished consumer product | Existing Tailwind UI is above average for hackathon submissions |

**Ducket's actual competitive advantage:** It is not building a typical hackathon "deploy NFT contract + minimal UI." It has a real product architecture with anti-scalping mechanics, ERC1155 tiering, resale marketplace, and a consumer UX — all before adding stablecoin and XCM. The risk is that none of it works end-to-end because of the mock data. Fixing that is the entire mission of this milestone.

---

## Sources

- [Polkadot Solidity Hackathon 2026 Rules — DoraHacks](https://dorahacks.io/hackathon/polkadot-solidity-hackathon/rules) — judging criteria, submission requirements, disqualification rules
- [Polkadot Solidity Hackathon 2026 — Official Site](https://polkadothackathon.com/) — track descriptions, prize pool, partner info
- [Interact with the XCM Precompile — Polkadot Developer Docs](https://docs.polkadot.com/smart-contracts/precompiles/xcm/) — XCM precompile address and Solidity interface
- [Deploy an ERC-20 to Polkadot Hub — Polkadot Developer Docs](https://docs.polkadot.com/tutorials/smart-contracts/deploy-erc20/) — MockUSDC deployment path
- [Circle Launches USDC on Polkadot — Bitcoinist](https://bitcoinist.com/circle-launches-usdc-stablecoin-on-polkadot-network/) — stablecoin ecosystem context
- [XCM Precompile for Solidity — PolkaWorld / X](https://x.com/polkaworld_org/status/1950278403367809377) — confirmation that Solidity can call XCM on Polkadot Hub
- [Blockchain Hackathon Tips — Chainlink Blog](https://blog.chain.link/blockchain-hackathon-tips/) — demo strategy and what judges value
- [Technology Against Ticket Scalping 2025 — Ticket Fairy](https://blog.ticketfairy.com/2025/02/10/technology-against-ticket-scalping-2025-trends-and-tips/) — anti-scalping feature patterns

---

*Feature research for: Ducket Polkadot — stablecoin-powered event ticketing, EVM Smart Contract Track*
*Researched: 2026-03-15*
