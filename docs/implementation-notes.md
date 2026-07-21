# Implementation notes (living status)

Where the build is and what's next. **Update this as you go.** Design rationale
lives in `domain-model.md` / `architecture.md`; this file is just the running
state so any agent (or human) can pick up.

## Current phase: vertical slice complete (SQLite + DI + UI)

The domain core is in place and the tracking slice is now wired end to end
through SQLite, dependency injection, and a Today screen. The next work is
widening the domain further (counter/timer, quota, task/stats support).

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
- **SQLite infrastructure** (`expo-sqlite ~56.0.5` added):
  `shared/infrastructure/db/connection.ts` (lazy singleton, WAL + foreign keys)
  and `runner.ts` (generic `runMigrations` over `PRAGMA user_version`, unique
  positive versions enforced, one transaction per migration, zero feature
  knowledge). Tracking's `infrastructure/`: migration `0001` (6 tables —
  normalized status-period tables per §0; occurrences PK `(activity_id, date)`;
  `recurrence_rule`/`period_goal`/`progress` as JSON text), pure mappers
  (row ↔ domain; the schedule mapper re-establishes the "periodGoal iff quota"
  union at the storage boundary, failing loudly on corrupt rows), and the four
  `Sqlite*Repository` adapters (occurrence save is an upsert; timeline queries
  `ORDER BY` ascending per the change-point invariant). Feature barrel
  `index.ts` with the DI-facing exports. Mappers are pure (no expo-sqlite
  import) and tested in the node env; adapters get exercised through the app in
  the next chunk (DI + Today screen).
- **DI + UI (slice closed)**: `core/di/` — `container` (wires the four Sqlite
  adapters + `now`/`dayStartHour` config), `migrations` (collects feature
  migrations for the runner), `seedDevData` (dev-only demo goal + two daily
  checklists), and `DependencyProvider` (opens DB → migrate → seed → build
  container → provide; async loading state). `features/tracking/ui/` —
  `useTodayView` hook + `TodayScreen`. `app/_layout.tsx` wraps the provider;
  `app/index.tsx` renders the screen. Verified by an **iOS Metro bundle**
  (`expo export -p ios`, exit 0): the whole graph resolves, incl. the `@/` alias
  (Expo's built-in tsconfig-paths support — no metro/babel resolver needed).
  Known caveat: `expo export -p web` fails inside `expo-sqlite/web` resolving its
  `wa-sqlite.wasm` — a web-only packaging quirk, irrelevant to this mobile-first
  app; revisit only if web is targeted.

**Phase 2 (vertical slice) is complete**: a tappable Today screen backed by
SQLite through the full hexagon (UI → hook → use case → projection/domain →
repository port → SQLite adapter → migration). Next is Phase 3 (widen the
domain): counter/timer + registry extraction, quota opt-in, `Task`, stats.

### Phase 3 in progress: `counter`
- `domain/activityTypes/counter.ts` — `CounterProgress` (timestamped reps as ISO
  strings so progress JSON round-trips without type-aware revival),
  `emptyCounterProgress`, `addRepetition`, `countRepetitions`,
  `isCounterComplete(progress, dayGoal)`. `OccurrenceProgress` widened to
  `Checklist | Counter`.
- `application/logCounterRepetition.ts` — write path: append a rep and **derive**
  `status` from `isCounterComplete` vs the schedule's `dayGoal` (contrast the
  checklist toggle, which sets status directly). Counter progress round-trips
  through the occurrence mapper (tested).

- `ui/activityTypes/activityTypeViews.tsx` — the **UI-half registry**
  (`ActivityTypeView`, §7): `Record<ActivityType, { renderRow }>` with the
  checklist (checkbox) and counter (count / dayGoal + "+") rows. `TodayScreen`
  dispatches through it and no longer switches on type; `useTodayView` exposes a
  `TodayActions` bundle (`toggleChecklist` + `incrementCounter`). `ActivityType`
  narrowed to the **implemented** set (`checklist | counter`); `timer` rejoins
  when built. Seed adds a counter activity (Push-ups, goal 10). Verified by an
  iOS Metro bundle (exit 0).

### Phase 3: `quota` — candidacy + origin (period progress still pending)
- `projection.buildDay` no longer skips quota: a quota **offers** the day as a
  candidate (§4/§8) instead of making it due — `due` is always `false` for it, so
  a quota day can never read as `missed`. Candidacy is offered **only from today
  onward**: past days you never opted into were never a commitment, so they'd be
  noise. A past quota day still appears if something was recorded on it.
- `domain/ActivityOccurrence.occurrenceOriginFor(schedule, day)` — the origin a
  new occurrence should carry (§5): quota → `quotaOptIn` (writing one *is* opting
  the day in), fixed+due → `recurrence`, otherwise → `manual`. Both write use
  cases now use it instead of their earlier `schedule ? 'recurrence' : 'manual'`
  approximation. Seed adds a quota activity ("Go for a run", 3 days/week).
- **Still to do for quota**: period progress ("2 of 3 this week"). That needs
  period boundaries (the `weekOf(day, weekStart)` chokepoint future-features
  describes, plus the weekStart decision), an occurrence query over a date range
  (new repository method), and — for `metricSum` targets — the domain behaviour
  registry. That's the step that finally forces it.

**Registry finding (why the domain half stays deferred):** a real second type
shows the registry *forced* now is the **UI dispatch** one (above). The pure
**domain** registry (`ActivityTypeBehaviour` with generic `measure`/`isCompleted`)
is **not** forced yet: write paths are type-specific use cases and the projection
reads `status`, not progress. It's forced later by quota's `metricSum` and stats.
And §7's `measure(progress): number` signature doesn't fit `checklist` (whose
"measure" is status-based — progress is `{}`); a real sign the interface needs
adjusting when built — the mis-design deferring avoided. Keep the domain
behaviour registry deferred until quota/stats.

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
