/**
 * Strings for the "new activity" form (`activityForm` namespace). Mirrors
 * `es/activityForm.ts` key for key — Spanish is the primary language, this is
 * its translation.
 */
export default {
  screen: {
    title: 'New activity',
    cancel: 'Cancel',
    submit: 'Create activity',
    submitting: 'Creating…',
    submitError: "Couldn't create the activity. Please try again.",
  },

  goal: {
    label: 'What for?',
    help: 'Every activity belongs to a goal. Start with the why.',
    modeExisting: 'A goal I already have',
    modeNew: 'Create a new goal',
    loading: 'Loading goals…',
    none: "You don't have any goals yet. Create one right here.",
    pausedHint: "This goal is paused: the activity won't show up in Today until you resume it.",
    newTitleLabel: "What's the goal called?",
    newTitlePlaceholder: 'Get fit',
    newMotivationLabel: 'Why does it matter to you? (optional)',
    newMotivationPlaceholder: 'So I have energy all day long',
  },

  title: {
    label: 'What are you going to do?',
    placeholder: 'Go for a run',
  },

  description: {
    label: 'Notes (optional)',
    placeholder: 'Details that help you remember what it involves',
  },

  activityType: {
    label: 'How is it measured?',
    help: 'This decides how you record each day.',
    checklist: 'Done or not done',
    checklistHelp: 'You tick the box and that’s it.',
    counter: 'By counting repetitions',
    counterHelp: 'You add up times over the day.',
    timer: 'With a timer',
    timerHelp: 'You measure the time you spend on it.',
  },

  recurrence: {
    label: 'How often?',
    daily: 'Every day',
    dailyHelp: "It's on every single day.",
    weekly: 'Specific days of the week',
    weeklyHelp: 'You choose which weekdays it falls on.',
    quota: 'A number of times per period',
    quotaHelp: 'You decide day by day; what counts is the period total.',
    weekdaysLabel: 'Which days?',
    periodLabel: 'Over which period?',
    periodWeek: 'Every week',
    periodMonth: 'Every month',
    periodYear: 'Every year',
  },

  weekdays: {
    short: {
      '1': 'M',
      '2': 'T',
      '3': 'W',
      '4': 'T',
      '5': 'F',
      '6': 'S',
      '7': 'S',
    },
    accessible: {
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
      '7': 'Sunday',
    },
  },

  duration: {
    hoursLabel: 'hours',
    minutesLabel: 'min',
    secondsLabel: 'sec',
    hoursShort_one: '{{count}} hour',
    hoursShort_other: '{{count}} hours',
    minutesShort_one: '{{count}} minute',
    minutesShort_other: '{{count}} minutes',
    secondsShort_one: '{{count}} second',
    secondsShort_other: '{{count}} seconds',
    partSeparator: ' ',
  },

  dayGoal: {
    label: 'Target for each day (optional)',
    help: "Leave it blank if just marking it done is enough.",
    placeholderCount: 'e.g. 30',
    unitCount: 'times a day',
  },

  periodGoal: {
    label: 'How much in each period?',
    aggregateCompletedDays: 'Completed days',
    aggregateMetricSum: 'Running total',
    aggregateHelpCompletedDays: 'How many days of the period you have to complete.',
    aggregateHelpMetricSum: 'The total across the period, no matter how many days.',
    amountLabel: 'Amount',
    unitDays: 'days',
    unitCount: 'times',
  },

  preview: {
    label: 'This is how it will read',
    line: '{{title}}, {{schedule}}',
    untitled: 'Your activity',
    partSeparator: ', ',
    listSeparator: ', ',
    listLast: ' and ',
    daily: 'every day',
    weekly: 'on {{days}}',
    weeklyNoDays: 'weekdays still to be chosen',
    quotaDays_one: '{{count}} day per {{period}}',
    quotaDays_other: '{{count}} days per {{period}}',
    quotaCount_one: '{{count}} time per {{period}}',
    quotaCount_other: '{{count}} times per {{period}}',
    quotaDuration: '{{duration}} per {{period}}',
    quotaNoAmount: 'an amount per {{period}} still to be decided',
    dayGoalCount_one: '{{count}} time a day',
    dayGoalCount_other: '{{count}} times a day',
    dayGoalDuration: '{{duration}} a day',
    period: {
      week: 'week',
      month: 'month',
      year: 'year',
    },
    weekdays: {
      '1': 'Mondays',
      '2': 'Tuesdays',
      '3': 'Wednesdays',
      '4': 'Thursdays',
      '5': 'Fridays',
      '6': 'Saturdays',
      '7': 'Sundays',
    },
  },

  errors: {
    goalRequired: 'Pick a goal or create a new one.',
    goalTitleRequired: 'The new goal needs a name.',
    titleRequired: 'Give the activity a name.',
    weekdaysRequired: 'Pick at least one day of the week.',
    dayGoalInvalid: 'Enter a whole number greater than zero.',
    periodAmountRequired: 'Say how much you want to do in each period.',
    periodAmountInvalid: 'Enter a whole number greater than zero.',
  },
} as const;
