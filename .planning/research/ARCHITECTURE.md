# Architecture Research

**Domain:** React SPA — UI/UX refinement on existing dApp (v1.1 milestone)
**Researched:** 2026-03-17
**Confidence:** HIGH (direct codebase inspection — all findings from reading actual source files)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Home    │  │  Event   │  │MyTickets │  │  Resale  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │              │           │
│       │    (UI renders from hook return values)  │           │
├───────┴─────────────┴─────────────┴──────────────┴──────────┤
│                     Hooks Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ useEventData │  │ useMyTickets │  │ usePurchaseTicket │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │useResaleLst. │  │useListResale │  │useXcmVerification │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         │                │                    │              │
├─────────┴────────────────┴────────────────────┴─────────────┤
│                 Contract / Chain Layer                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  wagmi useReadContracts / useWriteContract / useAccount │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  lib/contract.ts — DUCKET_ABI + MOCK_USDC_ABI           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  data/eventMetadata.ts — off-chain event metadata,      │ │
│  │  tier descriptions, images, TOKEN_ID_TO_EVENT_ID map    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | UI/UX Touch Point |
|-----------|----------------|-------------------|
| `Header` | Navigation, wallet connect, scroll effect | Nav link labels, logo badge copy |
| `DemoBanner` | Hackathon context strip | Banner copy only |
| `EventCard` | Renderable unit for event grid | Not used by Home — Home inlines card JSX directly |
| `WalletConnect` | RainbowKit button trigger | Button label, empty-state copy in pages |
| `TicketQRCode` | QR code display in MyTickets | Visual only — no copy |
| `pages/Home` | Hero, event grid, features section | Most copy lives here |
| `pages/Event` | Event detail + ticket purchase sidebar | Tier labels, purchase flow copy, step messages |
| `pages/MyTickets` | Owned tickets, list/verify actions | Action button copy, empty states, XCM messages |
| `pages/Resale` | Active listings grid, buy flow | Listing card copy, info banner |
| `pages/HowItWorks` | Static explainer | All copy in `steps[]` and `features[]` arrays |

---

## Recommended Project Structure

The current structure is flat and practical. For this UI/UX milestone, add exactly one new file and touch no existing directories:

```
frontend/src/
├── components/
│   ├── ui/                # shadcn primitives — do not touch
│   ├── Header.tsx         # modify: nav copy, badge
│   ├── DemoBanner.tsx     # modify: banner copy
│   ├── WalletConnect.tsx  # no change
│   ├── EventCard.tsx      # unused by Home — no change needed
│   └── TicketQRCode.tsx   # no change
├── config/
│   ├── chains.ts          # no change
│   └── wagmi.ts           # no change
├── constants/             # ADD THIS DIRECTORY
│   └── copy.ts            # all user-facing strings, keyed by page/section
├── data/
│   ├── eventMetadata.ts   # no change — event-specific copy stays here
│   └── mockEvents.ts      # no change
├── hooks/                 # do not restructure — all hook signatures stable
│   ├── useEventData.ts
│   ├── useMyTickets.ts
│   ├── usePurchaseTicket.ts
│   ├── useListForResale.ts
│   ├── useResaleListings.ts
│   ├── useResalePurchase.ts
│   └── useXcmVerification.ts
├── lib/
│   ├── contract.ts        # no change
│   ├── mockData.ts        # no change
│   └── utils.ts           # no change
├── pages/
│   ├── Home.tsx           # modify: hero, features layout, copy
│   ├── Event.tsx          # modify: sidebar layout, copy
│   ├── MyTickets.tsx      # modify: ticket card layout, copy
│   ├── Resale.tsx         # modify: listing card layout, info banner
│   └── HowItWorks.tsx     # modify: copy and layout
└── index.css              # modify only if adding new keyframes or gradients
```

### Structure Rationale

- **constants/copy.ts:** Single location for all UI-framing strings. Enables copy review and iteration without reading JSX. Does not affect any hook, contract call, or data flow.
- **hooks/:** Zero changes. Hook signatures and return shapes are the contract between data and UI. Restructuring them risks breaking the purchase state machine.
- **components/ui/:** Zero changes. shadcn primitives are generated — treat as read-only. Override at call sites via `className` prop.
- **data/eventMetadata.ts:** Zero changes. Event names, descriptions, venue names, and tier descriptions are seeded on-chain and stored here as off-chain metadata. These are not "copy" in the UI sense — they are data.

---

## Architectural Patterns

### Pattern 1: Copy Constants File

**What:** Extract all user-facing UI-framing strings from JSX into a typed constants object at `src/constants/copy.ts`. Pages import named exports per page.

**When to use:** For every string in the UI that is a label, heading, subheading, CTA, badge, empty state message, or instructional copy. Not for strings derived from on-chain data (event names, tier names, prices).

**Trade-offs:** Strings are no longer colocated with the markup that uses them. Worth the tradeoff: copy review and rewriting becomes a single-file task, and the constants file serves as a content inventory.

**Example:**
```typescript
// src/constants/copy.ts

export const HOME = {
  hero: {
    liveChip: 'Live on Polkadot Hub',
    headline: 'Ticketing that fights scalping — at the protocol level.',
    subheadline: 'Smart contracts enforce fair prices. Your wallet holds your tickets. No middlemen.',
    ctaBrowse: 'Browse Events',
    ctaResale: 'Resale Marketplace',
  },
  events: {
    sectionChip: 'On-chain events',
    heading: 'Upcoming Events',
    subheading: 'Price caps are enforced by the contract, not policy.',
    loading: 'Loading events...',
    error: 'Failed to load events. Check your connection.',
    from: 'From',
    resaleOk: 'Resale OK',
  },
  features: {
    sectionChip: 'How it works',
    heading: 'Ticketing, without the middleman',
    subheading: 'Smart contracts enforce fair pricing. Your wallet holds your tickets.',
  },
  trustBadges: [
    'ERC-1155 NFT Tickets',
    'Resale cap enforced on-chain',
    'Non-custodial — your wallet, your tickets',
    'Deployed on Polkadot Hub',
    'XCM-ready verification',
  ],
} as const

export const EVENT_PAGE = {
  backLink: 'Back to Events',
  ticketRules: {
    heading: 'Ticket Rules',
    resaleLabel: 'Resale',
    resaleAllowed: (pct: number) => `Allowed up to ${pct}% of original price`,
    resaleDisallowed: 'Not allowed for this event',
    transferLabel: 'Transfer',
    transferAllowed: 'Free transfers allowed',
    transferDisallowed: 'Tickets are non-transferable',
  },
  purchase: {
    selectTickets: 'Select Tickets',
    payWith: 'Pay with',
    quantity: 'Quantity',
    total: 'Total',
    platformFeeLabel: 'Platform fee (2.5%)',
    purchaseButton: 'Purchase Tickets',
    confirming: 'Confirming...',
    purchaseComplete: 'Purchase Complete!',
    walletRequired: 'Connect your wallet to purchase tickets',
    onChainBadge: 'Verified on Polkadot — tickets are on-chain NFTs',
    soldOut: 'Sold out',
    remaining: (n: number) => `${n} left`,
  },
} as const

export const MY_TICKETS = {
  heading: 'My Tickets',
  subheading: 'NFT tickets in your connected wallet',
  noTickets: {
    heading: 'No Tickets Yet',
    body: "You haven't purchased any tickets yet.",
    cta: 'Browse Events',
  },
  noWallet: {
    heading: 'Connect Your Wallet',
    body: 'Connect your wallet to view your tickets.',
  },
  actions: {
    listForResale: 'List for Resale',
    alreadyListed: 'Already Listed',
    emitXcm: 'Emit XCM Attestation',
    xcmDone: 'Cross-chain attestation emitted',
    viewOnChain: 'View on-chain',
    viewEvent: 'View Event',
    refresh: 'Refresh',
  },
} as const

export const RESALE_PAGE = {
  heading: 'Resale Marketplace',
  subheading: 'Buy tickets at price-capped rates. All resales enforced by smart contract.',
  infoBanner: {
    title: 'Price Protection Active',
    body: 'All listings are enforced by smart contracts. Prices cannot exceed the event resale cap.',
  },
  empty: {
    body: 'No tickets currently listed for resale.',
    cta: 'Browse Events',
  },
  howItWorks: {
    heading: 'How Resale Works',
    steps: [
      'Sellers list tickets within the event resale cap.',
      'Smart contracts verify the price meets all requirements.',
      'Ticket transfers to your wallet instantly on purchase.',
    ],
  },
  buyButton: 'Buy Now',
  buying: 'Buying...',
  bought: 'Purchased!',
  faceValue: 'Face Value',
} as const

export const HOW_IT_WORKS_PAGE = {
  chip: 'Getting Started',
  heading: 'How Ducket Works',
  subheading: 'Fair ticketing enforced by smart contracts on Polkadot Hub. No middlemen, no scalpers.',
  whyHeading: 'Why Ducket on Polkadot Hub?',
  cta: {
    heading: 'Ready to Get Started?',
    body: 'Browse upcoming events and experience fair ticketing.',
    button: 'Browse Events',
  },
} as const
```

Usage in a page:
```tsx
import { HOME } from '@/constants/copy'

// In JSX:
<span>{HOME.hero.liveChip}</span>
<h1>{HOME.hero.headline}</h1>
```

### Pattern 2: Section Extraction as Local Function Components

**What:** When a page section has complex layout that needs visual rework, extract it to a named function component inside the same page file. Not a separate file.

**When to use:** Home hero, Home features grid, HowItWorks features section, Resale info banner. These are the most cluttered sections.

**Trade-offs:** Keeps the page file readable and makes section-level edits easier to scope. Does not require a new file — the function lives at the bottom of the page file. Avoids the risk of moving hook calls into child components (see Anti-Patterns).

**Example:**
```tsx
// pages/Home.tsx

// Section components defined in same file — not exported
function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center hero-gradient">
      {/* refactored hero JSX */}
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="py-24 bg-[#F8F4FF]">
      {/* refactored features JSX */}
    </section>
  )
}

// The event grid needs hook data — pass as props
function EventsSection({ events, isLoading, isError }: {
  events: MergedEvent[]
  isLoading: boolean
  isError: boolean
}) {
  return (
    <section id="events" className="py-24 bg-white">
      {/* event grid JSX */}
    </section>
  )
}

export default function Home() {
  const { events, isLoading, isError } = useEventData()

  return (
    <main>
      <HeroSection />
      <EventsSection events={events} isLoading={isLoading} isError={isError} />
      <FeaturesSection />
    </main>
  )
}
```

The hook call (`useEventData`) stays at the top of `Home`. Only rendering is delegated. Data flows down as props — hooks never move.

### Pattern 3: Inline Tailwind Editing — No New CSS Classes

**What:** Edit visual hierarchy directly in Tailwind utility classes on existing elements. Do not add new custom CSS classes to `index.css` unless the property cannot be expressed in Tailwind (gradients, keyframes).

**When to use:** All spacing, font size, color, border radius, and layout changes. The existing custom classes (`hero-gradient`, `.gradient-text`, `.animate-shine`, `.animate-float`, `.feature-card`) in `index.css` are already defined — use them or edit their definitions.

**Trade-offs:** Utilities are colocated with markup, but long `className` strings get unwieldy. For a single-brand, no-theming project this is the correct tradeoff.

**Example — reducing trust badge clutter on Home hero:**
```tsx
// Before: 5 badges with CheckCircle icons, wrapping flex row
// After: 3 concise text items, no icons, cleaner spacing

<div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 mt-10">
  <span>ERC-1155 NFT tickets</span>
  <span>Resale cap enforced on-chain</span>
  <span>Non-custodial</span>
</div>
```

No new CSS needed. The visual change is entirely in JSX.

### Pattern 4: Feature Arrays in Constants, Not Inline in JSX

**What:** Move the `steps[]` and `features[]` arrays currently defined inside component bodies to `constants/copy.ts`. The component iterates the imported array.

**When to use:** Any array of objects that contains only strings (title, description). If the array contains behavior (onClick handlers, derived state), it stays in the component.

**Implementation note:** Icon references (`Shield`, `DollarSign`, etc.) are React components, not serializable. Keep icon imports in the page file. In the constants array, store a string key for the icon name; the page resolves it via a lookup object. Or — simpler for this scope — keep the full array structure in the page file and pull only the string values from `copy.ts`.

---

## Data Flow

### Read Path — Event Data

```
Page mounts
    ↓
useEventData() batches 18 contract calls via useReadContracts
    ↓
wagmi resolves against Polkadot Hub Testnet RPC
    ↓
useMemo merges on-chain results with EVENT_METADATA (off-chain)
    ↓
{ events, isLoading, isError } returned to page
    ↓
Page renders event cards / tier selectors from merged data
```

UI/UX changes do not touch this path. Layout refactors only affect what renders from `events` — the shape and origin of data is unchanged.

### Write Path — Purchase State Machine

```
User selects tier → selectedTier (local state)
User selects quantity → quantity (local state)
User selects payment method → paymentMethod (local state)
    ↓
usePurchaseTicket(selectedTier, quantity, paymentMethod, tierData)
    ↓
purchase.execute() called on button click
    ↓
Hook drives: approve USDC (if stablecoin) → mintTicketWithToken / mintTicket
    ↓
purchase.step: idle → approving → approve-confirming → purchasing → purchase-confirming → success
    ↓
UI reflects step via purchase.stepLabel, purchase.isPending, purchase.isSuccess
```

UI/UX changes only touch the rendering of `purchase.step`, `purchase.stepLabel`, `purchase.isPending`, `purchase.isSuccess`, `purchase.errorMessage`. Copy for step labels can move to `constants/copy.ts`. The state machine inside the hook stays unchanged.

### State Management

No global state store. All state is local to pages or managed by wagmi. This is correct and should not change for this milestone.

```
wagmi WagmiProvider (root)
    ↓ (account, chain state)
Pages ← useAccount() hook
Pages ← domain hooks (useEventData, useMyTickets, etc.)
Pages → local useState (selectedTier, quantity, paymentMethod, modal open/close)
```

---

## Integration Points

### Hook-to-UI Contracts — Do Not Break

These are the integration points between hooks and pages. All UI changes must preserve these return value shapes:

| Hook | Return Values Pages Depend On | Page |
|------|-------------------------------|------|
| `useEventData` | `events: MergedEvent[]`, `isLoading`, `isError` | Home, Event |
| `useMyTickets` | `ownedByEvent`, `isLoading`, `refetch` | MyTickets |
| `usePurchaseTicket` | `execute`, `reset`, `step`, `stepLabel`, `isPending`, `isSuccess`, `errorMessage` | Event |
| `useListForResale` | `list`, `reset`, `step`, `errorMessage`, `isPending`, `isSuccess` | MyTickets |
| `useResaleListings` | `listings: ActiveListing[]`, `isLoading`, `refetch` | Resale, MyTickets |
| `useResalePurchase` | `buy`, `reset`, `stepLabel`, `isPending`, `isSuccess`, `errorMessage` | Resale |
| `useXcmVerification` | `verify`, `reset`, `step`, `errorMessage`, `isPending`, `isSuccess`, `txHash` | MyTickets |

**Rule:** Never move a hook call deeper into a child component unless the hook's data is only needed by that child. All hooks are currently called at the page level — maintain this. Section components extracted as local functions should receive hook return values as props.

### Off-Chain Metadata — Not Copy

`EVENT_METADATA` in `data/eventMetadata.ts` contains event names, descriptions, venue names, images, and tier descriptions. These are keyed by on-chain event IDs and merged with contract reads in `useEventData`. They are not UI copy — they are data from the seeded contract. Do not move them to `constants/copy.ts`.

Only UI-framing copy (headings, CTAs, badge labels, empty states, step instructions, tooltip text) belongs in `constants/copy.ts`.

### CSS Custom Properties — Current State

The following brand colors are defined as CSS variables in `index.css` but are used as inline hex literals throughout JSX. This is inconsistent but not worth fixing across all files for this milestone:

| Variable | Hex | Usage Pattern |
|----------|-----|---------------|
| `--ducket-purple` | `#3D2870` | Primary brand, button bg, icon colors |
| `--ducket-purple-light` | `#6B5B95` | Hover states |
| `--ducket-yellow` | `#F5C842` | Accent, ping animation |
| `--ducket-dark` | `#1a1625` | Heading text |

For new elements, use the consistent hex form (`bg-[#3D2870]`) to match existing patterns. Do not introduce `var(--ducket-purple)` in new JSX — it would create mixed patterns.

### Existing Custom CSS Classes — Keep All, May Edit Definitions

| Class | Defined In | Current Use |
|-------|-----------|-------------|
| `.gradient-text` | `index.css` | Hero headline gradient fill |
| `.hero-gradient` | `index.css` | Hero section background |
| `.animate-shine` | `index.css` | Hero overlay animation |
| `.animate-float` | `index.css` | Hero floating glow orb |
| `.feature-card` | `index.css` | Feature card gradient (unused — Home uses inline classes) |

The `.feature-card` class is defined but not referenced in current JSX. Safe to delete if cleaning up.

---

## Build Order for Visual Refresh

Given the integration dependencies above, this order minimizes risk of breaking contract flows while iterating on UI:

**1. `constants/copy.ts` — Create the file**
Extract current strings from pages. Zero visual change. Zero risk. Validates the import pattern before any layout work begins.

**2. `pages/HowItWorks.tsx` — Start here**
Fully static page. No hooks, no contract calls, no state. Safest place to validate copy constants pattern and new layout direction. Any mistake here is trivially fixed.

**3. `pages/Home.tsx` — Hero and features sections**
Uses only `useEventData` (read-only, no write). Copy changes are independent. Layout changes to hero and features do not touch the events grid JSX, which consumes the `events` array. Edit hero and features first; event grid last.

**4. `pages/Resale.tsx` — Listing grid and info banner**
Uses `useResaleListings` (read) and `useResalePurchase` (write). Info banner and empty state are safe. Listing card layout edits must preserve: `handleBuy(listing)` call, `isSelectedListing` / `isPending` / `isSuccess` conditional renders on each card's buy button.

**5. `pages/Event.tsx` — Event detail and purchase sidebar**
Most complex page. The purchase sidebar contains the full state machine rendered in JSX. Work left column first (event info card, ticket rules card — safe), then sidebar last. In the sidebar: copy changes to button labels and step messages are safe; layout changes must preserve all `purchase.*` conditional renders and the quantity/payment method state interactions.

**6. `pages/MyTickets.tsx` — Owned ticket cards and modal**
Most stateful page. Has XCM verification, resale listing modal, `listedTokenIds` set, `verifications` localStorage map, and `activeVerifyTokenId`. Change copy and badge styling first. The resale modal (`Dialog`) is safe to refactor visually because the `list()` call and price validation are in `handleSubmit`, isolated from layout. XCM button rendering is conditional on `verifications.has(tier.tokenId)` — preserve this check.

**7. `Header.tsx` and `DemoBanner.tsx` — Last**
These render on every page. Verify each page still works after header height or layout changes (note the `h-20` spacer div in Header). DemoBanner copy change is trivial and safe anytime.

---

## Anti-Patterns

### Anti-Pattern 1: Moving Hook Calls Into Extracted Section Components

**What people do:** Extract a large page section into a new component file, then move the hook calls inside to avoid prop drilling.

**Why it's wrong:** wagmi hooks (`useReadContracts`, `useWriteContract`) have internal deduplication based on call site. Moving hook calls into child components can create duplicate RPC calls or break wagmi's batching. The purchase state machine in `usePurchaseTicket` uses `useEffect` that responds to page-level state — splitting across components breaks the state flow.

**Do this instead:** Extract UI sections as local function components inside the page file. Pass hook return values as props. Keep all hook calls at the page level.

### Anti-Pattern 2: Editing shadcn/ui Primitive Files

**What people do:** Modify `components/ui/button.tsx` or `components/ui/card.tsx` to change global styling.

**Why it's wrong:** shadcn components are generated, version-tracked code. Editing them makes future shadcn regenerations destructive. They also affect every consumer simultaneously.

**Do this instead:** Override at the call site using the `className` prop — shadcn uses `cn()` which merges and Tailwind handles conflicts. To change button appearance globally, edit only the variant definition in the `buttonVariants` config at the top of `button.tsx`.

### Anti-Pattern 3: Per-Page Copy Files

**What people do:** Create `constants/home-copy.ts`, `constants/event-copy.ts`, etc.

**Why it's wrong:** For a 5-page dApp with one brand voice, per-page split adds file navigation overhead with no benefit. Copy review requires opening multiple files. Voice consistency is harder to spot-check.

**Do this instead:** One `constants/copy.ts` with named top-level exports per page (`HOME`, `EVENT_PAGE`, `RESALE_PAGE`, `MY_TICKETS`, `HOW_IT_WORKS_PAGE`). Single import per page, all copy reviewable in one file.

### Anti-Pattern 4: Adding Layout-Specific CSS Classes to `index.css`

**What people do:** Add `.hero-cta-container` or `.trust-badge-row` classes to `index.css` for one-off layout elements.

**Why it's wrong:** `index.css` currently contains only: Tailwind directives, shadcn CSS variables, Ducket brand color variables, and two reusable animation/gradient classes. Polluting it with layout classes defeats Tailwind's utility-first approach and creates hidden dependencies.

**Do this instead:** Use Tailwind utilities directly in JSX. Reserve `index.css` additions strictly for: new keyframe `@keyframes` definitions, gradient definitions that are too complex for `bg-[]` arbitrary values, or new CSS custom property declarations.

### Anti-Pattern 5: Editing `eventMetadata.ts` for Copy Rewrite

**What people do:** Rewrite event descriptions and tier descriptions in `eventMetadata.ts` as part of the copy overhaul.

**Why it's wrong:** `eventMetadata.ts` is a data file keyed to on-chain event IDs. The event names, tier names, and some descriptions are seeded on-chain (`eventName` in the contract). Changing `eventMetadata.ts` without matching on-chain data creates drift between what the contract knows and what the UI shows.

**Do this instead:** If descriptions need to change, treat them as intentional data edits separate from the UI copy overhaul. Flag them explicitly when reviewing — they are not the same as rewriting a CTA or page heading.

---

## Scaling Considerations

Not applicable to this milestone — this is a UI/UX refinement, not a scaling exercise. The architecture is correct for the hackathon scope.

For reference only: the flat page structure and local state approach becomes a limitation around 15+ pages or when shared purchase state is needed across routes. For this 5-page dApp, it is the right choice.

---

## Sources

- Direct codebase inspection of `frontend/src/` (2026-03-17)
- All findings are from reading actual source files, not inferred from documentation

---

*Architecture research for: Ducket Polkadot — v1.1 UI/UX refinement milestone*
*Researched: 2026-03-17*
