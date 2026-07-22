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
  UI simplemente aún no las ofrece. Se dejaron fuera del primer formulario de
  creación a propósito, que solo ofrece diaria, días concretos de la semana y
  cuota — la proyección maneja las cuatro igual, así que sacarlas más adelante
  es una opción más en un grupo de radios.
- **Cualquier activityType × cualquier recurrencia** (p.ej. un counter en días
  fijos de la semana, un timer en una fecha anual) — los dos ejes son ortogonales
  ([domain-model.es.md §3](./domain-model.es.md)).
- **Targets compuestos** (p.ej. "5 reps a la semana repartidas en al menos 3
  días") = `quota` + `dayGoal` + `periodGoal` combinados.
- **Qué ya ayuda:** todo esto sale de la descomposición
  recurrencia × activityType × targets que ya está en el modelo; construirlo es
  solo UI.

---

## Un día sí, un día no (y, gratis, cada N días)

Un ritmo que ignora el calendario y solo cuenta. A diferencia de las cadencias de
arriba, el modelo **todavía no** expresa esto: necesita un `kind` nuevo de
`RecurrenceRule`. Sigue siendo barato, pero es la primera cadencia que cuesta
trabajo de dominio y no solo de UI.

```
{ kind: 'interval', everyNDays: number, anchor: CalendarDay }
```

**El ancla es todo el diseño.** Todas las cadencias fijas actuales responden a
`isDueOn(rule, day)` mirando solo el día: "¿es martes?", "¿es día 3?". Un
intervalo no puede — dos martes separados por una semana no son intercambiables,
así que algo tiene que decir dónde empieza la cuenta. Meter esa referencia
**dentro de la regla** mantiene `isDueOn(rule, day)` como función pura de sus dos
argumentos, exactamente como está hoy (§4).

La alternativa tentadora — reutilizar el `startDate` del schedule como ancla — es
una trampa. Los schedules están versionados (§3): si cambias el objetivo diario
se añade una versión *nueva* con un `startDate` posterior, lo que desplazaría en
silencio la paridad del ritmo como efecto colateral de una edición que no tenía
nada que ver. Un ancla que vive en la regla se copia de una versión a la
siguiente y sobrevive a eso.

**El coste, en concreto:**
- **Sin migración.** `recurrence_rule` es una columna JSON, así que un `kind`
  nuevo no cambia el esquema — solo el mapper que lo serializa de ida y vuelta.
- **Sin cambios en el scoring.** Es una `FixedRecurrenceRule` (sus días tocan de
  forma determinista), así que los periodos de cuota, `periodGoal` y la rejilla
  de §3 quedan intactos.
- **Dominio:** un caso más en `isDueOn` — `daysBetween(anchor, day) % everyNDays
  === 0`, con los días anteriores al ancla nunca tocando. `CalendarDay` tiene
  `addDays` pero aún no `daysBetween`; va ahí al lado, y en ningún otro sitio
  (§10).
- **UI:** una opción más, y un campo numérico si se expone el "cada N días"
  general en vez de solo el caso N=2.

**Dos decisiones para cuando se construya:**
1. **Qué le hace una pausa al ritmo.** Estado y schedule son timelines
   independientes (§0), así que pausar cinco días y reanudar continuaría con la
   paridad *original* en vez de reiniciar desde el día de reanudación. Es
   defendible — es un ritmo de calendario, no una racha — pero es una elección, y
   lo contrario (re-anclar al reanudar) es lo que esperará parte de la gente.
2. **Si exponer N o no.** "Un día sí, un día no" es lo que se pide; `everyNDays`
   lo generaliza gratis en el modelo, pero ofrecer una N arbitraria en el
   formulario es una decisión de UI, no de modelado.

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

## Zona horaria: viajes, y días que nunca viviste

Hoy la zona del dispositivo se lee de forma **implícita**: `getCalendarDay`
construye el día lógico con componentes de reloj local, así que sigue al
dispositivo en silencio. Es correcto mientras no te muevas, y se rompe sin avisar
en cuanto viajas.

**El invariante que hay que proteger:** un día lógico = **una fecha real de
calendario que el usuario vivió de verdad**. Una fecha que se pasó volando no
debe tener registros, y tampoco debe leerse como un fracaso.

- **Mecanismo: diferir el relevo al siguiente corte**, igual que un cambio de
  `dayStartHour` (`implementation-notes.md`). Los dos son "ha cambiado el sistema
  de cómputo del día"; dejar que el día en curso termine con las reglas con las
  que empezó evita que el día lógico salte a mitad. Una sola regla cubre ambos.
- **Coste: la zona tiene que dejar de ser implícita.** Para poder seguir usando
  la zona *vieja* hasta el corte, tiene que ser un parámetro explícito de
  `getCalendarDay` junto a `dayStartHour`, sembrado desde `expo-localization`
  (`getCalendars()[0].timeZone`, `string | null`) y guardado como cualquier otro
  ajuste. Leer componentes de reloj en una zona IANA arbitraria necesita
  `Intl.DateTimeFormat` + `formatToParts` con `timeZone` — **verificar que Hermes
  lo soporta en ambas plataformas antes de diseñar sobre ello**; este repo ya
  evitó `Intl.ListFormat` por ese mismo motivo. Guardar el *offset* UTC en vez del
  nombre de la zona no es alternativa: el horario de verano lo cambia por debajo.
- **Cruzar la línea de cambio de fecha hacia el oeste (una fecha que te saltas).**
  Sales el día 4 y aterrizas el 6: el 5 no existió para este usuario y, como
  `missed` se deriva en vez de guardarse (§8), esa fecha se lee como un día en el
  que se falló todo. **Se acepta, a propósito.** Modelar "un día que no existió"
  significaría una marca guardada nueva, una migración y un cuarto estado de
  visualización, para quitar un poco de ruido de un viaje infrecuente. La
  respuesta de verdad es *pausarlo todo antes de viajar* (ver más abajo), que
  hace que esa fecha no tenga nada que tocar.
- **Cruzar la línea hacia el este (una fecha que repites).** No hay nada que
  construir. Las ocurrencias van indexadas por `(activityId, date)` (§5), así que
  vivir el día 4 dos veces continúa el *mismo* registro con más horas para
  terminarlo — que es el invariante de arriba, no una excepción.
- **El día de transición siempre es más corto, nunca más largo.** Va del corte
  viejo al siguiente corte en la zona nueva, así que cae en `(0, 24]` horas — y
  si aterrizas poco antes del corte de la zona nueva puede durar minutos. Un día
  así sacaría actividades que tocan y las derivaría a `missed` casi al instante.
  Hay que decidir un mínimo por debajo del cual la transición se fusione con el
  día siguiente en vez de crear un día de juguete.

---

## Pausarlo todo de golpe

"Me voy dos semanas" — una acción en vez de pausar ocho goals a mano. No añade
nada al modelo: pausar un Goal ya cascadea a sus Activities (§0), así que pausar
todos los goals activos hace que no toque nada y que ningún día de ese tramo se
lea como fallado. Es la respuesta práctica a viajes, vacaciones y enfermedad.

- **Qué escribe:** un `StatusPeriod` `paused` añadido a cada goal activo, todos
  con el mismo día lógico y **en una sola transacción** — un "pausar todo" a
  medias es peor que no hacerlo.
- **Reanudar es la parte con trampa.** "Reanudar todo" no debe despertar goals
  que el usuario había pausado *a propósito* meses antes. Así que la pausa masiva
  tiene que registrar a cuáles tocó, en vez de que reanudar sea "poner activos
  todos los pausados". Es el único estado nuevo que necesita la funcionalidad, y
  saltárselo produce un bug que el usuario leerá como que la app pierde su
  intención.
- **Ojo con la deuda de dos cambios de estado el mismo día**
  (`implementation-notes.md`): las entradas del timeline van indexadas por
  `(owner, from_day)`, y una pausa masiva seguida de una reanudación el mismo día
  es exactamente la colisión que allí se describe — y una forma mucho más
  probable de toparse con ella que pausando un goal a mano.
- **Alcance a decidir cuando se construya:** si es solo "pausar todo", o un
  *periodo de ausencia* con nombre y fecha de fin que se reanuda solo. Lo segundo
  es más bonito y es un superconjunto — pero es una programación en sí misma, así
  que no debería colarse como detalle de implementación de lo primero.

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

## Duplicados accidentales — detectar y fusionar "la misma cosa" dos veces

Dos entidades que el usuario considera la misma, conviviendo. Llega por dos
caminos distintos que acaban en el mismo sitio:

- **En local**: te olvidas de que "Meditar" ya existe y la creas otra vez.
- **Por sincronización**: dos dispositivos la crean por separado estando offline.

No se rompe nada — la identidad es el `id`, nunca el nombre (ver la entrada
anterior), así que ambas son entidades perfectamente válidas. El daño es humano:
dos filas idénticas en "Hoy", y un historial **partido entre dos entidades**, de
forma que ninguna refleja la racha real.

Ojo a la tensión que hay que respetar: **los duplicados deben seguir permitidos.**
"Duplicar una actividad" es la respuesta *prescrita* para reconvertir, así que
una regla de unicidad por nombre rompería una función que queremos a propósito.
El objetivo es "que un duplicado accidental sea fácil de detectar y deshacer",
nunca "que sea imposible".

- **Cómo cambiaría el modelo actual:** nada estructural para la mitad de
  *detección* — el flujo de creación puede comparar títulos normalizados (sin
  espacios sobrantes, ignorando mayúsculas y acentos) y **avisar**, nunca
  bloquear. La mitad de *fusión* es donde está el trabajo: las occurrences se
  clavan por `(activityId, date)`, así que fusionar significa re-clavar las de
  una entidad sobre la otra, y decidir qué pasa cuando **ambas tienen occurrence
  el mismo día**. Esa resolución es **por `activityType`** — sumar las
  repeticiones de dos counters es lo correcto, "ambas hechas" en un checklist es
  trivial, y los intervalos de dos timers se concatenan —, así que pertenece a la
  mitad de dominio del registry de activityType (§7), como una operación
  "combina el progreso de dos días" junto a `measure`.
- **Qué ayuda ya:** la identidad es el `id`, así que un duplicado es una entidad
  válida y no datos corruptos — no hay nada que reparar, solo que consolidar. Las
  occurrences clavadas por `(activityId, date)` mantienen el historial de cada
  entidad limpiamente separable, lo que convierte la fusión en un **re-clavado**
  y no en un desenredo. El registry ya es el sitio donde vive el comportamiento
  por tipo, así que la resolución del mismo día tiene un hogar obvio. Y los
  nombres no se versionan, así que renombrar tras fusionar no cuesta nada.

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
