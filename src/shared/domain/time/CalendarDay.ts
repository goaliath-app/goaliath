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

const padTwoDigits = (value: number): string => String(value).padStart(2, '0');

/**
 * The **only** way to turn an instant into the system's logical date (§10 of the
 * domain model). No other code should compute logical dates on its own.
 *
 * An instant that falls before `dayStartHour` belongs to the *previous* logical
 * day: with `dayStartHour = 4`, anything from 00:00 to 03:59 counts as
 * yesterday.
 *
 * Works entirely in **local wall-clock components** — it compares the instant's
 * local hour against `dayStartHour` and shifts the *calendar* day, never doing
 * absolute-millisecond arithmetic. That's what keeps it correct across DST
 * transitions: on a spring-forward day (23 wall-clock hours) subtracting a fixed
 * number of real hours would land an hour off and mislabel the day. The caller
 * decides the timezone by the `Date` it passes in.
 *
 * @param instant       a point in time
 * @param dayStartHour  integer hour in `[0, 23]` at which the logical day begins
 *                      (0 = midnight, the calendar default)
 * @throws {RangeError} if `dayStartHour` is not an integer in `[0, 23]`
 */
export function getCalendarDay(instant: Date, dayStartHour: number): CalendarDay {
  if (!Number.isInteger(dayStartHour) || dayStartHour < 0 || dayStartHour > 23) {
    throw new RangeError(
      `dayStartHour must be an integer in [0, 23], got ${dayStartHour}`,
    );
  }
  const belongsToPreviousDay = instant.getHours() < dayStartHour;
  // Rebuild from local calendar components, rolling back one day when the
  // instant is before the cutoff. `new Date(y, m, d - 1)` normalises month/year
  // roll-over; noon keeps the read-back clear of any midnight DST boundary.
  const logicalDay = new Date(
    instant.getFullYear(),
    instant.getMonth(),
    instant.getDate() - (belongsToPreviousDay ? 1 : 0),
    12,
  );
  const value = `${logicalDay.getFullYear()}-${padTwoDigits(
    logicalDay.getMonth() + 1,
  )}-${padTwoDigits(logicalDay.getDate())}`;
  return value as CalendarDay;
}

/** The calendar components of a logical day. `month` is 1..12, `day` is 1..31. */
export interface CalendarDayParts {
  year: number;
  month: number;
  day: number;
}

/**
 * Split a `CalendarDay` back into its numeric parts. Pure string parse — no
 * timezone involved, since a `CalendarDay` is already a resolved logical date.
 */
export function calendarDayParts(day: CalendarDay): CalendarDayParts {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return { year, month, day: dayOfMonth };
}

/**
 * ISO 8601 weekday: **1 = Monday … 7 = Sunday** (domain-model §4 uses this
 * convention for `weekly` recurrences). Computed at UTC noon so no timezone or
 * DST shift can move the day across a boundary.
 */
export function isoWeekday(day: CalendarDay): number {
  const { year, month, day: dayOfMonth } = calendarDayParts(day);
  const jsDay = new Date(Date.UTC(year, month - 1, dayOfMonth, 12)).getUTCDay();
  return jsDay === 0 ? 7 : jsDay; // JS: 0=Sun..6=Sat → ISO: 1=Mon..7=Sun
}

/**
 * Build a `CalendarDay` from calendar parts, **normalising overflow**: month 13
 * rolls into the next year, day 0 becomes the last day of the previous month,
 * day 32 rolls forward. That makes range math (last-day-of-month, ±N days) fall
 * out of one primitive instead of needing per-case branches.
 *
 * All arithmetic is done in **UTC**: a `CalendarDay` is an already-resolved
 * logical date, so shifting it is pure calendar math with no timezone or DST to
 * account for (unlike `getCalendarDay`, which converts a real instant and must
 * use local wall-clock components).
 */
export function calendarDayFrom(
  year: number,
  month: number,
  dayOfMonth: number,
): CalendarDay {
  const normalised = new Date(Date.UTC(year, month - 1, dayOfMonth, 12));
  const value = `${normalised.getUTCFullYear()}-${padTwoDigits(
    normalised.getUTCMonth() + 1,
  )}-${padTwoDigits(normalised.getUTCDate())}`;
  return value as CalendarDay;
}

/** The logical day `delta` days after (or before, if negative) `day`. */
export function addDays(day: CalendarDay, delta: number): CalendarDay {
  const { year, month, day: dayOfMonth } = calendarDayParts(day);
  return calendarDayFrom(year, month, dayOfMonth + delta);
}
