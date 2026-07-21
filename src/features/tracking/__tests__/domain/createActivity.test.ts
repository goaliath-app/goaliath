import type { ActivityType } from '@/features/tracking/domain/Activity';
import type { PeriodGoal } from '@/features/tracking/domain/ActivitySchedule';
import {
  createActivity,
  type CreateActivityInput,
} from '@/features/tracking/domain/createActivity';
import { createGoal } from '@/features/tracking/domain/Goal';
import type { RecurrenceRule } from '@/features/tracking/domain/RecurrenceRule';
import { ValidationError } from '@/shared/domain/errors';
import {
  asActivityId,
  asDay,
  asGoalId,
  asScheduleId,
} from '../support/trackingFakes';

const input = (over: Partial<CreateActivityInput> = {}): CreateActivityInput => ({
  activityId: asActivityId('activity-1'),
  scheduleId: asScheduleId('schedule-1'),
  goalId: asGoalId('goal-1'),
  title: 'Meditate',
  activityType: 'checklist',
  recurrenceRule: { kind: 'daily' },
  dayGoal: null,
  periodGoal: null,
  activeFrom: asDay('2024-06-15'),
  ...over,
});

describe('createGoal', () => {
  it('opens an active status period on the given day', () => {
    const goal = createGoal({
      id: asGoalId('goal-1'),
      title: 'Health',
      activeFrom: asDay('2024-06-15'),
    });
    expect(goal.statusPeriods).toEqual([
      { status: 'active', from: '2024-06-15' },
    ]);
    expect(goal.motivation).toBe(''); // optional, defaults to empty
  });

  it('trims the title and rejects a blank one', () => {
    expect(
      createGoal({
        id: asGoalId('goal-1'),
        title: '  Health  ',
        activeFrom: asDay('2024-06-15'),
      }).title,
    ).toBe('Health');

    expect(() =>
      createGoal({
        id: asGoalId('goal-1'),
        title: '   ',
        activeFrom: asDay('2024-06-15'),
      }),
    ).toThrow(ValidationError);
  });
});

describe('createActivity — the activity is born with its schedule', () => {
  it('returns both, active and applying from the same day', () => {
    const { activity, schedule } = createActivity(input());

    expect(activity.statusPeriods).toEqual([
      { status: 'active', from: '2024-06-15' },
    ]);
    expect(schedule.activityId).toBe(activity.id);
    expect(schedule.startDate).toBe('2024-06-15');
    expect(schedule.periodGoal).toBeNull();
  });

  it('rejects a blank title', () => {
    expect(() => createActivity(input({ title: '  ' }))).toThrow(ValidationError);
  });
});

describe('createActivity — §3 invariants the type system cannot enforce', () => {
  it('rejects a day goal on a checklist (a checklist day is binary)', () => {
    expect(() =>
      createActivity(input({ activityType: 'checklist', dayGoal: 10 })),
    ).toThrow(/binary/);
  });

  it.each<ActivityType>(['counter', 'timer'])(
    'allows a day goal on a measurable type (%s)',
    (activityType) => {
      expect(
        createActivity(input({ activityType, dayGoal: 10 })).schedule.dayGoal,
      ).toBe(10);
    },
  );

  it('rejects a metricSum quota on a checklist (no metric to sum)', () => {
    const metricSum: PeriodGoal = { aggregate: 'metricSum', amount: 12 };
    expect(() =>
      createActivity(
        input({
          activityType: 'checklist',
          recurrenceRule: { kind: 'quota', period: 'week' },
          periodGoal: metricSum,
        }),
      ),
    ).toThrow(/no metric to sum/);
  });

  it('allows a completedDays quota on a checklist', () => {
    const { schedule } = createActivity(
      input({
        recurrenceRule: { kind: 'quota', period: 'week' },
        periodGoal: { aggregate: 'completedDays', amount: 3 },
      }),
    );
    expect(schedule.periodGoal).toEqual({
      aggregate: 'completedDays',
      amount: 3,
    });
  });

  it('rejects a quota with no period goal', () => {
    expect(() =>
      createActivity(input({ recurrenceRule: { kind: 'quota', period: 'week' } })),
    ).toThrow(/needs a period goal/);
  });

  it('rejects a period goal on a fixed recurrence', () => {
    expect(() =>
      createActivity(
        input({ periodGoal: { aggregate: 'completedDays', amount: 3 } }),
      ),
    ).toThrow(/only applies to a quota/);
  });

  it.each([0, -1, 2.5])('rejects a non-positive-integer goal amount (%p)', (amount) => {
    expect(() =>
      createActivity(input({ activityType: 'counter', dayGoal: amount })),
    ).toThrow(ValidationError);
  });
});

describe('createActivity — recurrence validation', () => {
  it('rejects a weekly recurrence with no weekdays (never due, silently useless)', () => {
    const empty: RecurrenceRule = { kind: 'weekly', daysOfWeek: [] };
    expect(() => createActivity(input({ recurrenceRule: empty }))).toThrow(
      /at least one weekday/,
    );
  });

  it('rejects an out-of-range weekday', () => {
    const invalid: RecurrenceRule = { kind: 'weekly', daysOfWeek: [1, 8] };
    expect(() => createActivity(input({ recurrenceRule: invalid }))).toThrow(
      ValidationError,
    );
  });

  it('rejects an out-of-range day of the month', () => {
    const invalid: RecurrenceRule = { kind: 'monthly', daysOfMonth: [0] };
    expect(() => createActivity(input({ recurrenceRule: invalid }))).toThrow(
      ValidationError,
    );
  });

  it('rejects an out-of-range month in a yearly recurrence', () => {
    const invalid: RecurrenceRule = {
      kind: 'yearly',
      datesOfYear: [{ month: 13, day: 1 }],
    };
    expect(() => createActivity(input({ recurrenceRule: invalid }))).toThrow(
      ValidationError,
    );
  });

  it('accepts valid fixed recurrences', () => {
    const monWedFri: RecurrenceRule = { kind: 'weekly', daysOfWeek: [1, 3, 5] };
    expect(
      createActivity(input({ recurrenceRule: monWedFri })).schedule.recurrenceRule,
    ).toEqual(monWedFri);
  });
});
