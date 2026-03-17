# Pitfalls Research

**Domain:** UI/UX Refinement of existing working dApp — v1.1 milestone (pre-demo-day polish)
**Researched:** 2026-03-17
**Confidence:** HIGH (drawn from direct codebase inspection + well-established patterns in dApp UI work)

> Note: This file replaces the earlier 2026-03-15 pitfalls research (which covered contract and integration issues).
> That content now lives in `.planning/codebase/CONCERNS.md`. This file focuses exclusively on
> pitfalls introduced by adding UI/UX polish to an already-working system — the v1.1 milestone risk set.

---

## Critical Pitfalls

### Pitfall 1: Restyling Breaks the Sticky Ticket Purchase Panel

**What goes wrong:**
The Event page (`Event.tsx`) has a `sticky top-24` purchase panel in the right column of a 3-column grid. This only works correctly because the parent container has enough height and the `top-24` offset accounts for the 80px fixed header (h-20) plus the DemoBanner (which is 40px when visible). If you change any of these — header height, banner presence, card padding, or switch the layout to flex — the sticky panel either overlaps the header, scrolls past the bottom of the content area, or stops sticking entirely. This is the core purchase interaction. If it breaks, demo flow breaks.

**Why it happens:**
Visual polish often involves adjusting spacing, padding, and the grid layout. Developers refine the hero or event info section without checking that the purchase panel's sticky positioning still works after layout changes. Sticky positioning is fragile: it requires `overflow: visible` on every ancestor element, a well-defined containing block height, and the correct `top` offset matching the current header+banner height.

**How to avoid:**
- Treat `sticky top-24` on the purchase panel as a hard constraint. Do not change it unless you explicitly recalculate `top` after any header height change.
- If you change the DemoBanner (toggle it, resize it, or remove it), re-test the purchase panel sticky behavior immediately.
- Never wrap the `lg:grid` layout columns in a container with `overflow: hidden` or `overflow-auto` — this kills sticky positioning.
- After any CSS change to Header or DemoBanner height, open the Event page and scroll to verify the panel sticks correctly.

**Warning signs:**
- Header height class `h-20` changed without updating `top-24` on the sticky panel
- DemoBanner removed or height changed; purchase panel now overlaps header
- Parent div gains `overflow-hidden` during visual cleanup
- The `lg:col-span-2 / lg:grid-cols-3` layout changed to flex

**Phase to address:**
Any phase that touches Event.tsx layout, Header.tsx, or DemoBanner.tsx.

---

### Pitfall 2: Hardcoded Color Values Diverge From CSS Custom Properties

**What goes wrong:**
The codebase uses two parallel color systems simultaneously: Tailwind CSS custom properties (`--primary`, `--accent`, defined in `index.css`) and hardcoded hex values inline (`bg-[#3D2870]`, `text-[#F5C842]`, `border-[#6B5B95]`). During a visual refresh, you update one system but not the other. Buttons using `bg-[#3D2870]` get updated to a new shade, but `bg-primary` elements stay at the old shade. Or you update the CSS variable but half the file still uses hardcoded hex. The result is color inconsistency that only becomes visible when you look at multiple pages side-by-side — easy to miss during a per-page review.

**Why it happens:**
The existing code mixes both patterns extensively (see Event.tsx, Home.tsx, Resale.tsx — nearly every component has inline hex values). During a refresh, you focus on the component in front of you and miss that the same color is defined differently in three other components.

**How to avoid:**
- Before making any color changes: run a search for `#3D2870`, `#6B5B95`, `#F5C842`, `#1a1625`, `#F5F0FF`, `#E8E3F5` across all TSX files. Know every location before changing any.
- Pick one system and stick to it for the refresh. The safer choice is to keep the hardcoded hex values (they're already consistent) and only update specific components deliberately.
- Do not change CSS custom properties in `index.css` unless you audit every component that uses `bg-primary`, `text-foreground`, `border-border` etc — those variables power the shadcn/ui components too.
- If you change a color, do a search-and-replace for all occurrences, not just the one in the current file.

**Warning signs:**
- One page's buttons are slightly different purple from another page's buttons
- shadcn Badge or Button components look different from custom-styled buttons
- You updated `--primary` in index.css but some components still show the old purple

**Phase to address:**
Phase 1 (copy + visual refresh) — establish the color rule at the start and enforce it throughout.

---

### Pitfall 3: Copy Rewrites That Break Component Logic

**What goes wrong:**
JSX components have text that is also used as conditions or keys. For example, in `MyTickets.tsx`, the button text switches between `'Already Listed'` and `'List for Resale'` based on `listedTokenIds.has(tier.tokenId)`. In `Event.tsx`, purchase button text is driven by `purchase.step` state. If you change these text strings during a copy rewrite without checking whether the text has logic attached, you can accidentally orphan the old condition, produce duplicate strings, or misrepresent the state to the user (e.g., showing "List Ticket" when it's already listed).

Similarly, the `DemoBanner` text is used in user expectations — if you remove or rewrite the "Demo Mode — Direct on-chain ticket purchases" wording, judges lose context about what they're seeing.

**Why it happens:**
Copy rewrites are done at the text level without reading the surrounding logic. The developer edits all `<p>` and `<span>` content in a pass, not noticing that some strings are inside conditional renders or ternaries.

**How to avoid:**
- Read every piece of text in its full JSX context before changing it. If the string is inside a ternary or conditional, understand what drives the condition.
- State-driven button text (`isPending`, `isSuccess`, `step`) — do not change these strings without verifying the state machine in the corresponding hook still routes to them.
- The XCM button label in MyTickets has four distinct states: idle / pending+verifying / pending+confirming / already verified. All four must be accurate after a copy edit.
- Treat DemoBanner text as functional documentation, not marketing copy. It tells judges what network they're on.

**Warning signs:**
- A button shows the same label in two different states
- You rewrote a string that appeared in both a loading and a success branch identically
- The DemoBanner or error messages sound too polished — they may have lost specificity

**Phase to address:**
Phase 1 (copy overhaul) — review all state-driven text before submitting each component change.

---

### Pitfall 4: Over-Animating the Hero Kills Performance During Live Demo

**What goes wrong:**
The home page already has three concurrent animations: `animate-ping` (pulsing yellow dot), `animate-shine` (4s looping gradient), and `animate-float` (6s floating glow). Adding more animations during a visual refresh — parallax effects, staggered entrance animations, or hover transitions with expensive CSS properties like `backdrop-filter` — causes frame drops on the demo machine. During a live demo with screen share, frame drops are amplified. Judges see jank, not polish.

Specifically: the hero section already runs `background-size: 200% 100%` animation with `background-position` changes on `.animate-shine`. Adding `transform` or `filter` animations to the same layer triggers GPU compositing issues on some machines, particularly with the `overflow-hidden` and `backdrop-blur` already on the header.

**Why it happens:**
Animations look smooth on a developer machine with a discrete GPU. The demo machine (shared screen, recording software, browser devtools potentially open) is under more load. What felt smooth in isolation stutters during presentation.

**How to avoid:**
- Limit hero section to at most two concurrent animations.
- Prefer `transform` and `opacity` animations (GPU-composited) over `background-position`, `width`, `height`, or `box-shadow` animations (CPU-painted).
- `backdrop-blur` is expensive on scroll — if you add it anywhere new during the refresh, test scrolling performance specifically.
- Test the full demo flow (open app → scroll → click event → purchase flow) on the actual laptop that will run the demo, not your development machine.
- Remove any `animate-*` class you add that doesn't serve the demo narrative. Animations should draw attention to something meaningful (the pulsing yellow dot = "live") not decorate.

**Warning signs:**
- More than 3 simultaneously animating elements on a single view
- New `transition-all duration-500` on large containers (forces layout calculation on every frame)
- `filter: blur()` or `backdrop-filter` added to elements that scroll with the page
- Entrance animations (framer-motion or CSS `@keyframes` triggered on mount) on the event cards grid

**Phase to address:**
Phase 1 (visual refresh) — cap animation complexity before adding any new motion.

---

### Pitfall 5: CSS Changes in index.css Cascade Globally and Break All Pages

**What goes wrong:**
`index.css` defines CSS custom properties used by every shadcn/ui component. Modifying `--border`, `--radius`, `--muted`, or `--card` affects every `Card`, `Button`, `Badge`, `Dialog`, `Input`, and `Separator` rendered anywhere in the app. During a visual refresh, a developer adds a new utility class or tweaks `:root` variables without realizing that the `Dialog` on MyTickets (the resale listing modal) uses `--card-foreground`, or that the `Input` in the resale modal uses `--input` and `--ring`. A subtle border-radius or color change cascades into components you never directly touched.

**Why it happens:**
`index.css` feels like "just CSS." The global cascade is invisible — there's no import statement linking the CSS change to the affected component. Developers test the component they're working on and ship without opening the dialog or visiting MyTickets.

**How to avoid:**
- Do not change CSS custom property values in `index.css` without a full-app visual pass afterward.
- Safer approach: add new utility classes at the bottom of `index.css` without touching existing variables.
- The `.gradient-text`, `.hero-gradient`, `.animate-shine`, `.animate-float`, `.feature-card` classes at the bottom of `index.css` are safe to modify — they're not used by shadcn/ui components.
- After any `index.css` change, open these pages specifically: Home → Event → MyTickets (including the resale listing modal) → Resale → HowItWorks.
- Test the Dialog modal on MyTickets after any border-radius or color change — it's the most visually complex component and uses the most CSS variables.

**Warning signs:**
- A `--radius` change makes the Dialog modal corners look different from buttons
- `--card` color change affected the DemoBanner or purchase panel unexpectedly
- The resale modal input field looks misaligned or wrong color after a global style change

**Phase to address:**
Any phase that touches `index.css`.

---

### Pitfall 6: Removing "AI Template" Feel Too Aggressively Loses Brand Signals

**What goes wrong:**
The goal is removing clutter and the AI-template aesthetic. But the visual refresh overshoots: trust badges disappear, the "Live on Polkadot Hub" pill gets removed, the pulsing yellow dot gets deleted, and the feature cards get stripped to bare text. The result is a cleaner-looking UI that no longer communicates what makes Ducket different from a generic ticketing site. Judges have 10 seconds to form an impression. If the hero doesn't immediately signal "this is on-chain, on Polkadot, and the resale cap is enforced by a smart contract," the demo pitch has to carry more weight.

**Why it happens:**
The developer correctly identifies that the current UI is too badge-heavy and over-explains. The cleanup removes too much, treating all badges as clutter. But the "Live on Polkadot Hub" badge, the anti-scalping trust line, and the XCM mention are doing real work — they're the hackathon judging criteria made visible.

**How to avoid:**
- Keep exactly these three visual signals regardless of how much else you simplify:
  1. "Live on Polkadot Hub" pill with the pulsing yellow dot — proof of deployment
  2. "On-Chain Resale Cap — Scalping Is Impossible" — the EVM track differentiator
  3. "XCM-Ready Verification" — Polkadot-native feature the track rewards
- You can consolidate the five trust badge items into two or three. You cannot remove the above three.
- The hero headline mentioning "Polkadot Hub" is non-negotiable for a Polkadot hackathon. Do not make it generic.
- Apply the reduction rule: for every badge you remove, ask "does a judge reading this for the first time still understand that this is a Polkadot dApp with anti-scalping enforcement?"

**Warning signs:**
- Hero section no longer mentions Polkadot in the above-the-fold area
- The resale cap / anti-scalping claim is only in the features section (below the fold), not the hero
- Feature cards reduced to generic icons and one-line labels without the XCM mention
- "Blockchain-Powered" headline replaced with something generic like "Fair Ticketing"

**Phase to address:**
Phase 1 (copy and layout overhaul) — define the three non-negotiable signals before starting edits.

---

### Pitfall 7: Wallet Connection Flow Breaks Under Demo Conditions

**What goes wrong:**
During a live demo, the presenter's wallet is already connected and funded. But the judges are watching a screen share. The demo tries to connect a second wallet, or the presenter switches accounts in MetaMask mid-demo, or the RPC node goes cold and the next contract read fails after a 30-second timeout. The UI shows no error — just an infinite spinner on the events grid. The audience waits. The presenter clicks Refresh and the spinner continues. This is the most common category of live demo failure for Web3 apps.

The specific vulnerabilities in this codebase:
- `useEventData` batches 18 RPC calls. If any single call times out, `isLoading` stays true indefinitely (wagmi does not surface partial multicall results by default).
- The DemoBanner's dismiss state persists in `sessionStorage` — a hard refresh (which a nervous presenter might do) resets it and the banner reappears at the wrong moment.
- The `sticky top-24` purchase panel's `top` value doesn't account for the DemoBanner being present or absent — if the banner reappears, the panel may overlap it.

**Why it happens:**
RPC reliability on testnets is lower than mainnet. Demo environments have different network conditions. These failure modes only appear under real-world load.

**How to avoid:**
- Set a hard timeout on the event loading spinner. If events don't load in 8 seconds, show a "Connection issue — click Refresh" message. An infinite spinner is worse than an error state.
- Add a fallback: if `isError` is true on `useEventData`, show the events from `EVENT_METADATA` as static display-only cards (no purchase available). This gives judges something to look at while the RPC recovers.
- Before the demo, connect the wallet and load the app. Let it sit for 5 minutes. Come back and refresh. This simulates the cold-start RPC behavior.
- Have two browser tabs open: one logged in, one as a "new user" — swap between them instead of switching MetaMask accounts live.
- Dismiss the DemoBanner before starting the demo flow. Keep `sessionStorage` cleared.
- Test the purchase flow on the exact chain (Polkadot Hub Testnet) the day before — confirm the RPC is responsive.

**Warning signs:**
- No maximum loading duration / timeout on the events fetch
- No fallback display when `isError` is true
- No "Retry" button on the events section (there is one on MyTickets but not on Home)

**Phase to address:**
Phase 2 (demo hardening / smoke test) — add loading timeout and error fallback before demo day.

---

### Pitfall 8: Copy Rewrites That Sound Clever But Lose Precision

**What goes wrong:**
The current hero copy contains technically specific claims: "DucketV2 smart contracts enforce fair pricing at the protocol level. Scalping is impossible. Counterfeits don't exist." A copy rewrite aiming for "human tone" softens this to "We built a better way to buy tickets" or "Tickets the way they should be." The claim gets vague. For a hackathon judge who is a developer, precision builds more credibility than warmth.

Specific copy patterns to avoid during the rewrite:
- "Powered by blockchain" — meaningless, every Web3 project says this
- "Seamless experience" — filler phrase, says nothing
- "Revolutionary" — never use in technical contexts
- "XCM-powered" — overclaims (it's XCM-ready, not XCM-powered; XCM message is emitted but not cross-chain verified yet)

**Why it happens:**
Writers trying to "sound human" reach for marketing language. "Human" copy in a dApp context means direct and specific, not warm and vague. "The resale cap is enforced by the contract — you cannot overprice" is more human than "Fair pricing you can trust."

**How to avoid:**
- Each copy change must preserve: WHO does the enforcement (the contract), WHAT is enforced (resale price cap, percentage), and HOW it is demonstrated (on testnet, viewable on Blockscout).
- Keep "Scalping is impossible" — it is a bold, verifiable claim backed by the contract. This is the kind of line judges remember.
- The headline "Blockchain-Powered Ticketing on Polkadot Hub" is accurate but generic. Improvement: "Tickets priced in stablecoins. Resale capped by contract. No scalpers." — three facts, no adjectives.
- For XCM: use "XCM-ready" (accurate) not "XCM-powered" (overclaims current state). The framing from `project_xcm_framing.md` memory is the correct reference here.
- Apply this test to every copy change: could a judge verify this claim by looking at the contract or the demo? If not, soften or cut it.

**Warning signs:**
- Hero subheadline no longer references the contract or testnet deployment
- "Scalping is impossible" replaced with "fair pricing for everyone"
- XCM copy upgraded from "XCM-ready" to "cross-chain verified" (overclaim)
- Feature card descriptions reduced to single adjective phrases ("Secure," "Fast," "Transparent")

**Phase to address:**
Phase 1 (copy overhaul) — apply the verifiability test before finalizing each page.

---

## Technical Debt Patterns

Shortcuts that seem reasonable during a visual refresh but create problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `!important` to override shadcn component styles | Faster than prop drilling or variant additions | Creates an ordering dependency between stylesheets; breaks predictably when shadcn updates | Never — use className overrides or shadcn variants instead |
| Replacing `className` strings with template literals for conditional logic | Cleaner-looking JSX | Breaks Tailwind's static analysis; purging removes classes that are constructed at runtime | Never in this project — purge is active in Tailwind config |
| Deleting unused sections (e.g., the `HowItWorks` page) to simplify | Fewer files to maintain | HowItWorks is linked from nav — removing it creates a 404 during demo | Never without also removing the nav link |
| Inlining all styles into a single global CSS block | Easier to see all styles at once | Conflicts with Tailwind's layer system; specificity bugs cascade unpredictably | Never — keep component-level className and global CSS separate |
| Moving color hex values into CSS variables "for cleanliness" | Single source of truth | The existing codebase has 50+ hardcoded hex occurrences; a partial migration creates two sources of truth, which is worse | Only acceptable if 100% complete in a single pass |
| Adding a new font via Google Fonts link | Easy visual upgrade | Adds network request on every load; if the font load is slow on demo day, text appears unstyled briefly | Only if font is self-hosted or loaded with `font-display: swap` |

---

## Integration Gotchas

Specific to the UI/UX refresh scope — where styling changes intersect with functional code.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn/ui Button `variant` prop | Overriding a variant's background with arbitrary `bg-[#hex]` without considering `hover:` and `disabled:` states | Test all three states (default, hover, disabled) after any button color change |
| shadcn/ui Dialog | Changing `--card` or `--card-foreground` CSS variable thinking it only affects Cards | The Dialog overlay uses the same variables; test the resale listing modal after any card color change |
| wagmi `isPending` state on purchase button | Applying a new loading animation that hides the `Loader2` spinner | The spinner communicates wallet confirmation in progress — keep it visible or replace with equivalent |
| DemoBanner and Header z-index stack | Adding a new element with `z-50` (same as Header) causes layering conflicts on scroll | New fixed/sticky elements must audit existing z-index: Header is `z-50`, DemoBanner is `z-40` |
| `animate-ping` on the hero yellow dot | Replacing with a different animation that uses `transform: scale` on the parent | `animate-ping` uses an absolutely-positioned pseudo-element — the parent must remain `relative` and the inner dot `relative` too |
| Event page grid `lg:grid-cols-3` | Changing to `lg:grid-cols-2` for a "cleaner" look | The 3-column layout (2 + 1) gives the sticky purchase panel its containing block — changing to 2-column makes the panel full-width and breaks the checkout UX |

---

## Performance Traps

Relevant to the demo-day context specifically.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Framer Motion or CSS entrance animations on the events grid | Cards animate in on load; each card triggers layout recalculation; visible jank on the 6-card grid | Do not add mount animations to the event card grid — it already loads async from the chain | On any machine running screen share software simultaneously |
| `transition-all` on the event cards' hover state | Expensive because it transitions every CSS property including layout-affecting ones | Use `transition-shadow` and `transition-transform` specifically, not `transition-all` | On low-end hardware; noticeable during demo on screen share |
| Loading the events section before wallet is connected | If RPC cold-starts on demo day, the hero section loads but events show a spinner for 10+ seconds | Add a visible 8s timeout with a retry button — never leave users staring at an infinite spinner | On testnet RPC during off-peak hours |
| `backdrop-blur` on the header AND a new `backdrop-blur` overlay element | Two blur elements on the GPU compositing stack causes dropped frames on scroll | The header already has `backdrop-blur-md` — do not add another blur layer above or below it | When scrolling fast on a mid-range GPU (common demo laptops) |

---

## Security Mistakes

Not the focus of this milestone, but one risk introduced by UI changes.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Removing the `isZeroAddress` warning in App.tsx during cleanup | `.env` misconfiguration fails silently; contract reads go to address zero; all data appears missing | Never remove the `VITE_CONTRACT_ADDRESS` guard — it has saved the demo before (per STATE.md context) |
| Adding a "direct link to contract" in the UI with a hardcoded address | If contract is redeployed before demo day, the link points to the wrong address | Use `CONTRACT_ADDRESS` from `@/lib/contract` for any on-chain links, never hardcode |

---

## UX Pitfalls

Specific to this dApp's demo flow and user journey.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Reducing the purchase panel to save space | The sticky checkout card is the primary conversion point — shrinking it reduces clickable target area and hides the price total | Keep the purchase panel at its current size; reduce other content instead |
| Removing the step indicator from the purchase flow | User sees two sequential wallet prompts with no context — thinks the first approval was the purchase | The "Approve USDC → Purchase Ticket" step indicator is functionally required for stablecoin UX; do not remove it during polish |
| Making the "Resale OK" badge less visible | Buyers scanning the event grid cannot tell which events allow resale | Keep the resale badge on event cards — it is a product differentiator, not clutter |
| Removing the XCM verification badge after ticket purchase | Judges do not see the cross-chain feature during the demo | The green "Cross-chain attestation emitted" badge with Blockscout link is the XCM feature's only visual proof — keep it prominent |
| Adding too many hover states and micro-interactions to event cards | Event card becomes visually noisy; `-translate-y-1` on hover already creates good lift — adding more makes it feel toy-like | The existing `hover:shadow-xl hover:-translate-y-1` is the right level of interaction; adding more is over-design for a hackathon demo |
| Changing the QR code size or styling in MyTickets | QR codes on the `TicketQRCode` component at `size={96}` are already near the minimum scannable size | Do not reduce QR code size below 96px; it is a functional demo element, not decoration |

---

## "Looks Done But Isn't" Checklist

Things that pass a visual inspection but break during demo.

- [ ] **Event sticky panel**: After any layout change, scroll the Event page and verify the purchase card stays fixed in the right column without overlapping the header. Test with DemoBanner both visible and dismissed.
- [ ] **Purchase button states**: After copy changes, trigger each state manually (idle, isPending, isSuccess, error) and verify each label is distinct and accurate.
- [ ] **MyTickets XCM button**: Verify all four label states work after any copy edit: "Emit XCM Attestation" / "Confirm in wallet..." / "Confirming..." / (hidden after success).
- [ ] **DemoBanner**: After any visual refresh, hard-refresh the page and verify the banner appears as expected (sessionStorage cleared). Confirm dismiss works.
- [ ] **Color consistency**: Open Home, Event, MyTickets, Resale, HowItWorks in five browser tabs. Compare button colors, badge colors, and card border colors. They must all match.
- [ ] **Dialog modal**: Open the "List for Resale" modal in MyTickets. Verify it renders correctly after any `index.css` or card style change.
- [ ] **Error states**: Trigger a wallet rejection on the purchase flow. Verify the error card in Event.tsx still renders with the correct styling after any component changes.
- [ ] **Wallet disconnect**: While viewing MyTickets (ticket list visible), disconnect wallet. Verify the page transitions to the "Connect Your Wallet" state cleanly.
- [ ] **No overclaiming XCM copy**: Verify XCM-related text uses "XCM-ready" / "cross-chain attestation emitted" framing — not "cross-chain verified" or "XCM-powered."

---

## Recovery Strategies

When a pitfall occurs during the v1.1 polish phase.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sticky purchase panel broken by layout change | LOW | Revert the parent grid/flex change; restore `sticky top-24`; recalculate `top` if header height changed |
| Color inconsistency across pages after refresh | LOW | `grep -r "#3D2870\|#6B5B95\|#F5C842" src/` and audit every occurrence; standardize in a single pass |
| State-driven button text broken by copy edit | LOW | Open the hook file (`usePurchaseTicket.ts`, `useXcmVerification.ts`) and trace every `step` value to its UI text; fix mismatches |
| CSS cascade broke Dialog or Input styling | MEDIUM | Revert the `index.css` change; apply more targeted overrides using component-level className instead of global variables |
| Over-animation causing frame drops on demo machine | LOW | Remove the new animation; replace with a static alternative; test on demo hardware |
| Removed a key trust signal that judges expect | LOW | Restore the signal; the hero section is fast to edit |
| Demo RPC cold-start hangs on infinite spinner | MEDIUM | Add a timeout + error fallback to `useEventData` return — show retry button after 8s; this is a code change, not a CSS change |
| Presenter hard-refreshes and DemoBanner reappears unexpectedly | LOW | Dismiss the banner before starting the demo; or set the dismiss in `localStorage` instead of `sessionStorage` so it survives hard refresh |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Sticky panel broken by layout change | Phase 1 (layout refresh) | Scroll Event page after every layout edit; verify purchase panel sticks |
| Hardcoded colors diverge from CSS vars | Phase 1 (copy + visual refresh) | Open all 5 pages, compare button/badge colors in tabs |
| Copy rewrites break state-driven text | Phase 1 (copy overhaul) | Manually trigger each purchase step state and verify labels |
| Over-animation jank on demo machine | Phase 1 (visual refresh) | Run full demo flow on the actual demo laptop, not dev machine |
| Global CSS cascade breaks Dialog | Any phase touching index.css | Open MyTickets resale modal after every index.css change |
| Removing key brand/hackathon signals | Phase 1 (layout/copy) | Re-read the hero as if you're a judge; verify three non-negotiable signals are present |
| Demo RPC cold-start infinite spinner | Phase 2 (smoke test + hardening) | Load app on fresh browser tab with cold cache; measure event load time |
| Precise copy replaced with vague marketing | Phase 1 (copy overhaul) | Apply verifiability test: can a judge confirm each claim from the demo or contract? |
| Wallet flow breaks under demo conditions | Phase 2 (demo rehearsal) | Do a full demo rehearsal on demo hardware; include wallet connect, purchase, XCM verify |
| DemoBanner sessionStorage resets unexpectedly | Phase 2 (smoke test) | Hard-refresh the page and verify banner behavior; consider localStorage for dismiss |

---

## Sources

- Direct codebase inspection: `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/index.css`, `frontend/src/App.tsx`
- `.planning/STATE.md` — decisions log and known concerns from previous phases
- `.planning/PROJECT.md` — v1.1 milestone scope and constraints
- `.planning/ROADMAP.md` — phase dependencies and demo success criteria
- `project_xcm_framing.md` memory — XCM-ready vs XCM-powered framing guidance
- Known dApp demo failure patterns: EVM hackathon post-mortems (RPC reliability, wallet flow UX, approval step)
- Tailwind CSS purge behavior — confirmed that dynamic class construction causes purge issues
- shadcn/ui CSS variable system — confirmed variables are shared across all components in the same index.css scope

---
*Pitfalls research for: UI/UX Refinement — Ducket Polkadot v1.1 milestone*
*Researched: 2026-03-17*
