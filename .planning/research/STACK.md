# Stack Research

**Domain:** Web3 dApp UI/UX Refinement — visual polish and copy overhaul for existing React/Tailwind/shadcn frontend (Ducket Polkadot v1.1)
**Researched:** 2026-03-17
**Confidence:** HIGH — all new additions verified via npm version confirmations, official library docs, and multiple sources

---

## Context: What Already Exists (Not Re-Researched)

This is an additive milestone on top of a working frontend. The following are locked and require no changes.

| Layer | Tech | Version |
|-------|------|---------|
| UI framework | React | 18.2.0 |
| Build | Vite | 5.1.6 |
| Styling | Tailwind CSS | 3.4.1 |
| Animation (existing) | tailwindcss-animate | 1.0.7 |
| Components | shadcn/ui (button, card, badge, dialog, input, separator) | installed |
| Variant mgmt | class-variance-authority | 0.7.0 |
| Icons | lucide-react | 0.363.0 |
| State/data | wagmi 2.5.0 + viem 2.9.0 + @tanstack/react-query 5.28.0 | locked |
| Routing | react-router-dom | 6.22.3 |
| Contracts | Solidity 0.8.24 + Hardhat + @openzeppelin/contracts 5.0.0 | locked |

---

## Recommended New Additions for v1.1

### Core New Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `motion` (the new framer-motion) | 12.x (latest: 12.36.0) | Page transitions, entrance animations, hover micro-interactions | Industry standard for React animation. Rebranded from `framer-motion` in late 2024 — identical API, smaller default bundle via LazyMotion. v12 is React 18 and React 19 compatible with no breaking changes. Use imports from `motion/react`. |
| `@fontsource-variable/inter` | latest | Self-hosted Inter variable font | Inter was designed specifically for screen readability and is used by GitHub, Figma, and Linear — exactly the "product-serious" register Ducket v1.1 targets. Variable font = one file for all weights, no extra requests. Self-hosting avoids Google Fonts CDN latency and network dependency on demo day. |
| `sonner` | latest | Toast notifications for purchase flow and tx feedback | shadcn/ui officially deprecated its built-in Toast component in favor of Sonner. Sonner is listed in shadcn docs as the replacement. Single-line setup, integrates with existing Tailwind theme, accessible by default. Needed for "Ticket purchased" / error states in the demo flow. |

### Supporting Libraries — DO NOT ADD

| Library | Why to Skip |
|---------|------------|
| `@formkit/auto-animate` | Redundant with `motion`; adds a second animation runtime. Use `motion` for everything animated. |
| `react-spring` | Different mental model (spring-first vs declarative). Only worth it for physics simulations. `motion` covers all v1.1 needs with less complexity. |
| `gsap` | GSAP excels at timeline-driven scroll storytelling on marketing sites. A ticketing dApp doesn't need it, and the bundle cost (~50KB min+gzip) isn't justified. |
| Aceternity UI / MagicUI | These libraries provide dramatic effects (spotlight, particles, 3D card flip, beam animations) that directly contradict the Stripe/Linear design goal. The v1.1 brief is restraint, not spectacle. |
| Plus Jakarta Sans | Visually similar to Inter, no meaningful differentiation for a 3-day sprint. Inter is already the font Linear and Stripe use. One font, done. |
| Storybook | No value at hackathon scale. Adds ~10 min setup and zero demo value. |
| Zustand / Jotai | No new global state is introduced by this milestone. TanStack Query already handles server state. |
| `next-themes` | This is a Vite/React project, not Next.js. Dark mode toggle is already handled via the existing CSS custom properties in `index.css`. |

---

## Installation

```bash
# Animation — use `motion` (not framer-motion) for new installs; same API
npm install motion

# Self-hosted Inter variable font — avoids Google Fonts CDN on demo day
npm install @fontsource-variable/inter

# Toast notifications — shadcn officially replaced its Toast with Sonner
npm install sonner
```

---

## Integration Guide

### 1. Inter Font

In `frontend/src/main.tsx` (top of file, before React import):
```tsx
import '@fontsource-variable/inter'
import React from 'react'
// ...
```

In `frontend/tailwind.config.ts` under `theme.extend`:
```ts
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
},
```

In `frontend/src/index.css`, add inside the existing `@layer base` block:
```css
body {
  font-family: 'Inter Variable', Inter, system-ui, sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'; /* Inter optical rendering improvements */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 2. Motion (formerly Framer Motion)

New package name: `motion`. Import path: `motion/react`.

```tsx
import { motion, AnimatePresence } from 'motion/react'

// Entrance fade — wrap any section or card
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: 'easeOut' }}
>
  {children}
</motion.div>

// Staggered list (feature cards, event list)
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {events.map(e => (
    <motion.li key={e.id} variants={item}>
      <EventCard event={e} />
    </motion.li>
  ))}
</motion.ul>

// Subtle card lift on hover — no CSS needed, spring handles it
<motion.div
  whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(61,40,112,0.12)' }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
  <EventCard ... />
</motion.div>

// Button press feedback on primary CTA
<motion.button whileTap={{ scale: 0.97 }}>
  Buy Ticket
</motion.button>

// Page route transition — wrap each page component
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>
```

### 3. Sonner Toast

In `frontend/src/App.tsx`:
```tsx
import { Toaster } from 'sonner'

export default function App() {
  return (
    <>
      <Router>
        {/* ... existing routes */}
      </Router>
      <Toaster position="bottom-right" richColors />
    </>
  )
}
```

Usage in components:
```tsx
import { toast } from 'sonner'

// Success
toast.success('Ticket purchased!', { description: 'Check My Tickets to view your QR code.' })

// Error
toast.error('Transaction failed', { description: error.shortMessage })

// Loading (for wallet confirmation wait)
const id = toast.loading('Confirming transaction...')
toast.dismiss(id)
```

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` package name | Legacy package name (still works, still maintained, but `motion` is the official successor with cleaner imports) | `npm install motion`, import from `motion/react` |
| Google Fonts CDN `<link>` for Inter | External CDN = single point of failure on demo day; also triggers network tab inspection by judges | `@fontsource-variable/inter` bundled with Vite |
| shadcn/ui built-in Toast component | Explicitly deprecated by shadcn team in favor of Sonner | `sonner` |
| Custom CSS keyframes for entrance animations | Hard to maintain, inconsistent easing, no gesture support | `motion` declarative variants |
| Heavy Tailwind `keyframes` in `tailwind.config.ts` | Already have `tailwindcss-animate` for accordion; adding more keyframes creates a parallel animation system | Use `motion` for all non-accordion animations |
| Poppins / Space Grotesk / Sora | These fonts read as "Web3 template" — Sora especially is associated with low-effort crypto projects. Inter reads as "product-serious." | Inter via `@fontsource-variable/inter` |
| Aceternity UI spotlight / beam components | Conflict with clean, content-first design brief. Linear's power comes from its restraint. | Roll micro-interactions with `motion` primitives |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `motion` | `framer-motion` | If the project already had `framer-motion` installed — API is identical, migration is a package name swap, not worth doing mid-sprint |
| `@fontsource-variable/inter` | Google Fonts CDN | Acceptable for non-demo projects where CDN reliability isn't a risk |
| `sonner` | `react-hot-toast` | Either is fine for basic toasts; Sonner wins for shadcn projects because the official docs redirect there |
| Tailwind `hover:` utilities for simple effects | `motion whileHover` | Use Tailwind `hover:` for color and opacity; use `motion whileHover` when you need spring-based scale or translate that feels physical |

---

## Design Patterns for Stripe/Linear Energy

These patterns require no new libraries beyond the three additions above. All achievable with `motion` + existing Tailwind.

**Restraint over decoration.** Linear achieves its premium feel through whitespace, type scale, and subtlety — not animations. The animations support the content; they don't compete with it.

| Pattern | Implementation | Goal |
|---------|---------------|------|
| Entrance fade on page load | `motion.div` with `initial={{ opacity: 0, y: 16 }}` | Content feels placed, not rendered |
| Staggered card grid | `staggerChildren: 0.07` on list container | Event grid reads as a deliberate presentation |
| Hover lift on cards | `whileHover={{ y: -3 }}` with spring | Depth without CSS box-shadow hacks |
| CTA press feedback | `whileTap={{ scale: 0.97 }}` | Confirms the button registered |
| Route fade | `AnimatePresence` + page opacity 0→1 in 200ms | Navigation feels instant, not jarring |
| Reduce border-radius | Set `--radius: 0.375rem` in `index.css` (from 0.5rem) | Tighter, less "template" feel |
| Increase line-height | `leading-relaxed` on body copy | More readable, less cramped |
| Remove excess badges | Delete 3+ feature badge rows; keep one trust signal | Information density, not feature count, wins demos |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `motion` 12.x | React 18.2.0 | Confirmed — no breaking changes; also supports React 19 |
| `motion` 12.x | Tailwind CSS 3.4.1 | No conflict — motion uses inline styles, Tailwind uses class names |
| `motion` 12.x | shadcn/ui Radix primitives | No known conflicts; both operate on the React component tree |
| `sonner` latest | shadcn/ui | Official recommendation from shadcn docs |
| `@fontsource-variable/inter` | Vite 5.1.6 | Standard npm CSS import; Vite handles font file bundling natively |

---

## Stack Patterns by Condition

**If timeline is extremely tight (< 1 day for UI):**
- Prioritize Inter font setup and one motion entrance animation on the homepage hero. Skip Sonner until the purchase flow is wired. The font change alone eliminates the "template" look.

**If the homepage hero still feels cluttered after copy rewrite:**
- Remove the feature card grid entirely. Replace with a single three-column stat row (e.g., "No scalpers. No counterfeits. No volatility."). One line, no icons, no badges.

**If you want the exact Linear look:**
- Linear uses: dark background (`#0F0F0F`), Inter 400/500/600 only, generous section padding (`py-24`), borderless cards on dark surfaces (shadow only on hover), accent color used sparingly (one button, nowhere else). The existing Ducket dark mode CSS variables are close — tighten the padding and reduce border frequency.

---

## Previous Milestone Stack (Preserved Reference)

The following was researched for milestone v1.0 (stablecoin + XCM). It remains accurate and is preserved here for reference since STACK.md is shared.

Key contract additions: `IERC20`, `SafeERC20` (already in `@openzeppelin/contracts 5.0.0`), XCM precompile at `0x00000000000000000000000000000000000a0000`, `MockUSDC.sol` for testnet stablecoin. Frontend: no new npm packages needed — wagmi/viem handle ERC-20 allowance/approve/transfer flows. See the v1.0 research notes in `docs/` or git history for the full breakdown.

---

## Sources

- [motion.dev — Official Motion homepage](https://motion.dev/) — confirms rebranding from framer-motion, package name `motion`, import from `motion/react`. HIGH confidence.
- [npm: framer-motion v12.36.0](https://www.npmjs.com/package/framer-motion) — latest version confirmed, React 18 compatible. HIGH confidence.
- [LogRocket — Best React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — ecosystem survey confirming motion/framer-motion dominance (30.7k stars, 3.6M weekly downloads). MEDIUM confidence.
- [DEV Community — Framer Motion + Tailwind 2025](https://dev.to/manukumar07/framer-motion-tailwind-the-2025-animation-stack-1801) — integration patterns. MEDIUM confidence.
- [shadcn/ui — Sonner component docs](https://ui.shadcn.com/docs/components/radix/sonner) — official deprecation of Toast, recommendation of Sonner. HIGH confidence.
- [Fontsource Inter install guide](https://fontsource.org/fonts/inter/install) — self-hosted setup. HIGH confidence.
- [npm: @fontsource-variable/inter](https://www.npmjs.com/package/@fontsource-variable/inter) — variable font package confirmed. HIGH confidence.
- [925studios — Linear Design Breakdown](https://www.925studios.co/blog/linear-design-breakdown) — Linear's dark bg, bold type, muted gradients methodology. MEDIUM confidence.
- [Motion Primitives (shadcn template)](https://www.shadcn.io/template/ibelick-motion-primitives) — shadcn + motion integration patterns, community adoption. MEDIUM confidence.
- [Merge Rocks — 10 Web3 design trends 2025](https://merge.rocks/blog/10-web3-design-trends-for-2025) — clean UI, dark mode, restraint over decoration as winning dApp signals. MEDIUM confidence.
- [Knock — Top React notification libraries 2025](https://knock.app/blog/the-top-notification-libraries-for-react) — Sonner vs react-hot-toast comparison. MEDIUM confidence.

---

*Stack research for: Ducket Polkadot v1.1 UI/UX Refinement (animation + typography + notifications)*
*Researched: 2026-03-17*
