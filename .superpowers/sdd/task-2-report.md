# Task 2: Remove Journal Badge from HomeScreen

## What was implemented

Removed the excessive journal brew count badge from the HomeScreen header and the count from the Journal bento card.

## Changes made

1. **Removed header journal badge button** — Deleted the `<button onClick={onViewHistory}>` containing the `<Compass>` icon and zero-padded brew count. Only the language switcher remains in the header's right side.

2. **Removed count from Journal bento card** — Removed the `({logs.length})` count from the JOURNAL eyebrow. The eyebrow now shows just `JOURNAL`.

3. **Removed unused `cupsCount` variable** — Deleted the `const cupsCount = logs.length.toString().padStart(2, '0');` line since it's no longer referenced.

4. **Kept `Compass` import** — The import is still used for the Journal bento card icon at line ~396.

## Files changed

- `src/components/HomeScreen.tsx`

## Verification

- TypeScript compilation: no errors (`tsc --noEmit` passed)
