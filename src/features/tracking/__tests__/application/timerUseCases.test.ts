import { startTimer } from '@/features/tracking/application/startTimer';
import { stopTimer } from '@/features/tracking/application/stopTimer';
import type { TimerProgress } from '@/features/tracking/domain/activityTypes/timer';
import {
  asActivityId,
  asDay,
  asScheduleId,
  buildDailyCounterSchedule,
  InMemoryActivityOccurrenceRepository,
  InMemoryActivityScheduleRepository,
  InMemoryRunningTimerRepository,
} from '../support/trackingFakes';

const activityId = asActivityId('activity-1');
const otherActivityId = asActivityId('activity-2');
const day = asDay('2024-06-15');

/** A clock the test advances by hand, so elapsed time is deterministic. */
const controllableClock = (start: string) => {
  let current = new Date(start);
  return {
    now: () => current,
    advanceSeconds: (seconds: number) => {
      current = new Date(current.getTime() + seconds * 1000);
    },
  };
};

// `dayGoal` is in seconds for a timer; the builder just carries the number.
const setup = (dayGoalSeconds: number, clockStart = '2024-06-15T07:00:00Z') => {
  const clock = controllableClock(clockStart);
  const runningTimers = new InMemoryRunningTimerRepository();
  const occurrences = new InMemoryActivityOccurrenceRepository();
  const deps = {
    runningTimers,
    occurrences,
    schedules: new InMemoryActivityScheduleRepository([
      buildDailyCounterSchedule(dayGoalSeconds),
      buildDailyCounterSchedule(dayGoalSeconds, {
        id: asScheduleId('schedule-2'),
        activityId: otherActivityId,
      }),
    ]),
    now: clock.now,
  };
  return {
    clock,
    runningTimers,
    occurrences,
    start: startTimer(deps),
    stop: stopTimer(deps),
  };
};

const secondsLogged = (progress: unknown) =>
  (progress as TimerProgress).intervals.reduce(
    (total, interval) =>
      total + (Date.parse(interval.end) - Date.parse(interval.start)) / 1000,
    0,
  );

describe('startTimer / stopTimer', () => {
  it('records the elapsed interval on stop and clears the live record', async () => {
    const { start, stop, clock, occurrences, runningTimers } = setup(1200);

    await start({ activityId, day });
    clock.advanceSeconds(600);
    await stop({ activityId });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(secondsLogged(saved?.progress)).toBe(600);
    expect(saved?.status).toBe('pending'); // 600s < 1200s goal
    expect(await runningTimers.findAll()).toHaveLength(0);
  });

  it('completes the day once the logged time reaches the goal', async () => {
    const { start, stop, clock, occurrences } = setup(1200);

    await start({ activityId, day });
    clock.advanceSeconds(1200);
    await stop({ activityId });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(saved?.status).toBe('done');
    expect(saved?.completedAt).not.toBeNull();
  });

  it('accumulates across several sessions on the same day', async () => {
    const { start, stop, clock, occurrences } = setup(1200);

    await start({ activityId, day });
    clock.advanceSeconds(500);
    await stop({ activityId });

    await start({ activityId, day });
    clock.advanceSeconds(700);
    await stop({ activityId });

    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(secondsLogged(saved?.progress)).toBe(1200);
    expect(saved?.status).toBe('done');
  });

  it('is a no-op when stopping something that is not running', async () => {
    const { stop, occurrences } = setup(1200);
    await stop({ activityId });
    expect(await occurrences.findByActivityAndDate(activityId, day)).toBeNull();
  });

  describe('single-timer rule (§11, enforced at write time)', () => {
    it('starting another timer stops the first and banks its time', async () => {
      const { start, clock, occurrences, runningTimers } = setup(1200);

      await start({ activityId, day });
      clock.advanceSeconds(300);
      await start({ activityId: otherActivityId, day }); // should stop the first

      const first = await occurrences.findByActivityAndDate(activityId, day);
      expect(secondsLogged(first?.progress)).toBe(300); // banked, not discarded

      const running = await runningTimers.findAll();
      expect(running).toHaveLength(1);
      expect(running[0].activityId).toBe(otherActivityId);
    });
  });

  it('credits the time to the day the session started, not the day it ended', async () => {
    const { start, stop, clock, occurrences } = setup(1200, '2024-06-15T23:50:00Z');

    await start({ activityId, day }); // started on the 15th
    clock.advanceSeconds(1200); // ends after midnight
    await stop({ activityId });

    expect(
      await occurrences.findByActivityAndDate(activityId, asDay('2024-06-16')),
    ).toBeNull();
    const saved = await occurrences.findByActivityAndDate(activityId, day);
    expect(secondsLogged(saved?.progress)).toBe(1200);
  });
});
