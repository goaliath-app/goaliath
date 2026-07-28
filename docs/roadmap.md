# Implementation roadmap — next 4 weeks

> Working plan, not a spec. Like [implementation-notes.md](./implementation-notes.md)
> this is single-language and **has no `.es` mirror** — it churns weekly, so keep
> it (and the CI doc-mirror guard's exempt list) out of the bilingual convention.
> When something here ships, its final shape moves into the design docs and the
> entry is deleted.

## Decisions taken (plan baseline)

| # | Decision |
|---|---|
| **D1** | Goals screen: **accordion** (goals expand to their activities). A cross-goal flat list only as a search/filter control if needed. |
| **D2** | **"Pause all" only** this month. A named *away period* with an end date is its own feature, later. |
| **D3** | The **user owns the day's outcome**: time/reps can be recorded by hand (D3a) **and** a day can be marked done below its goal (D3b). One "stated outcome" field that later progress writes respect, built **as one piece**. |
| **D4** | **Timer capped at 24h**: at 24h it stops itself (interval closed at `startedAt + 24h`) and the user is **notified the next time they open the app**. |
| **D5** | `excused` / `skipped` **stay in future-features** this month. |
| **D6** | `weekStart` is **seeded once from the device** and persisted; **not changeable** (no picker). |
| **A1** | **CI: yes** (GitHub Actions). See appendix. |

---

## Priorities

1. **Usable without the dev seed first** → goals screen (week 1).
2. **Correctness before new features** → the `StatusPeriod` same-day fix and the
   settings layer land before pause/resume and before the cutoff is editable.
3. **Every week ends green**: `npm test` + `tsc`, `.es` mirrors in sync (now
   watched by CI), all user text through i18n, zero hardcoded colours/inline styles.

> This deliberately reorders the docs' "tasks → stats": pause/resume without the
> `StatusPeriod` fix corrupts the timeline, and settings unlock the forward-only
> cutoff. `Task` (§6) slots in as filler; stats (§12) move to next month.

## Navigation model (design change)

**Documented in [architecture.md](./architecture.md) → "Navigation (app shell)"**
(and its `.es` mirror) — that's the source of truth; this is just the delivery view.

Two primary surfaces (**Today** and **Create** an activity/goal) stay reachable
without a menu — Create is a primary action on Today, *not* buried in the hub.
Everything else is management behind a **profile hub** opened from a top-left icon
on Today: settings, stats, goals, a calendar, account… Stack + hub, not tabs.

- **The hub is its own `profile` feature** (trimmed to `ui/`; navigates by route
  path, so no cross-feature imports) — not `shared/ui`, not app-shell. Every screen
  the user opens is a feature screen; only `_layout` + providers (`core/`) sit
  outside a feature. Grows into an account/profile screen later.

---

## Week 1 — Profile hub + goals screen + pay down the debt it touches + CI

**Goal:** the app is usable without the dev seed, reached through the real
navigation, and tooling stops relying on discipline.

- [x] **Profile hub screen** (app-shell level) + a **top-left icon on Today** that opens it. Thin: a list of items that navigate. First item wired: Goals. (Settings/stats items follow.) — `features/profile`, route `src/app/profile.tsx`.
- [x] Keep **Create** as a primary action on Today (a `+`) — it is *not* moved into the hub. This supersedes the old implementation-notes plan to move `+` onto the goals screen.
- [x] `GoalsScreen` as an **accordion** (D1) in the `tracking` feature + a thin top-level route `src/app/goals.tsx`, reached **from the hub** by route path (`/goals`). Backed by a `getGoalsOverview` read use case.
- [x] `listGoals` use case in `application/` + barrel export → the hook stops reading `goalRepository.findAll()` directly (**closes the rule-4 violation**).
- [x] Rename `ui/format/activityDraft.ts` → `ui/model/` (formatter stays in `ui/format/`). Pure rename.
- [x] **Write-path type guard (B):** each write use case validates the `activityType` before writing → silent corruption becomes a loud error. `application/assertActivityType.ts` + `ActivityRepository.findById`.
- [ ] **Real ESLint:** add `eslint-plugin-boundaries` + `react-native/no-inline-styles`/`no-color-literals` to `eslint.config.js`. *Attempted and backed out — land with CI (boundaries v7 needs `policies`/`dependencies` syntax, validated against injected violations; see implementation-notes).*
- [ ] **Stand up CI** (appendix): test + tsc + lint + `.es` mirror guard.

**Done (except lint + CI):** navigate goals↔activities and create from there; green. Lint and CI (block deep imports, raw colours, drifted docs) move forward together.

---

## Week 2 — Lifecycle: pause/resume (+ the `StatusPeriod` fix)

- [ ] **`StatusPeriod` fix first (domain):** "one entry per logical day, most recent change wins" — a domain op that replaces any entry already dated that day. Without it, pausing then resuming on the same day violates the PK.
- [ ] Pause / resume / archive goal and activity from the goals screen (the §0 cascade is already in the domain).
- [ ] Pin the aggregate `save` transactional contract with a test.
- [ ] **"Pause all" (D2):** one `paused` entry per active goal in a single transaction, **recording which goals it touched** so "resume all" won't wake goals paused deliberately earlier.

**Done:** pause/resume without breaking the PK, the cascade shows on Today, green.

---

## Week 3 — `settings` feature + forward-only cutoff

- [ ] Scaffold the `settings` feature (repo + table + migration; the runner already exists). Surface it **as items in the profile hub** (week 1) — settings is reached through the profile, not from Today.
- [ ] Persist `dayStartHour` and `weekStart`. **`weekStart` (D6): seeded once from the device** (map its Sunday=1 → ISO Monday=1 in the adapter) and **immutable** — no picker, and no forward-only change machinery (D6 removes that complexity).
- [ ] **A `dayStartHour` change takes effect at the next logical day**, never immediately (decided; build it before the setting is editable at all).
- [ ] Language picker + theme override (light/dark/system). The seam is `ThemeProvider` alone.

**Done:** settings persist, changing the cutoff never rewrites the past, language and theme are selectable, green.

---

## Week 4 — Day outcome (D3) + timer cap (D4) + Task

- [ ] **"Stated outcome" field (D3), as one piece:** a cheap migration + a condition in `logCounterRepetition`/`stopTimer` so they respect a manually set `done` and enable D3a (record by hand) and D3b (done below goal).
- [ ] **24h timer cap (D4):** on app open/foreground, reconcile `RunningTimer`s; any running ≥24h is stopped (interval closed at `startedAt + 24h`, credited to its `occurrenceDate`) and a notice is shown. This is **app-open reconciliation**, not a background job.
- [ ] **Remove the last counter repetition** (a plain edit, not an append-only log).
- [ ] **`Task` feature (§6):** minimal entity outside the pipeline; fetched by date and merged with the projection at the UI/query layer.

**Done:** you can edit a day's outcome (incl. in the past) consistently with §9; a forgotten timer is cut at 24h and announced; one-off tasks exist; green.

---

## Parked this month

Fine-grained cache / TanStack Query + de-N+1 of `getDayView` (when it scales) ·
tag on `OccurrenceProgress` (the write guard covers the risk) · stats §12 (next
month) · offline sync · `excused`/`skipped` (D5) · every-other-day.

## Standing hygiene

`npm test` + `tsc` green (CI carries the `node:sqlite` fix — see appendix) · `.es`
mirrors in sync (now in CI) · **timer on a real device** still unverified: do it in
week 4 when D4 is touched.

---

## Appendix — CI: how it's done

**What it is:** GitHub Actions runs four checks on every PR (and push to `master`):
typecheck, tests, lint, and `.es` mirror sync. It replaces discipline with a check
that can't be forgotten — exactly where the `architecture.es.md` mirror was missed.

**How to set it up** (week 1): create `.github/workflows/ci.yml`.

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [master]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0            # the doc guard needs history for git diff

      - uses: actions/setup-node@v4
        with:
          node-version: 24          # node:sqlite is stable on Node 24 -> no flag
          cache: npm

      - run: npm ci

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Tests
        run: npx jest --ci
        # Alternative if you pin Node 22 instead:
        #   env: { NODE_OPTIONS: --experimental-sqlite }

      - name: Lint
        run: npx eslint .

      - name: Doc mirrors in sync
        run: bash scripts/check-doc-mirrors.sh "${{ github.event.pull_request.base.sha || 'HEAD~1' }}"
```

**The mirror guard** — `scripts/check-doc-mirrors.sh`:

```bash
#!/usr/bin/env bash
# Fails if a docs/<x>.md changes without its docs/<x>.es.md in the same diff (and
# vice versa). implementation-notes.md and roadmap.md are exempt: working docs
# with no mirror (see AGENTS.md and this file's header).
set -euo pipefail
base="$1"
changed="$(git diff --name-only "$base" HEAD -- docs/)"
fail=0

is_changed() { grep -qxF "$1" <<< "$changed"; }

while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    docs/implementation-notes.md|docs/roadmap.md) : ;;    # exempt (no mirror)
    *.es.md)
      base_doc="${f%.es.md}.md"
      is_changed "$base_doc" || { echo "::error file=$f::$f changed but $base_doc did not"; fail=1; } ;;
    docs/*.md)
      mirror="${f%.md}.es.md"
      is_changed "$mirror"  || { echo "::error file=$f::$f changed but $mirror did not"; fail=1; } ;;
  esac
done <<< "$changed"

exit $fail
```

**Why these choices:**
- **Node 24** avoids the `--experimental-sqlite` flag Node 22 needed (the
  `persistence.test.ts` suite that fails locally here). The `NODE_OPTIONS`
  alternative is left commented in case you pin 22.
- `fetch-depth: 0` because the guard diffs against the PR base with `git diff`.
- The guard is **bidirectional** (editing only the `.es` side also fails) and
  respects the exempt working docs.
