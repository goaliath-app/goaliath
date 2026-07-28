import type { ActivityId } from '../domain/Activity';
import {
  occurrenceOriginFor,
  type ActivityOccurrence,
} from '../domain/ActivityOccurrence';
import { scheduleOn } from '../domain/ActivitySchedule';
import {
  appendInterval,
  isTimerComplete,
  type TimerProgress,
} from '../domain/activityTypes/timer';
import type { ActivityOccurrenceRepository } from '../domain/ports/ActivityOccurrenceRepository';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import type { ActivityScheduleRepository } from '../domain/ports/ActivityScheduleRepository';
import type { RunningTimerRepository } from '../domain/ports/RunningTimerRepository';
import { assertActivityType } from './assertActivityType';

export interface StopTimerDeps {
  activities: ActivityRepository;
  runningTimers: RunningTimerRepository;
  occurrences: ActivityOccurrenceRepository;
  schedules: ActivityScheduleRepository;
  now: () => Date;
}

/**
 * Stop a running timer (domain-model §11): close the interval, append it to the
 * occurrence's progress and drop the live record. A no-op if nothing is running
 * for that activity.
 *
 * The elapsed time is credited to the timer's **own** `occurrenceDate**, not to
 * "today" — so a session started before the day cutoff still lands on the day it
 * began, even if it ends after the boundary.
 */
export function stopTimer(deps: StopTimerDeps) {
  return async ({ activityId }: { activityId: ActivityId }): Promise<void> => {
    const running = await deps.runningTimers.findByActivityId(activityId);
    if (running === null) return;

    await assertActivityType(deps.activities, activityId, 'timer');

    const endedAt = deps.now();
    const day = running.occurrenceDate;

    const existing = await deps.occurrences.findByActivityAndDate(activityId, day);
    // Untagged-progress boundary (§5): safe — `assertActivityType` above refuses
    // any non-timer activity before we read progress as a timer's.
    const priorProgress = existing?.progress as Partial<TimerProgress> | undefined;
    const nextProgress = appendInterval(
      { intervals: priorProgress?.intervals ?? [] },
      running.startedAt,
      endedAt,
    );

    const timeline = await deps.schedules.findByActivityId(activityId);
    const schedule = scheduleOn(timeline, day);
    const complete = isTimerComplete(nextProgress, schedule?.dayGoal ?? null);

    const occurrence: ActivityOccurrence = {
      activityId,
      date: day,
      scheduleId: schedule?.id ?? null,
      status: complete ? 'done' : 'pending',
      // Keep the original completion instant once reached; don't bump it.
      completedAt: complete ? (existing?.completedAt ?? endedAt) : null,
      notes: existing?.notes ?? null,
      origin: occurrenceOriginFor(schedule, day),
      progress: nextProgress,
    };

    await deps.occurrences.save(occurrence);
    await deps.runningTimers.remove(activityId);
  };
}
