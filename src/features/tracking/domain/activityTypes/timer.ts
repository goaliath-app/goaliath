/**
 * The `timer` activity type (domain-model §5, §7). A timer day's progress is a
 * list of **completed** intervals; its metric is `duration` (seconds) — the unit
 * `dayGoal` and a quota's `metricSum` are expressed in.
 *
 * A **currently running** timer is deliberately *not* represented here: it lives
 * in the separate `RunningTimer` record (§11) and its interval is appended on
 * stop. That resolves the §5/§11 overlap in favour of §11 — progress stays a
 * history of finished work with no half-open state, so `end` is never null and
 * "is it running?" has exactly one source of truth.
 *
 * Instants are ISO strings, like `counter`'s repetitions: progress is an opaque
 * per-type JSON blob, so keeping its internals serialization-ready lets it
 * round-trip through storage without type-aware revival.
 */
export interface TimerInterval {
  start: string; // ISO-8601 instant
  end: string; // ISO-8601 instant, always closed
}

export interface TimerProgress {
  intervals: readonly TimerInterval[];
}

/** The starting progress for a fresh timer occurrence: no time logged yet. */
export const emptyTimerProgress = (): TimerProgress => ({ intervals: [] });

/**
 * Append one finished interval. Returns new progress; never mutates.
 *
 * @throws {RangeError} if the interval ends before it starts.
 */
export function appendInterval(
  progress: TimerProgress,
  start: Date,
  end: Date,
): TimerProgress {
  if (end.getTime() < start.getTime()) {
    throw new RangeError(
      `A timer interval cannot end (${end.toISOString()}) before it starts (${start.toISOString()})`,
    );
  }
  return {
    intervals: [
      ...progress.intervals,
      { start: start.toISOString(), end: end.toISOString() },
    ],
  };
}

/**
 * The metric a timer day measures: total logged seconds across its intervals.
 * Floored, so a partially-elapsed second never rounds a day up into "complete".
 */
export function totalSeconds(progress: TimerProgress): number {
  const totalMilliseconds = progress.intervals.reduce(
    (accumulated, interval) =>
      accumulated + (Date.parse(interval.end) - Date.parse(interval.start)),
    0,
  );
  return Math.floor(totalMilliseconds / 1000);
}

/**
 * Whether a timer day is complete. With a numeric `dayGoal` the logged seconds
 * must reach it; a `null` dayGoal means the binary "did it" — any time at all
 * (domain-model §3).
 */
export function isTimerComplete(
  progress: TimerProgress,
  dayGoal: number | null,
): boolean {
  const logged = totalSeconds(progress);
  return dayGoal === null ? logged > 0 : logged >= dayGoal;
}
