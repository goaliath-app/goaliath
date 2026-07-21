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

**The main blocker to real use: there is no create flow.** All data comes from the
dev seed, and the Goal/Activity/Schedule repositories are read-only.

**Green means**: `npm test` and `npx tsc --noEmit`. Metro bundling is checked
separately with `npx expo export --platform ios` (exit 0) — Jest runs via Babel
and won't catch a module that fails to resolve in the app.

---

## Technical debt

- **SQLite adapters have no automated tests.** `expo-sqlite` is a native module
  and doesn't run in the `node` test env, so the five `Sqlite*Repository` classes
  are only verified by running the app. The mappers — where the translation logic
  actually lives — *are* tested. If adapter bugs start biting, the fix is an
  integration test against a real SQLite handle, not more mocking.
- **`eslint-plugin-boundaries` isn't set up.** `architecture.md` prescribes it by
  the second or third feature; the layering is currently convention only. Worth
  doing when `tasks` lands and there are two features to keep apart.
- **`getDayView` does N+1 queries** — per activity it fetches the goal, the
  schedule timeline, the day's occurrence, and (for quotas) the period's
  occurrences. Fine at demo scale, worth batching when activity counts grow.
- **No `.gitattributes`.** Git reports CRLF/LF conversion warnings on every
  commit from this Windows checkout. Cosmetic, but a one-line file would silence
  it and avoid future line-ending churn.
- **Web bundling fails** inside `expo-sqlite/web` resolving `wa-sqlite.wasm`. A
  web-only packaging quirk; irrelevant while the app is mobile-only, but it means
  `expo export -p web` can't be used as a check.

---

## Open decisions

- **Forgotten running timer.** A session left running across days banks its whole
  elapsed time to the day it started — a 3-day-old timer would write a 72-hour
  interval. Neither §11 nor `future-features` covers it. Options weighed: clamp
  the interval to the end of its own logical day (cheap domain guard), and/or
  prompt on reopen when a session is suspiciously long (honest, matches §9's
  self-reporting stance, needs UI). Recommendation was "both"; undecided.
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

**The create flow for goals and activities.** It needs: write methods on those
repositories, an `IdGenerator` **port** (the first outbound port that isn't a
repository), domain constructors that validate and open the `active` status
period today, use cases (an activity and its first schedule should be created
atomically — §3 says every activity always has one), and a form. The form must
use `supportsMetricSum` so it can't create an activity nothing can score.

After that: the `Task` feature (§6), then stats / `DailyStatsSummary` (§12).
