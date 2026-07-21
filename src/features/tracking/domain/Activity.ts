import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { Goal, GoalId } from './Goal';
import { isActiveOn, type StatusPeriod } from './StatusPeriod';

/**
 * An Activity's identity. Branded so it can't be confused with a `GoalId` — the
 * exact mixup `isEffectivelyActive`'s guard below also protects against.
 */
export type ActivityId = string & { readonly __activityId: unique symbol };

/**
 * The activity-type key (domain-model §2/§7): the set of **implemented** types.
 * `checklist` and `counter` are modeled; `timer` joins the union when it's built
 * (adding it is one entry here plus its behaviour/view modules). Eventually this
 * becomes `keyof typeof registry` once the registry is extracted.
 */
export type ActivityType = 'checklist' | 'counter' | 'timer';

/**
 * An Activity describes **what** the user wants to do, never **when** (that's the
 * `ActivitySchedule`, §3). It has a stable identity over time and always belongs
 * to exactly one Goal (`goalId` is required — a Goal-less one-off is a `Task`,
 * §6, not an Activity). It owns its own status timeline (§2).
 *
 * `title` and `description` are cosmetic and **not versioned** (§0).
 */
export interface Activity {
  id: ActivityId;
  goalId: GoalId;
  title: string;
  description: string;
  activityType: ActivityType;
  statusPeriods: StatusPeriod[]; // active | paused | archived (§0)
}

/**
 * The §0 composition/cascade rule: an Activity is **effectively active** on
 * `day` only if **both it and its Goal** are in `active` status that day.
 * Pausing/archiving the Goal cascades to the Activity without duplicating a flag
 * on either aggregate — it's derived here on demand.
 *
 * `goal` must be this activity's own Goal; passing an unrelated one is a caller
 * mistake (the cascade would be meaningless), so it throws rather than silently
 * returning a wrong answer.
 *
 * @throws {Error} if `goal.id` is not `activity.goalId`.
 */
export function isEffectivelyActive(
  activity: Activity,
  goal: Goal,
  day: CalendarDay,
): boolean {
  if (activity.goalId !== goal.id) {
    throw new Error(
      `isEffectivelyActive: goal "${goal.id}" is not activity "${activity.id}"'s own goal ("${activity.goalId}")`,
    );
  }
  return (
    isActiveOn(goal.statusPeriods, day) &&
    isActiveOn(activity.statusPeriods, day)
  );
}
