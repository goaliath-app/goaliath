import type { ActivityId } from '@/features/tracking/domain/Activity';
import {
  scheduleOn,
  type ActivitySchedule,
  type ScheduleId,
} from '@/features/tracking/domain/ActivitySchedule';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const scheduleId = (value: string): ScheduleId => value as ScheduleId;
const activityId = (value: string): ActivityId => value as ActivityId;
const day = (value: string): CalendarDay => value as CalendarDay;

const dailyChecklist = (id: string, startDate: string): ActivitySchedule => ({
  id: scheduleId(id),
  activityId: activityId('activity-1'),
  recurrenceRule: { kind: 'daily' },
  dayGoal: null,
  periodGoal: null,
  startDate: day(startDate),
});

const quotaWeek = (id: string, startDate: string): ActivitySchedule => ({
  id: scheduleId(id),
  activityId: activityId('activity-1'),
  recurrenceRule: { kind: 'quota', period: 'week' },
  dayGoal: null,
  periodGoal: { aggregate: 'completedDays', amount: 3 },
  startDate: day(startDate),
});

// v1: daily checklist from 01-Jan, superseded by v2: 3-days-a-week quota from 01-Mar
const timeline: ActivitySchedule[] = [
  dailyChecklist('schedule-1', '2024-01-01'),
  quotaWeek('schedule-2', '2024-03-01'),
];

describe('scheduleOn', () => {
  it('returns the version in effect, with startDate inclusive', () => {
    expect(scheduleOn(timeline, day('2024-02-15'))?.id).toBe('schedule-1');
  });

  it('applies a new version on its own startDate (the change day uses it)', () => {
    expect(scheduleOn(timeline, day('2024-03-01'))?.id).toBe('schedule-2');
  });

  it('carries the last version forward indefinitely', () => {
    expect(scheduleOn(timeline, day('2024-12-31'))?.id).toBe('schedule-2');
  });

  it('returns null before the first version (no schedule yet)', () => {
    expect(scheduleOn(timeline, day('2023-12-31'))).toBeNull();
  });
});

describe('schedule shape (type-level invariant, exercised at runtime)', () => {
  it('a fixed schedule has no period goal', () => {
    const schedule = dailyChecklist('schedule-1', '2024-01-01');
    expect(schedule.periodGoal).toBeNull();
  });

  it('a quota schedule always carries a period goal', () => {
    const schedule = quotaWeek('schedule-2', '2024-03-01');
    expect(schedule.periodGoal).toEqual({
      aggregate: 'completedDays',
      amount: 3,
    });
  });
});
