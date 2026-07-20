import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import { latestOnOrBefore } from '@/shared/domain/time/changePointTimeline';

/** The three lifecycle states shared by Goal and Activity (domain-model §0). */
export type Status = 'active' | 'paused' | 'archived';

/**
 * One entry of a Goal's or Activity's **status timeline** (domain-model §0): the
 * status that takes effect on `from` and holds **until the next entry** (or
 * forever if it's the last one).
 *
 * There is no explicit end. Timelines are contiguous (there are no gaps — the
 * entity always has some status once it exists), so a `to` would only duplicate
 * the next entry's `from` and add an invariant to keep consistent. Dropping it
 * makes overlaps and gaps unrepresentable.
 *
 * A timeline is assumed **sorted ascending by `from`**; the last entry is the
 * current status.
 */
export interface StatusPeriod {
  status: Status;
  from: CalendarDay;
}

/**
 * The entry in effect on `day`: the latest one whose `from <= day`. `from` is
 * inclusive, so the day a change takes effect already belongs to the new status.
 *
 * Returns `null` when `day` is before the first entry — i.e. the entity did not
 * exist yet (distinct from being `paused` or `archived`).
 */
export function periodOn(
  periods: readonly StatusPeriod[],
  day: CalendarDay,
): StatusPeriod | null {
  return latestOnOrBefore(periods, day, (period) => period.from);
}

/** The status on `day`, or `null` if the entity did not exist yet. */
export function statusOn(
  periods: readonly StatusPeriod[],
  day: CalendarDay,
): Status | null {
  return periodOn(periods, day)?.status ?? null;
}

/** Whether the entity was in `active` status on `day`. */
export function isActiveOn(
  periods: readonly StatusPeriod[],
  day: CalendarDay,
): boolean {
  return statusOn(periods, day) === 'active';
}

/**
 * "Since when do I have this?" — the `from` of the first entry. Because the
 * timeline is sorted ascending (the invariant `periodOn` and `activeSince` also
 * rely on), the first entry is the earliest, so this is stable no matter how
 * many times it was later paused/resumed or its recurrence edited (that lives in
 * a separate timeline). `null` if there are no entries yet.
 */
export function startedOn(periods: readonly StatusPeriod[]): CalendarDay | null {
  return periods[0]?.from ?? null;
}

/**
 * "Since when is it active right now?" — the `from` of the current status (the
 * last entry) when it is `active`, otherwise `null` (it isn't currently active).
 */
export function activeSince(periods: readonly StatusPeriod[]): CalendarDay | null {
  const current = periods[periods.length - 1];
  if (current && current.status === 'active') {
    return current.from;
  }
  return null;
}
