/**
 * Textos del formulario "nueva actividad" (namespace `activityForm`).
 * El español es el idioma principal: se escribe aquí primero y luego se refleja
 * clave por clave en `en/activityForm.ts`.
 */
export default {
  screen: {
    title: 'Nueva actividad',
    cancel: 'Cancelar',
    submit: 'Crear actividad',
    submitting: 'Creando…',
    submitError: 'No se ha podido crear la actividad. Inténtalo otra vez.',
  },

  goal: {
    label: '¿Para qué?',
    help: 'Toda actividad pertenece a un objetivo. Empieza por el porqué.',
    modeExisting: 'Un objetivo que ya tengo',
    modeNew: 'Crear un objetivo nuevo',
    loading: 'Cargando objetivos…',
    none: 'Todavía no tienes ningún objetivo. Crea uno aquí mismo.',
    pausedHint: 'Este objetivo está en pausa: la actividad no aparecerá en Hoy hasta que lo reanudes.',
    newTitleLabel: '¿Cómo se llama el objetivo?',
    newTitlePlaceholder: 'Estar en forma',
    newMotivationLabel: '¿Por qué te importa? (opcional)',
    newMotivationPlaceholder: 'Para tener energía durante todo el día',
  },

  title: {
    label: '¿Qué vas a hacer?',
    placeholder: 'Correr',
  },

  description: {
    label: 'Notas (opcional)',
    placeholder: 'Detalles que te ayuden a recordar en qué consiste',
  },

  activityType: {
    label: '¿Cómo se mide?',
    help: 'Determina cómo registrarás cada día.',
    checklist: 'Hecho o no hecho',
    checklistHelp: 'Marcas la casilla y ya está.',
    counter: 'Contando repeticiones',
    counterHelp: 'Sumas veces a lo largo del día.',
    timer: 'Con un cronómetro',
    timerHelp: 'Mides el tiempo que le dedicas.',
  },

  recurrence: {
    label: '¿Cada cuánto?',
    daily: 'Todos los días',
    dailyHelp: 'Toca hacerlo cada día.',
    weekly: 'Días concretos de la semana',
    weeklyHelp: 'Tú eliges qué días de la semana toca.',
    quota: 'Un número de veces por periodo',
    quotaHelp: 'Tú decides cada día si lo haces; lo que cuenta es el total del periodo.',
    weekdaysLabel: '¿Qué días?',
    periodLabel: '¿En qué periodo?',
    periodWeek: 'Cada semana',
    periodMonth: 'Cada mes',
    periodYear: 'Cada año',
  },

  weekdays: {
    short: {
      '1': 'L',
      '2': 'M',
      '3': 'X',
      '4': 'J',
      '5': 'V',
      '6': 'S',
      '7': 'D',
    },
    accessible: {
      '1': 'lunes',
      '2': 'martes',
      '3': 'miércoles',
      '4': 'jueves',
      '5': 'viernes',
      '6': 'sábado',
      '7': 'domingo',
    },
  },

  duration: {
    hoursLabel: 'horas',
    minutesLabel: 'min',
    secondsLabel: 'seg',
    hoursShort_one: '{{count}} hora',
    hoursShort_other: '{{count}} horas',
    minutesShort_one: '{{count}} minuto',
    minutesShort_other: '{{count}} minutos',
    secondsShort_one: '{{count}} segundo',
    secondsShort_other: '{{count}} segundos',
    partSeparator: ' ',
  },

  dayGoal: {
    label: 'Objetivo de cada día (opcional)',
    help: 'Déjalo en blanco si te basta con marcarlo como hecho.',
    placeholderCount: 'p. ej. 30',
    unitCount: 'veces al día',
  },

  periodGoal: {
    label: '¿Cuánto en cada periodo?',
    aggregateCompletedDays: 'Días completados',
    aggregateMetricSum: 'Total acumulado',
    aggregateHelpCompletedDays: 'Cuántos días del periodo tienes que completar.',
    aggregateHelpMetricSum: 'La suma de todo el periodo, sin importar en cuántos días.',
    amountLabel: 'Cantidad',
    unitDays: 'días',
    unitCount: 'veces',
  },

  preview: {
    label: 'Así quedará',
    line: '{{title}}, {{schedule}}',
    untitled: 'Tu actividad',
    partSeparator: ', ',
    listSeparator: ', ',
    listLast: ' y ',
    daily: 'todos los días',
    weekly: 'los {{days}}',
    weeklyNoDays: 'días de la semana por elegir',
    quotaDays_one: '{{count}} día por {{period}}',
    quotaDays_other: '{{count}} días por {{period}}',
    quotaCount_one: '{{count}} vez por {{period}}',
    quotaCount_other: '{{count}} veces por {{period}}',
    quotaDuration: '{{duration}} por {{period}}',
    quotaNoAmount: 'una cantidad por {{period}} sin decidir',
    dayGoalCount_one: '{{count}} vez al día',
    dayGoalCount_other: '{{count}} veces al día',
    dayGoalDuration: '{{duration}} al día',
    period: {
      week: 'semana',
      month: 'mes',
      year: 'año',
    },
    weekdays: {
      '1': 'lunes',
      '2': 'martes',
      '3': 'miércoles',
      '4': 'jueves',
      '5': 'viernes',
      '6': 'sábado',
      '7': 'domingo',
    },
  },

  errors: {
    goalRequired: 'Elige un objetivo o crea uno nuevo.',
    goalTitleRequired: 'El objetivo nuevo necesita un nombre.',
    titleRequired: 'Ponle un nombre a la actividad.',
    weekdaysRequired: 'Elige al menos un día de la semana.',
    dayGoalInvalid: 'Escribe un número entero mayor que cero.',
    periodAmountRequired: 'Indica cuánto quieres hacer en cada periodo.',
    periodAmountInvalid: 'Escribe un número entero mayor que cero.',
  },
} as const;
