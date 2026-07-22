/** Mirror of `es/common.ts` — same keys, same shape. */
export default {
  today: {
    title: 'Today',
    empty: 'Nothing scheduled for today.',
    newActivity: 'New activity',
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
