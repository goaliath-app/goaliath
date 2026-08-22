/**
 * Spanish is the **source language**: keys are written here first and mirrored
 * into `en`. Anything missing elsewhere falls back to these strings.
 */
export default {
  today: {
    title: 'Hoy',
    empty: 'No tienes nada para hoy.',
    newActivity: 'Añadir actividad',
    profile: 'Ir al perfil de usuario',
  },
  profile: {
    title: 'Perfil',
    goalsLabel: 'Objetivos',
    goalsHint: 'Tus objetivos y sus actividades',
    deleteAllDataLabel: 'Eliminar todos los datos',
    deleteAllDataHint: 'Borra todo tu progreso y actividades',
    deleteAllDataAlertTitle: 'Eliminar todos los datos',
    deleteAllDataAlertMessage: '¿De verdad quieres borrar todos tus datos?',
    deleteAllDataConfirm: 'Sí',
    deleteAllDataCancel: 'No',
    deleteAllDataFailed: 'No se pudieron borrar los datos. Intenta de nuevo.',
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
