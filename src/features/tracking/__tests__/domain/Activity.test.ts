import {
  isEffectivelyActive,
  type Activity,
  type ActivityId,
} from '@/features/tracking/domain/Activity';
import type { Goal, GoalId } from '@/features/tracking/domain/Goal';
import type { StatusPeriod } from '@/features/tracking/domain/StatusPeriod';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const goalId = (value: string): GoalId => value as GoalId;
const activityId = (value: string): ActivityId => value as ActivityId;
const day = (value: string): CalendarDay => value as CalendarDay;

const activeSince = (from: string): StatusPeriod[] => [
  { status: 'active', from: day(from) },
];
const pausedSince = (activeFrom: string, pausedFrom: string): StatusPeriod[] => [
  { status: 'active', from: day(activeFrom) },
  { status: 'paused', from: day(pausedFrom) },
];

const makeGoal = (statusPeriods: StatusPeriod[]): Goal => ({
  id: goalId('goal-1'),
  title: 'Get fit',
  motivation: 'Feel better',
  statusPeriods,
});

const makeActivity = (statusPeriods: StatusPeriod[]): Activity => ({
  id: activityId('activity-1'),
  goalId: goalId('goal-1'),
  title: 'Push-ups',
  description: '',
  activityType: 'checklist',
  statusPeriods,
});

describe('isEffectivelyActive', () => {
  it('is active only when both the goal and the activity are active', () => {
    const goal = makeGoal(activeSince('2024-01-01'));
    const activity = makeActivity(activeSince('2024-01-01'));
    expect(isEffectivelyActive(activity, goal, day('2024-02-01'))).toBe(true);
  });

  it('cascades: a paused goal deactivates an otherwise-active activity', () => {
    const goal = makeGoal(pausedSince('2024-01-01', '2024-03-01'));
    const activity = makeActivity(activeSince('2024-01-01'));
    expect(isEffectivelyActive(activity, goal, day('2024-03-15'))).toBe(false);
  });

  it('is inactive when the activity itself is paused, even under an active goal', () => {
    const goal = makeGoal(activeSince('2024-01-01'));
    const activity = makeActivity(pausedSince('2024-01-01', '2024-03-01'));
    expect(isEffectivelyActive(activity, goal, day('2024-03-15'))).toBe(false);
  });

  it('is inactive before either existed (null status is not active)', () => {
    const goal = makeGoal(activeSince('2024-01-10'));
    const activity = makeActivity(activeSince('2024-01-10'));
    expect(isEffectivelyActive(activity, goal, day('2023-12-31'))).toBe(false);
  });

  it('throws when handed a goal that is not the activity\'s own', () => {
    const goal = makeGoal(activeSince('2024-01-01'));
    const foreignActivity: Activity = {
      ...makeActivity(activeSince('2024-01-01')),
      goalId: goalId('some-other-goal'),
    };
    expect(() =>
      isEffectivelyActive(foreignActivity, goal, day('2024-02-01')),
    ).toThrow(/not activity .* own goal/);
  });
});
