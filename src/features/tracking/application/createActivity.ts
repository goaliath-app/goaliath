import { NotFoundError } from '@/shared/domain/errors';
import type { IdGenerator } from '@/shared/domain/ports/IdGenerator';
import type { TransactionRunner } from '@/shared/domain/ports/TransactionRunner';
import { getCalendarDay } from '@/shared/domain/time/CalendarDay';
import type { Activity, ActivityId, ActivityType } from '../domain/Activity';
import type { PeriodGoal, ScheduleId } from '../domain/ActivitySchedule';
import { createActivity as buildActivityWithSchedule } from '../domain/createActivity';
import { createGoal as buildGoal, type Goal, type GoalId } from '../domain/Goal';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import type { ActivityScheduleRepository } from '../domain/ports/ActivityScheduleRepository';
import type { GoalRepository } from '../domain/ports/GoalRepository';
import type { RecurrenceRule } from '../domain/RecurrenceRule';

/**
 * Which goal the new activity belongs to. A union so "pick an existing one **or**
 * create one" can't be violated — neither both nor neither is representable.
 */
export type GoalSelection =
  | { kind: 'existing'; goalId: GoalId }
  | { kind: 'new'; title: string; motivation?: string };

export interface CreateActivityDeps {
  goals: GoalRepository;
  activities: ActivityRepository;
  schedules: ActivityScheduleRepository;
  ids: IdGenerator;
  transactions: TransactionRunner;
  now: () => Date;
  dayStartHour: number;
}

export interface CreateActivityInput {
  goal: GoalSelection;
  title: string;
  description?: string;
  activityType: ActivityType;
  recurrenceRule: RecurrenceRule;
  dayGoal: number | null;
  periodGoal: PeriodGoal | null;
}

/**
 * Create an activity — optionally creating its goal in the same breath.
 *
 * Two properties this deliberately guarantees:
 *
 * 1. **Everything is validated before anything is written.** The entities are
 *    built (and the domain constructors reject bad input) up front, so a bad
 *    title can't leave a freshly-created goal orphaned behind it.
 * 2. **The writes land together or not at all**, inside one transaction. A
 *    half-written activity — no schedule, or pointing at a goal that was never
 *    saved — would be skipped by `getDayView`: present in the database but
 *    invisible and unfixable from the app.
 *
 * Assigning a **paused** goal is allowed. The activity just won't show up in
 * Today until the goal is resumed (the §0 cascade), which is correct rather than
 * broken — the UI is responsible for saying so.
 */
export function createActivity(deps: CreateActivityDeps) {
  return async (input: CreateActivityInput): Promise<Activity> => {
    const today = getCalendarDay(deps.now(), deps.dayStartHour);

    // --- build + validate everything first, write nothing yet ---------------
    let goalToCreate: Goal | null = null;
    let goalId: GoalId;
    if (input.goal.kind === 'new') {
      goalToCreate = buildGoal({
        id: deps.ids.newId() as GoalId,
        title: input.goal.title,
        motivation: input.goal.motivation,
        activeFrom: today,
      });
      goalId = goalToCreate.id;
    } else {
      goalId = input.goal.goalId;
    }

    const { activity, schedule } = buildActivityWithSchedule({
      activityId: deps.ids.newId() as ActivityId,
      scheduleId: deps.ids.newId() as ScheduleId,
      goalId,
      title: input.title,
      description: input.description,
      activityType: input.activityType,
      recurrenceRule: input.recurrenceRule,
      dayGoal: input.dayGoal,
      periodGoal: input.periodGoal,
      activeFrom: today,
    });

    // --- then write, all or nothing ----------------------------------------
    return deps.transactions.runInTransaction(async () => {
      if (goalToCreate !== null) {
        await deps.goals.save(goalToCreate);
      } else if ((await deps.goals.findById(goalId)) === null) {
        // Checked inside the transaction: an activity referencing a missing goal
        // is invisible to the projection, so this must never get written.
        throw new NotFoundError(`Goal "${goalId}" does not exist`);
      }

      await deps.activities.save(activity);
      await deps.schedules.save(schedule);
      return activity;
    });
  };
}
