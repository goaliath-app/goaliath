import { isComplete, type ActivityOccurrence } from './ActivityOccurrence';
import type { PeriodGoal } from './ActivitySchedule';

/** How a quota is doing against its `periodGoal` so far (domain-model §3). */
export interface PeriodProgress {
  completed: number; // reached so far within the period
  target: number; // what the periodGoal asks for
}

/**
 * Score a quota's period from the occurrences that fall inside it.
 *
 * Only `completedDays` is computed for now. `metricSum` needs each
 * activityType's `measure(progress)` to sum a metric across days, and that's
 * precisely the generic behaviour the domain-side activityType registry (§7)
 * will provide — so it returns `null` ("not scored yet") rather than guessing.
 */
export function quotaPeriodProgress(
  occurrencesInPeriod: readonly ActivityOccurrence[],
  periodGoal: PeriodGoal,
): PeriodProgress | null {
  if (periodGoal.aggregate !== 'completedDays') return null;
  return {
    completed: occurrencesInPeriod.filter(isComplete).length,
    target: periodGoal.amount,
  };
}
