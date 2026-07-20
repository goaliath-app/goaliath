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
- `src/features/tracking/domain/RecurrenceRule.ts` — union + `isDueOn` for fixed
  kinds + `isFixed`; `quota` excluded from `isDueOn` at the type level
  (domain-model §4). Plus `calendarDayParts` / `isoWeekday` on `CalendarDay`.
  `getCalendarDay` reworked to local-component logic (DST-safe) + `dayStartHour`
  range guard.
- `src/features/tracking/domain/Goal.ts` + `Activity.ts` — the two aggregates'
  entity types (§1, §2) with branded `GoalId`/`ActivityId`, plus
  `isEffectivelyActive(activity, goal, day)`, the §0 cascade (goal AND activity
  active) with a guard against a foreign goal. `activityType` is a placeholder
  union until the registry (§7).
- `src/features/tracking/domain/ActivitySchedule.ts` — versioned recurrence +
  `dayGoal`/`periodGoal` (§3), modeled as `FixedSchedule | QuotaSchedule` so the
  "`periodGoal` iff `quota`" invariant is type-level. `scheduleOn(day)` lookup.
- `src/shared/domain/time/changePointTimeline.ts` — `latestOnOrBefore`, the
  shared change-point-timeline lookup extracted from `StatusPeriod.periodOn` and
  reused by `scheduleOn` (both are "latest entry with `start <= day`", §0/§3).

### Strategy: hybrid (domain-first up to the projection, then a vertical slice)
Take the pure domain only as far as the projection for the **simplest case**
(checklist on fixed recurrences), then cut a thin end-to-end slice (SQLite repos
+ DI + a "Today" screen) to de-risk the wiring before widening the domain to
counter/timer/quota. The projection is the highest-risk piece, so we build just
enough of it to be real, prove it through a real screen, then extend behind the
proven seams.

### Next (rough order)
1. activityType behaviour for **`checklist` only** (§7), modeled **concretely**
   (its progress is `{}`, a binary day) — *not* the full plugin registry yet.
   The registry abstraction is designed better once `counter` gives it a real
   second case + a real UI consumer; extracting it later is cheap (pure domain
   with tests). When it is extracted it splits in two (§7): a pure
   `ActivityTypeBehaviour` in `domain/` and an `ActivityTypeView` in `ui/`, so no
   `Component` ever leaks into the domain.
2. `ActivityOccurrence` (§5) + a single **status-policy** module (future-features
   invariant 2: "counts as done? breaks a streak?" in one place).
3. Projection `buildDay(D)` (§8) for **fixed kinds only** + resolve display
   status (pending / done / missed) — the heart. Quota opt-in deferred.
4. **Vertical slice**: expo-sqlite repos + mappers + migrations + `core/di` +
   a "Today" screen you can tap. Proves the whole hexagon end-to-end.
5. Then widen: counter/timer + `RunningTimer` (§11), quota + opt-in (§4/§8),
   `Task` feature (§6), `DailyStatsSummary` (§12).

## Decisions taken while building
- **Feature `tracking`** houses Goal / Activity / ActivitySchedule /
  ActivityOccurrence / projection (one bounded context with two aggregates —
  the projection and the status cascade need them together). `Task` (domain-model §6) will be its own small feature later.
- **`CalendarDay` lives in `src/shared/`** because both `activities` and the
  future `tasks` feature need logical days.
- **Test runner: Jest + `jest-expo`** (this closed the open "test runner"
  decision that used to be in `future-features.md`).
