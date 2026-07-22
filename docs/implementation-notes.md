# Implementation notes (working memory)

Things to keep in mind while implementing: **technical debt, known gaps, and
decisions still open.** Deliberately *not* an inventory of what exists — the code
is that, and a duplicated inventory only drifts. What was built and why lives in
the commit history; how the system is *meant* to work lives in
`domain-model.md` / `architecture.md`; features not built yet live in
`future-features.md`.

Keep this short. If an entry stops being true, delete it.

---

## Contents

- [Where the build is](#where-the-build-is)
- [Technical debt](#technical-debt)
- [Open decisions](#open-decisions)
- [Verification status](#verification-status)
- [Next](#next)

---

## Where the build is

The `tracking` feature works end to end: a Today screen backed by SQLite through
the full hexagon (UI → hook → use case → projection → repository port → SQLite
adapter → migration). All three activity types are implemented (checklist,
counter, timer), and every goal shape in domain-model §3's grid is scoreable.

The create flow is now closed end to end too: a form at `/activity/new` creates
an activity and, optionally, its goal in the same transaction. **The app no
longer depends on the dev seed to have data.**

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
- **There is no ESLint at all.** `package.json` has a `lint` script (`expo lint`)
  but no config and no eslint dependency, so *every* rule in `architecture.md` is
  convention only — the layering rules `eslint-plugin-boundaries` was meant to
  enforce, and now the styling rules too. **Decided: set it up with the styling
  work, covering both** (`eslint-config-expo` + `eslint-plugin-react-native`'s
  `no-inline-styles` / `no-color-literals`, plus `boundaries`).
- **The styling architecture is designed but not built.** `architecture.md`
  ("Styling") specifies design tokens, `Theme`-typed swappable themes, factory
  style files (`X.styles.ts`) and a memoizing `useThemedStyles`. None of it
  exists yet: **15 hardcoded colours across 42 usages**, styles declared inline
  in each component's own file, and no theme. Two symptoms of the gap worth
  naming, because they are what the design is meant to prevent:
  - `#0a84ff` (5 uses) and `#007aff` (2) are two near-identical blues nobody
    decided to have.
  - `app.json` declares `"userInterfaceStyle": "automatic"`, i.e. the app claims
    to follow the system's dark mode, while every colour is a light-mode
    literal. Either the theme work makes that true, or the declaration should be
    `"light"` until it does.
- **Cache invalidation is one global counter** (`core/providers/StoredDataProvider`).
  Any write bumps it; every reader has it as an effect dependency and recomputes.
  Coarse on purpose — reads are local SQLite queries, so over-recomputing is
  cheap, while tracking which reader a write affects is the kind of bookkeeping
  that fails silently. Two consequences to keep in mind: the rule is a
  *convention* (a hook that writes without calling `invalidate` goes stale with
  nothing to catch it), and every mounted reader refetches on every write. If
  either starts to bite, this provider is the seam a real query cache (TanStack
  Query) replaces.
- **`useCreateActivity` reads a repository directly** (`goalRepository.findAll()`)
  to fill the goal picker, which breaks dependency rule 4 — `ui/` reaches data
  through use cases only. It's there because no `listGoals` use case exists yet.
  The fix is small and obvious: add one in `application/`, export it from the
  feature barrel, and have the hook call that instead. This is exactly the kind of
  drift `eslint-plugin-boundaries` (above) would have caught at commit time.
- **The create form's draft model lives in `ui/format/activityDraft.ts`**, next to
  the preview formatter. `format/` is the wrong name for it: it holds the draft
  type, its validation, and the draft → `CreateActivityInput` mapping, none of
  which is formatting. It wants to be `ui/model/` with the formatter left behind
  in `ui/format/`. Pure rename, no logic change.
- **`/activity/new` is only reachable from a provisional `+` on the Today
  screen.** It belongs on the goals screen, which doesn't exist yet (see open
  decisions).
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
- **How the goals/activities screen shows its contents.** Four shapes were
  weighed: an accordion of goals with their activities, a flat list of goals, a
  flat list of all activities across goals, and one goal's activities in
  isolation. Two of those are not separate views at all — a collapsed accordion
  *is* the goals list, and an expanded one *is* a single goal's activities — so
  the real choice is **accordion vs. cross-goal flat list**, not a four-way mode
  switch. The flat list only earns its place for questions the grouping actively
  obstructs (search by name, "everything paused", "what falls on Mondays"), and
  that shape is a filter/search control, not a second view.
  Deliberately left open: Today already answers "what do I do now", so this
  screen is management, not the daily driver — and the decision is easier to make
  against real data, which the create flow now makes possible.
- **`activityType` is immutable in practice.** Changing it would reinterpret every
  past `OccurrenceProgress` (§5's untagged-progress boundary), so the day a
  *edit* screen exists, the field has to be locked or the change has to be
  modelled as archive-and-recreate. The create form is unaffected; this is a note
  for whoever builds editing.
- **Language follows the device and can't be changed in-app.** `resolveDeviceLanguage`
  reads `getLocales()[0]` once at startup; there is no picker and no persistence.
  Fine while `es`/`en` are the only bundles, but a user whose device is in a third
  language silently gets Spanish with no way out. A picker belongs with the
  `settings` feature whenever that arrives.
- **Settings aren't stored.** `dayStartHour` (0) and `weekStart` (ISO Monday) are
  container constants. `weekStart` should eventually be seeded from the device
  via an adapter (mapping its Sunday=1 numbering to ISO) and, if ever made
  changeable, applied **forward-only** — moving the boundary re-buckets past
  quota weeks and would silently rewrite history (`future-features`).
- **A `dayStartHour` change must take effect at the next logical day, never
  immediately.** *Decided; build it with the settings screen, before the setting
  is editable at all.*

  Stored history is already safe by construction: `ActivityOccurrence.date` is a
  persisted `CalendarDay` computed once at write time, so nothing re-buckets a
  past record no matter what the setting becomes. The exposure is the **day in
  progress**, and only when the change crosses *now* — i.e. when the current hour
  falls between the old cutoff and the new one:

  - **Raising it** (04:00 → 06:00 at 05:00) moves the logical day *backwards*.
    Occurrences already written today become dated in the future: they vanish
    from Today and reappear on their own at 06:00.
  - **Lowering it** (06:00 → 04:00 at 05:00) moves the logical day *forwards*.
    Yesterday becomes a past day instantly, and if it was due and unfinished the
    projection derives `missed` (§8) on the spot — a day destroyed while the user
    was still inside it, without a single stored row changing.

  Deferring the change to the next cutoff closes both windows at once, and needs
  no validation rules: it is what makes "forward-only" well defined here, since
  the day in progress otherwise straddles the change.

  Related trap for later: counter repetitions carry their own ISO timestamps
  inside `progress`. Nothing derives a day from them today — the occurrence's
  `date` is the bucket — but `DailyStatsSummary` (§12) will be tempted to, and it
  would disagree with the stored date in exactly these cases. That is what the
  §10 chokepoint rule exists to prevent.

---

## Verification status

Checklist and counter have been exercised on a real device. **The timer has
not** — it's covered by tests and bundles cleanly, but nobody has started one,
closed the app and confirmed it resumes.

---

## Next

**The goals/activities screen** — the last screen the app needs to be usable
without the dev seed, and the natural home for the `+` that currently sits on
Today. Its shape is still open (see open decisions), but two things are settled:
it is a *management* surface rather than the daily driver, and now that
activities can be created, the decision can be made against real data instead of
in the abstract.

The two small cleanups above (`listGoals` use case, `ui/format` → `ui/model`)
are worth folding into that work rather than doing on their own — the same hook
and directory get touched either way.

After that: the `Task` feature (§6), then stats / `DailyStatsSummary` (§12).
