# Feature Research

**Domain:** UI/UX Refinement — Hackathon Demo Polish for dApp
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH (copy patterns HIGH, hackathon judge behavior MEDIUM, DoraHacks-specific MEDIUM)

---

## Context: What Already Exists

Before table stakes vs differentiators, the existing pages are:

- **Home.tsx** — hero, trust badges (5x checkmarks), feature cards (4x), event grid
- **Event.tsx** — ticket selection sidebar, purchase flow, fee display, payment method toggle
- **MyTickets.tsx** — ticket grid with QR codes, XCM attestation button, resale modal
- **Resale.tsx** — listing grid with price cap badges, markup indicator, buy flow
- **HowItWorks.tsx** — 4-step explainer, 4-feature section, CTA
- **Header.tsx** — fixed nav, wallet connect, transparent-to-white scroll behavior

The code structure is clean. The problems are copy and visual hierarchy — not missing features.

---

## Feature Landscape

### Table Stakes (What Makes a Demo Feel Complete)

These are not new features to build. They are the existing features done at the quality bar that judges expect.

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| One-sentence hero that explains what the product does | Judges read this first. If they don't understand in 3 seconds, they move on. | LOW | Failing — "Blockchain-Powered Ticketing on Polkadot Hub" describes tech stack, not value. |
| Hero CTA that lands somewhere useful | The primary CTA must work, lead to visible content, and feel obvious. | LOW | Passing — scrolls to event grid, works fine. |
| Event grid that loads real data | A static mock grid signals a prototype, not a product. | LOW | Passing — loads from contract via useEventData hook. |
| Feature section that explains a specific advantage, not a buzzword | Judges skim feature cards for "so what?" A card titled "Reimagined" answers nothing. | LOW | Failing — "Ticketing, Reimagined" is the headline. Cards contain "mathematically impossible" jargon. |
| Purchase flow that clearly shows what happens next | Users must know they are confirming in MetaMask, then waiting, then done. | LOW | Passing — step indicator exists (approving → confirming → success). |
| Empty states that aren't dead ends | If MyTickets has no tickets, it should explain that and offer a next action. | LOW | Passing — "No Tickets Yet" with Browse Events button exists. |
| Error states that explain what went wrong | "Transaction Failed" is table stakes. Cryptic hex errors are not. | LOW | Passing — error messages surface in purchase flow. |
| Navigation that shows where you are | Active state on current nav item. | LOW | Failing — no active state on nav links. |
| Consistent visual hierarchy across pages | Section headers, body copy, and metadata all have distinct visual weight. | LOW | Partial — generally ok but trust badge text has same visual weight as main copy. |

### Differentiators (What Makes This Demo Stand Out)

These are the specific things that separate a "good demo" from a "template demo." Each one is an execution improvement, not a new feature.

| Feature | Value Proposition | Complexity | Current State |
|---------|-------------------|------------|---------------|
| Copy that sounds like a person wrote it | Judges read dozens of submissions. Human copy is rare and memorable. "Your ticket. Your wallet. No middlemen." beats "Non-Custodial — Your Wallet, Your Tickets" every time. | LOW | Not done. Current copy has staccato fragments and jargon like "mathematically impossible." |
| A hero that leads with the user problem, not the tech | "Tickets that can't be scalped" vs "Blockchain-Powered Ticketing." Same product, very different first impression. | LOW | Not done. Current hero leads with tech. |
| Feature cards with a single concrete claim each | "Resale prices are capped in the contract — the organizer can't raise them later" beats "Price-Capped Resale." Judges understand the actual protection. | LOW | Not done. Cards mix buzzwords with partial explanations. |
| Trust signal consolidation — one strong signal instead of five weak ones | Five checkmarks in a row dilutes everything. One clear on-chain verification fact is more credible than five vague claims stacked. | LOW | Not done. Five trust badges currently exist in hero. |
| Visual hierarchy that guides the demo flow | Demo flow: hero → browse event → purchase → my tickets → resale. Each page should visually surface what to look at next. Currently all sections have similar visual weight. | MEDIUM | Partial. Flow exists but sections don't guide eye movement. |
| Copy consistency in the purchase sidebar | "Purchase Tickets" button is fine. But "Verified on Polkadot — tickets are on-chain NFTs" inside the sidebar is redundant with the homepage. Replace with something transaction-specific. | LOW | Not done. Sidebar has redundant trust copy. |
| MyTickets page that celebrates ownership | After purchasing, the user lands on MyTickets. The page should feel like arriving, not like a data table. A clear statement at the top changes the emotional register. | LOW | Not done. Page header reads "NFT tickets owned by your connected wallet" — functional but cold. |
| Visible active nav state | Small detail, large signal. An active nav state tells judges this was built with care. Missing it says "template." | LOW | Not done. |

### Anti-Features (Do Not Build These)

These all seem like improvements. Most would waste the 5-day timeline, break what works, or make the UI worse.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Animation overhaul — particle effects, scroll reveals, page transitions | Looks impressive in isolation, signals effort to judges | Over-animation is the #1 marker of a template UI. It competes with content for attention. Judges notice the product, not the motion. | Keep the existing hover transitions. Do not add scroll-triggered animations. |
| Dark mode toggle | Looks polished, often demoed by hackathon teams | Doubles CSS maintenance. Breaks brand colors unexpectedly. Distracts from the actual demo path. | Use the existing light theme. It is clean. Don't touch it. |
| More trust badges | More signals should mean more credibility (incorrect assumption) | Research from Kinsta and TrustedSite confirms 5+ trust badges dilute all of them. "Too many trust badges can have the opposite effect and make your website look cluttered and unprofessional." | Cut to 2-3 badges. Move the rest into body copy where claims can be explained. |
| Loading skeleton screens | Looks more polished than spinners | Skeleton screens take 2-3x longer to implement correctly than spinners. The app already has working loading states. | Keep Loader2 spinners. They work. |
| Onboarding tour or tooltip guide | Reduces confusion for new users | This is a hackathon demo, not a production product. Judges won't need a tour. It adds noise and build time. | HowItWorks page already explains the flow. Link to it from the hero. |
| Restructuring the purchase flow | Could reduce friction | The existing purchase flow (select tier → quantity → payment → buy) is already correct. Changing it risks introducing bugs 3 days before submission. | Fix copy only. Do not touch the flow. |
| Implementing actual XCM cross-chain transfers | Shows real Polkadot-native capability | Already scoped out for good reason. 5-day timeline, architectural complexity. The "Emit XCM Attestation" button already exists and demos the concept. | Keep existing attestation flow. Update copy to explain what it does clearly. |
| Mobile layout redesign | More complete product | Judges demo on laptops. Web-first is correct for this timeline. Mobile layout changes break desktop. | Verify nothing is broken on mobile, then leave it. |

---

## Feature Dependencies

```
Copy overhaul (all pages)
    └──enables──> Visual hierarchy improvements
                  (hard to see hierarchy problems with noisy copy)
                      └──enables──> Trust signal consolidation
                                    (need clean copy before deciding what stays)

Hero section clarity
    └──enhances──> Entire demo flow
                   (judges form opinion from hero; clean hero = benefit of the doubt on later pages)

Trust badge reduction (hero)
    └──conflicts──> Adding more trust signals elsewhere
                    (don't relocate the problem, solve it)

Purchase flow (Event.tsx)
    └──do not touch──> Works correctly end-to-end; any change risks regression

XCM attestation (MyTickets.tsx)
    └──copy update only──> Change button label to something clearer; do not change the function
```

### Dependency Notes

- **Copy must come before layout**: Changing layout before rewriting copy means you'll lay out the wrong words. Write copy first, then adjust spacing and hierarchy.
- **Hero clarity unlocks everything downstream**: Judges extend goodwill to subsequent pages when the first impression is clear. Fix the hero before polishing inner pages.
- **Purchase flow isolation**: Event.tsx purchase sidebar works correctly with real contract calls. Do not restructure this component.

---

## MVP Definition

### Launch With (v1.1 — in 5 days)

The milestone goal is to transform the existing UI from template-looking to crafted. This is what must be done.

- [ ] Rewrite hero headline — lead with user benefit, not tech stack
- [ ] Rewrite hero subheadline — one concrete claim about what Ducket prevents, not what powers it
- [ ] Reduce hero trust badges from 5 to 2-3 — keep only the most specific, verifiable ones
- [ ] Rewrite feature section headline — remove "Reimagined"
- [ ] Rewrite each feature card description — one concrete claim per card, no buzzwords
- [ ] Add active nav link styling — shows current page
- [ ] Rewrite MyTickets page header — feel of ownership, not a data label
- [ ] Update XCM attestation button label — "Verify Ownership" instead of "Emit XCM Attestation"
- [ ] Clean up HowItWorks step descriptions — shorter, more direct sentences
- [ ] Remove all instances of: "Reimagined", "mathematically impossible", "DucketV2" (users don't care about version names), "blockchain-powered" (lead with what it means, not what powers it)

### Add After Validation (v1.x — after submission)

- [ ] Actual contract reads replacing mock data — the user noted this is ~1 day effort
- [ ] Mobile layout audit — verify nothing is broken, fix if needed
- [ ] Event image optimization — currently using external URLs

### Future Consideration (v2+)

- [ ] Organizer dashboard — create events from UI
- [ ] Full XCM cross-chain ticket transfer
- [ ] Notification system for ticket purchases
- [ ] Fiat on-ramp integration

---

## Feature Prioritization Matrix

Scoped to v1.1 only — copy and visual hierarchy improvements.

| Feature | Judge Impact | Time Cost | Priority |
|---------|------------|---------------------|----------|
| Hero headline rewrite | HIGH | LOW | P1 |
| Feature card copy rewrite | HIGH | LOW | P1 |
| Trust badge consolidation | HIGH | LOW | P1 |
| Remove "Reimagined" + buzzwords across all pages | HIGH | LOW | P1 |
| MyTickets page header rewrite | MEDIUM | LOW | P1 |
| XCM attestation button label | MEDIUM | LOW | P1 |
| Active nav link state | LOW | LOW | P2 |
| HowItWorks copy cleanup | LOW | LOW | P2 |
| Resale page copy cleanup | LOW | LOW | P2 |
| Animation additions | LOW | HIGH | P3 — do not do |
| Dark mode | LOW | HIGH | P3 — do not do |
| New trust badge types | LOW | MEDIUM | P3 — do not do |

**Priority key:**
- P1: Must have for a polished demo
- P2: Good to have, add in sequence after P1s
- P3: Do not do in this milestone

---

## Copy Anti-Patterns Found in Current Codebase

This section documents the specific copy problems to fix, with line references.

### Buzzwords to Remove

| Location | Current Copy | Problem |
|----------|-------------|---------|
| `Home.tsx:194` | "Ticketing, Reimagined" | "Reimagined" is the most overused word in web3/startup copy. Says nothing. |
| `Home.tsx:47` | "Scalping is impossible. Counterfeits don't exist." | Staccato fragments feel like a ChatGPT bullet list, not a product description. |
| `Home.tsx:212` | "Scalping is mathematically impossible." | "Mathematically impossible" is developer jargon masking a simple true claim. Say "the contract enforces the cap" instead. |
| `HowItWorks.tsx:43` | "There is no backend to bypass — the rule is the code." | Correct, but sounds like a developer talking to developers, not a user. |
| `Home.tsx:37` | "Blockchain-Powered Ticketing on Polkadot Hub" | Leads with mechanism. Users care about outcome. "Fair tickets" or "Tickets scalpers can't touch" says the same thing in user terms. |
| `Home.tsx:84` | "On-Chain Resale Cap — Scalping Is Impossible" | Compound claim inside a badge. Too dense for a trust signal. Split into one claim or drop it. |
| `Home.tsx:206` | "XCM-Ready Verification" (card title) | "XCM-Ready" means nothing to non-Polkadot users. Rename to what it does: "Cross-Chain Ticket Proof" or "Verifiable Anywhere on Polkadot." |
| `HowItWorks.tsx:48` | "First NFT Ticketing dApp on Polkadot Hub" | Bold claim. Only use if verifiably true and cited. Otherwise cut it — judges will call this out. |

### AI-Sounding Patterns to Avoid in Rewrites

Based on research into common AI copy tells (sources: kraabel.net, authenticai.co, copyhackers.com):

- Staccato lists of fragments: "Scalping is impossible. Counterfeits don't exist. Your wallet holds your ticket."
- Rhetorical superlatives: "mathematically impossible," "protocol-level," "trustlessly"
- Feature-first framing: leading with what the tech does before what the user gets
- Compound trust badges: packing two claims into one short label
- Generic section intros: "Upcoming Events" badge above "Find Your Next Experience" — the label adds nothing

### Copy Tone That Works

Observed in Polkadot hackathon winning project descriptions and strong product copy:

- **Direct statements**: "Your ticket lives in your wallet. Only you can transfer it." (not: "Non-custodial ownership.")
- **Concrete specifics**: "Resale price is capped at 150% of face value." (not: "Price-capped resale.")
- **Outcome-first**: "Buy tickets that scalpers can't touch." (not: "Blockchain-Powered Anti-Scalping.")
- **No rhetorical setup**: Skip "In a world where..." and "Ticketing, reimagined." Get to the point.
- **One claim per sentence**: Don't combine two distinct features into one badge or bullet.
- **Human voice**: Write like you're explaining it to a friend who doesn't code. Then tighten it.

### Specific Rewrite Targets (Copy Suggestions, Not Prescriptions)

These are directional suggestions to inform the implementer:

| Location | Current | Suggested Direction |
|----------|---------|---------------------|
| Hero h1 | "Blockchain-Powered Ticketing on Polkadot Hub" | Something like "Tickets that scalpers can't touch" or "Fair ticketing, enforced by code" — outcome-first, one claim |
| Hero subheadline | "DucketV2 smart contracts enforce fair pricing at the protocol level. Scalping is impossible. Counterfeits don't exist. Your wallet holds your ticket." | 1-2 sentences max. "Smart contracts set the resale cap. No one — not the organizer, not Ducket — can change it after tickets go on sale." |
| Features h2 | "Ticketing, Reimagined" | Something factual: "How it works differently" or "What the contract enforces" |
| Feature card: XCM | "XCM-Ready Verification" | "Verifiable across Polkadot" with a clear explanation of what that means for the holder |
| Feature card: Price cap | "Scalping is mathematically impossible." | "The resale cap is in the contract. No one can override it." |
| MyTickets header | "NFT tickets owned by your connected wallet" | "Your tickets" — let the QR codes and event names speak |
| XCM button label | "Emit XCM Attestation" | "Record on-chain proof" or "Verify ticket ownership" |
| Resale info banner | "Price Protection Active" | "Resale cap enforced by contract" — more specific, same reassurance |

---

## Hackathon Judge Patterns (Research Findings)

These are observations from DoraHacks judge feedback, Devpost official judging tips, and Polkadot hackathon winner patterns. Confidence: MEDIUM (WebSearch + Devpost official sources, not primary interviews).

### What Judges Actually Notice

1. **Visual appeal is assessed first** — "The first thing we look at is how visually appealing the project is." (Google judge, Devpost judging guide). Clean beats flashy.

2. **Demo video is the first filter** — Judges use the video to assess "how much time was invested." A clean, working demo that shows a real flow scores higher than a polished-but-shallow interface.

3. **Working beats beautiful** — Judging criteria weights for most hackathons: functioning MVP (40%), team (30%), market potential (20%), pitch quality (10%). A working purchase flow matters more than design polish. But design polish is the entry cost to being taken seriously.

4. **Storytelling in submission text matters** — "Storytelling within the video and the text description definitely helps keep judges engaged." The DoraHacks submission copy (title, description, tags) is as important as the UI. This is often overlooked.

5. **Web3 UX is known to be bad** — "Make your dApp actually usable — Web3 UX is often terrible, so standing out on user experience can win you prizes." A clean, clear flow is a competitive advantage in this space, not just hygiene.

6. **Style without substance is penalized** — One judge (Databricks, via Devpost) explicitly called out projects that "built a home page for their project which looked really slick, but then...it was a lot lighter on code." Polish and functionality must both be present.

### What Polkadot-Specific Judges Look For

From OpenGuild/Polkadot hackathon past winner descriptions (build.openguild.wtf):

- "User-centric design" is explicitly cited in multiple winning project descriptions
- Accessibility and ease-of-use for non-crypto users is valued — one winner (Delegit) won specifically for "outstanding UX and design" in governance
- Cross-chain features (XCM) that actually demo score well — even a PoC signals architectural awareness
- Projects that explain *why* they chose Polkadot Hub (not just any EVM chain) get ecosystem-alignment credit

### The 30-Second Impression

Judges see many projects. The first 30 seconds of the demo or the first scroll of the homepage forms the judgment:

- **Headline clarity**: do I know what this does?
- **Visual quality**: does this look like something real people would use?
- **Proof of work**: is there actual functionality visible, not just mockups?

Ducket currently passes proof of work (real contract integration exists). It partially fails headline clarity (hero leads with tech) and partially fails visual quality (trust badge overload, buzzword copy in feature cards).

---

## Competitor Feature Analysis

Scoped to how similar products present themselves to users and judges — not a full competitor analysis.

| Design Element | Eventbrite | Seatlab (web3) | TokenVibe (web3) | Ducket Current | Ducket Target |
|----------------|------------|----------------|------------------|---------------|---------------|
| Hero framing | "Create experiences worth sharing" (outcome) | "NFT ticketing for the next generation" (vague) | "Tickets as tokens your fans actually own" (concrete) | "Blockchain-Powered Ticketing on Polkadot Hub" (tech) | Outcome-first, one claim, human voice |
| Trust signals | Organizer logos, volume stats | Security certification badges | Chain explorer links | 5 checkmark badges (too many) | 2 specific verifiable claims |
| Feature framing | Benefit-first ("Grow your audience") | Tech-first ("ERC-721 NFTs") | Mixed | Mixed (buzzwords + facts) | Benefit-first with one supporting fact |
| Copy tone | Warm, human | Technical, developer-facing | Enthusiastic | AI-pattern staccato | Direct, confident, human |

TokenVibe is the closest analog to Ducket's target. Their copy principle — leading with what the token holder gets, not what the tech enables — is the right pattern to follow.

---

## Sources

- [Devpost: How to win a hackathon — advice from seasoned judges](https://info.devpost.com/blog/hackathon-judging-tips)
- [OpenGuild: Past Polkadot Hackathon Winners](https://build.openguild.wtf/past-hackathon-winners)
- [Algorand Foundation: How to win a Web3 hackathon](https://algorand.co/blog/how-to-win-web3-hackathon-survival-guide)
- [Kinsta: Trust Badges 101](https://kinsta.com/blog/trust-badges/)
- [TrustedSite: The worst trust badge mistakes](https://blog.trustedsite.com/2021/07/12/the-worst-trust-badge-mistakes-that-send-customers-running-and-how-to-fix-them/)
- [LogRocket: Linear-style design explained](https://blog.logrocket.com/ux-design/linear-design/)
- [AuthenticAI: 5 common ChatGPT clichés to avoid](https://authenticai.co/blog-feed/5-common-chatgpt-words-to-avoid)
- [dabit3: How to Give a Killer Hackathon Demo (GitHub gist)](https://gist.github.com/dabit3/caef5eee4753dd7d23767bc31e70da28)
- [Phenomenon Studio: Top UI/UX mistakes in web3 apps](https://phenomenonstudio.com/article/top-ui-ux-mistakes-in-web3-apps-and-how-to-avoid-them/)
- [CopyHackers: Replacing copywriters with AI is bad for your brand](https://copyhackers.com/2025/12/replacing-copywriters-with-ai/amp/)
- [Stripe: Fundamental design principles (Medium case study)](https://medium.com/think-senpai/fundamental-design-principles-using-stripe-as-a-case-study-33a0a635e2ca)
- Direct codebase analysis: Home.tsx, Event.tsx, MyTickets.tsx, Resale.tsx, HowItWorks.tsx, Header.tsx

---

*Feature research for: Ducket Polkadot — UI/UX Refinement for Hackathon Demo*
*Researched: 2026-03-17*
