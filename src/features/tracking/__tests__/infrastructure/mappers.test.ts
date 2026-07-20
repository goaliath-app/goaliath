import { toActivity } from '@/features/tracking/infrastructure/mappers/ActivityMapper';
import {
  toActivityOccurrence,
  toActivityOccurrenceRow,
  type ActivityOccurrenceRow,
} from '@/features/tracking/infrastructure/mappers/ActivityOccurrenceMapper';
import {
  toActivitySchedule,
  type ActivityScheduleRow,
} from '@/features/tracking/infrastructure/mappers/ActivityScheduleMapper';
import { toGoal } from '@/features/tracking/infrastructure/mappers/GoalMapper';

describe('GoalMapper / ActivityMapper', () => {
  it('reassembles a Goal with its ordered status timeline', () => {
    const goal = toGoal({ id: 'goal-1', title: 'Get fit', motivation: 'Health' }, [
      { status: 'active', from_day: '2024-01-01' },
      { status: 'paused', from_day: '2024-03-01' },
    ]);
    expect(goal.id).toBe('goal-1');
    expect(goal.statusPeriods).toEqual([
      { status: 'active', from: '2024-01-01' },
      { status: 'paused', from: '2024-03-01' },
    ]);
  });

  it('reassembles an Activity with goal reference and type', () => {
    const activity = toActivity(
      {
        id: 'activity-1',
        goal_id: 'goal-1',
        title: 'Meditate',
        description: '',
        activity_type: 'checklist',
      },
      [{ status: 'active', from_day: '2024-01-01' }],
    );
    expect(activity.goalId).toBe('goal-1');
    expect(activity.activityType).toBe('checklist');
    expect(activity.statusPeriods).toHaveLength(1);
  });
});

describe('ActivityScheduleMapper', () => {
  const baseRow: ActivityScheduleRow = {
    id: 'schedule-1',
    activity_id: 'activity-1',
    recurrence_rule: JSON.stringify({ kind: 'daily' }),
    day_goal: null,
    period_goal: null,
    start_date: '2024-01-01',
  };

  it('maps a fixed-recurrence row to a FixedSchedule (periodGoal null)', () => {
    const schedule = toActivitySchedule(baseRow);
    expect(schedule.recurrenceRule).toEqual({ kind: 'daily' });
    expect(schedule.periodGoal).toBeNull();
    expect(schedule.startDate).toBe('2024-01-01');
  });

  it('maps a quota row to a QuotaSchedule with its period goal', () => {
    const schedule = toActivitySchedule({
      ...baseRow,
      recurrence_rule: JSON.stringify({ kind: 'quota', period: 'week' }),
      period_goal: JSON.stringify({ aggregate: 'completedDays', amount: 3 }),
    });
    expect(schedule.recurrenceRule.kind).toBe('quota');
    expect(schedule.periodGoal).toEqual({ aggregate: 'completedDays', amount: 3 });
  });

  it('fails loudly on a corrupt quota row without period_goal', () => {
    const corrupt = {
      ...baseRow,
      recurrence_rule: JSON.stringify({ kind: 'quota', period: 'week' }),
      period_goal: null,
    };
    expect(() => toActivitySchedule(corrupt)).toThrow(/quota recurrence without/);
  });
});

describe('ActivityOccurrenceMapper', () => {
  const doneRow: ActivityOccurrenceRow = {
    activity_id: 'activity-1',
    date: '2024-06-15',
    schedule_id: 'schedule-1',
    status: 'done',
    completed_at: '2024-06-15T09:00:00.000Z',
    notes: null,
    origin: 'recurrence',
    progress: '{}',
  };

  it('parses completed_at into a Date and progress from JSON', () => {
    const occurrence = toActivityOccurrence(doneRow);
    expect(occurrence.completedAt).toEqual(new Date('2024-06-15T09:00:00.000Z'));
    expect(occurrence.progress).toEqual({});
  });

  it('keeps a pending occurrence completed_at as null', () => {
    const occurrence = toActivityOccurrence({
      ...doneRow,
      status: 'pending',
      completed_at: null,
    });
    expect(occurrence.completedAt).toBeNull();
  });

  it('round-trips domain -> row -> domain unchanged', () => {
    const occurrence = toActivityOccurrence(doneRow);
    expect(toActivityOccurrence(toActivityOccurrenceRow(occurrence))).toEqual(
      occurrence,
    );
  });
});
