import { getDayView } from '@/features/tracking/application/getDayView';
import type { ActivityOccurrence } from '@/features/tracking/domain/ActivityOccurrence';
import {
  asDay,
  buildActivity,
  buildDailyChecklistSchedule,
  buildGoal,
  buildQuotaWeekSchedule,
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
  weekStart: 1, // ISO Monday
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

describe('getDayView — quota period progress', () => {
  const doneOn = (date: string): ActivityOccurrence => ({
    activityId: asActivityId('activity-1'),
    scheduleId: asScheduleId('schedule-1'),
    date: asDay(date),
    status: 'done',
    completedAt: new Date(`${date}T09:00:00Z`),
    notes: null,
    origin: 'quotaOptIn',
    progress: emptyChecklistProgress(),
  });

  // "Today" is Sat 2024-06-15; its Monday-start week runs 10th → 16th.
  const quotaDeps = (occurrences: InMemoryActivityOccurrenceRepository) => ({
    activities: new InMemoryActivityRepository([buildActivity()]),
    goals: new InMemoryGoalRepository([buildGoal()]),
    schedules: new InMemoryActivityScheduleRepository([buildQuotaWeekSchedule(3)]),
    occurrences,
    now: at('2024-06-15T12:00:00Z'),
    dayStartHour: 0,
    weekStart: 1,
  });

  it('counts the completed days inside the current week', async () => {
    const occurrences = new InMemoryActivityOccurrenceRepository([
      doneOn('2024-06-10'), // Mon, in the week
      doneOn('2024-06-12'), // Wed, in the week
    ]);
    const [item] = await getDayView(quotaDeps(occurrences))(asDay('2024-06-15'));
    expect(item.periodProgress).toEqual({ completed: 2, target: 3 });
  });

  it('ignores days outside the period', async () => {
    const occurrences = new InMemoryActivityOccurrenceRepository([
      doneOn('2024-06-09'), // Sunday *before* the Monday-start week
      doneOn('2024-06-12'), // inside
      doneOn('2024-06-17'), // Monday of the following week
    ]);
    const [item] = await getDayView(quotaDeps(occurrences))(asDay('2024-06-15'));
    expect(item.periodProgress).toEqual({ completed: 1, target: 3 });
  });

  it('leaves periodProgress null for a fixed recurrence', async () => {
    const items = await getDayView(deps())(asDay('2024-06-15'));
    expect(items[0].periodProgress).toBeNull();
  });
});
