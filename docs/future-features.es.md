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

## Inicio de semana configurable (lunes vs domingo), sembrado desde el dispositivo

En qué día empieza la semana — importa **solo** para recurrencias `quota` con
`period: 'week'` (las actividades "N veces por semana") y para cualquier
stat/heatmap semanal. Las fijas `daily`/`weekly`/`monthly`/`yearly` y las
`quota month`/`quota year` son independientes de la frontera, así que el radio de
impacto es estrecho.

- **Cómo cambia el modelo actual:** canalizar *toda* la lógica de "¿a qué semana
  pertenece este día?" por una única función pura (p.ej. `weekOf(day, weekStart)`),
  igual que `getCalendarDay` es el único punto para los días lógicos
  ([domain-model.es.md §10](./domain-model.es.md)). La proyección de quota y las
  stats semanales la llaman; nada calcula fronteras de semana ad hoc.
  `weekStartDay` es un ajuste guardado, **sembrado desde el dispositivo** en el
  primer arranque (leído vía `expo-localization` en la capa de infraestructura —
  ojo: su numeración es domingo=1, frente al ISO lunes=1 del dominio; mapéalo en
  el adaptador, no lo filtres hacia dentro). El dominio recibe un número plano
  como parámetro y nunca lee el dispositivo, así la proyección sigue pura y
  determinista.
- **Cambiarlo debe ser hacia delante, nunca un recálculo global silencioso.**
  Como las semanas son proyección, mover la frontera re-agrupa las ocurrencias
  `quota week` pasadas y puede hacer que una semana pase de "cumplida" a "fallada"
  (las mismas marcas, otra agrupación) — alterando el histórico en silencio, algo
  que [§9](./domain-model.es.md) prohíbe. Si el ajuste se hace cambiable a mitad
  de vida, modelarlo como change-point timeline (como `ActivitySchedule`): las
  semanas anteriores al cambio conservan la frontera vieja. Leer el dispositivo
  *en vivo* reintroduciría esto como cambio *involuntario* (el usuario viaja, el
  SO cambia dom↔lun) — por eso se siembra una vez y se persiste, y como mucho se
  *ofrece* actualizar, nunca se sigue al dispositivo en silencio.
- **Qué ya ayuda:** las ocurrencias se clavan por día lógico, nunca por semana
  ([domain-model.es.md §5](./domain-model.es.md)) — la pertenencia a una semana
  **nunca se guarda**, así que cambiar `weekStart` es pura re-derivación sobre los
  datos existentes. (`dayStartHour` es el precedente más cercano: su día lógico
  *sí* se materializa en cada ocurrencia, por eso se aplica **solo hacia
  adelante** —§10— en vez de recalcularse; `weekStart` lo tiene aún más fácil,
  porque no hay nada materializado que respetar.) Y el precedente de
  `getCalendarDay`/§10 significa que el patrón de "canalizar una frontera de
  calendario por una sola función" ya está establecido. `legacy/v1` es el caso de
  aviso: esparció el `startOf('week')` de Luxon (clavado a lunes) por ~6 ficheros
  y dejó un `// TODO: make startOfWeek prop functional` que nunca terminó —
  precisamente porque no había un punto único donde cambiarlo.

---

## Duplicar una actividad (la respuesta al "reconvertir renombrando")

Los nombres **no se versionan** (domain-model §0): renombrar una Activity o un
Goal lo cambia en todas partes, pasado incluido. Es lo correcto para el caso
común (corregir una errata, aclarar una etiqueta), pero deja un caso incómodo —
el usuario que renombra "Flexiones" a "Dominadas" un mes después esperando que el
histórico conserve el nombre viejo. El sistema no puede distinguir una errata de
una reconversión, así que no debe intentarlo.

La respuesta de UX **no** es versionar nombres (haría que la misma actividad se
llame distinto según el día en el calendario — más confuso para el caso común de
lo que ayuda al raro). Es hacer **barato crear una actividad nueva** para que el
camino perezoso sea también el correcto:

- **Qué:** una acción "Duplicar actividad" que crea una Activity nueva con
  identidad e histórico limpios, copiando la recurrencia/planificación (y
  opcionalmente goal, tipo, targets) de la original.
- **Cómo cambia el modelo actual:** nada estructural — un caso de uso de creación
  que lee una Activity + su `ActivitySchedule` actual y escribe una Activity
  nueva (`id` nuevo) + una planificación nueva desde hoy. Sin entidad nueva, sin
  versionar nombres.
- **Qué ya ayuda:** la identidad es el `id`, nunca el nombre; las ocurrencias se
  clavan por `(activityId, date)`, así que una actividad duplicada arranca con
  histórico limpio mientras la original conserva el suyo. `ActivitySchedule` ya
  es un registro versionado independiente que se puede copiar.
- **Marco para el usuario:** renombrar = "es lo mismo, con otra etiqueta" (afecta
  a todo); duplicar/nueva = "una cosa distinta" (con su propia historia). Si
  ambas son un toque, renombrar-para-reconvertir deja de ser el camino de menor
  resistencia.

Solo replantear el versionado de nombres si el testeo con usuarios muestra que
reconvertir es a la vez común y doloroso — ir por ahí después es fácil;
bloquearse en ello ahora, no.

---

## Decisiones abiertas de tooling y arquitectura

Decisiones sin cerrar movidas desde [architecture.es.md](./architecture.es.md)
para que ese doc se limite a lo que ya está en pie. Son de tooling/arquitectura,
no features de dominio — **ninguna toca el modelo de dominio.**

- **Motor de sincronización** — a medida vs. una librería ya hecha, sin decidir.
  Cuando se elija, documentar el flujo de resolución de conflictos y rellenar
  `shared/infrastructure/sync-engine/`. (Ver "Sincronización offline-first"
  arriba para el lado del modelo de datos del mismo tema.)
- **Librería de estado global compartido** (Zustand, Redux, Context + TanStack
  Query, …) — sin decidir. Mientras tanto cada feature gestiona su propio estado
  vía `ui/hooks/`, y solo se promociona a `core/providers/` + una librería global
  si aparece estado cross-feature real.

---

## Backlog / ideas sin definir

Espacio para apuntes futuros: un tipo de actividad "checklist con subtareas",
heatmaps de estadísticas más ricos (mes/año), un modelo de
recordatorios/notificaciones, import/export, … Añadir según surjan.
