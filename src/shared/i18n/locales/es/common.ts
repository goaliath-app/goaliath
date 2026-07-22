/**
 * Spanish is the **source language**: keys are written here first and mirrored
 * into `en`. Anything missing elsewhere falls back to these strings.
 */
export default {
  today: {
    title: 'Hoy',
    empty: 'No tienes nada para hoy.',
    newActivity: 'Nueva actividad',
  },
  activityRow: {
    periodProgress: '{{current}} de {{target}} este periodo',
    addOne: 'Añadir uno a {{title}}',
    timerStart: 'Empezar',
    timerStop: 'Parar',
    timerStartLabel: 'Empezar {{title}}',
    timerStopLabel: 'Parar {{title}}',
  },
} as const;
