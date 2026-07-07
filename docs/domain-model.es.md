# 📘 Modelo de dominio — gestión de tareas (offline-first)

> English version: [domain-model.md](./domain-model.md)

Este documento define el modelo de dominio del sistema de tareas. Es la fuente
de verdad sobre cómo está estructurado el modelo y cómo se comporta: cuotas
semanales flexibles, temporizadores en vivo, pausado vs. archivado, día con
hora de corte configurable, y tareas puntuales independientes.

Principio rector:

> **El calendario no es la fuente de verdad. Es una proyección** que se
> reconstruye a partir de datos estables (Goal, Activity, ActivitySchedule)
> más un registro disperso de desviaciones (ActivityOccurrence).

---

## 0. Dos líneas de tiempo independientes

Se versionan **de forma independiente** dos líneas de tiempo, cada una
respondiendo a una pregunta distinta. Mantenerlas separadas evita una
ambigüedad: si el "comportamiento temporal" y el "pausado/archivado"
compartieran una única línea, un hueco en el histórico sería imposible de
interpretar — ¿el usuario lo pausó, o simplemente no había planificación
todavía?

| Línea de tiempo | Pregunta que responde | Cambia cuando... |
|---|---|---|
| **StatusPeriod** | ¿Esto estaba activo, pausado o archivado ese día? | el usuario pausa/reanuda/archiva |
| **ActivitySchedule** | ¿Cómo se comporta (recurrencia) ese día? | el usuario cambia la frecuencia/reglas |

La misma forma `StatusPeriod` se usa tanto en **Goal** como en **Activity**, de
modo que el mecanismo de versionado se define una sola vez. Es un value object
**propiedad de su agregado**: un Goal posee su línea de estado, una Activity
posee la suya (§1, §2), así que en el dominio no necesita ninguna referencia a
su dueño.

```
StatusPeriod {
  status: 'active' | 'paused' | 'archived'
  from: Date   // toma efecto aquí y se mantiene hasta la siguiente entrada (o para siempre si es la última)
}
```

No hay **fin explícito**: una entrada se mantiene hasta que empieza la siguiente.
Las timelines son contiguas (la entidad siempre tiene algún estado una vez existe
— `archived` es un estado, no un hueco), así que un `to` solo duplicaría el
`from` de la siguiente entrada y añadiría un invariante que mantener. El fin se
deriva, y los solapes y huecos quedan irrepresentables.

Este documento describe la forma del **dominio**. La persistencia está
desacoplada (`expo-sqlite` detrás de un repositorio, para que la UI y el dominio
nunca dependan de la fuente de datos — ver [architecture.es.md](./architecture.es.md)):
en almacenamiento los periodos viven en una tabla normalizada con una referencia
a su dueño, y el mapper los reconstruye dentro del agregado. Por eso el dominio
muestra `statusPeriods` como lista en la entidad mientras la base de datos lo
guarda como tabla propia — mismos datos, dos capas.

Regla de composición: una Activity solo está efectivamente activa en una fecha
si **ella y su Goal** están en estado `active` en esa fecha. Se resuelve con
una función pura `isEffectivelyActive(activity, goal, date)`, sin necesidad de
duplicar el flag en dos sitios.

Los campos puramente cosméticos (`title`, `description`, `color`, `icon`,
`priority`, `tags`, `estimatedDuration`...) **no se versionan**. Si el usuario
lo renombra, el histórico simplemente muestra el nombre actual. Es una
simplificación deliberada: nadie necesita que las estadísticas de hace 3 meses
muestren un nombre antiguo, y evitamos versionar datos que no afectan a si un
día cuenta o no para una racha/estadística.

---

## 1. Goal

Puramente organizativo en cuanto a contenido, pero **sí tiene ciclo de vida**,
porque pausar/archivar un Goal debe desactivar en cascada todas sus Activities,
y esa cascada necesita ser consistente con el histórico.

```
Goal {
  id
  title
  motivation / description
  color, icon
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

- Un Goal agrupa Activities relacionadas.
- No define comportamiento temporal propio: eso vive siempre en las Activities.

---

## 2. Activity (intención)

Entidad estable en el tiempo. Describe **qué** quiere hacer el usuario, nunca
**cuándo**. Es la pieza que vive dentro de los Goals y que puede repetirse en
el tiempo — a diferencia de la entidad independiente `Task` del §6, que siempre
es puntual.

```
Activity {
  id
  goalId: id                // el Goal al que pertenece la Activity (obligatorio)
  title, description, priority, color, icon, estimatedDuration, tags

  activityType: string      // clave de registro ('checklist' | 'counter' | 'timer' | ...); validada contra el registro, no texto libre
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

- **`goalId`** es obligatorio: toda Activity pertenece a exactamente un Goal.
  No existen Activities sin Goal — una tarea puntual que no pertenece a ningún
  Goal es la entidad aparte `Task` (ver §6), no una Activity.
- **`activityType`** es la pieza que permite crecer sin tocar el resto del
  modelo (ver §7, "Cómo añadir un nuevo tipo de actividad"). Determina qué
  forma tiene el progreso dentro de cada `ActivityOccurrence` y qué UI se usa
  para registrarlo. Es una **clave de registro**, no texto libre: debe resolver
  a una `ActivityTypeDefinition` del registro (§7), se valida al escribir, y es
  estable (renombrar una clave es una migración, a diferencia de los campos
  cosméticos). En TypeScript debería tiparse como el conjunto de claves
  registradas (p.ej. `keyof typeof registry`) en vez de un `string` pelado, de
  forma que el conjunto siga abierto vía el registro pero con autocompletado.

---

## 3. ActivitySchedule (comportamiento temporal versionado)

Un `ActivitySchedule` nunca se edita: se añade una versión nueva que sustituye a la anterior desde su `startDate` (una timeline de puntos de cambio, como `StatusPeriod` en §0).
Responde dos cosas que siempre van juntas — *cuándo* toca la Activity y *cuánto*
cuenta como hecho — sin depender de *cómo* es "hacerlo" (eso es el
`activityType`, §2/§7).

```
ActivitySchedule {
  id
  activityId
  recurrenceRule: RecurrenceRule   // CUÁNDO toca — puramente temporal (§4)
  dayGoal:    number | null        // por día debido/elegido: cantidad (en la métrica del activityType) que hace que ese día cuente como hecho; null = binario "lo hice"
  periodGoal: PeriodGoal | null    // solo para recurrencias `quota`; null para las fijas
  startDate                        // aplica desde aquí hasta el startDate del siguiente schedule (o la actual si es la última)
}

PeriodGoal =
  | { aggregate: 'completedDays', amount: N }   // N días del periodo deben completarse
  | { aggregate: 'metricSum',     amount: N }   // la métrica del activityType sumada en el periodo debe llegar a N
```

Invariantes:

- `dayGoal` se expresa en la métrica del activityType (reps, segundos…) y solo
  aplica a tipos medibles; para `checklist` es siempre `null` (el día es
  binario: hecho o no). Un "día completado" significa `dayGoal` alcanzado, o —
  cuando `dayGoal` es `null` — simplemente marcado como hecho.
- `periodGoal` está presente **si y solo si** `recurrenceRule.kind === 'quota'`,
  y es `null` para toda recurrencia fija.

Toda `Activity` tiene siempre al menos un `ActivitySchedule`. Las tareas
puntuales no se modelan como `Activity` en absoluto; ver §6 (`Task`).

### Dos ejes ortogonales (esto es lo que mantiene simple añadir tipos de tarea)

Un tipo de tarea es el **producto de dos ejes independientes más los targets que
los conectan** — nunca un enum fijo de "tipos de tarea":

- **Eje A — recurrencia (`RecurrenceRule`, §4):** *cuándo* toca. Añadir una
  cadencia nueva (mensual, anual, …) es solo un `kind` nuevo; nada más cambia.
- **Eje B — activityType (`activityType`, §2/§7):** *qué es un día de hacerlo* y
  *qué métrica produce* (checklist → hecho/no, counter → reps, timer →
  segundos). Añadir una forma nueva de medir un día es solo una entrada nueva en
  el registro.
- **Targets (`dayGoal` / `periodGoal`):** siempre expresados en la métrica del
  Eje B, así que **cualquier recurrencia compone con cualquier activityType**.
  Las combinaciones no se enumeran a mano.

Todo tipo de tarea actual sale de este producto:

| Comportamiento | recurrenceRule | activityType | dayGoal | periodGoal |
|---|---|---|---|---|
| Check diario simple | `daily` | checklist | — | — |
| Días fijos de la semana | `weekly {1,3,5}` | checklist | — | — |
| N veces al día | `daily` | counter | N | — |
| N segundos al día | `daily` | timer | N | — |
| N días cada semana | `quota week` | checklist | — | `completedDays: N` |
| N veces cada semana | `quota week` | counter | — | `metricSum: N` |
| N segundos cada semana | `quota week` | timer | — | `metricSum: N` |

La misma rejilla ya expresa tipos más allá del conjunto actual — cada uno es
solo otro punto en ella:

| Comportamiento | recurrenceRule | activityType | dayGoal | periodGoal |
|---|---|---|---|---|
| 20 min, 3 días por semana | `quota week` | timer | 1200 | `completedDays: 3` |
| Revisión mensual | `monthly {1}` | checklist | — | — |
| Leer 12 libros al año | `quota year` | counter | — | `metricSum: 12` |

---

## 4. RecurrenceRule (value object)

Un value object sin identidad propia. Responde **solo** *qué días entran en
juego* — nunca "cuánto" (eso es `dayGoal`/`periodGoal`, §3). Mantenerlo
puramente temporal es lo que permite añadir una cadencia nueva como un `kind`
más, sin tocar targets, progreso ni la lógica por-día de la proyección.

```
RecurrenceRule =
  | { kind: 'daily' }
  | { kind: 'weekly',  daysOfWeek:  number[] }   // 1..7 (días fijos)
  | { kind: 'monthly', daysOfMonth: number[] }   // 1..31 (días fijos)
  | { kind: 'yearly',  datesOfYear: { month, day }[] }
  | { kind: 'quota',   period: 'week' | 'month' | 'year' }
```

- **Los `kind` fijos** (`daily` / `weekly` / `monthly` / `yearly`) nombran los
  días exactos que tocan; la proyección (§8) los genera de forma determinista.
- **`quota`** nombra solo un periodo, no los días. El usuario hace opt-in día a
  día, y el "cuánto" del periodo vive en `ActivitySchedule.periodGoal` (§3),
  expresado en la métrica del activityType.

Las cadencias nuevas se añaden como `kind`s nuevos (así entran
`monthly`/`yearly`); deliberadamente no hay un cajón de sastre `custom`, que
difuminaría este eje y reintroduciría la ambigüedad que la separación
fijo/quota existe para evitar.

### Por qué `quota` necesita un paso extra en la proyección

Una regla fija genera ocurrencias de forma determinista: "hoy toca". Una regla
`quota` **no puede decidir por sí sola qué día toca**: es el usuario quien, cada
día, decide si ese día cuenta para el objetivo del periodo. Por eso el algoritmo
de proyección (§8) trata `quota` como un caso especial: en vez de generar una
ocurrencia "debida" automáticamente, la Activity aparece como **candidata del
día**, y solo se convierte en `ActivityOccurrence` real cuando el usuario la
selecciona (origen `quotaOptIn`, ver §5).

---

## 5. ActivityOccurrence (estado persistido de una ocurrencia)

Una `ActivityOccurrence` **no tiene por qué existir**; si no hay una persistida
para una fecha, el sistema la reconstruye — como `pending` cuando el día es hoy
o futuro, o como `missed` cuando es un día pasado que tocaba. El progreso es
extensible, no un campo fijo.

Se identifica por `(activityId, date)` — el día lógico (§10) — con **como mucho
una ocurrencia por actividad y día**. Editar un día (marcarlo hecho, añadir reps
o tiempo) actualiza ese único registro; el modelo nunca guarda dos estados para
el mismo día.

```
ActivityOccurrence {         // identidad: (activityId, date) — como mucho una por actividad y día lógico
  activityId
  scheduleId: id | null    // null solo para una ocurrencia manual sin planificación asociada
  date                     // el día lógico (§10): una fecha, no un timestamp
  status: 'pending' | 'done'   // los únicos desenlaces persistidos; `missed` es derivado (un día pasado que tocaba y nunca llegó a `done`) y nunca se almacena
  completedAt
  notes
  origin: 'recurrence' | 'quotaOptIn' | 'manual'
  progress: <depende de activity.activityType>
}
```

`progress` es polimórfico y lo define el `activityType` de la Activity (ver
§7), no el modelo genérico:

- `activityType: 'checklist'` → `progress: {}` (nada más que hacer, el `status`
  ya lo dice todo).
- `activityType: 'counter'` → `progress: { repetitions: [timestamp, ...] }`.
  Se guarda cada repetición con su hora porque las estadísticas la usan
  (rachas, conteos por rango de fechas).
- `activityType: 'timer'` → `progress: { intervals: [{start, end|null}] }`.
  `end: null` en el último intervalo significa "corriendo ahora mismo".

Un par plano `status` + `duración real` no podría representar un cronómetro en
marcha ni repeticiones individuales con marca de tiempo; por eso el progreso es
polimórfico.

---

## 6. Task (tareas puntuales independientes)

Una tarea puntual nunca necesita más que "hecha o no hecha" — sin Goal, sin
recurrencia, sin progreso de contador/cronómetro. Hacerla pasar por
`Activity` + `ActivitySchedule` + `StatusPeriod` + `ActivityOccurrence`
significaría que un recordatorio trivial como "comprar pilas" arrastra
maquinaria pensada únicamente para dar soporte a comportamiento recurrente y
con seguimiento de Goal que nunca va a usar.

Por eso las tareas puntuales tienen su propia entidad, deliberadamente mínima,
que vive **fuera** del pipeline Activity/ActivitySchedule/ActivityOccurrence
por completo:

```
Task {
  id
  title
  date
  completed: boolean
  completedAt
}
```

Una `Task` está acotada a un único día (nombre + completado). No tiene
`activityType`, ni `StatusPeriod`, ni `RecurrenceRule`, y nunca pasa por el
algoritmo de proyección (§8): se consulta directamente por fecha.

El compromiso que esto deja explícito: la pantalla de "hoy" tiene que combinar
dos fuentes distintas (ocurrencias proyectadas de `Activity` + `Task`s del día)
en la capa de UI/consulta. Unificar el modelo de almacenamiento no eliminaría
esa combinación de todas formas, porque los dos tipos de ítem se renderizan de
forma distinta (un hábito con barra de progreso frente a un simple checkbox);
solo escondería complejidad real detrás de una abstracción compartida que una
tarea puntual nunca necesita.

---

## 7. Cómo añadir un nuevo tipo de actividad (extensibilidad)

El modelo debe poder crecer de forma consistente. La regla es: **un
`activityType` nuevo se añade a un registro (plugin), nunca modificando el
modelo genérico.**

Cada entrada del registro define:

```
ActivityTypeDefinition {
  key: string                          // 'counter', 'timer', 'checklist', ...
  metric: 'none' | 'count' | 'duration'   // qué mide el progreso de un día — da la unidad a dayGoal/periodGoal
  emptyProgress(): progress
  measure(progress): number            // escalar para sumas y ratios (checklist → 0|1, counter → reps, timer → segundos)
  isCompleted(progress, dayGoal): boolean
  computeCompletionRatio(progress, dayGoal): number   // 0..1
  applyUserAction(progress, action): progress   // p.ej. "add rep", "start timer", "stop timer"
  renderTodayItem(occurrence, schedule): Component
  renderFrequencyLabel(schedule, t): string
}
```

`activityType` es el único punto de extensión para la forma del progreso y la
UI. El par `metric` + `measure` es lo que permite que `periodGoal.aggregate:
'metricSum'` y `dayGoal` (§3) funcionen para **cualquier** tipo sin que el
modelo genérico conozca el tipo — que es justo por qué la métrica se deriva del
`activityType` y nunca se duplica en la recurrencia.

Para añadir, por ejemplo, un tipo "checklist con subtareas": se crea
`activityTypes/checklistWithSubtasks.js` implementando esa interfaz, se registra
en el índice, y no se toca `Activity`, `ActivitySchedule`, `ActivityOccurrence`
ni el algoritmo de proyección.

`Task` (§6) queda deliberadamente fuera de este registro: por definición
siempre es un simple ítem de checklist, así que no necesita `activityType`.

---

## 8. Algoritmo de proyección (calendario = vista derivada)

Para construir el día `D`:

1. Obtener las Activities cuyo `StatusPeriod` en `D` sea `active` (con cascada
   de su Goal).
2. Para cada una, buscar el `ActivitySchedule` vigente en `D`.
3. Según `recurrenceRule.kind`:
   - `daily` / `weekly` / `monthly` / `yearly` → generar la ocurrencia esperada
     de `D` directamente.
   - `quota` → **no** generar automáticamente una ocurrencia "debida"; en su
     lugar, marcar la Activity como candidata del día hasta que el usuario la
     elija, momento en el que se crea la `ActivityOccurrence` con
     `origin: 'quotaOptIn'`.
4. Sustituir cualquier ocurrencia generada por la `ActivityOccurrence`
   persistida si existe para esa Activity+fecha.
5. Resolver el estado a mostrar: un `done` persistido se ve como hecho; un día
   que tocaba sin ocurrencia `done` se ve como `pending` si `D` es hoy/futuro, o
   `missed` si `D` es pasado. `missed`/`pending` se derivan aquí, nunca se
   almacenan.

Las `Task` no forman parte de este algoritmo en absoluto: se consultan
directamente por fecha y se combinan con el resultado en la capa de
UI/consulta (ver §6).

---

## 9. Editar el pasado vs. cambiar el plan

Deliberadamente **no hay** mecanismo de "saltar", "mover" ni "excusar" un día,
ni una entidad de excepción aparte. Las desviaciones se expresan por exactamente
dos canales, separados por *lo que tocan*:

- **El resultado de un día se edita, incluso en el pasado.** Marcar un día como
  hecho (o registrar las reps/el tiempo que no pudiste anotar en el momento —
  p.ej. se te murió el móvil) solo escribe/actualiza la `ActivityOccurrence` de
  ese día. Es auto-registro basado en confianza.
- **El plan solo se edita hacia delante.** Cambiar si/cuándo toca una Activity
  (su `ActivitySchedule` o `StatusPeriod`) añade una versión nueva con fecha de
  hoy que sustituye a la anterior (§0, §3). Nunca reescribe el pasado, así que un día que tocaba
  y no se hizo se queda `missed`.

Esto cierra el agujero de responsabilidad — no puedes hacer desaparecer
retroactivamente un día que tocaba para que "no cuente" — sin impedir que
registres la verdad de lo que hiciste. Un día que tocaba y nunca llegó a `done`
es `missed`; no hay estado neutro ni oculto.

---

## 10. Día con hora de corte configurable

La app permite que "el día" empiece a una hora distinta de medianoche
(`dayStartHour`). Esto es transversal a todo el modelo, así que se resuelve en
un único punto:

- Una función pura `getCalendarDay(instant, dayStartHour)` es la **única**
  forma de convertir un instante en "la fecha lógica" del sistema. Ningún otro
  código calcula fechas por su cuenta.
- Cambiar `dayStartHour` es una operación de migración explícita y aislada:
  re-etiqueta las `ActivityOccurrence` recientes y los timers abiertos a su
  nuevo día lógico. Al vivir todo en un único almacén de `ActivityOccurrence`,
  esta migración se implementa **una sola vez**, no una por cada tipo de
  entidad.

---

## 11. Estado en vivo (temporizadores) — no reconstruible

El principio "todo se reconstruye" es correcto para el histórico, pero "¿hay un
cronómetro corriendo ahora mismo?" es una pregunta operativa que no debe
depender de reconstruir/escanear ocurrencias. Se mantiene un registro pequeño y
explícito, fuera del modelo histórico:

```
RunningTimer {
  activityId
  occurrenceDate
  startedAt
}
```

Se modela **como colección** (una tabla/lista), no como un único valor nullable,
con la regla de negocio — solo puede haber un cronómetro corriendo a la vez —
aplicada al escribir en vez de en la forma del dato:

```js
function startTimer(activityId) {
  if (ENFORCE_SINGLE_TIMER) {
    runningTimers.forEach(t => stopTimer(t.activityId))
  }
  runningTimers.add({ activityId, occurrenceDate, startedAt: now() })
}
```

Al detener un timer, el intervalo `{start: startedAt, end: now}` se anexa al
`progress.intervals` de la `ActivityOccurrence` correspondiente y su entrada en
`runningTimers` se borra.

---

## 12. Estadísticas: proyección pura + resumen materializado

Reconstruir todo el histórico bajo demanda es razonable para ver un día o una
semana, pero puede ser costoso para estadísticas de "toda la vida" (rachas,
heatmap de meses/años) si hay que recorrer día a día desde la instalación.

La reconstrucción pura sigue siendo la fuente de verdad (sin efectos
secundarios, siempre correcta), con una tabla de resumen derivada y cacheada
encima:

```
DailyStatsSummary {
  activityId, date
  completionRatio, timeSpentSeconds, repetitions
}
```

Se actualiza de forma incremental cada vez que se crea/edita una
`ActivityOccurrence` de ese día (no hay que recalcular el histórico completo), y
puede regenerarse por completo en cualquier momento a partir de las fuentes de
verdad — sigue siendo una caché, no una fuente de verdad nueva.

---

## 🧠 Resumen mental del sistema

- **Goal** → por qué existe algo (y si ese "por qué" sigue activo)
- **Activity** → algo recurrente o con seguimiento que hace el usuario (identidad estable; siempre pertenece a un Goal y siempre tiene una planificación)
- **StatusPeriod** → si esa Activity/Goal estaba activa, pausada o archivada ese día
- **ActivitySchedule** → cuándo toca **y** cuánto cuenta como hecho (recurrencia versionada + `dayGoal`/`periodGoal`)
- **RecurrenceRule** → puramente qué días entran en juego (`daily`/`weekly`/`monthly`/`yearly`/`quota`)
- **ActivityOccurrence** → qué ocurrió realmente ese día, con progreso específico de su `activityType`
- **Task** → una tarea puntual independiente, siempre un simple checklist, totalmente fuera del pipeline de Activity
- **RunningTimer** → estado operativo en vivo, no histórico, no reconstruible
- **DailyStatsSummary** → caché de estadísticas, nunca fuente de verdad
