# Arquitectura del proyecto — Feature-Based + Hexagonal (Offline-First)

> English version: [ARCHITECTURE.md](./ARCHITECTURE.md)

> Documento de referencia para saber **dónde va cada fichero**. Si tienes dudas al crear un fichero nuevo, consulta la sección [¿Dónde va esto?](#dónde-va-esto) antes de decidir.

## Contexto y objetivo

- App de React Native usando **Expo Router** (routing basado en ficheros).
- **Offline-first**: SQLite (`expo-sqlite`) como fuente local, con sincronización futura contra un backend.
- **Objetivo de diseño**: la UI nunca debe saber si un dato viene de SQLite, una API REST o cualquier otra fuente. Esa decisión vive por completo en la capa de infraestructura, escondida detrás de interfaces (puertos).

Este documento asume una arquitectura **hexagonal / puertos y adaptadores** aplicada por feature, dentro de una estructura de carpetas **feature-based**.

---

## Punto clave: Expo Router vs. la carpeta `app/`

Expo Router reserva la carpeta raíz `app/` para el routing basado en ficheros. **No la usamos para nada más.** Esto cambia la estructura típica de otros proyectos RN:

- `app/` → **solo rutas**. Cada fichero es una pantalla fina que importa y renderiza un componente de `src/features/*/ui/screens`.
- Toda la lógica real (domain, use cases, infraestructura, componentes, hooks) vive en `src/`.

**Regla dura:** un fichero dentro de `app/` no debería tener más de ~15-20 líneas. Si empieza a crecer, esa lógica se está escapando del feature y debería moverse a `src/features/<feature>/ui/screens`.

```tsx
// app/(tabs)/items/index.tsx
import { ItemListScreen } from '@/features/items/ui/screens/ItemListScreen';

export default function Page() {
  return <ItemListScreen />;
}
```

---

## Estructura de carpetas

> `items` a continuación es un nombre de feature de ejemplo — sustitúyelo por tus features reales (p. ej. `orders`, `contacts`, `tasks`...). Las capas y las reglas se mantienen igual sea cual sea el dominio.

```
app/                              # Expo Router — SOLO RUTAS, ficheros finos
├── _layout.tsx
├── (tabs)/
│   ├── items/
│   │   ├── index.tsx             # -> importa ItemListScreen
│   │   └── [id].tsx              # -> importa ItemDetailScreen
│   └── settings/
│       └── index.tsx

src/
├── features/
│   ├── items/
│   │   ├── domain/               # Entidades, value objects, interfaces (puertos)
│   │   │   ├── Item.ts
│   │   │   ├── ItemRepository.ts   # interfaz, NO una implementación
│   │   │   └── errors.ts
│   │   ├── application/          # Casos de uso (orquestan domain + repository)
│   │   │   ├── createItem.ts
│   │   │   ├── updateStatus.ts
│   │   │   └── syncItems.ts
│   │   ├── infrastructure/       # Implementaciones concretas (adaptadores)
│   │   │   ├── SqliteItemRepository.ts
│   │   │   ├── RestItemRepository.ts   # cuando exista el backend
│   │   │   ├── migrations/
│   │   │   │   └── index.ts            # las migraciones propias de este feature (solo contenido, sin orden)
│   │   │   └── mappers/
│   │   │       └── ItemMapper.ts       # fila de BD/DTO <-> entidad de dominio
│   │   ├── ui/
│   │   │   ├── screens/          # pantallas completas, importadas desde app/
│   │   │   ├── components/       # componentes propios de este feature
│   │   │   └── hooks/            # useItems(), useCreateItem()...
│   │   ├── __tests__/            # tests del feature (domain + application)
│   │   └── index.ts              # API pública del feature (barrel export)
│   │
│   └── settings/
│       └── ... (misma estructura, recorta capas si el feature es simple)
│
├── shared/
│   ├── domain/                   # Contratos cross-feature (p. ej. SyncStatus, Money)
│   ├── infrastructure/
│   │   ├── db/                   # conexión a expo-sqlite + runner de migraciones genérico (sin conocer features)
│   │   ├── api/                  # cliente HTTP base, interceptores
│   │   └── sync-engine/          # motor de sincronización genérico (aún por definir)
│   └── ui/                       # componentes totalmente genéricos (Button, Modal...)
│
├── core/
│   ├── di/                       # composition root: qué implementación se inyecta
│   └── providers/                # providers globales (theme, auth, query client...)
│
└── types/                        # tipos globales sin dueño claro (usar con moderación)
```

El `index.ts` de un feature tiene dos tipos de exports, ambos públicos pero para audiencias distintas:

- **De cara a la UI**: screens y hooks, consumidos por las rutas de `app/`.
- **De cara al composition root**: la interfaz del repositorio, su(s) adaptador(es) concreto(s) y las migraciones del feature — consumidos únicamente por `core/di/`, nunca por otro feature ni por `app/`.

Ambos tienen que pasar por `index.ts`. Nada fuera de un feature —ni siquiera `core/`— accede directamente a `domain/`, `application/` o `infrastructure/`. Ver [Inyección de dependencias](#inyección-de-dependencias-un-mecanismo-concreto) y [Migraciones de base de datos](#migraciones-de-base-de-datos-orden-centralizado-contenido-propiedad-del-feature) para entender por qué esto importa en la práctica, no solo en el papel.

---

## Reglas de dependencia (las que no se rompen)

1. **`domain/` nunca importa de `application/`, `infrastructure/` ni `ui/`.** Es la capa más interna, no depende de nada específico del proyecto (como mucho, librerías puras).
2. **`application/` importa de `domain/`, nunca directamente de `infrastructure/`.** Recibe el repositorio como parámetro/inyección (usa la interfaz, no la clase concreta).
3. **`infrastructure/` implementa las interfaces definidas en `domain/`.** Es el único sitio donde está permitido importar `expo-sqlite`, `fetch`, SDKs externos, etc.
4. **`ui/` solo llama a `application/` (casos de uso) a través de hooks.** Nunca importa `infrastructure/` directamente, nunca ejecuta queries SQL o llamadas HTTP por su cuenta.
5. **Un feature nunca importa de las carpetas internas de otro feature.** Si `items` necesita algo de `settings`, esa lógica o bien sube a `shared/`, o se expone a través del `index.ts` público de `settings`.
6. **`app/` (rutas) solo importa de `ui/screens`.** Nunca de `domain/`, `application/` ni `infrastructure/` directamente.
7. **La inyección de dependencias vive en `core/di/`, en ningún otro sitio.** Es el único lugar que sabe "hoy usamos SQLite, mañana quizá REST".

---

## ¿Dónde va esto?

| Si estás escribiendo... | Va en... |
|---|---|
| Una entidad con comportamiento/reglas de negocio (p. ej. `Item.updateStatus()`) | `features/<f>/domain/` |
| Una interfaz de repositorio (contrato de acceso a datos) | `features/<f>/domain/` |
| Un caso de uso (p. ej. "crear item", "sincronizar") | `features/<f>/application/` |
| Una query SQL, una llamada `fetch`, uso de `expo-sqlite` | `features/<f>/infrastructure/` |
| Un mapper entre una fila de BD/DTO de API y una entidad de dominio | `features/<f>/infrastructure/mappers/` |
| Un hook que llama a un caso de uso (`useCreateItem`) | `features/<f>/ui/hooks/` |
| Una pantalla completa | `features/<f>/ui/screens/` |
| Un componente usado solo dentro de un feature | `features/<f>/ui/components/` |
| Un componente genérico usado por 2+ features (Button, Card...) | `shared/ui/` |
| Un tipo/contrato usado por 2+ features (p. ej. `SyncStatus`) | `shared/domain/` |
| Un error genérico sin datos de negocio específicos (p. ej. `NotFoundError`) | `shared/domain/errors.ts` |
| Un error específico de un feature (extiende la base compartida) | `features/<f>/domain/errors.ts` |
| Conexión a BD local, runner de migraciones genérico (sin conocer features) | `shared/infrastructure/db/` |
| El contenido de la migración de una tabla de un feature | `features/<f>/infrastructure/migrations/` |
| Decidir qué migraciones de qué features se ejecutan, y en qué orden | `core/di/` |
| Cliente HTTP base, interceptores, cabeceras de auth | `shared/infrastructure/api/` |
| Lógica de sincronización genérica (no específica de un feature) | `shared/infrastructure/sync-engine/` |
| Decidir qué implementación concreta se inyecta (Sqlite vs Rest vs Mock) | `core/di/` |
| Un fichero de ruta de Expo Router | `app/` (fino, solo importa de `ui/screens`) |
| Providers globales (QueryClientProvider, ThemeProvider...) | `core/providers/` |

**Regla de desempate:** si un fichero podría ir en dos sitios, pregúntate "¿lo usa más de un feature?". Si sí → `shared/`. Si no → dentro del feature.

---

## Convenciones de nombres

- Entidades de dominio: PascalCase, sustantivo (`Item.ts`, `SyncMetadata.ts`).
- Interfaces de repositorio: `<Entidad>Repository.ts` (p. ej. `ItemRepository.ts`).
- Implementaciones: `<Origen><Entidad>Repository.ts` (p. ej. `SqliteItemRepository.ts`, `RestItemRepository.ts`).
- Casos de uso: verbo en camelCase, un fichero por caso de uso (`createItem.ts`, no un `itemUseCases.ts` cajón de sastre).
- Hooks: prefijo `use`, coincidiendo con el nombre del caso de uso cuando aplique (`useCreateItem.ts`).
- Mappers: `<Entidad>Mapper.ts`.
- Rutas de Expo Router: siguen la convención propia de Expo Router (no la tuya), pero el contenido siempre es un import + render.

---

## Errores de dominio: base compartida vs. específicos de feature

Para evitar duplicar `NotFoundError`, `ConflictError`, etc. en cada feature:

- **`shared/domain/errors.ts`**: jerarquía base de errores genéricos, sin nada específico de negocio (`DomainError`, `NotFoundError`, `ConflictError`, `ValidationError`, `UnauthorizedError`...).
- **`features/<f>/domain/errors.ts`**: errores específicos del feature, que **extienden** las clases base de `shared/domain/errors.ts` — nunca redefinen la jerarquía desde cero.

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

**Regla:** si el error no lleva ningún dato ni comportamiento específico del dominio del feature, va en `shared/domain/`. Si necesita contexto propio del feature (un mensaje con datos de dominio, un subtipo concreto), va en el feature, extendiendo la base compartida.

---

## Migraciones de base de datos: orden centralizado, contenido propiedad del feature

`shared/infrastructure/db/` solo contiene la conexión y un **runner genérico** — no tiene ningún conocimiento del esquema de ningún feature. Decidir el **orden de ejecución** entre features es una responsabilidad transversal, así que se resuelve en `core/di/`, el mismo composition root que ya conecta los repositorios — es el único sitio explícitamente autorizado a depender tanto de `shared/` como de `features/`.

- **Por qué centralizar el orden**: evita conflictos de orden entre migraciones que distintos features puedan escribir en paralelo (p. ej. dos features añadiendo ambos la migración `0004` a la vez).
- **Por qué no resolverlo dentro de `shared/`**: `shared/` solo puede depender de `shared/` (ver [reglas de lint](#forzar-el-aislamiento-de-features-lint-no-solo-convención)). Que `shared/infrastructure/db/` importe ficheros de migración de cada feature directamente violaría eso — y acceder a la carpeta interna `infrastructure/migrations/` de un feature en vez de a su `index.ts` también violaría `entry-point`.

```
shared/infrastructure/db/
├── runner.ts                 # genérico: ejecuta una lista ordenada de {version, up}, sin conocer features
└── connection.ts

features/items/infrastructure/migrations/
├── index.ts                  # exporta las migraciones propias de este feature
└── 0004_add_items_table.ts   # el feature es dueño del CONTENIDO de su propia tabla
```

```ts
// features/items/infrastructure/migrations/index.ts
export { migration as addItemsTable } from './0004_add_items_table';
export const migrations = [addItemsTable];
```

```ts
// features/items/index.ts
export { migrations as itemsMigrations } from './infrastructure/migrations';
// ...más los exports de cara a la UI y al DI del feature (ver arriba)
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

Esto mantiene `shared/` puro (solo importa `shared/`) y deja el cableado entre features dentro de `core/`, entrando a cada feature solo a través de su `index.ts` — exactamente la misma regla que ya rige el cableado de DI, aplicada de forma consistente en vez de como una excepción puntual.

---

## Inyección de dependencias: un mecanismo concreto

La regla 7 dice que `core/di/` decide qué implementación se inyecta, pero eso no explica cómo un hook llega realmente a tener el repositorio concreto. El mecanismo: **Context + composition root**.

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

Fíjate en que el import viene de `@/features/items` (su `index.ts`), no de `@/features/items/domain/ItemRepository` ni de `.../infrastructure/SqliteItemRepository` directamente — esos son ficheros internos. `ItemRepository` y `SqliteItemRepository` tienen que formar parte de los exports de cara al DI del feature para que esto funcione sin un import directo a un fichero interno.

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

`DependencyProvider` envuelve la app en `app/_layout.tsx`, junto al resto de providers globales. Desde un hook de un feature:

```ts
// features/items/ui/hooks/useCreateItem.ts
import { useDependencies } from '@/core/di/DependencyProvider';
import { createItem } from '../application/createItem';

export function useCreateItem() {
  const { itemRepository } = useDependencies();
  return useMutation({ mutationFn: createItem(itemRepository) });
}
```

Los tests de casos de uso (ver la sección de Testing) nunca pasan por el Context: llaman a `createItem(fakeRepo)` directamente. El Context es solo el mecanismo de cableado en producción.

---

## Forzar el aislamiento de features (lint, no solo convención)

La regla 5 (un feature nunca importa de las carpetas internas de otro feature) es solo una convención hasta que el lint la haga cumplir de verdad. Con un único feature de ejemplo no se nota, pero a partir del segundo o tercer feature merece la pena añadir `eslint-plugin-boundaries`:

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
    // fuerza a que los imports pasen por el index.ts público de cada feature
    'boundaries/entry-point': ['error', {
      default: 'disallow',
      rules: [{ target: 'feature', allow: 'index.ts' }],
    }],
  },
};
```

`boundaries/entry-point` es la regla que cierra el hueco real: sin ella, `element-types` por sí sola dejaría que `features/items` importe cualquier fichero interno de `features/settings`, ya que ambos son del mismo tipo `feature`. Con `entry-point`, solo se puede importar `features/settings/index.ts`.

---

## Testing

- **Tests de domain** y de **use case**: co-ubicados en `features/<f>/__tests__/`, sin dependencia de React Native ni de la base de datos real. Usan repositorios en memoria (fakes) que implementan la misma interfaz de `domain/`.
- **Tests de infrastructure** (p. ej. `SqliteItemRepository`): pueden vivir junto al fichero o en `__tests__/infrastructure/`, y sí tocan SQLite (en memoria o con un driver mockeado).
- **Tests de UI**: junto a los componentes, o en `__tests__/ui/` del feature.
- Pendiente: elegir un runner (Jest es el estándar en el ecosistema Expo/RN, pero está abierto).

```
features/items/__tests__/
├── domain/
│   └── Item.test.ts
├── application/
│   └── createItem.test.ts       # usa FakeItemRepository
└── infrastructure/
    └── SqliteItemRepository.test.ts
```

Un caso de uso testeado con un fake, para dejar claro por qué importa el desacoplamiento:

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

## Aún por decidir (revisar este documento cuando se resuelva)

- **Motor de sincronización**: aún sin decidir (a medida vs. librería). Cuando se decida, documentar aquí el flujo de resolución de conflictos y actualizar `shared/infrastructure/sync-engine/`.
- **Runner de tests**: aún sin decidir. Recomendación por defecto: Jest + `@testing-library/react-native` (el estándar en el ecosistema Expo), pero está abierto.
- **Estado global compartido** (Zustand, Redux, Context+TanStack Query, etc.): no definido en esta conversación. Mientras tanto, cada feature gestiona su propio estado vía hooks (`ui/hooks/`), y solo se promociona a `core/providers/` + una librería global si aparece una necesidad real de estado cross-feature.

---

## Checklist rápida antes de hacer commit

- [ ] ¿Un fichero en `app/` tiene más de 20 líneas, o importa algo que no sea `ui/screens`? → Muévelo a `src/`.
- [ ] ¿`domain/` importa algo de `infrastructure/` o de una librería de RN/Expo? → Rompe el aislamiento, arréglalo.
- [ ] ¿Un componente de `ui/` ejecuta una query SQL o un `fetch` directamente? → Debería pasar por un caso de uso.
- [ ] ¿Un feature importa ficheros internos de otro feature (no su `index.ts`)? → No está permitido, mueve la lógica compartida a `shared/`.
- [ ] ¿Añadiste una nueva implementación de repositorio? → Regístrala en `core/di/`, no la instancies a mano dentro de un componente.
- [ ] ¿`core/di/` (o cualquier otra cosa) importa un fichero de un feature que no está re-exportado desde su `index.ts`? → Añádelo a los exports de cara al DI del feature en vez de hacer un import directo a un fichero interno.
- [ ] ¿Pasa el lint de `boundaries` sin excepciones nuevas (`// eslint-disable`)? → Si necesitas desactivarlo, probablemente el fichero está en el sitio equivocado.
