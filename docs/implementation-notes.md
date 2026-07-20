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
- `src/features/tracking/domain/activityTypes/checklist.ts` — the `checklist`
  type modeled concretely (§5/§7): `ChecklistProgress = {}` (binary day) +
  `emptyChecklistProgress`. No registry abstraction yet (deferred to §7 until a
  second type exists).
- `src/features/tracking/domain/ActivityOccurrence.ts` — the persisted per-day
  record (§5): `(activityId, date)` identity, extensible `OccurrenceStatus`
  (`pending`/`done`), `origin`, polymorphic `progress` (checklist-only union for
  now), + `isComplete`.
- `src/features/tracking/domain/occurrenceStatusPolicy.ts` — the single
  status-policy module (`countsAsDone`), future-features invariant 2.
- `src/features/tracking/domain/projection.ts` — **`buildDay`** (§8), the heart:
  cascade → schedule in effect → `isDueOn` → replace with the persisted
  occurrence → resolve `pending`/`done`/`missed`. Fixed kinds only (quota opt-in
  deferred); input is an object (`{ day, today, activities }`) so the two
  same-typed `CalendarDay`s can't be swapped. This closes Phase 1 (pure domain up
  to the projection) — the hybrid milestone.
- `src/features/tracking/domain/ports/` — the four repository interfaces
  (Goal / Activity / ActivitySchedule / ActivityOccurrence), grouped in a
  `ports/` subfolder (convention now fixed in architecture.md: model files flat
  in `domain/`, outbound contracts under `domain/ports/`).
- `src/features/tracking/application/` — the slice's two use cases:
  `getDayView` (fetch + delegate to `buildDay`; injected `now()` clock and
  `dayStartHour`) and `toggleChecklistDone` (upsert the `(activityId, date)`
  occurrence, done ↔ pending). Tested against in-memory fakes in
  `__tests__/support/trackingFakes.ts` (shared builders + fake repos; Jest
  `testMatch` narrowed to `*.test.*` so support files don't run as suites).

### Strategy: hybrid (domain-first up to the projection, then a vertical slice)
Take the pure domain only as far as the projection for the **simplest case**
(checklist on fixed recurrences), then cut a thin end-to-end slice (SQLite repos
+ DI + a "Today" screen) to de-risk the wiring before widening the domain to
counter/timer/quota. The projection is the highest-risk piece, so we build just
enough of it to be real, prove it through a real screen, then extend behind the
proven seams.

### Next (rough order)
1. **Vertical slice** — the point of the hybrid strategy: prove the whole hexagon
   end-to-end before widening the domain. expo-sqlite repos (Goal / Activity /
   ActivitySchedule / ActivityOccurrence) + mappers + per-feature migrations +
   `shared` runner + `core/di` container/provider + a thin "Today" screen that
   renders `buildDay` and lets you check a checklist off. First Expo-touching
   step → read the v56 docs before writing UI/infra. Needs a `dayStartHour`
   source: inject a default now (settings feature comes later); the projection
   already takes `today`/`day` as params, so keep it pure.
2. Then widen: counter/timer + `RunningTimer` (§11), quota + opt-in (§4/§8),
   `Task` feature (§6), `DailyStatsSummary` (§12). When counter lands, extract
   the activityType registry, split in two (§7): pure `ActivityTypeBehaviour` in
   `domain/`, `ActivityTypeView` in `ui/` — no `Component` in the domain.

## Decisions taken while building
- **Feature `tracking`** houses Goal / Activity / ActivitySchedule /
  ActivityOccurrence / projection (one bounded context with two aggregates —
  the projection and the status cascade need them together). `Task` (domain-model §6) will be its own small feature later.
- **`CalendarDay` lives in `src/shared/`** because both `activities` and the
  future `tasks` feature need logical days.
- **Test runner: Jest + `jest-expo`** (this closed the open "test runner"
  decision that used to be in `future-features.md`).
