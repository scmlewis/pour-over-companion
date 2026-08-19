# Task 1: Fix iOS Safari Sticky Header Content Bleed

## Status: DONE

## What was implemented

Fixed the iOS Safari WebKit bug where `backdrop-blur` on sticky elements allows content to show through when scrolling. The fix replaces semi-transparent backgrounds with opaque backgrounds and adds a CSS utility class that forces GPU compositing via `translate3d(0, 0, 0)`.

## Files changed

1. **`src/index.css`** — Added `.sticky-header-ios` utility class after `.scrollbar-none` block (line 378-382)
2. **`src/components/BrewScreen.tsx`** — Updated sticky header: removed `backdrop-blur-xl` and `/95` opacity, added `sticky-header-ios` class (line 257)
3. **`src/components/HistoryScreen.tsx`** — Updated sticky header: same pattern (line 78)
4. **`src/components/MethodSelector.tsx`** — Updated sticky header: same pattern (line 41)

## Verification

- TypeScript type check: passed (no errors)
- All 4 edits applied cleanly

## Commit

`8fbf49e` — `fix: iOS Safari sticky header content bleed`
