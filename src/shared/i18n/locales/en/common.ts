/** Mirror of `es/common.ts` — same keys, same shape. */
export default {
  today: {
    title: 'Today',
    empty: 'Nothing scheduled for today.',
    newActivity: 'New activity',
    menu: 'Menu',
  },
  profile: {
    title: 'Profile',
    goalsLabel: 'Goals',
    goalsHint: 'Your goals and their activities',
  },
  goals: {
    title: 'Goals',
    empty: 'No goals yet. Create an activity to get started.',
    activitiesEmpty: 'No activities',
  },
  back: 'Back',
  status: {
    active: 'Active',
    paused: 'Paused',
    archived: 'Archived',
  },
  activityRow: {
    periodProgress: '{{current}} of {{target}} this period',
    addOne: 'Add one to {{title}}',
    timerStart: 'Start',
    timerStop: 'Stop',
    timerStartLabel: 'Start {{title}}',
    timerStopLabel: 'Stop {{title}}',
  },
} as const;
