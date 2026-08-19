# Task 8: Optimize Technique Panel to Avoid Message Replication

## What was implemented

Replaced the expandable technique toggle with a static display row. The technique section previously duplicated the `pourStyle` text in both the collapsed header and expanded content — now it shows a single, non-interactive row.

## Changes

### `src/components/BrewScreen.tsx`
- **Removed** `showTechnique` state variable (line 134) — no longer needed
- **Replaced** the expandable technique section (lines 420–451) with a static `<div>` display row
- The static row retains the same visual styling (Activity icon, label, truncated pourStyle text) without toggle behavior or `AnimatePresence`

### Not changed
- `ChevronRight` import was **kept** — still used by the Flow Rate Telemetry toggle (line 467)

## Verification
- `vite build` passes successfully (2107 modules transformed, built in ~4.5s)
- No new TypeScript errors introduced (pre-existing `--jsx` and framer-motion type warnings remain unchanged)

## Issues
- None
