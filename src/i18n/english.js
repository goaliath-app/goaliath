const en = {
  translation: {
    activityListItem: {
      description: {
        todayTimeGoal: 'Goal: {{expressionValue}} {{expressionUnit}}',
        weekTimeGoal: 'This week: {{weeklyTimeNumber}} of {{expressionValue}} {{expressionUnit}} done'
      },
      longPressMenu: {
        edit: 'Edit activity',
        viewGoal: 'View goal'
      },
    },

    dayContent: {
      futureWarningTitle: 'This is a future day',
      futureWarningSubtitle: 'Tomorrow is tomorrow.\nFuture cares have future cures,\nAnd we must mind today.\n — Sofocles',
      emptyPastWarningTitle: 'This day was empty',
      emptyPastWarningSubtitle: "You didn't have any activity scheduled for today.",
    },

    dateWheelPicker: {
      dialog: {
        cancel: 'Cancel',
        acept: 'OK'
      }
    },

    archivedGoalsScreen: {
      title: 'Archived goals',
      empty: 'There are no archived goals',
      longPressMenu: {
        restore: "Restore goal"
      }
    },

    archivedActivitiesScreen: {
      title: 'Archive: {{goalName}}',
      empty: 'This goal has no archived activities',
      longPressMenu: {
        restore: "Restore activity"
      }
    },

    deleteDialog: {
      delete: 'Archive',
      cancel: 'Cancel'
    },

    helpIcon: {
      closeButton: 'OK'
    },

    loadingStats: 'Loading Stats...',
    
    activityDetail: {
      detailsTabLabel: 'Details',
      statsTabLabel: 'Stats',
      threeDotsMenu: {
        editActivity: 'Edit activity',
        deleteActivity: 'Archive activity',
        changeGoal: "Move to other goal",
      },
      helpIconText: 'These are the details of a past activity. Even if you have modified the activity goal or frequency, here you will see them as they were this specific day.',
      deleteDialog: {
        title: 'Archive activity?',
        body: "You can restore it later from the top right menu of its goal."
      },
      changeGoalDialogTitle: "Select target goal",
      changeGoalDialogCancel: "Cancel",
      changeGoalDialogBody: 'Current goal: {{currentGoal}}',
      changeGoalSnackbar: "Activity moved to {{goalName}} goal",
      archivedWarning: "This activity is archived",
      restoreButton: "Restore activity",
      todayStatusCard: {
        dueToday: 'This activity is scheduled for today',
        dueThisWeek: 'You can choose to do this activity today from the Today List',
        notDue: 'You don\'t have to do this activity today',
        chosenToday: 'You have chosen to do this activity today',
        goToToday: "Go to Today List",
      }
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
        filterByGoal: 'Filter by goal',
        allGoals: 'All goals'
      },
      weekStats: {
        title: 'This week',
        hoursDedicated: ' total hours dedicated',
        daysCompleted: ' activities completed'
      }
    },

    barchart: {
      time: 'Time',
      repetitions: 'Repetitions',
      completed: 'Completed',
      month: 'Month',
      week: 'Week',
      date: 'Date',
      minutes: 'Minutes',
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
      descriptionInputLabel: 'Description (optional)',
      weeklyDaysLabel: 'Days each week',
      weekdaysTitle: 'Weekdays',
      errors: {
        noName: 'A name is required',
        noDaysSelected: 'Select at least one day',
        noTime: 'Please enter a time',
        noFrequency: 'Please select a frequency',
        noRepetitions: 'Please enter repetitions',
      },
      frequencyTitle: 'Frequency',
      frequencyLabel: 'Select frequency',
      switch: {
        multipleTimes: 'Repetitions Goal',
        repetitionsGoal: 'Repetitions Goal',
        timeGoal: 'Time Goal'
      },
      dailyRepetitions: 'Daily Repetitions',
      weeklyRepetitions: 'Weekly Repetitions',
      dialog: {
        title: 'Select your frequency',
        dailyTitle: 'Daily Activity',
        dailyDescription: 'Do on fixed days of the week',
        freeTitle: 'Free Activity',
        freeDescription: 'Do N days each week. Choose which on the fly.',
        weeklyTitle: 'Weekly Total',
        weeklyDescription: 'Reach a target time or repetitions total each week.'
      },
      snackbar: {
        activityCreated: 'Activity created',
        activityUpdated: 'Activity updated',
      },
    },

    aboutUs:{
      title: 'Goaliath team',
      description: "We are Jimena and Óliver, the creators of Goaliath.\n\nIn 2021 we were in a period of self-learning in different subjects. But we couldn't do everything we set out to do and our progress was slow.\n\nIn response we came up with Goaliath. A simple but powerful tool that helped us achieve our goals without getting lost in the intricate path. And now we've published it so it can help you too.\n\nIf you have any suggestions or see something wrong, you can let us know from the settings.\n\n",
      jimena: 'Jimena',
      oliver: 'Óliver',
      goaliath: 'Source code',
      jimenaLink: "https://www.linkedin.com/in/jimena-andrea/",
      oliverLink: "https://twitter.com/oliverlsanz",
      goaliathLink: "https://github.com/goaliath-app/goaliath"  
    },
    
    calendar: {
      headerTitle: 'Calendar',
      //stats: '{{completedActivities}} tasks done, {{timeDedicatedValue}} {{timeDedicatedUnit}} dedicated\n{{undoneActivities}} task undone, {{timeLeftValue}} {{timeLeftUnit}} left',
      dayView: {
        header: '{{month}} {{day}}, {{year}}'
      },
      weekView: {
        header: '{{weekStartDate}} - {{weekEndDate}} {{year}}',
        sortByGoal: 'Sort by goal',
        sortByActivity: 'Sort by activity'
      },
    },

    goalForm: {
      nameError: "Enter a name",
      descriptionHelpDialogTitle: "Motivation",
      descriptionHelpDialog: "Your answer will be visible in the goal's details. Use it to remember and mantain your motivation over time.",
      nameAlert: "Please enter a name for your goal",
      headerTitle: 'New goal',
      goalNameSubheading: 'What do you want to achieve?',
      nameTextInputLabel: 'Goal Name',
      goalMotivationSubheading: 'Why do you want to achieve this goal?',
      motivationTextInputLabel: 'Your Motivation (optional)',

    },

    goal: {
      motivation: 'Motivation',
      threeDotsMenu: {
        editGoal: 'Edit goal',
        deleteGoal: 'Archive goal',
        viewArchivedActivities: 'View archived activities',
      },
      deleteDialog: {
        title: 'Archive goal?',
        body: "You can still view and restore it from the menu of the Goals screen.",
      },
      infoTitle: "This goal is empty",
      infoContent: "You can add an activity by pressing the + icon on the top right.",
      archivedWarning: "This goal is archived",
      restoreButton: "RESTORE GOAL",
      longPressMenu: {
        edit: "Edit",
        archive: "Archive",
        move: "Move to another goal",
      }
    },

    goals: {
      headerTitle: 'Goals',
      goalDescription: '{{activitiesNumber}} active activities',
      infoTitle: "There are no goals",
      infoContent: 'Create a new goal by pressing the + icon on the top right.',
      menu: {
        viewArchived: "View archived goals",
      },
      longPressMenu: {
        add: "Add new activity",
        edit: "Edit",
        archive: "Archive",
        viewArchivedActivities: "View archived activities",
      }
    },

    settings: {
      headerTitle: 'Settings',
      startHour: 'Start of the next day',
      todaySnackbar: 'Today will end at {{startHour}} tomorrow.',
      yesterdaySnackbar: 'You have returned to yesterday. It ends at {{startHour}} today.',
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
        content: "This can't be undone, your app data will be rewriten.",
        buttonAcept: 'Import',
        buttonCancel: 'Cancel'
      },
      languageDialog: {
        title: 'Select Language',
        english: 'English',
        spanish: 'Spanish'
      },
      languageLocale: 'English',
      dailyNotification: 'Daily notification',
      dailyNotificationDescription: 'Receive a reminder to use Goaliath',
      dailyNotificationHour: 'Daily notification hour',
      aboutUs: 'Meet the team',
      aboutGoaliath: {
        title: 'Learn about the Goaliath method',
        description: "You'll be redirected to the web",
        blogURL: 'https://goaliath-app.github.io/',
      },
    },
    
    today: {
      headerTitle: 'Today',
      infoContent: 'There are no activities scheduled for today. You can go to the "Goals" section of the app to create new activities.',
      selectWeekliesTitle: 'Choose weekly activities for today',
      selectWeekliesDescription: '{{weekActivitiesNumber}} activities, {{weekProgress}}% completed this week',
      selectTasksTitle: 'Add one time tasks for today',
      selectTasksDescription: 'Tap here to add',
      oneTimeTaskDescription: 'One time task',
      dayChangeDialogTitle: "A new day begins!",
      dayChangeDialogBody: "The day has changed to {{date}} while the app was open.\n\nIf you need to be able to do a day's activities until a later hour, you can change the Day Start Hour in the settings.",
      dayChangeDialogConfirmLabel: "Go to new day",
    },

    addTasks: {
      title: 'Add One Time Tasks',
      placeholder: 'Task name',
      description: 'The tasks will be added to this day as "do once" activities.',
    },

    taskList: {
      longPressMenu: {
        paragraph: 'This is a one time task',
        deleteTitle: 'Delete Task',
        deleteDescription: "This action can't be undone.",
        deleteSnackbar: 'Task deleted',
      }
    },

    weeklyActivities: {
      headerTitle: 'Select weekly activities',
      daysLeft: '{{daysLeft}} days left',
      daysLeftSingular: '{{daysLeft}} day left',
      timeLeft: '{{timeExprValue}} {{timeExprLocaleUnit}} left',
      checkCompleted: 'Completed: {{weeklyTimes}} days done',
      timedCompleted: 'Completed: {{unit}} {{expression}} dedicated',
    },

    activityHandler: {
      activityTypes: {
        doNSecondsEachWeek: {
          frequencyString: '{{expressionValue}} {{expressionUnit}} per week',
          completed: 'Completed',
          secondsLeft: '{{timeExprValue}} {{timeExprLocaleUnit}} left'
        },
        doNTimesEachWeek: {
          frequencyString: '{{repetitions}} repetitions each week',
          listItemDescription: '{{todayReps}} done today - {{totalReps}} of {{weeklyRepsGoal}} done this week',
          weeklyCompletedDescription: '{{repetitionsGoal}} repetitions goal met this week',
          timesLeft: '{{repetitionsLeft}} repetitions left',
          completed: 'Completed'
        },
        doFixedDays: {
          everyDayFrequencyString: 'every day',
          frequencyString: 'on {{daysOfWeek}}',
        },
        doNDaysEachWeek: {
          frequencyString: '{{days}} days each week',
          frequencyStringSingular: '{{days}} day each week',
          completed: 'Completed',
          daysLeft: '{{daysLeft}} days left',
          daysLeftSingular: '{{daysLeft}} day left',
        }
      },
      dailyGoals: {
        // frequencyStrings of dailygoals get prepended to the 
        // frequencyStrings of their corresponding activityType
        doNSeconds: {
          frequencyString: '{{value}} {{unit}}',
          listItemDescription: '{{currentTimeValue}} of {{timeGoalValue}} {{unit}} done'
        },
        doNTimes: {
          frequencyString: '{{repetitions}} times',
          listItemDescription: '{{todayReps}} of {{repsGoal}} repetitions done',
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
        seconds: 'seconds',
        hour: 'hour',
        minute: 'minute',
        second: 'second',
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
    },

    notifications: {
      reminder: {
        title: 'Let\'s work on your goals',
        body: 'Tap to open Goaliath',
      },
      timer: {
        title: 'You are working on: ',
        body: '{{activityName}}'
      },
      complete: {
        title: 'You have completed the activity: ',
        body: '{{activityName}}'
      }
    },

    onboarding: {
      1: 'Hi, I’m Goaliath!',
      2: 'I’ve been created to help you achieve your goals through your everyday actions.',
      3: 'Cool, uh? Let’s begin!',
      skip: 'Skip tutorial'
    },

    tutorial: {
      sampleActivity: {
        name: 'Work on {{goalName}}',
        description: 'Dedicate 10 focused, uninterrupted minutes to your goal. Think of ways you can work on it, investigate and start taking action. \n\n If you do this for several days, you will start to find your own way. \n\n This is a good base activity if you don\'t know how to start. Feel free to replace this when you feel ready.',
      },
      TodayScreenIntroduction: {
        // "remind you OF the actions" or "remind you the actions"
        1: 'Welcome! Here I will remind you of the actions you need to take to advance towards your goals.',
        2: 'Go to the Goals list to create your first goal.'
      },
      ReturnToGoalsScreen: "Return to the Goals section to continue.",
      GoalsScreenIntroduction: {
        1: 'Goals are those meaningful things you feel good dedicating time to.',
        2: 'And also the ones that make you feel bad when you neglect them.',
        3: 'Things like "Fitness", "Learn Spanish" or "Be with my family" are good examples of goals.'
      },
      FirstGoalCreation: {
        1: 'Let’s create your first goal using the + icon.',
        2: 'Your motivation may seem obvious to write down, but on hard days it’s a really good thing to read.'
      },
      AfterFirstGoalCreation: {
        1: 'Behold! Your first goal is here! Tap on it to view it’s details.'
      },
      GoalScreenIntroduction: {
        2: 'Here you’ll define the actions you will take to advance towards the goal.',
        3: 'Those actions are recurring activities you’ll do often.',
        4: 'For a "Learn Spanish" goal, example activities could be "Rewiew vocabulary each day" and "Have 1 hour of conversation per week".',
        5: 'This way you commit to consistently dedicate time to achieve your goal.',
        6: 'That is the only thing needed for progress.',
        7: 'Now, I’m going to create an easy activity for you.',
        8: 'Ta-daa!!',
        9: 'You can add your own activities using the + icon.'
      },
      ActivitiesInTodayScreen: {
        0: 'When you are ready, return to the today section.',
        1: 'Return to the today section.',
        2: 'Here you can see what you want to do today, according to your plan.',
        3: 'Complete the activities listed here and you will be closer to your goals.',
        4: 'And even if you only do some of them, you will be still going forward.'
      },
      ChooseWeekliesIntroduction: {
        1: 'If you create activities that are not necessarily done a fixed day of the week, you can select them here so they appear in today’s list.',
        2: "This item will dissapear if you don't have any of those activities.",
      },
      OneTimeTasksIntroduction: {
        1: 'You can also add one time tasks as reminders that will only appear today.'
      },
      TutorialEnding: {
        1: 'Now I’ll let you explore the rest of the app!',
        2: 'I recommend you to go to the goals section and create all of your important goals.',
        3: 'Then fill each of them with the activities that will make you progress.',
        // "which are those activities" OR "which those activities are" ?
        4: 'If you don’t know which are those activities, just try to dedicate 10 daily minutes to your goal.',
        5: 'Even if you don’t know what to do at that time, taking action will help you find out.',
        6: 'I’ll be here to give you some tips along the way. Good luck!'
      }
    }
  }
}

export default en