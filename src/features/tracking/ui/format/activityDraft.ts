import type {
  CreateActivityInput,
  GoalSelection,
} from '../../application/createActivity';
import type { ActivityType } from '../../domain/Activity';
import type { PeriodGoal } from '../../domain/ActivitySchedule';
import { behaviourFor, isMeasurable } from '../../domain/activityTypes/registry';
import type { ActivityMetric } from '../../domain/activityTypes/registry';
import type { GoalId } from '../../domain/Goal';
import type {
  FixedRecurrenceRule,
  RecurrenceRule,
} from '../../domain/RecurrenceRule';

/**
 * The **draft** the create-activity form edits, and the pure functions that
 * validate it and turn it into a `CreateActivityInput`.
 *
 * It lives in `ui/` on purpose: a half-filled form is not a domain concept. The
 * draft keeps numeric fields as raw strings (that's what a `TextInput` holds)
 * and keeps *every* branch's value around, so toggling "weekly" and back doesn't
 * lose what the user already typed. Nothing here touches React or React Native,
 * so it is unit-testable on its own.
 */

/**
 * The cadences the create form offers. §4 also defines `monthly` and `yearly`,
 * deliberately not surfaced here yet (`future-features.md`).
 */
export type RecurrenceChoice = 'daily' | 'weekly' | 'quota';

export type QuotaPeriod = 'week' | 'month' | 'year';

export type PeriodGoalAggregate = PeriodGoal['aggregate'];

/** Mirrors `GoalSelection`, but with "nothing picked yet" representable. */
export type GoalChoice =
  | { kind: 'existing'; goalId: GoalId | null }
  | { kind: 'new'; title: string; motivation: string };

export interface ActivityDraft {
  goal: GoalChoice;
  title: string;
  description: string;
  /** An explicit user choice (§2/§7) — never derived from the other switches. */
  activityType: ActivityType;
  recurrence: RecurrenceChoice;
  /** ISO weekdays 1..7 (Mon..Sun); only read when `recurrence === 'weekly'`. */
  daysOfWeek: number[];
  /** Only read when `recurrence === 'quota'`. */
  quotaPeriod: QuotaPeriod;
  /**
   * Raw text, already in the activityType's own unit — a count, or **seconds**
   * for a duration. Only offered for measurable types; blank = binary "did it".
   */
  dayGoal: string;
  periodGoalAggregate: PeriodGoalAggregate;
  /** Raw text, in the same unit as `dayGoal`. Only read when `recurrence === 'quota'`. */
  periodGoalAmount: string;
}

export function emptyActivityDraft(): ActivityDraft {
  return {
    goal: { kind: 'existing', goalId: null },
    title: '',
    description: '',
    activityType: 'checklist',
    recurrence: 'daily',
    daysOfWeek: [],
    quotaPeriod: 'week',
    dayGoal: '',
    periodGoalAggregate: 'completedDays',
    periodGoalAmount: '',
  };
}

export function metricOf(activityType: ActivityType): ActivityMetric {
  return behaviourFor(activityType).metric;
}

/**
 * The aggregate actually in force: `metricSum` is only scorable for a measurable
 * type (§3), so a non-measurable type silently falls back to counting days
 * rather than producing an activity nothing can score.
 */
export function effectiveAggregate(draft: ActivityDraft): PeriodGoalAggregate {
  return isMeasurable(draft.activityType)
    ? draft.periodGoalAggregate
    : 'completedDays';
}

/** Whether the period amount is expressed in the activityType's metric. */
export function periodAmountUsesMetric(draft: ActivityDraft): boolean {
  return effectiveAggregate(draft) === 'metricSum';
}

export function parsePositiveInteger(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isInteger(value) && value > 0 ? value : null;
}

// --- validation -------------------------------------------------------------

export type ActivityDraftErrorCode =
  | 'goalRequired'
  | 'goalTitleRequired'
  | 'titleRequired'
  | 'weekdaysRequired'
  | 'dayGoalInvalid'
  | 'periodAmountRequired'
  | 'periodAmountInvalid';

export interface ActivityDraftErrors {
  goal?: ActivityDraftErrorCode;
  title?: ActivityDraftErrorCode;
  daysOfWeek?: ActivityDraftErrorCode;
  dayGoal?: ActivityDraftErrorCode;
  periodGoal?: ActivityDraftErrorCode;
}

export function validateActivityDraft(draft: ActivityDraft): ActivityDraftErrors {
  const errors: ActivityDraftErrors = {};

  if (draft.goal.kind === 'existing') {
    if (draft.goal.goalId === null) errors.goal = 'goalRequired';
  } else if (draft.goal.title.trim().length === 0) {
    errors.goal = 'goalTitleRequired';
  }

  if (draft.title.trim().length === 0) errors.title = 'titleRequired';

  if (draft.recurrence === 'weekly' && draft.daysOfWeek.length === 0) {
    errors.daysOfWeek = 'weekdaysRequired';
  }

  if (
    isMeasurable(draft.activityType) &&
    draft.dayGoal.trim().length > 0 &&
    parsePositiveInteger(draft.dayGoal) === null
  ) {
    errors.dayGoal = 'dayGoalInvalid';
  }

  if (draft.recurrence === 'quota') {
    if (draft.periodGoalAmount.trim().length === 0) {
      errors.periodGoal = 'periodAmountRequired';
    } else if (parsePositiveInteger(draft.periodGoalAmount) === null) {
      errors.periodGoal = 'periodAmountInvalid';
    }
  }

  return errors;
}

export function isActivityDraftValid(draft: ActivityDraft): boolean {
  return Object.keys(validateActivityDraft(draft)).length === 0;
}

// --- draft -> use-case input ------------------------------------------------

type QuotaRecurrenceRule = Extract<RecurrenceRule, { kind: 'quota' }>;

/**
 * The §3 invariant "`periodGoal` is present **iff** the recurrence is a quota",
 * expressed as a union so the compiler enforces it here too — the same shape
 * `FixedSchedule | QuotaSchedule` uses. No cast is needed anywhere below.
 */
type ScheduleShape =
  | { recurrenceRule: FixedRecurrenceRule; periodGoal: null }
  | { recurrenceRule: QuotaRecurrenceRule; periodGoal: PeriodGoal };

function buildScheduleShape(draft: ActivityDraft): ScheduleShape | null {
  switch (draft.recurrence) {
    case 'daily':
      return { recurrenceRule: { kind: 'daily' }, periodGoal: null };
    case 'weekly':
      if (draft.daysOfWeek.length === 0) return null;
      return {
        recurrenceRule: {
          kind: 'weekly',
          daysOfWeek: [...draft.daysOfWeek].sort((a, b) => a - b),
        },
        periodGoal: null,
      };
    case 'quota': {
      const amount = parsePositiveInteger(draft.periodGoalAmount);
      if (amount === null) return null;
      const aggregate = effectiveAggregate(draft);
      return {
        recurrenceRule: { kind: 'quota', period: draft.quotaPeriod },
        periodGoal:
          aggregate === 'metricSum'
            ? { aggregate: 'metricSum', amount }
            : { aggregate: 'completedDays', amount },
      };
    }
  }
}

/** Narrows the draft's "nothing picked yet" shape into the domain's union. */
function buildGoalSelection(choice: GoalChoice): GoalSelection | null {
  if (choice.kind === 'new') {
    const title = choice.title.trim();
    if (title.length === 0) return null;
    const motivation = choice.motivation.trim();
    return {
      kind: 'new',
      title,
      motivation: motivation.length > 0 ? motivation : undefined,
    };
  }
  return choice.goalId === null
    ? null
    : { kind: 'existing', goalId: choice.goalId };
}

/**
 * The day target, in the activityType's metric — always `null` when not
 * measurable (§3). Both metrics are already stored in their final unit: a count
 * is a count, and a duration is **seconds** (the `hh:mm:ss` field converts on
 * the way in, see `ui/format/duration`), so nothing is converted here.
 */
export function buildDayGoal(draft: ActivityDraft): number | null {
  if (!isMeasurable(draft.activityType)) return null;
  return parsePositiveInteger(draft.dayGoal);
}

/**
 * Turns a draft into the use-case input, or `null` if the draft is not valid —
 * so a caller cannot submit something the domain constructors would reject.
 */
export function buildCreateActivityInput(
  draft: ActivityDraft,
): CreateActivityInput | null {
  if (!isActivityDraftValid(draft)) return null;

  const schedule = buildScheduleShape(draft);
  if (schedule === null) return null;

  const goal = buildGoalSelection(draft.goal);
  if (goal === null) return null;

  const description = draft.description.trim();

  return {
    goal,
    title: draft.title.trim(),
    description: description.length > 0 ? description : undefined,
    activityType: draft.activityType,
    ...schedule,
    dayGoal: buildDayGoal(draft),
  };
}
