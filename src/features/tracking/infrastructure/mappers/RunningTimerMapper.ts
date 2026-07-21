import type { ActivityId } from '@/features/tracking/domain/Activity';
import type { RunningTimer } from '@/features/tracking/domain/RunningTimer';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

export interface RunningTimerRow {
  activity_id: string;
  occurrence_date: string;
  started_at: string; // ISO-8601 instant
}

/**
 * `startedAt` is a first-class field of a live record, so it's revived to a
 * `Date` (unlike the instants *inside* a progress blob, which stay ISO strings).
 */
export function toRunningTimer(row: RunningTimerRow): RunningTimer {
  return {
    activityId: row.activity_id as ActivityId,
    occurrenceDate: row.occurrence_date as CalendarDay,
    startedAt: new Date(row.started_at),
  };
}

export function toRunningTimerRow(timer: RunningTimer): RunningTimerRow {
  return {
    activity_id: timer.activityId,
    occurrence_date: timer.occurrenceDate,
    started_at: timer.startedAt.toISOString(),
  };
}
