# Project Architecture — Feature-Based + Hexagonal (Offline-First)

> Versión en español: [architecture.es.md](./architecture.es.md)

> Reference document to know **where each file belongs**. If you're unsure when creating a new file, check the [Where does this go?](#where-does-this-go) section before deciding.

## Contents

- [Context and goal](#context-and-goal)
- [Expo Router](#expo-router)
- [Navigation (app shell)](#navigation-app-shell)
- [Folder structure](#folder-structure)
- [Dependency rules (the ones you don't break)](#dependency-rules-the-ones-you-dont-break)
- [Where does this go?](#where-does-this-go)
- [Domain style: data + pure functions, not classes](#domain-style-data--pure-functions-not-classes)
  - [Make illegal states unrepresentable — where you can](#make-illegal-states-unrepresentable--where-you-can)
  - [Instants: `Date` at the edges, ISO strings inside blobs](#instants-date-at-the-edges-iso-strings-inside-blobs)
  - [Calendar boundaries go through one function](#calendar-boundaries-go-through-one-function)
  - [Configuration is injected, never read from the domain](#configuration-is-injected-never-read-from-the-domain)
- [Naming conventions](#naming-conventions)
- [Domain errors: shared base vs. feature-specific](#domain-errors-shared-base-vs-feature-specific)
- [Database migrations: centralized order, feature-owned content](#database-migrations-centralized-order-feature-owned-content)
- [Styling: tokens, themes, and where styles live](#styling-tokens-themes-and-where-styles-live)
  - [Structure](#structure)
  - [What makes a new theme cheap](#what-makes-a-new-theme-cheap)
  - [The line on "no inline styles"](#the-line-on-no-inline-styles)
- [Testing](#testing)
- [Quick checklist before committing](#quick-checklist-before-committing)

---

## Context and goal

- React Native app using **Expo Router** (file-based routing).
- **Offline-first**: SQLite (`expo-sqlite`) as the local source, with future sync against a backend.
- **Design goal**: the UI should never know whether a piece of data comes from SQLite, a REST API, or any other source. That decision lives entirely in the infrastructure layer, hidden behind interfaces (ports).

This document assumes a **hexagonal / ports and adapters** architecture applied per feature, within a **feature-based** folder structure.

---

## Expo Router

Expo Router uses a dedicated folder for file-based routing. In this project we keep it in **`src/app/`**. **We don't use it for anything else.** This changes the typical structure of other RN projects:

- `src/app/` → **routes only**. Each file is a thin screen that imports and renders a component from `src/features/*/ui/screens`.
- All real logic (domain, use cases, infrastructure, components, hooks) lives elsewhere in `src/`.

**Hard rule:** a file inside `src/app/` shouldn't be more than ~15-20 lines. If it starts growing, that logic is leaking out of the feature and should move to `src/features/<feature>/ui/screens`.

```tsx
// src/app/(tabs)/items/index.tsx
import { ItemListScreen } from '@/features/items/ui/screens/ItemListScreen';

export default function Page() {
  return <ItemListScreen />;
}
```

---

## Navigation (app shell)

The app has exactly **two primary surfaces** — the ones reached every day without opening a menu:

1. **Today** (`src/app/index.tsx`) — what's due now. The home screen.
2. **Create** an activity/goal — a primary action available from Today (e.g. a `+`), deliberately *not* buried in a menu.

Everything else is **management**, reached through a single **profile hub** opened from a top-left icon on Today: settings, stats, the goals/activities screen, a calendar, account… The hub is a thin menu screen — it only navigates and owns no feature logic. A new management destination is one more item on it, never another primary surface.

- **Flat routes, not nested under the hub.** Settings, stats, goals and calendar are **siblings reached *through* the profile menu, not children of it**, so their routes sit at the top level (`/settings`, `/goals`…), each a thin file owned by its feature — never under `/profile/…`. This keeps the **route hierarchy** (the URL tree) decoupled from the **navigation graph** (who links to whom): the fact that the profile is today's entry point to settings is a choice expressed in the hub screen's links, not a structure baked into paths. So when Today later wants a shortcut straight to stats, it links to `/stats` — no route to move. Only a genuine parent/child family stays nested (`activity/new`, later `activity/[id]`).
- **Presentation:** management destinations **push** onto the stack (back returns through the hub to Today); **create** is presented as **modal** — it's a task you complete and dismiss, not a place you navigate into.

---

## Folder structure

```
src/
├── app/                          # Expo Router — ROUTES ONLY, thin files
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── items/
│       │   ├── index.tsx         # -> imports ItemListScreen
│       │   └── [id].tsx          # -> imports ItemDetailScreen
│       └── settings/
│           └── index.tsx
│
├── features/
│   ├── items/                    # Example feature
│   │   ├── domain/               # Entities, value objects, interfaces (ports)
│   │   │   ├── Item.ts
│   │   │   ├── ports/              # outbound contracts the domain demands of the outside
│   │   │   │   └── ItemRepository.ts   # interface, NOT an implementation
│   │   │   └── errors.ts
│   │   ├── application/          # Use cases (orchestrate domain + repository)
│   │   │   ├── createItem.ts
│   │   │   ├── updateStatus.ts
│   │   │   └── syncItems.ts
│   │   ├── infrastructure/       # Concrete implementations (adapters)
│   │   │   ├── SqliteItemRepository.ts
│   │   │   ├── RestItemRepository.ts   # once the backend exists
│   │   │   ├── migrations/
│   │   │   │   └── index.ts            # this feature's own migrations (content only, no ordering)
│   │   │   └── mappers/
│   │   │       └── ItemMapper.ts       # DB row/DTO <-> domain entity
│   │   ├── ui/
│   │   │   ├── screens/          # full screens, imported from app/
│   │   │   ├── components/       # components owned by this feature
│   │   │   └── hooks/            # useItems(), useCreateItem()...
│   │   ├── __tests__/            # feature tests (domain + application)
│   │   └── index.ts              # public API of the feature (barrel export)
│   │
│   └── settings/
│       └── ... (same structure, trim layers if the feature is simple)
│
├── shared/
│   ├── domain/                   # Cross-feature contracts (e.g. SyncStatus, Money)
│   ├── i18n/                     # i18next setup + locales/<lang>/<namespace>.ts
│   ├── theme/                    # design tokens + themes (see Styling)
│   ├── infrastructure/
│   │   ├── db/                   # expo-sqlite connection + generic migration runner (no feature knowledge)
│   │   ├── api/                  # base HTTP client, interceptors
│   │   └── sync-engine/          # generic sync engine (placeholder for future sync)
│   └── ui/                       # fully generic components (Button, Modal...)
│
├── core/
│   ├── di/                       # composition root: which implementation gets injected
│   └── providers/                # global providers (theme, auth, query client...)
│
└── types/                        # global types with no clear owner (use sparingly)
```

A feature's `index.ts` has two kinds of exports, both public but for different audiences:

- **UI-facing**: screens and hooks, consumed by `app/` routes.
- **Composition-root-facing**: the repository interface, its concrete adapter(s), and the feature's migrations — consumed only by `core/di/`, never by another feature or by `app/`.

Both must go through `index.ts`. Nothing outside a feature — not even `core/` — reaches into `domain/`, `application/`, or `infrastructure/` directly.

---

## Dependency rules (the ones you don't break)

1. **`domain/` never imports from `application/`, `infrastructure/`, or `ui/`.** It's the innermost layer, and doesn't depend on anything project-specific (pure libraries at most).
2. **`application/` imports from `domain/`, never directly from `infrastructure/`.** It receives the repository as a parameter/injection (uses the interface, not the concrete class).
3. **`infrastructure/` implements the interfaces defined in `domain/`.** This is the only place allowed to import `expo-sqlite`, `fetch`, external SDKs, etc.
4. **`ui/` only calls `application/` (use cases) through hooks.** Never imports `infrastructure/` directly, never runs SQL queries or HTTP calls itself.
5. **A feature never imports from another feature's internal folders.** If `items` needs something from `settings`, that logic either moves up to `shared/`, or gets exposed through `settings`'s public `index.ts`.
6. **`app/` (routes) only imports from `ui/screens`.** Never from `domain/`, `application/`, or `infrastructure/` directly.
7. **Dependency injection lives in `core/di/`, nowhere else.** It's the single place that knows "today we use SQLite, tomorrow maybe REST".

---

## Where does this go?

| If you're writing... | It goes in... |
|---|---|
| An entity with behavior/business rules (e.g. `updateStatus(item, …)`) | `features/<f>/domain/` |
| A repository interface (data access contract) | `features/<f>/domain/ports/` |
| A use case (e.g. "create item", "sync") | `features/<f>/application/` |
| A SQL query, a `fetch` call, use of `expo-sqlite` | `features/<f>/infrastructure/` |
| A mapper between a DB row/API DTO and a domain entity | `features/<f>/infrastructure/mappers/` |
| A hook that calls a use case (`useCreateItem`) | `features/<f>/ui/hooks/` |
| A full screen | `features/<f>/ui/screens/` |
| A component used only within one feature | `features/<f>/ui/components/` |
| A generic component used by 2+ features (Button, Card...) | `shared/ui/` |
| A user-visible string (never hardcoded in a component) | `shared/i18n/locales/<lang>/<namespace>.ts` |
| A colour, spacing or type value (never hardcoded in a component) | `shared/theme/` |
| The styles of one component or screen | `<ComponentName>.styles.ts`, beside it |
| A type/contract used by 2+ features (e.g. `SyncStatus`) | `shared/domain/` |
| A generic error with no feature-specific business data (e.g. `NotFoundError`) | `shared/domain/errors.ts` |
| A feature-specific error (extends the shared base) | `features/<f>/domain/errors.ts` |
| Local DB connection, generic migration runner (no feature knowledge) | `shared/infrastructure/db/` |
| The content of one feature's table migration | `features/<f>/infrastructure/migrations/` |
| Deciding which features' migrations run, and in what order | `core/di/` |
| Base HTTP client, interceptors, auth headers | `shared/infrastructure/api/` |
| Generic sync logic (not feature-specific) | `shared/infrastructure/sync-engine/` |
| Deciding which concrete implementation gets injected (Sqlite vs Rest vs Mock) | `core/di/` |
| An Expo Router route file | `app/` (thin, only imports from `ui/screens`) |
| Global providers (QueryClientProvider, ThemeProvider...) | `core/providers/` |

**Tie-breaker rule:** if a file could go in two places, ask yourself "does more than one feature use it?". If yes → `shared/`. If no → inside the feature.

---

## Domain style: data + pure functions, not classes

Domain entities are modeled as **plain data (types/interfaces) plus pure free functions**, not classes with methods. Behavior is an exported function that takes the entity as a parameter and returns a value (or a new entity) — e.g. `isActiveOn(periods, day)`, `isEffectivelyActive(activity, goal, day)` — never `entity.doThing()` with internal mutable state. This keeps the domain immutable, `this`-free, and trivially testable, and it matches how the pure core is already written (`StatusPeriod`, `RecurrenceRule`, `CalendarDay`).

Classes are still the right tool **outside** the domain: infrastructure adapters (repositories like `SqliteItemRepository`) are classes that implement a domain port and get injected by `core/di/`. So the split is deliberate — *data + free functions in `domain/`, classes in `infrastructure/`* — not an accident of two mixed styles. Method-style examples elsewhere in this doc (`Item.updateStatus()`) are illustrative shorthand, not a mandate to put behavior on the entity.

### Make illegal states unrepresentable — where you can

When the data carries the discriminant, encode the invariant in the type instead of checking it at runtime: a schedule is `FixedSchedule | QuotaSchedule`, so `"periodGoal" exists iff the recurrence is quota` simply can't be built wrong; and `quota` is excluded from `isDueOn`'s parameter type, so asking it is a compile error rather than a branch.

Where the discriminant **isn't** available this doesn't work, and pretending otherwise is worse than admitting it. An `ActivityOccurrence`'s `progress` has no type tag — which shape applies is known from the owning activity's type — so each consumer casts at a boundary that says so in a comment. Keep those boundaries few and named.

### Instants: `Date` at the edges, ISO strings inside blobs

First-class entity fields that hold an instant (`completedAt`, `startedAt`) are `Date`s, revived by the mapper. Instants **inside** a JSON blob (a counter's repetitions, a timer's intervals) stay ISO strings, so the blob round-trips through storage without the mapper needing to know its shape. Logical days are never `Date`s at all — see `CalendarDay`.

### Calendar boundaries go through one function

Anything that decides "which day/week/period does this belong to?" is funneled through a single pure function — `getCalendarDay` for logical days, `shared/domain/time/calendarRange` for periods. Nothing computes them ad hoc.

### Configuration is injected, never read from the domain

Values like `dayStartHour`, `weekStart` and the current time arrive as parameters from `core/di/`; the domain and application layers never read a device API or a global clock. That's what keeps the projection pure and its tests deterministic.

---

## Naming conventions

- Domain entities: PascalCase, noun (`Item.ts`, `SyncMetadata.ts`).
- Repository interfaces: `<Entity>Repository.ts` (e.g. `ItemRepository.ts`).
- Implementations: `<Source><Entity>Repository.ts` (e.g. `SqliteItemRepository.ts`, `RestItemRepository.ts`).
- Use cases: verb in camelCase, one file per use case (`createItem.ts`, not a catch-all `itemUseCases.ts`).
- Hooks: `use` prefix, matching the use case name when applicable (`useCreateItem.ts`).
- Mappers: `<Entity>Mapper.ts`.
- Expo Router routes: follow Expo Router's own convention, but the contents are always an import + render.

---

## Domain errors: shared base vs. feature-specific

To avoid duplicating `NotFoundError`, `ConflictError`, etc. in every feature:

- **`shared/domain/errors.ts`**: base hierarchy of generic errors, with nothing business-specific (`DomainError`, `NotFoundError`, `ConflictError`, `ValidationError`, `UnauthorizedError`...).
- **`features/<f>/domain/errors.ts`**: feature-specific errors, which **extend** the base classes from `shared/domain/errors.ts` — never redefine the hierarchy from scratch.

```ts
// shared/domain/errors.ts
export class DomainError extends Error {}
export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}
export class ValidationError extends DomainError {}
```

```ts
// features/items/domain/errors.ts
import { NotFoundError, ConflictError } from '@/shared/domain/errors';

export class ItemNotFoundError extends NotFoundError {
  constructor(id: string) { super(`Item ${id} not found`); }
}

export class ItemAlreadySyncedError extends ConflictError {}
```

**Rule:** if the error carries no data or behavior specific to the feature's domain, it goes in `shared/domain/`. If it needs feature-specific context (a message with domain data, a concrete subtype), it goes in the feature, extending the shared base.

---

## Database migrations: centralized order, feature-owned content

`shared/infrastructure/db/` holds only the connection and a **generic runner** — it has zero knowledge of any feature's schema. Deciding the **execution order** across features is a cross-cutting concern, so it's resolved in `core/di/`, the same composition root that already wires repositories — it's the one place explicitly allowed to depend on both `shared/` and `features/`.

- **Why centralized ordering**: avoids conflicts between migrations that different features might write in parallel (e.g. two features both adding migration `0004` at the same time).
- **Why not resolved inside `shared/`**: `shared/` is only allowed to depend on `shared/`. Having `shared/infrastructure/db/` import per-feature migration files directly would violate that — and reaching into a feature's internal `infrastructure/migrations/` folder instead of its `index.ts` would violate `entry-point` too.

```
shared/infrastructure/db/
├── runner.ts                 # generic: runs an ordered list of {version, up}, no feature knowledge
└── connection.ts

features/items/infrastructure/migrations/
├── index.ts                  # exports this feature's own migrations
└── 0004_add_items_table.ts   # the feature owns the CONTENT of its own table
```

```ts
// features/items/infrastructure/migrations/index.ts
export { migration as addItemsTable } from './0004_add_items_table';
export const migrations = [addItemsTable];
```

```ts
// features/items/index.ts
export { migrations as itemsMigrations } from './infrastructure/migrations';
// ...plus the feature's UI-facing and DI-facing exports (see above)
```

```ts
// core/di/migrations.ts
import { runMigrations } from '@/shared/infrastructure/db/runner';
import { db } from '@/shared/infrastructure/db/connection';
import { itemsMigrations } from '@/features/items';
import { settingsMigrations } from '@/features/settings';

export function bootstrapDatabase() {
  const all = [...itemsMigrations, ...settingsMigrations].sort((a, b) => a.version - b.version);
  return runMigrations(db, all);
}
```

This keeps `shared/` pure (it only ever imports `shared/`) and keeps the cross-feature wiring inside `core/`, entering each feature only through its `index.ts` — the exact same rule that already governs DI wiring, applied consistently instead of as a one-off exception.

---

## Styling: tokens, themes, and where styles live

Four rules, one mechanism:

1. **No hardcoded colours.** Raw values exist in exactly one file.
2. **No inline styles.** No style object literal inside JSX.
3. **Styles live in their own file**, never beside the component's code. Naming: `<ComponentName>.styles.ts`, next to `<ComponentName>.tsx`.
4. **Themes are pluggable.** Light and dark to start; more must not require touching a single component.

### Structure

```
src/shared/theme/
├── palette.ts          # raw values — the ONLY file in the repo containing a hex literal
├── tokens.ts           # spacing / radius / typography scales
├── Theme.ts            # the type every theme must satisfy
├── themes/
│   ├── light.ts
│   ├── dark.ts
│   └── grayscale.ts    # no hue at all — see below
├── ThemeContext.tsx    # the context + useTheme()
├── useThemedStyles.ts  # theme -> memoized StyleSheet
└── index.ts            # exports the Theme type, the hook and the theme registry — never the palette
```

The provider lives in `core/providers/`, with the other global providers. The *context* stays here so `shared/theme` is self-contained and a consumer never has to import from `core/`.

`useThemedStyles` memoizes on the module, not inside the hook, so every consumer of one style file shares a single `StyleSheet.create` per theme rather than one each.

### What makes a new theme cheap

- **`Theme` is a type every theme satisfies**, so adding one is filling in a shape and `tsc` reports any missing token. A theme can't be half-defined.
- **Semantic names, not palette names.** `colors.text.muted`, never `colors.gray500`. A component asking for "muted text" keeps working in any theme; one asking for grey 500 has to be rewritten for each. This is the single decision that makes light/dark a data change instead of a refactor.
- **`palette.ts` is not exported from `index.ts`.** Themes read it; nothing else can, so "no hardcoded colours" has no back door.
- **Spacing and typography live in the theme too**, even though they don't vary between light and dark today. It costs nothing now and means an accessibility theme with larger text doesn't require consumer changes.
- **Ramps are named for the colour they are, roles for what they mean.** `palette.blue`, `theme.colors.brand`. Naming a ramp `danger` collapses the two layers: the next theme wanting a different red has nowhere to go but `danger2`, and the palette grows by *themes × roles* instead of by colours that actually exist. Named by hue it usually shrinks the problem — a new theme reuses most of what is there and adds only what is genuinely missing.
- **A theme needing tones no ramp holds adds its own ramp to `palette.ts`**, never inline values in `themes/`. `grayscale` is the worked example: the default `slate` ramp carries a faint blue on purpose, so a theme whose whole point is the absence of hue needed a true-neutral `gray` ramp beside it.
- **Several roles may resolve to the same tone.** Roles are a vocabulary, not a promise that each owns a unique colour — `grayscale` collapses four. What a theme may not do is collapse a distinction the design carried in colour alone, which is why state is encoded in glyph and wording first.
- **Accessibility is enforced by the suite, not by review.** The contrast tests run over the theme registry, so a new theme is checked without anyone writing a case for it: text roles owe 4.5:1, control edges and glyph shapes owe 3:1, and row dividers are asserted to stay *below* it.

### The line on "no inline styles"

Banned: a style object literal in JSX (`style={{ marginTop: 8 }}`) — it hides a magic number where lint and the theme can't see it.

Allowed: composing named styles, including conditionally — `style={[styles.title, done && styles.titleMuted]}`. Also allowed: a genuinely computed value (a progress bar's width), which still has to be built from tokens rather than literals.

---

## Testing

- Runner: **Jest** with the `jest-expo` preset (and its peer `@react-native/jest-preset`). Run `npm test` / `npm run test:watch`; typecheck separately with `npx tsc --noEmit` (Jest transpiles via Babel and does not typecheck). Pure-domain suites run under the `node` environment; the `@/…` alias resolves via `moduleNameMapper`.
- **Domain** and **use case** tests: in `features/<f>/__tests__/`, with no dependency on React Native or the real database. Use in-memory repositories (fakes) implementing the same `domain/` interface.
- **Infrastructure** tests (e.g. `SqliteItemRepository`): can live next to the file or in `__tests__/infrastructure/`, and do touch SQLite (in-memory or a mocked driver).
- **UI** tests: next to the components, or in the feature's `__tests__/ui/`.
- **Shared fakes and builders** live in `features/<f>/__tests__/support/`. Jest's `testMatch` is narrowed to `*.test.*` precisely so files there aren't picked up as (empty) test suites.
- Passing `npm test` does **not** prove the app bundles: Jest transpiles with Babel and never resolves the way Metro does. A module that fails to resolve in the app can still pass the suite.

```
features/items/__tests__/
├── domain/
│   └── Item.test.ts
├── application/
│   └── createItem.test.ts       # uses FakeItemRepository
└── infrastructure/
    └── SqliteItemRepository.test.ts
```

A use case tested with a fake, to make clear why the decoupling matters:

```ts
class FakeItemRepository implements ItemRepository {
  private items = new Map<string, Item>();
  async save(item: Item) { this.items.set(item.id, item); }
  async findById(id: string) { return this.items.get(id) ?? null; }
  async findPendingSync() { return [...this.items.values()].filter(i => !i.synced); }
}

test('createItem saves the item', async () => {
  const repo = new FakeItemRepository();
  const useCase = createItem(repo);
  const item = await useCase({ name: 'Sample item' });
  expect(await repo.findById(item.id)).toEqual(item);
});
```

---

## Quick checklist before committing

- [ ] Is a file in `app/` more than 20 lines, or importing something other than `ui/screens`? → Move it to `src/`.
- [ ] Does `domain/` import anything from `infrastructure/` or an RN/Expo library? → Breaks isolation, fix it.
- [ ] Does a `ui/` component run a SQL query or a `fetch` directly? → It should go through a use case.
- [ ] Does a feature import internal files from another feature (not its `index.ts`)? → Not allowed, move shared logic to `shared/`.
- [ ] Did you add a new repository implementation? → Register it in `core/di/`, don't instantiate it by hand inside a component.
- [ ] Does `core/di/` (or anything else) import a feature file that isn't re-exported from that feature's `index.ts`? → Add it to the feature's DI-facing exports instead of deep-importing.
- [ ] Does the `boundaries` lint pass with no new exceptions (`// eslint-disable`)? → If you need to disable it, the file is probably in the wrong place.
