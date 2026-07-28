import type { ActivityId, ActivityType } from '../domain/Activity';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';

/**
 * Guard for the untagged-progress boundary (domain-model §5). An
 * `OccurrenceProgress` carries no `activityType` discriminant, so which member
 * of `Checklist | Counter | Timer` it is is known only from the owning activity.
 * Each write use case assumes its own shape, so writing through the wrong one
 * would store progress the projection later misreads — silently.
 *
 * This turns that latent corruption into a loud error at the write, where the
 * expected type is known: fetch the activity and refuse if its real type isn't
 * the one the caller routed to. Defence in depth behind the UI routing that is
 * meant to keep each activity on its matching use case.
 *
 * @throws {Error} if no such activity exists, or its type isn't `expected`.
 */
export async function assertActivityType(
  activities: ActivityRepository,
  activityId: ActivityId,
  expected: ActivityType,
): Promise<void> {
  const activity = await activities.findById(activityId);
  if (activity === null) {
    throw new Error(`assertActivityType: no activity "${activityId}"`);
  }
  if (activity.activityType !== expected) {
    throw new Error(
      `assertActivityType: activity "${activityId}" is a "${activity.activityType}", not a "${expected}"`,
    );
  }
}
