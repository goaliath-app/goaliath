const en = {
  translation: {
    activityListItem: {
      description: {
        todayTimeGoal: 'Goal: {{expressionValue}} {{expressionUnit}}',
        weekTimeGoal: 'This week: Done {{weeklyTimeNumber}} of {{expressionValue}} {{expressionUnit}}'
      }
    },

    dateWheelPicker: {
      dialog: {
        cancel: 'Cancel',
        acept: 'OK'
      }
    },

    deleteDialog: {
      delete: 'Delete',
      cancel: 'Cancel'
    },

    helpIcon: {
      closeButton: 'OK'
    },

    activityDetail: {
      threeDotsMenu: {
        editActivity: 'Edit activity',
        deleteActivity: 'Delete activity'
      },
      helpIconText: 'These are the details of a past activity. Even if you have modified the activity goal or frequency, here you will see them as they were this specific day.',
      deleteDialog: {
        title: 'Delete activity?',
        body: "This can't be undone."
      },
    },

    basicActivityInfo: {
      goal: 'Goal: {{goalName}}',
      frequency: 'Frequency: '
    },

    stats: {
      genericStats: {
        title: 'Lifetime',
        timeDedicated: '{{expressionValue}} total {{expressionUnit}} dedicated',
        daysCompleted: ' activities completed',
        repetitions: ' repetitions done',
      },
      weekStats: {
        title: 'This week',
        hoursDedicated: ' total hours dedicated',
        daysCompleted: ' activities completed'
      }
    },

    statsScreen: {
      drawerTitle: 'Stats',
      headerTitle: 'Stats',
    },

    todayPannel: {
      title: 'Today',
      repetitions: 'Repetitions',
      time: 'Time',
      stopButton: 'Stop Timer',
      startButton: 'Start Timer',
      checkboxLabel: 'Done',
    },

    activityForm: {
      headerTitle: 'New activity',
      nameInputLabel: 'Activity\'s name',
      weeklyDaysLabel: 'Days each week',
      errors: {
        noName: 'A name is required',
        noDaysSelected: 'At least select one day',
        noTime: 'Please enter a time',
        noFrequency: 'Please select a frequency'
      },
      frequencyTitle: 'Frequency',
      frequencyLabel: 'Select activity type',
      switch: {
        multipleTimes: 'Multiple Times',
        repetitionsGoal: 'Repetitions Goal',
        timeGoal: 'Time Goal'
      },
      dailyRepetitions: 'Daily Repetitions',
      weeklyRepetitions: 'Weekly Repetitions',
      dialog: {
        title: 'Select your frequency',
        dailyTitle: 'Daily Activities',
        dailyDescription: 'Do on fixed days of the week',
        freeTitle: 'Free Activities',
        freeDescription: 'Choose when to do it on the fly',
        weeklyTitle: 'Weekly Total',
        weeklyDescription: 'Reach a certain goal each week'
      }
    },
    
    calendar: {
      headerTitle: 'Calendar',
      openDayButton: 'Open day',
      stats: '{{completedActivities}} tasks done, {{timeDedicatedValue}} {{timeDedicatedUnit}} dedicated\n{{undoneActivities}} task undone, {{timeLeftValue}} {{timeLeftUnit}} left'
    },

    weekViewInCalendar: {
      sortByGoal: 'Sort by goal',
      sortByActivity: 'Sort by activity'
    },

    goalForm: {
      nameError: "Enter a name",
      descriptionHelpDialogTitle: "Motivation",
      descriptionHelpDialog: "Your answer will be visible in the goal's screen. Use it to remember and mantain your motivation over time.",
      nameAlert: "Please enter a name for your goal",
      headerTitle: 'New goal',
      goalNameSubheading: 'What do you want to achieve?',
      nameTextInputLabel: 'Your Goal',
      goalMotivationSubheading: 'Why do you want to achieve this goal?',
      motivationTextInputLabel: 'Your Motivation (optional)',

    },

    goal: {
      motivation: 'Motivation',
      threeDotsMenu: {
        editGoal: 'Edit goal',
        deleteGoal: 'Delete goal',
      },
      deleteDialog: {
        title: 'Delete goal?',
        body: "This will delete all its activities. Can't be undone.",
      },
      infoContent: "This goal doesn't have any activities yet.\n\nAn activity is a recurring task that may have a time dedication requisite or not.\n\nFor each goal you should create the activities that you believe will make you reach the goal if done consistently.\n\nDesigning your activities this way will allow you to go to bed thinking: \"Today I've done all I had to\"."
    },

    goals: {
      headerTitle: 'Goals',
      infoContent: 'You have no goals right now.\n\nGoals are the base of Goaliath. They are the meaningful things you want to achieve, work on or dedicate time to.\n\nYou can create a new goal pressing the + icon on the top right.'
    },

    settings: {
      headerTitle: 'Settings',
      startHour: 'Start of the next day',
      startHourDescription: 'At this time the daily activities will reset' ,
      feedback: 'Send feedback',
      feedbackDescription: 'Send a message to the developers',
      share: 'Share',
      shareDescription: 'Introduce us to your friends',
      shareMessage: "Goaliath is a nice app to achieve your goals, try it!\n\nIt is not available from the play store yet, but you can download it here: (android)\nhttps://anonfiles.com/r4G5B4raue/Goaliath-1ac4cc84001d4f32980c40e9869c79d9-signed_apk \n\nIt is open source, you can check the code here: \nhttps://github.com/OliverLSanz/routines-app",
      export: 'Export',
      exportDescription: 'Save your data',
      import: 'Import',
      importDescription: 'Do you have any backup? Restore your data',
      language: 'Language',
      languageDescription: 'Only changes the app default texts',
      importDialog:{
        title: 'Import data?',
        content: "This can't be undone, your app data will be rewrite.",
        buttonAcept: 'Import',
        buttonCancel: 'Cancel'
      },
      languageDialog: {
        title: 'Select Language',
        english: 'English',
        spanish: 'Spanish'
      },
      languageLocale: 'English'
    },
    
    today: {
      headerTitle: 'Today',
      infoContent: 'There are no activities scheduled for today. You can go to the "Goals" section of the app to create new activities.',
      selectWeekliesTitle: 'Choose weekly activities for today',
      selectWeekliesDescription: 'Tap here to select',
      selectTasksTitle: 'Add one time tasks for today',
      selectTasksDescription: 'Tap here to add',
      oneTimeTaskDescription: 'One Time Task',
    },

    addTasks: {
      title: 'Add One Time Tasks',
      description: 'The tasks will be added to this day as "do once" activities.',
    },

    weeklyActivities: {
      headerTitle: 'Select weekly activities',
      daysLeft: '{{daysLeft}} days left',
      timeLeft: '{{timeExprValue}} {{timeExprLocaleUnit}} left',
      checkCompleted: 'Completed: {{weeklyTimes}} days done',
      timedCompleted: 'Completed: {{unit}} {{expression}} dedicated',
    },

    onboarding: {
      slideOne: {
        title: 'Welcome to Goaliath',
        text: 'Goaliath is a time and goal management tool that seeks to make you feel proud of your daily actions.',
      }, 
      slideTwo: {
        title: 'How it works',
        text: 'In Goaliath you describe your goals. Then you fill each of them with the actions you want to take about it. Goaliath will remember you of what you aim to do each day.',
      },
      slideThree: {
        title: 'Learn More',
        text: 'There is more to the Goaliath\'s time management method. We encourage you to learn more about it ',
        linkText: 'in our quick guide.',
        linkURL: 'https://goaliath-app.github.io/guide'
      },
      next: 'Next',
      begin: 'Begin'
    },

    activityHandler: {
      activityTypes: {
        doNSecondsEachWeek: {
          frequencyString: '{{expressionValue}} {{expressionUnit}} per week'
        },
        doNTimesEachWeek: {
          frequencyString: '{{repetitions}} repetitions each week'
        },
        doFixedDays: {
          everyDayFrequencyString: 'every day',
          frequencyString: 'on {{daysOfWeek}}',
        },
        doNDaysEachWeek: {
          frequencyString: '{{days}} days each week'
        }
      },
      dailyGoals: {
        // frequencyStrings of dailygoals get prepended to the 
        // frequencyStrings of their corresponding activityType
        doNSeconds: {
          frequencyString: '{{value}} {{unit}}'
        },
        doNTimes: {
          frequencyString: '{{repetitions}} times',
        },
        doOneTime: {
          frequencyString: 'Do',
        },
      }
    },

    app: {
      drawer: {
        today: 'Today',
        week: 'Week',
        goals: 'Goals',
        calendar: 'Calendar',
        stats: 'Stats',
        settings: 'Settings'
      }
    },

    units: {
      time: {
        hours: 'hours',
        minutes: 'minutes',
        seconds: 'seconds'
      },
      monthNames: {
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December'
      },
      monthNamesShort: {
        january: 'Jan',
        february: 'Feb',
        march: 'Mar',
        april: 'Apr',
        may: 'May',
        june: 'Jun',
        july: 'Jul',
        august: 'Aug',
        september: 'Sep',
        october: 'Oct',
        november: 'Nov',
        december: 'Dec'
      },
      dayNames: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      dayNamesShort2: {
        monday: 'Mo',
        tuesday: 'Tu',
        wednesday: 'We',
        thursday: 'Th',
        friday: 'Fr',
        saturday: 'Sa',
        sunday: 'Su'
      },
      dayNamesShort3: {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun'
      },
      dayNamesInitials: {
        monday: 'M',
        tuesday: 'T',
        wednesday: 'W',
        thursday: 'T',
        friday: 'F',
        saturday: 'S',
        sunday: 'S'
      }
    },
    
    drawer: {
      blog: 'Website',
      blogURL: 'https://goaliath-app.github.io/',
      appName: 'Goaliath'
    }
  }
}

export default en