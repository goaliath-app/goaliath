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

Navigation now matches the app-shell model: Today carries a **profile hub** icon
(top-left → `/profile`) and keeps Create as a primary action (`+`). The hub is
its own ui-only `profile` feature and navigates by route path, so it imports no
other feature. Its first item opens the **goals screen** (`/goals`) — an
accordion of goals expanding to their activities, read-only for now (pause/resume
is week 2). Both screens read through the application layer (`listGoals`,
`getGoalsOverview`).

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
- **ESLint runs, but only the base Expo config — the architecture rules are still
  unenforced.** `eslint.config.js` extends `eslint-config-expo/flat` and nothing
  else, so the two rule sets `architecture.md` leans on are *not* wired:
  `eslint-plugin-boundaries` (layering + feature isolation, the "convention until
  lint enforces it" gap) and `eslint-plugin-react-native`'s `no-inline-styles` /
  `no-color-literals` (the styling rules). Until those land, both are convention
  only. **Decided: add both to the existing config** — the base is already in
  place, so this is extending `eslint.config.js`, not standing ESLint up from
  scratch. Live proof they're still needed: the theme layer is fully built (see
  next note) yet a raw literal and an inline style sat in
  `core/di/DependencyProvider` until they were cleaned up by hand — exactly what
  `no-color-literals` catches at commit time.
  **Deferred once, on purpose.** A first pass wired `eslint-plugin-boundaries@7`
  + `eslint-plugin-react-native@5` and confirmed the *current code has zero
  violations* — the layering and styling conventions already hold. It was backed
  out because boundaries v7 renamed the rule (`element-types` → `dependencies`,
  `rules` → `policies`, `${…}` → `{{…}}`) and the legacy syntax only runs with
  deprecation warnings; landing it cleanly means writing v7 `policies` with
  capture-based same-feature selectors and *validating each one against an
  injected violation* (a mis-written selector silently disables a boundary, which
  is worse than no rule). Do it together with CI so the check that enforces it and
  the config it runs land as one piece. Two pre-existing **base-config** findings
  surfaced while it was on and will need a decision when CI turns lint red:
  `react-hooks/set-state-in-effect` on the `void load()` reader effect (used by
  every read hook — likely a rule-level exception, the pattern is intentional),
  and `import/no-unresolved` for `node:sqlite` in the test support file (a
  resolver setting). Neither is caused by the architecture rules.
- **The styling architecture is built; what's missing is the lint that guards it.**
  `architecture.md` ("Styling") is now implemented end to end: `shared/theme/`
  holds `palette.ts` (the one file with hex), token scales, `Theme`-typed light /
  dark / grayscale themes, a memoizing `useThemedStyles`, and factory `X.styles.ts`
  files colocated with their components; `ThemeProvider` is mounted at the app
  root and follows the OS colour scheme, so the `"userInterfaceStyle": "automatic"`
  in `app.json` is now honoured. The contrast suite runs over the theme registry.
  What remains is not the architecture but its enforcement (the ESLint note above)
  and the in-app light/dark/system override, which waits on a settings screen (its
  seam is `ThemeProvider` alone — see the component's own note).
- **Cache invalidation is one global counter** (`core/providers/StoredDataProvider`).
  Any write bumps it; every reader has it as an effect dependency and recomputes.
  Coarse on purpose — reads are local SQLite queries, so over-recomputing is
  cheap, while tracking which reader a write affects is the kind of bookkeeping
  that fails silently. Two consequences to keep in mind: the rule is a
  *convention* (a hook that writes without calling `invalidate` goes stale with
  nothing to catch it), and every mounted reader refetches on every write. If
  either starts to bite, this provider is the seam a real query cache (TanStack
  Query) replaces.
- **`OccurrenceProgress` is an untagged union (domain-model §5, by design), now
  guarded at the write path.** The occurrence carries no `activityType`
  discriminant, so which member of `Checklist | Counter | Timer` its `progress`
  is is known only from the owning activity's type, and each write use case
  assumes its own shape and casts at a named boundary. Each one
  (`toggleChecklistDone`, `logCounterRepetition`, `startTimer`, `stopTimer`) now
  calls `assertActivityType` (`application/assertActivityType.ts`) first — it
  loads the activity via `ActivityRepository.findById` and throws if the type
  isn't the one the caller routed to, so a mis-routed screen fails loudly instead
  of writing progress the projection later misreads silently. The cast stays as
  defence against a missing field, but the latent-correctness risk is closed
  here. What the guard does **not** cover is the *"`activityType` is immutable in
  practice"* open decision below: a type *change* would reinterpret existing
  progress, a different problem. Adding the discriminant and dropping the casts is
  still on the table if editing ever makes the type mutable.
- **The `.es` doc mirrors drift silently.** `AGENTS.md` requires every doc except
  this one to stay in sync with its `*.es.md` mirror, but nothing enforces it —
  and it was already missed once (an `architecture.md` edit that didn't reach
  `architecture.es.md`). It is the same "convention until something enforces it"
  gap as the lint rules: a coupling rule ("edit A, also touch B") is exactly what
  a human or an agent forgets at the moment of editing A. **Recommended guard**: a
  CI check that fails a PR when a `docs/<name>.md` changes without its
  `docs/<name>.es.md` changing in the same diff (a few lines of `git diff --name-only`
  against the merge base). Not built yet; until it is, the rule relies on
  discipline and will keep drifting.
- **The goals screen is read-only until pause/resume lands (roadmap week 2).**
  The `profile` hub (top-left on Today → `/profile`) and the `GoalsScreen`
  accordion (`/goals`) now exist, so goals and their activities are reachable
  without the dev seed, and `listGoals` / `getGoalsOverview` feed them through the
  application layer (rule 4 respected). What's missing is *acting* on them:
  pausing, resuming and archiving a goal or activity from that screen, which is
  where the `StatusPeriod` same-day fix has to land first (both are week 2). The
  hub lists only Goals today; settings and stats become items as those features
  arrive.
- **`getDayView` does N+1 queries** — per activity it fetches the goal, the
  schedule timeline, the day's occurrence, and (for quotas) the period's
  occurrences. Fine at demo scale, worth batching when activity counts grow.
  **The real cliff is the product of this and the global invalidation counter
  above, not either alone**: because *every* write bumps the counter and *every*
  mounted reader re-runs its query, a single "log one rep" re-executes this whole
  N+1 projection for every screen currently mounted. Neither is worth fixing in
  isolation; the pair is the signal that `StoredDataProvider` should become a real
  query cache (TanStack Query) with batched, per-key reads — do both at that seam,
  not piecemeal.
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

**Lifecycle: pause / resume / archive** (roadmap week 2). The goals screen shows
status but can't yet change it. The blocker to clear first is the `StatusPeriod`
same-day fix (see Technical debt) — a domain op that keeps one entry per logical
day, most recent wins — without which pausing then resuming on the same day
violates the primary key. Then wire pause/resume/archive from the goals screen
(the §0 cascade is already in the domain) and pin the aggregate `save`
transactional contract with a test.

Still open from week 1 and deliberately paused: **real ESLint** (boundaries + RN
style rules) — land it with **CI** so the config and the check that runs it ship
together (see the ESLint entry in Technical debt for the v7-syntax caveat).

After that: `settings` feature + forward-only cutoff (week 3), then day-outcome
(D3) / timer cap (D4) / `Task` (§6) (week 4), then stats / `DailyStatsSummary`
(§12).
