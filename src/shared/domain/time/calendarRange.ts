import {
  addDays,
  calendarDayFrom,
  calendarDayParts,
  isoWeekday,
  type CalendarDay,
} from './CalendarDay';

/** An inclusive span of logical days (`from` and `to` both count). */
export interface DayRange {
  from: CalendarDay;
  to: CalendarDay;
}

/**
 * The **only** place that answers "which week does this day belong to?" — the
 * same chokepoint discipline `getCalendarDay` applies to logical days
 * (domain-model §10). Nothing else may compute week boundaries ad hoc: that's
 * exactly what made the week start impossible to change in `legacy/v1`, where
 * `startOf('week')` was hardwired across half a dozen files.
 *
 * `weekStart` is an **ISO weekday** (1 = Monday … 7 = Sunday) passed in as a
 * plain number, never read from the device here — the domain stays pure and
 * deterministic; mapping the device's own numbering happens in an adapter.
 *
 * @throws {RangeError} if `weekStart` is not an integer in `[1, 7]`
 */
export function weekRangeOf(day: CalendarDay, weekStart: number): DayRange {
  if (!Number.isInteger(weekStart) || weekStart < 1 || weekStart > 7) {
    throw new RangeError(
      `weekStart must be an ISO weekday integer in [1, 7], got ${weekStart}`,
    );
  }
  const daysSinceWeekStart = (isoWeekday(day) - weekStart + 7) % 7;
  const from = addDays(day, -daysSinceWeekStart);
  return { from, to: addDays(from, 6) };
}

/** The calendar month containing `day`, first to last (length-aware, leap-safe). */
export function monthRangeOf(day: CalendarDay): DayRange {
  const { year, month } = calendarDayParts(day);
  return {
    from: calendarDayFrom(year, month, 1),
    // Day 0 of the next month normalises to the last day of this one.
    to: calendarDayFrom(year, month + 1, 0),
  };
}

/** The calendar year containing `day`. */
export function yearRangeOf(day: CalendarDay): DayRange {
  const { year } = calendarDayParts(day);
  return { from: calendarDayFrom(year, 1, 1), to: calendarDayFrom(year, 12, 31) };
}
