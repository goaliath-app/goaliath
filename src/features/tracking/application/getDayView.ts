import { getCalendarDay, type CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityOccurrenceRepository } from '../domain/ports/ActivityOccurrenceRepository';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import type { ActivityScheduleRepository } from '../domain/ports/ActivityScheduleRepository';
import type { GoalRepository } from '../domain/ports/GoalRepository';
import {
  buildDay,
  type ActivityDayInput,
  type DayItem,
} from '../domain/projection';

export interface GetDayViewDeps {
  activities: ActivityRepository;
  goals: GoalRepository;
  schedules: ActivityScheduleRepository;
  occurrences: ActivityOccurrenceRepository;
  now: () => Date; // injected clock — keeps the use case testable/deterministic
  dayStartHour: number; // from settings (a default for now); the projection stays pure
}

/**
 * Read use case (domain-model §8): gather what `buildDay` needs and return the
 * projected view of `day`. It only **fetches and delegates** — every rule
 * (cascade, due-day, status resolution) lives in the pure projection, so this
 * layer has no business logic of its own.
 */
export function getDayView(deps: GetDayViewDeps) {
  return async (day: CalendarDay): Promise<DayItem[]> => {
    const today = getCalendarDay(deps.now(), deps.dayStartHour);
    const activities = await deps.activities.findAll();

    const inputs: ActivityDayInput[] = [];
    for (const activity of activities) {
      const goal = await deps.goals.findById(activity.goalId);
      if (goal === null) continue; // an activity whose goal is missing is a data gap; skip it
      const schedules = await deps.schedules.findByActivityId(activity.id);
      const occurrence = await deps.occurrences.findByActivityAndDate(
        activity.id,
        day,
      );
      inputs.push({ activity, goal, schedules, occurrence });
    }

    return buildDay({ day, today, activities: inputs });
  };
}
