# Task 7: Move Flow Rate Telemetry Above Technique

## What was implemented

Swapped the order of the Flow Rate Telemetry and Technique sections in `BrewScreen.tsx`. Flow Rate Telemetry now appears above Technique in the timer view for better information hierarchy.

## Files changed

- `src/components/BrewScreen.tsx` — reordered JSX: Flow Rate Telemetry (lines 420-458) now precedes Technique (lines 460-467)

## Notes

- The file had already been modified from the task description (Technique was a static display, not expandable). Adapted to the current state.
- TypeScript compilation passes with no errors.

## Commits

- `fix: reorder brew screen - flow rate telemetry above technique`
