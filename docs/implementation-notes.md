# Implementation notes (living status)

Where the build is and what's next. **Update this as you go.** Design rationale
lives in `domain-model.md` / `architecture.md`; this file is just the running
state so any agent (or human) can pick up.

## Current phase: pure domain core (no persistence, no UI)

Building and testing the domain model as pure functions **before** committing to
SQLite or UI — that's where the design risk concentrates.

### Done
- **Toolchain**: Jest (`jest-expo` + `@react-native/jest-preset`), `node` test
  env, `@/` alias in tests (`moduleNameMapper`), `babel.config.js`,
  `types: ["jest"]` in tsconfig. `npm test` and `npx tsc --noEmit` are green.
- `src/shared/domain/time/CalendarDay.ts` — logical-day value + `getCalendarDay`
  (domain-model §10).
- `src/features/tracking/domain/StatusPeriod.ts` — status timeline:
  `statusOn` / `isActiveOn` (change-point timeline, `from` inclusive), `startedOn`, `activeSince`
  (domain-model §0).

### Next (rough order)
1. `RecurrenceRule` types + `isDueOn` per fixed kind (daily/weekly/monthly/
   yearly); `quota` is handled specially by the projection (domain-model §4, §8).
2. Entities: `Goal`, `Activity`, `ActivitySchedule`, `ActivityOccurrence`
   (types + invariants).
3. `isEffectivelyActive(activity, goal, day)` — the §0 composition rule
   (goal AND activity active).
4. activityType registry: `checklist` / `counter` / `timer` with
   `metric` / `measure` / `isCompleted` / `emptyProgress` (domain-model §7).
5. Projection: build day `D` (domain-model §8) + resolve display status
   (pending / done / missed).
6. Only then: infrastructure (expo-sqlite repos + mappers + migrations) and UI.

## Decisions taken while building
- **Feature `tracking`** houses Goal / Activity / ActivitySchedule /
  ActivityOccurrence / projection (one bounded context with two aggregates —
  the projection and the status cascade need them together). `Task` (domain-model §6) will be its own small feature later.
- **`CalendarDay` lives in `src/shared/`** because both `activities` and the
  future `tasks` feature need logical days.
- **Test runner: Jest + `jest-expo`** (this closed the open "test runner"
  decision that used to be in `future-features.md`).
