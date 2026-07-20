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

### Strategy: hybrid (domain-first up to the projection, then a vertical slice)
Take the pure domain only as far as the projection for the **simplest case**
(checklist on fixed recurrences), then cut a thin end-to-end slice (SQLite repos
+ DI + a "Today" screen) to de-risk the wiring before widening the domain to
counter/timer/quota. The projection is the highest-risk piece, so we build just
enough of it to be real, prove it through a real screen, then extend behind the
proven seams.

### Next (rough order)
1. `RecurrenceRule` (§4): union + `isDueOn` per fixed kind
   (daily/weekly/monthly/yearly) + `isFixed` narrowing; `quota` excluded from
   `isDueOn` at the type level. Add `calendarDayParts` / `isoWeekday`
   (ISO 1=Mon..7=Sun) to `CalendarDay`. Conventions to lock in: weekday is
   ISO 8601; `monthly`/`yearly` never clamp (a day the month/year lacks simply
   never matches).
2. `Goal` (§1) + `Activity` (§2): the two aggregates' entity types plus
   `isEffectivelyActive(activity, goal, day)`, the §0 composition/cascade rule
   (goal AND activity active). `activityType` typed as the registry key set.
3. `ActivitySchedule` (§3): versioned recurrence + `dayGoal`/`periodGoal`; a
   change-point timeline like `StatusPeriod`, with the `scheduleOn(day)` lookup.
4. activityType behaviour for **`checklist` only** (§7), modeled **concretely**
   (its progress is `{}`, a binary day) — *not* the full plugin registry yet.
   The registry abstraction is designed better once `counter` gives it a real
   second case + a real UI consumer; extracting it later is cheap (pure domain
   with tests). When it is extracted it splits in two (§7): a pure
   `ActivityTypeBehaviour` in `domain/` and an `ActivityTypeView` in `ui/`, so no
   `Component` ever leaks into the domain.
5. `ActivityOccurrence` (§5) + a single **status-policy** module (future-features
   invariant 2: "counts as done? breaks a streak?" in one place).
6. Projection `buildDay(D)` (§8) for **fixed kinds only** + resolve display
   status (pending / done / missed) — the heart. Quota opt-in deferred.
7. **Vertical slice**: expo-sqlite repos + mappers + migrations + `core/di` +
   a "Today" screen you can tap. Proves the whole hexagon end-to-end.
8. Then widen: counter/timer + `RunningTimer` (§11), quota + opt-in (§4/§8),
   `Task` feature (§6), `DailyStatsSummary` (§12).

## Decisions taken while building
- **Feature `tracking`** houses Goal / Activity / ActivitySchedule /
  ActivityOccurrence / projection (one bounded context with two aggregates —
  the projection and the status cascade need them together). `Task` (domain-model §6) will be its own small feature later.
- **`CalendarDay` lives in `src/shared/`** because both `activities` and the
  future `tasks` feature need logical days.
- **Test runner: Jest + `jest-expo`** (this closed the open "test runner"
  decision that used to be in `future-features.md`).
