# Project Architecture — Feature-Based + Hexagonal (Offline-First)

> Versión en español: [ARCHITECTURE.es.md](./ARCHITECTURE.es.md)

> Reference document to know **where each file belongs**. If you're unsure when creating a new file, check the [Where does this go?](#where-does-this-go) section before deciding.

## Context and goal

- React Native app using **Expo Router** (file-based routing).
- **Offline-first**: SQLite (`expo-sqlite`) as the local source, with future sync against a backend.
- **Design goal**: the UI should never know whether a piece of data comes from SQLite, a REST API, or any other source. That decision lives entirely in the infrastructure layer, hidden behind interfaces (ports).

This document assumes a **hexagonal / ports and adapters** architecture applied per feature, within a **feature-based** folder structure.

---

## Key point: Expo Router vs. the `app/` folder

Expo Router reserves the root `app/` folder for file-based routing. **We don't use it for anything else.** This changes the typical structure of other RN projects:

- `app/` → **routes only**. Each file is a thin screen that imports and renders a component from `src/features/*/ui/screens`.
- All real logic (domain, use cases, infrastructure, components, hooks) lives in `src/`.

**Hard rule:** a file inside `app/` shouldn't be more than ~15-20 lines. If it starts growing, that logic is leaking out of the feature and should move to `src/features/<feature>/ui/screens`.

```tsx
// app/(tabs)/items/index.tsx
import { ItemListScreen } from '@/features/items/ui/screens/ItemListScreen';

export default function Page() {
  return <ItemListScreen />;
}
```

---

## Folder structure

> `items` below is a placeholder feature name — swap it for whatever your real features are (e.g. `orders`, `contacts`, `tasks`...). The layers and rules stay the same regardless of the domain.

```
app/                              # Expo Router — ROUTES ONLY, thin files
├── _layout.tsx
├── (tabs)/
│   ├── items/
│   │   ├── index.tsx             # -> imports ItemListScreen
│   │   └── [id].tsx              # -> imports ItemDetailScreen
│   └── settings/
│       └── index.tsx

src/
├── features/
│   ├── items/
│   │   ├── domain/               # Entities, value objects, interfaces (ports)
│   │   │   ├── Item.ts
│   │   │   ├── ItemRepository.ts   # interface, NOT an implementation
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
│   ├── infrastructure/
│   │   ├── db/                   # expo-sqlite connection + generic migration runner (no feature knowledge)
│   │   ├── api/                  # base HTTP client, interceptors
│   │   └── sync-engine/          # generic sync engine (still to be defined)
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

Both must go through `index.ts`. Nothing outside a feature — not even `core/` — reaches into `domain/`, `application/`, or `infrastructure/` directly. See [Dependency injection](#dependency-injection-a-concrete-mechanism) and [Database migrations](#database-migrations-centralized-order-feature-owned-content) for why this matters in practice, not just in principle.

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
| An entity with behavior/business rules (e.g. `Item.updateStatus()`) | `features/<f>/domain/` |
| A repository interface (data access contract) | `features/<f>/domain/` |
| A use case (e.g. "create item", "sync") | `features/<f>/application/` |
| A SQL query, a `fetch` call, use of `expo-sqlite` | `features/<f>/infrastructure/` |
| A mapper between a DB row/API DTO and a domain entity | `features/<f>/infrastructure/mappers/` |
| A hook that calls a use case (`useCreateItem`) | `features/<f>/ui/hooks/` |
| A full screen | `features/<f>/ui/screens/` |
| A component used only within one feature | `features/<f>/ui/components/` |
| A generic component used by 2+ features (Button, Card...) | `shared/ui/` |
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

## Naming conventions

- Domain entities: PascalCase, noun (`Item.ts`, `SyncMetadata.ts`).
- Repository interfaces: `<Entity>Repository.ts` (e.g. `ItemRepository.ts`).
- Implementations: `<Source><Entity>Repository.ts` (e.g. `SqliteItemRepository.ts`, `RestItemRepository.ts`).
- Use cases: verb in camelCase, one file per use case (`createItem.ts`, not a catch-all `itemUseCases.ts`).
- Hooks: `use` prefix, matching the use case name when applicable (`useCreateItem.ts`).
- Mappers: `<Entity>Mapper.ts`.
- Expo Router routes: follow Expo Router's own convention (not yours), but the content is always an import + render.

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
- **Why not resolved inside `shared/`**: `shared/` is only allowed to depend on `shared/` (see [lint rules](#enforcing-feature-isolation-lint-not-just-convention)). Having `shared/infrastructure/db/` import per-feature migration files directly would violate that — and reaching into a feature's internal `infrastructure/migrations/` folder instead of its `index.ts` would violate `entry-point` too.

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

## Dependency injection: a concrete mechanism

Rule 7 says `core/di/` decides which implementation gets injected, but that doesn't explain how a hook actually gets hold of the concrete repository. The mechanism: **Context + composition root**.

```ts
// core/di/container.ts
import { ItemRepository, SqliteItemRepository } from '@/features/items';
import { db } from '@/shared/infrastructure/db/connection';

export interface Container {
  itemRepository: ItemRepository;
  // settingsRepository: SettingsRepository;
}

export function createContainer(): Container {
  return {
    itemRepository: new SqliteItemRepository(db),
  };
}
```

Note the import comes from `@/features/items` (its `index.ts`), not from `@/features/items/domain/ItemRepository` or `.../infrastructure/SqliteItemRepository` directly — those are internal files. `ItemRepository` and `SqliteItemRepository` must be part of the feature's DI-facing exports for this to work without a deep import.

```tsx
// core/di/DependencyProvider.tsx
import { createContext, useContext, PropsWithChildren } from 'react';
import { Container, createContainer } from './container';

const DependencyContext = createContext<Container | null>(null);

export function DependencyProvider({ children }: PropsWithChildren) {
  const container = createContainer();
  return (
    <DependencyContext.Provider value={container}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies(): Container {
  const ctx = useContext(DependencyContext);
  if (!ctx) throw new Error('useDependencies must be used within DependencyProvider');
  return ctx;
}
```

`DependencyProvider` wraps the app in `app/_layout.tsx`, alongside the other global providers. From a feature hook:

```ts
// features/items/ui/hooks/useCreateItem.ts
import { useDependencies } from '@/core/di/DependencyProvider';
import { createItem } from '../application/createItem';

export function useCreateItem() {
  const { itemRepository } = useDependencies();
  return useMutation({ mutationFn: createItem(itemRepository) });
}
```

Use-case tests (see the Testing section) never go through the Context at all: they call `createItem(fakeRepo)` directly. The Context is only the production wiring mechanism.

---

## Enforcing feature isolation (lint, not just convention)

Rule 5 (a feature never imports from another feature's internal folders) is only a convention until lint actually enforces it. With one example feature it doesn't show, but by the second or third feature it's worth adding `eslint-plugin-boundaries`:

```js
// .eslintrc.js
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'app', pattern: 'app/*' },
      { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
      { type: 'shared', pattern: 'src/shared/*' },
      { type: 'core', pattern: 'src/core/*' },
    ],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app', allow: ['feature'] },
        { from: 'feature', allow: ['shared', 'core'] },
        { from: 'shared', allow: ['shared'] },
        { from: 'core', allow: ['shared', 'feature'] },
      ],
    }],
    // forces imports to go through each feature's public index.ts
    'boundaries/entry-point': ['error', {
      default: 'disallow',
      rules: [{ target: 'feature', allow: 'index.ts' }],
    }],
  },
};
```

`boundaries/entry-point` is the rule that closes the actual gap: without it, `element-types` alone lets `features/items` import any internal file from `features/settings`, since both are the same `feature` type. With `entry-point`, only `features/settings/index.ts` can be imported.

---

## Testing

- **Domain** and **use case** tests: co-located in `features/<f>/__tests__/`, with no dependency on React Native or the real database. Use in-memory repositories (fakes) implementing the same `domain/` interface.
- **Infrastructure** tests (e.g. `SqliteItemRepository`): can live next to the file or in `__tests__/infrastructure/`, and do touch SQLite (in-memory or a mocked driver).
- **UI** tests: next to the components, or in the feature's `__tests__/ui/`.
- Still pending: pick a runner (Jest is the standard in the Expo/RN ecosystem, but it's open).

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

## Still to be decided (revisit this document once resolved)

- **Sync engine**: not decided yet (custom vs. library). Once decided, document the conflict-resolution flow here and update `shared/infrastructure/sync-engine/`.
- **Test runner**: not decided yet. Default recommendation: Jest + `@testing-library/react-native` (the standard in the Expo ecosystem), but it's open.
- **Shared global state** (Zustand, Redux, Context+TanStack Query, etc.): not defined in this conversation. In the meantime, each feature manages its own state via hooks (`ui/hooks/`), and only gets promoted to `core/providers/` + a global library if real cross-feature state shows up.

---

## Quick checklist before committing

- [ ] Is a file in `app/` more than 20 lines, or importing something other than `ui/screens`? → Move it to `src/`.
- [ ] Does `domain/` import anything from `infrastructure/` or an RN/Expo library? → Breaks isolation, fix it.
- [ ] Does a `ui/` component run a SQL query or a `fetch` directly? → It should go through a use case.
- [ ] Does a feature import internal files from another feature (not its `index.ts`)? → Not allowed, move shared logic to `shared/`.
- [ ] Did you add a new repository implementation? → Register it in `core/di/`, don't instantiate it by hand inside a component.
- [ ] Does `core/di/` (or anything else) import a feature file that isn't re-exported from that feature's `index.ts`? → Add it to the feature's DI-facing exports instead of deep-importing.
- [ ] Does the `boundaries` lint pass with no new exceptions (`// eslint-disable`)? → If you need to disable it, the file is probably in the wrong place.