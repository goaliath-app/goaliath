import {
  monthRangeOf,
  weekRangeOf,
  yearRangeOf,
  type DayRange,
} from '@/shared/domain/time/calendarRange';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { RecurrenceRule } from './RecurrenceRule';

/** The period a `quota` recurrence measures over (domain-model §4). */
export type QuotaPeriod = Extract<RecurrenceRule, { kind: 'quota' }>['period'];

/**
 * The span of days the quota's `periodGoal` is evaluated over, for the period
 * containing `day` (domain-model §3/§4). Only `week` depends on `weekStart` —
 * months and years are boundary-independent, which is what keeps the blast
 * radius of the week-start setting narrow.
 */
export function quotaPeriodRangeOf(
  day: CalendarDay,
  period: QuotaPeriod,
  weekStart: number,
): DayRange {
  switch (period) {
    case 'week':
      return weekRangeOf(day, weekStart);
    case 'month':
      return monthRangeOf(day);
    case 'year':
      return yearRangeOf(day);
  }
}
