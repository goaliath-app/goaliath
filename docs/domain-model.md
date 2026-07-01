# 📘 Domain model — task management (offline-first)

> Versión en español: [domain-model_spanish.md](./DOMAIN-MODEL_spanish.md)

This document defines the domain model for the rewrite of the task system. It
builds on an initial proposal (Goal / Task / TaskSchedule / RecurrenceRule /
TaskOccurrence / TaskException) and adjusts it with what we've learned from
the current app: flexible weekly quotas, live timers, paused vs. archived,
a configurable day-cutoff hour, and standalone one-off tasks.

Guiding principle, inherited from the original proposal and kept intact:

> **The calendar is not the source of truth. It's a projection** rebuilt from
> stable data (Goal, Activity, ActivitySchedule) plus a sparse record of
> deviations (ActivityOccurrence, ActivityException).

---

## 0. New idea running through the whole model: two independent timelines

The original proposal versioned "temporal behavior" (what this document calls
`ActivitySchedule`) but left it ambiguous what happens when something is
**paused** or **archived**: is that an `ActivitySchedule` that ends without
another one starting? That forces you to guess, when looking at the history,
whether a gap between versions means "the user paused it" or "there was
simply no schedule defined yet."

To avoid that, we separate two timelines that are **versioned
independently**, each answering a different question:

| Timeline | Question it answers | Changes when... |
|---|---|---|
| **StatusPeriod** | Was this active, paused, or archived on that day? | the user pauses/resumes/archives |
| **ActivitySchedule** | How does it behave (recurrence) on that day? | the user changes the frequency/rules |

This same status timeline (`StatusPeriod`) is reused for both **Goal** and
**Activity**, which also removes the duplication that exists today between
`ActivitySlice` and `GoalsSlice` (two nearly identical copies of the same
versioning mechanism, with a TODO in the code itself asking for it to be
generalized).

```
StatusPeriod {
  ownerId: id (Goal or Activity)
  status: 'active' | 'paused' | 'archived'
  from: Date
  to: Date | null   // null = current
}
```

Composition rule: an Activity is only effectively active on a date if **both
it and its Goal** are in `active` status on that date (same as today). This
is resolved with a pure function `isEffectivelyActive(activity, goal, date)`,
with no need to duplicate the flag in two places.

Purely cosmetic fields (`title`, `description`, `color`, `icon`, `priority`,
`tags`, `estimatedDuration`...) **are not versioned**. If the user renames
it, the history simply shows the current name. This is a deliberate
simplification: nobody needs stats from 3 months ago to show an old name, and
we avoid versioning data that doesn't affect whether a day counts or not for
a streak/statistic.

---

## 1. Goal

Purely organizational in terms of content, but it **does have a lifecycle**
(unlike the original proposal), because pausing/archiving a Goal must be able
to cascade-deactivate all of its Activities, and that cascade needs to be
consistent with the historical record.

```
Goal {
  id
  title
  motivation / description
  color, icon
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

- A Goal groups related Activities.
- It doesn't define its own temporal behavior: that always lives in the Activities.

---

## 2. Activity (intent)

An entity stable over time. Same as the original proposal's "Task": it
describes **what** the user wants to do, never **when**. This is the piece
that lives inside Goals and can repeat over time — as opposed to the
standalone `Task` entity in §6, which is always a one-off item.

```
Activity {
  id
  goalId: id | null        // null = a recurring/tracked activity not grouped under any Goal
  title, description, priority, color, icon, estimatedDuration, tags

  activityType: string      // e.g. 'checklist' | 'counter' | 'timer'
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

Changes from the original proposal:

- **`goalId` is optional** — note this isn't for one-off items (those are the
  separate `Task` entity, see §6). It's for a recurring/tracked Activity the
  user doesn't want grouped under any Goal (e.g. a standalone habit like
  "drink water"). Since it's just a nullable foreign key and not extra
  machinery, it costs nothing to leave open; if that case never comes up in
  practice, `goalId` can just as easily become mandatory again.
- **`activityType`** is the piece that lets the system grow without touching
  the rest of the model (see §7, "How to add a new activity type"). It
  determines what shape the progress takes inside each `ActivityOccurrence`
  and which UI is used to record it.

---

## 3. ActivitySchedule (versioned temporal behavior)

Same spirit as the original proposal: it's never edited, it's closed and a
new version is created.

```
ActivitySchedule {
  id
  activityId
  recurrenceRule: RecurrenceRule
  startDate
  endDate: Date | null   // null = current
}
```

Every `Activity` — by definition recurring or goal-tracked — always has at
least one `ActivitySchedule`. Purely one-off items aren't modeled as an
`Activity` at all; see §6 (`Task`).

---

## 4. RecurrenceRule (value object)

No identity of its own, same as the original proposal. Adds the **`quota`**
kind, which didn't exist before and covers a real, frequent pattern in the
current app: "N days / N times / N seconds a week, you choose when."

```
RecurrenceRule =
  | { kind: 'daily' }
  | { kind: 'weekly', daysOfWeek: [1..7] }
  | { kind: 'monthly', ... }
  | { kind: 'quota', period: 'week', target: { metric: 'days'|'reps'|'seconds', amount: N } }
  | { kind: 'custom', ... }
```

### Why `quota` needs an extra step in the projection

A `weekly` or `daily` rule generates occurrences deterministically: "today is
due." A `quota` rule **can't decide by itself which day is due**: it's the
user who, each day, decides whether that day counts toward the weekly goal
(today this is the "select weeklies" screen). That's why the projection
algorithm (§8) treats `quota` as a special case: instead of automatically
generating a "due" occurrence, the activity shows up as a **candidate for the
day**, and only becomes a real `ActivityOccurrence` once the user selects it
(origin `quotaOptIn`, see §5).

---

## 5. ActivityOccurrence (persisted state of an occurrence)

Same principle as the original proposal — **it doesn't have to exist**; if
there's no persisted one for a date, the system reconstructs it as
`pending` — but with progress made extensible instead of fixed.

```
ActivityOccurrence {
  activityId
  scheduleId: id | null    // null only for a manual exception occurrence outside any schedule
  date
  status: 'pending' | 'done' | 'skipped'
  completedAt
  notes
  origin: 'recurrence' | 'quotaOptIn' | 'manual' | 'exception'
  progress: <depends on activity.activityType>
}
```

`progress` is polymorphic and defined by the Activity's `activityType` (see
§7), not by the generic model. Examples with the app's current types:

- `activityType: 'checklist'` (today's "doOneTime") → `progress: {}` (nothing
  else to track, `status` already says it all).
- `activityType: 'counter'` (today's "doNTimes") → `progress: { repetitions: [timestamp, ...] }`.
  Each repetition is stored with its timestamp because today's stats rely on
  it (streaks, counts over a date range).
- `activityType: 'timer'` (today's "doNSeconds") → `progress: { intervals: [{start, end|null}] }`.
  `end: null` on the last interval means "currently running."

This is exactly what the original proposal was missing: a
`status: pending/done/skipped` + `real duration` can't represent a running
timer or individual timestamped repetitions.

---

## 6. Task (standalone one-off items)

A one-off task never needs anything beyond "done or not done" — no Goal, no
recurrence, no counter/timer progress. Routing it through
`Activity` + `ActivitySchedule` + `StatusPeriod` + `ActivityOccurrence` would
mean a trivial "buy batteries" reminder drags along machinery that only
exists to support recurring, goal-tracked behavior it will never use.

So standalone tasks get their own, deliberately minimal entity, sitting
**outside** the Activity/ActivitySchedule/ActivityOccurrence pipeline
entirely:

```
Task {
  id
  title
  date
  completed: boolean
  completedAt
}
```

This mirrors today's `TasksSlice` almost exactly (name + completed, scoped to
a single day). It has no `activityType`, no `StatusPeriod`, no
`RecurrenceRule`, and it never goes through the projection algorithm (§8) —
it's simply fetched directly for a given date.

The trade-off this makes explicit: the "today" screen still has to merge two
different sources (projected `Activity` occurrences + `Task`s for the day)
at the UI/query layer — same as today's `DayContentList`. Unifying the
storage model would not have removed that merge anyway, since the two kinds
of item render differently (a habit with a progress bar vs. a plain
checkbox); it would only have hidden real complexity behind a shared
abstraction that a one-off item never needs.

---

## 7. How to add a new activity type (extensibility)

This is the "must be able to grow consistently" requirement. The rule is:
**a new `activityType` is added to a registry (plugin), never by modifying
the generic model.**

Each registry entry defines:

```
ActivityTypeDefinition {
  key: string                              // 'counter', 'timer', 'checklist', ...
  emptyProgress(): progress
  computeCompletionRatio(progress, scheduleTarget): number   // 0..1
  isCompleted(progress, scheduleTarget): boolean
  applyUserAction(progress, action): progress   // e.g. "add rep", "start timer", "stop timer"
  renderTodayItem(occurrence, schedule): Component
  renderFrequencyLabel(schedule, t): string
}
```

This is, in effect, a cleaner generalization of what already exists today in
`src/activityHandler/activityTypes` + `dailyGoals` (two nested registries,
one for "activity type" and one for "daily goal type"). In the new model
there's a single extension point (`activityType`) instead of two crossed
levels, which simplifies adding new combinations.

To add, for example, a future "checklist with subtasks" type: create
`activityTypes/checklistWithSubtasks.js` implementing that interface,
register it in the index, and neither `Activity`, `ActivitySchedule`,
`ActivityOccurrence`, nor the projection algorithm needs to change.

`Task` (§6) intentionally sits outside this registry: it's always a plain
checklist item by definition, so it doesn't need an `activityType` at all.

---

## 8. Projection algorithm (calendar = derived view)

To build day `D`:

1. Get the Activities whose `StatusPeriod` on `D` is `active` (cascading from
   their Goal, if any).
2. For each one, find the `ActivitySchedule` in effect on `D`.
3. Based on `recurrenceRule.kind`:
   - `daily` / `weekly` / `monthly` / `custom` → generate the expected
     occurrence for `D` directly.
   - `quota` → **do not** automatically generate a "due" occurrence; instead,
     mark the Activity as a candidate for the day (equivalent to today's
     weekly selection screen) until the user picks it, at which point the
     `ActivityOccurrence` is created with `origin: 'quotaOptIn'`.
4. Apply any `ActivityException` in effect on `D` (they take priority over
   the above: cancel, move, or override that day).
5. Replace any generated occurrence with the persisted `ActivityOccurrence`
   if one exists for that Activity+date.

`Task`s are not part of this algorithm at all: they're fetched directly by
date and merged with the result at the UI/query layer (see §6).

---

## 9. Exceptions (ActivityException)

Same as the original proposal: they modify a specific day without touching
the general recurrence, and take priority over any rule.

```
ActivityException {
  activityId
  date
  type: 'skip' | 'reschedule' | 'override'
  newDate?          // only if type = 'reschedule'
  overrides?         // only if type = 'override'
}
```

---

## 10. Day with a configurable cutoff hour

The app allows "the day" to start at an hour other than midnight
(`dayStartHour`). This cuts across the whole model, so it's resolved at a
single point:

- A pure function `getCalendarDay(instant, dayStartHour)` is the **only** way
  to convert an instant into the system's "logical date." No other code
  computes dates on its own.
- Changing `dayStartHour` is an explicit, isolated migration operation: it
  re-labels recent `ActivityOccurrence`s and open timers into their new
  logical day. Since everything lives in a single `ActivityOccurrence` store
  (instead of being duplicated per slice like today's
  `ActivitySlice`/`LogSlice`), this migration is implemented **once**, not
  once per entity type.

---

## 11. Live state (timers) — not reconstructible

The "everything can be reconstructed" principle is correct for history, but
"is a timer running right now?" is an operational question that shouldn't
depend on reconstructing/scanning occurrences. A small, explicit record is
kept outside the historical model:

```
RunningTimer {
  activityId
  occurrenceDate
  startedAt
}
```

It's modeled **as a collection from the start** (a table/list, even though
today it holds at most one element), not as a single nullable value. The
current business rule — only one timer can run at a time — is enforced at
write time, not in the shape of the data:

```js
function startTimer(activityId) {
  if (ENFORCE_SINGLE_TIMER) {
    runningTimers.forEach(t => stopTimer(t.activityId))
  }
  runningTimers.add({ activityId, occurrenceDate, startedAt: now() })
}
```

This leaves the door open to allowing several timers in parallel later
without any redesign: just remove the `if (ENFORCE_SINGLE_TIMER)` block. The
rest of the model (`RunningTimer` as a table, how "what's running" is read,
how a closed interval is flushed into `progress.intervals`) doesn't change,
because each Activity already keeps its own `intervals` independently — two
timers running at once have never been a data conflict, only a product
decision. The only thing that would actually need extending at that point is
the UI/notifications layer (the "something is running" badge and the "you've
been at this for X minutes" alerts), which today assume a single active
timer.

When a timer stops, the interval `{start: startedAt, end: now}` is appended to
the corresponding `ActivityOccurrence`'s `progress.intervals`, and its entry
in `runningTimers` is removed.

---

## 12. Stats: pure projection + materialized summary

Reconstructing the entire history on demand is reasonable for viewing a day
or a week, but it can get expensive for "lifetime" stats (streaks,
month/year heatmaps) if it means walking day by day since installation.

Recommendation: keep the pure reconstruction as the source of truth (no side
effects, always correct), but add a derived, cached summary table:

```
DailyStatsSummary {
  activityId, date
  completionRatio, timeSpentSeconds, repetitions
}
```

It's updated incrementally every time an `ActivityOccurrence` for that day is
created/edited (no need to recompute the whole history), and it can be fully
regenerated at any time from the sources of truth if needed — it remains a
cache, not a new source of truth.

---

## 🧠 Mental summary of the system

- **Goal** → why something exists (and whether that "why" is still active)
- **Activity** → a recurring or goal-tracked thing the user does (stable identity; may or may not belong to a Goal, but always has a schedule)
- **StatusPeriod** → whether that Activity/Goal was active, paused, or archived on a given day
- **ActivitySchedule** → how it behaves over time (versioned recurrence)
- **RecurrenceRule** → how it repeats, including the `quota` variant (flexible quotas)
- **ActivityOccurrence** → what actually happened that day, with progress specific to its `activityType`
- **ActivityException** → modifies a specific day without altering the general plan
- **Task** → a standalone one-off item, always a plain checklist, entirely outside the Activity pipeline
- **RunningTimer** → live operational state, not historical, not reconstructible
- **DailyStatsSummary** → stats cache, never a source of truth

## Key differences from the original proposal

1. `StatusPeriod` separated from `ActivitySchedule`: pausing/archiving is no longer confused with "changing the recurrence."
2. `Goal` regains its own lifecycle (`StatusPeriod`), cascading to its Activities.
3. `RecurrenceRule` gains the `quota` kind for flexible weekly quotas, with an explicit "daily opt-in" step in the projection.
4. `ActivityOccurrence.progress` is polymorphic based on `activityType`, instead of a fixed field — supports timestamped counters and timers with intervals.
5. Standalone one-off items are pulled out into a separate, deliberately minimal `Task` entity (id, title, date, completed) that sits entirely outside the Activity/ActivitySchedule/StatusPeriod pipeline — this avoids forcing a "buy batteries" reminder through machinery built for recurring, goal-tracked behavior. `Activity.goalId` stays optional, but now only for recurring/tracked Activities with no Goal, not for one-offs.
6. `RunningTimer` is added as non-reconstructible operational state, modeled as a collection with the "one at a time" limit enforced as a business rule (not as the data's shape), so it can be relaxed without a redesign. Also notes on `dayStartHour` as the single point where dates are resolved.
7. `DailyStatsSummary` is added as an explicit cache so lifetime stat queries don't depend on reconstructing years of history.
8. Naming reverts to match the current app: the recurring/goal-tracked entity is called `Activity` (as in today's `ActivitySlice`/`activityHandler`), and the standalone one-off entity is called `Task` (as in today's `TasksSlice`) — now cleanly split into two entities instead of one overloaded concept. `activityType` replaces today's double registry (`activityTypes` + `dailyGoals`) with a single extension point; `Task` deliberately sits outside that registry too.
