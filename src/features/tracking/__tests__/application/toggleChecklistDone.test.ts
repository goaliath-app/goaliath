import { toggleChecklistDone } from '@/features/tracking/application/toggleChecklistDone';
import {
  asActivityId,
  asDay,
  buildActivity,
  buildDailyChecklistSchedule,
  buildQuotaWeekSchedule,
  InMemoryActivityOccurrenceRepository,
  InMemoryActivityRepository,
  InMemoryActivityScheduleRepository,
} from '../support/trackingFakes';

const activityId = asActivityId('activity-1');
const day = asDay('2024-06-15');
const at = (iso: string) => () => new Date(iso);

const setup = (occurrences = new InMemoryActivityOccurrenceRepository()) => {
  const deps = {
    activities: new InMemoryActivityRepository([
      buildActivity({ activityType: 'checklist' }),
    ]),
    schedules: new InMemoryActivityScheduleRepository([
      buildDailyChecklistSchedule(),
    ]),
    occurrences,
    now: at('2024-06-15T09:00:00Z'),
  };
  return { toggle: toggleChecklistDone(deps), occurrences };
};

describe('toggleChecklistDone', () => {
  it('creates a done occurrence when none exists yet', async () => {
    const { toggle, occurrences } = setup();
    await toggle({ activityId, day });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(saved?.status).toBe('done');
    expect(saved?.completedAt).toEqual(new Date('2024-06-15T09:00:00Z'));
    expect(saved?.scheduleId).toBe('schedule-1'); // linked to the schedule in effect
    expect(saved?.origin).toBe('recurrence');
  });

  it('toggles an existing done occurrence back to pending', async () => {
    const { toggle, occurrences } = setup();
    await toggle({ activityId, day }); // -> done
    await toggle({ activityId, day }); // -> pending

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(saved?.status).toBe('pending');
    expect(saved?.completedAt).toBeNull();
  });

  it('records a quota day as an opt-in, not as a recurrence-generated day', async () => {
    const occurrences = new InMemoryActivityOccurrenceRepository();
    const toggle = toggleChecklistDone({
      activities: new InMemoryActivityRepository([
        buildActivity({ activityType: 'checklist' }),
      ]),
      schedules: new InMemoryActivityScheduleRepository([
        buildQuotaWeekSchedule(3),
      ]),
      occurrences,
      now: at('2024-06-15T09:00:00Z'),
    });

    await toggle({ activityId, day });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(saved?.origin).toBe('quotaOptIn');
    expect(saved?.status).toBe('done');
  });

  it('toggles a pending occurrence to done', async () => {
    const { toggle, occurrences } = setup();
    await toggle({ activityId, day }); // done
    await toggle({ activityId, day }); // pending
    await toggle({ activityId, day }); // done again

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(saved?.status).toBe('done');
  });
});
