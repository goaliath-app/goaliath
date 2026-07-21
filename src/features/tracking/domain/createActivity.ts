import { ValidationError } from '@/shared/domain/errors';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import type { Activity, ActivityId, ActivityType } from './Activity';
import type {
  ActivitySchedule,
  PeriodGoal,
  ScheduleId,
} from './ActivitySchedule';
import { isMeasurable } from './activityTypes/registry';
import type { GoalId } from './Goal';
import { isFixed, type RecurrenceRule } from './RecurrenceRule';

export interface CreateActivityInput {
  activityId: ActivityId;
  scheduleId: ScheduleId;
  goalId: GoalId;
  title: string;
  description?: string;
  activityType: ActivityType;
  recurrenceRule: RecurrenceRule;
  dayGoal: number | null;
  periodGoal: PeriodGoal | null;
  /** The logical day both start applying from. */
  activeFrom: CalendarDay;
}

/**
 * The **only** way to make a new Activity — and it returns its first
 * `ActivitySchedule` with it, because §3 says every Activity always has at least
 * one. Creating them together is what stops a half-created activity existing:
 * one with no schedule is invisible to the projection (`scheduleOn` returns
 * `null`, `buildDay` skips it), so it could never be seen or fixed from the app.
 * The repository writes both in a single operation for the same reason.
 *
 * Enforces the §3 invariants that the type system can't:
 * - `dayGoal` must be `null` for a type with no metric (a `checklist` day is
 *   binary — there is no amount to reach).
 * - a `metricSum` period goal only makes sense for a **measurable** type.
 * - `periodGoal` is present iff the recurrence is a `quota`.
 *
 * @throws {ValidationError} on any of the above, or on a malformed recurrence.
 */
export function createActivity(input: CreateActivityInput): {
  activity: Activity;
  schedule: ActivitySchedule;
} {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new ValidationError('An activity needs a title');
  }

  assertValidRecurrence(input.recurrenceRule);
  assertValidDayGoal(input.dayGoal, input.activityType);

  const activity: Activity = {
    id: input.activityId,
    goalId: input.goalId,
    title,
    description: input.description?.trim() ?? '',
    activityType: input.activityType,
    statusPeriods: [{ status: 'active', from: input.activeFrom }],
  };

  const base = {
    id: input.scheduleId,
    activityId: input.activityId,
    dayGoal: input.dayGoal,
    startDate: input.activeFrom,
  };

  if (isFixed(input.recurrenceRule)) {
    if (input.periodGoal !== null) {
      throw new ValidationError(
        'A period goal only applies to a quota recurrence; fixed recurrences have none',
      );
    }
    return {
      activity,
      schedule: { ...base, recurrenceRule: input.recurrenceRule, periodGoal: null },
    };
  }

  if (input.periodGoal === null) {
    throw new ValidationError('A quota recurrence needs a period goal');
  }
  assertValidPeriodGoal(input.periodGoal, input.activityType);

  return {
    activity,
    schedule: {
      ...base,
      recurrenceRule: input.recurrenceRule,
      periodGoal: input.periodGoal,
    },
  };
}

function assertValidDayGoal(
  dayGoal: number | null,
  activityType: ActivityType,
): void {
  if (dayGoal === null) return; // the binary "did it" — always allowed
  if (!isMeasurable(activityType)) {
    throw new ValidationError(
      `A ${activityType} day is binary, so it cannot have a day goal`,
    );
  }
  assertPositiveInteger(dayGoal, 'A day goal');
}

function assertValidPeriodGoal(
  periodGoal: PeriodGoal,
  activityType: ActivityType,
): void {
  if (periodGoal.aggregate === 'metricSum' && !isMeasurable(activityType)) {
    throw new ValidationError(
      `A ${activityType} has no metric to sum, so its quota must count completed days instead`,
    );
  }
  assertPositiveInteger(periodGoal.amount, 'A period goal amount');
}

function assertValidRecurrence(rule: RecurrenceRule): void {
  switch (rule.kind) {
    case 'daily':
    case 'quota':
      return;
    case 'weekly':
      assertNonEmpty(rule.daysOfWeek, 'weekly recurrence', 'weekday');
      rule.daysOfWeek.forEach((weekday) => assertInRange(weekday, 1, 7, 'A weekday'));
      return;
    case 'monthly':
      assertNonEmpty(rule.daysOfMonth, 'monthly recurrence', 'day');
      rule.daysOfMonth.forEach((day) => assertInRange(day, 1, 31, 'A day of the month'));
      return;
    case 'yearly':
      assertNonEmpty(rule.datesOfYear, 'yearly recurrence', 'date');
      rule.datesOfYear.forEach((date) => {
        assertInRange(date.month, 1, 12, 'A month');
        assertInRange(date.day, 1, 31, 'A day of the month');
      });
      return;
  }
}

/** An empty day list would make an activity that is never due — silently useless. */
function assertNonEmpty(
  values: readonly unknown[],
  ruleName: string,
  itemName: string,
): void {
  if (values.length === 0) {
    throw new ValidationError(`A ${ruleName} needs at least one ${itemName}`);
  }
}

function assertInRange(
  value: number,
  minimum: number,
  maximum: number,
  label: string,
): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ValidationError(
      `${label} must be an integer in [${minimum}, ${maximum}], got ${value}`,
    );
  }
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${label} must be a positive integer, got ${value}`);
  }
}
