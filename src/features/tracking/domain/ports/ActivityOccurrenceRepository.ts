import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { ActivityId } from '../Activity';
import type { ActivityOccurrence } from '../ActivityOccurrence';

/**
 * Port for the persisted per-day records (domain-model §5). Keyed by
 * `(activityId, date)` — at most one occurrence per activity per logical day, so
 * `save` is an **upsert** on that key.
 */
export interface ActivityOccurrenceRepository {
  findByActivityAndDate(
    activityId: ActivityId,
    date: CalendarDay,
  ): Promise<ActivityOccurrence | null>;

  /**
   * Every occurrence of one activity within an **inclusive** span of days — what
   * a quota needs to score its period (§3): the days it already completed
   * between the period's first and last day.
   */
  findByActivityInRange(
    activityId: ActivityId,
    from: CalendarDay,
    to: CalendarDay,
  ): Promise<ActivityOccurrence[]>;

  save(occurrence: ActivityOccurrence): Promise<void>;
}
