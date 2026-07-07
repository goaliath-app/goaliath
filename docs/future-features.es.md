# 🧭 Features futuras — apuntes

> English version: [future-features.md](./future-features.md)

El **único** sitio para features y decisiones que hoy no forman parte del
sistema. Todos los demás documentos ([domain-model.es.md](./domain-model.es.md),
[architecture.es.md](./architecture.es.md)) describen solo lo que
existe ahora; todo lo que mira al futuro vive aquí.

Cada entrada sigue la misma forma:

- **Qué** es.
- **Cómo cambiaría el modelo actual** — las ediciones concretas que implica una
  implementación futura.
- **Qué ya hay hecho que ayuda** — lo ya implementado que hace barato ese cambio
  futuro (aditivo, sin rediseño, sin migración de datos).

Esto es un cuaderno de diseño, **no** una fuente de verdad. Cuando algo se
construye, su forma final se mueve a [domain-model.es.md](./domain-model.es.md)
y su entrada aquí se borra.

---

## Invariantes a preservar ahora

Propiedades transversales que mantienen barato *todo lo de abajo*. Hoy no cuestan
nada pero son caras de añadir a posteriori, así que la implementación inicial
debe respetarlas:

1. **`ActivityOccurrence.status` es un enum extensible.** Sale como
   `pending | done`, pero se trata como `activityType`: un conjunto que puede
   crecer. Añadir un valor no debe ser un cambio de forma.
2. **El significado de cada estado vive en un único sitio.** Un único módulo de
   política de estados decide "¿cuenta como hecho? ¿rompe racha? ¿neutro?" —
   nunca esparcido como `if (status === 'done')` por el código. Añadir un estado
   es una línea ahí.
3. **Las ocurrencias se clavan por `(activityId, date)` y se permiten en
   cualquier fecha.** Una ocurrencia manual puede existir en un día que la
   recurrencia nunca generó (`origin: 'manual'`, `scheduleId: null`). Nunca las
   claves por índice de recurrencia ni prohíbas días "no debidos".

---

## `excused` — cancelación externa (p.ej. un profesor cancela la clase)

Un desenlace visible y **neutro** para un día que tocaba pero se cancela por una
causa fuera del control del usuario — ni `done` ni `missed`.

- **Cómo cambia el modelo actual:** un valor nuevo en
  `ActivityOccurrence.status` (`'excused'`), más una entrada en el módulo de
  política de estados marcándolo neutro para rachas y estadísticas. Sin cambio de
  esquema, sin migración.
- **Qué ya ayuda:** el registro por día ya existe y su `status` está diseñado
  para crecer (invariante 1), y la lógica de completitud/racha está pensada para
  leer el módulo de política en vez de codificar `done` a mano (invariante 2) —
  así que añadir un estado neutro es una línea. Como el modelo actual **no** tiene
  ningún estado neutro/oculto ([domain-model.es.md §9](./domain-model.es.md)),
  `excused` sería la única escapatoria deliberada; mantenerlo visible (mostrado
  como excusado, con motivo opcional) para que no sirva para esconder un fallo.

## `skipped` — no hacerlo conscientemente

Un desenlace persistido de "elegí no hacerlo", distinto de un `missed` pasivo.
Estructuralmente idéntico a `excused`; la única diferencia es la política —
cuenta como fallo y rompe la racha.

- **Cómo cambia el modelo actual:** un valor de enum + una línea de política de
  estados, exactamente como `excused`.
- **Qué ya ayuda:** lo mismo que `excused`. Fuera por ahora porque solapa con
  simplemente dejar un día en `missed`; solo merece la pena si el producto quiere
  mostrar "saltado activamente" aparte de "el día pasó".

## `reschedule` — mover la obligación de un día a otro

La instancia que tocaba el día A ocurre en el día B: A no debe contar como
`missed`, y B muestra una ocurrencia que la recurrencia no generó.

- **Cómo cambia el modelo actual:** la única feature diferida que añade *lógica*,
  no solo un valor de enum. Necesita un estado neutralizador en A (la misma
  maquinaria que `excused`), una ocurrencia manual en B, un campo de enlace
  disperso (`movedTo` / `movedFrom`) y reglas de proyección que lean el enlace en
  ambos días. Sigue siendo aditivo; sigue sin migración.
- **Qué ya ayuda:** las ocurrencias ya pueden vivir en cualquier fecha vía
  `origin: 'manual'` + `scheduleId: null` (invariante 3) — eso es lo que permite
  que B exista; y la proyección ya sustituye una ocurrencia generada por la
  persistida por `(activity, date)` ([domain-model.es.md §8](./domain-model.es.md)),
  así que B encaja en la vista del día sin casos especiales. Diferido porque
  reprogramar libre es un vector de escaqueo ("muevo lo de hoy a mañana"
  indefinidamente); añadir solo con fricción/límites.

---

## Timers en paralelo (más de uno corriendo a la vez)

Permitir que corran a la vez los cronómetros de varias actividades, en vez de la
regla actual de uno a la vez.

- **Cómo cambia el modelo actual:** en los datos, esencialmente nada — quitar el
  bloque `if (ENFORCE_SINGLE_TIMER)` en `startTimer`. El trabajo real está en la
  capa de UI/notificaciones (el badge de "algo está corriendo" y los avisos de
  "llevas X minutos"), que hoy asumen un único cronómetro activo.
- **Qué ya ayuda:** `RunningTimer` ya se modela como **colección** (una
  tabla/lista), no como un único valor nullable; la regla de uno a la vez se
  aplica al *escribir* en vez de estar grabada en la forma del dato; y cada
  Activity guarda sus propios `progress.intervals` de forma independiente
  ([domain-model.es.md §11](./domain-model.es.md)). Así que dos
  cronómetros a la vez nunca fueron un conflicto de datos — solo una decisión de
  producto — y relajarlo no toca el almacenamiento.

---

## Sincronización offline-first

Dirección fijada en [architecture.es.md](./architecture.es.md):
offline-first sobre `expo-sqlite` ahora, sincronización contra un backend más
adelante (el motor de sync en sí sigue abierto allí).

- **Cómo cambia el modelo actual:** metadata de sync por entidad — `updatedAt`,
  tombstones de borrado lógico, IDs generados en cliente — más una estrategia de
  conflicto/merge (last-write-wins o CRDT).
- **Qué ya ayuda:** el diseño append-only y sin entidad de excepción (las
  desviaciones son solo ocurrencias, nunca reescrituras destructivas del plan) es
  amigable con el merge, y las entidades ya llevan sus propios ids. Los
  timestamps/tombstones conviene añadirlos *antes* de lanzar el sync, no
  retro-encajarlos sobre datos en vivo.

---

## Cadencias y tipos expresables hoy pero no expuestos en la UI

Solo necesitan trabajo de UI — el modelo ya los expresa, no hay nada que añadir
al dominio.

- **Recurrencias mensuales / anuales** — ya son `kind`s válidos de
  `RecurrenceRule` ([domain-model.es.md §4](./domain-model.es.md)); la
  UI simplemente aún no las ofrece.
- **Cualquier activityType × cualquier recurrencia** (p.ej. un counter en días
  fijos de la semana, un timer en una fecha anual) — los dos ejes son ortogonales
  ([domain-model.es.md §3](./domain-model.es.md)).
- **Targets compuestos** (p.ej. "5 reps a la semana repartidas en al menos 3
  días") = `quota` + `dayGoal` + `periodGoal` combinados.
- **Qué ya ayuda:** todo esto sale de la descomposición
  recurrencia × activityType × targets que ya está en el modelo; construirlo es
  solo UI.

---

## Decisiones abiertas de tooling y arquitectura

Decisiones sin cerrar movidas desde [architecture.es.md](./architecture.es.md)
para que ese doc se limite a lo que ya está en pie. Son de tooling/arquitectura,
no features de dominio — **ninguna toca el modelo de dominio.**

- **Motor de sincronización** — a medida vs. una librería ya hecha, sin decidir.
  Cuando se elija, documentar el flujo de resolución de conflictos y rellenar
  `shared/infrastructure/sync-engine/`. (Ver "Sincronización offline-first"
  arriba para el lado del modelo de datos del mismo tema.)
- **Runner de tests** — sin decidir. Recomendación por defecto: Jest +
  `@testing-library/react-native` (el estándar Expo/RN), pero abierto.
- **Librería de estado global compartido** (Zustand, Redux, Context + TanStack
  Query, …) — sin decidir. Mientras tanto cada feature gestiona su propio estado
  vía `ui/hooks/`, y solo se promociona a `core/providers/` + una librería global
  si aparece estado cross-feature real.

---

## Backlog / ideas sin definir

Espacio para apuntes futuros: un tipo de actividad "checklist con subtareas",
heatmaps de estadísticas más ricos (mes/año), un modelo de
recordatorios/notificaciones, import/export, … Añadir según surjan.
