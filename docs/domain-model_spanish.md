# 📘 Modelo de dominio — gestión de tareas (offline-first)

> English version: [domain-model.md](./domain-model.md)

Este documento define el modelo de dominio para la reescritura del sistema de
tareas. Parte de una propuesta inicial (Goal / Task / TaskSchedule /
RecurrenceRule / TaskOccurrence / TaskException) y la ajusta con lo que hemos
aprendido de la app actual: cuotas semanales flexibles, temporizadores en
vivo, pausado vs. archivado, día con hora de corte configurable, y tareas
puntuales sin Goal.

Principio rector, heredado de la propuesta original y que se mantiene intacto:

> **El calendario no es la fuente de verdad. Es una proyección** que se
> reconstruye a partir de datos estables (Goal, Activity, ActivitySchedule)
> más un registro disperso de desviaciones (ActivityOccurrence,
> ActivityException).

---

## 0. Idea nueva que atraviesa todo el modelo: dos líneas de tiempo independientes

La propuesta original versionaba el "comportamiento temporal" (lo que aquí
llamamos `ActivitySchedule`) pero dejaba ambiguo qué pasa cuando algo se
**pausa** o se **archiva**: ¿es eso un `ActivitySchedule` que termina sin que
empiece otro? Eso obliga a adivinar, al mirar el histórico, si un hueco entre
versiones significa "el usuario lo pausó" o "no había planificación
todavía".

Para evitarlo, separamos dos líneas de tiempo **versionadas de forma
independiente**, cada una respondiendo a una pregunta distinta:

| Línea de tiempo | Pregunta que responde | Cambia cuando... |
|---|---|---|
| **StatusPeriod** | ¿Esto estaba activo, pausado o archivado ese día? | el usuario pausa/reanuda/archiva |
| **ActivitySchedule** | ¿Cómo se comporta (recurrencia) ese día? | el usuario cambia la frecuencia/reglas |

Esta misma línea de tiempo de estado (`StatusPeriod`) se reutiliza tanto en
**Goal** como en **Activity**, lo que además elimina la duplicación que
existe hoy entre `ActivitySlice` y `GoalsSlice` (dos copias casi idénticas
del mismo mecanismo de versionado, con un TODO en el propio código pidiendo
generalizarlo).

```
StatusPeriod {
  ownerId: id (Goal o Activity)
  status: 'active' | 'paused' | 'archived'
  from: Date
  to: Date | null   // null = vigente
}
```

Regla de composición: una Activity solo está efectivamente activa en una
fecha si **ella y su Goal** están en estado `active` en esa fecha (igual que
hoy). Se resuelve con una función pura `isEffectivelyActive(activity, goal,
date)`, sin necesidad de duplicar el flag en dos sitios.

Los campos puramente cosméticos (`title`, `description`, `color`, `icon`,
`priority`, `tags`, `estimatedDuration`...) **no se versionan**. Si el
usuario lo renombra, el histórico simplemente muestra el nombre actual. Es
una simplificación deliberada: nadie necesita que las estadísticas de hace 3
meses muestren un nombre antiguo, y evitamos versionar datos que no afectan a
si un día cuenta o no para una racha/estadística.

---

## 1. Goal

Puramente organizativo en cuanto a contenido, pero **sí tiene ciclo de
vida** (a diferencia de la propuesta original) porque pausar/archivar un Goal
debe poder desactivar en cascada todas sus Activities, y esa cascada necesita
ser consistente con el histórico.

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

Entidad estable en el tiempo. Igual que la "Task" de la propuesta original:
describe **qué** quiere hacer el usuario, nunca **cuándo**. Es la pieza que
vive dentro de los Goals y que puede repetirse en el tiempo — a diferencia de
la entidad independiente `Task` del §6, que siempre es puntual.

```
Activity {
  id
  goalId: id | null        // null = una actividad recurrente/con seguimiento no agrupada bajo ningún Goal
  title, description, priority, color, icon, estimatedDuration, tags

  activityType: string      // p.ej. 'checklist' | 'counter' | 'timer'
  statusPeriods: StatusPeriod[]   // active | paused | archived
}
```

Cambios respecto a la propuesta original:

- **`goalId` es opcional** — pero esto ya no tiene que ver con las tareas
  puntuales (esas son la entidad aparte `Task`, ver §6). Es para una Activity
  recurrente o con seguimiento que el usuario no quiere agrupar bajo ningún
  Goal (p.ej. un hábito suelto como "beber agua"). Al ser solo una clave
  foránea nullable y no maquinaria extra, no cuesta nada dejarlo abierto; si
  ese caso nunca llega a usarse en la práctica, `goalId` puede volver a ser
  obligatorio sin problema.
- **`activityType`** es la pieza que permite crecer sin tocar el resto del
  modelo (ver §7, "Cómo añadir un nuevo tipo de actividad"). Determina qué
  forma tiene el progreso dentro de cada `ActivityOccurrence` y qué UI se usa
  para registrarlo.

---

## 3. ActivitySchedule (comportamiento temporal versionado)

Igual espíritu que la propuesta original: nunca se edita, se cierra y se crea
una nueva versión.

```
ActivitySchedule {
  id
  activityId
  recurrenceRule: RecurrenceRule
  startDate
  endDate: Date | null   // null = vigente
}
```

Toda `Activity` — por definición recurrente o con seguimiento hacia un Goal —
tiene siempre al menos un `ActivitySchedule`. Las tareas puntuales ya no se
modelan como `Activity` en absoluto; ver §6 (`Task`).

---

## 4. RecurrenceRule (value object)

Sin identidad propia, igual que en la propuesta original. Se añade el tipo
**`quota`**, que no existía y que cubre un patrón real y frecuente en la app
actual: "N días / N veces / N segundos a la semana, tú eliges cuándo".

```
RecurrenceRule =
  | { kind: 'daily' }
  | { kind: 'weekly', daysOfWeek: [1..7] }
  | { kind: 'monthly', ... }
  | { kind: 'quota', period: 'week', target: { metric: 'days'|'reps'|'seconds', amount: N } }
  | { kind: 'custom', ... }
```

### Por qué `quota` necesita un paso extra en la proyección

Una regla `weekly` o `daily` genera ocurrencias de forma determinista: "hoy
toca". Una regla `quota` **no puede decidir por sí sola qué día toca**: es el
usuario quien, cada día, decide si ese día cuenta para el objetivo semanal
(hoy esto se materializa en la pantalla "seleccionar semanales"). Por eso el
algoritmo de proyección (§8) trata `quota` como un caso especial: en vez de
generar una ocurrencia "debida" automáticamente, la Activity aparece como
**candidata del día**, y solo se convierte en `ActivityOccurrence` real
cuando el usuario la selecciona (origen `quotaOptIn`, ver §5).

---

## 5. ActivityOccurrence (estado persistido de una ocurrencia)

Igual principio que la propuesta original — **no tiene por qué existir**; si
no hay una persistida para una fecha, el sistema la reconstruye como
`pending` — pero con el progreso hecho extensible en vez de fijo.

```
ActivityOccurrence {
  activityId
  scheduleId: id | null    // null solo para una ocurrencia de excepción manual sin planificación asociada
  date
  status: 'pending' | 'done' | 'skipped'
  completedAt
  notes
  origin: 'recurrence' | 'quotaOptIn' | 'manual' | 'exception'
  progress: <depende de activity.activityType>
}
```

`progress` es polimórfico y lo define el `activityType` de la Activity (ver
§7), no el modelo genérico. Ejemplos con los tipos actuales de la app:

- `activityType: 'checklist'` (hoy "doOneTime") → `progress: {}` (nada más
  que hacer, el `status` ya lo dice todo).
- `activityType: 'counter'` (hoy "doNTimes") → `progress: { repetitions: [timestamp, ...] }`.
  Se guarda cada repetición con su hora porque las estadísticas actuales la
  usan (rachas, conteos por rango de fechas).
- `activityType: 'timer'` (hoy "doNSeconds") → `progress: { intervals: [{start, end|null}] }`.
  `end: null` en el último intervalo significa "corriendo ahora mismo".

Esto es exactamente lo que hoy falta en la propuesta original: un
`estado: pending/done/skipped` + `duración real` no puede representar un
cronómetro en marcha ni repeticiones individuales con marca de tiempo.

---

## 6. Task (tareas puntuales independientes)

Una tarea puntual nunca necesita más que "hecha o no hecha" — sin Goal, sin
recurrencia, sin progreso de contador/cronómetro. Hacerla pasar por
`Activity` + `ActivitySchedule` + `StatusPeriod` + `ActivityOccurrence`
significaría que un recordatorio trivial como "comprar pilas" arrastra
maquinaria pensada únicamente para dar soporte a comportamiento recurrente y
con seguimiento de Goal que nunca va a usar.

Por eso las tareas puntuales tienen su propia entidad, deliberadamente
mínima, que vive **fuera** del pipeline Activity/ActivitySchedule/
ActivityOccurrence por completo:

```
Task {
  id
  title
  date
  completed: boolean
  completedAt
}
```

Esto reproduce casi exactamente el `TasksSlice` actual (nombre + completado,
acotado a un día concreto). No tiene `activityType`, ni `StatusPeriod`, ni
`RecurrenceRule`, y nunca pasa por el algoritmo de proyección (§8): se
consulta directamente por fecha.

El compromiso que esto deja explícito: la pantalla de "hoy" sigue teniendo
que combinar dos fuentes distintas (ocurrencias proyectadas de `Activity` +
`Task`s del día) en la capa de UI/consulta — igual que hoy hace
`DayContentList`. Unificar el modelo de almacenamiento no habría eliminado
esa combinación de todas formas, porque los dos tipos de ítem se renderizan
de forma distinta (un hábito con barra de progreso frente a un simple
checkbox); solo habría escondido complejidad real detrás de una abstracción
compartida que una tarea puntual nunca necesita.

---

## 7. Cómo añadir un nuevo tipo de actividad (extensibilidad)

Este es el requisito de "que pueda crecer de forma consistente". La regla es:
**un `activityType` nuevo se añade a un registro (plugin), nunca modificando
el modelo genérico.**

Cada entrada del registro define:

```
ActivityTypeDefinition {
  key: string                              // 'counter', 'timer', 'checklist', ...
  emptyProgress(): progress
  computeCompletionRatio(progress, scheduleTarget): number   // 0..1
  isCompleted(progress, scheduleTarget): boolean
  applyUserAction(progress, action): progress   // p.ej. "add rep", "start timer", "stop timer"
  renderTodayItem(occurrence, schedule): Component
  renderFrequencyLabel(schedule, t): string
}
```

Esto es, de hecho, una generalización más limpia de lo que ya existe hoy en
`src/activityHandler/activityTypes` + `dailyGoals` (dos registros anidados,
uno para "tipo de actividad" y otro para "tipo de objetivo diario"). En el
nuevo modelo hay un único punto de extensión (`activityType`) en vez de dos
niveles cruzados, lo que simplifica añadir combinaciones nuevas.

Para añadir, por ejemplo, un futuro tipo "checklist con subtareas": se crea
`activityTypes/checklistWithSubtasks.js` implementando esa interfaz, se
registra en el índice, y no se toca `Activity`, `ActivitySchedule`,
`ActivityOccurrence` ni el algoritmo de proyección.

`Task` (§6) queda deliberadamente fuera de este registro: por definición
siempre es un simple ítem de checklist, así que no necesita `activityType`.

---

## 8. Algoritmo de proyección (calendario = vista derivada)

Para construir el día `D`:

1. Obtener las Activities cuyo `StatusPeriod` en `D` sea `active` (con
   cascada de su Goal, si tiene).
2. Para cada una, buscar el `ActivitySchedule` vigente en `D`.
3. Según `recurrenceRule.kind`:
   - `daily` / `weekly` / `monthly` / `custom` → generar la ocurrencia
     esperada de `D` directamente.
   - `quota` → **no** generar automáticamente una ocurrencia "debida"; en su
     lugar, marcar la Activity como candidata del día (equivalente a la
     pantalla de selección semanal actual) hasta que el usuario la elija,
     momento en el que se crea la `ActivityOccurrence` con
     `origin: 'quotaOptIn'`.
4. Aplicar `ActivityException` vigentes en `D` (tienen prioridad sobre lo
   anterior: cancelar, mover, sobrescribir ese día).
5. Sustituir cualquier ocurrencia generada por la `ActivityOccurrence`
   persistida si existe para esa Activity+fecha.

Las `Task` no forman parte de este algoritmo en absoluto: se consultan
directamente por fecha y se combinan con el resultado en la capa de
UI/consulta (ver §6).

---

## 9. Excepciones (ActivityException)

Igual que en la propuesta original: modifican un día concreto sin tocar la
recurrencia general, y tienen prioridad sobre cualquier regla.

```
ActivityException {
  activityId
  date
  type: 'skip' | 'reschedule' | 'override'
  newDate?          // solo si type = 'reschedule'
  overrides?         // solo si type = 'override'
}
```

---

## 10. Día con hora de corte configurable

La app permite que "el día" empiece a una hora distinta de medianoche
(`dayStartHour`). Esto es transversal a todo el modelo, así que se resuelve
en un único punto:

- Una función pura `getCalendarDay(instant, dayStartHour)` es la **única**
  forma de convertir un instante en "la fecha lógica" del sistema. Ningún
  otro código calcula fechas por su cuenta.
- Cambiar `dayStartHour` es una operación de migración explícita y aislada:
  re-etiqueta las `ActivityOccurrence` recientes y los timers abiertos a su
  nuevo día lógico. Al vivir todo en un único almacén de
  `ActivityOccurrence` (en vez de duplicado por slice como hoy en
  `ActivitySlice`/`LogSlice`), esta migración se implementa **una sola
  vez**, no una por cada tipo de entidad.

---

## 11. Estado en vivo (temporizadores) — no reconstruible

El principio "todo se reconstruye" es correcto para el histórico, pero
"¿hay un cronómetro corriendo ahora mismo?" es una pregunta operativa que no
debe depender de reconstruir/escanear ocurrencias. Se mantiene un registro
pequeño y explícito, fuera del modelo histórico:

```
RunningTimer {
  activityId
  occurrenceDate
  startedAt
}
```

Se modela **como colección desde el principio** (una tabla/lista, aunque hoy
tenga como mucho un elemento), no como un único valor nullable. La regla de
negocio actual — solo puede haber un cronómetro corriendo a la vez — se
aplica al escribir, no en la forma del dato:

```js
function startTimer(activityId) {
  if (ENFORCE_SINGLE_TIMER) {
    runningTimers.forEach(t => stopTimer(t.activityId))
  }
  runningTimers.add({ activityId, occurrenceDate, startedAt: now() })
}
```

Esto deja la puerta abierta a permitir varios cronómetros en paralelo más
adelante sin rediseñar nada: basta con quitar el bloque `if
(ENFORCE_SINGLE_TIMER)`. El resto del modelo (`RunningTimer` como tabla, cómo
se lee "qué está corriendo", cómo se vuelca un intervalo cerrado a
`progress.intervals`) no cambia, porque cada Activity ya guarda sus propios
`intervals` de forma independiente — dos cronómetros a la vez nunca han sido
un conflicto de datos, solo una decisión de producto. Lo único que sí habría
que ampliar en ese momento es la capa de UI/notificaciones (el badge de
"algo está corriendo" y los avisos de "llevas X minutos"), que hoy asumen un
único cronómetro activo.

Al detener un timer, el intervalo `{start: startedAt, end: now}` se anexa al
`progress.intervals` de la `ActivityOccurrence` correspondiente y su entrada
en `runningTimers` se borra.

---

## 12. Estadísticas: proyección pura + resumen materializado

Reconstruir todo el histórico bajo demanda es razonable para ver un día o una
semana, pero puede ser costoso para estadísticas de "toda la vida" (rachas,
heatmap de meses/años) si hay que recorrer día a día desde la instalación.

Recomendación: mantener la reconstrucción pura como fuente de verdad (sin
efectos secundarios, siempre correcta), pero añadir una tabla de resumen
derivada y cacheada:

```
DailyStatsSummary {
  activityId, date
  completionRatio, timeSpentSeconds, repetitions
}
```

Se actualiza de forma incremental cada vez que se crea/edita una
`ActivityOccurrence` de ese día (no hay que recalcular el histórico
completo), y puede regenerarse por completo en cualquier momento a partir de
las fuentes de verdad si hiciera falta — sigue siendo una caché, no una
fuente de verdad nueva.

---

## 🧠 Resumen mental del sistema

- **Goal** → por qué existe algo (y si ese "por qué" sigue activo)
- **Activity** → algo recurrente o con seguimiento hacia un Goal que hace el usuario (identidad estable; puede tener Goal o no, pero siempre tiene una planificación)
- **StatusPeriod** → si esa Activity/Goal estaba activa, pausada o archivada ese día
- **ActivitySchedule** → cómo se comporta en el tiempo (recurrencia versionada)
- **RecurrenceRule** → cómo se repite, incluida la variante `quota` (cuotas flexibles)
- **ActivityOccurrence** → qué ocurrió realmente ese día, con progreso específico de su `activityType`
- **ActivityException** → modifica un día concreto sin alterar la planificación general
- **Task** → una tarea puntual independiente, siempre un simple checklist, totalmente fuera del pipeline de Activity
- **RunningTimer** → estado operativo en vivo, no histórico, no reconstruible
- **DailyStatsSummary** → caché de estadísticas, nunca fuente de verdad

## Diferencias clave respecto a la propuesta original

1. `StatusPeriod` separado de `ActivitySchedule`: pausar/archivar ya no se confunde con "cambiar de recurrencia".
2. `Goal` recupera ciclo de vida propio (`StatusPeriod`), con cascada hacia sus Activities.
3. `RecurrenceRule` gana el tipo `quota` para cuotas semanales flexibles, con un paso de "opt-in diario" explícito en la proyección.
4. `ActivityOccurrence.progress` es polimórfico según `activityType`, en vez de un campo fijo — soporta contadores con timestamp y temporizadores con intervalos.
5. Las tareas puntuales independientes se extraen a una entidad aparte, deliberadamente mínima, `Task` (id, title, date, completed), que vive por completo fuera del pipeline Activity/ActivitySchedule/StatusPeriod — evita forzar un recordatorio como "comprar pilas" a pasar por maquinaria pensada para comportamiento recurrente y con seguimiento de Goal. `Activity.goalId` sigue siendo opcional, pero ahora solo para Activities recurrentes/con seguimiento sin Goal, no para tareas puntuales.
6. Se añade `RunningTimer` como estado operativo no reconstruible, modelado como colección con el límite de "uno a la vez" aplicado como regla de negocio (no como forma del dato), para poder relajarlo sin rediseño. Notas también sobre `dayStartHour` como único punto de resolución de fechas.
7. Se añade `DailyStatsSummary` como caché explícita para no depender de reconstruir años de histórico en cada consulta de estadísticas.
8. La nomenclatura vuelve a la de la app actual: la entidad recurrente/con seguimiento de Goal se llama `Activity` (como en `ActivitySlice`/`activityHandler` hoy) y la entidad puntual independiente se llama `Task` (como en `TasksSlice` hoy) — ahora divididas en dos entidades limpias en vez de un único concepto sobrecargado. `activityType` sustituye al doble registro actual (`activityTypes` + `dailyGoals`) por un único punto de extensión; `Task` queda deliberadamente fuera de ese registro también.
