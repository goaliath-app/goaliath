import {
  calendarDayParts,
  isoWeekday,
  type CalendarDay,
} from '@/shared/domain/time/CalendarDay';

/**
 * A value object that answers **only** *which days are in play* — never "how
 * much" (that lives in `ActivitySchedule.dayGoal`/`periodGoal`, domain-model §3).
 * Keeping it purely temporal is what lets a new cadence be added as one more
 * `kind` without touching targets, progress, or the projection's per-day logic
 * (domain-model §4).
 *
 * - **Fixed kinds** (`daily`/`weekly`/`monthly`/`yearly`) name the exact days
 *   that are due; the projection generates them deterministically via `isDueOn`.
 * - **`quota`** names only a period, not the days: the user opts in day by day,
 *   so it can't answer `isDueOn` on its own and is excluded from it at the type
 *   level (domain-model §4, "Why quota needs an extra step").
 */
export type RecurrenceRule =
  | { kind: 'daily' }
  | { kind: 'weekly'; daysOfWeek: number[] } // ISO 1..7 (Mon..Sun)
  | { kind: 'monthly'; daysOfMonth: number[] } // 1..31
  | { kind: 'yearly'; datesOfYear: { month: number; day: number }[] }
  | { kind: 'quota'; period: 'week' | 'month' | 'year' };

/** Every fixed cadence — the ones whose due days are deterministic. */
export type FixedRecurrenceRule = Exclude<RecurrenceRule, { kind: 'quota' }>;

/** Narrows a rule to the fixed kinds (i.e. excludes `quota`). */
export function isFixed(rule: RecurrenceRule): rule is FixedRecurrenceRule {
  return rule.kind !== 'quota';
}

/**
 * Whether a **fixed** recurrence makes `day` a due day. `quota` is excluded at
 * the type level: it has no deterministic due days (domain-model §4), so asking
 * this of it is a category error the compiler rejects rather than a runtime path.
 *
 * `monthly`/`yearly` **never clamp**: a day the month or year simply lacks (e.g.
 * the 31st in a 30-day month, Feb 29 in a common year) just never matches — it
 * is not rounded to the last valid day.
 */
export function isDueOn(rule: FixedRecurrenceRule, day: CalendarDay): boolean {
  switch (rule.kind) {
    case 'daily':
      return true;
    case 'weekly':
      return rule.daysOfWeek.includes(isoWeekday(day));
    case 'monthly':
      return rule.daysOfMonth.includes(calendarDayParts(day).day);
    case 'yearly': {
      const { month, day: dayOfMonth } = calendarDayParts(day);
      return rule.datesOfYear.some(
        (dateOfYear) =>
          dateOfYear.month === month && dateOfYear.day === dayOfMonth,
      );
    }
  }
}
