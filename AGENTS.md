# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Working in this repo (humans and AI agents)

## Design docs are the source of truth — read them first
- `docs/architecture.md` — where every file goes (hexagonal / ports & adapters, feature-based). Read **before adding files**.
- `docs/domain-model.md` — the goal/activity/task domain model and its behaviour. Read **before touching domain logic**.
- `docs/future-features.md` — anything not built yet lives **only** here. Do not add forward-looking notes to the other docs.
- `docs/implementation-notes.md` — working memory: **technical debt, known gaps and open decisions**. Read **before planning work**; add an entry when you leave debt behind, delete one when it stops being true. Deliberately *not* an inventory of what exists (the code is that) — don't turn it back into one.

Each doc except `implementation-notes.md` has a Spanish mirror `*.es.md`; keep the pair in sync when you edit one.

## Architecture in one line
`app/` (under `src/app/`) = Expo Router routes only, thin. Real code lives in `src/`: `features/<f>/{domain,application,infrastructure,ui}`, plus `src/shared/` (cross-feature) and `src/core/` (DI, providers). Dependencies point inward. `domain/` imports nothing project-specific and **never** React Native / Expo.

## Conventions
- TypeScript **strict**. Import alias `@/*` → `src/*` (works in the app, in `tsc`, and in Jest).
- The **domain layer is pure**: no RN/Expo imports, no I/O, deterministic. It carries the design risk, so it's tested hardest.
- Logical dates go through `getCalendarDay` **only** (`src/shared/domain/time/CalendarDay.ts`) — never compute dates ad hoc (domain-model §10).
- Value types are branded where it prevents mixups (e.g. `CalendarDay`).
- **Pin exact dependency versions** in `package.json` — no `^` or `~`, prod or dev. This is a public app: a reproducible install is worth more than a silent minor bump. When adding a dep, install it and write the resolved version literally. Check it for known vulnerabilities before committing.

## Tests
- Runner: **Jest** via the `jest-expo` preset (+ its peer `@react-native/jest-preset`). Pure-domain suites run under the `node` environment.
- Tests live in a **`__tests__/` folder mirroring the source path** (per `docs/architecture.md`), e.g. `features/tracking/domain/StatusPeriod.ts` → `features/tracking/__tests__/domain/StatusPeriod.test.ts`.
- Run `npm test` (once) or `npm run test:watch`. Typecheck with `npx tsc --noEmit`.
- **A change isn't done until both `npm test` and `npx tsc --noEmit` are green** (Jest runs via Babel and does not typecheck, so run `tsc` too).
