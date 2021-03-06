const es= {
  translation: {
    activityListItem: {
        description: {
          todayTimeGoal: 'Objetivo: {{expressionValue}} {{expressionUnit}}',
          weekTimeGoal: 'Esta semana: dedicado {{weeklyTimeNumber}} de {{expressionValue}} {{expressionUnit}}',
        },
        longPressMenu: {
          edit: 'Editar actividad',
          viewGoal: 'Ver meta'
        },
    },

    dayContent: {
      futureWarningTitle: 'Este es un día futuro',
      futureWarningSubtitle: 'Mañana es mañana.\nPreocupaciones futuras tienen curas futuras,\nY debemos de ocuparnos de hoy.\n — Sofocles',
    },

    dateWheelPicker: {
      dialog: {
        cancel: 'Cancelar',
        acept: 'OK'
      }
    },

    archivedGoalsScreen: {
      title: 'Metas archivadas',
      empty: 'No hay ninguna meta archivada',
      longPressMenu: {
        restore: "Restaurar meta"
      }
    },

    archivedActivitiesScreen: {
      title: 'Archivo: {{goalName}}',
      empty: 'Esta meta no tiene actividades archivadas',
      longPressMenu: {
        restore: "Restaurar actividad"
      }
    },
  
    deleteDialog: {
        delete: 'Archivar',
        cancel: 'Cancelar'
    },
  
    helpIcon: {
        closeButton: 'OK'
    },
  
    activityDetail: {
      threeDotsMenu: {
        editActivity: 'Editar actividad',
        deleteActivity: 'Archivar actividad',
        changeGoal: "Mover a otra meta",
      },
      helpIconText: 'Estos son los detalles de una actividad pasada. Incluso si has modificado el objetivo o la frecuencia de la actividad, aquí podrás verla exactamente como fue ese día.',
      deleteDialog: {
        title: '¿Archivar actividad?',
        body: "Podrás restaurarla desde el menu superior derecho de la pantalla de su meta."
      },
      changeGoalDialogTitle: "Seleccionar nueva meta",
      changeGoalDialogCancel: "Cancelar",
      changeGoalDialogBody: 'Meta actual: {{currentGoal}}',
      changeGoalSnackbar: "Actividad movida a otra meta",
      archivedWarning: "Esta actividad está archivada",
      restoreButton: "Restaurar actividad",
    },
  
    basicActivityInfo: {
        goal: 'Meta: {{goalName}}',
        frequency: 'Frecuencia: '
    },
  
    stats: {
        genericStats: {
          title: 'Estadísticas Globales',
          timeDedicated: '{{expressionValue}} {{expressionUnit}} dedicados en total',
          daysCompleted: ' actividades completadas',
          repetitions: ' repeticiones realizadas',
          filterByGoal: 'Filtrar por meta',
          allGoals: 'Todas las metas'
        },
        weekStats: {
          title: 'Esta semana',
          hoursDedicated: ' horas totales dedicadas',
          daysCompleted: ' actividades completadas'
  
        }
    },

    barchart: {
      time: 'Tiempo',
      repetitions: 'Repeticiones',
      completed: 'Completadas',
      month: 'Mes',
      week: 'Semana',
      date: 'Fecha',
      minutes: 'Minutos',
    },

    statsScreen: {
      drawerTitle: 'Estadísticas',
      headerTitle: 'Estadísticas',
    },
    
    todayPannel: {
      title: 'Hoy',
      repetitions: 'Repeticiones',
      time: 'Tiempo',
      stopButton: 'Parar temporizador',
      startButton: 'Iniciar temporizador',
      checkboxLabel: 'Hecho',
    },

    activityForm: {
        headerTitle: 'Nueva actividad',
        nameInputLabel: 'Nombre de la actividad',
        descriptionInputLabel: 'Descripción (opcional)',
        weeklyDaysLabel: 'Días a la semana',
        errors: {
          noName: 'Es necesario un nombre para tu actividad',
          noDaysSelected: 'Selecciona al menos un día',
          noTime: 'Por favor introduce el tiempo a dedicar',
          noFrequency: 'Por favor selecciona una frecuencia'
        },
        frequencyTitle: 'Frecuencia',
        frequencyLabel: 'Selecciona el tipo de actividad',
        switch: {
          multipleTimes: 'Varias veces',
          repetitionsGoal: 'Objetivo de repeticiones',
          timeGoal: 'Objetivo de tiempo'
        },
        dailyRepetitions: 'Repeticiones diarias',
        weeklyRepetitions: 'Repeticiones semanales',
        dialog: {
          title: 'Selecciona la frecuencia',
          dailyTitle: 'Actividades diarias',
          dailyDescription: 'Se hacen en días concretos de la semana',
          freeTitle: 'Actividades libres',
          freeDescription: 'Elige cuando hacerlas sobre la marcha.',
          weeklyTitle: 'Total semanal',
          weeklyDescription: 'Cumple con un objetivo cada semana.'
        },
        snackbar: {
          activityCreated: 'Actividad creada',
          activityUpdated: 'Actividad editada',
        },
      },
      
    calendar: {
        headerTitle: 'Calendario',
        //stats: '{{completedActivities}} tareas hechas, {{timeDedicatedValue}} {{timeDedicatedUnit}} dedicado\n{{undoneActivities}} tareas sin hacer, {{timeLeftValue}} {{timeLeftUnit}} quedan por hacer',
        dayView: {
          header: '{{day}} de {{month}} , {{year}}'
        },
        weekView: {
          header: '{{weekStartDate}} - {{weekEndDate}} {{year}}',
          sortByGoal: 'Ordenar por meta',
          sortByActivity: 'Ordenar por actividad'
        },
    },
  
    

    goalForm: {
      nameError: "Introduce un nombre",
      descriptionHelpDialogTitle: "Motivación",
      descriptionHelpDialog: "Tu respuesta será visible en la pantalla de la meta. Úsala para recordar y mantener tu motivación a lo largo del tiempo.",
      headerTitle: 'Nueva meta',
      goalNameSubheading: '¿Qué quieres conseguir?',
      nameTextInputLabel: 'Nombre de la meta',
      goalMotivationSubheading: '¿Por qué quieres llegar a esa meta?',
      motivationTextInputLabel: 'Tu Motivación (opcional)',
    },

    goal: {
      motivation: 'Motivación',
      threeDotsMenu: {
        editGoal: 'Editar meta',
        deleteGoal: 'Eliminar meta',
        viewArchivedActivities: 'Ver actividades archivadas',
      },
      deleteDialog: {
        title: '¿Archivar meta?',
        body: "Podrás ver la meta y restaurarla más adelante desde el menú de la pantalla de metas.",
      },
      infoContent: "Esta meta no tiene ninguna actividad todavía.\n\nUna actividad es una tarea recurrente que puede tener o no un requisito de tiempo.\n\nPara cada meta deberías crear las actividades que vayan a ayudarte a completar la meta si las realizas con constancia.\n\nDiseñar tus actividades de esta forma te permitirán irte a la cama pensando: \"Hoy he hecho todo lo que tenía que hacer\".",
      archivedWarning: "Esta meta está archivada",
      restoreButton: "RESTAURAR META",
      longPressMenu: {
        edit: "Editar",
        archive: "Archivar",
        move: "Mover a otra meta",
      }
    },

    goals: {
        headerTitle: 'Metas',
        goalDescription: '{{activitiesNumber}} actividades activas',
        infoContent: "No tienes metas todavía.\n\nLas metas son la base de Goaliath, son las cosas que quieres conseguir, dedicar tiempo o trabajar en ellas.\n\nPuedes crear una nueva meta pulsando el icono +.",
        menu: {
          viewArchived: "View archived goals",
        },
        longPressMenu: {
          add: "Añadir nueva actividad",
          edit: "Editar",
          archive: "Archivar",
          viewArchivedActivities: "Ver actividades archivadas",
        }
    },

    settings: {
        headerTitle: 'Ajustes',
        startHour: 'Hora de inicio del día',
        todaySnackbar: 'El día de hoy terminará a las {{startHour}} de mañana.',
        yesterdaySnackbar: 'Has regresado al día de ayer. Terminará a las {{startHour}} de hoy.',
        startHourDescription: 'A esta hora se reiniciarán las actividades diarias' ,
        feedback: 'Mándanos tus sugerencias',
        feedbackDescription: 'Manda un mensaje a los desarrolladores',
        share: 'Compartir',
        shareDescription: 'Preséntanos a tus amigos',
        shareMessage: "Goaliath es una aplicación para conseguir tus metas, ¡pruébala!\n\nAún no está diponible en la play store, pero puedes descargarla aquí: (android)\nhttps://anonfiles.com/r4G5B4raue/Goaliath-1ac4cc84001d4f32980c40e9869c79d9-signed_apk \n\nEs de código abierto, puedes revisarlo aquí: \nhttps://github.com/OliverLSanz/routines-app",
        export: 'Exportar',
        exportDescription: 'Guarda tus datos',
        import: 'Importar',
        importDescription: 'Tienes una copia de seguridad? Restaura tus datos',
        language: 'Idioma',
        languageDescription: 'Sólo cambiaran los textos por defecto',
        importDialog: {
          title: '¿Quieres importar tus datos?',
          content: "Esta acción no podrá ser deshecha, los datos de la app se sobreescribirán.",
          buttonAcept: 'Importar',
          buttonCancel: 'Cancelar'
        },
        languageDialog: {
          title: 'Selecciona un idioma',
          english: 'Inglés',
          spanish: 'Español',
        },
        languageLocale: 'Español'
    },

    today: {
      headerTitle: 'Hoy',
      infoContent: 'No hay actividades programadas para esta semana. Puedes ir a la sección "Metas" para crear nuevas actividades.',
      selectWeekliesTitle: 'Elige las actividades semanales para hoy',
      selectWeekliesDescription: '{{weekActivitiesNumber}} actividades, {{weekProgress}}% completado esta semana',
      selectTasksTitle: 'Añade las tareas puntuales de hoy',
      selectTasksDescription: 'Pulsa para añadir',
      oneTimeTaskDescription: 'Tarea puntual',
      dayChangeDialogTitle: "¡Buenos días!",
      dayChangeDialogBody: "El día ha cambiado a {{date}} mientras la app estaba abierta.\n\nSi necesitas hacer las actividades del día hasta más tarde, puedes cambiar la hora de inicio del día en la pantalla de ajustes.",
      dayChangeDialogConfirmLabel: "Ver nuevo día",
    },

    addTasks: {
      title: 'Añade Tareas Puntuales',
      description: 'Las tareas aparencerán en este día como actividades que hacer solo una vez.',
    },

    taskList: {
      longPressMenu: {
        paragraph: 'Tarea puntual',
        delete: 'Eliminar tarea',
        deleteSnackbar: 'Tarea eliminada',
      }
    },
    
    weeklyActivities: {
      headerTitle: 'Selecciona las actividades semanales',
      daysLeft: 'Quedan {{daysLeft}} días',
      timeLeft: 'Quedan {{timeExprValue}} {{timeExprLocaleUnit}}',
      checkCompleted: 'Hecho: {{weeklyTimes}} días completado',
      timedCompleted: 'Hecho: {{unit}} {{expression}} dedicada/os',
    },

    onboarding: {
      slideOne: {
        title: 'Bienvenido',
        text: 'Goaliath es una herramienta para gestionar tu tiempo cuyo objetivo es hacerte sentir orgulloso de tus acciones de cada día.',
      },
      slideTwo: {
        title: 'Cómo funciona',
        text: 'Introduces en Goaliath tus metas. Después añades a cada meta las acciones que quieres realizar para cumplirla. Goaliath te recordará lo que quieres hacer cada día.',
      },
      slideThree: {
        title: '¡Hay más!',
        text: 'El método de Goaliath tiene más herramientas que pueden ayudarte. Te recomendamos echar un vistazo a la guía rápida en ',
        linkText: 'nuestra página web.',
        linkURL: 'https://goaliath-app.github.io/es/guide'
      },
      next: 'Siguiente',
      begin: 'Vamos'
    },

    activityHandler: {
      activityTypes: {
        doNSecondsEachWeek: {
          frequencyString: '{{expressionValue}} {{expressionUnit}} a la semana',
          completed: 'Completada',
          secondsLeft: 'Quedan {{timeExprValue}} {{timeExprLocaleUnit}}'
        },
        doNTimesEachWeek: {
          frequencyString: '{{repetitions}} repeticiones a la semana',
          listItemDescription: '{{todayReps}} reps hoy - {{repsLeft}} de {{weeklyRepsGoal}} esta semana',
          weeklyCompletedDescription: '{{repetitionsGoal}} repeticiones completadas',
          timesLeft: 'Quedan {{repetitionsLeft}} repeticiones',
          completed: 'Completada'
        },
        doFixedDays: {
          everyDayFrequencyString: 'cada día',
          frequencyString: 'los {{daysOfWeek}}',
        },
        doNDaysEachWeek: {
          frequencyString: '{{days}} días a la semana',
          completed: 'Completada',
          daysLeft: 'Quedan {{daysLeft}} días'
        }
      },
      dailyGoals: {
        // frequencyStrings of dailygoals get prepended to the 
        // frequencyStrings of their corresponding activityType
        doNSeconds: {
          frequencyString: '{{value}} {{unit}}'
        },
        doNTimes: {
          frequencyString: '{{repetitions}} veces',
          listItemDescription: '{{todayReps}} de {{repsGoal}} reps hechas hoy',
        },
        doOneTime: {
          frequencyString: 'Hacer',
        },
      }
    },
  
    app: {
      drawer: {
        today: 'Hoy',
        week: 'Semana',
        goals: 'Metas',
        calendar: 'Calendario',
        settings: 'Ajustes',
        stats: 'Estadísticas',
      }
    },

    units: {
      time: {
        hours: 'horas',
        minutes: 'minutos',
        seconds: 'segundos'
      },
      monthNames: {
        january: 'Enero',
        february: 'Febrero',
        march: 'Marzo',
        april: 'Abril',
        may: 'Mayo',
        june: 'Junio',
        july: 'Julio',
        august: 'Agosto',
        september: 'Septiembre',
        october: 'Octubre',
        november: 'Noviembre',
        december: 'Diciembre'
      },
      monthNamesShort: {
        january: 'Ene',
        february: 'Feb',
        march: 'Mar',
        april: 'Abr',
        may: 'May',
        june: 'Jun',
        july: 'Jul',
        august: 'Ago',
        september: 'Sep',
        october: 'Oct',
        november: 'Nov',
        december: 'Dic'
      },
      dayNames: {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo'
      },
      dayNamesShort2: {
        monday: 'Lu',
        tuesday: 'Ma',
        wednesday: 'Mi',
        thursday: 'Ju',
        friday: 'Vi',
        saturday: 'Sa',
        sunday: 'Do'
      },
      dayNamesShort3: {
        monday: 'Lun',
        tuesday: 'Mar',
        wednesday: 'Mié',
        thursday: 'Jue',
        friday: 'Vie',
        saturday: 'Sáb',
        sunday: 'Dom'
      },
      dayNamesInitials: {
        monday: 'L',
        tuesday: 'M',
        wednesday: 'X',
        thursday: 'J',
        friday: 'V',
        saturday: 'S',
        sunday: 'D'
      }
    },

    drawer: {
      blog: 'Sitio web',
      blogURL: 'https://goaliath-app.github.io/es/',
      appName: 'Goaliath'
    },

    notifications: {
      timer: {
        title: 'Estás trabajando en: ',
        body: '{{activityName}}'
      },
      complete: {
        title: 'Has completado la actividad: ',
        body: '{{activityName}}'
      }
    }
  }
}

export default es