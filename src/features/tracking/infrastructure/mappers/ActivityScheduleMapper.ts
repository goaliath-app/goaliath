import type { ActivityId } from '@/features/tracking/domain/Activity';
import type {
  ActivitySchedule,
  PeriodGoal,
  ScheduleId,
} from '@/features/tracking/domain/ActivitySchedule';
import type { RecurrenceRule } from '@/features/tracking/domain/RecurrenceRule';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

export interface ActivityScheduleRow {
  id: string;
  activity_id: string;
  recurrence_rule: string; // JSON RecurrenceRule
  day_goal: number | null;
  period_goal: string | null; // JSON PeriodGoal; null for fixed recurrences
  start_date: string;
}

/**
 * Rebuild the `FixedSchedule | QuotaSchedule` union from a row. The "periodGoal
 * iff quota" invariant is type-level in the domain (§3), so this mapper is the
 * runtime boundary that re-establishes it from storage — a quota row without a
 * period goal is corrupt data and fails loudly rather than producing an entity
 * the type system promises can't exist.
 */
export function toActivitySchedule(row: ActivityScheduleRow): ActivitySchedule {
  const recurrenceRule = JSON.parse(row.recurrence_rule) as RecurrenceRule;
  const base = {
    id: row.id as ScheduleId,
    activityId: row.activity_id as ActivityId,
    dayGoal: row.day_goal,
    startDate: row.start_date as CalendarDay,
  };

  if (recurrenceRule.kind === 'quota') {
    if (row.period_goal === null) {
      throw new Error(
        `Corrupt activity_schedules row "${row.id}": quota recurrence without a period_goal`,
      );
    }
    return {
      ...base,
      recurrenceRule,
      periodGoal: JSON.parse(row.period_goal) as PeriodGoal,
    };
  }

  return { ...base, recurrenceRule, periodGoal: null };
}
