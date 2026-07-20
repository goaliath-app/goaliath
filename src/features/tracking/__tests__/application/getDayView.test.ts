import { getDayView } from '@/features/tracking/application/getDayView';
import {
  asDay,
  buildActivity,
  buildDailyChecklistSchedule,
  buildGoal,
  emptyChecklistProgress,
  InMemoryActivityOccurrenceRepository,
  InMemoryActivityRepository,
  InMemoryActivityScheduleRepository,
  InMemoryGoalRepository,
  asActivityId,
  asScheduleId,
} from '../support/trackingFakes';

const at = (iso: string) => () => new Date(iso);

const deps = (over: {
  occurrences?: InMemoryActivityOccurrenceRepository;
  now?: () => Date;
} = {}) => ({
  activities: new InMemoryActivityRepository([buildActivity()]),
  goals: new InMemoryGoalRepository([buildGoal()]),
  schedules: new InMemoryActivityScheduleRepository([
    buildDailyChecklistSchedule(),
  ]),
  occurrences: over.occurrences ?? new InMemoryActivityOccurrenceRepository(),
  now: over.now ?? at('2024-06-15T12:00:00Z'), // "today" = 2024-06-15 at dayStartHour 0
  dayStartHour: 0,
});

describe('getDayView', () => {
  it('projects a due daily checklist as pending on today', async () => {
    const items = await getDayView(deps())(asDay('2024-06-15'));
    expect(items).toHaveLength(1);
    expect(items[0].displayStatus).toBe('pending');
    expect(items[0].activity.title).toBe('Meditate');
  });

  it('projects a past due day with no record as missed', async () => {
    const items = await getDayView(deps())(asDay('2024-06-10'));
    expect(items[0].displayStatus).toBe('missed');
  });

  it('reflects a persisted done occurrence as done', async () => {
    const occurrences = new InMemoryActivityOccurrenceRepository([
      {
        activityId: asActivityId('activity-1'),
        scheduleId: asScheduleId('schedule-1'),
        date: asDay('2024-06-10'),
        status: 'done',
        completedAt: new Date('2024-06-10T09:00:00Z'),
        notes: null,
        origin: 'recurrence',
        progress: emptyChecklistProgress(),
      },
    ]);
    const items = await getDayView(deps({ occurrences }))(asDay('2024-06-10'));
    expect(items[0].displayStatus).toBe('done');
  });
});
