import type { ActivityType } from '../Activity';
import type { OccurrenceProgress } from '../ActivityOccurrence';
import { countRepetitions, type CounterProgress } from './counter';
import { totalSeconds, type TimerProgress } from './timer';

/** What a day's progress measures — gives `dayGoal`/`periodGoal` their unit (§3). */
export type ActivityMetric = 'none' | 'count' | 'duration';

/**
 * The **pure domain half** of the activityType registry (domain-model §7). It
 * exists so generic code (period scoring, and later stats) can work across types
 * without knowing them; the rendering half lives in `ui/activityTypes/`, keeping
 * `Component`s out of the domain.
 *
 * Deliberately smaller than §7 sketched, now that three real types exist:
 *
 * - `measure` is **`null` for types whose metric is `none`**. A checklist day
 *   has no quantity — its outcome is the occurrence's `status`, not its (empty)
 *   progress — so §7's uniform `measure(progress): number` was wrong. Making it
 *   nullable forces callers to handle "not measurable" instead of silently
 *   summing zeros.
 * - `isCompleted` is **not** here: deriving `done` from progress is a
 *   write-path concern of each measurable type, and its use cases import their
 *   own function directly. Nothing generic needs it yet.
 */
export interface ActivityTypeBehaviour {
  key: ActivityType;
  metric: ActivityMetric;
  /** The scalar a day contributes to a `metricSum` goal; `null` if not measurable. */
  measure: ((progress: OccurrenceProgress) => number) | null;
}

const behaviours: Record<ActivityType, ActivityTypeBehaviour> = {
  checklist: { key: 'checklist', metric: 'none', measure: null },
  counter: {
    key: 'counter',
    metric: 'count',
    // Untagged-progress boundary (§5): each behaviour knows its own shape.
    measure: (progress) => countRepetitions(progress as CounterProgress),
  },
  timer: {
    key: 'timer',
    metric: 'duration',
    measure: (progress) => totalSeconds(progress as TimerProgress),
  },
};

export function behaviourFor(activityType: ActivityType): ActivityTypeBehaviour {
  return behaviours[activityType];
}

/**
 * Whether a day of this type produces a **quantity** (its metric isn't `none`).
 *
 * One predicate answers both questions that depend on it: whether a `dayGoal`
 * ("reach N today") is meaningful, and whether a `metricSum` period goal ("N
 * across the period") can be scored. A create form uses it to decide which goal
 * shapes to offer, so it can't produce an activity nothing can score.
 */
export function isMeasurable(activityType: ActivityType): boolean {
  return behaviourFor(activityType).measure !== null;
}
