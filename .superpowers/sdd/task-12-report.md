# Task 12: Fix PWA Mode iOS Status Bar Overlap

## What Was Implemented

Added iOS safe area insets to prevent PWA content from overlapping the status bar. Three changes:

1. **`src/App.tsx` `<main>` tag** — Replaced `pt-4` with inline `paddingTop: 'max(1rem, env(safe-area-inset-top))'` so the main content respects the safe area on iOS.
2. **`src/App.tsx` floating `<nav>`** — Changed `bottom-6` to inline `bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1.5rem))'` so the nav floats above the home indicator.
3. **`src/index.css` `body`** — Added `padding-top`, `padding-left`, and `padding-right` using `env(safe-area-inset-*)` to handle all safe area edges.

## Files Changed

- `src/App.tsx` (2 edits)
- `src/index.css` (1 edit)

## Issues

None. TypeScript compiles cleanly (`tsc --noEmit` passes).

## Notes

- In non-PWA mode, `env(safe-area-inset-*)` resolves to `0`, so these changes are safe for all platforms.
- The `viewport-fit=cover` meta tag was already present in `index.html`.
