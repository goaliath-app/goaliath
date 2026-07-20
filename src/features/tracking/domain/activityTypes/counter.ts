/**
 * The `counter` activity type (domain-model §5, §7). A counter day's progress is
 * a list of **timestamped repetitions**, and the day counts as done once the
 * repetition count reaches the schedule's `dayGoal`. Its metric is `count`
 * (reps) — the unit `dayGoal` and a quota's `metricSum` are expressed in.
 *
 * Instants inside `progress` are stored as **ISO strings**, not `Date`s: progress
 * is an opaque per-`activityType` JSON blob (persisted whole, never queried
 * into), so keeping its internals serialization-ready lets it round-trip through
 * storage without type-aware revival. First-class occurrence fields like
 * `completedAt` are revived to `Date`; progress internals are parsed by the
 * type-specific consumer when it actually needs a `Date`.
 */
export interface Repetition {
  at: string; // ISO-8601 instant the repetition was logged
}

export interface CounterProgress {
  repetitions: readonly Repetition[];
}

/** The starting progress for a fresh counter occurrence: no reps yet. */
export const emptyCounterProgress = (): CounterProgress => ({ repetitions: [] });

/** Append one repetition logged at `at`. Returns new progress; never mutates. */
export function addRepetition(
  progress: CounterProgress,
  at: Date,
): CounterProgress {
  return { repetitions: [...progress.repetitions, { at: at.toISOString() }] };
}

/** The metric a counter day measures: how many repetitions were logged. */
export function countRepetitions(progress: CounterProgress): number {
  return progress.repetitions.length;
}

/**
 * Whether a counter day is complete. With a numeric `dayGoal` the count must
 * reach it; a `null` dayGoal means the binary "did it" — at least one rep
 * (domain-model §3, `dayGoal = null`).
 */
export function isCounterComplete(
  progress: CounterProgress,
  dayGoal: number | null,
): boolean {
  const target = dayGoal ?? 1;
  return countRepetitions(progress) >= target;
}
