import { logCounterRepetition } from '@/features/tracking/application/logCounterRepetition';
import type { CounterProgress } from '@/features/tracking/domain/activityTypes/counter';
import {
  asActivityId,
  asDay,
  buildActivity,
  buildDailyCounterSchedule,
  InMemoryActivityOccurrenceRepository,
  InMemoryActivityRepository,
  InMemoryActivityScheduleRepository,
} from '../support/trackingFakes';

const counterActivities = () =>
  new InMemoryActivityRepository([buildActivity({ activityType: 'counter' })]);

const activityId = asActivityId('activity-1');
const day = asDay('2024-06-15');
const at = (iso: string) => () => new Date(iso);

const setup = (dayGoal: number, now = at('2024-06-15T09:00:00Z')) => {
  const occurrences = new InMemoryActivityOccurrenceRepository();
  const log = logCounterRepetition({
    activities: counterActivities(),
    schedules: new InMemoryActivityScheduleRepository([
      buildDailyCounterSchedule(dayGoal),
    ]),
    occurrences,
    now,
  });
  return { log, occurrences };
};

const repsOf = (progress: unknown) =>
  (progress as CounterProgress).repetitions.length;

describe('logCounterRepetition', () => {
  it('creates a pending occurrence with one rep when below the goal', async () => {
    const { log, occurrences } = setup(3);
    await log({ activityId, day });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(repsOf(saved?.progress)).toBe(1);
    expect(saved?.status).toBe('pending');
    expect(saved?.completedAt).toBeNull();
  });

  it('flips to done once the rep count reaches the dayGoal', async () => {
    const { log, occurrences } = setup(2);
    await log({ activityId, day });
    await log({ activityId, day });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(repsOf(saved?.progress)).toBe(2);
    expect(saved?.status).toBe('done');
    expect(saved?.completedAt).toEqual(new Date('2024-06-15T09:00:00Z'));
  });

  it('keeps the original completion instant on further reps past the goal', async () => {
    const occurrences = new InMemoryActivityOccurrenceRepository();
    const schedules = new InMemoryActivityScheduleRepository([
      buildDailyCounterSchedule(1),
    ]);
    const activities = counterActivities();
    const firstLog = logCounterRepetition({
      activities,
      schedules,
      occurrences,
      now: at('2024-06-15T09:00:00Z'),
    });
    const laterLog = logCounterRepetition({
      activities,
      schedules,
      occurrences,
      now: at('2024-06-15T18:00:00Z'),
    });

    await firstLog({ activityId, day }); // completes at 09:00
    await laterLog({ activityId, day }); // extra rep at 18:00

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(repsOf(saved?.progress)).toBe(2);
    expect(saved?.status).toBe('done');
    expect(saved?.completedAt).toEqual(new Date('2024-06-15T09:00:00Z')); // not bumped
  });
});
