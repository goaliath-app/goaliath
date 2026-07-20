import { type Activity, type ActivityId } from '@/features/tracking/domain/Activity';
import {
  type ActivityOccurrence,
  type OccurrenceStatus,
} from '@/features/tracking/domain/ActivityOccurrence';
import {
  type ActivitySchedule,
  type ScheduleId,
} from '@/features/tracking/domain/ActivitySchedule';
import { emptyChecklistProgress } from '@/features/tracking/domain/activityTypes/checklist';
import type { Goal, GoalId } from '@/features/tracking/domain/Goal';
import type { RecurrenceRule } from '@/features/tracking/domain/RecurrenceRule';
import type { StatusPeriod } from '@/features/tracking/domain/StatusPeriod';
import {
  buildDay,
  type ActivityDayInput,
} from '@/features/tracking/domain/projection';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const day = (value: string): CalendarDay => value as CalendarDay;
const goalId = (value: string): GoalId => value as GoalId;
const activityId = (value: string): ActivityId => value as ActivityId;
const scheduleId = (value: string): ScheduleId => value as ScheduleId;

const activeSince = (from: string): StatusPeriod[] => [
  { status: 'active', from: day(from) },
];
const pausedSince = (activeFrom: string, pausedFrom: string): StatusPeriod[] => [
  { status: 'active', from: day(activeFrom) },
  { status: 'paused', from: day(pausedFrom) },
];

const goal = (statusPeriods: StatusPeriod[] = activeSince('2024-01-01')): Goal => ({
  id: goalId('goal-1'),
  title: 'Get fit',
  motivation: 'Feel better',
  statusPeriods,
});

const activity = (
  statusPeriods: StatusPeriod[] = activeSince('2024-01-01'),
): Activity => ({
  id: activityId('activity-1'),
  goalId: goalId('goal-1'),
  title: 'Meditate',
  description: '',
  activityType: 'checklist',
  statusPeriods,
});

const schedule = (
  recurrenceRule: RecurrenceRule,
  startDate = '2024-01-01',
): ActivitySchedule => {
  const base = {
    id: scheduleId('schedule-1'),
    activityId: activityId('activity-1'),
    dayGoal: null,
    startDate: day(startDate),
  };
  return recurrenceRule.kind === 'quota'
    ? { ...base, recurrenceRule, periodGoal: { aggregate: 'completedDays', amount: 3 } }
    : { ...base, recurrenceRule, periodGoal: null };
};

const occurrence = (status: OccurrenceStatus): ActivityOccurrence => ({
  activityId: activityId('activity-1'),
  scheduleId: scheduleId('schedule-1'),
  date: day('2024-06-15'),
  status,
  completedAt: status === 'done' ? new Date('2024-06-15T09:00:00Z') : null,
  notes: null,
  origin: 'recurrence',
  progress: emptyChecklistProgress(),
});

const daily = (over: Partial<ActivityDayInput> = {}): ActivityDayInput => ({
  activity: activity(),
  goal: goal(),
  schedules: [schedule({ kind: 'daily' })],
  occurrence: null,
  ...over,
});

// A fixed reference "today" for pending-vs-missed. 2024-06-15 is a Saturday.
const TODAY = day('2024-06-15');

describe('buildDay — display status for a due daily checklist', () => {
  it('today, nothing recorded → pending', () => {
    const [item] = buildDay({ day: TODAY, today: TODAY, activities: [daily()] });
    expect(item.displayStatus).toBe('pending');
    expect(item.due).toBe(true);
  });

  it('a future due day → pending', () => {
    const [item] = buildDay({
      day: day('2024-06-20'),
      today: TODAY,
      activities: [daily()],
    });
    expect(item.displayStatus).toBe('pending');
  });

  it('a past due day with nothing recorded → missed', () => {
    const [item] = buildDay({
      day: day('2024-06-10'),
      today: TODAY,
      activities: [daily()],
    });
    expect(item.displayStatus).toBe('missed');
  });

  it('a done occurrence → done, even in the past', () => {
    const [item] = buildDay({
      day: day('2024-06-10'),
      today: TODAY,
      activities: [daily({ occurrence: occurrence('done') })],
    });
    expect(item.displayStatus).toBe('done');
  });

  it('a past due day with a pending occurrence → missed', () => {
    const [item] = buildDay({
      day: day('2024-06-10'),
      today: TODAY,
      activities: [daily({ occurrence: occurrence('pending') })],
    });
    expect(item.displayStatus).toBe('missed');
  });
});

describe('buildDay — which activities appear', () => {
  it('drops an activity that is not due and has no occurrence (weekly, wrong weekday)', () => {
    // 2024-06-15 is a Saturday (ISO 6); a Mon/Wed/Fri schedule is not due.
    const monWedFri: RecurrenceRule = { kind: 'weekly', daysOfWeek: [1, 3, 5] };
    const items = buildDay({
      day: TODAY,
      today: TODAY,
      activities: [daily({ schedules: [schedule(monWedFri)] })],
    });
    expect(items).toHaveLength(0);
  });

  it('keeps a not-due day when an occurrence was recorded there (off-schedule)', () => {
    const monWedFri: RecurrenceRule = { kind: 'weekly', daysOfWeek: [1, 3, 5] };
    const [item] = buildDay({
      day: TODAY,
      today: TODAY,
      activities: [
        daily({ schedules: [schedule(monWedFri)], occurrence: occurrence('done') }),
      ],
    });
    expect(item.due).toBe(false);
    expect(item.displayStatus).toBe('done');
  });

  it('drops an activity deactivated by the cascade (its goal is paused)', () => {
    const items = buildDay({
      day: TODAY,
      today: TODAY,
      activities: [daily({ goal: goal(pausedSince('2024-01-01', '2024-05-01')) })],
    });
    expect(items).toHaveLength(0);
  });

  it('drops an activity paused in its own timeline', () => {
    const items = buildDay({
      day: TODAY,
      today: TODAY,
      activities: [
        daily({ activity: activity(pausedSince('2024-01-01', '2024-05-01')) }),
      ],
    });
    expect(items).toHaveLength(0);
  });

  it('skips quota schedules for now (opt-in deferred)', () => {
    const items = buildDay({
      day: TODAY,
      today: TODAY,
      activities: [daily({ schedules: [schedule({ kind: 'quota', period: 'week' })] })],
    });
    expect(items).toHaveLength(0);
  });

  it('drops an activity with no schedule in effect yet (day before its first startDate)', () => {
    const items = buildDay({
      day: day('2023-12-31'),
      today: TODAY,
      activities: [daily({ schedules: [schedule({ kind: 'daily' }, '2024-01-01')] })],
    });
    expect(items).toHaveLength(0);
  });

  it('projects several activities independently', () => {
    const other: ActivityDayInput = {
      ...daily(),
      activity: { ...activity(), id: activityId('activity-2') },
    };
    const items = buildDay({
      day: TODAY,
      today: TODAY,
      activities: [daily(), other],
    });
    expect(items).toHaveLength(2);
  });
});
