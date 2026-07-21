import type { IdGenerator } from '@/shared/domain/ports/IdGenerator';
import type { TransactionRunner } from '@/shared/domain/ports/TransactionRunner';
import { getCalendarDay } from '@/shared/domain/time/CalendarDay';
import { createGoal as buildGoal, type Goal, type GoalId } from '../domain/Goal';
import type { GoalRepository } from '../domain/ports/GoalRepository';

export interface CreateGoalDeps {
  goals: GoalRepository;
  ids: IdGenerator;
  transactions: TransactionRunner;
  now: () => Date;
  dayStartHour: number;
}

/**
 * Create a goal on its own (a goal is useful before it has any activities — it's
 * the "why" you hang them on). Creating one *while* creating an activity is a
 * different path: see `createActivity`, where both must land atomically.
 *
 * Still transactional despite being "one save": a goal spans two tables, itself
 * and its status timeline (§0). A half-written goal would have no status at all,
 * which `statusOn` reads as "did not exist yet" — present but invisible.
 */
export function createGoal(deps: CreateGoalDeps) {
  return async (input: {
    title: string;
    motivation?: string;
  }): Promise<Goal> => {
    // Built (and validated) before the transaction opens.
    const goal = buildGoal({
      id: deps.ids.newId() as GoalId,
      title: input.title,
      motivation: input.motivation,
      activeFrom: getCalendarDay(deps.now(), deps.dayStartHour),
    });

    return deps.transactions.runInTransaction(async () => {
      await deps.goals.save(goal);
      return goal;
    });
  };
}
