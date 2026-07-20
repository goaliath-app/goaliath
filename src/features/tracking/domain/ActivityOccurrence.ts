import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityId } from './Activity';
import type { ScheduleId } from './ActivitySchedule';
import type { ChecklistProgress } from './activityTypes/checklist';
import type { CounterProgress } from './activityTypes/counter';
import { countsAsDone } from './occurrenceStatusPolicy';

/**
 * The **persisted** outcomes of a day (domain-model §5). Only `pending` and
 * `done` are ever stored; `missed` is **derived** by the projection (§8) — a
 * past due day that never reached `done` — and never persisted.
 *
 * Treated as an **extensible enum** (future-features invariant 1): new values
 * (e.g. `excused`) must be additive, never a shape change, and their meaning
 * lives in `occurrenceStatusPolicy`, not in scattered `=== 'done'` checks.
 */
export type OccurrenceStatus = 'pending' | 'done';

/** How an occurrence came to exist (domain-model §5). */
export type OccurrenceOrigin = 'recurrence' | 'quotaOptIn' | 'manual';

/**
 * Progress is polymorphic, defined by the Activity's `activityType` (§5/§7), not
 * by the generic model — the occurrence carries no discriminant of its own, so
 * which member applies is known from the owning activity's type. `timer` widens
 * this union later **without** changing the occurrence's shape.
 */
export type OccurrenceProgress = ChecklistProgress | CounterProgress;

/**
 * The persisted state of one activity-day (domain-model §5). Identified by
 * `(activityId, date)` — at most one per activity per logical day (§10).
 *
 * It **doesn't have to exist**: with no persisted record the projection
 * reconstructs the day as `pending` (today/future) or `missed` (past due). And
 * it's allowed on **any** date, even one the recurrence never generated
 * (future-features invariant 3): a manual occurrence has `origin: 'manual'` and
 * `scheduleId: null`.
 */
export interface ActivityOccurrence {
  activityId: ActivityId;
  scheduleId: ScheduleId | null; // null only for a manual occurrence outside any schedule
  date: CalendarDay;
  status: OccurrenceStatus;
  completedAt: Date | null; // the instant it was completed; null while pending
  notes: string | null;
  origin: OccurrenceOrigin;
  progress: OccurrenceProgress;
}

/**
 * Whether this occurrence counts as a completed day. Reads the status-policy
 * rather than testing `status === 'done'` directly, so it keeps working as new
 * statuses are added. (A measurable type's `status` is set to `done` by the use
 * case that records progress; the occurrence stays the source of truth, §8.)
 */
export function isComplete(occurrence: ActivityOccurrence): boolean {
  return countsAsDone(occurrence.status);
}
