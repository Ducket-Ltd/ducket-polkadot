---
phase: 09-micro-interactions-demo-hardening
plan: 01
subsystem: ui
tags: [sonner, toast, micro-interactions, timeout, wagmi, react]

# Dependency graph
requires:
  - phase: 08-layout-and-visual-polish
    provides: Button component, useEventData hook, Event.tsx purchase flow, Home.tsx events listing
provides:
  - Sonner toast system globally mounted
  - Button press feedback via Tailwind active:scale
  - 8-second RPC timeout with retry fallback in useEventData
  - Toast notifications on purchase success and error in Event.tsx
  - Timeout fallback UI with Retry button in both Home.tsx and Event.tsx
affects:
  - 09-02 (animation plan — button component is now final, do not convert to motion.button)

# Tech tracking
tech-stack:
  added: [sonner@2.0.7]
  patterns:
    - Tailwind active:scale-[0.97] for press feedback (no framer-motion dependency)
    - useEffect with setTimeout 8s pattern for RPC timeout fallback
    - Sonner toast called inside useEffect watching wagmi purchase state

key-files:
  created: []
  modified:
    - frontend/src/App.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/hooks/useEventData.ts
    - frontend/src/pages/Event.tsx
    - frontend/src/pages/Home.tsx

key-decisions:
  - "Used Tailwind active:scale-[0.97] instead of motion.button — simpler, avoids forwardRef complications, no extra dependency"
  - "Wrapped refetch() in arrow function for onClick to satisfy wagmi RefetchOptions type"

patterns-established:
  - "Press feedback: add active:scale-[0.97] transition-transform to CVA base string, not per-variant"
  - "RPC timeout: useEffect on isLoading dep, 8s setTimeout, reset isTimedOut on !isLoading"
  - "Toast on purchase: fire toast.success/toast.error inside useEffect watching purchase.isSuccess and purchase.step"

requirements-completed: [ANIM-03, ANIM-04, DEMO-08]

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 09 Plan 01: Micro-Interactions & Demo Hardening — Foundation Summary

**Sonner toast notifications on purchase events, tactile button press via active:scale, and 8-second RPC timeout fallback with retry button across Home and Event pages**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T08:47:54Z
- **Completed:** 2026-03-17T08:50:45Z
- **Tasks:** 2
- **Files modified:** 5 (+ package.json, package-lock.json)

## Accomplishments
- Installed sonner@2.0.7 and mounted global `<Toaster position="bottom-right" richColors />` in App.tsx
- Added `active:scale-[0.97] transition-transform` to Button CVA base string for tactile press feedback on all Button instances
- Added `isTimedOut` state to `useEventData` with 8-second `setTimeout` that resets when loading completes
- Wired `toast.success` and `toast.error` calls in Event.tsx on purchase outcome state changes
- Added timeout fallback UI (message + Retry button with RefreshCw icon) to both Home.tsx and Event.tsx instead of infinite spinner

## Task Commits

Each task was committed atomically:

1. **Task 1: Install sonner, Toaster, button press feedback, RPC timeout hook** - `9ee6f54` (feat)
2. **Task 2: Wire toast notifications and timeout fallback UI** - `1e3ec0c` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `frontend/src/App.tsx` - Added `Toaster` import and `<Toaster position="bottom-right" richColors />` before Header
- `frontend/src/components/ui/button.tsx` - Added `active:scale-[0.97] transition-transform` to CVA base string
- `frontend/src/hooks/useEventData.ts` - Added `isTimedOut` state with useEffect + 8s setTimeout, returned in hook value
- `frontend/src/pages/Event.tsx` - Added toast import, toast.success on success, toast.error useEffect on error, timeout fallback branch
- `frontend/src/pages/Home.tsx` - Added RefreshCw import, isTimedOut/refetch destructure, timeout fallback ternary branch

## Decisions Made
- Used Tailwind `active:scale-[0.97]` instead of `motion.button` — keeps Button as a standard forwardRef component, no framer-motion dependency required for press feedback
- Wrapped `refetch()` in `() => refetch()` arrow function for `onClick` to satisfy wagmi's `RefetchOptions` vs `MouseEvent` type mismatch

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Wrapped refetch in arrow function for onClick type compatibility**
- **Found during:** Task 2 (Event.tsx timeout fallback)
- **Issue:** `onClick={refetch}` caused TS2322 — wagmi's refetch signature expects `RefetchOptions`, not `MouseEvent`
- **Fix:** Changed to `onClick={() => refetch()}` (same pattern already used in Home.tsx)
- **Files modified:** `frontend/src/pages/Event.tsx`
- **Verification:** `npx tsc --noEmit` — zero errors after fix
- **Committed in:** `1e3ec0c` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type bug)
**Impact on plan:** Minor type fix only. No scope creep.

## Issues Encountered
- TypeScript rejected `onClick={refetch}` on the timeout fallback Button in Event.tsx because wagmi's refetch return type is `Promise<QueryObserverResult>` parameterized by `RefetchOptions`, which is incompatible with `MouseEventHandler`. Fixed inline with arrow wrapper.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Sonner toast system is live and globally available — Plan 02 can call toast anywhere without setup
- Button component is final — Plan 02 should use Tailwind hover classes, not convert Button to motion.button
- `isTimedOut` is exported from `useEventData` — available for any future page that adds loading states
- Build passes clean (`npm run build` success, 3.92s)
- TypeScript zero errors

## Self-Check: PASSED

All created/modified files confirmed present. Both task commits (9ee6f54, 1e3ec0c) confirmed in git log.

---
*Phase: 09-micro-interactions-demo-hardening*
*Completed: 2026-03-17*
