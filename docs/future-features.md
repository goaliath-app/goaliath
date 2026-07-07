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
- **Any activityType × any recurrence** (e.g. a counter on fixed weekdays, a
  timer on a yearly date) — the two axes are orthogonal
  ([domain-model.md §3](./domain-model.md)).
- **Compound targets** (e.g. "5 reps a week over at least 3 days") =
  `quota` + `dayGoal` + `periodGoal` combined.
- **What already helps:** all of these fall out of the
  recurrence × activityType × targets decomposition already in the model;
  building them is UI-only.

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
