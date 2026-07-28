/**
 * Spanish is the **source language**: keys are written here first and mirrored
 * into `en`. Anything missing elsewhere falls back to these strings.
 */
export default {
  today: {
    title: 'Hoy',
    empty: 'No tienes nada para hoy.',
    newActivity: 'Nueva actividad',
    menu: 'Menú',
  },
  profile: {
    title: 'Perfil',
    goalsLabel: 'Objetivos',
    goalsHint: 'Tus objetivos y sus actividades',
  },
  goals: {
    title: 'Objetivos',
    empty: 'Aún no tienes objetivos. Crea una actividad para empezar.',
    activitiesEmpty: 'Sin actividades',
  },
  back: 'Atrás',
  status: {
    active: 'Activo',
    paused: 'En pausa',
    archived: 'Archivado',
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
