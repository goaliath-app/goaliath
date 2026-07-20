import type { ActivityId } from '../Activity';
import type { ActivitySchedule } from '../ActivitySchedule';

/**
 * Port for loading an Activity's schedule timeline (domain-model §3). Returns the
 * versions **sorted ascending by `startDate`**, the change-point invariant
 * `scheduleOn` relies on.
 */
export interface ActivityScheduleRepository {
  findByActivityId(activityId: ActivityId): Promise<ActivitySchedule[]>;
}
