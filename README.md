# Goaliath

Goaliath is a free time and goal management app. It seeks to make you feel proud
of your daily actions. Goaliath is opinionated and designed to support a specific
time management strategy — you can learn the method on
[our website](https://goaliath-app.github.io/guide).

> **This branch is a ground-up rewrite (v2).** v1 shipped as a JavaScript +
> Redux + AsyncStorage app; this rewrite starts over in **TypeScript** with a
> hexagonal, offline-first architecture. It is an early work in progress — see
> [`docs/implementation-notes.md`](docs/implementation-notes.md) for live status.

## What's different in the rewrite

The interesting part is the **domain model**: the calendar is not the source of
truth, it's a *projection* rebuilt from stable data (goals, activities,
schedules) plus a sparse record of deviations. That design carries the risk, so
it's built and tested as a pure, dependency-free core **before** any persistence
or UI.

## Design docs (the source of truth)

Read these before changing anything — each has a Spanish mirror (`*.es.md`):

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — where every file goes (hexagonal / feature-based).
- [`docs/domain-model.md`](docs/domain-model.md) — the goal/activity/task model and its behaviour.
- [`docs/future-features.md`](docs/future-features.md) — anything not built yet.
- [`docs/implementation-notes.md`](docs/implementation-notes.md) — living status: what's built and what's next.

## Stack

- **[React Native](https://github.com/facebook/react-native)** over **[Expo](https://github.com/expo/expo)** (SDK 56), **TypeScript** in strict mode.
- **[Expo Router](https://docs.expo.dev/router/introduction)** for file-based routing.
- **[expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)** as the local, offline-first data source (behind repository ports — planned, not yet wired).
- **[Jest](https://jestjs.io/)** via the `jest-expo` preset for tests.

Cross-cutting choices still open (state library, sync engine) are tracked in
[`docs/future-features.md`](docs/future-features.md), not baked in yet.

## Getting started

This repo is **npm-only** (see [`.gitignore`](.gitignore)); don't introduce yarn/pnpm/bun lockfiles.

```bash
npm install       # install dependencies
npx expo start    # run the app
```

## Development workflow

A change isn't done until **both** of these are green:

```bash
npm test          # Jest (jest-expo preset); npm run test:watch to watch
npx tsc --noEmit  # typecheck (Jest runs via Babel and does not typecheck)
```

Tests live in a `__tests__/` folder mirroring the source path, e.g.
`features/tracking/domain/StatusPeriod.ts` →
`features/tracking/__tests__/domain/StatusPeriod.test.ts`.

## Contributors

- [JimenaAndrea](https://github.com/JimenaAndrea)
- [OliverLSanz](https://github.com/OliverLSanz)
