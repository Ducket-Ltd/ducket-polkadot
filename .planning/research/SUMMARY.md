# Project Research Summary

**Project:** Ducket Polkadot — v1.1 UI/UX Refinement
**Domain:** Hackathon demo polish for an existing EVM dApp on Polkadot Hub
**Researched:** 2026-03-17
**Confidence:** HIGH

## Executive Summary

Ducket v1.1 is a UI/UX refinement milestone on top of a working EVM ticketing dApp. The contract layer, purchase state machine, and data hooks are all complete and battle-tested. The core problem is not missing features — it is copy that leads with technology instead of user benefit, and visual density that dilutes the three credibility signals judges need to see (Polkadot deployment, anti-scalping enforcement, XCM-readiness). The approach that wins hackathon demos is restraint: fewer trust badges, more precise claims, and animations that support content rather than compete with it.

The recommended approach is a two-phase execution. Phase 1 rewrites copy across all five pages and tightens visual hierarchy, with a new `src/constants/copy.ts` file as the structural anchor. Phase 2 hardens the demo experience by adding a loading timeout to `useEventData`, verifying the sticky purchase panel under all layout states, and doing a full rehearsal on demo hardware. The three new library additions (Inter Variable font, `motion` for micro-interactions, `sonner` for toast notifications) are lightweight and justified — everything else on the "do not add" list would either over-animate the UI or waste timeline with no demo return.

The primary risks are not technical. They are: (1) copy rewrites that remove Polkadot-specific signals while trying to sound human, (2) layout edits that break the `sticky top-24` purchase panel on the Event page, and (3) a cold-start RPC hang on testnet during the live demo with no fallback or retry path. All three are avoidable with specific practices documented in the pitfalls research.

## Key Findings

### Recommended Stack

The existing stack (React 18, Vite, Tailwind CSS, shadcn/ui, wagmi/viem, TanStack Query) is locked and correct — no changes needed at this layer. The three additions for v1.1 are minimal and well-justified. The `motion` package (rebranded from `framer-motion` in late 2024) provides declarative micro-interactions with spring physics that eliminate the need for custom CSS keyframes. `@fontsource-variable/inter` self-hosts the font used by Linear and Stripe, removing Google Fonts CDN as a single point of failure on demo day. `sonner` is the official shadcn/ui replacement for their deprecated Toast component and requires a single wrapper in `App.tsx`.

The design target is the Linear/Stripe aesthetic: Inter at 400/500/600 weights only, generous whitespace, accent color used sparingly, and `--radius` tightened from 0.5rem to 0.375rem. This is achieved through restraint — entrance fades, hover lift, button tap feedback — not spectacle.

**Core technologies:**
- `motion` (v12.x): Micro-interactions — same API as framer-motion, cleaner imports from `motion/react`, React 18 compatible
- `@fontsource-variable/inter`: Typography — self-hosted Inter Variable avoids CDN dependency on demo day; one font file covers all weights
- `sonner`: Toast notifications — official shadcn/ui replacement for deprecated Toast; one-line setup with Tailwind theme integration

**Explicitly excluded:** Aceternity UI, MagicUI, GSAP, react-spring, Zustand, Storybook, dark mode toggle, skeleton screens, onboarding tours — all either contradict the design brief or waste timeline with no demo return.

### Expected Features

Research is clear that this milestone delivers no new features. The winning move is executing existing features at a higher quality bar. The feature dependency chain is: copy overhaul first, then visual hierarchy, then trust signal consolidation — because you cannot make layout decisions until you know what words you are laying out.

**Must have (table stakes — currently failing):**
- Hero headline that explains the product in one outcome-first sentence — judges read this first and move on in 3 seconds if they don't understand
- Feature cards with one concrete claim each, no buzzwords — "The resale cap is in the contract. No one can override it." beats "Scalping is mathematically impossible."
- Active nav link state — its absence signals "template" to experienced judges

**Should have (differentiators — not yet done):**
- Copy that sounds like a person wrote it — human copy is rare in hackathon submissions and memorable
- Trust signal consolidation from 5 badges to 2-3 specific verifiable claims — research confirms 5+ badges dilute all of them
- MyTickets page header that celebrates ownership rather than labeling a data table
- XCM button label changed from "Emit XCM Attestation" to something a non-developer can parse

**Defer (v1.x after submission):**
- Actual contract reads replacing any remaining mock data (~1 day effort)
- Mobile layout audit
- Event image optimization

**Defer (v2+):**
- Organizer dashboard, full XCM cross-chain ticket transfer, fiat on-ramp

### Architecture Approach

The existing architecture is a clean three-layer React SPA: Pages > Hooks > Contract/Chain. All hooks are called at the page level and must stay there — moving hook calls into extracted child components risks breaking wagmi's RPC batching and the purchase state machine's `useEffect` dependencies. The correct pattern for section extraction is local function components inside the same page file, receiving hook return values as props.

The single structural addition for v1.1 is `src/constants/copy.ts` — a typed constants object with named exports per page (`HOME`, `EVENT_PAGE`, `MY_TICKETS`, `RESALE_PAGE`, `HOW_IT_WORKS_PAGE`). This creates a content inventory where all UI-framing strings can be reviewed and rewritten without touching JSX. On-chain data in `eventMetadata.ts` stays separate and is never moved to the constants file.

Build order is prescribed by risk: HowItWorks first (fully static, no hooks), then Home, then Resale, then Event (most complex — purchase state machine), then MyTickets (most stateful — XCM, resale modal, localStorage), then Header/DemoBanner last since it renders on every page.

**Major components:**
1. `src/constants/copy.ts` — single source of truth for all UI-framing strings; one file for the whole 5-page app
2. Page-level section components — local functions inside page files, not separate files; hook calls stay at the page root
3. `index.css` — add only to the bottom; never modify existing CSS custom properties without a full-app visual audit

### Critical Pitfalls

1. **Sticky purchase panel broken by layout changes** — The Event page `sticky top-24` panel requires `overflow: visible` on all ancestors and a `top` value that matches current header + banner height. Any grid-to-flex conversion, parent padding change, or `overflow-hidden` added during cleanup will silently break the core purchase interaction. Verify by scrolling the Event page after every layout change, both with and without the DemoBanner visible.

2. **Copy rewrites break state-driven button text** — Multiple buttons display different text based on hook state (`isPending`, `isSuccess`, step enum values). Rewriting strings in a copy pass without reading surrounding ternaries produces buttons that show the same label in two different states, or misrepresent the purchase step to the user. Read every string in full JSX context before changing it.

3. **Removing Polkadot-specific brand signals while "cleaning up"** — The hero's "Live on Polkadot Hub" pill, anti-scalping claim, and XCM-ready mention are the hackathon judging criteria made visible. These are non-negotiable. Consolidating trust badges is correct; removing these three signals is a submission-damaging mistake.

4. **Demo RPC cold-start with no fallback** — `useEventData` batches 18 contract calls against a testnet RPC. If any call times out, `isLoading` stays true indefinitely. On demo day, this looks like a broken app. Add an 8-second timeout with a retry button and a static fallback display using `EVENT_METADATA` data.

5. **Global CSS cascade breaking Dialog and Input styling** — Modifying CSS custom properties in `index.css` affects every shadcn/ui component simultaneously. The resale listing modal on MyTickets uses `--card`, `--card-foreground`, `--input`, and `--ring`. Test the Dialog modal after any `index.css` change.

## Implications for Roadmap

Based on combined research, a two-phase structure is correct for this milestone. The dependency chain from FEATURES.md (copy before layout), the risk hierarchy from PITFALLS.md (purchase flow last), and the prescribed build order from ARCHITECTURE.md all point to the same execution sequence.

### Phase 1: Copy and Visual Refresh

**Rationale:** Copy must be written before layout decisions are made — you cannot determine what visual hierarchy to create until you know the words that need hierarchy. The hero is the single highest-leverage change because judges extend goodwill to subsequent pages when the first impression is clear. This phase does not touch purchase logic.

**Delivers:** A demo that passes the 30-second judge impression test — clear headline, understood product, no template aesthetic markers.

**Execution order within this phase:**
1. Create `src/constants/copy.ts` (zero visual change, validates import pattern)
2. `HowItWorks.tsx` (static, no hooks, safe for iteration)
3. `Home.tsx` hero and features sections (read-only hook)
4. `Header.tsx` active nav state
5. `Resale.tsx` info banner and listing copy
6. `Event.tsx` sidebar copy (preserve all `purchase.*` conditionals)
7. `MyTickets.tsx` copy and XCM button label

**Addresses:** P1 features (hero rewrite, feature card copy, trust badge consolidation, buzzword removal), P2 features (active nav state, HowItWorks cleanup)

**Avoids:** Removing key brand signals (Pitfall 6), vague copy replacing precise claims (Pitfall 8), breaking state-driven button text (Pitfall 3)

**Must not do:** Restructure purchase flow, touch `eventMetadata.ts`, add animations to the event card grid, use Google Fonts CDN, add more than 3 simultaneously animating elements to the hero.

### Phase 2: Demo Hardening and Smoke Test

**Rationale:** Technical hardening is sequenced after copy/layout because RPC fallback and loading timeout implementation requires knowing the final component structure. This phase addresses the one failure mode that cannot be fixed during a live presentation: testnet RPC cold-start.

**Delivers:** A demo that survives real conditions — cold RPC, wallet account switches, DemoBanner state resets, and demo hardware that is slower than a development machine.

**Implements:**
- 8-second loading timeout on `useEventData` with retry button and static fallback
- Full animation performance test on actual demo hardware
- `localStorage` instead of `sessionStorage` for DemoBanner dismiss (survives hard refresh)
- Five-page color audit across browser tabs
- Full purchase flow rehearsal including wallet reject path

**Avoids:** Demo RPC cold-start (Pitfall 7), animation jank on demo machine (Pitfall 4), DemoBanner sessionStorage reset (Pitfall-to-phase mapping)

**Uses:** `motion` micro-interactions (add and validate performance), `sonner` toast integration (verify purchase flow feedback)

### Phase Ordering Rationale

- Copy before layout is non-negotiable per FEATURES.md dependency chain — visual hierarchy problems are invisible until copy is fixed
- HowItWorks before Event is non-negotiable per ARCHITECTURE.md risk ordering — safest file establishes the pattern before the riskiest file
- Demo hardening after visual polish per PITFALLS.md phase mapping — RPC fallback is a code change that needs stable component structure to target correctly
- Library additions (`motion`, `sonner`) are integrated during Phase 1 but performance-validated during Phase 2 on demo hardware

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1 — Copy and Visual Refresh:** All implementation patterns are fully documented in ARCHITECTURE.md with code examples. The constants file pattern, section extraction pattern, and inline Tailwind editing pattern are standard and well-specified. No additional research needed.
- **Phase 2 — Demo Hardening:** The specific implementation (timeout on `useEventData`, localStorage for DemoBanner) is identified and straightforward. No additional research needed.

No phases require deeper research — this is a UI/UX refinement on an established codebase with high-confidence architectural findings derived from direct source inspection.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All three additions verified via npm, official motion.dev docs, and shadcn/ui official deprecation notice. Version compatibility confirmed for React 18. |
| Features | MEDIUM-HIGH | Copy patterns HIGH (direct codebase analysis + established copywriting research). Hackathon judge behavior MEDIUM (Devpost official sources + OpenGuild winner patterns, not primary interviews). |
| Architecture | HIGH | All findings from direct codebase inspection of actual source files. Build order derived from hook dependencies and file risk level. |
| Pitfalls | HIGH | Drawn from direct codebase inspection of sticky panel layout, CSS variable scope, and hook state machine. Testnet RPC pitfall drawn from known EVM hackathon demo failure patterns. |

**Overall confidence:** HIGH

### Gaps to Address

- **Demo hardware performance:** Animation performance under screen share with recording software cannot be validated until tested on the actual demo laptop. Phase 2 must include this test before submission — developer machine results do not transfer.
- **XCM button copy final wording:** `project_xcm_framing.md` provides the framing principle (XCM-ready, not XCM-powered). The exact label ("Record on-chain proof" vs "Verify ticket ownership") should be finalized in Phase 1 against the verifiability test — pick the label a non-developer can parse that is still technically accurate.
- **RPC cold-start threshold:** The 8-second timeout for `useEventData` is a reasonable estimate. Validate against actual Polkadot Hub Testnet RPC response times during Phase 2 smoke test; adjust if the RPC is consistently faster or slower.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `frontend/src/pages/`, `frontend/src/hooks/`, `frontend/src/index.css`, `frontend/src/App.tsx` (2026-03-17)
- [motion.dev](https://motion.dev/) — confirms package name `motion`, import from `motion/react`, React 18 compatibility
- [shadcn/ui Sonner docs](https://ui.shadcn.com/docs/components/radix/sonner) — official deprecation of Toast, Sonner recommendation
- [Fontsource Inter install guide](https://fontsource.org/fonts/inter/install) — self-hosted variable font setup confirmed

### Secondary (MEDIUM confidence)
- [Devpost judging tips](https://info.devpost.com/blog/hackathon-judging-tips) — judge behavior patterns (visual appeal first, working over beautiful)
- [OpenGuild past winners](https://build.openguild.wtf/past-hackathon-winners) — Polkadot-specific patterns: UX cited in multiple winning descriptions
- [Kinsta trust badges](https://kinsta.com/blog/trust-badges/) — 5+ badges dilution confirmed
- [TrustedSite worst trust badge mistakes](https://blog.trustedsite.com/2021/07/12/the-worst-trust-badge-mistakes-that-send-customers-running-and-how-to-fix-them/) — badge consolidation guidance
- [LogRocket React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — motion/framer-motion ecosystem dominance confirmed

### Tertiary (informational)
- `.planning/STATE.md` — decisions log and known concerns from previous phases
- `project_xcm_framing.md` memory — XCM-ready vs XCM-powered framing guidance

---
*Research completed: 2026-03-17*
*Ready for roadmap: yes*
