import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import { isEffectivelyActive, type Activity } from './Activity';
import { scheduleOn, type ActivitySchedule } from './ActivitySchedule';
import { isComplete, type ActivityOccurrence } from './ActivityOccurrence';
import type { Goal } from './Goal';
import { isDueOn, isFixed } from './RecurrenceRule';
import { quotaPeriodProgress, type PeriodProgress } from './quotaProgress';

/**
 * The status a day is **shown** as (domain-model §8). `pending`/`done` mirror the
 * persisted `OccurrenceStatus`; `missed` is derived here — a past due day that
 * never reached `done` — and never stored.
 */
export type DisplayStatus = 'pending' | 'done' | 'missed';

/** Everything needed to project **one** Activity on a given day. */
export interface ActivityDayInput {
  activity: Activity;
  goal: Goal; // the activity's own Goal, for the §0 cascade
  schedules: readonly ActivitySchedule[]; // the activity's schedule timeline
  occurrence: ActivityOccurrence | null; // the persisted occurrence for the day, if any
  /**
   * For a **quota** activity, the occurrences inside the period `day` falls in —
   * what scores the `periodGoal`. Empty for fixed recurrences. The caller
   * computes the period's span (it owns `weekStart`), so the projection stays
   * free of calendar-boundary configuration.
   */
  periodOccurrences?: readonly ActivityOccurrence[];
}

export interface BuildDayInput {
  day: CalendarDay; // the logical day to build
  today: CalendarDay; // the user's current logical day, to split pending vs missed
  activities: readonly ActivityDayInput[];
}

/** One projected activity on the day, with its resolved display status. */
export interface DayItem {
  activity: Activity;
  schedule: ActivitySchedule; // the version in effect on the day
  occurrence: ActivityOccurrence | null;
  due: boolean; // whether the recurrence actually made this day due
  displayStatus: DisplayStatus;
  /** Quota only: progress against the period goal. `null` for fixed recurrences. */
  periodProgress: PeriodProgress | null;
}

/**
 * Build the projected view of `day` (domain-model §8 — the calendar is a derived
 * view, not stored). For each active Activity it finds the schedule in effect,
 * asks whether the day is due, and resolves what to show, replacing the
 * generated expectation with a persisted occurrence when one exists.
 *
 * Scope for now: **fixed recurrences only**. `quota` needs the day-by-day opt-in
 * step (§4/§8), which is deferred, so quota schedules are skipped here.
 */
export function buildDay({ day, today, activities }: BuildDayInput): DayItem[] {
  const items: DayItem[] = [];

  for (const {
    activity,
    goal,
    schedules,
    occurrence,
    periodOccurrences = [],
  } of activities) {
    // 1. Cascade (§0): skip anything not effectively active on the day.
    if (!isEffectivelyActive(activity, goal, day)) continue;

    // 2. The schedule version in effect (§3); none yet on this day → skip.
    const schedule = scheduleOn(schedules, day);
    if (schedule === null) continue;

    // 3. A fixed recurrence names its due days; a quota never does — it can't
    //    decide by itself which day counts, so the user opts in day by day (§4).
    const rule = schedule.recurrenceRule;
    const due = isFixed(rule) ? isDueOn(rule, day) : false;

    // A quota therefore *offers* the day instead of requiring it — but only from
    // today onward: past days you never opted into were never a commitment, so
    // they'd only be noise (and, with `due` false, can never read as `missed`).
    const offersCandidate = !isFixed(rule) && day >= today;

    // 4. Include the item if the day is due, if a quota offers it, or if
    //    something was already recorded on it (an off-schedule occurrence can
    //    exist on any day, future-features invariant 3).
    if (!due && !offersCandidate && occurrence === null) continue;

    items.push({
      activity,
      schedule,
      occurrence,
      due,
      displayStatus: resolveDisplayStatus({ day, today, due, occurrence }),
      periodProgress:
        schedule.periodGoal === null
          ? null // a fixed recurrence has no period target (§3)
          : quotaPeriodProgress(periodOccurrences, schedule.periodGoal),
    });
  }

  return items;
}

/**
 * Display status (§8 step 5): a completed occurrence shows as `done`; otherwise a
 * due day in the past is `missed`, and any other case (today/future, or a
 * non-due day carrying a record) is `pending`. `missed`/`pending` are derived
 * here, never stored.
 */
function resolveDisplayStatus({
  day,
  today,
  due,
  occurrence,
}: {
  day: CalendarDay;
  today: CalendarDay;
  due: boolean;
  occurrence: ActivityOccurrence | null;
}): DisplayStatus {
  if (occurrence !== null && isComplete(occurrence)) return 'done';
  if (due && day < today) return 'missed';
  return 'pending';
}
