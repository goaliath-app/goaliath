# 🧭 Future features — notes

> Versión en español: [future-features.es.md](./future-features.es.md)

The **single** place for features and decisions that are not part of the system
today. Every other doc ([domain-model.md](./domain-model.md),
[architecture.md](./architecture.md)) describes only what exists now; anything
forward-looking lives here.

Each entry follows the same shape:

- **What** it is.
- **How it would change the current model** — the concrete edits a future
  implementation implies.
- **What already helps today** — the things already implemented that make that
  future change cheap (additive, no redesign, no data migration).

This is a design scratchpad, **not** a source of truth. When something gets
built, its final shape moves into [domain-model.md](./domain-model.md) and its
entry here is deleted.

---

## Contents

- [Invariants to preserve now](#invariants-to-preserve-now)
- [`excused` — external cancellation (e.g. a teacher cancels class)](#excused--external-cancellation-eg-a-teacher-cancels-class)
- [`skipped` — consciously not doing it](#skipped--consciously-not-doing-it)
- [`reschedule` — move a day's obligation to another day](#reschedule--move-a-days-obligation-to-another-day)
- [Parallel timers (more than one running at once)](#parallel-timers-more-than-one-running-at-once)
- [Offline-first sync](#offline-first-sync)
- [Cadences & shapes expressible now but not surfaced in the UI](#cadences--shapes-expressible-now-but-not-surfaced-in-the-ui)
- [Every-other-day (and, for free, every N days)](#every-other-day-and-for-free-every-n-days)
- [Configurable week start (Monday vs Sunday), seeded from the device](#configurable-week-start-monday-vs-sunday-seeded-from-the-device)
- [Time zone: travel, and days you never lived](#time-zone-travel-and-days-you-never-lived)
- [Pause everything at once](#pause-everything-at-once)
- [Duplicate an activity (the answer to "repurposing by renaming")](#duplicate-an-activity-the-answer-to-repurposing-by-renaming)
- [Accidental duplicates — noticing and merging "the same thing" twice](#accidental-duplicates--noticing-and-merging-the-same-thing-twice)
- [Undecided tooling & architecture choices](#undecided-tooling--architecture-choices)
- [Backlog / unshaped ideas](#backlog--unshaped-ideas)

---

## Invariants to preserve now

Cross-cutting properties that keep *everything below* cheap. They cost nothing
today but are expensive to add retroactively, so the initial implementation
should respect them:

1. **`ActivityOccurrence.status` is an extensible enum.** It ships as
   `pending | done`, but is treated like `activityType`: a set that can grow.
   Adding a value must not be a shape change.
2. **The meaning of each status lives in one place.** A single status-policy
   module decides "counts as done? breaks a streak? neutral?" — never scattered
   as `if (status === 'done')` across the code. Adding a state is one line there.
3. **Occurrences are keyed by `(activityId, date)` and allowed on any date.** A
   manual occurrence can exist on a day the recurrence never generated
   (`origin: 'manual'`, `scheduleId: null`). Never key them by recurrence index
   or forbid "non-due" days.

---

## `excused` — external cancellation (e.g. a teacher cancels class)

A visible, **neutral** outcome for a day that was due but is cancelled for a
reason outside the user's control — neither `done` nor `missed`.

- **How it changes the current model:** one new value in
  `ActivityOccurrence.status` (`'excused'`), plus one entry in the status-policy
  module marking it neutral for streaks and stats. No schema change, no
  migration.
- **What already helps:** the per-day occurrence record already exists and its
  `status` is designed to grow (invariant 1), and the completion/streak logic is
  meant to read the status-policy module rather than hardcode `done` (invariant
  2) — so adding a neutral state is a one-line policy change. Because the current
  model has *no* neutral/hidden state ([domain-model.md §9](./domain-model.md)),
  `excused` would be the single deliberate escape hatch; keep it visible (shown
  as excused, optional reason) so it can't be used to hide a miss.

## `skipped` — consciously not doing it

A persisted "I chose not to do it" outcome, distinct from a passive `missed`.
Structurally identical to `excused`; the only difference is policy — it counts
as a miss and breaks the streak.

- **How it changes the current model:** one enum value + one status-policy line,
  exactly like `excused`.
- **What already helps:** same as `excused`. Deliberately out for now because it
  overlaps with simply leaving a day `missed`; only worth adding if the product
  wants to show "actively skipped" apart from "the day passed."

## `reschedule` — move a day's obligation to another day

The instance due on day A happens on day B instead: A must not count as
`missed`, and B shows an occurrence the recurrence didn't generate.

- **How it changes the current model:** the only deferred feature that adds
  *logic*, not just an enum value. It needs a neutralizing status on A (the same
  machinery as `excused`), a manual occurrence on B, a sparse link field
  (`movedTo` / `movedFrom`), and projection rules that read the link for both
  days. Still additive; still no migration.
- **What already helps:** occurrences can already live on any date via
  `origin: 'manual'` + `scheduleId: null` (invariant 3) — that's what lets B
  exist at all; and the projection already replaces a generated occurrence with
  a persisted one per `(activity, date)` ([domain-model.md §8](./domain-model.md)),
  so B slots into the day view without special-casing. Deferred because free
  rescheduling is a dodge vector ("I'll move today's reading to tomorrow"
  forever); add only with friction/limits.

---

## Parallel timers (more than one running at once)

Let several activities' timers run simultaneously, instead of today's
one-at-a-time rule.

- **How it changes the current model:** essentially nothing in the data —
  remove the `if (ENFORCE_SINGLE_TIMER)` guard in `startTimer`. The real work is
  in the UI/notifications layer (the "something is running" badge and the
  "you've been at this X minutes" alerts), which today assume a single active
  timer.
- **What already helps:** `RunningTimer` is already modeled as a **collection**
  (a table/list), not a single nullable value; the one-at-a-time rule is
  enforced at *write time* rather than baked into the data shape; and each
  Activity keeps its own `progress.intervals` independently
  ([domain-model.md §11](./domain-model.md)). So two timers running at once were
  never a data conflict — only a product choice — and relaxing it touches no
  storage.

---

## Offline-first sync

Direction set in [architecture.md](./architecture.md): offline-first on
`expo-sqlite` now, sync against a backend later (the sync engine itself is still
open there).

- **How it changes the current model:** per-entity sync metadata — `updatedAt`,
  soft-delete tombstones, client-generated IDs — plus a conflict/merge strategy
  (last-write-wins or CRDT).
- **What already helps:** the append-only, exception-free occurrence design
  (deviations are just occurrences, never destructive rewrites of the plan) is
  merge-friendly, and entities already carry their own ids. The
  timestamps/tombstones should be added *before* sync ships, not retrofitted
  onto live data.

---

## Cadences & shapes expressible now but not surfaced in the UI

These need only UI work — the model already expresses them, so there is nothing
to add to the domain.

- **Monthly / yearly recurrences** — already valid `RecurrenceRule` kinds
  ([domain-model.md §4](./domain-model.md)); the UI just doesn't offer them yet.
  Deliberately left out of the first create form, which offers daily, chosen
  weekdays and quota only — the projection handles all four either way, so
  surfacing them later is one more option in one radio group.
- **Any activityType × any recurrence** (e.g. a counter on fixed weekdays, a
  timer on a yearly date) — the two axes are orthogonal
  ([domain-model.md §3](./domain-model.md)).
- **Compound targets** (e.g. "5 reps a week over at least 3 days") =
  `quota` + `dayGoal` + `periodGoal` combined.
- **What already helps:** all of these fall out of the
  recurrence × activityType × targets decomposition already in the model;
  building them is UI-only.

---

## Every-other-day (and, for free, every N days)

"One day on, one day off" — a rhythm that ignores the calendar and just counts.
Unlike the cadences above, the model does **not** express this yet: it needs a
new `RecurrenceRule` kind. It is still cheap, but it is the first cadence that
costs domain work rather than UI work.

```
{ kind: 'interval', everyNDays: number, anchor: CalendarDay }
```

**Why the anchor is the whole design.** Every existing fixed kind answers
`isDueOn(rule, day)` from the day alone: "is it a Tuesday", "is it the 3rd".
An interval can't — two Tuesdays a week apart are not interchangeable, so
something has to say where the count starts. Putting that reference **inside the
rule** keeps `isDueOn(rule, day)` a pure function of its two arguments, exactly
as it is today (§4).

The tempting alternative — reuse the schedule's `startDate` as the anchor — is a
trap. Schedules are versioned (§3): change the day target and a *new* version is
appended with a later `startDate`, which would silently shift the rhythm's parity
as a side effect of an unrelated edit. A rule-owned anchor is copied forward
across versions and survives that.

**Cost, concretely:**
- **No migration.** `recurrence_rule` is a JSON column, so a new kind needs no
  schema change — only a mapper that round-trips it.
- **No scoring changes.** It is a `FixedRecurrenceRule` (its due days are
  deterministic), so quota periods, `periodGoal` and the §3 grid are untouched.
- **Domain:** one `isDueOn` case — `daysBetween(anchor, day) % everyNDays === 0`,
  with days before the anchor never due. `CalendarDay` has `addDays` but no
  `daysBetween` yet; it belongs there, next to it, and nowhere else (§10).
- **UI:** one more option, plus a number field if the general "every N days" is
  surfaced rather than just the N=2 case.

**Two decisions to make when it is built:**
1. **What a pause does to the rhythm.** Status and schedule are independent
   timelines (§0), so pausing for five days and resuming would continue on the
   *original* parity rather than restarting from the resume day. That is
   defensible — it is a calendar rhythm, not a streak — but it is a choice, and
   the opposite (re-anchor on resume) is what some users will expect.
2. **Whether to expose N at all.** "Every other day" is the request; `everyNDays`
   generalises it for free in the model, but offering an arbitrary N in the form
   is a UI decision, not a modelling one.

---

## Configurable week start (Monday vs Sunday), seeded from the device

Which day a week begins on — matters **only** for `quota` recurrences with
`period: 'week'` (the "N times a week" activities) and any weekly stats/heatmap.
Fixed `daily`/`weekly`/`monthly`/`yearly` and `quota month`/`quota year` are
boundary-independent, so the blast radius is narrow.

- **How it changes the current model:** route *all* "which week does this day
  belong to?" logic through a single pure function (e.g. `weekOf(day, weekStart)`),
  exactly like `getCalendarDay` is the one chokepoint for logical days
  ([domain-model.md §10](./domain-model.md)). The quota projection and weekly
  stats call it; nothing computes week boundaries ad hoc. `weekStartDay` is a
  stored setting, **seeded from the device** at first run (read via
  `expo-localization` in the infrastructure layer — note its numbering is
  Sunday=1, vs the domain's ISO Monday=1; map it in the adapter, don't leak it
  inward). The domain receives a plain number as a parameter and never reads the
  device, so the projection stays pure and deterministic.
- **Changing it must be forward-only, never a silent global recompute.** Because
  weeks are a projection, moving the boundary re-buckets past `quota week`
  occurrences and can flip a past week from "met" to "missed" (same check-marks,
  different grouping) — silently altering history, which
  [§9](./domain-model.md) forbids. If the setting is ever made changeable
  mid-life, model it as a change-point timeline (like `ActivitySchedule`): weeks
  before the change keep the old boundary. Reading the device *live* would
  reintroduce this as an *involuntary* change (user travels, OS flips Sun↔Mon) —
  which is why we seed once and persist, and only ever *offer* to update, never
  follow the device silently.
- **What already helps:** occurrences are keyed by logical day, never by week
  ([domain-model.md §5](./domain-model.md)) — week membership is **never stored**,
  so changing `weekStart` is pure re-derivation over existing data. (`dayStartHour`
  is the closer precedent: its logical day *is* materialized on each occurrence,
  so it's applied **forward-only** — §10 — rather than recomputed; `weekStart` has
  it easier still, since there's nothing materialized to leave alone.) And the
  pattern of "funnel a calendar boundary through one function" is already
  established. `legacy/v1` is the cautionary tale: it scattered Luxon
  `startOf('week')` (hardwired to Monday) across ~6 files and left a
  `// TODO: make startOfWeek prop functional` it never finished — precisely
  because there was no single point to change.

---

## Time zone: travel, and days you never lived

The device's zone is read **implicitly** today: `getCalendarDay` builds the
logical day from local wall-clock components, so it silently follows the device.
That is correct while you stay put, and it quietly breaks when you travel.

**The invariant this must protect:** one logical day = **one real calendar date
the user actually lived**. A date they flew over must not carry records, and must
not read as failure either.

- **Mechanism: defer the switch to the next cutoff**, exactly like a
  `dayStartHour` change (`implementation-notes.md`). Both are "the reckoning
  changed"; letting the day in progress finish under the reckoning it started
  with avoids the logical day jumping mid-day. One rule covers both.
- **Cost: the zone has to stop being implicit.** To keep using the *old* zone
  until the cutoff, it must be an explicit parameter of `getCalendarDay`
  alongside `dayStartHour`, seeded from `expo-localization`
  (`getCalendars()[0].timeZone`, `string | null`) and stored like any other
  setting. Reading wall-clock components in an arbitrary IANA zone needs
  `Intl.DateTimeFormat` + `formatToParts` with `timeZone` — **verify Hermes
  supports it on both platforms before designing around it**; this repo already
  avoided `Intl.ListFormat` for that reason. Storing a UTC *offset* instead is
  not a fallback: DST changes it under you.
- **Crossing the date line, west (a date you skip).** Fly out on the 4th, land on
  the 6th: the 5th never existed for this user, and since `missed` is derived
  rather than stored (§8), that date reads as a day where everything was failed.
  **Accepted, deliberately.** Modelling "a day that did not exist" would mean a
  new stored marker, a migration and a fourth display status, to remove a little
  noise from a rare trip. The real answer is *pausing everything before you
  travel* (see below), which makes nothing due on that date in the first place.
- **Crossing the date line, east (a date you repeat).** Nothing to build.
  Occurrences are keyed `(activityId, date)` (§5), so living the 4th twice
  continues the *same* record with more hours available to finish it — which is
  the invariant above, not an exception to it.
- **The transition day is always shorter, never longer.** It runs from the old
  cutoff to the next cutoff in the new zone, so it lands in `(0, 24]` hours — and
  if you arrive shortly before the new zone's cutoff it can last minutes. A
  day that short would surface due activities and derive them `missed` almost
  immediately. Decide a floor below which the transition merges into the
  following day instead of creating a toy one.

---

## Pause everything at once

"I'm away for two weeks" — one action instead of pausing eight goals by hand.
Nothing new in the model: pausing a Goal already cascades to its Activities
(§0), so pausing every active goal makes nothing due, and no day in that stretch
reads as missed. It is the practical answer to travel, holidays and illness.

- **What it writes:** one `paused` `StatusPeriod` appended to each currently
  active goal, all dated the same logical day, **in one transaction** — a
  half-applied "pause everything" is worse than none.
- **Resuming is the part with the trap.** "Resume all" must not wake up goals the
  user had *deliberately* paused months earlier. So the bulk pause has to record
  which goals it touched, rather than resume being "set every paused goal
  active". That is the only piece of new state the feature needs, and skipping it
  produces a bug the user will read as the app losing their intent.
- **Watch the same-day status debt** (`implementation-notes.md`): timeline entries
  are keyed `(owner, from_day)`, and a bulk pause immediately followed by a
  resume on the same day is exactly the collision described there — and a far
  more likely way to hit it than pausing one goal by hand.
- **Scope to decide when it is built:** whether this is "pause all" only, or a
  named *away period* with an end date that resumes itself. The second is nicer
  and is a superset — but it is a schedule of its own, so it should not be
  smuggled in as an implementation detail of the first.

---

## Duplicate an activity (the answer to "repurposing by renaming")

Names are **not versioned** (domain-model §0): renaming an Activity or Goal
changes it everywhere, past included. That's the right call for the common case
(fixing a typo, clarifying a label), but it leaves one case awkward — a user who
renames "Push-ups" to "Pull-ups" a month in, expecting the old history to keep
the old name. The system can't tell a typo-fix from a repurpose, so it shouldn't
try.

The UX answer is **not** to version names (that would make the same activity
show different names across the calendar — more confusing for the common case
than it helps the rare one). It's to make **starting a new activity cheap** so
the lazy path is also the correct one:

- **What:** a "Duplicate activity" action that creates a new Activity with a
  fresh identity and empty history, copying the recurrence/schedule (and
  optionally goal, type, targets) of the source.
- **How it changes the current model:** nothing structural — a create use-case
  that reads one Activity + its current `ActivitySchedule` and writes a new
  Activity (new `id`) + a new schedule starting today. No new entity, no name
  versioning.
- **What already helps:** identity is the `id`, never the name; occurrences are
  keyed by `(activityId, date)`, so a duplicated activity naturally starts with
  a clean history while the original keeps its own. `ActivitySchedule` is already
  a standalone versioned record that can be copied.
- **Framing for the user:** rename = "same thing, relabeled" (affects
  everything); duplicate/new = "a different thing" (its own history). If both are
  one tap, renaming-to-repurpose stops being the path of least resistance.

Only revisit versioning names if user testing shows repurposing is both common
and painful — going that way later is easy; blocking on it now is not.

---

## Accidental duplicates — noticing and merging "the same thing" twice

Two entities the user considers the same thing, existing side by side. It arrives
by two different routes that end in the same place:

- **Locally**: you forget "Meditate" already exists and create it again.
- **Through sync**: two devices create it independently while offline.

Nothing breaks — identity is the `id`, never the name (see the entry above), so
both are perfectly valid entities. The damage is human: two identical-looking
rows in Today, and a history **split across two entities**, so neither shows the
real streak.

Note the tension this must respect: **duplicates have to stay allowed.**
"Duplicate an activity" is the *prescribed* answer to repurposing, so a
uniqueness rule on names would break a feature we deliberately want. The goal is
"make accidental duplicates easy to notice and undo", never "make them
impossible".

- **How it would change the current model:** nothing structural for the
  *detection* half — a create flow can compare normalised titles (trimmed,
  case- and accent-insensitive) and **warn**, never block. The *merge* half is
  where the real work is: occurrences are keyed `(activityId, date)`, so merging
  means re-keying one entity's occurrences onto the other, and deciding what
  happens when **both have an occurrence on the same day**. That resolution is
  per-`activityType` — summing two counters' repetitions is right, "both are
  done" for a checklist is trivial, and two timers' intervals concatenate — so it
  belongs in the domain half of the activityType registry (§7), as a "combine two
  days' progress" operation alongside `measure`.
- **What already helps:** identity is the `id`, so a duplicate is a valid entity
  rather than corrupt data — there is nothing to repair, only to consolidate.
  Occurrences keyed by `(activityId, date)` keep each entity's history cleanly
  separable, making a merge a **re-key** rather than an untangling. The registry
  is already the place where per-type behaviour lives, so the same-day resolution
  has an obvious home. And names aren't versioned, so renaming after a merge
  costs nothing.

---

## Undecided tooling & architecture choices

Open decisions moved out of [architecture.md](./architecture.md) so that doc
stays limited to what's in place. These are tooling/architecture, not domain
features — **none of them touch the domain model.**

- **Sync engine** — custom vs. an off-the-shelf library, not decided. Once
  chosen, document the conflict-resolution flow and fill in
  `shared/infrastructure/sync-engine/`. (See "Offline-first sync" above for the
  data-model side of the same topic.)
- **Shared global-state library** (Zustand, Redux, Context + TanStack Query, …)
  — not decided. Meanwhile each feature manages its own state via `ui/hooks/`,
  and only gets promoted to `core/providers/` + a global library if real
  cross-feature state appears.

---

## Backlog / unshaped ideas

Space for future notes: a "checklist with subtasks" activity type, richer stats
heatmaps (month/year), a reminders/notifications model, import/export, … Add as
they come up.
