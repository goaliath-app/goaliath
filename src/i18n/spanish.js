const es= {
  translation: {
    activityListItem: {
        description: {
          todayTimeGoal: 'Objetivo: {{expressionValue}} {{expressionUnit}}',
          weekCheck: 'Hecho {{totalTimes}} de {{timesPerWeek}} días',
          weekTimeGoal: 'Hecho {{weeklyTimeNumber}} de {{expressionValue}} {{expressionUnit}}'
        }
    },
  
    deleteDialog: {
        delete: 'Borrar',
        cancel: 'Cancelar'
    },
  
    helpIcon: {
        closeButton: 'OK'
    },
  
    activityDetail: {
        threeDotsMenu: {
          editActivity: 'Editar actividad',
          deleteActivity: 'Borrar actividad'
        },
        helpIconText: 'Estos son los detalles de una actividad pasada. Incluso si has modificado el objetivo o la frecuencia de la actividad, aquí podrás verla exactamente como fue ese día.',
        deleteDialog: {
          title: '¿Borrar actividad?',
          body: "Esta acción no puede deshacerse."
        },
    },
  
    basicActivityInfo: {
        goal: 'Meta: {{goalName}}',
        frequency: 'Frecuencia: '
    },
  
    stats: {
        genericStats: {
          title: 'Estadísticas',
          hoursDedicated: ' horas totales dedicadas',
          daysCompleted: ' días completada'
        },
        weekStats: {
          title: 'Esta semana',
          hoursDedicated: ' horas totales dedicadas',
          daysCompleted: ' días completada'
  
        }
    },
    
    todayPannel: {
      title: 'Hoy',
      stopButton: 'Parar temporizador',
      startButton: 'Iniciar temporizador',
      checkboxLabel: 'Hecho',
    },

    activityForm: {
        headerTitle: 'Nueva actividad',
        nameInputLabel: 'Nombre de la actividad',
        repeatSwitchBar: {
          title: 'Periodicidad',
          daily: 'diaria',
          select: 'seleccionar',
          weekly: 'semanal'
        },
        repeatInfoDialog: {
          mainTitle: 'Periodicidad',
          dailyTitle: 'Diaria',
          dailyText: 'Tu meta es hacer la actividad todos los días.',
          selectTitle: 'Seleccionar',
          selectText: 'Como la diaria, pero solo ciertos días de la semana.',
          weeklyTitle: 'Semanal',
          weeklyText: 'Puedes hacer la actividad cualquier día de la semana. Aparecerá en la sección "Esta semana".',
        },
        objectiveSwitchLabel: 'Objetivo de tiempo',
        weeklyDaysLabel: 'Días a la semana',
        errors: {
          noName: 'Es necesario un nombre para tu actividad',
          noDaysSelected: 'Selecciona al menos un día',
          noTime: 'Por favor introduce el tiempo a dedicar'
        },
      },
      
    calendar: {
        headerTitle: 'Calendario',
        openDayButton: 'Abrir día',
        stats: '{{completedActivities}} tareas hechas, {{timeDedicatedValue}} {{timeDedicatedUnit}} dedicado\n{{undoneActivities}} tareas sin hacer, {{timeLeftValue}} {{timeLeftUnit}} quedan por hacer'
    },
  
      dayInCalendar: {
        dailyActivities: 'Actividades diarias',
        weeklyActivities: 'Actividades semanales'
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
      },
      deleteDialog: {
        title: '¿Eliminar meta?',
        body: "Se borrará la meta y todas sus actividades. No puede deshacerse.",
      },
      infoContent: "Esta meta no tiene ninguna actividad todavía.\n\nUna actividad es una tarea recurrente que puede tener o no un requisito de tiempo.\n\nPara cada meta deberías crear las actividades que vayan a ayudarte a completar la meta si las realizas con constancia.\n\nDiseñar tus actividades de esta forma te permitirán irte a la cama pensando: \"Hoy he hecho todo lo que tenía que hacer\"."
    },

    goals: {
        headerTitle: 'Metas',
        infoContent: "No tienes metas todavía.\n\nLas metas son la base de Goaliath, son las cosas que quieres conseguir, dedicar tiempo o trabajar en ellas.\n\nPuedes crear una nueva meta pulsando el icono +."
    },

    settings: {
        headerTitle: 'Ajustes',
        startHour: 'Hora de inicio del día',
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
      selectWeekliesDescription: 'Pulsa aquí',
    },

    week: {
      headerTitle: 'Esta semana',
      infoContent: 'No hay actividades programadas para esta semana. Puedes ir a la sección "Metas" para crear nuevas actividades.',
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

    util: {
      frequency: {
        weekly: {
          check: '{{activityTimesPerWeek}} días por semana.',
          time: '{{expressionValue}} {{expressionUnit}} por semana'
        },
        select: {
          check: 'Hacer los {{days}}',
          time: '{{expressionValue}} {{expressionUnit}} los {{days}}'
        },
        daily: {
          check: 'Todos los días',
          time: '{{expressionValue}} {{expressionUnit}} todos los días'
        },
        error: 'ERROR'
      },
    },
  
    app: {
      drawer: {
        today: 'Hoy',
        week: 'Semana',
        goals: 'Metas',
        calendar: 'Calendario',
        settings: 'Ajustes'
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
    }
  }
}

export default es