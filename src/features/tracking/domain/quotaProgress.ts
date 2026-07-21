import { isComplete, type ActivityOccurrence } from './ActivityOccurrence';
import type { PeriodGoal } from './ActivitySchedule';
import type { ActivityTypeBehaviour } from './activityTypes/registry';

/**
 * How a quota is doing against its `periodGoal` so far (domain-model §3).
 *
 * `current` is deliberately generic: for `completedDays` it counts days, for
 * `metricSum` it's the summed metric (reps, seconds…) in the activityType's
 * unit. Naming it `completed` would have been a lie for the second case.
 */
export interface PeriodProgress {
  current: number;
  target: number;
}

/**
 * Score a quota's period from the occurrences that fall inside it.
 *
 * Returns `null` when the goal can't be scored for this type — a `metricSum`
 * target on a non-measurable type such as `checklist` (its metric is `none`).
 * That pairing is invalid rather than zero, so it reports "unscoreable" instead
 * of a misleading 0; `isMeasurable` is what stops it being created.
 */
export function quotaPeriodProgress(
  occurrencesInPeriod: readonly ActivityOccurrence[],
  periodGoal: PeriodGoal,
  behaviour: ActivityTypeBehaviour,
): PeriodProgress | null {
  if (periodGoal.aggregate === 'completedDays') {
    return {
      current: occurrencesInPeriod.filter(isComplete).length,
      target: periodGoal.amount,
    };
  }

  const { measure } = behaviour;
  if (measure === null) return null; // metricSum on a type with no metric

  return {
    current: occurrencesInPeriod.reduce(
      (total, occurrence) => total + measure(occurrence.progress),
      0,
    ),
    target: periodGoal.amount,
  };
}
