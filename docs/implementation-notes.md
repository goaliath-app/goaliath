# Implementation notes (working memory)

Things to keep in mind while implementing: **technical debt, known gaps, and
decisions still open.** Deliberately *not* an inventory of what exists — the code
is that, and a duplicated inventory only drifts. What was built and why lives in
the commit history; how the system is *meant* to work lives in
`domain-model.md` / `architecture.md`; features not built yet live in
`future-features.md`.

Keep this short. If an entry stops being true, delete it.

---

## Where the build is

The `tracking` feature works end to end: a Today screen backed by SQLite through
the full hexagon (UI → hook → use case → projection → repository port → SQLite
adapter → migration). All three activity types are implemented (checklist,
counter, timer), and every goal shape in domain-model §3's grid is scoreable.

All user-facing text goes through `react-i18next` (`shared/i18n`), with `es` as
the source language and `en` mirroring it. Keys are typed via `CustomTypeOptions`,
so a wrong key fails `tsc` rather than rendering itself on screen.

**Green means**: `npm test` and `npx tsc --noEmit`. Metro bundling is checked
separately with `npx expo export --platform ios` (exit 0) — Jest runs via Babel
and won't catch a module that fails to resolve in the app.

---

## Technical debt

- **The `expo-sqlite` binding itself is still unverified.** Adapters depend on
  the narrow `SqlDatabase` interface, and their SQL *is* exercised against a real
  engine (`node:sqlite`) in `__tests__/infrastructure/persistence.test.ts`. What
  those tests can't cover is Expo's native binding — if a statement behaves
  differently there, only running the app will show it.
- **Two status changes on the same day break the save.** `StatusPeriod` entries
  are keyed `(owner, from_day)` in the schema, but nothing in the domain stops a
  timeline holding two entries for one logical day — pause a goal in the morning
  and resume it in the afternoon and the insert violates the primary key.
  `latestOnOrBefore` couldn't disambiguate them either (it breaks ties by list
  order, not by time). Not reachable yet — there's no pause/resume UI — but it's
  the first thing that flow will hit.
  **Decided fix**: keep **one entry per logical day, the most recent change
  wins**. That belongs in the *domain* — an "append a status change, replacing
  any entry already dated that day" operation — not in the persistence layer.
  With the domain honouring it, the primary key stops being an obstacle and
  becomes a guard that mirrors the invariant.
- **`save` on an aggregate must run inside a transaction**, because it writes two
  tables (the entity and its status timeline, §0). A crash between them leaves an
  entity with no status, which `statusOn` reads as "did not exist yet" — present
  but invisible. Every caller is transactional today, but nothing enforces it:
  it's an implicit contract on the port.
  (Timeline entries are upserted rather than deleted-and-reinserted, so a failed
  save no longer *destroys* existing history — the worst case is that the new
  entry didn't land. That also keeps row identity stable, which matters once sync
  adds `updatedAt`/tombstones.)
- **11 moderate npm audit findings remain, and they are not fixable.** The three
  *high* ones (`brace-expansion`, `js-yaml`, `shell-quote`) were resolved by a
  lockfile update. What's left is the `@expo/config-plugins` chain (`@expo/cli`,
  `@expo/metro-config`, `@expo/prebuild-config`, `expo-splash-screen`, `uuid`,
  `xcode`), and npm's proposed fix is to **downgrade `expo` from 56 to 46** — ten
  major SDK versions backwards, which would take expo-router, the expo-sqlite v56
  API and everything built on them with it. The cure is orders of magnitude worse
  than the disease.
  Mitigating context: these are **build/CLI tooling**, not code that ships in the
  app bundle, and `npx expo install --check` reports everything correctly aligned
  with SDK 56. So: **never run `npm audit fix --force` here.** Re-check when Expo
  publishes SDK updates that carry the fixes forward.
- **`eslint-plugin-boundaries` isn't set up.** `architecture.md` prescribes it by
  the second or third feature; the layering is currently convention only. Worth
  doing when `tasks` lands and there are two features to keep apart.
- **`getDayView` does N+1 queries** — per activity it fetches the goal, the
  schedule timeline, the day's occurrence, and (for quotas) the period's
  occurrences. Fine at demo scale, worth batching when activity counts grow.
- **Web bundling fails** inside `expo-sqlite/web` resolving `wa-sqlite.wasm`. A
  web-only packaging quirk; irrelevant while the app is mobile-only, but it means
  `expo export -p web` can't be used as a check.

---

## Open decisions

- **Forgotten running timer.** A session left running across days banks its whole
  elapsed time to the day it started — a 3-day-old timer would write a 72-hour
  interval. Neither §11 nor `future-features` covers it.
  "Clamp it at the day's cutoff and tell the user on reopen" was **built and then
  reverted**: it punishes the legitimate case of starting a session shortly
  before the cutoff and wanting to finish it, which is a normal thing to do and
  indistinguishable from the forgotten case by elapsed time alone.
  It also surfaced a **bigger missing piece** (below) that should probably be
  designed first, since it changes what the right answer is: if a timer day can
  be completed by hand, "the app cut your session short" stops being the only
  remedy available.
- **Who owns a measurable day's outcome — the user or the computation?** This is
  one decision wearing two faces, and both are missing today:
  1. *A timer activity can only be completed by running the timer.* Twenty
     minutes of reading away from the phone can't be recorded at all.
  2. *A day can't be marked done below its goal.* 15 of 20 minutes is never
     "done", even if you consider it so.

  Both clash with §9, whose whole stance is that the **outcome of a day is
  editable, including in the past**. And the split is visible in the code: a
  `checklist` day's status is set **by the user** (`toggleChecklistDone` writes it
  directly), while `counter`/`timer` **recompute it from progress** on every write
  (`status: complete ? 'done' : 'pending'`).

  That recomputation is what makes a manual override fragile rather than
  impossible: the projection reads the stored `status` and would honour a manual
  `done` immediately (no change needed there), but the next `stopTimer` or
  `logCounterRepetition` would silently overwrite it. The cheap trick — "progress
  may only promote to done, never demote" — **conflicts with removing counter
  repetitions**, where dropping below the goal *should* un-complete the day.

  So it needs a real answer: most likely recording that the user stated this
  day's outcome, so later progress writes respect it. That's one small field (a
  cheap migration, the runner exists) plus a condition in two use cases — not
  much work, but do it **as one piece**, or the two faces end up with two
  different mechanisms for the same question.
- **Removing counter repetitions.** Designed and deliberately not built. Agreed
  shape: remove the *last* repetition (a plain edit), not an append-only
  add/remove log — a `-1` event would break the per-repetition timestamps stats
  rely on, and the model keeps no audit trail of corrections anywhere else (§9).
- **Settings aren't stored.** `dayStartHour` (0) and `weekStart` (ISO Monday) are
  container constants. `weekStart` should eventually be seeded from the device
  via an adapter (mapping its Sunday=1 numbering to ISO) and, if ever made
  changeable, applied **forward-only** — moving the boundary re-buckets past
  quota weeks and would silently rewrite history (`future-features`).

---

## Verification status

Checklist and counter have been exercised on a real device. **The timer has
not** — it's covered by tests and bundles cleanly, but nobody has started one,
closed the app and confirmed it resumes.

---

## Next

**The create flow for goals and activities.** The domain half is done
(`createGoal`, `createActivity` — the latter returns the activity *with* its
first schedule and enforces the §3 invariants the type system can't). Remaining:

- an `IdGenerator` **port** — the first outbound port that isn't a repository —
  plus its adapter;
- a **`TransactionRunner` port** (`runInTransaction(fn)`). Creation writes
  several aggregates at once — a goal (optionally), an activity and its first
  schedule — so each repository keeps saving only **its own** aggregate and the
  *use case* declares the atomic boundary. (An earlier plan folded this into one
  `ActivityRepository.create(activity, schedule)` method; adding inline goal
  creation would have made that method write goals too, crossing aggregate
  boundaries.)
- **writes on the repositories** (`save` per aggregate) and
  `GoalRepository.findAll` for the picker;
- the `createGoal` (standalone) and `createActivity` **use cases**. The latter
  takes a goal as `{ kind: 'existing', goalId } | { kind: 'new', title, … }` so
  "pick one or create one" can't be violated, and it must **verify an existing
  goal exists** — an activity pointing at a missing goal is skipped by
  `getDayView`, i.e. invisible and unfixable from the app, the same hazard class
  as an activity with no schedule;
- the **form**, this repo's first multi-screen work (one route today, so it needs
  Expo Router navigation). Use `isMeasurable` to decide which goal shapes to
  offer. The goal picker must include **paused** goals; assigning one is valid but
  the activity won't appear in Today until the goal resumes (the §0 cascade), so
  the form should say so. Archived goals are excluded by default.

After that: the `Task` feature (§6), then stats / `DailyStatsSummary` (§12).
