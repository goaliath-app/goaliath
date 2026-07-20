import type { CalendarDay } from './CalendarDay';

/**
 * A **change-point timeline** is a list of entries, each in effect from a start
 * day until the next entry supersedes it — the shared mechanism behind
 * `StatusPeriod` (domain-model §0) and `ActivitySchedule` (§3). There is no
 * explicit end; the end of one entry is the start of the next.
 *
 * Given the entries **sorted ascending by start day**, returns the one in effect
 * on `day`: the latest whose start is `<= day` (start is **inclusive**, so the
 * day a change takes effect already belongs to the new entry). Returns `null`
 * when `day` precedes the first entry (the timeline hadn't begun yet — distinct
 * from any particular entry value).
 *
 * The concrete start field differs per timeline (`from`, `startDate`, …), so the
 * caller passes an accessor rather than the helper assuming a field name.
 */
export function latestOnOrBefore<Entry>(
  entries: readonly Entry[],
  day: CalendarDay,
  startDayOf: (entry: Entry) => CalendarDay,
): Entry | null {
  let current: Entry | null = null;
  for (const entry of entries) {
    if (startDayOf(entry) <= day) {
      current = entry;
    } else {
      break; // sorted ascending: no later entry can qualify
    }
  }
  return current;
}
