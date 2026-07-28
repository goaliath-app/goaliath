import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityId } from '../domain/Activity';
import { assertActivityType } from './assertActivityType';
import { stopTimer, type StopTimerDeps } from './stopTimer';

/**
 * Whether only one timer may run at a time (domain-model §11). A **product
 * choice enforced at write time**, not a shape constraint: `RunningTimer` is a
 * collection, so allowing parallel timers later is flipping this flag — no
 * storage change, no migration (future-features).
 */
const ENFORCE_SINGLE_TIMER = true;

export type StartTimerDeps = StopTimerDeps;

/**
 * Start a timer for `day` (§11). With the single-timer rule on, any other
 * running timer is **stopped first** — which commits its elapsed interval to its
 * own occurrence rather than discarding it.
 *
 * `day` is stored on the record as the occurrence the session will be credited
 * to, resolved once at start so crossing the day cutoff mid-session can't move
 * it (see `stopTimer`).
 */
export function startTimer(deps: StartTimerDeps) {
  const stop = stopTimer(deps);

  return async ({
    activityId,
    day,
  }: {
    activityId: ActivityId;
    day: CalendarDay;
  }): Promise<void> => {
    await assertActivityType(deps.activities, activityId, 'timer');

    if (ENFORCE_SINGLE_TIMER) {
      for (const running of await deps.runningTimers.findAll()) {
        await stop({ activityId: running.activityId });
      }
    }

    await deps.runningTimers.save({
      activityId,
      occurrenceDate: day,
      startedAt: deps.now(),
    });
  };
}
