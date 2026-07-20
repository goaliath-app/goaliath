import type { Status, StatusPeriod } from '@/features/tracking/domain/StatusPeriod';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

/**
 * Row shape shared by `goal_status_periods` and `activity_status_periods`
 * (minus the owner column, which the repository uses for grouping and the
 * domain doesn't carry — domain-model §0).
 */
export interface StatusPeriodRow {
  status: string;
  from_day: string;
}

/**
 * Rows must arrive **ordered ascending by `from_day`** (the repositories query
 * with `ORDER BY`); the domain's timeline functions rely on that invariant.
 */
export function toStatusPeriod(row: StatusPeriodRow): StatusPeriod {
  return {
    status: row.status as Status, // constrained by the write path; rows are ours
    from: row.from_day as CalendarDay,
  };
}
