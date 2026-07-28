import type { Goal } from '../domain/Goal';
import type { GoalRepository } from '../domain/ports/GoalRepository';

export interface ListGoalsDeps {
  goals: GoalRepository;
}

/**
 * Read use case: every goal, whatever its status. Which ones a given screen
 * *offers* is a product rule the caller keeps — the create-activity picker hides
 * archived goals, the goals screen shows them all (see `GoalRepository.findAll`)
 * — so this deliberately does no filtering.
 *
 * It exists so `ui/` reaches goal data through the application layer instead of
 * calling `goalRepository.findAll()` directly, which is the dependency-rule-4
 * boundary `ui/` must not cross (architecture.md).
 */
export function listGoals(deps: ListGoalsDeps) {
  return async (): Promise<Goal[]> => deps.goals.findAll();
}
