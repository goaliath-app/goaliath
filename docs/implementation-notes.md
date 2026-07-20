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
- `src/features/tracking/domain/RecurrenceRule.ts` — `RecurrenceRule` union +
  `isDueOn` per fixed kind (daily/weekly/monthly/yearly) + `isFixed` narrowing;
  `quota` is excluded from `isDueOn` at the type level (domain-model §4). Added
  `calendarDayParts` / `isoWeekday` (ISO 1=Mon..7=Sun) to `CalendarDay`.
  Locked in while building: weekday convention is ISO 8601; `monthly`/`yearly`
  never clamp (a day the month/year lacks simply never matches).
- `src/features/tracking/domain/Goal.ts` + `Activity.ts` — the two aggregates'
  entity types (§1, §2), plus `isEffectivelyActive(activity, goal, day)`, the §0
  composition/cascade rule (goal AND activity active). Guards against being
  handed a goal that isn't the activity's own. `activityType` is a placeholder
  union (`checklist`/`counter`/`timer`) until the registry (§7) makes it
  `keyof typeof registry`.

### Next (rough order)
1. `ActivitySchedule` (§3): versioned recurrence + `dayGoal`/`periodGoal`; a
   change-point timeline like `StatusPeriod`, with the `scheduleOn(day)` lookup.
2. activityType registry (§7): `checklist` / `counter` / `timer` with
   `metric` / `measure` / `isCompleted` / `emptyProgress`.
3. `ActivityOccurrence` (§5): the persisted per-day record with polymorphic
   `progress` keyed by `activityType`.
4. Projection: build day `D` (§8) + resolve display status
   (pending / done / missed) — the heart; everything above feeds it.
5. Only then: infrastructure (expo-sqlite repos + mappers + migrations) and UI.
   (Candidate point to inject a thin end-to-end vertical slice — see README.)

## Decisions taken while building
- **Feature `tracking`** houses Goal / Activity / ActivitySchedule /
  ActivityOccurrence / projection (one bounded context with two aggregates —
  the projection and the status cascade need them together). `Task` (domain-model §6) will be its own small feature later.
- **`CalendarDay` lives in `src/shared/`** because both `activities` and the
  future `tasks` feature need logical days.
- **Test runner: Jest + `jest-expo`** (this closed the open "test runner"
  decision that used to be in `future-features.md`).
