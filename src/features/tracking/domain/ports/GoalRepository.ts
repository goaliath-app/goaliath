import type { Goal, GoalId } from '../Goal';

/**
 * Port for loading Goals (architecture.md — a data-access contract lives in
 * `domain/`, the SQLite adapter implements it in `infrastructure/`). The adapter
 * reconstructs the Goal together with its status timeline from the normalized
 * tables. Interface only — never an implementation.
 */
export interface GoalRepository {
  findById(id: GoalId): Promise<Goal | null>;
  /**
   * Every goal, whatever its status. Which ones a picker offers is a product
   * rule (see the create flow), not a query concern — the same reasoning as
   * `ActivityRepository.findAll`.
   */
  findAll(): Promise<Goal[]>;
  save(goal: Goal): Promise<void>;
}
