import type { GoalId } from '../../domain/Goal';
import {
  buildCreateActivityInput,
  buildDayGoal,
  effectiveAggregate,
  emptyActivityDraft,
  parsePositiveInteger,
  validateActivityDraft,
  type ActivityDraft,
} from '../../ui/model/activityDraft';

const GOAL_ID = 'goal-1' as GoalId;

function draftWith(changes: Partial<ActivityDraft>): ActivityDraft {
  return {
    ...emptyActivityDraft(),
    goal: { kind: 'existing', goalId: GOAL_ID },
    title: 'Correr',
    ...changes,
  };
}

describe('parsePositiveInteger', () => {
  it.each(['1', ' 30 ', '007'])('accepts %p', (raw) => {
    expect(parsePositiveInteger(raw)).toBeGreaterThan(0);
  });

  it.each(['', '0', '-3', '2.5', 'abc', '3a'])('rejects %p', (raw) => {
    expect(parsePositiveInteger(raw)).toBeNull();
  });
});

describe('validateActivityDraft', () => {
  it('accepts a minimal valid draft', () => {
    expect(validateActivityDraft(draftWith({}))).toEqual({});
  });

  it('requires a goal to be picked', () => {
    const errors = validateActivityDraft(
      draftWith({ goal: { kind: 'existing', goalId: null } }),
    );
    expect(errors.goal).toBe('goalRequired');
  });

  it('requires a title for a brand-new goal', () => {
    const errors = validateActivityDraft(
      draftWith({ goal: { kind: 'new', title: '   ', motivation: '' } }),
    );
    expect(errors.goal).toBe('goalTitleRequired');
  });

  it('requires an activity title', () => {
    expect(validateActivityDraft(draftWith({ title: '  ' })).title).toBe(
      'titleRequired',
    );
  });

  it('requires at least one weekday when the recurrence is weekly', () => {
    expect(
      validateActivityDraft(draftWith({ recurrence: 'weekly', daysOfWeek: [] }))
        .daysOfWeek,
    ).toBe('weekdaysRequired');
    expect(
      validateActivityDraft(draftWith({ recurrence: 'weekly', daysOfWeek: [3] }))
        .daysOfWeek,
    ).toBeUndefined();
  });

  it('requires an amount for a quota, and rejects a non-positive one', () => {
    expect(
      validateActivityDraft(draftWith({ recurrence: 'quota' })).periodGoal,
    ).toBe('periodAmountRequired');
    expect(
      validateActivityDraft(
        draftWith({ recurrence: 'quota', periodGoalAmount: '0' }),
      ).periodGoal,
    ).toBe('periodAmountInvalid');
    expect(
      validateActivityDraft(
        draftWith({ recurrence: 'quota', periodGoalAmount: '3' }),
      ).periodGoal,
    ).toBeUndefined();
  });

  it('rejects a malformed day goal, and ignores a blank one', () => {
    expect(
      validateActivityDraft(
        draftWith({ activityType: 'counter', dayGoal: 'many' }),
      ).dayGoal,
    ).toBe('dayGoalInvalid');
    expect(
      validateActivityDraft(draftWith({ activityType: 'counter', dayGoal: '' }))
        .dayGoal,
    ).toBeUndefined();
  });

  it('ignores the day goal field entirely for a checklist', () => {
    expect(
      validateActivityDraft(
        draftWith({ activityType: 'checklist', dayGoal: 'nonsense' }),
      ).dayGoal,
    ).toBeUndefined();
  });
});

describe('buildDayGoal', () => {
  it('is always null for a non-measurable type', () => {
    expect(
      buildDayGoal(draftWith({ activityType: 'checklist', dayGoal: '5' })),
    ).toBeNull();
  });

  it('is null when left blank on a measurable type (binary "did it")', () => {
    expect(buildDayGoal(draftWith({ activityType: 'counter' }))).toBeNull();
  });

  it('passes a counter target through as a count', () => {
    expect(
      buildDayGoal(draftWith({ activityType: 'counter', dayGoal: '30' })),
    ).toBe(30);
  });

  it('takes a timer target as the seconds it already is', () => {
    // The `hh:mm:ss` field converts on the way in, so nothing is rescaled here.
    expect(
      buildDayGoal(draftWith({ activityType: 'timer', dayGoal: '1200' })),
    ).toBe(1200);
  });
});

describe('effectiveAggregate', () => {
  it('falls back to completedDays for a type with no metric to sum', () => {
    expect(
      effectiveAggregate(
        draftWith({ activityType: 'checklist', periodGoalAggregate: 'metricSum' }),
      ),
    ).toBe('completedDays');
  });

  it('honours metricSum for a measurable type', () => {
    expect(
      effectiveAggregate(
        draftWith({ activityType: 'counter', periodGoalAggregate: 'metricSum' }),
      ),
    ).toBe('metricSum');
  });
});

describe('buildCreateActivityInput', () => {
  it('returns null for an invalid draft', () => {
    expect(buildCreateActivityInput(draftWith({ title: '' }))).toBeNull();
  });

  it('builds a daily checklist with no targets', () => {
    expect(buildCreateActivityInput(draftWith({}))).toEqual({
      goal: { kind: 'existing', goalId: GOAL_ID },
      title: 'Correr',
      description: undefined,
      activityType: 'checklist',
      recurrenceRule: { kind: 'daily' },
      dayGoal: null,
      periodGoal: null,
    });
  });

  it('trims the title and drops a blank description', () => {
    const input = buildCreateActivityInput(
      draftWith({ title: '  Correr  ', description: '   ' }),
    );
    expect(input?.title).toBe('Correr');
    expect(input?.description).toBeUndefined();
  });

  it('carries a new goal through, dropping a blank motivation', () => {
    const input = buildCreateActivityInput(
      draftWith({ goal: { kind: 'new', title: ' Estar en forma ', motivation: '  ' } }),
    );
    expect(input?.goal).toEqual({ kind: 'new', title: 'Estar en forma', motivation: undefined });
  });

  it('sorts the weekdays of a weekly rule', () => {
    const input = buildCreateActivityInput(
      draftWith({ recurrence: 'weekly', daysOfWeek: [5, 1, 3] }),
    );
    expect(input?.recurrenceRule).toEqual({ kind: 'weekly', daysOfWeek: [1, 3, 5] });
    expect(input?.periodGoal).toBeNull();
  });

  it('gives a quota a completedDays period goal', () => {
    const input = buildCreateActivityInput(
      draftWith({ recurrence: 'quota', quotaPeriod: 'week', periodGoalAmount: '3' }),
    );
    expect(input?.recurrenceRule).toEqual({ kind: 'quota', period: 'week' });
    expect(input?.periodGoal).toEqual({ aggregate: 'completedDays', amount: 3 });
  });

  it('takes a timer metricSum quota as the seconds it already is', () => {
    const input = buildCreateActivityInput(
      draftWith({
        activityType: 'timer',
        recurrence: 'quota',
        quotaPeriod: 'month',
        periodGoalAggregate: 'metricSum',
        periodGoalAmount: '3600',
      }),
    );
    expect(input?.periodGoal).toEqual({ aggregate: 'metricSum', amount: 3600 });
  });

  it('never gives a checklist a metricSum quota', () => {
    const input = buildCreateActivityInput(
      draftWith({
        activityType: 'checklist',
        recurrence: 'quota',
        periodGoalAggregate: 'metricSum',
        periodGoalAmount: '4',
      }),
    );
    expect(input?.periodGoal).toEqual({ aggregate: 'completedDays', amount: 4 });
  });

  it('leaves periodGoal null for every fixed recurrence', () => {
    expect(buildCreateActivityInput(draftWith({}))?.periodGoal).toBeNull();
    expect(
      buildCreateActivityInput(
        draftWith({ recurrence: 'weekly', daysOfWeek: [2] }),
      )?.periodGoal,
    ).toBeNull();
  });
});
