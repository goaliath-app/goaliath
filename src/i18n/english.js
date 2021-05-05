const en = {
  translation: {
    activityListItem: {
      description: {
        todayTimeGoal: 'Goal: {{expressionValue}} {{expressionUnit}}',
        weekCheck: 'Done {{totalTimes}} of {{timesPerWeek}} days',
        weekTimeGoal: 'Done {{weeklyTimeNumber}} of {{expressionValue}} {{expressionUnit}}'
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
        title: 'Stats',
        hoursDedicated: ' total hours dedicated',
        daysCompleted: ' days completed'
      },
      weekStats: {
        title: 'This week',
        hoursDedicated: ' total hours dedicated',
        daysCompleted: ' days completed'

      }
    },

    todayPannel: {
      title: 'Today',
      stopButton: 'Stop Timer',
      startButton: 'Start Timer',
      checkboxLabel: 'Done',
    },

    activityForm: {
      headerTitle: 'New activity',
      nameInputLabel: 'Activity\'s name',
      repeatSwitchBar: {
        title: 'Repeat',
        daily: 'daily',
        select: 'select days',
        weekly: 'weekly'
      },
      repeatInfoDialog: {
        mainTitle: 'Repeat modes',
        dailyTitle: 'Daily',
        dailyText: 'You aim to do the activity every day.',
        selectTitle: 'Select',
        selectText: 'Like daily, but at specific week days.',
        weeklyTitle: 'Weekly',
        weeklyText: 'You can do it any day of the week. It will appear in the "Week" tab.',
      },
      objectiveSwitchLabel: 'Time objective',
      weeklyDaysLabel: 'Days each week',
      errors: {
        noName: 'A name is required',
        noDaysSelected: 'At least select one day',
        noTime: 'Please enter a time'
      },
    },
    
    calendar: {
      headerTitle: 'Calendar',
      openDayButton: 'Open day',
      stats: '{{completedActivities}} tasks done, {{timeDedicatedValue}} {{timeDedicatedUnit}} dedicated\n{{undoneActivities}} task undone, {{timeLeftValue}} {{timeLeftUnit}} left'
    },

    dayInCalendar: {
      dailyActivities: 'Daily activities',
      weeklyActivities: 'Weekly Activities'
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
      infoContent: '"You have no goals right now.\n\nGoals are the base of Goaliath. They are the meaningful things you want to achieve, work on or dedicate time to.\n\nYou can create a new goal pressing the + icon on the top right."'
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
    },

    week: {
      headerTitle: 'This Week',
      infoContent: 'There are no activities scheduled for this week. You can go to the "Goals" section of the app to create new activities.',
    },

    onboarding: {
      slideOne: {
        title: 'Welcome to Goaliath',
        text: 'Goaliath is a time and goal management tool that seeks to make you feel proud of your daily actions.',
      },
      slideTwo: {
        title: 'Decide less, remember more',
        text: 'Goaliath remembers you of the actions you need to take in order to live according to your values. This way you can make the most out of each decision you make.',
      },
      slideThree: {
        title: 'Our method',
        text: 'Goaliath is designed to support a very specific time management method. We encourage you to learn more about it ',
        linkText: 'in our website'
      },
      next: 'Next',
      begin: 'Begin'
    },

    util: {
      frequency: {
        weekly: {
          check: '{{activityTimesPerWeek}} days per week.',
          time: '{{expressionValue}} {{expressionUnit}} per week'
        },
        select: {
          check: 'Do on {{days}}',
          time: '{{expressionValue}} {{expressionUnit}} on {{days}}'
        },
        daily: {
          check: 'Every day',
          time: '{{expressionValue}} {{expressionUnit}} every day'
        },
        error: 'ERROR'
      },
    },

    app: {
      drawer: {
        today: 'Today',
        week: 'Week',
        goals: 'Goals',
        calendar: 'Calendar',
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
      appName: 'Goaliath'
    }
  }
}

export default en