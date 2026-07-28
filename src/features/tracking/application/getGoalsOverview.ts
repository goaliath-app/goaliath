import { getCalendarDay } from '@/shared/domain/time/CalendarDay';
import type { Activity } from '../domain/Activity';
import type { Goal } from '../domain/Goal';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import type { GoalRepository } from '../domain/ports/GoalRepository';
import { statusOn, type Status } from '../domain/StatusPeriod';

export interface GetGoalsOverviewDeps {
  goals: GoalRepository;
  activities: ActivityRepository;
  now: () => Date;
  dayStartHour: number;
}

export interface ActivityOverview {
  activity: Activity;
  /** The activity's **own** status today, or `null` if it doesn't exist yet (a
   * future-dated creation). Its *effective* status also depends on the goal's
   * (§0 cascade) — the goal's own status is right there beside it, so a screen
   * can show both without recomputing the cascade. */
  status: Status | null;
}

export interface GoalOverview {
  goal: Goal;
  status: Status | null;
  activities: ActivityOverview[];
}

/**
 * Read use case for the goals management screen: every goal with its activities
 * and each one's current status. Unlike `getDayView` it does **not** apply the
 * §0 cascade or the due-day projection — management shows the raw lifecycle of
 * each entity (paused, archived and all), not what falls due today.
 *
 * Goals keep `findAll`'s order (title-sorted in the adapter); activities are
 * grouped under their goal in the order they come back.
 */
export function getGoalsOverview(deps: GetGoalsOverviewDeps) {
  return async (): Promise<GoalOverview[]> => {
    const today = getCalendarDay(deps.now(), deps.dayStartHour);
    const [goals, activities] = await Promise.all([
      deps.goals.findAll(),
      deps.activities.findAll(),
    ]);

    return goals.map((goal) => ({
      goal,
      status: statusOn(goal.statusPeriods, today),
      activities: activities
        .filter((activity) => activity.goalId === goal.id)
        .map((activity) => ({
          activity,
          status: statusOn(activity.statusPeriods, today),
        })),
    }));
  };
}
