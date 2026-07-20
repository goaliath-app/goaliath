import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import { latestOnOrBefore } from '@/shared/domain/time/changePointTimeline';
import type { ActivityId } from './Activity';
import type { FixedRecurrenceRule, RecurrenceRule } from './RecurrenceRule';

/** An ActivitySchedule's identity. Branded, like the other entity ids. */
export type ScheduleId = string & { readonly __scheduleId: unique symbol };

/**
 * A quota's target **for the whole period**, expressed in the activityType's
 * metric (domain-model §3). Only ever present on a `quota` schedule.
 */
export type PeriodGoal =
  | { aggregate: 'completedDays'; amount: number } // N days in the period completed
  | { aggregate: 'metricSum'; amount: number }; // the metric summed across the period reaches N

type QuotaRecurrenceRule = Extract<RecurrenceRule, { kind: 'quota' }>;

interface ScheduleBase {
  id: ScheduleId;
  activityId: ActivityId;
  /**
   * Amount (in the activityType's metric) that makes a due/opted-in day count as
   * done; `null` = binary "did it". Always `null` for `checklist` (a day is
   * binary) — that invariant belongs to the activityType, not to the schedule
   * shape, so it stays `number | null` here.
   */
  dayGoal: number | null;
  /**
   * The logical day (§10) this version applies from, until the next version's
   * `startDate` supersedes it (or forever if it's the last). Inclusive.
   */
  startDate: CalendarDay;
}

/**
 * A fixed-recurrence schedule: the due days are deterministic (§4), so there is
 * no period target — `periodGoal` is always `null`.
 */
export interface FixedSchedule extends ScheduleBase {
  recurrenceRule: FixedRecurrenceRule;
  periodGoal: null;
}

/**
 * A quota schedule: the recurrence only names a period, never the days, so "how
 * much for the period" lives in `periodGoal`, which is therefore always present.
 */
export interface QuotaSchedule extends ScheduleBase {
  recurrenceRule: QuotaRecurrenceRule;
  periodGoal: PeriodGoal;
}

/**
 * *When* an Activity is due **and** *how much* counts as done (domain-model §3).
 * Never edited: a new version is appended with a later `startDate` that
 * supersedes the previous one — a change-point timeline exactly like
 * `StatusPeriod` (§0).
 *
 * Modeled as `FixedSchedule | QuotaSchedule` so the §3 invariant "`periodGoal`
 * is present **iff** the recurrence is `quota`" is enforced by the type: an
 * invalid pairing (a fixed rule with a period goal, or a quota rule without one)
 * simply does not compile, instead of relying on a runtime check.
 */
export type ActivitySchedule = FixedSchedule | QuotaSchedule;

/**
 * The schedule version in effect on `day`: the latest whose `startDate <= day`
 * (inclusive), or `null` when `day` precedes the first version (the Activity had
 * no schedule yet). Shares the change-point semantics of `StatusPeriod.periodOn`
 * via `latestOnOrBefore`, so it assumes the list is sorted ascending by
 * `startDate`.
 */
export function scheduleOn(
  schedules: readonly ActivitySchedule[],
  day: CalendarDay,
): ActivitySchedule | null {
  return latestOnOrBefore(schedules, day, (schedule) => schedule.startDate);
}
