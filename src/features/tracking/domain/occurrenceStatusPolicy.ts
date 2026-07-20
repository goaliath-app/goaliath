import type { OccurrenceStatus } from './ActivityOccurrence';

/**
 * The **single** place that assigns meaning to an occurrence status
 * (future-features invariant 2). Every completion/streak calculation reads this
 * instead of scattering `status === 'done'` checks across the code, so adding a
 * state later (e.g. `excused` as a neutral outcome) is **one entry here**, not a
 * hunt through the codebase.
 *
 * It maps only the **persisted** statuses. `missed` is derived by the projection
 * (§8) — a past due day that never reached `done` — and never stored, so its
 * meaning belongs with that derivation, not here.
 */
const COUNTS_AS_DONE: Record<OccurrenceStatus, boolean> = {
  pending: false,
  done: true,
};

/** Whether a day in this status counts as completed (for day/period goals). */
export function countsAsDone(status: OccurrenceStatus): boolean {
  return COUNTS_AS_DONE[status];
}
