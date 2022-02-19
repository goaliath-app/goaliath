const es= {
  translation: {
    activityListItem: {
      description: {
        todayTimeGoal: 'Objetivo: {{expressionValue}} {{expressionUnit}}',
        weekTimeGoal: 'Esta semana: hecho {{weeklyTimeNumber}} de {{expressionValue}} {{expressionUnit}}',
      },
      longPressMenu: {
        edit: 'Editar actividad',
        viewGoal: 'Ver meta'
      },
    },

    dayContent: {
      futureWarningTitle: 'Este es un día futuro',
      futureWarningSubtitle: 'Mañana es mañana.\nPreocupaciones futuras tienen curas futuras,\nY debemos de ocuparnos de hoy.\n — Sofocles',
      emptyPastWarningTitle: 'Este día está vacío',
      emptyPastWarningSubtitle: "Ninguna actividad estaba programada para este día.",
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
  
    loadingStats: 'Cargando Estadísticas...',
    
    activityDetail: {
      detailsTabLabel: 'Detalles',
      statsTabLabel: 'Estadísticas',
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
      changeGoalSnackbar: "Actividad movida a la meta {{goalName}}",
      archivedWarning: "Esta actividad está archivada",
      restoreButton: "Restaurar actividad",
      todayStatusCard: {
        dueToday: 'Esta actividad está programada para hoy',
        dueThisWeek: 'Puedes elegir hacer hoy esta actividad desde la lista de hoy',
        notDue: 'No tienes que hacer esta actividad hoy',
        chosenToday: 'Has elegido hacer esta actividad hoy',
        goToToday: "Ir a Hoy",
      }
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
      weekdaysTitle: 'Días de la semana',
      errors: {
        noName: 'Es necesario un nombre para tu actividad',
        noDaysSelected: 'Selecciona al menos un día',
        noTime: 'Por favor introduce el tiempo a dedicar',
        noFrequency: 'Por favor selecciona una frecuencia',
        noRepetitions: 'Por favor introduce las repeticiones',
      },
      frequencyTitle: 'Frecuencia',
      frequencyLabel: 'Selecciona una frecuencia',
      switch: {
        multipleTimes: 'Objetivo de repeticiones',
        repetitionsGoal: 'Objetivo de repeticiones',
        timeGoal: 'Objetivo de tiempo'
      },
      dailyRepetitions: 'Repeticiones diarias',
      weeklyRepetitions: 'Repeticiones semanales',
      dialog: {
        title: 'Selecciona la frecuencia',
        dailyTitle: 'Actividad diaria',
        dailyDescription: 'Selecciona qué días de la semana quieres hacerla',
        freeTitle: 'Actividad libre',
        freeDescription: 'Hazla un cierto número de días a la semana, puedes decidir cuales sobre la marcha.',
        weeklyTitle: 'Total semanal',
        weeklyDescription: 'Alcanza un total de tiempo o repeticiones cada semana'
      },
      snackbar: {
        activityCreated: 'Actividad creada',
        activityUpdated: 'Actividad editada',
      },
    },

    aboutUs:{
      title: 'El equipo detrás de Goaliath',
      description: "Somos Jimena y Óliver, los creadores de Goaliath.\n\nEn 2021 nos encontrábamos en un periodo de autoaprendizaje en distintas materias. Pero no podíamos con todo lo que nos propusimos y nuestro progreso era lento.\n\nComo respuesta ideamos Goaliath. Una herramienta simple pero potente que nos ayudó a conseguir nuestros objetivos sin perdernos en el intrincado camino. Y ahora la hemos publicado para que también pueda ayudarte a ti.\n\nSi tienes alguna sugerencia o ves algo que no funciona bien, puedes decírnoslo desde los ajustes.\n\n",
      jimena: 'Jimena',
      oliver: 'Óliver',
      goaliath: 'Código fuente',
      jimenaLink: "https://www.linkedin.com/in/jimena-andrea/",
      oliverLink: "https://twitter.com/oliverlsanz",
      goaliathLink: "https://github.com/goaliath-app/goaliath"  
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
      descriptionHelpDialog: "Tu respuesta será visible en la los detalles de la meta. Úsala para recordar y mantener tu motivación a lo largo del tiempo.",
      headerTitle: 'Nueva meta',
      goalNameSubheading: '¿Qué quieres conseguir?',
      nameTextInputLabel: 'Nombre de la meta',
      nameTextInputPlaceholder: '"Fitness", "Aprender Inglés"',
      goalMotivationSubheading: '¿Por qué quieres llegar a esa meta?',
      motivationTextInputLabel: 'Tu Motivación (opcional)',
      motivationPlaceholder: "Quiero aprender inglés para hacer nuevos amigos durante mi viaje a Florida.",
    },

    goal: {
      motivation: 'Motivación',
      threeDotsMenu: {
        editGoal: 'Editar meta',
        deleteGoal: 'Archivar meta',
        viewArchivedActivities: 'Ver actividades archivadas',
      },
      deleteDialog: {
        title: '¿Archivar meta?',
        body: "Podrás ver la meta y restaurarla más adelante desde el menú de la pantalla de metas.",
      },
      infoTitle: "No hay actividades",
      infoContent: 'Puedes añadir nuevas actividades pulsando el icono +. Elige actividades recurrentes que harás a menudo.',
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
      infoTitle: 'No hay metas',
      infoContent: 'Crea una meta pulsando el icono +',
      menu: {
        viewArchived: "Ver metas archivadas",
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
      supportUs: 'Apoya Goaliath',
      supportUsDescription: 'Ayúdanos a seguir trabajando en Goaliath',
      supportDialog: {
        title: 'Apoya Goaliath',
        body: 'Goaliath es una aplicación gratuita creada por dos personas durante cientos de horas.\n\nPuedes ayudarnos a seguir trabajando en ella con una donación.\n\nTen en cuenta que no necesitas pagar para disfrutar de todo lo que ofrece Goaliath.',
        donate: 'Ir a donaciones',
      },
      darkTheme: 'Tema oscuro',
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
      importDescription: '¿Tienes una copia de seguridad? Restaura tus datos',
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
      languageLocale: 'Español',
      dailyNotification: 'Notificación diaria',
      dailyNotificationDescription: 'Recibirás un recordatorio para usar Goaliath',
      dailyNotificationHour: 'Hora de la notificación diaria',
      aboutUs: 'Conoce al equipo',
      aboutGoaliath: {
        title: 'Aprende sobre el método de Goaliath',
        description: "Serás redirigido a la web",
        blogURL: 'https://goaliath-app.github.io/es/',
      },
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
      dayChangeDialogBody: "El día ha cambiado a {{date}} mientras la app estaba abierta.\n\nSi necesitas hacer las actividades del día hasta más tarde, puedes cambiar la hora de inicio del día en los ajustes.",
      dayChangeDialogConfirmLabel: "Ver nuevo día",
      noActivitiesInfoCard: {
        title: 'Bienvenido a Goaliath',
        contentBeforeIcon: 'Ve a la sección de Metas (',
        contentAfterIcon:') para planificar tus acciones diarias.',
      },
      noActiveActivitiesInfoCard: {
        title: 'No tienes actividades activas',
        content: 'Ve a la sección de Metas (🏆) para crear o activar actividades.',
      },
      onlyWeeklyActivitiesInfoCard: {
        title: "¡Hoy no tienes actividades!",
        content: 'Echa un ojo a las actividades semanales para seguir trabajando en tus metas.',
      },
      nothingForTodayInfoCard: {
        title: "Nada para hoy",
        content: 'Tómate un descanso y recarga las pilas para seguir trabajando en tus metas mañana (o planifica nuevas actividades si lo prefieres).',
      },
    },

    addTasks: {
      title: 'Añade Tareas Puntuales',
      placeholder: 'Nombre de la tarea',
      description: 'Las tareas aparencerán en este día como actividades que hacer solo una vez.',
    },

    taskList: {
      longPressMenu: {
        paragraph: 'Tarea puntual',
        deleteTitle: 'Eliminar tarea',
        deleteDescription: 'Esta acción no podrá ser deshecha.',
        deleteSnackbar: 'Tarea eliminada',
      }
    },

    tooltips: {
      playIcon: 'Pulsa aquí para iniciar el temporizador para esta actividad con un objetivo de tiempo',
      repsIcon: 'Pulsa aquí cuando realices una repetición para registrarla',
      checkboxIcon: 'Pulsa aquí cuando termines la actividad para marcarla como completada',
      selectWeekliesListItem: 'Pulsa aquí para elegir las actividades semanales en las que quieres trabajar hoy',
      firstGoal: 'Este es tu primer goal, pero aún no tiene actividades. Pulsa aquí para crearlas!',
      todayScreenLead: 'Aquí encontrarás las actividades que has planeado para hoy',
    },
    
    weeklyActivities: {
      headerTitle: 'Selecciona las actividades semanales',
      daysLeft: 'Quedan {{daysLeft}} días',
      daysLeftSingular: 'Queda {{daysLeft}} día',
      timeLeft: 'Quedan {{timeExprValue}} {{timeExprLocaleUnit}}',
      checkCompleted: 'Hecho: {{weeklyTimes}} días completado',
      timedCompleted: 'Hecho: {{unit}} {{expression}} dedicada/os',
      selectedCaption: 'Hoy trabajaré en',
      dueCaption: 'Para otro día',
      completedCaption: 'Completadas',
      noSelectedActivities: 'Selecciona qué actividades semanales de más abajo vas a hacer hoy. Pulsa ✓ para confirmar.',
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
          listItemDescription: '{{todayReps}} reps hoy - Hecho {{totalReps}} de {{weeklyRepsGoal}} esta semana',
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
          frequencyStringSingular: '{{days}} día a la semana',
          completed: 'Completada',
          daysLeft: 'Quedan {{daysLeft}} días',
          daysLeftSingular: 'Queda {{daysLeft}} día',
        }
      },
      dailyGoals: {
        // frequencyStrings of dailygoals get prepended to the 
        // frequencyStrings of their corresponding activityType
        doNSeconds: {
          frequencyString: '{{value}} {{unit}}',
          listItemDescription: 'Hecho {{currentTimeValue}} de {{timeGoalValue}} {{unit}}',
        },
        doNTimes: {
          frequencyString: '{{repetitions}} veces',
          listItemDescription: 'Hecho {{todayReps}} de {{repsGoal}} repeticiones',
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
        seconds: 'segundos',
        hour: 'hora',
        minute: 'minuto',
        second: 'segundo',
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
      reminder: {
        title: '¡Tienes nuevas actividades!',
        body: 'Pulsa para abrir Goaliath'
      },
      timer: {
        title: 'Estás trabajando en: ',
        body: '{{activityName}}'
      },
      complete: {
        title: 'Has completado la actividad: ',
        body: '{{activityName}}'
      }
    },

    onboarding: {
      1: 'Hola, ¡soy Goaliath!',
      2: 'He sido creado para ayudarte a alcanzar tus metas a través del trabajo diario.',
      3: 'Mola, ¿eh? ¡Empecemos!',
      skip: 'Saltar tutorial',
      previous: 'Anterior',
      next: 'Siguiente',
      begin: '¡Empecemos!',
      slideZero: {
        title: 'Bienvenido a Goaliath',
        image: '',
        text: 'Alcanza grandes metas mediante tus actividades diarias',
      },
      slideOne: {
        title: 'Crea tus Metas',
        image: '',
        text: 'Decide cuáles son tus objetivos',
      },
      slideTwo: {
        title: 'Añade actividades',
        image: '',
        text: 'Planifica qué acciones tomarás para alcanzar cada meta',
      },
      slideThree: {
        title: 'Actúa cada día',
        image: '',
        text: 'Goaliath te recuerda tu plan para que puedas centrarte en ejecutarlo',
      }
    },

    tutorial: {
      sampleActivity: {
        name: 'Trabajar en {{goalName}}',
        description: 'Dedica 10 minutos ininterrumpidos a tu meta. Piensa en cómo puedes trabajar en ella, investiga y comienza a tomar acción. \n\nHaz esto durante varios días y verás que empiezan a surgir las ideas.\n\n Esta es una buena actividad cuando no sabes por donde empezar. Puedes sustituirla por otras cuando lo creas oportuno.',
      },
      TodayScreenIntroduction: {
        1: '¡Bienvenido! Cada día te recordaré aquí qué debes hacer para avanzar hacia tus metas.',
        2: 'Vayamos a la lista de metas.'
      },
      ReturnToGoalsScreen: "Vuelve a la lista de metas para continuar.",
      GoalsScreenIntroduction: {
        1: 'Las metas son aquellas cosas importantes que te hacen sentir bien cuando les dedicas tiempo.',
        2: 'Y también las que te hacen sentir mal cuando las dejas de lado.',
        3: 'Cosas como "Ponerme en forma", "Aprender inglés" o "Estar con mi familia" son buenos ejemplos de metas.'
      },
      FirstGoalCreation: {
        1: 'Vamos a crear tu primera meta pulsando el icono +.',
        2: 'Puede que tu motivación parezca algo obvio, pero en los días difíciles te vendrá bien leerla.'
      },
      AfterFirstGoalCreation: {
        1: '¡Aquí está tu primera meta! Pulsa en ella para ver sus detalles.'
      },
      GoalScreenIntroduction: {
        2: 'Aquí definirás las acciones que tomarás para avanzar hacia tu objetivo.',
        3: 'Estas acciones serán actividades que repetirás a lo largo del tiempo.',
        4: 'Si tu objetivo es "Aprender inglés", buenos ejemplos de actividades son "Repasar vocabulario una vez al día" y "Conversar 1 hora a la semana".',
        5: 'De este modo te comprometes a dedicar tiempo regularmente para alcanzar tu meta.',
        6: 'Y eso es lo único que necesitas para progresar.',
        7: 'Ahora voy a crear una actividad para ti.',
        8: '¡¡Tachán!!',
        9: 'Puedes añadir tus propias actividades usando el icono +'
      },
      ActivitiesInTodayScreen: {
        0: 'Cuando estés listo, vuelve a la sección de hoy.',
        1: 'Vuelve a la sección de hoy.',
        2: 'Aquí puedes ver lo que quieres hacer hoy, de acuerdo con tu plan.',
        3: 'Completa estas actividades y estarás un paso más cerca de tus metas.',
        4: 'Incluso si sólo haces algunas de ellas, estarás avanzando hacia delante.'
      },
      ChooseWeekliesIntroduction: {
        1: 'Si creas actividades que no se realizan un día concreto de la semana, podrás seleccionarlas aquí y aparecerán en la lista.',
        2: 'Esta opción desaparecerá si no hay ninguna de esas actividades.',
      },
      OneTimeTasksIntroduction: {
        1: 'También puedes crear recordatorios de tareas, que solo aparecerán hoy.'
      },
      TutorialEnding: {
        1: '¡Es hora de que explores el resto de la aplicación por tu cuenta!',
        2: 'Te recomiendo que vayas a la lista de metas y crees todas tus metas importantes.',
        3: 'Después crea en cada una las actividades necesarias para progresar.',
        4: 'Si no sabes cuáles son esas actividades, solo intenta dedicar 10 minutos diarios a tu meta.',
        5: 'Incluso si no sabes qué hacer durante ese tiempo, tomar acción te ayudará a averiguarlo.',
        6: 'Seguiré por aquí para darte algún que otro consejo. ¡Buena suerte!'
      }
      
    }
  }
}

export default es