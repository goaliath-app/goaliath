import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityId } from './Activity';

/**
 * A timer that is running **right now** (domain-model §11). Live operational
 * state, deliberately kept *outside* the historical model: "everything can be
 * reconstructed" holds for history, but "is something running?" shouldn't
 * require scanning occurrences.
 *
 * `occurrenceDate` is the logical day the elapsed time will be credited to,
 * resolved when the timer starts — so a timer running across the day cutoff
 * still lands on the day it began.
 *
 * Modeled as a **collection** (see the repository), not a single nullable
 * value: the "only one at a time" rule is a product choice enforced at write
 * time, not baked into the shape of the data. That's what makes parallel timers
 * a one-line change later instead of a migration (future-features).
 */
export interface RunningTimer {
  activityId: ActivityId;
  occurrenceDate: CalendarDay;
  startedAt: Date;
}

/** The elapsed seconds of a running timer as of `now`. */
export function elapsedSeconds(timer: RunningTimer, now: Date): number {
  return Math.max(
    0,
    Math.floor((now.getTime() - timer.startedAt.getTime()) / 1000),
  );
}
