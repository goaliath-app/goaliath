# 📘 Domain model — task management (offline-first)

> Versión en español: [domain-model.es.md](./domain-model.es.md)

This document defines the domain model for the task system. It is the source of
truth for how the model is structured and how it behaves: flexible weekly
quotas, live timers, paused vs. archived, a configurable day-cutoff hour, and
standalone one-off tasks.

Guiding principle:

> **The calendar is not the source of truth. It's a projection** rebuilt from
> stable data (Goal, Activity, ActivitySchedule) plus a sparse record of
> deviations (ActivityOccurrence).

---

## Contents

- [0. Two independent timelines](#0-two-independent-timelines)
- [1. Goal](#1-goal)
- [2. Activity (intent)](#2-activity-intent)
- [3. ActivitySchedule (versioned temporal behavior)](#3-activityschedule-versioned-temporal-behavior)
  - [Two orthogonal axes (this is what keeps task types simple to extend)](#two-orthogonal-axes-this-is-what-keeps-task-types-simple-to-extend)
- [4. RecurrenceRule (value object)](#4-recurrencerule-value-object)
  - [Why `quota` needs an extra step in the projection](#why-quota-needs-an-extra-step-in-the-projection)
- [5. ActivityOccurrence (persisted state of an occurrence)](#5-activityoccurrence-persisted-state-of-an-occurrence)
- [6. Task (standalone one-off items)](#6-task-standalone-one-off-items)
- [7. How to add a new activity type (extensibility)](#7-how-to-add-a-new-activity-type-extensibility)
- [8. Projection algorithm (calendar = derived view)](#8-projection-algorithm-calendar--derived-view)
- [9. Editing the past vs. changing the plan](#9-editing-the-past-vs-changing-the-plan)
- [10. Day with a configurable cutoff hour](#10-day-with-a-configurable-cutoff-hour)
- [11. Live state (timers) — not reconstructible](#11-live-state-timers--not-reconstructible)
- [12. Stats: pure projection + materialized summary](#12-stats-pure-projection--materialized-summary)
- [🧠 Mental summary of the system](#-mental-summary-of-the-system)

---

## 0. Two independent timelines

Two timelines are versioned **independently**, each answering a different
question. Keeping them separate avoids an ambiguity: if "temporal behavior"
and "paused/archived" shared a single timeline, a gap in the history would be
impossible to interpret — did the user pause this, or was there simply no
schedule defined yet?

| Timeline | Question it answers | Changes when... |
|---|---|---|
| **StatusPeriod** | Was this active, paused, or archived on that day? | the user pauses/resumes/archives |
| **ActivitySchedule** | How does it behave (recurrence) on that day? | the user changes the frequency/rules |

The same `StatusPeriod` shape is used for both **Goal** and **Activity**, so the
versioning mechanism is defined once. It's a value object **owned by its
aggregate**: a Goal owns its status timeline, an Activity owns its own (§1, §2),
so it needs no owner reference of its own in the domain.

```
StatusPeriod {
  status: 'active' | 'paused' | 'archived'
  from: CalendarDay   // the logical day (§10) this status takes effect on; holds until the next entry (or forever if last)
}
```

`from` is a `CalendarDay` (§10), not a wall-clock `Date`: status changes are
dated by logical day (a change "takes effect today", §9), and `CalendarDay`
values compare directly (`<`, `===`), so "which status is in effect on day D" is
a plain comparison with no time-of-day to reconcile.

There is **no explicit end**: an entry holds until the next one begins.
Timelines are contiguous (the entity always has some status once it exists —
`archived` is a status, not a gap), so a `to` would only duplicate the next
entry's `from` and add an invariant to keep consistent. The end is derived, and
overlaps and gaps become unrepresentable.

This document describes the **domain** shape. Persistence is decoupled
(`expo-sqlite` behind a repository, so the UI and domain never depend on the
data source — see [architecture.md](./architecture.md)): in storage the periods
live in a normalized table with a reference to their owner, reconstructed into
the aggregate by the mapper. That's why the domain shows `statusPeriods` as a
list on the entity while the database keeps it as its own table — same data,
two layers.

Composition rule: an Activity is only effectively active on a date if **both
it and its Goal** are in `active` status on that date. This is resolved with a
pure function `isEffectivelyActive(activity, goal, date)`, with no need to
duplicate the flag in two places.

Purely cosmetic fields (`title`, `motivation`, `description`) **are not
versioned**. If the user renames it,
the history simply shows the current name. This is a deliberate simplification:
nobody needs stats from 3 months ago to show an old name, and we avoid
versioning data that doesn't affect whether a day counts or not for a
streak/statistic.

---

## 1. Goal

Purely organizational in terms of content, but it **has a lifecycle**, because
pausing/archiving a Goal must cascade-deactivate all of its Activities, and
that cascade needs to be consistent with the historical record.

```
Goal {
  id
  title
  motivation
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

- A Goal groups related Activities.
- It doesn't define its own temporal behavior: that always lives in the Activities.

---

## 2. Activity (intent)

An entity stable over time. It describes **what** the user wants to do, never
**when**. This is the piece that lives inside Goals and can repeat over time —
as opposed to the standalone `Task` entity in §6, which is always a one-off
item.

```
Activity {
  id
  goalId: id                // the Goal this Activity belongs to (required)
  title, description

  activityType: string      // registry key ('checklist' | 'counter' | 'timer' | ...); validated against the registry, not free-form
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

- **`goalId`** is required: every Activity belongs to exactly one Goal. There
  are no goal-less Activities — a one-off item that doesn't belong to a Goal is
  the separate `Task` entity (see §6), not an Activity.
- **`activityType`** is the piece that lets the system grow without touching
  the rest of the model (see §7, "How to add a new activity type"). It
  determines what shape the progress takes inside each `ActivityOccurrence` and
  which UI is used to record it. It's a **registry key**, not free-form text:
  it must resolve to an `ActivityTypeDefinition` in the registry (§7), it's
  validated on write, and it's stable (renaming a key is a migration, unlike
  the cosmetic fields). In TypeScript it should be typed as the set of
  registered keys (e.g. `keyof typeof registry`) rather than a bare `string`,
  so the set stays open through the registry while still giving autocompletion.

---

## 3. ActivitySchedule (versioned temporal behavior)

An `ActivitySchedule` is never edited: a new version is appended that supersedes the previous one from its `startDate` (a change-point timeline, like `StatusPeriod` in §0).
It answers two things that always travel together — *when* the Activity is due
and *how much* counts as done — while staying independent of *what* the doing
looks like (that's the `activityType`, §2/§7).

```
ActivitySchedule {
  id
  activityId
  recurrenceRule: RecurrenceRule   // WHEN it's due — purely temporal (§4)
  dayGoal:    number | null        // per due/opted-in day: amount (in the activityType's metric) that makes that day count as done; null = binary "did it"
  periodGoal: PeriodGoal | null    // only for `quota` recurrences; null for fixed ones
  startDate: CalendarDay           // logical day (§10) it applies from, until the next schedule's startDate (or the current one if last)
}

PeriodGoal =
  | { aggregate: 'completedDays', amount: N }   // N days within the period must be completed
  | { aggregate: 'metricSum',     amount: N }   // the activityType's metric summed across the period must reach N
```

Invariants:

- `dayGoal` is expressed in the activityType's metric (reps, seconds…) and only
  applies to measurable types; for `checklist` it's always `null` (a day is
  binary: done or not). A "completed day" means `dayGoal` reached, or — when
  `dayGoal` is `null` — simply marked done.
- `periodGoal` is present **iff** `recurrenceRule.kind === 'quota'`, and `null`
  for every fixed recurrence.

Every `Activity` always has at least one `ActivitySchedule`. Purely one-off
items aren't modeled as an `Activity` at all; see §6 (`Task`).

### Two orthogonal axes (this is what keeps task types simple to extend)

A task shape is the **product of two independent axes plus the targets that
bridge them** — never a fixed enum of "task types":

- **Axis A — recurrence (`RecurrenceRule`, §4):** *when* it's due. Adding a new
  cadence (monthly, yearly, …) is just a new `kind`; nothing else changes.
- **Axis B — activity type (`activityType`, §2/§7):** *what a single day of
  doing looks like* and *what metric it produces* (checklist → done/not,
  counter → reps, timer → seconds). Adding a new way to measure a day is just a
  new registry entry.
- **Targets (`dayGoal` / `periodGoal`):** always expressed in Axis B's metric,
  so **any recurrence composes with any activity type**. The combinations are
  never enumerated by hand.

Every current task shape falls out of this product:

| Behaviour | recurrenceRule | activityType | dayGoal | periodGoal |
|---|---|---|---|---|
| Simple daily check | `daily` | checklist | — | — |
| Set weekdays | `weekly {1,3,5}` | checklist | — | — |
| N times a day | `daily` | counter | N | — |
| N seconds a day | `daily` | timer | N | — |
| N days each week | `quota week` | checklist | — | `completedDays: N` |
| N times each week | `quota week` | counter | — | `metricSum: N` |
| N seconds each week | `quota week` | timer | — | `metricSum: N` |

The same grid already expresses shapes beyond today's set — each is just another
point on it:

| Behaviour | recurrenceRule | activityType | dayGoal | periodGoal |
|---|---|---|---|---|
| 20 min, 3 days a week | `quota week` | timer | 1200 | `completedDays: 3` |
| Monthly checkup | `monthly {1}` | checklist | — | — |
| Read 12 books a year | `quota year` | counter | — | `metricSum: 12` |

---

## 4. RecurrenceRule (value object)

A value object with no identity of its own. It answers **only** *which days are
in play* — never "how much" (that's `dayGoal`/`periodGoal`, §3). Keeping it
purely temporal is what lets a new cadence be added as one more `kind` without
touching targets, progress, or the projection's per-day logic.

```
RecurrenceRule =
  | { kind: 'daily' }
  | { kind: 'weekly',  daysOfWeek:  number[] }   // ISO 1..7 (Mon..Sun), fixed days
  | { kind: 'monthly', daysOfMonth: number[] }   // 1..31 (fixed days)
  | { kind: 'yearly',  datesOfYear: { month, day }[] }
  | { kind: 'quota',   period: 'week' | 'month' | 'year' }
```

- **Fixed kinds** (`daily` / `weekly` / `monthly` / `yearly`) name the exact days
  that are due; the projection (§8) generates them deterministically.
- **`quota`** names only a period, not the days. The user opts in day by day, and
  "how much" for the period lives in `ActivitySchedule.periodGoal` (§3),
  expressed in the activityType's metric.

New cadences are added as new `kind`s (that's how `monthly`/`yearly` slot in);
there is deliberately no `custom` grab-bag, which would blur this axis and
reintroduce the ambiguity the fixed/quota split exists to avoid.

### Why `quota` needs an extra step in the projection

A fixed rule generates occurrences deterministically: "today is due." A `quota`
rule **can't decide by itself which day is due**: it's the user who, each day,
decides whether that day counts toward the period goal. That's why the
projection algorithm (§8) treats `quota` as a special case: instead of
automatically generating a "due" occurrence, the activity shows up as a
**candidate for the day**, and only becomes a real `ActivityOccurrence` once the
user selects it (origin `quotaOptIn`, see §5).

---

## 5. ActivityOccurrence (persisted state of an occurrence)

An `ActivityOccurrence` **doesn't have to exist**; if there's no persisted one
for a date, the system reconstructs it — as `pending` when the day is today or
in the future, or as `missed` when it's a past day that was due. Progress is
extensible, not a fixed field.

It's identified by `(activityId, date)` — the logical day (§10) — with **at most
one occurrence per activity per day**. Editing a day (marking it done, adding
reps or time) updates that single record; the model never holds two states for
the same day.

```
ActivityOccurrence {         // identity: (activityId, date) — at most one per activity per logical day
  activityId
  scheduleId: id | null    // null only for a manual occurrence outside any schedule
  date                     // the logical day (§10): a date, not a timestamp
  status: 'pending' | 'done'   // the only persisted outcomes; `missed` is derived (a past due day that never reached `done`) and never stored
  completedAt
  notes
  origin: 'recurrence' | 'quotaOptIn' | 'manual'
  progress: <depends on activity.activityType>
}
```

`progress` is polymorphic and defined by the Activity's `activityType` (see
§7), not by the generic model:

- `activityType: 'checklist'` → `progress: {}` (nothing else to track, `status`
  already says it all).
- `activityType: 'counter'` → `progress: { repetitions: [timestamp, ...] }`.
  Each repetition is stored with its timestamp because stats rely on it
  (streaks, counts over a date range).
- `activityType: 'timer'` → `progress: { intervals: [{start, end}] }`. Intervals
  are always **closed**: a session in progress is not stored here at all, it
  lives in the `RunningTimer` record (§11) and its interval is appended when it
  stops. So progress is a history of finished work with no half-open state, and
  "is it running?" has exactly one source of truth instead of two to keep in
  sync.

A flat `status` + `realDuration` pair couldn't represent a running timer or
individual timestamped repetitions, which is why progress is polymorphic.

---

## 6. Task (standalone one-off items)

A one-off task never needs anything beyond "done or not done" — no Goal, no
recurrence, no counter/timer progress. Routing it through
`Activity` + `ActivitySchedule` + `StatusPeriod` + `ActivityOccurrence` would
mean a trivial "buy batteries" reminder drags along machinery that only exists
to support recurring, goal-tracked behavior it will never use.

So standalone tasks get their own, deliberately minimal entity, sitting
**outside** the Activity/ActivitySchedule/ActivityOccurrence pipeline entirely:

```
Task {
  id
  title
  date
  completed: boolean
  completedAt
}
```

A `Task` is scoped to a single day (name + completed). It has no
`activityType`, no `StatusPeriod`, no `RecurrenceRule`, and it never goes
through the projection algorithm (§8) — it's simply fetched directly for a
given date.

The trade-off this makes explicit: the "today" screen has to merge two
different sources (projected `Activity` occurrences + `Task`s for the day) at
the UI/query layer. Unifying the storage model would not remove that merge
anyway, since the two kinds of item render differently (a habit with a progress
bar vs. a plain checkbox); it would only hide real complexity behind a shared
abstraction that a one-off item never needs.

---

## 7. How to add a new activity type (extensibility)

The model must be able to grow consistently. The rule is: **a new
`activityType` is added to a registry (plugin), never by modifying the generic
model.**

A definition is split across **two layers**, because the projection (pure
domain) consumes the behaviour while only the screens consume the rendering —
and the domain layer must never import React Native/Expo (see
[architecture.md](./architecture.md), dependency rule 1). Merging both halves
into one object would drag a `Component` into `domain/` and break that rule.

**Domain half** — pure, lives in `features/tracking/domain/`, consumed by the
projection and use cases:

```
ActivityTypeBehaviour {
  key: string                          // 'counter', 'timer', 'checklist', ...
  metric: 'none' | 'count' | 'duration'   // what a day's progress measures — gives dayGoal/periodGoal their unit
  measure(progress): number | null     // scalar for sums (counter → reps, timer → seconds); null when metric is 'none'
}
```

**`measure` is `null` for types whose metric is `none`.** A `checklist` day has
no quantity — its outcome is the occurrence's `status`, not its (empty)
progress — so a uniform `measure(progress): number` would force it to invent a
number. Nullable makes "not measurable" explicit, and it's what tells a create
form that `metricSum` is invalid for that type (rather than silently scoring 0).

Deriving `done` from progress (`isCompleted`) is deliberately **not** in this
registry: it's a write-path concern each measurable type handles in its own use
case, and nothing generic needs it. Progress-mutating actions ("add rep", "stop
timer") are likewise the type's own use cases. Keep this interface at what
generic code actually consumes.

**UI half** — lives in `features/tracking/ui/`, consumed only by screens, keyed
by the same `key`:

```
ActivityTypeView {
  key: string
  renderTodayItem(occurrence, schedule): Component
  renderFrequencyLabel(schedule, t): string
}
```

Both are keyed by `activityType`, so a new type adds one entry to each registry;
the domain registry is what keeps the projection type-agnostic while staying
pure. The `metric` + `measure` pair (domain half) is what lets
`periodGoal.aggregate: 'metricSum'` and `dayGoal` (§3) work for **any** type
without the generic model knowing the type — which is exactly why the metric is
derived from `activityType` and never duplicated on the recurrence.

To add, for example, a "checklist with subtasks" type: implement its
`ActivityTypeBehaviour` in the domain registry and its `ActivityTypeView` in the
UI registry (same `key`), and neither `Activity`, `ActivitySchedule`,
`ActivityOccurrence`, nor the projection algorithm needs to change.

`Task` (§6) intentionally sits outside this registry: it's always a plain
checklist item by definition, so it doesn't need an `activityType` at all.

---

## 8. Projection algorithm (calendar = derived view)

To build day `D`:

1. Get the Activities whose `StatusPeriod` on `D` is `active` (cascading from
   their Goal).
2. For each one, find the `ActivitySchedule` in effect on `D`.
3. Based on `recurrenceRule.kind`:
   - `daily` / `weekly` / `monthly` / `yearly` → generate the expected
     occurrence for `D` directly.
   - `quota` → **do not** automatically generate a "due" occurrence; instead,
     mark the Activity as a candidate for the day until the user picks it, at
     which point the `ActivityOccurrence` is created with
     `origin: 'quotaOptIn'`.
4. Replace any generated occurrence with the persisted `ActivityOccurrence` if
   one exists for that Activity+date.
5. Resolve the display status: a persisted `done` shows as done; a due day with
   no `done` occurrence shows as `pending` if `D` is today/future, or `missed`
   if `D` is in the past. `missed`/`pending` are derived here, never stored.

`Task`s are not part of this algorithm at all: they're fetched directly by date
and merged with the result at the UI/query layer (see §6).

---

## 9. Editing the past vs. changing the plan

There is deliberately **no** per-day "skip", "reschedule", or "excuse"
mechanism, and no separate exception entity. Deviations are expressed through
exactly two channels, split by *what they touch*:

- **The outcome of a day is editable, including in the past.** Marking a day
  done (or logging the reps/time you couldn't record in the moment — e.g. your
  phone died) just writes/updates that day's `ActivityOccurrence`. This is
  trusted self-reporting.
- **The plan is only editable going forward.** Changing whether/when an Activity
  is due (its `ActivitySchedule` or `StatusPeriod`) appends a new version dated
  today that supersedes the previous one (§0, §3). It never rewrites the past, so a day
  that was due and not done stays `missed`.

This closes the accountability loophole — you can't retroactively make a due day
disappear so it "doesn't count" — while still letting you record the truth of
what you did. A day that was due and never reached `done` is `missed`; there is
no neutral or hidden state.

---

## 10. Day with a configurable cutoff hour

The app allows "the day" to start at an hour other than midnight
(`dayStartHour`). This cuts across the whole model, so it's resolved at a
single point:

- A pure function `getCalendarDay(instant, dayStartHour)` is the **only** way
  to convert an instant into the system's "logical date." No other code
  computes dates on its own.
- `dayStartHour` is itself a **change-point setting, applied forward-only**: an
  instant is labelled with whichever `dayStartHour` was in effect *at that
  instant*, so past `ActivityOccurrence`s keep the logical day they were already
  filed under. Changing the cutoff never recomputes stored history — that would
  reshuffle which days count and could flip a past day to `missed`, exactly the
  retroactive rewrite [§9](#9-editing-the-past-vs-changing-the-plan) forbids. So
  like `ActivitySchedule`/`StatusPeriod`, the boundary is versioned by time: days
  before the change keep the old cutoff, days after use the new one.
- The **only** thing re-labelled on change is a **running timer** (§11): it's
  live operational state, not history, so resolving "which logical day does this
  open timer belong to?" under the new cutoff rewrites nothing that already
  happened.

> Worked example — cutoff at 04:00, a rep logged at 02:00 today, then at 15:00
> the user lowers the cutoff to 01:00. That 02:00 instant sits *between* the two
> cutoffs: under 04:00 it was filed as **yesterday**, and it **stays yesterday**.
> The new 01:00 cutoff applies only from the change onward, so "today" begins
> counting cleanly and no past day silently changes outcome.

---

## 11. Live state (timers) — not reconstructible

The "everything can be reconstructed" principle is correct for history, but
"is a timer running right now?" is an operational question that shouldn't
depend on reconstructing/scanning occurrences. A small, explicit record is kept
outside the historical model:

```
RunningTimer {
  activityId
  occurrenceDate
  startedAt
}
```

It's modeled **as a collection** (a table/list), not as a single nullable value,
with the business rule — only one timer can run at a time — enforced at write
time rather than in the shape of the data:

```js
function startTimer(activityId) {
  if (ENFORCE_SINGLE_TIMER) {
    runningTimers.forEach(t => stopTimer(t.activityId))
  }
  runningTimers.add({ activityId, occurrenceDate, startedAt: now() })
}
```

When a timer stops, the interval `{start: startedAt, end: now}` is appended to
the corresponding `ActivityOccurrence`'s `progress.intervals`, and its entry in
`runningTimers` is removed.

---

## 12. Stats: pure projection + materialized summary

Reconstructing the entire history on demand is reasonable for viewing a day or
a week, but it can get expensive for "lifetime" stats (streaks, month/year
heatmaps) if it means walking day by day since installation.

The pure reconstruction stays the source of truth (no side effects, always
correct), with a derived, cached summary table on top:

```
DailyStatsSummary {
  activityId, date
  completionRatio, timeSpentSeconds, repetitions
}
```

It's updated incrementally every time an `ActivityOccurrence` for that day is
created/edited (no need to recompute the whole history), and it can be fully
regenerated at any time from the sources of truth — it remains a cache, not a
new source of truth.

---

## 🧠 Mental summary of the system

- **Goal** → why something exists (and whether that "why" is still active)
- **Activity** → a recurring or tracked thing the user does (stable identity; always belongs to a Goal and always has a schedule)
- **StatusPeriod** → whether that Activity/Goal was active, paused, or archived on a given day
- **ActivitySchedule** → when it's due **and** how much counts as done (versioned recurrence + `dayGoal`/`periodGoal`)
- **RecurrenceRule** → purely which days are in play (`daily`/`weekly`/`monthly`/`yearly`/`quota`)
- **ActivityOccurrence** → what actually happened that day, with progress specific to its `activityType`
- **Task** → a standalone one-off item, always a plain checklist, entirely outside the Activity pipeline
- **RunningTimer** → live operational state, not historical, not reconstructible
- **DailyStatsSummary** → stats cache, never a source of truth
