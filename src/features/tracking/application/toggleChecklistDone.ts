import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityId } from '../domain/Activity';
import {
  occurrenceOriginFor,
  type ActivityOccurrence,
} from '../domain/ActivityOccurrence';
import type { ActivityOccurrenceRepository } from '../domain/ports/ActivityOccurrenceRepository';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import type { ActivityScheduleRepository } from '../domain/ports/ActivityScheduleRepository';
import { scheduleOn } from '../domain/ActivitySchedule';
import { emptyChecklistProgress } from '../domain/activityTypes/checklist';
import { assertActivityType } from './assertActivityType';

export interface ToggleChecklistDoneDeps {
  activities: ActivityRepository;
  schedules: ActivityScheduleRepository;
  occurrences: ActivityOccurrenceRepository;
  now: () => Date;
}

/**
 * Write use case for a **checklist** activity: flip one day between `done` and
 * `pending`. Editing a day's outcome is allowed even in the past (domain-model
 * §9 — trusted self-reporting), and it only ever touches the single
 * `(activityId, date)` occurrence.
 */
export function toggleChecklistDone(deps: ToggleChecklistDoneDeps) {
  return async ({
    activityId,
    day,
  }: {
    activityId: ActivityId;
    day: CalendarDay;
  }): Promise<void> => {
    await assertActivityType(deps.activities, activityId, 'checklist');

    const existing = await deps.occurrences.findByActivityAndDate(activityId, day);

    if (existing !== null && existing.status === 'done') {
      // Toggle off: back to pending, clearing the completion instant.
      await deps.occurrences.save({
        ...existing,
        status: 'pending',
        completedAt: null,
      });
      return;
    }

    // Toggle on: mark done, creating the occurrence if it didn't exist yet.
    const timeline = await deps.schedules.findByActivityId(activityId);
    const schedule = scheduleOn(timeline, day);
    const occurrence: ActivityOccurrence = {
      activityId,
      date: day,
      scheduleId: schedule?.id ?? null,
      status: 'done',
      completedAt: deps.now(),
      notes: existing?.notes ?? null,
      origin: occurrenceOriginFor(schedule, day),
      progress: existing?.progress ?? emptyChecklistProgress(),
    };
    await deps.occurrences.save(occurrence);
  };
}
