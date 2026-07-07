/**
 * A logical calendar day in `YYYY-MM-DD` form — the user's "day" as defined by
 * `dayStartHour` (see `docs/domain-model.md` §10, "Day with a configurable
 * cutoff hour").
 *
 * It is a branded string so it can't be confused with an arbitrary string, but
 * because the format is zero-padded and ISO-ordered, two `CalendarDay` values
 * can be compared directly with `<`, `>` and `===` — lexicographic order equals
 * chronological order.
 */
export type CalendarDay = string & { readonly __calendarDay: unique symbol };

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * The **only** way to turn an instant into the system's logical date (§10 of the
 * domain model). No other code should compute logical dates on its own.
 *
 * An instant that falls before `dayStartHour` belongs to the *previous* logical
 * day: with `dayStartHour = 4`, anything from 00:00 to 03:59 counts as
 * yesterday.
 *
 * Local wall-clock components are used, so the caller decides the timezone by
 * the `Date` it passes in.
 *
 * @param instant       a point in time
 * @param dayStartHour  hour in `[0, 23]` at which the logical day begins
 *                      (0 = midnight, the calendar default)
 */
export function getCalendarDay(instant: Date, dayStartHour: number): CalendarDay {
  const shifted = new Date(instant.getTime() - dayStartHour * 60 * 60 * 1000);
  const value = `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}-${pad(
    shifted.getDate(),
  )}`;
  return value as CalendarDay;
}
