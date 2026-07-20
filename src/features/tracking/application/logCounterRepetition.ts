import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityId } from '../domain/Activity';
import type { ActivityOccurrence } from '../domain/ActivityOccurrence';
import type { ActivityOccurrenceRepository } from '../domain/ports/ActivityOccurrenceRepository';
import type { ActivityScheduleRepository } from '../domain/ports/ActivityScheduleRepository';
import { scheduleOn } from '../domain/ActivitySchedule';
import {
  addRepetition,
  isCounterComplete,
  type CounterProgress,
} from '../domain/activityTypes/counter';

export interface LogCounterRepetitionDeps {
  schedules: ActivityScheduleRepository;
  occurrences: ActivityOccurrenceRepository;
  now: () => Date;
}

/**
 * Write use case for a **counter** activity: log one repetition on a day and
 * recompute whether the day is now complete against the schedule's `dayGoal`.
 * Unlike the checklist toggle, "done" here is **derived from progress** — the
 * status is set to `done` the moment the rep count reaches the goal (§3, §5).
 *
 * The `progress as CounterProgress` read is the untagged-progress boundary
 * (occurrences carry no type discriminant, §5): safe because the caller only
 * routes counter activities here. It defends against a missing field so a
 * mis-typed occurrence can't crash the spread.
 */
export function logCounterRepetition(deps: LogCounterRepetitionDeps) {
  return async ({
    activityId,
    day,
  }: {
    activityId: ActivityId;
    day: CalendarDay;
  }): Promise<void> => {
    const existing = await deps.occurrences.findByActivityAndDate(activityId, day);
    const priorProgress = existing?.progress as Partial<CounterProgress> | undefined;
    const currentProgress: CounterProgress = {
      repetitions: priorProgress?.repetitions ?? [],
    };

    const nextProgress = addRepetition(currentProgress, deps.now());

    const timeline = await deps.schedules.findByActivityId(activityId);
    const schedule = scheduleOn(timeline, day);
    const complete = isCounterComplete(nextProgress, schedule?.dayGoal ?? null);

    const occurrence: ActivityOccurrence = {
      activityId,
      date: day,
      scheduleId: schedule?.id ?? null,
      status: complete ? 'done' : 'pending',
      // Keep the original completion instant once reached; don't bump it on later reps.
      completedAt: complete ? (existing?.completedAt ?? deps.now()) : null,
      notes: existing?.notes ?? null,
      origin: schedule !== null ? 'recurrence' : 'manual',
      progress: nextProgress,
    };
    await deps.occurrences.save(occurrence);
  };
}
