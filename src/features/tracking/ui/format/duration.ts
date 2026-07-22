/**
 * Seconds ⇄ `hh:mm:ss`, plus the words the preview uses.
 *
 * Durations are **stored and passed around as seconds** — the unit the `timer`
 * activityType actually produces (`totalSeconds`) — and only ever split into
 * parts at the edge where a human types them. No unit conversion survives
 * outside this file.
 */

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

/** The three fields of an `hh:mm:ss` input. */
export type DurationUnit = 'hours' | 'minutes' | 'seconds';

export interface DurationParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export function secondsToParts(totalSeconds: number): DurationParts {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return {
    hours: Math.floor(safe / SECONDS_PER_HOUR),
    minutes: Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: safe % SECONDS_PER_MINUTE,
  };
}

export function partsToSeconds(parts: DurationParts): number {
  return (
    parts.hours * SECONDS_PER_HOUR +
    parts.minutes * SECONDS_PER_MINUTE +
    parts.seconds
  );
}

/**
 * The largest value a field accepts. Minutes and seconds roll at 59 rather than
 * carrying into the next unit: typing 90 in the minutes box means the user meant
 * the maximum, not "1h30" — the hours box is right there.
 */
export function maxValueFor(unit: DurationUnit, maxHours: number): number {
  return unit === 'hours' ? maxHours : 59;
}

/**
 * Reads what the user typed into one field. Anything non-numeric is dropped
 * (the number pad still lets a paste through), and the value is clamped rather
 * than rejected, so the field can never hold something the duration can't
 * represent.
 */
export function parseDurationField(
  raw: string,
  unit: DurationUnit,
  maxHours: number,
): number {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return 0;
  return Math.min(Number(digits), maxValueFor(unit, maxHours));
}

/** `7` → `"07"`, for the two-digit look of a clock face. */
export function padDurationField(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * The slice of i18next's `t` this file needs — declared structurally so these
 * stay pure functions that tests can drive with a fake.
 */
export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

/**
 * "1 h 30 min", "45 s". Only non-zero parts appear, so a round hour reads
 * "2 h" instead of "2 h 0 min 0 s". Zero has no parts at all, so it falls back
 * to seconds rather than rendering as an empty string.
 */
export function formatDurationWords(
  totalSeconds: number,
  t: Translate,
): string {
  const { hours, minutes, seconds } = secondsToParts(totalSeconds);
  const parts: string[] = [];
  if (hours > 0) parts.push(t('duration.hoursShort', { count: hours }));
  if (minutes > 0) parts.push(t('duration.minutesShort', { count: minutes }));
  if (seconds > 0 || parts.length === 0) {
    parts.push(t('duration.secondsShort', { count: seconds }));
  }
  return parts.join(t('duration.partSeparator'));
}
